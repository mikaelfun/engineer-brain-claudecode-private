---
name: owa-email-search
displayName: OWA 邮件搜索
category: inline
stability: dev
requiredInput: caseNumber
description: "通过 Playwright + OWA 搜索 Case 邮件完整对话，输出 JSON。无 API 限流，支持团队邮件。~15-30s/case。调用 /owa-email-search {caseNumber}"
allowed-tools:
  - Bash
  - Read
  - Write
---

# /owa-email-search — OWA 邮件搜索

通过 Playwright 自动化 Outlook Web App，搜索 Case 相关邮件，提取完整 conversation body，输出结构化 JSON。

## 优势

- **无 API 限流** — 浏览器操作，不走 Graph API
- **去重清洗** — 两轮去重（引用链去除 + 子串去重），SafeLinks 清洗，Banner 噪声过滤
- **团队邮件** — OWA 能看到的都能搜到（团队 DL 抄送）
- **~20-30s/case**（v3 优化版，热启动）

## 参数

- `$ARGUMENTS` — Case 编号（如 `2603060030001353`）

## 前置条件

1. **Node.js** — npm 的运行环境
2. **playwright-cli** — 安装命令：
   ```powershell
   npm install -g @anthropic-ai/playwright-cli
   playwright-cli --version  # 验证安装
   ```
3. **Edge 浏览器** — 脚本使用 `--browser msedge`
4. **Microsoft 账号已登录** — 首次运行 persistent profile 会继承系统 SSO，无需额外配置

## 执行步骤

### 1. 单个 Case 调用

```powershell
pwsh -File ".claude/skills/owa-email-search/scripts/owa-email-fetch.ps1" `
  -CaseNumber "{caseNumber}" `
  -OutputPath "{outputDir}/{caseNumber}.json"

# 调试模式（headed，可观察浏览器操作）：
pwsh -File ".claude/skills/owa-email-search/scripts/owa-email-fetch.ps1" `
  -CaseNumber "{caseNumber}" `
  -OutputPath "{outputDir}/{caseNumber}.json" `
  -Headed
```

### 2. 批量 Case 调用

准备 `cases.txt`（一行一个 Case ID，`#` 开头为注释）：
```
2603300010000578
2603310010001651
# 2603310010001969
```

```powershell
pwsh -File ".claude/skills/owa-email-search/scripts/owa-email-batch.ps1" `
  -CaseListFile "./cases.txt" `
  -OutputDir "./output"
```

批量模式浏览器只冷启动一次，后续 Case 复用会话（~20-30s/case → 热启动 ~15-25s/case）。

脚本内部流程（全自动，v2 优化版）：
1. **启动浏览器** — persistent Edge profile + SSO（支持 `-Headed` 可视化调试）
2. **搜索** — JS 原生搜索（execCommand + Search 按钮），失败自动回退到 type/press
3. **等待+提取** — 单次 mega JS eval 完成搜索等待 + DOM walking + 邮件提取（无进程间轮询开销）
4. **智能等待** — DOM-readiness 检查替代固定 sleep（50ms 轮询 vs 旧版 1000ms 固定等待）
5. **去重+输出** — 两轮去重 + SafeLinks/Banner 清洗 → JSON

### 2. 检查结果

脚本输出 `STATUS=OK/EMPTY/FAILED` + `EMAIL_COUNT` + `SIZE_KB` + `DURATION_MS`。

- `STATUS=OK` → 成功，读取 JSON 获取内容
- `STATUS=EMPTY` → 搜索无结果（Case 号不在邮件 subject 中）
- `STATUS=FAILED` → 3 次重试都失败（浏览器问题），报告给用户

## 输出格式

```json
{
  "caseNumber": "2603060030001353",
  "timestamp": "2026-04-08T10:00:00Z",
  "conversationCount": 2,
  "emailCount": 5,
  "emails": [
    {
      "direction": "Sent",
      "date": "Mon 3/16",
      "from": "Eddie Dai",
      "body": "Hi 王先生，请问您现在有时间吗？"
    },
    {
      "direction": "Received",
      "date": "Mon 3/16",
      "from": "Wang, Jin (J.)",
      "body": "还是不行，另外关于执行脚本的问题如何操作呢？"
    }
  ]
}
```

## 错误处理

- **浏览器崩溃** → 自动重试最多 2 次（关闭残留进程后重启）
- **搜索超时** → 15s 轮询，超时返回 EMPTY
- **提取失败（EXTRACT_ERROR）** → 自动重试（DOM textarea 读取偶发不稳定）

## 关键约束

- 依赖 OWA DOM 结构（`[role=listitem]`、`[aria-label="Message body"]`）— OWA 改版可能需要更新选择器
- 每个 Case ~15-30s — 不适合大批量
- 浏览器默认 headless 模式，加 `-Headed` 参数可开启有头模式调试
