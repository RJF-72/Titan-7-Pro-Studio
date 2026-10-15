const TELEPROMPTER_SESSION_STORAGE_KEY = 'titanTeleprompterSessionId.v1';
const TELEPROMPTER_ROLE_PARAM = 'role';
const TELEPROMPTER_SESSION_PARAM = 'session';

class PSTeleprompterDriver {
    constructor() {
        this.isConnected = false;
        this.latency = 0;
        this.syncOffset = 0;
        this.devices = [];
        this.audioContext = null;
        this.analyserNode = null;
        this.channel = null;
        this.participantId = this.createParticipantId();
        this.role = this.resolveRole();
        this.sessionId = this.resolveSessionId();
        this.participants = new Map();
        this.mirrorWindow = null;
        this.presenceInterval = null;
        this.latencyInterval = null;
        this.capabilities = ['local-session', 'peer-presence', 'transport-sync', 'beat-detection', 'device-discovery'];
        this.runtimeId = 'teleprompter';
        this.init();
    }

    async init() {
        window.TitanDriverRuntime?.registerDriver(this.runtimeId, this);
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;

        this.setupBroadcastChannel();
        this.startPresenceHeartbeat();
        this.startLatencyMonitoring();
        this.updateRuntimeUi();
        this.isConnected = true;
        window.TitanDriverRuntime?.updateDriver(this.runtimeId, { status: 'connected', sessionId: this.sessionId, role: this.role });

        window.addEventListener('beforeunload', () => {
            this.shutdown();
        });
    }

    resolveRole() {
        const params = new URLSearchParams(window.location.search);
        return params.get(TELEPROMPTER_ROLE_PARAM) === 'viewer' ? 'viewer' : 'host';
    }

    resolveSessionId() {
        const params = new URLSearchParams(window.location.search);
        const paramSession = params.get(TELEPROMPTER_SESSION_PARAM);
        if (paramSession) {
            localStorage.setItem(TELEPROMPTER_SESSION_STORAGE_KEY, paramSession);
            return paramSession;
        }

        const stored = localStorage.getItem(TELEPROMPTER_SESSION_STORAGE_KEY);
        if (stored) {
            return stored;
        }

        const generated = 'TITAN-DEFAULT';
        localStorage.setItem(TELEPROMPTER_SESSION_STORAGE_KEY, generated);
        return generated;
    }

    setupBroadcastChannel() {
        if (typeof BroadcastChannel === 'undefined') {
            console.warn('BroadcastChannel is not available; teleprompter collaboration is limited to the current window.');
            return;
        }

        this.channel = new BroadcastChannel(`titan-teleprompter:${this.sessionId}`);
        this.channel.addEventListener('message', (event) => {
            this.handleChannelMessage(event.data);
        });

        this.broadcastPresence('hello');
    }

    handleChannelMessage(message) {
        if (!message || message.sourceId === this.participantId) return;

        switch (message.type) {
        case 'hello':
            this.registerParticipant(message.participant, message.latencyMs);
            if (message.requestReply) {
                this.broadcastPresence('hello-ack');
            }
            break;
        case 'hello-ack':
            this.registerParticipant(message.participant, message.latencyMs);
            break;
        case 'leave':
            this.participants.delete(message.sourceId);
            this.updateRuntimeUi();
            break;
        case 'ping':
            if (!message.targetId || message.targetId === this.participantId) {
                this.postMessage({
                    type: 'pong',
                    targetId: message.sourceId,
                    echoTimestamp: message.sentAt
                });
            }
            break;
        case 'pong':
            if (message.targetId === this.participantId) {
                const participant = this.participants.get(message.sourceId);
                if (participant) {
                    participant.latencyMs = Math.max(0, performance.now() - message.echoTimestamp);
                    participant.lastSeen = Date.now();
                    this.participants.set(message.sourceId, participant);
                    this.updateRuntimeUi();
                }
            }
            break;
        case 'cast':
            if (!message.targetId || message.targetId === this.participantId) {
                document.dispatchEvent(new CustomEvent('teleprompter:cast-data', {
                    detail: {
                        payload: message.payload,
                        sourceId: message.sourceId
                    }
                }));
            }
            break;
        case 'transport':
            if (!message.targetId || message.targetId === this.participantId) {
                document.dispatchEvent(new CustomEvent('teleprompter:transport', {
                    detail: {
                        ...message.transport,
                        sourceId: message.sourceId
                    }
                }));
            }
            break;
        default:
            break;
        }
    }

    startPresenceHeartbeat() {
        this.presenceInterval = window.setInterval(() => {
            this.broadcastPresence('hello');
            this.pruneStaleParticipants();
        }, 2000);
    }

    pruneStaleParticipants() {
        const now = Date.now();
        Array.from(this.participants.entries()).forEach(([participantId, participant]) => {
            if (now - participant.lastSeen > 7000) {
                this.participants.delete(participantId);
            }
        });
        this.updateRuntimeUi();
    }

    startLatencyMonitoring() {
        this.latencyInterval = window.setInterval(() => {
            Array.from(this.participants.keys()).forEach((participantId) => {
                this.postMessage({
                    type: 'ping',
                    targetId: participantId,
                    sentAt: performance.now()
                });
            });
            this.updateRuntimeUi();
        }, 2500);
    }

    registerParticipant(participant, latencyMs) {
        if (!participant || participant.id === this.participantId) return;
        this.participants.set(participant.id, {
            ...participant,
            latencyMs: Number.isFinite(latencyMs) ? latencyMs : participant.latencyMs || 0,
            lastSeen: Date.now()
        });
        this.updateRuntimeUi();
    }

    getLocalParticipant() {
        return {
            id: this.participantId,
            name: this.role === 'viewer' ? `Viewer ${this.participantId.slice(-4).toUpperCase()}` : 'Host',
            role: this.role,
            sessionId: this.sessionId,
            joinedAt: Date.now()
        };
    }

    broadcastPresence(type) {
        this.postMessage({
            type,
            participant: this.getLocalParticipant(),
            latencyMs: this.getBaseLatencyMs(),
            requestReply: type === 'hello'
        });
    }

    postMessage(message) {
        if (!this.channel) return;
        this.channel.postMessage({
            ...message,
            sessionId: this.sessionId,
            sourceId: this.participantId
        });
    }

    getBaseLatencyMs() {
        return Math.max(0.1, (this.audioContext?.baseLatency || 0.001) * 1000);
    }

    getAverageLatency() {
        const latencies = Array.from(this.participants.values())
            .map((participant) => participant.latencyMs)
            .filter((value) => Number.isFinite(value) && value >= 0);
        if (!latencies.length) {
            return this.getBaseLatencyMs();
        }
        return latencies.reduce((sum, value) => sum + value, 0) / latencies.length;
    }

    getInviteUrl() {
        const inviteUrl = new URL(window.location.href);
        inviteUrl.searchParams.set(TELEPROMPTER_SESSION_PARAM, this.sessionId);
        inviteUrl.searchParams.set(TELEPROMPTER_ROLE_PARAM, 'viewer');
        return inviteUrl.toString();
    }

    async scanForDevices() {
        console.log('[PSTeleprompterDriver] scanForDevices called');
        let castDevices = [];

        try {
            // 1. Check for the standard window.cast API (Cast SDK)
            if (window.cast && window.cast.Chromecast) {
                console.log('[PSTeleprompterDriver] Using window.cast.Chromecast API');
                const discovered = await window.cast.Chromecast.discoverDevices();
                console.log('[PSTeleprompterDriver] Cast discovery results:', discovered);
                if (Array.isArray(discovered)) {
                    castDevices = discovered.map(device => ({
                        id: `cast:${device.deviceId || device.id}`,
                        name: device.friendlyName || device.name || 'Unknown Cast Device',
                        type: 'tv',
                        status: 'available',
                        latency: 20.0,
                        castId: device.deviceId || device.id
                    }));
                }
            }
            // 2. Check for chrome.cast (Chrome extensions/special builds)
            else if (window.chrome && window.chrome.cast) {
                console.log('[PSTeleprompterDriver] Using window.chrome.cast API');
                const devices = await window.chrome.cast.discoverDevices();
                console.log('[PSTeleprompterDriver] Chrome Cast discovery results:', devices);
                castDevices = devices.map(device => ({
                    id: `cast:${device.deviceId}`,
                    name: device.friendlyName,
                    type: 'tv',
                    status: 'available',
                    latency: 20.0,
                    castId: device.deviceId
                }));
            }
            // 3. Electron network scan is discovery-only. It does not produce a controllable
            // teleprompter endpoint unless a Cast SDK or peer window is available.
            else if (window.titan && window.titan.network && window.titan.network.scanDevices) {
                console.log('[PSTeleprompterDriver] Using Electron IPC network scan for discovery');
                const discovered = await window.titan.network.scanDevices();
                window.TitanDriverRuntime?.addDiagnostic(this.runtimeId, 'info', 'Network discovery completed', {
                    devices: Array.isArray(discovered) ? discovered.length : 0
                });
            }
            // 4. Fallback
            else {
                console.warn('[PSTeleprompterDriver] No Cast SDK or discovery source available.');
            }
        } catch (e) {
            console.error('[PSTeleprompterDriver] Exception during scanForDevices:', e);
        }

        const discoveredPeers = Array.from(this.participants.values()).map((participant) => ({
            id: `peer:${participant.id}`,
            name: participant.name,
            type: participant.role === 'viewer' ? 'display' : 'laptop',
            status: 'connected',
            latency: participant.latencyMs || this.getAverageLatency(),
            targetParticipantId: participant.id
        }));        const localEndpoints = [
            {
                id: 'local-display',
                name: 'This Window',
                type: 'laptop',
                status: 'connected',
                latency: this.getBaseLatencyMs(),
                castable: true
            },
            {
                id: 'mirror-window',
                name: this.mirrorWindow && !this.mirrorWindow.closed ? 'Mirror Window' : 'Open Mirror Window',
                type: 'display',
                status: this.mirrorWindow && !this.mirrorWindow.closed ? 'connected' : 'available',
                latency: this.getBaseLatencyMs(),
                castable: true
            }
        ];

        this.devices = [
            ...localEndpoints,
            ...castDevices.map((device) => ({ ...device, castable: true })),
            ...discoveredPeers.map((device) => ({ ...device, castable: true }))
        ];

        window.TitanDriverRuntime?.updateDriver(this.runtimeId, { status: 'scanned', deviceCount: this.devices.length, latency: this.getAverageLatency() });
        window.TitanDriverRuntime?.addDiagnostic(this.runtimeId, 'info', 'Device scan complete', { devices: this.devices.length });
        console.log('[PSTeleprompterDriver] Final device list:', this.devices);

        this.updateRuntimeUi();
        document.dispatchEvent(new CustomEvent('teleprompter:devices', {
            detail: { devices: this.devices }
        }));
        return this.devices;
    }

    async connectToDevice(deviceId) {
        if (deviceId === 'local-display') {
            return true;
        }

        if (deviceId === 'mirror-window') {
            const mirrorUrl = new URL('teleprompter.html', window.location.href);
            mirrorUrl.searchParams.set(TELEPROMPTER_SESSION_PARAM, this.sessionId);
            mirrorUrl.searchParams.set(TELEPROMPTER_ROLE_PARAM, 'viewer');
            this.mirrorWindow = window.open(
                mirrorUrl.toString(),
                `TitanTeleprompterMirror-${this.sessionId}`,
                'popup,width=1280,height=900'
            );
            return !!this.mirrorWindow;
        }

        if (deviceId.startsWith('cast:')) {
            const castId = deviceId.replace('cast:', '');
            if (window.cast && window.cast.Chromecast) {
                try {
                    const session = await window.cast.Chromecast.startSession(castId);
                    return !!session;
                } catch (e) {
                    console.error('Failed to connect to cast device:', e);
                    return false;
                }
            } else {
                console.warn('[PSTeleprompterDriver] Cast SDK not available for direct connection.');
                return false;
            }
        }

        if (deviceId.startsWith('ssdp:') || deviceId.startsWith('mdns:') || deviceId.startsWith('net:')) {
            window.TitanDriverRuntime?.addDiagnostic(this.runtimeId, 'warning', 'Passive network device is not a controllable cast endpoint', { deviceId });
            return false;
        }

        return deviceId.startsWith('peer:')
            ? this.participants.has(deviceId.replace('peer:', ''))
            : false;
    }

    async disconnectDevice(deviceId) {
        if (deviceId === 'mirror-window' && this.mirrorWindow && !this.mirrorWindow.closed) {
            this.mirrorWindow.close();
            this.mirrorWindow = null;
            await this.scanForDevices();
            return;
        }
    }

    async castToDevice(deviceId, payload) {
        if (deviceId === 'local-display') {
            document.dispatchEvent(new CustomEvent('teleprompter:cast-data', {
                detail: {
                    payload,
                    sourceId: this.participantId
                }
            }));
            return true;
        }

        if (deviceId.startsWith('cast:')) {
            const castId = deviceId.replace('cast:', '');
            if (window.cast && window.cast.Chromecast) {
                try {
                    await window.cast.Chromecast.sendPayload(castId, payload);
                    return true;
                } catch (e) {
                    console.error('Failed to cast payload to device:', e);
                    return false;
                }
            } else {
                console.warn('[PSTeleprompterDriver] Cast SDK not available for sending payload.');
                return false;
            }
        }

        if (deviceId.startsWith('ssdp:') || deviceId.startsWith('mdns:') || deviceId.startsWith('net:')) {
            window.TitanDriverRuntime?.addDiagnostic(this.runtimeId, 'warning', 'Cannot cast payload to passive network discovery endpoint', { deviceId });
            return false;
        }

        const targetParticipantId = deviceId === 'mirror-window'
            ? null
            : deviceId.startsWith('peer:')
                ? deviceId.replace('peer:', '')
                : null;

        this.postMessage({
            type: 'cast',
            targetId: targetParticipantId,
            payload
        });
        return true;
    }

    broadcastTransport(transport) {
        this.postMessage({
            type: 'transport',
            transport
        });
    }

    updateRuntimeUi() {
        const averageLatency = this.getAverageLatency();
        this.latency = averageLatency;
        window.TitanDriverRuntime?.updateDriver(this.runtimeId, { status: this.isConnected ? 'connected' : 'idle', latency: averageLatency, participants: this.participants.size + 1 });

        const connectionText = document.getElementById('connectionText');
        if (connectionText) {
            connectionText.textContent = this.participants.size
                ? `Session active Â· ${this.participants.size + 1} windows connected`
                : 'Local session ready';
        }

        const latencyElement = document.getElementById('latencyValue');
        if (latencyElement) {
            latencyElement.textContent = `${averageLatency.toFixed(1)}ms`;
        }

        const driverLatencyElement = document.querySelector('.driver-latency');
        if (driverLatencyElement) {
            driverLatencyElement.textContent = `${this.getBaseLatencyMs().toFixed(1)}ms`;
        }

        const collaboratorCount = document.getElementById('collaboratorCount');
        if (collaboratorCount) {
            collaboratorCount.textContent = String(this.participants.size + 1);
        }

        const avatars = document.getElementById('collaboratorAvatars');
        if (avatars) {
            const participants = [this.getLocalParticipant(), ...Array.from(this.participants.values())];
            avatars.innerHTML = participants.map((participant) => `
                <div class="avatar" title="${this.escapeHtml(participant.name)}">${this.escapeHtml(participant.name.slice(0, 2).toUpperCase())}</div>
            `).join('');
        }

        const sessionIdValue = document.getElementById('sessionIdValue');
        if (sessionIdValue) {
            sessionIdValue.textContent = this.sessionId;
        }

        const regionValue = document.getElementById('regionValue');
        if (regionValue) {
            regionValue.textContent = 'Local browser session';
        }

        const protocolValue = document.getElementById('protocolValue');
        if (protocolValue) {
            protocolValue.textContent = this.channel ? 'BroadcastChannel + postMessage' : 'Single-window mode';
        }

        const participantsList = document.getElementById('participantsList');
        if (participantsList) {
            const participants = [this.getLocalParticipant(), ...Array.from(this.participants.values())];
            participantsList.innerHTML = participants.map((participant) => `
                <div class="participant" data-role="${this.escapeHtml(participant.role)}">
                    <div class="participant-avatar">${this.escapeHtml(participant.name.charAt(0).toUpperCase())}</div>
                    <div class="participant-info">
                        <span class="participant-name">${this.escapeHtml(participant.name)}</span>
                        <span class="participant-role">${participant.role === 'host' ? 'Host - Full Control' : 'Viewer - Synced Display'}</span>
                    </div>
                    <div class="participant-stats">
                        <span class="stat"><i class="fas fa-signal"></i> ${(participant.latencyMs || this.getBaseLatencyMs()).toFixed(1)}ms</span>
                        <span class="stat active"><i class="fas fa-circle"></i> Live</span>
                    </div>
                </div>
            `).join('');
        }

        document.dispatchEvent(new CustomEvent('teleprompter:participants', {
            detail: {
                sessionId: this.sessionId,
                role: this.role,
                participantId: this.participantId,
                participants: [this.getLocalParticipant(), ...Array.from(this.participants.values())],
                latencyMs: averageLatency
            }
        }));
    }

    async syncWithAudio(audioBuffer, bpm) {
        const beats = await this.detectBeats(audioBuffer, bpm);
        this.syncOffset = beats[0] || 0;
        return {
            type: 'sync',
            offset: this.syncOffset,
            bpm,
            beats,
            timestamp: performance.now()
        };
    }

    async detectBeats(audioBuffer, bpm) {
        const beats = [];
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.length / sampleRate;
        const beatInterval = 60 / bpm;
        const channelData = audioBuffer.getChannelData(0);
        const windowSize = Math.floor(sampleRate * 0.05);
        const energies = [];

        for (let index = 0; index < channelData.length; index += windowSize) {
            let sum = 0;
            const end = Math.min(index + windowSize, channelData.length);
            for (let sampleIndex = index; sampleIndex < end; sampleIndex++) {
                sum += channelData[sampleIndex] * channelData[sampleIndex];
            }
            energies.push(sum / Math.max(1, end - index));
        }

        const avgEnergy = energies.length
            ? energies.reduce((sum, value) => sum + value, 0) / energies.length
            : 0;
        const threshold = avgEnergy * 1.5;

        let lastBeatTime = -beatInterval;
        for (let index = 1; index < energies.length; index++) {
            if (energies[index] > threshold && energies[index] > energies[index - 1]) {
                const timeSeconds = (index * windowSize) / sampleRate;
                if (timeSeconds - lastBeatTime >= beatInterval * 0.5) {
                    beats.push(timeSeconds * 1000);
                    lastBeatTime = timeSeconds;
                }
            }
        }

        if (!beats.length) {
            for (let timeSeconds = 0; timeSeconds < duration; timeSeconds += beatInterval) {
                beats.push(timeSeconds * 1000);
            }
        }

        window.TitanDriverRuntime?.addDiagnostic(this.runtimeId, 'info', 'Beat detection complete', { beats: beats.length, bpm });
        return beats;
    }

    createParticipantId() {
        if (globalThis.crypto?.randomUUID) {
            return globalThis.crypto.randomUUID();
        }
        return `tp-${Date.now()}-${performance.now().toFixed(0)}`;
    }

    generateSessionId() {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const random = new Uint32Array(8);
        globalThis.crypto.getRandomValues(random);
        let token = '';
        for (let index = 0; index < random.length; index++) {
            token += alphabet[random[index] % alphabet.length];
        }
        return `TITAN-${token}`;
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    shutdown() {
        if (this.presenceInterval) {
            clearInterval(this.presenceInterval);
            this.presenceInterval = null;
        }
        if (this.latencyInterval) {
            clearInterval(this.latencyInterval);
            this.latencyInterval = null;
        }
        this.postMessage({ type: 'leave' });
        if (this.channel) {
            this.channel.close();
            this.channel = null;
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}

const psDriver = new PSTeleprompterDriver();
window.psDriver = psDriver;


