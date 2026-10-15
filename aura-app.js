const AURA_CALIBRATION_STORAGE_KEY = 'titanAuraCalibration.v1';
const AURA_PROFILES_STORAGE_KEY = 'titanAuraProfiles.v1';
const AURA_ACTIVE_PROFILE_KEY = 'titanAuraActiveProfile.v1';
const AURA_SELECTED_MIC_KEY = 'titanAuraSelectedMic.v1';

const DEFAULT_AURA_SETTINGS = {
    harmonicSynthesis: 60,
    transientShaping: 55,
    spatialConvolution: 50,
    adaptiveNoiseReduction: true,
    proximityEffectCorrection: true,
    roomAcousticCompensation: false
};

const TARGET_SIGNATURES = {
    vintagetube: {
        name: 'Vintage Tube',
        brightness: 0.35,
        richness: 0.82,
        transient: 0.58,
        lowContour: 0.74,
        description: 'Warm vocal weight with tube-style harmonic density.'
    },
    studiofet: {
        name: 'Studio FET',
        brightness: 0.46,
        richness: 0.68,
        transient: 0.63,
        lowContour: 0.55,
        description: 'Balanced studio presence with controlled low end.'
    },
    modernair: {
        name: 'Modern Air',
        brightness: 0.72,
        richness: 0.62,
        transient: 0.78,
        lowContour: 0.42,
        description: 'Forward detail, air, and modern top-end clarity.'
    },
    silkytube: {
        name: 'Silky Tube',
        brightness: 0.58,
        richness: 0.76,
        transient: 0.64,
        lowContour: 0.52,
        description: 'Silky highs with polished harmonic smoothness.'
    },
    cleardetail: {
        name: 'Clear Detail',
        brightness: 0.49,
        richness: 0.54,
        transient: 0.74,
        lowContour: 0.38,
        description: 'Detailed, flatter response suited to clean capture.'
    }
};

class AURAApp {
    constructor() {
        this.currentTarget = 'vintagetube';
        this.currentSection = 'enhancement';
        this.isBypassed = false;
        this.calibrationProfile = this.loadCalibrationProfile();
        this.savedProfiles = this.loadSavedProfiles();
        this.activeProfile = this.loadActiveProfile();
        this.compareBaseEnvelope = this.calibrationProfile?.waveformEnvelope || [];
        this.compareEditedEnvelope = [];
        this.monitorContext = null;
        this.monitorStream = null;
        this.monitorSource = null;
        this.monitorAnalyser = null;
        this.monitorAnimationFrame = null;
        this.liveEnvelope = [];
        this.backendDetails = {
            backend: 'Unavailable',
            latency: '--',
            sampleRate: '--'
        };
        this.init();
    }

    async init() {
        this.bindEvents();
        this.applyCalibrationState();
        this.renderProfiles();
        this.renderBackendStatus();
        await this.loadMicrophones();
        await this.startMonitoring();
        this.drawCompareWaveforms();
        this.addBotMessage(this.calibrationProfile
            ? `Loaded calibration for ${this.calibrationProfile.inputDeviceLabel}. ${TARGET_SIGNATURES[this.currentTarget]?.name || this.currentTarget} is currently the best measured target match.`
            : 'Connect a microphone or run calibration to populate AURA with measured response data.');
        window.addEventListener('beforeunload', () => {
            this.cleanupMonitor();
        });
    }

    bindEvents() {
        document.querySelectorAll('.aura-slider').forEach((slider) => {
            slider.addEventListener('input', (e) => {
                const target = e.target;
                if (!target) return;
                const parent = target.parentElement;
                if (!parent) return;
                const valueSpan = parent.querySelector('.slider-value');
                if (valueSpan) {
                    valueSpan.textContent = `${target.value}%`;
                }
                this.persistActiveProfileState();
                this.drawCompareWaveforms();
            });
        });

        document.querySelectorAll('.processing-section .toggle-control input[type="checkbox"]').forEach((toggle) => {
            toggle.addEventListener('change', () => {
                this.persistActiveProfileState();
                this.drawCompareWaveforms();
            });
        });

        document.getElementById('inputMicSelect')?.addEventListener('change', async (e) => {
            const select = e.target;
            if (!select) return;
            localStorage.setItem(AURA_SELECTED_MIC_KEY, select.value || '');
            await this.startMonitoring();
            this.addBotMessage(`Monitoring switched to ${select.options[select.selectedIndex]?.textContent || 'the selected microphone'}.`);
        });

        document.querySelectorAll('#auraNav .nav-btn[data-section]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                if (target && target.dataset.section) {
                    this.switchSection(target.dataset.section, target);
                }
            });
        });

        document.querySelectorAll('.target-card').forEach((card) => {
            card.addEventListener('click', () => {
                if (card.dataset.target) {
                    this.selectTarget(card.dataset.target);
                }
            });
        });

        document.getElementById('applyAura')?.addEventListener('click', () => {
            this.applyEnhancement();
        });

        document.getElementById('bypassAura')?.addEventListener('click', () => {
            this.toggleBypass();
        });

        document.getElementById('saveProfileBtn')?.addEventListener('click', () => {
            this.saveProfile();
        });

        document.getElementById('btnBackToDAW')?.addEventListener('click', () => {
            this.cleanupMonitor();
            window.location.href = 'index.html';
        });

        document.getElementById('calibrateBtn')?.addEventListener('click', () => {
            this.cleanupMonitor();
            this.startCalibration();
        });

        document.querySelectorAll('[data-edit]').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (btn.dataset.edit) {
                    this.handleEditTool(btn.dataset.edit);
                }
            });
        });

        document.getElementById('profilesList')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn || !btn.dataset.profile) return;
            if (btn.classList.contains('load')) {
                this.loadProfile(btn.dataset.profile);
                return;
            }
            if (btn.classList.contains('delete')) {
                this.deleteProfile(btn.dataset.profile);
            }
        });

        document.getElementById('botHeader')?.addEventListener('click', (e) => {
            if (!(e.target).closest('button')) {
                this.toggleBot();
            }
        });
        document.getElementById('botToggleBtn')?.addEventListener('click', () => {
            this.toggleBot();
        });

        document.getElementById('botSendBtn')?.addEventListener('click', () => {
            this.sendBotMessage();
        });
        document.getElementById('botInputText')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendBotMessage();
            }
        });
    }

    switchSection(section, btn) {
        this.currentSection = section;
        document.querySelectorAll('#auraNav .nav-btn[data-section]').forEach((b) => {
            b.classList.remove('active');
        });
        if (btn) btn.classList.add('active');

        document.querySelectorAll('.section-content').forEach((el) => {
            el.style.display = 'none';
        });

        const sectionMap = {
            enhancement: 'section-enhancement',
            comparison: 'section-comparison',
            profiles: 'section-profiles'
        };

        const target = document.querySelector(`.${sectionMap[section]}`);
        if (target) target.style.display = 'flex';

        if (section === 'comparison') {
            this.drawCompareWaveforms();
        }
    }

    selectTarget(targetId) {
        document.querySelectorAll('.target-card').forEach((card) => {
            card.classList.remove('selected');
        });
        const selectedCard = document.querySelector(`[data-target="${targetId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        this.currentTarget = targetId;
        this.persistActiveProfileState();
        this.drawCompareWaveforms();
        this.addBotMessage(`Target switched to ${this.getTargetName(targetId)}. The compare view now reflects that response contour.`);
    }

    getTargetName(targetId) {
        return TARGET_SIGNATURES[targetId]?.name || targetId;
    }

    startCalibration() {
        window.location.href = 'calibration.html';
    }

    applyEnhancement() {
        this.isBypassed = false;
        const button = document.getElementById('applyAura');
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-check"></i> Applied Enhancement';
        }
        const bypass = document.getElementById('bypassAura');
        if (bypass) {
            bypass.classList.remove('active');
            bypass.innerHTML = '<i class="fas fa-power-off"></i> Bypass';
        }
        this.persistActiveProfileState();
        this.drawCompareWaveforms();
        this.addBotMessage(`Applied ${this.getTargetName(this.currentTarget)} settings to the current AURA profile using measured mic data and the current control values.`);
    }

    toggleBypass() {
        const btn = document.getElementById('bypassAura');
        this.isBypassed = !this.isBypassed;
        if (btn) {
            btn.classList.toggle('active', this.isBypassed);
            btn.innerHTML = this.isBypassed
                ? '<i class="fas fa-check"></i> Bypassed'
                : '<i class="fas fa-power-off"></i> Bypass';
        }
        this.persistActiveProfileState();
        this.drawCompareWaveforms();
        this.addBotMessage(this.isBypassed
            ? 'AURA processing is bypassed. Compare view now shows the raw measured envelope without enhancement.'
            : 'AURA processing is active again.');
    }

    handleEditTool(tool) {
        const source = this.getEditableEnvelope();
        if (!source.length) {
            this.addBotMessage('Run calibration or enable live monitoring first so there is waveform data to edit.');
            return;
        }
        const edited = [...source];
        switch (tool) {
        case 'trim':
            edited.splice(0, Math.floor(edited.length * 0.1));
            edited.splice(Math.floor(edited.length * 0.8));
            break;
        case 'normalize': {
            const max = Math.max(...edited, 0.0001);
            for (let i = 0; i < edited.length; i++) edited[i] = Math.min(1, edited[i] / max);
            break;
        }
        case 'gain':
            for (let i = 0; i < edited.length; i++) edited[i] = Math.min(1, edited[i] * 1.15);
            break;
        case 'fadein':
            for (let i = 0; i < edited.length; i++) edited[i] *= i / Math.max(1, edited.length - 1);
            break;
        case 'fadeout':
            for (let i = 0; i < edited.length; i++) edited[i] *= 1 - (i / Math.max(1, edited.length - 1));
            break;
        case 'mute':
            for (let i = 0; i < edited.length; i++) edited[i] = 0;
            break;
        default:
            return;
        }
        this.compareEditedEnvelope = this.resampleEnvelope(edited, 96);
        this.drawCompareWaveforms();
        this.addBotMessage(`${tool.replace(/in|out/, (part) => part === 'in' ? ' in' : ' out').replace(/^./, (c) => c.toUpperCase())} applied to the comparison waveform preview.`);
    }

    saveProfile() {
        const timestamp = new Date();
        const targetName = this.getTargetName(this.currentTarget);
        const name = `${targetName} ${timestamp.toLocaleString()}`;
        const settings = this.collectCurrentSettings();
        const profileId = `profile-${timestamp.getTime()}`;
        const profile = {
            id: profileId,
            name,
            targetId: this.currentTarget,
            targetName,
            createdAt: timestamp.toISOString(),
            inputDeviceId: document.getElementById('inputMicSelect')?.value || this.calibrationProfile?.inputDeviceId || '',
            inputDeviceLabel: this.getSelectedMicrophoneLabel(),
            settings,
            metrics: this.calibrationProfile?.metrics || null,
            waveformEnvelope: this.getEditableEnvelope(),
            targetScores: this.calibrationProfile?.recommendations?.scores || null
        };
        this.savedProfiles = [profile, ...this.savedProfiles.filter((item) => item.id !== profileId)];
        this.persistSavedProfiles();
        this.renderProfiles();
        this.addBotMessage(`Saved a new AURA profile for ${targetName}.`);
    }

    loadProfile(profileId) {
        const profile = this.savedProfiles.find((item) => item.id === profileId);
        if (!profile) return;
        this.currentTarget = profile.targetId || this.currentTarget;
        this.applySettings(profile.settings || DEFAULT_AURA_SETTINGS);
        this.selectTarget(this.currentTarget);
        this.compareEditedEnvelope = this.resampleEnvelope(profile.waveformEnvelope || this.compareBaseEnvelope || [], 96);
        this.activeProfile = {
            id: profile.id,
            source: 'saved-profile',
            targetId: this.currentTarget,
            settings: this.collectCurrentSettings(),
            bypassed: this.isBypassed,
            inputDeviceId: profile.inputDeviceId || '',
            inputDeviceLabel: profile.inputDeviceLabel || ''
        };
        this.persistActiveProfileState();
        this.drawCompareWaveforms();
        this.addBotMessage(`Loaded saved profile "${profile.name}".`);
    }

    deleteProfile(profileId) {
        const before = this.savedProfiles.length;
        this.savedProfiles = this.savedProfiles.filter((item) => item.id !== profileId);
        if (this.savedProfiles.length === before) return;
        this.persistSavedProfiles();
        this.renderProfiles();
        this.addBotMessage('Deleted the selected AURA profile.');
    }

    async loadMicrophones() {
        const select = document.getElementById('inputMicSelect');
        if (!select) return;

        try {
            const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            probe.getTracks().forEach((track) => track.stop());

            const microphones = devices.filter((device) => device.kind === 'audioinput');
            select.innerHTML = '';
            if (!microphones.length) {
                select.innerHTML = '<option value="">No microphone detected</option>';
                select.disabled = true;
                return;
            }

            const preferredId = localStorage.getItem(AURA_SELECTED_MIC_KEY)
                || this.activeProfile?.inputDeviceId
                || this.calibrationProfile?.inputDeviceId
                || '';

            microphones.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label?.trim() || `Microphone ${index + 1}`;
                if ((preferredId && device.deviceId === preferredId) || (!preferredId && index === 0)) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
            select.disabled = false;
        } catch (err) {
            console.error('Failed to load microphones for AURA:', err);
            select.innerHTML = '<option value="">Microphone access denied</option>';
            select.disabled = true;
            this.addBotMessage('A microphone permission grant is required before AURA can monitor or calibrate live input.');
        }
    }

    async startMonitoring() {
        const select = document.getElementById('inputMicSelect');
        if (!select || select.disabled || !select.value) {
            await this.cleanupMonitor();
            this.updateInputMetrics(null);
            this.drawFrequencyResponse([]);
            return;
        }

        try {
            await this.cleanupMonitor();
            this.monitorStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: select.value ? { ideal: select.value } : undefined,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            this.monitorContext = new (window.AudioContext || window.webkitAudioContext)({
                latencyHint: 'interactive'
            });
            await this.monitorContext.resume();
            this.monitorSource = this.monitorContext.createMediaStreamSource(this.monitorStream);
            this.monitorAnalyser = this.monitorContext.createAnalyser();
            this.monitorAnalyser.fftSize = 2048;
            this.monitorAnalyser.smoothingTimeConstant = 0.7;
            this.monitorSource.connect(this.monitorAnalyser);

            this.backendDetails = {
                backend: this.detectBackendName(),
                latency: `${((this.monitorContext.baseLatency || 0) * 1000).toFixed(2)} ms`,
                sampleRate: `${this.monitorContext.sampleRate} Hz`
            };
            this.renderBackendStatus();
            this.monitorLoop();
        } catch (err) {
            console.error('Failed to start AURA monitoring:', err);
            this.cleanupMonitor();
            this.addBotMessage('AURA could not start live monitoring for the selected device.');
        }
    }

    monitorLoop() {
        if (!this.monitorAnalyser) return;
        const timeData = new Float32Array(this.monitorAnalyser.fftSize);
        const frequencyData = new Uint8Array(this.monitorAnalyser.frequencyBinCount);

        const render = () => {
            if (!this.monitorAnalyser) return;
            this.monitorAnalyser.getFloatTimeDomainData(timeData);
            this.monitorAnalyser.getByteFrequencyData(frequencyData);
            this.liveEnvelope = this.createEnvelopeFromSamples(timeData, 96);
            this.updateInputMetrics(timeData);
            this.drawFrequencyResponse(frequencyData);
            if (this.currentSection === 'comparison' && !this.compareBaseEnvelope.length) {
                this.drawCompareWaveforms();
            }
            this.monitorAnimationFrame = requestAnimationFrame(render);
        };

        render();
    }

    async cleanupMonitor() {
        if (this.monitorAnimationFrame) {
            cancelAnimationFrame(this.monitorAnimationFrame);
            this.monitorAnimationFrame = null;
        }
        if (this.monitorSource) {
            try { this.monitorSource.disconnect(); } catch (err) { console.error(err); }
            this.monitorSource = null;
        }
        if (this.monitorStream) {
            this.monitorStream.getTracks().forEach((track) => track.stop());
            this.monitorStream = null;
        }
        if (this.monitorContext && this.monitorContext.state !== 'closed') {
            try { await this.monitorContext.close(); } catch (err) { console.error(err); }
        }
        this.monitorContext = null;
        this.monitorAnalyser = null;
        this.backendDetails = {
            backend: 'Unavailable',
            latency: '--',
            sampleRate: '--'
        };
        this.renderBackendStatus();
    }

    updateInputMetrics(samples) {
        const leftMeter = document.querySelector('#inputMeterL .meter-fill');
        const rightMeter = document.querySelector('#inputMeterR .meter-fill');
        const peakEl = document.getElementById('peakValue');
        const rmsEl = document.getElementById('rmsValue');
        if (!samples || !samples.length) {
            if (leftMeter) leftMeter.style.height = '0%';
            if (rightMeter) rightMeter.style.height = '0%';
            if (peakEl) peakEl.textContent = 'Peak: --';
            if (rmsEl) rmsEl.textContent = 'RMS: --';
            return;
        }

        let peak = 0;
        let sumSquares = 0;
        for (let i = 0; i < samples.length; i++) {
            const sample = samples[i];
            const abs = Math.abs(sample);
            if (abs > peak) peak = abs;
            sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / samples.length);
        const peakDb = this.linearToDbfs(peak);
        const rmsDb = this.linearToDbfs(rms);
        const meterHeight = Math.max(3, Math.min(100, (peak || 0) * 100));

        if (leftMeter) leftMeter.style.height = `${meterHeight}%`;
        if (rightMeter) rightMeter.style.height = `${Math.max(3, meterHeight * 0.97)}%`;
        if (peakEl) peakEl.textContent = `Peak: ${Number.isFinite(peakDb) ? `${peakDb.toFixed(1)} dBFS` : '--'}`;
        if (rmsEl) rmsEl.textContent = `RMS: ${Number.isFinite(rmsDb) ? `${rmsDb.toFixed(1)} dBFS` : '--'}`;
    }

    drawFrequencyResponse(frequencyData) {
        const canvas = document.getElementById('inputFrequencyResponse');
        if (!canvas || typeof canvas.getContext !== 'function') return;
        const ctx = canvas.getContext('2d');
        if (!ctx || typeof ctx.clearRect !== 'function' || typeof ctx.beginPath !== 'function') return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(110, 110, 128, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        if (!frequencyData || !frequencyData.length) return;

        const gradient = typeof ctx.createLinearGradient === 'function'
            ? ctx.createLinearGradient(0, 0, width, 0)
            : null;
        if (gradient && typeof gradient.addColorStop === 'function') {
            gradient.addColorStop(0, '#ff6b9d');
            gradient.addColorStop(0.5, '#7c5cff');
            gradient.addColorStop(1, '#00d4ff');
            ctx.strokeStyle = gradient;
        } else {
            ctx.strokeStyle = '#ff6b9d';
        }
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
            const binIndex = Math.min(
                frequencyData.length - 1,
                Math.floor((x / Math.max(1, width - 1)) * (frequencyData.length - 1))
            );
            const magnitude = frequencyData[binIndex] / 255;
            const y = height - (magnitude * (height - 12)) - 6;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    drawCompareWaveforms() {
        const raw = this.getEditableEnvelope();
        const processed = this.isBypassed ? raw : this.applyProcessingToEnvelope(raw);
        const target = this.generateTargetEnvelope(raw);
        const difference = processed.map((value, index) => Math.abs(value - (target[index] || 0)));
        const canvases = document.querySelectorAll('.compare-waveform');
        const dataSets = [raw, processed, target, difference];
        const colors = ['#00d4ff', '#ff6b9d', '#7c5cff', '#22c55e'];
        canvases.forEach((canvas, index) => {
            this.drawEnvelopeBars(canvas, dataSets[index] || [], colors[index]);
        });
    }

    drawEnvelopeBars(canvas, envelope, color) {
        if (!canvas || typeof canvas.getContext !== 'function') return;
        const ctx = canvas.getContext('2d');
        if (!ctx || typeof ctx.clearRect !== 'function' || typeof ctx.fillRect !== 'function') return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        if (!envelope.length) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(0, height / 2 - 1, width, 2);
            return;
        }

        const bars = envelope.length;
        const barWidth = Math.max(1, width / (bars * 1.4));
        const gap = barWidth * 0.4;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.78;
        for (let i = 0; i < bars; i++) {
            const value = Math.max(0.02, Math.min(1, envelope[i]));
            const barHeight = value * height * 0.9;
            const x = i * (barWidth + gap);
            const y = (height - barHeight) / 2;
            ctx.fillRect(x, y, barWidth, barHeight);
        }
        ctx.globalAlpha = 1;
    }

    applyCalibrationState() {
        const activeSettings = this.activeProfile?.settings || this.calibrationProfile?.controls || DEFAULT_AURA_SETTINGS;
        this.applySettings(activeSettings);
        this.currentTarget = this.activeProfile?.targetId
            || this.calibrationProfile?.recommendations?.topTarget
            || this.currentTarget;
        this.isBypassed = !!this.activeProfile?.bypassed;
        this.selectTarget(this.currentTarget);
        this.updateBypassButton();
        this.compareBaseEnvelope = this.calibrationProfile?.waveformEnvelope || [];
        this.compareEditedEnvelope = this.resampleEnvelope(
            this.activeProfile?.waveformEnvelope || this.compareBaseEnvelope || this.liveEnvelope,
            96
        );
        this.updateMeasuredCharacteristics();
        this.updateTargetMatches();
    }

    updateMeasuredCharacteristics() {
        const metrics = this.calibrationProfile?.metrics;
        const freqValue = document.getElementById('freqRangeValue');
        const noiseValue = document.getElementById('selfNoiseValue');
        const dynamicValue = document.getElementById('dynamicRangeValue');
        if (!metrics) {
            if (freqValue) freqValue.textContent = '--';
            if (noiseValue) noiseValue.textContent = '--';
            if (dynamicValue) dynamicValue.textContent = '--';
            return;
        }
        if (freqValue) {
            freqValue.textContent = `${Math.round(metrics.frequencyRange.lowHz)} Hz - ${Math.round(metrics.frequencyRange.highHz)} Hz`;
        }
        if (noiseValue) {
            noiseValue.textContent = `${metrics.selfNoiseDbfs.toFixed(1)} dBFS`;
        }
        if (dynamicValue) {
            dynamicValue.textContent = `${metrics.dynamicRangeDb.toFixed(1)} dB`;
        }
    }

    updateTargetMatches() {
        const scores = this.calibrationProfile?.recommendations?.scores || this.estimateTargetScoresFromMetrics();
        document.querySelectorAll('.target-card').forEach((card) => {
            const targetId = card.dataset.target;
            const score = scores[targetId] || 0;
            const fill = card.querySelector('.match-fill');
            const label = card.querySelector('.match-value');
            if (fill) fill.style.width = `${score}%`;
            if (label) label.textContent = `${score}%`;
        });
    }

    renderProfiles() {
        const container = document.getElementById('profilesList');
        if (!container) return;
        if (!this.savedProfiles.length) {
            container.innerHTML = `
                <div class="profile-card">
                    <div class="profile-info">
                        <h3>No saved profiles yet</h3>
                        <p>Apply or calibrate AURA, then save a profile to reuse measured settings later.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.savedProfiles.map((profile) => `
            <div class="profile-card" data-profile-id="${profile.id}">
                <div class="profile-info">
                    <h3>${this.escapeHtml(profile.name)}</h3>
                    <p>${this.escapeHtml(profile.targetName || this.getTargetName(profile.targetId))} · ${this.escapeHtml(profile.inputDeviceLabel || 'Unknown input')}</p>
                    <span class="profile-date">Saved ${new Date(profile.createdAt).toLocaleString()}</span>
                </div>
                <div class="profile-actions">
                    <button class="profile-btn load" data-profile="${profile.id}"><i class="fas fa-upload"></i> Load</button>
                    <button class="profile-btn delete" data-profile="${profile.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }

    renderBackendStatus() {
        const backend = document.getElementById('backendValue');
        const latency = document.getElementById('latencyValue');
        const sampleRate = document.getElementById('sampleRateValue');
        if (backend) backend.textContent = this.backendDetails.backend;
        if (latency) latency.textContent = this.backendDetails.latency;
        if (sampleRate) sampleRate.textContent = this.backendDetails.sampleRate;
    }

    updateBypassButton() {
        const btn = document.getElementById('bypassAura');
        if (!btn) return;
        btn.classList.toggle('active', this.isBypassed);
        btn.innerHTML = this.isBypassed
            ? '<i class="fas fa-check"></i> Bypassed'
            : '<i class="fas fa-power-off"></i> Bypass';
    }

    collectCurrentSettings() {
        const sliders = Array.from(document.querySelectorAll('.aura-slider')).map((slider) => parseInt(slider.value || '0', 10));
        const toggles = Array.from(document.querySelectorAll('.processing-section .toggle-control input[type="checkbox"]'));
        const pickSlider = (index, fallback) => Number.isFinite(sliders[index]) ? sliders[index] : fallback;
        return {
            harmonicSynthesis: pickSlider(0, DEFAULT_AURA_SETTINGS.harmonicSynthesis),
            transientShaping: pickSlider(1, DEFAULT_AURA_SETTINGS.transientShaping),
            spatialConvolution: pickSlider(2, DEFAULT_AURA_SETTINGS.spatialConvolution),
            adaptiveNoiseReduction: toggles[0] ? !!toggles[0].checked : DEFAULT_AURA_SETTINGS.adaptiveNoiseReduction,
            proximityEffectCorrection: toggles[1] ? !!toggles[1].checked : DEFAULT_AURA_SETTINGS.proximityEffectCorrection,
            roomAcousticCompensation: toggles[2] ? !!toggles[2].checked : DEFAULT_AURA_SETTINGS.roomAcousticCompensation
        };
    }

    applySettings(settings) {
        const merged = { ...DEFAULT_AURA_SETTINGS, ...(settings || {}) };
        const sliders = document.querySelectorAll('.aura-slider');
        [merged.harmonicSynthesis, merged.transientShaping, merged.spatialConvolution].forEach((value, index) => {
            const slider = sliders[index];
            if (!slider) return;
            slider.value = value;
            const valueSpan = slider.parentElement?.querySelector('.slider-value');
            if (valueSpan) valueSpan.textContent = `${value}%`;
        });
        const toggles = document.querySelectorAll('.processing-section .toggle-control input[type="checkbox"]');
        if (toggles[0]) toggles[0].checked = !!merged.adaptiveNoiseReduction;
        if (toggles[1]) toggles[1].checked = !!merged.proximityEffectCorrection;
        if (toggles[2]) toggles[2].checked = !!merged.roomAcousticCompensation;
    }

    persistSavedProfiles() {
        try {
            localStorage.setItem(AURA_PROFILES_STORAGE_KEY, JSON.stringify(this.savedProfiles));
        } catch (err) {
            console.error('Failed to store saved AURA profiles:', err);
        }
    }

    persistActiveProfileState() {
        this.activeProfile = {
            id: this.activeProfile?.id || `active-${Date.now()}`,
            source: this.activeProfile?.source || 'aura',
            targetId: this.currentTarget,
            settings: this.collectCurrentSettings(),
            bypassed: this.isBypassed,
            inputDeviceId: document.getElementById('inputMicSelect')?.value || '',
            inputDeviceLabel: this.getSelectedMicrophoneLabel(),
            waveformEnvelope: this.getEditableEnvelope()
        };
        try {
            localStorage.setItem(AURA_ACTIVE_PROFILE_KEY, JSON.stringify(this.activeProfile));
        } catch (err) {
            console.error('Failed to store active AURA profile:', err);
        }
    }

    loadCalibrationProfile() {
        return this.readJsonStorage(AURA_CALIBRATION_STORAGE_KEY, null);
    }

    loadSavedProfiles() {
        const data = this.readJsonStorage(AURA_PROFILES_STORAGE_KEY, []);
        return Array.isArray(data) ? data : [];
    }

    loadActiveProfile() {
        return this.readJsonStorage(AURA_ACTIVE_PROFILE_KEY, null);
    }

    readJsonStorage(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (err) {
            console.error(`Failed to parse storage key ${key}:`, err);
            return fallback;
        }
    }

    getEditableEnvelope() {
        if (this.compareEditedEnvelope?.length) {
            return this.resampleEnvelope(this.compareEditedEnvelope, 96);
        }
        if (this.compareBaseEnvelope?.length) {
            return this.resampleEnvelope(this.compareBaseEnvelope, 96);
        }
        if (this.liveEnvelope?.length) {
            return this.resampleEnvelope(this.liveEnvelope, 96);
        }
        return [];
    }

    applyProcessingToEnvelope(rawEnvelope) {
        if (!rawEnvelope.length) return [];
        const settings = this.collectCurrentSettings();
        const target = TARGET_SIGNATURES[this.currentTarget] || TARGET_SIGNATURES.vintagetube;
        const richnessBoost = settings.harmonicSynthesis / 100;
        const transientBoost = settings.transientShaping / 100;
        const spatialBoost = settings.spatialConvolution / 100;
        const roomFactor = settings.roomAcousticCompensation ? 1.08 : 1;
        const denoiseFactor = settings.adaptiveNoiseReduction ? 0.9 : 1;

        return rawEnvelope.map((value, index, list) => {
            const previous = list[Math.max(0, index - 1)] || value;
            const delta = value - previous;
            const harmonicGain = 1 + (richnessBoost * target.richness * 0.22);
            const transientGain = 1 + Math.max(0, delta) * transientBoost * target.transient;
            const spaceCurve = 1 + (Math.sin((index / Math.max(1, list.length - 1)) * Math.PI) * spatialBoost * target.lowContour * 0.08);
            const processed = value * harmonicGain * transientGain * spaceCurve * roomFactor * denoiseFactor;
            return Math.max(0, Math.min(1, processed));
        });
    }

    generateTargetEnvelope(rawEnvelope) {
        if (!rawEnvelope.length) return [];
        const target = TARGET_SIGNATURES[this.currentTarget] || TARGET_SIGNATURES.vintagetube;
        return rawEnvelope.map((value, index, list) => {
            const position = index / Math.max(1, list.length - 1);
            const contour = 0.82 + (target.lowContour * 0.16) + (Math.sin(position * Math.PI) * target.richness * 0.1);
            const air = position > 0.65 ? 1 + (target.brightness - 0.45) * 0.15 : 1;
            return Math.max(0, Math.min(1, value * contour * air));
        });
    }

    estimateTargetScoresFromMetrics() {
        const metrics = this.calibrationProfile?.metrics;
        if (!metrics) {
            return Object.fromEntries(Object.keys(TARGET_SIGNATURES).map((id) => [id, id === this.currentTarget ? 75 : 70]));
        }

        const lowContour = Math.max(0, Math.min(1, 1 - metrics.brightness + Math.min(0.35, Math.abs(metrics.spectralCentroidHz - 2200) / 6000)));
        const normalized = {
            brightness: metrics.brightness,
            richness: metrics.harmonicRichness,
            transient: metrics.transientScore,
            lowContour
        };

        const scores = {};
        Object.entries(TARGET_SIGNATURES).forEach(([targetId, signature]) => {
            const distance = (
                Math.abs(normalized.brightness - signature.brightness)
                + Math.abs(normalized.richness - signature.richness)
                + Math.abs(normalized.transient - signature.transient)
                + Math.abs(normalized.lowContour - signature.lowContour)
            ) / 4;
            scores[targetId] = Math.max(55, Math.min(99, Math.round((1 - distance) * 100)));
        });
        return scores;
    }

    getSelectedMicrophoneLabel() {
        const select = document.getElementById('inputMicSelect');
        if (!select || !select.options?.length || select.selectedIndex < 0) return this.calibrationProfile?.inputDeviceLabel || 'Unknown input';
        return select.options[select.selectedIndex].textContent || 'Unknown input';
    }

    createEnvelopeFromSamples(samples, bucketCount) {
        const result = [];
        if (!samples?.length || !bucketCount) return result;
        const bucketSize = Math.max(1, Math.floor(samples.length / bucketCount));
        for (let i = 0; i < bucketCount; i++) {
            const start = i * bucketSize;
            const end = i === bucketCount - 1 ? samples.length : Math.min(samples.length, start + bucketSize);
            let peak = 0;
            for (let j = start; j < end; j++) {
                const magnitude = Math.abs(samples[j]);
                if (magnitude > peak) peak = magnitude;
            }
            result.push(peak);
        }
        return result;
    }

    resampleEnvelope(envelope, bucketCount) {
        if (!envelope?.length) return [];
        if (envelope.length === bucketCount) return [...envelope];
        const result = [];
        for (let i = 0; i < bucketCount; i++) {
            const position = (i / Math.max(1, bucketCount - 1)) * (envelope.length - 1);
            const left = Math.floor(position);
            const right = Math.min(envelope.length - 1, left + 1);
            const blend = position - left;
            result.push((envelope[left] * (1 - blend)) + (envelope[right] * blend));
        }
        return result;
    }

    linearToDbfs(value) {
        if (!value || value <= 0) return -Infinity;
        return 20 * Math.log10(value);
    }

    detectBackendName() {
        if (navigator.gpu) {
            return 'WebGPU';
        }
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return gl ? 'Web Audio + WebGL' : 'Web Audio';
    }

    addBotMessage(text) {
        const container = document.getElementById('botMessages');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'bot-message';
        div.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(text)}</p>
            </div>
            <span class="message-time">Just now</span>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    toggleBot() {
        document.getElementById('auraBot')?.classList.toggle('collapsed');
    }

    sendBotMessage() {
        const input = document.getElementById('botInputText');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const container = document.getElementById('botMessages');
        if (container) {
            const userMsg = document.createElement('div');
            userMsg.className = 'bot-message';
            userMsg.innerHTML = `
                <div class="message-content" style="background: var(--bg-card); border-left: 3px solid var(--accent);">
                    <p>${this.escapeHtml(text)}</p>
                </div>
                <span class="message-time" style="text-align:right">Just now</span>
            `;
            container.appendChild(userMsg);
            container.scrollTop = container.scrollHeight;
        }
        input.value = '';

        const metrics = this.calibrationProfile?.metrics;
        const settings = this.collectCurrentSettings();
        let reply = `Current target is ${this.getTargetName(this.currentTarget)} with harmonic synthesis at ${settings.harmonicSynthesis}%.`;
        if (/noise|denoise|reduction/i.test(text)) {
            reply = settings.adaptiveNoiseReduction
                ? 'Adaptive noise reduction is enabled, so AURA is biasing the preview toward lower noise-floor behavior.'
                : 'Adaptive noise reduction is currently disabled. Enable it if your measured self-noise is too high.';
        } else if (/target|match|recommend/i.test(text) && metrics) {
            const score = this.calibrationProfile?.recommendations?.scores?.[this.currentTarget] || this.estimateTargetScoresFromMetrics()[this.currentTarget];
            reply = `${this.getTargetName(this.currentTarget)} is scoring ${score}% against your measured response, with brightness ${Math.round(metrics.brightness * 100)}% and harmonic richness ${Math.round(metrics.harmonicRichness * 100)}%.`;
        } else if (/latency|backend|engine/i.test(text)) {
            reply = `AURA is running on ${this.backendDetails.backend} at ${this.backendDetails.sampleRate} with measured base latency ${this.backendDetails.latency}.`;
        } else if (/calibration|measured|analy/i.test(text) && metrics) {
            reply = `Your last calibration measured ${metrics.frequencyRange.lowHz.toFixed(0)}-${metrics.frequencyRange.highHz.toFixed(0)} Hz, self-noise ${metrics.selfNoiseDbfs.toFixed(1)} dBFS, and dynamic range ${metrics.dynamicRangeDb.toFixed(1)} dB.`;
        }
        this.addBotMessage(reply);
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
    window.auraApp = new AURAApp();
});




