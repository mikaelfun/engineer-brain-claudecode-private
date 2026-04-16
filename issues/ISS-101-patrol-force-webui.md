# ISS-101: Dashboard patrol 按钮不支持强制执行

## 问题

Web UI 点击 "Start Patrol" 按钮时，如果所有 case 在 24 小时内已巡检过，patrol 会跳过全部 case 并直接显示 completed，无法强制重新巡检。

## 现状

- **CLI `/patrol --force`**：已支持，跳过 `lastInspected` 检查（SKILL.md 第 62 行）
- **Dashboard `POST /patrol`**：不支持 force 参数
- **`patrolCoordinator()`**：不接受 force 参数
- **`filterCasesByLastInspected()`**：硬编码 24 小时阈值，无绕过机制

## 根因

`case-session-manager.ts` 的 `_runPatrol()` 调用 `filterCasesByLastInspected()`，该函数过滤掉所有 `lastInspected` 在 24 小时内的 case。`patrolCoordinator` 和 `POST /patrol` route 都没有传递 force 参数的通道。

## 涉及文件

| 文件 | 需要改动 |
|------|---------|
| `dashboard/src/agent/case-session-manager.ts` | `patrolCoordinator()` + `_runPatrol()` 加 `force` 参数 |
| `dashboard/src/routes/case-routes.ts` | `POST /patrol` 接受 `{ force: true }` body |
| `dashboard/web/src/api/hooks.ts` | `useStartPatrol` 支持传 force 参数 |
| `dashboard/web/src/pages/Dashboard.tsx` | 按钮增加长按/右键菜单或 modifier key 触发 force |

## 建议方案

1. `POST /patrol` 接受 `{ force?: boolean }` body
2. `patrolCoordinator(onProgress, options?: { force?: boolean })` 透传
3. `_runPatrol()` 收到 `force=true` 时跳过 `filterCasesByLastInspected()`
4. 前端按钮加 Shift+Click 或下拉菜单支持 "Force Patrol"

## 优先级

P2 — 功能增强，不影响正常巡检流程
