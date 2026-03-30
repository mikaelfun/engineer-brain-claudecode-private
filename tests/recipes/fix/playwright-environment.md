# Recipe: Playwright Environment

> 适用于：Playwright 浏览器启动失败、snapshot 撑爆 context、profile 路径错误、截图累积等浏览器环境问题

## 匹配条件

- Playwright 报 `browser not found`、`Chromium` 相关错误
- 使用了 Chrome/Chromium 而非 msedge
- `browser_snapshot` 导致 context 爆炸或会话丢失上下文
- `--profile` 路径错误导致浏览器数据写入错误位置
- 截图文件累积，session context 膨胀

## 前置检查

- [ ] 确认 `.mcp.json` 配置了 `--browser msedge`
- [ ] 确认不在代码中使用 Chrome/Chromium channel
- [ ] 确认 profile 路径是绝对路径

## 执行步骤

### 1. 浏览器选择 — 必须 msedge

本机**未安装** Chrome/Chromium，Playwright 必须使用 Edge：

```javascript
// ✅ 正确
const browser = await chromium.launch({ channel: 'msedge' });

// ❌ 错误 — 会报找不到浏览器
const browser = await chromium.launch(); // 默认找 Chromium
const browser = await chromium.launch({ channel: 'chrome' }); // 没有 Chrome
```

MCP Playwright 配置（`.mcp.json`）已设置 `--browser msedge`，MCP 工具调用无需额外配置。

### 2. Profile 路径 — 必须绝对路径

```bash
# ✅ 正确：绝对路径
--profile "$TEMP/playwright-d365-profile"

# ❌ 错误：相对路径（浏览器数据写入不可预测的位置）
--profile "./profile"
--profile "profile"
```

### 3. Snapshot 禁令 — 主会话禁用 browser_snapshot

`browser_snapshot` 输出数百行 YAML，一次调用就能撑爆会话 context，导致后续交互被 compact 丢失关键上下文。

**替代方案（按优先级）：**

1. **`browser_evaluate`** — 提取关键数据，返回结构化 JSON
   ```javascript
   // ✅ 只提取需要的数据
   const result = await page.evaluate(() => ({
     title: document.title,
     caseCount: document.querySelectorAll('.case-row').length,
     hasError: !!document.querySelector('.error-banner')
   }));
   ```

2. **`browser_take_screenshot`** — 保存为文件（JPEG, quality=60-70）
   ```javascript
   await page.screenshot({
     path: 'verify-screenshot.jpeg',
     type: 'jpeg',
     quality: 60,
     fullPage: false
   });
   ```

3. **Spawn 轻量 subagent (haiku)** — Visual 类验证委托 subagent
   - Subagent 内可用 snapshot（context 随 subagent 结束自动释放）
   - 主会话**绝不 Read 截图文件**

### 4. 截图管理 — 防止累积

| 规则 | 说明 |
|------|------|
| 格式 | JPEG, quality=60（体积远小于 PNG） |
| 频率 | 只在关键验证点截图，不要每步都截 |
| 存储 | 保存到文件，不传回会话 |
| 查看 | Visual 类委托 subagent 查看，subagent 结束后 context 自动释放 |
| 清理 | 验证完毕后删除截图文件（不提交到 git） |

### 5. 常见启动问题修复

```bash
# 如果 msedge 进程残留导致启动失败
# 找到 msedge 进程（注意不要杀掉用户正在使用的 Edge）
tasklist | findstr msedge

# Playwright 通常能自动管理浏览器进程，如果卡住可等待 30 秒后重试
```

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| 用了 Chrome/Chromium | `Failed to launch browser` / `browser not found` | 改为 `channel: 'msedge'` |
| 主会话调了 browser_snapshot | context 膨胀, 后续交互被 compact 丢上下文 | 用 `browser_evaluate` 或 `browser_take_screenshot` |
| profile 用了相对路径 | 浏览器数据写入错误位置 | 用 `$TEMP/playwright-d365-profile` 绝对路径 |
| 截图累积 | 多次 Read 截图撑爆 session | 截图保存文件，委托 subagent 查看 |
| waitUntil: 'networkidle' | SSE 连接导致页面永不 idle，导航超时 | 用 `'domcontentloaded'` + `waitForTimeout(3000)` |
| PNG 截图体积大 | 单张 > 1MB | 用 JPEG quality=60，通常 < 200KB |

_来源：learnings.yaml `playwright-msedge-only`, `playwright-profile-path`, `browser-snapshot-ban`, `screenshot-accumulation`_
