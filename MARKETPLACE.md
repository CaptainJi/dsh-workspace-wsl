# 上架 awesome-dsh-plugin 插件市场

本文档记录把 `@deepseek-ai/dsh-workspace-wsl` 上架到
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 所需的修改与步骤。

## 一、本仓库需满足的硬性要求（已完成/进行中）

| 要求 | 状态 |
|------|------|
| `package.json` 声明 `dsh.bundle.patch`（可被 `dsh plugin add` 安装） | ✅ |
| 仓库根有 `cordis.patch.yml`（`- insert: - id: …  name: …`，name 加引号） | ✅ |
| 只发前端时声明 `dsh.client`（`platform: web`） | ✅ |
| `repository` 字段指向本仓库 | ✅ |
| 官方 `@deepseek-ai/*` 放 `peerDependencies`（且带显式预发布分支） | ✅ |
| 仓库创建满 1 天、提交数 ≥ 10 | ⏳ 见下 |
| 给仓库加 `dsh-plugin` topic（GitHub 仓库设置） | ⏳ 你操作 |
| 描述只写功能、无营销词、与实际代码一致 | ✅ |
| 分类 `ui` | ✅ |

### 提交数 ≥ 10
本仓库当前提交数不足 10。剩余真实工作（客户端 web bundle 构建 + `@Remote` RPC）完成并逐条提交后即达标。

## 二、市场条目（提交到 awesome-dsh-plugin 仓库）

向 `awesome-dsh-plugin` 提 PR，只新增一个文件
`data/plugins/CaptainJi__dsh-workspace-wsl.yml`：

```yaml
url: https://github.com/CaptainJi/dsh-workspace-wsl
name: CaptainJi/dsh-workspace-wsl
category: ui
description:
  en: 'Add and manage Windows and WSL workspaces from the sidebar; WSL workspaces run Linux commands by default.'
  zh: '从侧边栏添加并管理 Windows 与 WSL 工作区；WSL 工作区默认以 Linux 命令操作。'
```

然后重新生成 README 并一起提交：

```sh
npm ci
node scripts/generate-readme.mjs
```

## 三、剩余待办（客户端 bundle + RPC）

- `dist/client.js`（`window.__ModuleLoader__` web 模块）需官方 web 构建产出（`pnpm build:client`，需联网）。
- 客户端 → 主机 RPC（`wslwk/*`）需按框架 `@Remote`/服务通道接线，替换当前 `client/index.tsx` 里的 `style`/`rpc` 两个 shim。

## 四、截图（可选，推荐）

在仓库根放 `screenshots.json`，列出 1–8 张图片路径（相对该文件、指向仓库内图片）。

```json
[
  "assets/screenshot-1.png",
  "assets/screenshot-2.png"
]
```
