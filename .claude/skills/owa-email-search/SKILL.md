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
- **团队邮件** — OWA 能看到的都能搜到（团队 DL 抄送）
- **~45-70s/case** — 纯文本模式；带图片 ~60-90s

## 参数

- `$ARGUMENTS` — Case 编号（如 `2603060030001353`）
- 可选：在调用脚本时添加 `-NoImages` 使用纯文本模式（不提取图片，更快）

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
# 默认：带图片提取
pwsh -File "skills/email-search/owa-email-fetch.ps1" \
  -CaseNumber "{caseNumber}" \
  -OutputPath "{caseDir}/emails-owa.md" \
  -LogFile "{caseDir}/logs/owa-email-search.log"

# 纯文本模式（更快，不提取图片）
pwsh -File "skills/email-search/owa-email-fetch.ps1" \
  -CaseNumber "{caseNumber}" \
  -OutputPath "{caseDir}/emails-owa.md" \
  -LogFile "{caseDir}/logs/owa-email-search.log" \
  -NoImages
```

脚本内部流程（全自动，无需干预）：
1. **启动浏览器** — persistent Edge profile + SSO，复用已有 session
2. **搜索** — 导航到 OWA inbox → 输入 Case 号 → 等待搜索结果
3. **提取** — DOM walking 遍历邮件正文，保留图片位置 + canvas 提取图片数据
4. **去重** — 两轮：① 移除 collapsed 引用 body ② 子串去重；清洗 SafeLinks URL + Banner 噪声
5. **输出** — 写入 `emails-owa.md` + 保存 `images/owa-img-*.png`

### 3. 检查结果

脚本输出 `STATUS=OK/EMPTY/FAILED` + `EMAIL_COUNT` + `IMAGE_COUNT` + `SIZE_KB` + `DURATION_MS`。

- `STATUS=OK` → 成功，读取 `emails-owa.md` 获取内容
- `STATUS=EMPTY` → 搜索无结果（Case 号不在邮件 subject 中）
- `STATUS=FAILED` → 3 次重试都失败（浏览器问题），报告给用户

## 输出文件

- `{caseDir}/emails-owa.md` — 完整邮件对话（markdown 格式，含图片引用）
- `{caseDir}/images/owa-img-*.png` — 内联图片（仅带图片模式）
- `{caseDir}/logs/owa-email-search.log` — 执行日志

### 输出格式

```markdown
# Emails (OWA) — Case {caseNumber}

> Generated: {timestamp} | Conversations: N | Emails: N | Bodies: N | Images: N | Source: OWA Full Body + Images

---

### 📤 Sent | Mon 3/16
**From:** Eddie Dai

Hi 王先生，请问您现在有时间吗？

![image](images/owa-img-001.png)

以上是截图...

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
- **图片 CORS 失败** → 跳过该图片（标记 `[image: extraction failed]`），不影响其他图片

## 关键约束

- 依赖 OWA DOM 结构（`[role=listitem]`、`[aria-label="Message body"]`）— OWA 改版可能需要更新选择器
- 每个 Case ~45-70s（纯文本）/ ~60-90s（带图片）— 不适合大批量
- 浏览器 headless 模式，不影响用户桌面操作
- 图片通过 canvas.toDataURL 提取，CORS 外部图片（如签名 CDN 图）会跳过
- 签名小图标（<50px）自动过滤，不保存
