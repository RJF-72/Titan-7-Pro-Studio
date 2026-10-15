/* ============================================================================
 * rdsl-loader.js — RDSL manifest → Titan plugin-chain loader
 * ----------------------------------------------------------------------------
 * Bridges the RDSL Studio (rdsl.html) and the DAW session (index.html).
 *
 *   compileToPluginDefs(manifest, catalog) -> { defs, warnings }
 *
 * Maps a compiled RDSL manifest (see RDSLCompiler.compile) onto REAL Titan
 * DSP builders — the same `PluginProcessor.create(ctx, plugin)` factory keys
 * the DAW uses for its own track chains. No new DSP is invented here: every
 * def key is a factory key that already exists in app.js (`PluginProcessor`)
 * and plugins/titan-plugins.js (`TitanPluginProcessor`).
 *
 * Honesty rules (no fake plugins):
 *  - RDSL types with a real DSP backend map to it (see TYPE_MAP).
 *  - RDSL types with NO backend (MODULATION phaser/chorus, SYNTHESIZER,
 *    ANALYZER) load as an honest passthrough ('custom' -> gain) and ALWAYS
 *    produce a warning naming the type. They are never presented as working
 *    effects.
 *  - RDSL params with no counterpart on the target (e.g. EQ band
 *    frequencies on the fixed-band Console-Style 32 model, reverb `diffusion`)
 *    are dropped and reported in `warnings`, never silently.
 *  - `gpu: enabled` in a manifest is informational only. All Titan DSP runs
 *    on the CPU; the loader records the request in the def (`gpuRequested`)
 *    and warns that it was not honored, rather than pretending otherwise.
 *
 * Chain types: VOCAL_PROCESSOR carries `processor.chain: [deesser,
 * compressor, eq, saturator]`. Each stage is expanded to its own def;
 * `deesser` has no backend and is skipped with a warning. Stage params use
 * prefixes (`compressor_ratio`, `eq_high`, `saturator_drive`) which are
 * stripped before alias lookup.
 *
 * `catalog` (optional) is an array of { id, params: [{ id, min, max }] }
 * used to clamp mapped values into the real knob ranges. In index.html the
 * caller passes PLUGIN_CATALOG; in rdsl.html (preview) it is omitted.
 * ========================================================================== */
(function () {
    'use strict';

    // RDSL type -> { target factory key, param alias map }.
    // A null alias value means "known RDSL param, no counterpart": dropped
    // with a warning instead of being silently ignored.
    var TYPE_MAP = {
        COMPRESSOR: {
            target: 'compressor',
            params: {
                ratio: 'ratio', threshold: 'threshold', attack: 'attack',
                release: 'release', knee: 'knee',
                makeup_gain: 'makeup', makeup: 'makeup'
            }
        },
        EQUALIZER: {
            target: 'eq',
            // The Console-Style 32 model has four fixed bands; only gains map.
            params: {
                low_gain: 'low', low: 'low',
                low_mid_gain: 'lowMid', lowmid_gain: 'lowMid',
                high_mid_gain: 'highMid', highmid_gain: 'highMid',
                high_gain: 'high', high: 'high',
                low_freq: null, lowmid_freq: null, highmid_freq: null,
                high_freq: null, low_mid_freq: null, high_mid_freq: null,
                q: null, bands: null
            }
        },
        REVERB: {
            target: 'deeproom',
            params: {
                size: 'size', decay: 'decay', damping: 'damping', mix: 'mix',
                diffusion: null, pre_delay: null, predelay: null, er_density: null
            }
        },
        DELAY: {
            target: 'delay',
            params: {
                delay_time: 'time', time: 'time', feedback: 'feedback',
                mix: 'mix', mod: 'mod', pingpong: null, ping_pong: null
            }
        },
        SATURATOR: {
            target: 'neuralheat',
            params: {
                drive: 'drive', tone: 'tone', harmonics: 'harmonics',
                saturation: 'harmonics', mix: 'mix',
                model: null, character: null
            }
        },
        NOISE_GATE: {
            target: 'gate',
            params: {
                threshold: 'threshold', attack: 'attack', release: 'release',
                hold: 'hold', range: null, hysteresis: null
            }
        },
        MASTERING_CHAIN: {
            target: 'master',
            params: {
                ceiling: 'ceiling', threshold: 'threshold', release: 'release',
                dither: null, loudness_target: null, true_peak: null
            }
        },
        VOCAL_PROCESSOR: { chain: true },
        MODULATION: { passthrough: true },
        SYNTHESIZER: { passthrough: true },
        ANALYZER: { passthrough: true },
        CUSTOM_PROCESSOR: { target: 'custom', params: {} }
    };

    // Stage name -> RDSL type for VOCAL_PROCESSOR chain expansion.
    var CHAIN_STAGE_TYPES = {
        deesser: null, // no DSP backend: skipped with a warning
        compressor: 'COMPRESSOR',
        eq: 'EQUALIZER',
        saturator: 'SATURATOR'
    };

    // Factory keys this loader can ever emit. Used by tests to prove every
    // def instantiates against the real PluginProcessor.
    var SUPPORTED_FACTORY_KEYS = [
        'compressor', 'eq', 'deeproom', 'delay',
        'neuralheat', 'gate', 'master', 'custom'
    ];

    function clampToRange(value, min, max) {
        if (typeof min === 'number' && value < min) return min;
        if (typeof max === 'number' && value > max) return max;
        return value;
    }

    function findCatalogParam(catalog, targetKey, paramId) {
        if (!Array.isArray(catalog)) return null;
        var entry = null;
        for (var i = 0; i < catalog.length; i++) {
            if (catalog[i] && catalog[i].id === targetKey) { entry = catalog[i]; break; }
        }
        if (!entry || !Array.isArray(entry.params)) return null;
        for (var j = 0; j < entry.params.length; j++) {
            if (entry.params[j] && entry.params[j].id === paramId) return entry.params[j];
        }
        return null;
    }

    function isFiniteNumber(v) {
        return typeof v === 'number' && isFinite(v);
    }

    // Map one RDSL processor (type + raw params) to a single plugin def.
    function mapSingle(type, rawParams, name, warnings, catalog, prefix) {
        var mapping = TYPE_MAP[type];
        if (!mapping) {
            warnings.push('Unknown RDSL type "' + type + '" — loaded as passthrough.');
            return makePassthrough(type, name, rawParams, warnings);
        }
        if (mapping.passthrough) {
            return makePassthrough(type, name, rawParams, warnings);
        }
        var target = mapping.target;
        var alias = mapping.params || {};
        var params = [];
        var dropped = [];
        Object.keys(rawParams || {}).forEach(function (rawKey) {
            var key = rawKey;
            if (prefix && key.indexOf(prefix) === 0) key = key.slice(prefix.length);
            key = key.toLowerCase();
            if (!(key in alias)) {
                dropped.push(rawKey);
                return;
            }
            var targetId = alias[key];
            if (!targetId) {
                dropped.push(rawKey);
                return;
            }
            var value = rawParams[rawKey];
            if (!isFiniteNumber(value)) {
                dropped.push(rawKey + ' (non-numeric)');
                return;
            }
            var catParam = findCatalogParam(catalog, target, targetId);
            var clamped = catParam
                ? clampToRange(value, catParam.min, catParam.max)
                : value;
            params.push({ id: targetId, val: Math.round(clamped * 100) / 100 });
        });
        if (dropped.length) {
            warnings.push(
                type + ' → ' + target + ': ' + dropped.length +
                ' parameter(s) have no counterpart and were dropped (' +
                dropped.slice(0, 4).join(', ') + (dropped.length > 4 ? ', …' : '') + ').'
            );
        }
        return {
            key: target,
            name: name || target,
            rdslType: type,
            passthrough: false,
            params: params,
            gpuRequested: false
        };
    }

    function makePassthrough(type, name, rawParams, warnings) {
        var label = (TYPE_MAP[type] && TYPE_MAP[type].passthrough === true)
            ? type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ')
            : type;
        warnings.push(
            'RDSL type "' + type + '" has no Titan DSP backend yet — loaded as ' +
            'an honest passthrough (' + label + '). It will not change the audio.'
        );
        return {
            key: 'custom',
            name: (name || label) + ' (passthrough)',
            rdslType: type,
            passthrough: true,
            params: [],
            rdslParams: rawParams || {},
            gpuRequested: false
        };
    }

    function compileToPluginDefs(manifest, catalog) {
        var warnings = [];
        var defs = [];
        if (!manifest || !manifest.processor) {
            return { defs: defs, warnings: ['Empty manifest: nothing to load.'] };
        }
        var proc = manifest.processor;
        var type = proc.type || 'CUSTOM_PROCESSOR';
        var name = proc.name || null;

        if (proc.gpu === true || proc.gpu === 'enabled') {
            warnings.push(
                'Manifest requests GPU processing, which Titan does not ' +
                'provide — all DSP runs on the CPU. Request noted, not honored.'
            );
        }

        var mapping = TYPE_MAP[type];
        if (mapping && mapping.chain) {
            var chain = Array.isArray(proc.chain) ? proc.chain : [];
            if (!chain.length) {
                warnings.push('VOCAL_PROCESSOR has an empty chain — nothing to load.');
            }
            chain.forEach(function (stageName) {
                var stage = String(stageName).toLowerCase().trim();
                var stageType = CHAIN_STAGE_TYPES[stage];
                if (!stageType) {
                    warnings.push(
                        'Vocal chain stage "' + stageName + '" has no Titan DSP ' +
                        'backend — skipped.'
                    );
                    return;
                }
                defs.push(mapSingle(stageType, proc.params, name, warnings, catalog, stage + '_'));
            });
        } else {
            defs.push(mapSingle(type, proc.params, name, warnings, catalog, null));
        }

        // Tag GPU request on each def for the session UI to display.
        var gpuRequested = proc.gpu === true || proc.gpu === 'enabled';
        defs.forEach(function (d) { d.gpuRequested = gpuRequested; });
        return { defs: defs, warnings: warnings };
    }

    window.RDSLLoader = {
        compileToPluginDefs: compileToPluginDefs,
        TYPE_MAP: TYPE_MAP,
        SUPPORTED_FACTORY_KEYS: SUPPORTED_FACTORY_KEYS
    };
})();
