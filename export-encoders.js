/* ============================================================================
 * Titan 7 Pro Studio — Mixdown export encoders (MP3 + FLAC)
 * ----------------------------------------------------------------------------
 * Plain classic script (no modules, no eval): exposes window.TitanExportEncoders
 * with two promise-based encoders used by the mixdown export path in app.js:
 *
 *   TitanExportEncoders.encodeMp3(audioBuffer, { bitrate: 320, onProgress })
 *   TitanExportEncoders.encodeFlac(audioBuffer, { compression: 5, onProgress })
 *
 * Both resolve to { blob, ext, mime, size }. Encoding is chunked and each
 * chunk reports real progress via onProgress(fractionDone) so the UI can show
 * an honest progress bar on long mixes — no fake progress.
 *
 * Requires (loaded via <script> tags in index.html BEFORE this file):
 *   - vendor/lame.all.js        (lamejs 1.2.1, pure JS MP3 encoder)
 *   - vendor/libflac.wasm.js    (libflacjs 5.6.0, WASM FLAC encoder/decoder)
 *     with window.FLAC_SCRIPT_LOCATION = 'vendor/' set before it so the
 *     loader finds vendor/libflac.wasm.wasm.
 * ========================================================================== */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /* helpers                                                             */
    /* ------------------------------------------------------------------ */

    function yieldTick() {
        return new Promise(function (resolve) { setTimeout(resolve, 0); });
    }

    function clamp16(v) {
        // float [-1,1] -> int16 with clipping
        var s = v < -1 ? -1 : (v > 1 ? 1 : v);
        return s < 0 ? Math.ceil(s * 32768) : Math.floor(s * 32767);
    }

    // NOTE: libflacjs encodes the int32 samples it is given using only the
    // declared bits-per-sample, so for bps=16 the Int32Array must hold
    // sign-extended 16-bit values (clamp16 range) — NOT full 32-bit scale.

    // Downmix any channel count to 1 (mono) or 2 (stereo) Float32Array planes.
    function toStereoPlanes(audioBuffer) {
        var nCh = audioBuffer.numberOfChannels;
        var len = audioBuffer.length;
        if (nCh === 1) return [audioBuffer.getChannelData(0)];
        if (nCh === 2) return [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];
        var planes = [new Float32Array(len), new Float32Array(len)];
        for (var c = 0; c < nCh; c++) {
            var src = audioBuffer.getChannelData(c);
            var dst = planes[c % 2];
            for (var i = 0; i < len; i++) dst[i] += src[i] / Math.ceil(nCh / 2);
        }
        return planes;
    }

    function isFlacReady() {
        return !!(window.Flac && typeof window.Flac.isReady === 'function' && window.Flac.isReady());
    }

    // Wait for the async WASM libflacjs build to finish initializing.
    function whenFlacReady(timeoutMs) {
        timeoutMs = timeoutMs || 30000;
        return new Promise(function (resolve, reject) {
            if (!window.Flac) {
                reject(new Error('libflac.js is not loaded (vendor/libflac.wasm.js missing from the page).'));
                return;
            }
            if (isFlacReady()) { resolve(); return; }
            var done = false;
            var finish = function (ok, err) {
                if (done) return;
                done = true;
                clearTimeout(timer);
                if (ok) resolve(); else reject(err || new Error('libflac.js failed to initialize.'));
            };
            var timer = setTimeout(function () {
                finish(false, new Error('libflac.js did not become ready within ' + timeoutMs + 'ms.'));
            }, timeoutMs);
            try {
                if (typeof window.Flac.on === 'function') {
                    window.Flac.on('ready', function () { finish(true); });
                } else {
                    window.Flac.onready = function () { finish(true); };
                }
            } catch (e) { finish(false, e); }
            if (isFlacReady()) finish(true);
        });
    }

    /* ------------------------------------------------------------------ */
    /* MP3 — lamejs                                                        */
    /* ------------------------------------------------------------------ */

    var MP3_RATES = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];
    var MP3_FRAME_SAMPLES = 1152;

    async function encodeMp3(audioBuffer, opts) {
        opts = opts || {};
        var bitrate = opts.bitrate || 320;
        var onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;

        if (!window.lamejs || !window.lamejs.Mp3Encoder) {
            throw new Error('lamejs is not loaded (vendor/lame.all.js missing from the page).');
        }
        var sampleRate = audioBuffer.sampleRate;
        if (MP3_RATES.indexOf(sampleRate) === -1) {
            throw new Error('MP3 export needs a sample rate lamejs supports (' +
                MP3_RATES.join(', ') + '); got ' + sampleRate + ' Hz.');
        }

        var planes = toStereoPlanes(audioBuffer);
        var channels = planes.length;
        var totalSamples = audioBuffer.length;
        var encoder = new window.lamejs.Mp3Encoder(channels, sampleRate, bitrate);

        var parts = [];
        var done = 0;
        var chunksSinceYield = 0;
        for (var pos = 0; pos < totalSamples; pos += MP3_FRAME_SAMPLES) {
            var n = Math.min(MP3_FRAME_SAMPLES, totalSamples - pos);
            var left = new Int16Array(n);
            for (var i = 0; i < n; i++) left[i] = clamp16(planes[0][pos + i]);
            var data;
            if (channels === 2) {
                var right = new Int16Array(n);
                for (var j = 0; j < n; j++) right[j] = clamp16(planes[1][pos + j]);
                data = encoder.encodeBuffer(left, right);
            } else {
                data = encoder.encodeBuffer(left);
            }
            if (data && data.length) parts.push(new Uint8Array(data.buffer, data.byteOffset, data.length));
            done += n;
            if (onProgress) onProgress(done / totalSamples);
            if (++chunksSinceYield >= 16) { chunksSinceYield = 0; await yieldTick(); }
        }
        var tail = encoder.flush();
        if (tail && tail.length) parts.push(new Uint8Array(tail.buffer, tail.byteOffset, tail.length));

        var size = 0;
        for (var p = 0; p < parts.length; p++) size += parts[p].length;
        var out = new Uint8Array(size);
        var off = 0;
        for (var q = 0; q < parts.length; q++) { out.set(parts[q], off); off += parts[q].length; }
        if (onProgress) onProgress(1);
        return { blob: new Blob([out], { type: 'audio/mpeg' }), ext: 'mp3', mime: 'audio/mpeg', size: size };
    }

    /* ------------------------------------------------------------------ */
    /* FLAC — libflacjs (WASM build)                                       */
    /* ------------------------------------------------------------------ */

    var FLAC_BLOCK_SAMPLES = 4096;

    async function encodeFlac(audioBuffer, opts) {
        opts = opts || {};
        var compression = (opts.compression == null) ? 5 : opts.compression;
        var onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;

        await whenFlacReady();
        var Flac = window.Flac;

        var planes = toStereoPlanes(audioBuffer);
        var channels = planes.length;
        var sampleRate = audioBuffer.sampleRate;
        var totalSamples = audioBuffer.length; // per channel

        // float -> interleaved int32 holding sign-extended 16-bit samples
        // (matches the declared bps=16; see note on clamp16 above)
        var interleaved = new Int32Array(totalSamples * channels);
        var k = 0;
        for (var i = 0; i < totalSamples; i++) {
            for (var c = 0; c < channels; c++) interleaved[k++] = clamp16(planes[c][i]);
            if (onProgress && (i & 16383) === 0) onProgress(i / totalSamples * 0.25); // conversion phase
            if ((i & 32767) === 0) await yieldTick();
        }

        var chunks = [];
        var writeCb = function (data) { chunks.push(new Uint8Array(data)); };
        var metaCb = function () { /* metadata not needed */ };

        var enc = Flac.create_libflac_encoder(sampleRate, channels, 16, compression, totalSamples, false);
        if (!enc) throw new Error('FLAC encoder could not be created.');
        try {
            var initStatus = Flac.init_encoder_stream(enc, writeCb, metaCb, false, 0);
            if (initStatus !== 0) throw new Error('FLAC encoder init failed (status ' + initStatus + ').');

            var done = 0;
            var chunksSinceYield = 0;
            for (var pos = 0; pos < totalSamples; pos += FLAC_BLOCK_SAMPLES) {
                var n = Math.min(FLAC_BLOCK_SAMPLES, totalSamples - pos);
                var block = interleaved.subarray(pos * channels, (pos + n) * channels);
                var ok = Flac.FLAC__stream_encoder_process_interleaved(enc, block, n);
                if (!ok) throw new Error('FLAC encoding failed at sample ' + pos + '.');
                done += n;
                if (onProgress) onProgress(0.25 + 0.75 * (done / totalSamples));
                if (++chunksSinceYield >= 8) { chunksSinceYield = 0; await yieldTick(); }
            }
            var finOk = Flac.FLAC__stream_encoder_finish(enc);
            if (!finOk) throw new Error('FLAC encoder finish failed.');
        } finally {
            try { Flac.FLAC__stream_encoder_delete(enc); } catch (e) { /* ignore */ }
        }

        var size = 0;
        for (var p = 0; p < chunks.length; p++) size += chunks[p].length;
        var out = new Uint8Array(size);
        var off = 0;
        for (var q = 0; q < chunks.length; q++) { out.set(chunks[q], off); off += chunks[q].length; }
        if (onProgress) onProgress(1);
        return { blob: new Blob([out], { type: 'audio/flac' }), ext: 'flac', mime: 'audio/flac', size: size };
    }

    /* ------------------------------------------------------------------ */
    /* public API                                                          */
    /* ------------------------------------------------------------------ */

    window.TitanExportEncoders = {
        encodeMp3: encodeMp3,
        encodeFlac: encodeFlac,
        isFlacReady: isFlacReady,
        whenFlacReady: whenFlacReady,
        supportedMp3Rates: MP3_RATES.slice()
    };
})();
