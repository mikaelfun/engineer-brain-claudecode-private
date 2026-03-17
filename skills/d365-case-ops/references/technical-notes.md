# 技术笔记与已知陷阱

本文件记录开发脚本过程中发现的关键技术决策和已知陷阱，供 Agent 在修复 bug 或创建新脚本时参考。

> 最后更新：2026-03-05

---

## CKEditor 5 集成（邮件编辑器）

D365 的邮件编辑器使用 CKEditor 5，通过 `el.ckeditorInstance` 访问实例。

### 可用的 API

| 方法 | 用途 | 适用场景 |
|------|------|---------|
| `ck.model.insertContent(fragment)` | 在光标位置插入内容 | 新建邮件：光标在 body div 内，插入到签名前 |
| `ck.setData(html)` | 替换编辑器全部内容 | 编辑草稿/回复：需要手动保留签名 |
| `ck.getData()` | 获取编辑器当前 HTML | 用于定位签名位置 |

### insertContent 用法（new-email.ps1）

```javascript
const ck = el.ckeditorInstance;
const viewFragment = ck.data.processor.toView(html);
const modelFragment = ck.data.toModel(viewFragment);
ck.model.insertContent(modelFragment);
```

### setData 用法（edit-draft.ps1, reply-email.ps1）

签名定位：通过 `id="signature"` 找到签名位置，然后向上找两层 `<div` 获取完整签名块。

```javascript
const currentData = ck.getData();
const sigIndex = currentData.indexOf('id="signature"');
const beforeSig = currentData.substring(0, sigIndex);
const parentDivStart = beforeSig.lastIndexOf('<div');
const outerStart = currentData.substring(0, parentDivStart).lastIndexOf('<div');
const signature = currentData.substring(outerStart);
ck.setData(newBodyHtml + '<p style="margin:0in;">&nbsp;</p>' + signature);
```

### 什么方法不可用

| 方法 | 为什么不行 |
|------|-----------|
| `keyboard.type()` | 字体不一致（默认 Segoe UI 11pt，签名是 Calibri 12pt），自动格式化会破坏列表 |
| `element.innerHTML = ...` | CKEditor 忽略直接 DOM 操作 |
| `navigator.clipboard` / `execCommand('paste')` | 浏览器权限阻止 |
| `document.execCommand('insertHTML')` | CKEditor 不响应 |

### 邮件 HTML 格式要求

正文必须使用 Calibri 12pt 以匹配签名格式：

```html
<p style="margin:0in;"><span style="color:rgb(0,0,0);font-family:Calibri;font-size:12pt;">正文文字</span></p>
```

空行：
```html
<p style="margin:0in;"><span style="color:rgb(0,0,0);font-family:Calibri;font-size:12pt;">&nbsp;</span></p>
```

### "Draft with Copilot" 卡片

新建邮件时，CKEditor 内部会出现一个 Copilot 辅助写作卡片，必须先关闭才能注入内容：

```javascript
const copilotCloseBtn = editor.locator('[id*=draftWithCopilot] button').first();
if (await copilotCloseBtn.count() > 0) {
    await copilotCloseBtn.click();
}
```

### Reply 编辑器与 New Email 编辑器的区别

- **New Email**：body div 和 signature div 是编辑器的独立子元素，光标在 body div 内用 `insertContent` 即可
- **Reply**：body placeholder（`<p><br><br>&nbsp;</p>`）和 signature 在同一个 `<div style="direction:ltr;">` 内，后面跟着 Original Message 引用。用 `setData` 替换更可靠

---

## Duration 控件

D365 的 Duration 控件（HR:MIN 格式）不支持 `fill()` 或 `type()` 直接输入。

### 设置方法

```
1. 用 Increment Hours/Minutes 按钮激活控件
2. 找到按钮的兄弟 input 元素：button.locator('..').locator('input')
3. triple-click 选中 → pressSequentially 输入数字
```

### 已知陷阱

- 点击 `Increment Minutes` 会自动将 Hours 设为 "01"（如果 Hours 还是 "--"）
- 需要在设完分钟后检查并修正 Hours 值
- 按钮选择器：`getByRole('button', { name: 'Increment Hours' })`

---

## D365 双重文本问题

许多 D365 元素的 `textContent` 会重复显示（如 `"CustomerTitleCustomerTitle"`），因为内部有嵌套元素。

### 通用去重方法

```javascript
const dedup = (s) => {
    const half = Math.floor(s.length / 2);
    return (half > 0 && s.substring(0, half) === s.substring(half))
        ? s.substring(0, half)
        : s;
};
```

---

## playwright-cli 输出解析

### Result 提取

```powershell
if ($output -match '### Result\s+"([\s\S]+?)"\s*###') {
    $result = $Matches[1] -replace '\\n', "`n" -replace '\\"', '"'
}
```

### JSON 嵌套解析陷阱

嵌套 JSON 的 `}` 会被非贪婪正则 `\{[\s\S]*?\}` 截断。解决方案：
- 用行文本格式 + `|||` 分隔符（Case 标题可能包含 `|`，不能用单 `|`）
- 或使用 `Invoke-PlaywrightCode` 辅助函数

---

## Timeline 条目结构

Timeline 中的每个条目是 `listitem`，`aria-label` 格式如 `"Email from xxx@xxx.com"`。

### 已知条目类型

| 类型 | 识别方式 | 特有操作 |
|------|---------|---------|
| Sent Email | `textContent` 包含 "Sent Email" | Reply All, Open Record, Pin |
| Received Email | `textContent` 包含 "Received Email" | Reply All, Open Record, Pin |
| Draft Email | `textContent` 包含 "Draft Email" | Open Record, Pin |
| Phone Call | `textContent` 包含 "Phone Call" | Open Record, Pin |
| Note | `textContent` 包含 "Note" + "Created on" | Edit, Copy to clipboard, Pin |

### Hover 才可见的链接

`Reply All` 和 `Open Record` 链接只有在 hover 到条目上时才显示：

```javascript
await item.hover();
await page.waitForTimeout(1000);
const replyLink = item.getByRole('link', { name: 'Reply All' });
```

---

## D365 Session 与 Tab 模型

- **Dashboard 打开 Case** → 在当前 Session 内创建新 Tab
- **搜索打开 Case** → 在 Session list 创建新 Session
- Tab 可通过 `tablist "Tab list"` 内的 `tab` 元素切换
- Session 通过左侧列表切换

---

## _init.ps1 公共函数

### `Invoke-PlaywrightCode -Code <js>`
封装 `playwright-cli run-code`，自动提取 `### Result` 内容。返回 `$null` 表示失败。

### `ConvertTo-EmailHtml -Text <string> [-NoTrailingBlank]`
将纯文本转换为 Calibri 12pt HTML。每行一个 `<p>`，空行用 `&nbsp;`。
- 默认末尾加一个空行（用于 new-email 的 insertContent）
- `-NoTrailingBlank`：不加末尾空行（用于 edit-draft/reply-email 的 setData，因为 JS 中手动加）

### `ConvertTo-JsString -Text <string>`
转义字符串用于嵌入 JavaScript 单引号字符串（`\` → `\\`，`'` → `\'`，`"` → `\"`，换行 → `\n`）。

---

## 选择器策略

- ✅ **推荐**：`getByRole('button', { name: 'Save case' })` — 大多数元素可用
- ✅ **推荐**：`page.locator('[role=tab][aria-label=Summary]')` — **Case Form tab 必须用 CSS 选择器**
- ⚠️ **已知问题**：`getByRole('tab', { name: 'Summary' })` 在 D365 UCI 多层嵌套中**不可靠**，Playwright 的 accessibility tree 无法正确匹配
- ⚠️ **已知问题**：`getByRole('menuitem', { name: 'Labor' })` 可能匹配到多个元素，需用 `page.locator('[role=menuitem][aria-label=Labor]')` 精确定位
- ❌ **禁止**：ref ID（如 `e1277`）— 每次刷新都变
- ❌ **禁止**：DOM ID（如 `#TextField295`）— 不可靠
- ⚠️ **注意**：`Save and Close` 在 Quick Create 对话框中有 2 个匹配 → 用 `.first()`
- ⚠️ **注意**：iframe 只在 App Landing Page 需要处理（`frameLocator('#AppLandingPage')`），进入 Case 后在主页面操作

---

## 视口与布局

- **无头模式必须设置 `setViewportSize({ width: 1920, height: 1080 })`**，否则 OneVoice Connector 侧面板会遮挡主内容区，导致所有点击被拦截
- `open-app.ps1` 已内置此设置
- "More Tabs" 和 "Related" 是同一个功能的不同呈现形式，取决于视口宽度。脚本应同时兼容两者

---

## 公共函数：Ensure-CaseFormContext

`_init.ps1` 提供 `Ensure-CaseFormContext [-Tab <name>]` 函数：
- 检测 `[role=tab][aria-label=Summary]` 是否存在来判断是否在 Case Form 上
- 如果指定了 `-Tab`，自动用 `force: true` 点击切换
- 不在 Case Form 时输出 `❌ Not on Case Form. Use switch-case to navigate to the Case first.` 并 exit 1
- 所有需要 Case Form 上下文的脚本都应在开头调用此函数

---

## API First + UI Fallback 架构

### 原理

脚本内部优先通过 OData API 操作（快速、稳定、返回结构化数据），API 失败时自动回落到 Playwright UI 操作。

### API 调用方式

通过 `page.evaluate(async () => fetch(...))` 在已登录的 D365 页面上下文中执行 fetch 调用。
浏览器自动携带 Cookie（包括 HttpOnly 的 `CrmOwinAuth`），无需额外认证。

**关键限制**：
- 必须在 D365 页面（`onesupport.crm.dynamics.com`）上执行，`about:blank` 页面会 401
- 使用相对 URL（如 `/api/data/v9.0/incidents`），不需要绝对 URL
- PowerShell 的 `@"..."@` here-string 会把 URL 中的 `$` 当变量处理，必须用 `@'...'@` 单引号 here-string + 占位符替换

### incidentid 缓存

多数 API 调用需要 incidentid（GUID），通过 `$env:TEMP/d365-case-context.json` 缓存：
- `Get-IncidentId -TicketNumber xxx`：查 API 并缓存
- `Get-CurrentCaseId`：优先读缓存，未命中则从页面提取 ticketnumber 再查 API
- 缓存是单 Case 的（切换 Case 后下一次 API 调用会自动更新）

### API 参考文档

详见 [api-reference.md](api-reference.md) 和 [entity-model.md](entity-model.md)。

---

## 弹窗处理

常见弹窗及处理（详见 [popup-handling.md](popup-handling.md)）：

| 弹窗 | 处理 |
|------|------|
| Copilot 广告 "A Copilot for you!" | `button "Dismiss"` |
| 麦克风权限提示 | `button "Close"` 或忽略 |
| AI "Change status for this case" | `dialog` → `button "Cancel"` |
| Delete 确认 | `button "Delete"` (exact: true) |

---

## 工作区日志治理（.playwright-cli）

为避免 skill 目录长期运行后堆积快照和 console 日志，`_init.ps1` 在脚本启动时会将产物输出到 runtime 目录并执行轻量清理：

- 默认目标目录：`$env:TEMP\d365-case-ops-runtime\.playwright-cli`
- 若外部已设置 `PLAYWRIGHT_MCP_OUTPUT_DIR`，脚本会使用外部值（不覆盖）
- 清理文件：`console-*.log`、`page-*.yml`
- 默认策略：
  - 每种模式最多保留最近 `10` 个文件
  - 删除 `7` 天前的历史文件

### 环境变量开关

```powershell
# 关闭自动清理
$env:D365_WORKSPACE_HYGIENE_DISABLE = '1'

# 每类文件保留数量（默认 10）
$env:D365_PLAYWRIGHT_LOG_KEEP = '20'

# 清理阈值天数（默认 7）
$env:D365_PLAYWRIGHT_LOG_MAX_AGE_DAYS = '14'

# 可选：外部指定输出目录（优先级高于默认 runtime 目录）
$env:PLAYWRIGHT_MCP_OUTPUT_DIR = 'D:\pw-output\d365-case-ops\.playwright-cli'
```

### 设计取舍

- 清理动作放在 `_init.ps1`，这样所有脚本统一生效，无需每个脚本单独实现。
- 仅清理可再生运行产物，不碰 `scripts/`、`references/`、`assets/` 等业务文件。
- 删除失败会输出 warning，不会中断业务脚本主流程。
