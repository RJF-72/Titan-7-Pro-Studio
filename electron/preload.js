const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('titan', {
    platform: process.platform,
    versions: {
        node: process.versions.node,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
    },
    license: {
        activateLicense: (email, key, tier) => ipcRenderer.invoke('activate-license', { email, key, tier }),
        activateOwner: (email) => ipcRenderer.invoke('activate-owner', { email }),
        renewLicense: (email, key) => ipcRenderer.invoke('renew-license', { email, key }),
        getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
        onActivated: (callback) => ipcRenderer.on('license-activated', callback),
        notifyActivated: () => ipcRenderer.send('license-activated'),
    },
    audio: {
        selectFolder: () => ipcRenderer.invoke('select-audio-folder'),
        selectFiles: () => ipcRenderer.invoke('select-audio-files'),
        readFolder: (path) => ipcRenderer.invoke('read-audio-folder', path),
        readFile: (path) => ipcRenderer.invoke('read-audio-file', path),
    },
    network: {
        scanDevices: () => ipcRenderer.invoke('scan-network-devices'),
    },
    voxGenesis: {
        installModelPack: () => ipcRenderer.invoke('select-voxgenesis-model-pack'),
        validateModels: () => ipcRenderer.invoke('validate-voxgenesis-models'),
    },
    ui: {
        /** Read a plugin UI HTML file from the app bundle. */
        loadPluginHtml: (fileName) => ipcRenderer.invoke('load-plugin-ui', fileName)
    }
});
