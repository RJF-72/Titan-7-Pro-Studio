/* Titan 7 Pro â€” Minimal shared UI utilities.
 * Contains only math/helpers; every plugin UI is bespoke and independent.
 */
(function () {
  'use strict';
  if (window.TitanUIUtils) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const map01 = (v, min, max) => clamp((v - min) / (max - min), 0, 1);
  const formatHz = (hz) => hz >= 1000 ? (hz / 1000).toFixed(1) + 'k' : Math.round(hz) + '';
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function fitCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function getCanvasCtx(root, id) {
    const canvas = root.getElementById(id);
    if (!canvas) return null;
    fitCanvas(canvas);
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { canvas, ctx, width: rect.width, height: rect.height, dpr };
  }

  function bindDrag({ el, onMove, onEnd }) {
    const move = (e) => onMove(e);
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
      if (onEnd) onEnd();
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  }

  function clientX(e) { return e.clientX ?? e.touches?.[0]?.clientX ?? 0; }
  function clientY(e) { return e.clientY ?? e.touches?.[0]?.clientY ?? 0; }

  function dispatchParamChange(host, paramId, value) {
    host.dispatchEvent(new CustomEvent('titan-param-change', {
      detail: { paramId, value }, bubbles: true, composed: true
    }));
  }

  function observeResize(el, callback) {
    if (!window.ResizeObserver) return null;
    const ro = new ResizeObserver(callback);
    ro.observe(el);
    return ro;
  }

  window.TitanUIUtils = {
    clamp, lerp, map01, formatHz, easeOutCubic,
    fitCanvas, getCanvasCtx, bindDrag, clientX, clientY,
    dispatchParamChange, observeResize
  };
})();

(function () {
  'use strict';
  if (window.TitanDriverRuntime) return;

  const drivers = new Map();
  const events = [];
  const MAX_EVENTS = 500;

  function nowIso() { return new Date().toISOString(); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function recordEvent(type, detail) {
    const event = { type, detail: detail || {}, timestamp: Date.now(), iso: nowIso() };
    events.push(event);
    while (events.length > MAX_EVENTS) events.shift();
    window.dispatchEvent(new CustomEvent('titan-driver:event', { detail: event }));
    return event;
  }

  function registerDriver(id, driver) {
    if (!id || !driver) return null;
    const existing = drivers.get(id) || {};
    const record = {
      id,
      driver,
      status: driver.status || existing.status || 'ready',
      capabilities: Array.isArray(driver.capabilities) ? driver.capabilities : (existing.capabilities || []),
      lastSeen: Date.now(),
      diagnostics: existing.diagnostics || []
    };
    drivers.set(id, record);
    recordEvent('driver.register', { id, capabilities: record.capabilities });
    return record;
  }

  function updateDriver(id, patch) {
    const record = drivers.get(id) || registerDriver(id, { status: 'ready' });
    if (!record) return null;
    Object.assign(record, patch || {}, { lastSeen: Date.now() });
    recordEvent('driver.update', { id, status: record.status, patch: patch || {} });
    return record;
  }

  function addDiagnostic(id, level, message, data) {
    const record = drivers.get(id) || registerDriver(id, { status: 'ready' });
    const diagnostic = { level: level || 'info', message: String(message || ''), data: data || null, timestamp: Date.now() };
    record.diagnostics.push(diagnostic);
    while (record.diagnostics.length > 100) record.diagnostics.shift();
    recordEvent('driver.diagnostic', { id, ...diagnostic });
    return diagnostic;
  }

  function getDriver(id) { return drivers.get(id) || null; }
  function listDrivers() { return Array.from(drivers.values()).map(({ driver, ...record }) => record); }
  function getEvents(limit) { return events.slice(-(limit || 100)); }

  function summarizeContext(context) {
    const ctx = context || {};
    const pieces = [];
    if (ctx.pluginName) pieces.push(`plugin ${ctx.pluginName}`);
    if (ctx.driverName) pieces.push(`driver ${ctx.driverName}`);
    if (ctx.mode) pieces.push(`mode ${ctx.mode}`);
    if (ctx.status) pieces.push(`status ${ctx.status}`);
    if (ctx.params) {
      const params = Object.entries(ctx.params).slice(0, 6).map(([key, value]) => `${key}=${value}`);
      if (params.length) pieces.push(`params ${params.join(', ')}`);
    }
    return pieces.length ? pieces.join('; ') : 'local driver context';
  }

  function classifyCommand(text) {
    const t = String(text || '').toLowerCase();
    if (/\b(help|commands|what can)/.test(t)) return 'help';
    if (/\b(status|diagnostic|health|ready|latency)/.test(t)) return 'status';
    if (/\b(preset|mode|smart|tight|open)/.test(t)) return 'preset';
    if (/\b(reset|default)/.test(t)) return 'reset';
    if (/\b(explain|why|what does)/.test(t)) return 'explain';
    if (/\b(apply|set|turn|raise|lower|increase|decrease|more|less)/.test(t)) return 'adjust';
    return 'advice';
  }

  function answer(text, context) {
    const intent = classifyCommand(text);
    const summary = summarizeContext(context);
    const name = context?.botName || context?.driverName || context?.pluginName || 'Driver';
    let response;
    switch (intent) {
    case 'help':
      response = `${name} can report status, explain the current processor, suggest settings, switch SMART/TIGHT/OPEN modes, and guide parameter moves using the live control values.`;
      break;
    case 'status':
      response = `${name} is online with ${summary}. No remote cloud service is required for this local driver response.`;
      break;
    case 'preset':
      response = `Use SMART for balanced correction, TIGHT for controlled/technical cleanup, and OPEN for wider or more expressive tone. Current context: ${summary}.`;
      break;
    case 'reset':
      response = `Reset is a local control action. Return the footer controls to their defaults, then use SMART mode as the baseline.`;
      break;
    case 'explain':
      response = `This driver reads the current plugin state and routes changes into the Web Audio processor chain. It is local deterministic DSP, not a remote neural model.`;
      break;
    case 'adjust':
      response = `Make small moves first: 5-10 points on the most relevant control, then compare bypassed vs active. Current context: ${summary}.`;
      break;
    default:
      response = `For this processor, start in SMART mode, adjust one control at a time, and watch the readouts while comparing bypassed vs active. Current context: ${summary}.`;
      break;
    }
    recordEvent('bot.answer', { text, intent, context, response });
    return { intent, response, timestamp: Date.now() };
  }

  window.TitanDriverRuntime = {
    registerDriver,
    updateDriver,
    addDiagnostic,
    getDriver,
    listDrivers,
    getEvents,
    answer,
    classifyCommand,
    summarizeContext,
    escapeHtml,
    clamp
  };
})();

