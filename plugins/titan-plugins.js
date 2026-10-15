/* Titan 7 Pro - Standalone Plugin System
 * All plugins and effects from VoxGenesis to AURA.
 * Can be used standalone or integrated with the DAW.
 */

/* ---------- PLUGIN CATALOG ---------- */
const TITAN_PLUGIN_CATALOG = [
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
    { id:'deeproom', name:'Deep Room', icon:'fa-square', color:'#00d4ff', category:'Reverb',
      desc:'Deep convolution reverb with room simulation', params:[
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
      desc:'Microphone capsule modeling with immersive UI', processor:'aura_morph', retailPrice:149, ui:{ tag:'aura-morph-ui', file:'ui/AuraMorphUI.html', paramMap:{ 'driveAmount':'driveAmount', 'proximityBoost':'proximityBoost', 'dryWetMix':'dryWetMix' } }, params:[
        { id:'warmth', label:'Warmth', min:0, max:100, val:65 },
        { id:'presence', label:'Presence', min:0, max:100, val:45 },
        { id:'air', label:'Air', min:0, max:100, val:50 },
        { id:'proximity', label:'Proximity', min:0, max:100, val:50 },
        { id:'driveAmount', label:'Drive Amount', min:0, max:100, val:55 },
        { id:'proximityBoost', label:'Proximity Boost', min:0, max:100, val:50 },
        { id:'dryWetMix', label:'Dry/Wet Mix', min:0, max:100, val:60 }
      ]},
    { id:'deep_room_ui', name:'Deep Room Pro', icon:'fa-square', color:'#00d4ff', category:'Native UI',
      desc:'Algorithmic room reverb with 3D visualizer', processor:'deep_room_ui', retailPrice:199, ui:{ tag:'deep-room-ui', file:'ui/DeepRoomUI.html', paramMap:{ 'RoomSize':'size', 'DecayTime':'decay', 'ERDensity':'erDensity', 'ModulationDepth':'modulationDepth', 'DuckingAmount':'duckingAmount' } }, params:[
        { id:'size', label:'Room Size', min:0, max:100, val:60 },
        { id:'decay', label:'Decay', min:0.1, max:20, val:4.5, step:0.1 },
        { id:'damping', label:'Damping', min:0, max:100, val:40 },
        { id:'mix', label:'Mix', min:0, max:100, val:30 },
        { id:'erDensity', label:'ER Density', min:0, max:100, val:55 },
        { id:'modulationDepth', label:'Modulation Depth', min:0, max:100, val:28 },
        { id:'duckingAmount', label:'Ducking Amount', min:0, max:100, val:18 }
      ]},
    { id:'reso_kill_ui', name:'Resonance Killer Pro', icon:'fa-times-circle', color:'#ef4444', category:'Native UI',
      desc:'Surgical dynamic resonance suppression UI', processor:'reso_kill_ui', retailPrice:129, ui:{ tag:'reso-kill-ui', file:'ui/ResoKillUI.html', paramMap:{ 'BaseQ':'q', 'Threshold':'threshold', 'AttackMs':'attack', 'ReleaseMs':'release', 'DynamicQEnable':'depth' } }, params:[
        { id:'freq', label:'Center Freq', min:20, max:20000, val:500 },
        { id:'q', label:'Q Factor', min:1, max:50, val:10 },
        { id:'depth', label:'Depth', min:0, max:100, val:60 },
        { id:'sensitivity', label:'Sensitivity', min:0, max:100, val:50 },
        { id:'threshold', label:'Threshold', min:-60, max:0, val:-24 },
        { id:'attack', label:'Attack', min:0.1, max:100, val:8, step:0.1 },
        { id:'release', label:'Release', min:10, max:1000, val:140 }
      ]},
    { id:'dyna_shape', name:'DynaShape', icon:'fa-wave-square', color:'#4A90E2', category:'Native UI',
      desc:'Four-band dynamic shaping processor', processor:'dyna_shape', retailPrice:179, ui:{ tag:'dyna-shape-ui', file:'ui/DynaShapeUI.html', paramMap:{ 'Band1Threshold':'band1Threshold', 'Band2Threshold':'band2Threshold', 'Band3Threshold':'band3Threshold', 'Band4Threshold':'band4Threshold', 'Band1Ratio':'band1Ratio', 'Band2Ratio':'band2Ratio', 'Band3Ratio':'band3Ratio', 'Band4Ratio':'band4Ratio' } }, params:[
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
      desc:'Rhythmic tap delay with modulation', processor:'echo_weave', retailPrice:119, ui:{ tag:'echo-weave-ui', file:'ui/EchoWeaveUI.html', paramMap:{ 'Subdivision':'time', 'FeedbackLevel':'feedback', 'PingPong':'mix', 'WowFlutterDepth':'mod', 'WowFlutterRate':'mod', 'FeedbackDistortion':'drive', 'DryWetMix':'mix' } }, params:[
        { id:'time', label:'Time', min:1, max:1000, val:250 },
        { id:'feedback', label:'Feedback', min:0, max:100, val:40 },
        { id:'mix', label:'Mix', min:0, max:100, val:35 },
        { id:'mod', label:'Modulation', min:0, max:100, val:20 },
        { id:'drive', label:'Feedback Drive', min:0, max:100, val:15 }
      ]},
    { id:'flux_core', name:'FluxCore', icon:'fa-fire-alt', color:'#F5A623', category:'Native UI',
      desc:'Multiband saturation and ambience-reduction control surface', processor:'flux_core', retailPrice:199, ui:{ tag:'flux-core-ui', file:'ui/FluxCoreUI.html', paramMap:{ 'VocalLevel':'vocalLevel', 'DrumLevel':'drumLevel', 'BassLevel':'bassLevel', 'OtherLevel':'otherLevel', 'DeReverbAmount':'deReverbAmount' } }, params:[
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
      desc:'Advanced noise gate with transient preservation', processor:'halo_gate', retailPrice:99, ui:{ tag:'halo-gate-ui', file:'ui/HaloGateUI.html', paramMap:{ 'Threshold':'threshold', 'AttackMs':'attack', 'ReleaseMs':'release', 'HysteresisDepth':'depth', 'SidechainHighPass':'lowCut', 'TransientSensitivity':'mid' } }, params:[
        { id:'threshold', label:'Threshold', min:-80, max:0, val:-40 },
        { id:'attack', label:'Attack', min:0.1, max:100, val:5, step:0.1 },
        { id:'release', label:'Release', min:10, max:1000, val:150 },
        { id:'hold', label:'Hold', min:0, max:500, val:20 },
        { id:'depth', label:'Depth', min:0, max:100, val:70 },
        { id:'lowCut', label:'Sidechain HPF', min:20, max:2000, val:140 },
        { id:'mid', label:'Transient Focus', min:0, max:100, val:50 }
      ]},
    { id:'harmonic_lens', name:'HarmonicLens', icon:'fa-glasses', color:'#FF9500', category:'Native UI',
      desc:'Harmonic exciter with algorithm selector', processor:'harmonic_lens', retailPrice:129, ui:{ tag:'harmonic-lens-ui', file:'ui/HarmonicLensUI.html', paramMap:{ 'mode':'mode', 'Drive':'drive', 'PreEQ_LowShelf':'preEqLowShelf', 'PostEQ_Tilt':'postEqTilt', 'WetDryMix':'mix', 'OutputCeiling':'ceiling' } }, params:[
        { id:'drive', label:'Drive', min:0, max:100, val:35 },
        { id:'mode', label:'Mode', min:0, max:100, val:50 },
        { id:'preEqLowShelf', label:'Pre EQ Low Shelf', min:-12, max:12, val:1 },
        { id:'postEqTilt', label:'Post EQ Tilt', min:-12, max:12, val:0 },
        { id:'mix', label:'Mix', min:0, max:100, val:100 },
        { id:'ceiling', label:'Ceiling', min:-12, max:0, val:-1 }
      ]},
    { id:'phase_lock', name:'PhaseLock', icon:'fa-arrows-alt-h', color:'#7c5cff', category:'Native UI',
      desc:'Stereo width and phase correlation UI', processor:'phase_lock', retailPrice:99, ui:{ tag:'phase-lock-ui', file:'ui/PhaseLockUI.html', paramMap:{ 'GlobalWidth':'globalWidth', 'LowCutFrequency':'lowCut', 'HighShelfWidth':'highShelfWidth', 'MidLevel':'mid', 'SideLevel':'side' } }, params:[
        { id:'width', label:'Width', min:0, max:200, val:100 },
        { id:'globalWidth', label:'Global Width', min:0, max:200, val:100 },
        { id:'lowCut', label:'Mono Fold', min:20, max:500, val:120 },
        { id:'highShelfWidth', label:'High Shelf Width', min:0, max:200, val:110 },
        { id:'mid', label:'Mid Level', min:0, max:200, val:100 },
        { id:'side', label:'Side Level', min:0, max:200, val:100 }
      ]},
    { id:'spectra_fix', name:'SpectraFix', icon:'fa-magic', color:'#22d3ee', category:'Native UI',
      desc:'Spectral repair and click removal UI', processor:'spectra_fix', retailPrice:149, ui:{ tag:'spectra-fix-ui', file:'ui/SpectraFixUI.html', paramMap:{ 'DetectionThreshold':'detectionThreshold', 'MaxAnomalyDurationMs':'maxAnomalyDurationMs', 'InpaintingRadius':'inpaintingRadius', 'mix':'mix' } }, params:[
        { id:'detectionThreshold', label:'Detection Threshold', min:0, max:100, val:45 },
        { id:'maxAnomalyDurationMs', label:'Max Anomaly Duration', min:1, max:100, val:28 },
        { id:'inpaintingRadius', label:'Inpainting Radius', min:0, max:100, val:32 },
        { id:'mix', label:'Mix', min:0, max:100, val:60 }
      ]},
    { id:'velvet_bus', name:'VelvetBus', icon:'fa-bus', color:'#EAEAEA', category:'Native UI',
      desc:'Vintage console bus glue processor', processor:'velvet_bus', retailPrice:129, ui:{ tag:'velvet-bus-ui', file:'ui/VelvetBusUI.html', paramMap:{ 'InputGain':'inputGain', 'TransformerDrive':'transformerDrive', 'SummingHeadroom':'summingHeadroom', 'OutputGain':'outputGain' } }, params:[
        { id:'inputGain', label:'Input Gain', min:-12, max:12, val:0 },
        { id:'transformerDrive', label:'Transformer Drive', min:0, max:100, val:45 },
        { id:'summingHeadroom', label:'Headroom', min:-12, max:12, val:0 },
        { id:'outputGain', label:'Output Gain', min:-12, max:12, val:0 },
        { id:'mix', label:'Mix', min:0, max:100, val:100 }
      ]},
    { id:'chrono_shift', name:'ChronoShift', icon:'fa-history', color:'#06b6d4', category:'Native UI',
      desc:'Pitch and time manipulation workspace', processor:'chrono_shift', retailPrice:199, ui:{ tag:'chrono-shift-ui', file:'ui/ChronoShiftUI.html', paramMap:{ 'mode':'pitch', 'GrainSizeMs':'grain', 'TransientLockStrength':'stretch' } }, params:[
        { id:'pitch', label:'Pitch', min:-24, max:24, val:0 },
        { id:'formant', label:'Formant', min:-12, max:12, val:0 },
        { id:'stretch', label:'Stretch', min:0.5, max:2, val:1, step:0.01 },
        { id:'grain', label:'Grain Size', min:1, max:100, val:40 }
      ]},
    { id:'cockpit', name:'Cockpit', icon:'fa-sliders-h', color:'#00E5FF', category:'Native UI',
      desc:'Session command center', processor:'cockpit', retailPrice:249, ui:{ tag:'cockpit-ui', file:'ui/CockpitUI.html', paramMap:{} }, params:[
        { id:'param1', label:'Parameter 1', min:0, max:100, val:50 }
      ]},
    { id:'vox_genesis', name:'VoxGenesis', icon:'fa-microphone', color:'#ff6b9d', category:'Native UI',
      desc:'Local vocal processor with live/audio voice-print capture and a real singing-model adapter path', processor:'vox_genesis', retailPrice:299, ui:{ tag:'vox-genesis-ui', file:'ui/VoxGenesisUI.html', paramMap:{ 'texture':'param1', 'formant':'param2', 'focus':'param3', 'naturalness':'param4', 'tightness':'param5', 'sibilance':'param6' } }, params:[
        { id:'param1', label:'Texture', min:0, max:100, val:50 },
        { id:'param2', label:'Formant', min:0, max:100, val:50 },
        { id:'param3', label:'Focus', min:0, max:100, val:55 },
        { id:'param4', label:'Natural', min:0, max:100, val:65 },
        { id:'param5', label:'Tightness', min:0, max:100, val:50 },
        { id:'param6', label:'Sibilance', min:0, max:100, val:50 }
      ]}
];

/* ---------- PLUGIN PROCESSOR (DSP Engine) ---------- */
const TitanPluginProcessor = {
    create(ctx, plugin) {
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
        for (const id of ids) { if (params[id] !== undefined) return params[id]; }
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
        const updateMix = (mix) => { dryGain.gain.value = 1 - mix; wetGain.gain.value = mix; };
        updateMix(wetAmount01);
        return { input, output, updateMix, dryGain, wetGain };
    },

    _waveShaperCurve(amount, type) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const a = Math.max(0, Math.min(1, amount));
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            let y = 0;
            if (type === 'extreme') {
                const bitDepth = Math.max(1, 16 - a * 14);
                const steps = Math.pow(2, bitDepth);
                y = Math.round(x * steps) / steps;
                y = Math.tanh(y * (1 + a * 8));
            } else if (type === 'warm') {
                const k = 1 + a * 4;
                y = Math.tanh(x * k) / Math.tanh(k);
            } else if (type === 'tape') {
                const k = 1 + a * 3;
                y = (2 / Math.PI) * Math.atan(x * k);
            } else if (type === 'lofi') {
                const bits = Math.max(2, 16 - a * 12);
                const steps = Math.pow(2, bits);
                y = Math.round(x * steps) / steps;
            } else {
                // Unknown/legacy type (e.g. 'bright'). A zero-initialized
                // curve would MUTE the wet path entirely, so fall back to a
                // mild, bright-ish soft clip instead.
                const k = 1 + a * 2.5;
                y = Math.tanh(x * k) / Math.tanh(k);
            }
            curve[i] = y;
        }
        return curve;
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
        const self = this;
        return {
            input, output,
            update(paramId, value) {
                let newDrive = drive;
                let newChaos = chaos;
                if (paramId === 'drive') newDrive = value / 100;
                if (paramId === 'chaos') newChaos = value / 100;
                // NOTE: `this` inside update() is the plugin object, not the
                // factory — calling this._waveShaperCurve here threw a
                // TypeError on every drive/chaos change.
                shaper.curve = self._waveShaperCurve(0.3 + newDrive * 0.7 + newChaos, 'extreme');
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
        const self = this;
        return {
            input: dryWet.input, output: toneFilter,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                if (paramId === 'drive' || paramId === 'harmonics') {
                    shaper.curve = self._waveShaperCurve((state.drive / 100) * (0.5 + (state.harmonics / 100) * 0.5), type);
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
        const self = this;
        return {
            input, output,
            update(paramId, value) {
                if (paramId === 'drive') shaper.curve = self._waveShaperCurve((value / 100) * 0.8, 'warm');
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
        const self = this;
        return {
            input, output,
            update(paramId, value) {
                if (state[paramId] !== undefined) state[paramId] = value;
                if (paramId === 'drive') {
                    shaper.curve = self._waveShaperCurve((state.drive / 100) * 0.6, 'tape');
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
/* ---------- TITAN PLUGINS NAMESPACE ---------- */
window.TitanPlugins = {
    catalog: TITAN_PLUGIN_CATALOG,
    processor: TitanPluginProcessor,

    getPlugin(id) {
        return TITAN_PLUGIN_CATALOG.find(p => p.id === id) || null;
    },

    getAllCategories() {
        const cats = new Set();
        TITAN_PLUGIN_CATALOG.forEach(p => cats.add(p.category));
        return Array.from(cats);
    },

    getPluginsByCategory(category) {
        return TITAN_PLUGIN_CATALOG.filter(p => p.category === category);
    },

    /** Create a plugin processor node chain */
    createProcessor(ctx, pluginOrId, paramOverrides) {
        const plugin = typeof pluginOrId === 'string' ? this.getPlugin(pluginOrId) : pluginOrId;
        if (!plugin) throw new Error(`Plugin not found: ${pluginOrId}`);
        // paramOverrides (a { paramId: value } map) used to be silently
        // dropped; apply them on top of the catalog defaults.
        const overrides = (paramOverrides && typeof paramOverrides === 'object') ? paramOverrides : {};
        const params = (plugin.params || []).map(p => ({
            ...p,
            val: Object.prototype.hasOwnProperty.call(overrides, p.id) ? overrides[p.id] : p.val
        }));
        return TitanPluginProcessor.create(ctx, { ...plugin, params });
    },

    /** Load and register a UI custom element from an HTML file.
     *  Native UIs may define their own class and call customElements.define().
     *  The loader executes any scripts in the HTML so those classes register.
     *  If no class is registered, a generic PluginElement fallback is used.
     */
    _uiBase: null,
    _resolveUIPath(htmlFile) {
        const scripts = document.currentScript || document.querySelector('script[src*="titan-plugins"]');
        let base;
        if (scripts && scripts.src) {
            base = scripts.src.substring(0, scripts.src.lastIndexOf('/'));
        } else {
            base = window.location.origin;
        }
        base = base.replace(/\/$/, '');
        return base + '/' + htmlFile;
    },
    _getUIPath(htmlFile) {
        if (this._uiBase) return this._uiBase + '/' + htmlFile;
        // _resolveUIPath('') leaves a trailing slash, which would make this
        // produce a malformed "base//file" URL — strip it here.
        this._uiBase = this._resolveUIPath('').replace(/\/+$/, '');
        return this._uiBase + '/' + htmlFile;
    },
    async _ensureUIUtils() {
        if (window.TitanUIUtils) return;
        const utilPath = this._getUIPath('titan-ui-utils.js');
        try {
            const resp = await fetch(utilPath);
            if (!resp.ok) throw new Error(resp.status + ' ' + resp.statusText);
            const code = await resp.text();
            new Function(code)();
        } catch (e) {
            console.warn('Failed to load TitanUIUtils, providing fallback:', e);
            window.TitanUIUtils = {
                clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
                lerp: (a, b, t) => a + (b - a) * t,
                map01: (v, min, max) => Math.max(0, Math.min(1, (v - min) / (max - min))),
                formatHz: (hz) => hz >= 1000 ? (hz / 1000).toFixed(1) + 'k' : Math.round(hz) + '',
                easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
                fitCanvas: (canvas) => {},
                getCanvasCtx: (root, id) => null,
                bindDrag: () => {},
                clientX: (e) => e.clientX ?? 0,
                clientY: (e) => e.clientY ?? 0,
                dispatchParamChange: (host, paramId, value) => host.dispatchEvent(new CustomEvent('titan-param-change', { detail: { paramId, value }, bubbles: true, composed: true })),
                observeResize: () => null
            };
        }
    },
    async loadUI(tagName, htmlFile) {
        if (customElements.get(tagName)) return;
        try {
            await this._ensureUIUtils();
            let html;
            if (window.titan && window.titan.ui && window.titan.ui.loadPluginHtml) {
                html = await window.titan.ui.loadPluginHtml(htmlFile);
            } else {
                const resp = await fetch(this._getUIPath(htmlFile));
                html = await resp.text();
            }
            const template = document.createElement('template');
            template.innerHTML = html;

            // If the native UI is authored as <template id="tag-name">, insert it
            // into the main document so its content can be found by getElementById.
            const declaredTemplate = template.content.querySelector('template[id]');
            if (declaredTemplate) {
                document.body.appendChild(declaredTemplate);
            }

            // Execute any scripts in the fetched HTML so bespoke classes register.
            // Inline scripts execute synchronously; external scripts are awaited.
            const scripts = Array.from(template.content.querySelectorAll('script'));
            const external = [];
            scripts.forEach(script => {
                if (script.src) {
                    const s = document.createElement('script');
                    s.src = script.src;
                    s.async = false;
                    external.push(new Promise((resolve) => {
                        s.onload = resolve;
                        s.onerror = resolve;
                        document.head.appendChild(s);
                    }));
                } else {
                    try {
                        const fn = new Function(script.textContent);
                        fn();
                    } catch (err) {
                        console.error(`Native UI script error in ${htmlFile}:`, err);
                    }
                }
            });
            if (external.length) await Promise.all(external);

            // If a native class registered itself, use it.
            if (customElements.get(tagName)) return;

            // Fallback generic class for simple UIs.
            class PluginElement extends HTMLElement {
                constructor() {
                    super();
                    this._params = {};
                    this._onChange = null;
                    const shadow = this.attachShadow({ mode: 'open' });
                    shadow.appendChild(template.content.cloneNode(true));
                }
                connectedCallback() { this._bindUI(); }
                _bindUI() {
                    const root = this.shadowRoot || this;
                    root.querySelectorAll('[data-param]').forEach(el => {
                        const paramId = el.dataset.param;
                        if (el.tagName.toLowerCase() === 'input' && el.type === 'range') {
                            el.addEventListener('input', () => {
                                const val = parseFloat(el.value);
                                if (isNaN(val)) return;
                                this.dispatchEvent(new CustomEvent('titan-param-change', {
                                    detail: { paramId, value: val }, bubbles: true, composed: true
                                }));
                                if (this._onChange) this._onChange(paramId, val);
                            });
                        }
                    });
                }
                setParams(params) { this._params = { ...params }; }
                setParam(paramId, value) {
                    this._params[paramId] = value;
                    const root = this.shadowRoot || this;
                    const el = root.querySelector(`[data-param="${paramId}"]`);
                    if (el && el.value !== undefined) el.value = value;
                }
                set onChange(fn) { this._onChange = fn; }
            }
            customElements.define(tagName, PluginElement);
        } catch (e) {
            console.error(`Failed to load plugin UI: ${htmlFile}`, e);
        }
    },

    /** Load all native plugin UIs in parallel. */
    loadAllUIs() {
        const natives = TITAN_PLUGIN_CATALOG.filter(p => p.ui && p.ui.tag && p.ui.file);
        return Promise.all(natives.map(p => this.loadUI(p.ui.tag, p.ui.file)));
    },

    /** Create a demo instance (for standalone use) */
    createDemoInstance(ctx, pluginId, destination) {
        const plugin = this.getPlugin(pluginId);
        if (!plugin) throw new Error(`Plugin not found: ${pluginId}`);
        const chain = TitanPluginProcessor.create(ctx, plugin);
        if (destination) chain.output.connect(destination);
        return chain;
    }
};
