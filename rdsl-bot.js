class RDSLBot {
    constructor() {
        this.history = [];
        this.library = [
            { id: 'compressor', keywords: ['compressor', 'compress', 'compression', 'limiter', 'limiting', 'dynamics'], templates: { rdsl: 'COMPRESSOR', driver: 'DynamicProcessor' } },
            { id: 'eq', keywords: ['eq', 'equalizer', 'equalisation', 'equalization', 'filter', 'filtering', 'shelving', 'parametric'], templates: { rdsl: 'EQUALIZER', driver: 'FilterProcessor' } },
            { id: 'reverb', keywords: ['reverb', 'reverberation', 'hall', 'room', 'echo', 'ambience', 'space', 'wet'], templates: { rdsl: 'REVERB', driver: 'ReverbProcessor' } },
            { id: 'delay', keywords: ['delay', 'echo', 'repeat', 'pingpong', 'slapback'], templates: { rdsl: 'DELAY', driver: 'DelayProcessor' } },
            { id: 'synth', keywords: ['synth', 'synthesizer', 'oscillator', 'waveform', 'subtractive', 'fm'], templates: { rdsl: 'SYNTHESIZER', driver: 'SynthProcessor' } },
            { id: 'saturator', keywords: ['saturator', 'saturation', 'distortion', 'overdrive', 'drive', 'warmth', 'tube', 'tape', 'clip'], templates: { rdsl: 'SATURATOR', driver: 'SaturationProcessor' } },
            { id: 'gate', keywords: ['gate', 'noisegate', 'noise gate', 'expander', 'expansion'], templates: { rdsl: 'NOISE_GATE', driver: 'GateProcessor' } },
            { id: 'phaser', keywords: ['phaser', 'phase', 'flanger', 'flange', 'chorus'], templates: { rdsl: 'MODULATION', driver: 'ModulationProcessor' } },
            { id: 'analyzer', keywords: ['analyzer', 'spectrum', 'meter', 'metering', 'visualizer', 'scope', 'fft'], templates: { rdsl: 'ANALYZER', driver: 'AnalysisProcessor' } },
            { id: 'vocal', keywords: ['vocal', 'voice', 'vocal chain', 'doubler', 'harmony', 'pitch'], templates: { rdsl: 'VOCAL_PROCESSOR', driver: 'VocalProcessor' } },
            { id: 'master', keywords: ['master', 'mastering', 'limiter', 'maximizer', 'brickwall', 'finalizer'], templates: { rdsl: 'MASTERING_CHAIN', driver: 'MasteringProcessor' } }
        ];
    }

    process(input) {
        const text = input.toLowerCase();
        const params = this.extractParams(text);
        const scoredMatches = this.library.map((entry) => ({
            entry,
            hits: entry.keywords.filter((keyword) => text.includes(keyword)).length
        }));
        const bestMatch = scoredMatches.sort((left, right) => right.hits - left.hits)[0];
        const matched = bestMatch && bestMatch.hits > 0 ? bestMatch.entry : null;
        const intent = matched ? matched.id : 'custom';
        const confidence = matched
            ? Math.min(1, 0.45 + (bestMatch.hits / matched.keywords.length) + (Object.keys(params).length * 0.03))
            : Math.min(0.45, 0.2 + (Object.keys(params).length * 0.04));

        const result = {
            intent,
            confidence,
            params,
            type: matched ? matched.templates : { rdsl: 'CUSTOM_PROCESSOR', driver: 'CustomProcessor' },
            feedback: this.buildFeedback(intent, matched, params, confidence)
        };

        this.history.push({ input, result, timestamp: Date.now() });
        window.TitanDriverRuntime?.addDiagnostic('rdsl', 'info', 'Bot intent parsed', { intent, confidence, params });
        return result;
    }

    extractParams(text) {
        const params = {};
        const patterns = [
            { key: 'ratio', re: /(\d+(?:\.\d+)?)\s*:\s*1/i },
            { key: 'threshold', re: /threshold\s*(?:of\s*)?[-]?(\d+(?:\.\d+)?)/i },
            { key: 'attack', re: /attack\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(ms|s)/i },
            { key: 'release', re: /release\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(ms|s)/i },
            { key: 'freq', re: /(?:frequency|freq|crossover)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(hz|khz)/i },
            { key: 'gain', re: /(?:gain|boost|cut|makeup)\s*(?:of\s*)?[-]?(\d+(?:\.\d+)?)\s*(db)/i },
            { key: 'mix', re: /(?:mix|wet|dry|blend)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*%/i },
            { key: 'q', re: /[qQ]\s*(?:factor\s*)?(\d+(?:\.\d+)?)/ },
            { key: 'knee', re: /knee\s*(?:of\s*)?(\d+(?:\.\d+)?)/i },
            { key: 'depth', re: /depth\s*(?:of\s*)?(\d+(?:\.\d+)?)/i },
            { key: 'rate', re: /(?:rate|speed|frequency)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(hz)/i },
            { key: 'feedback', re: /feedback\s*(?:of\s*)?(\d+(?:\.\d+)?)/i }
        ];

        patterns.forEach((pattern) => {
            const match = text.match(pattern.re);
            if (match) {
                params[pattern.key] = parseFloat(match[1]);
            }
        });

        if (/stereo/i.test(text)) params.routing = 'stereo';
        if (/mono/i.test(text)) params.routing = 'mono';
        if (/side.?chain/i.test(text)) params.sidechain = true;
        if (/gpu/i.test(text)) params.gpu = true;
        if (/oversample/i.test(text)) params.oversample = true;
        if (/analog|vintage|warm/i.test(text)) params.character = 'vintage';
        if (/clean|transparent|digital|modern/i.test(text)) params.character = 'clean';
        if (/tube/i.test(text)) params.saturation = 'tube';
        if (/tape/i.test(text)) params.saturation = 'tape';
        return params;
    }

    buildFeedback(intent, matched, params, confidence) {
        const detailPairs = Object.entries(params).map(([key, value]) => `${key}=${value}`);
        const detail = detailPairs.length ? ` with ${detailPairs.join(', ')}` : '';
        const name = matched ? matched.id : 'custom processor';
        return `Detected intent: ${name}${detail}. Confidence: ${(confidence * 100).toFixed(0)}%`;
    }

    decorateGeneratedTemplate(source, intent) {
        const meta = this.getTemplateMetadata(intent);
        if (!meta) return source;
        const insert = `
  name: "${meta.name}"
  component_type: ${meta.componentType}
  audio_inputs: ${meta.inputs}
  audio_outputs: ${meta.outputs}
  realtime_safe: true
  author: RDSL Bot
  category: ${meta.category}`;
        if (!/\n\s*version:\s*1\.0\n/.test(source)) return source;
        return source.replace(/(\n\s*version:\s*1\.0\n)/, `$1${insert}\n`);
    }

    getTemplateMetadata(intent) {
        const presets = {
            compressor: { name: 'World Class Compressor', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Dynamics' },
            eq: { name: 'Studio EQ', componentType: 'Effect', inputs: 2, outputs: 2, category: 'EQ / Filtering' },
            reverb: { name: 'Concert Hall Reverb', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Space' },
            delay: { name: 'Tempo Delay', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Time' },
            saturator: { name: 'Analog Saturation', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Harmonic' },
            gate: { name: 'Noise Gate', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Dynamics' },
            phaser: { name: 'Modulation Phaser', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Motion' },
            synth: { name: 'Poly Synth', componentType: 'Instrument', inputs: 0, outputs: 2, category: 'Instrument' },
            analyzer: { name: 'Spectrum Analyzer', componentType: 'Analyzer', inputs: 2, outputs: 1, category: 'Analysis' },
            vocal: { name: 'Vocal Processor', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Voice' },
            master: { name: 'Mastering Chain', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Mastering' },
            custom: { name: 'Custom Processor', componentType: 'Effect', inputs: 2, outputs: 2, category: 'Utility' }
        };
        return presets[intent] || presets.custom;
    }

    addMessage(text) {
        const container = document.getElementById('rdslBotMessages');
        if (!container) return;
        const message = document.createElement('div');
        message.className = 'bot-message-small';
        message.innerHTML = `<p>${this.escapeHtml(text)}</p>`;
        container.appendChild(message);
        container.scrollTop = container.scrollHeight;
    }

    generateRDSLCode(result) {
        const { intent, params } = result;
        const p = params;
        const templates = {
            compressor: `// RDSL: Dynamic Compressor
// Generated from natural language input
{{\n  type: COMPRESSOR\n  version: 1.0\n  params:\n    ratio: ${p.ratio || 4}\n    threshold: ${p.threshold !== undefined ? -p.threshold : -18}\n    attack: ${p.attack || 10}\n    release: ${p.release || 100}\n    knee: ${p.knee || 3}\n    makeup_gain: ${p.gain || 6}\n  routing: ${p.routing || 'stereo'}${p.sidechain ? '\n  sidechain: true' : ''}\n  oversampling: ${p.oversample ? '4x' : '1x'}\n  gpu: ${p.gpu ? 'enabled' : 'disabled'}\n}}`,
            eq: `// RDSL: Parametric Equalizer
// Generated from natural language input
{{\n  type: EQUALIZER\n  version: 1.0\n  bands: 4\n  params:\n    low_gain: ${p.gain || 2}\n    low_freq: 80\n    low_mid_gain: 0\n    low_mid_freq: 500\n    high_mid_gain: 1\n    high_mid_freq: 2000\n    high_gain: ${p.gain || 3}\n    high_freq: 8000\n  q: ${p.q || 2.5}\n  routing: ${p.routing || 'stereo'}\n  character: ${p.character || 'digital'}\n}}`,
            reverb: `// RDSL: Convolution Reverb
// Generated from natural language input
{{\n  type: REVERB\n  version: 1.0\n  params:\n    size: ${p.depth || 60}\n    decay: ${p.release || 4.5}\n    damping: 40\n    diffusion: 60\n    mix: ${p.mix || 30}\n  routing: ${p.routing || 'stereo'}\n  gpu: ${p.gpu ? 'enabled' : 'disabled'}\n  oversampling: ${p.oversample ? '2x' : '1x'}\n}}`,
            delay: `// RDSL: Digital Delay
// Generated from natural language input
{{\n  type: DELAY\n  version: 1.0\n  params:\n    delay_time: ${(p.rate ? 1000 / p.rate : 300).toFixed(0)}\n    feedback: ${p.feedback || 35}\n    mix: ${p.mix || 40}\n    pingpong: false\n  routing: ${p.routing || 'stereo'}\n  oversampling: 1x\n}}`,
            saturator: `// RDSL: Analog Saturation
// Generated from natural language input
{{\n  type: SATURATOR\n  version: 1.0\n  params:\n    drive: ${p.depth || 40}\n    saturation: ${p.ratio || 60}\n    tone: 50\n    mix: ${p.mix || 50}\n  model: ${p.saturation || 'tube'}\n  character: ${p.character || 'vintage'}\n  oversampling: ${p.oversample ? '4x' : '2x'}\n  gpu: ${p.gpu ? 'enabled' : 'disabled'}\n}}`,
            gate: `// RDSL: Noise Gate
// Generated from natural language input
{{\n  type: NOISE_GATE\n  version: 1.0\n  params:\n    threshold: ${p.threshold !== undefined ? -p.threshold : -40}\n    attack: ${p.attack || 1}\n    release: ${p.release || 50}\n    range: 60\n    hysteresis: 3\n  routing: ${p.routing || 'stereo'}${p.sidechain ? '\n  sidechain: true' : ''}\n}}`,
            phaser: `// RDSL: Modulation Effect
// Generated from natural language input
{{\n  type: MODULATION\n  version: 1.0\n  params:\n    rate: ${p.rate || 0.5}\n    depth: ${p.depth || 60}\n    feedback: ${p.feedback || 30}\n    mix: ${p.mix || 50}\n  mode: phaser\n  routing: ${p.routing || 'stereo'}\n}}`,
            synth: `// RDSL: Synthesizer
// Generated from natural language input
{{\n  type: SYNTHESIZER\n  version: 1.0\n  oscillators: 2\n  params:\n    waveform_1: saw\n    waveform_2: square\n    detune: 5\n    filter_freq: ${p.freq || 2000}\n    filter_resonance: ${p.q || 2}\n    attack: ${p.attack || 10}\n    release: ${p.release || 200}\n    volume: -6\n  gpu: ${p.gpu ? 'enabled' : 'disabled'}\n  oversampling: 2x\n}}`,
            analyzer: `// RDSL: Spectrum Analyzer
// Generated from natural language input
{{\n  type: ANALYZER\n  version: 1.0\n  params:\n    fft_size: 4096\n    window: hann\n    smoothing: 0.5\n    range_min: 20\n    range_max: 20000\n  routing: ${p.routing || 'stereo'}\n  gpu: enabled\n}}`,
            vocal: `// RDSL: Vocal Processor
// Generated from natural language input
{{\n  type: VOCAL_PROCESSOR\n  version: 1.0\n  chain:\n    - deesser\n    - compressor\n    - eq\n    - saturator\n  params:\n    deesser_freq: 7000\n    compressor_ratio: ${p.ratio || 3}\n    compressor_attack: ${p.attack || 5}\n    compressor_release: ${p.release || 80}\n    eq_low: 0\n    eq_high: ${p.gain || 2}\n    saturator_drive: 20\n    mix: ${p.mix || 100}\n  routing: ${p.routing || 'stereo'}\n}}`,
            master: `// RDSL: Mastering Processor
// Generated from natural language input
{{\n  type: MASTERING_CHAIN\n  version: 1.0\n  params:\n    ceiling: ${p.gain !== undefined ? -Math.abs(p.gain) : -0.5}\n    threshold: ${p.threshold !== undefined ? -p.threshold : -12}\n    release: ${p.release || 20}\n    dither: 24\n    loudness_target: -14\n    true_peak: true\n  oversampling: 4x\n  gpu: enabled\n}}`,
            custom: `// RDSL: Custom Processor
// Generated from natural language input
{{\n  type: CUSTOM_PROCESSOR\n  version: 1.0\n  author: user\n  description: "Custom plugin generated from description"\n  params:\n    param_a: 50\n    param_b: 100\n    param_c: 25\n  routing: ${p.routing || 'stereo'}\n  gpu: ${p.gpu ? 'enabled' : 'disabled'}\n  oversampling: ${p.oversample ? '2x' : '1x'}\n}}`
        };
        return this.decorateGeneratedTemplate(templates[intent] || templates.custom, intent);
    }

    generateDriver(result) {
        const { intent, params, type } = result;
        const p = params;
        const drivers = {
            compressor: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    ratio: ${p.ratio || 4},
    threshold: ${p.threshold !== undefined ? -p.threshold : -18},
    attack: ${p.attack || 10},
    release: ${p.release || 100},
    knee: ${p.knee || 3},
    makeup_gain: ${p.gain || 6}
  },
  routing: '${p.routing || 'stereo'}',
  gpu: ${!!p.gpu},
  oversampling: ${p.oversample ? 4 : 1}
});`,
            eq: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    low_gain: ${p.gain || 2},
    low_freq: 80,
    low_mid_gain: 0,
    low_mid_freq: 500,
    high_mid_gain: 1,
    high_mid_freq: 2000,
    high_gain: ${p.gain || 3},
    high_freq: 8000,
    q: ${p.q || 2.5}
  },
  routing: '${p.routing || 'stereo'}',
  gpu: ${!!p.gpu}
});`,
            reverb: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    size: ${p.depth || 60},
    decay: ${p.release || 4.5},
    damping: 40,
    diffusion: 60,
    mix: ${p.mix || 30}
  },
  routing: '${p.routing || 'stereo'}',
  gpu: ${!!p.gpu},
  oversampling: ${p.oversample ? 2 : 1}
});`,
            delay: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    delay_time: ${(p.rate ? 1000 / p.rate : 300).toFixed(0)},
    feedback: ${p.feedback || 35},
    mix: ${p.mix || 40},
    pingpong: false
  },
  routing: '${p.routing || 'stereo'}'
});`,
            saturator: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    drive: ${p.depth || 40},
    saturation: ${p.ratio || 60},
    tone: 50,
    mix: ${p.mix || 50}
  },
  model: '${p.saturation || 'tube'}',
  character: '${p.character || 'vintage'}',
  gpu: ${!!p.gpu},
  oversampling: ${p.oversample ? 4 : 2}
});`,
            gate: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    threshold: ${p.threshold !== undefined ? -p.threshold : -40},
    attack: ${p.attack || 1},
    release: ${p.release || 50},
    range: 60,
    hysteresis: 3
  },
  routing: '${p.routing || 'stereo'}',
  sidechain: ${!!p.sidechain}
});`,
            phaser: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    rate: ${p.rate || 0.5},
    depth: ${p.depth || 60},
    feedback: ${p.feedback || 30},
    mix: ${p.mix || 50}
  },
  mode: 'phaser',
  routing: '${p.routing || 'stereo'}'
});`,
            synth: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    waveform_1: 'saw',
    waveform_2: 'square',
    detune: 5,
    filter_freq: ${p.freq || 2000},
    filter_resonance: ${p.q || 2},
    attack: ${p.attack || 10},
    release: ${p.release || 200},
    volume: -6
  },
  gpu: ${!!p.gpu},
  oversampling: ${p.oversample ? 2 : 1}
});`,
            analyzer: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    fft_size: 4096,
    window: 'hann',
    smoothing: 0.5,
    range_min: 20,
    range_max: 20000
  },
  routing: '${p.routing || 'stereo'}',
  gpu: true
});`,
            vocal: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    deesser_freq: 7000,
    compressor_ratio: ${p.ratio || 3},
    compressor_attack: ${p.attack || 5},
    compressor_release: ${p.release || 80},
    eq_low: 0,
    eq_high: ${p.gain || 2},
    saturator_drive: 20,
    mix: ${p.mix || 100}
  },
  routing: '${p.routing || 'stereo'}'
});`,
            master: `// RDSL Driver Configuration: ${intent}
const driver = new RDSLDriver({
  type: '${type.driver}',
  params: {
    ceiling: ${p.gain !== undefined ? -Math.abs(p.gain) : -0.5},
    threshold: ${p.threshold !== undefined ? -p.threshold : -12},
    release: ${p.release || 20},
    dither: 24,
    loudness_target: -14,
    true_peak: true
  },
  oversampling: 4,
  gpu: true
});`,
            custom: `// RDSL Driver Configuration: custom
const driver = new RDSLDriver({
  type: 'CustomProcessor',
  params: { param_a: 50, param_b: 100, param_c: 25 },
  routing: '${p.routing || 'stereo'}',
  gpu: ${!!p.gpu}
});`
        };
        return drivers[intent] || drivers.custom;
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

const rdslBot = new RDSLBot();
window.rdslBot = rdslBot;

