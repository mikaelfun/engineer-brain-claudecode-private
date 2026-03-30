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

### 2. 生成 Issue

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

### 3. 输出确认 + 询问是否创建 Track

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
