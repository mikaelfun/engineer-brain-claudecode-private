# Skill Registry — CLI 先行架构设计

> 日期: 2026-04-01
> 状态: Draft
> 作者: Kun Fang + Claude

## 1. 背景与动机

当前 EngineerBrain 的 casework/patrol/single-step 等核心能力都在快速迭代中。WebUI 后端（dashboard）通过 Claude Code SDK 调用这些 skill，但存在一个结构性问题：

**痛点：CLI skill 还没稳定就被 WebUI 调用了。**

具体表现：
- `case-session-manager.ts` 中硬编码了 `stepPrompts` 字典，每个 step 一段 prompt 模板
- CLI 侧 SKILL.md 改了流程/参数后，backend 的 prompt 也要同步修改
- 没有机制阻止未稳定的 skill 出现在 WebUI 中
- 新增 skill 需要改 backend 代码才能在 WebUI 中使用

## 2. 设计目标

1. **SKILL.md 是唯一真相源** — 改了 skill 只改 SKILL.md，不需要改 backend
2. **CLI 先行保障** — 通过 stability 标记控制 skill 何时暴露给 WebUI
3. **零 CLI 影响** — frontmatter 对 Claude CLI 执行完全透明
4. **保留现有能力** — session 管理、SSE 流式推送、并发控制等不变

## 3. 架构方案：Skill Registry 自描述

### 3.1 Skill Frontmatter Schema

每个 `.claude/skills/*/SKILL.md` 的 YAML frontmatter 增加标准化元信息：

```yaml
---
name: data-refresh                    # 唯一标识符，与目录名一致
displayName: 数据刷新                  # 中文展示名
description: 拉取 Case 最新数据 + ICM 信息  # 简短描述
category: inline                       # inline | agent | orchestrator
stability: stable                      # stable | beta | dev
requiredInput: caseNumber              # WebUI 调用时需要传入的参数
mcpServers: [icm]                      # 需要的 MCP servers
estimatedDuration: 30s                 # 预估执行时间（UI 进度提示用）
version: "2.1"                         # 版本号（追踪用）
promptTemplate: |
  Execute data-refresh for Case {caseNumber}.
  Read .claude/skills/data-refresh/SKILL.md and follow all steps.
---
```

**字段说明：**

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `name` | ✅ | string | 唯一标识符 |
| `displayName` | ✅ | string | UI 展示名 |
| `description` | ✅ | string | 简短描述 |
| `category` | ✅ | enum | `inline`（Main Agent 直接执行）、`agent`（spawn 独立 agent）、`orchestrator`（编排多个 skill） |
| `stability` | ✅ | enum | `stable`、`beta`、`dev` |
| `requiredInput` | ❌ | string | 调用参数名（目前只有 `caseNumber`） |
| `mcpServers` | ❌ | string[] | 需要的 MCP servers |
| `estimatedDuration` | ❌ | string | 预估耗时 |
| `version` | ❌ | string | 版本号 |
| `promptTemplate` | ✅ | string | SDK 调用时的 prompt 模板，`{caseNumber}` 等占位符运行时替换 |

### 3.2 Orchestrator Skill（casework）的特殊处理

casework 是编排 skill，内含多个 step。它的 frontmatter 额外声明 step 列表：

```yaml
---
name: casework
displayName: Case 全流程处理
category: orchestrator
stability: stable
steps:
  - data-refresh
  - compliance-check
  - status-judge
  - troubleshoot
  - email-drafter
  - inspection-writer
promptTemplate: |
  Process Case {caseNumber}. Read .claude/skills/casework/SKILL.md and follow all steps.
---
```

WebUI 做单步执行时：查 casework 的 `steps` 列表 → 找到对应 skill 名 → 从该 skill 的 frontmatter 取 `promptTemplate`。

### 3.3 Stability 状态与 CLI 先行工作流

**三个状态：**

| 状态 | CLI 可用 | WebUI 可见 | 说明 |
|------|---------|-----------|------|
| `dev` | ✅ | ❌ | 开发中，仅 CLI |
| `beta` | ✅ | ⚠️ 标注 beta | 基本可用，双轨验证 |
| `stable` | ✅ | ✅ | 完全可用 |

**开发流程：**

```
1. 新功能/改进 → stability: dev → CLI 反复测试
2. 基本稳定 → stability: beta → WebUI 可见但标注 ⚠️
3. 确认稳定 → stability: stable → WebUI 正常展示
```

## 4. 后端实现

### 4.1 SkillRegistryService

新增 `dashboard/src/services/skill-registry.ts`：

```typescript
interface SkillMeta {
  name: string;
  displayName: string;
  description: string;
  category: 'inline' | 'agent' | 'orchestrator';
  stability: 'stable' | 'beta' | 'dev';
  requiredInput?: string;
  mcpServers?: string[];
  estimatedDuration?: string;
  version?: string;
  promptTemplate: string;
  steps?: string[];  // orchestrator only
}

class SkillRegistryService {
  private registry: Map<string, SkillMeta>;

  // 启动时扫描 .claude/skills/*/SKILL.md
  async initialize(): Promise<void>;

  // 获取单个 skill
  getSkill(name: string): SkillMeta | undefined;

  // 列出所有 skill（可按 stability 过滤）
  listSkills(options?: { includeDev?: boolean }): SkillMeta[];

  // 生成填好变量的 prompt
  getPrompt(name: string, params: Record<string, string>): string;

  // 热更新单个 skill
  reloadSkill(skillDir: string): void;
}
```

### 4.2 对 case-session-manager 的改造

**删除：** `stepPrompts` 硬编码字典

**替换为：**
```typescript
// 之前
const prompt = stepPrompts[stepName];

// 之后
const prompt = skillRegistry.getPrompt(stepName, { caseNumber });
if (!prompt) {
  throw new Error(`Skill "${stepName}" not found in registry`);
}
```

### 4.3 API 端点

新增 `dashboard/src/routes/skill-routes.ts`：

- `GET /api/skills` — 返回所有注册的 skill 列表（默认排除 `dev`）
  - Query: `?includeDev=true` 调试时返回全部
- `GET /api/skills/:name` — 返回单个 skill 详情（含 steps 列表）

### 4.4 File Watcher 扩展

`dashboard/src/watcher/file-watcher.ts` 增加监听路径：

```
.claude/skills/*/SKILL.md
```

文件变更时调用 `skillRegistry.reloadSkill(skillDir)` 热更新。

## 5. 前端改造

当前前端的 step 按钮列表是硬编码的，改为从 `/api/skills` API 动态获取：

- 调用 `GET /api/skills` 获取可用 skill 列表
- orchestrator 类型的 skill 展开其 `steps` 子列表
- `beta` skill 显示 ⚠️ 标记
- `dev` skill 不显示

## 6. 影响范围

### 需要改动

| 改动 | 文件 | 说明 |
|------|------|------|
| 新增 | `dashboard/src/services/skill-registry.ts` | Registry 服务 |
| 新增 | `dashboard/src/routes/skill-routes.ts` | `/api/skills` 端点 |
| 修改 | `dashboard/src/agent/case-session-manager.ts` | 删 `stepPrompts`，用 registry |
| 修改 | `dashboard/src/watcher/file-watcher.ts` | 增加监听 SKILL.md |
| 修改 | `.claude/skills/*/SKILL.md` (×8+) | 加 frontmatter |
| 修改 | `dashboard/web/src/` 相关组件 | 动态获取 skill 列表 |

### 不改动

- CLI 执行逻辑（SKILL.md 正文不变）
- Session 管理（case-session-manager 的 session 逻辑不变）
- SSE 流式推送
- MCP 配置

## 7. 边界情况处理

| 情况 | 处理 |
|------|------|
| SKILL.md 没有 frontmatter | registry 跳过，日志 warning |
| frontmatter 缺少必填字段 | 跳过 + warning |
| `promptTemplate` 中有未知变量 | 运行时报错，不 silent fail |
| `steps` 中引用了不存在的 skill | registry 加载时 warning，运行时报错 |
| 新增 skill 目录 | file-watcher 检测后自动加载 |

## 8. 迁移策略

**Phase 1（后端）：**
1. 新增 SkillRegistryService
2. 给所有 SKILL.md 加 frontmatter
3. 重构 case-session-manager 使用 registry
4. 添加 `/api/skills` 端点
5. 扩展 file-watcher

**Phase 2（前端）：**
1. 前端改用 `/api/skills` API 动态渲染 step 列表
2. 添加 stability 标记的视觉展示
3. 移除硬编码的 step 配置

Phase 1 完成后系统即可工作，Phase 2 是增量改进。
