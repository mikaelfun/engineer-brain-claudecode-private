---
name: owa-email-search
displayName: OWA 邮件搜索
category: inline
stability: dev
requiredInput: caseNumber
description: "通过 Playwright + OWA 搜索 Case 邮件完整对话。无 API 限流，纯文本输出，支持团队邮件。调用 /owa-email-search {caseNumber}"
allowed-tools:
  - Bash
  - Read
  - Write
---

# /owa-email-search — OWA 邮件搜索

通过 Playwright 自动化 Outlook Web App，搜索 Case 相关邮件，提取完整 conversation body（纯文本），保存为 `emails-owa.md`。

## 优势（vs Mail MCP）

- **无 API 限流** — 浏览器操作，不走 Graph API
- **纯文本输出** — `innerText` 直接可用，不需要 HTML 清洗
- **团队邮件** — OWA 能看到的都能搜到（团队 DL 抄送）
- **去重引用** — 自动截断嵌套的引用历史，每封邮件只保留原创内容
- **~45-70s/case** — 耗时稳定，无长尾

## 参数

- `$ARGUMENTS` — Case 编号（如 `2603060030001353`）

## 前置条件

- `playwright-cli` 已安装（npm global）
- Edge 浏览器已登录 Microsoft 账号（首次运行 persistent profile 会继承 SSO）
- D365 的 playwright session 不受影响（OWA 用独立 `-s=owa` session）

## 执行步骤

### 1. 配置读取

```
读取 config.json 获取 casesRoot
设置 caseDir = {casesRoot}/active/{caseNumber}/
确保目录存在：mkdir -p "{caseDir}/logs"
```

### 2. 调用脚本

```bash
pwsh -File "skills/email-search/owa-email-fetch.ps1" \
  -CaseNumber "{caseNumber}" \
  -OutputPath "{caseDir}/emails-owa.md" \
  -LogFile "{caseDir}/logs/owa-email-search.log"
```

脚本内部流程（全自动，无需干预）：
1. **启动浏览器** — persistent Edge profile + SSO，复用已有 session
2. **搜索** — 导航到 OWA inbox → 输入 Case 号 → 等待搜索结果
3. **提取** — 遍历所有 conversation → expand → scrollIntoView 触发懒加载 → 提取 body
4. **去重** — 截断嵌套引用历史（From:/Sent: 或 发件人:/发送时间: 之后的内容）
5. **输出** — 写入 `emails-owa.md`

### 3. 检查结果

脚本输出 `STATUS=OK/EMPTY/FAILED` + `EMAIL_COUNT` + `SIZE_KB` + `DURATION_MS`。

- `STATUS=OK` → 成功，读取 `emails-owa.md` 获取内容
- `STATUS=EMPTY` → 搜索无结果（Case 号不在邮件 subject 中）
- `STATUS=FAILED` → 3 次重试都失败（浏览器问题），报告给用户

## 输出文件

- `{caseDir}/emails-owa.md` — 完整邮件对话（markdown 格式）
- `{caseDir}/logs/owa-email-search.log` — 执行日志

### 输出格式

```markdown
# Emails (OWA) — Case {caseNumber}

> Generated: {timestamp} | Conversations: N | Emails: N | Bodies: N | Source: OWA Full Body

---

### 📤 Sent | Mon 3/16
**From:** Eddie Dai

Hi 王先生，请问您现在有时间吗？...

---

### 📥 Received | Mon 3/16
**From:** Wang, Jin (J.)

还是不行，另外，上封邮件中关于执行脚本的问题如何操作呢？

---
```

## 错误处理

- **浏览器崩溃** → 自动重试最多 2 次（关闭残留进程后重启）
- **搜索超时** → 15s 轮询，超时返回 EMPTY
- **提取失败（EXTRACT_ERROR）** → 自动重试（DOM textarea 读取偶发不稳定）
- **D365 session 冲突** → 无冲突（OWA 用独立 `-s=owa` session）

## 关键约束

- 依赖 OWA DOM 结构（`[role=listitem]`、`[aria-label="Message body"]`）— OWA 改版可能需要更新选择器
- 每个 Case ~45-70s — 不适合大批量（30+ Case 用 email-batch-worker agent）
- 浏览器 headless 模式，不影响用户桌面操作
- 首次运行可能需要 SSO 登录（之后 persistent profile 保持登录状态）
