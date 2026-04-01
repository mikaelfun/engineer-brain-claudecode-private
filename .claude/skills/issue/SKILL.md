---
name: issue
displayName: Issue Tracker
description: "记录问题/需求到 issues/ 目录"
category: inline
stability: dev
---

# Issue — CLI Issue Tracker

记录问题/需求到 `issues/` 目录。Dashboard 挂了也能用。

## 触发

```
/issue 标题描述
/issue "双层scrollbar在process时都会滚动"
/issue （无参数则交互式填写）
```

## 执行流程

### 1. 解析参数

如果有参数，作为 title：
```
title = 参数文本
```

如果无参数，交互式询问：
- 标题（必填）
- 类型：bug / feature / refactor / chore（默认 bug）
- 优先级：P0 / P1 / P2（默认 P1）
- 描述（可选）

### 2. 相似 Issue 检测

在创建新 issue 前，扫描已有 issues 检测相似项。

#### 2.1 扫描匹配

读取所有 `issues/*.json`，对比新 title 与每个 issue 的 title 和 description：
- **子字符串匹配**：新 title 是已有 title 的子串，或反之
- **关键词匹配**：提取新 title 的前 3 个关键词（去除停用词），与已有 issue 的 title + description 对比，至少 2 个命中
- 按匹配度排序，取 **top 5** 相似项

#### 2.2 分支处理

**无匹配** → 直接跳到步骤 3（生成 Issue），用户体验不变。

**匹配到相似 issue** → 用 `AskUserQuestion` 展示匹配结果并让用户选择。按已有 issue 状态分两种情况：

##### 匹配到活跃 issue（pending / tracked / in-progress / implemented）

展示匹配到的 issue 信息（ID、title、status、description 前 100 字），然后提问：

```
发现以下相似的活跃 Issue：
  - ISS-XXX: {title} [{status}]
    {description 前 100 字}...

请选择：
1. 合并到 ISS-XXX（更新描述，保留原 ID）
2. 忽略相似，单独新建
```

如果匹配到多个，每个单独列出，选项 1 需指定合并到哪个。

选择**合并**时，继续询问描述处理方式：
```
如何处理描述？
1. 追加 — 新描述追加到已有描述末尾（用 "\n\n---\n\n" 分隔）
2. 替换 — 用新描述替换已有描述
3. 手动编辑 — 保留两者，你自行调整
```
- 选择 1: 读取已有 issue JSON，在 description 末尾追加新内容，更新 `updatedAt`
- 选择 2: 用新 title/description 覆盖已有 issue 的 title/description，更新 `updatedAt`
- 选择 3: 展示已有描述和新描述，等待用户提供最终描述文本，写入

合并完成后输出确认，**跳过步骤 3**，直接到步骤 4 询问是否创建 Track（如果已有 trackId 则跳过 Track 提问）。

##### 匹配到已完成 issue（done，或有 closedReason / closedAt）

展示匹配到的 issue 信息，然后提问：

```
发现以下相似的已完成 Issue：
  - ISS-XXX: {title} [done]
    {description 前 100 字}...
    关闭原因: {closedReason}

请选择：
1. Reopen ISS-XXX 并更新描述
2. 忽略，单独新建
```

选择 **Reopen** 时：
1. 询问描述处理方式（同上：追加 / 替换 / 手动编辑）
2. 清空旧字段：删除 `trackId`、`verifyResult`、`closedReason`、`closedAt`
3. 设置 `status` 为 `"pending"`
4. 更新 `updatedAt`
5. 写入 issue JSON

Reopen 完成后输出确认，**跳过步骤 3**，直接到步骤 4 询问是否创建 Track。

##### 同时匹配到活跃和已完成 issue

全部列出，按活跃优先排序，让用户选择合并目标或新建。

### 3. 生成 Issue

读取 `issues/` 目录，找到最大 ID，生成下一个：`ISS-001`, `ISS-002`, ...

创建 JSON 文件 `issues/ISS-XXX.json`：
```json
{
  "id": "ISS-XXX",
  "title": "...",
  "description": "...",
  "type": "bug",
  "priority": "P1",
  "status": "pending",
  "testLoopScan": true,
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

#### 字段规范（⚠️ 必须严格遵守）

| 字段 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `id` | string | ✅ | — | 格式 `ISS-XXX`（3位数，自增） |
| `title` | string | ✅ | — | 简短标题 |
| `description` | string | ✅ | `""` | 详细描述 |
| `type` | enum | ✅ | `"bug"` | `bug` / `feature` / `refactor` / `chore` |
| `priority` | enum | ✅ | `"P1"` | `P0` / `P1` / `P2` |
| `status` | enum | ✅ | `"pending"` | `pending` / `tracking` / `tracked` / `in-progress` / `implemented` / `done` |
| `testLoopScan` | boolean | ✅ | `true` | test-loop scanner 是否扫描此 issue。`false` 时跳过 |
| `trackId` | string | — | — | 关联的 conductor track ID（由 `/conductor:new-track` 回写） |
| `verifyResult` | object | — | — | verify 结果（由 `/conductor:verify` 回写） |
| `createdAt` | string | ✅ | — | ISO 8601 时间戳（**必须叫 `createdAt`，不是 `created`**） |
| `updatedAt` | string | ✅ | — | ISO 8601 时间戳（**必须叫 `updatedAt`，不是 `updated`**） |

> ❌ 禁止使用 `created`/`updated`/`source` 等非标准字段名——后端 `issue-reader.ts` 按 `createdAt` 排序，字段名错误会导致服务启动 crash。
> ❌ 禁止遗漏 `testLoopScan` 字段——新建 issue 必须显式设为 `true`。
> ❌ 批量创建 issue 时同样必须遵守此 schema，不可自行简化字段。

### 4. 输出确认 + 询问是否创建 Track

```
✅ Issue ISS-XXX created
   Title: ...
   Type: bug | Priority: P1 | Status: pending

是否现在创建 Conductor Track？
1. 是 → 立即实现
2. 是 → 只建 track，稍后实现
3. 否 → 跳过（后续可用 /conductor:new-track ISS-XXX）
```

选择 1 或 2 时：
- 调用 `/conductor:new-track ISS-XXX`（按 CLAUDE.md 关联规则自动预填 + 回写 trackId）
- 选择 1 时：track 创建完成后继续调用 `/conductor:implement {trackId}`
  - implement 完成后，自动提示是否 verify（由 implement.md 的 Verify Offer 步骤处理）
- 选择 2 时：track 创建完成即结束

选择 3 时：
- 直接结束，issue 保持 `pending` 状态

## 注意

- 数据存储在项目根的 `issues/` 目录
- 与 Dashboard Issue Tracker 页面读写同一目录，天然同步
- CLI 创建的 issue 默认 type=bug, priority=P1，可后续在 WebUI 编辑
- Track 关联规则见 CLAUDE.md `## 开发工作流` 章节
