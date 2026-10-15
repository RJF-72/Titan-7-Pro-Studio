/* libflacjs loader config: must be loaded BEFORE vendor/libflac.wasm.js.
 * Kept as an external file (not inline) so the app's Content-Security-Policy
 * (script-src 'self', no 'unsafe-inline') allows it. Tells the WASM build
 * where to fetch its companion binary: vendor/libflac.wasm.wasm */
window.FLAC_SCRIPT_LOCATION = 'vendor/';
