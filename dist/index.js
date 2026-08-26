var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { defineTool } from '@deepseek-ai/dsh-tools';
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol';
// Plugin display name, used in loader diagnostics / composition id.
export const name = 'deepseek-ai-dsh-workspace-wsl';
// Wait until the tool registry is ready before running.
export const inject = ['tools'];
export function apply(ctx) {
    // ---------------- services ----------------
    const subprocess = ctx.get('subprocess');
    const sandboxPolicy = ctx.get('sandboxPolicy');
    const registry = ctx.get('workspaceRegistry');
    const systemPrompt = ctx.get('systemPrompt');
    const shellEnv = ctx.get('shellEnv');
    const timer = ctx.get('timer');
    // ---------------- path helpers ----------------
    const BS = String.fromCharCode(92); // backslash
    const UNC_PREFIX1 = BS + BS + 'wsl$' + BS; // \\wsl$\
    const UNC_PREFIX2 = BS + BS + 'wsl.localhost' + BS; // \\wsl.localhost\
    const shq = (s) => String(s).replace(/'/g, `'\\''`);
    const normLinux = (p) => {
        let s = String(p || '/').replace(/\\/g, '/');
        if (!s.startsWith('/'))
            s = '/' + s;
        s = s.replace(/\/+/g, '/');
        if (s.length > 1 && s.endsWith('/'))
            s = s.slice(0, -1);
        return s;
    };
    // Windows vs WSL workspace classification (UNC \\wsl$\<distro>\<path>).
    function classifyPath(p) {
        const s = String(p || '').toLowerCase();
        let rest = null;
        if (s.startsWith(UNC_PREFIX1))
            rest = s.slice(UNC_PREFIX1.length);
        else if (s.startsWith(UNC_PREFIX2))
            rest = s.slice(UNC_PREFIX2.length);
        if (rest) {
            const slash = rest.indexOf('\\');
            if (slash > 0) {
                const distro = rest.slice(0, slash);
                const linux = '/' + rest.slice(slash + 1).replace(/\\/g, '/');
                return { kind: 'wsl', distro, wslPath: linux };
            }
        }
        return { kind: 'windows', distro: null, wslPath: null };
    }
    // wsl.exe may emit UTF-16LE when WSL_UTF8 is ignored; recover it.
    function decodeOut(text) {
        if (typeof text !== 'string')
            return '';
        if (text.indexOf('\u0000') < 0)
            return text.replace(/^\uFEFF/, '');
        const bytes = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            bytes[i] = code <= 0xff ? code : 0x3f;
        }
        return new TextDecoder('utf-16le').decode(bytes).replace(/^\uFEFF/, '');
    }
    async function runWsl(opts) {
        const argv = ['wsl.exe'];
        if (opts.distro)
            argv.push('-d', opts.distro, '--');
        argv.push(...opts.args);
        const spec = {
            argv,
            cwd: sandboxPolicy?.workspaceRoot,
            stdio: {
                stdin: opts.stdin !== undefined ? { data: opts.stdin } : 'ignore',
                stdout: { maxBytes: 4 * 1024 * 1024, spill: { maxBytes: 32 * 1024 * 1024 } },
                stderr: { maxBytes: 4 * 1024 * 1024, spill: { maxBytes: 32 * 1024 * 1024 } },
            },
            graceMs: 1500,
            env: { WSL_UTF8: '1' },
        };
        if (opts.signal)
            spec.signal = opts.signal;
        let handle;
        try {
            handle = subprocess?.spawn(spec);
        }
        catch (error) {
            return { ok: false, error: String((error && error.message) || error) };
        }
        let t = null;
        t = timer?.timeout(() => { try {
            handle?.terminate();
        }
        catch { } }, opts.timeoutMs || 60000);
        try {
            const outcome = await handle.done;
            const stdout = decodeOut(handle.collected.stdout.readFrom(0).text);
            const stderr = decodeOut(handle.collected.stderr.readFrom(0).text);
            if (outcome.exitCode !== 0) {
                return { ok: false, exitCode: outcome.exitCode, stdout, stderr, error: (stderr || stdout || 'wsl.exe exited ' + outcome.exitCode).slice(0, 3000) };
            }
            return { ok: true, exitCode: outcome.exitCode, stdout, stderr };
        }
        catch (error) {
            return { ok: false, error: String((error && error.message) || error) };
        }
        finally {
            if (t)
                t();
        }
    }
    // ---------------- workspace metadata ----------------
    const TITLE_RE = /^🐧\s*([^:：]+?)\s*[:：]\s*(.+)$/;
    function describe(ws) {
        const base = {
            workspaceId: String(ws.id),
            title: String(ws.title || ''),
            path: String(ws.path || ''),
            sessionIds: Array.isArray(ws.sessionIds) ? ws.sessionIds.map(String) : [],
            createdAt: String(ws.createdAt || ''),
        };
        const c = classifyPath(base.path);
        if (c.kind === 'wsl') {
            const t = TITLE_RE.exec(base.title || '');
            const distro = (t && t[1].trim()) || c.distro;
            const wslPath = (t && t[2].trim().startsWith('/')) ? t[2].trim() : c.wslPath;
            return { ...base, kind: 'wsl', distro, wslPath };
        }
        return { ...base, kind: 'windows', distro: null, wslPath: null };
    }
    function findWslByCwd(cwd) {
        if (typeof cwd !== 'string' || !cwd)
            return undefined;
        const key = cwd.toLowerCase().replace(/[\\/]+$/, '');
        const list = (registry?.list?.() || []).map(describe).filter((d) => d.kind === 'wsl');
        const exact = list.find((d) => d.path.toLowerCase().replace(/[\\/]+$/, '') === key);
        if (exact)
            return exact;
        return list.find((d) => {
            const p = d.path.toLowerCase().replace(/[\\/]+$/, '');
            return key.startsWith(p + '\\') || key.startsWith(p + '/');
        });
    }
    // ---------------- wsl_bash tool ----------------
    ctx.tools.register(defineTool({
        name: 'wsl_bash',
        description: 'Execute a Linux command inside the active WSL workspace (Linux commands by default in WSL workspaces). The command runs with bash inside the workspace WSL distro, working directory defaults to the workspace Linux path. Use this instead of pwsh when the current session belongs to a WSL workspace.',
        parameters: {
            command: { type: 'string', required: true, description: 'The Linux command to run (bash syntax).' },
            cwd: { type: 'string', description: 'Linux working directory (absolute path); defaults to the active WSL workspace path.' },
        },
        output: {
            schema: {
                type: 'object',
                properties: {
                    ok: { type: 'boolean', required: true, description: 'Whether the command succeeded.' },
                    distro: { type: 'string', description: 'WSL distro that ran the command.' },
                    cwd: { type: 'string', description: 'Linux working directory used.' },
                    exitCode: { type: 'integer', description: 'Process exit code.' },
                    stdout: { type: 'string', description: 'Command stdout.' },
                    stderr: { type: 'string', description: 'Command stderr.' },
                    error: { type: 'string', description: 'Error message when the command failed.' },
                },
                additionalProperties: false,
            },
            render: (_args, value) => [{ type: 'text', text: stringifyRun(value) }],
            presentationMeta: (_args, value) => ({ ok: value.ok, exitCode: value.exitCode }),
        },
        timeoutMs: 120000,
        async execute(args, exec) {
            const agent = exec && exec.agent;
            const cwd = agent && agent.session && agent.session.header ? agent.session.header.cwd : undefined;
            const target = typeof cwd === 'string' ? findWslByCwd(cwd) : undefined;
            if (!target) {
                return { ok: false, error: '当前会话不在 WSL 工作区中。请先在左侧「＋ 工作区」中创建并打开一个 WSL 工作区。' };
            }
            const workdir = args && typeof args.cwd === 'string' && args.cwd.trim() ? normLinux(args.cwd) : target.wslPath;
            const script = `cd -- '${shq(workdir)}'\n${String(args && args.command || '')}`;
            const res = await runWsl({ distro: target.distro, args: ['bash', '-s'], stdin: script, signal: exec && exec.signal, timeoutMs: 120000 });
            return {
                ok: res.ok,
                distro: target.distro,
                cwd: workdir,
                exitCode: res.exitCode,
                stdout: res.stdout || '',
                stderr: res.stderr || '',
                error: res.error || null,
            };
        },
    }));
    function stringifyRun(v) {
        const out = (v.stdout || '').trim();
        const err = (v.stderr || '').trim();
        if (v.error && !out && !err)
            return v.error;
        return [out, err ? 'stderr: ' + err : '', 'exit: ' + String(v.exitCode)].filter(Boolean).join('\n') || '(no output)';
    }
    // ---------------- prompt context: default to Linux commands in WSL workspaces ----------------
    systemPrompt?.section({
        name: 'wsl:workspace-mode',
        order: 116,
        text: (assemble) => {
            try {
                const agent = assemble && assemble.agent;
                const cwd = agent && agent.session && agent.session.header ? agent.session.header.cwd : undefined;
                const target = typeof cwd === 'string' ? findWslByCwd(cwd) : undefined;
                if (!target)
                    return '';
                return '当前会话位于 WSL 工作区「' + target.title + '」（发行版 ' + target.distro + '，Linux 路径 ' + target.wslPath + '）。'
                    + '\n操作该工作区时默认使用 Linux 命令：优先调用 wsl_bash 工具（而非 pwsh）执行命令。'
                    + '文件工具（read/glob/grep/write/edit 等）可直接使用，其路径是该工作区在 Windows 侧的映射路径（' + target.path + '）。';
            }
            catch (e) {
                return '';
            }
        },
    });
    // ---------------- shellEnv: DSH_WSL_* facts for executions inside WSL workspaces ----------------
    shellEnv?.register({
        name: 'wsl-workspace',
        variables: {
            DSH_WSL_WORKSPACE: { description: '1 when the current session is inside a WSL workspace' },
            DSH_WSL_DISTRO: { description: 'WSL distro of the current WSL workspace' },
            DSH_WSL_PATH: { description: 'Linux path of the current WSL workspace' },
        },
        resolve(execution) {
            const agent = execution && execution.agent;
            const cwd = agent && agent.session && agent.session.header ? agent.session.header.cwd : undefined;
            const target = typeof cwd === 'string' ? findWslByCwd(cwd) : undefined;
            if (!target)
                return {};
            return { DSH_WSL_WORKSPACE: '1', DSH_WSL_DISTRO: target.distro, DSH_WSL_PATH: target.wslPath };
        },
    });
    // ---------------- client RPC (@Remote) ----------------
    // Host-side @Remote service exposing wslwk/* to the client bundle. SRC mode
    // derives wire fields from method parameter names, so every parameter below
    // is a simple identifier that matches the client's strict descriptor exactly.
    let WslwkService = (() => {
        let _classSuper = TypertRemoteService;
        let _instanceExtraInitializers = [];
        let _probe_decorators;
        let _home_decorators;
        let _listDir_decorators;
        let _run_decorators;
        let _list_decorators;
        let _create_decorators;
        let _delete_decorators;
        return class WslwkService extends _classSuper {
            static {
                const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
                _probe_decorators = [Remote('probe')];
                _home_decorators = [Remote('home')];
                _listDir_decorators = [Remote('list-dir')];
                _run_decorators = [Remote('run')];
                _list_decorators = [Remote('list')];
                _create_decorators = [Remote('create')];
                _delete_decorators = [Remote('delete')];
                __esDecorate(this, null, _probe_decorators, { kind: "method", name: "probe", static: false, private: false, access: { has: obj => "probe" in obj, get: obj => obj.probe }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(this, null, _home_decorators, { kind: "method", name: "home", static: false, private: false, access: { has: obj => "home" in obj, get: obj => obj.home }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(this, null, _listDir_decorators, { kind: "method", name: "listDir", static: false, private: false, access: { has: obj => "listDir" in obj, get: obj => obj.listDir }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(this, null, _run_decorators, { kind: "method", name: "run", static: false, private: false, access: { has: obj => "run" in obj, get: obj => obj.run }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(this, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: obj => "create" in obj, get: obj => obj.create }, metadata: _metadata }, null, _instanceExtraInitializers);
                __esDecorate(this, null, _delete_decorators, { kind: "method", name: "delete", static: false, private: false, access: { has: obj => "delete" in obj, get: obj => obj.delete }, metadata: _metadata }, null, _instanceExtraInitializers);
                if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            }
            constructor(c) {
                super(c, 'wslwk');
                __runInitializers(this, _instanceExtraInitializers);
            }
            async probe() {
                const res = await runWsl({ args: ['--list', '--quiet'] });
                if (!res.ok)
                    return { wslOk: false, distros: [], error: res.error || 'wsl.exe 不可用' };
                const distros = String(res.stdout || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
                if (distros.length === 0)
                    return { wslOk: false, distros: [], error: '未检测到 WSL 发行版' };
                return { wslOk: true, distros };
            }
            async home(distro) {
                const res = await runWsl({ distro: String(distro || ''), args: ['bash', '-c', 'echo "$HOME"'] });
                if (!res.ok)
                    return { ok: false, error: res.error || '无法获取 HOME' };
                const path = String(res.stdout || '').trim();
                if (!path)
                    return { ok: false, error: 'HOME 为空' };
                return { ok: true, path: normLinux(path) };
            }
            async listDir(distro, path) {
                const p = normLinux(path);
                const res = await runWsl({ distro: String(distro || ''), args: ['ls', '-1A', '--file-type', '--', p] });
                if (!res.ok)
                    return { ok: false, error: res.error || '无法列出目录' };
                const entries = [];
                for (const raw of String(res.stdout || '').split(/\r?\n/)) {
                    const line = raw.trim();
                    if (!line)
                        continue;
                    const dir = line.endsWith('/');
                    const name = dir ? line.slice(0, -1) : line;
                    if (!name || name === '.' || name === '..')
                        continue;
                    entries.push({ name, dir });
                }
                return { ok: true, path: p, entries };
            }
            async run(distro, command) {
                const res = await runWsl({ distro: String(distro || ''), args: ['bash', '-c', String(command || '')] });
                return { ok: res.ok, exitCode: res.exitCode, stdout: res.stdout || '', stderr: res.stderr || '', error: res.error || null };
            }
            list() {
                const items = (registry?.list?.() || []).map(describe);
                return { items };
            }
            async create(payload) {
                if (!registry)
                    throw new Error('workspaceRegistry 服务不可用');
                const kind = payload && payload.kind;
                if (kind !== 'wsl') {
                    const winPath = String(payload && payload.winPath || '').trim();
                    if (!winPath)
                        throw new Error('未选择 Windows 文件夹');
                    const ws = await registry.create(winPath);
                    return { workspaceId: String(ws.id) };
                }
                const distro = String(payload.distro || '').trim();
                const wslPath = normLinux(payload.wslPath);
                if (!distro)
                    throw new Error('缺少 WSL 发行版名称');
                if (!wslPath)
                    throw new Error('缺少 Linux 路径');
                const title = '🐧 ' + distro + ': ' + wslPath;
                const rel = wslPath.replace(/^\//, '').replace(/\//g, BS);
                const fallback = String(payload.fallbackRoot || '').trim().replace(/[\\/]+$/, '');
                const winPath = fallback ? (fallback + BS + rel) : (UNC_PREFIX1 + distro + BS + rel);
                const ws = await registry.create(winPath, title);
                return { workspaceId: String(ws.id) };
            }
            async delete(workspaceId) {
                if (!registry)
                    throw new Error('workspaceRegistry 服务不可用');
                const removed = await registry.delete(String(workspaceId));
                if (removed === false)
                    throw new Error('工作区不存在或已删除');
                return { ok: true };
            }
        };
    })();
    new WslwkService(ctx);
}
