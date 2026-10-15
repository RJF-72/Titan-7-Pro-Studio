/* ============================================================================
 * VoxPolish — "Your voice, perfected."
 *
 * Primary VoxGenesis vocal-polish engine. This module does NOT replace timbre.
 * It corrects pitch, tames vibrato, and sweetens tone on the user's OWN voice.
 *
 * Pipeline (all local, no network, no native modules):
 *   1. Pitch track  — CREPE (crepe_full.onnx / crepe_tiny_v2.onnx via the
 *                      VoxGenesisModelAdapter) with a pure-JS YIN fallback.
 *   2. Correction   — chromatic snap per voiced segment, scaled by Strength
 *                      (0-100%), smoothed by Speed (snappy <-> natural).
 *                      Low-confidence / unvoiced frames are NEVER touched.
 *   3. Vibrato tame — 4-8 Hz quasi-periodic modulation is separated from the
 *                      slow pitch trend and reduced by the Vibrato slider
 *                      (100% = natural, lower = tamed). Never flattened.
 *   4. Resynthesis  — TD-PSOLA: pitch marks are re-spaced to the corrected
 *                      f0 while duration and formants are preserved.
 *   5. Sweetening   — optional gentle chain: Titan compressor + Titan EQ
 *                      (presence lift) + split-band de-esser. "Just the
 *                      sweetening."
 *
 * Honesty rules baked in:
 *   - strength 0 + vibrato 100% + sweetening off => bit-identical output.
 *   - frames CREPE/YIN can't confidently track are left alone, never guessed.
 *   - if no voiced audio is found, the input is returned untouched + reported.
 * ========================================================================== */
(function () {
    'use strict';

    var CREPE_SR = 16000;
    var CREPE_WIN = 1024;
    var CREPE_HOP = 160;               // 10 ms at 16 kHz
    var FRAME_S = 0.01;                // 10 ms pitch frames
    var CREPE_BASE_HZ = 32.70319566257483;
    var MIN_HZ = 40, MAX_HZ = 1200;
    var CONF_THRESH = 0.45;            // below this: leave the audio alone

    /* ---------------- utils ---------------- */

    function hzToCents(f) { return 1200 * Math.log2(f / 440); }
    function centsToHz(c) { return 440 * Math.pow(2, c / 1200); }

    function resampleLinear(x, fromSR, toSR) {
        if (fromSR === toSR) return x.slice ? x.slice() : Float32Array.from(x);
        var ratio = toSR / fromSR;
        var len = Math.max(1, Math.floor(x.length * ratio));
        var out = new Float32Array(len);
        for (var i = 0; i < len; i++) {
            var pos = i / ratio;
            var i0 = Math.floor(pos), i1 = Math.min(x.length - 1, i0 + 1);
            var frac = pos - i0;
            out[i] = x[i0] * (1 - frac) + x[i1] * frac;
        }
        return out;
    }

    function rmsOf(x) {
        var s = 0;
        for (var i = 0; i < x.length; i++) s += x[i] * x[i];
        return Math.sqrt(s / Math.max(1, x.length));
    }

    // RBJ bandpass biquad coefficients (constant 0 dB peak gain)
    function bandpassCoeffs(fs, f0, Q) {
        var w0 = 2 * Math.PI * f0 / fs;
        var alpha = Math.sin(w0) / (2 * Q);
        var b0 = alpha, b1 = 0, b2 = -alpha;
        var a0 = 1 + alpha, a1 = -2 * Math.cos(w0), a2 = 1 - alpha;
        return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
    }

    function applyBiquad(x, c) {
        var out = new Float32Array(x.length);
        var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        for (var i = 0; i < x.length; i++) {
            var x0 = x[i];
            var y0 = c.b0 * x0 + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
            out[i] = y0;
            x2 = x1; x1 = x0; y2 = y1; y1 = y0;
        }
        return out;
    }

    function medianOf(arr) {
        if (!arr.length) return 0;
        var s = arr.slice().sort(function (a, b) { return a - b; });
        var m = s.length >> 1;
        return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    }

    /* ---------------- YIN pitch tracker (pure-JS fallback) ---------------- */

    function trackPitchYin(x, sr) {
        var x16 = resampleLinear(x, sr, CREPE_SR);
        var s = CREPE_SR;
        var win = Math.round(s * 0.05);          // 50 ms window
        var hop = Math.round(s * FRAME_S);       // 10 ms hop
        var minTau = Math.max(2, Math.round(s / MAX_HZ));
        var maxTau = Math.round(s / MIN_HZ);
        var nFrames = Math.max(1, Math.floor((x16.length - win) / hop) + 1);
        var hz = new Float32Array(nFrames);
        var conf = new Float32Array(nFrames);
        var d = new Float32Array(maxTau + 1);
        var cm = new Float32Array(maxTau + 1);

        for (var f = 0; f < nFrames; f++) {
            var start = f * hop;
            for (var tau = 0; tau <= maxTau; tau++) d[tau] = 0;
            for (tau = minTau; tau <= maxTau; tau++) {
                var sum = 0;
                for (var j = 0; j < win; j++) {
                    var a = x16[start + j] || 0;
                    var b = x16[start + j + tau] || 0;
                    var diff = a - b;
                    sum += diff * diff;
                }
                d[tau] = sum;
            }
            cm[0] = 1; cm[1] = 1;
            var runsum = 0;
            for (tau = 1; tau <= maxTau; tau++) {
                runsum += d[tau];
                cm[tau] = runsum > 0 ? (d[tau] * tau) / runsum : 1;
            }
            var bestTau = -1;
            for (tau = minTau; tau <= maxTau; tau++) {
                if (cm[tau] < 0.15) { bestTau = tau; break; }
            }
            if (bestTau < 0) { hz[f] = 0; conf[f] = 0; continue; }
            // descend to the local minimum of this dip: the threshold can
            // trigger on the skirt of the true dip (cumulative normalization
            // biases toward small tau), so keep going while it keeps falling.
            while (bestTau + 1 <= maxTau && cm[bestTau + 1] < cm[bestTau]) bestTau++;
            // parabolic interpolation
            var t0 = Math.max(minTau, bestTau - 1), t2 = Math.min(maxTau, bestTau + 1);
            var y0 = cm[t0], y1 = cm[bestTau], y2 = cm[t2];
            var denom = (y0 - 2 * y1 + y2);
            var shift = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
            var period = bestTau + Math.max(-1, Math.min(1, shift));
            var f0 = s / period;
            if (f0 < MIN_HZ || f0 > MAX_HZ) { hz[f] = 0; conf[f] = 0; continue; }
            hz[f] = f0;
            conf[f] = Math.max(0, Math.min(1, 1 - y1));
        }
        return { hz: hz, conf: conf, hop: Math.round(sr * FRAME_S), method: 'yin-fallback' };
    }

    /* ---------------- CREPE pitch tracker (real model path) ---------------- */

    // CREPE-tiny confidence, calibrated 2026-10-02 against the shipped
    // crepe_tiny_v2.onnx: its 360 outputs are activations in roughly [0, 0.6]
    // (NOT raw logits — softmax collapses to ~0.005 even on clean tones), so
    // confidence is the peak activation itself. Measured: clean tone 0.57,
    // white noise 0.12-0.16, silence 0.014. Gate at 0.25.
    var CREPE_CONF_GATE = 0.25;
    // Per-frame RMS normalization target: makes the confidence gate behave
    // the same for quiet and loud passages (the model was trained on
    // normalized audio). Frames below the floor are true silence.
    var CREPE_NORM_RMS = 0.15, CREPE_SILENCE_FLOOR = 1e-4;
    function frameConfidence(activations, n, best) {
        return activations[best];
    }

    async function trackPitchCrepe(x, sr, adapter) {
        if (!adapter || typeof adapter.getPitchSession !== 'function') throw new Error('no VoxGenesis adapter');
        if (typeof window === 'undefined' || !window.ort) throw new Error('ONNX Runtime not loaded');
        // Use an already-loaded pitch session when there is one; only fall
        // back to a full adapter init (loads the whole voice pack) if not.
        var ps = adapter.getPitchSession();
        if (!ps || !ps.session) {
            var st = await adapter.init();
            if (!st.ready) throw new Error('adapter not ready: ' + (st.error || 'unknown'));
            ps = adapter.getPitchSession();
        }
        var session = ps && ps.session;
        if (!session) throw new Error('no CREPE pitch session available');
        var inputName = (ps && ps.inputName) || session.inputNames[0];
        var modelTag = (adapter.sessions && adapter.sessions.pitchEncoder === session) ? 'crepe-full'
            : (adapter.sessions && adapter.sessions.pitchFallback === session) ? 'crepe-tiny' : 'crepe';

        var mono16 = resampleLinear(x, sr, CREPE_SR);
        var nFrames = Math.max(1, Math.floor((mono16.length - CREPE_WIN) / CREPE_HOP) + 1);
        var hz = new Float32Array(nFrames);
        var conf = new Float32Array(nFrames);
        var B = 16; // frames per inference batch
        for (var b0 = 0; b0 < nFrames; b0 += B) {
            var b1 = Math.min(nFrames, b0 + B), nb = b1 - b0;
            var batch = new Float32Array(nb * CREPE_WIN);
            for (var f = 0; f < nb; f++) {
                var s0 = (b0 + f) * CREPE_HOP;
                var rms = 0;
                for (var k = 0; k < CREPE_WIN; k++) {
                    var sv = mono16[Math.min(mono16.length - 1, s0 + k)] || 0;
                    batch[f * CREPE_WIN + k] = sv;
                    rms += sv * sv;
                }
                rms = Math.sqrt(rms / CREPE_WIN);
                // normalize frame level; true silence stays silent
                var g = rms < CREPE_SILENCE_FLOOR ? 0 : CREPE_NORM_RMS / rms;
                if (g !== 1) {
                    for (k = 0; k < CREPE_WIN; k++) batch[f * CREPE_WIN + k] *= g;
                }
            }
            var tensor = new window.ort.Tensor('float32', batch, [nb, CREPE_WIN]);
            var feeds = {}; feeds[inputName] = tensor;
            var out = await session.run(feeds);
            var outName = session.outputNames[0];
            var t = out[outName];
            var data = t.data, dims = t.dims || [];
            // Expect [nb, 360]; tolerate extra dims by locating the 360 axis.
            var per = 360, stride = 360, off0 = 0;
            var total = data.length;
            if (total === nb * 360) { per = 360; stride = 360; }
            else {
                // generic: last dim is bins
                per = dims[dims.length - 1] || 360;
                stride = per;
            }
            for (f = 0; f < nb; f++) {
                var base = f * stride + off0;
                var best = 0, bv = -Infinity;
                for (var bin = 0; bin < per; bin++) {
                    var v = data[base + bin];
                    if (v > bv) { bv = v; best = bin; }
                }
                // sub-bin accuracy: activation-weighted mean of the peak
                // neighborhood (CREPE bins are 20 cents; argmax alone
                // quantizes to 20-cent steps, too coarse for correction)
                // NOTE: bound by this frame's real bin count (per-1), not a
                // hardcoded 359 — otherwise a model with fewer than 360 bins
                // would read past the frame into the next frame's data.
                var lo = Math.max(0, best - 3), hi = Math.min(per - 1, best + 3);
                var wsum = 0, wtot = 0;
                for (var wb = lo; wb <= hi; wb++) {
                    var wv = data[base + wb];
                    if (wv > 0) { wsum += wb * wv; wtot += wv; }
                }
                var f0 = wtot > 0
                    ? CREPE_BASE_HZ * Math.pow(2, (wsum / wtot) / 60)
                    : CREPE_BASE_HZ * Math.pow(2, best / 60);
                var c = frameConfidence(data.subarray ? data.subarray(base, base + per) : Array.prototype.slice.call(data, base, base + per), per, best);
                if (f0 < MIN_HZ || f0 > MAX_HZ || c < CREPE_CONF_GATE) { hz[b0 + f] = 0; conf[b0 + f] = 0; }
                // normalize to [0,1] so the shared CONF_THRESH voicing gate
                // behaves the same for CREPE and YIN tracks
                else { hz[b0 + f] = f0; conf[b0 + f] = Math.min(1, c / 0.6); }
            }
        }
        return { hz: hz, conf: conf, hop: Math.round(sr * FRAME_S), method: modelTag };
    }

    async function trackPitch(x, sr, adapter) {
        try {
            var t = await trackPitchCrepe(x, sr, adapter);
            return t;
        } catch (e) {
            if (typeof console !== 'undefined') console.warn('[VoxPolish] CREPE unavailable, YIN fallback:', e.message || e);
            return trackPitchYin(x, sr);
        }
    }

    /* ---------------- pitch correction ---------------- */

    function correctPitchTrack(track, opts) {
        var strength = Math.max(0, Math.min(1, opts.strength01 == null ? 0.6 : opts.strength01));
        var speed = Math.max(0, Math.min(1, opts.speed01 == null ? 0.7 : opts.speed01));
        var hz = track.hz, conf = track.conf, n = hz.length;
        var voiced = new Array(n);
        var cents = new Float32Array(n);
        var i;
        for (i = 0; i < n; i++) {
            voiced[i] = hz[i] > MIN_HZ && hz[i] < MAX_HZ && conf[i] >= CONF_THRESH;
            cents[i] = voiced[i] ? hzToCents(hz[i]) : 0;
        }
        // voiced segments (min 80 ms), merged across gaps < 60 ms
        var segs = [], cur = null, gap = 0;
        for (i = 0; i < n; i++) {
            if (voiced[i]) {
                if (!cur) cur = { start: i, vals: [] };
                cur.vals.push(cents[i]); cur.end = i; gap = 0;
            } else if (cur) {
                gap++;
                if (gap * FRAME_S >= 0.06) {
                    if ((cur.end - cur.start + 1) * FRAME_S >= 0.08) segs.push(cur);
                    cur = null; gap = 0;
                }
            }
        }
        if (cur && (cur.end - cur.start + 1) * FRAME_S >= 0.08) segs.push(cur);
        var target = new Float32Array(n); // desired shift in cents
        for (var sgi = 0; sgi < segs.length; sgi++) {
            var sg = segs[sgi];
            var note = Math.round(medianOf(sg.vals) / 100) * 100; // nearest semitone (chromatic)
            for (i = sg.start; i <= sg.end; i++) target[i] = (note - cents[i]) * strength;
        }
        // asymmetric one-pole smoothing: snappy <-> natural
        var tauA = Math.exp(Math.log(0.006) + speed * (Math.log(0.09) - Math.log(0.006)));
        var tauR = Math.exp(Math.log(0.012) + speed * (Math.log(0.14) - Math.log(0.012)));
        var applied = new Float32Array(n);
        var prev = 0;
        for (i = 0; i < n; i++) {
            var des = target[i];
            var tau = !voiced[i] ? 0.025 : (Math.abs(des) > Math.abs(prev) ? tauA : tauR);
            var a = 1 - Math.exp(-FRAME_S / tau);
            prev += (des - prev) * a;
            applied[i] = prev;
        }
        var out = new Float32Array(n);
        var corrected = 0;
        for (i = 0; i < n; i++) {
            if (!voiced[i]) { out[i] = 0; continue; }
            out[i] = centsToHz(cents[i] + applied[i]);
            if (Math.abs(applied[i]) > 0.5) corrected++;
        }
        return { hz: out, voiced: voiced, correctedFrames: corrected, totalVoiced: segs.reduce(function (a, s) { return a + (s.end - s.start + 1); }, 0) };
    }

    /* ---------------- vibrato taming ---------------- */

    function tameVibrato(hzTrack, voiced, keep01) {
        var keep = Math.max(0, Math.min(1, keep01 == null ? 1 : keep01));
        var n = hzTrack.length;
        var out = new Float32Array(n);
        var cents = new Float32Array(n);
        var i;
        for (i = 0; i < n; i++) cents[i] = (voiced[i] && hzTrack[i] > 0) ? hzToCents(hzTrack[i]) : NaN;

        // slow trend: one-pole lowpass at ~1 Hz, holding through unvoiced
        var aT = Math.exp(-2 * Math.PI * 1.0 * FRAME_S);
        var trend = new Float32Array(n);
        var t = NaN;
        for (i = 0; i < n; i++) {
            if (!isNaN(cents[i])) t = isNaN(t) ? cents[i] : t + (1 - aT) * (cents[i] - t);
            trend[i] = t;
        }
        var resid = new Float32Array(n);
        for (i = 0; i < n; i++) resid[i] = (!isNaN(cents[i]) && !isNaN(trend[i])) ? cents[i] - trend[i] : 0;

        // vibrato estimate: 4-8 Hz band of the residual (frame rate = 100 Hz)
        var bp = bandpassCoeffs(100, 6, 1.2);
        var vib = applyBiquad(resid, bp);

        var dB = 0, dA = 0, cnt = 0;
        for (i = 0; i < n; i++) {
            if (!voiced[i] || isNaN(trend[i])) { out[i] = hzTrack[i]; continue; }
            dB += vib[i] * vib[i]; cnt++;
            var nc = trend[i] + (resid[i] - vib[i]) + vib[i] * keep;
            out[i] = centsToHz(nc);
        }
        // depth after: recompute residual band energy on output
        var cents2 = new Float32Array(n);
        for (i = 0; i < n; i++) cents2[i] = (voiced[i] && out[i] > 0) ? hzToCents(out[i]) : NaN;
        var t2 = NaN, r2 = new Float32Array(n);
        for (i = 0; i < n; i++) {
            if (!isNaN(cents2[i])) t2 = isNaN(t2) ? cents2[i] : t2 + (1 - aT) * (cents2[i] - t2);
            r2[i] = (!isNaN(cents2[i]) && !isNaN(t2)) ? cents2[i] - t2 : 0;
        }
        var vib2 = applyBiquad(r2, bp);
        for (i = 0; i < n; i++) if (voiced[i]) dA += vib2[i] * vib2[i];
        cnt = Math.max(1, cnt);
        return { hz: out, depthBefore: Math.sqrt(dB / cnt), depthAfter: Math.sqrt(dA / cnt) };
    }

    /* ---------------- TD-PSOLA resynthesis ---------------- */

    function nearestMark(marks, pos) {
        var lo = 0, hi = marks.length - 1, best = -1, bd = Infinity;
        while (lo <= hi) {
            var mid = (lo + hi) >> 1;
            var d = Math.abs(marks[mid].pos - pos);
            if (d < bd) { bd = d; best = mid; }
            if (marks[mid].pos < pos) lo = mid + 1; else hi = mid - 1;
        }
        return best < 0 ? null : marks[best];
    }

    function psolaResynth(x, sr, f0orig, f0tgt, hop) {
        var n = x.length;
        var inMarks = [];
        var phase = 0, i;
        for (i = 0; i < n; i++) {
            var fo = f0orig[Math.min(f0orig.length - 1, (i / hop) | 0)] || 0;
            if (fo > MIN_HZ) {
                phase += 2 * Math.PI * fo / sr;
                if (phase >= 2 * Math.PI) { phase -= 2 * Math.PI; inMarks.push({ pos: i, period: sr / fo }); }
            }
        }
        var out = new Float32Array(n);
        var wsum = new Float32Array(n);
        var pos = 0;
        var uvChunk = Math.max(1, Math.round(sr * FRAME_S));
        while (pos < n) {
            var ft = f0tgt[Math.min(f0tgt.length - 1, (pos / hop) | 0)] || 0;
            if (!(ft > MIN_HZ)) {
                var end = Math.min(n, pos + uvChunk);
                for (var k = pos; k < end; k++) { out[k] += x[k]; wsum[k] += 1; }
                pos = end;
                continue;
            }
            var T = sr / ft;
            var m = nearestMark(inMarks, pos);
            if (!m || Math.abs(m.pos - pos) > 1.5 * m.period) {
                var e2 = Math.min(n, pos + uvChunk);
                for (var k2 = pos; k2 < e2; k2++) { out[k2] += x[k2]; wsum[k2] += 1; }
                pos = e2;
                continue;
            }
            var winLen = Math.max(16, Math.round(2 * m.period));
            var half = winLen >> 1;
            var s0 = Math.round(m.pos - half);
            for (var k3 = 0; k3 < winLen; k3++) {
                var sp = Math.round(pos - half + k3);
                if (sp < 0 || sp >= n) continue;
                var sx = s0 + k3;
                var s = (sx >= 0 && sx < n) ? x[sx] : 0;
                var w = 0.5 * (1 - Math.cos(2 * Math.PI * k3 / (winLen - 1)));
                out[sp] += s * w;
                wsum[sp] += w;
            }
            pos += Math.max(1, Math.round(T));
        }
        for (i = 0; i < n; i++) out[i] = wsum[i] > 1e-6 ? out[i] / wsum[i] : 0;
        return out;
    }

    function needsResynth(f0orig, f0tgt) {
        var n = Math.min(f0orig.length, f0tgt.length);
        for (var i = 0; i < n; i++) {
            var a = f0orig[i] || 0, b = f0tgt[i] || 0;
            if (a > MIN_HZ && b > MIN_HZ) {
                if (Math.abs(1200 * Math.log2(b / a)) > 0.3) return true;
            } else if ((a > MIN_HZ) !== (b > MIN_HZ)) {
                return true;
            }
        }
        return false;
    }

    /* ---------------- sweetening chain ---------------- */

    function deessChannel(x, sr) {
        // split-band de-esser: duck the >6.5 kHz band when its envelope spikes
        var f = 6500, Q = 0.7;
        var w0 = 2 * Math.PI * f / sr;
        var alpha = Math.sin(w0) / (2 * Q);
        var b0 = (1 + Math.cos(w0)) / 2, b1 = -(1 + Math.cos(w0)), b2 = (1 + Math.cos(w0)) / 2;
        var a0 = 1 + alpha, a1 = -2 * Math.cos(w0), a2 = 1 - alpha;
        b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
        var n = x.length;
        var hf = new Float32Array(n);
        var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
        for (var i = 0; i < n; i++) {
            var x0 = x[i];
            var y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
            hf[i] = y0;
            x2 = x1; x1 = x0; y2 = y1; y1 = y0;
        }
        var hfRms = rmsOf(hf);
        var thr = Math.max(0.015, hfRms * 2.2);
        var aA = Math.exp(-2 * Math.PI * 500 * (1 / sr));   // ~2 ms attack
        var aR = Math.exp(-2 * Math.PI * 20 * (1 / sr));    // ~50 ms release
        var env = 0;
        var out = new Float32Array(n);
        for (i = 0; i < n; i++) {
            var ax = Math.abs(hf[i]);
            var a = ax > env ? aA : aR;
            env = a * env + (1 - a) * ax;
            var gr = env > thr ? Math.min(0.65, ((env - thr) / (thr + 1e-6)) * 0.8) : 0;
            out[i] = (x[i] - hf[i]) + hf[i] * (1 - gr);
        }
        return out;
    }

    async function applySweetening(audioBuffer, titan) {
        var sr = audioBuffer.sampleRate, len = audioBuffer.length, ch = audioBuffer.numberOfChannels;
        var AC = (typeof window !== 'undefined' && window.OfflineAudioContext) ? window.OfflineAudioContext : null;
        if (!AC || !titan || typeof titan.createCompressor !== 'function') {
            // graceful: pure-JS gentle compression fallback is out of scope;
            // return the buffer unchanged rather than fake it.
            return audioBuffer;
        }
        var ctx = new AC(ch, len, sr);
        var src = ctx.createBufferSource();
        src.buffer = audioBuffer;
        // gentle vocal sweetening: soft compression + presence lift (Titan DSP)
        var comp = titan.createCompressor(ctx, { threshold: -20, ratio: 2.5, attack: 12, release: 120, makeup: 3, knee: 6 });
        // createEQ may be absent on some Titan DSP builds — the presence lift
        // is nice-to-have, so bypass it instead of throwing a TypeError.
        var eq = (typeof titan.createEQ === 'function')
            ? titan.createEQ(ctx, { low: 0, lowMid: 0, highMid: 1.5, high: 2.0 })
            : null;
        src.connect(comp.input);
        if (eq) comp.output.connect(eq.input); else comp.output.connect(ctx.destination);
        if (eq) eq.output.connect(ctx.destination);
        src.start(0);
        var rendered = await ctx.startRendering();
        for (var c = 0; c < ch; c++) {
            var d = rendered.getChannelData(c);
            d.set(deessChannel(d, sr));
        }
        try { comp.dispose && comp.dispose(); } catch (e) {}
        try { eq && eq.dispose && eq.dispose(); } catch (e) {}
        return rendered;
    }

    /* ---------------- orchestrator ---------------- */

    function makeBufferFromChannels(channels, sr, ACtx) {
        var ctx = ACtx || (typeof window !== 'undefined' && (window.audioContext || window.voxEngine && window.voxEngine.ctx)) || null;
        if (!ctx) throw new Error('No AudioContext available to build output buffer');
        var buf = ctx.createBuffer(channels.length, channels[0].length, sr);
        for (var c = 0; c < channels.length; c++) buf.getChannelData(c).set(channels[c]);
        return buf;
    }

    async function polishVocal(audioBuffer, opts) {
        opts = opts || {};
        var strength = Math.max(0, Math.min(1, opts.strength == null ? 0.6 : opts.strength));
        var speed = Math.max(0, Math.min(1, opts.speed == null ? 0.7 : opts.speed));
        var vibratoKeep = Math.max(0, Math.min(1, opts.vibratoKeep == null ? 1 : opts.vibratoKeep));
        var sweeten = opts.sweeten !== false;
        var sr = audioBuffer.sampleRate;
        var nCh = audioBuffer.numberOfChannels;
        var report = { method: 'none', bypassed: false, voicedRatio: 0, correctedFrames: 0, vibratoDepthBefore: 0, vibratoDepthAfter: 0, sweetened: false };

        // fast path: nothing to do => bit-identical output, guaranteed
        if (strength <= 0.001 && vibratoKeep >= 0.999 && !sweeten) {
            var chans = [];
            for (var c0 = 0; c0 < nCh; c0++) chans.push(Float32Array.from(audioBuffer.getChannelData(c0)));
            report.bypassed = true;
            return { buffer: makeBufferFromChannels(chans, sr, opts.audioContext), report: report };
        }

        var ch0 = audioBuffer.getChannelData(0);
        var tracked = await trackPitch(ch0, sr, opts.adapter);
        var track = tracked;
        report.method = track.method;
        var n = track.hz.length;
        var voicedCount = 0, i;
        for (i = 0; i < n; i++) if (track.hz[i] > MIN_HZ && track.conf[i] >= CONF_THRESH) voicedCount++;
        report.voicedRatio = n ? voicedCount / n : 0;

        var f0t = Float32Array.from(track.hz);
        var voiced = new Array(n);
        for (i = 0; i < n; i++) voiced[i] = track.hz[i] > MIN_HZ && track.conf[i] >= CONF_THRESH;

        var centsBefore = 0, cntB = 0;
        if (strength > 0.001) {
            var corr = correctPitchTrack(track, { strength01: strength, speed01: speed });
            f0t = corr.hz;
            // keep the voiced mask from the ORIGINAL track for downstream stages
            for (i = 0; i < n; i++) voiced[i] = track.hz[i] > MIN_HZ && track.conf[i] >= CONF_THRESH;
            report.correctedFrames = corr.correctedFrames;
            report.totalVoiced = corr.totalVoiced;
            // mean abs cents-to-target before/after (target = per-segment semitone)
            var segs = segmentize(track, voiced);
            var eb = 0, ea = 0, cb = 0;
            for (var si = 0; si < segs.length; si++) {
                var sg = segs[si], vals = [];
                for (i = sg.start; i <= sg.end; i++) if (voiced[i]) vals.push(hzToCents(track.hz[i]));
                if (!vals.length) continue;
                var note = Math.round(medianOf(vals) / 100) * 100; // nearest semitone
                for (i = sg.start; i <= sg.end; i++) {
                    if (!voiced[i]) continue;
                    eb += Math.abs(hzToCents(track.hz[i]) - note); cb++;
                    if (f0t[i] > MIN_HZ) ea += Math.abs(hzToCents(f0t[i]) - note);
                }
            }
            centsBefore = cb ? eb / cb : 0; report.meanAbsCentsBefore = centsBefore;
            report.meanAbsCentsAfter = cb ? ea / cb : 0;
        }

        if (vibratoKeep < 0.999) {
            var tv = tameVibrato(f0t, voiced, vibratoKeep);
            f0t = tv.hz;
            report.vibratoDepthBefore = tv.depthBefore;
            report.vibratoDepthAfter = tv.depthAfter;
        }

        var hop = track.hop;
        var outChans = [];
        var doResynth = needsResynth(track.hz, f0t);
        report.resynthesized = doResynth;
        for (var c = 0; c < nCh; c++) {
            var xd = audioBuffer.getChannelData(c);
            outChans.push(doResynth ? psolaResynth(xd, sr, track.hz, f0t, hop) : Float32Array.from(xd));
        }
        var outBuf = makeBufferFromChannels(outChans, sr, opts.audioContext);
        if (sweeten && opts.titan) {
            outBuf = await applySweetening(outBuf, opts.titan);
            report.sweetened = true;
        } else if (sweeten && !opts.titan) {
            report.sweetened = false;
            report.sweetenSkipped = 'Titan DSP builders unavailable';
        }
        return { buffer: outBuf, report: report };
    }

    function segmentize(track, voiced) {
        var segs = [], cur = null, gap = 0, n = track.hz.length, i;
        for (i = 0; i < n; i++) {
            if (voiced[i]) {
                if (!cur) cur = { start: i, end: i };
                cur.end = i; gap = 0;
            } else if (cur) {
                gap++;
                if (gap * FRAME_S >= 0.06) { cur = null; gap = 0; }
                else if (cur) { /* bridge short gap: keep */ }
            }
        }
        // rebuild properly with bridging
        segs = []; cur = null; gap = 0;
        for (i = 0; i < n; i++) {
            if (voiced[i]) {
                if (!cur) cur = { start: i, end: i };
                else cur.end = i;
                gap = 0;
            } else if (cur) {
                gap++;
                if (gap * FRAME_S < 0.06) { cur.end = i; }
                else { if ((cur.end - cur.start + 1) * FRAME_S >= 0.08) segs.push(cur); cur = null; gap = 0; }
            }
        }
        if (cur && (cur.end - cur.start + 1) * FRAME_S >= 0.08) segs.push(cur);
        return segs;
    }

    /* ---------------- public API ---------------- */

    var VoxPolish = {
        trackPitch: trackPitch,
        trackPitchYin: trackPitchYin,
        trackPitchCrepe: trackPitchCrepe,
        correctPitchTrack: correctPitchTrack,
        tameVibrato: tameVibrato,
        psolaResynth: psolaResynth,
        needsResynth: needsResynth,
        applySweetening: applySweetening,
        deessChannel: deessChannel,
        polishVocal: polishVocal,
        resampleLinear: resampleLinear,
        hzToCents: hzToCents,
        centsToHz: centsToHz,
        CONF_THRESH: CONF_THRESH,
        FRAME_S: FRAME_S
    };

    if (typeof window !== 'undefined') window.VoxPolish = VoxPolish;
    if (typeof module !== 'undefined' && module.exports) module.exports = VoxPolish;
})();
