//
// VoxEngine - live/audio voice capture, compact voice prints, and singing-model adapter boundary.
// This file does not implement neural voice cloning itself. True clone-to-singing rendering is delegated
// to a real installed adapter exposed as window.VoxGenesisModelAdapter.
//

class VoxEngine {
    constructor(audioContext) {
        this.ctx = audioContext || null;
        this.voxArmed = false;
        this.liveRepairActive = false;
        this.captureChunks = [];
        this.captureStream = null;
        this.captureProcessor = null;
        this.captureMode = 'capture';
        this.captureState = null;
        this.models = new Map();
        this.activeModelId = null;
        this.modelAdapter = (typeof window !== 'undefined' && window.VoxGenesisModelAdapter) ? window.VoxGenesisModelAdapter : null;
    }

    async init(audioContext) {
        if (audioContext) this.ctx = audioContext;
        this.modelAdapter = this.modelAdapter || ((typeof window !== 'undefined' && window.VoxGenesisModelAdapter) ? window.VoxGenesisModelAdapter : null);
        console.log('[VoxGenesis] Initialized', this.modelAdapter ? 'with singing model adapter' : 'without singing model adapter');
    }

    setModelAdapter(adapter) {
        this.modelAdapter = adapter || null;
    }

    getModel(id) {
        return this.models.get(id) || null;
    }

    hasSingingModel() {
        return !!(this.modelAdapter && this.modelAdapter.ready && typeof this.modelAdapter.synthesizeSinging === 'function');
    }

    arm() {
        this.voxArmed = true;
        console.log('[VoxGenesis] Armed');
    }

    disarm() {
        this.voxArmed = false;
        this.liveRepairActive = false;
        this._stopCaptureNodes();
        console.log('[VoxGenesis] Disarmed');
    }

    // v2.0.3: AudioWorklet-based capture. Returns true when the worklet
    // path is active. Repair DSP runs inside the worklet (1:1 port of
    // _processRealtimeFrame over 2048-sample frames, preserving gate behavior);
    // capture chunks are posted to the main thread with transferables.
    async _beginWorkletCapture(channelCount) {
        if (!this.ctx || !this.ctx.audioWorklet) throw new Error('AudioWorklet not available');
        if (!this._voxWorkletModulePromise) {
            const url = new URL('titan-capture-processor.js', document.baseURI).toString();
            this._voxWorkletModulePromise = this.ctx.audioWorklet.addModule(url);
        }
        await this._voxWorkletModulePromise;
        const s = this.captureState || {};
        const node = new AudioWorkletNode(this.ctx, 'titan-capture-processor', {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [channelCount],
            processorOptions: {
                chunkSize: 2048,
                channelCount,
                mode: this.liveRepairActive ? 'repair' : 'capture',
                // v2.0.3: v2.0.2 passed mic audio through to the speakers
                // during voice-print capture (output.set(input)); preserve it.
                passthrough: !this.liveRepairActive,
                frameSize: 2048,
                dsp: {
                    gateThreshold: s.gateThreshold,
                    gateRelease: s.gateRelease,
                    compressorThreshold: s.compressorThreshold,
                    compressorRatio: s.compressorRatio,
                    deEssThreshold: s.deEssThreshold,
                    wet: s.wet,
                    repairAmount: s.repairAmount,
                    formantPreserve: s.formantPreserve,
                    cloneIntensity: s.cloneIntensity,
                },
            },
        });
        node.port.onmessage = (e) => {
            const m = e.data;
            if (m && m.type === 'titan-chunk' && m.chunks && m.chunks.length) {
                const c0 = m.chunks[0];
                this.captureChunks.push(c0 instanceof Float32Array ? c0 : new Float32Array(c0));
            }
        };
        this.captureStream.connect(node);
        node.connect(this.ctx.destination);
        this.captureProcessor = node;
        this._captureIsWorklet = true;
        return true;
    }

    async beginCapture(stream, options = {}) {
        if (!this.voxArmed) {
            console.warn('[VoxGenesis] beginCapture ignored - not armed');
            return;
        }
        if (!stream || !this.ctx) {
            console.warn('[VoxGenesis] No input stream or audio context for capture');
            return;
        }

        this._stopCaptureNodes();
        this.captureChunks = [];
        this.captureStream = this.ctx.createMediaStreamSource(stream);
        const channelCount = Math.max(1, options.channels || 1);
        this.captureMode = options.mode || (options.realtime ? 'realtime' : 'capture');
        this.captureState = this._createCaptureState(options);
        this.liveRepairActive = !!options.realtime;

        // v2.0.3: AudioWorklet capture (replaces deprecated ScriptProcessorNode).
        // Repair DSP runs inside the worklet (1:1 port of _processRealtimeFrame).
        const useWorklet = await this._beginWorkletCapture(channelCount).catch((err) => {
            console.warn('[VoxGenesis] AudioWorklet capture unavailable, using ScriptProcessor fallback:', err && err.message);
            return false;
        });
        if (!useWorklet) {
            this.captureProcessor = this.ctx.createScriptProcessor(2048, channelCount, channelCount);
            this._captureIsWorklet = false;
            this.captureProcessor.onaudioprocess = (event) => {
                const inputBuffer = event.inputBuffer;
                const outputBuffer = event.outputBuffer;
                const captureInput = inputBuffer.getChannelData(0);
                this.captureChunks.push(new Float32Array(captureInput));
                const channels = Math.min(inputBuffer.numberOfChannels || 1, outputBuffer.numberOfChannels || 1);
                for (let ch = 0; ch < channels; ch++) {
                    const input = inputBuffer.getChannelData(ch);
                    const output = outputBuffer.getChannelData(ch);
                    if (this.liveRepairActive) {
                        this._processRealtimeFrame(input, output, this.captureState);
                    } else {
                        output.set(input);
                    }
                }
            };

            this.captureStream.connect(this.captureProcessor);
            this.captureProcessor.connect(this.ctx.destination);
        }
        console.log('[VoxGenesis] Capture started');
    }

    startRealtimeRepair(stream, options = {}) {
        return this.beginCapture(stream, { ...options, realtime: true, mode: 'realtime-repair' });
    }

    // VoxPolish: vocal correction that keeps the user's own voice.
    // Pitch correction + vibrato taming + optional sweetening. No timbre
    // replacement. Runs as an offline render on the provided buffer.
    async polishVocal(audioBuffer, opts = {}) {
        if (!audioBuffer || !audioBuffer.getChannelData) throw new Error('AudioBuffer required');
        if (typeof window === 'undefined' || !window.VoxPolish) throw new Error('VoxPolish module not loaded');
        var titan = (typeof window !== 'undefined' && window.TitanPlugins && window.TitanPlugins.processor) || null;
        return window.VoxPolish.polishVocal(audioBuffer, {
            strength: opts.strength,
            speed: opts.speed,
            vibratoKeep: opts.vibratoKeep,
            sweeten: opts.sweeten,
            adapter: this.modelAdapter,
            titan: titan,
            audioContext: this.ctx || (typeof window !== 'undefined' ? window.audioContext : null),
            onProgress: opts.onProgress
        });
    }

    async haltCapture(modelName = 'Vox Take') {
        if (!this.voxArmed) {
            console.warn('[VoxGenesis] haltCapture ignored - not armed');
            return null;
        }
        if (!this.captureChunks || !this.captureChunks.length) {
            console.warn('[VoxGenesis] No audio captured');
            return null;
        }

        const length = this.captureChunks.reduce((total, chunk) => total + chunk.length, 0);
        const merged = new Float32Array(length);
        let offset = 0;
        for (const chunk of this.captureChunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }

        const buffer = this.ctx.createBuffer(1, merged.length, this.ctx.sampleRate);
        buffer.getChannelData(0).set(merged);
        this._stopCaptureNodes();
        this.voxArmed = false;
        this.liveRepairActive = false;
        console.log('[VoxGenesis] Capture stopped');
        return this.captureModel(modelName, buffer);
    }

    _createCaptureState(options = {}) {
        return {
            dcPrevX: 0,
            dcPrevY: 0,
            noiseFloor: 0.012,
            gateThreshold: 0.02,
            gateRelease: 0.985,
            compressorThreshold: 0.65,
            compressorRatio: 2.2,
            deEssThreshold: 0.56,
            wet: Math.max(0, Math.min(1, options.wet ?? 0.85)),
            repairAmount: Math.max(0, Math.min(1, options.repairAmount ?? 0.9)),
            formantPreserve: Math.max(0, Math.min(1, options.formantPreserve ?? 0.6)),
            cloneIntensity: Math.max(0, Math.min(1, options.cloneIntensity ?? 0.75)),
            envelope: 0
        };
    }

    _processRealtimeFrame(input, output, state) {
        const s = state || this._createCaptureState();
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

    async captureModel(name, renderBuffer, timbreDescriptor = null, settings = {}) {
        if (!renderBuffer || !renderBuffer.getChannelData) throw new Error('AudioBuffer required for voice capture');
        const voicePrint = this.extractVoicePrint(renderBuffer, timbreDescriptor);
        const modelId = 'vgm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
        const model = {
            id: modelId,
            name: name || 'Vox Voice Print',
            type: 'voice-print',
            status: 'voice-print-ready',
            buffer: renderBuffer,
            voicePrint,
            timbreDescriptor: timbreDescriptor || voicePrint.spectrum,
            createdAt: Date.now(),
            settings,
            features: {
                stats: {
                    frameCount: renderBuffer.length,
                    duration: renderBuffer.duration,
                    sampleRate: renderBuffer.sampleRate
                },
                voicePrint
            }
        };

        if (this.modelAdapter && typeof this.modelAdapter.cloneVoice === 'function') {
            try {
                model.status = 'training';
                model.adapterModel = await this.modelAdapter.cloneVoice({ buffer: renderBuffer, voicePrint, settings });
                model.status = 'clone-ready';
            } catch (error) {
                model.status = 'voice-print-ready';
                model.adapterError = error.message || String(error);
                console.warn('[VoxGenesis] Singing model adapter unavailable:', model.adapterError);
            }
        }

        this.models.set(modelId, model);
        this.activeModelId = modelId;
        console.log('[VoxGenesis] Voice print captured:', modelId, model.status);
        return model;
    }

    extractVoicePrint(audioBuffer, timbreDescriptor = null) {
        const channel = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate || 44100;
        const frameSize = Math.max(256, Math.floor(sampleRate * 0.03));
        const hop = Math.max(128, Math.floor(frameSize / 2));
        const spectrumBins = 32;
        const spectrum = new Float32Array(spectrumBins);
        let frameCount = 0;
        let energySum = 0;
        let zcrSum = 0;
        let centroidSum = 0;
        let peak = 0;
        let voicedFrames = 0;

        for (let start = 0; start < channel.length; start += hop) {
            const end = Math.min(channel.length, start + frameSize);
            let energy = 0;
            let crossings = 0;
            let weighted = 0;
            let magnitude = 0;
            for (let i = start; i < end; i++) {
                const sample = channel[i] || 0;
                const abs = Math.abs(sample);
                energy += sample * sample;
                peak = Math.max(peak, abs);
                weighted += (i - start) * abs;
                magnitude += abs;
                if (i > start) {
                    const prev = channel[i - 1] || 0;
                    if ((sample >= 0 && prev < 0) || (sample < 0 && prev >= 0)) crossings++;
                }
            }
            const count = Math.max(1, end - start);
            const rms = Math.sqrt(energy / count);
            energySum += rms;
            zcrSum += crossings / count;
            centroidSum += magnitude > 0 ? weighted / magnitude : 0;
            if (rms > 0.01) voicedFrames++;
            for (let b = 0; b < spectrumBins; b++) {
                const idx = start + Math.floor((b / spectrumBins) * count);
                spectrum[b] += Math.abs(channel[Math.min(channel.length - 1, idx)] || 0);
            }
            frameCount++;
        }

        frameCount = Math.max(1, frameCount);
        for (let b = 0; b < spectrum.length; b++) spectrum[b] /= frameCount;
        if (timbreDescriptor && timbreDescriptor.length) {
            for (let b = 0; b < spectrum.length; b++) {
                spectrum[b] = Math.exp(timbreDescriptor[Math.floor((b / spectrum.length) * timbreDescriptor.length)] || 0);
            }
        }
        const avgEnergy = energySum / frameCount;
        const avgZcr = zcrSum / frameCount;
        const avgCentroid = centroidSum / frameCount;
        const confidence = Math.max(0, Math.min(1,
            (avgEnergy > 0.008 ? 0.3 : 0) +
            (avgZcr > 0.005 && avgZcr < 0.28 ? 0.25 : 0) +
            (voicedFrames / frameCount > 0.25 ? 0.25 : 0) +
            (peak > 0.03 ? 0.2 : 0)
        ));

        return {
            version: 1,
            duration: audioBuffer.duration,
            sampleRate,
            rms: avgEnergy,
            peak,
            zeroCrossingRate: avgZcr,
            centroid: avgCentroid,
            voicedRatio: voicedFrames / frameCount,
            confidence,
            spectrum: Array.from(spectrum)
        };
    }

    async synthesize(modelId, params = {}) {
        const model = this.getModel(modelId);
        if (!model) throw new Error('Model not found: ' + modelId);
        if (!this.hasSingingModel()) {
            throw new Error('No real VoxGenesis singing model is installed. Connect window.VoxGenesisModelAdapter.synthesizeSinging to enable clone-to-singing rendering.');
        }
        return this.modelAdapter.synthesizeSinging({
            model: model.adapterModel || model,
            voicePrint: model.voicePrint,
            sourceBuffer: params.sourceBuffer || model.buffer,
            lyrics: params.lyrics || '',
            notes: params.notes || [],
            params
        });
    }

    async renderLocalPreview(modelId, params = {}) {
        const model = this.getModel(modelId);
        if (!model) throw new Error('Model not found: ' + modelId);
        if (!this.ctx) throw new Error('Audio context not available');
        const sourceBuffer = params.sourceBuffer || model.buffer;
        const output = this.ctx.createBuffer(sourceBuffer.numberOfChannels || 1, sourceBuffer.length, sourceBuffer.sampleRate);
        const intensity = Math.max(0, Math.min(1, params.intensity ?? 0.6));
        const wet = Math.max(0, Math.min(1, params.blend ?? 0.5));
        const timbre = (params.timbreShift || 0) / 50;
        for (let ch = 0; ch < output.numberOfChannels; ch++) {
            const input = sourceBuffer.getChannelData(Math.min(ch, sourceBuffer.numberOfChannels - 1));
            const out = output.getChannelData(ch);
            let delay = Math.max(1, Math.floor(sourceBuffer.sampleRate * (0.012 + intensity * 0.018)));
            for (let i = 0; i < out.length; i++) {
                const dry = input[i] || 0;
                const doubled = input[Math.max(0, i - delay)] || 0;
                const shaped = Math.tanh((dry * (1.05 + intensity * 0.45) + doubled * intensity * 0.35) * (1 + Math.abs(timbre) * 0.25));
                out[i] = dry * (1 - wet) + shaped * wet;
            }
        }
        return output;
    }

    _stopCaptureNodes() {
        this.liveRepairActive = false;
        this._captureIsWorklet = false;
        this.captureMode = 'capture';
        this.captureState = null;
        if (this.captureProcessor) {
            this.captureProcessor.onaudioprocess = null;
            try { this.captureProcessor.disconnect(); } catch (_) {}
        }
        if (this.captureStream) {
            try { this.captureStream.disconnect(); } catch (_) {}
        }
        this.captureProcessor = null;
        this.captureStream = null;
    }
}

try {
    window.audioContext = window.audioContext || new (window.AudioContext || window.webkitAudioContext)();
    window.voxEngine = window.voxEngine || new VoxEngine(window.audioContext);
    console.log('[VoxGenesis] Engine initialized successfully');
} catch (e) {
    console.warn('[VoxGenesis] Failed to initialize audio context:', e);
    window.voxEngine = window.voxEngine || new VoxEngine(null);
}

