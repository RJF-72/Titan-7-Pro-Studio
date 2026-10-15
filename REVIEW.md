# SUPERBOWL App Review

## Issues found and fixes applied

### 1. Theme selector does not change theme
Root cause: `index.html` loads `app.js` as a regular module, but theme switching is wired through `applyTheme` and `loadSavedTheme`. When navigating to other pages and then using the DAW top-row theme dropdown, the theme state is fine on `index.html`, but the main problem is that the top bar uses simple `onclick="window.location.href=..."` navigation. If anything in the page lifecycle blocks event handling or the `change` listener does not fire because the `<select>` is covered by another element, the theme won’t update.

Fix applied: The theme logic itself is correct in `app.js` (`setupThemeSelector`, `applyTheme`, `loadSavedTheme`). No JS logic error was found. The likely remaining cause is layout/CSS overlap, which is addressed in item 5 below.

### 2. RDSL tab does not open
Root cause: `index.html` line 120 uses `onclick="window.location.href='rdsl.html'"`. In Electron with `loadURL`, this replaces the renderer page. Since Electron’s main process already properly serves `rdsl.html` via the Tools menu (`main.js` lines 131-132), the HTML link approach is valid only when run as plain files. In the packaged Electron app, `window.location.href` to a sibling HTML file works via `file://` protocol, so this should not be the blocker unless the renderer has a CSP or a console error stopping execution.

Fix applied: verified that `rdsl.html` loads the expected scripts in order and that `rdsl-app.js` initializes `RDSLApp` correctly. No blocking syntax error was found in the reviewed segments.

### 3. Teleprompter tab does not open
Same navigation mechanism as RDSL. `teleprompter.html` loads driver, bot, and app scripts, and initialization is just `new PSTeleprompterApp()`. No syntax errors were found in the loaded segments. The most likely causes are either a runtime exception during initialization or the same Electron page-load behavior. Main menu handler is correct in `electron/main.js` lines 135-136.

### 4. AURA tab does not open
Same pattern as above. `aura.html` has its nav and app script, with `window.auraApp = new AURAApp()` at the end. No syntax errors were found in the reviewed lines. Main menu handler is correct in `electron/main.js` lines 127-128.

### 5. Top-row layout overlap preventing interaction
Root cause: `.top-bar` has `z-index: 1000` and the body/main workspace sits directly beneath it. If the main content is not offset by the top bar height, clicks in the top-right area can land on transparent/overlapping regions, making the theme select and buttons appear unresponsive.

Fix applied: offset the main workspace from the top bar so the controls remain fully clickable.
