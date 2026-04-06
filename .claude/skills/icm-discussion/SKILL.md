---
name: icm-discussion
displayName: ICM Discussion 抓取
category: data-source
stability: stable
promptTemplate: |
  Fetch ICM discussion timeline for incident {incidentId}. Read .claude/skills/icm-discussion/SKILL.md and follow all steps.
description: "通过 Playwright 拦截 ICM API 抓取 incident discussion timeline，输出结构化 Markdown。支持写入 case 目录。"
allowed-tools:
  - Bash
  - Read
  - Write
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_run_code
  - mcp__playwright__browser_click
  - mcp__playwright__browser_snapshot
  - mcp__playwright__browser_wait_for
  - mcp__playwright__browser_take_screenshot
---

# /icm-discussion — ICM Discussion Timeline 抓取

从 ICM portal 抓取 incident 的完整 discussion timeline（含 enrichment、transfer、resolve 记录）。

## 输入

- `incidentId`: ICM incident ID（纯数字，如 `51000000887562`）
- `caseNumber`（可选）: 关联的 D365 case number，指定后将结果写入 `{casesRoot}/active/{caseNumber}/icm/icm-discussions.md`

## 技术原理

ICM v5 前端加载 summary 页面时，会请求两个关键内部 API：

1. **Incident Details**（含 Authored Summary）：
```
GET https://prod.microsofticm.com/api2/incidentapi/incidents({incidentId})/GetIncidentDetails?$expand=...
```
返回的 `Description` 字段即 Authored Summary（HTML 格式）。

2. **Discussion Entries**（完整 timeline）：
```
GET https://prod.microsofticm.com/api2/incidentapi/incidents({incidentId})/getdescriptionentries?$top=100&$skip=0
```
返回 `Items[]` 数组，每条 entry 含作者、时间、类型、正文。

两个 API 都需要浏览器 session cookie（跨域），使用 Playwright `page.route()` 拦截响应。

## 执行步骤

### 1. 设置 route 拦截 + 导航

同时拦截 `GetIncidentDetails`（Authored Summary）和 `getdescriptionentries`（Discussion Timeline）：

```javascript
// Playwright browser_run_code
async (page) => {
  let details = null;
  let discussions = null;
  
  await page.route('**/GetIncidentDetails*', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    details = body;
    await route.fulfill({ response, body });
  });
  
  await page.route('**/getdescriptionentries*', async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    discussions = body;
    await route.fulfill({ response, body });
  });
  
  await page.goto(`https://portal.microsofticm.com/imp/v5/incidents/details/${INCIDENT_ID}/summary`);
  await page.waitForTimeout(10000);
  
  // --- Authored Summary (from GetIncidentDetails.Description) ---
  let authoredSummary = '';
  if (details) {
    const d = JSON.parse(details);
    if (d.Description) {
      authoredSummary = d.Description
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
  }
  
  // --- Discussion Entries ---
  if (!discussions) return 'NOT CAPTURED - may need login';
  
  const data = JSON.parse(discussions);
  const entries = data.Items.map(e => {
    const plainText = e.Text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return {
      id: e.DescriptionEntryId,
      date: e.Date,
      author: e.SubmittedByDisplayName || e.SubmittedBy,
      cause: e.Cause,
      category: e.Category,
      text: plainText,
    };
  });
  
  return JSON.stringify({ authoredSummary, total: entries.length, entries }, null, 2);
}
```

### 2. 处理 SSO 登录（如需要）

如果被重定向到 `IdentityProviderSelection.html`：
1. 选择 **Microsoft Entra ID** radio
2. 点击 **Sign in**
3. 在 "Pick an account" 页面选择 `fangkun@microsoft.com`
4. 等待重定向完成后重新执行步骤 1

### 3. 格式化输出

将 authoredSummary + entries 按时间正序（oldest first）生成 Markdown：

```markdown
# ICM Discussion Timeline — {incidentId}

**Title**: {title}
**Status**: {state} | **Severity**: {sev} | **Team**: {team}
**Created**: {date} | **Resolved**: {date}

---

## Authored Summary

SR#: 26012900300xxxxx
onmicrosoft Tenant Name: customer.com.cn
DCR Yes/No? No

Symptoms:
Microsoft Authenticator SSO Extension automatically upgrades...

Data:
- Platform: iOS 26.2
- Authenticator Version: v3.15.0
...

---

## Discussion Timeline ({count} entries)

### [2026-02-05 11:30] Created — sijiang
Incident Created

### [2026-02-06 01:02] Discussion — hiengu
I'm waiting for logs access of China cloud...
```

### 4. 写入 case 目录（如指定 caseNumber）

```
{casesRoot}/active/{caseNumber}/icm/icm-discussions.md
```

## 数据结构

每条 entry 的字段：

| 字段 | 说明 |
|------|------|
| `DescriptionEntryId` | 递增 ID |
| `Date` | UTC 时间戳 |
| `SubmittedBy` | 作者 alias |
| `SubmittedByDisplayName` | 作者全名 |
| `Cause` | Created / Edited / Other / Transferred / Resolved |
| `Category` | User / System |
| `Text` | HTML 格式的正文 |
| `EnrichmentId` | 如果是 AI enrichment 则有值 |

## 注意

- 需要 Edge 浏览器已登录 Microsoft 账号
- ICM session 有效期约 8 小时，过期需重新 SSO
- `page.route()` 拦截只在当次导航有效，下次需重新设置
- 大 incident 可能有 100+ entries，用 `$skip` 分页
