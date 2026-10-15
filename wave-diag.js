/* Waveform Diagnostics for Titan 7 Pro Studio.
 *
 * The waveform is not just a picture: with Diagnose on, the app measures the
 * audio and paints problem regions right on the waveform in plain colors.
 * Only flags what was actually measured. Low-confidence frames are never
 * flagged. A guide, not a verdict.
 *
 * Detectors (all local, chunked so the UI never blocks):
 *  - clip    : runs of samples at >=0.999 (digital ceiling)         -> red
 *  - weak    : 100ms RMS below -30 dBFS sustained 500ms+            -> amber
 *  - silence : |x| < 0.001 for 300ms+                               -> gray hatch
 *  - dc      : |mean| > 0.01 over 1s windows                        -> blue
 *  - pitch   : VoxPolish YIN track; median-filtered deviation of the
 *              voiced pitch from the segment median > 30 cents,
 *              sustained 150ms+ (vibrato averages out, drift stays) -> yellow
 *  - early/late: HF-weighted energy-flux onset detection vs the 16th-note
 *              grid from the session BPM; flags > 20ms off          -> teal/white
 */
(function () {
    'use strict';

    /* ---------------- thresholds ---------------- */
    var CLIP_LEVEL = 0.999, CLIP_MIN_RUN = 8, CLIP_MERGE_S = 0.05;
    var SILENCE_LEVEL = 0.001, SILENCE_MIN_S = 0.30;
    var WEAK_DB = -30, WEAK_WIN_S = 0.10, WEAK_MIN_S = 0.50;
    var DC_THRESH = 0.01, DC_WIN_S = 1.0;
    var PITCH_CENTS = 30, PITCH_MIN_RUN_S = 0.15, PITCH_SLICE_S = 5, PITCH_MED_WIN_S = 0.20;
    var ONSET_HP = 0.98, ONSET_WIN_S = 0.008, ONSET_HOP_S = 0.0025;
    var ONSET_MIN_GAP_S = 0.06, ONSET_THR_K = 4, ONSET_THR_FLOOR = 0.10;
    var ONSET_CALIB_MS = 3.0;          // measured systematic bias, calibrated out
    var TIMING_TOL_MS = 20;
    var TIMING_FLUX_RATIO = 0.02;      // peakFlux must exceed 2% of signal peak
    var TIMING_MIN_ONSETS = 3;
    var GRID_DIV = 4;                  // 16th-note grid
    var YIELD_EVERY = 1 << 20;         // ~1M samples between UI yields

    var COLORS = {
        clip: '#c1272d', weak: '#e8960c', silence: '#9a9aa0', pitch: '#ffd23f',
        dc: '#4da3ff', early: '#14b8a6', late: '#e8e8e8'
    };

    var META = {
        clip:    { color: COLORS.clip,    title: 'Too loud — this part is distorted',
                   desc: 'The signal slammed into the digital ceiling here. Turning it down now lowers the volume, but distortion that got recorded can\u2019t be un-baked \u2014 re-record quieter if you can.' },
        weak:    { color: COLORS.weak,    title: 'Too quiet — turn up the input',
                   desc: 'This stretch is much quieter than it should be. Quiet recordings collect hiss when you turn them up later, so record hotter next time.' },
        silence: { color: COLORS.silence, title: 'Nothing here',
                   desc: 'Dead air. Trimming it keeps your timeline tidy and your mix clean.' },
        pitch:   { color: COLORS.pitch,   title: 'Off pitch',
                   desc: 'These notes sit more than 30 cents from the nearest note. Only flagged where the pitch tracker was confident \u2014 vibrato and slides are left alone.' },
        dc:      { color: COLORS.dc,      title: 'DC offset',
                   desc: 'The waveform is shifted off-center, which quietly eats your headroom. One click removes it.' },
        early:   { color: COLORS.early,   title: 'Early \u2014 you rushed this hit',
                   desc: 'This hit landed before the beat. A few milliseconds is feel; more than 20 is worth a nudge.' },
        late:    { color: COLORS.late,    title: 'Late \u2014 you dragged this hit',
                   desc: 'This hit landed after the beat. A few milliseconds is feel; more than 20 is worth a nudge.' }
    };

    var LEGEND_ORDER = ['clip', 'weak', 'silence', 'pitch', 'dc', 'early', 'late'];

    /* ---------------- state ---------------- */
    var S = {
        globalOn: false,
        trackOn: {},       // trackId -> true
        analyzing: {},     // clipId -> true
        legendEl: null,
        fixEl: null
    };

    function yieldUI() { return new Promise(function (r) { setTimeout(r, 0); }); }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function medianOf(a) {
        if (!a.length) return 0;
        var s = a.slice().sort(function (x, y) { return x - y; });
        var m = s.length >> 1;
        return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    }

    /* ---------------- analysis helpers ---------------- */
    // Trimmed mono (ch0) + per-sample peak across channels, in trimmed range.
    function trimmedData(daw, clip) {
        var buf = clip.buffer;
        var sr = buf.sampleRate;
        var t0 = Math.max(0, Math.floor(daw.getClipTrimStart(clip) * sr));
        var t1 = Math.max(t0 + 1, Math.min(buf.length, Math.ceil(daw.getClipTrimEnd(clip) * sr) || buf.length));
        var ch0 = buf.getChannelData(0).subarray(t0, t1);
        var nCh = buf.numberOfChannels, peak = 0;
        var others = [];
        for (var c = 1; c < nCh; c++) others.push(buf.getChannelData(c).subarray(t0, t1));
        return { ch0: ch0, others: others, sr: sr, n: ch0.length, t0: t0 };
    }

    function mergeRegions(regs, gapS, sr) {
        if (!regs.length) return regs;
        regs.sort(function (a, b) { return a.start - b.start; });
        var out = [regs[0]], gap = Math.max(1, Math.floor(gapS * sr));
        for (var i = 1; i < regs.length; i++) {
            var p = out[out.length - 1], c = regs[i];
            if (c.type === p.type && (c.startSmp - p.endSmp) <= gap) { p.endSmp = Math.max(p.endSmp, c.endSmp); }
            else out.push(c);
        }
        return out;
    }

    async function detectLevels(d, sr) {
        var x = d.ch0, n = d.n, others = d.others;
        var regs = [];
        var i, c, run = 0, runStart = 0;
        // clipping: consecutive samples at the ceiling (any channel)
        for (i = 0; i < n; i++) {
            var hot = Math.abs(x[i]) >= CLIP_LEVEL;
            if (!hot) for (c = 0; c < others.length && !hot; c++) hot = Math.abs(others[c][i]) >= CLIP_LEVEL;
            if (hot) { if (run === 0) runStart = i; run++; }
            else {
                if (run >= CLIP_MIN_RUN) regs.push({ type: 'clip', startSmp: runStart, endSmp: i });
                run = 0;
            }
            if ((i & 0xFFFFF) === 0) await yieldUI();
        }
        if (run >= CLIP_MIN_RUN) regs.push({ type: 'clip', startSmp: runStart, endSmp: n });
        // silence: near-zero runs
        run = 0;
        var minSil = Math.floor(SILENCE_MIN_S * sr);
        for (i = 0; i < n; i++) {
            if (Math.abs(x[i]) < SILENCE_LEVEL) { if (run === 0) runStart = i; run++; }
            else { if (run >= minSil) regs.push({ type: 'silence', startSmp: runStart, endSmp: i }); run = 0; }
            if ((i & 0xFFFFF) === 0) await yieldUI();
        }
        if (run >= minSil) regs.push({ type: 'silence', startSmp: runStart, endSmp: n });
        // weak: 100ms RMS windows under -30 dBFS, sustained 500ms+
        var wWin = Math.max(16, Math.floor(WEAK_WIN_S * sr));
        var wThr = Math.pow(10, WEAK_DB / 20);
        var needWins = Math.max(1, Math.round(WEAK_MIN_S / WEAK_WIN_S));
        var weakRun = 0, weakStart = 0, f;
        for (f = 0; f * wWin < n; f++) {
            var s0 = f * wWin, s1 = Math.min(n, s0 + wWin), sum = 0;
            for (i = s0; i < s1; i++) sum += x[i] * x[i];
            var rms = Math.sqrt(sum / Math.max(1, s1 - s0));
            if (rms < wThr) { if (weakRun === 0) weakStart = s0; weakRun++; }
            else {
                if (weakRun >= needWins) regs.push({ type: 'weak', startSmp: weakStart, endSmp: s0 });
                weakRun = 0;
            }
        }
        if (weakRun >= needWins) regs.push({ type: 'weak', startSmp: weakStart, endSmp: n });
        // DC offset: 1s windows with |mean| > 1%
        var dcWin = Math.floor(DC_WIN_S * sr);
        for (f = 0; f * dcWin < n; f++) {
            var d0 = f * dcWin, d1 = Math.min(n, d0 + dcWin), m = 0;
            for (i = d0; i < d1; i++) m += x[i];
            m /= Math.max(1, d1 - d0);
            if (Math.abs(m) > DC_THRESH) regs.push({ type: 'dc', startSmp: d0, endSmp: d1, dcMean: m });
            if ((f & 15) === 0) await yieldUI();
        }
        return mergeRegions(regs, CLIP_MERGE_S, sr).map(function (r) {
            return { type: r.type, start: r.startSmp / sr, end: r.endSmp / sr, extra: r.dcMean != null ? { dcMean: r.dcMean } : null };
        });
    }

    /* ---------------- pitch (off-pitch) ---------------- */
    async function detectPitch(x, sr) {
        var VP = (typeof window !== 'undefined') ? window.VoxPolish : null;
        if (!VP || typeof VP.trackPitchYin !== 'function') return { regions: [], skipped: 'pitch engine not loaded' };
        var CONF = VP.CONF_THRESH || 0.45;
        var sliceN = Math.max(16000, Math.floor(PITCH_SLICE_S * sr));
        var hz = [], conf = [];
        for (var off = 0; off < x.length; off += sliceN) {
            var sl = x.subarray(off, Math.min(x.length, off + sliceN));
            var t = VP.trackPitchYin(sl, sr); // sync; 10ms frames
            for (var i = 0; i < t.hz.length; i++) { hz.push(t.hz[i]); conf.push(t.conf[i]); }
            await yieldUI();
        }
        var nf = hz.length, FRAME_S = 0.01;
        var voiced = new Array(nf);
        for (var f = 0; f < nf; f++) voiced[f] = hz[f] > 50 && conf[f] >= CONF;
        // segmentize: bridge <60ms gaps, keep >=80ms
        var segs = [], cur = null, gap = 0;
        for (f = 0; f < nf; f++) {
            if (voiced[f]) { if (!cur) cur = { s: f, e: f }; else cur.e = f; gap = 0; }
            else if (cur) {
                gap++;
                if (gap * FRAME_S < 0.06) cur.e = f;
                else { if ((cur.e - cur.s + 1) * FRAME_S >= 0.08) segs.push(cur); cur = null; gap = 0; }
            }
        }
        if (cur && (cur.e - cur.s + 1) * FRAME_S >= 0.08) segs.push(cur);
        var regions = [];
        var medN = Math.max(3, Math.round(PITCH_MED_WIN_S / FRAME_S));
        segs.forEach(function (sg) {
            var cents = [];
            for (var i = sg.s; i <= sg.e; i++) cents.push(1200 * Math.log2(hz[i] / 440));
            var segMed = medianOf(cents);
            // median-filter the deviation so vibrato averages out but drift stays
            var dev = cents.map(function (cc) { return cc - segMed; });
            var runStart = -1;
            for (i = 0; i < dev.length; i++) {
                var lo = Math.max(0, i - (medN >> 1)), hi = Math.min(dev.length - 1, i + (medN >> 1));
                var mdev = medianOf(dev.slice(lo, hi + 1));
                if (Math.abs(mdev) > PITCH_CENTS) { if (runStart < 0) runStart = i; }
                else {
                    if (runStart >= 0) {
                        if ((i - runStart) * FRAME_S >= PITCH_MIN_RUN_S)
                            regions.push({ type: 'pitch', start: (sg.s + runStart) * FRAME_S, end: (sg.s + i) * FRAME_S });
                        runStart = -1;
                    }
                }
            }
            if (runStart >= 0 && (dev.length - runStart) * FRAME_S >= PITCH_MIN_RUN_S)
                regions.push({ type: 'pitch', start: (sg.s + runStart) * FRAME_S, end: (sg.s + dev.length) * FRAME_S });
        });
        return { regions: regions, skipped: null };
    }

    /* ---------------- onset / timing ---------------- */
    function detectOnsets(x, sr) {
        var n = x.length;
        var padN = Math.floor(sr * 0.064);
        var xp = new Float32Array(n + padN);
        xp.set(x, padN);
        var hp = new Float32Array(xp.length);
        for (var i = 1; i < xp.length; i++) hp[i] = xp[i] - ONSET_HP * xp[i - 1];
        var win = Math.max(16, Math.floor(sr * ONSET_WIN_S));
        var hop = Math.max(8, Math.floor(sr * ONSET_HOP_S));
        var wc = win / 2, nf = Math.max(1, Math.floor((xp.length - win) / hop));
        var env = new Float32Array(nf), f, i;
        for (f = 0; f < nf; f++) {
            var s = 0, o = f * hop;
            for (i = 0; i < win; i++) { var v = hp[o + i]; s += v * v; }
            env[f] = Math.sqrt(s / win);
        }
        var flux = new Float32Array(nf);
        for (f = 1; f < nf; f++) flux[f] = Math.max(0, env[f] - env[f - 1]);
        var sorted = Array.from(flux).sort(function (a, b) { return a - b; });
        var med = sorted[sorted.length >> 1] || 0;
        var peak = 0, sigPeak = 0;
        for (f = 0; f < nf; f++) if (flux[f] > peak) peak = flux[f];
        for (i = 0; i < n; i += 7) { var ax = Math.abs(x[i]); if (ax > sigPeak) sigPeak = ax; }
        var devs = sorted.map(function (v) { return Math.abs(v - med); }).sort(function (a, b) { return a - b; });
        var mad = devs[devs.length >> 1] || 0;
        var thr = Math.max(med + ONSET_THR_K * (mad + 1e-9), ONSET_THR_FLOOR * peak);
        var minDist = Math.floor(ONSET_MIN_GAP_S / (hop / sr));
        var last = -1e9, onsets = [];
        for (f = 1; f < nf - 1; f++) {
            if (flux[f] > thr && flux[f] >= flux[f - 1] && flux[f] >= flux[f + 1] && (f - last) > minDist) {
                var pk = flux[f], r20 = -1;
                for (var b = f; b >= 0 && b > f - 16; b--) { if (flux[b] < 0.2 * pk) { r20 = b; break; } }
                if (r20 >= 0 && (f - r20) * (hop / sr) <= 0.04) {
                    var y0 = flux[r20], y1 = flux[r20 + 1], tgt = 0.2 * pk;
                    var frac = (y1 > y0) ? (tgt - y0) / (y1 - y0) : 0;
                    frac = Math.max(0, Math.min(1, frac));
                    var t20 = (r20 + frac) * hop + wc, tPk = f * hop + wc;
                    // calibrated rise compensation + window centering; pad removed
                    onsets.push((t20 + 0.8 * (tPk - t20) + ONSET_CALIB_MS / 1000 * sr - padN) / sr);
                    last = f;
                }
            }
        }
        var reliable = (peak > TIMING_FLUX_RATIO * sigPeak) && onsets.length >= TIMING_MIN_ONSETS;
        return { onsets: onsets, reliable: reliable, peakFlux: peak, sigPeak: sigPeak };
    }

    function tempoOf(daw) {
        var bpm = parseFloat(daw && daw.bpm);
        if (!Number.isFinite(bpm) || bpm < 30 || bpm > 300) return null;
        return { bpm: bpm };
    }

    function detectTiming(daw, x, sr, clip) {
        var tempo = tempoOf(daw);
        if (!tempo) return { status: 'no-tempo', onsets: [] };
        var det = detectOnsets(x, sr);
        if (!det.reliable)
            return { status: 'unreliable', onsets: [], reason: 'no clear drum-like hits to measure' };
        var grid16 = (60 / tempo.bpm) / GRID_DIV;
        var t0 = clip.timelineStart || 0;
        var out = [];
        det.onsets.forEach(function (local) {
            var sess = t0 + local;
            var grid = Math.round(sess / grid16) * grid16;
            var offMs = (sess - grid) * 1000;
            if (Math.abs(offMs) > TIMING_TOL_MS) {
                out.push({
                    type: offMs < 0 ? 'early' : 'late',
                    start: local, end: local,
                    ms: offMs, grid: grid, sessionT: sess
                });
            }
        });
        return { status: 'ok', onsets: out, bpm: tempo.bpm };
    }

    /* ---------------- main analysis ---------------- */
    function isFresh(clip) { return !!(clip && clip._diag && clip._diag.buf === clip.buffer); }

    function setBadge(daw, clipId, text) {
        var el = document.querySelector('.audio-clip[data-clip-id="' + clipId + '"]');
        if (!el) return;
        var b = el.querySelector('.diag-progress');
        if (text == null) { if (b) b.remove(); return; }
        if (!b) { b = document.createElement('div'); b.className = 'diag-progress'; el.appendChild(b); }
        b.textContent = text;
    }

    async function analyzeClip(daw, clipId, opts) {
        opts = opts || {};
        var clip = daw.audioClips.get(clipId);
        if (!clip || !clip.buffer) return null;
        if (S.analyzing[clipId]) return null;
        if (isFresh(clip) && !opts.force) return clip._diag;
        S.analyzing[clipId] = true;
        setBadge(daw, clipId, 'Listening…');
        try {
            var d = trimmedData(daw, clip);
            var t0 = Date.now();
            setBadge(daw, clipId, 'Checking levels…');
            var levelRegs = await detectLevels(d, d.sr);
            var regions = levelRegs.slice();
            setBadge(daw, clipId, 'Checking pitch…');
            var pitchRes = await detectPitch(d.ch0, d.sr);
            pitchRes.regions.forEach(function (r) { regions.push(r); });
            setBadge(daw, clipId, 'Checking timing…');
            var timing = detectTiming(daw, d.ch0, d.sr, clip);
            timing.onsets.forEach(function (r) { regions.push(r); });
            await yieldUI();
            regions.sort(function (a, b) { return a.start - b.start; });
            clip._diag = {
                v: 1, buf: clip.buffer, at: Date.now(), ms: Date.now() - t0,
                regions: regions,
                timing: { status: timing.status, reason: timing.reason || null, bpm: timing.bpm || null },
                pitchSkipped: pitchRes.skipped || null,
                dismissed: (clip._diag && clip._diag.dismissed) || []
            };
            repaintClip(daw, clipId);
            return clip._diag;
        } catch (e) {
            console.warn('[WaveDiag] analysis failed for', clipId, e);
            return null;
        } finally {
            delete S.analyzing[clipId];
            setBadge(daw, clipId, null);
        }
    }

    function repaintClip(daw, clipId) {
        var clip = daw.audioClips.get(clipId);
        if (!clip) return;
        document.querySelectorAll('.audio-clip[data-clip-id="' + clipId + '"] canvas').forEach(function (cv) {
            try { daw.drawAudioWaveform(cv, clip.buffer, clip); } catch (e) {}
        });
    }

    function repaintTrack(daw, trackId) {
        daw.audioClips.forEach(function (clip, id) {
            if (Number(clip.track) === Number(trackId)) repaintClip(daw, id);
        });
    }

    /* ---------------- overlay painting ---------------- */
    function effectiveOn(daw, trackId) {
        if (S.globalOn) return true;
        return !!S.trackOn[Number(trackId)];
    }

    function paintOverlay(daw, canvas, clip, width, height) {
        if (!clip || !effectiveOn(daw, clip.track)) { canvas._diagHit = null; return; }
        var diag = clip._diag;
        if (!diag || !diag.regions || !diag.regions.length) { canvas._diagHit = null; return; }
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        var playDur = Math.max(0.001, daw.getClipPlayDuration(clip));
        var hits = [];
        function xOf(sec) { return Math.max(0, Math.min(width, (sec / playDur) * width)); }
        // paint order: silence, weak, pitch, clip, dc, timing markers
        var order = { silence: 0, weak: 1, pitch: 2, clip: 3, dc: 4, early: 5, late: 5 };
        var regs = diag.regions
            .map(function (r, i) { return { r: r, i: i }; })
            .filter(function (item) { return diag.dismissed.indexOf(item.i) === -1; })
            .sort(function (a, b) { return (order[a.r.type] - order[b.r.type]) || (a.r.start - b.r.start); });
        regs.forEach(function (item) {
            var r = item.r, idx = item.i, col = COLORS[r.type] || '#fff';
            var x0 = xOf(r.start), x1 = xOf(r.end), w = Math.max(2, x1 - x0);
            if (r.type === 'silence') {
                ctx.save();
                ctx.beginPath(); ctx.rect(x0, 0, w, height); ctx.clip();
                ctx.fillStyle = 'rgba(154,154,160,0.18)';
                ctx.fillRect(x0, 0, w, height);
                ctx.strokeStyle = 'rgba(154,154,160,0.55)';
                ctx.lineWidth = 1;
                for (var d = -height; d < w + height; d += 6) {
                    ctx.beginPath(); ctx.moveTo(x0 + d, height); ctx.lineTo(x0 + d + height, 0); ctx.stroke();
                }
                ctx.restore();
                hits.push({ x0: x0, x1: x0 + w, region: r, idx: idx });
            } else if (r.type === 'dc') {
                ctx.fillStyle = 'rgba(77,163,255,0.85)';
                ctx.fillRect(x0, 0, w, 4);
                hits.push({ x0: x0, x1: x0 + w, region: r, idx: idx });
            } else if (r.type === 'early' || r.type === 'late') {
                var cx = xOf(r.start);
                ctx.fillStyle = col;
                ctx.beginPath();
                ctx.moveTo(cx - 6, 0); ctx.lineTo(cx + 6, 0); ctx.lineTo(cx, 9); ctx.closePath(); ctx.fill();
                ctx.fillRect(cx - 1, 9, 2, 10);
                var label = Math.abs(r.ms).toFixed(0) + 'ms ' + r.type;
                ctx.font = '9px monospace';
                var tw = ctx.measureText(label).width;
                var tx = Math.max(2, Math.min(width - tw - 2, cx - tw / 2));
                ctx.fillStyle = 'rgba(0,0,0,0.65)';
                ctx.fillRect(tx - 2, 20, tw + 4, 13);
                ctx.fillStyle = col;
                ctx.fillText(label, tx, 30);
                hits.push({ x0: cx - 9, x1: cx + 9, region: r, idx: idx });
            } else {
                ctx.fillStyle = hexA(col, r.type === 'clip' ? 0.55 : 0.42);
                ctx.fillRect(x0, 0, w, height);
                ctx.fillStyle = col;
                ctx.fillRect(x0, 0, w, 2.5);
                hits.push({ x0: x0, x1: x0 + w, region: r, idx: idx });
            }
        });
        canvas._diagHit = hits;
        canvas._diagClipId = findClipId(daw, clip);
        if (!canvas._diagClickBound) {
            canvas._diagClickBound = true;
            canvas.style.cursor = 'pointer';
            canvas.addEventListener('click', function (e) { onCanvasClick(daw, canvas, e); });
        }
    }

    function hexA(hex, a) {
        var n = parseInt(String(hex).replace('#', ''), 16);
        return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    function findClipId(daw, clip) {
        var found = null;
        daw.audioClips.forEach(function (c, id) { if (c === clip) found = id; });
        return found;
    }

    function onCanvasClick(daw, canvas, e) {
        var hits = canvas._diagHit;
        if (!hits || !hits.length) return;
        var rect = canvas.getBoundingClientRect();
        var x = (e.clientX - rect.left) * (canvas.width / Math.max(1, rect.width));
        for (var i = 0; i < hits.length; i++) {
            if (x >= hits[i].x0 && x <= hits[i].x1) {
                var clipId = canvas._diagClipId;
                var clip = clipId && daw.audioClips.get(clipId);
                if (clip) openFixPopup(daw, clipId, clip, hits[i].region, hits[i].idx, e.clientX, e.clientY);
                return;
            }
        }
    }

    /* ---------------- buffer surgery ---------------- */
    function newBufferLike(daw, clip, newLen) {
        var ctx = daw.engine.ctx;
        var buf = ctx.createBuffer(clip.buffer.numberOfChannels, Math.max(1, newLen), clip.buffer.sampleRate);
        return buf;
    }

    function replaceClipBuffer(daw, clipId, newBuf) {
        var clip = daw.audioClips.get(clipId);
        if (!clip) return;
        clip.buffer = newBuf;
        delete clip._diag;
        daw.normalizeClipState(clip);
        refreshClipEl(daw, clipId);
        try { daw.persistClipAsset(clipId, clip, daw._audioBufferToWav(newBuf)); } catch (e) {}
        daw.storeWorkingSessionSnapshot();
        analyzeClip(daw, clipId); // re-analyze in the background
    }

    function refreshClipEl(daw, clipId) {
        var clip = daw.audioClips.get(clipId);
        if (!clip) return;
        var el = document.querySelector('.audio-clip[data-clip-id="' + clipId + '"]');
        if (el) {
            el.style.left = daw._clipPixelX(clip.timelineStart || 0) + 'px';
            var durPx = Math.max(60, daw.getClipPlayDuration(clip) * 100);
            el.style.width = durPx + 'px';
            var cv = el.querySelector('canvas');
            if (cv) { cv.width = Math.max(10, durPx - 16); cv.height = 60; daw.drawAudioWaveform(cv, clip.buffer, clip); }
        }
    }

    function peakOf(buf, t0, t1) {
        var p = 0;
        for (var c = 0; c < buf.numberOfChannels; c++) {
            var d = buf.getChannelData(c);
            for (var i = t0; i < t1; i++) { var a = Math.abs(d[i]); if (a > p) p = a; }
        }
        return p;
    }

    function fixGainDb(daw, clipId, db, doneMsg) {
        var clip = daw.audioClips.get(clipId);
        if (!clip || !clip.buffer) return;
        var g = Math.pow(10, db / 20), buf = clip.buffer, out = newBufferLike(daw, clip, buf.length);
        for (var c = 0; c < buf.numberOfChannels; c++) {
            var s = buf.getChannelData(c), o = out.getChannelData(c);
            for (var i = 0; i < s.length; i++) o[i] = s[i] * g;
        }
        replaceClipBuffer(daw, clipId, out);
        daw.addConsoleMessage('success', doneMsg || ('Clip gain ' + (db > 0 ? '+' : '') + db + ' dB applied.'));
    }

    function fixNormalize(daw, clipId, targetDb) {
        var clip = daw.audioClips.get(clipId);
        if (!clip || !clip.buffer) return;
        var p = peakOf(clip.buffer, 0, clip.buffer.length);
        if (p < 1e-6) { daw.addConsoleMessage('warning', 'Nothing to normalize \u2014 the clip is silent.'); return; }
        var db = 20 * Math.log10(Math.pow(10, targetDb / 20) / p);
        fixGainDb(daw, clipId, db, 'Normalized to ' + targetDb + ' dB peak.');
    }

    function fixTrimSilence(daw, clipId, region) {
        var clip = daw.audioClips.get(clipId);
        if (!clip || !clip.buffer) return;
        var sr = clip.buffer.sampleRate;
        var t0 = Math.max(0, Math.floor(daw.getClipTrimStart(clip) * sr));
        var playDur = daw.getClipPlayDuration(clip);
        var rs = Math.floor(region.start * sr), re = Math.ceil(region.end * sr);
        if (region.start <= 0.05) {
            clip.trimStart = daw.getClipTrimStart(clip) + region.end;
            daw.normalizeClipState(clip);
            delete clip._diag; refreshClipEl(daw, clipId);
            daw.storeWorkingSessionSnapshot(); analyzeClip(daw, clipId);
            daw.addConsoleMessage('success', 'Leading silence trimmed.');
        } else if (region.end >= playDur - 0.05) {
            clip.trimEnd = daw.getClipTrimEnd(clip) - (playDur - region.start);
            daw.normalizeClipState(clip);
            delete clip._diag; refreshClipEl(daw, clipId);
            daw.storeWorkingSessionSnapshot(); analyzeClip(daw, clipId);
            daw.addConsoleMessage('success', 'Trailing silence trimmed.');
        } else {
            // middle gap: ripple-remove the samples, close the gap
            var a0 = t0, a1 = t0 + rs, b0 = t0 + re, b1 = Math.floor(daw.getClipTrimEnd(clip) * sr);
            var newLen = (a1 - a0) + Math.max(0, b1 - b0);
            var out = newBufferLike(daw, clip, newLen);
            for (var c = 0; c < clip.buffer.numberOfChannels; c++) {
                var s = clip.buffer.getChannelData(c), o = out.getChannelData(c);
                o.set(s.subarray(a0, a1), 0);
                if (b1 > b0) o.set(s.subarray(b0, b1), a1 - a0);
            }
            replaceClipBuffer(daw, clipId, out);
            daw.addConsoleMessage('success', 'Silence removed and gap closed.');
        }
    }

    function fixRemoveDC(daw, clipId) {
        var clip = daw.audioClips.get(clipId);
        if (!clip || !clip.buffer) return;
        var buf = clip.buffer, out = newBufferLike(daw, clip, buf.length);
        for (var c = 0; c < buf.numberOfChannels; c++) {
            var s = buf.getChannelData(c), o = out.getChannelData(c), m = 0;
            for (var i = 0; i < s.length; i++) m += s[i];
            m /= s.length;
            for (i = 0; i < s.length; i++) o[i] = s[i] - m;
        }
        replaceClipBuffer(daw, clipId, out);
        daw.addConsoleMessage('success', 'DC offset removed.');
    }

    function sendToVoxPolish(daw, clipId) {
        var clip = daw.audioClips.get(clipId);
        if (!clip) return;
        var trackId = Number(clip.track) || 1;
        var chain = daw.trackPlugins.get(trackId) || [];
        var idx = -1;
        for (var i = 0; i < chain.length; i++) {
            var p = chain[i];
            if (p && (p.processor === 'vox_genesis' || (p.ui && p.ui.tag === 'vox-genesis-ui'))) { idx = i; break; }
        }
        if (idx < 0) {
            // Make sure the track actually has VoxGenesis to open.
            try {
                var inst = daw._createPluginInstance('vox_genesis');
                chain.push(inst);
                daw.trackPlugins.set(trackId, chain);
                idx = chain.length - 1;
                if (typeof daw.rebuildTrackPluginChain === 'function') daw.rebuildTrackPluginChain(trackId);
                if (typeof daw.renderPluginChain === 'function') daw.renderPluginChain();
            } catch (e) {}
        }
        if (idx < 0) { daw.addConsoleMessage('warning', 'No VoxGenesis on this track.'); return; }
        try { daw.openPluginEditor({ type: 'track', id: trackId }, idx); } catch (e) {}
        // The plugin UI element may still be initializing; poll briefly.
        var tries = 0;
        var iv = setInterval(function () {
            tries++;
            var el = document.querySelector('#pluginEditorBody vox-genesis-ui');
            if (el && typeof el.setAudioBuffer === 'function') {
                clearInterval(iv);
                try { el.setAudioBuffer(clip.buffer); } catch (e) {}
                try { if (typeof el.setMode === 'function') el.setMode('polish'); } catch (e) {}
                daw.addConsoleMessage('success', 'Clip loaded into VoxGenesis Polish \u2014 your voice, perfected.');
            } else if (tries >= 24) {
                clearInterval(iv);
                daw.addConsoleMessage('warning', 'VoxGenesis panel opened, but the audio handoff did not complete. Use Upload Audio in the panel.');
            }
        }, 250);
        closePopups();
        daw.addConsoleMessage('info', 'Opening VoxGenesis Polish\u2026');
    }

    /* ---------------- clip splitting + snap to grid ---------------- */
    function splitClipAt(daw, clipId, localSec) {
        var clip = daw.audioClips.get(clipId);
        if (!clip || !clip.buffer) return null;
        var playDur = daw.getClipPlayDuration(clip);
        if (!(localSec > 0.05 && localSec < playDur - 0.05)) return null;
        var bufSec = daw.getClipTrimStart(clip) + localSec;
        var newId = clipId + '-split-' + Date.now().toString(36) + Math.floor(Math.random() * 1e4);
        var clipB = Object.assign({}, clip, {
            trimStart: bufSec,
            timelineStart: (clip.timelineStart || 0) + localSec,
            name: (clip.name || 'Clip') + ' (2)',
            fadeInDuration: 0.008
        });
        delete clipB._diag;
        clip.trimEnd = bufSec;
        delete clip._diag;
        daw.normalizeClipState(clip);
        daw.normalizeClipState(clipB);
        daw.audioClips.set(newId, clipB);
        daw.addClipToTimeline(newId, clip.track);
        refreshClipEl(daw, clipId);
        daw.storeWorkingSessionSnapshot();
        return newId;
    }

    function fragmentAt(daw, trackId, sessionT) {
        var found = null, foundId = null;
        daw.audioClips.forEach(function (c, id) {
            if (Number(c.track) !== Number(trackId)) return;
            var s = c.timelineStart || 0, e = s + daw.getClipPlayDuration(c);
            if (sessionT >= s && sessionT < e) { found = c; foundId = id; }
        });
        return found ? { id: foundId, clip: found } : null;
    }

    async function snapTiming(daw, clipId, regionOrAll, strength01) {
        var clip = daw.audioClips.get(clipId);
        if (!clip || !clip._diag) return 0;
        var strength = Math.max(0, Math.min(1, strength01 == null ? 1 : strength01));
        var trackId = Number(clip.track);
        var targets = (regionOrAll === 'all')
            ? clip._diag.regions.filter(function (r) { return r.type === 'early' || r.type === 'late'; })
            : [regionOrAll];
        targets = targets.slice().sort(function (a, b) { return b.sessionT - a.sessionT; }); // latest first
        var snapped = 0;
        targets.forEach(function (r) {
            if (r.type !== 'early' && r.type !== 'late') return;
            var frag = fragmentAt(daw, trackId, r.sessionT);
            if (!frag) return;
            var localSec = r.sessionT - (frag.clip.timelineStart || 0);
            var playDur = daw.getClipPlayDuration(frag.clip);
            if (!(localSec > 0.08 && localSec < playDur - 0.08)) return; // sliver guard
            var newId = splitClipAt(daw, frag.id, localSec);
            if (!newId) return;
            var tail = daw.audioClips.get(newId);
            var shift = -(r.ms / 1000) * strength; // move the hit toward the grid
            tail.timelineStart = Math.max(0, (tail.timelineStart || 0) + shift);
            daw.normalizeClipState(tail);
            refreshClipEl(daw, newId);
            snapped++;
        });
        if (snapped) {
            daw.storeWorkingSessionSnapshot();
            daw.addConsoleMessage('success', 'Snapped ' + snapped + ' hit' + (snapped > 1 ? 's' : '') + ' toward the grid.');
            // positions changed: re-analyze the track's clips in the background
            daw.audioClips.forEach(function (c, id) {
                if (Number(c.track) === trackId) { delete c._diag; analyzeClip(daw, id); }
            });
        }
        return snapped;
    }

    /* ---------------- popups ---------------- */
    function closePopups() {
        if (S.fixEl) { S.fixEl.remove(); S.fixEl = null; }
        if (S.legendEl) { S.legendEl.remove(); S.legendEl = null; }
        document.removeEventListener('click', outsideCloser, true);
    }
    function outsideCloser(e) {
        if (S.fixEl && !S.fixEl.contains(e.target)) { S.fixEl.remove(); S.fixEl = null; }
        if (S.legendEl && !S.legendEl.contains(e.target) && !e.target.closest('#diagLegendBtn')) { S.legendEl.remove(); S.legendEl = null; }
        if (!S.fixEl && !S.legendEl) document.removeEventListener('click', outsideCloser, true);
    }
    function placePop(el, x, y) {
        document.body.appendChild(el);
        document.addEventListener('click', outsideCloser, true);
        var r = el.getBoundingClientRect();
        el.style.left = Math.max(8, Math.min(window.innerWidth - r.width - 8, x)) + 'px';
        el.style.top = Math.max(8, Math.min(window.innerHeight - r.height - 8, y)) + 'px';
    }

    function openFixPopup(daw, clipId, clip, region, regionIdx, x, y) {
        closePopups();
        var meta = META[region.type] || { color: '#fff', title: 'Flagged', desc: '' };
        var el = document.createElement('div');
        el.className = 'diag-fix-pop';
        el.id = 'diagFixPop';
        var msLine = (region.type === 'early' || region.type === 'late')
            ? '<div class="diag-fix-ms" style="color:' + meta.color + '">' + Math.abs(region.ms).toFixed(0) + ' ms ' + region.type + '</div>' : '';
        var btns = '';
        if (region.type === 'clip') {
            btns = '<button data-fix="down6">Turn it down 6 dB</button>' +
                   '<button data-fix="norm3">Normalize to \u22123 dB</button>';
        } else if (region.type === 'silence') {
            btns = '<button data-fix="trimsil">Trim silence</button>';
        } else if (region.type === 'weak') {
            btns = '<button data-fix="norm1">Normalize to \u22121 dB</button>';
        } else if (region.type === 'pitch') {
            btns = '<button data-fix="voxpolish">Send to VoxGenesis Polish</button>';
        } else if (region.type === 'dc') {
            btns = '<button data-fix="dc">Remove DC offset</button>';
        } else if (region.type === 'early' || region.type === 'late') {
            var n = clip._diag.regions.filter(function (r) { return r.type === 'early' || r.type === 'late'; }).length;
            btns = '<label class="diag-strength">Snap strength <input type="range" min="10" max="100" value="80" id="diagSnapStr"> <span id="diagSnapStrVal">80%</span></label>' +
                   '<button data-fix="snap1">Snap this hit to grid</button>' +
                   (n > 1 ? '<button data-fix="snapall">Snap all ' + n + ' flagged hits</button>' : '');
        }
        el.innerHTML =
            '<div class="diag-fix-head" style="border-left:4px solid ' + meta.color + '">' +
            '<div class="diag-fix-title">' + esc(meta.title) + '</div>' + msLine +
            '<div class="diag-fix-desc">' + esc(meta.desc) + '</div></div>' +
            '<div class="diag-fix-btns">' + btns + '</div>' +
            '<button class="diag-fix-dismiss" data-fix="dismiss">Not a problem \u2014 dismiss</button>';
        S.fixEl = el;
        placePop(el, x + 8, y + 8);
        var str = el.querySelector('#diagSnapStr');
        if (str) str.addEventListener('input', function () {
            el.querySelector('#diagSnapStrVal').textContent = str.value + '%';
        });
        el.addEventListener('click', function (e) {
            var b = e.target.closest('[data-fix]');
            if (!b) return;
            e.stopPropagation();
            var k = b.getAttribute('data-fix');
            if (k === 'down6') fixGainDb(daw, clipId, -6);
            else if (k === 'norm3') fixNormalize(daw, clipId, -3);
            else if (k === 'norm1') fixNormalize(daw, clipId, -1);
            else if (k === 'trimsil') fixTrimSilence(daw, clipId, region);
            else if (k === 'dc') fixRemoveDC(daw, clipId);
            else if (k === 'voxpolish') sendToVoxPolish(daw, clipId);
            else if (k === 'snap1' || k === 'snapall') {
                var st = el.querySelector('#diagSnapStr');
                var s01 = st ? (parseFloat(st.value) / 100) : 0.8;
                snapTiming(daw, clipId, k === 'snapall' ? 'all' : region, s01);
            } else if (k === 'dismiss') {
                clip._diag.dismissed.push(regionIdx);
                repaintClip(daw, clipId);
                daw.addConsoleMessage('info', 'Flag dismissed.');
            }
            closePopups();
        });
    }

    function openLegend(daw, anchorEl) {
        if (S.legendEl) { closePopups(); return; }
        closePopups();
        var el = document.createElement('div');
        el.className = 'diag-legend-pop';
        el.id = 'diagLegendPop';
        var rows = LEGEND_ORDER.map(function (t) {
            var m = META[t];
            var sw = t === 'silence'
                ? '<span class="diag-sw diag-hatch"></span>'
                : '<span class="diag-sw" style="background:' + m.color + '"></span>';
            return '<div class="diag-leg-row">' + sw + '<div><b>' + esc(m.title) + '</b></div></div>';
        }).join('');
        var tempo = tempoOf(daw);
        el.innerHTML =
            '<div class="diag-leg-title">What do the colors mean?</div>' + rows +
            '<div class="diag-leg-note">A guide, not a verdict \u2014 trust your ears in the end. Only measured problems are flagged; low-confidence audio is never flagged.</div>' +
            '<div class="diag-leg-note">Timing flags need a set tempo' + (tempo ? ' (now ' + tempo.bpm + ' BPM)' : ' (no tempo set \u2014 set BPM to check timing)') + ' and clear drum-like hits. Washy or legato sounds are skipped, not guessed.</div>' +
            '<div class="diag-leg-btns"><button id="diagAnalyzeTrack">Analyze this track</button>' +
            '<button id="diagAnalyzeAll">Analyze all tracks</button></div>';
        S.legendEl = el;
        var r = anchorEl.getBoundingClientRect();
        placePop(el, r.left, r.bottom + 6);
        el.querySelector('#diagAnalyzeTrack').addEventListener('click', function (e) {
            e.stopPropagation();
            var tid = daw.getSelectedTrackId ? daw.getSelectedTrackId() : 1;
            analyzeTrack(daw, tid, true); closePopups();
        });
        el.querySelector('#diagAnalyzeAll').addEventListener('click', function (e) {
            e.stopPropagation(); analyzeAll(daw, true); closePopups();
        });
    }

    /* ---------------- toggles ---------------- */
    function setGlobal(daw, on) {
        S.globalOn = !!on;
        updateToggleUI(daw);
        daw.audioClips.forEach(function (clip, id) { repaintClip(daw, id); });
        if (on) analyzeAll(daw, false);
    }
    function toggleTrack(daw, trackId) {
        trackId = Number(trackId);
        if (S.trackOn[trackId]) delete S.trackOn[trackId]; else S.trackOn[trackId] = true;
        updateToggleUI(daw);
        repaintTrack(daw, trackId);
        if (S.trackOn[trackId] || S.globalOn) analyzeTrack(daw, trackId, false);
    }
    function updateToggleUI(daw) {
        var g = document.getElementById('diagGlobalToggle');
        if (g) g.classList.toggle('active', S.globalOn);
        document.querySelectorAll('.track-header').forEach(function (h) {
            var b = h.querySelector('.track-btn.diagnose');
            if (b) b.classList.toggle('active', effectiveOn(daw, h.dataset.track));
        });
    }
    function analyzeTrack(daw, trackId, force) {
        daw.audioClips.forEach(function (clip, id) {
            if (Number(clip.track) === Number(trackId)) analyzeClip(daw, id, { force: force });
        });
    }
    function analyzeAll(daw, force) {
        daw.audioClips.forEach(function (clip, id) { analyzeClip(daw, id, { force: force }); });
    }

    function init(daw) {
        var g = document.getElementById('diagGlobalToggle');
        if (g && !g._diagBound) {
            g._diagBound = true;
            g.addEventListener('click', function () { setGlobal(daw, !S.globalOn); });
        }
        var lb = document.getElementById('diagLegendBtn');
        if (lb && !lb._diagBound) {
            lb._diagBound = true;
            lb.addEventListener('click', function (e) { e.stopPropagation(); openLegend(daw, lb); });
        }
        updateToggleUI(daw);
    }

    /* ---------------- public API ---------------- */
    var WaveDiag = {
        analyzeClip: analyzeClip,
        analyzeTrack: analyzeTrack,
        analyzeAll: analyzeAll,
        isFresh: isFresh,
        paintOverlay: paintOverlay,
        effectiveOn: effectiveOn,
        setGlobal: setGlobal,
        toggleTrack: toggleTrack,
        updateToggleUI: updateToggleUI,
        openLegend: openLegend,
        closePopups: closePopups,
        snapTiming: snapTiming,
        sendToVoxPolish: sendToVoxPolish,
        tempoOf: tempoOf,
        META: META,
        COLORS: COLORS,
        init: init,
        _state: S
    };
    if (typeof window !== 'undefined') window.WaveDiag = WaveDiag;
    if (typeof module !== 'undefined' && module.exports) module.exports = WaveDiag;
})();
