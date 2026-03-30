# Recipe: Auth Token Expired

> 适用于：API 返回 401 Unauthorized 或页面显示登录页，通常是 JWT token 过期/缺失/签名不匹配

## 匹配条件

- API 响应 `401 Unauthorized`
- 页面渲染为登录页而非目标页面
- 错误日志包含 `invalid signature`、`jwt expired`、`token expired`
- Playwright 截图显示登录表单
- `localStorage.getItem('eb_token')` 为 null 或过期

## 前置检查

- [ ] 确认服务在线：`curl -sf http://localhost:3010/api/health`（如不在线，先用 [env-service-down.md](./env-service-down.md)）
- [ ] 确认是认证问题而非服务问题：`curl -sf http://localhost:3010/api/health` 返回 200 但业务 API 返回 401

## 执行步骤

### 1. 生成新 JWT Token

```bash
DASHBOARD_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/dashboard"
TOKEN=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'engineer-brain-local-dev-secret-2026';
  console.log(jwt.sign({ sub: 'engineer' }, secret, { expiresIn: '1h' }));
")
echo "Token generated: ${TOKEN:0:20}..."
```

### 2. 验证 Token 有效

```bash
# 用新 token 调用需认证的 API
curl -sf http://localhost:3010/api/cases \
  -H "Authorization: Bearer $TOKEN" \
  -o /dev/null -w "%{http_code}"
# 预期: 200
```

### 3. 如果是 Playwright 测试 — 注入 Token 到 localStorage

```javascript
// 先导航到页面获取 localStorage 访问权
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.evaluate((t) => { localStorage.setItem('eb_token', t); }, token);

// 刷新页面使 token 生效
await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
```

### 4. 如果 Token 生成失败 — 检查 JWT_SECRET

```bash
# 检查 dashboard/.env 是否有自定义 JWT_SECRET
DASHBOARD_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/dashboard"
if [ -f "$DASHBOARD_DIR/.env" ]; then
  grep JWT_SECRET "$DASHBOARD_DIR/.env"
fi

# 如果 .env 有自定义 secret，生成 token 时必须用同一个 secret
```

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| JWT_SECRET 不匹配 | Token 生成成功但 API 仍返回 401 | 检查 `dashboard/.env` 的 JWT_SECRET 值，生成时用相同 secret |
| Token 有效期太短 | 长时间测试中途过期 | 默认 `expiresIn: '1h'`，足够一轮测试；如需更长设为 `'2h'` |
| NODE_PATH 未设置 | `Cannot find module 'jsonwebtoken'` | 必须设置 `NODE_PATH="$DASHBOARD_DIR/node_modules"` |
| localStorage 未注入 | 页面已加载但 token 未写入 | 必须先 `goto` 页面再 `evaluate`，不能在空白页操作 localStorage |
| waitUntil: 'networkidle' | SSE 连接导致永不 idle，超时 | 用 `'domcontentloaded'` + `waitForTimeout(3000)` |

_来源：learnings.yaml `jwt-auth-token`_
