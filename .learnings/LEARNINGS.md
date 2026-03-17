# Learnings

经验教训记录。每次遇到值得记住的技术发现、最佳实践或工作流程优化，记录在这里。

## 格式
```
### YYYY-MM-DD — 标题
- 上下文：...
- 发现：...
- 教训：...
```

---

### 2026-03-16 — Claude Code subagent 调度必须通过 Agent 工具

- 上下文：从 OpenClaw 迁移到 Claude Code，原先 caseworker spawn 需要显式传 agentId
- 发现：Claude Code 中 subagent 通过 `.claude/agents/*.md` 定义，Main Agent 使用 `Agent` 工具调度，agent 名字即文件名
- 教训：所有 Case 相关任务必须走 subagent 调度，Main Agent 不直接执行 D365 脚本

### 2026-03-16 — Agency MCP 是 Public-side 服务的最佳接入路线

- 上下文：ICM MCP 直连需要 Public tenant token，本地 `az login` 默认在 China tenant，认证不匹配
- 发现：`agency mcp <name>` 自动维护 OAuth token，本地起代理端口，绕过 tenant 不一致问题
- 教训：ICM/ADO/Teams 等 Public-side MCP 优先用 agency 本地代理，不要折腾 HTTP 直连 + 手动拿 token

### 2026-03-16 — Teams 搜索必须多策略组合

- 上下文：客户在 Teams 的显示名和 D365 Contact Name 经常不一致，邮箱搜索命中率极低
- 发现：caseNumber 搜索最可靠，客户姓名（从 case-info.md 读取）次之，conversationId 兜底
- 教训：不要从用户名推测真名，搜索必须多策略组合
