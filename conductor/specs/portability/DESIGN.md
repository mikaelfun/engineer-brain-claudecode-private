# EngineerBrain Portability & Bootstrap Architecture Design

> 从"个人工具"进化为"可复用平台"的顶层设计。
> Created: 2026-04-24 | Status: Draft

## 1. 设计目标（三级移植场景）

| 场景 | 谁移植 | 改什么 | 目标耗时 |
|------|-------|-------|---------|
| **L1: 同一工程师换电脑** | Kun Fang 新机器 | 跑 bootstrap → 填路径 → 完成 | < 30 分钟 |
| **L2: 同 POD 新工程师** | 新人加入 VM+SCIM POD | bootstrap + 填个人信息 + 建 humanizer profile | < 1 小时 |
| **L3: 不同 scope 工程师** | Global Networking 工程师 | bootstrap + 换 cloud profile + 建产品知识库 | < 2 小时（不含知识积累） |

## 2. 现状诊断

### 2.1 硬编码分布（扫描数据）

| 维度 | 硬编码数量 | 当前 config.json 覆盖 | 移植难度 |
|------|-----------|---------------------|---------|
| 工程师身份 | ~50 处（邮箱/名字/D365 ID） | 部分（`engineerName`, `defaultCcEmails`） | 🟡 中 |
| Windows 路径 | ~80 处（脚本/源码/文档） | ❌ 无 | 🟡 中 |
| Azure Profile | ~15 处 | 部分（`azProfile.global/mooncake`） | 🟢 低 |
| 云环境（Mooncake vs Global） | ~30 处（compliance/SAP/Kusto/21v规则） | 仅 `cloud` 字段 | 🔴 高 |
| D365 实例 | ~15 处（URL/appId/userId） | ❌ 无 | 🟡 中 |
| POD/Team | ~10 处 | 部分（`pod`, `podAlias`） | 🟢 低 |

### 2.2 设计良好的部分（保持不变）

- **产品知识层**：registry + 动态目录（`products/{product}/`），新产品零改编排代码
- **编排层**：casework pipeline 产品无关，换产品不需改编排
- **Kusto 产品隔离**：`kusto/{product}/` 各自独立，含 clusters.csv + queries/ + tables/
- **SAP 匹配引擎**：`match-sap.py` 数据驱动，通过 `sap-scope.json` 配置

### 2.3 关键问题文件

| 文件 | 问题 | 优先级 |
|------|------|--------|
| `config.json` | API Key 明文；缺 engineer/d365/cc 结构化字段 | P0 |
| `dashboard/web/src/pages/CaseDetail.tsx:1188-1189` | 硬编码 `fangkun@microsoft.com` + `defaultCC` | P0 |
| `d365-case-ops/scripts/_init.ps1:22-23` | 硬编码 D365 userId/userName | P0 |
| `dashboard/src/services/az-profile-reader.ts:44-47` | 硬编码 4 个 Azure profile 名 | P1 |
| `compliance-rules.md` | 100% Mooncake 逻辑，无 cloud 分支 | P1 |
| `humanizer/rules-*-kunfang.md` | 个人 profile 在仓库内 | P1 |
| `~15 个脚本` | 硬编码 Windows 绝对路径 | P2 |

## 3. 架构设计

### 3.1 三层分离模型

```
┌──────────────────────────────────────────────────┐
│                  config.json (扩展)                │
│  ┌─────────────┐ ┌───────────┐ ┌───────────────┐ │
│  │  engineer    │ │  cloud    │ │  services     │ │
│  │  ├ name      │ │  ├ target │ │  ├ d365       │ │
│  │  ├ email     │ │  ├ azProf │ │  ├ newapi     │ │
│  │  ├ d365Id    │ │  └ compli │ │  ├ kusto      │ │
│  │  └ signature │ │    ance   │ │  └ onenote    │ │
│  └─────────────┘ └───────────┘ └───────────────┘ │
│  ┌─────────────┐ ┌───────────┐ ┌───────────────┐ │
│  │  cc (3-layer)│ │  paths    │ │  dashboard    │ │
│  │  ├ personal  │ │  ├ cases  │ │  ├ ports      │ │
│  │  ├ team      │ │  ├ data   │ │  └ sse        │ │
│  │  └ static    │ │  └ patrol │ │               │ │
│  └─────────────┘ └───────────┘ └───────────────┘ │
└──────────────────────────────────────────────────┘
              ↓ 消费层 ↓
  ┌──────────────────────────────────┐
  │  config-resolver (统一读取层)     │
  │  TypeScript: dashboard/src/config│
  │  Shell:  scripts/lib/config.sh   │
  │  PS1:    scripts/lib/config.ps1  │
  │  Python: scripts/lib/config.py   │
  └──────────────────────────────────┘
              ↓ 编排层 ↓
  ┌──────────────────────────────────┐
  │  casework / patrol / skills      │
  │  (产品无关，通过 config 变量引用)  │
  └──────────────────────────────────┘
              ↓ 知识层 ↓
  ┌──────────────────────────────────┐
  │  products/{product}/             │
  │  kusto/{product}/                │
  │  compliance-profiles/{cloud}.md  │
  │  humanizer/profiles/{name}/      │
  └──────────────────────────────────┘
```

### 3.2 config.json v2 Schema

```jsonc
{
  // === 工程师身份 ===
  "engineer": {
    "name": "Kun Fang",           // 显示名（邮件签名、Dashboard）
    "alias": "fangkun",           // 短名（Note title、assess 规则）
    "email": "fangkun@microsoft.com",
    "humanizerProfile": "kunfang" // humanizer/profiles/{this}/
  },

  // === CC 三层 ===
  "cc": {
    "personal": ["fangkun@microsoft.com"],     // 工程师自己的邮箱
    "team": ["mcpodvm@microsoft.com"],          // POD 邮箱
    "static": ["vivianx@microsoft.com"]         // 固定 CC（manager 等）
  },
  // 合并逻辑: base = personal ∪ team ∪ static → + RDSE CC → + personal-cc.json rules → 去重

  // === 云环境 ===
  "cloud": "mooncake",             // "mooncake" | "global"
  "complianceProfile": "mooncake", // compliance-profiles/{this}.md

  // === D365 (Phase 7 延迟填充) ===
  "d365": {
    "baseUrl": "onesupport.crm.dynamics.com",
    "appId": "101acb62-8d00-eb11-a813-000d3a8b3117",
    "userId": "pending",           // 首次启动 Dashboard 时通过 WhoAmI() 自动获取
    "userName": "pending"
  },

  // === 团队 ===
  "pod": "VM+SCIM",
  "podAlias": "mcpodvm@microsoft.com",

  // === Azure 认证 ===
  "azProfile": {
    "global": "fangkun-corp",      // az-profile-switch 创建的 profile 名
    "mooncake": "fangkun-cme"
  },

  // === 路径 ===
  "casesRoot": "../data/cases",
  "dataRoot": "../data",
  "patrolDir": "../data/.patrol",

  // === Kusto 知识源 (mooncake only) ===
  "kustoSource": {
    "repo": "https://dev.azure.com/CSS-Mooncake/SCIM/_git/CopilotSkills",
    "path": "kusto/",
    "skipProducts": ["vm"]         // 本地比仓库新的产品，不从仓库拉
  },

  // === OneNote ===
  "onenote": {
    "personalNotebook": "Kun Fang OneNote",
    "teamNotebooks": ["MCVKB", "Mooncake POD Support Notebook"],
    "freshnessThresholdMonths": 12,
    "autoRagSync": true
  },

  // === 运行参数 ===
  "teamsSearchCacheHours": 8,
  "patrolSkipHours": 3,
  "noteGapThresholdDays": 3,

  // === Dashboard ===
  "dashboard": {
    "serverPort": 3010,
    "webPort": 5173
  },
  "sse": {
    "toolCallContentMaxLen": 2000,
    "toolResultMaxLen": 5000,
    "responseMaxLen": 5000,
    "thinkingMaxLen": 5000
  },

  // === LLM Gateway (key 移到 .env) ===
  "newapi": {
    "base": "https://kunnewapi.net/v1",
    "model": "gpt-5.4-mini"
    // key → EB_NEWAPI_KEY 环境变量或 dashboard/.env
  },

  // === 向后兼容 (6 个月后移除) ===
  "engineerName": "Kun",                     // → engineer.name
  "defaultCcEmails": "mcpodvm@...;fangkun@..." // → cc.* 合并
}
```

### 3.3 CC 三层合并逻辑

当前 compliance-rules.md §3 的 CC 合并改为：

```
Step 1: base CC = cc.personal ∪ cc.team ∪ cc.static          ← config.json
Step 2: RDSE CC = {dataRoot}/mooncake-cc.json 按客户匹配     ← 已有
Step 3: custom CC = {dataRoot}/personal-cc.json 按规则匹配    ← 新增
Step 4: 合并去重（以邮箱为 key，忽略大小写）
```

`personal-cc.json` 格式（可选，不存在则跳过）：

```jsonc
{
  "rules": [
    {
      "match": { "customer": "Contoso*" },
      "cc": ["tam@microsoft.com", "lead@microsoft.com"]
    },
    {
      "match": { "sap": "*Cosmos DB*" },
      "cc": ["cosmosdb-pod@microsoft.com"]
    }
  ]
}
```

向后兼容：新逻辑优先读 `cc` 对象，若不存在 fallback 到 `defaultCcEmails` 字符串解析。

### 3.4 Compliance Profile 分离

```
playbooks/rules/
  ├── compliance-rules.md           → 通用框架（检查流程 + 结果 Schema + SAP 检查）
  ├── compliance-profiles/
  │   ├── mooncake.md               → §1 Entitlement（21V Exhibit / ASfP 白名单 / India）
  │   │                               §2 21vConvert 检测
  │   │                               mooncake-specific SAP --scope mooncake-first
  │   └── global.md                 → §1 Entitlement（Unified/Premier → ok）
  │                                   无 21vConvert
  │                                   SAP --scope global
  └── cc-data/                      → 移到 {dataRoot}/ 下
```

通用 compliance-rules.md 引用方式：

```
读取 compliance-profiles/{config.complianceProfile}.md 获取 cloud-specific 判定规则
```

**Entitlement 通用框架**（保留在 compliance-rules.md）：
- 从 case-info.md 读 Entitlement 表
- 调用 profile-specific 规则判定 entitlementOk
- 输出 warnings
- SAP 三层检查（sapMooncake → sapInScope, scope 参数化）
- CC 合并
- 结果 Schema

**Mooncake profile 特有规则**（当前全部内容搬到 mooncake.md）：
- Unified/Premier + "China Cloud"/"21V" 信号
- Professional + "21Vianet Cloud Escalation Service"
- ASfP 白名单（4 家中国公司）
- India Contract 排斥
- 21v Convert 检测
- `--scope mooncake-first`

**Global profile 初始版本**（极简）：
- Unified/Premier → entitlementOk=true（无 exhibit 要求）
- 无 21vConvert
- `--scope global`

### 3.5 Humanizer Profile 分离

```
.claude/skills/humanizer/
  ├── profiles/                     → .gitignore（每个工程师本地）
  │   └── kunfang/
  │       ├── rules-en.md           ← 从当前 rules-en-kunfang.md 移入
  │       ├── rules-zh.md           ← 从当前 rules-zh-kunfang.md 移入
  │       └── training-samples/     ← mimic 训练数据
  ├── rules-template-en.md          → 提交到仓库，新人入门模板
  ├── rules-template-zh.md          → 同上
  └── SKILL.md                      → 引用 profiles/{config.engineer.humanizerProfile}/
```

规则：
- `profiles/` 加入 `.gitignore`
- 同一工程师换电脑：复制 `profiles/{alias}/` 目录（或 OneDrive 同步）
- 新工程师：bootstrap 时跳过，提示后续跑 `/humanizer mimic`
- SKILL.md 引用逻辑：找 `profiles/{profile}/rules-{lang}.md`，不存在 fallback `rules-template-{lang}.md`

### 3.6 Kusto 知识库拉取

```
Bootstrap 条件：config.cloud == "mooncake"
  → git clone --sparse CopilotSkills 仓库
  → 复制 kusto/ 到 .claude/skills/kusto/
  → 跳过 kustoSource.skipProducts 中列出的产品（本地更新）

Global：跳过 Kusto 初始化（Global team 不使用 Kusto）
```

后续增量更新由 `product-learn` skill 管理。

## 4. Bootstrap 流程

前提：全新 Windows 电脑，已加入 Microsoft domain，已登录工程师账户，其他为零。

### Phase 1: 系统依赖（CLI 全自动）

```
检查 + 自动安装 (winget):
  • Node.js 20+
  • Git
  • Edge (已预装)
  • PowerShell 7
  • jq
npm global:
  • @anthropic-ai/claude-code
  • @anthropic-ai/claude-code-playwright
```

### Phase 2: 身份配置（交互式 CLI）

```
问工程师:
  • 姓名 (full name): "Kun Fang"
  • 别名 (alias): "fangkun"            → 自动推导: humanizerProfile, azProfile 名
  • 邮箱: "fangkun@microsoft.com"      → 自动推导: personal CC
  • 云环境: [mooncake / global]         → 自动推导: complianceProfile, kustoSource
  • POD 名称: "VM+SCIM"
  • POD 邮箱: "mcpodvm@microsoft.com"   → 自动推导: team CC
  • Team CC: "vivianx@microsoft.com"    → static CC（可选多个，逗号分隔）

自动推导:
  • cc.personal = [邮箱]
  • cc.team = [POD 邮箱]
  • cc.static = [Team CC]
  • engineer.humanizerProfile = alias
  • azProfile.global = "{alias}-corp"
  • azProfile.mooncake = "{alias}-cme" (mooncake only)
  • complianceProfile = cloud
  • d365.userId = "pending"
  • d365.userName = "pending"

→ 生成 config.json
```

支持 `-NonInteractive` 模式：所有输入可通过 `$env:EB_*` 环境变量注入。

### Phase 3: Azure 认证（az-profile-switch skill）

```
3a. 安装 Azure CLI (winget install az)
3b. 创建 ~/.azure-profiles/ 目录
3c. 根据 config.cloud:
    mooncake →
      • 创建 profile "{alias}-corp"  → az login (AzureCloud/Microsoft Corp)    ← 弹浏览器
      • 创建 profile "{alias}-cme"   → az login (AzureChinaCloud/CME)          ← 弹浏览器
    global →
      • 创建 profile "{alias}-corp"  → az login (AzureCloud/Microsoft Corp)    ← 弹浏览器
3d. 写回 config.json azProfile
```

每个 `az login` 弹浏览器，工程师交互登录。这是 Azure CLI 原生行为。

### Phase 4: 项目依赖（CLI 全自动）

```
4a. npm install (dashboard/)
4b. npm install (dashboard/web/)
4c. Agency CLI (aka.ms/InstallTool.ps1)
4d. local-rag MCP server (git clone + npm install)
```

### Phase 5: 配置文件生成（CLI 自动）

```
5a. .mcp.json         ← 从 .mcp.json.template + Agency 路径自动探测 + azProfile
5b. dashboard/.env    ← 随机 JWT_SECRET + PORT 从 config.json
5c. settings.local.json ← 根据 dataRoot 生成 Read 权限白名单
```

### Phase 6: 知识库初始化（条件执行）

```
6a. Kusto (mooncake only):
    • sparse clone CopilotSkills → 复制 kusto/ → 跳过 skipProducts
6b. Compliance profile:
    • 验证 compliance-profiles/{cloud}.md 存在
6c. SAP 数据:
    • 检查 {dataRoot}/sap-scope.json 存在，不存在提示来源
6d. RDSE CC (mooncake only):
    • 检查 {dataRoot}/mooncake-cc.json 存在，不存在提示 PowerBI 下载
```

### Phase 7: 延迟配置项（需浏览器/运行时获取）

标记 `"pending"` 到 config.json，后续自动补全：

```
7a. D365 userId/userName
    → 首次启动 Dashboard 时，浏览器打开 D365 → WhoAmI() → 写回 config
    → 或 Dashboard Setup Banner 引导

7b. Humanizer profile
    → 工程师后续主动跑 /humanizer mimic
    → 从已发邮件学习风格 → 生成 profiles/{alias}/

7c. Teams watch targets
    → Dashboard UI 配置：工程师选择要监听的 chat → 写入 watch-targets.json

7d. NewAPI key (如有自己的 LLM gateway)
    → dashboard/.env 中 EB_NEWAPI_KEY=xxx
    → 或 Dashboard Settings 页面输入
```

### Phase 8: 验证（CLI 自动）

```
✅ config.json schema 校验
✅ Dashboard npm run dev 能启动
✅ Azure CLI profile 能 az account show
✅ Agency CLI 能响应
⏳ D365 连通性 (pending, 需浏览器)
⏳ Humanizer profile (pending, 需训练)
⏳ Teams watch targets (pending, 需 UI)

→ 打印清单: ✅ 已完成 / ⏳ 延迟配置
```

## 5. 实施计划（优先级）

| 阶段 | 改动项 | 文件数 | 风险 | 优先级 |
|------|--------|--------|------|--------|
| **S1** | config.json v2 schema + config.template.json 同步 | 2 | 🟢 低 | P0 |
| **S1** | API Key 移到 .env | 3 | 🟢 低 | P0 |
| **S1** | `_init.ps1` 参数化（从 config 读 D365 身份） | 1+15 | 🟢 低 | P0 |
| **S1** | `CaseDetail.tsx` 硬编码邮箱 → config API | 1 | 🟢 低 | P0 |
| **S2** | `az-profile-reader.ts` 参数化 | 1 | 🟢 低 | P1 |
| **S2** | compliance-rules 分 profile | 3 | 🟡 中 | P1 |
| **S2** | humanizer profile 目录化 + .gitignore | 4 | 🟡 中 | P1 |
| **S2** | CC 三层架构实现 | 3 | 🟡 中 | P1 |
| **S3** | 脚本路径去硬编码（$PROJECT_ROOT） | ~15 | 🟡 中 | P2 |
| **S3** | bootstrap.ps1 v2 增强 | 1 | 🟢 低 | P2 |
| **S3** | config.template.json 同步 | 1 | 🟢 低 | P2 |
| **S3** | Dashboard Setup Banner (Phase 7 延迟配置 UI) | 3 | 🟡 中 | P2 |
| **S4** | 测试 fixture 参数化 | ~5 | 🟢 低 | P3 |
| **S4** | 文档/playbook 路径占位符 | ~10 | 🟢 低 | P3 |

## 6. 向后兼容策略

| 旧字段 | 新位置 | 兼容期 | 读取优先级 |
|--------|--------|--------|-----------|
| `engineerName` | `engineer.name` | 6 个月 | 新 > 旧 |
| `defaultCcEmails` | `cc.*` 合并 | 6 个月 | 新 > 旧 |
| `config.json` 内 `newapi.key` | `.env` 中 `EB_NEWAPI_KEY` | 6 个月 | env > config |

所有消费者先查新字段，不存在则 fallback 到旧字段。旧字段 6 个月后移除。

## 7. 不改动的部分

| 组件 | 原因 |
|------|------|
| 产品注册表 (`product-registry.json`) | 设计已足够好 |
| casework 编排层 | 产品无关，无需改动 |
| SAP 匹配引擎 (`match-sap.py`) | 数据驱动，`--scope` 参数已支持切换 |
| Kusto 产品目录结构 (`kusto/{product}/`) | 已按产品隔离 |
| Email/Teams 搜索 | 按 case number 搜索，与环境无关 |
| 邮件样本 (`playbooks/email-samples/`) | 个人风格训练数据，不需通用化 |

---

_文档由架构扫描 + 用户反馈生成，实施前需 review 每个 Stage 的具体 PR。_
