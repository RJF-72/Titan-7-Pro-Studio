class PSTeleprompterBot {
    constructor() {
        this.isOnline = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.greetUser();
    }

    setupEventListeners() {
        const botInput = document.getElementById('botInput');
        const botSend = document.getElementById('botSend');
        const quickActions = document.querySelectorAll('.quick-action');

        botSend?.addEventListener('click', () => this.handleUserInput());
        botInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleUserInput();
            }
        });

        quickActions.forEach((action) => {
            action.addEventListener('click', (e) => {
                const target = /** @type {HTMLElement} */ (e.currentTarget);
                const actionType = target.dataset.action;
                if (actionType) this.executeQuickAction(actionType);
            });
        });
    }

    greetUser() {
        this.addMessage({
            type: 'bot',
            text: 'PS Teleprompter is ready. I can sync lyric timing from the loaded audio, cast the current session to mirror windows or peer tabs, and help you share the active collaboration link.'
        });
    }

    handleUserInput() {
        const input = /** @type {HTMLInputElement} */ (document.getElementById('botInput'));
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        this.addMessage({ type: 'user', text });
        input.value = '';
        void this.processCommand(text);
    }

    async processCommand(command) {
        const lower = command.toLowerCase();

        if (lower.includes('sync') || lower.includes('timing')) {
            await this.autoSyncLyrics();
            return;
        }

        if (lower.includes('cast') || lower.includes('device')) {
            await this.castToAllDevices();
            return;
        }

        if (lower.includes('collab') || lower.includes('collaboration') || lower.includes('invite')) {
            await this.startCollaboration();
            return;
        }

        if (lower.includes('latency') || lower.includes('optimize')) {
            await this.optimizeLatency();
            return;
        }

        if (lower.includes('help')) {
            this.addMessage({
                type: 'bot',
                text: 'Try one of these commands: "sync lyrics", "cast to devices", "copy invite link", or "show latency".'
            });
            return;
        }

        const runtimeAnswer = window.TitanDriverRuntime?.answer(command, {
            botName: 'PS Teleprompter Bot',
            driverName: 'Teleprompter Driver',
            status: window.psDriver?.isConnected ? 'connected' : 'idle',
            params: {
                session: window.psDriver?.sessionId || 'local',
                participants: window.psDriver?.participants?.size ? window.psDriver.participants.size + 1 : 1,
                latency: window.psDriver?.latency ? window.psDriver.latency.toFixed(1) + 'ms' : 'local'
            }
        });
        this.addMessage({
            type: 'bot',
            text: runtimeAnswer?.response || 'Ask me to sync lyrics, cast the session, copy the collaboration link, or report latency.'
        });
    }

    async autoSyncLyrics() {
        const app = /** @type {any} */ (window).tpApp;
        if (!app?.syncLyricsToAudio) return;
        window.TitanDriverRuntime?.addDiagnostic('teleprompter', 'info', 'Bot requested lyric sync');
        this.addMessage({
            type: 'bot',
            text: 'Syncing lyrics against the loaded audio and current BPM grid...'
        });
        const timingData = await app.syncLyricsToAudio();
        if (!timingData) {
            this.addMessage({
                type: 'bot',
                text: 'I could not sync the lyrics yet. Load audio and add at least one lyric line first.'
            });
            return;
        }
        this.addMessage({
            type: 'bot',
            text: `Synced ${timingData.length} lyric lines with deterministic timing derived from the current track and BPM settings.`
        });
    }

    async castToAllDevices() {
        const driver = /** @type {any} */ (window).psDriver;
        const app = /** @type {any} */ (window).tpApp;
        if (!driver || !app?.createCastPayload) return;

        window.TitanDriverRuntime?.addDiagnostic('teleprompter', 'info', 'Bot requested device cast');
        const devices = await driver.scanForDevices();
        const eligibleDevices = devices.filter((device) => device.id !== 'local-display');
        if (!eligibleDevices.length) {
            this.addMessage({
                type: 'bot',
                text: 'No secondary teleprompter endpoints are available yet. Open a mirror window or join the session from another tab.'
            });
            return;
        }

        const payload = app.createCastPayload();
        let successCount = 0;
        for (const device of eligibleDevices) {
            const connected = await driver.connectToDevice(device.id);
            if (connected) {
                await driver.castToDevice(device.id, payload);
                successCount += 1;
            }
        }

        this.addMessage({
            type: 'bot',
            text: `Cast completed to ${successCount} endpoint${successCount === 1 ? '' : 's'}.`
        });
        await app.refreshDeviceList();
    }

    async startCollaboration() {
        const app = /** @type {any} */ (window).tpApp;
        const driver = /** @type {any} */ (window).psDriver;
        if (!app || !driver?.getInviteUrl) return;

        await app.copyInviteLink();
        this.addMessage({
            type: 'bot',
            text: `Invite link copied. Share this session with another browser window using ${driver.getInviteUrl()}.`
        });
    }

    async optimizeLatency() {
        const driver = /** @type {any} */ (window).psDriver;
        if (!driver) return;

        window.TitanDriverRuntime?.addDiagnostic('teleprompter', 'info', 'Bot requested device cast');
        const devices = await driver.scanForDevices();
        const remoteCount = devices.filter((device) => device.id !== 'local-display').length;
        const latency = driver.getAverageLatency ? driver.getAverageLatency() : 0;
        this.addMessage({
            type: 'bot',
            text: remoteCount > 0
                ? `Current average session latency is ${latency.toFixed(1)}ms across ${remoteCount} remote endpoint${remoteCount === 1 ? '' : 's'}.`
                : `Local-only mode is active. Base engine latency is ${latency.toFixed(1)}ms.`
        });
    }

    executeQuickAction(action) {
        const commandMap = {
            sync: 'sync lyrics',
            cast: 'cast to devices',
            collab: 'copy invite link',
            optimize: 'show latency'
        };
        const command = commandMap[action];
        if (!command) return;
        this.addMessage({ type: 'user', text: command });
        void this.processCommand(command);
    }

    addMessage(message) {
        const messagesContainer = document.getElementById('botMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message';

        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${message.type}`;
        bubble.innerHTML = `<p>${this.escapeHtml(message.text).replace(/\n/g, '<br>')}</p>`;

        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = 'Just now';

        messageDiv.appendChild(bubble);
        messageDiv.appendChild(time);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

const psBot = new PSTeleprompterBot();
window.psBot = psBot;



