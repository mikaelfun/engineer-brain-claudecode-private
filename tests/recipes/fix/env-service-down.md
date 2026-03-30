# Recipe: Environment Service Down

> 适用于：Dashboard/后端服务未启动或端口不可达，导致测试 connection refused / 超时

## 匹配条件

- 错误日志包含 `ECONNREFUSED`、`connection refused`、`curl: (7)`
- `curl -sf http://localhost:3010/api/health` 返回非 200
- `curl -sf http://localhost:5173` 返回非 200
- Playwright 访问 localhost 超时
- 测试日志显示 "dashboard not running" 或类似

## 前置检查

- [ ] 检查后端端口 3010：`curl -sf http://localhost:3010/api/health`
- [ ] 检查前端端口 5173：`curl -sf http://localhost:5173 -o /dev/null -w "%{http_code}"`
- [ ] 检查进程是否存在：`netstat -ano | findstr "LISTENING" | findstr ":5173 :3010"`

## 执行步骤

### 1. 诊断哪个服务挂了

```bash
# 分别检查前端和后端
BACKEND_OK=$(curl -sf http://localhost:3010/api/health -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
FRONTEND_OK=$(curl -sf http://localhost:5173 -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
echo "Backend: $BACKEND_OK  Frontend: $FRONTEND_OK"
```

### 2. 如果端口被占用但服务异常 — 精准重启

```bash
# 找到占用端口的 PID（注意：绝不盲杀 node.exe）
netstat -ano | findstr "LISTENING" | findstr ":3010"
netstat -ano | findstr "LISTENING" | findstr ":5173"

# 只 kill 特定 PID（替换 <PID> 为实际值）
taskkill /PID <PID> /F
```

### 3. 启动服务

```bash
DASHBOARD_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/dashboard"
cd "$DASHBOARD_DIR" && npm run dev &

# 等待服务就绪
sleep 8
curl -sf http://localhost:3010/api/health && echo "Backend OK" || echo "Backend FAIL"
curl -sf http://localhost:5173 -o /dev/null -w "%{http_code}" && echo "Frontend OK" || echo "Frontend FAIL"
```

### 4. 验证修复

```bash
# 重新运行失败的测试命令（由调用者提供）
curl -sf http://localhost:3010/api/health
```

## 安全守则

| 操作 | 状态 |
|------|------|
| `taskkill /PID <具体PID> /F` | 允许（精准 kill） |
| `taskkill /F /IM node.exe` | **禁止**（会杀掉 Claude Code 自身） |
| `killall node` / `pkill node` | **禁止**（同上） |
| `netstat -ano \| findstr` 查 PID | 推荐（诊断优先） |

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| 盲杀 node.exe | Claude Code 进程被终止，会话断开 | 用 netstat 找具体 PID，只杀该 PID |
| npm run dev 启动慢 | 前 5 秒 curl 仍然失败 | sleep 8 后再检查，或循环 retry 3 次 |
| 端口残留（僵尸进程） | 端口被占但服务无响应 | netstat 找 PID → taskkill /PID → 重启 |
| 前端启动但后端没启动 | 页面加载但 API 404/502 | npm run dev 同时启动前后端，分别检查两个端口 |

_来源：learnings.yaml `dashboard-port-check`, `node-kill-safety`_
