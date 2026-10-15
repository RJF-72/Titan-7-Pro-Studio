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
