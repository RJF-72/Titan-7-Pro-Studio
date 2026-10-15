/* ============================================================================
 * TitanComping — real auto-comping for Titan 7 Pro Studio
 * ----------------------------------------------------------------------------
 * Take lanes, explainable take grading, and automatic comp assembly that
 * integrate with the existing TitanAudioEngine / TitanDAW clip model.
 *
 * Concepts
 *   TAKE  - one recorded pass on a track. { id, trackId, takeNumber,
 *           timestamp, timelineStart, buffer, grades[], overallScore }
 *   GRADE - per-segment score 0..100 produced by gradeSegment(). The formula
 *           is documented in gradeSegment() and COMPING.md. No fake AI: every
 *           point is traceable to measured signal properties.
 *           Segments scoring >= 92 auto-lock (grade.locked = true): a locked
 *           segment wins comp assembly outright and can never be replaced by
 *           a later take — it does not have to be re-recorded.
 *   COMP  - a new AudioBuffer assembled from the best-scoring segment of each
 *           position, joined with short equal-power crossfades, placed on the
 *           track as a regular clip (so playback, plugin chains, session
 *           save/load and WAV export all work unchanged).
 *
 * Takes are stored OUTSIDE daw.audioClips so they never double-play on the
 * transport. Only an accepted comp becomes a real clip.
 * ========================================================================== */
'use strict';

class TitanComping {
    constructor(daw) {
        this.daw = daw;
        /** Map<takeId, take> */
        this.takes = new Map();
        /** Map<trackId, comp> — latest assembled (not yet accepted) comp per track */
        this.pendingComps = new Map();
        this.takesMode = false;
        this.selectedTakeId = null;
        /** per-track take counters so numbering survives reloads */
        this.takeCounters = new Map();
        /**
         * Auto-lock threshold: a segment grading at or above this score locks
         * on grade and is protected from recomping/replacement.
         * Spec: "above 92%" — using >= 92 so a flat 92.0 locks.
         */
        this.LOCK_SCORE = 92;
    }

    /* ------------------------------------------------------------------ */
    /* Grading                                                               */
    /* ------------------------------------------------------------------ */

    /**
     * Segment length: one musical bar from the session BPM/time signature,
     * falling back to 2.0 s when the tempo info is unusable.
     */
    segmentLengthSeconds() {
        const bpm = Number(this.daw?.bpm);
        const sig = String(this.daw?.timeSignature || '4/4');
        const beats = Number(sig.split('/')[0]);
        if (Number.isFinite(bpm) && bpm > 20 && bpm < 400 &&
            Number.isFinite(beats) && beats > 0 && beats <= 16) {
            return (60 / bpm) * beats;
        }
        return 2.0;
    }

    /**
     * Grade one segment of audio, 0..100.
     *
     * Formula (all terms measured from the samples, nothing invented):
     *   LEVEL (60 pts) — healthy RMS. Ideal is -12 dBFS. Gaussian falloff:
     *       60 * exp(-((rmsDb + 12)^2) / (2 * 10^2))
     *     so -12 dBFS -> 60, -24/-0 dBFS -> ~29, -36 dBFS -> ~3.
     *   NOISE (25 pts) — hiss estimate. A 2nd-order Butterworth highpass at
     *     10 kHz strips the musical content, then the noise floor is the
     *     10th percentile of the 100 ms sub-window RMS levels of the
     *     highpassed signal:
     *       25 * clamp((-40 - hfFloorDb) / 40, 0, 1)
     *     so a clean tone (HF floor ~-80 dBFS) -> 25 pts, broadband hiss at
     *     -40 dBFS or worse -> 0. Measuring the HF band (instead of the raw
     *     sub-window levels) keeps a steady clean tone from being mistaken
     *     for its own noise floor.
     *   CONSISTENCY (15 pts) — 1 minus the coefficient of variation of the
     *     sub-window levels (penalizes pops/dropouts/gating chatter):
     *       15 * clamp(1 - cv / 1.5, 0, 1)
     *   CLIPPING — any |sample| >= 0.99 caps the total at 45.
     *   SILENCE  — RMS at/below -60 dBFS caps the total at 8.
     *
     * Known limitation: intentional silence (a musical rest) scores low in
     * EVERY take, so auto-comp simply picks the least-bad option there.
     * Grading measures signal health, not musical quality.
     */
    gradeSegment(channelData, sampleRate) {
        const n = channelData.length;
        if (!n || !Number.isFinite(sampleRate) || sampleRate <= 0) return 0;

        const subLen = Math.max(1, Math.floor(sampleRate * 0.1)); // 100 ms windows
        const subDb = [];
        let sumSq = 0;
        let peak = 0;
        for (let i = 0; i < n; i++) {
            const v = channelData[i];
            const a = Math.abs(v);
            if (a > peak) peak = a;
            sumSq += v * v;
        }
        for (let s = 0; s < n; s += subLen) {
            const end = Math.min(n, s + subLen);
            let ss = 0;
            for (let i = s; i < end; i++) ss += channelData[i] * channelData[i];
            const rms = Math.sqrt(ss / Math.max(1, end - s));
            subDb.push(20 * Math.log10(rms + 1e-12));
        }
        const rms = Math.sqrt(sumSq / n);
        const rmsDb = 20 * Math.log10(rms + 1e-12);

        // LEVEL — 60 pts
        const levelPts = 60 * Math.exp(-Math.pow(rmsDb + 12, 2) / (2 * Math.pow(10, 2)));

        // NOISE — 25 pts (HF hiss floor: 10 kHz highpass, then 10th
        // percentile of the sub-window levels of the highpassed signal).
        const hp = new Float32Array(n);
        {
            const f = Math.min(10000, sampleRate * 0.45);
            const w0 = 2 * Math.PI * f / sampleRate;
            const c = Math.cos(w0), s = Math.sin(w0);
            const alpha = s / Math.SQRT2; // Butterworth Q = 1/sqrt(2)
            const b0 = (1 + c) / 2, b1 = -(1 + c), b2 = b0;
            const a0 = 1 + alpha, a1 = -2 * c, a2 = 1 - alpha;
            let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
            for (let i = 0; i < n; i++) {
                const x0 = channelData[i];
                const y0 = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
                hp[i] = y0;
                x2 = x1; x1 = x0; y2 = y1; y1 = y0;
            }
        }
        const hfDb = [];
        for (let s = 0; s < n; s += subLen) {
            const end = Math.min(n, s + subLen);
            let ss = 0;
            for (let i = s; i < end; i++) ss += hp[i] * hp[i];
            const hrms = Math.sqrt(ss / Math.max(1, end - s));
            hfDb.push(20 * Math.log10(hrms + 1e-12));
        }
        hfDb.sort((a, b) => a - b);
        const hfFloorDb = hfDb.length ? hfDb[Math.floor(hfDb.length * 0.1)] : rmsDb;
        const noisePts = 25 * Math.min(1, Math.max(0, (-40 - hfFloorDb) / 40));

        // CONSISTENCY — 15 pts
        const mean = subDb.reduce((a, b) => a + b, 0) / Math.max(1, subDb.length);
        const variance = subDb.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, subDb.length);
        const cv = Math.abs(mean) > 1e-9 ? Math.sqrt(variance) / Math.abs(mean) : 1;
        const consistencyPts = 15 * Math.min(1, Math.max(0, 1 - cv / 1.5));

        let total = levelPts + noisePts + consistencyPts;
        let flags = [];
        if (peak >= 0.99) { total = Math.min(total, 45); flags.push('clipped'); }
        if (rmsDb <= -60) { total = Math.min(total, 8); flags.push('silent'); }
        return { score: Math.max(0, Math.min(100, Math.round(total))), flags, rmsDb: +rmsDb.toFixed(1), peak: +peak.toFixed(3) };
    }

    /** Grade every segment of a take; fills take.grades[] and take.overallScore. */
    gradeTake(take) {
        const daw = this.daw;
        const buffer = take.buffer;
        const segLen = this.segmentLengthSeconds();
        const sr = buffer.sampleRate;
        const segSamples = Math.max(1, Math.floor(segLen * sr));
        const data = buffer.getChannelData(0);
        take.grades = [];
        for (let s = 0; s < data.length; s += segSamples) {
            const end = Math.min(data.length, s + segSamples);
            const g = this.gradeSegment(data.subarray(s, end), sr);
            const grade = {
                index: take.grades.length,
                start: take.timelineStart + s / sr,
                end: take.timelineStart + end / sr,
                ...g
            };
            // Auto-lock: a segment grading at/above LOCK_SCORE never has to
            // be re-recorded — it is protected from recomping/replacement.
            grade.locked = grade.score >= this.LOCK_SCORE;
            take.grades.push(grade);
        }
        take.overallScore = take.grades.length
            ? Math.round(take.grades.reduce((a, g) => a + g.score, 0) / take.grades.length)
            : 0;
        take.gradedAt = Date.now();
        return take;
    }

    /* ------------------------------------------------------------------ */
    /* Takes                                                                 */
    /* ------------------------------------------------------------------ */

    nextTakeNumber(trackId) {
        const n = (this.takeCounters.get(trackId) || 0) + 1;
        this.takeCounters.set(trackId, n);
        return n;
    }

    getTakesForTrack(trackId) {
        return Array.from(this.takes.values())
            .filter((t) => t.trackId === trackId)
            .sort((a, b) => a.takeNumber - b.takeNumber);
    }

    /**
     * Store one recorded pass as a take lane (called from
     * TitanDAW.commitRecordingToTracks when takes mode is on).
     */
    async commitTake(trackId, audioBuffer, timelineStart) {
        const daw = this.daw;
        const takeNumber = this.nextTakeNumber(trackId);
        const takeId = `take-${trackId}-${takeNumber}-${Date.now().toString(36)}`;
        const take = {
            id: takeId,
            trackId,
            takeNumber,
            timestamp: Date.now(),
            timelineStart: Math.max(0, timelineStart || 0),
            buffer: audioBuffer,
            duration: audioBuffer.duration,
            grades: [],
            overallScore: 0,
            muted: false
        };
        this.gradeTake(take);
        this.takes.set(takeId, take);
        try {
            await daw.persistClipAsset(takeId, take, daw._audioBufferToWav(audioBuffer));
        } catch (err) {
            console.warn('[comping] Failed to persist take asset', takeId, err);
        }
        this.renderTakeLanes(trackId);
        this.renderTakesPanel();
        daw.storeWorkingSessionSnapshot();
        const lockedSegs = take.grades.filter((g) => g.locked).length;
        daw.addConsoleMessage('success',
            `Take ${takeNumber} recorded on Track ${trackId} — score ${take.overallScore}/100` +
            (lockedSegs ? ` — ${lockedSegs} segment${lockedSegs === 1 ? '' : 's'} auto-locked (≥92, no re-record needed).` : '.'));
        return take;
    }

    async deleteTake(takeId) {
        const take = this.takes.get(takeId);
        if (!take) return;
        this.takes.delete(takeId);
        if (this.selectedTakeId === takeId) this.selectedTakeId = null;
        try {
            await this.daw._withAudioStore('readwrite', (store) => {
                try { store.delete(takeId); } catch (_e) {}
            });
        } catch (_e) {}
        document.querySelector(`.take-clip[data-take-id="${takeId}"]`)?.remove();
        this.renderTakesPanel();
        this.daw.storeWorkingSessionSnapshot();
    }

    toggleTakeMute(takeId) {
        const take = this.takes.get(takeId);
        if (!take) return;
        take.muted = !take.muted;
        document.querySelector(`.take-clip[data-take-id="${takeId}"]`)?.classList.toggle('muted', take.muted);
        this.renderTakesPanel();
    }

    /* ------------------------------------------------------------------ */
    /* Auto-comp assembly                                                    */
    /* ------------------------------------------------------------------ */

    /**
     * Build the segment grid shared by all takes on a track and pick the
     * winning take per segment. Returns { segments, segLen, gridStart }.
     */
    planComp(trackId) {
        const takes = this.getTakesForTrack(trackId).filter((t) => !t.muted && t.buffer);
        if (takes.length === 0) return null;
        const segLen = this.segmentLengthSeconds();
        const gridStart = Math.min(...takes.map((t) => t.timelineStart));
        const gridEnd = Math.max(...takes.map((t) => t.timelineStart + t.duration));
        const segments = [];
        for (let s = gridStart, idx = 0; s < gridEnd; s += segLen, idx++) {
            const segEnd = Math.min(s + segLen, gridEnd);
            let best = null;
            for (const take of takes) {
                const takeStart = take.timelineStart;
                const takeEnd = takeStart + take.duration;
                if (takeEnd <= s || takeStart >= segEnd) continue; // no overlap
                // grade of the take's segment overlapping this grid position
                const relIdx = Math.floor((s - takeStart) / segLen);
                const g = take.grades[Math.max(0, Math.min(take.grades.length - 1, relIdx))];
                const score = g ? g.score : 0;
                if (g && g.locked) {
                    // Auto-locked segment: first locked take at this grid
                    // position wins outright — later takes can never replace
                    // it, even with a higher score.
                    best = { take, score, locked: true };
                    break;
                }
                if (!best || score > best.score ||
                    (score === best.score && take.takeNumber < best.take.takeNumber)) {
                    best = { take, score, locked: false };
                }
            }
            if (best) segments.push({ index: idx, start: s, end: segEnd, take: best.take, score: best.score, locked: !!best.locked });
        }
        return segments.length ? { segments, segLen, gridStart } : null;
    }

    /**
     * Assemble the comp AudioBuffer: winning segment per position, joined
     * with short equal-power crossfades at take boundaries.
     */
    assembleCompBuffer(trackId) {
        const daw = this.daw;
        const plan = this.planComp(trackId);
        if (!plan) return null;
        const { segments, gridStart } = plan;
        const sr = daw.engine.ctx.sampleRate;
        const channels = Math.max(...segments.map((s) => s.take.buffer.numberOfChannels));
        const totalDur = segments[segments.length - 1].end - gridStart;
        const out = daw.engine.ctx.createBuffer(channels, Math.max(1, Math.ceil(totalDur * sr)), sr);
        const fadeSec = 0.01; // 10 ms crossfade at take boundaries
        const fadeSamples = Math.max(8, Math.floor(fadeSec * sr));

        segments.forEach((seg, i) => {
            const takeBuf = seg.take.buffer;
            const takeSr = takeBuf.sampleRate;
            const segStartInTake = Math.max(0, seg.start - seg.take.timelineStart);
            const segLenSamples = Math.min(
                Math.floor((seg.end - seg.start) * sr),
                takeBuf.length - Math.floor(segStartInTake * takeSr)
            );
            if (segLenSamples <= 0) return;
            const outOffset = Math.floor((seg.start - gridStart) * sr);
            const prevTake = i > 0 ? segments[i - 1].take : null;
            const nextTake = i < segments.length - 1 ? segments[i + 1].take : null;
            for (let ch = 0; ch < channels; ch++) {
                const src = takeBuf.getChannelData(Math.min(ch, takeBuf.numberOfChannels - 1));
                const dst = out.getChannelData(ch);
                const srcOff = Math.floor(segStartInTake * takeSr);
                for (let n = 0; n < segLenSamples; n++) {
                    let v = src[srcOff + n] || 0;
                    // equal-power crossfade at boundaries where the take changes
                    if (prevTake !== seg.take && n < fadeSamples) {
                        const t = n / fadeSamples;
                        v *= Math.sin((t * Math.PI) / 2); // fade in
                    } else if (nextTake !== seg.take && n >= segLenSamples - fadeSamples) {
                        const t = (segLenSamples - 1 - n) / fadeSamples;
                        v *= Math.sin((t * Math.PI) / 2); // fade out
                    }
                    const o = outOffset + n;
                    if (o < dst.length) dst[o] = v;
                }
            }
        });
        return { buffer: out, plan };
    }

    /** Assemble (or re-assemble) the comp for a track; stores it as pending. */
    autoComp(trackId) {
        const built = this.assembleCompBuffer(trackId);
        if (!built) {
            this.daw.addConsoleMessage('warning', `No usable takes on Track ${trackId} to comp.`);
            return null;
        }
        const comp = {
            id: `comp-${trackId}-${Date.now().toString(36)}`,
            trackId,
            buffer: built.buffer,
            timelineStart: built.plan.gridStart,
            segments: built.plan.segments.map((s) => ({
                index: s.index,
                start: +s.start.toFixed(3),
                end: +s.end.toFixed(3),
                takeId: s.take.id,
                takeNumber: s.take.takeNumber,
                score: s.score,
                locked: !!s.locked
            })),
            createdAt: Date.now()
        };
        this.pendingComps.set(trackId, comp);
        this.renderTakesPanel();
        const used = new Set(comp.segments.map((s) => s.takeNumber));
        const lockedCount = comp.segments.filter((s) => s.locked).length;
        this.daw.addConsoleMessage('success',
            `Auto-comp assembled for Track ${trackId}: ${comp.segments.length} segments from take(s) ${[...used].sort((a, b) => a - b).join(', ')}` +
            (lockedCount ? ` (${lockedCount} auto-locked ≥92 — no re-record needed)` : '') +
            `. Preview or Accept below.`);
        return comp;
    }

    /** Play the pending comp once (preview, not on the timeline). */
    previewComp(trackId) {
        const daw = this.daw;
        const comp = this.pendingComps.get(trackId);
        if (!comp || !daw.engine.ctx) return;
        daw.engine.ensureResumed();
        const src = daw.engine.ctx.createBufferSource();
        src.buffer = comp.buffer;
        const g = daw.engine.ctx.createGain();
        g.gain.value = 0.9;
        src.connect(g);
        const entry = daw.engine.trackGains.get(trackId);
        g.connect(entry ? entry.node : daw.engine.masterGain);
        src.start();
        daw.addConsoleMessage('info', `Previewing comp for Track ${trackId}…`);
    }

    /**
     * Accept the pending comp: place it as a regular clip on the track so
     * playback, plugin chains, session save/load and WAV export treat it
     * like any other clip. Takes stay available underneath.
     */
    async acceptComp(trackId) {
        const daw = this.daw;
        const comp = this.pendingComps.get(trackId);
        if (!comp) return null;
        const clipId = comp.id;
        const clip = {
            buffer: comp.buffer,
            name: `Comp T${trackId} (${comp.segments.length} segs)`,
            duration: comp.buffer.duration,
            sourceDuration: comp.buffer.duration,
            timelineStart: comp.timelineStart,
            track: trackId,
            muted: false,
            trimStart: 0,
            trimEnd: comp.buffer.duration,
            fadeInDuration: 0,
            fadeOutDuration: 0,
            isComp: true,
            compSegments: comp.segments
        };
        daw.normalizeClipState(clip);
        daw.audioClips.set(clipId, clip);
        try {
            await daw.persistClipAsset(clipId, clip, daw._audioBufferToWav(comp.buffer));
        } catch (err) {
            console.warn('[comping] Failed to persist comp asset', err);
        }
        daw.addClipToTimeline(clipId, trackId);
        this.pendingComps.delete(trackId);
        this.renderTakesPanel();
        daw.storeWorkingSessionSnapshot();
        daw.addConsoleMessage('success', `Comp accepted on Track ${trackId} — placed as a regular clip.`);
        return clip;
    }

    /* ------------------------------------------------------------------ */
    /* Persistence (mirrors the clip asset flow)                             */
    /* ------------------------------------------------------------------ */

    serialize() {
        return Array.from(this.takes.values()).map((t) => ({
            id: t.id,
            trackId: t.trackId,
            takeNumber: t.takeNumber,
            timestamp: t.timestamp,
            timelineStart: t.timelineStart,
            duration: t.duration,
            grades: t.grades,
            overallScore: t.overallScore,
            muted: !!t.muted
        }));
    }

    async restore(takeStates) {
        const daw = this.daw;
        if (!Array.isArray(takeStates) || !takeStates.length) return;
        const assets = await daw._batchLoadClipAssets(takeStates.map((t) => t.id));
        for (const st of takeStates) {
            try {
                const asset = assets.get(st.id);
                let buffer = null;
                if (asset?.audioData) {
                    buffer = await daw.engine.ctx.decodeAudioData(asset.audioData.slice(0));
                }
                if (!buffer) continue;
                const take = { ...st, buffer };
                this.takes.set(st.id, take);
                const n = this.takeCounters.get(st.trackId) || 0;
                if (st.takeNumber > n) this.takeCounters.set(st.trackId, st.takeNumber);
            } catch (err) {
                console.warn('[comping] Failed to restore take', st.id, err);
            }
        }
        const trackIds = new Set(Array.from(this.takes.values()).map((t) => t.trackId));
        trackIds.forEach((id) => this.renderTakeLanes(id));
        this.renderTakesPanel();
    }

    /* ------------------------------------------------------------------ */
    /* UI                                                                    */
    /* ------------------------------------------------------------------ */

    setTakesMode(on) {
        this.takesMode = !!on;
        document.getElementById('takesMode')?.classList.toggle('active', this.takesMode);
        this.daw.addConsoleMessage('info',
            this.takesMode
                ? 'Takes mode ON — each recording pass is stored as a take lane. Use the Takes tab to grade and auto-comp.'
                : 'Takes mode OFF — recordings go to the timeline as normal clips.');
    }

    gradeBadgeClass(score) {
        if (score >= 80) return 'grade-high';
        if (score >= 55) return 'grade-mid';
        return 'grade-low';
    }

    /** Render take lanes under a track's main lane. */
    renderTakeLanes(trackId) {
        const lane = document.querySelector(`.track-lane[data-track="${trackId}"]`);
        if (!lane) return;
        lane.querySelectorAll('.take-clip').forEach((el) => el.remove());
        const takes = this.getTakesForTrack(trackId);
        lane.classList.toggle('has-takes', takes.length > 0);
        const pxPerSec = 100;
        const gutter = this.daw.TIMELINE_GUTTER_PX || 200;
        takes.forEach((take) => {
            const div = document.createElement('div');
            div.className = 'audio-clip take-clip' + (take.muted ? ' muted' : '') +
                (this.selectedTakeId === take.id ? ' selected' : '');
            div.dataset.takeId = take.id;
            const w = Math.max(60, take.duration * pxPerSec);
            const left = gutter + take.timelineStart * pxPerSec;
            div.style.cssText = `left:${left}px;width:${w}px;`;
            div.innerHTML = `
                <div class="clip-header">
                    <span>Take ${take.takeNumber}</span>
                    <span class="take-badge ${this.gradeBadgeClass(take.overallScore)}">${take.overallScore}</span>
                </div>
                <canvas class="waveform"></canvas>`;
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectedTakeId = take.id;
                this.renderTakeLanes(trackId);
                this.renderTakesPanel();
            });
            lane.appendChild(div);
            const canvas = div.querySelector('canvas');
            if (canvas && take.buffer) {
                canvas.width = Math.max(44, w - 16);
                canvas.height = 40;
                try { this.daw.drawAudioWaveform(canvas, take.buffer, null); } catch (_e) {}
            }
        });
    }

    renderAllTakeLanes() {
        const ids = new Set(Array.from(this.takes.values()).map((t) => t.trackId));
        ids.forEach((id) => this.renderTakeLanes(id));
    }

    /** Bottom "Takes" panel for the currently selected track. */
    renderTakesPanel() {
        const panel = document.getElementById('takesPanel');
        if (!panel) return;
        const daw = this.daw;
        const trackId = daw.getSelectedTrackId ? daw.getSelectedTrackId() : (daw.selectedTrackId || 1);
        const takes = this.getTakesForTrack(trackId);
        const comp = this.pendingComps.get(trackId);

        let html = `
            <div class="takes-toolbar">
                <span class="takes-title"><i class="fas fa-layer-group"></i> Takes — Track ${trackId}</span>
                <button class="takes-btn ${this.takesMode ? 'active' : ''}" id="takesModeBtn2">
                    <i class="fas fa-circle-dot"></i> Takes mode: ${this.takesMode ? 'ON' : 'OFF'}
                </button>
                <button class="takes-btn primary" id="autoCompBtn" ${takes.length ? '' : 'disabled'}>
                    <i class="fas fa-wand-magic-sparkles"></i> Auto-Comp
                </button>
                <button class="takes-btn" id="previewCompBtn" ${comp ? '' : 'disabled'}>
                    <i class="fas fa-play"></i> Preview comp
                </button>
                <button class="takes-btn accept" id="acceptCompBtn" ${comp ? '' : 'disabled'}>
                    <i class="fas fa-check"></i> Accept comp
                </button>
            </div>`;

        if (!takes.length) {
            html += `<div class="takes-empty">No takes yet. Turn on <b>Takes mode</b> (transport bar), arm this track, and record a few passes — each pass becomes a take lane, graded per segment.</div>`;
        } else {
            html += `<div class="takes-list">` + takes.map((t) => {
                const segBadges = t.grades.map((g) =>
                    `<span class="seg-badge ${this.gradeBadgeClass(g.score)}${g.locked ? ' locked' : ''}" title="Segment ${g.index + 1}: ${g.score}/100${g.locked ? ' — LOCKED (≥92, protected from recomping)' : ''}${g.flags.length ? ' (' + g.flags.join(', ') + ')' : ''}">${g.score}${g.locked ? ' 🔒' : ''}</span>`
                ).join('');
                return `
                <div class="take-row ${this.selectedTakeId === t.id ? 'selected' : ''} ${t.muted ? 'muted' : ''}" data-take-id="${t.id}">
                    <span class="take-name">Take ${t.takeNumber}</span>
                    <span class="take-badge ${this.gradeBadgeClass(t.overallScore)}">${t.overallScore}</span>
                    <span class="take-meta">${t.duration.toFixed(1)}s · ${new Date(t.timestamp).toLocaleTimeString()}</span>
                    <span class="take-segs">${segBadges}</span>
                    <span class="take-actions">
                        <button class="takes-btn small" data-act="mute">${t.muted ? 'Unmute' : 'Mute'}</button>
                        <button class="takes-btn small danger" data-act="delete">Delete</button>
                    </span>
                </div>`;
            }).join('') + `</div>`;
        }

        if (comp) {
            const segRows = comp.segments.map((s) =>
                `<span class="comp-seg${s.locked ? ' locked' : ''}" title="Take ${s.takeNumber} · score ${s.score}${s.locked ? ' · LOCKED' : ''}">T${s.takeNumber}${s.locked ? ' 🔒' : ''}</span>`
            ).join('');
            html += `
            <div class="comp-preview">
                <div class="comp-title"><i class="fas fa-check-circle"></i> Pending comp — ${comp.segments.length} segments</div>
                <div class="comp-segs">${segRows}</div>
                <div class="comp-hint">Preview it, then Accept to place it on the track as a regular clip. Takes stay available underneath.</div>
            </div>`;
        }

        panel.innerHTML = html;
        document.getElementById('takesModeBtn2')?.addEventListener('click', () => {
            this.setTakesMode(!this.takesMode);
            const tb = document.getElementById('takesMode');
            if (tb) tb.classList.toggle('active', this.takesMode);
            this.renderTakesPanel();
        });
        document.getElementById('autoCompBtn')?.addEventListener('click', () => this.autoComp(trackId));
        document.getElementById('previewCompBtn')?.addEventListener('click', () => this.previewComp(trackId));
        document.getElementById('acceptCompBtn')?.addEventListener('click', () => this.acceptComp(trackId));
        panel.querySelectorAll('.take-row').forEach((row) => {
            const id = row.dataset.takeId;
            row.addEventListener('click', (e) => {
                const act = e.target.closest('[data-act]')?.dataset.act;
                if (act === 'delete') { this.deleteTake(id); return; }
                if (act === 'mute') { this.toggleTakeMute(id); return; }
                this.selectedTakeId = id;
                this.renderTakesPanel();
                const tid = this.takes.get(id)?.trackId;
                if (tid) this.renderTakeLanes(tid);
            });
        });
    }
}

// Export for the DAW bootstrap (script tag, no modules in this app).
window.TitanComping = TitanComping;
