# Engineer Brain — 环境搭建指南

## 快速开始（一键脚本）

```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
```

脚本会交互式引导安装所有依赖并生成配置文件。

非交互模式（CI / 自动化）：
```powershell
# 先设置环境变量，再加 -NonInteractive 运行
$env:EB_DATA_ROOT = "D:\EngineerBrain-Data"
$env:EB_POD_ALIAS = "yourname@microsoft.com"
$env:OPENAI_API_KEY = "sk-..."
$env:KUSTO_CLUSTER_URI = "https://your-cluster.kusto.chinacloudapi.cn"
powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1 -NonInteractive
```

---

## 前置依赖

| 依赖 | 版本 | 安装方式 |
|------|------|---------|
| **Node.js** | 20+ | https://nodejs.org/ |
| **Git** | 任意 | https://git-scm.com/ |
| **Microsoft Edge** | 任意 | Windows 预装（Playwright 需要 msedge） |
| **PowerShell** | 5.1+ | Windows 预装 |
| **jq** | 1.6+ | `winget install jqlang.jq`（Claude Code status line 需要） |
| **playwright-cli** | 任意 | `npm install -g @playwright/cli`（D365 浏览器操作） |

---

## 依赖全景

项目在 `git clone` 之外有三层依赖：

```
第 1 层：npm 包              → package.json（已在 git 中）
第 2 层：外部 MCP 服务器      → Agency CLI + local-rag（不在 git 中）
第 3 层：本机配置             → .mcp.json + config.json（不在 git 中）
```

### 第 1 层：npm 包

```bash
cd dashboard && npm install   # 后端（Hono + Claude Agent SDK）
                               # 自动触发：cd web && npm install（React + Vite 前端）
```

项目有两个 `package.json`，但只需执行一次 `npm install`（postinstall hook 自动处理 `web/`）。

### 第 2 层：外部 MCP 服务器

#### Agency CLI（提供 5 个 MCP 服务器）

Agency CLI 是微软内部工具，提供以下 MCP 服务器：
- **icm** — 事件管理（D365 Case）
- **teams** — Microsoft Teams 消息
- **kusto** — Azure Data Explorer / Kusto 查询
- **msft-learn** — Microsoft Learn 文档搜索
- **mail** — Microsoft 365 邮件

```powershell
# 安装（仅 Windows）
iex "& { $(irm aka.ms/InstallTool.ps1) } agency"

# 验证
& "$env:APPDATA\agency\CurrentVersion\agency.exe" --version
```

安装后需要登录认证：
```powershell
agency auth login        # 浏览器交互式登录
```

#### local-rag MCP（OneNote 向量搜索）

基于 LanceDB 的语义文档搜索 MCP 服务器。fork 自 [shinpr/mcp-local-rag](https://github.com/shinpr/mcp-local-rag)，增加了 Azure OpenAI + fallback embedding 支持。

```bash
# 自动安装（bootstrap 脚本会自动执行）
# 或手动：
git clone https://github.com/mikaelfun/eb-local-rag.git ~/.claude/mcp-servers/local-rag
cd ~/.claude/mcp-servers/local-rag
npm install

# 验证
ls dist/index.js   # 仓库自带 dist，无需 build
```

**所需数据目录**（不在 git 中，通过 `config.json → dataRoot` 配置）：
- `{dataRoot}/OneNote Export/` — 导出的 OneNote 页面（~1.4 GB）
- `{dataRoot}/lancedb/` — LanceDB 向量索引（~4.7 GB，首次 ingest 时自动构建）

#### Playwright CLI（D365 浏览器操作）

`skills/d365-case-ops/` 脚本通过它在 Edge 浏览器中操作 D365 CRM。

```bash
# 全局安装
npm install -g @playwright/cli

# 验证
playwright-cli --version
```

提供 `playwright-cli` 命令（open/tab-list/run-code/kill-all），用于通过浏览器 session 调用 D365 OData API。

#### Playwright MCP（Claude 的浏览器自动化）

通过 `npx @playwright/mcp@latest` 自动安装，无需手动操作。
要求 **Microsoft Edge**（本项目不支持 Chrome）。

### 第 3 层：本机配置

#### `config.json`（项目根目录）

模板：`config.template.json`

```jsonc
{
  "casesRoot": "./cases",                        // 相对路径，可移植
  "dataRoot": "C:\\Users\\you\\EngineerBrain-Data",  // 绝对路径，本机特有
  "teamsSearchCacheHours": 4,
  "noteGapThresholdDays": 3,
  "podAlias": "youralias@microsoft.com",         // 你的 support pod 邮箱
  "onenote": {
    "personalNotebook": "Your OneNote",          // 你的个人笔记本名
    "teamNotebooks": ["MCVKB"],                  // 团队知识库笔记本
    "freshnessThresholdMonths": 12,
    "autoRagSync": true
  }
}
```

#### `.mcp.json`（项目根目录）

模板：`.mcp.json.template`

包含 MCP 服务器配置（路径 + API 密钥）。**绝对不要提交到 git。**

需要填写的字段：
| 占位符 | 说明 | 示例 |
|-------|------|------|
| Agency CLI 路径 | bootstrap 自动检测 | `%APPDATA%\agency\CurrentVersion\agency.exe` |
| `KUSTO_CLUSTER_URI` | 你的 Kusto 集群 | `https://cluster.region.kusto.chinacloudapi.cn` |
| `KUSTO_DATABASE` | 默认数据库 | `AKSprod` |
| `AZURE_CONFIG_DIR` | Kusto 认证用的 Azure CLI profile | `C:\Users\you\.azure-profiles\profile1` |
| `OPENAI_API_KEY` | local-rag embedding 用 | `sk-...` |
| `AZURE_EMBEDDING_*` | 备用 embedding 服务 | Azure Cognitive Services endpoint + key |

#### `dashboard/.env`（自动生成）

```env
JWT_SECRET=<随机32字符>     # bootstrap 自动生成
PORT=3010                    # 后端 API 端口
```

#### Claude Code Status Line

左下角显示 model 名称 + context 用量百分比，需要在 `~/.claude/settings.json` 中配置：

```jsonc
{
  // ...其他配置...
  "statusLine": {
    "type": "command",
    "command": "input=$(cat); model=$(echo \"$input\" | jq -r '.model.display_name // empty'); used=$(echo \"$input\" | jq -r '.context_window.used_percentage // empty'); printf '%s' \"$model\"; [ -n \"$used\" ] && printf ' | Context: %.0f%%' \"$used\""
  }
}
```

**前置依赖**：`jq`（`winget install jqlang.jq`）。配置后需重启 Claude Code 会话生效。

---

## Azure 认证

Kusto 查询需要在配置的 profile 中登录 Azure CLI：

```powershell
# 使用独立 Azure profile：
$env:AZURE_CONFIG_DIR = "C:\Users\you\.azure-profiles\cme-profile"
az login

# 或使用默认 profile：
az login
```

---

## 启动 Dashboard

```bash
cd dashboard

# 开发模式（热重载，同时启动前后端）
npm run dev

# 或分别启动：
PORT=3010 node --import tsx/esm --watch src/index.ts   # 后端
cd web && npx vite --port 5173                          # 前端
```

| 服务 | 端口 | 地址 |
|------|------|------|
| 前端（Vite） | 5173 | http://localhost:5173 |
| 后端（Hono） | 3010 | http://localhost:3010/api/* |

前端自动将 `/api/*` 请求代理到后端。

---

## 文件清单（git 内 vs git 外）

```
在 GIT 中（版本控制）：
├── dashboard/package.json          # 后端依赖
├── dashboard/web/package.json      # 前端依赖
├── .mcp.json.template              # MCP 配置模板（无密钥）
├── config.template.json            # 项目配置模板
├── dashboard/.env.example          # 环境变量模板
├── scripts/bootstrap.ps1           # 一键安装脚本
├── SETUP.md                        # 本文档
└── CLAUDE.md                       # Claude Code 指令

不在 GIT 中（每台机器生成）：
├── .mcp.json                       # MCP 配置（含真实路径 + 密钥）
├── config.json                     # 项目配置（含真实路径）
├── dashboard/.env                  # JWT 密钥 + 端口
├── dashboard/node_modules/         # npm 包
├── dashboard/web/node_modules/     # npm 包
├── cases/                          # Case 数据（运行时）
└── {dataRoot}/                     # 外部数据（OneNote、lancedb）

不在项目目录中（外部工具）：
├── %APPDATA%/agency/               # Agency CLI
└── ~/.claude/mcp-servers/local-rag/ # local-rag MCP 服务器
```

---

## 常见问题排查

### Agency CLI 安装失败
```powershell
# 手动下载安装
irm aka.ms/InstallTool.ps1 -OutFile install-agency.ps1
.\install-agency.ps1 agency
```

### local-rag 构建失败
```bash
# 清理后重新安装（仓库自带 dist，不需要 build）
cd ~/.claude/mcp-servers/local-rag
rm -rf node_modules
npm install
```

### local-rag 未安装
```bash
git clone https://github.com/mikaelfun/eb-local-rag.git ~/.claude/mcp-servers/local-rag
cd ~/.claude/mcp-servers/local-rag && npm install
```

### Kusto "Unauthorized" 错误
```powershell
# 使用正确的 Azure profile 重新登录
$env:AZURE_CONFIG_DIR = "C:\Users\you\.azure-profiles\your-profile"
az login
az account show   # 确认订阅正确
```

### "Cannot find package 'tsx'"
```bash
cd dashboard && npm install   # 重新安装依赖
```

### 端口被占用
```powershell
# 查找并结束进程
netstat -ano | findstr :3010
taskkill /F /PID <pid>
```

### Dashboard 设密码时 "connection error"
`dashboard/.runtime/` 目录不存在导致写 auth 文件失败。已在 `config.ts` 中添加自动创建逻辑，如仍出现可手动创建：
```bash
mkdir -p dashboard/.runtime
```

---

## claude-to-im（飞书桥接）

通过飞书 Bot 与 Claude Code 对话。支持 streaming cards、工具进度显示、权限审批按钮。

### 安装

需要两个仓库并排放置（`package.json` 依赖 `"claude-to-im": "file:../Claude-to-IM"`）：

```bash
cd .agents/skills/

# ⚠️ Windows 大小写不敏感，不能同时有 claude-to-im/ 和 Claude-to-IM/
# 所以 skill 目录需命名为 claude-to-im-skill/
git clone https://github.com/op7418/Claude-to-IM.git          # core library
git clone https://github.com/op7418/Claude-to-IM-skill.git claude-to-im-skill  # skill

# 安装 + 构建
cd Claude-to-IM && npm install && cd ..
cd claude-to-im-skill && npm install && npm run build && cd ..

# 复制到 .claude/skills/（Windows symlink 不可靠，用 cp）
cp -r claude-to-im-skill/ ../../.claude/skills/claude-to-im/
```

### Windows 补丁（必须）

上游代码有 9 个 Windows bug，需要打补丁后重新 `npm run build`：

| Bug | 文件 | 修复 |
|-----|------|------|
| 1,7 | `src/llm-provider.ts` | `.js`/`.mjs` 路径加 `node` 前缀 |
| 8 | `src/llm-provider.ts` | `X_OK` → `R_OK`（Windows 无 execute bit） |
| 6 | `src/main.ts` | 手动将 `config.env` 注入 `process.env` |
| 2 | `scripts/supervisor-windows.ps1` | `Join-Path` 嵌套调用（PS 5.1 兼容） |
| 3 | `scripts/supervisor-windows.ps1` | `$pid` → `$bridgePid`（**全局替换**，含函数参数） |
| 4 | `scripts/supervisor-windows.ps1` | 添加 `Load-ConfigEnv` 函数 |
| 5 | `scripts/supervisor-windows.ps1` | 启动超时 3s → 8s |
| 9 | `scripts/supervisor-windows.ps1` | stdout/stderr 分开重定向到不同文件 |
| 10 | `feishu-adapter.ts` (core lib) | cardkit v2 不可用时 fallback 到 v1 静态卡片 |

详细修复代码见 [claude-to-im-setup-guide](https://github.com/mikaelfun/claude-code-learning/blob/main/claude-to-im-setup-guide.md)。

### 配置

```bash
mkdir -p ~/.claude-to-im/{data,logs,runtime,data/messages}
```

编辑 `~/.claude-to-im/config.env`：

```bash
CTI_RUNTIME=claude
CTI_ENABLED_CHANNELS=feishu
CTI_DEFAULT_WORKDIR=C:\Users\you\your-project
CTI_DEFAULT_MODE=code
CTI_CLAUDE_CODE_EXECUTABLE=C:\Users\you\AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code\cli.js
CTI_FEISHU_APP_ID=cli_xxxxxxxxxx
CTI_FEISHU_APP_SECRET=your_secret
CTI_FEISHU_DOMAIN=https://open.feishu.cn
# 自动批准所有工具权限（跳过飞书审批按钮）
CTI_AUTO_APPROVE=true
# 卡片模式：v1=流式卡片（打字机效果）, text=纯文本
CTI_FEISHU_CARD_MODE=v1
```

> **关键**：`CTI_CLAUDE_CODE_EXECUTABLE` 必须指向 `cli.js`，不能指向 npm shim。

### 飞书开放平台部署（两轮发布）

**Phase 1（创建应用 + 权限 + Bot）：**

1. [飞书开放平台](https://open.feishu.cn/app) → 创建自定义应用 → 记录 App ID / App Secret
2. 权限管理 → 批量开通，粘贴以下 JSON：
   ```json
   {
     "scopes": {
       "tenant": [
         "im:message:send_as_bot", "im:message:readonly",
         "im:message.p2p_msg:readonly", "im:message.group_at_msg:readonly",
         "im:message:update", "im:message.reactions:read",
         "im:message.reactions:write_only", "im:chat:read",
         "im:resource", "cardkit:card:write", "cardkit:card:read"
       ],
       "user": []
     }
   }
   ```
3. 添加应用能力 → 启用 **机器人**
4. 版本管理 → 创建 v1.0.0 → 提交审核 → 管理员审批

**Phase 2（事件订阅，需要 bridge 运行中）：**

5. 启动 bridge：`/claude-to-im start`
6. 事件与回调 → 派发方式选 **长连接** → 添加：
   - 事件：`im.message.receive_v1`
   - 回调：`card.action.trigger`
7. 创建 v1.1.0 → 提交审核 → 管理员审批

> Phase 2 必须在 bridge 运行后操作，否则飞书报"未检测到应用连接信息"。

### 飞书流式卡片补丁

上游 claude-to-im 的飞书 CardKit API 适配有 bug（引用了不存在的 v2 命名空间）。`package.json` 的 `postinstall` 脚本会自动打补丁：

```bash
cd .claude/skills/claude-to-im
npm install   # 自动执行 postinstall → patch-feishu-streaming.js
npm run build # 重新打包
```

补丁内容和排查指南见 `references/troubleshooting.md`。
