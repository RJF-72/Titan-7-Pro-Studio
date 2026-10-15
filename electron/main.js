const { app, BrowserWindow, Menu, dialog, globalShortcut, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');
const license = require('./license');

const isDev = !app.isPackaged;

let mainWindow;
let licenseWindow;
const allowedAudioPaths = new Set();

const ZOOM_MIN = -6;
const VOXGENESIS_PACK_LAYOUTS = [
    {
        packType: 'cycl0-rvc',
        name: 'VoxGenesis RVC Voice Conversion Pack',
        requiredModels: [
            'vec-768-layer-12.onnx',
            'crepe_full.onnx',
            'rvc_full.onnx'
        ],
        optionalModels: [
            'crepe_tiny_v2.onnx',
            'rvc_infer_full.pt',
            'index_meta.txt',
            'index_vectors.bin'
        ]
    },
    {
        packType: 'legacy-voxgenesis',
        name: 'Legacy VoxGenesis Pack',
        requiredModels: [
            'speaker_encoder.onnx',
            'pitch_encoder.onnx',
            'voice_converter.onnx',
            'vocoder.onnx'
        ],
        optionalModels: []
    }
];
const VOXGENESIS_MIN_MODEL_BYTES = 1024 * 32;

function voxGenesisModelDir() {
    return path.join(__dirname, '..', 'models', 'voxgenesis');
}

function voxGenesisManifestPath() {
    return path.join(voxGenesisModelDir(), 'manifest.json');
}

function getVoxGenesisPackLayouts() {
    return VOXGENESIS_PACK_LAYOUTS.map((layout) => ({
        ...layout,
        requiredModels: [...layout.requiredModels],
        optionalModels: [...layout.optionalModels]
    }));
}

function validateVoxGenesisLayout(folderPath, layout) {
    const sourceDir = normalizePath(folderPath);
    const required = layout.requiredModels.map((name) => {
        const fullPath = path.join(sourceDir, name);
        if (!fs.existsSync(fullPath)) {
            return { name, ok: false, error: 'missing' };
        }
        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
            return { name, ok: false, error: 'not a file' };
        }
        if (stats.size < VOXGENESIS_MIN_MODEL_BYTES) {
            return { name, ok: false, error: 'too small to be a trained model', size: stats.size };
        }
        return { name, ok: true, size: stats.size, path: fullPath };
    });
    const optional = layout.optionalModels.map((name) => {
        const fullPath = path.join(sourceDir, name);
        if (!fs.existsSync(fullPath)) {
            return { name, ok: false, optional: true, error: 'missing' };
        }
        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
            return { name, ok: false, optional: true, error: 'not a file' };
        }
        return { name, ok: true, optional: true, size: stats.size, path: fullPath };
    });
    return {
        ok: required.every((file) => file.ok),
        layout: layout.packType,
        name: layout.name,
        folder: sourceDir,
        files: required.concat(optional),
        required,
        optional
    };
}

function validateVoxGenesisModelFolder(folderPath) {
    const layouts = getVoxGenesisPackLayouts();
    const validations = layouts.map((layout) => validateVoxGenesisLayout(folderPath, layout));
    const ranked = validations
        .map((validation) => ({
            ...validation,
            score: validation.required.filter((file) => file.ok).length + validation.optional.filter((file) => file.ok).length * 0.1
        }))
        .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    return {
        ok: !!best?.ok,
        folder: normalizePath(folderPath),
        layout: best?.layout || null,
        name: best?.name || null,
        files: best?.files || [],
        required: best?.required || [],
        optional: best?.optional || [],
        candidates: validations
    };
}

function updateVoxGenesisManifestInstalled(installed, validation = null) {
    const manifestPath = voxGenesisManifestPath();
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest.installed = !!installed;
    manifest.installedAt = installed ? new Date().toISOString() : null;
    if (validation?.layout) manifest.packType = validation.layout;
    if (validation?.name) manifest.name = validation.name;
    manifest.modelBytes = Object.fromEntries((validation?.files || []).map((file) => {
        const fullPath = path.join(voxGenesisModelDir(), file.name);
        return [file.name, fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0];
    }));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return manifest;
}

function installVoxGenesisModelPack(folderPath) {
    const validation = validateVoxGenesisModelFolder(folderPath);
    if (!validation.ok) return { ok: false, validation };
    const targetDir = voxGenesisModelDir();
    fs.mkdirSync(targetDir, { recursive: true });
    for (const file of validation.required.concat(validation.optional)) {
        if (!file.ok) continue;
        fs.copyFileSync(file.path, path.join(targetDir, file.name));
    }
    const manifest = updateVoxGenesisManifestInstalled(true, validation);
    return { ok: true, validation: validateVoxGenesisModelFolder(targetDir), manifest };
}
const ZOOM_MAX = 9;

function zoomConfigPath() {
    return path.join(app.getPath('userData'), 'zoom.json');
}

function loadZoomLevel() {
    try {
        const data = JSON.parse(fs.readFileSync(zoomConfigPath(), 'utf-8'));
        return typeof data.level === 'number' ? Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, data.level)) : 0;
    } catch (_) {
        return 0;
    }
}

function saveZoomLevel(level) {
    try {
        fs.mkdirSync(app.getPath('userData'), { recursive: true });
        fs.writeFileSync(zoomConfigPath(), JSON.stringify({ level }));
    } catch (_) {}
}

function applyZoom(wc) {
    wc.setZoomLevel(loadZoomLevel());
}

function normalizePath(targetPath) {
    return path.resolve(String(targetPath || ''));
}

function rememberAllowedPath(targetPath) {
    if (targetPath) allowedAudioPaths.add(normalizePath(targetPath));
}

function isWithinPath(targetPath, rootPath) {
    const target = normalizePath(targetPath);
    const root = normalizePath(rootPath);
    return target === root || target.startsWith(root + path.sep);
}

function isAllowedAudioPath(targetPath) {
    return Array.from(allowedAudioPaths).some((allowedPath) => isWithinPath(targetPath, allowedPath));
}

function isSafeBundleRelativePath(fileName) {
    const normalized = String(fileName || '').replace(/\\/g, '/');
    return normalized && !normalized.startsWith('/') && !normalized.includes('..') && /^plugins\/ui\/[^/]+\.html$/i.test(normalized);
}

function adjustZoom(delta) {
    const current = loadZoomLevel();
    const next = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, current + delta));
    if (next === current) return;
    saveZoomLevel(next);
    for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.setZoomLevel(next);
    }
}

function resetZoom() {
    saveZoomLevel(0);
    for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.setZoomLevel(0);
    }
}

function createLicenseWindow() {
    licenseWindow = new BrowserWindow({
        width: 520,
        height: 640,
        resizable: false,
        maximizable: false,
        minimizable: true,
        title: 'Titan 7 Pro - License Activation',
        icon: path.join(__dirname, '..', 'icon.ico'),
        backgroundColor: '#07070d',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    licenseWindow.loadFile(path.join(__dirname, '..', 'license.html'));
    licenseWindow.setMenuBarVisibility(false);
    applyZoom(licenseWindow.webContents);

    licenseWindow.webContents.on('input-event', (event, input) => {
        if (input.type === 'mouseWheel' && input.control) {
            if (input.deltaY < 0) {
                adjustZoom(1);
            } else if (input.deltaY > 0) {
                adjustZoom(-1);
            }
        }
    });

    licenseWindow.on('closed', () => {
        licenseWindow = null;
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 1000,
        minWidth: 1024,
        minHeight: 700,
        title: 'Titan 7 Pro',
        icon: path.join(__dirname, '..', 'icon.ico'),
        backgroundColor: '#07070d',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false
        },
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
    applyZoom(mainWindow.webContents);

    mainWindow.webContents.on('input-event', (event, input) => {
        if (input.type === 'mouseWheel' && input.control) {
            if (input.deltaY < 0) {
                adjustZoom(1);
            } else if (input.deltaY > 0) {
                adjustZoom(-1);
            }
        }
    });

    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function buildMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Session',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow?.webContents.executeJavaScript('window.dawApp?.newSession?.()'),
                },
                {
                    label: 'Open Session...',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => mainWindow?.webContents.executeJavaScript('window.dawApp?.openSessionPicker?.()'),
                },
                { type: 'separator' },
                {
                    label: 'Export Mixdown...',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => mainWindow?.webContents.executeJavaScript('document.getElementById("btnExportMixdown")?.click()'),
                },
                { type: 'separator' },
                {
                    label: 'License',
                    click: () => {
                        if (!licenseWindow) createLicenseWindow();
                    },
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
                    click: () => app.quit(),
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                {
                    label: 'Reset Zoom',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => resetZoom(),
                },
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+=',
                    click: () => adjustZoom(1),
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => adjustZoom(-1),
                },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'AURA Microphone Enhancement',
                    click: () => mainWindow?.loadURL(`file://${path.join(__dirname, '..', 'aura.html')}`),
                },
                {
                    label: 'RDSL Plugin Studio',
                    click: () => mainWindow?.loadURL(`file://${path.join(__dirname, '..', 'rdsl.html')}`),
                },
                {
                    label: 'PS Teleprompter',
                    click: () => mainWindow?.loadURL(`file://${path.join(__dirname, '..', 'teleprompter.html')}`),
                },
                {
                    label: 'Plugins Demo (Standalone)',
                    click: () => mainWindow?.loadURL(`file://${path.join(__dirname, '..', 'plugins', 'demo', 'index.html')}`),
                },
                {
                    label: 'Back to DAW',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => mainWindow?.loadURL(`file://${path.join(__dirname, '..', 'index.html')}`),
                },
            ],
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'View License Agreement',
                    click: () => {
                        const licensePath = path.join(__dirname, '..', 'LICENSE.md');
                        require('electron').shell.openPath(licensePath);
                    },
                },
                {
                    label: 'About Titan 7 Pro',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Titan 7 Pro',
                            message: 'Titan 7 Pro - Desktop Audio Workstation',
                            detail: `Version ${app.getVersion()}\nLicensed to: ${license.LICENSEE}\n\nDesktop audio workstation built on Electron and the Web Audio API.\n\nRedemption Road Music Group, Titan Audio,\nTitan 7 Pro, RDSL, AURA, VoxGenesis,\nand PS Teleprompter are trademarks of\nRedemption Road Music Group.`,
                            icon: path.join(__dirname, '..', 'icon.ico'),
                        });
                    },
                },
            ],
        },
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC handlers for license activation
ipcMain.handle('activate-license', (_event, { email, key, tier }) => {
    return license.activateLicense(email, key, tier);
});

ipcMain.handle('activate-owner', (_event, { email }) => {
    return license.activateOwner(email);
});

ipcMain.handle('renew-license', (_event, { email, key }) => {
    return license.renewLicense(email, key);
});

ipcMain.handle('get-license-status', () => {
    return license.getLicenseStatus();
});

ipcMain.handle('select-voxgenesis-model-pack', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select VoxGenesis Model Pack Folder',
        message: 'Choose the folder containing the VoxGenesis Cycl0 RVC pack or the legacy four-file pack'
    });
    if (result.canceled || !result.filePaths?.length) return { canceled: true };
    try {
        return installVoxGenesisModelPack(result.filePaths[0]);
    } catch (err) {
        return { ok: false, error: err.message || String(err) };
    }
});

ipcMain.handle('validate-voxgenesis-models', async () => {
    try {
        const validation = validateVoxGenesisModelFolder(voxGenesisModelDir());
        if (!validation.ok) updateVoxGenesisManifestInstalled(false);
        return { ok: validation.ok, validation };
    } catch (err) {
        return { ok: false, error: err.message || String(err) };
    }
});
ipcMain.handle('select-audio-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory', 'multiSelections'],
        title: 'Select Audio Folder',
        message: 'Choose a folder containing audio files to import',
        filters: [
            { name: 'Audio Files', extensions: ['wav', 'mp3', 'ogg', 'flac', 'aiff', 'm4a'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    if (!result.canceled) result.filePaths.forEach(rememberAllowedPath);
    return result;
});

ipcMain.handle('select-audio-files', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        title: 'Select Audio Files',
        message: 'Choose audio files to import',
        filters: [
            { name: 'Audio Files', extensions: ['wav', 'mp3', 'ogg', 'flac', 'aiff', 'm4a'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    if (!result.canceled) result.filePaths.forEach(rememberAllowedPath);
    return result;
});

ipcMain.handle('read-audio-folder', async (_event, folderPath) => {
    const fs = require('fs');
    const path = require('path');
    try {
        if (!isAllowedAudioPath(folderPath)) {
            return { error: 'Folder access has not been granted. Select the folder first.' };
        }
        const entries = fs.readdirSync(folderPath, { withFileTypes: true });
        const files = entries
            .filter(e => e.isFile() && /\.(wav|mp3|ogg|flac|aiff|m4a)$/i.test(e.name))
            .map(e => ({ name: e.name, path: path.join(folderPath, e.name), type: 'file' }));
        const dirs = entries
            .filter(e => e.isDirectory())
            .map(e => ({ name: e.name, path: path.join(folderPath, e.name), type: 'directory' }));
        return { files, dirs };
    } catch (err) {
        return { error: err.message };
    }
});

ipcMain.handle('read-audio-file', async (_event, filePath) => {
    const fs = require('fs');
    try {
        if (!isAllowedAudioPath(filePath)) {
            return { error: 'File access has not been granted. Select the file first.' };
        }
        const fileBuffer = fs.readFileSync(filePath);
        // A Node Buffer is a view into a larger (pooled) ArrayBuffer, so
        // fileBuffer.buffer is NOT the file data. Copy out exactly the bytes
        // described by byteOffset/byteLength; otherwise small files are read
        // with the wrong offset and trailing pool garbage.
        const arrayBuffer = fileBuffer.buffer.slice(
            fileBuffer.byteOffset,
            fileBuffer.byteOffset + fileBuffer.byteLength
        );
        return { buffer: arrayBuffer, name: require('path').basename(filePath) };
    } catch (err) {
        return { error: err.message };
    }
});

ipcMain.handle('load-plugin-ui', async (_event, fileName) => {
    const fs = require('fs');
    const path = require('path');
    if (!isSafeBundleRelativePath(fileName)) {
        return { error: 'Plugin UI path is not allowed: ' + fileName };
    }
    const candidates = [
        path.join(__dirname, '..', fileName),
        path.join(process.resourcesPath, 'app.asar', fileName),
        path.join(process.resourcesPath, 'app', fileName)
    ];
    for (const candidate of candidates) {
        try {
            if (fs.existsSync(candidate)) {
                return { html: fs.readFileSync(candidate, 'utf-8') };
            }
        } catch (_e) { /* ignore */ }
    }
    return { error: `Plugin UI file not found: ${fileName}` };
});

ipcMain.on('license-activated', () => {
    if (licenseWindow) {
        licenseWindow.close();
        licenseWindow = null;
    }
    if (!mainWindow) createWindow();
});

ipcMain.handle('scan-network-devices', async () => {
    const dgram = require('dgram');
    const os = require('os');
    const devices = [];

    const ssdpSearch = () => new Promise((resolve) => {
        const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        const found = new Map();
        const timeout = setTimeout(() => { try { socket.close(); } catch (_e) {} resolve(Array.from(found.values())); }, 3000);

        socket.on('error', () => { clearTimeout(timeout); try { socket.close(); } catch (_e) {} resolve(Array.from(found.values())); });
        socket.on('message', (msg) => {
            const str = msg.toString();
            const locMatch = str.match(/LOCATION:\s*(http[^\r\n]+)/i);
            const usnMatch = str.match(/USN:\s*([^\r\n]+)/i);
            const stMatch = str.match(/ST:\s*([^\r\n]+)/i);
            const st = stMatch ? stMatch[1].trim() : '';
            if (st.includes('Chromecast') || st.includes('dial') || st.includes('Basic')) {
                const loc = locMatch ? locMatch[1].trim() : '';
                const usn = usnMatch ? usnMatch[1].trim() : '';
                const key = usn || loc;
                if (key && !found.has(key)) {
                    const nameMatch = str.match(/SERVER:\s*([^\r\n]+)/i);
                    found.set(key, {
                        id: `ssdp:${key}`,
                        name: nameMatch ? nameMatch[1].trim().split('/')[0].trim() : (st.split(':').pop() || 'Network Device'),
                        type: 'tv',
                        status: 'available',
                        latency: 30.0,
                        location: loc,
                        castId: usn || key
                    });
                }
            }
        });

        socket.bind(0, () => {
            try {
                socket.setMulticastTTL(4);
                const msg = Buffer.from(
                    'M-SEARCH * HTTP/1.1\r\n' +
                    'HOST: 239.255.255.250:1900\r\n' +
                    'MAN: "ssdp:discover"\r\n' +
                    'MX: 3\r\n' +
                    'ST: urn:dial-multicast-org:device:Basic:1\r\n\r\n'
                );
                socket.send(msg, 0, msg.length, 1900, '239.255.255.250');
            } catch (_e) { clearTimeout(timeout); try { socket.close(); } catch (_e2) {} resolve(Array.from(found.values())); }
        });
    });

    const mdnsSearch = () => new Promise((resolve) => {
        const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        const found = new Map();
        const timeout = setTimeout(() => { try { socket.close(); } catch (_e) {} resolve(Array.from(found.values())); }, 3000);

        socket.on('error', () => { clearTimeout(timeout); try { socket.close(); } catch (_e) {} resolve(Array.from(found.values())); });
        socket.on('message', (msg) => {
            try {
                const str = msg.toString('binary');
                const nameMatch = str.match(/\xc0\x0c\x00\x10[\x00-\xff]{2}(.+?)(?:\xc0|\x00)/);
                const name = nameMatch ? nameMatch[1].replace(/[^\x20-\x7e]/g, '') : '';
                if (name && !found.has(name)) {
                    found.set(name, {
                        id: `mdns:${name}`,
                        name: name.replace(/\._googlecast\._tcp\.?$/, '').replace(/\._tcp\.?$/, '') || 'Cast Device',
                        type: 'tv',
                        status: 'available',
                        latency: 15.0,
                        castId: name
                    });
                }
            } catch (_e) {}
        });

        socket.bind(5353, () => {
            try {
                socket.addMembership('224.0.0.251');
                const query = Buffer.from([
                    0x00, 0x00, 0x84, 0x00, 0x00, 0x00, 0x00, 0x01,
                    0x00, 0x00, 0x00, 0x00, 0x0f, 0x5f, 0x67, 0x6f,
                    0x6f, 0x67, 0x6c, 0x65, 0x63, 0x61, 0x73, 0x74,
                    0x08, 0x5f, 0x74, 0x63, 0x70, 0x05, 0x6c, 0x6f,
                    0x63, 0x61, 0x6c, 0x00, 0x00, 0x0c, 0x00, 0x01
                ]);
                socket.send(query, 0, query.length, 5353, '224.0.0.251');
            } catch (_e) { clearTimeout(timeout); try { socket.close(); } catch (_e2) {} resolve(Array.from(found.values())); }
        });
    });

    const [ssdpDevices, mdnsDevices] = await Promise.allSettled([ssdpSearch(), mdnsSearch()]);
    if (ssdpDevices.status === 'fulfilled') devices.push(...ssdpDevices.value);
    if (mdnsDevices.status === 'fulfilled') devices.push(...mdnsDevices.value);

    const localIPs = new Set();
    Object.values(os.networkInterfaces()).forEach((iface) => {
        if (iface) iface.forEach((info) => { if (!info.internal) localIPs.add(info.address); });
    });

    return devices;
});

app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const url = webContents.getURL();
        const isAppPage = url.startsWith('file://');
        const allowed = isAppPage && permission === 'media';
        callback(allowed);
    });

    buildMenu();
    if (license.isLicensed() || isDev) {
        createWindow();
    } else {
        createLicenseWindow();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            if (license.isLicensed() || isDev) createWindow();
            else if (!licenseWindow) createLicenseWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});






