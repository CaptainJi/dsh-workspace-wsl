// @deepseek-ai/dsh-workspace-wsl — Client bundle (dist/client.js).
//
// Hand-written __ModuleLoader__ module (the official `dsh build:client` tool is
// unavailable offline). Equivalent to client/index.tsx, compiled to the loader's
// CommonJS-style factory: require('react') + exports.inject / exports.apply.
// Client -> host calls go through ctx.remote.wslwk.<method>() (no shims).
window.__ModuleLoader__.load({
  id: '@deepseek-ai/dsh-workspace-wsl',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    const { createElement, useCallback, useEffect, useState, useSyncExternalStore } = require('react');

    // Cordis fiber dependencies: slots for UI registration, remote for the
    // @Remote client facade, workspaces/sessions/timer for the existing dialog.
    exports.inject = ['slots', 'wslwk', 'workspaces', 'sessions', 'timer'];

    // Passthrough strict codec: every wslwk/* method is plain lossless JSON, so
    // `.parse` is the identity. `typeSymbol` is only a nonempty marker.
    const jsonCodec = (typeSymbol) => ({ mode: 'strict', typeSymbol, schema: { parse: (value) => value } });

    // Hand-written strict Typert descriptor for the Host @Remote service. Wire
    // field names must match the Host method parameter names exactly (SRC mode).
    const wslwkRemote = {
      package: '@deepseek-ai/dsh-workspace-wsl',
      descriptors: [
        { id: '@deepseek-ai/dsh-workspace-wsl#wslwk/probe', service: 'wslwk', namespace: 'wslwk', method: 'probe', invocation: { kind: 'direct' }, parameters: [], result: jsonCodec('WslwkProbe') },
        { id: '@deepseek-ai/dsh-workspace-wsl#wslwk/home', service: 'wslwk', namespace: 'wslwk', method: 'home', invocation: { kind: 'direct' }, parameters: [{ name: 'distro', wire: 'distro', source: 'json', codec: jsonCodec('string') }], result: jsonCodec('WslwkHome') },
        { id: '@deepseek-ai/dsh-workspace-wsl#wslwk/list-dir', service: 'wslwk', namespace: 'wslwk', method: 'list-dir', invocation: { kind: 'direct' }, parameters: [{ name: 'distro', wire: 'distro', source: 'json', codec: jsonCodec('string') }, { name: 'path', wire: 'path', source: 'json', codec: jsonCodec('string') }], result: jsonCodec('WslwkListDir') },
        { id: '@deepseek-ai/dsh-workspace-wsl#wslwk/run', service: 'wslwk', namespace: 'wslwk', method: 'run', invocation: { kind: 'direct' }, parameters: [{ name: 'distro', wire: 'distro', source: 'json', codec: jsonCodec('string') }, { name: 'command', wire: 'command', source: 'json', codec: jsonCodec('string') }], result: jsonCodec('WslwkRun') },
        { id: '@deepseek-ai/dsh-workspace-wsl#wslwk/list', service: 'wslwk', namespace: 'wslwk', method: 'list', invocation: { kind: 'direct' }, parameters: [], result: jsonCodec('WslwkList') },
        { id: '@deepseek-ai/dsh-workspace-wsl#wslwk/create', service: 'wslwk', namespace: 'wslwk', method: 'create', invocation: { kind: 'direct' }, parameters: [{ name: 'payload', wire: 'payload', source: 'json', codec: jsonCodec('object') }], result: jsonCodec('WslwkCreate') },
        { id: '@deepseek-ai/dsh-workspace-wsl#wslwk/delete', service: 'wslwk', namespace: 'wslwk', method: 'delete', invocation: { kind: 'direct' }, parameters: [{ name: 'workspaceId', wire: 'workspaceId', source: 'json', codec: jsonCodec('string') }], result: jsonCodec('WslwkDelete') },
      ],
    };

    // Inject the package CSS once, mirroring the official client-module CSS hook
    // (a plain <style> tag; the module system claims it for HMR accounting).
    function injectCss(css) {
      if (typeof document === 'undefined') return;
      const tagId = '@deepseek-ai/dsh-workspace-wsl/client/index.css';
      if (document.querySelector('style[data-plugin-css="' + tagId + '"]') !== null) return;
      const tag = document.createElement('style');
      tag.dataset.plugin = '@deepseek-ai/dsh-workspace-wsl';
      tag.dataset.pluginCss = tagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    const el = createElement;
    const CSS = `
.wslwk-backdrop{position:fixed;inset:0;z-index:1200;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);pointer-events:auto;}
.wslwk-card{width:min(580px,calc(100vw - 48px));max-height:calc(100vh - 96px);overflow:auto;box-sizing:border-box;background:var(--dsw-alias-bg-overlay,#20202a);border:1px solid var(--dsw-alias-border-l1,#3a3a46);border-radius:14px;padding:20px;color:var(--dsw-alias-label-primary,#e8e8f0);font:13px/1.55 system-ui,'Segoe UI',sans-serif;box-shadow:0 16px 48px rgba(0,0,0,.45);}
.wslwk-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.wslwk-title{font-size:15px;font-weight:650;}
.wslwk-close{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#9a9aab);font-size:18px;cursor:pointer;padding:2px 6px;border-radius:6px;}
.wslwk-close:hover{background:var(--dsw-alias-bg-layer-2,#2a2a36);color:var(--dsw-alias-label-primary,#e8e8f0);}
.wslwk-kind{display:block;width:100%;text-align:left;padding:14px 16px;margin:8px 0;border-radius:10px;background:var(--dsw-alias-bg-layer-1,#262631);border:1px solid var(--dsw-alias-border-l1,#3a3a46);cursor:pointer;color:var(--dsw-alias-label-primary,#e8e8f0);}
.wslwk-kind:hover{border-color:var(--dsw-alias-brand-primary,#4f8cff);}
.wslwk-k-title{font-size:14px;font-weight:600;}
.wslwk-k-sub{color:var(--dsw-alias-label-secondary,#9a9aab);font-size:12px;margin-top:2px;}
.wslwk-sec{font-size:12px;color:var(--dsw-alias-label-secondary,#9a9aab);margin:12px 0 6px;font-weight:600;}
.wslwk-err{color:var(--dsw-alias-state-error-primary,#ff5d5d);margin:8px 0;white-space:pre-wrap;word-break:break-word;}
.wslwk-ok{color:var(--dsw-alias-state-success-primary,#3ecf8e);margin:8px 0;}
.wslwk-muted{color:var(--dsw-alias-label-secondary,#9a9aab);font-size:12px;margin:4px 0;word-break:break-all;}
.wslwk-label{display:block;font-size:12px;color:var(--dsw-alias-label-secondary,#9a9aab);margin:12px 0 4px;}
.wslwk-input,.wslwk-select{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-layer-1,#262631);color:var(--dsw-alias-label-primary,#e8e8f0);border:1px solid var(--dsw-alias-border-l1,#3a3a46);border-radius:8px;padding:8px 10px;font-size:13px;}
.wslwk-input:focus,.wslwk-select:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#4f8cff);}
.wslwk-pathbar{display:flex;gap:6px;}
.wslwk-pathbar .wslwk-input{flex:1;}
.wslwk-list{max-height:240px;overflow:auto;border:1px solid var(--dsw-alias-border-l1,#3a3a46);border-radius:8px;padding:4px;margin-top:6px;background:var(--dsw-alias-bg-base,#17171f);}
.wslwk-entry{display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:6px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wslwk-entry:hover{background:var(--dsw-alias-bg-layer-2,#2a2a36);}
.wslwk-entry.file{cursor:default;color:var(--dsw-alias-label-secondary,#9a9aab);}
.wslwk-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}
.wslwk-btn{border:1px solid var(--dsw-alias-border-l1,#3a3a46);background:var(--dsw-alias-bg-layer-2,#2a2a36);color:var(--dsw-alias-label-primary,#e8e8f0);border-radius:8px;padding:8px 14px;cursor:pointer;font-size:13px;}
.wslwk-btn:hover:not(:disabled){border-color:var(--dsw-alias-brand-primary,#4f8cff);}
.wslwk-btn:disabled{opacity:.55;cursor:default;}
.wslwk-btn.primary{border:none;background:var(--dsw-alias-brand-primary,#4f8cff);color:#fff;font-weight:600;}
.wslwk-linkbtn{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#9a9aab);cursor:pointer;padding:0;font-size:12px;margin-bottom:4px;}
.wslwk-linkbtn:hover{color:var(--dsw-alias-label-primary,#e8e8f0);}
.wslwk-item-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1,#3a3a46);margin:4px 0;background:var(--dsw-alias-bg-layer-1,#262631);}
.wslwk-item-main{flex:1;min-width:0;}
.wslwk-item-title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wslwk-item-path{color:var(--dsw-alias-label-secondary,#9a9aab);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.wslwk-badge{font-size:11px;padding:1px 8px;border-radius:999px;background:var(--dsw-alias-bg-layer-2,#2a2a36);border:1px solid var(--dsw-alias-border-l1,#3a3a46);color:var(--dsw-alias-label-secondary,#9a9aab);white-space:nowrap;}
.wslwk-mini{border:1px solid var(--dsw-alias-border-l1,#3a3a46);background:transparent;color:var(--dsw-alias-label-secondary,#9a9aab);border-radius:6px;padding:2px 8px;cursor:pointer;font-size:12px;}
.wslwk-mini:hover{color:var(--dsw-alias-label-primary,#e8e8f0);border-color:var(--dsw-alias-brand-primary,#4f8cff);}
.wslwk-mini.danger:hover{color:var(--dsw-alias-state-error-primary,#ff5d5d);border-color:var(--dsw-alias-state-error-primary,#ff5d5d);}
.wslwk-addbtn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;height:32px;border:none;background:transparent;color:var(--dsw-alias-label-secondary,#9a9aab);border-radius:6px;cursor:pointer;font-size:13px;white-space:nowrap;}
.wslwk-addbtn:hover{color:var(--dsw-alias-label-primary,#e8e8f0);background:var(--dsw-alias-bg-layer-2,#2a2a36);}
.wslwk-addbtn.rail{width:32px;margin:0 auto;}
`;

    async function apply(ctx) {
      const slots = ctx.slots;
      injectCss(CSS);
      if (!slots) return;

      // Mount the strict @Remote descriptor; dispose it when this fiber stops.
      const disposeRemote = ctx.wslwk && typeof ctx.wslwk.$mount === 'function'
        ? await ctx.wslwk.$mount(wslwkRemote)
        : null;

      // ---------- shared dialog open store ----------
      let dialogOpen = false;
      const subs = new Set();
      const setOpen = (v) => { dialogOpen = !!v; for (const fn of Array.from(subs)) { try { fn() } catch {} } };
      const getOpen = () => dialogOpen;
      const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn) };
      function useDialogOpen() {
        if (typeof useSyncExternalStore === 'function') return useSyncExternalStore(subscribe, getOpen);
        const [v, setV] = useState(getOpen());
        useEffect(() => subscribe(() => setV(getOpen())), []);
        return v;
      }

      const workspaces = ctx.workspaces;
      const sessions = ctx.sessions;
      const timer = ctx.timer;
      const parentLinux = (p) => (p === '/' ? '/' : (p.replace(/\/[^/]*\/?$/, '') || '/'));
      const joinLinux = (base, name) => (base === '/' ? '/' + name : base + '/' + name);

      // Client -> host @Remote call helper: unwraps the { ok, value | error } envelope.
      async function callWslwk(method, ...args) {
        const svc = ctx.wslwk;
        if (!svc) throw new Error('wslwk 远程服务未就绪');
        const fn = svc[method];
        if (typeof fn !== 'function') throw new Error('wslwk 方法不存在: ' + method);
        const res = await fn.apply(svc, args);
        if (res && res.ok) return res.value;
        const e = res && res.error;
        const message = e ? (e.message || e.code || 'wslwk/' + method + ' 调用失败') : ('wslwk/' + method + ' 调用失败');
        throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
      }

      async function openWorkspace(workspaceId) {
        if (!workspaces) return false;
        for (let i = 0; i < 40; i++) {
          try {
            const sessionId = await workspaces.connectWorkspace(workspaceId);
            if (sessions && sessionId) sessions.open(sessionId);
            return true;
          } catch (e) {
            if (i === 39) return false;
            if (timer) { try { await timer.timeout(150) } catch {} }
          }
        }
        return false;
      }

      function AddButton(props) {
        const wide = !!props.wide;
        return el('button', {
          type: 'button',
          className: 'wslwk-addbtn' + (wide ? '' : ' rail'),
          title: '添加/管理工作区（Windows / WSL）',
          onClick: () => setOpen(true),
        }, wide ? '＋ 工作区' : '＋');
      }

      // Adapter: route the built-in add flow into our dialog (shadow the native picker).
      function FlowAdapter(props) {
        useEffect(() => {
          if (!props.open) return;
          let cancelled = false;
          const dispose = timer ? timer.timeout(() => {
            if (cancelled) return;
            try { if (typeof props.onCancel === 'function') props.onCancel() } catch {}
            setOpen(true);
          }, 0) : null;
          return () => { cancelled = true; if (dispose) dispose() };
        }, [props.open]);
        return null;
      }

      function WorkspaceDialog() {
        const open = useDialogOpen();
        const [step, setStep] = useState('choose');
        const [error, setError] = useState(null);
        const [busy, setBusy] = useState(false);
        const [items, setItems] = useState(null);
        const [winPath, setWinPath] = useState('');
        const [probe, setProbe] = useState(null);
        const [distro, setDistro] = useState('');
        const [wslPath, setWslPath] = useState('/');
        const [entries, setEntries] = useState(null);
        const [listError, setListError] = useState(null);
        const [manualDistro, setManualDistro] = useState('');
        const [manualPath, setManualPath] = useState('');
        const [fallbackRoot, setFallbackRoot] = useState('');
        const [testResult, setTestResult] = useState(null);

        const refreshList = useCallback(async () => {
          try { const r = await callWslwk('list'); setItems((r && r.items) || []) }
          catch (e) { setItems([]) }
        }, []);

        useEffect(() => {
          if (open) {
            setStep('choose'); setError(null); setBusy(false);
            setWinPath(''); setProbe(null); setDistro(''); setWslPath('/'); setEntries(null); setListError(null);
            setManualDistro(''); setManualPath(''); setFallbackRoot(''); setTestResult(null);
            refreshList();
          }
        }, [open, refreshList]);

        function loadDir(d, p) {
          setListError(null); setEntries(null);
          callWslwk('list-dir', d, p || '/').then((r) => {
            if (!r || !r.ok) { setListError((r && r.error) || '无法列出目录'); setEntries([]); return }
            setWslPath(r.path); setEntries(r.entries);
          }).catch((e) => { setListError(String((e && e.message) || e)); setEntries([]) });
        }

        function enterWsl() {
          setStep('wsl'); setError(null); setTestResult(null);
          if (probe !== null) return;
          callWslwk('probe').then((p) => {
            setProbe(p);
            if (p && p.wslOk && p.distros && p.distros.length) {
              const d = p.distros[0];
              setDistro(d);
              callWslwk('home', d).then((h) => {
                const home = h && h.ok ? h.path : '/';
                setWslPath(home); loadDir(d, home);
              }).catch(() => { setWslPath('/'); loadDir(d, '/') });
            }
          }).catch((e) => setProbe({ wslOk: false, distros: [], error: String((e && e.message) || e) }));
        }

        async function pickWindows() {
          setBusy(true); setError(null);
          try { const p = workspaces ? await workspaces.pickDirectory() : null; if (p) setWinPath(p) }
          catch (e) { setError(String((e && e.message) || e)) }
          setBusy(false);
        }

        async function confirmWindows() {
          if (!winPath) { setError('请先选择文件夹'); return }
          setBusy(true); setError(null);
          try {
            const created = await callWslwk('create', { kind: 'windows', winPath });
            const ok = await openWorkspace(created.workspaceId);
            if (ok) setOpen(false); else setError('工作区已创建，但打开会话失败（可稍后在列表中点击「打开」）');
          } catch (e) { setError(String((e && e.message) || e)) }
          setBusy(false);
        }

        async function confirmWsl() {
          const useAuto = probe && probe.wslOk;
          const d = (useAuto ? distro : manualDistro.trim()) || '';
          const p = (useAuto ? wslPath : manualPath.trim()) || '';
          if (!d || !p) { setError('请填写发行版和 Linux 路径'); return }
          const payload = { kind: 'wsl', distro: d, wslPath: p };
          const fr = fallbackRoot.trim();
          if (fr) payload.fallbackRoot = fr;
          setBusy(true); setError(null);
          try {
            const created = await callWslwk('create', payload);
            const ok = await openWorkspace(created.workspaceId);
            if (ok) setOpen(false); else setError('工作区已创建，但打开会话失败（可稍后在列表中点击「打开」）');
          } catch (e) { setError(String((e && e.message) || e)) }
          setBusy(false);
        }

        async function testWsl() {
          const useAuto = probe && probe.wslOk;
          const d = (useAuto ? distro : manualDistro.trim()) || '';
          if (!d) { setTestResult({ ok: false, text: '请先填写发行版名称' }); return }
          setTestResult(null); setBusy(true);
          try {
            const r = await callWslwk('run', d, 'echo wsl-ok && uname -s && pwd');
            setTestResult(r && r.ok ? { ok: true, text: (r.stdout || '').trim() || 'ok' } : { ok: false, text: (r && r.error) || '失败' });
          } catch (e) { setTestResult({ ok: false, text: String((e && e.message) || e) }) }
          setBusy(false);
        }

        async function removeItem(id) {
          setBusy(true); setError(null);
          try { await callWslwk('delete', id); await refreshList() }
          catch (e) { setError(String((e && e.message) || e)) }
          setBusy(false);
        }

        function renderItems() {
          if (items === null) return el('div', { className: 'wslwk-muted' }, '加载中...');
          if (items.length === 0) return el('div', { className: 'wslwk-muted' }, '还没有工作区');
          const win = items.filter((i) => i.kind !== 'wsl');
          const wsl = items.filter((i) => i.kind === 'wsl');
          const group = (title, arr) => arr.length === 0 ? null : el('div', null,
            el('div', { className: 'wslwk-sec' }, title),
            arr.map((item) => el('div', { key: item.workspaceId, className: 'wslwk-item-row' },
              el('span', { className: 'wslwk-badge' }, item.kind === 'wsl' ? '🐧 WSL' : '🪟 Win'),
              el('div', { className: 'wslwk-item-main' },
                el('div', { className: 'wslwk-item-title' }, item.title),
                el('div', { className: 'wslwk-item-path' }, item.kind === 'wsl' ? (item.distro + ' · ' + item.wslPath) : item.path)),
              el('button', { type: 'button', className: 'wslwk-mini', disabled: busy, onClick: () => openWorkspace(item.workspaceId) }, '打开'),
              el('button', { type: 'button', className: 'wslwk-mini danger', disabled: busy, onClick: () => removeItem(item.workspaceId) }, '删除'))));
          return el('div', null, group('🪟 Windows 工作区', win), group('🐧 WSL 工作区', wsl));
        }

        if (!open) return null;

        const header = el('div', { className: 'wslwk-head' },
          el('div', { className: 'wslwk-title' }, '工作区管理'),
          el('button', { type: 'button', className: 'wslwk-close', onClick: () => setOpen(false) }, '✕'));

        let body;
        if (step === 'choose') {
          body = el('div', null,
            el('div', { className: 'wslwk-muted' }, '请选择要添加的工作区类型'),
            el('button', { type: 'button', className: 'wslwk-kind', onClick: () => setStep('windows') },
              el('div', { className: 'wslwk-k-title' }, '🪟 Windows 工作区'),
              el('div', { className: 'wslwk-k-sub' }, '选择 Windows 本地文件夹作为工作区')),
            el('button', { type: 'button', className: 'wslwk-kind', onClick: enterWsl },
              el('div', { className: 'wslwk-k-title' }, '🐧 WSL 工作区'),
              el('div', { className: 'wslwk-k-sub' }, '选择 WSL 发行版内的目录，默认使用 Linux 命令操作')),
            error ? el('div', { className: 'wslwk-err' }, String(error)) : null,
            el('div', { className: 'wslwk-sec' }, '已添加的工作区'),
            renderItems());
        } else if (step === 'windows') {
          body = el('div', null,
            el('button', { type: 'button', className: 'wslwk-linkbtn', onClick: () => setStep('choose') }, '← 返回'),
            el('div', { className: 'wslwk-sec' }, '🪟 Windows 工作区'),
            el('button', { type: 'button', className: 'wslwk-btn', disabled: busy, onClick: pickWindows }, '选择文件夹...'),
            winPath ? el('div', { className: 'wslwk-muted' }, '已选择: ' + winPath) : null,
            error ? el('div', { className: 'wslwk-err' }, String(error)) : null,
            el('div', { className: 'wslwk-actions' },
              el('button', { type: 'button', className: 'wslwk-btn primary', disabled: busy || !winPath, onClick: confirmWindows }, busy ? '处理中...' : '确认添加'),
              el('button', { type: 'button', className: 'wslwk-btn', disabled: busy, onClick: () => setStep('choose') }, '取消')));
        } else {
          const useAuto = probe && probe.wslOk;
          body = el('div', null,
            el('button', { type: 'button', className: 'wslwk-linkbtn', onClick: () => setStep('choose') }, '← 返回'),
            el('div', { className: 'wslwk-sec' }, '🐧 WSL 工作区'),
            probe === null ? el('div', { className: 'wslwk-muted' }, '检测 WSL 环境...') :
              (useAuto ? el('div', { className: 'wslwk-muted' }, 'wsl.exe 可用 · 发行版: ' + probe.distros.join(', '))
                : el('div', { className: 'wslwk-err' }, 'wsl.exe 不可用: ' + ((probe && probe.error) || '未知原因') + '。请使用手动输入模式。')),
            el('label', { className: 'wslwk-label' }, 'WSL 发行版'),
            useAuto
              ? el('select', { className: 'wslwk-select', value: distro, disabled: busy, onChange: (e) => { const d = e.target.value; setDistro(d); setWslPath('/'); setEntries(null); loadDir(d, '/') } },
                  probe.distros.map((d) => el('option', { key: d, value: d }, d)))
              : el('input', { className: 'wslwk-input', value: manualDistro, disabled: busy, placeholder: '如 Ubuntu / Debian / kali-linux', onChange: (e) => setManualDistro(e.target.value) }),
            el('label', { className: 'wslwk-label' }, 'Linux 路径' + (useAuto ? '' : '（如 /home/user/project）')),
            useAuto
              ? el('div', null,
                  el('div', { className: 'wslwk-pathbar' },
                    el('input', { className: 'wslwk-input', value: wslPath, disabled: busy, onChange: (e) => setWslPath(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter') loadDir(distro, wslPath) } }),
                    el('button', { type: 'button', className: 'wslwk-btn', disabled: busy || !distro, onClick: () => loadDir(distro, wslPath) }, '列出')),
                  listError ? el('div', { className: 'wslwk-err' }, String(listError)) : null,
                  el('div', { className: 'wslwk-list' },
                    wslPath !== '/' ? el('div', { className: 'wslwk-entry', onClick: () => loadDir(distro, parentLinux(wslPath)) }, '📂 ..') : null,
                    (entries || []).map((e) => e.dir
                      ? el('div', { key: e.name, className: 'wslwk-entry', onClick: () => loadDir(distro, joinLinux(wslPath, e.name)) }, '📂 ' + e.name)
                      : el('div', { key: e.name, className: 'wslwk-entry file' }, '📄 ' + e.name))),
                  el('div', { className: 'wslwk-muted' }, '点击目录进入 · 当前路径即为要添加的工作区'))
              : el('input', { className: 'wslwk-input', value: manualPath, disabled: busy, placeholder: '/home/user/project', onChange: (e) => setManualPath(e.target.value) }),
            el('label', { className: 'wslwk-label' }, 'Windows 挂载根目录（可选，用于 UNC 不可用时）'),
            el('input', { className: 'wslwk-input', value: fallbackRoot, disabled: busy, placeholder: '例如 D:\\WSL — WSL 文件系统在 Windows 侧的映射目录', onChange: (e) => setFallbackRoot(e.target.value) }),
            testResult ? el('div', { className: testResult.ok ? 'wslwk-ok' : 'wslwk-err' }, String(testResult.text)) : null,
            error ? el('div', { className: 'wslwk-err' }, String(error)) : null,
            el('div', { className: 'wslwk-actions' },
              el('button', { type: 'button', className: 'wslwk-btn', disabled: busy || !(useAuto ? distro : manualDistro.trim()), onClick: testWsl }, '测试命令'),
              el('button', { type: 'button', className: 'wslwk-btn primary', disabled: busy, onClick: confirmWsl }, busy ? '处理中...' : '确认添加'),
              el('button', { type: 'button', className: 'wslwk-btn', disabled: busy, onClick: () => setStep('choose') }, '取消')));
        }

        return el('div', {
          className: 'wslwk-backdrop',
          onClick: (e) => { if (e.target === e.currentTarget && !busy) setOpen(false) },
        }, el('div', { className: 'wslwk-card' }, header, body));
      }

      slots.inject('sidebar.footer.action', () => slots.register(
        { name: 'sidebar.footer.action', id: 'wslwk-add', order: 30, label: () => '工作区' },
        (props) => el(AddButton, { wide: props.wide })));
      slots.inject('shell.overlay', () => slots.register(
        { name: 'shell.overlay', id: 'wslwk-dialog', order: 40 },
        () => el(WorkspaceDialog, {})));
      slots.inject('sidebar.workspaces.directoryFlow', () => slots.register(
        { name: 'sidebar.workspaces.directoryFlow', priority: -1 },
        (props) => el(FlowAdapter, { open: props.open, onCancel: props.onCancel })));
      slots.inject('conversation.hero.workspace.directoryFlow', () => slots.register(
        { name: 'conversation.hero.workspace.directoryFlow', priority: -1 },
        (props) => el(FlowAdapter, { open: props.open, onCancel: props.onCancel })));

      // Reversible: unmount the @Remote descriptor when this plugin stops.
      return async () => {
        if (disposeRemote) { try { await disposeRemote() } catch {} }
      };
    }

    exports.apply = apply;
    return module.exports;
  }
});
