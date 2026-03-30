# Recipe: API Endpoint Verification

## 匹配条件

验收标准涉及：API 端点、HTTP 响应、状态码、JSON 响应结构、REST 接口、后端行为

## 前置检查

1. **后端存活**: `curl -sf http://localhost:3010/api/health` → 200
2. **如未启动**:
   ```bash
   cd dashboard && npm run dev &
   sleep 5
   curl -sf http://localhost:3010/api/health
   ```
   ⚠️ **绝不 `taskkill /F /IM node.exe`**

3. **生成 JWT Token**（大部分 API 需要认证）:
   ```bash
   DASHBOARD_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/dashboard"
   TOKEN=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
     const jwt = require('jsonwebtoken');
     const secret = process.env.JWT_SECRET || 'engineer-brain-local-dev-secret-2026';
     console.log(jwt.sign({ sub: 'engineer' }, secret, { expiresIn: '1h' }));
   ")
   ```

## 执行步骤

### 1. 基本请求 + 状态码检查

```bash
# GET 请求
HTTP_CODE=$(curl -sf -o /tmp/response.json -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3010/api/endpoint")

[ "$HTTP_CODE" = "200" ] || echo "FAIL: expected 200, got $HTTP_CODE"
```

```bash
# POST 请求
HTTP_CODE=$(curl -sf -o /tmp/response.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}' \
  "http://localhost:3010/api/endpoint")

[ "$HTTP_CODE" = "200" ] || echo "FAIL: expected 200, got $HTTP_CODE"
```

### 2. 响应结构验证

```bash
# 检查 JSON 字段存在
cat /tmp/response.json | jq -e '.data' > /dev/null || echo "FAIL: missing .data field"

# 检查字段值
cat /tmp/response.json | jq -e '.status == "ok"' > /dev/null || echo "FAIL: status != ok"

# 检查数组长度
COUNT=$(cat /tmp/response.json | jq '.items | length')
[ "$COUNT" -gt 0 ] || echo "FAIL: items array empty"

# 检查嵌套结构
cat /tmp/response.json | jq -e '.data.phases.total > 0' > /dev/null || echo "FAIL: phases.total not > 0"
```

### 3. 错误响应验证

```bash
# 测试无 token 访问
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" \
  "http://localhost:3010/api/protected-endpoint")
[ "$HTTP_CODE" = "401" ] || echo "FAIL: unauthenticated should return 401, got $HTTP_CODE"

# 测试不存在的资源
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3010/api/case/nonexistent-id")
[ "$HTTP_CODE" = "404" ] || echo "FAIL: missing resource should return 404, got $HTTP_CODE"
```

### 4. 副作用验证（如 POST 创建了文件/数据）

```bash
# POST 后检查文件系统变化
curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "create"}' \
  "http://localhost:3010/api/endpoint"

# 检查预期文件是否创建
test -f "$EXPECTED_FILE" || echo "FAIL: expected file not created"
```

### 5. SSE 端点验证（特殊处理）

```bash
# SSE 不能用普通 curl（会挂起），用 timeout + 读前几行
timeout 5 curl -sN \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3010/api/sse-endpoint" | head -10 > /tmp/sse-output.txt

# 检查 SSE 格式
grep -q "^data:" /tmp/sse-output.txt || echo "FAIL: no SSE data events"
```

## 常见坑

| 症状 | 原因 | 解决 |
|------|------|------|
| 401 Unauthorized | Token 过期或 secret 不匹配 | 重新生成 token，检查 `.env` |
| Connection refused | 后端未启动 | `npm run dev` 或检查端口 |
| curl 挂起不返回 | SSE 端点持续推送 | 用 `timeout 5 curl -sN` |
| JSON parse error | 响应不是 JSON | 先检查 `Content-Type` header |
| 200 但内容为空 | 路由匹配了但处理器返回空 | 检查路由 handler 逻辑 |

## 安全红线

- ⚠️ **唯一禁止的端点**: `POST /api/todo/:id/execute`（触发 D365 写操作）
- ✅ 其他 POST 端点（process、step、patrol）都是只读流程，可以调用
