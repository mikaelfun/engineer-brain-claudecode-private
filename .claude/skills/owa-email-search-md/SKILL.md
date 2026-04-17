---
name: owa-email-search
displayName: OWA 邮件搜索
category: inline
stability: dev
requiredInput: caseNumber
description: "通过 Playwright + OWA 搜索 Case 邮件完整对话。无 API 限流，支持内联图片提取，支持团队邮件。调用 /owa-email-search {caseNumber}"
allowed-tools:
  - Bash
  - Read
  - Write
---

# /owa-email-search — OWA 邮件搜索

通过 Playwright 自动化 Outlook Web App，搜索 Case 相关邮件，提取完整 conversation body + 内联图片，保存为 `emails-owa.md` + `images/owa-img-*.png`。

## 优势（vs Mail MCP）

- **无 API 限流** — 浏览器操作，不走 Graph API
- **内联图片提取** — canvas.toDataURL 捕获邮件中的截图，保留在 markdown 中的原始位置
- **去重清洗** — 两轮去重（collapsed 引用 + 子串去重），SafeLinks 清洗，Banner 噪声过滤
- **垃圾邮件过滤** — 自动跳过 OOF、自动回复、退信、签名 logo
- **Footer 清理** — 自动去除 Confidentiality disclaimer、"Sent from iPhone" 等
- **团队邮件** — OWA 能看到的都能搜到（团队 DL 抄送）
- **~15-25s/case** — 纯文本模式（v3 优化）；带图片 ~20-35s

## 参数

- `$ARGUMENTS` — Case 编号（如 `2603060030001353`）
- 可选：在调用脚本时添加 `-NoImages` 使用纯文本模式（不提取图片，更快）
- 可选：`-JsonOutput` 同时输出 JSON 格式（`emails-owa.json`），schema 固定
- 可选：`-Headed` 有头模式调试

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

```powershell
# 默认：带图片提取
pwsh -File ".claude/skills/email-search/scripts/owa-email-fetch.ps1" `
  -CaseNumber "{caseNumber}" `
  -OutputPath "{caseDir}/emails-owa.md" `
  -LogFile "{caseDir}/logs/owa-email-search.log"

# 纯文本模式（更快，不提取图片）
pwsh -File ".claude/skills/email-search/scripts/owa-email-fetch.ps1" `
  -CaseNumber "{caseNumber}" `
  -OutputPath "{caseDir}/emails-owa.md" `
  -LogFile "{caseDir}/logs/owa-email-search.log" `
  -NoImages

# 调试模式（headed，可观察浏览器操作）
pwsh -File ".claude/skills/email-search/scripts/owa-email-fetch.ps1" `
  -CaseNumber "{caseNumber}" `
  -OutputPath "{caseDir}/emails-owa.md" `
  -Headed
```

脚本内部流程（v3 mega JS 架构，全自动）：
1. **启动浏览器** — persistent Edge profile + SSO，复用已有 session，智能跳过已在 OWA 的导航
2. **搜索** — 一次 eval 设置参数 + 聚焦搜索框 → type + Enter
3. **等待+提取** — 单次 mega JS 完成搜索等待（200ms in-browser 轮询）+ DOM walking + 邮件提取（零进程间开销）
4. **智能等待** — DOM-readiness 检查替代固定 sleep（50ms 轮询 vs 旧版 2000ms 固定等待）
5. **展开后 break** — 找到主会话展开后立即 break，不遍历剩余搜索结果
6. **去重+输出** — 两轮去重 + junk 过滤 + footer 清理 + SafeLinks/Banner 清洗 → MD + 图片

### 3. 检查结果

脚本输出 `STATUS=OK/EMPTY/FAILED` + `EMAIL_COUNT` + `IMAGE_COUNT` + `SIZE_KB` + `DURATION_MS`。

- `STATUS=OK` → 成功，读取 `emails-owa.md` 获取内容
- `STATUS=EMPTY` → 搜索无结果（Case 号不在邮件 subject 中）
- `STATUS=FAILED` → 3 次重试都失败（浏览器问题），报告给用户

## 输出文件

- `{caseDir}/emails-owa.md` — 完整邮件对话（markdown 格式，含图片引用）
- `{caseDir}/emails-owa.json` — 结构化邮件数据（仅 `-JsonOutput` 时生成）
- `{caseDir}/images/owa-img-*.png` — 内联图片（仅带图片模式）
- `{caseDir}/logs/owa-email-search.log` — 执行日志

### JSON Schema

```json
{
  "caseNumber": "2604070030001137",
  "generatedAt": "2026-04-08T03:30:00.000Z",
  "source": "OWA Full Body + Images",
  "conversationCount": 2,
  "emailCount": 5,
  "bodyCount": 5,
  "imageCount": 1,
  "emails": [
    {
      "index": 0,
      "direction": "Outgoing",
      "from": "Kun Fang",
      "date": "Mon 4/7",
      "subject": "",
      "body": "Hi xxx, ...",
      "imageCount": 0
    }
  ]
}
```

### MD 输出格式

```markdown
# Emails (OWA) — Case {caseNumber}

> Generated: {timestamp} | Conversations: N | Emails: N | Bodies: N | Images: N | Source: OWA Full Body + Images

---

### 📤 Sent | Mon 3/16/2026 10:30 AM
**From:** Eddie Dai

Hi 王先生，请问您现在有时间吗？

![image](images/owa-img-001.png)

以上是截图...

---

### 📥 Received | Mon 3/16/2026 2:15 PM
**From:** Wang, Jin (J.)

还是不行，另外，上封邮件中关于执行脚本的问题如何操作呢？

---
```

## v3 优化详情（vs v1/v2）

| 优化 | 效果 |
|------|------|
| Mega JS 架构 | 搜索等待 + 提取在一次 eval 中完成，零 IPC 开销 |
| DOM-readiness 轮询 | 50ms 粒度轮询替代 2000ms 固定 sleep |
| 智能导航 | 已在 OWA 不重复 goto，处理 about:blank |
| 展开后 break | 主会话找到后立即停止，不遍历所有搜索结果 |
| Option 去重 | 归一化 label 去重，避免重复处理同一会话 |
| Scoped DOM 查询 | readingPane/messageList 局部查询，避免全局扫描 |
| 垃圾邮件过滤 | 自动跳过 OOF、退信、auto-reply、postmaster |
| Footer 清理 | 自动去除 Confidentiality disclaimer 等 |
| 安全上限 | 最多处理 15 个会话，防止无限循环 |

## 错误处理

- **浏览器崩溃** → 自动重试最多 2 次（关闭残留进程后重启）
- **搜索超时** → 15s 轮询，超时返回 EMPTY
- **提取失败（EXTRACT_ERROR）** → 自动重试（DOM textarea 读取偶发不稳定）
- **D365 session 冲突** → 无冲突（OWA 用独立 `-s=owa` session）
- **图片 CORS 失败** → 跳过该图片（标记 `[image: extraction failed]`），不影响其他图片

## 关键约束

- 依赖 OWA DOM 结构（`[role=listitem]`、`[aria-label="Message body"]`）— OWA 改版可能需要更新选择器
- 每个 Case ~15-25s（纯文本）/ ~20-35s（带图片）— 不适合大批量
- 浏览器默认 headless 模式，加 `-Headed` 参数可开启有头模式调试
- 图片通过 canvas.toDataURL 提取，CORS 外部图片（如签名 CDN 图）会跳过
- 签名小图标（<50px 或重复出现）自动过滤，不保存
