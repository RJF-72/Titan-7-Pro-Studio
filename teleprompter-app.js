/* global indexedDB */

class PSTeleprompterApp {
    constructor() {
        this.isPlaying = false;
        this.isRecording = false;
        this.currentTime = 0;
        this.scrollSpeed = 5;
        this.masterVolume = 1;
        this.lyrics = '';
        this.lyricTiming = [];
        this.audioElement = null;
        this.audioFileInput = null;
        this.currentAudioFile = null;
        this.currentAudioUrl = null;
        this.autoScrollEnabled = true;
        this.transportBroadcastTimer = null;
        this.virtualTimer = null;
        this.virtualPlayStartTime = null;
        this.virtualStartTime = 0;
        this.recordStartTime = 0;
        this.recordingDuration = 0;
        this.isViewer = new URLSearchParams(window.location.search).get('role') === 'viewer';
        this.lastRemoteSourceId = null;
        this.init();
    }

    init() {
        try {
            console.log('[PSTeleprompterApp] Starting init sequence...');
            this.setupEventListeners();
            this.setupTabs();
            this.startPlaybackLoop();
            this.initializeDriverBindings();
            this.configureViewerMode();
            this.loadSession().then(() => {
                console.log('[PSTeleprompterApp] Session loaded, refreshing device list');
                this.refreshDeviceList();
            }).catch(err => {
                console.error('[PSTeleprompterApp] Error during loadSession:', err);
            });
            console.log('[PSTeleprompterApp] Init sequence completed successfully');
        } catch (globalError) {
            console.error('[PSTeleprompterApp] CRITICAL INIT FAILURE:', globalError);
            alert('Teleprompter failed to initialize: ' + globalError.message);
        }
    }

    setupEventListeners() {
        console.log('[PSTeleprompterApp] Initializing setupEventListeners...');
        
        document.getElementById('btnBackToDAW')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });

        this.audioFileInput = /** @type {HTMLInputElement} */ (document.getElementById('audioFileInput'));
        this.audioElement = /** @type {HTMLAudioElement} */ (document.getElementById('audioPlayer'));

        this.audioFileInput?.addEventListener('change', (e) => this.loadAudioFile(e));
        this.audioElement?.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton(true);
            this.broadcastTransportState();
        });
        this.audioElement?.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton(false);
            this.broadcastTransportState();
        });
        this.audioElement?.addEventListener('timeupdate', () => {
            this.currentTime = this.audioElement.currentTime * 1000;
            this.updateTimeDisplay();
            this.updateLyricsHighlighting();
        });
        this.audioElement?.addEventListener('ended', () => this.stop());
        this.audioElement?.addEventListener('loadedmetadata', () => {
            if (!this.lyricTiming.length && this.lyrics.trim()) {
                this.parseAndDisplayLyrics(this.lyrics);
            }
            this.updateAudioLoadedStatus(true);
        });

        this.audioElement?.addEventListener('error', () => {
            this.updateAudioLoadedStatus(false);
            this.pushBotMessage('Error loading audio file. Please try again.');
        });

        const masterVolumeInput = /** @type {HTMLInputElement} */ (document.getElementById('masterVolume'));
        masterVolumeInput?.addEventListener('input', (e) => {
            const target = /** @type {HTMLInputElement} */ (e.target);
            if (!this.audioElement) return;
            this.audioElement.volume = parseFloat(target.value);
            this.masterVolume = this.audioElement.volume;
            this.saveSession();
        });

        document.getElementById('tpPlay')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('tpStop')?.addEventListener('click', () => this.stop());
        document.getElementById('tpRewind')?.addEventListener('click', () => this.rewind());
        document.getElementById('tpRecord')?.addEventListener('click', () => this.toggleRecording());

        document.getElementById('panelToggle')?.addEventListener('click', () => this.togglePanel());

        const scrollSpeedInput = /** @type {HTMLInputElement} */ (document.getElementById('scrollSpeed'));
        scrollSpeedInput?.addEventListener('input', (e) => {
            const target = /** @type {HTMLInputElement} */ (e.target);
            this.scrollSpeed = parseInt(target.value || '5', 10) || 5;
            const valueEl = document.getElementById('scrollSpeedValue');
            if (valueEl) valueEl.textContent = String(this.scrollSpeed);
            this.saveSession();
        });

        const lyricsInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('lyricsInput'));
        lyricsInput?.addEventListener('input', (e) => {
            const target = /** @type {HTMLTextAreaElement} */ (e.target);
            this.lyrics = target.value;
            this.lyricTiming = [];
            this.parseAndDisplayLyrics(this.lyrics);
            this.saveSession();
        });

        document.getElementById('syncLyrics')?.addEventListener('click', async () => {
            await this.syncLyricsToAudio();
        });

        document.getElementById('autoScroll')?.addEventListener('click', () => {
            this.toggleAutoScroll();
        });

        const scanBtn = document.getElementById('scanDevices');
        if (scanBtn) {
            console.log('[PSTeleprompterApp] Successfully bound scanDevices event');
            scanBtn.addEventListener('mousedown', (e) => {
                console.log('[PSTeleprompterApp] Scan button MOUSE DOWN');
            });
            scanBtn.addEventListener('click', async (e) => {
                console.log('[PSTeleprompterApp] Scan button CLICKED');
                try {
                    await this.refreshDeviceList(true);
                } catch (err) {
                    console.error('[PSTeleprompterApp] Exception in scan click handler:', err);
                    this.pushBotMessage('Scan failed: ' + err.message);
                }
            });
        } else {
            console.error('[PSTeleprompterApp] Could not find scanDevices button in DOM');
        }

        document.getElementById('copySessionId')?.addEventListener('click', () => this.copySessionId());
        document.getElementById('inviteUser')?.addEventListener('click', () => this.copyInviteLink());
        document.getElementById('startRecording')?.addEventListener('click', () => this.toggleRecording());

        document.getElementById('availableDevices')?.addEventListener('click', (e) => {
            const action = e.target.closest('.device-action');
            if (action) {
                this.handleDeviceAction({ currentTarget: action });
            }
        });
    }

    initializeDriverBindings() {
        document.addEventListener('teleprompter:cast-data', (event) => {
            const detail = event.detail || {};
            this.applyCastPayload(detail.payload, detail.sourceId);
        });

        document.addEventListener('teleprompter:transport', (event) => {
            const detail = event.detail || {};
            this.applyRemoteTransport(detail);
        });

        document.addEventListener('teleprompter:participants', () => {
            void this.refreshDeviceList();
        });

        document.addEventListener('teleprompter:devices', (event) => {
            this.renderDevices(event.detail?.devices || []);
        });
    }

    configureViewerMode() {
        if (!this.isViewer) return;

        const input = /** @type {HTMLTextAreaElement} */ (document.getElementById('lyricsInput'));
        if (input) input.disabled = true;
        if (this.audioFileInput) this.audioFileInput.disabled = true;

        ['syncLyrics', 'inviteUser'].forEach((id) => {
            const button = document.getElementById(id);
            if (button) {
                button.setAttribute('disabled', 'true');
            }
        });

        const trackNameDisplay = document.getElementById('trackNameDisplay');
        if (trackNameDisplay) {
            trackNameDisplay.textContent = 'Viewer mode - waiting for host cast';
        }
    }

    setupTabs() {
        document.querySelectorAll('.panel-tab').forEach((tab) => {
            tab.addEventListener('click', (e) => {
                const target = /** @type {HTMLElement} */ (e.currentTarget);
                const tabName = target.dataset.tab;
                if (tabName) this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.panel-tab').forEach((tab) => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.querySelectorAll('.panel-tab-content').forEach((content) => content.classList.remove('active'));
        document.getElementById(`${tabName}Tab`)?.classList.add('active');
    }

    togglePlay() {
        // Viewers control their own local playback (the host broadcasts
        // transport force-syncs on top); broadcastTransportState() is a no-op
        // for viewers, so the previous early-return made this a dead button.
        if (this.isPlaying) {
            this.isPlaying = false;
            this.stopVirtualTimer();
            if (this.audioElement && this.audioElement.src) {
                this.audioElement.pause();
            }
            this.updatePlayButton(false);
            this.broadcastTransportState();
            return;
        }
        this.isPlaying = true;
        this.updatePlayButton(true);
        if (this.audioElement && this.audioElement.src) {
            void this.audioElement.play();
        } else {
            this.startVirtualTimer();
        }
        this.broadcastTransportState();
    }

    stop() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.stopVirtualTimer();
        if (this.audioElement && !this.isViewer) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        if (this.isRecording) {
            this.toggleRecording();
        }
        this.updatePlayButton(false);
        this.updateTimeDisplay();
        this.updateLyricsHighlighting();
        this.broadcastTransportState();
    }

    rewind() {
        if (this.audioElement && !this.isViewer) {
            this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - 5);
            this.currentTime = this.audioElement.currentTime * 1000;
        } else {
            this.currentTime = Math.max(0, this.currentTime - 5000);
        }
        this.updateTimeDisplay();
        this.updateLyricsHighlighting();
        this.broadcastTransportState();
    }

    startPlaybackLoop() {
        window.setInterval(() => {
            if (this.isPlaying && this.autoScrollEnabled) {
                this.autoScroll();
            }
        }, 100);

        this.transportBroadcastTimer = window.setInterval(() => {
            if (this.isPlaying) {
                this.broadcastTransportState();
            }
        }, 500);
    }

    startVirtualTimer() {
        this.virtualPlayStartTime = performance.now();
        this.virtualStartTime = this.currentTime;
        this.stopVirtualTimer();
        this.virtualTimer = window.setInterval(() => {
            if (!this.isPlaying) return;
            const elapsed = performance.now() - this.virtualPlayStartTime;
            this.currentTime = this.virtualStartTime + elapsed;
            this.updateTimeDisplay();
            this.updateLyricsHighlighting();
        }, 50);
    }

    stopVirtualTimer() {
        if (this.virtualTimer) {
            clearInterval(this.virtualTimer);
            this.virtualTimer = null;
        }
        this.virtualPlayStartTime = null;
    }

    updatePlayButton(playing) {
        const playBtn = document.getElementById('tpPlay');
        const icon = playBtn?.querySelector('i');
        if (!icon) return;
        icon.classList.toggle('fa-play', !playing);
        icon.classList.toggle('fa-pause', playing);
    }

    updateAudioLoadedStatus(isLoaded) {
        const display = document.getElementById('trackNameDisplay');
        if (!display) return;

        if (isLoaded) {
            display.classList.add('audio-loaded');
            display.style.color = 'var(--accent-success)';
        } else {
            display.classList.remove('audio-loaded');
            display.style.color = '';
        }
    }

    pushBotMessage(text) {
        const messages = document.getElementById('botMessages');
        if (!messages) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = 'bot-message';
        msgDiv.innerHTML = `
            <div class="message-bubble bot">
                <p>${text}</p>
            </div>
            <span class="message-time">Just now</span>
        `;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    updateTimeDisplay() {
        const totalSeconds = Math.floor(this.currentTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((this.currentTime % 1000) / 10);
        const display = document.getElementById('tpTimeDisplay');
        if (display) {
            display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;
        }
    }

    parseAndDisplayLyrics(rawLyrics, timingData = null) {
        const lyricsContainer = document.getElementById('lyricsContainer');
        if (!lyricsContainer) return;

        const normalizedLyrics = rawLyrics || '';
        const lines = normalizedLyrics.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
        const effectiveTiming = Array.isArray(timingData) && timingData.length
            ? timingData
            : this.lyricTiming.length
                ? this.lyricTiming
                : this.buildFallbackTiming(lines);

        this.lyricTiming = effectiveTiming;
        this.lyrics = lines.map((lineData, index) => lineData || lines[index] || '').join('\n');
        lyricsContainer.innerHTML = '';

        effectiveTiming.forEach((lineData, lineIndex) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'lyric-line';
            lineElement.dataset.time = String(Math.round(lineData.startTime));
            lineElement.dataset.lineIndex = String(lineIndex);

            lineData.words.forEach((wordData, wordIndex) => {
                const wordElement = document.createElement('span');
                wordElement.className = 'lyric-word';
                wordElement.textContent = `${wordData.word} `;
                wordElement.dataset.start = String(Math.round(wordData.start));
                wordElement.dataset.end = String(Math.round(wordData.end));
                wordElement.dataset.lineIndex = String(lineIndex);
                wordElement.dataset.wordIndex = String(wordIndex);
                lineElement.appendChild(wordElement);
            });

            lyricsContainer.appendChild(lineElement);
        });

        if (!effectiveTiming.length) {
            lyricsContainer.innerHTML = '<div class="lyric-line" data-time="0"><span class="lyric-word" data-start="0" data-end="0">Add lyrics to begin.</span></div>';
        }

        this.updateLyricsHighlighting();
    }

    buildFallbackTiming(lines) {
        const bpm = this.getBpm();
        const beatIntervalMs = 60000 / bpm;
        const durationMs = this.getReferenceDurationMs(lines, beatIntervalMs);
        const totalWords = Math.max(1, lines.reduce((sum, line) => sum + line.split(/\s+/).filter(Boolean).length, 0));
        let currentStart = 0;

        return lines.map((line) => {
            const words = line.split(/\s+/).filter(Boolean);
            const lineWeight = Math.max(1, words.length);
            const lineDuration = Math.max(
                beatIntervalMs,
                (durationMs * lineWeight) / totalWords
            );
            const wordDuration = lineDuration / Math.max(1, words.length);
            const wordTimings = words.map((word, index) => ({
                word,
                start: currentStart + (index * wordDuration),
                end: currentStart + ((index + 1) * wordDuration)
            }));
            const result = {
                line,
                words: wordTimings,
                startTime: currentStart
            };
            currentStart += lineDuration;
            return result;
        });
    }

    getReferenceDurationMs(lines, beatIntervalMs) {
        if (this.audioElement && Number.isFinite(this.audioElement.duration) && this.audioElement.duration > 0) {
            return this.audioElement.duration * 1000;
        }
        return Math.max(lines.length * beatIntervalMs * 2, 4000);
    }

    async syncLyricsToAudio() {
        if (!this.lyrics.trim()) {
            this.pushBotMessage('Enter lyrics before syncing.');
            return null;
        }

        const lines = this.lyrics.split('\n').map((line) => line.trim()).filter(Boolean);
        const bpm = this.getBpm();
        const driver = /** @type {any} */ (window).psDriver;
        const audioFile = await this.getCurrentAudioFile();
        let beatTimeline = [];
        let referenceDurationMs = this.getReferenceDurationMs(lines, 60000 / bpm);

        if (audioFile && driver?.detectBeats) {
            try {
                const decoded = await this.decodeAudioFile(audioFile);
                beatTimeline = await driver.detectBeats(decoded, bpm);
                referenceDurationMs = decoded.duration * 1000;
                if (driver.syncWithAudio) {
                    const syncInfo = await driver.syncWithAudio(decoded, bpm);
                    this.pushBotMessage(`Measured ${syncInfo.beats.length} beat markers from the loaded audio.`);
                }
            } catch (err) {
                console.warn('Falling back to BPM-only lyric timing:', err);
            }
        }

        const timingData = this.buildTimingFromAudio(lines, beatTimeline, referenceDurationMs, bpm);
        this.parseAndDisplayLyrics(this.lyrics, timingData);
        await this.saveSession();
        this.pushBotMessage(`Synced ${timingData.length} lyric lines using ${beatTimeline.length ? 'detected beat markers' : 'the current BPM grid'}.`);
        return timingData;
    }

    buildTimingFromAudio(lines, beatTimeline, referenceDurationMs, bpm) {
        if (!lines.length) return [];

        if (!beatTimeline.length) {
            return this.buildFallbackTiming(lines);
        }

        const totalWords = Math.max(1, lines.reduce((sum, line) => sum + line.split(/\s+/).filter(Boolean).length, 0));
        const beatIntervalMs = 60000 / bpm;
        const usableBeats = [...beatTimeline];
        if (usableBeats[usableBeats.length - 1] < referenceDurationMs) {
            for (let next = usableBeats[usableBeats.length - 1] + beatIntervalMs; next <= referenceDurationMs; next += beatIntervalMs) {
                usableBeats.push(next);
            }
        }

        let beatIndex = 0;
        const timing = [];
        lines.forEach((line) => {
            const words = line.split(/\s+/).filter(Boolean);
            const requestedBeats = Math.max(1, Math.round((words.length / totalWords) * usableBeats.length));
            const startBeatIndex = Math.min(beatIndex, usableBeats.length - 1);
            const endBeatIndex = Math.min(usableBeats.length - 1, startBeatIndex + requestedBeats);
            const lineStart = usableBeats[startBeatIndex];
            const lineEnd = endBeatIndex > startBeatIndex
                ? usableBeats[endBeatIndex]
                : Math.min(referenceDurationMs, lineStart + beatIntervalMs);
            const lineDuration = Math.max(beatIntervalMs * 0.75, lineEnd - lineStart);
            const wordDuration = lineDuration / Math.max(1, words.length);

            timing.push({
                line,
                startTime: lineStart,
                words: words.map((word, wordIndex) => ({
                    word,
                    start: lineStart + (wordIndex * wordDuration),
                    end: lineStart + ((wordIndex + 1) * wordDuration)
                }))
            });
            beatIndex = Math.min(usableBeats.length - 1, endBeatIndex + 1);
        });

        return timing;
    }

    async loadAudioFile(event) {
        const input = /** @type {HTMLInputElement} */ (event.target);
        const file = input?.files?.[0];
        if (!file || !this.audioElement) return;

        this.currentAudioFile = file;
        if (this.currentAudioUrl) {
            URL.revokeObjectURL(this.currentAudioUrl);
        }
        this.currentAudioUrl = URL.createObjectURL(file);
        this.audioElement.src = this.currentAudioUrl;
        this.audioElement.style.display = 'block';
        const trackNameDisplay = document.getElementById('trackNameDisplay');
        if (trackNameDisplay) {
            trackNameDisplay.textContent = file.name;
            this.updateAudioLoadedStatus(true);
        }

        await this.saveSession(file);
        if (this.lyrics.trim()) {
            this.parseAndDisplayLyrics(this.lyrics);
        }
    }

    async saveAudioToIndexedDB(file) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('Titan7ProDB', 1);
            request.onupgradeneeded = (event) => {
                const db = (/** @type {IDBOpenDBRequest} */ (event.target)).result;
                if (!db.objectStoreNames.contains('audioFiles')) {
                    db.createObjectStore('audioFiles');
                }
            };
            request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction('audioFiles', 'readwrite');
                tx.objectStore('audioFiles').put(file, 'currentAudio');
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async loadAudioFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('Titan7ProDB', 1);
            request.onupgradeneeded = (event) => {
                const db = (/** @type {IDBOpenDBRequest} */ (event.target)).result;
                if (!db.objectStoreNames.contains('audioFiles')) {
                    db.createObjectStore('audioFiles');
                }
            };
            request.onsuccess = () => {
                const db = request.result;
                try {
                    const tx = db.transaction('audioFiles', 'readonly');
                    const getRequest = tx.objectStore('audioFiles').get('currentAudio');
                    getRequest.onsuccess = () => resolve(getRequest.result || null);
                    getRequest.onerror = () => reject(getRequest.error);
                } catch (err) {
                    db.close();
                    reject(err);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getCurrentAudioFile() {
        if (this.currentAudioFile) return this.currentAudioFile;
        try {
            const stored = await this.loadAudioFromIndexedDB();
            if (stored instanceof File || stored instanceof Blob) {
                this.currentAudioFile = stored;
                return stored;
            }
        } catch (err) {
            console.warn('Failed to load stored audio file:', err);
        }
        return null;
    }

    async decodeAudioFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        try {
            const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
            if (audioContext.state !== 'closed') {
                await audioContext.close();
            }
            return decoded;
        } catch (err) {
            if (audioContext.state !== 'closed') {
                await audioContext.close();
            }
            throw err;
        }
    }

    async saveSession(audioFile = null) {
        if (audioFile) {
            await this.saveAudioToIndexedDB(audioFile);
        }

        const sessionData = {
            lyrics: this.lyrics,
            lyricTiming: this.lyricTiming,
            scrollSpeed: this.scrollSpeed,
            autoScrollEnabled: this.autoScrollEnabled,
            audioFileSrc: this.audioElement?.src?.startsWith('blob:') ? null : (this.audioElement?.src || null),
            audioFileName: document.getElementById('trackNameDisplay')?.textContent || 'No audio loaded',
            currentTime: this.audioElement?.currentTime || 0,
            isPlaying: this.isPlaying,
            masterVolume: this.audioElement?.volume || 1
        };
        localStorage.setItem('teleprompterSession', JSON.stringify(sessionData));
    }

    async loadSession() {
        const raw = localStorage.getItem('teleprompterSession');
        if (!raw) {
            this.parseAndDisplayLyrics('');
            return;
        }

        const sessionData = JSON.parse(raw);
        this.lyrics = sessionData.lyrics || '';
        this.lyricTiming = Array.isArray(sessionData.lyricTiming) ? sessionData.lyricTiming : [];
        this.scrollSpeed = sessionData.scrollSpeed || 5;
        this.autoScrollEnabled = sessionData.autoScrollEnabled !== false;

        const lyricsInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('lyricsInput'));
        if (lyricsInput) {
            lyricsInput.value = this.lyrics;
        }

        const autoScrollButton = document.getElementById('autoScroll');
        if (autoScrollButton) {
            autoScrollButton.classList.toggle('active', this.autoScrollEnabled);
        }

        if (this.audioElement) {
            let fileUrl = sessionData.audioFileSrc;
            if (!fileUrl || String(fileUrl).startsWith('blob:')) {
                try {
                    const storedFile = await this.getCurrentAudioFile();
                    if (storedFile) {
                        if (this.currentAudioUrl) {
                            URL.revokeObjectURL(this.currentAudioUrl);
                        }
                        this.currentAudioUrl = URL.createObjectURL(storedFile);
                        fileUrl = this.currentAudioUrl;
                    }
                } catch (err) {
                    console.warn('Failed to restore teleprompter audio:', err);
                }
            }

            if (fileUrl) {
                this.audioElement.src = fileUrl;
                this.audioElement.currentTime = sessionData.currentTime || 0;
                this.audioElement.style.display = 'block';
                const trackNameDisplay = document.getElementById('trackNameDisplay');
                if (trackNameDisplay) {
                    trackNameDisplay.textContent = sessionData.audioFileName || 'No audio loaded';
                    this.updateAudioLoadedStatus(true);
                }
            }

            this.audioElement.volume = sessionData.masterVolume || 1;
            this.masterVolume = this.audioElement.volume;
        }

        const scrollSpeedInput = /** @type {HTMLInputElement} */ (document.getElementById('scrollSpeed'));
        if (scrollSpeedInput) scrollSpeedInput.value = String(this.scrollSpeed);
        const scrollSpeedValue = document.getElementById('scrollSpeedValue');
        if (scrollSpeedValue) scrollSpeedValue.textContent = String(this.scrollSpeed);

        const masterVolumeInput = /** @type {HTMLInputElement} */ (document.getElementById('masterVolume'));
        if (masterVolumeInput) {
            masterVolumeInput.value = String(sessionData.masterVolume || 1);
        }

        this.parseAndDisplayLyrics(this.lyrics, this.lyricTiming);
    }

    updateLyricsHighlighting() {
        document.querySelectorAll('.lyric-word').forEach((word) => {
            const element = /** @type {HTMLElement} */ (word);
            const start = parseInt(element.dataset.start || '0', 10);
            const end = parseInt(element.dataset.end || '0', 10);
            word.classList.remove('active', 'sung');
            if (this.currentTime >= start && this.currentTime <= end) {
                word.classList.add('active');
            } else if (this.currentTime > end) {
                word.classList.add('sung');
            }
        });

        document.querySelectorAll('.lyric-line').forEach((line) => {
            const element = /** @type {HTMLElement} */ (line);
            const lineTime = parseInt(element.dataset.time || '0', 10);
            const activeWords = line.querySelectorAll('.lyric-word.active').length;

            line.classList.remove('active', 'upcoming');
            if (activeWords > 0) {
                line.classList.add('active');
            } else if (lineTime > this.currentTime && lineTime < this.currentTime + 5000) {
                line.classList.add('upcoming');
            }
        });
    }

    autoScroll() {
        const container = document.getElementById('lyricsContainer');
        const activeLine = document.querySelector('.lyric-line.active');
        if (activeLine && container) {
            const containerRect = container.getBoundingClientRect();
            const lineRect = activeLine.getBoundingClientRect();
            const offset = lineRect.top - containerRect.top - (containerRect.height / 2);
            container.style.transform = `translateY(-${offset}px)`;
        }
    }

    togglePanel() {
        const panel = document.getElementById('controlPanel');
        const toggle = document.getElementById('panelToggle');
        const icon = toggle?.querySelector('i');
        panel?.classList.toggle('collapsed');
        const collapsed = panel?.classList.contains('collapsed');
        if (!icon) return;
        icon.classList.toggle('fa-chevron-down', !collapsed);
        icon.classList.toggle('fa-chevron-up', !!collapsed);
    }

    toggleAutoScroll() {
        this.autoScrollEnabled = !this.autoScrollEnabled;
        const button = document.getElementById('autoScroll');
        if (button) {
            button.classList.toggle('active', this.autoScrollEnabled);
        }
        this.saveSession();
    }

    async handleDeviceAction(eventLike) {
        const currentTarget = /** @type {HTMLElement} */ (eventLike.currentTarget);
        const deviceItem = currentTarget.closest('.device-item');
        if (!(deviceItem instanceof HTMLElement)) return;

        const deviceId = deviceItem.dataset.deviceId;
        if (!deviceId) return;
        const driver = /** @type {any} */ (window).psDriver;
        if (!driver) return;

        if (currentTarget.classList.contains('connect')) {
            const success = await driver.connectToDevice(deviceId);
            if (success) {
                const payload = this.createCastPayload();
                await driver.castToDevice(deviceId, payload);
            }
        } else {
            await driver.disconnectDevice(deviceId);
        }

        await this.refreshDeviceList();
    }

    async refreshDeviceList(showBotMessage = false) {
        const button = document.getElementById('scanDevices');
        const originalText = button?.innerHTML;
        if (button) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
        }

        const driver = /** @type {any} */ (window).psDriver;
        const devices = driver ? await driver.scanForDevices() : [];
        this.renderDevices(devices);

        if (button && originalText) {
            button.innerHTML = originalText;
        }

        if (showBotMessage) {
            this.pushBotMessage(`Found ${devices.length} available teleprompter endpoints in the current session.`);
        }
    }

    renderDevices(devices) {
        const container = document.getElementById('availableDevices');
        if (!container) return;

        if (!devices.length) {
            container.innerHTML = '<div class="device-item"><div class="device-info"><span class="device-name">No endpoints available</span><span class="device-status">Open another teleprompter window or use the mirror window.</span></div></div>';
            return;
        }

        container.innerHTML = devices.map((device) => {
            const icon = device.type === 'laptop'
                ? 'fa-laptop'
                : device.type === 'mobile'
                    ? 'fa-mobile-alt'
                    : 'fa-tv';
            const connected = device.status === 'connected';
            return `
                <div class="device-item ${connected ? 'connected' : ''}" data-device-id="${this.escapeHtml(device.id)}">
                    <i class="fas ${icon}"></i>
                    <div class="device-info">
                        <span class="device-name">${this.escapeHtml(device.name)}</span>
                        <span class="device-status">${connected ? `Connected - ${Number(device.latency || 0).toFixed(1)}ms` : 'Available'}</span>
                    </div>
                    ${device.id === 'local-display' ? '' : `
                        <button class="device-action ${connected ? 'disconnect' : 'connect'}">
                            <i class="fas ${connected ? 'fa-eject' : 'fa-plug'}"></i>
                        </button>
                    `}
                </div>
            `;
        }).join('');
    }

    createCastPayload() {
        return {
            lyricsText: this.lyrics,
            timingData: this.lyricTiming,
            scrollSpeed: this.scrollSpeed,
            currentTime: this.currentTime,
            isPlaying: this.isPlaying,
            audioFileName: document.getElementById('trackNameDisplay')?.textContent || 'No audio loaded'
        };
    }

    applyCastPayload(payload, sourceId) {
        // NOTE: do not dedupe on sourceId alone — the driver already drops
        // messages originating from this participant, so a stable source id
        // would block every cast after the first one from a given peer.
        if (!payload) return;

        if (typeof payload.lyricsText === 'string') {
            this.lyrics = payload.lyricsText;
            const lyricsInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('lyricsInput'));
            if (lyricsInput) {
                lyricsInput.value = this.lyrics;
            }
        }
        if (Array.isArray(payload.timingData)) {
            this.lyricTiming = payload.timingData;
        }
        if (Number.isFinite(payload.scrollSpeed)) {
            this.scrollSpeed = payload.scrollSpeed;
            const scrollSpeedInput = /** @type {HTMLInputElement} */ (document.getElementById('scrollSpeed'));
            if (scrollSpeedInput) scrollSpeedInput.value = String(this.scrollSpeed);
            const scrollValue = document.getElementById('scrollSpeedValue');
            if (scrollValue) scrollValue.textContent = String(this.scrollSpeed);
        }
        if (payload.audioFileName) {
            const trackNameDisplay = document.getElementById('trackNameDisplay');
            if (trackNameDisplay) {
                trackNameDisplay.textContent = `${payload.audioFileName} (cast)`;
            }
        }

        this.parseAndDisplayLyrics(this.lyrics, this.lyricTiming);
        this.applyRemoteTransport(payload);
    }

    applyRemoteTransport(transport) {
        if (!transport) return;
        if (this.isViewer || !this.audioElement || !this.audioElement.src) {
            const wasPlaying = this.isPlaying;
            this.currentTime = Number.isFinite(transport.currentTime) ? transport.currentTime : this.currentTime;
            this.isPlaying = !!transport.isPlaying;
            if (transport.isRecording !== undefined) {
                this.isRecording = !!transport.isRecording;
                this.updateRecordButton(this.isRecording);
            }
            if (this.isPlaying && !wasPlaying) {
                this.virtualStartTime = this.currentTime;
                this.startVirtualTimer();
            } else if (!this.isPlaying && wasPlaying) {
                this.stopVirtualTimer();
            }
            this.updatePlayButton(this.isPlaying);
            this.updateTimeDisplay();
            this.updateLyricsHighlighting();
            return;
        }

        if (transport.forceSync) {
            this.currentTime = Number.isFinite(transport.currentTime) ? transport.currentTime : this.currentTime;
            this.audioElement.currentTime = this.currentTime / 1000;
            if (transport.isPlaying && this.audioElement.paused) {
                void this.audioElement.play();
            } else if (!transport.isPlaying && !this.audioElement.paused) {
                this.audioElement.pause();
            }
        }
    }

    broadcastTransportState(forceSync = false) {
        const driver = /** @type {any} */ (window).psDriver;
        if (!driver || this.isViewer) return;
        driver.broadcastTransport({
            currentTime: this.currentTime,
            isPlaying: this.isPlaying,
            isRecording: this.isRecording,
            scrollSpeed: this.scrollSpeed,
            forceSync
        });
    }

    toggleRecording() {
        if (this.isRecording) {
            this.isRecording = false;
            this.recordingDuration += performance.now() - this.recordStartTime;
            this.updateRecordButton(false);
            this.pushBotMessage('Recording stopped.');
        } else {
            this.isRecording = true;
            this.recordStartTime = performance.now();
            if (!this.isPlaying && this.lyricTiming.length) {
                this.currentTime = 0;
                this.togglePlay();
            }
            this.updateRecordButton(true);
            this.pushBotMessage('Recording started.');
        }
        this.broadcastTransportState(true);
    }

    updateRecordButton(recording) {
        const recordBtn = document.getElementById('tpRecord');
        const icon = recordBtn?.querySelector('i');
        if (!icon) return;
        if (recording) {
            icon.className = 'fas fa-stop';
            recordBtn?.classList.add('is-recording');
        } else {
            icon.className = 'fas fa-circle';
            recordBtn?.classList.remove('is-recording');
        }
        const startBtn = document.getElementById('startRecording');
        if (startBtn) {
            startBtn.innerHTML = recording
                ? '<i class="fas fa-stop"></i> Stop Recording'
                : '<i class="fas fa-record-vinyl"></i> Start Recording';
        }
    }

    copySessionId() {
        const sessionId = document.getElementById('sessionIdValue')?.textContent;
        if (!sessionId) return;
        navigator.clipboard.writeText(sessionId).then(() => {
            this.pushBotMessage('Session ID copied to the clipboard.');
        });
    }

    copyInviteLink() {
        const driver = /** @type {any} */ (window).psDriver;
        if (!driver?.getInviteUrl) return;
        navigator.clipboard.writeText(driver.getInviteUrl()).then(() => {
            this.pushBotMessage('Invite link copied. Opening it in another browser window joins the current session.');
        });
    }

    getBpm() {
        const bpmInput = /** @type {HTMLInputElement} */ (document.getElementById('lyricsBPM'));
        return parseInt(bpmInput?.value || '120', 10) || 120;
    }

    pushBotMessage(text) {
        const bot = /** @type {any} */ (window).psBot;
        if (bot?.addMessage) {
            bot.addMessage({ type: 'bot', text });
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

let tpApp;
document.addEventListener('DOMContentLoaded', () => {
    tpApp = new PSTeleprompterApp();
    window.tpApp = tpApp;
});

