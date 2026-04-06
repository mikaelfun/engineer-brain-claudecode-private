# 开发工作流 — Issue → Track → Implement

## Issue → Track → Implement 流程

1. **发现问题/需求** → `/issue "描述"` 创建 issue 到 `issues/` 目录（CLI 或 WebUI 均可）
2. **需要实现时** → `/conductor:new-track ISS-XXX` 创建 conductor track（见下方关联规则）
3. **实现 track** → **必须用 `/conductor:implement {trackId}`**，不要手动实现（否则 conductor 状态文件不同步）
4. **实现完成** → issue status 自动设为 `implemented`
5. **验证通过** → `/conductor:verify {trackId}` 或 `--mark-done` 将 issue 设为 `done`

## Issue 状态流转

```
pending → tracked → in-progress → implemented → done
  │         │          │              │
  │         │          │              └─ /conductor:verify 或 mark-done
  │         │          └─ /conductor:implement 开始执行
  │         └─ /conductor:new-track 创建 track
  └─ /issue 创建
```

**⚠️ 只有 `/conductor:verify` 或 mark-done 可以把 issue 从 `implemented` 变为 `done`，`/conductor:implement` 完成时只能设 `implemented`**

## Issue → Track 关联规则

当 `/conductor:new-track` 的参数匹配 `ISS-\d+` 格式时：
1. **Pre-fill**：读取 `issues/{issueId}.json`，预填 title/description/type/priority 到 track spec
2. **Post-creation**：回写 issue JSON — `trackId = 生成的 trackId`，`status = "tracked"`

## 关键规则

- ❌ 不要手动实现 conductor track — 会导致 plan.md/metadata.json 状态不一致
- ❌ **禁止对实现任务使用 `EnterPlanMode`** — 用 `/conductor:new-track` 代替
- ❌ **任何 Issue 修复都必须走完整 conductor 流程**（`/conductor:new-track` → `/conductor:implement`）
- ✅ Issue 是问题记录的单一入口（`issues/ISS-XXX.json`）
- ✅ Conductor Track 是实现计划（`conductor/tracks/{trackId}/`）
- ✅ 收到 "实现 XXX" 的请求时，先检查是否有对应 conductor track，没有则先 `/conductor:new-track`
