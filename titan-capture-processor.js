/*
 * Titan 7 Pro Studio — AudioWorklet capture processor (v2.0.3)
 *
 * Replaces the deprecated ScriptProcessorNode for all audio capture.
 * Runs on the audio thread: no main-thread blocking, no GC pressure in
 * the hot loop, sample-exact chunk boundaries.
 *
 * Modes (processorOptions.mode):
 *   'capture' — accumulate input into fixed-size chunks and post them to the
 *               main thread. Produces no output (numberOfOutputs: 0), unless
 *               `passthrough: true` is set, in which case input is copied to
 *               the outputs each quantum (vox-engine voice-print capture lets
 *               the user hear themselves, matching v2.0.2).
 *   'repair'  — run the VoxGenesis live-repair DSP per frame, write processed
 *               audio to the outputs, AND post capture chunks. The DSP is a
 *               1:1 port of VoxEngine._processRealtimeFrame (highpass DC
 *               blocker -> noise gate -> compressor -> de-esser -> tanh
 *               saturation -> dry/wet mix), run over `frameSize`-sample
 *               frames to preserve the exact gate/RMS behavior of v2.0.2.
 *
 * Posted messages: { type:'titan-chunk', chunks:[Float32Array...] (transferred),
 *                    channels, sampleOffset, startCtxTime }
 *   sampleOffset — samples since capture start (audio-thread truth, used for
 *                  sample-accurate punch trimming).
 *   startCtxTime — AudioWorkletGlobalScope.currentTime of the first processed
 *                  quantum, so the main thread can map transport time to
 *                  exact sample indices.
 *
 * Control messages (port.postMessage -> processor):
 *   { type:'update-dsp', dsp:{...} } — live-update repair parameters.
 *   { type:'flush' }                 — emit any partial trailing chunk.
 */

class TitanCaptureProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        const p = (options && options.processorOptions) || {};
        this.chunkSize = Math.max(128, p.chunkSize || 4096);
        this.mode = p.mode === 'repair' ? 'repair' : 'capture';
        this.passthrough = !!p.passthrough;
        this.channelCount = Math.max(1, p.channelCount || 1);
        // Repair DSP runs over fixed frames to preserve v2.0.2 gate behavior.
        this.frameSize = Math.max(128, p.frameSize || 2048);
        const dsp = p.dsp || {};
        this.dsp = {
            hpCoeff: 0.995,
            dcPrevX: 0,
            dcPrevY: 0,
            envelope: 0,
            gateThreshold: dsp.gateThreshold !== undefined ? dsp.gateThreshold : 0.02,
            gateRelease: dsp.gateRelease !== undefined ? dsp.gateRelease : 0.985,
            compressorThreshold: dsp.compressorThreshold !== undefined ? dsp.compressorThreshold : 0.65,
            compressorRatio: dsp.compressorRatio !== undefined ? dsp.compressorRatio : 2.2,
            deEssThreshold: dsp.deEssThreshold !== undefined ? dsp.deEssThreshold : 0.56,
            wet: dsp.wet !== undefined ? dsp.wet : 0.85,
            repairAmount: dsp.repairAmount !== undefined ? dsp.repairAmount : 0.9,
            formantPreserve: dsp.formantPreserve !== undefined ? dsp.formantPreserve : 0.6,
            cloneIntensity: dsp.cloneIntensity !== undefined ? dsp.cloneIntensity : 0.75,
        };
        // Pending input quanta per channel (arrays of Float32Array).
        this.pending = [];
        this.pendingLen = 0;
        for (let c = 0; c < this.channelCount; c++) this.pending.push([]);
        // Repair-mode FIFOs (per channel): input frames accumulate to frameSize,
        // processed output drains 128 samples per quantum to the outputs.
        // DSP state (this.dsp) is shared across channels, matching v2.0.2
        // where _processRealtimeFrame received the shared captureState.
        this.repairIn = [];
        this.repairInLen = [];
        this.repairOut = [];
        for (let c = 0; c < this.channelCount; c++) {
            this.repairIn.push([]);
            this.repairInLen.push(0);
            this.repairOut.push([]);
        }
        this.totalSamples = 0;
        this.startCtxTime = -1;
        if (this.port) {
            this.port.onmessage = (e) => {
                const m = e.data || {};
                if (m.type === 'update-dsp' && m.dsp) Object.assign(this.dsp, m.dsp);
                if (m.type === 'flush') this._emitChunk(true);
            };
        }
    }

    // 1:1 port of VoxEngine._processRealtimeFrame. Operates on one frameSize
    // block; state (dcPrevX/dcPrevY/envelope) persists across frames exactly
    // as in v2.0.2.
    _repairFrame(input, output, s) {
        const hpCoeff = 0.995;
        let rms = 0;
        let prevX = s.dcPrevX;
        let prevY = s.dcPrevY;
        for (let i = 0; i < input.length; i++) {
            const raw = input[i] || 0;
            const highPassed = raw - prevX + hpCoeff * prevY;
            prevX = raw;
            prevY = highPassed;
            rms += highPassed * highPassed;
        }
        rms = Math.sqrt(rms / Math.max(1, input.length));
        const gateOpen = rms >= s.gateThreshold ? 1 : Math.max(0, (rms / Math.max(0.001, s.gateThreshold)) * s.gateRelease);
        const wet = s.wet;
        const repairGain = 0.85 + s.repairAmount * 0.35;
        const bodyTilt = 0.15 + s.formantPreserve * 0.35;
        const drive = 1.05 + s.cloneIntensity * 0.45;
        prevX = s.dcPrevX;
        prevY = s.dcPrevY;
        for (let i = 0; i < input.length; i++) {
            const raw = input[i] || 0;
            const highPassed = raw - prevX + hpCoeff * prevY;
            prevX = raw;
            prevY = highPassed;
            const gate = Math.min(1, gateOpen);
            let sample = highPassed * gate * repairGain;
            const abs = Math.abs(sample);
            if (abs > s.compressorThreshold) {
                const excess = abs - s.compressorThreshold;
                const compressed = s.compressorThreshold + excess / s.compressorRatio;
                sample = Math.sign(sample) * compressed;
            }
            const deEss = abs > s.deEssThreshold ? 0.88 : 1;
            const shaped = Math.tanh(sample * drive * bodyTilt) * deEss;
            output[i] = raw * (1 - wet) + shaped * wet;
        }
        s.dcPrevX = prevX;
        s.dcPrevY = prevY;
        s.envelope = s.envelope * 0.92 + rms * 0.08;
    }

    _emitChunk(partial) {
        if (this.pendingLen < this.chunkSize && !partial) return;
        if (this.pendingLen === 0) return;
        const take = partial ? this.pendingLen : this.chunkSize;
        const chunks = [];
        const buffers = [];
        for (let c = 0; c < this.pending.length; c++) {
            // Concatenate pending quanta for this channel.
            let merged;
            const list = this.pending[c];
            if (list.length === 1 && list[0].length === take) {
                merged = list[0];
            } else {
                merged = new Float32Array(this.pendingLen);
                let off = 0;
                for (let q = 0; q < list.length; q++) {
                    merged.set(list[q], off);
                    off += list[q].length;
                }
            }
            const chunk = merged.slice(0, take);
            const rest = merged.slice(take);
            this.pending[c] = rest.length ? [rest] : [];
            chunks.push(chunk);
            buffers.push(chunk.buffer);
        }
        this.pendingLen -= take;
        this.port.postMessage({
            type: 'titan-chunk',
            chunks,
            channels: chunks.length,
            sampleOffset: this.totalSamples,
            startCtxTime: this.startCtxTime,
            partial: !!partial,
        }, buffers);
        this.totalSamples += take;
    }

    process(inputs, outputs) {
        const input = inputs && inputs[0];
        if (!input || !input.length || !input[0]) return true;
        if (this.startCtxTime < 0) this.startCtxTime = currentTime;
        const n = input[0].length;
        const ch = Math.min(this.channelCount, input.length);

        if (this.mode === 'repair') {
            // Per-channel: accumulate into frameSize blocks, run the repair
            // DSP (shared state, as in v2.0.2), drain to outputs.
            const outList = outputs && outputs[0];
            const nCh = Math.min(ch, outList ? outList.length : 0, this.channelCount);
            for (let c = 0; c < nCh; c++) {
                const frame = new Float32Array(n);
                frame.set(input[c]);
                this.repairIn[c].push(frame);
                this.repairInLen[c] += n;
                while (this.repairInLen[c] >= this.frameSize) {
                    const block = new Float32Array(this.frameSize);
                    let off = 0, need = this.frameSize;
                    while (need > 0) {
                        const src = this.repairIn[c][0];
                        const got = Math.min(need, src.length);
                        block.set(src.subarray(0, got), off);
                        off += got; need -= got;
                        if (got === src.length) this.repairIn[c].shift();
                        else this.repairIn[c][0] = src.slice(got);
                    }
                    const outBlock = new Float32Array(this.frameSize);
                    this._repairFrame(block, outBlock, this.dsp);
                    this.repairOut[c].push(outBlock);
                    this.repairInLen[c] -= this.frameSize;
                }
                const out = outList[c];
                let written = 0;
                while (written < n && this.repairOut[c].length) {
                    const q = this.repairOut[c][0];
                    const got = Math.min(n - written, q.length);
                    out.set(q.subarray(0, got), written);
                    written += got;
                    if (got === q.length) this.repairOut[c].shift();
                    else this.repairOut[c][0] = q.slice(got);
                }
                for (let i = written; i < n; i++) out[i] = 0;
            }
        }

        // Capture path (both modes): accumulate quanta, emit full chunks.
        for (let c = 0; c < ch; c++) {
            this.pending[c].push(input[c].slice(0));
        }
        // Pad missing channels with silence so chunk arrays stay aligned.
        for (let c = ch; c < this.channelCount; c++) {
            this.pending[c].push(new Float32Array(n));
        }
        // v2.0.3: passthrough (vox-engine voice-print capture) — copy input
        // to outputs so the user hears themselves, matching v2.0.2.
        if (this.passthrough && this.mode === 'capture' && outputs && outputs[0]) {
            const outList = outputs[0];
            const oc = Math.min(outList.length, ch);
            for (let c = 0; c < oc; c++) outList[c].set(input[c].subarray(0, n));
        }
        this.pendingLen += n;
        this._emitChunk(false);
        return true;
    }
}

if (typeof registerProcessor !== 'undefined') {
    registerProcessor('titan-capture-processor', TitanCaptureProcessor);
}
// Export for Node-based unit tests.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TitanCaptureProcessor };
}
