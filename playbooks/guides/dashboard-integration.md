# Dashboard 集成

## API 接口

Dashboard 通过 Claude Code SDK 创建 per-case session，主要 API：

| Method | Endpoint | 说明 |
|--------|----------|------|
| `POST` | `/api/case/:id/process` | 完整处理 |
| `POST` | `/api/case/:id/chat` | 交互式反馈（resume session） |
| `POST` | `/api/case/:id/step/{step-name}` | 单步执行 |
| `POST` | `/api/patrol` | 批量巡检 |
| `GET` | `/api/todos` | 获取 Todo 列表 |
| `POST` | `/api/todo/:id/execute` | 执行 Todo 项 |
| `GET/PUT` | `/api/settings` | 用户配置 |

## 端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端（Vite） | 5173 | http://localhost:5173 |
| 后端（Hono） | 3010 | http://localhost:3010/api/* |

前端自动将 `/api/*` 请求代理到后端。

## UI 规范

所有 Dashboard UI 修改**必须**先读 `playbooks/guides/dashboard-design-system.md`。

核心要点：暗色模式（柔和低对比度）+ 浅色模式双主题、左侧边栏导航、表格视图 Case 列表、AI Panel 融入页面不独立突出。
