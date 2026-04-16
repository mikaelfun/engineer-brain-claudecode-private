# Teams MCP Server 挂死导致 Patrol Queue 全程失效

## 现象
- Patrol 两次运行（同一 session），Teams queue agent 均卡在 MCP 健康检查
- `SearchTeamMessagesQueryParameters("test", size=1)` 发出后永远不返回
- 主 agent 直接调用 Teams MCP 也挂死（不是 subagent 特有问题）
- 导致所有 case 的 Teams 搜索请求（request.json）成为 orphan

## 影响
- Teams digest 无法刷新（3153001 的 digest 已 4 天未更新）
- Patrol drain 检查永远 pending → 超时 120s → 浪费时间
- 残留 request.json 可能干扰后续 patrol

## 根因（已确认）
Teams MCP server 连接被耗尽/崩溃。两个 queue agent subagent 并发持有 MCP 连接，
导致 server 进程不响应（`Connection closed`）。重启 MCP（`/mcp`）后恢复正常。
具体触发路径：第一次 patrol 的 queue agent 卡在 MCP 调用 → 第二次 patrol 又 spawn 新 queue agent
→ 两个 agent 同时占用连接 → MCP server 崩溃。

## 已实施的缓解
1. **patrol SKILL.md**：spawn queue 前主 agent 先做 MCP 预检，失败则跳过 Teams 搜索 + 报告用户运行 `/mcp`
2. **teams-search-queue SKILL.md**：健康检查失败时写 `teams-mcp-status` 状态文件 + 清理 request.json + 立即退出
3. **patrol SKILL.md**：drain 超时后清理 orphan request.json

## 仍需平台级修复
1. **MCP 调用超时**：Claude Code 平台级——MCP tool call 应有 30s timeout，超时返回 error
2. **MCP server 健康监控**：patrol 启动前 Bash 检查 MCP server 进程存活
3. **Queue agent 防御**：健康检查用 Bash + curl 替代直接 MCP 调用，绕过挂死

## 优先级
P1 — 影响每次 patrol 的 Teams 数据新鲜度
