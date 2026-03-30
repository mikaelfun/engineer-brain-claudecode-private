# Recipe: Web UI Playwright Verification

## 匹配条件

验收标准涉及：UI 元素、按钮点击、页面布局、主题切换、响应式设计、组件渲染、表单交互

## 前置检查

1. **后端存活**: `curl -sf http://localhost:3010/api/health` → 200
2. **前端存活**: `curl -sf http://localhost:5173 -o /dev/null -w "%{http_code}"` → 200
3. **如未启动**:
   ```bash
   cd dashboard && npm run dev &
   # 等待 5 秒后再检查
   sleep 5
   curl -sf http://localhost:3010/api/health
   ```
   ⚠️ **绝不 `taskkill /F /IM node.exe`**（会杀掉 Claude Code 自身）。如需重启，用 `netstat -ano | findstr "LISTENING" | findstr ":5173 :3010"` 找 PID，精准 kill。

## 执行步骤

### 1. 生成 JWT Token

```bash
DASHBOARD_DIR="/c/Users/fangkun/Documents/Claude Code Projects/EngineerBrain/dashboard"
TOKEN=$(NODE_PATH="$DASHBOARD_DIR/node_modules" node -e "
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'engineer-brain-local-dev-secret-2026';
  console.log(jwt.sign({ sub: 'engineer' }, secret, { expiresIn: '1h' }));
")
```

Token 有效期 1 小时，每轮 verify 开始生成一次即可。

### 2. Playwright 浏览器启动

```javascript
const { chromium } = require('playwright');

// ⚠️ 必须用 msedge，本机无 Chrome/Chromium
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
```

### 3. 注入 Token + 导航

```javascript
// 先加载页面以获取 localStorage 访问
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.evaluate((t) => { localStorage.setItem('eb_token', t); }, token);

// ⚠️ 不要用 waitUntil: 'networkidle'（SSE 连接会导致永不 idle）
await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);  // 等 React 渲染 + API 数据加载
```

### 4. 验证方式（按测试类型选择）

**Interaction 类 — 代码断言**:
```javascript
// 检查元素存在
const button = await page.locator('button:has-text("Submit")');
await expect(button).toBeVisible();

// 点击 + 状态变化
await button.click();
await expect(page.locator('.success-message')).toBeVisible();
```

**Visual 类 — 截图 + subagent 审查**:
```javascript
// 截图用 JPEG，quality 70（体积远小于 PNG）
await page.screenshot({
  path: 'verify-screenshot.jpeg',
  type: 'jpeg',
  quality: 70,
  fullPage: false
});
```
⚠️ **主会话绝不 Read 截图文件**（撑爆 context）。Visual 类验证 spawn subagent (haiku) 读截图并返回纯文本 PASS/FAIL。

### 5. 截图覆盖范围（根据改动类型）

| 改动范围 | 必须截图页面 | 视口宽度 |
|---------|------------|---------|
| 全局样式 / Layout / CSS 变量 | Dashboard + CaseDetail + 1 其他页 | 1440px |
| 单个页面组件 | 该页面 | 1440px |
| 响应式布局 | 该页面 | 1440px + 1280px + 1024px |
| Sidebar / 导航 | Dashboard（含侧边栏） | 1440px |

### 6. 清理

```javascript
await browser.close();
// 删除截图文件（不提交到 git）
```

## 常见坑

| 症状 | 原因 | 解决 |
|------|------|------|
| 页面显示登录页 | JWT_SECRET 不匹配 | 检查 `dashboard/.env` 的 JWT_SECRET 值 |
| 页面空白/白屏 | TypeScript 编译错误 | 检查 dev server 控制台输出 |
| 导航超时 | `waitUntil: 'networkidle'` + SSE | 改用 `'domcontentloaded'` + `waitForTimeout(3000)` |
| 找不到浏览器 | 尝试用 Chrome | 必须 `channel: 'msedge'` |
| 截图累积撑爆 context | 主会话 Read 截图 | 截图只保存文件，Visual 类委托 subagent |
| `--profile` 路径错误 | 相对路径 | 用 `$TEMP/playwright-verify-profile` 绝对路径 |

## 安全红线

- ❌ 不点击 "Execute" 按钮（触发 D365 写操作）
- ✅ 其他按钮（Full Process、Troubleshoot、Draft Email）是只读流程，可以点击
- ✅ Issue 操作按钮（New Track、Cancel、Edit、Reopen、Mark Done、Verify）可以点击
