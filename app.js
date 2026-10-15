// Titan Audio Workstation - Main Application
/* global VoxEngine */

const PLUGIN_CATALOG = [
    { id:'aura', name:'AURA - Vintage Tube', icon:'fa-microphone-alt', color:'#ff6b9d', category:'Modeling',
      desc:'Vintage tube microphone tone shaping with proximity, presence, and air controls', params:[
        { id:'warmth', label:'Warmth', min:0, max:100, val:65 },
        { id:'presence', label:'Presence', min:0, max:100, val:45 },
        { id:'air', label:'Air', min:0, max:100, val:50 },
        { id:'proximity', label:'Proximity', min:0, max:100, val:50 }
      ]},
    { id:'eq', name:'Harrison 32 EQ', icon:'fa-sliders-h', color:'#7c5cff', category:'EQ / Filtering',
      desc:'Four-band parametric equalizer based on Harrison consoles', params:[
        { id:'low', label:'Low', min:-12, max:12, val:2 },
        { id:'lowMid', label:'Low-Mid', min:-12, max:12, val:0 },
        { id:'highMid', label:'High-Mid', min:-12, max:12, val:1 },
        { id:'high', label:'High', min:-12, max:12, val:3 }
      ]},
    { id:'compressor', name:'Analog Compressor', icon:'fa-compress-alt', color:'#22c55e', category:'Dynamics',
      desc:'VCA-style compressor with soft-knee detection', params:[
        { id:'threshold', label:'Threshold', min:-60, max:0, val:-18 },
        { id:'ratio', label:'Ratio', min:1, max:20, val:4 },
        { id:'attack', label:'Attack', min:0.1, max:100, val:10, step:0.1 },
        { id:'release', label:'Release', min:10, max:1000, val:100 },
        { id:'makeup', label:'Makeup Gain', min:0, max:24, val:6 },
        { id:'knee', label:'Knee', min:0, max:12, val:3 }
      ]},
    { id:'gate', name:'Studio Gate', icon:'fa-door-open', color:'#84cc16', category:'Dynamics',
      desc:'Noise gate with hold control for cleaning up takes', params:[
        { id:'threshold', label:'Threshold', min:-80, max:0, val:-40 },
        { id:'attack', label:'Attack', min:0.1, max:200, val:5, step:0.1 },
        { id:'release', label:'Release', min:10, max:2000, val:150 },
        { id:'hold', label:'Hold', min:0, max:1000, val:20 }
      ]},
    { id:'deeproom', name:'Deep Room', icon:'fa-square', color:'#00d4ff', category:'Reverb',
      desc:'Deep convolution reverb with room modeling', params:[
        { id:'size', label:'Room Size', min:0, max:100, val:60 },
        { id:'decay', label:'Decay', min:0.1, max:20, val:4.5, step:0.1 },
        { id:'damping', label:'Damping', min:0, max:100, val:40 },
        { id:'mix', label:'Mix', min:0, max:100, val:30 }
      ]},
    { id:'endlesshall', name:'Endless Hall', icon:'fa-archway', color:'#06b6d4', category:'Reverb',
      desc:'Infinite-sustain hall reverb for ambient textures', params:[
        { id:'length', label:'Length', min:0, max:100, val:75 },
        { id:'modulation', label:'Modulation', min:0, max:100, val:30 },
        { id:'diffusion', label:'Diffusion', min:0, max:100, val:60 },
        { id:'color', label:'Color', min:0, max:100, val:50 }
      ]},
    { id:'delay', name:'Studio Delay', icon:'fa-history', color:'#ffd23f', category:'Time',
      desc:'Tempo delay with feedback, tone filtering and modulation', params:[
        { id:'time', label:'Time', min:20, max:1800, val:250 },
        { id:'feedback', label:'Feedback', min:0, max:95, val:35 },
        { id:'mix', label:'Mix', min:0, max:100, val:35 },
        { id:'mod', label:'Modulation', min:0, max:100, val:20 }
      ]},
    { id:'eventhorizon', name:'Event Horizon', icon:'fa-eye', color:'#f59e0b', category:'Effects',
      desc:'Extreme signal destruction and glitch effects', params:[
        { id:'bitcrush', label:'Bit Depth', min:1, max:16, val:8 },
        { id:'downsample', label:'Sample Drop', min:1, max:32, val:4 },
        { id:'drive', label:'Drive', min:0, max:100, val:30 },
        { id:'chaos', label:'Chaos', min:0, max:100, val:20 }
      ]},
    { id:'resokill', name:'Resonance Killer', icon:'fa-times-circle', color:'#ef4444', category:'Filtering',
      desc:'Adaptive resonance suppression and notch filtering', params:[
        { id:'freq', label:'Center Freq', min:20, max:20000, val:500 },
        { id:'q', label:'Q Factor', min:1, max:50, val:10 },
        { id:'depth', label:'Depth', min:0, max:100, val:60 },
        { id:'sensitivity', label:'Sensitivity', min:0, max:100, val:50 }
      ]},
    { id:'neuralheat', name:'Harmonic Heat', icon:'fa-fire', color:'#f97316', category:'Saturation',
      desc:'Harmonic exciter with adaptive saturation and tone shaping', params:[
        { id:'drive', label:'Drive', min:0, max:100, val:40 },
        { id:'tone', label:'Tone', min:0, max:100, val:50 },
        { id:'harmonics', label:'Harmonics', min:0, max:100, val:60 },
        { id:'mix', label:'Mix', min:0, max:100, val:50 }
      ]},
    { id:'prism', name:'Prism', icon:'fa-gem', color:'#d946ef', category:'Spectral',
      desc:'Multi-band spectral processor with frequency splitting', params:[
        { id:'bands', label:'Bands', min:2, max:8, val:4 },
        { id:'spread', label:'Spread', min:0, max:100, val:50 },
        { id:'shift', label:'Shift', min:-12, max:12, val:0 },
        { id:'wet', label:'Wet/Dry', min:0, max:100, val:60 }
      ]},
    { id:'quantum', name:'Quantum', icon:'fa-atom', color:'#06b6d4', category:'Multi-Band',
      desc:'Quantum multi-band transient shaper and dynamics', params:[
        { id:'attack', label:'Attack', min:0, max:100, val:40 },
        { id:'sustain', label:'Sustain', min:0, max:100, val:60 },
        { id:'crossover', label:'Crossover', min:100, max:2000, val:400 },
        { id:'mix', label:'Mix', min:0, max:100, val:50 }
      ]},
    { id:'diamond', name:'Diamond', icon:'fa-gem', color:'#e2e2f0', category:'EQ / Filtering',
      desc:'Transparent surgical EQ with linear phase response', params:[
        { id:'lowShelf', label:'Low Shelf', min:-12, max:12, val:0 },
        { id:'highShelf', label:'High Shelf', min:-12, max:12, val:0 },
        { id:'q', label:'Precision', min:1, max:10, val:5 },
        { id:'trim', label:'Trim', min:-6, max:6, val:0 }
      ]},
    { id:'gravity', name:'Gravity', icon:'fa-magnet', color:'#8b5cf6', category:'Saturation',
      desc:'Magnetic tape saturation and tube warmth emulation', params:[
        { id:'saturate', label:'Saturation', min:0, max:100, val:40 },
        { id:'flux', label:'Flux', min:0, max:100, val:30 },
        { id:'bias', label:'Bias', min:-50, max:50, val:0 },
        { id:'mix', label:'Mix', min:0, max:100, val:50 }
      ]},
    { id:'exabyte', name:'Exabyte', icon:'fa-tape', color:'#84cc16', category:'Saturation',
      desc:'Classic tape machine emulation with flutter and compression', params:[
        { id:'speed', label:'Speed', min:0, max:100, val:50 },
        { id:'flux', label:'Flutter', min:0, max:100, val:20 },
        { id:'saturation', label:'Saturation', min:0, max:100, val:45 },
        { id:'wow', label:'Wow', min:0, max:100, val:15 }
      ]},
    { id:'titanium', name:'Titanium Console', icon:'fa-server', color:'#a1a1aa', category:'Channel Strip',
      desc:'Full channel strip with preamp, EQ, and dynamics', params:[
        { id:'gain', label:'Preamp Gain', min:0, max:60, val:24 },
        { id:'low', label:'Low EQ', min:-12, max:12, val:0 },
        { id:'mid', label:'Mid EQ', min:-12, max:12, val:0 },
        { id:'high', label:'High EQ', min:-12, max:12, val:0 },
        { id:'comp', label:'Compression', min:0, max:100, val:30 }
      ]},
    { id:'master', name:'Master Processor', icon:'fa-microchip', color:'#ff6b9d', category:'Mastering',
      desc:'Mastering chain with limiter, maximizer, and dither', params:[
        { id:'ceiling', label:'Ceiling', min:-6, max:0, val:-0.5, step:0.1 },
        { id:'threshold', label:'Threshold', min:-30, max:0, val:-12 },
        { id:'release', label:'Release', min:1, max:100, val:20 },
        { id:'dither', label:'Dither', min:0, max:100, val:50 }
      ]},
    { id:'custom', name:'Custom Plugin', icon:'fa-puzzle-piece', color:'#a78bfa', category:'Utility',
      desc:'User-defined plugin with assignable parameters', params:[
        { id:'param1', label:'Parameter 1', min:0, max:100, val:50 },
        { id:'param2', label:'Parameter 2', min:0, max:100, val:50 },
        { id:'param3', label:'Parameter 3', min:0, max:100, val:50 }
      ]},
    { id:'aura_morph', name:'AURA Morph', icon:'fa-microphone-alt', color:'#ff6b9d', category:'Native UI',
      desc:'Microphone capsule modeling with immersive UI', processor:'aura_morph', ui:{ tag:'aura-morph-ui', file:'AuraMorphUI.html', paramMap:{ 'driveAmount':'driveAmount', 'proximityBoost':'proximityBoost', 'dryWetMix':'dryWetMix' } }, params:[
        { id:'warmth', label:'Warmth', min:0, max:100, val:65 },
        { id:'presence', label:'Presence', min:0, max:100, val:45 },
        { id:'air', label:'Air', min:0, max:100, val:50 },
        { id:'proximity', label:'Proximity', min:0, max:100, val:50 },
        { id:'driveAmount', label:'Drive Amount', min:0, max:100, val:55 },
        { id:'proximityBoost', label:'Proximity Boost', min:0, max:100, val:50 },
        { id:'dryWetMix', label:'Dry/Wet Mix', min:0, max:100, val:60 }
      ]},
    { id:'deep_room_ui', name:'Deep Room Pro', icon:'fa-square', color:'#00d4ff', category:'Native UI',
      desc:'Algorithmic room reverb with 3D visualizer', processor:'deep_room_ui', ui:{ tag:'deep-room-ui', file:'DeepRoomUI.html', paramMap:{ 'RoomSize':'size', 'DecayTime':'decay', 'ERDensity':'erDensity', 'ModulationDepth':'modulationDepth', 'DuckingAmount':'duckingAmount' } }, params:[
        { id:'size', label:'Room Size', min:0, max:100, val:60 },
        { id:'decay', label:'Decay', min:0.1, max:20, val:4.5, step:0.1 },
        { id:'damping', label:'Damping', min:0, max:100, val:40 },
        { id:'mix', label:'Mix', min:0, max:100, val:30 },
        { id:'erDensity', label:'ER Density', min:0, max:100, val:55 },
        { id:'modulationDepth', label:'Modulation Depth', min:0, max:100, val:28 },
        { id:'duckingAmount', label:'Ducking Amount', min:0, max:100, val:18 }
      ]},
    { id:'reso_kill_ui', name:'Resonance Killer Pro', icon:'fa-times-circle', color:'#ef4444', category:'Native UI',
      desc:'Surgical dynamic resonance suppression UI', processor:'reso_kill_ui', ui:{ tag:'reso-kill-ui', file:'ResoKillUI.html', paramMap:{ 'BaseQ':'q', 'Threshold':'threshold', 'AttackMs':'attack', 'ReleaseMs':'release', 'DynamicQEnable':'depth' } }, params:[
        { id:'freq', label:'Center Freq', min:20, max:20000, val:500 },
        { id:'q', label:'Q Factor', min:1, max:50, val:10 },
        { id:'depth', label:'Depth', min:0, max:100, val:60 },
        { id:'sensitivity', label:'Sensitivity', min:0, max:100, val:50 },
        { id:'threshold', label:'Threshold', min:-60, max:0, val:-24 },
        { id:'attack', label:'Attack', min:0.1, max:100, val:8, step:0.1 },
        { id:'release', label:'Release', min:10, max:1000, val:140 }
      ]},
    { id:'dyna_shape', name:'DynaShape', icon:'fa-wave-square', color:'#4A90E2', category:'Native UI',
      desc:'Four-band dynamic shaping processor', processor:'dyna_shape', ui:{ tag:'dyna-shape-ui', file:'DynaShapeUI.html', paramMap:{ 'Band1Threshold':'band1Threshold', 'Band2Threshold':'band2Threshold', 'Band3Threshold':'band3Threshold', 'Band4Threshold':'band4Threshold', 'Band1Ratio':'band1Ratio', 'Band2Ratio':'band2Ratio', 'Band3Ratio':'band3Ratio', 'Band4Ratio':'band4Ratio' } }, params:[
        { id:'band1Threshold', label:'Band 1 Threshold', min:-60, max:0, val:-20 },
        { id:'band2Threshold', label:'Band 2 Threshold', min:-60, max:0, val:-18 },
        { id:'band3Threshold', label:'Band 3 Threshold', min:-60, max:0, val:-16 },
        { id:'band4Threshold', label:'Band 4 Threshold', min:-60, max:0, val:-14 },
        { id:'band1Ratio', label:'Band 1 Ratio', min:1, max:20, val:2.5 },
        { id:'band2Ratio', label:'Band 2 Ratio', min:1, max:20, val:3.5 },
        { id:'band3Ratio', label:'Band 3 Ratio', min:1, max:20, val:4.5 },
        { id:'band4Ratio', label:'Band 4 Ratio', min:1, max:20, val:5.5 },
        { id:'attack', label:'Attack', min:0.1, max:100, val:10, step:0.1 },
        { id:'release', label:'Release', min:10, max:1000, val:100 }
      ]},
    { id:'echo_weave', name:'EchoWeave', icon:'fa-stream', color:'#00E5FF', category:'Native UI',
      desc:'Rhythmic tap delay with modulation', processor:'echo_weave', ui:{ tag:'echo-weave-ui', file:'EchoWeaveUI.html', paramMap:{ 'Subdivision':'time', 'FeedbackLevel':'feedback', 'PingPong':'mix', 'WowFlutterDepth':'mod', 'WowFlutterRate':'mod', 'FeedbackDistortion':'drive', 'DryWetMix':'mix' } }, params:[
        { id:'time', label:'Time', min:1, max:1000, val:250 },
        { id:'feedback', label:'Feedback', min:0, max:100, val:40 },
        { id:'mix', label:'Mix', min:0, max:100, val:35 },
        { id:'mod', label:'Modulation', min:0, max:100, val:20 },
        { id:'drive', label:'Feedback Drive', min:0, max:100, val:15 }
      ]},
    { id:'flux_core', name:'FluxCore', icon:'fa-fire-alt', color:'#F5A623', category:'Native UI',
      desc:'Multiband saturation and ambience-reduction control surface', processor:'flux_core', ui:{ tag:'flux-core-ui', file:'FluxCoreUI.html', paramMap:{ 'VocalLevel':'vocalLevel', 'DrumLevel':'drumLevel', 'BassLevel':'bassLevel', 'OtherLevel':'otherLevel', 'DeReverbAmount':'deReverbAmount' } }, params:[
        { id:'drive', label:'Drive', min:0, max:100, val:40 },
        { id:'tone', label:'Tone', min:0, max:100, val:50 },
        { id:'harmonics', label:'Harmonics', min:0, max:100, val:60 },
        { id:'mix', label:'Mix', min:0, max:100, val:50 },
        { id:'vocalLevel', label:'Vocal Level', min:0, max:100, val:65 },
        { id:'drumLevel', label:'Drum Level', min:0, max:100, val:45 },
        { id:'bassLevel', label:'Bass Level', min:0, max:100, val:40 },
        { id:'otherLevel', label:'Other Level', min:0, max:100, val:35 },
        { id:'deReverbAmount', label:'De-Reverb Amount', min:0, max:100, val:30 }
      ]},
    { id:'halo_gate', name:'HaloGate', icon:'fa-door-open', color:'#84cc16', category:'Native UI',
      desc:'Advanced noise gate with transient preservation', processor:'halo_gate', ui:{ tag:'halo-gate-ui', file:'HaloGateUI.html', paramMap:{ 'Threshold':'threshold', 'AttackMs':'attack', 'ReleaseMs':'release', 'HysteresisDepth':'depth', 'SidechainHighPass':'lowCut', 'TransientSensitivity':'mid' } }, params:[
        { id:'threshold', label:'Threshold', min:-80, max:0, val:-40 },
        { id:'attack', label:'Attack', min:0.1, max:100, val:5, step:0.1 },
        { id:'release', label:'Release', min:10, max:1000, val:150 },
        { id:'hold', label:'Hold', min:0, max:500, val:20 },
        { id:'depth', label:'Depth', min:0, max:100, val:70 },
        { id:'lowCut', label:'Sidechain HPF', min:20, max:2000, val:140 },
        { id:'mid', label:'Transient Focus', min:0, max:100, val:50 }
      ]},
    { id:'harmonic_lens', name:'HarmonicLens', icon:'fa-glasses', color:'#FF9500', category:'Native UI',
      desc:'Harmonic exciter with algorithm selector', processor:'harmonic_lens', ui:{ tag:'harmonic-lens-ui', file:'HarmonicLensUI.html', paramMap:{ 'mode':'mode', 'Drive':'drive', 'PreEQ_LowShelf':'preEqLowShelf', 'PostEQ_Tilt':'postEqTilt', 'WetDryMix':'mix', 'OutputCeiling':'ceiling' } }, params:[
        { id:'drive', label:'Drive', min:0, max:100, val:35 },
        { id:'mode', label:'Mode', min:0, max:100, val:50 },
        { id:'preEqLowShelf', label:'Pre EQ Low Shelf', min:-12, max:12, val:1 },
        { id:'postEqTilt', label:'Post EQ Tilt', min:-12, max:12, val:0 },
        { id:'mix', label:'Mix', min:0, max:100, val:100 },
        { id:'ceiling', label:'Ceiling', min:-12, max:0, val:-1 }
      ]},
    { id:'phase_lock', name:'PhaseLock', icon:'fa-arrows-alt-h', color:'#7c5cff', category:'Native UI',
      desc:'Stereo width and phase correlation UI', processor:'phase_lock', ui:{ tag:'phase-lock-ui', file:'PhaseLockUI.html', paramMap:{ 'GlobalWidth':'globalWidth', 'LowCutFrequency':'lowCut', 'HighShelfWidth':'highShelfWidth', 'MidLevel':'mid', 'SideLevel':'side' } }, params:[
        { id:'width', label:'Width', min:0, max:200, val:100 },
        { id:'globalWidth', label:'Global Width', min:0, max:200, val:100 },
        { id:'lowCut', label:'Mono Fold', min:20, max:500, val:120 },
        { id:'highShelfWidth', label:'High Shelf Width', min:0, max:200, val:110 },
        { id:'mid', label:'Mid Level', min:0, max:200, val:100 },
        { id:'side', label:'Side Level', min:0, max:200, val:100 }
      ]},
    { id:'spectra_fix', name:'SpectraFix', icon:'fa-magic', color:'#22d3ee', category:'Native UI',
      desc:'Spectral repair and click removal UI', processor:'spectra_fix', ui:{ tag:'spectra-fix-ui', file:'SpectraFixUI.html', paramMap:{ 'DetectionThreshold':'detectionThreshold', 'MaxAnomalyDurationMs':'maxAnomalyDurationMs', 'InpaintingRadius':'inpaintingRadius', 'mix':'mix' } }, params:[
        { id:'bands', label:'Bands', min:2, max:8, val:4 },
        { id:'spread', label:'Spread', min:0, max:100, val:50 },
        { id:'shift', label:'Shift', min:-12, max:12, val:0 },
        { id:'wet', label:'Wet/Dry', min:0, max:100, val:60 },
        { id:'detectionThreshold', label:'Detection Threshold', min:0, max:100, val:45 },
        { id:'maxAnomalyDurationMs', label:'Max Anomaly Duration', min:1, max:100, val:28 },
        { id:'inpaintingRadius', label:'Inpainting Radius', min:0, max:100, val:32 },
        { id:'mix', label:'Mix', min:0, max:100, val:60 }
      ]},
    { id:'velvet_bus', name:'VelvetBus', icon:'fa-bus', color:'#EAEAEA', category:'Native UI',
      desc:'Vintage console bus glue processor', processor:'velvet_bus', ui:{ tag:'velvet-bus-ui', file:'VelvetBusUI.html', paramMap:{ 'InputGain':'inputGain', 'TransformerDrive':'transformerDrive', 'SummingHeadroom':'summingHeadroom', 'OutputGain':'outputGain' } }, params:[
        { id:'inputGain', label:'Input Gain', min:-12, max:12, val:0 },
        { id:'transformerDrive', label:'Transformer Drive', min:0, max:100, val:45 },
        { id:'summingHeadroom', label:'Headroom', min:-12, max:12, val:0 },
        { id:'outputGain', label:'Output Gain', min:-12, max:12, val:0 },
        { id:'mix', label:'Mix', min:0, max:100, val:100 }
      ]},
    { id:'chrono_shift', name:'ChronoShift', icon:'fa-history', color:'#06b6d4', category:'Native UI',
      desc:'Pitch and time manipulation workspace', processor:'chrono_shift', ui:{ tag:'chrono-shift-ui', file:'ChronoShiftUI.html', paramMap:{ 'mode':'pitch', 'GrainSizeMs':'grain', 'TransientLockStrength':'stretch' } }, params:[
        { id:'pitch', label:'Pitch', min:-24, max:24, val:0 },
        { id:'formant', label:'Formant', min:-12, max:12, val:0 },
        { id:'stretch', label:'Stretch', min:0.5, max:2, val:1, step:0.01 },
        { id:'grain', label:'Grain Size', min:1, max:100, val:40 }
      ]},
    { id:'cockpit', name:'Cockpit', icon:'fa-sliders-h', color:'#00E5FF', category:'Native UI',
      desc:'Session command center', processor:'cockpit', ui:{ tag:'cockpit-ui', file:'CockpitUI.html', paramMap:{} }, params:[
        { id:'param1', label:'Parameter 1', min:0, max:100, val:50 }
      ]},
    { id:'vox_genesis', name:'VoxGenesis', icon:'fa-microphone', color:'#ff6b9d', category:'Native UI',
      desc:'Local vocal processor with live/audio voice-print capture and a real singing-model adapter path', processor:'vox_genesis', ui:{ tag:'vox-genesis-ui', file:'VoxGenesisUI.html', paramMap:{ 'texture':'param1', 'formant':'param2', 'focus':'param3', 'naturalness':'param4', 'tightness':'param5', 'sibilance':'param6' } }, params:[
        { id:'param1', label:'Texture', min:0, max:100, val:50 },
        { id:'param2', label:'Formant', min:0, max:100, val:50 },
        { id:'param3', label:'Focus', min:0, max:100, val:55 },
        { id:'param4', label:'Natural', min:0, max:100, val:65 },
        { id:'param5', label:'Tightness', min:0, max:100, val:50 },
        { id:'param6', label:'Sibilance', min:0, max:100, val:50 }
      ]}
];

const TITAN_DEFAULT_TRACK_IDS = [1, 2, 3, 4];
const TITAN_WORKING_SESSION_KEY = 'titanWorkingSession.v1';
const TITAN_AUDIO_DB_NAME = 'Titan7ProDAW';
const TITAN_AUDIO_STORE = 'audioClips';
const TITAN_DAW_COLLAB_SESSION_KEY = 'titanDawSessionId.v1';
const TITAN_DAW_COLLAB_SESSION_PARAM = 'session';
const TITAN_AURA_CALIBRATION_KEY = 'titanAuraCalibration.v1';
const TITAN_AURA_ACTIVE_PROFILE_KEY = 'titanAuraActiveProfile.v1';
const TITAN_AURA_TARGET_NAMES = {
    vintagetube: 'Vintage Tube',
    studiofet: 'Studio FET',
    modernair: 'Modern Air',
    silkytube: 'Silky Tube',
    cleardetail: 'Clear Detail'
};

const TITAN_BUS_OPTIONS = [
    { id: 'master', label: 'Stereo Out' },
    { id: 'busA', label: 'Bus 1-2' },
    { id: 'busB', label: 'Bus 3-4' }
];

const TITAN_BUS_LABELS = TITAN_BUS_OPTIONS.reduce((map, bus) => {
    map[bus.id] = bus.label;
    return map;
}, {});

const TITAN_AUTOMATION_TRACK_LANES = [
    { id: 'volume', label: 'Volume', min: 0, max: 1, step: 0.01 },
    { id: 'pan', label: 'Pan', min: -1, max: 1, step: 0.01 },
    { id: 'send-busA', label: 'Send Bus 1-2', min: 0, max: 1, step: 0.01 },
    { id: 'send-busB', label: 'Send Bus 3-4', min: 0, max: 1, step: 0.01 }
];

class TitanAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.analyser = null;
        // v2.0.3 master safety limiter (final master stage, defeatable)
        this.safetyComp = null;
        this.safetyShaper = null;
        this.masterSafetyOn = true;
        this.trackGains = new Map();
        this.busGains = new Map();
        this.meters = { left: 0, right: 0 };
        this.busMeters = new Map();
        this.meterInterval = null;
        this.inputStream = null;
        this.inputSource = null;
        this.inputGain = null;
        this.recording = false;
        this.recordBuffers = [];
        this.recordStartTime = 0;
        this.inputAnalyser = null;
        this.inputMeterInterval = null;
        this.workletNode = null;
        this.monitorGains = new Map();
        this.inputLevel = 0;
        this.recordingChannelCount = 1;
        this.recordingSinkNode = null;
    }

    async init() {
        const sampleRate = 48000;
        const AudioContextClass = window.AudioContext || (window).webkitAudioContext;
        this.ctx = new AudioContextClass({ sampleRate, latencyHint: 'interactive' });
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.85;
        // v2.0.3 master safety limiter: transparent peak protection as the final
        // master stage. A fast high-ratio compressor catches sustained overs;
        // a tanh soft-clipper catches transient peaks. Defeatable via
        // setMasterSafetyLimiter() — never forced on the user.
        this.safetyComp = this.ctx.createDynamicsCompressor();
        this.safetyShaper = this.ctx.createWaveShaper();
        this.safetyShaper.oversample = '4x';
        this._applyMasterSafetyState();
        this.masterGain.connect(this.safetyComp);
        this.safetyComp.connect(this.safetyShaper);
        this.safetyShaper.connect(this.ctx.destination);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.safetyShaper.connect(this.analyser); // post-limiter metering
        this.createBusStages();
        this.inputGain = this.ctx.createGain();
        this.inputGain.gain.value = 0;
        this.inputGain.connect(this.masterGain);
        this.inputAnalyser = this.ctx.createAnalyser();
        this.inputAnalyser.fftSize = 256;
        this.inputGain.connect(this.inputAnalyser);
        this.initInput().catch(() => {});
        this.startMetering();
        // v2.0.3: calibrate WaveShaper oversample latency in the background;
        // refresh delay compensation once the real numbers land.
        this._calibrateShaperLatency().then(() => {
            try {
                if (typeof window !== 'undefined' && window.dawApp
                    && typeof window.dawApp.updateDelayCompensation === 'function') {
                    window.dawApp.updateDelayCompensation();
                }
            } catch (_) {}
        }).catch(() => {});
    }

    get sampleRate() { return this.ctx?.sampleRate || 48000; }
    async ensureResumed() { if (this.ctx?.state === 'suspended') await this.ctx.resume(); }

    /**
     * Transparent soft-clip curve for the master safety limiter.
     * NOTE (adversarial-pass fix): a WaveShaper maps input [-1,1] across the
     * whole table, so the curve MUST be authored in input-voltage space.
     * Unity gain below the knee (0.8 ~= -1.9 dB), tanh-rounded above,
     * reaching 0.95 at full scale; hotter inputs clamp to the endpoints
     * (bounded, never hard digital overshoot). The DynamicsCompressor stage
     * ahead of it does the heavy lifting on sustained overs.
     */
    static makeSoftClipCurve(n = 2048) {
        const curve = new Float32Array(n);
        const knee = 0.8;
        for (let i = 0; i < n; i++) {
            const x = (i / (n - 1)) * 2 - 1; // input voltage, -1..1
            const ax = Math.abs(x);
            const y = ax <= knee ? ax : knee + (1 - knee) * Math.tanh((ax - knee) / (1 - knee));
            curve[i] = Math.sign(x) * y;
        }
        return curve;
    }

    /** Identity curve — the limiter's defeated/bypassed state. */
    static makeLinearCurve(n = 1024) {
        const curve = new Float32Array(n);
        for (let i = 0; i < n; i++) curve[i] = (i / (n - 1)) * 2 - 1;
        return curve;
    }

    _applyMasterSafetyState() {
        const on = this.masterSafetyOn !== false;
        if (this.safetyComp) {
            // Bypass = neutral compressor (threshold 0 dB, ratio 1:1): no rewiring needed.
            this.safetyComp.threshold.value = on ? -1.5 : 0;
            this.safetyComp.knee.value = 0;
            this.safetyComp.ratio.value = on ? 20 : 1;
            this.safetyComp.attack.value = 0.002;
            this.safetyComp.release.value = 0.1;
        }
        if (this.safetyShaper) {
            this.safetyShaper.curve = on
                ? TitanAudioEngine.makeSoftClipCurve()
                : TitanAudioEngine.makeLinearCurve();
        }
    }

    /** Defeatable master safety limiter. Returns the new state. */
    setMasterSafetyLimiter(on) {
        this.masterSafetyOn = !!on;
        this._applyMasterSafetyState();
        return this.masterSafetyOn;
    }

    isMasterSafetyLimiterOn() { return this.masterSafetyOn !== false; }

    /**
     * v2.0.3 PDC: master-chain processing latency in samples. The safety
     * chain (DynamicsCompressor + 4x-oversampled WaveShaper) sits after the
     * master gain, so its delay is common to every track and needs no
     * per-track compensation — but it is part of the total latency accounting.
     * Note the shaper keeps its 4x oversample (and its latency) even when the
     * limiter is defeated, since only the curve is swapped for identity.
     */
    getMasterChainLatencySamples() {
        if (!this.ctx || !this.safetyShaper) return 0;
        const table = (typeof PluginProcessor !== 'undefined' && PluginProcessor.shaperLatencySamples)
            || { '2x': 32, '4x': 64 };
        return table['4x'] || 0;
    }

    async analyzeVocalContent(audioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const windowSize = Math.floor(sampleRate * 0.05);
        const energies = [];

        for (let i = 0; i < channelData.length; i += windowSize) {
            let sum = 0;
            const end = Math.min(i + windowSize, channelData.length);
            for (let j = i; j < end; j++) sum += channelData[j] * channelData[j];
            energies.push(sum / (end - i));
        }

        const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
        const dynamicRange = Math.max(...energies) / (Math.min(...energies) || 1);

        let totalCentroid = 0;
        const fftSize = 1024;
        for (let offset = 0; offset < channelData.length - fftSize; offset += fftSize) {
            let weightedSum = 0;
            let magnitudeSum = 0;
            for (let k = 0; k < fftSize; k++) {
                const sample = channelData[offset + k] || 0;
                const magnitude = Math.abs(sample);
                weightedSum += k * magnitude;
                magnitudeSum += magnitude;
            }
            totalCentroid += magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
        }
        const avgSpectralCentroid = totalCentroid / Math.ceil(channelData.length / fftSize);

        const isVocalLike =
            avgEnergy > 0.001 &&
            dynamicRange > 2 &&
            dynamicRange < 50 &&
            avgSpectralCentroid > 500 &&
            avgSpectralCentroid < 4000;

        return isVocalLike;
    }

    async initInput() {
        try {
            if (this.inputStream && this.inputSource) return;
            this.inputStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: { ideal: 2 }
                }
            });
            if (this.ctx) {
                this.inputSource = this.ctx.createMediaStreamSource(this.inputStream);
                if (this.inputGain) this.inputSource.connect(this.inputGain);
                this.monitorGains.forEach((monitorGain) => {
                    this.inputSource.connect(monitorGain);
                });
            }
        } catch (_e) {}
    }

    setInputMonitoring(on) { if (this.inputGain) this.inputGain.gain.value = on ? 0.85 : 0; }

    createBusStages() {
        if (!this.ctx || !this.masterGain || !this.analyser) return;
        this.busGains.clear();
        this.busMeters.clear();
        this.busGains.set('master', {
            id: 'master',
            label: TITAN_BUS_LABELS.master,
            node: this.masterGain,
            analyser: this.analyser
        });
        this.busMeters.set('master', { left: 0, right: 0 });
        TITAN_BUS_OPTIONS.filter((bus) => bus.id !== 'master').forEach((bus) => {
            const input = this.ctx.createGain();
            const node = this.ctx.createGain();
            node.gain.value = 1;
            const analyser = this.ctx.createAnalyser();
            analyser.fftSize = 256;
            input.connect(node);
            node.connect(analyser);
            node.connect(this.masterGain);
            this.busGains.set(bus.id, {
                id: bus.id,
                label: bus.label,
                input,
                node,
                analyser
            });
            this.busMeters.set(bus.id, { left: 0, right: 0 });
        });
    }

    routeTrackGainNode(trackId, outputBusId = 'master') {
        const entry = this.trackGains.get(trackId);
        if (!entry) return 'master';
        const normalizedBusId = this.busGains.has(outputBusId) ? outputBusId : 'master';
        try { entry.volumeNode.disconnect(); } catch (_) {}
        const target = normalizedBusId === 'master'
            ? this.masterGain
            : this.busGains.get(normalizedBusId)?.input || this.masterGain;
        entry.volumeNode.connect(target);
        entry.outputBusId = normalizedBusId;
        return normalizedBusId;
    }

    createTrackGain(trackId, outputBusId = 'master') {
        if (!this.ctx || !this.masterGain) return null;
        const node = this.ctx.createGain();
        const panner = this.ctx.createStereoPanner();
        const volumeNode = this.ctx.createGain();
        node.gain.value = 1;
        panner.pan.value = 0;
        volumeNode.gain.value = 0.75;
        // v2.0.3 PDC: per-track delay-compensation node. Plugin chains connect
        // through it (see playAudioClip); updateDelayCompensation() sets its
        // delay so all tracks stay sample-aligned. delayTime 0 = passthrough.
        const pdcNode = this.ctx.createDelay(1.0);
        pdcNode.delayTime.value = 0;
        node.connect(panner);
        panner.connect(volumeNode);
        // v2.0.3 PDC: compensation node permanently wired ahead of the track
        // input. Plugin chains and clip gains feed entry.pdcNode; the live
        // monitor path feeds entry.node directly (monitoring stays undelayed).
        pdcNode.connect(node);
        const sendGains = new Map();
        TITAN_BUS_OPTIONS.filter((bus) => bus.id !== 'master').forEach((bus) => {
            const sendGain = this.ctx.createGain();
            sendGain.gain.value = 0;
            panner.connect(sendGain);
            const targetBus = this.busGains.get(bus.id)?.input;
            if (targetBus) sendGain.connect(targetBus);
            sendGains.set(bus.id, sendGain);
        });
        this.trackGains.set(trackId, {
            node,
            panner,
            volumeNode,
            pdcNode,
            sendGains,
            muted: false,
            soloed: false,
            volume: 0.75,
            pan: 0,
            outputBusId: 'master'
        });
        this.routeTrackGainNode(trackId, outputBusId);
        const monitorGain = this.ctx.createGain();
        monitorGain.gain.value = 0;
        monitorGain.connect(node);
        this.monitorGains.set(trackId, monitorGain);
        if (this.inputSource) this.inputSource.connect(monitorGain);
        return node;
    }

    setTrackMonitor(trackId, on) {
        const monitorGain = this.monitorGains.get(trackId);
        if (monitorGain) monitorGain.gain.value = on ? 1 : 0;
    }

    setTrackOutput(trackId, outputBusId) {
        const entry = this.trackGains.get(trackId);
        if (!entry) return 'master';
        return this.routeTrackGainNode(trackId, outputBusId);
    }

    getTrackOutput(trackId) {
        return this.trackGains.get(trackId)?.outputBusId || 'master';
    }

    setTrackPan(trackId, pan) {
        const entry = this.trackGains.get(trackId);
        if (!entry?.panner) return 0;
        const normalizedPan = Math.max(-1, Math.min(1, Number(pan) || 0));
        entry.pan = normalizedPan;
        entry.panner.pan.value = normalizedPan;
        return normalizedPan;
    }

    getTrackPan(trackId) {
        return this.trackGains.get(trackId)?.pan || 0;
    }

    setTrackSendLevel(trackId, busId, value01) {
        const entry = this.trackGains.get(trackId);
        const sendGain = entry?.sendGains?.get(busId);
        if (!sendGain) return 0;
        const normalizedValue = Math.max(0, Math.min(1, Number(value01) || 0));
        sendGain.gain.value = normalizedValue;
        return normalizedValue;
    }

    getTrackSendLevel(trackId, busId) {
        const entry = this.trackGains.get(trackId);
        const sendGain = entry?.sendGains?.get(busId);
        return sendGain?.gain?.value ?? 0;
    }

    setBusVolume(busId, value01) {
        const normalizedValue = Math.max(0, Math.min(1.25, Number(value01) || 0));
        if (busId === 'master') {
            if (this.masterGain) this.masterGain.gain.value = normalizedValue;
            return normalizedValue;
        }
        const busEntry = this.busGains.get(busId);
        if (busEntry?.node?.gain) busEntry.node.gain.value = normalizedValue;
        return normalizedValue;
    }

    getBusVolume(busId) {
        if (busId === 'master') return this.masterGain?.gain?.value ?? 0.85;
        return this.busGains.get(busId)?.node?.gain?.value ?? 1;
    }

    getBusInput(busId) {
        if (busId === 'master') return this.masterGain;
        return this.busGains.get(busId)?.input || this.masterGain;
    }

    anyMonitorActive() { return Array.from(this.monitorGains.values()).some(g => g.gain.value > 0); }

    _computeStereoMeterFromAnalyser(analyser) {
        if (!analyser) return { left: 0, right: 0 };
        const dataArray = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatTimeDomainData(dataArray);
        let sumL = 0;
        let sumR = 0;
        const half = dataArray.length >> 1;
        for (let i = 0; i < half; i++) {
            const absL = Math.abs(dataArray[i]);
            const absR = Math.abs(dataArray[half + i] || 0);
            sumL += absL * absL;
            sumR += absR * absR;
        }
        return {
            left: Math.min(1, Math.sqrt(sumL / half) * 2.5),
            right: Math.min(1, Math.sqrt(sumR / half) * 2.5)
        };
    }

    getBusMeterLevels() {
        return TITAN_BUS_OPTIONS.map((bus) => ({
            id: bus.id,
            label: bus.label,
            ...this.busMeters.get(bus.id) || { left: 0, right: 0 }
        }));
    }

    _reapplyGain(entry) {
        const outputNode = entry.volumeNode || entry.node;
        if (entry.muted) { outputNode.gain.value = 0; return; }
        const anySoloed = Array.from(this.trackGains.values()).some(e => e.soloed);
        if (anySoloed && !entry.soloed) { outputNode.gain.value = 0; return; }
        outputNode.gain.value = entry.volume;
    }

    setTrackVolume(trackId, value01) {
        const entry = this.trackGains.get(trackId);
        if (entry) { entry.volume = value01; this._reapplyGain(entry); }
    }

    toggleMute(trackId) {
        const entry = this.trackGains.get(trackId);
        if (entry) { entry.muted = !entry.muted; this._reapplyGain(entry); return entry.muted; }
        return false;
    }

    toggleSolo(trackId) {
        const entry = this.trackGains.get(trackId);
        if (entry) {
            entry.soloed = !entry.soloed;
            Array.from(this.trackGains.entries()).forEach(([id, e]) => this._reapplyGain(e));
            return entry.soloed;
        }
        return false;
    }

    // v2.0.3: AudioWorklet capture module (replaces deprecated ScriptProcessorNode).
    // Loaded once per AudioContext; falls back to ScriptProcessor on failure.
    _ensureCaptureWorklet() {
        if (!this.ctx || !this.ctx.audioWorklet) {
            return Promise.reject(new Error('AudioWorklet not available'));
        }
        if (!this._captureWorkletModulePromise) {
            const url = new URL('titan-capture-processor.js', document.baseURI).toString();
            this._captureWorkletModulePromise = this.ctx.audioWorklet.addModule(url);
        }
        return this._captureWorkletModulePromise;
    }

    // v2.0.3: runtime calibration of WaveShaper oversample latency (samples).
    // Chromium does not expose the resampler group delay, so we measure it
    // once per AudioContext with an OfflineAudioContext impulse test.
    _calibrateShaperLatency() {
        if (this._shaperLatencyPromise) return this._shaperLatencyPromise;
        this._shaperLatencyPromise = (async () => {
            const result = { '2x': 32, '4x': 64 }; // documented fallback estimates
            try {
                const sr = this.ctx ? this.ctx.sampleRate : 48000;
                const measure = async (oversample) => {
                    const len = sr;
                    const octx = new OfflineAudioContext(1, len, sr);
                    const src = octx.createBufferSource();
                    const buf = octx.createBuffer(1, len, sr);
                    buf.getChannelData(0)[1000] = 1.0;
                    src.buffer = buf;
                    const ws = octx.createWaveShaper();
                    ws.oversample = oversample;
                    const n = 64, curve = new Float32Array(n);
                    for (let i = 0; i < n; i++) curve[i] = (i / (n - 1)) * 2 - 1;
                    ws.curve = curve;
                    src.connect(ws);
                    ws.connect(octx.destination);
                    src.start(0);
                    const rendered = await octx.startRendering();
                    const ch = rendered.getChannelData(0);
                    let peak = 0, idx = -1;
                    for (let i = 900; i < 1400; i++) {
                        const a = Math.abs(ch[i]);
                        if (a > peak) { peak = a; idx = i; }
                    }
                    return idx >= 0 ? idx - 1000 : 0;
                };
                const ref = await measure('none');
                const l2 = await measure('2x');
                const l4 = await measure('4x');
                result['2x'] = Math.max(0, l2 - ref);
                result['4x'] = Math.max(0, l4 - ref);
                console.log('[titan] WaveShaper oversample latency calibrated (samples):', result);
            } catch (err) {
                console.warn('[titan] Shaper latency calibration failed, using fallback:', err.message);
            }
            if (typeof PluginProcessor !== 'undefined' && PluginProcessor.setShaperLatency) {
                PluginProcessor.setShaperLatency(result);
            }
            this._shaperLatency = result;
            return result;
        })();
        return this._shaperLatencyPromise;
    }

    async startRecording() {
        if (this.recording || !this.inputSource || !this.ctx) return false;
        const trackSettings = this.inputStream?.getAudioTracks?.()[0]?.getSettings?.();
        const channelCount = Math.max(1, Math.min(2, trackSettings?.channelCount || this.inputSource.channelCount || 1));
        this.recordingChannelCount = channelCount;
        this.recordBuffers = Array.from({ length: channelCount }, () => []);
        this.recordStartTime = this.ctx.currentTime;
        // v2.0.3: audio-clock anchor for sample-accurate punch trimming.
        this.recordStartCtxTime = this.ctx.currentTime;
        this.recordStartWorkletCtxTime = -1;

        // Preferred path: AudioWorklet capture (modern standard).
        try {
            await this._ensureCaptureWorklet();
            const node = new AudioWorkletNode(this.ctx, 'titan-capture-processor', {
                numberOfInputs: 1,
                numberOfOutputs: 0,
                processorOptions: { chunkSize: 4096, channelCount, mode: 'capture' },
            });
            node.port.onmessage = (e) => {
                const m = e.data;
                if (!m || m.type !== 'titan-chunk' || !this.recording) return;
                if (this.recordStartWorkletCtxTime < 0 && m.startCtxTime >= 0) {
                    this.recordStartWorkletCtxTime = m.startCtxTime;
                }
                for (let channel = 0; channel < this.recordingChannelCount; channel++) {
                    const src = m.chunks[Math.min(channel, m.chunks.length - 1)];
                    this.recordBuffers[channel].push(src instanceof Float32Array ? src : new Float32Array(src));
                }
            };
            this.recordingNode = node;
            this.recordingSinkNode = null;
            this._recordingIsWorklet = true;
            this.inputSource.connect(node);
            this.recording = true;
            return true;
        } catch (err) {
            console.warn('[titan] AudioWorklet capture unavailable, using ScriptProcessor fallback:', err && err.message);
        }

        // Fallback: deprecated ScriptProcessorNode (kept for old browsers).
        const scriptNode = this.ctx.createScriptProcessor(4096, channelCount, channelCount);
        const sinkNode = this.ctx.createGain();
        sinkNode.gain.value = 0;
        this.recordingNode = scriptNode;
        this.recordingSinkNode = sinkNode;
        this._recordingIsWorklet = false;
        this.inputSource.connect(scriptNode);
        scriptNode.connect(sinkNode);
        sinkNode.connect(this.ctx.destination);
        scriptNode.onaudioprocess = (e) => {
            if (!this.recording) return;
            for (let channel = 0; channel < this.recordingChannelCount; channel++) {
                const sourceChannel = Math.min(channel, e.inputBuffer.numberOfChannels - 1);
                const data = e.inputBuffer.getChannelData(Math.max(0, sourceChannel));
                this.recordBuffers[channel].push(new Float32Array(data));
            }
        };
        this.recording = true;
        return true;
    }

    stopRecording() {
        if (!this.recording || !this.ctx) return null;
        this.recording = false;
        if (this.recordingNode) {
            try {
                if (this._recordingIsWorklet && this.recordingNode.port) {
                    this.recordingNode.port.postMessage({ type: 'flush' });
                }
            } catch (_) {}
            // NOTE: flush is best-effort; already-posted chunks are complete.
            // The partial tail (< 4096 samples) is intentionally not waited on,
            // matching v2.0.2 behavior where the trailing partial buffer was lost.
            this.recordingNode.disconnect();
            this.recordingNode = null;
        }
        this._recordingIsWorklet = false;
        if (this.recordingSinkNode) {
            this.recordingSinkNode.disconnect();
            this.recordingSinkNode = null;
        }
        const channelBuffers = Array.isArray(this.recordBuffers) ? this.recordBuffers : [];
        const totalLen = channelBuffers.reduce((maxLength, channelChunks) => {
            const channelLength = channelChunks.reduce((sum, chunk) => sum + chunk.length, 0);
            return Math.max(maxLength, channelLength);
        }, 0);
        const channelCount = Math.max(1, channelBuffers.length || this.recordingChannelCount || 1);
        const audioBuffer = this.ctx.createBuffer(channelCount, totalLen, this.ctx.sampleRate);
        channelBuffers.forEach((channelChunks, channel) => {
            const merged = new Float32Array(totalLen);
            let offset = 0;
            channelChunks.forEach((chunk) => {
                merged.set(chunk, offset);
                offset += chunk.length;
            });
            audioBuffer.getChannelData(channel).set(merged);
        });
        return audioBuffer;
    }

    startMetering() {
        if (this.meterInterval || !this.analyser) return;
        this.meterInterval = (setInterval(() => {
            if (!this.ctx || this.ctx.state === 'closed' || !this.analyser) return;
            this.meters = this._computeStereoMeterFromAnalyser(this.analyser);
            this.busGains.forEach((busEntry, busId) => {
                const levels = busId === 'master'
                    ? this.meters
                    : this._computeStereoMeterFromAnalyser(busEntry.analyser);
                this.busMeters.set(busId, levels);
            });
        }, 80));
        if (!this.inputAnalyser) return;
        const inData = new Float32Array(this.inputAnalyser.frequencyBinCount);
        this.inputMeterInterval = (setInterval(() => {
            if (!this.ctx || this.ctx.state === 'closed' || !this.inputSource || !this.inputAnalyser) return;
            this.inputAnalyser.getFloatTimeDomainData(inData);
            let peak = 0;
            for (let i = 0; i < inData.length; i++) {
                const abs = Math.abs(inData[i]);
                if (abs > peak) peak = abs;
            }
            this.inputLevel = peak;
            document.querySelectorAll('.track-meters .meter-segment').forEach((seg, idx) => {
                seg.classList.toggle('active', peak > (idx + 1) / 4);
            });
        }, 80));
    }

    dispose() {
        if (this.meterInterval) clearInterval(this.meterInterval);
        if (this.inputMeterInterval) clearInterval(this.inputMeterInterval);
        if (this.ctx) this.ctx.close();
        if (this.inputStream) this.inputStream.getTracks().forEach(t => t.stop());
    }
}

/* global VoxEngine */
const PluginProcessor = {
    /**
     * v2.0.3 PDC: WaveShaper oversample latency (samples) per oversample setting.
     * Chromium does not expose the resampler group delay, so TitanAudioEngine
     * calibrates these once per AudioContext via an OfflineAudioContext impulse
     * test (see _calibrateShaperLatency). Until calibration completes, these
     * documented fallback estimates apply.
     */
    shaperLatencySamples: { '2x': 32, '4x': 64 },
    setShaperLatency(table) {
        if (table && Number.isFinite(table['2x']) && Number.isFinite(table['4x'])) {
            this.shaperLatencySamples = { '2x': table['2x'], '4x': table['4x'] };
        }
    },
    /**
     * Create an audio processing node chain for a plugin instance.
     * Returns { input: AudioNode, output: AudioNode, update: (params)=>void,
     *           dispose: ()=>void, latencySamples: <number> }
     *
     * v2.0.3: latencySamples estimates the plugin's processing delay for
     * plugin delay compensation. Biquads, gains, compressors and convolvers
     * add no reportable delay in Web Audio; oversampled WaveShapers do, so we
     * count them via a temporary factory wrapper (fully delegating, restored
     * in `finally`) and multiply by the calibrated per-shaper latency.
     */
    create(ctx, plugin) {
        const shapers = [];
        const realCreateWaveShaper = ctx.createWaveShaper.bind(ctx);
        ctx.createWaveShaper = (...args) => {
            const ws = realCreateWaveShaper(...args);
            shapers.push(ws);
            return ws;
        };
        let node;
        try {
            node = this._createInner(ctx, plugin);
        } finally {
            ctx.createWaveShaper = realCreateWaveShaper;
        }
        const table = this.shaperLatencySamples || { '2x': 32, '4x': 64 };
        let latencySamples = 0;
        for (const ws of shapers) {
            const ov = ws.oversample;
            if (ov && ov !== 'none') latencySamples += table[ov] || 0;
        }
        if (node) node.latencySamples = (node.latencySamples || 0) + latencySamples;
        return node;
    },
    _createInner(ctx, plugin) {
        const params = {};
        plugin.params.forEach(p => params[p.id] = p.val);

        const key = plugin.processor || plugin.catalogId || plugin.id;
        switch (key) {
            case 'aura': return this.createAura(ctx, params);
            case 'aura_morph': return this.createAuraMorph(ctx, params);
            case 'eq': return this.createEQ(ctx, params);
            case 'compressor': return this.createCompressor(ctx, params);
            case 'deeproom': return this.createDeepRoom(ctx, params);
            case 'deep_room_ui': return this.createDeepRoomUI(ctx, params);
            case 'endlesshall': return this.createEndlessHall(ctx, params);
            case 'eventhorizon': return this.createEventHorizon(ctx, params);
            case 'resokill': return this.createNotch(ctx, params);
            case 'reso_kill_ui': return this.createResoKillPro(ctx, params);
            case 'neuralheat': return this.createNeuralHeat(ctx, params);
            case 'flux_core': return this.createFluxCore(ctx, params);
            case 'prism': return this.createPrism(ctx, params);
            case 'spectra_fix': return this.createSpectraFix(ctx, params);
            case 'quantum': return this.createQuantum(ctx, params);
            case 'diamond': return this.createDiamond(ctx, params);
            case 'gravity': return this.createGravity(ctx, params);
            case 'exabyte': return this.createExabyte(ctx, params);
            case 'titanium': return this.createTitaniumConsole(ctx, params);
            case 'master': return this.createMasterProcessor(ctx, params);
            case 'delay': return this.createDelay(ctx, params);
            case 'dyna_shape': return this.createDynaShape(ctx, params);
            case 'gate': return this.createGate(ctx, params);
            case 'halo_gate': return this.createHaloGate(ctx, params);
            case 'exciter': return this.createExciter(ctx, params);
            case 'harmonic_lens': return this.createHarmonicLens(ctx, params);
            case 'phase': return this.createPhase(ctx, params);
            case 'phase_lock': return this.createPhaseLock(ctx, params);
            case 'bus': return this.createBus(ctx, params);
            case 'velvet_bus': return this.createVelvetBus(ctx, params);
            case 'echo_weave': return this.createEchoWeave(ctx, params);
            case 'chrono_shift': return this.createChronoShift(ctx, params);
            case 'cockpit': return this.createCockpit(ctx, params);
            case 'vox_genesis': return this.createVoxGenesis(ctx, params);
            case 'custom': return this.createGain(ctx, params);
            case 'gain': return this.createGain(ctx, params);
            default: return this.createGain(ctx, params);
        }
    },

    _param(params, id, fallback) { return params[id] !== undefined ? params[id] : fallback; },
    _paramAny(params, ids, fallback) {
        for (const id of ids) {
            if (params[id] !== undefined) return params[id];
        }
        return fallback;
    },

    _makeDryWet(ctx, wetNode, wetAmount01) {
        const input = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();
        input.connect(dryGain);
        input.connect(wetNode);
        wetNode.connect(wetGain);
        dryGain.connect(output);
        wetGain.connect(output);
        const updateMix = (mix) => {
            dryGain.gain.value = 1 - mix;
            wetGain.gain.value = mix;
        };
        updateMix(wetAmount01);
        return { input, output, updateMix, dryGain, wetGain };
    },

    createAura(ctx, params) {
        const warmth = this._param(params, 'warmth', 65) / 100;
        const presence = this._param(params, 'presence', 45) / 100;
        const air = this._param(params, 'air', 50) / 100;
        const proximity = this._param(params, 'proximity', 50) / 100;

        const input = ctx.createGain();
        const shelf = ctx.createBiquadFilter();
        shelf.type = 'highshelf';
        shelf.frequency.value = 8000 + air * 4000;
        shelf.gain.value = -5 + air * 12;
        const presenceNode = ctx.createBiquadFilter();
        presenceNode.type = 'peaking';
        presenceNode.frequency.value = 3000;
        presenceNode.gain.value = -8 + presence * 16;
        presenceNode.Q.value = 0.8;
        const warmthNode = ctx.createBiquadFilter();
        warmthNode.type = 'lowshelf';
        warmthNode.frequency.value = 200;
        warmthNode.gain.value = -6 + warmth * 12;
        const output = ctx.createGain();
        output.gain.value = 0.8 + proximity * 0.4;

        input.connect(warmthNode);
        warmthNode.connect(presenceNode);
        presenceNode.connect(shelf);
        shelf.connect(output);

        return {
            input, output,
            warmthNode, presenceNode, shelf, outputGain: output,
            update(paramId, value) {
                if (paramId === 'warmth') warmthNode.gain.value = -6 + (value / 100) * 12;
                if (paramId === 'presence') presenceNode.gain.value = -8 + (value / 100) * 16;
                if (paramId === 'air') {
                    shelf.frequency.value = 8000 + (value / 100) * 4000;
                    shelf.gain.value = -5 + (value / 100) * 12;
                }
                if (paramId === 'proximity') output.gain.value = 0.8 + (value / 100) * 0.4;
            },
            dispose() { [input, shelf, presenceNode, warmthNode, output].forEach(n => { try { n.disconnect(); } catch(_){} }); }
        };
    },

    createAuraMorph(ctx, params) {
        const input = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();
        const shaper = ctx.createWaveShaper();
        shaper.oversample = '4x';
        const warmthNode = ctx.createBiquadFilter();
        warmthNode.type = 'lowshelf';
        const presenceNode = ctx.createBiquadFilter();
        presenceNode.type = 'peaking';
        presenceNode.frequency.value = 3200;
        presenceNode.Q.value = 0.85;
        const airShelf = ctx.createBiquadFilter();
        airShelf.type = 'highshelf';
        const proximityGain = ctx.createGain();

        const state = {
            warmth: this._param(params, 'warmth', 65),
            presence: this._param(params, 'presence', 45),
            air: this._param(params, 'air', 50),
            proximity: this._param(params, 'proximity', 50),
            driveAmount: this._param(params, 'driveAmount', 55),
            proximityBoost: this._param(params, 'proximityBoost', 50),
            dryWetMix: this._param(params, 'dryWetMix', 60)
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(shaper);
        shaper.connect(warmthNode);
        warmthNode.connect(presenceNode);
        presenceNode.connect(airShelf);
        airShelf.connect(proximityGain);
        proximityGain.connect(wetGain);
        wetGain.connect(output);

        const apply = () => {
            const warmthNorm = state.warmth / 100;
            const airNorm = state.air / 100;
            const presenceNorm = state.presence / 100;
            const proxNorm = state.proximity / 100;
            const driveNorm = state.driveAmount / 100;
            const proxBoostNorm = state.proximityBoost / 100;
            shaper.curve = this._waveShaperCurve(0.12 + driveNorm * 0.38, 'warm');
            warmthNode.frequency.value = 190 + proxBoostNorm * 120;
            warmthNode.gain.value = -5 + warmthNorm * 11 + proxBoostNorm * 2;
            presenceNode.gain.value = -6 + presenceNorm * 14;
            airShelf.frequency.value = 7000 + airNorm * 5000;
            airShelf.gain.value = -4 + airNorm * 10;
            proximityGain.gain.value = 0.82 + proxNorm * 0.2 + proxBoostNorm * 0.18;
            dryGain.gain.value = 1 - (state.dryWetMix / 100);
            wetGain.gain.value = state.dryWetMix / 100;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, dryGain, wetGain, output, shaper, warmthNode, presenceNode, airShelf, proximityGain].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createEQ(ctx, params) {
        const low = this._param(params, 'low', 2);
        const lowMid = this._param(params, 'lowMid', 0);
        const highMid = this._param(params, 'highMid', 1);
        const high = this._param(params, 'high', 3);

        const input = ctx.createGain();
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 120;
        lowShelf.gain.value = low;
        const lowPeak = ctx.createBiquadFilter();
        lowPeak.type = 'peaking';
        lowPeak.frequency.value = 500;
        lowPeak.gain.value = lowMid;
        lowPeak.Q.value = 1;
        const highPeak = ctx.createBiquadFilter();
        highPeak.type = 'peaking';
        highPeak.frequency.value = 3000;
        highPeak.gain.value = highMid;
        highPeak.Q.value = 1;
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 8000;
        highShelf.gain.value = high;
        const output = ctx.createGain();

        input.connect(lowShelf);
        lowShelf.connect(lowPeak);
        lowPeak.connect(highPeak);
        highPeak.connect(highShelf);
        highShelf.connect(output);

        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'low') lowShelf.gain.value = value;
                if (paramId === 'lowMid') lowPeak.gain.value = value;
                if (paramId === 'highMid') highPeak.gain.value = value;
                if (paramId === 'high') highShelf.gain.value = value;
            },
            dispose() { [input, lowShelf, lowPeak, highPeak, highShelf, output].forEach(n => { try { n.disconnect(); } catch(_){} }); }
        };
    },

    createCompressor(ctx, params) {
        const threshold = this._param(params, 'threshold', -18);
        const ratio = this._param(params, 'ratio', 4);
        const attack = this._param(params, 'attack', 10);
        const release = this._param(params, 'release', 100);
        const makeup = this._param(params, 'makeup', 6);
        const knee = this._param(params, 'knee', 3);

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = threshold;
        comp.ratio.value = ratio;
        comp.attack.value = attack / 1000;
        comp.release.value = release / 1000;
        comp.knee.value = knee;
        const makeupGain = ctx.createGain();
        makeupGain.gain.value = Math.pow(10, makeup / 20);
        comp.connect(makeupGain);

        return {
            input: comp, output: makeupGain,
            update(paramId, value) {
                if (paramId === 'threshold') comp.threshold.value = value;
                if (paramId === 'ratio') comp.ratio.value = value;
                if (paramId === 'attack') comp.attack.value = value / 1000;
                if (paramId === 'release') comp.release.value = value / 1000;
                if (paramId === 'knee') comp.knee.value = value;
                if (paramId === 'makeup') makeupGain.gain.value = Math.pow(10, value / 20);
            },
            dispose() { try { comp.disconnect(); } catch(_){} try { makeupGain.disconnect(); } catch(_){} }
        };
    },

    createDynaShape(ctx, params) {
        const input = ctx.createGain();
        const filters = [];
        const compressors = [];
        const crossovers = [120, 450, 2200, 7200];
        const state = {
            band1Threshold: this._param(params, 'band1Threshold', -20),
            band2Threshold: this._param(params, 'band2Threshold', -18),
            band3Threshold: this._param(params, 'band3Threshold', -16),
            band4Threshold: this._param(params, 'band4Threshold', -14),
            band1Ratio: this._param(params, 'band1Ratio', 2.5),
            band2Ratio: this._param(params, 'band2Ratio', 3.5),
            band3Ratio: this._param(params, 'band3Ratio', 4.5),
            band4Ratio: this._param(params, 'band4Ratio', 5.5),
            attack: this._param(params, 'attack', 10),
            release: this._param(params, 'release', 100)
        };

        let chain = input;
        for (let i = 0; i < 4; i++) {
            const filter = ctx.createBiquadFilter();
            filter.type = i === 0 ? 'lowshelf' : i === 3 ? 'highshelf' : 'peaking';
            filter.frequency.value = crossovers[i];
            filter.Q.value = 0.9 + i * 0.2;
            const comp = ctx.createDynamicsCompressor();
            chain.connect(filter);
            filter.connect(comp);
            chain = comp;
            filters.push(filter);
            compressors.push(comp);
        }
        const output = ctx.createGain();
        chain.connect(output);

        const apply = () => {
            const thresholds = [state.band1Threshold, state.band2Threshold, state.band3Threshold, state.band4Threshold];
            const ratios = [state.band1Ratio, state.band2Ratio, state.band3Ratio, state.band4Ratio];
            compressors.forEach((comp, index) => {
                comp.threshold.value = thresholds[index];
                comp.ratio.value = ratios[index];
                comp.attack.value = Math.max(0.0001, state.attack / 1000);
                comp.release.value = Math.max(0.01, state.release / 1000);
            });
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, output, ...filters, ...compressors].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createDeepRoom(ctx, params) {
        const input = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();
        const preDelay = ctx.createDelay(0.2);
        const earlyLeft = ctx.createDelay(0.08);
        const earlyRight = ctx.createDelay(0.08);
        const earlyMerge = ctx.createChannelMerger(2);
        const convolver = ctx.createConvolver();
        const dampingFilter = ctx.createBiquadFilter();
        dampingFilter.type = 'lowpass';
        const bodyFilter = ctx.createBiquadFilter();
        bodyFilter.type = 'peaking';
        const wetTrim = ctx.createGain();

        const state = {
            size: this._param(params, 'size', 60),
            decay: this._param(params, 'decay', 4.5),
            damping: this._param(params, 'damping', 40),
            mix: this._param(params, 'mix', 30)
        };

        const generateImpulse = () => {
            const sizeNorm = state.size / 100;
            const dampingNorm = state.damping / 100;
            const seconds = Math.min(0.9 + state.decay * (0.22 + sizeNorm * 0.38), 3.8);
            const buffer = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const data = buffer.getChannelData(channel);
                for (let i = 0; i < data.length; i++) {
                    const t = i / ctx.sampleRate;
                    const envelope = Math.exp(-t / (0.16 + state.decay * 0.14));
                    const reflectionBias = i < data.length * 0.08 ? 0.7 + sizeNorm * 0.2 : 0.28 + sizeNorm * 0.22;
                    const dampingCurve = Math.exp(-t * (1.2 + dampingNorm * 3.5));
                    data[i] = (Math.random() * 2 - 1) * envelope * reflectionBias * dampingCurve;
                }
            }
            return buffer;
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(preDelay);
        preDelay.connect(earlyLeft);
        preDelay.connect(earlyRight);
        earlyLeft.connect(earlyMerge, 0, 0);
        earlyRight.connect(earlyMerge, 0, 1);
        earlyMerge.connect(convolver);
        convolver.connect(dampingFilter);
        dampingFilter.connect(bodyFilter);
        bodyFilter.connect(wetTrim);
        wetTrim.connect(wetGain);
        wetGain.connect(output);

        const apply = () => {
            const sizeNorm = state.size / 100;
            const decayNorm = Math.min(1, state.decay / 20);
            const dampingNorm = state.damping / 100;
            preDelay.delayTime.value = 0.006 + sizeNorm * 0.028;
            earlyLeft.delayTime.value = 0.009 + sizeNorm * 0.014;
            earlyRight.delayTime.value = 0.013 + sizeNorm * 0.019;
            convolver.buffer = generateImpulse();
            dampingFilter.frequency.value = 2200 + (1 - dampingNorm) * 9000;
            bodyFilter.frequency.value = 240 + sizeNorm * 320;
            bodyFilter.Q.value = 0.7 + dampingNorm * 1.6;
            bodyFilter.gain.value = 1 + sizeNorm * 2.2 - dampingNorm * 1.4;
            wetTrim.gain.value = 0.72 + decayNorm * 0.2;
            dryGain.gain.value = 1 - (state.mix / 100);
            wetGain.gain.value = state.mix / 100;
            output.gain.value = 0.96;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, dryGain, wetGain, output, preDelay, earlyLeft, earlyRight, earlyMerge, convolver, dampingFilter, bodyFilter, wetTrim].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createReverb(ctx, params, type) {
        const state = {
            size: this._param(params, 'size', 60),
            decay: this._param(params, 'decay', type === 'hall' ? 8 : 4),
            damping: this._param(params, 'damping', 40),
            mix: this._param(params, 'mix', 30)
        };

        const generateImpulse = (decayTime, damp) => {
            const sizeNorm = state.size / 100;
            const seconds = Math.min(decayTime * (0.5 + sizeNorm * 0.5), 4);
            const sampleRate = ctx.sampleRate;
            const length = Math.floor(sampleRate * seconds);
            const buffer = ctx.createBuffer(2, length, sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const data = buffer.getChannelData(ch);
                for (let i = 0; i < length; i++) {
                    const t = i / sampleRate;
                    const envelope = Math.pow(1 - i / length, 2) * Math.exp(-t / (decayTime * 0.3 + 0.1));
                    const filter = Math.exp(-t * damp * 4);
                    data[i] = (Math.random() * 2 - 1) * envelope * filter;
                }
            }
            return buffer;
        };

        const convolver = ctx.createConvolver();
        convolver.buffer = generateImpulse(state.decay, state.damping / 100);
        const dryWet = this._makeDryWet(ctx, convolver, state.mix / 100);
        return {
            input: dryWet.input, output: dryWet.output,
            update(paramId, value) {
                if (state[paramId] !== undefined) {
                    state[paramId] = value;
                }
                if (paramId === 'mix') {
                    dryWet.updateMix(value / 100);
                } else {
                    convolver.buffer = generateImpulse(state.decay, state.damping / 100);
                }
            },
            dispose() { dryWet.updateMix(0); try { convolver.disconnect(); } catch(_){} }
        };
    },

    createDeepRoomUI(ctx, params) {
        const input = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();
        const preDelay = ctx.createDelay(0.25);
        const convolver = ctx.createConvolver();
        const postDelay = ctx.createDelay(0.15);
        const duckGain = ctx.createGain();
        const modOsc = ctx.createOscillator();
        const modGain = ctx.createGain();

        const state = {
            size: this._param(params, 'size', 60),
            decay: this._param(params, 'decay', 4.5),
            erDensity: this._param(params, 'erDensity', 55),
            modulationDepth: this._param(params, 'modulationDepth', 28),
            duckingAmount: this._param(params, 'duckingAmount', 18),
            mix: this._param(params, 'mix', 30)
        };

        const generateImpulse = () => {
            const sizeNorm = state.size / 100;
            const erNorm = state.erDensity / 100;
            const seconds = Math.min(0.8 + state.decay * (0.35 + sizeNorm * 0.5), 4.5);
            const buffer = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
            for (let channel = 0; channel < 2; channel++) {
                const data = buffer.getChannelData(channel);
                for (let i = 0; i < data.length; i++) {
                    const t = i / ctx.sampleRate;
                    const envelope = Math.exp(-t / (0.25 + state.decay * 0.18));
                    const early = i < data.length * 0.12 ? 0.45 + erNorm * 0.55 : 0.2 + erNorm * 0.35;
                    data[i] = (Math.random() * 2 - 1) * envelope * early;
                }
            }
            return buffer;
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(preDelay);
        preDelay.connect(convolver);
        convolver.connect(postDelay);
        postDelay.connect(duckGain);
        duckGain.connect(wetGain);
        wetGain.connect(output);
        modOsc.connect(modGain);
        modGain.connect(postDelay.delayTime);
        modOsc.start();

        const apply = () => {
            const sizeNorm = state.size / 100;
            const modNorm = state.modulationDepth / 100;
            const duckNorm = state.duckingAmount / 100;
            preDelay.delayTime.value = 0.01 + sizeNorm * 0.05;
            convolver.buffer = generateImpulse();
            postDelay.delayTime.value = 0.012 + modNorm * 0.025;
            modOsc.frequency.value = 0.12 + modNorm * 1.1;
            modGain.gain.value = 0.0006 + modNorm * 0.0035;
            duckGain.gain.value = 1 - duckNorm * 0.5;
            dryGain.gain.value = 1 - (state.mix / 100);
            wetGain.gain.value = state.mix / 100;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                try { modOsc.stop(); } catch (_) {}
                [input, dryGain, wetGain, output, preDelay, convolver, postDelay, duckGain, modOsc, modGain].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    _waveShaperCurve(amount, type) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const _deg = Math.PI / 180;
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            let y = 0;
            if (type === 'extreme') {
                const bitDepth = Math.max(1, 16 - amount * 14);
                const steps = Math.pow(2, bitDepth);
                y = Math.round(x * steps) / steps;
                y = Math.tanh(y * (1 + amount * 8));
            } else if (type === 'warm') {
                const k = 1 + amount * 4;
                y = Math.tanh(x * k) / Math.tanh(k);
            } else if (type === 'tape') {
                const k = 1 + amount * 3;
                y = (2 / Math.PI) * Math.atan(x * k);
            } else if (type === 'lofi') {
                const bits = Math.max(2, 16 - amount * 12);
                const steps = Math.pow(2, bits);
                y = Math.round(x * steps) / steps;
            }
            curve[i] = y;
        }
        return curve;
    },

    createEndlessHall(ctx, params) {
        const input = ctx.createGain();
        const preDelay = ctx.createDelay(0.3);
        const convolver = ctx.createConvolver();
        const shimmerFilter = ctx.createBiquadFilter();
        shimmerFilter.type = 'highshelf';
        const modDelay = ctx.createDelay(0.2);
        const feedback = ctx.createGain();
        const wetBus = ctx.createGain();
        const modOsc = ctx.createOscillator();
        const modGain = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();

        const state = {
            length: this._param(params, 'length', 75),
            modulation: this._param(params, 'modulation', 30),
            diffusion: this._param(params, 'diffusion', 60),
            color: this._param(params, 'color', 50)
        };

        const generateImpulse = () => {
            const lengthNorm = state.length / 100;
            const diffusionNorm = state.diffusion / 100;
            const colorNorm = state.color / 100;
            const seconds = 2.4 + lengthNorm * 3.6;
            const buffer = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const data = buffer.getChannelData(ch);
                for (let i = 0; i < data.length; i++) {
                    const t = i / ctx.sampleRate;
                    const decay = Math.exp(-t / (0.45 + lengthNorm * 2.8));
                    const spectralTilt = Math.exp(-t * (0.8 + (1 - colorNorm) * 3.5));
                    data[i] = (Math.random() * 2 - 1) * decay * spectralTilt * (0.5 + diffusionNorm * 0.5);
                }
            }
            return buffer;
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(preDelay);
        preDelay.connect(convolver);
        convolver.connect(shimmerFilter);
        shimmerFilter.connect(modDelay);
        modDelay.connect(feedback);
        feedback.connect(modDelay);
        modDelay.connect(wetBus);
        wetBus.connect(wetGain);
        wetGain.connect(output);
        modOsc.connect(modGain);
        modGain.connect(modDelay.delayTime);
        modOsc.start();

        const apply = () => {
            const lengthNorm = state.length / 100;
            const modulationNorm = state.modulation / 100;
            const diffusionNorm = state.diffusion / 100;
            const colorNorm = state.color / 100;
            preDelay.delayTime.value = 0.012 + lengthNorm * 0.08;
            convolver.buffer = generateImpulse();
            shimmerFilter.frequency.value = 2200 + colorNorm * 9000;
            shimmerFilter.gain.value = -6 + colorNorm * 10;
            modDelay.delayTime.value = 0.018 + diffusionNorm * 0.04;
            feedback.gain.value = Math.min(0.84, 0.35 + lengthNorm * 0.22 + diffusionNorm * 0.18);
            modOsc.frequency.value = 0.08 + modulationNorm * 1.6;
            modGain.gain.value = 0.0008 + modulationNorm * 0.010;
            dryGain.gain.value = 0.38;
            wetGain.gain.value = 0.62;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'length') state.length = value;
                if (paramId === 'modulation') state.modulation = value;
                if (paramId === 'diffusion') state.diffusion = value;
                if (paramId === 'color') state.color = value;
                apply();
            },
            dispose() {
                try { modOsc.stop(); } catch (_) {}
                [input, preDelay, convolver, shimmerFilter, modDelay, feedback, wetBus, modOsc, modGain, dryGain, wetGain, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createEventHorizon(ctx, params) {
        const input = ctx.createGain();
        const preGain = ctx.createGain();
        const shaper = ctx.createWaveShaper();
        const postFilter = ctx.createBiquadFilter();
        postFilter.type = 'lowpass';
        const output = ctx.createGain();

        const state = {
            bitcrush: this._param(params, 'bitcrush', 8),
            downsample: this._param(params, 'downsample', 4),
            drive: this._param(params, 'drive', 30),
            chaos: this._param(params, 'chaos', 20)
        };

        input.connect(preGain);
        preGain.connect(shaper);
        shaper.connect(postFilter);
        postFilter.connect(output);

        const apply = () => {
            const driveNorm = state.drive / 100;
            const chaosNorm = state.chaos / 100;
            const crushNorm = 1 - Math.max(1, Math.min(16, state.bitcrush)) / 16;
            const sampleNorm = Math.min(1, Math.max(1, state.downsample) / 32);
            preGain.gain.value = 1 + driveNorm * 6 + chaosNorm * 2;
            shaper.curve = this._waveShaperCurve(
                0.25 + driveNorm * 0.45 + chaosNorm * 0.25 + crushNorm * 0.3 + sampleNorm * 0.25,
                'extreme'
            );
            shaper.oversample = driveNorm + chaosNorm > 0.85 ? '4x' : '2x';
            postFilter.frequency.value = Math.max(650, 14000 - sampleNorm * 11500 - crushNorm * 3500);
            output.gain.value = 0.58 + (1 - crushNorm) * 0.12;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'bitcrush') state.bitcrush = value;
                if (paramId === 'downsample') state.downsample = value;
                if (paramId === 'drive') state.drive = value;
                if (paramId === 'chaos') state.chaos = value;
                apply();
            },
            dispose() {
                [input, preGain, shaper, postFilter, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createResoKillPro(ctx, params) {
        const input = ctx.createGain();
        const notchA = ctx.createBiquadFilter();
        notchA.type = 'notch';
        const notchB = ctx.createBiquadFilter();
        notchB.type = 'notch';
        const compressor = ctx.createDynamicsCompressor();
        const output = ctx.createGain();

        const state = {
            freq: this._param(params, 'freq', 500),
            q: this._param(params, 'q', 10),
            depth: this._param(params, 'depth', 60),
            sensitivity: this._param(params, 'sensitivity', 50),
            threshold: this._param(params, 'threshold', -24),
            attack: this._param(params, 'attack', 8),
            release: this._param(params, 'release', 140)
        };

        input.connect(notchA);
        notchA.connect(notchB);
        notchB.connect(compressor);
        compressor.connect(output);

        const apply = () => {
            const sensitivityNorm = state.sensitivity / 100;
            const depthNorm = state.depth / 100;
            const qScale = 1 + sensitivityNorm * 0.35;
            notchA.frequency.value = Math.max(20, state.freq * (1 - 0.03 - sensitivityNorm * 0.04));
            notchB.frequency.value = Math.min(20000, state.freq * (1 + 0.03 + sensitivityNorm * 0.04));
            notchA.Q.value = state.q * qScale;
            notchB.Q.value = state.q * (qScale + 0.4);
            compressor.threshold.value = state.threshold;
            compressor.attack.value = Math.max(0.0001, state.attack / 1000);
            compressor.release.value = Math.max(0.01, state.release / 1000);
            compressor.ratio.value = 1.5 + depthNorm * 10 + sensitivityNorm * 4;
            output.gain.value = 1 - depthNorm * 0.22;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, notchA, notchB, compressor, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createGravity(ctx, params) {
        const input = ctx.createGain();
        const preEq = ctx.createBiquadFilter();
        preEq.type = 'lowshelf';
        const shaper = ctx.createWaveShaper();
        shaper.oversample = '4x';
        const tapeComp = ctx.createDynamicsCompressor();
        const toneFilter = ctx.createBiquadFilter();
        toneFilter.type = 'highshelf';
        const dryWet = this._makeDryWet(ctx, shaper, this._param(params, 'mix', 50) / 100);

        const state = {
            saturate: this._param(params, 'saturate', 40),
            flux: this._param(params, 'flux', 30),
            bias: this._param(params, 'bias', 0),
            mix: this._param(params, 'mix', 50)
        };

        input.connect(preEq);
        preEq.connect(dryWet.input);
        dryWet.output.connect(tapeComp);
        tapeComp.connect(toneFilter);

        const apply = () => {
            const satNorm = state.saturate / 100;
            const fluxNorm = state.flux / 100;
            const biasNorm = state.bias / 50;
            preEq.frequency.value = 140 + fluxNorm * 180;
            preEq.gain.value = biasNorm * 3 + fluxNorm * 2;
            shaper.curve = this._waveShaperCurve(0.15 + satNorm * 0.55 + fluxNorm * 0.2, 'tape');
            tapeComp.threshold.value = -28 + satNorm * 14;
            tapeComp.ratio.value = 1.6 + fluxNorm * 2.2;
            tapeComp.attack.value = 0.004 + (1 - satNorm) * 0.012;
            tapeComp.release.value = 0.09 + fluxNorm * 0.12;
            toneFilter.frequency.value = 2500 + fluxNorm * 4500;
            toneFilter.gain.value = -2 + biasNorm * 3;
            dryWet.updateMix(state.mix / 100);
        };

        apply();

        return {
            input, output: toneFilter,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, preEq, shaper, tapeComp, toneFilter, dryWet.input, dryWet.output, dryWet.dryGain, dryWet.wetGain].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createExabyte(ctx, params) {
        const input = ctx.createGain();
        const lowPass = ctx.createBiquadFilter();
        lowPass.type = 'lowpass';
        const wowDelay = ctx.createDelay(0.08);
        const wowFeedback = ctx.createGain();
        const saturator = ctx.createWaveShaper();
        saturator.oversample = '4x';
        const compressor = ctx.createDynamicsCompressor();
        const output = ctx.createGain();
        const wowOsc = ctx.createOscillator();
        const wowGain = ctx.createGain();

        const state = {
            speed: this._param(params, 'speed', 50),
            flux: this._param(params, 'flux', 20),
            saturation: this._param(params, 'saturation', 45),
            wow: this._param(params, 'wow', 15)
        };

        input.connect(lowPass);
        lowPass.connect(saturator);
        saturator.connect(wowDelay);
        wowDelay.connect(wowFeedback);
        wowFeedback.connect(wowDelay);
        wowDelay.connect(compressor);
        compressor.connect(output);
        wowOsc.connect(wowGain);
        wowGain.connect(wowDelay.delayTime);
        wowOsc.start();

        const apply = () => {
            const speedNorm = state.speed / 100;
            const fluxNorm = state.flux / 100;
            const saturationNorm = state.saturation / 100;
            const wowNorm = state.wow / 100;
            lowPass.frequency.value = 2600 + speedNorm * 12000;
            saturator.curve = this._waveShaperCurve(0.18 + saturationNorm * 0.5 + fluxNorm * 0.14, 'lofi');
            wowDelay.delayTime.value = 0.006 + wowNorm * 0.018;
            wowFeedback.gain.value = Math.min(0.42, fluxNorm * 0.28 + wowNorm * 0.08);
            compressor.threshold.value = -24 + saturationNorm * 8;
            compressor.ratio.value = 1.4 + fluxNorm * 2.8;
            wowOsc.frequency.value = 0.25 + speedNorm * 2.1;
            wowGain.gain.value = 0.0006 + wowNorm * 0.0035;
            output.gain.value = 0.88 + saturationNorm * 0.08;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                try { wowOsc.stop(); } catch (_) {}
                [input, lowPass, wowDelay, wowFeedback, saturator, compressor, output, wowOsc, wowGain].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createDistortion(ctx, params, type) {
        const drive = this._param(params, 'drive', 30) / 100;
        const _bitcrush = this._param(params, 'bitcrush', 8);
        const _downsample = this._param(params, 'downsample', 4);
        const chaos = this._param(params, 'chaos', 20) / 100;

        const input = ctx.createGain();
        const shaper = ctx.createWaveShaper();
        shaper.curve = this._waveShaperCurve(0.3 + drive * 0.7 + chaos, 'extreme');
        shaper.oversample = '4x';
        const output = ctx.createGain();
        output.gain.value = 0.7;
        input.connect(shaper);
        shaper.connect(output);
        return {
            input, output,
            update(paramId, value) {
                let newDrive = drive;
                let newChaos = chaos;
                if (paramId === 'drive') newDrive = value / 100;
                if (paramId === 'chaos') newChaos = value / 100;
                shaper.curve = this._waveShaperCurve(0.3 + newDrive * 0.7 + newChaos, 'extreme');
            },
            dispose() { try { shaper.disconnect(); } catch(_){} }
        };
    },

    createSaturation(ctx, params, type) {
        const state = {
            drive: this._param(params, 'drive', 40),
            tone: this._param(params, 'tone', 50),
            harmonics: this._param(params, 'harmonics', 60),
            mix: this._param(params, 'mix', 50)
        };

        const shaper = ctx.createWaveShaper();
        shaper.curve = this._waveShaperCurve((state.drive / 100) * (0.5 + (state.harmonics / 100) * 0.5), type);
        shaper.oversample = '4x';
        const toneFilter = ctx.createBiquadFilter();
        toneFilter.type = 'peaking';
        toneFilter.frequency.value = 1000 + (state.tone / 100) * 3000;
        toneFilter.gain.value = -6 + (state.tone / 100) * 12;
        const dryWet = this._makeDryWet(ctx, shaper, state.mix / 100);
        dryWet.output.connect(toneFilter);
        return {
            input: dryWet.input, output: toneFilter,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                if (paramId === 'drive' || paramId === 'harmonics') {
                    shaper.curve = this._waveShaperCurve((state.drive / 100) * (0.5 + (state.harmonics / 100) * 0.5), type);
                }
                if (paramId === 'tone') {
                    toneFilter.frequency.value = 1000 + (state.tone / 100) * 3000;
                    toneFilter.gain.value = -6 + (state.tone / 100) * 12;
                }
                if (paramId === 'mix') dryWet.updateMix(state.mix / 100);
            },
            dispose() { try { shaper.disconnect(); } catch(_){} try { toneFilter.disconnect(); } catch(_){} }
        };
    },

    createNeuralHeat(ctx, params) {
        const input = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        const presencePeak = ctx.createBiquadFilter();
        presencePeak.type = 'peaking';
        presencePeak.frequency.value = 2200;
        presencePeak.Q.value = 0.9;
        const harmonicShaper = ctx.createWaveShaper();
        harmonicShaper.oversample = '4x';
        const airShelf = ctx.createBiquadFilter();
        airShelf.type = 'highshelf';
        const contourComp = ctx.createDynamicsCompressor();

        const state = {
            drive: this._param(params, 'drive', 40),
            tone: this._param(params, 'tone', 50),
            harmonics: this._param(params, 'harmonics', 60),
            mix: this._param(params, 'mix', 50)
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(lowShelf);
        lowShelf.connect(presencePeak);
        presencePeak.connect(harmonicShaper);
        harmonicShaper.connect(airShelf);
        airShelf.connect(contourComp);
        contourComp.connect(wetGain);
        wetGain.connect(output);

        const apply = () => {
            const driveNorm = state.drive / 100;
            const toneNorm = state.tone / 100;
            const harmonicNorm = state.harmonics / 100;
            lowShelf.frequency.value = 140 + toneNorm * 180;
            lowShelf.gain.value = -2 + harmonicNorm * 4 + (0.5 - toneNorm) * 2;
            presencePeak.frequency.value = 1200 + toneNorm * 3800;
            presencePeak.gain.value = -3 + harmonicNorm * 8;
            harmonicShaper.curve = this._waveShaperCurve(0.16 + driveNorm * 0.4 + harmonicNorm * 0.26, harmonicNorm > 0.65 ? 'tape' : 'warm');
            airShelf.frequency.value = 4200 + toneNorm * 5200;
            airShelf.gain.value = -5 + toneNorm * 10 + harmonicNorm * 3;
            contourComp.threshold.value = -26 + driveNorm * 12;
            contourComp.ratio.value = 1.6 + harmonicNorm * 4.4;
            contourComp.attack.value = 0.002 + (1 - driveNorm) * 0.01;
            contourComp.release.value = 0.06 + toneNorm * 0.16;
            dryGain.gain.value = 1 - (state.mix / 100);
            wetGain.gain.value = state.mix / 100;
            output.gain.value = 0.9 + driveNorm * 0.08;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, dryGain, wetGain, output, lowShelf, presencePeak, harmonicShaper, airShelf, contourComp].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createFluxCore(ctx, params) {
        const input = ctx.createGain();
        const bass = ctx.createBiquadFilter();
        bass.type = 'lowshelf';
        bass.frequency.value = 160;
        const vocal = ctx.createBiquadFilter();
        vocal.type = 'peaking';
        vocal.frequency.value = 1800;
        vocal.Q.value = 1;
        const drums = ctx.createBiquadFilter();
        drums.type = 'peaking';
        drums.frequency.value = 3200;
        drums.Q.value = 0.8;
        const other = ctx.createBiquadFilter();
        other.type = 'highshelf';
        other.frequency.value = 7000;
        const shaper = ctx.createWaveShaper();
        shaper.oversample = '4x';
        const deReverb = ctx.createBiquadFilter();
        deReverb.type = 'lowpass';
        const output = ctx.createGain();

        const state = {
            drive: this._param(params, 'drive', 40),
            tone: this._param(params, 'tone', 50),
            harmonics: this._param(params, 'harmonics', 60),
            mix: this._param(params, 'mix', 50),
            vocalLevel: this._param(params, 'vocalLevel', 65),
            drumLevel: this._param(params, 'drumLevel', 45),
            bassLevel: this._param(params, 'bassLevel', 40),
            otherLevel: this._param(params, 'otherLevel', 35),
            deReverbAmount: this._param(params, 'deReverbAmount', 30)
        };

        input.connect(bass);
        bass.connect(vocal);
        vocal.connect(drums);
        drums.connect(other);
        other.connect(shaper);
        shaper.connect(deReverb);
        deReverb.connect(output);

        const apply = () => {
            bass.gain.value = (state.bassLevel / 100) * 8 - 4;
            vocal.gain.value = (state.vocalLevel / 100) * 10 - 2;
            drums.gain.value = (state.drumLevel / 100) * 8 - 3;
            other.gain.value = (state.otherLevel / 100) * 8 - 4;
            shaper.curve = this._waveShaperCurve((state.drive / 100) * (0.4 + (state.harmonics / 100) * 0.45), 'warm');
            deReverb.frequency.value = 3500 + (1 - state.deReverbAmount / 100) * 10000 + (state.tone / 100) * 1500;
            output.gain.value = 0.85 + (state.mix / 100) * 0.2;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, bass, vocal, drums, other, shaper, deReverb, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createNotch(ctx, params) {
        const freq = this._param(params, 'freq', 500);
        const q = this._param(params, 'q', 10);
        const depth = this._param(params, 'depth', 60) / 100;
        const _sensitivity = this._param(params, 'sensitivity', 50) / 100;

        const notch = ctx.createBiquadFilter();
        notch.type = 'notch';
        notch.frequency.value = freq;
        notch.Q.value = q;
        const output = ctx.createGain();
        output.gain.value = 1 - depth * 0.3;
        notch.connect(output);
        return {
            input: notch, output,
            update(paramId, value) {
                if (paramId === 'freq') notch.frequency.value = value;
                if (paramId === 'q') notch.Q.value = value;
                if (paramId === 'depth') output.gain.value = 1 - (value / 100) * 0.3;
            },
            dispose() { try { notch.disconnect(); } catch(_){} }
        };
    },

    createPrism(ctx, params) {
        const input = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();
        const filters = [];
        const outputTrim = ctx.createGain();
        const maxBands = Math.max(2, Math.round(this._param(params, 'bands', 4)));
        const state = {
            bands: maxBands,
            spread: this._param(params, 'spread', 50),
            shift: this._param(params, 'shift', 0),
            wet: this._param(params, 'wet', 60)
        };

        input.connect(dryGain);
        dryGain.connect(output);

        let chain = input;
        for (let i = 0; i < maxBands; i++) {
            const filter = ctx.createBiquadFilter();
            filter.type = i === 0 ? 'lowshelf' : i === maxBands - 1 ? 'highshelf' : 'peaking';
            chain.connect(filter);
            chain = filter;
            filters.push(filter);
        }
        chain.connect(outputTrim);
        outputTrim.connect(wetGain);
        wetGain.connect(output);

        const apply = () => {
            const activeBands = Math.max(2, Math.min(filters.length, Math.round(state.bands)));
            const spreadNorm = state.spread / 100;
            const shiftNorm = state.shift / 12;
            filters.forEach((filter, index) => {
                const position = activeBands === 1 ? 0.5 : index / Math.max(1, activeBands - 1);
                const emphasis = Math.sin(position * Math.PI);
                const freq = 120 * Math.pow(2, position * (4.8 + spreadNorm * 3.2));
                filter.frequency.value = Math.min(18000, freq);
                filter.Q.value = 0.7 + spreadNorm * 6 + emphasis * 2.2;
                const bandShift = state.shift * (index % 2 === 0 ? 0.9 - position * 0.5 : -0.65 + position * 1.1);
                filter.gain.value = index >= activeBands ? 0 : bandShift + emphasis * shiftNorm * 7;
            });
            dryGain.gain.value = 1 - (state.wet / 100);
            wetGain.gain.value = state.wet / 100;
            outputTrim.gain.value = 0.9 + Math.abs(shiftNorm) * 0.08;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, dryGain, wetGain, output, outputTrim, ...filters].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createQuantum(ctx, params) {
        const input = ctx.createGain();
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        const transientComp = ctx.createDynamicsCompressor();
        const sustainComp = ctx.createDynamicsCompressor();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();
        const state = {
            attack: this._param(params, 'attack', 40),
            sustain: this._param(params, 'sustain', 60),
            crossover: this._param(params, 'crossover', 400),
            mix: this._param(params, 'mix', 50)
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(lowShelf);
        lowShelf.connect(highShelf);
        highShelf.connect(transientComp);
        transientComp.connect(sustainComp);
        sustainComp.connect(wetGain);
        wetGain.connect(output);

        const apply = () => {
            const attackNorm = state.attack / 100;
            const sustainNorm = state.sustain / 100;
            lowShelf.frequency.value = state.crossover;
            highShelf.frequency.value = state.crossover;
            lowShelf.gain.value = -2 + attackNorm * 14;
            highShelf.gain.value = 4 - sustainNorm * 16;
            transientComp.threshold.value = -26 + attackNorm * 12;
            transientComp.ratio.value = 1.8 + attackNorm * 8;
            transientComp.attack.value = 0.001 + (1 - attackNorm) * 0.008;
            transientComp.release.value = 0.03 + sustainNorm * 0.08;
            sustainComp.threshold.value = -30 + sustainNorm * 14;
            sustainComp.ratio.value = 1.4 + sustainNorm * 4.5;
            sustainComp.attack.value = 0.01 + attackNorm * 0.02;
            sustainComp.release.value = 0.14 + sustainNorm * 0.24;
            dryGain.gain.value = 1 - (state.mix / 100);
            wetGain.gain.value = state.mix / 100;
            output.gain.value = 0.96;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() { [input, lowShelf, highShelf, transientComp, sustainComp, dryGain, wetGain, output].forEach(n => { try { n.disconnect(); } catch(_){} }); }
        };
    },

    createDiamond(ctx, params) {
        const state = {
            lowShelf: this._param(params, 'lowShelf', 0),
            highShelf: this._param(params, 'highShelf', 0),
            q: this._param(params, 'q', 5),
            trim: this._param(params, 'trim', 0)
        };

        const input = ctx.createGain();
        const low = ctx.createBiquadFilter();
        low.type = 'lowshelf';
        low.frequency.value = 120;
        const focus = ctx.createBiquadFilter();
        focus.type = 'peaking';
        const air = ctx.createBiquadFilter();
        air.type = 'peaking';
        const high = ctx.createBiquadFilter();
        high.type = 'highshelf';
        const output = ctx.createGain();

        input.connect(low);
        low.connect(focus);
        focus.connect(high);
        high.connect(air);
        air.connect(output);

        const apply = () => {
            const qNorm = Math.max(1, state.q);
            const contour = (state.lowShelf + state.highShelf) * 0.22;
            low.gain.value = state.lowShelf;
            low.Q.value = qNorm * 0.55;
            focus.frequency.value = 1700 + (qNorm / 10) * 2600;
            focus.Q.value = 0.7 + qNorm * 0.75;
            focus.gain.value = contour;
            high.frequency.value = 7200 + (qNorm / 10) * 4200;
            high.gain.value = state.highShelf;
            high.Q.value = qNorm * 0.45;
            air.frequency.value = 9600 + (qNorm / 10) * 5200;
            air.Q.value = 1.1 + qNorm * 0.3;
            air.gain.value = state.highShelf * 0.35 - state.lowShelf * 0.1;
            output.gain.value = Math.pow(10, state.trim / 20);
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() { [input, low, focus, high, air, output].forEach((node) => { try { node.disconnect(); } catch (_) {} }); }
        };
    },

    createChannelStrip(ctx, params) {
        const gain = this._param(params, 'gain', 24);
        const low = this._param(params, 'low', 0);
        const mid = this._param(params, 'mid', 0);
        const high = this._param(params, 'high', 0);
        const comp = this._param(params, 'comp', 30) / 100;

        const input = ctx.createGain();
        input.gain.value = Math.pow(10, (gain - 24) / 20);
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 120;
        lowShelf.gain.value = low;
        const midPeak = ctx.createBiquadFilter();
        midPeak.type = 'peaking';
        midPeak.frequency.value = 1200;
        midPeak.gain.value = mid;
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 8000;
        highShelf.gain.value = high;
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.ratio.value = 1 + comp * 10;
        const output = ctx.createGain();

        input.connect(lowShelf);
        lowShelf.connect(midPeak);
        midPeak.connect(highShelf);
        highShelf.connect(compressor);
        compressor.connect(output);

        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'gain') input.gain.value = Math.pow(10, (value - 24) / 20);
                if (paramId === 'low') lowShelf.gain.value = value;
                if (paramId === 'mid') midPeak.gain.value = value;
                if (paramId === 'high') highShelf.gain.value = value;
                if (paramId === 'comp') compressor.ratio.value = 1 + (value / 100) * 10;
            },
            dispose() { [input, lowShelf, midPeak, highShelf, compressor, output].forEach(n => { try { n.disconnect(); } catch(_){} }); }
        };
    },

    createTitaniumConsole(ctx, params) {
        const input = ctx.createGain();
        const preamp = ctx.createWaveShaper();
        preamp.oversample = '4x';
        const lowCut = ctx.createBiquadFilter();
        lowCut.type = 'highpass';
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        const midPeak = ctx.createBiquadFilter();
        midPeak.type = 'peaking';
        midPeak.frequency.value = 1450;
        midPeak.Q.value = 0.9;
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        const compressor = ctx.createDynamicsCompressor();
        const output = ctx.createGain();

        const state = {
            gain: this._param(params, 'gain', 24),
            low: this._param(params, 'low', 0),
            mid: this._param(params, 'mid', 0),
            high: this._param(params, 'high', 0),
            comp: this._param(params, 'comp', 30)
        };

        input.connect(preamp);
        preamp.connect(lowCut);
        lowCut.connect(lowShelf);
        lowShelf.connect(midPeak);
        midPeak.connect(highShelf);
        highShelf.connect(compressor);
        compressor.connect(output);

        const apply = () => {
            const gainNorm = Math.max(0, state.gain) / 60;
            const compNorm = state.comp / 100;
            preamp.curve = this._waveShaperCurve(0.08 + gainNorm * 0.28 + compNorm * 0.12, 'warm');
            lowCut.frequency.value = 22 + compNorm * 80;
            lowShelf.frequency.value = 120;
            lowShelf.gain.value = state.low;
            midPeak.gain.value = state.mid;
            highShelf.frequency.value = 7800;
            highShelf.gain.value = state.high;
            compressor.threshold.value = -26 + compNorm * 18;
            compressor.ratio.value = 1.2 + compNorm * 5.2;
            compressor.attack.value = 0.003 + (1 - compNorm) * 0.018;
            compressor.release.value = 0.05 + compNorm * 0.18;
            output.gain.value = Math.pow(10, ((state.gain - 24) * 0.25) / 20);
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, preamp, lowCut, lowShelf, midPeak, highShelf, compressor, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createMaster(ctx, params) {
        const ceiling = this._param(params, 'ceiling', -0.5);
        const threshold = this._param(params, 'threshold', -12);
        const release = this._param(params, 'release', 20);
        const _dither = this._param(params, 'dither', 50) / 100;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = threshold;
        comp.ratio.value = 10;
        comp.attack.value = 0.003;
        comp.release.value = release / 1000;
        const gain = ctx.createGain();
        gain.gain.value = Math.pow(10, ceiling / 20);
        comp.connect(gain);
        return {
            input: comp, output: gain,
            update(paramId, value) {
                if (paramId === 'threshold') comp.threshold.value = value;
                if (paramId === 'release') comp.release.value = value / 1000;
                if (paramId === 'ceiling') gain.gain.value = Math.pow(10, value / 20);
            },
            dispose() { try { comp.disconnect(); } catch(_){} try { gain.disconnect(); } catch(_){} }
        };
    },

    createMasterProcessor(ctx, params) {
        const input = ctx.createGain();
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 110;
        const highShelf = ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 9200;
        const glueComp = ctx.createDynamicsCompressor();
        const softClip = ctx.createWaveShaper();
        softClip.oversample = '4x';
        const limiter = ctx.createDynamicsCompressor();
        const output = ctx.createGain();

        const state = {
            ceiling: this._param(params, 'ceiling', -0.5),
            threshold: this._param(params, 'threshold', -12),
            release: this._param(params, 'release', 20),
            dither: this._param(params, 'dither', 50)
        };

        input.connect(lowShelf);
        lowShelf.connect(highShelf);
        highShelf.connect(glueComp);
        glueComp.connect(softClip);
        softClip.connect(limiter);
        limiter.connect(output);

        const apply = () => {
            const thresholdNorm = Math.max(0, Math.min(1, (0 - state.threshold) / 30));
            const releaseNorm = Math.max(0, Math.min(1, state.release / 100));
            const ditherNorm = state.dither / 100;
            lowShelf.gain.value = thresholdNorm * 1.8;
            highShelf.gain.value = -1.2 + ditherNorm * 2.4;
            glueComp.threshold.value = state.threshold;
            glueComp.ratio.value = 1.8 + thresholdNorm * 4.2;
            glueComp.attack.value = 0.001 + (1 - thresholdNorm) * 0.01;
            glueComp.release.value = 0.03 + releaseNorm * 0.22;
            softClip.curve = this._waveShaperCurve(0.12 + thresholdNorm * 0.32 + ditherNorm * 0.08, 'tape');
            limiter.threshold.value = Math.max(-8, state.ceiling - 1.5);
            limiter.ratio.value = 12;
            limiter.attack.value = 0.0008;
            limiter.release.value = 0.025 + releaseNorm * 0.12;
            output.gain.value = Math.pow(10, state.ceiling / 20);
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, lowShelf, highShelf, glueComp, softClip, limiter, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createDelay(ctx, params) {
        const input = ctx.createGain();
        const delay = ctx.createDelay(2);
        const feedbackGain = ctx.createGain();
        const toneFilter = ctx.createBiquadFilter();
        toneFilter.type = 'lowpass';
        const modGain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const dryWet = this._makeDryWet(ctx, delay, this._param(params, 'mix', 35) / 100);
        const state = {
            time: this._param(params, 'time', 250),
            feedback: this._param(params, 'feedback', 40),
            mix: this._param(params, 'mix', 35),
            mod: this._param(params, 'mod', 20)
        };

        input.connect(dryWet.input);
        delay.connect(toneFilter);
        toneFilter.connect(feedbackGain);
        feedbackGain.connect(delay);
        lfo.connect(modGain);
        modGain.connect(delay.delayTime);
        lfo.start();

        const apply = () => {
            const modNorm = state.mod / 100;
            const feedbackNorm = state.feedback / 100;
            delay.delayTime.value = Math.min(1.8, Math.max(0.02, state.time / 1000));
            feedbackGain.gain.value = Math.min(0.88, feedbackNorm);
            toneFilter.frequency.value = 2600 + (1 - feedbackNorm) * 7200;
            dryWet.updateMix(state.mix / 100);
            modGain.gain.value = modNorm * 0.01;
            lfo.frequency.value = 0.35 + modNorm * 3.6;
        };

        apply();

        return {
            input, output: dryWet.output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                try { lfo.stop(); } catch(_) {}
                [input, delay, feedbackGain, toneFilter, modGain, lfo, dryWet.input, dryWet.output, dryWet.dryGain, dryWet.wetGain].forEach((node) => {
                    try { node.disconnect(); } catch(_) {}
                });
            }
        };
    },

    createEchoWeave(ctx, params) {
        const input = ctx.createGain();
        const delay = ctx.createDelay(2);
        const feedbackGain = ctx.createGain();
        const feedbackShaper = ctx.createWaveShaper();
        feedbackShaper.oversample = '4x';
        const toneFilter = ctx.createBiquadFilter();
        toneFilter.type = 'highshelf';
        const modOsc = ctx.createOscillator();
        const modGain = ctx.createGain();
        const dryWet = this._makeDryWet(ctx, delay, this._param(params, 'mix', 35) / 100);

        const state = {
            time: this._param(params, 'time', 250),
            feedback: this._param(params, 'feedback', 40),
            mix: this._param(params, 'mix', 35),
            mod: this._param(params, 'mod', 20),
            drive: this._param(params, 'drive', 15)
        };

        input.connect(dryWet.input);
        delay.connect(toneFilter);
        toneFilter.connect(feedbackShaper);
        feedbackShaper.connect(feedbackGain);
        feedbackGain.connect(delay);
        modOsc.connect(modGain);
        modGain.connect(delay.delayTime);
        modOsc.start();

        const apply = () => {
            const modNorm = state.mod / 100;
            const driveNorm = state.drive / 100;
            delay.delayTime.value = state.time / 1000;
            feedbackGain.gain.value = Math.min(0.92, state.feedback / 100);
            dryWet.updateMix(state.mix / 100);
            feedbackShaper.curve = this._waveShaperCurve(0.12 + driveNorm * 0.5, 'warm');
            toneFilter.frequency.value = 3800 + (1 - driveNorm) * 6000;
            toneFilter.gain.value = -driveNorm * 6;
            modOsc.frequency.value = 0.15 + modNorm * 3.5;
            modGain.gain.value = 0.0008 + modNorm * 0.006;
        };

        apply();

        return {
            input, output: dryWet.output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                try { modOsc.stop(); } catch (_) {}
                [input, delay, feedbackGain, feedbackShaper, toneFilter, modOsc, modGain, dryWet.input, dryWet.output, dryWet.dryGain, dryWet.wetGain].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createGate(ctx, params) {
        const input = ctx.createGain();
        const sidechainHighPass = ctx.createBiquadFilter();
        sidechainHighPass.type = 'highpass';
        const comp = ctx.createDynamicsCompressor();
        const trim = ctx.createGain();
        const output = ctx.createGain();
        const state = {
            threshold: this._param(params, 'threshold', -40),
            attack: this._param(params, 'attack', 5),
            release: this._param(params, 'release', 150),
            hold: this._param(params, 'hold', 20)
        };

        input.connect(sidechainHighPass);
        sidechainHighPass.connect(comp);
        comp.connect(trim);
        trim.connect(output);

        const apply = () => {
            const thresholdNorm = Math.max(0, Math.min(1, (80 + state.threshold) / 80));
            comp.threshold.value = state.threshold;
            comp.ratio.value = 6 + thresholdNorm * 14;
            comp.attack.value = Math.max(0.0002, state.attack / 1000);
            comp.release.value = Math.max(0.01, state.release / 1000 + state.hold / 4000);
            sidechainHighPass.frequency.value = 40 + thresholdNorm * 160;
            trim.gain.value = 0.9 + thresholdNorm * 0.08;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() { [input, sidechainHighPass, comp, trim, output].forEach((node) => { try { node.disconnect(); } catch(_){} }); }
        };
    },

    createHaloGate(ctx, params) {
        const input = ctx.createGain();
        const sidechainHighPass = ctx.createBiquadFilter();
        sidechainHighPass.type = 'highpass';
        const gateComp = ctx.createDynamicsCompressor();
        const transientPeak = ctx.createBiquadFilter();
        transientPeak.type = 'peaking';
        transientPeak.frequency.value = 2800;
        transientPeak.Q.value = 1.2;
        const output = ctx.createGain();

        const state = {
            threshold: this._param(params, 'threshold', -40),
            attack: this._param(params, 'attack', 5),
            release: this._param(params, 'release', 150),
            hold: this._param(params, 'hold', 20),
            depth: this._param(params, 'depth', 70),
            lowCut: this._param(params, 'lowCut', 140),
            mid: this._param(params, 'mid', 50)
        };

        input.connect(sidechainHighPass);
        sidechainHighPass.connect(gateComp);
        gateComp.connect(transientPeak);
        transientPeak.connect(output);

        const apply = () => {
            const depthNorm = state.depth / 100;
            const midNorm = state.mid / 100;
            sidechainHighPass.frequency.value = state.lowCut;
            gateComp.threshold.value = state.threshold;
            gateComp.attack.value = Math.max(0.0001, state.attack / 1000);
            gateComp.release.value = Math.max(0.01, (state.release + state.hold * 0.5) / 1000);
            gateComp.ratio.value = 8 + depthNorm * 12;
            transientPeak.gain.value = midNorm * 8;
            transientPeak.frequency.value = 1800 + midNorm * 3200;
            output.gain.value = 1 - (1 - depthNorm) * 0.18;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, sidechainHighPass, gateComp, transientPeak, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createExciter(ctx, params) {
        const drive = this._param(params, 'drive', 35) / 100;
        const tone = this._param(params, 'tone', 50) / 100;
        const mix = this._param(params, 'mix', 100) / 100;
        const ceiling = this._param(params, 'ceiling', -1);

        const input = ctx.createGain();
        const highPass = ctx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.value = 2000 + tone * 6000;
        const shaper = ctx.createWaveShaper();
        shaper.curve = this._waveShaperCurve(drive * 0.8, 'warm');
        shaper.oversample = '4x';
        const dryWet = this._makeDryWet(ctx, shaper, mix);
        input.connect(highPass);
        highPass.connect(dryWet.input);
        const output = ctx.createGain();
        output.gain.value = Math.pow(10, ceiling / 20);
        dryWet.output.connect(output);
        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'drive') shaper.curve = this._waveShaperCurve((value / 100) * 0.8, 'warm');
                if (paramId === 'tone') highPass.frequency.value = 2000 + (value / 100) * 6000;
                if (paramId === 'mix') dryWet.updateMix(value / 100);
                if (paramId === 'ceiling') output.gain.value = Math.pow(10, value / 20);
            },
            dispose() { try { highPass.disconnect(); } catch(_){} try { shaper.disconnect(); } catch(_){} }
        };
    },

    createHarmonicLens(ctx, params) {
        const input = ctx.createGain();
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 180;
        const highPass = ctx.createBiquadFilter();
        highPass.type = 'highpass';
        const shaper = ctx.createWaveShaper();
        shaper.oversample = '4x';
        const tilt = ctx.createBiquadFilter();
        tilt.type = 'highshelf';
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();

        const state = {
            mode: this._param(params, 'mode', 50),
            drive: this._param(params, 'drive', 35),
            preEqLowShelf: this._param(params, 'preEqLowShelf', 1),
            postEqTilt: this._param(params, 'postEqTilt', 0),
            mix: this._param(params, 'mix', 100),
            ceiling: this._param(params, 'ceiling', -1)
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(lowShelf);
        lowShelf.connect(highPass);
        highPass.connect(shaper);
        shaper.connect(tilt);
        tilt.connect(wetGain);
        wetGain.connect(output);

        const apply = () => {
            const modeNorm = state.mode / 100;
            lowShelf.gain.value = state.preEqLowShelf;
            highPass.frequency.value = 1400 + modeNorm * 6200;
            shaper.curve = this._waveShaperCurve(0.12 + (state.drive / 100) * 0.55 + modeNorm * 0.15, 'warm');
            tilt.frequency.value = 3200 + modeNorm * 5200;
            tilt.gain.value = state.postEqTilt;
            dryGain.gain.value = 1 - (state.mix / 100);
            wetGain.gain.value = state.mix / 100;
            output.gain.value = Math.pow(10, state.ceiling / 20);
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, lowShelf, highPass, shaper, tilt, dryGain, wetGain, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createPhase(ctx, params) {
        const input = ctx.createGain();
        const splitter = ctx.createChannelSplitter(2);
        const merger = ctx.createChannelMerger(2);
        const midBus = ctx.createGain();
        const sideBus = ctx.createGain();
        const leftToMid = ctx.createGain();
        const rightToMid = ctx.createGain();
        const leftToSide = ctx.createGain();
        const rightToSide = ctx.createGain();
        const sideHighPass = ctx.createBiquadFilter();
        sideHighPass.type = 'highpass';
        sideHighPass.frequency.value = this._param(params, 'lowCut', 120);
        const midToLeft = ctx.createGain();
        const midToRight = ctx.createGain();
        const sideToLeft = ctx.createGain();
        const sideToRight = ctx.createGain();

        input.connect(splitter);
        leftToMid.gain.value = 0.5;
        rightToMid.gain.value = 0.5;
        leftToSide.gain.value = 0.5;
        rightToSide.gain.value = -0.5;

        splitter.connect(leftToMid, 0);
        splitter.connect(rightToMid, 1);
        splitter.connect(leftToSide, 0);
        splitter.connect(rightToSide, 1);
        leftToMid.connect(midBus);
        rightToMid.connect(midBus);
        leftToSide.connect(sideBus);
        rightToSide.connect(sideBus);
        sideBus.connect(sideHighPass);
        midBus.connect(midToLeft);
        midBus.connect(midToRight);
        sideHighPass.connect(sideToLeft);
        sideHighPass.connect(sideToRight);
        midToLeft.connect(merger, 0, 0);
        sideToLeft.connect(merger, 0, 0);
        midToRight.connect(merger, 0, 1);
        sideToRight.connect(merger, 0, 1);

        const state = {
            width: this._param(params, 'width', 100),
            lowCut: this._param(params, 'lowCut', 120),
            mid: this._param(params, 'mid', 100),
            side: this._param(params, 'side', 100)
        };
        const apply = () => {
            const widthFactor = state.width / 100;
            midToLeft.gain.value = state.mid / 100;
            midToRight.gain.value = state.mid / 100;
            sideToLeft.gain.value = (state.side / 100) * widthFactor;
            sideToRight.gain.value = -(state.side / 100) * widthFactor;
            sideHighPass.frequency.value = state.lowCut;
        };
        apply();

        return {
            input, output: merger,
            update(paramId, value) {
                if (paramId === 'width') state.width = value;
                if (paramId === 'mid') state.mid = value;
                if (paramId === 'side') state.side = value;
                if (paramId === 'lowCut') state.lowCut = value;
                apply();
            },
            dispose() {
                [input, splitter, merger, midBus, sideBus, leftToMid, rightToMid, leftToSide, rightToSide, sideHighPass, midToLeft, midToRight, sideToLeft, sideToRight].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createPhaseLock(ctx, params) {
        const input = ctx.createGain();
        const splitter = ctx.createChannelSplitter(2);
        const merger = ctx.createChannelMerger(2);
        const midBus = ctx.createGain();
        const sideBus = ctx.createGain();
        const sideHighPass = ctx.createBiquadFilter();
        sideHighPass.type = 'highpass';
        const sideHighShelf = ctx.createBiquadFilter();
        sideHighShelf.type = 'highshelf';
        const midToLeft = ctx.createGain();
        const midToRight = ctx.createGain();
        const sideToLeft = ctx.createGain();
        const sideToRight = ctx.createGain();
        const leftMid = ctx.createGain();
        const rightMid = ctx.createGain();
        const leftSide = ctx.createGain();
        const rightSide = ctx.createGain();

        const state = {
            globalWidth: this._paramAny(params, ['globalWidth', 'width'], 100),
            lowCut: this._param(params, 'lowCut', 120),
            highShelfWidth: this._param(params, 'highShelfWidth', 110),
            mid: this._param(params, 'mid', 100),
            side: this._param(params, 'side', 100)
        };

        leftMid.gain.value = 0.5;
        rightMid.gain.value = 0.5;
        leftSide.gain.value = 0.5;
        rightSide.gain.value = -0.5;

        input.connect(splitter);
        splitter.connect(leftMid, 0); splitter.connect(rightMid, 1);
        splitter.connect(leftSide, 0); splitter.connect(rightSide, 1);
        leftMid.connect(midBus); rightMid.connect(midBus);
        leftSide.connect(sideBus); rightSide.connect(sideBus);
        sideBus.connect(sideHighPass);
        sideHighPass.connect(sideHighShelf);
        midBus.connect(midToLeft); midBus.connect(midToRight);
        sideHighShelf.connect(sideToLeft); sideHighShelf.connect(sideToRight);
        midToLeft.connect(merger, 0, 0); sideToLeft.connect(merger, 0, 0);
        midToRight.connect(merger, 0, 1); sideToRight.connect(merger, 0, 1);

        const apply = () => {
            const widthNorm = state.globalWidth / 100;
            const highWidthNorm = state.highShelfWidth / 100;
            midToLeft.gain.value = state.mid / 100;
            midToRight.gain.value = state.mid / 100;
            sideToLeft.gain.value = (state.side / 100) * widthNorm;
            sideToRight.gain.value = -(state.side / 100) * widthNorm;
            sideHighPass.frequency.value = state.lowCut;
            sideHighShelf.frequency.value = 4200;
            sideHighShelf.gain.value = (highWidthNorm - 1) * 8;
        };

        apply();

        return {
            input, output: merger,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                if (paramId === 'width') state.globalWidth = value;
                apply();
            },
            dispose() {
                [input, splitter, merger, midBus, sideBus, sideHighPass, sideHighShelf, midToLeft, midToRight, sideToLeft, sideToRight, leftMid, rightMid, leftSide, rightSide].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createBus(ctx, params) {
        const state = {
            drive: this._param(params, 'drive', 45),
            headroom: this._param(params, 'headroom', 0),
            gain: this._param(params, 'gain', 0),
            mix: this._param(params, 'mix', 100)
        };

        const input = ctx.createGain();
        const shaper = ctx.createWaveShaper();
        shaper.curve = this._waveShaperCurve((state.drive / 100) * 0.6, 'tape');
        shaper.oversample = '4x';
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.ratio.value = 2 + (state.drive / 100) * 4;
        const output = ctx.createGain();
        output.gain.value = Math.pow(10, (state.headroom + state.gain) / 20);

        const dryWet = this._makeDryWet(ctx, shaper, state.mix / 100);
        input.connect(dryWet.input);
        dryWet.output.connect(comp);
        comp.connect(output);
        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                if (paramId === 'drive') {
                    shaper.curve = this._waveShaperCurve((state.drive / 100) * 0.6, 'tape');
                    comp.ratio.value = 2 + (state.drive / 100) * 4;
                }
                if (paramId === 'headroom' || paramId === 'gain') {
                    output.gain.value = Math.pow(10, (state.headroom + state.gain) / 20);
                }
                if (paramId === 'mix') dryWet.updateMix(state.mix / 100);
            },
            dispose() { try { shaper.disconnect(); } catch(_){} try { comp.disconnect(); } catch(_){} }
        };
    },

    createSpectraFix(ctx, params) {
        const input = ctx.createGain();
        const highPass = ctx.createBiquadFilter();
        highPass.type = 'highpass';
        const notch = ctx.createBiquadFilter();
        notch.type = 'notch';
        const smooth = ctx.createBiquadFilter();
        smooth.type = 'lowpass';
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();

        const state = {
            bands: this._param(params, 'bands', 4),
            spread: this._param(params, 'spread', 50),
            shift: this._param(params, 'shift', 0),
            wet: this._param(params, 'wet', 60),
            detectionThreshold: this._param(params, 'detectionThreshold', 45),
            maxAnomalyDurationMs: this._param(params, 'maxAnomalyDurationMs', 28),
            inpaintingRadius: this._param(params, 'inpaintingRadius', 32),
            mix: this._param(params, 'mix', 60)
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(highPass);
        highPass.connect(notch);
        notch.connect(smooth);
        smooth.connect(wetGain);
        wetGain.connect(output);

        const apply = () => {
            const detectNorm = state.detectionThreshold / 100;
            const durationNorm = state.maxAnomalyDurationMs / 100;
            const radiusNorm = state.inpaintingRadius / 100;
            highPass.frequency.value = 50 + state.bands * 120;
            notch.frequency.value = 1800 + state.spread * 60;
            notch.Q.value = 2 + detectNorm * 16;
            notch.gain.value = state.shift * 0.15;
            smooth.frequency.value = 4500 + (1 - durationNorm) * 9000;
            dryGain.gain.value = 1 - (state.mix / 100);
            wetGain.gain.value = (state.mix / 100) * (0.7 + radiusNorm * 0.3);
            output.gain.value = 0.9 + (state.wet / 100) * 0.1;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, highPass, notch, smooth, dryGain, wetGain, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createVelvetBus(ctx, params) {
        const input = ctx.createGain();
        const transformer = ctx.createWaveShaper();
        transformer.oversample = '4x';
        const comp = ctx.createDynamicsCompressor();
        const headroomGain = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();

        const state = {
            inputGain: this._param(params, 'inputGain', 0),
            transformerDrive: this._param(params, 'transformerDrive', 45),
            summingHeadroom: this._param(params, 'summingHeadroom', 0),
            outputGain: this._param(params, 'outputGain', 0),
            mix: this._param(params, 'mix', 100)
        };

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(transformer);
        transformer.connect(comp);
        comp.connect(headroomGain);
        headroomGain.connect(wetGain);
        wetGain.connect(output);

        const apply = () => {
            const driveNorm = state.transformerDrive / 100;
            input.gain.value = Math.pow(10, state.inputGain / 20);
            transformer.curve = this._waveShaperCurve(0.18 + driveNorm * 0.5, 'tape');
            comp.threshold.value = -20 + driveNorm * 8;
            comp.ratio.value = 1.8 + driveNorm * 3.2;
            headroomGain.gain.value = Math.pow(10, state.summingHeadroom / 20);
            dryGain.gain.value = 1 - (state.mix / 100);
            wetGain.gain.value = state.mix / 100;
            output.gain.value = Math.pow(10, state.outputGain / 20);
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                apply();
            },
            dispose() {
                [input, transformer, comp, headroomGain, dryGain, wetGain, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createChronoShift(ctx, params) {
        const state = {
            pitch: this._param(params, 'pitch', 0),
            formant: this._param(params, 'formant', 0),
            stretch: this._param(params, 'stretch', 1),
            grain: this._param(params, 'grain', 40)
        };

        const input = ctx.createGain();
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        const output = ctx.createGain();
        const preHighPass = ctx.createBiquadFilter();
        preHighPass.type = 'highpass';
        preHighPass.frequency.value = 45;
        const formantFilter = ctx.createBiquadFilter();
        formantFilter.type = 'peaking';
        const smearDelayA = ctx.createDelay(0.25);
        const smearDelayB = ctx.createDelay(0.25);
        const feedbackA = ctx.createGain();
        const feedbackB = ctx.createGain();
        const spreadGainA = ctx.createGain();
        const spreadGainB = ctx.createGain();
        const textureFilter = ctx.createBiquadFilter();
        textureFilter.type = 'highshelf';
        const wetBus = ctx.createGain();
        const modA = ctx.createOscillator();
        const modB = ctx.createOscillator();
        const modGainA = ctx.createGain();
        const modGainB = ctx.createGain();

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(preHighPass);
        preHighPass.connect(formantFilter);
        formantFilter.connect(smearDelayA);
        formantFilter.connect(smearDelayB);
        smearDelayA.connect(feedbackA);
        feedbackA.connect(smearDelayA);
        smearDelayB.connect(feedbackB);
        feedbackB.connect(smearDelayB);
        smearDelayA.connect(spreadGainA);
        smearDelayB.connect(spreadGainB);
        spreadGainA.connect(textureFilter);
        spreadGainB.connect(textureFilter);
        textureFilter.connect(wetBus);
        wetBus.connect(wetGain);
        wetGain.connect(output);
        modA.connect(modGainA);
        modGainA.connect(smearDelayA.delayTime);
        modB.connect(modGainB);
        modGainB.connect(smearDelayB.delayTime);
        modA.start();
        modB.start();

        const apply = () => {
            const pitchNorm = Math.min(1, Math.abs(state.pitch) / 24);
            const stretchNorm = Math.min(1, Math.abs(state.stretch - 1));
            const grainNorm = Math.min(1, state.grain / 100);
            const formantRatio = Math.pow(2, state.formant / 24);
            const baseDelay = 0.012 + pitchNorm * 0.022 + stretchNorm * 0.06;
            const grainSpread = 0.002 + grainNorm * 0.012;
            smearDelayA.delayTime.value = Math.min(0.2, baseDelay);
            smearDelayB.delayTime.value = Math.min(0.22, baseDelay + grainSpread);
            feedbackA.gain.value = Math.min(0.72, 0.16 + stretchNorm * 0.44 + grainNorm * 0.08);
            feedbackB.gain.value = Math.min(0.72, 0.12 + stretchNorm * 0.36 + pitchNorm * 0.12);
            formantFilter.frequency.value = Math.max(180, Math.min(4800, 1200 * formantRatio));
            formantFilter.Q.value = 0.7 + grainNorm * 5;
            formantFilter.gain.value = state.formant * 0.7;
            textureFilter.frequency.value = 2200 + grainNorm * 5000;
            textureFilter.gain.value = -4 + pitchNorm * 4 + stretchNorm * 5;
            spreadGainA.gain.value = 0.48;
            spreadGainB.gain.value = -0.48;
            dryGain.gain.value = Math.max(0.35, 1 - (0.22 + pitchNorm * 0.18 + stretchNorm * 0.22));
            wetGain.gain.value = Math.min(0.95, 0.18 + pitchNorm * 0.25 + stretchNorm * 0.32 + grainNorm * 0.15);
            output.gain.value = 0.95;
            modA.frequency.value = 0.18 + grainNorm * 2.2;
            modB.frequency.value = 0.24 + stretchNorm * 1.6;
            modGainA.gain.value = 0.001 + grainNorm * 0.004;
            modGainB.gain.value = 0.0015 + pitchNorm * 0.0045;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'pitch') state.pitch = value;
                if (paramId === 'formant') state.formant = value;
                if (paramId === 'stretch') state.stretch = value;
                if (paramId === 'grain') state.grain = value;
                apply();
            },
            dispose() {
                try { modA.stop(); } catch (_) {}
                try { modB.stop(); } catch (_) {}
                [modA, modB, modGainA, modGainB, input, dryGain, wetGain, output, preHighPass, formantFilter, smearDelayA, smearDelayB, feedbackA, feedbackB, spreadGainA, spreadGainB, textureFilter, wetBus].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createCockpit(ctx, params) {
        const state = {
            focus: this._param(params, 'param1', 50)
        };

        const input = ctx.createGain();
        const lowShelf = ctx.createBiquadFilter();
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 180;
        const presencePeak = ctx.createBiquadFilter();
        presencePeak.type = 'peaking';
        presencePeak.frequency.value = 2200;
        presencePeak.Q.value = 0.9;
        const airShelf = ctx.createBiquadFilter();
        airShelf.type = 'highshelf';
        airShelf.frequency.value = 9000;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.attack.value = 0.004;
        comp.release.value = 0.08;
        const output = ctx.createGain();

        input.connect(lowShelf);
        lowShelf.connect(presencePeak);
        presencePeak.connect(airShelf);
        airShelf.connect(comp);
        comp.connect(output);

        const apply = () => {
            const focus = state.focus / 100;
            lowShelf.gain.value = -3 - focus * 7;
            presencePeak.gain.value = focus * 8;
            airShelf.gain.value = focus * 5;
            comp.ratio.value = 1.5 + focus * 3.5;
            output.gain.value = 0.9 + focus * 0.12;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'param1' || paramId === 'gain') {
                    state.focus = value;
                    apply();
                }
            },
            dispose() {
                [input, lowShelf, presencePeak, airShelf, comp, output].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },

    createVoxGenesis(ctx, params) {
        const state = {
            texture: this._param(params, 'param1', 50),
            formant: this._param(params, 'param2', 50),
            focus: this._param(params, 'param3', 55),
            naturalness: this._param(params, 'param4', 65),
            tightness: this._param(params, 'param5', 50),
            sibilance: this._param(params, 'param6', 50)
        };

        const input = ctx.createGain();
        const dryGain = ctx.createGain();
        const output = ctx.createGain();
        const highPass = ctx.createBiquadFilter();
        highPass.type = 'highpass';
        const bodyPeak = ctx.createBiquadFilter();
        bodyPeak.type = 'peaking';
        bodyPeak.Q.value = 1.05;
        const focusPeak = ctx.createBiquadFilter();
        focusPeak.type = 'peaking';
        focusPeak.frequency.value = 3100;
        focusPeak.Q.value = 1.25;
        const airShelf = ctx.createBiquadFilter();
        airShelf.type = 'highshelf';
        airShelf.frequency.value = 9800;
        const deEssShelf = ctx.createBiquadFilter();
        deEssShelf.type = 'highshelf';
        deEssShelf.frequency.value = 6200;
        const comp = ctx.createDynamicsCompressor();
        const saturator = ctx.createWaveShaper();
        saturator.oversample = '4x';
        const doublerA = ctx.createDelay(0.08);
        const doublerB = ctx.createDelay(0.08);
        const doublerGainA = ctx.createGain();
        const doublerGainB = ctx.createGain();
        const stereoMerger = ctx.createGain();
        const wetGain = ctx.createGain();
        const modA = ctx.createOscillator();
        const modB = ctx.createOscillator();
        const modGainA = ctx.createGain();
        const modGainB = ctx.createGain();

        input.connect(dryGain);
        dryGain.connect(output);
        input.connect(highPass);
        highPass.connect(bodyPeak);
        bodyPeak.connect(focusPeak);
        focusPeak.connect(airShelf);
        airShelf.connect(deEssShelf);
        deEssShelf.connect(comp);
        comp.connect(saturator);
        saturator.connect(doublerA);
        saturator.connect(doublerB);
        doublerA.connect(doublerGainA);
        doublerB.connect(doublerGainB);
        doublerGainA.connect(stereoMerger);
        doublerGainB.connect(stereoMerger);
        stereoMerger.connect(wetGain);
        wetGain.connect(output);
        modA.connect(modGainA);
        modB.connect(modGainB);
        modGainA.connect(doublerA.delayTime);
        modGainB.connect(doublerB.delayTime);
        modA.start();
        modB.start();

        const clamp01 = (value) => Math.max(0, Math.min(1, value / 100));
        const apply = () => {
            const texture = clamp01(state.texture);
            const formantOffset = (state.formant - 50) / 50;
            const focus = clamp01(state.focus);
            const natural = clamp01(state.naturalness);
            const tight = clamp01(state.tightness);
            const sibilance = clamp01(state.sibilance);
            const unnatural = 1 - natural;

            highPass.frequency.value = 65 + tight * 55;
            bodyPeak.frequency.value = Math.max(115, Math.min(460, 215 * Math.pow(2, formantOffset * 0.58)));
            bodyPeak.gain.value = formantOffset * 4.5 + (1 - focus) * 1.2;
            focusPeak.frequency.value = 2400 + focus * 1900;
            focusPeak.Q.value = 0.85 + tight * 1.15;
            focusPeak.gain.value = -1.5 + focus * 6.5;
            airShelf.gain.value = -1 + focus * 4.5 - sibilance * 2.8;
            deEssShelf.gain.value = -(1.5 + sibilance * 8.5 + unnatural * 1.8);

            comp.threshold.value = -30 + tight * 14;
            comp.knee.value = 18 - tight * 9;
            comp.ratio.value = 1.4 + tight * 4.2;
            comp.attack.value = 0.004 + (1 - tight) * 0.018;
            comp.release.value = 0.07 + (1 - tight) * 0.18;

            saturator.curve = this._waveShaperCurve(0.10 + texture * 0.24 + unnatural * 0.2, natural > 0.45 ? 'warm' : 'bright');
            doublerA.delayTime.value = 0.012 + texture * 0.021 - tight * 0.004;
            doublerB.delayTime.value = 0.018 + texture * 0.026 - tight * 0.005;
            doublerGainA.gain.value = 0.08 + texture * 0.22;
            doublerGainB.gain.value = -(0.07 + texture * 0.2);
            dryGain.gain.value = Math.max(0.58, 1 - texture * 0.24 - unnatural * 0.08);
            wetGain.gain.value = 0.08 + texture * 0.36 + unnatural * 0.06;
            output.gain.value = 0.94 + natural * 0.05;
            modA.frequency.value = 0.16 + texture * 0.38 + unnatural * 0.65;
            modB.frequency.value = 0.21 + texture * 0.44 + unnatural * 0.75;
            modGainA.gain.value = 0.00025 + texture * 0.0009 + unnatural * 0.0012;
            modGainB.gain.value = 0.00035 + texture * 0.0011 + unnatural * 0.0015;
        };

        apply();

        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'param1') state.texture = value;
                if (paramId === 'param2') state.formant = value;
                if (paramId === 'param3') state.focus = value;
                if (paramId === 'param4') state.naturalness = value;
                if (paramId === 'param5') state.tightness = value;
                if (paramId === 'param6') state.sibilance = value;
                apply();
            },
            dispose() {
                try { modA.stop(); } catch (_) {}
                try { modB.stop(); } catch (_) {}
                [modA, modB, modGainA, modGainB, input, dryGain, output, highPass, bodyPeak, focusPeak, airShelf, deEssShelf, comp, saturator, doublerA, doublerB, doublerGainA, doublerGainB, stereoMerger, wetGain].forEach((node) => {
                    try { node.disconnect(); } catch (_) {}
                });
            }
        };
    },
    createGain(ctx, params) {
        const gain = ctx.createGain();
        gain.gain.value = 1;
        return {
            input: gain, output: gain,
            update(paramId, value) {
                if (paramId === 'gain' || paramId === 'param1' || paramId === 'param2' || paramId === 'param3') {
                    gain.gain.value = Math.max(0, value / 100);
                }
            },
            dispose() {}
        };
    }
};

class TitanDAW {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.bpm = 120;
        this.timeSignature = '4/4';
        this.tracks = [];
        this.engine = new TitanAudioEngine();
        this.voxEngine = new VoxEngine();
        this.testOsc = null;
        this.audioClips = new Map();
        this.clipSources = new Map();
        // v2.0.3 seamless loop: sources scheduled ahead by the loop lookahead
        // scheduler (tracked separately from clipSources since one clipId can
        // have several in-flight iterations). Entries: { src, whenCtx }.
        this._loopScheduledSources = new Set();
        this._loopNextCtxTime = NaN;
        this.fileInput = null;
        this.isLooping = false;
        this.TIMELINE_GUTTER_PX = 200;
        this.isRecording = false;
        this.recordSession = null;
        this.takesMode = false;
        this.comping = null;
        this.playbackTrackFilter = null;
        this.playbackTickHook = null;
        this.loopStart = 200;
        this.loopEnd = 800;
        this.punchInTime = null;
        this.punchOutTime = null;
        this.metadata = { title: '', artist: '', album: '', genre: '', bpm: 120, key: '', comments: '' };
        this.fingerprintDB = new Map();
        this.errors = [];
        this.trackPlugins = new Map();
        this.trackPluginChains = new Map();
        this.busPlugins = new Map();
        this.busPluginChains = new Map();
        this.currentPluginTrack = 1;
        this.currentPluginTarget = { type: 'track', id: 1 };
        this.selectedTrackId = 1;
        this.selectedClipId = null;
        this.automationData = { tracks: {}, buses: {}, plugins: {} };
        this.automationWriteMode = false;
        this._autoReadActive = false;
        this.automationUiState = {
            scope: 'track',
            trackLane: 'volume',
            busId: 'master',
            pluginInstanceId: '',
            pluginParamId: ''
        };
        this.lastAutomationUiSyncTime = 0;
        this.snapStepSeconds = 0;
        this.restoringWorkingSession = false;
        this.activePanelId = 'plugins';
        this.collaborationChannel = null;
        this.collaborationSessionId = this.resolveCollaborationSessionId();
        this.collaborationParticipantId = this.createCollaborationParticipantId();
        this.collaborationParticipants = new Map();
        this.collaborationPresenceInterval = null;
        this.collaborationSnapshotTimeout = null;
        this.lastSnapshotTimestamp = 0;
        this.lastTransportSyncTime = 0;
        this.suppressCollaborationBroadcast = false;
        this.trackPlugins.set(1, [
            this._createPluginInstance('aura', 'aura-instance-1'),
            this._createPluginInstance('eq', 'eq-instance-1'),
            this._createPluginInstance('compressor', 'compressor-instance-1'),
            this._createPluginInstance('vox_genesis', 'vox-instance-1')
        ]);
        this.trackPlugins.set(2, []);
        this.trackPlugins.set(3, []);
        this.trackPlugins.set(4, []);
        this.trackPlugins.set(5, []);
        this.trackPlugins.set(6, []);
        this.trackPlugins.set(7, []);
        this.trackPlugins.set(8, []);
        this.busPlugins.set('busA', []);
        this.busPlugins.set('busB', []);
        this.init();
    }

    async init() {
        await this.engine.init();
        await this.voxEngine.init(this.engine.ctx);
        if (typeof TitanComping !== 'undefined') {
            this.comping = new TitanComping(this);
        }
        TITAN_DEFAULT_TRACK_IDS.forEach(id => this.engine.createTrackGain(id));
        this.setupEventListeners();
        this.populateBrowser();
        this.setupWaveforms();
        this.startClock();
        await this.loadPluginUIs();
        await this.restoreWorkingSession();
        if (!document.querySelector('.track-header')) {
            this.syncTrackStructure(TITAN_DEFAULT_TRACK_IDS.map((id) => ({ id })));
            this.refreshMainUi();
        }
        this._updateTimelineExtent();
        window.addEventListener('resize', () => this._updateTimelineExtent());
        this.updatePluginTrackSelector();
        this.renderPluginChain();
        Array.from(this.trackPlugins.keys()).forEach(id => this.rebuildTrackPluginChain(id));
        TITAN_BUS_OPTIONS.filter((bus) => bus.id !== 'master').forEach((bus) => this.rebuildBusPluginChain(bus.id));
        this.setupCollaboration();
        this.updateAuraTelemetry();
        this.updateSystemMeters();
        this.refreshMainUi();
        window.addEventListener('storage', (event) => {
            if (event.key === TITAN_AURA_CALIBRATION_KEY || event.key === TITAN_AURA_ACTIVE_PROFILE_KEY) {
                this.updateAuraTelemetry();
            }
        });
        window.addEventListener('focus', () => {
            this.updateAuraTelemetry();
            this.updateSystemMeters();
        });
        window.addEventListener('beforeunload', () => {
            this.storeWorkingSessionSnapshot();
            this.shutdownCollaboration();
        });
        window.addEventListener('pagehide', () => {
            this.storeWorkingSessionSnapshot();
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.storeWorkingSessionSnapshot();
            }
        });
    }

    createCollaborationParticipantId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `participant-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    generateCollaborationSessionId() {
        const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let value = '';
        for (let index = 0; index < 8; index++) {
            value += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
        return value;
    }

    resolveCollaborationSessionId() {
        const params = new URLSearchParams(window.location.search);
        const paramValue = params.get(TITAN_DAW_COLLAB_SESSION_PARAM);
        if (paramValue) {
            localStorage.setItem(TITAN_DAW_COLLAB_SESSION_KEY, paramValue);
            return paramValue;
        }
        const stored = localStorage.getItem(TITAN_DAW_COLLAB_SESSION_KEY);
        if (stored) return stored;
        const generated = this.generateCollaborationSessionId();
        localStorage.setItem(TITAN_DAW_COLLAB_SESSION_KEY, generated);
        return generated;
    }

    setupCollaboration() {
        this.updateCollaborationUi();
        document.getElementById('copyCollabLink')?.addEventListener('click', () => this.copyCollaborationInvite());
        document.getElementById('openCollabWindow')?.addEventListener('click', () => this.openCollaborationWindow());

        if (typeof BroadcastChannel === 'undefined') {
            this.updateCollaborationUi('Local only');
            return;
        }

        this.collaborationChannel = new BroadcastChannel(`titan-daw:${this.collaborationSessionId}`);
        this.collaborationChannel.addEventListener('message', (event) => {
            this.handleCollaborationMessage(event.data);
        });

        this.broadcastCollaborationPresence('hello', true);
        this.requestCollaborationSnapshot();
        this.collaborationPresenceInterval = window.setInterval(() => {
            this.broadcastCollaborationPresence('hello', false);
            this.pruneCollaborationParticipants();
        }, 2500);
    }

    getLocalCollaborationParticipant() {
        return {
            id: this.collaborationParticipantId,
            name: document.querySelector('.session-name')?.value || 'Titan Peer',
            sessionId: this.collaborationSessionId,
            joinedAt: Date.now()
        };
    }

    postCollaborationMessage(message) {
        if (!this.collaborationChannel) return;
        this.collaborationChannel.postMessage({
            ...message,
            sessionId: this.collaborationSessionId,
            sourceId: this.collaborationParticipantId
        });
    }

    broadcastCollaborationPresence(type, requestReply) {
        this.postCollaborationMessage({
            type,
            requestReply,
            participant: this.getLocalCollaborationParticipant()
        });
    }

    requestCollaborationSnapshot() {
        this.postCollaborationMessage({
            type: 'request-snapshot'
        });
    }

    pruneCollaborationParticipants() {
        const now = Date.now();
        Array.from(this.collaborationParticipants.entries()).forEach(([participantId, participant]) => {
            if (now - participant.lastSeen > 8000) {
                this.collaborationParticipants.delete(participantId);
            }
        });
        this.updateCollaborationUi();
    }

    registerCollaborationParticipant(participant) {
        if (!participant || participant.id === this.collaborationParticipantId) return;
        this.collaborationParticipants.set(participant.id, {
            ...participant,
            lastSeen: Date.now()
        });
        this.updateCollaborationUi();
    }

    handleCollaborationMessage(message) {
        if (!message || message.sourceId === this.collaborationParticipantId || message.sessionId !== this.collaborationSessionId) {
            return;
        }

        switch (message.type) {
        case 'hello':
            this.registerCollaborationParticipant(message.participant);
            if (message.requestReply) {
                this.broadcastCollaborationPresence('hello-ack', false);
                this.broadcastSessionSnapshot();
            }
            break;
        case 'hello-ack':
            this.registerCollaborationParticipant(message.participant);
            break;
        case 'leave':
            this.collaborationParticipants.delete(message.sourceId);
            this.updateCollaborationUi();
            break;
        case 'request-snapshot':
            this.broadcastSessionSnapshot();
            break;
        case 'session-snapshot':
            this.registerCollaborationParticipant(message.participant);
            this.handleRemoteSessionSnapshot(message.snapshot).catch((error) => {
                console.warn('Failed to apply remote session snapshot:', error);
            });
            break;
        case 'transport':
            this.handleRemoteTransport(message.transport).catch((error) => {
                console.warn('Failed to apply remote transport:', error);
            });
            break;
        default:
            break;
        }
    }

    scheduleSnapshotBroadcast(snapshot) {
        if (this.suppressCollaborationBroadcast || !this.collaborationChannel) return;
        window.clearTimeout(this.collaborationSnapshotTimeout);
        this.collaborationSnapshotTimeout = window.setTimeout(() => {
            this.broadcastSessionSnapshot(snapshot);
        }, 120);
    }

    broadcastSessionSnapshot(existingSnapshot = null) {
        if (this.suppressCollaborationBroadcast || !this.collaborationChannel) return;
        const snapshot = existingSnapshot || this.buildWorkingSessionData();
        this.postCollaborationMessage({
            type: 'session-snapshot',
            participant: this.getLocalCollaborationParticipant(),
            snapshot
        });
    }

    async handleRemoteSessionSnapshot(snapshot) {
        if (!snapshot || !snapshot.snapshotTimestamp || snapshot.snapshotTimestamp <= this.lastSnapshotTimestamp) return;
        this.lastSnapshotTimestamp = snapshot.snapshotTimestamp;
        this.suppressCollaborationBroadcast = true;
        try {
            await this.applyWorkingSessionData(snapshot);
            localStorage.setItem(TITAN_WORKING_SESSION_KEY, JSON.stringify(snapshot));
        } finally {
            this.suppressCollaborationBroadcast = false;
        }
    }

    broadcastTransportState(action, extra = {}) {
        if (this.suppressCollaborationBroadcast || !this.collaborationChannel) return;
        this.postCollaborationMessage({
            type: 'transport',
            transport: {
                action,
                currentTime: this.currentTime,
                isPlaying: this.isPlaying,
                ...extra
            }
        });
    }

    async handleRemoteTransport(transport) {
        if (!transport || !transport.action) return;
        this.suppressCollaborationBroadcast = true;
        try {
            switch (transport.action) {
            case 'play':
                this.currentTime = Number.isFinite(transport.currentTime) ? transport.currentTime : this.currentTime;
                this.updateTimeDisplay();
                if (this.isPlaying) {
                    clearInterval(this.playheadInterval);
                    this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
                    this.clipSources.clear();
                } else {
                    this.updateTransportPlayState(true);
                }
                this.startPlayback();
                break;
            case 'pause':
                this.currentTime = Number.isFinite(transport.currentTime) ? transport.currentTime : this.currentTime;
                this.updateTransportPlayState(false);
                await this.pausePlayback();
                this.updateTimeDisplay();
                break;
            case 'stop':
                await this.stop();
                break;
            case 'rewind':
                await this.rewind();
                break;
            case 'sync':
                if (this.isPlaying && Number.isFinite(transport.currentTime) && Math.abs(this.currentTime - transport.currentTime) > 0.2) {
                    this.currentTime = transport.currentTime;
                    clearInterval(this.playheadInterval);
                    this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
                    this.clipSources.clear();
                    this.startPlayback();
                }
                break;
            default:
                break;
            }
        } finally {
            this.suppressCollaborationBroadcast = false;
        }
    }

    updateCollaborationUi(statusOverride = '') {
        const sessionIdLabel = document.getElementById('collabSessionId');
        const peerCountLabel = document.getElementById('collabPeerCount');
        const sessionStatus = document.getElementById('sessionStatus');
        const peerCount = this.collaborationParticipants.size;
        if (sessionIdLabel) sessionIdLabel.textContent = `Session ${this.collaborationSessionId}`;
        if (peerCountLabel) peerCountLabel.textContent = peerCount ? `${peerCount + 1} peers` : 'Solo';
        if (sessionStatus) {
            const statusText = statusOverride || (peerCount ? `Live collaboration â€¢ ${peerCount + 1} peers` : 'Ready');
            sessionStatus.innerHTML = `<i class="fas fa-circle status-indicator"></i> ${statusText}`;
        }
    }

    getCollaborationInviteUrl() {
        const inviteUrl = new URL(window.location.href);
        inviteUrl.searchParams.set(TITAN_DAW_COLLAB_SESSION_PARAM, this.collaborationSessionId);
        return inviteUrl.toString();
    }

    getTimeSignatureValue() {
        const select = /** @type {HTMLSelectElement | null} */ (document.getElementById('timeSignatureSelect'));
        return select?.value || this.timeSignature || '4/4';
    }

    applyTimeSignatureToUi(value = this.timeSignature) {
        const select = /** @type {HTMLSelectElement | null} */ (document.getElementById('timeSignatureSelect'));
        if (select) select.value = value || '4/4';
    }

    readJsonStorage(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            console.warn(`Failed to parse storage key ${key}:`, error);
            return fallback;
        }
    }

    getAuraTelemetryState() {
        return {
            calibrationProfile: this.readJsonStorage(TITAN_AURA_CALIBRATION_KEY, null),
            activeProfile: this.readJsonStorage(TITAN_AURA_ACTIVE_PROFILE_KEY, null)
        };
    }

    getAuraTargetName(targetId) {
        return TITAN_AURA_TARGET_NAMES[targetId] || targetId || 'Custom profile';
    }

    updateAuraTelemetry() {
        const { calibrationProfile, activeProfile } = this.getAuraTelemetryState();
        const auraStatusText = document.getElementById('auraStatusText');
        const harmonicFill = /** @type {HTMLElement | null} */ (document.getElementById('auraHarmonicFill'));
        const harmonicValue = document.getElementById('auraHarmonicValue');
        const transientFill = /** @type {HTMLElement | null} */ (document.getElementById('auraTransientFill'));
        const transientValue = document.getElementById('auraTransientValue');

        const inputLabel = activeProfile?.inputDeviceLabel || calibrationProfile?.inputDeviceLabel || '';
        const targetName = calibrationProfile?.recommendations?.targetName || this.getAuraTargetName(activeProfile?.targetId);
        const bypassed = !!activeProfile?.bypassed;

        if (auraStatusText) {
            if (calibrationProfile || activeProfile) {
                const stateLabel = bypassed ? 'Bypassed' : 'Active';
                const detailParts = [];
                if (targetName) detailParts.push(targetName);
                if (inputLabel) detailParts.push(inputLabel);
                auraStatusText.textContent = detailParts.length > 0
                    ? `${stateLabel} - ${detailParts.join(' â€¢ ')}`
                    : stateLabel;
            } else {
                auraStatusText.textContent = 'No calibration loaded';
            }
        }

        const harmonicPercent = calibrationProfile?.metrics ? Math.round(calibrationProfile.metrics.harmonicRichness * 100) : null;
        const transientPercent = calibrationProfile?.metrics ? Math.round(calibrationProfile.metrics.transientScore * 100) : null;

        if (harmonicFill) harmonicFill.style.width = harmonicPercent !== null ? `${harmonicPercent}%` : '0%';
        if (harmonicValue) harmonicValue.textContent = harmonicPercent !== null ? `${harmonicPercent}%` : '--';
        if (transientFill) transientFill.style.width = transientPercent !== null ? `${transientPercent}%` : '0%';
        if (transientValue) transientValue.textContent = transientPercent !== null ? `${transientPercent}%` : '--';
    }

    getLatencyTelemetryText() {
        const ctx = this.engine?.ctx;
        if (!ctx) return '--';
        const totalLatencyMs = ((ctx.baseLatency || 0) + (ctx.outputLatency || 0)) * 1000;
        if (!Number.isFinite(totalLatencyMs) || totalLatencyMs <= 0) return '--';
        const base = totalLatencyMs < 10 ? `${totalLatencyMs.toFixed(2)} ms` : `${totalLatencyMs.toFixed(1)} ms`;
        // v2.0.3: append plugin-delay-compensation + master-chain accounting.
        const sr = ctx.sampleRate || 48000;
        const pdcMs = ((this._pdcMaxLatencySamples || 0) / sr) * 1000;
        const masterMs = ((this._pdcMasterLatencySamples || 0) / sr) * 1000;
        if (pdcMs > 0.01 || masterMs > 0.01) {
            return `${base} (+${pdcMs.toFixed(1)}ms PDC, +${masterMs.toFixed(1)}ms master)`;
        }
        return base;
    }

    getMemoryTelemetryText() {
        const memory = performance['memory'];
        if (!memory || !Number.isFinite(memory.usedJSHeapSize)) return 'N/A';
        const usedMb = memory.usedJSHeapSize / (1024 * 1024);
        return usedMb >= 1024 ? `${(usedMb / 1024).toFixed(2)} GB` : `${usedMb.toFixed(0)} MB`;
    }

    countActivePlugins() {
        let count = 0;
        this.trackPlugins.forEach((plugins) => {
            plugins.forEach((plugin) => {
                if (!plugin.bypassed) count += 1;
            });
        });
        this.busPlugins.forEach((plugins) => {
            plugins.forEach((plugin) => {
                if (!plugin.bypassed) count += 1;
            });
        });
        return count;
    }

    getPluginTargetLabel(target = this.currentPluginTarget) {
        if (target?.type === 'bus') return TITAN_BUS_LABELS[target.id] || 'Bus Return';
        const trackId = Number(target?.id || this.currentPluginTrack || 1);
        return this.getTrackName(trackId);
    }

    getPluginTargetChain(target = this.currentPluginTarget) {
        if (target?.type === 'bus') return this.busPlugins.get(target.id) || [];
        return this.trackPlugins.get(Number(target?.id || this.currentPluginTrack || 1)) || [];
    }

    setPluginTargetChain(target, chain) {
        if (target?.type === 'bus') {
            this.busPlugins.set(target.id, chain);
            return;
        }
        this.trackPlugins.set(Number(target?.id || this.currentPluginTrack || 1), chain);
    }

    setCurrentPluginTarget(type, id) {
        if (type === 'bus' && this.busPlugins.has(id)) {
            this.currentPluginTarget = { type: 'bus', id };
            this.renderPluginChain();
            return;
        }
        const trackId = Number(id);
        const normalizedTrackId = Number.isFinite(trackId) && trackId > 0 ? trackId : this.currentPluginTrack || 1;
        this.currentPluginTrack = normalizedTrackId;
        this.currentPluginTarget = { type: 'track', id: normalizedTrackId };
        this.renderPluginChain();
    }

    countBusReturnPlugins(busId) {
        return (this.busPlugins.get(busId) || []).length;
    }

    _sanitizeAutomationPoints(points, fallback = 0, min = 0, max = 1) {
        if (!Array.isArray(points)) return [];
        return points
            .map((point) => ({
                time: Math.max(0, Number(point?.time) || 0),
                value: Math.max(min, Math.min(max, Number(point?.value) || fallback))
            }))
            .sort((a, b) => a.time - b.time);
    }

    normalizeAutomationData(data = this.automationData) {
        const normalized = {
            tracks: {},
            buses: {},
            plugins: {}
        };

        const trackEntries = data?.tracks && typeof data.tracks === 'object' ? data.tracks : {};
        Object.entries(trackEntries).forEach(([trackId, laneState]) => {
            const numericTrackId = Number(trackId);
            if (!Number.isFinite(numericTrackId) || numericTrackId <= 0) return;
            normalized.tracks[numericTrackId] = {};
            TITAN_AUTOMATION_TRACK_LANES.forEach((lane) => {
                normalized.tracks[numericTrackId][lane.id] = this._sanitizeAutomationPoints(laneState?.[lane.id], 0, lane.min, lane.max);
            });
        });

        TITAN_BUS_OPTIONS.forEach((bus) => {
            normalized.buses[bus.id] = {
                volume: this._sanitizeAutomationPoints(data?.buses?.[bus.id]?.volume, this.engine.getBusVolume(bus.id), 0, 1.25)
            };
        });

        const pluginEntries = data?.plugins && typeof data.plugins === 'object' ? data.plugins : {};
        Object.entries(pluginEntries).forEach(([pluginKey, pluginState]) => {
            if (!pluginState || typeof pluginState !== 'object') return;
            const params = {};
            Object.entries(pluginState.params || {}).forEach(([paramId, points]) => {
                const descriptor = this.getPluginAutomationDescriptor(pluginState.targetType, pluginState.targetId, pluginState.instanceId, paramId);
                if (!descriptor) return;
                params[paramId] = this._sanitizeAutomationPoints(points, descriptor.value, descriptor.min, descriptor.max);
            });
            normalized.plugins[pluginKey] = {
                targetType: pluginState.targetType === 'bus' ? 'bus' : 'track',
                targetId: pluginState.targetType === 'bus' ? String(pluginState.targetId) : Number(pluginState.targetId) || 1,
                instanceId: pluginState.instanceId || '',
                params
            };
        });

        return normalized;
    }

    getTrackAutomationState(trackId) {
        const normalizedTrackId = Number(trackId) || 1;
        if (!this.automationData.tracks[normalizedTrackId]) {
            this.automationData.tracks[normalizedTrackId] = TITAN_AUTOMATION_TRACK_LANES.reduce((map, lane) => {
                map[lane.id] = [];
                return map;
            }, {});
        }
        return this.automationData.tracks[normalizedTrackId];
    }

    getBusAutomationState(busId) {
        const normalizedBusId = TITAN_BUS_LABELS[busId] ? busId : 'master';
        if (!this.automationData.buses[normalizedBusId]) {
            this.automationData.buses[normalizedBusId] = { volume: [] };
        }
        return this.automationData.buses[normalizedBusId];
    }

    getPluginAutomationKey(targetType, targetId, instanceId) {
        return `${targetType}:${targetId}:${instanceId}`;
    }

    getPluginAutomationState(targetType, targetId, instanceId) {
        const pluginKey = this.getPluginAutomationKey(targetType, targetId, instanceId);
        if (!this.automationData.plugins[pluginKey]) {
            this.automationData.plugins[pluginKey] = {
                targetType,
                targetId,
                instanceId,
                params: {}
            };
        }
        return this.automationData.plugins[pluginKey];
    }

    getTargetPluginChain(targetType, targetId) {
        if (targetType === 'bus') return this.busPlugins.get(targetId) || [];
        return this.trackPlugins.get(Number(targetId) || 1) || [];
    }

    getPluginAutomationDescriptor(targetType, targetId, instanceId, paramId = '') {
        const chain = this.getTargetPluginChain(targetType, targetId);
        const pluginIdx = chain.findIndex((plugin) => plugin.instanceId === instanceId);
        if (pluginIdx === -1) return null;
        const plugin = chain[pluginIdx];
        const param = plugin.params.find((entry) => entry.id === paramId) || plugin.params[0];
        if (!param) return null;
        return {
            plugin,
            pluginIdx,
            param,
            min: Number.isFinite(param.min) ? param.min : 0,
            max: Number.isFinite(param.max) ? param.max : 1,
            step: Number.isFinite(param.step) ? param.step : 0.01,
            value: Number(param.val) || 0
        };
    }

    getCurrentAutomationDescriptor() {
        const scope = this.automationUiState.scope || 'track';
        if (scope === 'bus') {
            const busId = TITAN_BUS_LABELS[this.automationUiState.busId] ? this.automationUiState.busId : 'master';
            const points = this.getBusAutomationState(busId).volume;
            return {
                scope: 'bus',
                laneKey: `bus:${busId}:volume`,
                label: `${TITAN_BUS_LABELS[busId]} Gain`,
                min: 0,
                max: 1.25,
                step: 0.01,
                points,
                value: this.engine.getBusVolume(busId),
                applyValue: (value) => this.engine.setBusVolume(busId, value)
            };
        }
        if (scope === 'plugin') {
            const targetType = this.currentPluginTarget?.type === 'bus' ? 'bus' : 'track';
            const targetId = this.currentPluginTarget?.id || (targetType === 'bus' ? 'busA' : this.currentPluginTrack || 1);
            const pluginState = this.getPluginAutomationState(
                targetType,
                targetId,
                this.automationUiState.pluginInstanceId || ''
            );
            const descriptor = this.getPluginAutomationDescriptor(
                targetType,
                targetId,
                pluginState.instanceId,
                this.automationUiState.pluginParamId
            );
            if (!descriptor) return null;
            const points = pluginState.params[descriptor.param.id] || [];
            pluginState.params[descriptor.param.id] = points;
            return {
                scope: 'plugin',
                laneKey: `${targetType}:${targetId}:${descriptor.plugin.instanceId}:${descriptor.param.id}`,
                label: `${this.getPluginTargetLabel({ type: targetType, id: targetId })} â€¢ ${descriptor.plugin.name} â€¢ ${descriptor.param.label}`,
                min: descriptor.min,
                max: descriptor.max,
                step: descriptor.step,
                points,
                value: descriptor.param.val,
                applyValue: (value) => this.setPluginParamValueById({ type: targetType, id: targetId }, descriptor.pluginIdx, descriptor.param.id, value)
            };
        }

        const trackId = this.getSelectedTrackId();
        const laneId = TITAN_AUTOMATION_TRACK_LANES.some((lane) => lane.id === this.automationUiState.trackLane)
            ? this.automationUiState.trackLane
            : 'volume';
        const lane = TITAN_AUTOMATION_TRACK_LANES.find((entry) => entry.id === laneId) || TITAN_AUTOMATION_TRACK_LANES[0];
        const state = this.getTrackAutomationState(trackId);
        const points = state[lane.id];
        const currentValue = lane.id === 'volume'
            ? (this.engine.trackGains.get(trackId)?.volume ?? 0.75)
            : lane.id === 'pan'
                ? this.engine.getTrackPan(trackId)
                : this.engine.getTrackSendLevel(trackId, lane.id === 'send-busA' ? 'busA' : 'busB');
        return {
            scope: 'track',
            laneKey: `track:${trackId}:${lane.id}`,
            label: `${this.getTrackName(trackId)} â€¢ ${lane.label}`,
            min: lane.min,
            max: lane.max,
            step: lane.step,
            points,
            value: currentValue,
            applyValue: (value) => {
                if (lane.id === 'volume') return this.engine.setTrackVolume(trackId, value);
                if (lane.id === 'pan') return this.engine.setTrackPan(trackId, value);
                return this.engine.setTrackSendLevel(trackId, lane.id === 'send-busA' ? 'busA' : 'busB', value);
            }
        };
    }

    sampleAutomationValue(points, time, fallback) {
        if (!Array.isArray(points) || points.length === 0) return fallback;
        const normalizedTime = Math.max(0, Number(time) || 0);
        if (normalizedTime <= points[0].time) return points[0].value;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const next = points[i];
            if (normalizedTime <= next.time) {
                const span = Math.max(0.000001, next.time - prev.time);
                const progress = Math.max(0, Math.min(1, (normalizedTime - prev.time) / span));
                return prev.value + ((next.value - prev.value) * progress);
            }
        }
        return points[points.length - 1].value;
    }

    writeAutomationPointAtPlayhead() {
        const descriptor = this.getCurrentAutomationDescriptor();
        if (!descriptor) return;
        const valueSlider = /** @type {HTMLInputElement | null} */ (document.getElementById('automationValueSlider'));
        const value = Number(valueSlider?.value ?? descriptor.value);
        const existingIdx = descriptor.points.findIndex((point) => Math.abs(point.time - this.currentTime) < 0.01);
        if (existingIdx !== -1) {
            descriptor.points[existingIdx].value = value;
        } else {
            descriptor.points.push({ time: this.currentTime, value });
        }
        descriptor.points.sort((a, b) => a.time - b.time);
        this.automationData = this.normalizeAutomationData(this.automationData);
        descriptor.applyValue(value);
        this.syncAutomationDrivenUi();
        this.updateAutomationEditorUi();
        this.storeWorkingSessionSnapshot();
    }

    clearCurrentAutomationLane() {
        const descriptor = this.getCurrentAutomationDescriptor();
        if (!descriptor) return;
        descriptor.points.length = 0;
        this.applyAutomationStateAtTime(this.currentTime, { syncUi: true });
        this.updateAutomationEditorUi();
        this.storeWorkingSessionSnapshot();
    }

    deleteAutomationPoint(scopeKey, pointIndex) {
        const descriptor = this.getCurrentAutomationDescriptor();
        if (!descriptor || descriptor.laneKey !== scopeKey) return;
        descriptor.points.splice(pointIndex, 1);
        this.applyAutomationStateAtTime(this.currentTime, { syncUi: true });
        this.updateAutomationEditorUi();
        this.storeWorkingSessionSnapshot();
    }

    jumpToAutomationPoint(time) {
        this.currentTime = Math.max(0, Number(time) || 0);
        // v2.0.3: keep the jump sticky while the audio-clock tick is running.
        if (this.isPlaying) this._reanchorTransport();
        this.updateTimeDisplay();
        const left = (this.currentTime * 100) + 200;
        const playhead = document.getElementById('playhead');
        const rulerHead = document.getElementById('playheadRuler');
        if (playhead) playhead.style.left = `${left}px`;
        if (rulerHead) rulerHead.style.left = `${left}px`;
        this.applyAutomationStateAtTime(this.currentTime, { syncUi: true });
        this.storeWorkingSessionSnapshot();
    }

    syncAutomationDrivenUi() {
        this.engine.trackGains.forEach((entry, trackId) => {
            const fader = /** @type {HTMLInputElement | null} */ (document.querySelector(`.track-header[data-track="${trackId}"] .track-fader`));
            if (fader) fader.value = String(Math.round((entry.volume ?? 0.75) * 100));
        });
        const selectedTrackId = this.getSelectedTrackId();
        const panSlider = /** @type {HTMLInputElement | null} */ (document.getElementById('selectedTrackPan'));
        const sendBusASlider = /** @type {HTMLInputElement | null} */ (document.getElementById('selectedTrackSend-busA'));
        const sendBusBSlider = /** @type {HTMLInputElement | null} */ (document.getElementById('selectedTrackSend-busB'));
        if (panSlider) panSlider.value = String(this.engine.getTrackPan(selectedTrackId));
        if (sendBusASlider) sendBusASlider.value = String(this.engine.getTrackSendLevel(selectedTrackId, 'busA'));
        if (sendBusBSlider) sendBusBSlider.value = String(this.engine.getTrackSendLevel(selectedTrackId, 'busB'));
        TITAN_BUS_OPTIONS.forEach((bus) => {
            const slider = /** @type {HTMLInputElement | null} */ (document.getElementById(`busVolume-${bus.id}`));
            if (slider) slider.value = String(this.engine.getBusVolume(bus.id));
        });
    }

    applyAutomationStateAtTime(time, options = {}) {
        const normalizedTime = Math.max(0, Number(time) || 0);
        Object.entries(this.automationData.tracks || {}).forEach(([trackId, laneState]) => {
            const numericTrackId = Number(trackId);
            if (!this.engine.trackGains.has(numericTrackId)) return;
            if (laneState.volume?.length) {
                const value = this.sampleAutomationValue(laneState.volume, normalizedTime, this.engine.trackGains.get(numericTrackId)?.volume ?? 0.75);
                this.engine.setTrackVolume(numericTrackId, value);
            }
            if (laneState.pan?.length) {
                const value = this.sampleAutomationValue(laneState.pan, normalizedTime, this.engine.getTrackPan(numericTrackId));
                this.engine.setTrackPan(numericTrackId, value);
            }
            if (laneState['send-busA']?.length) {
                const value = this.sampleAutomationValue(laneState['send-busA'], normalizedTime, this.engine.getTrackSendLevel(numericTrackId, 'busA'));
                this.engine.setTrackSendLevel(numericTrackId, 'busA', value);
            }
            if (laneState['send-busB']?.length) {
                const value = this.sampleAutomationValue(laneState['send-busB'], normalizedTime, this.engine.getTrackSendLevel(numericTrackId, 'busB'));
                this.engine.setTrackSendLevel(numericTrackId, 'busB', value);
            }
        });
        Object.entries(this.automationData.buses || {}).forEach(([busId, laneState]) => {
            if (laneState.volume?.length) {
                const value = this.sampleAutomationValue(laneState.volume, normalizedTime, this.engine.getBusVolume(busId));
                this.engine.setBusVolume(busId, value);
            }
        });
        this._autoReadActive = true;
        try {
            Object.values(this.automationData.plugins || {}).forEach((pluginState) => {
                const descriptorTarget = { type: pluginState.targetType === 'bus' ? 'bus' : 'track', id: pluginState.targetId };
                const chain = this.getPluginTargetChain(pluginState.targetType, pluginState.targetId);
                const pluginIdx = chain.findIndex((plugin) => plugin.instanceId === pluginState.instanceId);
                if (pluginIdx === -1) return;
                Object.entries(pluginState.params || {}).forEach(([paramId, points]) => {
                    if (!points.length) return;
                    const pluginDescriptor = this.getPluginAutomationDescriptor(pluginState.targetType, pluginState.targetId, pluginState.instanceId, paramId);
                    if (!pluginDescriptor) return;
                    const value = this.sampleAutomationValue(points, normalizedTime, pluginDescriptor.param.val);
                    this.setPluginParamValueById(descriptorTarget, pluginIdx, paramId, value);
                });
            });
        } finally {
            this._autoReadActive = false;
        }
        if (options.syncUi) {
            this.syncAutomationDrivenUi();
            this.updateSelectedTrackInspector();
            this.updateBusTelemetryUi();
            this.updateAutomationEditorUi();
        }
    }

    _scheduleAutomationCurve(audioParam, points, defaultValue) {
        if (!audioParam || !Array.isArray(points) || points.length === 0) return;
        audioParam.cancelScheduledValues(0);
        if (points[0].time > 0) {
            audioParam.setValueAtTime(defaultValue, 0);
            audioParam.linearRampToValueAtTime(points[0].value, points[0].time);
        } else {
            audioParam.setValueAtTime(points[0].value, 0);
        }
        for (let i = 1; i < points.length; i++) {
            audioParam.linearRampToValueAtTime(points[i].value, points[i].time);
        }
    }

    updateAutomationEditorUi() {
        const scopeSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('automationScopeSelect'));
        const trackLaneSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('automationTrackLaneSelect'));
        const busTargetSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('automationBusTargetSelect'));
        const pluginSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('automationPluginSelect'));
        const pluginParamSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('automationPluginParamSelect'));
        const valueSlider = /** @type {HTMLInputElement | null} */ (document.getElementById('automationValueSlider'));
        const valueText = document.getElementById('automationValueText');
        const laneLabel = document.getElementById('automationLaneLabel');
        const pointCount = document.getElementById('automationPointCount');
        const pointList = document.getElementById('automationPointList');
        const trackLaneControl = /** @type {HTMLElement | null} */ (document.getElementById('automationTrackLaneControl'));
        const busTargetControl = /** @type {HTMLElement | null} */ (document.getElementById('automationBusTargetControl'));
        const pluginTargetControl = /** @type {HTMLElement | null} */ (document.getElementById('automationPluginTargetControl'));
        const pluginParamControl = /** @type {HTMLElement | null} */ (document.getElementById('automationPluginParamControl'));
        if (!scopeSelect || !trackLaneSelect || !busTargetSelect || !pluginSelect || !pluginParamSelect || !valueSlider || !pointList) return;

        scopeSelect.value = this.automationUiState.scope;
        trackLaneSelect.value = this.automationUiState.trackLane;
        busTargetSelect.value = this.automationUiState.busId;
        trackLaneControl.style.display = this.automationUiState.scope === 'track' ? '' : 'none';
        busTargetControl.style.display = this.automationUiState.scope === 'bus' ? '' : 'none';
        pluginTargetControl.style.display = this.automationUiState.scope === 'plugin' ? '' : 'none';
        pluginParamControl.style.display = this.automationUiState.scope === 'plugin' ? '' : 'none';

        if (this.automationUiState.scope === 'plugin') {
            const targetType = this.currentPluginTarget?.type === 'bus' ? 'bus' : 'track';
            const targetId = this.currentPluginTarget?.id || (targetType === 'bus' ? 'busA' : this.currentPluginTrack || 1);
            const chain = this.getTargetPluginChain(targetType, targetId);
            pluginSelect.innerHTML = chain.length
                ? chain.map((plugin) => `<option value="${plugin.instanceId}">${plugin.name}</option>`).join('')
                : '<option value="">No plugins available</option>';
            if (!chain.some((plugin) => plugin.instanceId === this.automationUiState.pluginInstanceId)) {
                this.automationUiState.pluginInstanceId = chain[0]?.instanceId || '';
            }
            pluginSelect.value = this.automationUiState.pluginInstanceId;
            const activePlugin = chain.find((plugin) => plugin.instanceId === this.automationUiState.pluginInstanceId);
            pluginParamSelect.innerHTML = activePlugin
                ? activePlugin.params.map((param) => `<option value="${param.id}">${param.label}</option>`).join('')
                : '<option value="">No parameters available</option>';
            if (!activePlugin?.params.some((param) => param.id === this.automationUiState.pluginParamId)) {
                this.automationUiState.pluginParamId = activePlugin?.params[0]?.id || '';
            }
            pluginParamSelect.value = this.automationUiState.pluginParamId;
        }

        const descriptor = this.getCurrentAutomationDescriptor();
        if (!descriptor) {
            laneLabel.textContent = 'No automation target available';
            pointCount.textContent = '0 points';
            pointList.innerHTML = '<div class="automation-point-empty">Select a valid automation target.</div>';
            return;
        }

        laneLabel.textContent = descriptor.label;
        pointCount.textContent = `${descriptor.points.length} point${descriptor.points.length === 1 ? '' : 's'}`;
        valueSlider.min = String(descriptor.min);
        valueSlider.max = String(descriptor.max);
        valueSlider.step = String(descriptor.step || 0.01);
        const sliderValue = Math.max(descriptor.min, Math.min(descriptor.max, Number(descriptor.value) || 0));
        valueSlider.value = String(sliderValue);
        if (valueText) valueText.textContent = descriptor.scope === 'track' && this.automationUiState.trackLane === 'pan'
            ? this.formatTrackPanValue(sliderValue)
            : Number(sliderValue).toFixed(descriptor.step >= 1 ? 0 : 2);

        if (descriptor.points.length === 0) {
            pointList.innerHTML = '<div class="automation-point-empty">No automation points on this lane.</div>';
            return;
        }
        pointList.innerHTML = descriptor.points.map((point, index) => `
            <div class="automation-point-entry" data-lane-key="${descriptor.laneKey}" data-point-index="${index}">
                <span>${this.formatTime(point.time)}</span>
                <span>${descriptor.scope === 'track' && this.automationUiState.trackLane === 'pan' ? this.formatTrackPanValue(point.value) : Number(point.value).toFixed(descriptor.step >= 1 ? 0 : 2)}</span>
                <div class="clip-action-buttons">
                    <button class="browser-btn" data-automation-action="jump">Go</button>
                    <button class="browser-btn" data-automation-action="delete">Delete</button>
                </div>
            </div>
        `).join('');
    }

    syncTrackStructure(trackStates = []) {
        const normalizedTrackIds = trackStates
            .map((trackState) => Number(trackState?.id))
            .filter((trackId) => Number.isFinite(trackId) && trackId > 0);
        const desiredTrackIds = normalizedTrackIds.length > 0 ? normalizedTrackIds : [1];
        const desiredTrackSet = new Set(desiredTrackIds);
        const existingTrackIds = Array.from(document.querySelectorAll('.track-header'))
            .map((trackHeader) => Number(trackHeader.getAttribute('data-track')))
            .filter((trackId) => Number.isFinite(trackId) && trackId > 0)
            .sort((a, b) => b - a);

        existingTrackIds.forEach((trackId) => {
            if (!desiredTrackSet.has(trackId)) {
                this.removeTrack(trackId, { storeSnapshot: false });
            }
        });
        desiredTrackIds.forEach((trackId) => this.ensureTrackExists(trackId));

        if (!desiredTrackSet.has(this.currentPluginTrack)) {
            this.currentPluginTrack = Math.min(...desiredTrackIds);
        }
    }

    async copyCollaborationInvite() {
        const inviteUrl = this.getCollaborationInviteUrl();
        try {
            await navigator.clipboard.writeText(inviteUrl);
            this.addConsoleMessage('success', `Collaboration invite copied for session ${this.collaborationSessionId}.`);
        } catch (error) {
            this.addConsoleMessage('error', `Failed to copy collaboration invite: ${error.message}`);
        }
    }

    openCollaborationWindow() {
        window.open(this.getCollaborationInviteUrl(), '_blank', 'noopener');
    }

    shutdownCollaboration() {
        window.clearTimeout(this.collaborationSnapshotTimeout);
        if (this.collaborationPresenceInterval) clearInterval(this.collaborationPresenceInterval);
        this.postCollaborationMessage({ type: 'leave' });
        if (this.collaborationChannel) {
            this.collaborationChannel.close();
            this.collaborationChannel = null;
        }
    }

    _getTrackPlaybackState(trackId) {
        const entry = this.engine.trackGains.get(trackId);
        if (!entry) {
            return { volume: 0.75, muted: false, soloed: false };
        }
        return {
            volume: entry.volume ?? 0.75,
            muted: !!entry.muted,
            soloed: !!entry.soloed
        };
    }

    _trackOutputGain(trackId, anySoloed) {
        const state = this._getTrackPlaybackState(trackId);
        if (state.muted) return 0;
        if (anySoloed && !state.soloed) return 0;
        return state.volume;
    }

    _projectDurationSeconds() {
        let maxEnd = 0;
        this.audioClips.forEach((clip) => {
            const clipEnd = (clip.timelineStart || 0) + this.getClipPlayDuration(clip);
            if (clipEnd > maxEnd) maxEnd = clipEnd;
        });
        return maxEnd;
    }

    _projectTailSeconds() {
        for (const plugins of this.trackPlugins.values()) {
            if (plugins.some((plugin) => !plugin.bypassed && ['deeproom', 'endlesshall', 'delay', 'master'].includes(plugin.processor || plugin.catalogId || plugin.id))) {
                return 4;
            }
        }
        for (const plugins of this.busPlugins.values()) {
            if (plugins.some((plugin) => !plugin.bypassed && ['deeproom', 'endlesshall', 'delay', 'master'].includes(plugin.processor || plugin.catalogId || plugin.id))) {
                return 4;
            }
        }
        return 0.25;
    }

    _buildOfflineTrackRouting(ctx, trackId, busTargets, masterGain, baseOutputGain = 1) {
        const trackInput = ctx.createGain();
        const trackPanner = ctx.createStereoPanner();
        const trackGain = ctx.createGain();
        trackGain.gain.value = baseOutputGain;
        trackInput.connect(trackPanner);
        trackPanner.connect(trackGain);
        const outputBusId = this.engine.getTrackOutput(trackId);
        const busTarget = busTargets.get(outputBusId) || masterGain;
        trackGain.connect(busTarget);
        const trackAutomation = this.getTrackAutomationState(trackId);
        TITAN_BUS_OPTIONS.filter((bus) => bus.id !== 'master').forEach((bus) => {
            const sendLevel = this.engine.getTrackSendLevel(trackId, bus.id);
            const sendLaneId = bus.id === 'busA' ? 'send-busA' : 'send-busB';
            const sendAutomation = trackAutomation[sendLaneId];
            if (sendLevel <= 0 && !sendAutomation?.length) return;
            const sendGain = ctx.createGain();
            sendGain.gain.value = sendLevel;
            trackPanner.connect(sendGain);
            sendGain.connect(busTargets.get(bus.id) || masterGain);
            this._scheduleAutomationCurve(sendGain.gain, sendAutomation, sendLevel);
        });
        trackPanner.pan.value = this.engine.getTrackPan(trackId);
        this._scheduleAutomationCurve(trackGain.gain, trackAutomation.volume, baseOutputGain);
        this._scheduleAutomationCurve(trackPanner.pan, trackAutomation.pan, trackPanner.pan.value);

        const chain = this.trackPlugins.get(trackId) || [];
        const activePlugins = chain.filter((plugin) => !plugin.bypassed);
        if (activePlugins.length === 0) {
            return { input: trackInput, trackGain, nodes: [] };
        }

        const nodes = activePlugins.map((plugin) => PluginProcessor.create(ctx, plugin));
        for (let i = 0; i < nodes.length - 1; i++) {
            nodes[i].output.connect(nodes[i + 1].input);
        }
        nodes[nodes.length - 1].output.connect(trackInput);
        return { input: nodes[0].input, trackGain, nodes };
    }

    _buildOfflineBusRouting(ctx, masterGain) {
        const offlineBusTargets = new Map();
        TITAN_BUS_OPTIONS.filter((bus) => bus.id !== 'master').forEach((bus) => {
            const input = ctx.createGain();
            const gain = ctx.createGain();
            gain.gain.value = this.engine.getBusVolume(bus.id);
            gain.connect(masterGain);
            this._scheduleAutomationCurve(gain.gain, this.getBusAutomationState(bus.id).volume, gain.gain.value);
            const chain = this.busPlugins.get(bus.id) || [];
            const activePlugins = chain.filter((plugin) => !plugin.bypassed);
            if (activePlugins.length === 0) {
                input.connect(gain);
                offlineBusTargets.set(bus.id, { input, output: gain, nodes: [] });
                return;
            }
            const nodes = activePlugins.map((plugin) => PluginProcessor.create(ctx, plugin));
            for (let i = 0; i < nodes.length - 1; i++) {
                nodes[i].output.connect(nodes[i + 1].input);
            }
            input.connect(nodes[0].input);
            nodes[nodes.length - 1].output.connect(gain);
            offlineBusTargets.set(bus.id, { input, output: gain, nodes });
        });
        return offlineBusTargets;
    }

    async renderMixdownBuffer() {
        if (this.audioClips.size === 0) {
            throw new Error('No audio clips are loaded.');
        }

        const projectDuration = this._projectDurationSeconds();
        if (projectDuration <= 0) {
            throw new Error('No timeline audio is available to export.');
        }

        const tailSeconds = this._projectTailSeconds();
        const sampleRate = this.engine.ctx?.sampleRate || 48000;
        const totalSeconds = Math.max(1, projectDuration + tailSeconds);
        const totalFrames = Math.ceil(totalSeconds * sampleRate);
        const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);
        const masterGain = offlineCtx.createGain();
        masterGain.gain.value = this.engine.masterGain?.gain?.value ?? 0.85;
        // v2.0.3: mirror the realtime master safety limiter in the export chain,
        // honoring the same on/off setting — a hot mix must not clip on export
        // either. (Adversarial-pass fix: the realtime limiter alone left exports
        // unprotected.)
        const safetyOn = this.engine.isMasterSafetyLimiterOn();
        const safetyComp = offlineCtx.createDynamicsCompressor();
        safetyComp.threshold.value = safetyOn ? -1.5 : 0;
        safetyComp.knee.value = 0;
        safetyComp.ratio.value = safetyOn ? 20 : 1;
        safetyComp.attack.value = 0.002;
        safetyComp.release.value = 0.1;
        const safetyShaper = offlineCtx.createWaveShaper();
        safetyShaper.oversample = '4x';
        safetyShaper.curve = safetyOn
            ? TitanAudioEngine.makeSoftClipCurve()
            : TitanAudioEngine.makeLinearCurve();
        masterGain.connect(safetyComp);
        safetyComp.connect(safetyShaper);
        safetyShaper.connect(offlineCtx.destination);
        const offlineBusTargets = this._buildOfflineBusRouting(offlineCtx, masterGain);

        const anySoloed = Array.from(this.engine.trackGains.values()).some((entry) => entry.soloed);
        const trackIds = [...new Set(Array.from(this.audioClips.values()).map((clip) => clip.track || 1))];
        const trackRouting = new Map();

        trackIds.forEach((trackId) => {
            const outputGain = this._trackOutputGain(trackId, anySoloed);
            if (outputGain <= 0) return;
            const route = this._buildOfflineTrackRouting(
                offlineCtx,
                trackId,
                new Map(Array.from(offlineBusTargets.entries()).map(([busId, entry]) => [busId, entry.input])),
                masterGain,
                outputGain
            );
            trackRouting.set(trackId, route);
        });

        this.audioClips.forEach((clip) => {
            if (!clip.buffer || clip.muted) return;
            const trackId = clip.track || 1;
            const route = trackRouting.get(trackId);
            if (!route) return;
            const clipDuration = this.getClipPlayDuration(clip);
            if (clipDuration <= 0) return;
            const source = offlineCtx.createBufferSource();
            const clipGain = offlineCtx.createGain();
            source.buffer = clip.buffer;
            source.connect(clipGain);
            clipGain.connect(route.input);
            const clipStart = Math.max(0, clip.timelineStart || 0);
            const fadeIn = this.getClipFadeInDuration(clip);
            const fadeOut = this.getClipFadeOutDuration(clip);
            clipGain.gain.setValueAtTime(fadeIn > 0 ? 0 : 1, clipStart);
            if (fadeIn > 0) clipGain.gain.linearRampToValueAtTime(1, clipStart + fadeIn);
            if (fadeOut > 0) {
                const fadeOutStart = Math.max(clipStart, clipStart + clipDuration - fadeOut);
                clipGain.gain.setValueAtTime(1, fadeOutStart);
                clipGain.gain.linearRampToValueAtTime(0, clipStart + clipDuration);
            }
            source.start(clipStart, this.getClipTrimStart(clip), clipDuration);
        });

        return offlineCtx.startRendering();
    }

    _audioBufferToWav(audioBuffer) {
        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const frameCount = audioBuffer.length;
        const bytesPerSample = 2;
        const blockAlign = channels * bytesPerSample;
        const buffer = new ArrayBuffer(44 + frameCount * blockAlign);
        const view = new DataView(buffer);

        const writeString = (offset, text) => {
            for (let i = 0; i < text.length; i++) {
                view.setUint8(offset + i, text.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + frameCount * blockAlign, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, frameCount * blockAlign, true);

        let offset = 44;
        const channelData = [];
        for (let channel = 0; channel < channels; channel++) {
            channelData.push(audioBuffer.getChannelData(channel));
        }
        for (let i = 0; i < frameCount; i++) {
            for (let channel = 0; channel < channels; channel++) {
                const sample = Math.max(-1, Math.min(1, channelData[channel][i] || 0));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        return buffer;
    }

    _downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    _computeClipFingerprint(clip) {
        if (!clip.buffer) return null;
        const rawData = clip.buffer.getChannelData(0);
        const sampleRate = clip.buffer.sampleRate || this.engine?.sampleRate || 48000;
        const trimStartSample = Math.max(0, Math.floor(this.getClipTrimStart(clip) * sampleRate));
        const trimEndSample = Math.max(trimStartSample + 1, Math.min(rawData.length, Math.ceil(this.getClipTrimEnd(clip) * sampleRate) || rawData.length));
        const data = rawData.subarray(trimStartSample, trimEndSample);
        if (!data || data.length === 0) return null;

        const bucketCount = 32;
        const bucketSize = Math.max(1, Math.floor(data.length / bucketCount));
        const envelope = [];
        let sumSquares = 0;
        let zeroCrossings = 0;
        let weighted = 0;
        let magnitude = 0;

        for (let i = 0; i < data.length; i++) {
            const sample = data[i];
            const abs = Math.abs(sample);
            sumSquares += sample * sample;
            weighted += i * abs;
            magnitude += abs;
            if (i > 0 && ((data[i - 1] >= 0 && sample < 0) || (data[i - 1] < 0 && sample >= 0))) {
                zeroCrossings++;
            }
        }

        for (let bucket = 0; bucket < bucketCount; bucket++) {
            const start = bucket * bucketSize;
            const end = Math.min(data.length, start + bucketSize);
            let peak = 0;
            for (let i = start; i < end; i++) {
                const abs = Math.abs(data[i]);
                if (abs > peak) peak = abs;
            }
            envelope.push(Number(peak.toFixed(4)));
        }

        const rms = Math.sqrt(sumSquares / data.length);
        const zcr = zeroCrossings / data.length;
        const centroid = magnitude > 0 ? (weighted / magnitude) / data.length : 0;
        return {
            rms: Number(rms.toFixed(6)),
            zcr: Number(zcr.toFixed(6)),
            centroid: Number(centroid.toFixed(6)),
            envelope,
            duration: Number((this.getClipPlayDuration(clip) || 0).toFixed(4))
        };
    }

    _fingerprintDistance(a, b) {
        const envelopeLength = Math.min(a.envelope.length, b.envelope.length);
        let envelopeDelta = 0;
        for (let i = 0; i < envelopeLength; i++) {
            envelopeDelta += Math.abs(a.envelope[i] - b.envelope[i]);
        }
        const envelopeScore = envelopeDelta / Math.max(1, envelopeLength);
        return Math.abs(a.rms - b.rms) + Math.abs(a.zcr - b.zcr) + Math.abs(a.centroid - b.centroid) + envelopeScore;
    }

    _updateFingerprintUi(summaryText, matches = []) {
        const statusEl = document.getElementById('fpStatus');
        const resultsEl = document.getElementById('fpResults');
        const statsEl = document.getElementById('fpStats');

        if (statusEl) statusEl.textContent = summaryText;
        if (resultsEl) {
            resultsEl.innerHTML = matches.length === 0
                ? '<div style="color:var(--text-dim);font-size:12px;padding:8px 0">No duplicate or near-duplicate clips detected.</div>'
                : matches.map((match) => `
                    <div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:12px">
                        <strong>${match.a}</strong> <span style="color:var(--text-dim)">vs</span> <strong>${match.b}</strong>
                        <div style="color:var(--text-dim)">Similarity score: ${match.score.toFixed(4)}</div>
                    </div>
                `).join('');
        }
        if (statsEl) {
            statsEl.textContent = `${this.fingerprintDB.size} clip fingerprints indexed`;
        }
    }

    _createPluginInstance(pluginId, instanceId) {
        const template = PLUGIN_CATALOG.find((plugin) => plugin.id === pluginId);
        if (!template) {
            throw new Error(`Unknown plugin "${pluginId}"`);
        }
        return {
            ...template,
            instanceId: instanceId || `${pluginId}-instance-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            catalogId: pluginId,
            bypassed: false,
            params: Array.isArray(template.params) ? template.params.map((param) => ({ ...param })) : []
        };
    }

    /**
     * Load a compiled RDSL manifest into the session as live track plugins.
     * Uses RDSLLoader.compileToPluginDefs() to map the manifest onto real
     * Titan DSP builders, then appends the resulting plugin instances to the
     * selected track's chain and rebuilds it. Types with no DSP backend
     * arrive as honest passthroughs (see rdsl-loader.js) and are reported.
     */
    loadRDSLManifest(manifest, trackId = null) {
        if (!window.RDSLLoader || !window.RDSLLoader.compileToPluginDefs) {
            throw new Error('RDSL loader not available.');
        }
        const plan = window.RDSLLoader.compileToPluginDefs(manifest, PLUGIN_CATALOG);
        if (!plan.defs.length) {
            (plan.warnings || []).forEach((w) => this.addConsoleMessage('warning', `RDSL: ${w}`));
            this.addConsoleMessage('error', 'RDSL: manifest produced no loadable plugins.');
            return { added: 0, warnings: plan.warnings };
        }
        const targetTrackId = trackId || this.getSelectedTrackId() || 1;
        this.setCurrentPluginTarget('track', targetTrackId);
        const chain = this.getPluginTargetChain();
        let added = 0;
        plan.defs.forEach((def) => {
            try {
                const inst = this._createPluginInstance(def.key);
                if (def.name) inst.name = def.name;
                inst.rdslType = def.rdslType || null;
                inst.rdslPassthrough = !!def.passthrough;
                (def.params || []).forEach((p) => {
                    const target = inst.params.find((q) => q.id === p.id);
                    if (target) target.val = p.val;
                });
                chain.push(inst);
                added++;
            } catch (err) {
                plan.warnings.push(`Could not instantiate "${def.key}": ${err.message || err}`);
            }
        });
        this.setPluginTargetChain(this.currentPluginTarget, chain);
        this.renderPluginChain();
        this.rebuildTrackPluginChain(targetTrackId);
        this.refreshMainUi();
        this.storeWorkingSessionSnapshot();
        const names = plan.defs.map((d) => d.name).join(', ');
        this.addConsoleMessage('success', `RDSL: loaded ${added} plugin${added === 1 ? '' : 's'} onto Track ${targetTrackId} (${names}).`);
        (plan.warnings || []).forEach((w) => this.addConsoleMessage('warning', `RDSL: ${w}`));
        return { added, warnings: plan.warnings };
    }

    buildWorkingSessionData() {
        this.loadMetadataFromUI();
        return {
            version: 1,
            snapshotTimestamp: Date.now(),
            sessionName: document.querySelector('.session-name')?.value || 'Untitled Session',
            metadata: this.metadata,
            bpm: this.bpm,
            timeSignature: this.getTimeSignatureValue(),
            isLooping: this.isLooping,
            punchInTime: this.punchInTime,
            punchOutTime: this.punchOutTime,
            currentTime: this.currentTime,
            activePanel: this.activePanelId,
            themeId: localStorage.getItem('titanTheme') || 'default',
            currentPluginTrack: this.currentPluginTrack,
            currentPluginTarget: this.currentPluginTarget,
            automationUiState: this.automationUiState,
            selectedTrackId: this.getSelectedTrackId(),
            selectedClipId: this.selectedClipId,
            snapStepSeconds: this.snapStepSeconds,
            busVolumes: TITAN_BUS_OPTIONS.reduce((map, bus) => {
                map[bus.id] = this.engine.getBusVolume(bus.id);
                return map;
            }, {}),
            masterSafetyOn: this.engine.isMasterSafetyLimiterOn(),
            tracks: Array.from(document.querySelectorAll('.track-header')).map((track) => ({
                id: parseInt(track.dataset.track || '0', 10),
                name: track.querySelector('.track-name-input')?.value || '',
                volume: track.querySelector('.track-fader')?.value || '75',
                muted: track.querySelector('.mute')?.classList.contains('active') || false,
                soloed: track.querySelector('.solo')?.classList.contains('active') || false,
                monitored: track.querySelector('.monitor')?.classList.contains('active') || false,
                armed: track.querySelector('.record-arm')?.classList.contains('active') || false,
                color: track.querySelector('.track-color')?.style.getPropertyValue('--track-color') || '',
                outputBusId: this.getTrackOutputBusId(parseInt(track.dataset.track || '0', 10)),
                pan: this.engine.getTrackPan(parseInt(track.dataset.track || '0', 10)),
                sends: {
                    busA: this.engine.getTrackSendLevel(parseInt(track.dataset.track || '0', 10), 'busA'),
                    busB: this.engine.getTrackSendLevel(parseInt(track.dataset.track || '0', 10), 'busB')
                }
            })),
            clips: Array.from(this.audioClips.entries()).map(([id, clip]) => ({
                id,
                name: clip.name,
                duration: clip.duration,
                sourceDuration: this.getClipSourceDuration(clip),
                timelineStart: clip.timelineStart || 0,
                track: clip.track || 1,
                isVocalOnly: !!clip.isVocalOnly,
                muted: !!clip.muted,
                trimStart: this.getClipTrimStart(clip),
                trimEnd: this.getClipTrimEnd(clip),
                fadeInDuration: this.getClipFadeInDuration(clip),
                fadeOutDuration: this.getClipFadeOutDuration(clip)
            })),
            errors: this.errors,
            trackPlugins: Array.from(this.trackPlugins.entries()).map(([trackId, plugins]) => ([
                trackId,
                plugins.map((plugin) => ({
                    ...plugin,
                    params: Array.isArray(plugin.params) ? plugin.params.map((param) => ({ ...param })) : []
                }))
            ])),
            busPlugins: Array.from(this.busPlugins.entries()).map(([busId, plugins]) => ([
                busId,
                plugins.map((plugin) => ({
                    ...plugin,
                    params: Array.isArray(plugin.params) ? plugin.params.map((param) => ({ ...param })) : []
                }))
            ])),
            automation: this.normalizeAutomationData(this.automationData),
            takes: this.comping ? this.comping.serialize() : []
        };
    }

    storeWorkingSessionSnapshot() {
        if (this.restoringWorkingSession) return;
        try {
            const snapshot = this.buildWorkingSessionData();
            this.lastSnapshotTimestamp = snapshot.snapshotTimestamp;
            localStorage.setItem(TITAN_WORKING_SESSION_KEY, JSON.stringify(snapshot));
            this.scheduleSnapshotBroadcast(snapshot);
        } catch (err) {
            console.warn('Failed to store working session snapshot:', err);
        }
    }

    async applyWorkingSessionData(session) {
        this.restoringWorkingSession = true;
        try {
            this.bpm = session.bpm || 120;
            this.timeSignature = session.timeSignature || '4/4';
            this.isLooping = !!session.isLooping;
            this.punchInTime = Number.isFinite(session.punchInTime) ? session.punchInTime : null;
            this.punchOutTime = Number.isFinite(session.punchOutTime) ? session.punchOutTime : null;
            this.currentTime = Number.isFinite(session.currentTime) ? session.currentTime : 0;
            this.currentPluginTrack = session.currentPluginTrack || 1;
            this.currentPluginTarget = session.currentPluginTarget?.type === 'bus'
                ? { type: 'bus', id: session.currentPluginTarget.id }
                : { type: 'track', id: session.currentPluginTarget?.id || this.currentPluginTrack || 1 };
            this.automationUiState = {
                ...this.automationUiState,
                ...(session.automationUiState && typeof session.automationUiState === 'object' ? session.automationUiState : {})
            };
            this.selectedTrackId = session.selectedTrackId || this.currentPluginTrack || 1;
            this.selectedClipId = typeof session.selectedClipId === 'string' ? session.selectedClipId : null;
            this.snapStepSeconds = Number.isFinite(session.snapStepSeconds) ? session.snapStepSeconds : 0;
            this.activePanelId = session.activePanel || 'plugins';
            if (session.busVolumes && typeof session.busVolumes === 'object') {
                TITAN_BUS_OPTIONS.forEach((bus) => {
                    if (Number.isFinite(session.busVolumes[bus.id])) {
                        this.engine.setBusVolume(bus.id, session.busVolumes[bus.id]);
                    }
                });
            }
            if (typeof session.masterSafetyOn === 'boolean') {
                this.engine.setMasterSafetyLimiter(session.masterSafetyOn);
            }
            if (session.themeId) {
                applyTheme(session.themeId);
                const themeSelect = document.getElementById('themeSelect');
                if (themeSelect) themeSelect.value = session.themeId;
            }
            if (session.metadata) {
                this.metadata = session.metadata;
                this.applyMetadataToUI();
            }
            const sessionName = document.querySelector('.session-name');
            if (sessionName) {
                sessionName.value = session.sessionName || this.metadata.title || 'Untitled Session';
            }
            const bpmInput = document.querySelector('.bpm-control input');
            if (bpmInput) bpmInput.value = this.bpm;
            this.applyTimeSignatureToUi(this.timeSignature);
            const clipSnapGrid = /** @type {HTMLSelectElement | null} */ (document.getElementById('clipSnapGrid'));
            if (clipSnapGrid) clipSnapGrid.value = String(this.snapStepSeconds || 0);
            document.getElementById('loop')?.classList.toggle('active', this.isLooping);
            this.updatePunchButtons();

            if (Array.isArray(session.trackPlugins)) {
                this.trackPlugins = new Map(session.trackPlugins.map(([trackId, plugins]) => ([
                    Number(trackId),
                    Array.isArray(plugins) ? plugins.map((plugin) => ({
                        ...plugin,
                        params: Array.isArray(plugin.params) ? plugin.params.map((param) => ({ ...param })) : []
                    })) : []
                ])));
            }
            if (Array.isArray(session.busPlugins)) {
                this.busPlugins = new Map(session.busPlugins.map(([busId, plugins]) => ([
                    String(busId),
                    Array.isArray(plugins) ? plugins.map((plugin) => ({
                        ...plugin,
                        params: Array.isArray(plugin.params) ? plugin.params.map((param) => ({ ...param })) : []
                    })) : []
                ])));
            }
            this.automationData = this.normalizeAutomationData(session.automation || this.automationData);

            const trackStates = Array.isArray(session.tracks) ? session.tracks : [];
            this.syncTrackStructure(trackStates);

            trackStates.forEach((trackState) => {
                const trackId = Number(trackState.id);
                const header = document.querySelector(`.track-header[data-track="${trackId}"]`);
                if (!header) return;
                const nameInput = header.querySelector('.track-name-input');
                if (nameInput) nameInput.value = trackState.name || '';
                const fader = header.querySelector('.track-fader');
                if (fader) {
                    fader.value = trackState.volume || '75';
                    this.updateFader(fader);
                }
                header.querySelector('.mute')?.classList.toggle('active', !!trackState.muted);
                header.querySelector('.solo')?.classList.toggle('active', !!trackState.soloed);
                header.querySelector('.monitor')?.classList.toggle('active', !!trackState.monitored);
                header.querySelector('.record-arm')?.classList.toggle('active', !!trackState.armed);
                if (trackState.color) this.setTrackColor(trackId, trackState.color);
                this.engine.setTrackOutput(trackId, trackState.outputBusId || 'master');
                this.engine.setTrackPan(trackId, Number.isFinite(trackState.pan) ? trackState.pan : 0);
                this.engine.setTrackSendLevel(trackId, 'busA', trackState.sends?.busA || 0);
                this.engine.setTrackSendLevel(trackId, 'busB', trackState.sends?.busB || 0);

                const gainEntry = this.engine.trackGains.get(trackId);
                if (gainEntry) {
                    gainEntry.muted = !!trackState.muted;
                    gainEntry.soloed = !!trackState.soloed;
                    this.engine.setTrackMonitor(trackId, !!trackState.monitored);
                }
            });
            Array.from(this.engine.trackGains.values()).forEach((entry) => this.engine._reapplyGain(entry));

            document.querySelectorAll('.audio-clip').forEach((clip) => clip.remove());
            this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
            this.clipSources.clear();
            this.audioClips.clear();

            const clipStates = Array.isArray(session.clips) ? session.clips : [];
            const clipAssets = await this._batchLoadClipAssets(clipStates.map(c => c.id));
            for (const clipState of clipStates) {
                try {
                    let buffer = null;
                    const asset = clipAssets.get(clipState.id);
                    if (asset?.audioData) {
                        try {
                            buffer = await this.engine.ctx.decodeAudioData(asset.audioData.slice(0));
                        } catch (err) {
                            console.warn(`Failed to decode persisted clip asset for ${clipState.name}:`, err);
                        }
                    }
                    const clip = {
                        ...clipState,
                        track: clipState.track || 1,
                        timelineStart: clipState.timelineStart || 0,
                        isVocalOnly: !!clipState.isVocalOnly,
                        muted: !!clipState.muted,
                        sourceDuration: clipState.sourceDuration || clipState.duration || buffer?.duration || 0,
                        trimStart: Number.isFinite(clipState.trimStart) ? clipState.trimStart : 0,
                        trimEnd: Number.isFinite(clipState.trimEnd) ? clipState.trimEnd : (clipState.sourceDuration || clipState.duration || buffer?.duration || 0),
                        fadeInDuration: Number.isFinite(clipState.fadeInDuration) ? clipState.fadeInDuration : 0,
                        fadeOutDuration: Number.isFinite(clipState.fadeOutDuration) ? clipState.fadeOutDuration : 0,
                        buffer
                    };
                    this.normalizeClipState(clip);
                    this.audioClips.set(clipState.id, clip);
                    this.addClipToTimeline(clipState.id, clip.track);
                } catch (clipErr) {
                    console.warn(`Failed to restore clip "${clipState.name}" (${clipState.id}):`, clipErr);
                }
            }

            const missingAudioCount = clipStates.filter((c) => { const restored = this.audioClips.get(c.id); return restored && !restored.buffer; }).length;
            if (missingAudioCount > 0) {
                this.addConsoleMessage('warning', `${missingAudioCount} restored clip(s) have no audio data saved. This can happen with sessions created before the import fix — re-import those files or delete the empty clips.`);
            }

            this.errors = Array.isArray(session.errors) ? session.errors : [];
            this.renderErrors();
            const errCountEl = document.getElementById('errorCount');
            if (errCountEl) errCountEl.textContent = this.errors.length ? `[${this.errors.length}]` : '';
            this.populateBrowser();
            this.updatePluginTrackSelector();
            Array.from(this.trackPlugins.keys()).forEach((id) => this.rebuildTrackPluginChain(id));
            TITAN_BUS_OPTIONS.filter((bus) => bus.id !== 'master').forEach((bus) => this.rebuildBusPluginChain(bus.id));
            this.renderPluginChain();
            this.applyAutomationStateAtTime(this.currentTime, { syncUi: true });
            this.updateTimeDisplay();
            const playhead = document.getElementById('playhead');
            const rulerHead = document.getElementById('playheadRuler');
            const left = (this.currentTime * 100) + 200;
            if (playhead) playhead.style.left = `${left}px`;
            if (rulerHead) rulerHead.style.left = `${left}px`;
            this.switchTab(this.activePanelId);
            this.selectTrack(this.selectedTrackId, { syncPluginTrack: true, storeSnapshot: false });
            this.selectClip(this.selectedClipId, { storeSnapshot: false, syncTrackFocus: false });
            this._updateTimelineExtent();
            if (this.comping && Array.isArray(session.takes) && session.takes.length) {
                await this.comping.restore(session.takes);
            }
        } finally {
            this.restoringWorkingSession = false;
        }
    }

    async _batchLoadClipAssets(clipIds) {
        const results = new Map();
        if (!clipIds || !clipIds.length) return results;
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(TITAN_AUDIO_DB_NAME, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(TITAN_AUDIO_STORE)) {
                    db.createObjectStore(TITAN_AUDIO_STORE, { keyPath: 'id' });
                }
            };
            request.onerror = () => { console.warn('IndexedDB open failed:', request.error); resolve(results); };
            request.onsuccess = () => {
                const db = request.result;
                try {
                    const tx = db.transaction(TITAN_AUDIO_STORE, 'readonly');
                    const store = tx.objectStore(TITAN_AUDIO_STORE);
                    let pending = clipIds.length;
                    if (pending === 0) { db.close(); resolve(results); return; }
                    for (const id of clipIds) {
                        try {
                            const getRequest = store.get(id);
                            getRequest.onsuccess = () => {
                                if (getRequest.result) results.set(id, getRequest.result);
                                pending--;
                                if (pending <= 0) { db.close(); resolve(results); }
                            };
                            getRequest.onerror = () => {
                                pending--;
                                if (pending <= 0) { db.close(); resolve(results); }
                            };
                        } catch (e) {
                            pending--;
                            if (pending <= 0) { db.close(); resolve(results); }
                        }
                    }
                    tx.onerror = () => { db.close(); resolve(results); };
                } catch (e) {
                    db.close();
                    resolve(results);
                }
            };
        });
    }

    async _withAudioStore(mode, work) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(TITAN_AUDIO_DB_NAME, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(TITAN_AUDIO_STORE)) {
                    db.createObjectStore(TITAN_AUDIO_STORE, { keyPath: 'id' });
                }
            };
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction(TITAN_AUDIO_STORE, mode);
                const store = tx.objectStore(TITAN_AUDIO_STORE);
                let result;
                try {
                    result = work(store, tx);
                } catch (err) {
                    reject(err);
                    return;
                }
                tx.oncomplete = () => {
                    db.close();
                    resolve(result);
                };
                tx.onerror = () => {
                    db.close();
                    reject(tx.error);
                };
            };
        });
    }

    async persistClipAsset(clipId, clip, audioData) {
        if (!audioData) return;
        await this._withAudioStore('readwrite', (store) => {
            store.put({
                id: clipId,
                name: clip.name,
                track: clip.track || 1,
                duration: clip.duration,
                sourceDuration: this.getClipSourceDuration(clip),
                timelineStart: clip.timelineStart || 0,
                isVocalOnly: !!clip.isVocalOnly,
                muted: !!clip.muted,
                trimStart: this.getClipTrimStart(clip),
                trimEnd: this.getClipTrimEnd(clip),
                fadeInDuration: this.getClipFadeInDuration(clip),
                fadeOutDuration: this.getClipFadeOutDuration(clip),
                audioData
            });
        });
    }

    async loadPersistedClipAsset(clipId) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(TITAN_AUDIO_DB_NAME, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(TITAN_AUDIO_STORE)) {
                    db.createObjectStore(TITAN_AUDIO_STORE, { keyPath: 'id' });
                }
            };
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction(TITAN_AUDIO_STORE, 'readonly');
                const store = tx.objectStore(TITAN_AUDIO_STORE);
                const getRequest = store.get(clipId);
                getRequest.onsuccess = () => {
                    db.close();
                    resolve(getRequest.result || null);
                };
                getRequest.onerror = () => {
                    db.close();
                    reject(getRequest.error);
                };
            };
        });
    }

    async deletePersistedClipAsset(clipId) {
        await this._withAudioStore('readwrite', (store) => {
            store.delete(clipId);
        });
    }

    async clearPersistedClipAssets() {
        await this._withAudioStore('readwrite', (store) => {
            store.clear();
        });
    }

    async restoreWorkingSession() {
        const rawSession = localStorage.getItem(TITAN_WORKING_SESSION_KEY);
        if (!rawSession) return;

        let session;
        try {
            session = JSON.parse(rawSession);
        } catch (err) {
            console.warn('Ignoring invalid working session snapshot:', err);
            localStorage.removeItem(TITAN_WORKING_SESSION_KEY);
            return;
        }

        this.lastSnapshotTimestamp = session.snapshotTimestamp || this.lastSnapshotTimestamp;
        await this.applyWorkingSessionData(session);
    }

    /**
     * Dynamically load standalone plugin UI templates and register
     * generic custom elements for each. CSP-compliant: no inline scripts.
     */
    async loadPluginUIs() {
        const uiPlugins = PLUGIN_CATALOG.filter(p => p.ui);
        if (uiPlugins.length === 0) return;

        let container = document.getElementById('pluginUITemplates');
        if (!container) {
            container = document.createElement('div');
            container.id = 'pluginUITemplates';
            container.style.display = 'none';
            document.body.appendChild(container);
        }

        const normalizePluginUiPath = (file) => {
            const normalized = String(file || '').replace(/\\/g, '/').replace(/^\.\//, '');
            return normalized.startsWith('plugins/ui/') ? normalized : `plugins/ui/${normalized.replace(/^ui\//, '')}`;
        };

        const loadHtml = async (file) => {
            const safeFile = normalizePluginUiPath(file);
            if (window.titan?.ui?.loadPluginHtml) {
                const result = await window.titan.ui.loadPluginHtml(safeFile);
                if (result.error) throw new Error(result.error);
                return result.html;
            }
            const response = await fetch(`./${safeFile}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        };

        const makeUIClass = (tag) => class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
                const tpl = document.getElementById(tag);
                if (tpl) this.shadowRoot.appendChild(tpl.content.cloneNode(true));
                this._initControls();
            }

            _emit(control, value) {
                this.dispatchEvent(new CustomEvent('titan-param-change', {
                    bubbles: true,
                    composed: true,
                    detail: { instanceId: this.instanceId, control, value }
                }));
            }

            _initControls() {
                const root = this.shadowRoot;
                if (!root) return;

                // Knobs: drag vertically to change value
                root.querySelectorAll('.titan-knob, .hysteresis-knob').forEach((knob) => {
                    const min = parseFloat(knob.dataset.min || '0');
                    const max = parseFloat(knob.dataset.max || '100');
                    const step = parseFloat(knob.dataset.step || '1');
                    let value = parseFloat(knob.style.getPropertyValue('--value') || knob.dataset.value || '0');
                    let startY = 0;
                    let startValue = value;

                    const update = (val) => {
                        value = Math.max(min, Math.min(max, Math.round(val / step) * step));
                        const pct = ((value - min) / (max - min)) * 100;
                        knob.style.setProperty('--value', String(pct));
                        knob.dataset.value = String(value);
                        if (knob.dataset.param) this._emit(knob.dataset.param, value);
                    };

                    knob.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        startY = e.clientY;
                        startValue = value;
                        const move = (ev) => {
                            const delta = (startY - ev.clientY) * ((max - min) / 200);
                            update(startValue + delta);
                        };
                        const up = () => {
                            document.removeEventListener('mousemove', move);
                            document.removeEventListener('mouseup', up);
                        };
                        document.addEventListener('mousemove', move);
                        document.addEventListener('mouseup', up);
                    });
                    update(value);
                });

                // Toggle switches
                root.querySelectorAll('.toggle-switch').forEach((toggle) => {
                    toggle.addEventListener('click', () => {
                        const active = toggle.classList.toggle('active');
                        const value = active ? 1 : 0;
                        toggle.dataset.value = String(value);
                        if (toggle.dataset.param) this._emit(toggle.dataset.param, value);
                    });
                });

                // Mode / algo button groups
                root.querySelectorAll('.mode-selector, .algo-selector').forEach((group) => {
                    const buttons = group.querySelectorAll('.mode-btn, .algo-btn');
                    buttons.forEach((btn) => {
                        btn.addEventListener('click', () => {
                            buttons.forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            const param = group.dataset.param || btn.dataset.param || 'mode';
                            const value = btn.dataset.mode !== undefined ? parseFloat(btn.dataset.mode) : (btn.dataset.algo !== undefined ? parseFloat(btn.dataset.algo) : 0);
                            this._emit(param, value);
                        });
                    });
                });

                // Step sequencer buttons
                root.querySelectorAll('.step-btn').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        btn.classList.toggle('active');
                        if (btn.dataset.param) {
                            const activeSteps = Array.from(root.querySelectorAll('.step-btn.active')).length;
                            this._emit(btn.dataset.param, activeSteps);
                        }
                    });
                });

                // Faders
                root.querySelectorAll('.fader-track').forEach((track) => {
                    const thumb = track.querySelector('.fader-thumb');
                    const param = track.dataset.param;
                    if (!param) return;
                    let level = parseFloat(thumb?.style.getPropertyValue('--level') || '0.5');

                    const update = (y01) => {
                        level = Math.max(0, Math.min(1, y01));
                        if (thumb) thumb.style.setProperty('--level', String(level));
                        this._emit(param, level * 100);
                    };

                    track.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        const rect = track.getBoundingClientRect();
                        update(1 - (e.clientY - rect.top) / rect.height);
                        const move = (ev) => {
                            update(1 - (ev.clientY - rect.top) / rect.height);
                        };
                        const up = () => {
                            document.removeEventListener('mousemove', move);
                            document.removeEventListener('mouseup', up);
                        };
                        document.addEventListener('mousemove', move);
                        document.addEventListener('mouseup', up);
                    });
                });

                // XY pads
                root.querySelectorAll('.xyz-pad, .xy-pad-container').forEach((pad) => {
                    const puck = pad.querySelector('.xyz-puck') || pad.querySelector('.xy-puck');
                    const paramX = pad.dataset.paramX || pad.dataset.param || 'x';
                    const paramY = pad.dataset.paramY || 'y';
                    const update = (x01, y01) => {
                        const x = Math.max(0, Math.min(1, x01));
                        const y = Math.max(0, Math.min(1, y01));
                        if (puck) {
                            puck.style.left = `${x * 100}%`;
                            puck.style.top = `${(1 - y) * 100}%`;
                        }
                        this._emit(paramX, x * 100);
                        this._emit(paramY, y * 100);
                    };
                    pad.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        const rect = pad.getBoundingClientRect();
                        const move = (ev) => {
                            update((ev.clientX - rect.left) / rect.width, 1 - (ev.clientY - rect.top) / rect.height);
                        };
                        move(e);
                        const up = () => {
                            document.removeEventListener('mousemove', move);
                            document.removeEventListener('mouseup', up);
                        };
                        document.addEventListener('mousemove', move);
                        document.addEventListener('mouseup', up);
                    });
                });

                // A/B slider
                root.querySelectorAll('.ab-slider-container').forEach((slider) => {
                    const thumb = slider.querySelector('.ab-thumb');
                    const param = slider.dataset.param || 'mix';
                    const update = (x01) => {
                        const x = Math.max(0, Math.min(1, x01));
                        if (thumb) thumb.style.left = `${x * 100}%`;
                        this._emit(param, x * 100);
                    };
                    slider.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        const rect = slider.getBoundingClientRect();
                        const move = (ev) => update((ev.clientX - rect.left) / rect.width);
                        move(e);
                        const up = () => {
                            document.removeEventListener('mousemove', move);
                            document.removeEventListener('mouseup', up);
                        };
                        document.addEventListener('mousemove', move);
                        document.addEventListener('mouseup', up);
                    });
                });

                // VoxGenesis-style sliders and generic range inputs
                root.querySelectorAll('.vg-slider input[type="range"], input[type="range"]').forEach((input) => {
                    const slider = input.closest('.vg-slider');
                    if (slider) {
                        const label = slider.querySelector('.vg-value');
                        input.addEventListener('input', () => {
                            if (label) {
                                const suffix = input.id.includes('Buffer') ? 'ms' : '%';
                                label.textContent = input.value + suffix;
                            }
                            if (input.id) this._emit(input.id, parseFloat(input.value));
                        });
                    } else if (input.dataset.param) {
                        input.addEventListener('input', () => this._emit(input.dataset.param, parseFloat(input.value)));
                    }
                });

                // Generic action buttons (VoxGenesis buttons, etc.)
                root.querySelectorAll('.vg-btn').forEach((btn) => {
                    btn.addEventListener('click', () => {
                        if (btn.id) this._emit(btn.id, 1);
                    });
                });
            }
        };

        await Promise.all(uiPlugins.map(async (plugin) => {
            const ui = plugin.ui;
            if (!ui || customElements.get(ui.tag)) return;
            try {
                const html = await loadHtml(ui.file);
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const template = doc.querySelector('template');
                if (!template) {
                    console.warn(`No template found in ${ui.file}`);
                    return;
                }
                template.id = ui.tag;
                container.appendChild(template);
                customElements.define(ui.tag, makeUIClass(ui.tag));
            } catch (err) {
                console.warn(`Error loading plugin UI ${ui.file}:`, err);
            }
        }));
    }

    setupEventListeners() {
        window.addEventListener('titan-param-change', (e) => {
            const detail = (/** @type {CustomEvent} */(e)).detail;
            if (detail && detail.instanceId && detail.control !== undefined) {
                this.updatePluginParam(detail.instanceId, detail.control, detail.value);
            }
        });
        document.getElementById('play')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('stop')?.addEventListener('click', () => this.stop());
        document.getElementById('record')?.addEventListener('click', () => this.record());
        document.getElementById('takesMode')?.addEventListener('click', () => {
            this.takesMode = !this.takesMode;
            if (this.comping) this.comping.setTakesMode(this.takesMode);
            else document.getElementById('takesMode')?.classList.toggle('active', this.takesMode);
        });
        document.getElementById('loop')?.addEventListener('click', () => this.toggleLoop());
        document.getElementById('punchIn')?.addEventListener('click', () => this.togglePunchBoundary('in'));
        document.getElementById('punchOut')?.addEventListener('click', () => this.togglePunchBoundary('out'));
        document.getElementById('rewind')?.addEventListener('click', () => this.rewind());
        document.getElementById('markError')?.addEventListener('click', () => this.markError());
        ['play','stop','record','loop','punchIn','punchOut','rewind','markError'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (!el.getAttribute('data-transport-bound')) {
                el.setAttribute('data-transport-bound', 'true');
                el.addEventListener('click', (e) => {
                    console.log('[transport] click', id);
                }, { capture: true });
            }
        });
        document.getElementById('addTrack')?.addEventListener('click', () => this.addTrack());
        document.getElementById('btnAURA')?.addEventListener('click', () => { this.storeWorkingSessionSnapshot(); window.location.href = 'aura.html'; });
        document.getElementById('btnRDSL')?.addEventListener('click', () => { this.storeWorkingSessionSnapshot(); window.location.href = 'rdsl.html'; });
        document.getElementById('btnTeleprompter')?.addEventListener('click', () => { this.storeWorkingSessionSnapshot(); window.location.href = 'teleprompter.html'; });
        document.getElementById('btnCalibrate')?.addEventListener('click', () => { this.storeWorkingSessionSnapshot(); window.location.href = 'calibration.html'; });
        document.getElementById('addPlugin')?.addEventListener('click', () => this.showPluginCatalog());
        document.getElementById('addPluginEmpty')?.addEventListener('click', () => this.showPluginCatalog());
        document.getElementById('pluginTrackSelect')?.addEventListener('change', (e) => {
            const target = (/** @type {HTMLSelectElement} */(e.target));
            const [targetType, targetId] = String(target.value || 'track:1').split(':');
            if (targetType === 'bus') {
                this.setCurrentPluginTarget('bus', targetId);
                this.refreshMainUi();
                this.storeWorkingSessionSnapshot();
                return;
            }
            this.selectTrack(parseInt(targetId, 10), { syncPluginTrack: true, storeSnapshot: true });
        });
        document.getElementById('bypassAll')?.addEventListener('click', () => this.toggleBypassAll());
        document.getElementById('autoWriteBtn')?.addEventListener('click', () => this.toggleAutomationWrite());
        document.getElementById('clipNudgeLeft')?.addEventListener('click', () => this.nudgeSelectedClip(-0.1));
        document.getElementById('clipNudgeRight')?.addEventListener('click', () => this.nudgeSelectedClip(0.1));
        document.getElementById('clipSetStart')?.addEventListener('click', () => this.trimSelectedClipToPlayhead('start'));
        document.getElementById('clipSetEnd')?.addEventListener('click', () => this.trimSelectedClipToPlayhead('end'));
        document.getElementById('clipSplit')?.addEventListener('click', () => {
            this.splitSelectedClipAtPlayhead().catch((error) => {
                this.addConsoleMessage('error', `Clip split failed: ${error.message}`);
            });
        });
        document.getElementById('clipReset')?.addEventListener('click', () => this.resetSelectedClipEdits());
        document.getElementById('clipMuteToggle')?.addEventListener('click', () => {
            const selectedClip = this.getSelectedClip();
            if (selectedClip) this.toggleClipMute(selectedClip.id);
        });
        document.getElementById('clipDuplicate')?.addEventListener('click', () => {
            this.duplicateSelectedClip().catch((error) => {
                this.addConsoleMessage('error', `Clip duplication failed: ${error.message}`);
            });
        });
        document.getElementById('clipDelete')?.addEventListener('click', () => this.removeSelectedClip());
        document.getElementById('clipFadeIn')?.addEventListener('input', (e) => {
            const target = /** @type {HTMLInputElement} */ (e.target);
            this.setSelectedClipFade('in', parseFloat(target.value));
        });
        document.getElementById('clipFadeOut')?.addEventListener('input', (e) => {
            const target = /** @type {HTMLInputElement} */ (e.target);
            this.setSelectedClipFade('out', parseFloat(target.value));
        });
        document.getElementById('clipSnapGrid')?.addEventListener('change', (e) => {
            const target = /** @type {HTMLSelectElement} */ (e.target);
            this.snapStepSeconds = parseFloat(target.value) || 0;
            this.refreshMainUi();
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('editPlay')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('editStop')?.addEventListener('click', () => this.stop());
        document.getElementById('editRewind')?.addEventListener('click', () => this.rewind());
        document.getElementById('editNavDAW')?.addEventListener('click', () => {
            document.querySelector('.tab-btn[data-panel="plugins"]')?.click();
        });
        document.getElementById('editNavTeleprompter')?.addEventListener('click', () => {
            this.storeWorkingSessionSnapshot();
            window.location.href = 'teleprompter.html';
        });
        document.getElementById('editNavAURA')?.addEventListener('click', () => {
            this.storeWorkingSessionSnapshot();
            window.location.href = 'aura.html';
        });
        document.getElementById('editNavRDSL')?.addEventListener('click', () => {
            this.storeWorkingSessionSnapshot();
            window.location.href = 'rdsl.html';
        });
        document.getElementById('editNavCalibrate')?.addEventListener('click', () => {
            this.storeWorkingSessionSnapshot();
            window.location.href = 'calibration.html';
        });
        document.getElementById('selectedTrackOutputRouteSelect')?.addEventListener('change', (e) => {
            const target = /** @type {HTMLSelectElement} */ (e.target);
            const trackId = this.getSelectedTrackId();
            this.engine.setTrackOutput(trackId, target.value || 'master');
            this.refreshMainUi();
            this.updateDelayCompensation(); // v2.0.3 PDC: bus change alters path latency
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('selectedTrackPan')?.addEventListener('input', (e) => {
            const target = /** @type {HTMLInputElement} */ (e.target);
            const trackId = this.getSelectedTrackId();
            this.engine.setTrackPan(trackId, parseFloat(target.value));
            this.updateSelectedTrackInspector();
            this.storeWorkingSessionSnapshot();
        });
        ['busA', 'busB'].forEach((busId) => {
            document.getElementById(`selectedTrackSend-${busId}`)?.addEventListener('input', (e) => {
                const target = /** @type {HTMLInputElement} */ (e.target);
                const trackId = this.getSelectedTrackId();
                this.engine.setTrackSendLevel(trackId, busId, parseFloat(target.value));
                this.refreshMainUi();
                this.storeWorkingSessionSnapshot();
            });
        });
        TITAN_BUS_OPTIONS.forEach((bus) => {
            document.getElementById(`busVolume-${bus.id}`)?.addEventListener('input', (e) => {
                const target = /** @type {HTMLInputElement} */ (e.target);
                this.engine.setBusVolume(bus.id, parseFloat(target.value));
                this.updateBusTelemetryUi();
                this.storeWorkingSessionSnapshot();
            });
            document.getElementById(`busReturnEdit-${bus.id}`)?.addEventListener('click', () => {
                this.setCurrentPluginTarget('bus', bus.id);
                this.updatePluginTrackSelector();
                this.switchTab('plugins');
                this.refreshMainUi();
                this.storeWorkingSessionSnapshot();
            });
        });
        // v2.0.3 master safety limiter toggle (defeatable)
        document.getElementById('masterSafetyToggle')?.addEventListener('click', () => {
            const on = this.engine.setMasterSafetyLimiter(!this.engine.isMasterSafetyLimiterOn());
            this.updateMasterSafetyToggleUi();
            this.addConsoleMessage('info', `Master safety limiter ${on ? 'engaged' : 'bypassed'}.`);
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('automationScopeSelect')?.addEventListener('change', (e) => {
            const target = /** @type {HTMLSelectElement} */ (e.target);
            this.automationUiState.scope = target.value || 'track';
            this.updateAutomationEditorUi();
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('automationTrackLaneSelect')?.addEventListener('change', (e) => {
            const target = /** @type {HTMLSelectElement} */ (e.target);
            this.automationUiState.trackLane = target.value || 'volume';
            this.updateAutomationEditorUi();
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('automationBusTargetSelect')?.addEventListener('change', (e) => {
            const target = /** @type {HTMLSelectElement} */ (e.target);
            this.automationUiState.busId = target.value || 'master';
            this.updateAutomationEditorUi();
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('automationPluginSelect')?.addEventListener('change', (e) => {
            const target = /** @type {HTMLSelectElement} */ (e.target);
            this.automationUiState.pluginInstanceId = target.value || '';
            this.updateAutomationEditorUi();
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('automationPluginParamSelect')?.addEventListener('change', (e) => {
            const target = /** @type {HTMLSelectElement} */ (e.target);
            this.automationUiState.pluginParamId = target.value || '';
            this.updateAutomationEditorUi();
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('automationValueSlider')?.addEventListener('input', (e) => {
            const target = /** @type {HTMLInputElement} */ (e.target);
            const descriptor = this.getCurrentAutomationDescriptor();
            if (!descriptor) return;
            descriptor.applyValue(parseFloat(target.value));
            this.syncAutomationDrivenUi();
            this.updateSelectedTrackInspector();
            this.updateBusTelemetryUi();
            this.updateAutomationEditorUi();
        });
        document.getElementById('automationUseCurrent')?.addEventListener('click', () => {
            const descriptor = this.getCurrentAutomationDescriptor();
            const valueSlider = /** @type {HTMLInputElement | null} */ (document.getElementById('automationValueSlider'));
            if (!descriptor || !valueSlider) return;
            valueSlider.value = String(descriptor.value);
            this.updateAutomationEditorUi();
        });
        document.getElementById('automationWritePoint')?.addEventListener('click', () => this.writeAutomationPointAtPlayhead());
        document.getElementById('automationClearLane')?.addEventListener('click', () => this.clearCurrentAutomationLane());
        document.getElementById('automationPointList')?.addEventListener('click', (e) => {
            const actionButton = (/** @type {HTMLElement} */(e.target)).closest('button[data-automation-action]');
            if (!actionButton) return;
            const entry = actionButton.closest('.automation-point-entry');
            if (!entry) return;
            const laneKey = entry.getAttribute('data-lane-key') || '';
            const pointIndex = parseInt(entry.getAttribute('data-point-index') || '-1', 10);
            const descriptor = this.getCurrentAutomationDescriptor();
            if (!descriptor || descriptor.laneKey !== laneKey || pointIndex < 0) return;
            const point = descriptor.points[pointIndex];
            if (!point) return;
            if (actionButton.getAttribute('data-automation-action') === 'jump') {
                this.jumpToAutomationPoint(point.time);
            } else {
                this.deleteAutomationPoint(laneKey, pointIndex);
            }
        });
        document.getElementById('toggleInspector')?.addEventListener('click', () => this.toggleInspectorPanel());
        document.getElementById('inspectorToggleMute')?.addEventListener('click', () => this.toggleSelectedTrackControl('mute'));
        document.getElementById('inspectorToggleSolo')?.addEventListener('click', () => this.toggleSelectedTrackControl('solo'));
        document.getElementById('inspectorToggleArm')?.addEventListener('click', () => this.toggleSelectedTrackControl('record-arm'));
        document.getElementById('inspectorToggleMonitor')?.addEventListener('click', () => this.toggleSelectedTrackControl('monitor'));
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = (/** @type {HTMLElement} */(e.currentTarget));
                this.switchTab(target.dataset.panel || '', e);
            });
        });
        document.querySelectorAll('.track-fader').forEach(fader => {
            fader.addEventListener('input', (e) => {
                const target = (/** @type {HTMLInputElement} */(e.target));
                this.updateFader(target);
            });
        });
        document.querySelectorAll('.track-name-input').forEach(input => {
            input.addEventListener('input', () => {
                this.updatePluginTrackSelector();
                this.refreshMainUi();
                this.storeWorkingSessionSnapshot();
            });
        });
        document.querySelectorAll('.track-header .mute').forEach(btn => {
            const trackHeader = (/** @type {HTMLElement} */(btn.closest('.track-header')));
            if (trackHeader) {
                const num = parseInt(trackHeader.dataset.track || '0');
                btn.addEventListener('click', () => {
                    btn.classList.toggle('active');
                    this.engine.toggleMute(num);
                    this.refreshMainUi();
                    this.storeWorkingSessionSnapshot();
                });
            }
        });
        document.querySelectorAll('.track-header .solo').forEach(btn => {
            const trackHeader = (/** @type {HTMLElement} */(btn.closest('.track-header')));
            if (trackHeader) {
                const num = parseInt(trackHeader.dataset.track || '0');
                btn.addEventListener('click', () => {
                    btn.classList.toggle('active');
                    this.engine.toggleSolo(num);
                    this.refreshMainUi();
                    this.storeWorkingSessionSnapshot();
                });
            }
        });
        document.querySelectorAll('.track-header .monitor').forEach(btn => {
            const trackHeader = (/** @type {HTMLElement} */(btn.closest('.track-header')));
            if (trackHeader) {
                const num = parseInt(trackHeader.dataset.track || '0');
                btn.addEventListener('click', () => {
                    btn.classList.toggle('active');
                    this.engine.setTrackMonitor(num, btn.classList.contains('active'));
                    this.refreshMainUi();
                    this.storeWorkingSessionSnapshot();
                });
            }
        });
        document.querySelectorAll('.track-header .record-arm').forEach(btn => {
            const trackHeader = (/** @type {HTMLElement} */(btn.closest('.track-header')));
            if (trackHeader) {
                btn.addEventListener('click', () => {
                    if (this.recordSession) return;
                    btn.classList.toggle('active');
                    this.refreshMainUi();
                    this.storeWorkingSessionSnapshot();
                });
            }
        });
        document.querySelectorAll('.track-header .delete-track').forEach(btn => {
            const trackHeader = (/** @type {HTMLElement} */(btn.closest('.track-header')));
            if (trackHeader) {
                const num = parseInt(trackHeader.dataset.track || '0');
                btn.addEventListener('click', () => this.removeTrack(num));
            }
        });
        const bpmInput = (/** @type {HTMLInputElement} */(document.querySelector('.bpm-control input')));
        if (bpmInput) {
            bpmInput.addEventListener('change', (e) => {
                const target = (/** @type {HTMLInputElement} */(e.target));
                this.bpm = parseFloat(target.value) || 120;
                this.storeWorkingSessionSnapshot();
            });
        }
        document.getElementById('timeSignatureSelect')?.addEventListener('change', (e) => {
            const target = (/** @type {HTMLSelectElement} */(e.target));
            this.timeSignature = target.value || '4/4';
            this.storeWorkingSessionSnapshot();
        });
        // Waveform diagnostics toolbar (global Diagnose toggle + legend)
        if (typeof WaveDiag !== 'undefined') {
            try { WaveDiag.init(this); } catch (diagInitErr) {}
        }
        document.querySelector('.session-name')?.addEventListener('input', () => {
            this.storeWorkingSessionSnapshot();
        });
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'audio/*';
        this.fileInput.multiple = true;
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);
        this.fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        const arrView = document.getElementById('arrangementView');
        if (arrView) {
            arrView.addEventListener('dragover', (e) => e.preventDefault());
            arrView.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.dataTransfer && e.dataTransfer.files.length) this.loadAudioFiles(e.dataTransfer.files);
            });
        }
        this.loadSessionInput = document.createElement('input');
        this.loadSessionInput.type = 'file';
        this.loadSessionInput.accept = '.titan';
        this.loadSessionInput.style.display = 'none';
        document.body.appendChild(this.loadSessionInput);
        this.loadSessionInput.addEventListener('change', (e) => this.loadSession(e));
        document.getElementById('btnImportAudio').addEventListener('click', () => this.openAudioImporter());
        document.getElementById('btnExportMixdown').addEventListener('click', () => this.exportMixdown());
        document.getElementById('importAudio')?.addEventListener('click', () => this.openAudioImporter());
        document.getElementById('browseFolder')?.addEventListener('click', () => this.browseAudioFolder());
        document.getElementById('importSession')?.addEventListener('click', () => this.openSessionPicker());
        document.getElementById('exportMixdown')?.addEventListener('click', () => this.exportMixdown());
        document.getElementById('applyMetadata')?.addEventListener('click', () => {
            this.loadMetadataFromUI();
            const sessName = document.querySelector('.session-name');
            if (sessName && this.metadata.title) sessName.value = this.metadata.title;
            this.storeWorkingSessionSnapshot();
        });
        document.getElementById('browserAudioList')?.addEventListener('dblclick', (e) => {
            const target = (/** @type {HTMLElement} */(e.target)).closest('.browser-file');
            if (!target) return;
            const targetEl = /** @type {HTMLElement} */(target);
            if (targetEl.dataset.id) {
                this.addClipToTimeline(targetEl.dataset.id);
            } else if (targetEl.dataset.path) {
                this.importAudioFilePath(targetEl.dataset.path);
            }
        });
        document.getElementById('browserAudioList')?.addEventListener('click', (e) => {
            const target = (/** @type {HTMLElement} */(e.target)).closest('.browser-file');
            if (target) {
                document.querySelectorAll('.browser-file').forEach(f => f.classList.remove('selected'));
                target.classList.add('selected');
            }
        });
        document.getElementById('fpScanAll')?.addEventListener('click', () => this.fingerprintAllClips());
        document.getElementById('fpFindMatches')?.addEventListener('click', () => this.findDuplicateClips());
        document.getElementById('clearErrors')?.addEventListener('click', () => {
            this.errors = [];
            this.renderErrors();
            const errCountEl = document.getElementById('errorCount');
            if (errCountEl) errCountEl.textContent = '';
            this.storeWorkingSessionSnapshot();
        });
        window.addEventListener('error-label-change', (e) => {
            const detail = (/** @type {any} */(e)).detail;
            if (!detail) return;
            const { index, value } = detail;
            if (this.errors[index]) this.errors[index].label = value;
            this.storeWorkingSessionSnapshot();
        });
        window.addEventListener('error-toggle-fix', (e) => {
            const detail = (/** @type {any} */(e)).detail;
            if (!detail) return;
            const { index } = detail;
            if (this.errors[index]) {
                this.errors[index].fixed = !this.errors[index].fixed;
                this.renderErrors();
                this.storeWorkingSessionSnapshot();
            }
        });
        this.applyMetadataToUI();
        this.setupThemeSelector();
        document.addEventListener('keydown', (e) => {
            const target = /** @type {HTMLElement | null} */ (e.target instanceof HTMLElement ? e.target : null);
            const isEditableTarget = !!target && (target.matches('input, textarea, select') || target.isContentEditable);
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl && e.key === 'i' && this.fileInput) { e.preventDefault(); this.openAudioImporter(); }
            if (ctrl && e.key === 's') { e.preventDefault(); this.saveSession(); }
            if (ctrl && e.key === 'o' && this.loadSessionInput) { e.preventDefault(); this.openSessionPicker(); }
            if (ctrl && e.shiftKey && e.key === 'E') { e.preventDefault(); this.exportMixdown(); }
            if (ctrl && !isEditableTarget && e.key.toLowerCase() === 'd' && this.getSelectedClip()) {
                e.preventDefault();
                this.duplicateSelectedClip().catch((error) => {
                    this.addConsoleMessage('error', `Clip duplication failed: ${error.message}`);
                });
            }
            if (!isEditableTarget && (e.key === 'Delete' || e.key === 'Backspace') && this.getSelectedClip()) {
                e.preventDefault();
                this.removeSelectedClip();
            }
            if (!isEditableTarget && e.key === 'ArrowLeft' && this.getSelectedClip()) {
                e.preventDefault();
                this.nudgeSelectedClip(e.shiftKey ? -1 : -0.1);
            }
            if (!isEditableTarget && e.key === 'ArrowRight' && this.getSelectedClip()) {
                e.preventDefault();
                this.nudgeSelectedClip(e.shiftKey ? 1 : 0.1);
            }
            if (!isEditableTarget && (e.key === ' ' || e.code === 'Space')) { e.preventDefault(); this.togglePlay(); }
            if (!isEditableTarget && e.key === 'r' && !ctrl) { this.record(); }
            if (!isEditableTarget && e.key === 'e' && !ctrl) { this.markError(); }
        });
        document.getElementById('pluginCatalog')?.addEventListener('click', (e) => {
            if ((/** @type {HTMLElement} */(e.target)).id === 'pluginCatalog') this.closePluginCatalog();
        });
        document.getElementById('pluginEditor')?.addEventListener('click', (e) => {
            if ((/** @type {HTMLElement} */(e.target)).id === 'pluginEditor') this.closePluginEditor();
        });
    }

    setupThemeSelector() {
        const select = (/** @type {HTMLSelectElement} */(document.getElementById('themeSelect')));
        if (!select) return;
        select.addEventListener('change', (e) => {
            const target = (/** @type {HTMLSelectElement} */(e.target));
            applyTheme(target.value);
            this.storeWorkingSessionSnapshot();
        });
    }

    setupWaveforms() {
        const canvases = document.querySelectorAll('.waveform');
        canvases.forEach((canvas, index) => {
            this.drawWaveform((/** @type {HTMLCanvasElement} */(canvas)), index);
        });
    }

    drawWaveform(canvas, seed = 0) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const width = canvas.width, height = canvas.height, barWidth = 3, gap = 2;
        const bars = Math.floor(width / (barWidth + gap));
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '#7c5cff';
        const rng = (/** @type {number} */n) => { const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453; return x - Math.floor(x); };
        for (let i = 0; i < bars; i++) {
            const t = i / bars;
            const envelope = Math.sin(t * Math.PI) * 0.6 + 0.4;
            let barHeight;
            if (this.engine && this.engine.meters) {
                const level = (this.engine.meters.left + this.engine.meters.right) / 2;
                barHeight = (rng(i) * 0.5 + 0.5 * level) * height * 0.8;
            } else { barHeight = rng(i) * envelope * height * 0.8; }
            const x = i * (barWidth + gap), y = (height - barHeight) / 2;
            ctx.fillRect(x, y, barWidth, barHeight);
        }
    }

    async togglePlay(options = {}) {
        try {
            if (!this.engine.ctx) {
                this.addConsoleMessage('error', 'Audio engine not initialized. Please reload the page.');
                return;
            }
            this.isPlaying = !this.isPlaying;
            const playBtn = document.getElementById('play'), icon = playBtn?.querySelector('i');
            if (this.isPlaying) {
                await this.engine.ensureResumed();
                if (icon) { icon.classList.remove('fa-play'); icon.classList.add('fa-pause'); }
                playBtn?.classList.add('playing'); this.startPlayback();
                if (!options.remote) this.broadcastTransportState('play');
            } else {
                if (icon) { icon.classList.remove('fa-pause'); icon.classList.add('fa-play'); }
                playBtn?.classList.remove('playing'); await this.pausePlayback();
                if (!options.remote) this.broadcastTransportState('pause');
            }
            this.updateEditTabUi();
        } catch (err) {
            console.error('[transport] togglePlay failed:', err);
            this.addConsoleMessage('error', `Playback failed: ${err.message}`);
            this.isPlaying = false;
        }
    }

    /**
     * v2.0.3: re-anchor the audio-clock transport mapping after currentTime
     * is set directly (seek/jump/resume). Without this the tick would snap
     * currentTime back to the old anchor on the next frame.
     */
    _reanchorTransport() {
        if (this.engine && this.engine.ctx) {
            this._transportAnchorCtxTime = this.engine.ctx.currentTime;
            this._transportAnchorTime = this.currentTime;
        } else {
            this._transportAnchorCtxTime = -1;
        }
        // v2.0.3: timeline shifted discontinuously — re-derive loop schedule.
        this._loopNextCtxTime = NaN;
    }

    /**
     * v2.0.3: transport time derived from the audio clock (sample-accurate).
     * Returns -1 when no anchor exists (engine not running), in which case
     * callers fall back to wall-clock accumulation.
     */
    getAudioClockTransportTime() {
        if (!this.engine || !this.engine.ctx) return -1;
        if (!Number.isFinite(this._transportAnchorCtxTime) || this._transportAnchorCtxTime < 0) return -1;
        if (!Number.isFinite(this._transportAnchorTime)) return -1;
        return this._transportAnchorTime + (this.engine.ctx.currentTime - this._transportAnchorCtxTime);
    }

    startPlayback(options = {}) {
        this._playbackTickTime = performance.now();
        // v2.0.3: anchor transport time to the audio clock for sample-accurate
        // punch decisions and trimming (replaces 16ms-timer-derived timing).
        if (this.engine && this.engine.ctx) {
            this._transportAnchorCtxTime = this.engine.ctx.currentTime;
            this._transportAnchorTime = this.currentTime;
        } else {
            this._transportAnchorCtxTime = -1;
        }
        this.lastAutomationUiSyncTime = 0;
        this.playbackTrackFilter = typeof options.trackFilter === 'function' ? options.trackFilter : null;
        this.playbackTickHook = typeof options.onTick === 'function' ? options.onTick : null;
        const playheadPixelsPerSec = 100;
        const playhead = document.getElementById('playhead');
        this.applyAutomationStateAtTime(this.currentTime, { syncUi: true });

        if (this.audioClips.size > 0) {
            this.audioClips.forEach((clip, clipId) => {
                if (this.shouldPlayClipOnTransport(clip)) {
                    this.playAudioClip(clipId, this.currentTime);
                }
            });
        }

        const rulerHead = (/** @type {HTMLElement} */(document.getElementById('playheadRuler')));
        if (playhead) playhead.classList.add('moving');
        if (rulerHead) rulerHead.classList.add('moving');
        
        this.playheadInterval = (setInterval(() => {
            const now = performance.now(), elapsed = (now - (this._playbackTickTime || now)) / 1000;
            this._playbackTickTime = now;
            // v2.0.3: drive transport time from the audio clock when available
            // (sample-accurate punch); fall back to wall-clock accumulation.
            const audioT = this.getAudioClockTransportTime();
            this.currentTime = audioT >= 0 ? audioT : this.currentTime + elapsed;

            let currentLeft = (this.currentTime * playheadPixelsPerSec) + 200;

            // v2.0.3 seamless loop: iterations are scheduled ahead on the
            // audio clock (_scheduleLoopAhead); here we only wrap the
            // displayed transport time by shifting the anchor. No sources
            // are stopped/restarted, so there is no wrap hiccup.
            if (this.isLooping) {
                this._scheduleLoopAhead();
                const loopEndSec = (this.loopEnd - 200) / playheadPixelsPerSec;
                const loopStartSec = (this.loopStart - 200) / playheadPixelsPerSec;
                if (this.currentTime >= loopEndSec && loopEndSec > loopStartSec) {
                    const loopDur = loopEndSec - loopStartSec;
                    this._transportAnchorTime -= loopDur;
                    this.currentTime -= loopDur;
                    currentLeft = (this.currentTime * playheadPixelsPerSec) + 200;
                }
            }
            
            if (playhead) playhead.style.left = currentLeft + 'px';
            if (rulerHead) rulerHead.style.left = currentLeft + 'px';
            this.scrollToPlayhead(); this.updateTimeDisplay();
            if (!this.suppressCollaborationBroadcast && this.currentTime - this.lastTransportSyncTime >= 1) {
                this.lastTransportSyncTime = this.currentTime;
                this.broadcastTransportState('sync', { currentTime: this.currentTime });
            }
            const syncUi = !this.lastAutomationUiSyncTime || (now - this.lastAutomationUiSyncTime) >= 120;
            this.applyAutomationStateAtTime(this.currentTime, { syncUi });
            if (syncUi) this.lastAutomationUiSyncTime = now;
            if (this.playbackTickHook) this.playbackTickHook(this.currentTime);
        }, 16));
    }

    _clipPixelX(seconds) {
        return Math.max(0, seconds * 100) + this.TIMELINE_GUTTER_PX;
    }

    _updateTimelineExtent() {
        const arrView = document.getElementById('arrangementView');
        if (!arrView) return;
        let maxEndSeconds = 0;
        this.audioClips.forEach((clip) => {
            maxEndSeconds = Math.max(maxEndSeconds, (clip.timelineStart || 0) + this.getClipPlayDuration(clip));
        });
        const container = arrView.closest('.timeline-container');
        const viewportPx = Math.max(container ? container.clientWidth : 0, window.innerWidth - 360);
        const neededPx = Math.ceil(this._clipPixelX(maxEndSeconds)) + 800;
        const widthPx = `${Math.ceil(Math.max(viewportPx, neededPx))}px`;
        arrView.style.minWidth = widthPx;
        const ruler = container ? container.querySelector('.timeline-ruler') : null;
        if (ruler) ruler.style.minWidth = widthPx;
        return widthPx;
    }

    scrollToPlayhead() {
        const playhead = document.getElementById('playhead'), arrView = document.getElementById('arrangementView');
        if (!playhead || !arrView) return;
        const scroller = arrView.closest('.timeline-container') || arrView;
        const playheadLeft = parseFloat(playhead.style.left) || this.TIMELINE_GUTTER_PX,
            viewLeft = scroller.scrollLeft, viewWidth = scroller.clientWidth, margin = 100;
        if (playheadLeft > viewLeft + viewWidth - margin) { scroller.scrollLeft = playheadLeft - viewWidth + margin; }
        if (playheadLeft < viewLeft + margin) { scroller.scrollLeft = Math.max(0, playheadLeft - margin); }
    }

    async pausePlayback() {
        if (this.recordSession) {
            await this.finishRecordingPass({ continuePlayback: false });
        }
        const playhead = document.getElementById('playhead');
        if (playhead) playhead.classList.remove('moving');
        const rulerHead = document.getElementById('playheadRuler');
        if (rulerHead) rulerHead.classList.remove('moving');
        clearInterval(this.playheadInterval);
        this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
        this.clipSources.clear();
        this._stopLoopScheduledSources(); // v2.0.3 seamless loop
        this.playbackTrackFilter = null;
        this.playbackTickHook = null;
        this.applyAutomationStateAtTime(this.currentTime, { syncUi: true });
    }

    startTestTone() {
        if (!this.engine.ctx) return;
        this.testOsc = this.engine.ctx.createOscillator();
        const gain = this.engine.ctx.createGain(); gain.gain.value = 0.03;
        this.testOsc.type = 'sine'; this.testOsc.frequency.value = 440;
        this.testOsc.connect(gain); gain.connect(this.engine.masterGain); this.testOsc.start();
    }

    stopTestTone() {
        if (this.testOsc) { try { this.testOsc.stop(); } catch (_e) {} this.testOsc.disconnect(); this.testOsc = null; }
    }

    handleFileImport(e) { if (e.target.files.length) { this.loadAudioFiles(e.target.files); e.target.value = ''; } }

    openAudioImporter() {
        this.fileInput?.click();
    }

    openSessionPicker() {
        this.loadSessionInput?.click();
    }

    async newSession() {
        localStorage.removeItem(TITAN_WORKING_SESSION_KEY);
        try {
            await this.clearPersistedClipAssets();
        } catch (err) {
            console.warn('Failed to clear persisted clip assets:', err);
        }
        window.location.reload();
    }

    async loadAudioFiles(files) {
        const fileArray = Array.from(files);
        console.log(`Importing ${fileArray.length} file(s)...`);
        this.addConsoleMessage('info', `Importing ${fileArray.length} file(s)...`);

        if (!this.engine || !this.engine.ctx) {
            console.error('Audio engine not initialized');
            this.addConsoleMessage('error', 'Audio engine is not ready. Please wait a moment and try again.');
            return;
        }

        await this.engine.ensureResumed();

        let importedCount = 0;
        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            const fileName = file.name || 'unnamed';
            const fileType = file.type || '';

            const isAudio = fileType.startsWith('audio/') ||
                          /\.(wav|mp3|ogg|flac|aiff|m4a|aac|webm|weba)$/i.test(fileName);

            if (!isAudio) {
                console.warn('Skipping non-audio file:', fileName);
                this.addConsoleMessage('warning', `Skipping non-audio file: ${fileName}`);
                continue;
            }

            try {
                console.log(`Decoding [${i + 1}/${fileArray.length}]:`, fileName);
                this.addConsoleMessage('info', `Importing [${i + 1}/${fileArray.length}]: ${fileName}...`);

                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await this.engine.ctx.decodeAudioData(arrayBuffer);
                const clipId = 'clip-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);

                let isVocalOnly = false;
                try {
                    isVocalOnly = await this.analyzeVocalContent(audioBuffer);
                } catch (vocalErr) {
                    console.warn('Vocal analysis failed for', fileName, vocalErr);
                }

                const targetTrackId = this._nextAvailableTrack();
                if (!targetTrackId) {
                    this.addConsoleMessage('error', 'No available tracks. Clear a track before importing.');
                    continue;
                }

                this.audioClips.set(clipId, {
                    buffer: audioBuffer,
                    name: fileName,
                    duration: audioBuffer.duration,
                    sourceDuration: audioBuffer.duration,
                    timelineStart: 0,
                    track: targetTrackId,
                    isVocalOnly,
                    muted: false,
                    trimStart: 0,
                    trimEnd: audioBuffer.duration,
                    fadeInDuration: 0,
                    fadeOutDuration: 0
                });
                this.normalizeClipState(this.audioClips.get(clipId));

                const baseName = fileName.replace(/\.[^.]+$/, '');
                this.setTrackName(targetTrackId, baseName);
                this.setTrackColor(targetTrackId, this._colorForFile(fileName));
                try {
                    await this.persistClipAsset(clipId, this.audioClips.get(clipId), this._audioBufferToWav(audioBuffer));
                } catch (persistErr) {
                    console.warn('Failed to persist clip asset for', fileName, persistErr);
                }

                console.log(`Assigned ${fileName} -> Track ${targetTrackId}`);
                this.addClipToTimeline(clipId, targetTrackId);
                if (typeof WaveDiag !== 'undefined') WaveDiag.analyzeClip(this, clipId);
                importedCount++;
            } catch (err) {
                console.error('Failed to import', fileName, err);
                this.addConsoleMessage('error', `Failed to import ${fileName}: ${err.message || err}`);
            }
        }

        if (importedCount > 0) {
            this.addConsoleMessage('success', `Successfully imported ${importedCount} file(s).`);
        } else if (fileArray.length > 0) {
            this.addConsoleMessage('warning', 'No audio files were imported.');
        }
        console.log(`Import complete: ${importedCount}/${fileArray.length} files imported.`);
    }

    async importAudioFilePath(filePath) {
        if (!window.titan?.audio?.readFile) {
            this.addConsoleMessage('error', 'Direct file import is only available in the desktop app.');
            return;
        }
        const result = await window.titan.audio.readFile(filePath);
        if (result?.error) {
            this.addConsoleMessage('error', `Failed to import ${filePath}: ${result.error}`);
            return;
        }
        const buffer = result?.buffer;
        if (!buffer) {
            this.addConsoleMessage('error', `No audio data returned for ${filePath}`);
            return;
        }

        const file = new File([buffer], result.name || filePath.split(/[\\/]/).pop() || 'imported-audio', {
            type: 'audio/wav'
        });
        await this.loadAudioFiles([file]);
    }

    addClipToTimeline(clipId, trackNumber = 1) {
        const clip = this.audioClips.get(clipId);
        if (!clip) {
            console.error(`Clip ${clipId} not found in project context.`);
            return;
        }
        document.querySelector(`.audio-clip[data-clip-id="${clipId}"]`)?.remove();
        
        // If trackNumber is not explicitly provided, try to find an armed track
        if (arguments.length < 2 || trackNumber === null || trackNumber === undefined) {
            const armed = document.querySelector('.track-header .record-arm.active');
            if (armed) { 
                const trackHeader = (/** @type {HTMLElement} */(armed.closest('.track-header')));
                trackNumber = parseInt(trackHeader.dataset.track || '1'); 
            } else {
                trackNumber = 1; // Default to track 1
            }
        }

        let lane = document.querySelector(`.track-lane[data-track="${trackNumber}"]`);
        
        // Fallback: If lane not found, try to find track 1 or the first available lane
        if (!lane) {
            console.warn(`Could not find lane for track ${trackNumber}, falling back to Track 1`);
            trackNumber = 1;
            lane = document.querySelector(`.track-lane[data-track="1"]`);
        }
        
        if (!lane) {
            console.error(`Fatal: Could not find any track lanes in the arrangement view.`);
            this.addConsoleMessage('error', 'Critical UI Error: Could not find track lanes. Please add a track and try again.');
            return;
        }

        const div = document.createElement('div');
        div.className = 'audio-clip';
        div.dataset.clipId = clipId;
        div.draggable = true;
        const pixelsPerSecond = 100;
        this.normalizeClipState(clip);
        const clipDuration = this.getClipPlayDuration(clip);
        const durationPx = Math.max(60, clipDuration * pixelsPerSecond);
        const startPx = this._clipPixelX(clip.timelineStart || 0);
        
        div.style.cssText = `left: ${startPx}px; width: ${durationPx}px;`;
        div.innerHTML = `
            <div class="clip-header">
                <span>${clip.name}</span>
                <div class="clip-controls">
                    <button class="mute-clip" title="Mute Clip"><i class="fas fa-volume-mute"></i></button>
                    <button class="delete-clip" title="Delete Clip"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <canvas class="waveform"></canvas>`;
        
        // Drag events
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer?.setData('text/plain', clipId);
            const rect = (/** @type {HTMLElement} */(e.target)).getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            e.dataTransfer?.setData('offsetX', offsetX.toString());
            (/** @type {HTMLElement} */(e.target)).classList.add('dragging');
        });

        div.addEventListener('dragend', (e) => {
            (/** @type {HTMLElement} */(e.target)).classList.remove('dragging');
        });
        div.addEventListener('click', (e) => {
            if (!(/** @type {HTMLElement} */(e.target)).closest('.clip-controls')) {
                this.selectClip(clipId, { storeSnapshot: false, syncTrackFocus: true });
            }
        });

        // Lane drop target
        if (!lane.dataset.dropInit) {
            lane.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            });
            lane.addEventListener('drop', (e) => {
                e.preventDefault();
                const id = e.dataTransfer?.getData('text/plain');
                const offsetX = parseFloat(e.dataTransfer?.getData('offsetX') || '0');
                if (!id) return;

                const clipEl = document.querySelector(`.audio-clip[data-clip-id="${id}"]`);
                if (!clipEl) return;

                const laneRect = (/** @type {HTMLElement} */(e.currentTarget)).getBoundingClientRect();
                let newLeft = e.clientX - laneRect.left - offsetX;
                newLeft = Math.max(0, newLeft);

                const snappedSeconds = Math.max(0, this.snapTimelineSeconds((newLeft - this.TIMELINE_GUTTER_PX) / pixelsPerSecond));

                (/** @type {HTMLElement} */(clipEl)).style.left = this._clipPixelX(snappedSeconds) + 'px';

                const clipObj = this.audioClips.get(id);
                if (clipObj) {
                    clipObj.timelineStart = snappedSeconds;
                    const targetLane = (/** @type {HTMLElement} */(e.currentTarget));
                    const newTrackId = parseInt(targetLane.dataset.track || '1');
                    if (clipObj.track !== newTrackId) {
                        clipObj.track = newTrackId;
                        if (clipEl.parentElement !== targetLane) {
                            targetLane.appendChild(clipEl);
                        }
                    }
                    this.selectTrack(newTrackId, { syncPluginTrack: false, storeSnapshot: false });
                    this.refreshMainUi();
                    this.storeWorkingSessionSnapshot();
                }
            });
            lane.dataset.dropInit = 'true';
        }

        lane.appendChild(div);

        // Draw the waveform immediately so it renders regardless of any later UI work
        const canvas = div.querySelector('canvas');
        if (canvas) {
            canvas.width = durationPx - 16; canvas.height = 60;
            this.drawAudioWaveform(canvas, clip.buffer, clip);
            requestAnimationFrame(() => {
                if (this.audioClips.get(clipId)?.buffer && canvas.isConnected) this.drawAudioWaveform(canvas, clip.buffer, clip);
            });
        }

        const uiSteps = [
            ['Track selection', () => this.selectTrack(trackNumber, { syncPluginTrack: false, storeSnapshot: false })],
            ['Clip state update', () => this.updateClipElementState(clipId)],
            ['Browser list refresh', () => this.populateBrowser()],
            ['Timeline extent update', () => this._updateTimelineExtent()]
        ];
        uiSteps.forEach(([label, fn]) => {
            try { fn(); } catch (stepErr) {
                console.error(`[Titan] ${label} failed:`, stepErr);
                this.addConsoleMessage('error', `${label} failed: ${stepErr?.message || stepErr}`);
            }
        });

        div.querySelector('.mute-clip')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectClip(clipId, { storeSnapshot: false, syncTrackFocus: true });
            this.toggleClipMute(clipId);
        });
        div.querySelector('.delete-clip')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeClipById(clipId);
        });

        clip.track = trackNumber;
        this.storeWorkingSessionSnapshot();
    }

    drawAudioWaveform(canvas, buffer, clip = null) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (!buffer) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(124, 92, 255, 0.18)';
            ctx.fillRect(0, Math.floor(canvas.height / 2) - 1, canvas.width, 2);
            return;
        }
        const data = buffer.getChannelData(0);
        const width = canvas.width;
        const height = canvas.height;
        if (width <= 1 || height <= 1) return;
        const sampleRate = buffer.sampleRate || this.engine?.sampleRate || 48000;
        const trimStartSample = Math.max(0, Math.floor(this.getClipTrimStart(clip) * sampleRate));
        const trimEndSample = Math.max(trimStartSample + 1, Math.min(data.length, Math.ceil(this.getClipTrimEnd(clip) * sampleRate) || data.length));
        const trimmedData = data.subarray(trimStartSample, trimEndSample);
        const step = Math.max(1, Math.floor(trimmedData.length / width));
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '#7c5cff';
        for (let x = 0; x < width; x++) {
            let max = 0;
            for (let i = 0; i < step; i++) { const abs = Math.abs(trimmedData[x * step + i] || 0); if (abs > max) max = abs; }
            const barHeight = max * height * 0.9, y = (height - barHeight) / 2;
            ctx.fillRect(x, y, 2, Math.max(1, barHeight));
        }
        if (clip) {
            const playDuration = Math.max(0.001, this.getClipPlayDuration(clip));
            const fadeInWidth = Math.min(width, (this.getClipFadeInDuration(clip) / playDuration) * width);
            const fadeOutWidth = Math.min(width, (this.getClipFadeOutDuration(clip) / playDuration) * width);
            if (fadeInWidth > 0) {
                const fadeInGradient = ctx.createLinearGradient(0, 0, fadeInWidth, 0);
                fadeInGradient.addColorStop(0, 'rgba(0,0,0,0.45)');
                fadeInGradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = fadeInGradient;
                ctx.fillRect(0, 0, fadeInWidth, height);
            }
            if (fadeOutWidth > 0) {
                const fadeOutGradient = ctx.createLinearGradient(width - fadeOutWidth, 0, width, 0);
                fadeOutGradient.addColorStop(0, 'rgba(0,0,0,0)');
                fadeOutGradient.addColorStop(1, 'rgba(0,0,0,0.45)');
                ctx.fillStyle = fadeOutGradient;
                ctx.fillRect(width - fadeOutWidth, 0, fadeOutWidth, height);
            }
        }
        // Waveform diagnostics overlay (problem regions painted on the waveform)
        if (typeof WaveDiag !== 'undefined' && clip) {
            try { WaveDiag.paintOverlay(this, canvas, clip, width, height); } catch (diagErr) {}
        }
    }

    shouldPlayClipOnTransport(clip) {
        if (!clip || clip.muted) return false;
        return !this.playbackTrackFilter || this.playbackTrackFilter(clip);
    }

    getArmedTrackIds() {
        return Array.from(document.querySelectorAll('.track-header .record-arm.active'))
            .map((button) => parseInt(button.closest('.track-header')?.dataset.track || '0', 10))
            .filter((trackId) => trackId > 0);
    }

    getPunchWindow() {
        if (!Number.isFinite(this.punchInTime) || !Number.isFinite(this.punchOutTime)) return null;
        if (this.punchOutTime <= this.punchInTime) return null;
        return { start: this.punchInTime, end: this.punchOutTime };
    }

    getSelectedTrackId() {
        const availableTrackIds = Array.from(document.querySelectorAll('.track-header'))
            .map((trackHeader) => Number(trackHeader.getAttribute('data-track')))
            .filter((trackId) => Number.isFinite(trackId) && trackId > 0);
        if (availableTrackIds.length === 0) return 1;
        return availableTrackIds.includes(this.selectedTrackId) ? this.selectedTrackId : availableTrackIds[0];
    }

    getTrackName(trackId) {
        const input = document.querySelector(`.track-header[data-track="${trackId}"] .track-name-input`);
        return input?.value?.trim() || `Track ${trackId}`;
    }

    getTrackClipCount(trackId) {
        return Array.from(this.audioClips.values()).filter((clip) => (clip.track || 1) === trackId).length;
    }

    getTrackPluginCount(trackId) {
        return (this.trackPlugins.get(trackId) || []).length;
    }

    getTrackOutputBusId(trackId) {
        return this.engine.getTrackOutput(trackId);
    }

    getTrackOutputLabel(trackId) {
        return TITAN_BUS_LABELS[this.getTrackOutputBusId(trackId)] || TITAN_BUS_LABELS.master;
    }

    getTrackSendSummary(trackId) {
        const sendParts = TITAN_BUS_OPTIONS
            .filter((bus) => bus.id !== 'master')
            .map((bus) => ({ label: bus.label, level: this.engine.getTrackSendLevel(trackId, bus.id) }))
            .filter((send) => send.level > 0.001)
            .map((send) => `${send.label} ${Math.round(send.level * 100)}%`);
        return sendParts.length ? sendParts.join(' â€¢ ') : 'No sends';
    }

    formatTrackPanValue(pan) {
        const normalizedPan = Math.max(-1, Math.min(1, Number(pan) || 0));
        if (Math.abs(normalizedPan) < 0.01) return 'Center';
        const side = normalizedPan < 0 ? 'L' : 'R';
        return `${side} ${Math.round(Math.abs(normalizedPan) * 100)}%`;
    }

    countTracksForOutput(outputBusId) {
        return Array.from(document.querySelectorAll('.track-header'))
            .map((trackHeader) => Number(trackHeader.getAttribute('data-track')))
            .filter((trackId) => Number.isFinite(trackId) && trackId > 0)
            .filter((trackId) => this.getTrackOutputBusId(trackId) === outputBusId)
            .length;
    }

    getSelectedClip() {
        if (!this.selectedClipId) return null;
        const clip = this.audioClips.get(this.selectedClipId);
        return clip ? { id: this.selectedClipId, clip } : null;
    }

    getClipSourceDuration(clip) {
        if (!clip) return 0;
        if (Number.isFinite(clip.sourceDuration) && clip.sourceDuration > 0) return clip.sourceDuration;
        if (clip.buffer?.duration) return clip.buffer.duration;
        return Number.isFinite(clip.duration) ? clip.duration : 0;
    }

    getClipTrimStart(clip) {
        if (!clip) return 0;
        return Math.max(0, Number.isFinite(clip.trimStart) ? clip.trimStart : 0);
    }

    getClipTrimEnd(clip) {
        if (!clip) return 0;
        const sourceDuration = this.getClipSourceDuration(clip);
        const rawTrimEnd = Number.isFinite(clip.trimEnd) ? clip.trimEnd : sourceDuration;
        return Math.max(this.getClipTrimStart(clip), Math.min(sourceDuration, rawTrimEnd));
    }

    getClipPlayDuration(clip) {
        return Math.max(0, this.getClipTrimEnd(clip) - this.getClipTrimStart(clip));
    }

    getClipFadeInDuration(clip) {
        return Math.max(0, Math.min(this.getClipPlayDuration(clip), Number.isFinite(clip?.fadeInDuration) ? clip.fadeInDuration : 0));
    }

    getClipFadeOutDuration(clip) {
        return Math.max(0, Math.min(this.getClipPlayDuration(clip), Number.isFinite(clip?.fadeOutDuration) ? clip.fadeOutDuration : 0));
    }

    normalizeClipState(clip) {
        if (!clip) return clip;
        const sourceDuration = this.getClipSourceDuration(clip);
        clip.sourceDuration = sourceDuration;
        clip.trimStart = Math.max(0, Math.min(sourceDuration, Number.isFinite(clip.trimStart) ? clip.trimStart : 0));
        clip.trimEnd = Math.max(clip.trimStart, Math.min(sourceDuration, Number.isFinite(clip.trimEnd) ? clip.trimEnd : sourceDuration));
        clip.fadeInDuration = this.getClipFadeInDuration(clip);
        clip.fadeOutDuration = this.getClipFadeOutDuration(clip);
        const playDuration = this.getClipPlayDuration(clip);
        const combinedFade = clip.fadeInDuration + clip.fadeOutDuration;
        if (combinedFade > playDuration && combinedFade > 0) {
            const scale = playDuration / combinedFade;
            clip.fadeInDuration *= scale;
            clip.fadeOutDuration *= scale;
        }
        clip.duration = this.getClipPlayDuration(clip);
        return clip;
    }

    snapTimelineSeconds(value) {
        const normalized = Math.max(0, Number(value) || 0);
        if (!Number.isFinite(this.snapStepSeconds) || this.snapStepSeconds <= 0) return normalized;
        return Math.round(normalized / this.snapStepSeconds) * this.snapStepSeconds;
    }

    getTransportStateLabel() {
        if (this.isRecording) return 'Recording';
        if (this.recordSession && !this.recordSession.recordingActive) return 'Record Ready';
        if (this.isPlaying) return 'Playing';
        return 'Stopped';
    }

    getPunchRangeLabel() {
        const punchWindow = this.getPunchWindow();
        if (!punchWindow) return 'Punch off';
        return `${this.formatTime(punchWindow.start)} -> ${this.formatTime(punchWindow.end)}`;
    }

    updateTransportSummaryUi() {
        const transportStateChip = document.getElementById('transportStateChip');
        const armedTrackCount = document.getElementById('armedTrackCount');
        const punchRangeLabel = document.getElementById('punchRangeLabel');
        const stateLabel = this.getTransportStateLabel();
        if (transportStateChip) {
            transportStateChip.textContent = stateLabel;
            transportStateChip.classList.toggle('playing', stateLabel === 'Playing');
            transportStateChip.classList.toggle('recording', stateLabel === 'Recording');
        }
        if (armedTrackCount) {
            const count = this.getArmedTrackIds().length;
            armedTrackCount.textContent = `${count} armed`;
        }
        if (punchRangeLabel) punchRangeLabel.textContent = this.getPunchRangeLabel();
    }

    updateTrackSummaries() {
        document.querySelectorAll('.track-header').forEach((header) => {
            const trackId = Number(header.getAttribute('data-track'));
            if (!Number.isFinite(trackId) || trackId <= 0) return;
            const clipCount = this.getTrackClipCount(trackId);
            const pluginCount = this.getTrackPluginCount(trackId);
            const clipBadge = header.querySelector('.track-meta-pill[data-role="clips"]');
            const pluginBadge = header.querySelector('.track-meta-pill[data-role="plugins"]');
            const typeLabel = header.querySelector('.track-type');
            const armed = header.querySelector('.record-arm')?.classList.contains('active');
            const monitored = header.querySelector('.monitor')?.classList.contains('active');

            if (clipBadge) clipBadge.textContent = `${clipCount} clip${clipCount === 1 ? '' : 's'}`;
            if (pluginBadge) pluginBadge.textContent = `${pluginCount} plugin${pluginCount === 1 ? '' : 's'}`;
            const outputBadge = header.querySelector('.track-meta-pill[data-role="output"]');
            if (outputBadge) outputBadge.textContent = this.getTrackOutputLabel(trackId);
            if (typeLabel) {
                const stateParts = ['Audio'];
                if (armed) stateParts.push('Armed');
                else if (monitored) stateParts.push('Monitor');
                typeLabel.textContent = stateParts.join(' â€¢ ');
            }

            const lane = document.querySelector(`.track-lane[data-track="${trackId}"]`);
            lane?.classList.toggle('selected', trackId === this.selectedTrackId);
            header.classList.toggle('selected', trackId === this.selectedTrackId);
        });
    }

    updateArrangementSummaryUi() {
        const selectedTrackId = this.getSelectedTrackId();
        const selectedTrackLabel = document.getElementById('selectedTrackLabel');
        const arrangementClipCount = document.getElementById('arrangementClipCount');
        const arrangementPluginCount = document.getElementById('arrangementPluginCount');
        const arrangementHint = document.getElementById('arrangementHint');
        if (selectedTrackLabel) selectedTrackLabel.textContent = this.getTrackName(selectedTrackId);
        if (arrangementClipCount) arrangementClipCount.textContent = `${this.getTrackClipCount(selectedTrackId)}`;
        if (arrangementPluginCount) arrangementPluginCount.textContent = `${this.getTrackPluginCount(selectedTrackId)}`;
        if (arrangementHint) {
            const selectedClip = this.getSelectedClip();
            arrangementHint.textContent = selectedClip
                ? 'Use Arrow Left/Right to nudge the selected clip, Shift+Arrow for larger moves, Delete to remove it, and Ctrl+D to duplicate it.'
                : 'Drop audio onto lanes, double-click browser files to place them, click a clip to edit it, and use Delete or Ctrl+D for fast arrangement work.';
        }
    }

    updateSelectedClipUi() {
        const selectedClipLabel = document.getElementById('selectedClipLabel');
        const selectedClipMeta = document.getElementById('selectedClipMeta');
        const clipMuteToggle = document.getElementById('clipMuteToggle');
        const clipFadeIn = /** @type {HTMLInputElement | null} */ (document.getElementById('clipFadeIn'));
        const clipFadeOut = /** @type {HTMLInputElement | null} */ (document.getElementById('clipFadeOut'));
        const clipFadeInValue = document.getElementById('clipFadeInValue');
        const clipFadeOutValue = document.getElementById('clipFadeOutValue');
        const clipSnapGrid = /** @type {HTMLSelectElement | null} */ (document.getElementById('clipSnapGrid'));
        const selectedClip = this.getSelectedClip();
        const actionButtons = ['clipSetStart', 'clipSetEnd', 'clipSplit', 'clipReset', 'clipNudgeLeft', 'clipNudgeRight', 'clipMuteToggle', 'clipDuplicate', 'clipDelete']
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        if (clipSnapGrid) clipSnapGrid.value = String(this.snapStepSeconds || 0);

        if (!selectedClip) {
            if (selectedClipLabel) selectedClipLabel.textContent = 'No clip selected';
            if (selectedClipMeta) selectedClipMeta.textContent = 'Click a clip to edit timing, mute, duplicate, trim, split, or fade it.';
            actionButtons.forEach((button) => { button.disabled = true; });
            if (clipMuteToggle) clipMuteToggle.innerHTML = '<i class="fas fa-volume-mute"></i> Mute';
            if (clipFadeIn) { clipFadeIn.disabled = true; clipFadeIn.value = '0'; }
            if (clipFadeOut) { clipFadeOut.disabled = true; clipFadeOut.value = '0'; }
            if (clipFadeInValue) clipFadeInValue.textContent = '0.00s';
            if (clipFadeOutValue) clipFadeOutValue.textContent = '0.00s';
            document.querySelectorAll('.audio-clip').forEach((clipEl) => clipEl.classList.remove('selected'));
            return;
        }

        const { id, clip } = selectedClip;
        this.normalizeClipState(clip);
        const clipTrackName = this.getTrackName(clip.track || 1);
        const clipDuration = this.getClipPlayDuration(clip);
        if (selectedClipLabel) selectedClipLabel.textContent = clip.name || id;
        if (selectedClipMeta) {
            const stateText = clip.muted ? 'muted' : 'active';
            selectedClipMeta.textContent = `${clipTrackName} â€¢ ${this.formatTime(clip.timelineStart || 0)} â€¢ ${(clipDuration || 0).toFixed(2)}s â€¢ in ${this.getClipTrimStart(clip).toFixed(2)}s â€¢ out ${this.getClipTrimEnd(clip).toFixed(2)}s â€¢ ${stateText}`;
        }
        if (clipMuteToggle) {
            clipMuteToggle.innerHTML = clip.muted
                ? '<i class="fas fa-volume-up"></i> Unmute'
                : '<i class="fas fa-volume-mute"></i> Mute';
        }
        actionButtons.forEach((button) => { button.disabled = false; });
        if (clipFadeIn) {
            clipFadeIn.disabled = false;
            clipFadeIn.max = String(Math.max(0.01, clipDuration));
            clipFadeIn.value = String(this.getClipFadeInDuration(clip));
        }
        if (clipFadeOut) {
            clipFadeOut.disabled = false;
            clipFadeOut.max = String(Math.max(0.01, clipDuration));
            clipFadeOut.value = String(this.getClipFadeOutDuration(clip));
        }
        if (clipFadeInValue) clipFadeInValue.textContent = `${this.getClipFadeInDuration(clip).toFixed(2)}s`;
        if (clipFadeOutValue) clipFadeOutValue.textContent = `${this.getClipFadeOutDuration(clip).toFixed(2)}s`;
        document.querySelectorAll('.audio-clip').forEach((clipEl) => {
            clipEl.classList.toggle('selected', clipEl.getAttribute('data-clip-id') === id);
        });
    }

    updateSelectedTrackInspector() {
        const trackId = this.getSelectedTrackId();
        this.selectedTrackId = trackId;
        const name = this.getTrackName(trackId);
        const clipCount = this.getTrackClipCount(trackId);
        const pluginCount = this.getTrackPluginCount(trackId);
        const header = document.querySelector(`.track-header[data-track="${trackId}"]`);
        const isMuted = !!header?.querySelector('.mute')?.classList.contains('active');
        const isSolo = !!header?.querySelector('.solo')?.classList.contains('active');
        const isArmed = !!header?.querySelector('.record-arm')?.classList.contains('active');
        const isMonitoring = !!header?.querySelector('.monitor')?.classList.contains('active');

        const nameEl = document.getElementById('selectedTrackName');
        const summaryEl = document.getElementById('selectedTrackSummary');
        const routeEl = document.getElementById('selectedTrackRoute');
        const clipCountEl = document.getElementById('selectedTrackClipCount');
        const pluginCountEl = document.getElementById('selectedTrackPluginCount');
        const badgesEl = document.getElementById('selectedTrackStateBadges');
        const outputRouteSelect = /** @type {HTMLSelectElement | null} */ (document.getElementById('selectedTrackOutputRouteSelect'));
        const panSlider = /** @type {HTMLInputElement | null} */ (document.getElementById('selectedTrackPan'));
        const panValueEl = document.getElementById('selectedTrackPanValue');
        const sendBusASlider = /** @type {HTMLInputElement | null} */ (document.getElementById('selectedTrackSend-busA'));
        const sendBusBSlider = /** @type {HTMLInputElement | null} */ (document.getElementById('selectedTrackSend-busB'));
        const sendBusAValueEl = document.getElementById('selectedTrackSendValue-busA');
        const sendBusBValueEl = document.getElementById('selectedTrackSendValue-busB');
        const panValue = this.engine.getTrackPan(trackId);
        const sendBusAValue = this.engine.getTrackSendLevel(trackId, 'busA');
        const sendBusBValue = this.engine.getTrackSendLevel(trackId, 'busB');

        if (nameEl) nameEl.textContent = name;
        if (summaryEl) summaryEl.textContent = `${clipCount} clip${clipCount === 1 ? '' : 's'} â€¢ ${pluginCount} plugin${pluginCount === 1 ? '' : 's'}`;
        const outputBusLabel = this.getTrackOutputLabel(trackId);
        const sendSummary = this.getTrackSendSummary(trackId);
        if (routeEl) routeEl.textContent = `${outputBusLabel} â€¢ ${sendSummary}`;
        if (clipCountEl) clipCountEl.textContent = `${clipCount}`;
        if (pluginCountEl) pluginCountEl.textContent = `${pluginCount}`;
        if (outputRouteSelect) outputRouteSelect.value = this.getTrackOutputBusId(trackId);
        if (panSlider) panSlider.value = String(panValue);
        if (panValueEl) panValueEl.textContent = this.formatTrackPanValue(panValue);
        if (sendBusASlider) sendBusASlider.value = String(sendBusAValue);
        if (sendBusBSlider) sendBusBSlider.value = String(sendBusBValue);
        if (sendBusAValueEl) sendBusAValueEl.textContent = `${Math.round(sendBusAValue * 100)}%`;
        if (sendBusBValueEl) sendBusBValueEl.textContent = `${Math.round(sendBusBValue * 100)}%`;
        if (badgesEl) {
            const badges = [];
            if (isMuted) badges.push('<span class="track-state-badge muted">Muted</span>');
            if (isSolo) badges.push('<span class="track-state-badge solo">Solo</span>');
            if (isArmed) badges.push(`<span class="track-state-badge ${this.isRecording ? 'recording' : 'armed'}">${this.isRecording ? 'Recording' : 'Armed'}</span>`);
            if (isMonitoring) badges.push('<span class="track-state-badge monitor">Monitor</span>');
            if (badges.length === 0) badges.push('<span class="track-state-badge ready">Ready</span>');
            badgesEl.innerHTML = badges.join('');
        }

        const muteButton = document.getElementById('inspectorToggleMute');
        const soloButton = document.getElementById('inspectorToggleSolo');
        const armButton = document.getElementById('inspectorToggleArm');
        const monitorButton = document.getElementById('inspectorToggleMonitor');
        muteButton?.classList.toggle('active', isMuted);
        soloButton?.classList.toggle('active', isSolo);
        armButton?.classList.toggle('active', isArmed);
        monitorButton?.classList.toggle('active', isMonitoring);
    }

    refreshMainUi() {
        this.updateTransportSummaryUi();
        this.updateTrackSummaries();
        this.updateArrangementSummaryUi();
        this.updateSelectedClipUi();
        this.updateSelectedTrackInspector();
        this.updateBusTelemetryUi();
        this.updateAutomationEditorUi();
        this.updateEditTabUi();
    }

    updateBusTelemetryUi() {
        const busLevels = this.engine.getBusMeterLevels();
        busLevels.forEach((busLevel) => {
            const levelPercent = Math.max(0, Math.min(100, Math.round(((busLevel.left + busLevel.right) / 2) * 100)));
            const meterFill = /** @type {HTMLElement | null} */ (document.getElementById(`busMeterFill-${busLevel.id}`));
            const levelValue = document.getElementById(`busLevelValue-${busLevel.id}`);
            const trackCountValue = document.getElementById(`busTrackCountValue-${busLevel.id}`);
            const volumeSlider = /** @type {HTMLInputElement | null} */ (document.getElementById(`busVolume-${busLevel.id}`));
            const volumeValue = document.getElementById(`busVolumeValue-${busLevel.id}`);
            const returnPluginCountValue = document.getElementById(`busReturnPluginCount-${busLevel.id}`);
            if (meterFill) meterFill.style.width = `${levelPercent}%`;
            if (levelValue) levelValue.textContent = `${levelPercent}%`;
            if (trackCountValue) trackCountValue.textContent = busLevel.id === 'master'
                ? 'All tracks'
                : `${this.countTracksForOutput(busLevel.id)} track${this.countTracksForOutput(busLevel.id) === 1 ? '' : 's'}`;
            const gainValue = this.engine.getBusVolume(busLevel.id);
            if (volumeSlider) volumeSlider.value = String(gainValue);
            if (volumeValue) volumeValue.textContent = `${gainValue.toFixed(2)}x`;
            if (returnPluginCountValue && busLevel.id !== 'master') {
                const pluginCount = this.countBusReturnPlugins(busLevel.id);
                returnPluginCountValue.textContent = `${pluginCount} return FX`;
            }
        });
        this.updateMasterSafetyToggleUi();
    }

    updateMasterSafetyToggleUi() {
        const btn = /** @type {HTMLButtonElement | null} */ (document.getElementById('masterSafetyToggle'));
        if (!btn) return;
        const on = this.engine?.isMasterSafetyLimiterOn() !== false;
        btn.textContent = `Safety Limiter: ${on ? 'ON' : 'OFF'}`;
        btn.classList.toggle('active', on);
    }

    selectTrack(trackId, options = {}) {
        const normalizedTrackId = Number(trackId);
        if (!Number.isFinite(normalizedTrackId) || normalizedTrackId <= 0) return;
        if (!document.querySelector(`.track-header[data-track="${normalizedTrackId}"]`)) return;
        this.selectedTrackId = normalizedTrackId;
        const syncPluginTrack = options.syncPluginTrack !== false;
        if (syncPluginTrack) {
            this.currentPluginTrack = normalizedTrackId;
            this.currentPluginTarget = { type: 'track', id: normalizedTrackId };
            this.updatePluginTrackSelector();
            this.renderPluginChain();
        }
        this.refreshMainUi();
        if (this.comping) this.comping.renderTakesPanel();
        if (options.storeSnapshot !== false) this.storeWorkingSessionSnapshot();
    }

    selectClip(clipId, options = {}) {
        const selectedClip = clipId && this.audioClips.has(clipId) ? { id: clipId, clip: this.audioClips.get(clipId) } : null;
        this.selectedClipId = selectedClip ? selectedClip.id : null;
        if (selectedClip && options.syncTrackFocus !== false) {
            this.selectTrack(selectedClip.clip.track || 1, { syncPluginTrack: false, storeSnapshot: false });
            return;
        }
        this.refreshMainUi();
        if (options.storeSnapshot !== false) this.storeWorkingSessionSnapshot();
    }

    updateClipElementState(clipId) {
        const clipEl = document.querySelector(`.audio-clip[data-clip-id="${clipId}"]`);
        const clip = this.audioClips.get(clipId);
        if (!clipEl || !clip) return;
        clipEl.classList.toggle('muted', !!clip.muted);
        clipEl.classList.toggle('selected', this.selectedClipId === clipId);
        const muteButton = clipEl.querySelector('.mute-clip');
        if (muteButton) muteButton.classList.toggle('active', !!clip.muted);
    }

    updateClipElementPosition(clipId) {
        const clipEl = document.querySelector(`.audio-clip[data-clip-id="${clipId}"]`);
        const clip = this.audioClips.get(clipId);
        if (!clipEl || !clip) return;
        const pixelsPerSecond = 100;
        clipEl.style.left = `${this._clipPixelX(Math.max(0, clip.timelineStart || 0))}px`;
        clipEl.style.width = `${Math.max(60, this.getClipPlayDuration(clip) * pixelsPerSecond)}px`;
        const targetLane = document.querySelector(`.track-lane[data-track="${clip.track || 1}"]`);
        if (targetLane && clipEl.parentElement !== targetLane) {
            targetLane.appendChild(clipEl);
        }
        const canvas = clipEl.querySelector('canvas');
        if (canvas) {
            canvas.width = Math.max(44, Math.max(60, this.getClipPlayDuration(clip) * pixelsPerSecond) - 16);
            canvas.height = 60;
            this.drawAudioWaveform(canvas, clip.buffer, clip);
        }
    }

    moveClip(clipId, deltaSeconds) {
        const clip = this.audioClips.get(clipId);
        if (!clip) return false;
        clip.timelineStart = this.snapTimelineSeconds((clip.timelineStart || 0) + deltaSeconds);
        this.updateClipElementPosition(clipId);
        this._updateTimelineExtent();
        this.refreshMainUi();
        this.storeWorkingSessionSnapshot();
        return true;
    }

    removeClipById(clipId) {
        if (!this.audioClips.has(clipId)) return false;
        const clip = this.audioClips.get(clipId);
        this.clipSources.get(clipId)?.stop?.();
        this.clipSources.delete(clipId);
        this.audioClips.delete(clipId);
        document.querySelector(`.audio-clip[data-clip-id="${clipId}"]`)?.remove();
        this.deletePersistedClipAsset(clipId).catch((err) => {
            console.warn(`Failed to delete persisted clip asset for ${clipId}:`, err);
        });
        if (this.selectedClipId === clipId) this.selectedClipId = null;
        if (clip?.track) this.selectedTrackId = clip.track;
        this.populateBrowser();
        this.refreshMainUi();
        this.storeWorkingSessionSnapshot();
        this._updateTimelineExtent();
        return true;
    }

    toggleClipMute(clipId) {
        const clip = this.audioClips.get(clipId);
        if (!clip) return false;
        clip.muted = !clip.muted;
        this.updateClipElementState(clipId);
        this.refreshMainUi();
        this.storeWorkingSessionSnapshot();
        return clip.muted;
    }

    async duplicateClip(clipId) {
        const sourceClip = this.audioClips.get(clipId);
        if (!sourceClip) return null;
        this.normalizeClipState(sourceClip);
        const duplicateId = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const duplicateClip = {
            ...sourceClip,
            name: `${sourceClip.name} Copy`,
            timelineStart: this.snapTimelineSeconds((sourceClip.timelineStart || 0) + this.getClipPlayDuration(sourceClip)),
            muted: !!sourceClip.muted
        };
        this.normalizeClipState(duplicateClip);
        this.audioClips.set(duplicateId, duplicateClip);

        let audioData = null;
        try {
            const persistedAsset = await this.loadPersistedClipAsset(clipId);
            if (persistedAsset?.audioData) {
                audioData = persistedAsset.audioData.slice(0);
            }
        } catch (error) {
            console.warn(`Failed to load persisted clip asset for duplication ${clipId}:`, error);
        }
        if (!audioData && sourceClip.buffer) {
            audioData = this._audioBufferToWav(sourceClip.buffer);
        }
        if (audioData) {
            await this.persistClipAsset(duplicateId, duplicateClip, audioData);
        }

        this.addClipToTimeline(duplicateId, duplicateClip.track || 1);
        this.selectClip(duplicateId, { storeSnapshot: false, syncTrackFocus: true });
        this.addConsoleMessage('success', `Duplicated clip ${sourceClip.name}.`);
        this.storeWorkingSessionSnapshot();
        return duplicateId;
    }

    async duplicateSelectedClip() {
        const selectedClip = this.getSelectedClip();
        if (!selectedClip) return;
        await this.duplicateClip(selectedClip.id);
    }

    nudgeSelectedClip(deltaSeconds) {
        const selectedClip = this.getSelectedClip();
        if (!selectedClip) return false;
        return this.moveClip(selectedClip.id, deltaSeconds);
    }

    removeSelectedClip() {
        const selectedClip = this.getSelectedClip();
        if (!selectedClip) return false;
        return this.removeClipById(selectedClip.id);
    }

    resetSelectedClipEdits() {
        const selectedClip = this.getSelectedClip();
        if (!selectedClip) return false;
        const { id, clip } = selectedClip;
        clip.trimStart = 0;
        clip.trimEnd = this.getClipSourceDuration(clip);
        clip.fadeInDuration = 0;
        clip.fadeOutDuration = 0;
        this.normalizeClipState(clip);
        this.updateClipElementPosition(id);
        this.refreshMainUi();
        this.storeWorkingSessionSnapshot();
        return true;
    }

    setSelectedClipFade(which, value) {
        const selectedClip = this.getSelectedClip();
        if (!selectedClip) return false;
        const { id, clip } = selectedClip;
        const normalizedValue = Math.max(0, Number(value) || 0);
        if (which === 'in') clip.fadeInDuration = normalizedValue;
        else clip.fadeOutDuration = normalizedValue;
        this.normalizeClipState(clip);
        this.updateClipElementPosition(id);
        this.refreshMainUi();
        this.storeWorkingSessionSnapshot();
        return true;
    }

    trimSelectedClipToPlayhead(boundary) {
        const selectedClip = this.getSelectedClip();
        if (!selectedClip) return false;
        const { id, clip } = selectedClip;
        const clipStart = clip.timelineStart || 0;
        const effectiveTime = this.snapTimelineSeconds(this.currentTime);
        const relativeTime = effectiveTime - clipStart;
        const playDuration = this.getClipPlayDuration(clip);
        if (relativeTime <= 0 || relativeTime >= playDuration) return false;
        const absoluteBufferTime = this.getClipTrimStart(clip) + relativeTime;
        if (boundary === 'start') {
            clip.trimStart = absoluteBufferTime;
            clip.timelineStart = effectiveTime;
        } else {
            clip.trimEnd = absoluteBufferTime;
        }
        this.normalizeClipState(clip);
        this.updateClipElementPosition(id);
        this.refreshMainUi();
        this.storeWorkingSessionSnapshot();
        return true;
    }

    async splitSelectedClipAtPlayhead() {
        const selectedClip = this.getSelectedClip();
        if (!selectedClip) return false;
        const { id, clip } = selectedClip;
        const clipStart = clip.timelineStart || 0;
        const playDuration = this.getClipPlayDuration(clip);
        const effectiveTime = this.snapTimelineSeconds(this.currentTime);
        const relativeTime = effectiveTime - clipStart;
        if (relativeTime <= 0.01 || relativeTime >= playDuration - 0.01) return false;

        const splitBufferTime = this.getClipTrimStart(clip) + relativeTime;
        const duplicateId = `clip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const rightClip = {
            ...clip,
            name: `${clip.name} Split`,
            timelineStart: effectiveTime,
            trimStart: splitBufferTime,
            trimEnd: this.getClipTrimEnd(clip),
            fadeInDuration: 0
        };
        clip.trimEnd = splitBufferTime;
        clip.fadeOutDuration = 0;
        this.normalizeClipState(clip);
        this.normalizeClipState(rightClip);
        this.audioClips.set(duplicateId, rightClip);

        let audioData = null;
        try {
            const persistedAsset = await this.loadPersistedClipAsset(id);
            if (persistedAsset?.audioData) audioData = persistedAsset.audioData.slice(0);
        } catch (error) {
            console.warn(`Failed to load persisted clip asset for split ${id}:`, error);
        }
        if (!audioData && clip.buffer) audioData = this._audioBufferToWav(clip.buffer);
        if (audioData) await this.persistClipAsset(duplicateId, rightClip, audioData);

        this.updateClipElementPosition(id);
        this.addClipToTimeline(duplicateId, rightClip.track || 1);
        this.selectClip(duplicateId, { storeSnapshot: false, syncTrackFocus: true });
        this.storeWorkingSessionSnapshot();
        return true;
    }

    toggleSelectedTrackControl(controlClass) {
        const header = document.querySelector(`.track-header[data-track="${this.getSelectedTrackId()}"]`);
        header?.querySelector(`.${controlClass}`)?.click();
    }

    toggleInspectorPanel() {
        const inspectorPanel = document.querySelector('.inspector-panel');
        const toggleButton = document.getElementById('toggleInspector');
        const icon = toggleButton?.querySelector('i');
        const collapsed = inspectorPanel?.classList.toggle('collapsed');
        if (icon) {
            icon.classList.toggle('fa-chevron-left', !collapsed);
            icon.classList.toggle('fa-chevron-right', !!collapsed);
        }
    }

    openEditTab() {
        const editTabBtn = document.querySelector('.tab-btn[data-panel="edit"]');
        if (editTabBtn) editTabBtn.click();
    }

    updateEditTabUi() {
        const trackId = this.getSelectedTrackId();
        const editTrackLabel = document.getElementById('editTrackLabel');
        const editPlayBtn = document.getElementById('editPlay');
        const playIcon = editPlayBtn?.querySelector('i');
        if (editTrackLabel) {
            const header = document.querySelector(`.track-header[data-track="${trackId}"]`);
            const nameInput = header?.querySelector('.track-name-input');
            editTrackLabel.textContent = nameInput?.value || `Track ${trackId}`;
        }
        if (editPlayBtn && playIcon) {
            editPlayBtn.classList.toggle('play-active', this.isPlaying);
            playIcon.classList.toggle('fa-play', !this.isPlaying);
            playIcon.classList.toggle('fa-pause', this.isPlaying);
        }
    }

    updatePunchButtons() {
        const punchInButton = document.getElementById('punchIn');
        const punchOutButton = document.getElementById('punchOut');
        punchInButton?.classList.toggle('active', Number.isFinite(this.punchInTime));
        punchOutButton?.classList.toggle('active', Number.isFinite(this.punchOutTime));
        if (punchInButton) {
            punchInButton.title = Number.isFinite(this.punchInTime)
                ? `Punch In: ${this.formatTime(this.punchInTime)}`
                : 'Set Punch In';
        }
        if (punchOutButton) {
            punchOutButton.title = Number.isFinite(this.punchOutTime)
                ? `Punch Out: ${this.formatTime(this.punchOutTime)}`
                : 'Set Punch Out';
        }
        this.updateTransportSummaryUi();
    }

    togglePunchBoundary(boundary) {
        const property = boundary === 'in' ? 'punchInTime' : 'punchOutTime';
        const currentValue = this[property];
        if (Number.isFinite(currentValue)) {
            this[property] = null;
        } else {
            this[property] = this.currentTime;
        }

        if (Number.isFinite(this.punchInTime) && Number.isFinite(this.punchOutTime) && this.punchOutTime <= this.punchInTime) {
            if (boundary === 'in') {
                this.punchOutTime = null;
                this.addConsoleMessage('warning', 'Punch Out was cleared because it must be after Punch In.');
            } else {
                this.punchInTime = null;
                this.addConsoleMessage('warning', 'Punch In was cleared because it must be before Punch Out.');
            }
        }

        this.updatePunchButtons();
        this.storeWorkingSessionSnapshot();
    }

    updateTransportPlayState(isPlaying) {
        this.isPlaying = isPlaying;
        const playBtn = document.getElementById('play');
        const icon = playBtn?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-pause', isPlaying);
            icon.classList.toggle('fa-play', !isPlaying);
        }
        playBtn?.classList.toggle('playing', isPlaying);
        this.updateTransportSummaryUi();
    }

    setRecordingButtons(armedTrackIds, recording) {
        const armedTrackSet = new Set(armedTrackIds);
        document.querySelectorAll('.track-header .record-arm').forEach((button) => {
            const trackId = parseInt(button.closest('.track-header')?.dataset.track || '0', 10);
            button.classList.toggle('recording', recording && armedTrackSet.has(trackId));
        });
        document.getElementById('record')?.classList.toggle('active', recording);
        this.refreshMainUi();
    }

    restoreRecordingMonitorState(session) {
        const monitorStates = Array.isArray(session?.monitorStates) ? session.monitorStates : [];
        monitorStates.forEach((monitorState) => {
            const trackId = Number(monitorState?.trackId);
            if (!Number.isFinite(trackId) || trackId <= 0) return;
            const header = document.querySelector(`.track-header[data-track="${trackId}"]`);
            const monitorButton = header?.querySelector('.monitor');
            if (monitorButton) {
                monitorButton.classList.toggle('active', !!monitorState.wasActive);
            }
            this.engine.setTrackMonitor(trackId, !!monitorState.wasActive);
        });
    }

    resumePlaybackAfterRecording(stopTime) {
        this.currentTime = Number.isFinite(stopTime) ? stopTime : this.currentTime;
        // v2.0.3: re-anchor so the audio-clock tick doesn't snap back.
        this._reanchorTransport();
        this.updateTimeDisplay();
        const playhead = document.getElementById('playhead');
        const rulerHead = document.getElementById('playheadRuler');
        const left = (this.currentTime * 100) + 200;
        if (playhead) playhead.style.left = `${left}px`;
        if (rulerHead) rulerHead.style.left = `${left}px`;

        this.playbackTrackFilter = null;
        this.playbackTickHook = null;
        this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
        this.clipSources.clear();
        this._stopLoopScheduledSources(); // v2.0.3: re-arm lookahead scheduler
        this.audioClips.forEach((clip, clipId) => {
            if (this.shouldPlayClipOnTransport(clip)) {
                this.playAudioClip(clipId, this.currentTime);
            }
        });
    }

    async beginRecordingPass(session) {
        if (!session || session.recordingActive || session.startingRecording) return;
        session.startingRecording = true;
        await this.engine.ensureResumed();
        try {
            if (!this.engine.inputSource) await this.engine.initInput();
            if (!this.engine.inputSource) {
                throw new Error('Microphone access is required for recording.');
            }
            if (!(await this.engine.startRecording())) {
                throw new Error('Recording engine is already active.');
            }
            session.captureStartTime = this.currentTime;
            // v2.0.3: audio-clock anchor for sample-accurate punch trimming.
            session.captureStartCtxTime = this.engine.recordStartCtxTime;
            session.recordingStartTime = session.punchWindow ? Math.max(this.currentTime, session.punchWindow.start) : this.currentTime;
            session.recordingActive = true;
            this.isRecording = true;
            this.setRecordingButtons(session.armedTrackIds, true);
            this.startLiveWaveform(session);
        } finally {
            session.startingRecording = false;
        }
    }

    startLiveWaveform(session) {
        if (!session || session.liveWaveform) return;
        if (!Array.isArray(this.engine.recordBuffers) || !this.engine.recordBuffers.length) return;
        const els = new Map();
        const leftPx = this._clipPixelX(Math.max(0, session.recordingStartTime || 0));
        session.armedTrackIds.forEach((trackId) => {
            const lane = document.querySelector(`.track-lane[data-track="${trackId}"]`);
            if (!lane) return;
            const el = document.createElement('div');
            el.className = 'audio-clip recording';
            el.style.cssText = `left:${leftPx}px; width:60px;`;
            el.innerHTML = `<div class="clip-header"><span>\u25CF REC</span></div><canvas class="waveform"></canvas>`;
            lane.appendChild(el);
            const canvas = el.querySelector('canvas');
            canvas.width = 44; canvas.height = 48;
            els.set(trackId, { el, canvas });
        });
        if (!els.size) return;
        const sampleRate = this.engine.ctx?.sampleRate || 48000;
        session.liveWaveform = {
            els,
            sampleRate,
            columnSamples: Math.max(1, Math.round(sampleRate / 100)),
            peaks: [],
            nextSample: 0,
            samplesInPartial: 0,
            partialMax: 0,
            timer: setInterval(() => this.updateLiveWaveform(session), 100)
        };
        this.updateLiveWaveform(session);
    }

    updateLiveWaveform(session) {
        const live = session?.liveWaveform;
        if (!live || !this.engine.recording) return;
        const chunks = Array.isArray(this.engine.recordBuffers?.[0]) ? this.engine.recordBuffers[0] : [];
        let totalSamples = 0;
        for (let i = 0; i < chunks.length; i++) totalSamples += chunks[i].length;
        const maxColumns = 30000;

        while (live.nextSample < totalSamples && live.peaks.length < maxColumns) {
            let remaining = live.nextSample, ci = 0;
            while (ci < chunks.length && remaining >= chunks[ci].length) { remaining -= chunks[ci].length; ci++; }
            if (ci >= chunks.length) break;
            const data = chunks[ci];
            while (remaining < data.length && live.peaks.length < maxColumns) {
                const abs = Math.abs(data[remaining]);
                if (abs > live.partialMax) live.partialMax = abs;
                remaining++;
                live.nextSample++;
                live.samplesInPartial++;
                if (live.samplesInPartial >= live.columnSamples) {
                    live.peaks.push(live.partialMax);
                    live.partialMax = 0;
                    live.samplesInPartial = 0;
                }
            }
        }

        const widthPx = Math.max(60, live.peaks.length + 1);
        live.els.forEach(({ el, canvas }) => {
            el.style.width = `${widthPx}px`;
            const targetWidth = Math.max(44, widthPx - 16);
            if (canvas.width !== targetWidth) canvas.width = targetWidth;
            canvas.height = 48;
            const g = canvas.getContext('2d');
            if (!g) return;
            const w = canvas.width, h = canvas.height;
            g.clearRect(0, 0, w, h);
            g.fillStyle = '#ef4444';
            const peaks = live.peaks;
            const stride = peaks.length > w ? Math.ceil(peaks.length / w) : 1;
            for (let x = 0; x < w; x++) {
                let peak = 0;
                if (stride === 1) {
                    peak = peaks[x] || 0;
                } else {
                    const s = x * stride, e = Math.min(peaks.length, s + stride);
                    for (let p = s; p < e; p++) { if (peaks[p] > peak) peak = peaks[p]; }
                }
                const barHeight = Math.max(1, peak * h * 0.9);
                g.fillRect(x, (h - barHeight) / 2, 2, barHeight);
            }
        });
    }

    stopLiveWaveform(session) {
        const live = session?.liveWaveform;
        if (!live) return;
        session.liveWaveform = null;
        if (live.timer) clearInterval(live.timer);
        live.els.forEach(({ el }) => el.remove());
    }

    sliceAudioBuffer(buffer, startSeconds, endSeconds) {
        if (!this.engine.ctx) return buffer;
        const safeStart = Math.max(0, startSeconds || 0);
        const safeEnd = Math.max(safeStart, Math.min(buffer.duration, endSeconds ?? buffer.duration));
        const startSample = Math.min(buffer.length, Math.floor(safeStart * buffer.sampleRate));
        const endSample = Math.min(buffer.length, Math.ceil(safeEnd * buffer.sampleRate));
        const length = Math.max(0, endSample - startSample);
        const sliced = this.engine.ctx.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const sourceData = buffer.getChannelData(channel).subarray(startSample, endSample);
            sliced.getChannelData(channel).set(sourceData);
        }
        return sliced;
    }

    /**
     * v2.0.3: map a transport time (seconds) to AudioContext time (seconds)
     * via the playback anchor. Returns -1 when unavailable.
     */
    _transportToCtxTime(t) {
        if (!Number.isFinite(t)) return -1;
        if (!Number.isFinite(this._transportAnchorCtxTime) || this._transportAnchorCtxTime < 0) return -1;
        if (!Number.isFinite(this._transportAnchorTime)) return -1;
        return this._transportAnchorCtxTime + (t - this._transportAnchorTime);
    }

    /**
     * v2.0.3: sample-exact punch trim offsets (seconds into the recorded
     * buffer). Uses the audio clock end-to-end: the worklet reports the audio
     * time of its first captured quantum, and transport times are converted
     * through the playback anchor. Returns null when the audio-clock data is
     * unavailable (caller falls back to wall-clock math).
     */
    _punchTrimOffsets(audioBuffer, session, clipTimelineStart, clipTimelineEnd) {
        try {
            const eng = this.engine;
            if (!eng || !eng.ctx) return null;
            let capCtx = eng.recordStartWorkletCtxTime;
            if (!Number.isFinite(capCtx) || capCtx < 0) {
                capCtx = session.captureStartCtxTime;
            }
            if (!Number.isFinite(capCtx) || capCtx < 0) return null;
            const startCtx = this._transportToCtxTime(clipTimelineStart);
            const endCtx = this._transportToCtxTime(clipTimelineEnd);
            if (startCtx < 0 || endCtx < 0) return null;
            const startSec = Math.max(0, startCtx - capCtx);
            const endSec = Math.max(startSec, Math.min(audioBuffer.duration, endCtx - capCtx));
            return { startSec, endSec };
        } catch (_) {
            return null;
        }
    }

    async commitRecordingToTracks(audioBuffer, session) {
        if (!audioBuffer || !audioBuffer.length) {
            this.addConsoleMessage('warning', 'Recording completed, but no input audio was captured.');
            return;
        }

        const punchWindow = session.punchWindow;
        const clipTimelineStart = punchWindow
            ? Math.max(session.captureStartTime, punchWindow.start)
            : session.recordingStartTime;
        const clipTimelineEnd = punchWindow
            ? Math.min(session.stopTime, punchWindow.end)
            : session.stopTime;
        // v2.0.3: sample-exact punch trim from the audio clock. The worklet
        // tags capture with the audio time of its first quantum, so transport
        // times map to exact sample indices (no 16ms-timer slop).
        let bufferStartOffset, bufferEndOffset;
        const punchTrim = this._punchTrimOffsets(audioBuffer, session, clipTimelineStart, clipTimelineEnd);
        if (punchTrim) {
            bufferStartOffset = punchTrim.startSec;
            bufferEndOffset = punchTrim.endSec;
        } else {
            bufferStartOffset = Math.max(0, clipTimelineStart - session.captureStartTime);
            bufferEndOffset = Math.max(bufferStartOffset, Math.min(audioBuffer.duration, bufferStartOffset + (clipTimelineEnd - clipTimelineStart)));
        }
        const clipBuffer = this.sliceAudioBuffer(audioBuffer, bufferStartOffset, bufferEndOffset);

        if (!clipBuffer.length || clipTimelineEnd <= clipTimelineStart) {
            this.addConsoleMessage('warning', 'Recording window was empty, so no clip was created.');
            return;
        }

        const wavData = this._audioBufferToWav(clipBuffer);
        for (const trackId of session.armedTrackIds) {
            if (this.takesMode && this.comping) {
                await this.comping.commitTake(trackId, clipBuffer, clipTimelineStart);
                continue;
            }
            const clipId = `recording-${trackId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const clip = {
                buffer: clipBuffer,
                name: `Recording T${trackId} ${new Date().toLocaleTimeString()}`,
                duration: clipBuffer.duration,
                sourceDuration: clipBuffer.duration,
                timelineStart: clipTimelineStart,
                track: trackId,
                muted: false,
                trimStart: 0,
                trimEnd: clipBuffer.duration,
                fadeInDuration: 0,
                fadeOutDuration: 0
            };
            this.normalizeClipState(clip);
            this.audioClips.set(clipId, clip);
            await this.persistClipAsset(clipId, clip, wavData.slice(0));
            this.addClipToTimeline(clipId, trackId);
            if (typeof WaveDiag !== 'undefined') WaveDiag.analyzeClip(this, clipId);
        }
        this.populateBrowser();
        this.addConsoleMessage('success', `Recorded ${session.armedTrackIds.length} armed track${session.armedTrackIds.length === 1 ? '' : 's'} from ${this.formatTime(clipTimelineStart)}.`);
    }

    async finishRecordingPass(options = {}) {
        if (!this.recordSession) return;
        const session = this.recordSession;
        const continuePlayback = !!options.continuePlayback;
        this.recordSession = null;

        let recordedBuffer = null;
        if (session.recordingActive) {
            recordedBuffer = this.engine.stopRecording();
        }
        this.stopLiveWaveform(session);

        session.stopTime = typeof options.stopTime === 'number' ? options.stopTime : this.currentTime;
        this.restoreRecordingMonitorState(session);
        this.isRecording = false;
        this.setRecordingButtons(session.armedTrackIds, false);

        if (recordedBuffer) {
            await this.commitRecordingToTracks(recordedBuffer, session);
        }

        if (continuePlayback && this.isPlaying) {
            this.resumePlaybackAfterRecording(session.stopTime);
        } else {
            this.playbackTrackFilter = null;
            this.playbackTickHook = null;
        }

        if (session.voxGenesisArmed) {
            const vg = window.voxEngine;
            if (vg && vg.voxArmed) {
                vg.haltCapture('Vox Take').then((model) => {
                    if (model) {
                        this.addConsoleMessage('success', `VoxGenesis voice print captured: ${model.name} (${model.id}).`);
                    }
                });
                vg.voxArmed = false;
            }
        }

        this.storeWorkingSessionSnapshot();
    }

    handleRecordingTransportTick(currentTime) {
        if (!this.recordSession) return;
        const session = this.recordSession;

        if (!session.recordingActive && !session.startingRecording && session.punchWindow && currentTime >= session.punchWindow.start) {
            this.beginRecordingPass(session).catch((err) => {
                this.addConsoleMessage('error', err.message);
                this.finishRecordingPass({ continuePlayback: false }).catch(() => {});
            });
            return;
        }

        if (session.recordingActive && session.punchWindow && currentTime >= session.punchWindow.end) {
            this.finishRecordingPass({
                continuePlayback: true,
                stopTime: session.punchWindow.end
            }).catch((err) => {
                this.addConsoleMessage('error', `Punch-out failed: ${err.message}`);
            });
        }
    }

    playAudioClip(clipId, startOffset = 0) {
        if (!this.engine.ctx) return;
        const clip = this.audioClips.get(clipId);
        if (!clip || !clip.buffer) return;
        this.normalizeClipState(clip);

        const timelineStart = clip.timelineStart || 0;
        const duration = this.getClipPlayDuration(clip);
        if (duration <= 0) return;

        let clipOffset = 0;
        let delay = 0;

        if (startOffset <= timelineStart) {
            delay = timelineStart - startOffset;
            clipOffset = 0;
        } else if (startOffset < timelineStart + duration) {
            delay = 0;
            clipOffset = startOffset - timelineStart;
        } else {
            return;
        }
        this._scheduleClipAtCtxTime(clipId, this.engine.ctx.currentTime + delay, clipOffset);
    }

    /**
     * v2.0.3: schedule a clip at an exact AudioContext time with an explicit
     * offset into the clip. Primitive used by playAudioClip and by the
     * seamless loop lookahead scheduler. Returns the AudioBufferSourceNode
     * (or null). When `register` is false the source is NOT added to
     * clipSources (loop scheduler tracks it separately).
     */
    _scheduleClipAtCtxTime(clipId, ctxTime, clipOffset = 0, register = true) {
        if (!this.engine.ctx) return null;
        const clip = this.audioClips.get(clipId);
        if (!clip || !clip.buffer) return null;
        this.normalizeClipState(clip);

        const duration = this.getClipPlayDuration(clip);
        if (duration <= 0) return null;
        clipOffset = Math.max(0, Math.min(clipOffset, duration));
        if (!Number.isFinite(ctxTime)) return null;

        const source = this.engine.ctx.createBufferSource();
        const clipGain = this.engine.ctx.createGain();
        source.buffer = clip.buffer;
        const trackNum = clip.track || 1;
        const entry = this.engine.trackGains.get(trackNum);

        // Build plugin chain for this track if needed
        this.rebuildTrackPluginChain(trackNum);
        const pluginChain = this.trackPluginChains.get(trackNum);

        if (pluginChain && pluginChain.input && pluginChain.output) {
            source.connect(clipGain);
            clipGain.connect(pluginChain.input);
            // v2.0.3 PDC: chain output -> track is wired once per chain build
            // through the track's delay-compensation node.
            if (!pluginChain.outputConnected) {
                if (entry && entry.pdcNode) pluginChain.output.connect(entry.pdcNode);
                else if (entry) pluginChain.output.connect(entry.node);
                else pluginChain.output.connect(this.engine.masterGain);
                pluginChain.outputConnected = true;
            }
        } else if (entry) {
            source.connect(clipGain);
            // v2.0.3 PDC: no-plugin path also runs through the compensation node.
            clipGain.connect(entry.pdcNode || entry.node);
        } else {
            source.connect(clipGain);
            clipGain.connect(this.engine.masterGain);
        }

        const startTime = ctxTime;
        const fadeIn = this.getClipFadeInDuration(clip);
        const fadeOut = this.getClipFadeOutDuration(clip);
        const playbackDuration = Math.max(0, duration - clipOffset);
        clipGain.gain.setValueAtTime(fadeIn > clipOffset ? Math.max(0, clipOffset / Math.max(0.0001, fadeIn)) : 1, startTime);
        if (fadeIn > clipOffset) {
            clipGain.gain.linearRampToValueAtTime(1, startTime + (fadeIn - clipOffset));
        }
        if (fadeOut > 0 && playbackDuration > 0) {
            const fadeOutStartOffset = Math.max(0, duration - fadeOut);
            if (clipOffset <= fadeOutStartOffset) {
                const fadeOutStartTime = startTime + (fadeOutStartOffset - clipOffset);
                clipGain.gain.setValueAtTime(1, fadeOutStartTime);
                clipGain.gain.linearRampToValueAtTime(0, startTime + playbackDuration);
            } else {
                const fadeProgress = (clipOffset - fadeOutStartOffset) / Math.max(0.0001, fadeOut);
                clipGain.gain.setValueAtTime(Math.max(0, 1 - fadeProgress), startTime);
                clipGain.gain.linearRampToValueAtTime(0, startTime + playbackDuration);
            }
        }
        source.start(startTime, this.getClipTrimStart(clip) + clipOffset, playbackDuration);

        if (register) {
            this.clipSources.set(clipId, source);
            source.onended = () => this.clipSources.delete(clipId);
        }
        return source;
    }

    /**
     * v2.0.3 seamless loop — lookahead scheduler.
     *
     * The old code stopped every source at the wrap point and restarted them
     * from the main thread (audible hiccup + timing slop). Now each loop
     * iteration is scheduled ahead on the audio clock; the tick only wraps
     * the displayed transport time. Loop boundaries are sample-accurate.
     */
    _loopBoundsSec() {
        const pps = 100;
        const start = (this.loopStart - 200) / pps;
        const end = (this.loopEnd - 200) / pps;
        return { start, end, dur: end - start };
    }

    _scheduleLoopAhead() {
        if (!this.engine || !this.engine.ctx || !this.isLooping) return;
        const ctx = this.engine.ctx;
        const { start, end, dur } = this._loopBoundsSec();
        if (!(dur > 0)) return;
        if (!Number.isFinite(this._loopNextCtxTime)) {
            // Next iteration begins when the playhead first reaches loop end.
            const anchorCtx = this._transportAnchorCtxTime;
            const anchorT = this._transportAnchorTime;
            if (Number.isFinite(anchorCtx) && anchorCtx >= 0 && Number.isFinite(anchorT)) {
                this._loopNextCtxTime = anchorCtx + (end - anchorT);
            } else {
                this._loopNextCtxTime = ctx.currentTime + 0.05;
            }
            if (this._loopNextCtxTime < ctx.currentTime) {
                this._loopNextCtxTime = ctx.currentTime + 0.05;
            }
        }
        const LOOKAHEAD_SEC = 0.30;
        let guard = 0;
        while (this._loopNextCtxTime < ctx.currentTime + LOOKAHEAD_SEC && guard++ < 16) {
            this._scheduleLoopIteration(this._loopNextCtxTime, start, end);
            this._loopNextCtxTime += dur;
        }
    }

    _scheduleLoopIteration(iterStartCtx, loopStartSec, loopEndSec) {
        const nowCtx = this.engine.ctx.currentTime;
        for (const [clipId, clip] of this.audioClips) {
            if (!this.shouldPlayClipOnTransport(clip)) continue;
            this.normalizeClipState(clip);
            const cs = clip.timelineStart || 0;
            const dur = this.getClipPlayDuration(clip);
            if (!(dur > 0)) continue;
            const os = Math.max(cs, loopStartSec);
            const oe = Math.min(cs + dur, loopEndSec);
            if (oe <= os) continue;
            const whenCtx = Math.max(iterStartCtx + (os - loopStartSec), nowCtx);
            const src = this._scheduleClipAtCtxTime(clipId, whenCtx, os - cs, false);
            if (src) {
                const entry = { src, whenCtx };
                src.onended = () => this._loopScheduledSources.delete(entry);
                this._loopScheduledSources.add(entry);
            }
        }
    }

    /** Stop loop-scheduled sources that have not started yet (loop toggled off). */
    _cancelFutureLoopSources() {
        if (!this.engine || !this.engine.ctx) {
            this._loopScheduledSources.clear();
            this._loopNextCtxTime = NaN;
            return;
        }
        const nowCtx = this.engine.ctx.currentTime;
        for (const entry of this._loopScheduledSources) {
            if (entry.whenCtx > nowCtx + 0.02) {
                try { entry.src.stop(); } catch (_) {}
                this._loopScheduledSources.delete(entry);
            }
        }
        this._loopNextCtxTime = NaN;
    }

    /** Stop ALL loop-scheduled sources (transport stop/pause). */
    _stopLoopScheduledSources() {
        for (const entry of this._loopScheduledSources) {
            try { entry.src.stop(); } catch (_) {}
        }
        this._loopScheduledSources.clear();
        this._loopNextCtxTime = NaN;
    }

    async stop(options = {}) {
        if (this.recordSession) {
            await this.finishRecordingPass({ continuePlayback: false, stopTime: this.currentTime });
        }
        this.updateTransportPlayState(false);
        this.currentTime = 0;
        this.updateTimeDisplay();
        clearInterval(this.playheadInterval);
        this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
        this.clipSources.clear();
        this._stopLoopScheduledSources(); // v2.0.3 seamless loop
        this.playbackTrackFilter = null;
        this.playbackTickHook = null;
        const playhead = document.getElementById('playhead'), rulerHead = document.getElementById('playheadRuler');
        if (playhead) { playhead.style.left = '200px'; playhead.classList.remove('moving'); }
        if (rulerHead) { rulerHead.style.left = '200px'; rulerHead.classList.remove('moving'); }
        this.applyAutomationStateAtTime(this.currentTime, { syncUi: true });
        if (!options.remote) this.broadcastTransportState('stop');
    }

    markError() {
        const time = this.currentTime;
        this.errors.push({ time, label: '', fixed: false });
        const idx = this.errors.length;
        const errorCount = document.getElementById('errorCount');
        if (errorCount) errorCount.textContent = idx ? `[${idx}]` : '';
        const btn = document.getElementById('markError');
        if (btn) { btn.style.color = 'var(--red)'; setTimeout(() => btn.style.color = '', 300); }
        this.addConsoleMessage('error', `Error #${idx} marked at ${this.formatTime(time)}`);
        this.renderErrors();
    }

    renderErrors() {
        const list = document.getElementById('errorsList');
        if (!list) return;
        if (this.errors.length === 0) {
            list.innerHTML = '<div style="color:var(--text-dim);font-size:12px;text-align:center;padding:20px">No errors marked yet</div>';
            return;
        }
        list.innerHTML = this.errors.map((err, i) => `
            <div class="error-entry" style="display:flex;align-items:center;gap:8px;padding:4px 6px;border-bottom:1px solid var(--border);font-size:12px;${err.fixed ? 'opacity:0.4;text-decoration:line-through' : ''}">
                <span style="color:var(--red);font-weight:600;min-width:28px">#${i + 1}</span>
                <span style="font-family:var(--mono);color:var(--text);min-width:80px">${this.formatTime(err.time)}</span>
                <input type="text" class="error-label" value="${err.label}" placeholder="Describe the issue..." style="flex:1;background:var(--bg-surface);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--text);font-size:11px" onchange="window.dispatchEvent(new CustomEvent('error-label-change', {detail:{index:${i},value:this.value}}))">
                <button class="error-fix-btn" style="background:none;border:1px solid var(--border);border-radius:4px;color:var(--green);cursor:pointer;padding:2px 8px;font-size:10px" onclick="window.dispatchEvent(new CustomEvent('error-toggle-fix', {detail:{index:${i}}}))">${err.fixed ? 'Fixed' : 'Fix'}</button>
            </div>
        `).join('');
    }

    addConsoleMessage(type, text) {
        const consolePanel = document.getElementById('consolePanel');
        if (!consolePanel) return;
        const msg = document.createElement('div');
        msg.className = 'console-message ' + type;
        msg.innerHTML = `<span class="console-time">[${new Date().toLocaleTimeString()}]</span> ${text}`;
        consolePanel.appendChild(msg); consolePanel.scrollTop = consolePanel.scrollHeight;
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = Math.floor(seconds % 60), f = Math.floor((seconds % 1) * 30);
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(f).padStart(2,'0')}`;
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        document.getElementById('loop').classList.toggle('active');
        // v2.0.3: turning the loop off cancels not-yet-started iterations;
        // turning it on re-arms the lookahead scheduler.
        if (!this.isLooping) this._cancelFutureLoopSources();
        else this._loopNextCtxTime = NaN;
        this.updateTransportSummaryUi();
        this.storeWorkingSessionSnapshot();
    }

    async rewind(options = {}) {
        if (this.recordSession) {
            await this.finishRecordingPass({ continuePlayback: false, stopTime: this.currentTime });
        }
        clearInterval(this.playheadInterval);
        this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
        this.clipSources.clear();
        this._stopLoopScheduledSources(); // v2.0.3 seamless loop
        this.currentTime = 0; this.updateTimeDisplay();
        this.playbackTrackFilter = null;
        this.playbackTickHook = null;
        const playhead = document.getElementById('playhead'), rulerHead = document.getElementById('playheadRuler');
        if (playhead) { playhead.style.left = '200px'; playhead.classList.remove('moving'); }
        if (rulerHead) { rulerHead.style.left = '200px'; rulerHead.classList.remove('moving'); }
        this.applyAutomationStateAtTime(this.currentTime, { syncUi: true });
        if (this.isPlaying) {
            this.startPlayback();
            if (playhead) playhead.classList.add('moving');
            if (rulerHead) rulerHead.classList.add('moving');
        }
        if (!options.remote) this.broadcastTransportState('rewind');
    }

    async record() {
        if (this.recordSession) {
            await this.finishRecordingPass({ continuePlayback: this.isPlaying, stopTime: this.currentTime });
            return;
        }

        const armedTrackIds = this.getArmedTrackIds();
        if (armedTrackIds.length === 0) {
            this.addConsoleMessage('warning', 'No tracks armed for recording. Click a track record-arm button first.');
            alert('No tracks armed for recording. Click a track record-arm button first.');
            return;
        }

        const punchWindow = this.getPunchWindow();
        if (punchWindow && this.currentTime >= punchWindow.end) {
            this.addConsoleMessage('warning', 'Move the playhead before Punch Out to start recording.');
            return;
        }

        try {
            await this.engine.ensureResumed();
            const armedTrackSet = new Set(armedTrackIds);
            document.querySelectorAll('.track-header').forEach((header) => {
                const trackId = parseInt(header.dataset.track || '0', 10);
                const monitorButton = header.querySelector('.monitor');
                if (armedTrackSet.has(trackId) && monitorButton && !monitorButton.classList.contains('active')) {
                    monitorButton.classList.add('active');
                    this.engine.setTrackMonitor(trackId, true);
                }
            });

            this.recordSession = {
                armedTrackIds,
                punchWindow,
                captureStartTime: this.currentTime,
                recordingStartTime: this.currentTime,
                recordingActive: false,
                startingRecording: false,
                monitorStates: armedTrackIds.map((trackId) => {
                    const header = document.querySelector(`.track-header[data-track="${trackId}"]`);
                    const monitorButton = header?.querySelector('.monitor');
                    return {
                        trackId,
                        wasActive: !!monitorButton?.classList.contains('active')
                    };
                })
            };

            if (this.isPlaying) {
                clearInterval(this.playheadInterval);
                this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
                this.clipSources.clear();
            } else {
                this.updateTransportPlayState(true);
            }

            const transportFilter = (clip) => !armedTrackSet.has(clip.track || 1);
            this.startPlayback({
                trackFilter: transportFilter,
                onTick: (time) => this.handleRecordingTransportTick(time)
            });

            if (punchWindow && this.currentTime < punchWindow.start) {
                this.setRecordingButtons(armedTrackIds, true);
                this.addConsoleMessage('info', `Playback rolling to Punch In at ${this.formatTime(punchWindow.start)}.`);
            } else {
                await this.beginRecordingPass(this.recordSession);
                this.addConsoleMessage('info', 'Recording started while unarmed tracks play back.');
            }

            this.autoArmVoxGenesisForRecording(armedTrackIds);
        } catch (e) {
            console.warn('Recording failed:', e);
            this.stopLiveWaveform(this.recordSession);
            this.recordSession = null;
            this.isRecording = false;
            this.setRecordingButtons(armedTrackIds, false);
            this.addConsoleMessage('error', e.message || 'Microphone access required for recording.');
        }
    }

    autoArmVoxGenesisForRecording(armedTrackIds) {
        const vgTrackId = armedTrackIds.find((trackId) => {
            const plugins = this.trackPlugins.get(trackId) || [];
            return plugins.some((p) => p.id === 'vox_genesis');
        });
        if (!vgTrackId) return;
        const vg = window.voxEngine;
        if (!vg) return;
        if (!this.engine.inputStream) return;
        vg.voxArmed = true;
        // v2.0.3: beginCapture is async (AudioWorklet module load).
        Promise.resolve(vg.beginCapture(this.engine.inputStream)).catch((err) => {
            this.addConsoleMessage('warning', `VoxGenesis capture failed: ${err && err.message}`);
        });
        if (!this.recordSession) this.recordSession = {};
        this.recordSession.voxGenesisArmed = true;
        this.addConsoleMessage('info', `VoxGenesis auto-armed on Track ${vgTrackId} â€” capturing voice print.`);
    }

    saveSession() {
        const session = this.buildWorkingSessionData();
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url;
        a.download = 'session.titan';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.storeWorkingSessionSnapshot();
    }

    loadSession(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const session = JSON.parse(ev.target.result);
                session.snapshotTimestamp = Date.now();
                this.lastSnapshotTimestamp = session.snapshotTimestamp;
                await this.applyWorkingSessionData(session);
                localStorage.setItem(TITAN_WORKING_SESSION_KEY, JSON.stringify(session));
                this.scheduleSnapshotBroadcast(session);
                this.storeWorkingSessionSnapshot();
                console.log('Session loaded:', file.name);
            } catch (err) {
                console.error('Failed to load session:', err);
                alert('Invalid session file.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    updateTimeDisplay() {
        const totalSeconds = Math.floor(this.currentTime), hours = Math.floor(totalSeconds / 3600), minutes = Math.floor((totalSeconds % 3600) / 60), seconds = totalSeconds % 60, frames = Math.floor((this.currentTime % 1) * 30);
        const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
        const timeDisplay = document.getElementById('currentTime');
        if (timeDisplay) timeDisplay.textContent = timeString;
    }

    startClock() {
        setInterval(() => {
            this.updateSystemMeters();
            this.updateAuraTelemetry();
        }, 1000);
    }

    updateSystemMeters() {
        const outputLevel = Math.max(0, Math.min(100, Math.round((((this.engine?.meters.left || 0) + (this.engine?.meters.right || 0)) / 2) * 100)));
        const inputLevel = Math.max(0, Math.min(100, Math.round((this.engine?.inputLevel || 0) * 100)));
        const outputMeter = /** @type {HTMLElement | null} */ (document.getElementById('outputMeterFill'));
        const inputMeter = /** @type {HTMLElement | null} */ (document.getElementById('inputMeterFill'));
        const latencyText = this.getLatencyTelemetryText();
        const latencyDisplay = document.getElementById('latencyDisplayValue');
        const engineLatencyValue = document.getElementById('engineLatencyValue');
        const engineActiveDspValue = document.getElementById('engineActiveDspValue');
        const engineTrackCountValue = document.getElementById('engineTrackCountValue');
        const engineMemoryValue = document.getElementById('engineMemoryValue');

        if (outputMeter) outputMeter.style.width = `${outputLevel}%`;
        if (inputMeter) inputMeter.style.width = `${inputLevel}%`;
        if (latencyDisplay) latencyDisplay.textContent = latencyText;
        if (engineLatencyValue) engineLatencyValue.textContent = latencyText;
        if (engineActiveDspValue) engineActiveDspValue.textContent = `${this.countActivePlugins()}`;
        if (engineTrackCountValue) engineTrackCountValue.textContent = `${document.querySelectorAll('.track-header').length}`;
        if (engineMemoryValue) engineMemoryValue.textContent = this.getMemoryTelemetryText();
        this.updateBusTelemetryUi();
    }

    populateBrowser() {
        const fileList = document.getElementById('browserAudioList');
        if (!fileList) return;
        if (this.audioClips.size === 0) {
            fileList.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:8px">No files in current project context</div>';
            return;
        }
        fileList.innerHTML = Array.from(this.audioClips.entries()).map(([id, clip]) => `
            <div class="browser-file" data-id="${id}">
                <i class="fas fa-music"></i>
                <span class="file-name">${clip.name}</span>
                <span class="file-meta">${this.getClipPlayDuration(clip) ? this.getClipPlayDuration(clip).toFixed(1) + 's' : 'Metadata Only'}</span>
            </div>
        `).join('');
    }

    updatePluginTrackSelector() {
        const select = document.getElementById('pluginTrackSelect');
        if (!select) return;
        const trackOptions = Array.from(document.querySelectorAll('.track-header')).map((t) => {
            const id = Number(t.dataset.track);
            const name = t.querySelector('.track-name-input')?.value || `Track ${id}`;
            return { value: `track:${id}`, label: name };
        });
        const busOptions = TITAN_BUS_OPTIONS
            .filter((bus) => bus.id !== 'master')
            .map((bus) => ({ value: `bus:${bus.id}`, label: `${bus.label} Return` }));
        select.innerHTML = `
            <optgroup label="Tracks">${trackOptions.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}</optgroup>
            <optgroup label="Bus Returns">${busOptions.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}</optgroup>
        `;
        const availableTrackIds = Array.from(document.querySelectorAll('.track-header'))
            .map((trackHeader) => Number(trackHeader.getAttribute('data-track')))
            .filter((trackId) => Number.isFinite(trackId) && trackId > 0);
        if (availableTrackIds.length === 0) {
            this.currentPluginTrack = 1;
            this.currentPluginTarget = { type: 'track', id: 1 };
            return;
        }
        if (this.currentPluginTarget?.type === 'track') {
            const targetTrackId = Number(this.currentPluginTarget.id);
            const nextTrackId = availableTrackIds.includes(targetTrackId) ? targetTrackId : availableTrackIds[0];
            this.currentPluginTrack = nextTrackId;
            this.currentPluginTarget = { type: 'track', id: nextTrackId };
        } else if (!this.busPlugins.has(this.currentPluginTarget?.id)) {
            this.currentPluginTarget = { type: 'track', id: availableTrackIds[0] };
            this.currentPluginTrack = availableTrackIds[0];
        }
        select.value = `${this.currentPluginTarget.type}:${this.currentPluginTarget.id}`;
    }

    renderPluginChain() {
        const container = document.getElementById('pluginChain');
        const emptyState = document.getElementById('pluginChainEmpty');
        const targetLabel = document.getElementById('pluginTargetLabel');
        if (!container) return;
        const chain = this.getPluginTargetChain();
        if (targetLabel) targetLabel.textContent = this.currentPluginTarget?.type === 'bus' ? 'Return Target' : 'Track';
        if (chain.length === 0) {
            container.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
                const detail = this.currentPluginTarget?.type === 'bus'
                    ? `No plugins on ${this.getPluginTargetLabel()}`
                    : 'No plugins on this track';
                emptyState.querySelector('.plugin-chain-empty-text')?.replaceChildren(document.createTextNode(detail));
            }
            return;
        }
        if (emptyState) emptyState.style.display = 'none';
        container.innerHTML = chain.map((p, idx) => `
            <div class="plugin-slot ${p.bypassed ? 'bypassed' : ''}" data-instance-id="${p.instanceId}" data-idx="${idx}">
                <div class="plugin-header" style="border-left: 3px solid ${p.color}">
                    <div class="plugin-name" style="border-left: none; padding-left: 0">
                        <i class="fas ${p.icon}"></i>
                        <span>${p.name}</span>
                    </div>
                    <div class="plugin-controls">
                        <button class="bypass-btn" data-action="bypass" data-idx="${idx}" title="Bypass"><i class="fas fa-power-off"></i></button>
                        <button class="edit-btn" data-action="edit" data-idx="${idx}" title="Edit"><i class="fas fa-pen"></i></button>
                    </div>
                </div>
                <div class="param-grid" style="padding:8px 10px">
                    ${p.params.map((param, pIdx) => `
                        <div class="param-control" data-param-idx="${pIdx}">
                            <label>${param.label}</label>
                            <input type="range" min="${param.min}" max="${param.max}" value="${param.val}" step="${param.step || 1}" data-param-idx="${pIdx}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Attach delegated listeners once
        if (!container.dataset.eventsBound) {
            container.addEventListener('click', (e) => {
                const btn = (/** @type {HTMLElement} */(e.target)).closest('button[data-action]');
                if (!btn) return;
                const idx = parseInt(btn.dataset.idx || '0');
                const action = btn.dataset.action;
                if (action === 'bypass') {
                    const chain = this.getPluginTargetChain();
                    const plugin = chain[idx];
                    if (plugin) {
                        plugin.bypassed = !plugin.bypassed;
                        this.renderPluginChain();
                        if (this.currentPluginTarget?.type === 'bus') {
                            this.rebuildBusPluginChain(this.currentPluginTarget.id);
                        } else {
                            this.rebuildTrackPluginChain(this.currentPluginTrack);
                        }
                        this.refreshMainUi();
                        this.storeWorkingSessionSnapshot();
                    }
                } else if (action === 'edit') {
                    this.openPluginEditor(this.currentPluginTarget, idx);
                }
            });
            container.addEventListener('input', (e) => {
                const target = (/** @type {HTMLInputElement} */(e.target));
                if (target.tagName !== 'INPUT' || target.type !== 'range') return;
                const slot = target.closest('.plugin-slot');
                if (!slot) return;
                const idx = parseInt(slot.dataset.idx || '0');
                const pIdx = parseInt(target.dataset.paramIdx || '0');
                const chain = this.getPluginTargetChain();
                const plugin = chain[idx];
                if (plugin && plugin.params[pIdx]) {
                    this.setPluginParamValue(this.currentPluginTarget, idx, pIdx, parseFloat(target.value));
                    this.refreshMainUi();
                    this.storeWorkingSessionSnapshot();
                }
            });
            container.dataset.eventsBound = 'true';
        }
    }

    showPluginCatalog() {
        const modal = document.getElementById('pluginCatalog');
        const body = document.getElementById('pluginCatalogBody');
        if (!modal || !body) return;

        const categories = {};
        PLUGIN_CATALOG.forEach(p => {
            if (!categories[p.category]) categories[p.category] = [];
            categories[p.category].push(p);
        });

        body.innerHTML = Object.keys(categories).map(category => `
            <div class="plugin-category" style="margin-bottom:20px">
                <h3 style="margin:0 0 10px;color:var(--text-secondary);font-size:12px;text-transform:uppercase;letter-spacing:1px">${category}</h3>
                <div class="plugin-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px">
                    ${categories[category].map(p => `
                        <div class="plugin-card" data-plugin-id="${p.id}" style="background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:12px;cursor:pointer;transition:border-color .2s">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                                <i class="fas ${p.icon}" style="color:${p.color}"></i>
                                <strong style="font-size:13px">${p.name}</strong>
                            </div>
                            <div style="font-size:11px;color:var(--text-dimmer);line-height:1.4">${p.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        body.querySelectorAll('.plugin-card').forEach(card => {
            card.addEventListener('click', () => {
                const pluginId = card.dataset.pluginId;
                this.addPluginToChain(pluginId);
                this.closePluginCatalog();
            });
        });

        modal.classList.add('active');
    }

    closePluginCatalog() {
        const modal = document.getElementById('pluginCatalog');
        if (modal) modal.classList.remove('active');
    }

    addPluginToChain(pluginId) {
        const chain = this.getPluginTargetChain();
        chain.push(this._createPluginInstance(pluginId));
        this.setPluginTargetChain(this.currentPluginTarget, chain);
        this.renderPluginChain();
        if (this.currentPluginTarget?.type === 'bus') {
            this.rebuildBusPluginChain(this.currentPluginTarget.id);
        } else {
            this.rebuildTrackPluginChain(this.currentPluginTrack);
        }
        this.refreshMainUi();
        this.storeWorkingSessionSnapshot();
    }

    rebuildTrackPluginChain(trackId) {
        const existing = this.trackPluginChains.get(trackId);
        if (existing) {
            existing.nodes.forEach(n => n.dispose());
            this.trackPluginChains.delete(trackId);
        }
        if (!this.engine.ctx) return;

        const chain = this.trackPlugins.get(trackId) || [];
        const activePlugins = chain.filter(p => !p.bypassed);
        if (activePlugins.length === 0) {
            this.trackPluginChains.set(trackId, null);
            this.refreshMainUi();
            return;
        }

        const ctx = this.engine.ctx;
        const nodes = [];
        let firstInput = null;
        let lastOutput = null;

        activePlugins.forEach(plugin => {
            const node = PluginProcessor.create(ctx, plugin);
            nodes.push(node);
            if (!firstInput) firstInput = node.input;
            if (lastOutput) lastOutput.connect(node.input);
            lastOutput = node.output;
        });

        this.trackPluginChains.set(trackId, {
            input: firstInput || lastOutput,
            output: lastOutput,
            nodes
        });
        this.refreshMainUi();
        this.updateDelayCompensation();
    }

    getTrackPluginChainInput(trackId) {
        this.rebuildTrackPluginChain(trackId);
        const chain = this.trackPluginChains.get(trackId);
        return chain ? chain.input : null;
    }

    getTrackPluginChainOutput(trackId) {
        this.rebuildTrackPluginChain(trackId);
        const chain = this.trackPluginChains.get(trackId);
        return chain ? chain.output : null;
    }

    rebuildBusPluginChain(busId) {
        const existing = this.busPluginChains.get(busId);
        if (existing) {
            existing.nodes.forEach((node) => node.dispose());
            this.busPluginChains.delete(busId);
        }
        if (!this.engine.ctx) return;
        const busEntry = this.engine.busGains.get(busId);
        if (!busEntry?.input || !busEntry?.node) return;
        try { busEntry.input.disconnect(); } catch (_) {}

        const chain = this.busPlugins.get(busId) || [];
        const activePlugins = chain.filter((plugin) => !plugin.bypassed);
        if (activePlugins.length === 0) {
            busEntry.input.connect(busEntry.node);
            this.busPluginChains.set(busId, null);
            this.refreshMainUi();
            return;
        }

        const ctx = this.engine.ctx;
        const nodes = [];
        let firstInput = null;
        let lastOutput = null;

        activePlugins.forEach((plugin) => {
            const node = PluginProcessor.create(ctx, plugin);
            nodes.push(node);
            if (!firstInput) firstInput = node.input;
            if (lastOutput) lastOutput.connect(node.input);
            lastOutput = node.output;
        });

        busEntry.input.connect(firstInput || busEntry.node);
        (lastOutput || firstInput).connect(busEntry.node);
        this.busPluginChains.set(busId, {
            input: firstInput || lastOutput,
            output: lastOutput || firstInput,
            nodes
        });
        this.refreshMainUi();
        this.updateDelayCompensation();
    }

    /**
     * v2.0.3 — Plugin Delay Compensation.
     *
     * Every plugin reports latencySamples (0 for biquads/gains/compressors/
     * convolvers; calibrated samples for oversampled WaveShapers). A track's
     * path latency = its plugin chain + its output bus's plugin chain. The
     * slowest track sets the reference; every other track is delayed by the
     * difference through its entry.pdcNode, so heavy sessions stay
     * sample-aligned.
     *
     * The master safety chain's latency is common to all tracks and needs no
     * per-track compensation, but it is included in the latency telemetry.
     *
     * Known limitation (documented, not silent): send/aux paths that route to
     * a bus other than the track's output bus are compensated for the main
     * path only. Full graph compensation is out of scope for v2.0.3.
     */
    updateDelayCompensation() {
        if (!this.engine || !this.engine.ctx) return;
        const sr = this.engine.ctx.sampleRate || 48000;
        const now = this.engine.ctx.currentTime;
        let maxLat = 0;
        const perTrack = new Map();
        for (const [trackId, entry] of this.engine.trackGains) {
            let lat = 0;
            const chain = this.trackPluginChains.get(trackId);
            if (chain && Array.isArray(chain.nodes)) {
                for (const n of chain.nodes) lat += n.latencySamples || 0;
            }
            const busId = entry?.outputBusId || 'master';
            if (busId !== 'master') {
                const busChain = this.busPluginChains.get(busId);
                if (busChain && Array.isArray(busChain.nodes)) {
                    for (const n of busChain.nodes) lat += n.latencySamples || 0;
                }
            }
            perTrack.set(trackId, lat);
            if (lat > maxLat) maxLat = lat;
        }
        for (const [trackId, lat] of perTrack) {
            const entry = this.engine.trackGains.get(trackId);
            if (entry && entry.pdcNode) {
                const delaySec = Math.max(0, (maxLat - lat) / sr);
                entry.pdcNode.delayTime.setValueAtTime(delaySec, now);
            }
        }
        this._pdcMaxLatencySamples = maxLat;
        this._pdcMasterLatencySamples = typeof this.engine.getMasterChainLatencySamples === 'function'
            ? this.engine.getMasterChainLatencySamples() : 0;
    }

    setPluginParamValue(targetRef, pluginIdx, paramIdx, value) {
        const target = typeof targetRef === 'object' ? targetRef : { type: 'track', id: targetRef };
        const chain = this.getPluginTargetChain(target);
        const plugin = chain[pluginIdx];
        if (!plugin || !plugin.params[paramIdx]) return false;

        const param = plugin.params[paramIdx];
        param.val = value;

        const chainEntry = target.type === 'bus'
            ? this.busPluginChains.get(target.id)
            : this.trackPluginChains.get(Number(target.id));
        const liveNode = chainEntry?.nodes?.[pluginIdx];
        if (liveNode && typeof liveNode.update === 'function') {
            liveNode.update(param.id, value);
        } else {
            if (target.type === 'bus') {
                this.rebuildBusPluginChain(target.id);
            } else {
                this.rebuildTrackPluginChain(Number(target.id));
            }
        }

        // Automation write ("push auto"): capture manual moves during playback
        if (this.automationWriteMode && this.playheadInterval && !this._autoReadActive) {
            try { this.recordPluginAutomationPoint(target, plugin.instanceId, param.id, value); }
            catch (err) { console.error('[Titan] automation write failed:', err); }
        }
        return true;
    }

    recordPluginAutomationPoint(targetRef, instanceId, paramId, value) {
        const target = typeof targetRef === 'object' ? targetRef : { type: 'track', id: Number(targetRef) || 1 };
        const state = this.getPluginAutomationState(target.type, Number(target.id) || 1, instanceId);
        if (!state) return;
        const points = state.params[paramId] || (state.params[paramId] = []);
        const time = Math.max(0, Math.round((this.currentTime || 0) * 1000) / 1000);
        const last = points[points.length - 1];
        if (last && time - last.time < 0.08) {
            last.value = value;
        } else {
            points.push({ time, value });
        }
    }

    toggleAutomationWrite(force) {
        const next = typeof force === 'boolean' ? force : !this.automationWriteMode;
        this.automationWriteMode = next;
        const btn = document.getElementById('autoWriteBtn');
        if (btn) btn.classList.toggle('active', next);
        this.addConsoleMessage(next ? 'warning' : 'info', next
            ? 'Automation WRITE armed — press Play and move any effect control to record its movement.'
            : 'Automation write off.');
        return next;
    }

    setPluginParamValueById(targetRef, pluginIdx, paramId, value) {
        const target = typeof targetRef === 'object' ? targetRef : { type: 'track', id: targetRef };
        const chain = this.getPluginTargetChain(target);
        const plugin = chain[pluginIdx];
        if (!plugin) return false;
        const paramIdx = plugin.params.findIndex((param) => param.id === paramId);
        if (paramIdx === -1) return false;
        return this.setPluginParamValue(target, pluginIdx, paramIdx, value);
    }

    /**
     * Update a plugin parameter from its native UI and reflect the change
     * in the live audio graph.
     */
    updatePluginParam(instanceId, control, value) {
        let plugin = null;
        let target = { type: 'track', id: 0 };
        let pluginIdx = -1;
        for (const [tid, chain] of this.trackPlugins) {
            const idx = chain.findIndex(p => p.instanceId === instanceId);
            if (idx !== -1) {
                plugin = chain[idx];
                target = { type: 'track', id: tid };
                pluginIdx = idx;
                break;
            }
        }
        if (!plugin) {
            for (const [busId, chain] of this.busPlugins) {
                const idx = chain.findIndex((p) => p.instanceId === instanceId);
                if (idx !== -1) {
                    plugin = chain[idx];
                    target = { type: 'bus', id: busId };
                    pluginIdx = idx;
                    break;
                }
            }
        }
        if (!plugin) return;

        const paramId = plugin.ui?.paramMap?.[control] || this._defaultParamMap(control, plugin);
        if (!paramId) return;
        if (!this.setPluginParamValueById(target, pluginIdx, paramId, value)) return;

        this.renderPluginChain();
        this.storeWorkingSessionSnapshot();
    }

    _defaultParamMap(control, plugin) {
        const map = {
            'driveamount': 'warmth',
            'proximityboost': 'proximity',
            'drywetmix': 'air',
            'roomsize': 'size',
            'decaytime': 'decay',
            'erdensity': 'damping',
            'modulationdepth': 'mix',
            'duckingamount': 'mix',
            'baseq': 'q',
            'threshold': 'threshold',
            'attackms': 'attack',
            'releasems': 'release',
            'dynamicqenable': 'depth',
            'band1threshold': 'threshold',
            'band2threshold': 'threshold',
            'band3threshold': 'threshold',
            'band4threshold': 'threshold',
            'band1ratio': 'ratio',
            'band2ratio': 'ratio',
            'band3ratio': 'ratio',
            'band4ratio': 'ratio',
            'subdivision': 'time',
            'feedbacklevel': 'feedback',
            'pingpong': 'mix',
            'wowflutterdepth': 'mod',
            'wowflutterrate': 'mod',
            'feedbackdistortion': 'drive',
            'drywetmix': 'mix',
            'vocallevel': 'mix',
            'deverberationamount': 'mix',
            'hysteresisdepth': 'depth',
            'sidechainhighpass': 'lowCut',
            'transientsensitivity': 'mid',
            'drive': 'drive',
            'preeq_lowshelf': 'tone',
            'posteq_tilt': 'tone',
            'wetdrymix': 'mix',
            'outputceiling': 'ceiling',
            'globalwidth': 'width',
            'lowcutfrequency': 'lowCut',
            'highshelfwidth': 'width',
            'midlevel': 'mid',
            'sidelevel': 'side',
            'detectionthreshold': 'bands',
            'maxanomalydurationms': 'spread',
            'inpaintingradius': 'shift',
            'inputgain': 'gain',
            'transformerdrive': 'drive',
            'summingheadroom': 'headroom',
            'outputgain': 'gain',
            'pitch': 'pitch',
            'formant': 'formant',
            'stretchratio': 'stretch',
            'grainsizems': 'grain',
            'transientlockstrength': 'stretch'
        };
        const key = control.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (map[key]) return map[key];
        const direct = plugin.params.find(p => p.id.toLowerCase() === key);
        if (direct) return direct.id;
        return null;
    }

    openPluginEditor(targetRef, idx) {
        const target = typeof targetRef === 'object' ? targetRef : { type: 'track', id: targetRef };
        const chain = this.getPluginTargetChain(target);
        const plugin = chain[idx];
        if (!plugin) return;

        const modal = document.getElementById('pluginEditor');
        const title = document.getElementById('pluginEditorTitle');
        const body = document.getElementById('pluginEditorBody');
        if (!modal || !title || !body) return;

        title.textContent = `${plugin.name} - ${this.getPluginTargetLabel(target)}`;
        title.style.borderLeft = `3px solid ${plugin.color}`;
        title.style.paddingLeft = '10px';

        const hasUi = !!plugin.ui && !!customElements.get(plugin.ui.tag);
        body.innerHTML = `
            <div class="plugin-editor" style="padding:10px 0">
                <div class="editor-section" style="margin-bottom:16px">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
                        <i class="fas ${plugin.icon}" style="color:${plugin.color};font-size:24px"></i>
                        <div>
                            <div style="font-weight:600">${plugin.name}</div>
                            <div style="font-size:12px;color:var(--text-dimmer)">${plugin.desc}</div>
                        </div>
                    </div>
                    ${hasUi ? `<div class="plugin-native-ui" style="height:360px;border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:16px;background:var(--bg-card)"></div>` : ''}
                    <div class="param-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">
                        ${plugin.params.map((param, pIdx) => `
                            <div class="param-control" data-param-idx="${pIdx}">
                                <label style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                                    <span>${param.label}</span>
                                    <span class="param-value">${param.val}</span>
                                </label>
                                <input type="range" min="${param.min}" max="${param.max}" value="${param.val}" step="${param.step || 1}" style="width:100%">
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="display:flex;justify-content:flex-end;gap:10px">
                    <button class="browser-btn remove-plugin-btn" style="background:var(--danger,#ef4444)"><i class="fas fa-trash"></i> Remove</button>
                    <button class="browser-btn close-editor-btn"><i class="fas fa-check"></i> Done</button>
                </div>
            </div>
        `;

        if (hasUi) {
            const uiContainer = body.querySelector('.plugin-native-ui');
            if (uiContainer) {
                const el = document.createElement(plugin.ui.tag);
                el.instanceId = plugin.instanceId;
                uiContainer.appendChild(el);
                if (target.type === 'track' && plugin.ui.tag === 'vox-genesis-ui') {
                    const trackClips = Array.from(this.audioClips.values()).filter(c => c.track === Number(target.id));
                    const buffer = trackClips.find(c => c.buffer)?.buffer;
                    if (buffer && typeof el.setAudioBuffer === 'function') {
                        el.setAudioBuffer(buffer);
                    }
                }
            }
        }

        body.querySelectorAll('.param-control input').forEach(input => {
            input.addEventListener('input', (e) => {
                const control = e.target.closest('.param-control');
                const pIdx = parseInt(control.dataset.paramIdx);
                const val = parseFloat(e.target.value);
                this.setPluginParamValue(target, idx, pIdx, val);
                control.querySelector('.param-value').textContent = val;
                this.renderPluginChain();
                this.refreshMainUi();
                this.storeWorkingSessionSnapshot();
            });
        });

        body.querySelector('.remove-plugin-btn')?.addEventListener('click', () => {
            chain.splice(idx, 1);
            this.setPluginTargetChain(target, chain);
            this.renderPluginChain();
            if (target.type === 'bus') {
                this.rebuildBusPluginChain(target.id);
            } else {
                this.rebuildTrackPluginChain(Number(target.id));
            }
            this.closePluginEditor();
            this.refreshMainUi();
            this.storeWorkingSessionSnapshot();
        });

        body.querySelector('.close-editor-btn')?.addEventListener('click', () => {
            this.closePluginEditor();
        });

        modal.classList.add('active');
    }

    closePluginEditor() {
        const modal = document.getElementById('pluginEditor');
        if (modal) modal.classList.remove('active');
    }

    toggleBypassAll() {
        const chain = this.getPluginTargetChain();
        const dynamicState = chain.some(p => !p.bypassed);
        chain.forEach(p => p.bypassed = dynamicState);
        this.renderPluginChain();
        if (this.currentPluginTarget?.type === 'bus') {
            this.rebuildBusPluginChain(this.currentPluginTarget.id);
        } else {
            this.rebuildTrackPluginChain(this.currentPluginTrack);
        }
        this.storeWorkingSessionSnapshot();
    }

    switchTab(panelId, event) {
        this.activePanelId = panelId || 'plugins';
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.panel-content').forEach(p => p.style.display = 'none');
        if (event) event.currentTarget.classList.add('active');
        else document.querySelector(`.tab-btn[data-panel="${this.activePanelId}"]`)?.classList.add('active');
        const targetPanel = document.getElementById(this.activePanelId + 'Panel');
        if (targetPanel) targetPanel.style.display = 'block';
        this.audioClips.forEach((clip, clipId) => {
            if (!document.querySelector(`.audio-clip[data-clip-id="${clipId}"]`)) {
                this.addClipToTimeline(clipId, clip.track || 1);
            }
        });
        this.refreshMainUi();
        if (event) this.storeWorkingSessionSnapshot();
    }

    updateFader(faderEl) {
        const val = parseFloat(faderEl.value) / 100;
        const trackId = parseInt(faderEl.closest('.track-header')?.dataset.track);
        if (trackId) {
            this.engine.setTrackVolume(trackId, val);
            this.refreshMainUi();
            this.storeWorkingSessionSnapshot();
        }
    }

    _trackColorForIndex(index) {
        const palette = ['#7c5cff', '#00d4ff', '#ff6b9d', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6'];
        return palette[(index - 1) % palette.length];
    }

    _colorForFile(fileName) {
        const ext = (fileName.split('.').pop() || '').toLowerCase();
        const map = {
            wav: '#00d4ff', mp3: '#7c5cff', ogg: '#22c55e', flac: '#f59e0b',
            aiff: '#ff6b9d', m4a: '#a855f7', aac: '#ef4444', webm: '#14b8a6', weba: '#14b8a6'
        };
        return map[ext] || this._trackColorForIndex(this.audioClips.size + 1);
    }

    _trackIsEmpty(trackId) {
        return !Array.from(this.audioClips.values()).some(c => c.track === trackId);
    }

    _nextAvailableTrack() {
        for (let id = 1; id <= 128; id++) {
            if (this._trackIsEmpty(id)) {
                console.log(`[import] Next available track: ${id}`);
                this.ensureTrackExists(id);
                return id;
            }
        }
        console.warn('[import] No available tracks found in range 1-128');
        return null;
    }

    ensureTrackExists(trackId) {
        if (!this.engine.trackGains.has(trackId)) {
            this.engine.createTrackGain(trackId);
        }
        if (!this.trackPlugins.has(trackId)) {
            this.trackPlugins.set(trackId, []);
        }
        if (!this.trackPluginChains.has(trackId)) {
            this.trackPluginChains.set(trackId, null);
        }
        if (!document.querySelector(`.track-header[data-track="${trackId}"]`)) {
            this.addTrack(trackId);
        }
    }

    setTrackName(trackId, name) {
        const header = document.querySelector(`.track-header[data-track="${trackId}"]`);
        if (!header) return;
        const input = header.querySelector('.track-name-input');
        if (input) {
            input.value = name;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    setTrackColor(trackId, color) {
        const header = document.querySelector(`.track-header[data-track="${trackId}"]`);
        if (header) {
            const indicator = header.querySelector('.track-color');
            if (indicator) indicator.style.setProperty('--track-color', color);
        }
        const lane = document.querySelector(`.track-lane[data-track="${trackId}"]`);
        if (lane) lane.style.setProperty('--track-color', color);
    }

    addTrack(trackId) {
        const list = document.getElementById('tracksList');
        let laneContainer = document.getElementById('lanesContainer');
        if (!laneContainer) { laneContainer = document.getElementById('arrangementView'); }
        if (!list || !laneContainer) return;
        const nextId = trackId || (list.children.length + 1);
        const color = this._trackColorForIndex(nextId);
        
        const header = document.createElement('div');
        header.className = 'track-header';
        header.dataset.track = nextId;
        header.innerHTML = `
            <div class="track-color" style="--track-color:${color}"></div>
            <div class="track-number">${String(nextId).padStart(2,'0')}</div>
            <div class="track-info">
                <input type="text" value="" class="track-name-input" placeholder="Track ${nextId}">
                <div class="track-meta-row">
                    <span class="track-type">Audio</span>
                    <span class="track-meta-pill" data-role="output">Stereo Out</span>
                    <span class="track-meta-pill" data-role="plugins">0 plugins</span>
                    <span class="track-meta-pill" data-role="clips">0 clips</span>
                </div>
            </div>
            <div class="track-controls">
                <button class="track-btn mute" aria-label="Mute"><i class="fas fa-volume-mute"></i></button>
                <button class="track-btn solo" aria-label="Solo"><i class="fas fa-headphones"></i></button>
                <button class="track-btn record-arm" aria-label="Record Arm"><i class="fas fa-circle"></i></button>
                <button class="track-btn monitor" aria-label="Monitor"><i class="fas fa-volume-up"></i></button>
                <button class="track-btn diagnose" aria-label="Diagnose waveform" title="Diagnose: paint problems on the waveform"><i class="fas fa-stethoscope"></i></button>
                <button class="track-btn delete-track" aria-label="Delete Track"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="track-fader-container">
                <input type="range" class="track-fader" min="0" max="100" value="75">
                <span class="fader-value">-2.4 dB</span>
            </div>
            <div class="track-meters">
                <div class="input-meter">
                    <div class="meter-segment"></div>
                    <div class="meter-segment"></div>
                    <div class="meter-segment"></div>
                </div>
            </div>
        `;
        list.appendChild(header);

        const lane = document.createElement('div');
        lane.className = 'track-lane';
        lane.dataset.track = nextId;
        laneContainer.appendChild(lane);

        if (!this.engine.trackGains.has(nextId)) {
            this.engine.createTrackGain(nextId);
        }
        if (!this.trackPlugins.has(nextId)) {
            this.trackPlugins.set(nextId, [this._createPluginInstance('vox_genesis')]);
        }
        if (!this.trackPluginChains.has(nextId)) {
            this.trackPluginChains.set(nextId, null);
        }
        this.rebuildTrackPluginChain(nextId);
        this.updatePluginTrackSelector();
        this.updateTrackSummaries();

        header.querySelector('.track-fader').addEventListener('input', (e) => this.updateFader(e.target));
        header.querySelector('.track-name-input').addEventListener('input', () => {
            this.updatePluginTrackSelector();
            this.refreshMainUi();
            this.storeWorkingSessionSnapshot();
        });
        header.addEventListener('click', (e) => {
            if ((/** @type {HTMLElement} */(e.target)).closest('button, input, select')) return;
            this.selectTrack(nextId, { syncPluginTrack: true, storeSnapshot: false });
        });
        header.addEventListener('dblclick', (e) => {
            if ((/** @type {HTMLElement} */(e.target)).closest('button, input, select')) return;
            this.selectTrack(nextId, { syncPluginTrack: true, storeSnapshot: false });
            this.openEditTab();
        });
        lane.addEventListener('click', (e) => {
            if ((/** @type {HTMLElement} */(e.target)).closest('.audio-clip')) return;
            this.selectTrack(nextId, { syncPluginTrack: true, storeSnapshot: false });
        });
        lane.addEventListener('dblclick', (e) => {
            if ((/** @type {HTMLElement} */(e.target)).closest('.audio-clip')) return;
            this.selectTrack(nextId, { syncPluginTrack: true, storeSnapshot: false });
            this.openEditTab();
        });
        
        header.querySelector('.mute').addEventListener('click', () => {
            header.querySelector('.mute').classList.toggle('active');
            this.engine.toggleMute(nextId);
            this.refreshMainUi();
            this.storeWorkingSessionSnapshot();
        });
        header.querySelector('.solo').addEventListener('click', () => {
            header.querySelector('.solo').classList.toggle('active');
            this.engine.toggleSolo(nextId);
            this.refreshMainUi();
            this.storeWorkingSessionSnapshot();
        });
        header.querySelector('.monitor').addEventListener('click', () => {
            const monBtn = header.querySelector('.monitor');
            monBtn.classList.toggle('active');
            this.engine.setTrackMonitor(nextId, monBtn.classList.contains('active'));
            this.refreshMainUi();
            this.storeWorkingSessionSnapshot();
        });
        header.querySelector('.record-arm').addEventListener('click', () => {
            if (this.recordSession) return;
            const armBtn = header.querySelector('.record-arm');
            armBtn.classList.toggle('active');
            this.refreshMainUi();
            this.storeWorkingSessionSnapshot();
        });
        header.querySelector('.delete-track').addEventListener('click', () => this.removeTrack(nextId));
        const diagBtn = header.querySelector('.track-btn.diagnose');
        if (diagBtn) {
            diagBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof WaveDiag !== 'undefined') WaveDiag.toggleTrack(this, nextId);
            });
        }
        this.selectTrack(nextId, { syncPluginTrack: true, storeSnapshot: false });
        this.storeWorkingSessionSnapshot();
        return nextId;
    }

    removeTrack(trackId, options = {}) {
        document.querySelector(`.track-header[data-track="${trackId}"]`)?.remove();
        document.querySelector(`.track-lane[data-track="${trackId}"]`)?.remove();
        this.audioClips.forEach((clip, clipId) => {
            if (clip.track === trackId) {
                this.clipSources.forEach((source) => { try { source.stop(); } catch (_e) {} });
                this.clipSources.delete(clipId);
                this.audioClips.delete(clipId);
                if (this.selectedClipId === clipId) this.selectedClipId = null;
                this.deletePersistedClipAsset(clipId).catch((err) => {
                    console.warn(`Failed to delete persisted clip asset for ${clipId}:`, err);
                });
            }
        });
        const trackGainEntry = this.engine.trackGains.get(trackId);
        if (trackGainEntry) {
            try { trackGainEntry.node.disconnect(); } catch (_) {}
            try { trackGainEntry.panner?.disconnect(); } catch (_) {}
            try { trackGainEntry.volumeNode?.disconnect(); } catch (_) {}
            trackGainEntry.sendGains?.forEach((sendGain) => {
                try { sendGain.disconnect(); } catch (_) {}
            });
        }
        const monitorGain = this.engine.monitorGains.get(trackId);
        if (monitorGain) {
            try { monitorGain.disconnect(); } catch (_) {}
        }
        this.engine.trackGains.delete(trackId);
        this.engine.monitorGains.delete(trackId);
        this.trackPlugins.delete(trackId);
        delete this.automationData.tracks[trackId];
        Object.keys(this.automationData.plugins).forEach((pluginKey) => {
            if (pluginKey.startsWith(`track:${trackId}:`)) delete this.automationData.plugins[pluginKey];
        });
        const chainEntry = this.trackPluginChains.get(trackId);
        if (chainEntry?.nodes) {
            chainEntry.nodes.forEach((node) => node.dispose());
        }
        this.trackPluginChains.delete(trackId);
        this.updatePluginTrackSelector();
        this.renderPluginChain();
        if (this.selectedTrackId === trackId || this.currentPluginTrack === trackId) {
            const fallbackTrackId = this.getSelectedTrackId();
            this.selectTrack(fallbackTrackId, { syncPluginTrack: true, storeSnapshot: false });
        } else {
            this.refreshMainUi();
        }
        if (options.storeSnapshot !== false) this.storeWorkingSessionSnapshot();
    }

    loadMetadataFromUI() {
        this.metadata.title = document.getElementById('metaTitle')?.value || '';
        this.metadata.artist = document.getElementById('metaArtist')?.value || '';
        this.metadata.album = document.getElementById('metaAlbum')?.value || '';
        this.metadata.genre = document.getElementById('metaGenre')?.value || '';
    }

    applyMetadataToUI() {
        const titleEl = document.getElementById('metaTitle');
        if (titleEl) titleEl.value = this.metadata.title;
        const artistEl = document.getElementById('metaArtist');
        if (artistEl) artistEl.value = this.metadata.artist;
        const albumEl = document.getElementById('metaAlbum');
        if (albumEl) albumEl.value = this.metadata.album;
        const genreEl = document.getElementById('metaGenre');
        if (genreEl) genreEl.value = this.metadata.genre;
    }

    fingerprintAllClips() {
        const clips = Array.from(this.audioClips.entries()).filter(([, clip]) => !!clip.buffer);
        if (clips.length === 0) {
            this._updateFingerprintUi('No decodable clips available for fingerprinting.');
            this.addConsoleMessage('warning', 'No decodable clips are available for fingerprinting.');
            return;
        }

        this.fingerprintDB.clear();
        clips.forEach(([clipId, clip]) => {
            const fingerprint = this._computeClipFingerprint(clip);
            if (fingerprint) {
                this.fingerprintDB.set(clipId, {
                    clipId,
                    name: clip.name,
                    track: clip.track || 1,
                    fingerprint
                });
            }
        });

        this._updateFingerprintUi(`Fingerprint scan complete for ${this.fingerprintDB.size} clips.`);
        this.addConsoleMessage('success', `Generated fingerprints for ${this.fingerprintDB.size} clips.`);
    }

    findDuplicateClips() {
        if (this.fingerprintDB.size === 0) {
            this.fingerprintAllClips();
        }
        const entries = Array.from(this.fingerprintDB.values());
        const matches = [];
        for (let i = 0; i < entries.length; i++) {
            for (let j = i + 1; j < entries.length; j++) {
                const score = this._fingerprintDistance(entries[i].fingerprint, entries[j].fingerprint);
                if (score <= 0.12) {
                    matches.push({
                        a: `${entries[i].name} (Track ${entries[i].track})`,
                        b: `${entries[j].name} (Track ${entries[j].track})`,
                        score
                    });
                }
            }
        }
        this._updateFingerprintUi(
            matches.length === 0
                ? 'No duplicate clips detected.'
                : `Found ${matches.length} duplicate or near-duplicate clip pair(s).`,
            matches
        );
        this.addConsoleMessage(matches.length === 0 ? 'info' : 'success', matches.length === 0
            ? 'No duplicate or near-duplicate clips detected.'
            : `Found ${matches.length} duplicate or near-duplicate clip pair(s).`);
    }

    _exportProgress(fraction, label) {
        const pct = Math.min(100, Math.max(0, Math.round(fraction * 100)));
        const btn = document.getElementById('btnExportMixdown');
        if (btn) btn.title = 'Export Mixdown \u2014 ' + label + ' ' + pct + '%';
        const bucket = Math.floor(pct / 10);
        if (bucket !== this._lastExportBucket) {
            this._lastExportBucket = bucket;
            this.addConsoleMessage('info', 'Encoding ' + label + ': ' + pct + '%');
        }
    }

    async exportMixdown() {
        try {
            const format = document.getElementById('exportFormat')?.value || 'wav';
            this.addConsoleMessage('info', 'Rendering offline mixdown...');
            const rendered = await this.renderMixdownBuffer();
            const sessionName = document.querySelector('.session-name')?.value?.trim() || this.metadata.title || 'Titan-7-Pro-Mixdown';
            const safeName = sessionName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-');
            if (format === 'mp3' || format === 'flac') {
                const enc = window.TitanExportEncoders;
                if (!enc) throw new Error('Export encoders did not load (vendor scripts missing).');
                const label = format === 'mp3' ? 'MP3 320kbps' : 'FLAC';
                this.addConsoleMessage('info', 'Encoding ' + label + '...');
                this._lastExportBucket = -1;
                const onProgress = (f) => this._exportProgress(f, label);
                const result = format === 'mp3'
                    ? await enc.encodeMp3(rendered, { bitrate: 320, onProgress })
                    : await enc.encodeFlac(rendered, { compression: 5, onProgress });
                const btn = document.getElementById('btnExportMixdown');
                if (btn) btn.title = 'Export Mixdown';
                this._downloadBlob(result.blob, safeName + '.' + result.ext);
                this.addConsoleMessage('success', 'Mixdown exported: ' + safeName + '.' + result.ext + ' (' + Math.round(result.size / 1024) + ' KB)');
            } else {
                const wavBuffer = this._audioBufferToWav(rendered);
                this._downloadBlob(new Blob([wavBuffer], { type: 'audio/wav' }), `${safeName}.wav`);
                this.addConsoleMessage('success', `Mixdown exported: ${safeName}.wav`);
            }
        } catch (err) {
            console.error('Mixdown export failed:', err);
            this.addConsoleMessage('error', 'Mixdown export failed: ' + (err.message || err));
        }
    }

    async browseAudioFolder() {
        if (window.titan?.audio?.readFolder) {
            try {
                const result = await window.titan.audio.selectFolder();
                if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                    const folderResult = await window.titan.audio.readFolder(result.filePaths[0]);
                    if (folderResult.error) {
                        this.addConsoleMessage('error', `Cannot read folder: ${folderResult.error}`);
                        return;
                    }
                    this.addConsoleMessage('info', `Found ${folderResult.files.length} audio files`);
                    // Populate browser with folder files
                    this.renderFolderContents(folderResult);
                }
            } catch (e) {
                this.addConsoleMessage('error', `Folder browse failed: ${e.message}`);
            }
        } else {
            this.fileInput?.click();
        }
    }

    renderFolderContents(folderResult) {
        // Render into #browserAudioList (the element that owns the delegated
        // click/dblclick listeners). Replacing .browser-tree wholesale used to
        // destroy that container, so imported folder files could not be
        // double-clicked to load.
        const listEl = document.getElementById('browserAudioList');
        if (!listEl) return;
        const files = Array.isArray(folderResult?.files) ? folderResult.files : [];
        const dirs = Array.isArray(folderResult?.dirs) ? folderResult.dirs : [];
        const escapeAttr = (value) => String(value ?? '')
            .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const escapeText = (value) => String(value ?? '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const fileNodes = files.map(f => 
            `<div class="browser-file" data-path="${escapeAttr(f.path)}"><i class="fas fa-music"></i> ${escapeText(f.name)}</div>`
        ).join('');
        const dirNodes = dirs.map(d => 
            `<div class="browser-directory" data-path="${escapeAttr(d.path)}"><i class="fas fa-folder"></i> ${escapeText(d.name)}</div>`
        ).join('');
        listEl.innerHTML = dirNodes + fileNodes;
    }
}

const THEMES = {
    default: { name: 'Titan Dark', '--bg-deep': '#0f0f12', '--bg-surface': '#16161c', '--bg-elevated': '#1f1f29', '--bg-card': '#252533', '--bg-hover': '#2d2d3d', '--border': '#2c2c3d', '--border-light': '#3f3f57', '--accent': '#7c5cff', '--accent-glow': 'rgba(124, 92, 255, 0.25)', '--cyan': '#00d4ff', '--cyan-glow': 'rgba(0, 212, 255, 0.2)', '--pink': '#ff6b9d', '--green': '#22c55e', '--orange': '#f59e0b', '--red': '#ef4444', '--text': '#f3f4f6', '--text-dim': '#9ca3af', '--text-dimmer': '#6b7280' },
    'red-trim': { name: 'Black Red White', '--bg-deep': '#000000', '--bg-surface': '#0a0a0a', '--bg-elevated': '#141414', '--bg-card': '#1a1a1a', '--bg-hover': '#242424', '--border': '#ef4444', '--border-light': '#ff6b6b', '--accent': '#ef4444', '--accent-glow': 'rgba(239, 68, 68, 0.3)', '--cyan': '#ffffff', '--cyan-glow': 'rgba(255, 255, 255, 0.3)', '--pink': '#ef4444', '--green': '#22c55e', '--orange': '#f59e0b', '--red': '#ef4444', '--text': '#ffffff', '--text-dim': '#e5e5e5', '--text-dimmer': '#b3b3b3' },
    cowboys: { name: 'Dallas Cowboys', '--bg-deep': '#081028', '--bg-surface': '#0c1838', '--bg-elevated': '#12204a', '--bg-card': '#182a5e', '--bg-hover': '#1e3470', '--border': '#1e3a8a', '--border-light': '#3b82f6', '--accent': '#c0c0c0', '--accent-glow': 'rgba(192, 192, 192, 0.3)', '--cyan': '#60a5fa', '--cyan-glow': 'rgba(96, 165, 250, 0.2)', '--pink': '#f472b6', '--green': '#22c55e', '--orange': '#f59e0b', '--red': '#ef4444', '--text': '#ffffff', '--text-dim': '#bfdbfe', '--text-dimmer': '#6b8fc7' },
    saints: { name: 'New Orleans Saints', '--bg-deep': '#0a0a0a', '--bg-surface': '#141414', '--bg-elevated': '#1f1f1f', '--bg-card': '#2a2a2a', '--bg-hover': '#353535', '--border': '#4a3b18', '--border-light': '#d4af37', '--accent': '#d4af37', '--accent-glow': 'rgba(212, 175, 55, 0.3)', '--cyan': '#f0e68c', '--cyan-glow': 'rgba(240, 230, 140, 0.2)', '--pink': '#d4af37', '--green': '#22c55e', '--orange': '#f59e0b', '--red': '#ef4444', '--text': '#ffffff', '--text-dim': '#e6d690', '--text-dimmer': '#8a7a4a' },
    longhorns: { name: 'Texas Longhorns', '--bg-deep': '#1a1a1a', '--bg-surface': '#2d2d2d', '--bg-elevated': '#3d3d3d', '--bg-card': '#4a4a4a', '--bg-hover': '#5c5c5c', '--border': '#bf5700', '--border-light': '#e66f12', '--accent': '#bf5700', '--accent-glow': 'rgba(191, 87, 0, 0.3)', '--cyan': '#ffffff', '--cyan-glow': 'rgba(255, 255, 255, 0.3)', '--pink': '#bf5700', '--green': '#22c55e', '--orange': '#f59e0b', '--red': '#ef4444', '--text': '#ffffff', '--text-dim': '#cccccc', '--text-dimmer': '#999999' }
};

function applyTheme(themeId) {
    const theme = THEMES[themeId]; if (!theme) return;
    const root = document.documentElement;
    Object.keys(theme).forEach(key => { if (key === 'name') return; root.style.setProperty(key, theme[key]); });
    localStorage.setItem('titanTheme', themeId);
}

function loadSavedTheme() {
    const saved = localStorage.getItem('titanTheme') || 'default';
    applyTheme(saved);
    const select = document.getElementById('themeSelect');
    if (select) select.value = saved;
}

window.closePluginCatalog = function() { window.dawApp?.closePluginCatalog(); };
window.closePluginEditor = function() { window.dawApp?.closePluginEditor(); };

// Surface every runtime failure in the in-app console panel so nothing dies silently
window.addEventListener('error', (event) => {
    try {
        const file = (event.filename || '').split(/[\\/]/).pop();
        window.dawApp?.addConsoleMessage?.('error', `Runtime error: ${event.message} (${file}:${event.lineno})`);
    } catch (_) { /* ignore */ }
});
window.addEventListener('unhandledrejection', (event) => {
    try {
        const reason = event.reason?.message || String(event.reason);
        window.dawApp?.addConsoleMessage?.('error', `Unhandled rejection: ${reason}`);
    } catch (_) { /* ignore */ }
});

// Instantiate engine entry hook inside document context window initialization
function initDaw() {
    window.dawApp = new TitanDAW();
    loadSavedTheme();
    consumePendingRDSLLoad();
}

// RDSL Studio handoff: rdsl.html stages a compiled manifest in localStorage
// under 'titan.rdsl.pendingLoad' and navigates here. Pick it up once the
// audio engine is ready and load it onto the selected track's plugin chain.
function consumePendingRDSLLoad() {
    let raw = null;
    try { raw = localStorage.getItem('titan.rdsl.pendingLoad'); } catch (_) { return; }
    if (!raw) return;
    try { localStorage.removeItem('titan.rdsl.pendingLoad'); } catch (_) {}
    let manifest = null;
    try { manifest = JSON.parse(raw).manifest; } catch (_) { return; }
    if (!manifest || !manifest.processor) return;
    const t0 = Date.now();
    (function waitForEngine() {
        const app = window.dawApp;
        if (app && app.engine && app.engine.ctx) {
            try {
                app.loadRDSLManifest(manifest);
            } catch (err) {
                app.addConsoleMessage('error', 'RDSL: load into session failed: ' + (err.message || err));
            }
            return;
        }
        if (Date.now() - t0 > 30000) return;
        setTimeout(waitForEngine, 250);
    })();
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initDaw);
} else {
    initDaw();
}


