const AURA_CALIBRATION_STORAGE_KEY = 'titanAuraCalibration.v1';
const AURA_ACTIVE_PROFILE_KEY = 'titanAuraActiveProfile.v1';
const AURA_SELECTED_MIC_KEY = 'titanAuraSelectedMic.v1';

const CALIBRATION_TARGET_SIGNATURES = {
    vintagetube: {
        name: 'Vintage Tube',
        description: 'Warm vocal weight with tube-style harmonic density.',
        brightness: 0.35,
        richness: 0.82,
        transient: 0.58,
        lowContour: 0.74
    },
    studiofet: {
        name: 'Studio FET',
        description: 'Balanced studio presence with controlled low end.',
        brightness: 0.46,
        richness: 0.68,
        transient: 0.63,
        lowContour: 0.55
    },
    modernair: {
        name: 'Modern Air',
        description: 'Forward detail, air, and modern top-end clarity.',
        brightness: 0.72,
        richness: 0.62,
        transient: 0.78,
        lowContour: 0.42
    },
    silkytube: {
        name: 'Silky Tube',
        description: 'Silky highs with polished harmonic smoothness.',
        brightness: 0.58,
        richness: 0.76,
        transient: 0.64,
        lowContour: 0.52
    },
    cleardetail: {
        name: 'Clear Detail',
        description: 'Detailed, flatter response suited to clean capture.',
        brightness: 0.49,
        richness: 0.54,
        transient: 0.74,
        lowContour: 0.38
    }
};

class CalibrationApp {
    constructor() {
        this.currentStep = 1;
        this.isRecording = false;
        this.audioCleanup = null;
        this.recordedChunks = [];
        this.recordedBlob = null;
        this.recordedDurationSeconds = 0;
        this.recordingStartTime = 0;
        this.mediaRecorder = null;
        this.recordingStopPromise = null;
        this.waveformAnimationFrame = null;
        this.countdownInterval = null;
        this.analysisContext = null;
        this.analysisAnalyser = null;
        this.recordingSpectrumSnapshots = [];
        this.recordingFrameRms = [];
        this.recordingProfile = null;
        this.init();
    }

    init() {
        this.showStep(1);
        this.bindEvents();
        this.loadMicrophones();
    }

    bindEvents() {
        document.getElementById('btnBackToDAW')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.cleanupAudio();
            window.location.href = 'index.html';
        });

        document.getElementById('btnCalibrationStart')?.addEventListener('click', () => {
            if (!this.getSelectedMicrophone()) {
                this.updateBotMessage('Please select a microphone before starting calibration.');
                return;
            }
            this.nextStep(2);
        });
        document.getElementById('btnCalibrationCancel')?.addEventListener('click', () => this.cancelCalibration());
        document.getElementById('btnApplyProfile')?.addEventListener('click', () => this.applyCalibration());
        document.getElementById('btnRecalibrate')?.addEventListener('click', () => this.recalibrate());
        document.getElementById('btnRefreshMics')?.addEventListener('click', () => this.refreshMicrophones());
    }

    showStep(stepNumber) {
        document.querySelectorAll('.step').forEach((step) => {
            step.classList.remove('active');
        });

        const currentStep = document.getElementById(`step${stepNumber}`);
        if (currentStep) {
            currentStep.classList.add('active');
            setTimeout(() => {
                const actions = currentStep.querySelector('.calibration-actions, .btn-calibration-start, .btn-calibration-cancel');
                if (actions) {
                    actions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    currentStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 50);
        }

        this.currentStep = stepNumber;

        if (stepNumber === 2) {
            this.startRecording();
        } else if (stepNumber === 3) {
            this.startAnalysis();
        }
    }

    nextStep(stepNumber) {
        this.showStep(stepNumber);
    }

    async startRecording() {
        this.isRecording = true;
        this.recordedChunks = [];
        this.recordedBlob = null;
        this.recordingSpectrumSnapshots = [];
        this.recordingFrameRms = [];
        this.recordingStartTime = performance.now();
        this.recordingProfile = null;
        this.resetAnalysisProgress();

        const noiseBadge = document.getElementById('noiseCancelBadge');
        if (noiseBadge) {
            noiseBadge.classList.toggle('hidden', !this.isNoiseCancellationEnabled());
        }
        const latencyBadge = document.getElementById('lowLatencyBadge');
        if (latencyBadge) {
            latencyBadge.classList.remove('hidden');
        }

        const deviceId = this.getSelectedMicrophone();
        try {
            const audioState = await this.createNoiseCancelledStream(deviceId);
            this.audioCleanup = audioState.cleanup;
            this.analysisContext = audioState.audioContext;
            this.analysisAnalyser = audioState.analyser;
            this.startRecorder(audioState.recordingStream);
        } catch (err) {
            console.error('Could not access microphone:', err);
            this.updateBotMessage('Could not access the selected microphone. Please check your device and permissions.');
            this.isRecording = false;
            return;
        }

        let countdown = 5;
        const countdownEl = document.getElementById('countdown');
        const instructions = [
            document.getElementById('inst1'),
            document.getElementById('inst2'),
            document.getElementById('inst3')
        ];

        if (countdownEl) countdownEl.textContent = `${countdown}`;
        this.countdownInterval = setInterval(() => {
            countdown -= 1;
            if (countdownEl) countdownEl.textContent = `${Math.max(0, countdown)}`;
            const activeInstructionIndex = Math.min(
                instructions.length - 1,
                Math.max(0, Math.floor((5 - countdown) / 2))
            );
            instructions.forEach((inst, index) => {
                if (!inst) return;
                inst.classList.toggle('active', index === activeInstructionIndex);
            });
            if (countdown <= 0) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
                void this.stopRecording();
            }
        }, 1000);

        this.animateRecordingWaveform();
        this.updateBotMessage('Speak naturally for five seconds. I am measuring actual level, spectrum, dynamics, and transient behavior from the selected microphone.');
    }

    startRecorder(stream) {
        const mimeType = this.pickSupportedMimeType();
        if (!mimeType || typeof MediaRecorder === 'undefined') {
            this.mediaRecorder = null;
            this.recordingStopPromise = Promise.resolve();
            return;
        }

        this.mediaRecorder = new MediaRecorder(stream, { mimeType });
        this.recordingStopPromise = new Promise((resolve) => {
            this.mediaRecorder.addEventListener('stop', () => {
                if (this.recordedChunks.length) {
                    this.recordedBlob = new Blob(this.recordedChunks, { type: mimeType });
                }
                this.recordedDurationSeconds = (performance.now() - this.recordingStartTime) / 1000;
                resolve();
            }, { once: true });
        });
        this.mediaRecorder.addEventListener('dataavailable', (event) => {
            if (event.data && event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        });
        this.mediaRecorder.start(250);
    }

    async stopRecording() {
        if (!this.isRecording) return;
        this.isRecording = false;

        if (this.waveformAnimationFrame) {
            cancelAnimationFrame(this.waveformAnimationFrame);
            this.waveformAnimationFrame = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        if (this.recordingStopPromise) {
            await this.recordingStopPromise;
        } else {
            this.recordedDurationSeconds = (performance.now() - this.recordingStartTime) / 1000;
        }

        this.cleanupAudio();
        this.nextStep(3);
    }

    animateRecordingWaveform() {
        const canvas = document.getElementById('recordingWaveform');
        if (!canvas || !this.analysisAnalyser) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const width = canvas.width;
        const height = canvas.height;
        const timeData = new Float32Array(this.analysisAnalyser.fftSize);
        const frequencyData = new Uint8Array(this.analysisAnalyser.frequencyBinCount);

        const render = () => {
            if (!this.isRecording || !this.analysisAnalyser) return;
            this.analysisAnalyser.getFloatTimeDomainData(timeData);
            this.analysisAnalyser.getByteFrequencyData(frequencyData);
            this.recordingSpectrumSnapshots.push(Array.from(frequencyData));
            this.recordingFrameRms.push(this.computeRms(timeData));

            ctx.fillStyle = 'rgba(26, 26, 37, 0.25)';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#ec4899';
            ctx.lineWidth = 2;
            ctx.beginPath();

            for (let x = 0; x < width; x++) {
                const sampleIndex = Math.min(timeData.length - 1, Math.floor((x / Math.max(1, width - 1)) * (timeData.length - 1)));
                const value = timeData[sampleIndex];
                const y = (height / 2) + (value * height * 0.38);
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();
            this.waveformAnimationFrame = requestAnimationFrame(render);
        };

        render();
    }

    async startAnalysis() {
        this.updateBotMessage('Capture complete. I am computing measured spectral, dynamic, and transient features from the recorded buffer now.');
        try {
            const decoded = await this.decodeRecordedAudio();
            const mono = this.extractMonoSamples(decoded);
            const averageSpectrum = this.averageSpectrumSnapshots();

            this.markProgressActive('freq', 'Computing response...');
            await this.yieldToUi();
            const spectralMetrics = this.computeSpectralMetrics(averageSpectrum, decoded.sampleRate);
            this.completeProgress('freq', 'Measured');
            this.updateBotMessage(`Measured usable range ${spectralMetrics.lowHz.toFixed(0)} Hz to ${spectralMetrics.highHz.toFixed(0)} Hz with centroid at ${spectralMetrics.centroidHz.toFixed(0)} Hz.`);

            this.markProgressActive('trans', 'Computing dynamics...');
            await this.yieldToUi();
            const dynamicsMetrics = this.computeDynamicsMetrics(mono);
            this.completeProgress('trans', 'Measured');

            this.markProgressActive('harm', 'Computing harmonic density...');
            await this.yieldToUi();
            const harmonicMetrics = this.computeHarmonicMetrics(averageSpectrum);
            this.completeProgress('harm', 'Measured');
            this.updateBotMessage(`Measured crest factor ${dynamicsMetrics.crestFactorDb.toFixed(1)} dB with harmonic richness ${Math.round(harmonicMetrics.harmonicRichness * 100)}%.`);

            this.markProgressActive('spat', 'Computing tone balance...');
            await this.yieldToUi();
            const toneMetrics = this.computeToneMetrics(averageSpectrum, decoded.sampleRate);
            this.completeProgress('spat', 'Measured');

            this.markProgressActive('dsp', 'Generating profile...');
            await this.yieldToUi();
            const profile = this.buildCalibrationProfile({
                buffer: decoded,
                mono,
                spectralMetrics,
                dynamicsMetrics,
                harmonicMetrics,
                toneMetrics
            });
            this.completeProgress('dsp', 'Profile ready');

            this.recordingProfile = profile;
            this.populateResults(profile);
            this.updateBotMessage(`Calibration complete. ${profile.recommendations.targetName} is the best measured target match for this microphone.`);
            this.nextStep(4);
        } catch (err) {
            console.error('Calibration analysis failed:', err);
            this.updateBotMessage('Calibration analysis could not complete from the recorded capture. Please try again.');
        }
    }

    updateBotMessage(text) {
        const messagesContainer = document.getElementById('calibrationBotMessages');
        if (!messagesContainer) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message-mini';
        messageDiv.innerHTML = `<p>${this.escapeHtml(text)}</p>`;
        messagesContainer.innerHTML = '';
        messagesContainer.appendChild(messageDiv);
    }

    cancelCalibration() {
        if (confirm('Are you sure you want to cancel the calibration?')) {
            this.cleanupAudio();
            window.location.href = 'aura.html';
        }
    }

    applyCalibration() {
        if (!this.recordingProfile) {
            this.updateBotMessage('No finished calibration profile is available to apply yet.');
            return;
        }

        try {
            localStorage.setItem(AURA_CALIBRATION_STORAGE_KEY, JSON.stringify(this.recordingProfile));
            localStorage.setItem(AURA_SELECTED_MIC_KEY, this.recordingProfile.inputDeviceId || '');
            localStorage.setItem(AURA_ACTIVE_PROFILE_KEY, JSON.stringify({
                id: `calibration-${this.recordingProfile.id}`,
                source: 'calibration',
                targetId: this.recordingProfile.recommendations.topTarget,
                settings: this.recordingProfile.controls,
                bypassed: false,
                inputDeviceId: this.recordingProfile.inputDeviceId,
                inputDeviceLabel: this.recordingProfile.inputDeviceLabel,
                waveformEnvelope: this.recordingProfile.waveformEnvelope
            }));
            this.updateBotMessage('Measured profile applied. Returning to AURA with the new calibration loaded.');
            setTimeout(() => {
                window.location.href = 'aura.html';
            }, 700);
        } catch (err) {
            console.error('Failed to persist calibration profile:', err);
            this.updateBotMessage('The profile was measured successfully, but it could not be stored locally.');
        }
    }

    recalibrate() {
        this.cleanupAudio();
        this.recordedChunks = [];
        this.recordedBlob = null;
        this.recordingProfile = null;
        this.resetAnalysisProgress();
        this.updateBotMessage('Ready to recalibrate. Select a microphone and start a new capture.');
        this.nextStep(1);
    }

    async refreshMicrophones() {
        const btn = document.getElementById('btnRefreshMics');
        if (btn) btn.classList.add('spinning');
        await this.loadMicrophones();
        if (btn) btn.classList.remove('spinning');
    }

    async loadMicrophones() {
        const select = document.getElementById('micSelect');
        if (!select) return;

        try {
            const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            probe.getTracks().forEach((track) => track.stop());

            const microphones = devices
                .filter((device) => device.kind === 'audioinput')
                .map((device, index) => ({
                    deviceId: device.deviceId,
                    label: device.label?.trim() || `Microphone ${index + 1}`
                }));

            select.innerHTML = '';
            if (!microphones.length) {
                select.innerHTML = '<option value="">No microphone detected</option>';
                select.disabled = true;
                this.updateBotMessage('No microphone detected. Please connect a microphone and refresh the page.');
                return;
            }

            const preferredId = localStorage.getItem(AURA_SELECTED_MIC_KEY) || '';
            microphones.forEach((mic, index) => {
                const option = document.createElement('option');
                option.value = mic.deviceId;
                option.textContent = mic.label;
                if ((preferredId && preferredId === mic.deviceId) || (!preferredId && index === 0)) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            select.disabled = false;
            this.updateBotMessage(`Found ${microphones.length} microphone(s). Select one and start calibration to measure its actual response.`);
        } catch (err) {
            console.error('Failed to load microphones:', err);
            select.innerHTML = '<option value="">Microphone access denied</option>';
            select.disabled = true;
            this.updateBotMessage('Microphone access is required to calibrate. Please allow access and refresh the page.');
        }
    }

    getSelectedMicrophone() {
        const select = document.getElementById('micSelect');
        return select?.value || null;
    }

    getSelectedMicrophoneLabel() {
        const select = document.getElementById('micSelect');
        if (!select || select.selectedIndex < 0) return 'Unknown microphone';
        return select.options[select.selectedIndex]?.textContent || 'Unknown microphone';
    }

    isNoiseCancellationEnabled() {
        const toggle = document.getElementById('noiseCancelToggle');
        return toggle ? toggle.checked : true;
    }

    async createNoiseCancelledStream(deviceId) {
        const constraints = {
            audio: {
                deviceId: deviceId ? { ideal: deviceId } : undefined,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                latency: 0,
                sampleRate: 48000
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
            latencyHint: 'interactive'
        });
        await audioContext.resume();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.65;

        let recordingStream = stream;
        let cleanup;
        if (!this.isNoiseCancellationEnabled()) {
            source.connect(analyser);
            cleanup = () => {
                try { source.disconnect(); } catch (err) { console.error(err); }
                try { analyser.disconnect(); } catch (err) { console.error(err); }
                stream.getTracks().forEach((track) => track.stop());
                if (audioContext.state !== 'closed') {
                    audioContext.close();
                }
            };
            return { analyser, audioContext, recordingStream, cleanup };
        }

        const highPass = audioContext.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 80;

        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -38;
        compressor.knee.value = 12;
        compressor.ratio.value = 10;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.1;

        const gate = audioContext.createGain();
        gate.gain.value = 1;

        const analysisNode = audioContext.createAnalyser();
        analysisNode.fftSize = 256;
        const gateData = new Uint8Array(analysisNode.frequencyBinCount);
        const destination = audioContext.createMediaStreamDestination();
        const gateInterval = setInterval(() => {
            analysisNode.getByteFrequencyData(gateData);
            let sum = 0;
            for (let i = 0; i < gateData.length; i++) sum += gateData[i];
            const average = sum / gateData.length;
            const targetGain = average > 8 ? 1 : 0.02;
            gate.gain.setTargetAtTime(targetGain, audioContext.currentTime, 0.05);
        }, 50);

        source.connect(highPass);
        highPass.connect(compressor);
        compressor.connect(gate);
        gate.connect(analyser);
        gate.connect(analysisNode);
        gate.connect(destination);
        recordingStream = destination.stream;

        cleanup = () => {
            clearInterval(gateInterval);
            try { source.disconnect(); } catch (err) { console.error(err); }
            try { highPass.disconnect(); } catch (err) { console.error(err); }
            try { compressor.disconnect(); } catch (err) { console.error(err); }
            try { gate.disconnect(); } catch (err) { console.error(err); }
            try { analyser.disconnect(); } catch (err) { console.error(err); }
            try { analysisNode.disconnect(); } catch (err) { console.error(err); }
            stream.getTracks().forEach((track) => track.stop());
            recordingStream.getTracks().forEach((track) => track.stop());
            if (audioContext.state !== 'closed') {
                audioContext.close();
            }
        };

        return { analyser, audioContext, recordingStream, cleanup };
    }

    cleanupAudio() {
        if (this.waveformAnimationFrame) {
            cancelAnimationFrame(this.waveformAnimationFrame);
            this.waveformAnimationFrame = null;
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        if (typeof this.audioCleanup === 'function') {
            try { this.audioCleanup(); } catch (err) { console.error(err); }
            this.audioCleanup = null;
        }
        this.analysisAnalyser = null;
        this.analysisContext = null;
    }

    async decodeRecordedAudio() {
        if (!this.recordedBlob) {
            throw new Error('No recorded audio available for analysis.');
        }
        const arrayBuffer = await this.recordedBlob.arrayBuffer();
        const context = new (window.AudioContext || window.webkitAudioContext)();
        try {
            const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
            if (context.state !== 'closed') {
                await context.close();
            }
            return decoded;
        } catch (err) {
            if (context.state !== 'closed') {
                await context.close();
            }
            throw err;
        }
    }

    extractMonoSamples(audioBuffer) {
        const mono = new Float32Array(audioBuffer.length);
        const channels = [];
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            channels.push(audioBuffer.getChannelData(channel));
        }
        for (let i = 0; i < audioBuffer.length; i++) {
            let sum = 0;
            for (let channel = 0; channel < channels.length; channel++) {
                sum += channels[channel][i];
            }
            mono[i] = sum / channels.length;
        }
        return mono;
    }

    averageSpectrumSnapshots() {
        if (!this.recordingSpectrumSnapshots.length) return [];
        const length = this.recordingSpectrumSnapshots[0].length;
        const spectrum = new Array(length).fill(0);
        for (let frameIndex = 0; frameIndex < this.recordingSpectrumSnapshots.length; frameIndex++) {
            const frame = this.recordingSpectrumSnapshots[frameIndex];
            for (let bin = 0; bin < length; bin++) {
                spectrum[bin] += frame[bin];
            }
        }
        for (let bin = 0; bin < length; bin++) {
            spectrum[bin] /= this.recordingSpectrumSnapshots.length;
        }
        return spectrum;
    }

    computeSpectralMetrics(spectrum, sampleRate) {
        if (!spectrum.length) {
            return {
                lowHz: 0,
                highHz: 0,
                centroidHz: 0,
                brightness: 0
            };
        }
        const nyquist = sampleRate / 2;
        const maxMagnitude = Math.max(...spectrum, 1);
        const threshold = maxMagnitude * 0.12;
        let first = 0;
        let last = spectrum.length - 1;
        for (let i = 0; i < spectrum.length; i++) {
            if (spectrum[i] >= threshold) {
                first = i;
                break;
            }
        }
        for (let i = spectrum.length - 1; i >= 0; i--) {
            if (spectrum[i] >= threshold) {
                last = i;
                break;
            }
        }
        let weightedSum = 0;
        let magnitudeSum = 0;
        let highFrequencyEnergy = 0;
        for (let bin = 0; bin < spectrum.length; bin++) {
            const magnitude = spectrum[bin] / 255;
            const freq = (bin / Math.max(1, spectrum.length - 1)) * nyquist;
            weightedSum += freq * magnitude;
            magnitudeSum += magnitude;
            if (freq >= 4000) {
                highFrequencyEnergy += magnitude;
            }
        }
        return {
            lowHz: (first / Math.max(1, spectrum.length - 1)) * nyquist,
            highHz: (last / Math.max(1, spectrum.length - 1)) * nyquist,
            centroidHz: magnitudeSum ? weightedSum / magnitudeSum : 0,
            brightness: magnitudeSum ? Math.max(0, Math.min(1, highFrequencyEnergy / magnitudeSum)) : 0
        };
    }

    computeDynamicsMetrics(samples) {
        const peak = this.computePeak(samples);
        const rms = this.computeRms(samples);
        const windowRms = this.computeWindowRms(samples, 2048);
        const noiseFloor = this.percentile(windowRms, 10);
        const loudWindow = this.percentile(windowRms, 95);
        const selfNoiseDbfs = this.linearToDbfs(Math.max(noiseFloor, 1e-6));
        const avgLevelDbfs = this.linearToDbfs(Math.max(rms, 1e-6));
        const peakLevelDbfs = this.linearToDbfs(Math.max(peak, 1e-6));
        const dynamicRangeDb = Math.max(0, this.linearToDbfs(Math.max(loudWindow, 1e-6)) - selfNoiseDbfs);
        const crestFactorDb = Math.max(0, peakLevelDbfs - avgLevelDbfs);
        return {
            selfNoiseDbfs,
            avgLevelDbfs,
            peakLevelDbfs,
            dynamicRangeDb,
            crestFactorDb,
            transientScore: Math.max(0, Math.min(1, crestFactorDb / 18))
        };
    }

    computeHarmonicMetrics(spectrum) {
        if (!spectrum.length) {
            return { harmonicRichness: 0 };
        }
        const normalized = spectrum.map((value) => Math.max(value / 255, 1e-6));
        const arithmeticMean = normalized.reduce((sum, value) => sum + value, 0) / normalized.length;
        let logSum = 0;
        for (let i = 0; i < normalized.length; i++) logSum += Math.log(normalized[i]);
        const geometricMean = Math.exp(logSum / normalized.length);
        const flatness = arithmeticMean ? geometricMean / arithmeticMean : 0;
        return {
            harmonicRichness: Math.max(0, Math.min(1, 1 - flatness))
        };
    }

    computeToneMetrics(spectrum, sampleRate) {
        if (!spectrum.length) {
            return { lowContour: 0, zeroCrossingRate: 0 };
        }
        const nyquist = sampleRate / 2;
        let lowEnergy = 0;
        let totalEnergy = 0;
        for (let bin = 0; bin < spectrum.length; bin++) {
            const freq = (bin / Math.max(1, spectrum.length - 1)) * nyquist;
            const magnitude = spectrum[bin] / 255;
            totalEnergy += magnitude;
            if (freq <= 250) {
                lowEnergy += magnitude;
            }
        }
        return {
            lowContour: totalEnergy ? Math.max(0, Math.min(1, lowEnergy / totalEnergy)) : 0
        };
    }

    buildCalibrationProfile({ buffer, mono, spectralMetrics, dynamicsMetrics, harmonicMetrics, toneMetrics }) {
        const targetScores = this.scoreTargets({
            brightness: spectralMetrics.brightness,
            harmonicRichness: harmonicMetrics.harmonicRichness,
            transientScore: dynamicsMetrics.transientScore,
            lowContour: toneMetrics.lowContour
        });
        const topTarget = Object.entries(targetScores).sort((a, b) => b[1] - a[1])[0][0];
        const waveformEnvelope = this.createWaveformEnvelope(mono, 128);
        const profile = {
            version: 1,
            id: `cal-${Date.now()}`,
            createdAt: new Date().toISOString(),
            inputDeviceId: this.getSelectedMicrophone(),
            inputDeviceLabel: this.getSelectedMicrophoneLabel(),
            noiseCancellationEnabled: this.isNoiseCancellationEnabled(),
            sampleRate: buffer.sampleRate,
            durationSeconds: this.recordedDurationSeconds || (buffer.length / buffer.sampleRate),
            waveformEnvelope,
            metrics: {
                frequencyRange: {
                    lowHz: spectralMetrics.lowHz,
                    highHz: spectralMetrics.highHz
                },
                selfNoiseDbfs: dynamicsMetrics.selfNoiseDbfs,
                avgLevelDbfs: dynamicsMetrics.avgLevelDbfs,
                peakLevelDbfs: dynamicsMetrics.peakLevelDbfs,
                dynamicRangeDb: dynamicsMetrics.dynamicRangeDb,
                crestFactorDb: dynamicsMetrics.crestFactorDb,
                spectralCentroidHz: spectralMetrics.centroidHz,
                brightness: spectralMetrics.brightness,
                harmonicRichness: harmonicMetrics.harmonicRichness,
                transientScore: dynamicsMetrics.transientScore,
                lowContour: toneMetrics.lowContour
            },
            recommendations: {
                topTarget,
                targetName: CALIBRATION_TARGET_SIGNATURES[topTarget].name,
                reason: CALIBRATION_TARGET_SIGNATURES[topTarget].description,
                scores: targetScores
            },
            controls: this.deriveAuraControls({
                brightness: spectralMetrics.brightness,
                harmonicRichness: harmonicMetrics.harmonicRichness,
                transientScore: dynamicsMetrics.transientScore,
                lowContour: toneMetrics.lowContour
            })
        };
        return profile;
    }

    scoreTargets(metrics) {
        const scores = {};
        Object.entries(CALIBRATION_TARGET_SIGNATURES).forEach(([targetId, signature]) => {
            const distance = (
                Math.abs(metrics.brightness - signature.brightness)
                + Math.abs(metrics.harmonicRichness - signature.richness)
                + Math.abs(metrics.transientScore - signature.transient)
                + Math.abs(metrics.lowContour - signature.lowContour)
            ) / 4;
            scores[targetId] = Math.max(55, Math.min(99, Math.round((1 - distance) * 100)));
        });
        return scores;
    }

    deriveAuraControls(metrics) {
        return {
            harmonicSynthesis: Math.round(35 + (metrics.harmonicRichness * 55)),
            transientShaping: Math.round(35 + (metrics.transientScore * 55)),
            spatialConvolution: Math.round(30 + ((1 - metrics.brightness) * 50)),
            adaptiveNoiseReduction: metrics.lowContour < 0.18 || metrics.harmonicRichness < 0.5,
            proximityEffectCorrection: metrics.lowContour > 0.18,
            roomAcousticCompensation: metrics.brightness < 0.32
        };
    }

    populateResults(profile) {
        this.setText('micNameValue', profile.inputDeviceLabel);
        this.setText('micCaptureSummary', `${profile.durationSeconds.toFixed(1)}s capture · ${profile.sampleRate} Hz · ${profile.noiseCancellationEnabled ? 'AURA noise cancellation on' : 'raw input path'}`);
        this.setText('resultFrequencyRange', `${Math.round(profile.metrics.frequencyRange.lowHz)} Hz - ${Math.round(profile.metrics.frequencyRange.highHz)} Hz`);
        this.setText('resultSelfNoise', `${profile.metrics.selfNoiseDbfs.toFixed(1)} dBFS`);
        this.setText('resultAverageLevel', `${profile.metrics.avgLevelDbfs.toFixed(1)} dBFS`);
        this.setText('resultPeakLevel', `${profile.metrics.peakLevelDbfs.toFixed(1)} dBFS`);
        this.setText('recommendedMicName', profile.recommendations.targetName);
        this.setText('recommendedMicReason', profile.recommendations.reason);

        const topScore = profile.recommendations.scores[profile.recommendations.topTarget];
        const circle = document.getElementById('recommendedScoreCircle');
        if (circle) {
            circle.setAttribute('stroke-dasharray', `${topScore}, 100`);
        }
        this.setText('recommendedScoreText', `${topScore}%`);
        this.setText('harmonicMatchValue', `${Math.round(profile.metrics.harmonicRichness * 100)}%`);
        this.setText('tonalBalanceValue', `${Math.round((1 - Math.abs(profile.metrics.brightness - CALIBRATION_TARGET_SIGNATURES[profile.recommendations.topTarget].brightness)) * 100)}%`);
        this.setText('transientResponseValue', `${Math.round(profile.metrics.transientScore * 100)}%`);
    }

    resetAnalysisProgress() {
        ['freq', 'trans', 'harm', 'spat', 'dsp'].forEach((key, index) => {
            const fill = document.getElementById(`${key}Progress`);
            const status = document.getElementById(`${key}Status`);
            if (fill) fill.style.width = '0%';
            if (status) {
                status.textContent = index === 0 ? 'Waiting...' : 'Waiting...';
                status.style.color = '';
            }
        });
    }

    markProgressActive(key, label) {
        const fill = document.getElementById(`${key}Progress`);
        const status = document.getElementById(`${key}Status`);
        if (fill) fill.style.width = '55%';
        if (status) {
            status.textContent = label;
            status.style.color = 'var(--accent)';
        }
    }

    completeProgress(key, label) {
        const fill = document.getElementById(`${key}Progress`);
        const status = document.getElementById(`${key}Status`);
        if (fill) fill.style.width = '100%';
        if (status) {
            status.textContent = label;
            status.style.color = 'var(--accent-success)';
        }
    }

    computeRms(samples) {
        if (!samples?.length) return 0;
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
            sum += samples[i] * samples[i];
        }
        return Math.sqrt(sum / samples.length);
    }

    computePeak(samples) {
        let peak = 0;
        for (let i = 0; i < samples.length; i++) {
            const abs = Math.abs(samples[i]);
            if (abs > peak) peak = abs;
        }
        return peak;
    }

    computeWindowRms(samples, windowSize) {
        const values = [];
        if (!samples?.length) return values;
        for (let start = 0; start < samples.length; start += windowSize) {
            const end = Math.min(samples.length, start + windowSize);
            let sum = 0;
            for (let i = start; i < end; i++) {
                sum += samples[i] * samples[i];
            }
            values.push(Math.sqrt(sum / Math.max(1, end - start)));
        }
        return values;
    }

    percentile(values, percentile) {
        if (!values?.length) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const position = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(position);
        const upper = Math.ceil(position);
        if (lower === upper) return sorted[lower];
        const weight = position - lower;
        return (sorted[lower] * (1 - weight)) + (sorted[upper] * weight);
    }

    createWaveformEnvelope(samples, bucketCount) {
        const envelope = [];
        if (!samples?.length || !bucketCount) return envelope;
        const bucketSize = Math.max(1, Math.floor(samples.length / bucketCount));
        for (let bucket = 0; bucket < bucketCount; bucket++) {
            const start = bucket * bucketSize;
            const end = bucket === bucketCount - 1 ? samples.length : Math.min(samples.length, start + bucketSize);
            let peak = 0;
            for (let i = start; i < end; i++) {
                const magnitude = Math.abs(samples[i]);
                if (magnitude > peak) peak = magnitude;
            }
            envelope.push(peak);
        }
        return envelope;
    }

    linearToDbfs(value) {
        if (!value || value <= 0) return -Infinity;
        return 20 * Math.log10(value);
    }

    pickSupportedMimeType() {
        if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
            return '';
        }
        const candidates = [
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus',
            'audio/mp4'
        ];
        for (let i = 0; i < candidates.length; i++) {
            if (MediaRecorder.isTypeSupported(candidates[i])) {
                return candidates[i];
            }
        }
        return '';
    }

    async yieldToUi() {
        await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    }

    setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calibrationApp = new CalibrationApp();
});
