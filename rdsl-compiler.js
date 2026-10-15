const RDSLCompiler = (() => {
    const VALID_TYPES = new Set([
        'COMPRESSOR', 'EQUALIZER', 'REVERB', 'DELAY', 'SATURATOR',
        'NOISE_GATE', 'MODULATION', 'SYNTHESIZER', 'ANALYZER',
        'VOCAL_PROCESSOR', 'MASTERING_CHAIN', 'CUSTOM_PROCESSOR'
    ]);

    function parse(code) {
        const errors = [];
        const warnings = [];
        const lines = code.split('\n');

        const openCount = (code.match(/\{\{/g) || []).length;
        const closeCount = (code.match(/\}\}/g) || []).length;
        if (openCount === 0) {
            errors.push('RDSL code must be wrapped in {{ ... }} template delimiters');
        } else if (openCount !== closeCount) {
            errors.push(`Unmatched template delimiters: ${openCount} opening vs ${closeCount} closing`);
        }

        const templateMatch = code.match(/\{\{([\s\S]*?)\}\}/);
        if (!templateMatch) {
            return { valid: false, errors, warnings, lines, ast: null };
        }

        const inner = templateMatch[1];
        const typeMatch = inner.match(/type:\s*(\w+)/);
        const versionMatch = inner.match(/version:\s*(\d+\.\d+)/);
        const type = typeMatch?.[1] || null;
        const version = versionMatch?.[1] || '1.0';

        if (!type) {
            errors.push('Missing "type:" declaration inside template block');
        } else if (!VALID_TYPES.has(type)) {
            errors.push(`Unknown plugin type "${type}". Valid types: ${[...VALID_TYPES].join(', ')}`);
        }

        if (!versionMatch) {
            warnings.push('Missing "version:" declaration; defaulting to 1.0');
        }

        const params = parseParamsBlock(inner);
        const chain = parseListBlock(inner, 'chain');
        const tags = parseListBlock(inner, 'tags');
        const fields = parseTopLevelFields(inner);
        const inputs = parseNonNegativeInteger(fields.audio_inputs || fields.inputs, 2);
        const outputs = parseNonNegativeInteger(fields.audio_outputs || fields.outputs, 2);

        if (params.malformed) {
            warnings.push('params: block may be malformed');
        }

        const ast = {
            type: type || 'CUSTOM_PROCESSOR',
            version,
            name: fields.name || null,
            category: fields.category || null,
            componentType: fields.component_type || fields.componentType || fields.component || null,
            routing: fields.routing || 'stereo',
            mode: fields.mode || null,
            model: fields.model || null,
            character: fields.character || null,
            oversampling: fields.oversampling || fields.oversample || '1x',
            gpu: normalizeBoolean(fields.gpu),
            realtimeSafe: fields.realtime_safe !== undefined ? normalizeBoolean(fields.realtime_safe) : (fields.realtimeSafe !== undefined ? normalizeBoolean(fields.realtimeSafe) : true),
            author: fields.author || 'user',
            description: fields.description || '',
            bands: parsePositiveInteger(fields.bands, null),
            oscillators: parsePositiveInteger(fields.oscillators, null),
            params: params.values,
            chain,
            tags,
            io: {
                inputs,
                outputs
            }
        };

        const badNumericFields = Object.entries(ast.params)
            .filter(([, value]) => typeof value === 'string' && !/^[-]?\d+(\.\d+)?$/.test(value))
            .map(([key, value]) => `${key}: ${value}`);
        if (badNumericFields.length) {
            warnings.push(`Some parameter values are symbolic rather than numeric: ${badNumericFields.slice(0, 3).join('; ')}`);
        }

        return { valid: errors.length === 0, errors, warnings, lines, ast };
    }

    function compile(code, options = {}) {
        const startedAt = performance.now();
        const analysis = parse(code);
        if (!analysis.valid || !analysis.ast) {
            return {
                success: false,
                errors: analysis.errors,
                warnings: analysis.warnings
            };
        }

        const manifest = buildManifest(code, analysis.ast, options, analysis.warnings);
        const artifactText = JSON.stringify(manifest, null, 2);
        const durationMs = performance.now() - startedAt;
        const size = new Blob([artifactText]).size;

        return {
            success: true,
            size,
            warnings: analysis.warnings,
            analysis,
            manifest,
            artifactText,
            compileDurationMs: durationMs
        };
    }

    function validate(code) {
        const analysis = parse(code);
        return { valid: analysis.valid, errors: analysis.errors, warnings: analysis.warnings, ast: analysis.ast };
    }

    function analyzeRuntime(compiled) {
        const manifest = compiled?.manifest;
        if (!manifest) {
            return {
                success: false,
                summary: 'No compiled manifest available.',
                elapsedMs: 0,
                memoryBytes: 0
            };
        }

        const startedAt = performance.now();
        const parameterNames = Object.keys(manifest.processor.params || {});
        const chainLength = Array.isArray(manifest.processor.chain) ? manifest.processor.chain.length : 0;
        const capabilities = [
            `type=${manifest.processor.type}`,
            `routing=${manifest.processor.routing}`,
            `inputs=${manifest.io.inputs}`,
            `outputs=${manifest.io.outputs}`
        ];

        if (manifest.processor.gpu) capabilities.push('gpu=enabled');
        if (manifest.processor.oversampling) capabilities.push(`oversampling=${manifest.processor.oversampling}`);
        if (chainLength) capabilities.push(`chainStages=${chainLength}`);
        if (parameterNames.length) capabilities.push(`params=${parameterNames.join(', ')}`);

        return {
            success: true,
            summary: `Manifest analysis complete: ${capabilities.join(' · ')}`,
            elapsedMs: performance.now() - startedAt,
            memoryBytes: new Blob([compiled.artifactText || '']).size
        };
    }

    function exportPlugin(compiled, options = {}) {
        const target = options.target || compiled.manifest.packageKind || 'rdslpkg';
        const fileStem = slugify(compiled.manifest.processor.type || 'rdsl-plugin');
        const fileName = `${fileStem}.${target}.json`;
        const blob = new Blob([compiled.artifactText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return fileName;
    }

    function updateStatus(state) {
        const statusEl = document.getElementById('syntaxStatus');
        if (statusEl) {
            statusEl.className = state === 'ready' ? 'success' : 'error';
            statusEl.innerHTML = state === 'ready'
                ? '<i class="fas fa-check"></i> Syntax OK'
                : '<i class="fas fa-times"></i> Error';
        }
    }

    function buildManifest(code, ast, options, warnings) {
        const sourceBytes = new Blob([code]).size;
        return {
            schema: 'Titan7.RDSL.Package',
            packageVersion: '1.0',
            compiledAt: new Date().toISOString(),
            sourceHash: hashString(code),
            warnings,
            packageKind: options.packageKind || options.exportTarget || 'rdslpkg',
            processor: {
                type: ast.type,
                version: ast.version,
                name: ast.name,
                category: ast.category,
                componentType: ast.componentType,
                routing: ast.routing,
                mode: ast.mode,
                model: ast.model,
                character: ast.character,
                oversampling: ast.oversampling,
                gpu: ast.gpu,
                realtimeSafe: ast.realtimeSafe,
                params: ast.params,
                chain: ast.chain
            },
            metadata: {
                author: ast.author,
                description: ast.description,
                category: ast.category,
                bands: ast.bands,
                oscillators: ast.oscillators,
                tags: ast.tags
            },
            io: {
                componentType: options.componentType || ast.componentType || 'Effect',
                inputs: parseNonNegativeInteger(options.audioInputs, ast.io.inputs),
                outputs: parseNonNegativeInteger(options.audioOutputs, ast.io.outputs),
                realtimeSafe: options.realtimeSafe !== undefined ? options.realtimeSafe !== false : ast.realtimeSafe !== false
            },
            runtime: {
                enableGPU: options.enableGPU !== false && ast.gpu !== false,
                realtimeSafe: options.realtimeSafe !== undefined ? options.realtimeSafe !== false : ast.realtimeSafe !== false,
                sourceBytes
            },
            artifacts: {
                source: true,
                driver: !!options.driverSource
            },
            source: code,
            driverSource: options.driverSource || null
        };
    }

    function parseParamsBlock(inner) {
        const blockMatch = inner.match(/params:\s*([\s\S]*?)(?=\n\s*(routing:|model:|character:|oversampling:|oversample:|gpu:|chain:|bands:|oscillators:|description:|author:|audio_inputs:|audio_outputs:|$))/);
        if (!blockMatch) {
            return { values: {}, malformed: /params:/i.test(inner) };
        }

        const values = {};
        blockMatch[1]
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {
                const match = line.match(/^([\w-]+):\s*(.+)$/);
                if (!match) return;
                values[match[1]] = normalizeValue(match[2]);
            });
        return { values, malformed: false };
    }

    function parseListBlock(inner, key) {
        const match = inner.match(new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n\\s*(\\w+:|$))`));
        if (!match) return [];
        return match[1]
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('-'))
            .map((line) => line.replace(/^-+\s*/, '').trim());
    }

    function parseTopLevelFields(inner) {
        const fields = {};
        inner.split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {
                const match = line.match(/^([\w-]+):\s*(.+)$/);
                if (!match) return;
                if (match[1] === 'params') return;
                fields[match[1]] = stripQuotes(match[2]);
            });
        return fields;
    }

    function normalizeValue(value) {
        const unquoted = stripQuotes(value);
        if (/^(true|false)$/i.test(unquoted)) {
            return unquoted.toLowerCase() === 'true';
        }
        if (/^-?\d+(\.\d+)?$/.test(unquoted)) {
            return Number(unquoted);
        }
        return unquoted;
    }

    function normalizeBoolean(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value !== 'string') return null;
        if (value.toLowerCase() === 'enabled' || value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'disabled' || value.toLowerCase() === 'false') return false;
        return null;
    }

    function parsePositiveInteger(value, fallback) {
        const parsed = parseInt(String(value), 10);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }

    function parseNonNegativeInteger(value, fallback) {
        const parsed = parseInt(String(value), 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    }

    function stripQuotes(value) {
        return String(value).replace(/^["']|["']$/g, '').trim();
    }

    function slugify(value) {
        return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function hashString(value) {
        let hash = 2166136261;
        for (let index = 0; index < value.length; index++) {
            hash ^= value.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return (hash >>> 0).toString(16).padStart(8, '0');
    }

    return {
        compile,
        validate,
        exportPlugin,
        updateStatus,
        analyzeRuntime,
        VALID_TYPES
    };
})();

window.RDSLCompiler = RDSLCompiler;

