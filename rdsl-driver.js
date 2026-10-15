class RDSLDriver {
    constructor() {
        this.status = 'Idle';
        this.compilation = 'Not compiled';
        this.latency = 0;
        this.memory = 0;
        this.listeners = {};
        this.lastSourceBytes = 0;
        this.lastArtifactBytes = 0;
        this.capabilities = ['source-tracking', 'compile-metrics', 'manifest-analysis', 'diagnostics'];
        this.runtimeId = 'rdsl';
    }

    init() {
        this.registerRuntime();
        this.updateMetrics();
    }

    registerRuntime() {
        window.TitanDriverRuntime?.registerDriver(this.runtimeId, this);
    }

    updateMetrics() {
        const payload = {
            status: this.status,
            compilation: this.compilation,
            latency: this.latency,
            memory: this.memory,
            sourceBytes: this.lastSourceBytes,
            artifactBytes: this.lastArtifactBytes
        };
        window.TitanDriverRuntime?.updateDriver(this.runtimeId, payload);
        this.emit('statusUpdate', payload);
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach((callback) => callback(data));
    }

    trackSource(code) {
        this.lastSourceBytes = new Blob([code || '']).size;
        window.TitanDriverRuntime?.addDiagnostic(this.runtimeId, 'info', 'Source updated', { bytes: this.lastSourceBytes });
        this.memory = this.bytesToMegabytes(this.lastSourceBytes);
        this.status = 'Ready';
        this.updateMetrics();
    }

    recordCompile(result, durationMs) {
        this.lastArtifactBytes = result?.size || 0;
        this.latency = durationMs;
        this.memory = this.bytesToMegabytes(Math.max(this.lastSourceBytes, this.lastArtifactBytes));
        this.status = 'Compiled';
        this.compilation = result?.warnings?.length ? 'Compiled with warnings' : 'Ready';
        this.updateMetrics();
    }

    recordExecution(report) {
        this.latency = report?.elapsedMs || 0;
        this.memory = this.bytesToMegabytes(Math.max(this.lastSourceBytes, report?.memoryBytes || 0));
        this.status = 'Analyzed';
        this.compilation = 'Ready';
        this.updateMetrics();
    }

    recordError(message) {
        this.status = 'Error';
        this.compilation = message || 'Failed';
        window.TitanDriverRuntime?.addDiagnostic(this.runtimeId, 'error', this.compilation);
        this.updateMetrics();
    }

    bytesToMegabytes(bytes) {
        return Math.max(0.01, bytes / (1024 * 1024));
    }
}

const rdslDriver = new RDSLDriver();
window.rdslDriver = rdslDriver;

