const RDSLApp = (() => {
    let lastDriverCode = '';

    function init() {
        bindEvents();
        bindNav();
        bindToolbar();
        bindSuggestions();
        bindLibrary();
        bindPackageImport();
        bindExports();
        bindDriverMetrics();
        updateLineNumbers();
        updateCursorPosition();
        checkSyntax();
    }

    function bindEvents() {
        const editors = ['codeEditor', 'codeEditor2'];
        editors.forEach(id => {
            const el = document.getElementById(id);
            if (!el || !(el instanceof HTMLTextAreaElement)) return;
            el.addEventListener('input', () => {
                updateLineNumbers(el);
                checkSyntax(el);
                showAutocomplete(el);
            });
            el.addEventListener('keydown', (e) => handleAutocompleteKeydown(e, el));
            el.addEventListener('keyup', (e) => {
                updateCursorPosition(el);
                if (e.key === 'Escape') hideAutocomplete();
            });
            el.addEventListener('blur', () => setTimeout(hideAutocomplete, 200));
        });

        // Editor tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const name = (/** @type {HTMLElement} */(tab)).dataset.tab;
                document.querySelectorAll('.editor-panel-content').forEach(p => {
                    (/** @type {HTMLElement} */(p)).style.display = 'none';
                });
                const target = document.getElementById(name + 'Panel');
                if (target) target.style.display = 'block';
            });
        });

        // Generate from NL button
        const generateBtn = document.getElementById('generateCode');
        if (generateBtn) generateBtn.addEventListener('click', generateFromNaturalLanguage);

        // Clear NL button
        const clearBtn = document.getElementById('clearNL');
        if (clearBtn) clearBtn.addEventListener('click', clearNaturalLanguage);
    }

    function bindNav() {
        document.getElementById('btnBackToDAW')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        document.querySelectorAll('#rdslNav .nav-btn[data-section]').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = (/** @type {HTMLElement} */(btn)).dataset.section;
                if (section) showSection(section);
            });
        });
    }

    function bindToolbar() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = (/** @type {HTMLElement} */(btn)).dataset.action;
                switch (action) {
                    case 'run': runCode(); break;
                    case 'compile': compileCode(); break;
                    case 'loadSession': loadIntoSession(); break;
                    case 'save': saveCode(); break;
                    case 'validate': validateSyntax(); break;
                    case 'format': formatCode(); break;
                    case 'export': exportPlugin(); break;
                    case 'loadPackage': openPackagePicker(); break;
                    case 'generate': generateFromNaturalLanguage(); break;
                    case 'clearNL': clearNaturalLanguage(); break;
                }
            });
        });
    }

    function bindSuggestions() {
        document.querySelectorAll('[data-suggestion]').forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = (/** @type {HTMLElement} */(btn)).dataset.suggestion;
                if (suggestion) useSuggestion(suggestion);
            });
        });
    }

    function bindLibrary() {
        document.querySelectorAll('[data-load]').forEach(card => {
            card.addEventListener('click', () => {
                const load = (/** @type {HTMLElement} */(card)).dataset.load;
                if (load) loadFromLibrary(load);
            });
        });
    }

    function bindExports() {
        document.querySelectorAll('[data-export]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = (/** @type {HTMLElement} */(btn)).dataset.export;
                if (type === 'vst3') exportAsPlugin();
                else if (type === 'au') exportAsAU();
                else if (type === 'load') openPackagePicker();
            });
        });
    }

    function bindPackageImport() {
        const input = document.getElementById('rdslPackageInput');
        if (!input || !(input instanceof HTMLInputElement)) return;
        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (file) importPackageFromFile(file);
        });
    }

    function openPackagePicker() {
        const input = document.getElementById('rdslPackageInput');
        if (!input || !(input instanceof HTMLInputElement)) {
            showConsole('error', 'Package loader is not available.');
            return;
        }
        input.value = '';
        input.click();
    }

    async function importPackageFromFile(file) {
        try {
            const raw = await file.text();
            const pkg = JSON.parse(raw);
            const source = pkg.source || pkg.manifest?.source || pkg.manifest?.artifacts?.source || pkg.artifacts?.source || '';
            const driverSource = pkg.driverSource || pkg.manifest?.driverSource || pkg.manifest?.artifacts?.driver || pkg.artifacts?.driver || '';
            if (!source.trim()) {
                showConsole('error', 'This file does not contain RDSL source.');
                return;
            }

            setEditorValue(source);
            lastDriverCode = driverSource;
            updateLineNumbers();
            checkSyntax();
            showSection('editor');

            const compiler = (/** @type {any} */(window)).RDSLCompiler;
            const driver = (/** @type {any} */(window)).rdslDriver;
            if (driver?.trackSource) driver.trackSource(source);
            if (compiler?.validate) compiler.validate(source);

            const type = pkg.manifest?.packageKind || pkg.packageKind || pkg.type || 'package';
            showConsole('success', `<i class="fas fa-folder-open"></i> Loaded ${type} package from ${file.name}`);
            if (driverSource.trim()) {
                showConsole('info', '<i class="fas fa-microchip"></i> Restored driver source from package.');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            showConsole('error', `Failed to load package: ${message}`);
        }
    }

    function bindDriverMetrics() {
        const driver = (/** @type {any} */(window)).rdslDriver;
        if (!driver) return;
        driver.on('statusUpdate', (data) => {
            const statusEl = document.getElementById('driverStatus');
            const compEl = document.getElementById('driverCompilation');
            const latEl = document.getElementById('driverLatency');
            const memEl = document.getElementById('driverMemory');
            if (statusEl) statusEl.textContent = data.status;
            if (compEl) compEl.textContent = data.compilation;
            if (latEl) latEl.textContent = data.latency.toFixed(2) + 'ms';
            if (memEl) memEl.textContent = data.memory.toFixed(2) + ' MB';
        });
    }

    // ── Natural Language → Code Generation ──────────────────────
    function generateFromNaturalLanguage() {
        const nlInput = /** @type {HTMLTextAreaElement} */(document.getElementById('nlInput'));
        const input = nlInput?.value?.trim();
        if (!input) { showConsole('error', 'Please enter a description first.'); return; }

        showConsole('info', `<i class="fas fa-magic"></i> Processing: "${input}"`);

        const bot = (/** @type {any} */(window)).rdslBot;
        const result = bot ? bot.process(input) : null;
        if (!result) { showConsole('error', 'RDSL Bot not available.'); return; }

        const code = bot.generateRDSLCode(result);
        setEditorValue(code);
        updateLineNumbers();
        checkSyntax();

        lastDriverCode = bot.generateDriver(result);
        const driver = (/** @type {any} */(window)).rdslDriver;
        if (driver?.trackSource) driver.trackSource(code);
        showConsole('success', `<i class="fas fa-check"></i> Generated RDSL code for: ${result.intent}`);
        showConsole('info', `<i class="fas fa-microchip"></i> Driver configuration script generated alongside the manifest source.`);

        bot.addMessage(`Detected: ${result.intent} (${(result.confidence * 100).toFixed(0)}% confidence)`);
        const detail = Object.keys(result.params).length > 0
            ? 'Parameters: ' + Object.entries(result.params).map(([k,v]) => `${k}=${v}`).join(', ')
            : 'No specific parameters detected. Defaults used.';
        bot.addMessage(detail);
        bot.addMessage('RDSL code generated. Compile it to build an exportable manifest package.');

        updatePreview(result.intent, result.params);
        showSection('editor');
    }

    function clearNaturalLanguage() {
        const nlInput = /** @type {HTMLTextAreaElement} */(document.getElementById('nlInput'));
        if (nlInput) nlInput.value = '';
        showConsole('info', '<i class="fas fa-eraser"></i> Natural language input cleared');
    }

    function useSuggestion(suggestion) {
        const nlInput = /** @type {HTMLTextAreaElement} */(document.getElementById('nlInput'));
        if (!nlInput) return;
        const texts = {
            compressor: 'Create a smooth vocal compressor with a 3:1 ratio, medium attack and release, and automatic makeup gain.',
            eq: 'Build a four-band parametric EQ with high-pass filter and gentle high-shelf boost for air.',
            reverb: 'Make a lush hall reverb with adjustable size, decay, damping, and dry/wet mix.',
            synth: 'Design a subtractive synth with two oscillators, a resonant filter, and envelope control.',
            analyzer: 'Add a real-time spectrum analyzer that shows frequency content and peak levels.'
        };
        nlInput.value = (texts[suggestion] || `Create a ${suggestion} plugin.`);
        showSection('natural');
    }

    function loadFromLibrary(template) {
        const templates = {
            compressor: `{{
  type: COMPRESSOR
  name: "World Class Compressor"
  component_type: Effect
  version: 1.0
  audio_inputs: 2
  audio_outputs: 2
  realtime_safe: true
  category: Dynamics
  params:
    ratio: 3
    threshold: -18
    attack: 10
    release: 100
    makeup: 6
}}`,
            eq: `{{
  type: EQUALIZER
  name: "Studio EQ"
  component_type: Effect
  version: 1.0
  audio_inputs: 2
  audio_outputs: 2
  realtime_safe: true
  category: EQ / Filtering
  params:
    highpass: 80
    low: 2
    lowMid: 0
    highMid: 1
    high: 3
}}`,
            reverb: `{{
  type: REVERB
  name: "Concert Hall Reverb"
  component_type: Effect
  version: 1.0
  audio_inputs: 2
  audio_outputs: 2
  realtime_safe: true
  category: Space
  params:
    size: 60
    decay: 4.5
    damping: 40
    mix: 30
}}`,
            delay: `{{
  type: DELAY
  name: "Tempo Delay"
  component_type: Effect
  version: 1.0
  audio_inputs: 2
  audio_outputs: 2
  realtime_safe: true
  category: Time
  params:
    time: 250
    feedback: 35
    mix: 40
}}`,
            saturator: `{{
  type: SATURATOR
  name: "Analog Saturation"
  component_type: Effect
  version: 1.0
  audio_inputs: 2
  audio_outputs: 2
  realtime_safe: true
  category: Harmonic
  params:
    drive: 40
    tone: 50
    harmonics: 60
    mix: 50
}}`,
            synth: `{{
  type: SYNTHESIZER
  name: "Poly Synth"
  component_type: Instrument
  version: 1.0
  audio_inputs: 0
  audio_outputs: 2
  realtime_safe: true
  category: Instrument
  params:
    cutoff: 800
    resonance: 35
    attack: 5
    release: 300
}}`
        };
        const code = templates[template] || `{{
  type: CUSTOM_PROCESSOR
  name: "Custom Processor"
  component_type: Effect
  version: 1.0
  audio_inputs: 2
  audio_outputs: 2
  realtime_safe: true
  params:
    param1: 50
}}`;
        setEditorValue(code);
        updateLineNumbers();
        checkSyntax();
        showSection('editor');
        showConsole('success', `<i class="fas fa-book"></i> Loaded ${template} template from library`);
    }
    function compileCode() {
        const code = getActiveEditorValue();
        if (!code || !code.trim()) { showConsole('error', 'Nothing to compile.'); return; }

        const compiler = (/** @type {any} */(window)).RDSLCompiler;
        const driver = (/** @type {any} */(window)).rdslDriver;
        if (driver?.trackSource) driver.trackSource(code);
        const startedAt = performance.now();
        const result = compiler ? compiler.compile(code, getPackagingOptions()) : null;
        if (result && result.success) {
            const elapsedMs = performance.now() - startedAt;
            showConsole('success', `<i class="fas fa-check"></i> Compiled manifest successfully (${result.size} bytes, ${result.warnings?.length || 0} warnings)`);
            if (result.warnings && result.warnings.length) {
                result.warnings.forEach(w => showConsole('info', `<i class="fas fa-exclamation-triangle"></i> ${w}`));
            }
            showConsole('info', `<i class="fas fa-microchip"></i> Package hash ${result.manifest.sourceHash} ready for export.`);
            const bot = (/** @type {any} */(window)).rdslBot;
            if (bot) bot.addMessage('Compilation successful. The manifest package is ready for export.');
            if (driver?.recordCompile) {
                driver.recordCompile(result, elapsedMs);
            } else {
                setDriverState('Compiled', 'Ready');
            }
        } else {
            const errs = result?.errors?.join('; ') || 'Unknown error';
            showConsole('error', `<i class="fas fa-times"></i> Compilation failed: ${errs}`);
            const bot = (/** @type {any} */(window)).rdslBot;
            if (bot) bot.addMessage('Compilation error: ' + errs);
            if (driver?.recordError) driver.recordError(errs);
            else setDriverState('Error', 'Failed');
        }
    }

    // -- Load into Session: compile, stage the manifest in localStorage,
    //    then open the DAW, which picks it up on boot and inserts the
    //    mapped plugins onto the selected track (see rdsl-loader.js).
    function loadIntoSession() {
        const code = getActiveEditorValue();
        if (!code || !code.trim()) { showConsole('error', 'Nothing to load - write or generate RDSL code first.'); return; }
        const compiler = /** @type {any} */(window).RDSLCompiler;
        const compiled = compiler ? compiler.compile(code, getPackagingOptions()) : null;
        if (!compiled || !compiled.success) {
            const errs = (compiled && compiled.errors && compiled.errors.join('; ')) || 'compiler unavailable';
            showConsole('error', '<i class="fas fa-times"></i> Load needs compilable code: ' + errs);
            return;
        }
        try {
            localStorage.setItem('titan.rdsl.pendingLoad', JSON.stringify({ manifest: compiled.manifest, createdAt: Date.now() }));
        } catch (e) {
            showConsole('error', 'Could not stage the manifest: ' + (e.message || e));
            return;
        }
        const loader = /** @type {any} */(window).RDSLLoader;
        const plan = loader ? loader.compileToPluginDefs(compiled.manifest, null) : null;
        const names = plan && plan.defs.length ? plan.defs.map(function (d) { return d.name; }).join(', ') : compiled.manifest.processor.type;
        showConsole('success', '<i class="fas fa-check"></i> Staged "' + names + '" - opening the session...');
        if (plan && plan.warnings && plan.warnings.length) {
            plan.warnings.forEach(function (w) { showConsole('info', '<i class="fas fa-exclamation-triangle"></i> ' + w); });
        }
        setTimeout(function () { window.location.href = 'index.html'; }, 700);
    }

    function runCode() {
        const code = getActiveEditorValue();
        if (!code || !code.trim()) { showConsole('error', 'Nothing to analyze.'); return; }

        const compiler = (/** @type {any} */(window)).RDSLCompiler;
        const validation = compiler ? compiler.validate(code) : { valid: true };
        if (!validation.valid) {
            showConsole('error', `<i class="fas fa-times"></i> Cannot analyze — syntax errors: ${validation.errors.join('; ')}`);
            return;
        }

        const driver = (/** @type {any} */(window)).rdslDriver;
        const compiled = compiler ? compiler.compile(code, getPackagingOptions()) : null;
        if (!compiled || !compiled.success) {
            showConsole('error', '<i class="fas fa-times"></i> Analysis failed during compilation.');
            if (driver?.recordError) driver.recordError('Analysis failed');
            return;
        }

        showConsole('info', '<i class="fas fa-play"></i> Analyzing compiled manifest...');
        const report = compiler.analyzeRuntime(compiled);
        if (!report.success) {
            showConsole('error', `<i class="fas fa-times"></i> ${report.summary}`);
            if (driver?.recordError) driver.recordError(report.summary);
            return;
        }

        showConsole('success', `<i class="fas fa-check"></i> ${report.summary}`);
        const bot = (/** @type {any} */(window)).rdslBot;
        if (bot) bot.addMessage('Manifest analysis completed successfully.');
        if (driver?.recordExecution) driver.recordExecution(report);
        else setDriverState('Analyzed', 'Ready');
    }

    function saveCode() {
        const code = getActiveEditorValue();
        if (!code) { showConsole('error', 'No code to save.'); return; }
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'rdsl-component.rdsl'; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showConsole('success', `<i class="fas fa-save"></i> Saved as rdsl-component.rdsl`);
    }

    function validateSyntax() {
        const code = getActiveEditorValue() || '';
        const compiler = (/** @type {any} */(window)).RDSLCompiler;
        const result = compiler ? compiler.validate(code) : { valid: code.trim().length > 0, errors: [] };
        if (result.valid) {
            showConsole('success', `<i class="fas fa-check-circle"></i> Syntax validated — no errors`);
            if (result.warnings && result.warnings.length) {
                result.warnings.forEach(w => showConsole('info', `<i class="fas fa-exclamation-triangle"></i> ${w}`));
            }
        } else {
            showConsole('error', `<i class="fas fa-times-circle"></i> Validation errors: ${result.errors.join('; ')}`);
        }
    }

    function formatCode() {
        const editor = getActiveEditor();
        if (!editor || !(editor instanceof HTMLTextAreaElement)) return;
        const lines = editor.value.split('\n');
        const formatted = lines.map(l => l.trim()).filter(l => l).join('\n');
        editor.value = formatted;
        updateLineNumbers(editor);
        showConsole('info', `<i class="fas fa-align-left"></i> Code formatted`);
    }

    function exportPlugin() {
        const code = getActiveEditorValue();
        if (!code) { showConsole('error', 'No code to export.'); return; }
        return exportCompiledPackage('rdslpkg');
    }

    function exportCompiledPackage(target) {
        const code = getActiveEditorValue();
        if (!code) { showConsole('error', 'No code to export.'); return false; }
        const compiler = (/** @type {any} */(window)).RDSLCompiler;
        if (compiler) {
            const compiled = compiler.compile(code, { ...getPackagingOptions(), exportTarget: target, packageKind: target, driverSource: lastDriverCode });
            if (compiled.success) {
                const fileName = compiler.exportPlugin(compiled, { target });
                showConsole('success', `<i class="fas fa-download"></i> Exported manifest package as ${fileName}`);

                if (lastDriverCode) {
                    const driverBlob = new Blob([lastDriverCode], { type: 'text/javascript' });
                    const dUrl = URL.createObjectURL(driverBlob);
                    const dA = document.createElement('a');
                    dA.href = dUrl; dA.download = 'rdsl-driver.js'; dA.click();
                    setTimeout(() => URL.revokeObjectURL(dUrl), 1000);
                    showConsole('info', `<i class="fas fa-microchip"></i> Driver source bundled and exported as rdsl-driver.js`);
                }
                return true;
            } else {
                showConsole('error', 'Export failed — compilation errors');
                return false;
            }
        }
        return false;
    }

    function exportAsPlugin() {
        if (exportCompiledPackage('vst3-package')) {
            showConsole('info', '<i class="fas fa-file-archive"></i> VST3-targeted manifest prepared');
        }
    }

    function exportAsAU() {
        if (exportCompiledPackage('au-package')) {
            showConsole('info', '<i class="fab fa-apple"></i> Audio Unit-targeted manifest prepared');
        }
    }

    // ── Output / Console ────────────────────────────────────────
    function showConsole(type, html) {
        const content = document.getElementById('outputContent');
        if (!content) return;
        const cls = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
        content.innerHTML += `<div class="output-line ${cls}">${html}</div>`;
        content.scrollTop = content.scrollHeight;
    }

    function showSection(name) {
        document.querySelectorAll('#rdslNav .nav-btn[data-section]').forEach(btn => {
            btn.classList.toggle('active', (/** @type {HTMLElement} */(btn)).dataset.section === name);
        });

        const editorEl = document.getElementById('editorSection');
        const naturalEl = document.getElementById('naturalSection');
        const libraryEl = document.getElementById('librarySection');

        if (editorEl) editorEl.style.display = name === 'editor' ? 'block' : 'none';
        if (naturalEl) naturalEl.style.display = name === 'natural' ? 'flex' : 'none';
        if (libraryEl) libraryEl.style.display = name === 'library' ? 'flex' : 'none';
    }

    function getActiveEditor() {
        const el = document.activeElement;
        if (el && el.classList.contains('code-editor')) return /** @type {HTMLTextAreaElement} */(el);
        return /** @type {HTMLTextAreaElement} */(document.getElementById('codeEditor')) || /** @type {HTMLTextAreaElement} */(document.getElementById('codeEditor2'));
    }

    function getActiveEditorValue() {
        const editor = getActiveEditor();
        return editor ? editor.value : '';
    }

    function setEditorValue(value) {
        const ed1 = /** @type {HTMLTextAreaElement} */(document.getElementById('codeEditor'));
        const ed2 = /** @type {HTMLTextAreaElement} */(document.getElementById('codeEditor2'));
        if (ed1) ed1.value = value;
        if (ed2) ed2.value = value;
    }

    function getLineNumbersFor(editor) {
        const container = editor?.closest('.code-editor-container');
        return container ? container.querySelector('.line-numbers') : null;
    }

    function getStatusFor(editor) {
        const panel = editor?.closest('.rdsl-panel');
        return panel ? panel.querySelector('.toolbar-info #syntaxStatus, .toolbar-info #syntaxStatus2') : null;
    }

    function getCursorFor(editor) {
        const panel = editor?.closest('.rdsl-panel');
        return panel ? panel.querySelector('.toolbar-info #cursorPosition, .toolbar-info #cursorPosition2') : null;
    }

    function updateLineNumbers(editor) {
        if (!editor) editor = getActiveEditor();
        const lineNumbers = getLineNumbersFor(editor);
        if (!editor || !lineNumbers) return;
        const lines = editor.value.split('\n').length;
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    }

    function updateCursorPosition(editor) {
        if (!editor) editor = getActiveEditor();
        const cursor = getCursorFor(editor);
        if (!editor || !cursor) return;
        const text = editor.value.slice(0, editor.selectionStart);
        const line = text.split('\n').length;
        const col = text.split('\n').pop().length + 1;
        cursor.textContent = `Ln ${line}, Col ${col}`;
    }

    function checkSyntax(editor) {
        if (!editor) editor = getActiveEditor();
        const status = getStatusFor(editor);
        if (!editor || !status) return;
        const code = editor.value;
        if (!code.trim()) {
            status.className = ''; status.innerHTML = '<i class="fas fa-check"></i> Empty';
            return;
        }
        const compiler = (/** @type {any} */(window)).RDSLCompiler;
        const result = compiler ? compiler.validate(code) : { valid: code.includes('{'), errors: [] };
        status.className = result.valid ? 'success' : 'error';
        status.innerHTML = result.valid
            ? '<i class="fas fa-check"></i> Syntax OK'
            : '<i class="fas fa-times"></i> Syntax Error';
    }

    function setDriverState(status, compilation) {
        const driver = (/** @type {any} */(window)).rdslDriver;
        if (driver) {
            driver.status = status;
            driver.compilation = compilation;
            driver.updateMetrics();
        }
    }

    // Parses a channel-count input. Unlike `parseInt(x) || 2`, an explicit
    // 0 is preserved (0 || 2 would silently turn it into 2); only
    // missing/non-numeric/negative values fall back to the stereo default.
    function normalizeChannelCount(raw) {
        const parsed = parseInt(String(raw ?? '2').trim(), 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 2;
    }

    function getPackagingOptions() {
        return {
            componentType: (/** @type {HTMLSelectElement} */(document.getElementById('componentType')))?.value || 'Effect',
            audioInputs: normalizeChannelCount((/** @type {HTMLInputElement} */(document.getElementById('audioInputs')))?.value),
            audioOutputs: normalizeChannelCount((/** @type {HTMLInputElement} */(document.getElementById('audioOutputs')))?.value),
            enableGPU: !!(/** @type {HTMLInputElement} */(document.getElementById('enableGPU')))?.checked,
            realtimeSafe: !!(/** @type {HTMLInputElement} */(document.getElementById('realtimeSafe')))?.checked
        };
    }

    function updatePreview(intent, params) {
        const container = document.getElementById('previewContainer');
        if (!container) return;
        const typeMap = {
            compressor: 'fa-compress-arrows-alt',
            eq: 'fa-sliders-h',
            reverb: 'fa-water',
            delay: 'fa-history',
            saturator: 'fa-fire',
            synth: 'fa-music',
            analyzer: 'fa-chart-line',
            vocal: 'fa-microphone-alt',
            master: 'fa-magic',
            gate: 'fa-minus-circle',
            phaser: 'fa-wave-square',
            custom: 'fa-cube'
        };
        const icon = (/** @type {any} */(typeMap))[intent] || 'fa-cube';
        const paramList = Object.keys(params).length
            ? Object.entries(params).map(([k,v]) => `<span class="preview-param">${k}: ${v}</span>`).join('')
            : '<span class="preview-param">Defaults</span>';
        container.innerHTML = `
            <div class="preview-card">
                <i class="fas ${icon}"></i>
                <h3>${intent.toUpperCase()}</h3>
                <div class="preview-params">${paramList}</div>
            </div>
        `;
    }

    // ── Auto-Complete System ────────────────────────────────────
    const RDSL_KEYWORDS = [
        'plugin', 'effect', 'instrument', 'analyzer',
        'param', 'input', 'output', 'audio', 'midi',
        'bypass', 'bypass_all', 'bypassAll',
        'ratio', 'threshold', 'attack', 'release', 'knee',
        'gain', 'frequency', 'freq', 'q_factor', 'q',
        'mix', 'wet', 'dry', 'pre_delay', 'preDelay',
        'decay', 'size', 'damping', 'diffusion',
        'drive', 'saturation', 'warmth', 'tone',
        'feedback', 'ping_pong', 'pingpong',
        'oscillator', 'filter', 'envelope', 'lfo',
        'wave', 'sawtooth', 'sine', 'square', 'triangle',
        'cutoff', 'resonance', 'envelope_amount',
        'rate', 'depth', 'phase', 'stereo', 'mono',
        'true', 'false', 'bypassed', 'active'
    ];

    /** @type {Record<string, string>} */
    const RDSL_SNIPPETS = {
        plugin: '{{\n  type: CUSTOM_PROCESSOR\n  name: "My Plugin"\n  component_type: Effect\n  version: 1.0\n  audio_inputs: 2\n  audio_outputs: 2\n  realtime_safe: true\n  category: Utility\n}}',
        compressor: '{{\n  type: COMPRESSOR\n  name: "World Class Compressor"\n  component_type: Effect\n  version: 1.0\n  audio_inputs: 2\n  audio_outputs: 2\n  realtime_safe: true\n  category: Dynamics\n  params:\n    ratio: 4\n    threshold: -18\n    attack: 10\n    release: 80\n    makeup: 3\n}}',
        eq: '{{\n  type: EQUALIZER\n  name: "Studio EQ"\n  component_type: Effect\n  version: 1.0\n  audio_inputs: 2\n  audio_outputs: 2\n  realtime_safe: true\n  category: EQ / Filtering\n  params:\n    bands: 4\n    highpass: 80\n    lowShelf: 2\n    highShelf: 3\n}}',
        reverb: '{{\n  type: REVERB\n  name: "Concert Hall Reverb"\n  component_type: Effect\n  version: 1.0\n  audio_inputs: 2\n  audio_outputs: 2\n  realtime_safe: true\n  category: Space\n  params:\n    size: 60\n    decay: 4.5\n    damping: 40\n    mix: 30\n}}',
        synth: '{{\n  type: SYNTHESIZER\n  name: "Poly Synth"\n  component_type: Instrument\n  version: 1.0\n  audio_inputs: 0\n  audio_outputs: 2\n  realtime_safe: true\n  category: Instrument\n  params:\n    voices: 8\n    cutoff: 1200\n    resonance: 0.7\n}}'
    };

    let autocompleteVisible = false;
    let autocompleteIndex = -1;

    function showAutocomplete(editor) {
        if (!editor || !(editor instanceof HTMLTextAreaElement)) return;
        const cursorPos = editor.selectionStart;
        const text = editor.value.slice(0, cursorPos);
        const wordMatch = text.match(/(\w+)$/);
        if (!wordMatch) { hideAutocomplete(); return; }

        const word = wordMatch[1].toLowerCase();
        if (word.length < 2) { hideAutocomplete(); return; }

        const matches = RDSL_KEYWORDS.filter(k => k.startsWith(word));
        if (matches.length === 0) { hideAutocomplete(); return; }

        const dropdown = getOrCreateDropdown();
        dropdown.innerHTML = matches.map((m, i) =>
            `<div class="ac-item ${i === 0 ? 'ac-selected' : ''}" data-value="${m}">${m}${RDSL_SNIPPETS[m] ? ' <span class="ac-snippet">⏎ snippet</span>' : ''}</div>`
        ).join('');
        autocompleteVisible = true;
        autocompleteIndex = 0;

        const rect = editor.getBoundingClientRect();
        const lineHeight = 20;
        const textBefore = editor.value.slice(0, cursorPos);
        const lines = textBefore.split('\n');
        const lineNum = lines.length;
        const colNum = lines[lines.length - 1].length;
        dropdown.style.left = Math.min(colNum * 8, rect.width - 220) + 'px';
        dropdown.style.top = (lineNum * lineHeight + 24) + 'px';
        dropdown.style.display = 'block';

        dropdown.querySelectorAll('.ac-item').forEach(el => {
            el.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const val = (/** @type {HTMLElement} */(el)).dataset.value;
                if (val) applyAutocomplete(editor, val);
            });
        });
    }

    function getOrCreateDropdown() {
        let dd = document.getElementById('rdslAutocomplete');
        if (!dd) {
            dd = document.createElement('div');
            dd.id = 'rdslAutocomplete';
            dd.className = 'rdsl-autocomplete';
            document.body.appendChild(dd);
        }
        return dd;
    }

    function hideAutocomplete() {
        const dd = document.getElementById('rdslAutocomplete');
        if (dd) { dd.style.display = 'none'; dd.innerHTML = ''; }
        autocompleteVisible = false;
        autocompleteIndex = -1;
    }

    function handleAutocompleteKeydown(e, editor) {
        if (!autocompleteVisible) return;
        const dd = document.getElementById('rdslAutocomplete');
        if (!dd || dd.style.display === 'none') return;

        const items = dd.querySelectorAll('.ac-item');
        if (!items.length) return;

        if (e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
            const selected = /** @type {HTMLElement} */(dd.querySelector('.ac-selected'));
            if (selected && selected.dataset.value) {
                applyAutocomplete(editor, selected.dataset.value);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1);
            updateAutocompleteSelection(items);
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            autocompleteIndex = Math.max(autocompleteIndex - 1, 0);
            updateAutocompleteSelection(items);
            return;
        }
    }

    function updateAutocompleteSelection(items) {
        items.forEach((el, i) => {
            el.classList.toggle('ac-selected', i === autocompleteIndex);
            if (i === autocompleteIndex) el.scrollIntoView({ block: 'nearest' });
        });
    }

    function applyAutocomplete(editor, value) {
        if (!editor || !(editor instanceof HTMLTextAreaElement)) return;
        const cursorPos = editor.selectionStart;
        const text = editor.value.slice(0, cursorPos);
        const after = editor.value.slice(cursorPos);
        const wordMatch = text.match(/(\w+)$/);
        if (!wordMatch) { hideAutocomplete(); return; }

        let replacement = value;
        if (RDSL_SNIPPETS[value]) {
            replacement = RDSL_SNIPPETS[value];
        }

        const start = cursorPos - wordMatch[1].length;
        editor.value = text.slice(0, start) + replacement + after;
        const newPos = start + replacement.length;
        editor.setSelectionRange(newPos, newPos);
        editor.focus();
        updateLineNumbers(editor);
        checkSyntax(editor);
        hideAutocomplete();
    }

    return {
        init, showSection, generateFromNaturalLanguage, compileCode, runCode,
        saveCode, validateSyntax, formatCode, exportPlugin,
        openPackagePicker, importPackageFromFile,
        updateLineNumbers, updateCursorPosition
    };
})();

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    (/** @type {any} */(window)).RDSLApp = RDSLApp;
    RDSLApp.init();
    const libSection = document.getElementById('librarySection');
    if (libSection) libSection.style.display = 'none';
    const driver = (/** @type {any} */(window)).rdslDriver;
    if (driver) driver.init();
});

