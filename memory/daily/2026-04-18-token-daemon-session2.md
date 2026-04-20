# Token Daemon Session 2 续建提示词

## 上下文

ISS-229 Token Daemon 第二轮开发完成。Commits: `50bb4ac` → `7ab11e0`（6 个 commit）。

### 已完成

1. **D365 session tab** — registry.json 新增 d365（tokenSource: "none"），daemon 常驻 D365 tab
2. **HTTP server** — daemon 启动时在随机 localhost 端口启 HTTP server，端口写入 `$TEMP/pw-token-daemon-port.json`
   - `POST /d365/odata` — 单个 OData 代理
   - `POST /d365/odata-batch` — 批量 Promise.all
   - `GET /d365/health` — D365 session 状态
3. **Invoke-D365Api 双轨** — `_init.ps1` 的 `Invoke-D365Api` + `Invoke-D365ApiBatch` 优先走 daemon HTTP，fallback playwright-cli。含 PID stale check
4. **消费者兼容** — DTM cache 加 fetchedAt ISO 字段，ICM cache 文件名对齐 `icm-ab-token-cache.json`
5. **warmup = ensure** — warmup 命令改为启动 daemon + 等 port file（120s），超时 fallback inlineWarmup
6. **data-refresh.sh 集成** — 开头后台调 warmup，CLI casework 自动启动 daemon
7. **patrol SKILL.md** — Step 4 从 4 项预热改为 2 项（IR batch + daemon warmup）
8. **stale 文件清理** — cmdStop 所有路径清理 PID + heartbeat + port 文件

### 待做

#### ISS-新: WebUI + Daemon 状态监控
1. **dashboard 后端启动时 warmup** — `dashboard/src/index.ts` start() 加 `spawn('node', ['token-daemon.js', 'warmup'])`
2. **daemon 状态 API** — dashboard 加 `GET /api/daemon/status`，读 heartbeat.json + port.json 返回：
   - daemon: { pid, alive, heartbeatFresh, httpPort }
   - tokens: { teams: {status, remainMin}, d365: {status: "session"}, dtm: {...}, icm: {...} }
3. **前端 Agent Monitor** — 轮询 status endpoint，显示 daemon 状态卡片 + token 倒计时
4. **daemon 挂了自愈** — 可选：dashboard 后端定期检查 heartbeat，stale 时自动 re-warmup

#### ISS-新: Phase 3 去掉 playwright-cli D365 fallback（观察期后）
- 观察 daemon HTTP 路径稳定后，去掉 `Invoke-D365Api` 的 playwright-cli fallback
- 删除 `_init.ps1` 中 `Ensure-D365Tab`、`Restart-D365Browser` 等 playwright-cli 依赖代码
- d365-case-ops 的 UI 操作（record-labor 表单填写）仍保留 playwright-cli

### 关键文件

| 文件 | 说明 |
|------|------|
| `.claude/skills/browser-profiles/scripts/token-daemon.js` | daemon 主进程（含 HTTP server） |
| `.claude/skills/browser-profiles/registry.json` | profile 注册表（含 d365 session tab） |
| `.claude/skills/d365-case-ops/scripts/_init.ps1` | Invoke-D365Api 双轨实现 |
| `.claude/skills/casework/scripts/data-refresh.sh` | casework 入口（含 warmup 调用） |
| `.claude/skills/patrol/SKILL.md` | patrol Step 4 预热指令 |
| `playbooks/guides/browser-profile-architecture.md` | 架构文档 |

### 架构现状

```
Token Daemon (1 个 headless Edge, 4 tabs, 1 HTTP server)
├── Tab: Teams      → localStorage token  → $TEMP/teams-ic3-token.json
├── Tab: D365       → session (cookie)     → HTTP server /d365/odata 代理
├── Tab: DTM        → request intercept    → $TEMP/.../dtm-token-global.json
├── Tab: ICM        → request intercept    → $TEMP/icm-ab-token-cache.json
└── HTTP: 127.0.0.1:PORT
    ├── POST /d365/odata       ← Invoke-D365Api 优先调用
    ├── POST /d365/odata-batch ← Invoke-D365ApiBatch 优先调用
    └── GET  /d365/health      ← session 状态检查
```

调用链:
```
patrol warmup / data-refresh.sh warmup
  → token-daemon.js warmup
    → daemon not alive? ensure (后台 start) → 等 port file
    → daemon alive? 报告 cache 状态

Invoke-D365Api (任何 .ps1 脚本)
  → 读 port.json → PID alive? → HTTP POST /d365/odata
  → fallback → playwright-cli run-code (原路径)
```

### 已知问题

- DTM token 首次 warmup 可能 extraction failed（需 reload，已有 retry 逻辑但 daemon start 模式下首次有时错过）
- D365 tab SSO 首次需要 ~30s（Azure AD login → 选账户 → redirect 回 D365）
- daemon 被 taskkill /F 强杀时 port file 可能残留（消费端有 PID stale check 清理）
