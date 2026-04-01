---
name: email-search
displayName: 邮件搜索
category: inline
stability: dev
requiredInput: caseNumber
description: "通过 Office Mail MCP 搜索 Case 相关邮件完整内容。可独立调用 /email-search {caseNumber}，也可被 casework/其他 skill 引用。"
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__mail__SearchMessagesQueryParameters
  - mcp__mail__GetMessage
---

# /email-search — Outlook 邮件搜索

通过 Office Mail MCP 搜索 Outlook 邮箱中与 Case 相关的邮件，获取完整正文（含 HTML），清洗后保存为 `emails-office.md`。

## 为什么需要

D365 的 `emails.md` 通过 CRM API 获取，经常出现内容截断、格式丢失。直接搜索 Outlook 邮箱可以获取完整邮件正文，两个文件互补：
- `emails.md` = D365 源（结构化、可靠但可能截断）
- `emails-office.md` = Outlook 源（完整正文）

## 参数
- `$ARGUMENTS` — Case 编号（如 `2603230030001513`）

## 配置读取
```
读取 config.json 获取 casesRoot
设置 caseDir = {casesRoot}/active/{caseNumber}/（使用绝对路径）
确保 caseDir 存在：mkdir -p "{caseDir}"
确保 logs 目录存在：mkdir -p "{caseDir}/logs"
```

## 执行日志

**每个步骤执行前后都必须写入日志文件 `{caseDir}/logs/email-search.log`。**

日志格式（每行一条，append 模式）：
```
[YYYY-MM-DD HH:MM:SS] STEP {步骤号} {状态} | {描述}
```

示例：
```
[2026-03-26 10:00:00] STEP 1 START | Search emails for case 2603230030001513
[2026-03-26 10:00:03] STEP 1 OK    | Found 12 emails
[2026-03-26 10:00:04] STEP 2 START | Fetching full content for 12 emails
[2026-03-26 10:00:15] STEP 2 OK    | Fetched 11/12 emails (1 failed)
[2026-03-26 10:00:16] STEP 3 START | HTML cleanup and output generation
[2026-03-26 10:00:18] STEP 3 OK    | emails-office.md saved (11 emails, 45KB)
```

## 执行步骤

### 1. 搜索邮件

使用 `mcp__mail__SearchMessagesQueryParameters` 搜索 Case 编号相关邮件：
```
queryParameters: ?$search="{caseNumber}"&$top=50&$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,bodyPreview,isRead
```

**结果处理**：
- 记录搜索到的邮件数量
- 如果 0 封 → 写日志 `STEP 1 EMPTY | No emails found`，生成空的 `emails-office.md`（仅含标题和说明），然后结束
- 提取每封邮件的 `id` 用于后续拉取

### 2. 拉取完整邮件内容

对每封邮件调用 `mcp__mail__GetMessage`：
```
id: {messageId}
bodyPreviewOnly: false
preferHtml: true
```

**注意事项**：
- 单封邮件失败不阻塞其他邮件获取 — 记录失败的 messageId 和错误原因
- 邮件 body 可能很大（100KB+ HTML），这是正常的
- 拉取完成后记录成功/失败数量

### 3. HTML 清洗 + 生成 emails-office.md

**3a. HTML 清洗**

对每封邮件的 HTML body，使用 Python 脚本清洗为纯文本：

```bash
python3 -c "
import html
import re
import sys

raw = sys.stdin.read()

# Remove <style> blocks
text = re.sub(r'<style[^>]*>.*?</style>', '', raw, flags=re.DOTALL | re.IGNORECASE)

# Remove <script> blocks
text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)

# Replace <br>, <br/>, <br />, </p>, </div>, </tr>, </li> with newlines
text = re.sub(r'<br\s*/?>|</p>|</div>|</tr>|</li>', '\n', text, flags=re.IGNORECASE)

# Replace </td> with tab (for table alignment)
text = re.sub(r'</td>', '\t', text, flags=re.IGNORECASE)

# Remove all remaining HTML tags
text = re.sub(r'<[^>]+>', '', text)

# Decode HTML entities
text = html.unescape(text)

# Compress multiple blank lines to max 2
text = re.sub(r'\n{3,}', '\n\n', text)

# Strip leading/trailing whitespace per line, remove trailing spaces
lines = [line.rstrip() for line in text.splitlines()]
text = '\n'.join(lines)

# Strip leading/trailing blank lines
text = text.strip()

print(text)
" <<'HTMLEOF'
{html_body}
HTMLEOF
```

> ⚠️ 由于邮件 body 可能非常大，如果 heredoc 方式有问题，可以先将 HTML 写入临时文件再处理：
> ```bash
> python3 /path/to/clean_html.py < /tmp/email_body.html
> ```

**3b. 生成 emails-office.md**

按 `receivedDateTime` **正序**（最早的在前）排列，格式如下：

```markdown
# Emails (Outlook) — Case {caseNumber}

> Generated: {YYYY-MM-DD HH:MM:SS} | Total: {N} emails | Source: Office Mail MCP

---

### {方向图标} {Sent/Received} | {YYYY-MM-DD HH:MM}
**Subject:** {subject}
**From:** {displayName} <{emailAddress}>
**To:** {recipients}
**Cc:** {cc (如无则省略此行)}

{cleaned body text}

---
```

**方向判断**：
- From 地址包含 `@microsoft.com` → `📤 Sent`（工程师发出）
- 否则 → `📥 Received`（客户/外部发来）

**收件人格式**：
- 多个收件人用 `; ` 分隔
- 格式：`Name <email>`

### 4. 写入文件

将生成的内容写入 `{caseDir}/emails-office.md`。

### 5. 写日志

```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] email-search DONE | {N} emails saved to emails-office.md" >> "{caseDir}/logs/email-search.log"
```

## 输出文件
- `{caseDir}/emails-office.md` — Outlook 邮件完整内容（清洗后）
- `{caseDir}/logs/email-search.log` — 执行日志

## 错误处理
- Mail MCP 搜索失败 → 记录错误到日志，向用户报告
- 单封邮件拉取失败 → 记录失败的邮件 ID，继续处理其他邮件
- HTML 清洗失败 → 降级使用 `bodyPreview` 作为邮件内容
- Python 不可用 → 降级使用简单的 sed/正则替换做基础清洗
- **不修改** `emails.md`（D365 源由 `data-refresh` 管理）

## 关键约束
- 每封邮件 body 可能很大（100KB+ HTML），用 `bodyPreviewOnly: false` + `preferHtml: true` 获取完整内容
- 搜索结果上限 50 封，覆盖绝大多数 Case 的邮件量
- 失败的单封邮件不阻塞其他邮件获取
- 日志格式与其他 skill 一致
- 中文字符需正常显示（Python 默认 UTF-8 即可）
