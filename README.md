# @deepseek-ai/dsh-workspace-wsl

给 DeepSeek Harness 添加 **Windows / WSL 工作区**的插件：从侧边栏添加并管理 Windows 与 WSL 工作区；WSL 工作区默认以 Linux 命令操作。

这是**可安装、可发布到 DSH 插件市场**的正规插件包（npm 包），由官方脚手架 `pnpm create dsh-plugin`（webui 模板）生成。

## 结构

```
dsh-workspace-wsl/            <- 仓库根 = 插件包
├── package.json              # name @deepseek-ai/dsh-workspace-wsl, dsh.client 声明
├── cordis.patch.yml          # 组合挂载行（id/name）
├── src/index.ts              # Host 半边（wsl_bash 工具 + WSL 提示词 + DSH_WSL_* 环境变量 + wsl.exe 后端 + @Remote wslwk/* 服务）
├── client/index.tsx          # 客户端源码（侧边栏按钮 + 弹窗，待官方 web 构建）
├── tsconfig.json
└── dist/                     # tsc 构建产物（index.js）
```

## 构建

```bash
pnpm install
pnpm build            # tsc -p tsconfig.json → dist/index.js（Host）
pnpm build:client     # 官方 web 构建 → dist/client.js（客户端 __ModuleLoader__ 模块，需联网 + 官方工具）
```

## 能力

- **Host**（`src/index.ts`）：`wsl_bash` 模型工具（WSL 工作区默认 Linux 命令）、`wsl:workspace-mode` 系统提示词段、`DSH_WSL_WORKSPACE/DSH_WSL_DISTRO/DSH_WSL_PATH` 环境变量、`wsl.exe` 执行后端，以及暴露给客户端的 `@Remote` 服务（`wslwk/probe`、`home`、`list-dir`、`run`、`list`、`create`、`delete`）。
- **Client**（`client/index.tsx`）：侧边栏底部「＋ 工作区」按钮 + 弹窗（Windows 原生选目录 / WSL 发行版 + 目录浏览）、接管内置“＋”添加入口；客户端经 `ctx.remote.wslwk.*` 调用 Host 的 `@Remote` 服务，样式以 `<style>` 注入。

## 注意事项

- 客户端 UI 依赖 `@deepseek-ai/dsh-client-*` 与官方 web 打包（`dist/client.js`）；`client/index.tsx` 已用官方包客户端 API 实现（`ctx.slots.inject/register` + `ctx.remote.wslwk.*` @Remote 调用 + `<style>` 注入），待 `pnpm build:client` 产出 web bundle 即可生效。
- 沙箱内 `wsl.exe` 会被拒绝（E_ACCESSDENIED），但插件在宿主进程内调用，不受此限制。
- 若 `wsl.exe` 可用但 UNC（`\\wsl$\...`）不可访问，可在 WSL 步骤填写「Windows 挂载根目录」（如 `D:\WSL`）。
