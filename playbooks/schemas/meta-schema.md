# casehealth-meta.json Schema

机器可读的 Case 元数据，用于快速判断 Case 状态（不需要解析 Markdown）。

## 写入者
- `data-refresh`：通过 `fetch-all-data.ps1 -IncludeIrCheck` 写入 `irSla`/`fdr`/`fwr`（API 优先查询 `msdfm_caseperfattributes`，失败时降级到 UI scraping）
- `data-refresh`（批量）：通过 `check-ir-status-batch.ps1 -SaveMeta` 批量写入所有 case 的 `irSla`/`fdr`/`fwr`
- `compliance-check`：写入 `compliance` 对象（Entitlement + 21v Convert，不涉及 IR）
- `compliance-check`：写入 `ccEmails` / `ccAccount` / `ccKnowMePage`（RDSE CC Finder，仅匹配时写入）
- `status-judge`：写入 `actualStatus` / `daysSinceLastContact` / `statusJudgedAt`
- `status-judge`：写入 `recommendedActions`（LLM 推荐的下一步行动，仅 CHANGED 路径）
- `inspection-writer`：写入 `lastInspected`
- `casework` (auto-detect)：写入 `isAR` / `mainCaseId`（case number 后缀检测）
- `casework` (LLM/auto)：写入 `ar` 对象（scope 提取、沟通模式检测、case owner 信息）
- `casework-light`：写入 `icm` 对象（ICM 缓存指纹，避免重复拉取）

## IR/FDR/FWR status 值

`check-ir-status.ps1` 的原始输出直接写入，**不做 kebab-case 转换**：

| check-ir-status.ps1 输出 | 写入 meta 的值 | 含义 |
|--------------------------|---------------|------|
| `Succeeded` | `Succeeded` | SLA 已满足 |
| `In Progress` | `In Progress` | SLA 计时中 |
| `Nearing` | `Nearing` | 接近超时 |
| `Expired` | `Expired` | SLA 超时 |
| `unknown` | `unknown` | 数据缺失或检查失败 |

## 完整 Schema

```json
{
  "caseNumber": "2603090040000814",
  "lastInspected": "2026-03-17T11:00:00+08:00",
  "actualStatus": "pending-customer",
  "daysSinceLastContact": 4,
  "statusJudgedAt": "2026-03-17T11:00:00+08:00",
  "statusReasoning": "最后邮件(3/13)是工程师发出follow-up要求客户确认是否恢复，客户4天未回复 → pending-customer",
  "recommendedActions": [
    {
      "action": "email-drafter",
      "reason": "客户 4 天未回复，需发 follow-up 邮件"
    }
  ],
  "irSla": {
    "status": "Succeeded",
    "remaining": null,
    "checkedAt": "2026-03-17T11:00:00+08:00",
    "source": "api"
  },
  "fdr": {
    "status": "Expired",
    "remaining": null,
    "checkedAt": "2026-03-17T11:00:00+08:00",
    "source": "api"
  },
  "fwr": {
    "status": "Expired",
    "remaining": null,
    "checkedAt": "2026-03-17T11:00:00+08:00",
    "source": "api"
  },
  "compliance": {
    "is21vConvert": true,
    "21vCaseId": "20260309398206",
    "21vCaseOwner": "zhang.lihong@oe.21vianet.com",
    "entitlementOk": true,
    "serviceLevel": "Premier",
    "serviceName": "Unfd AddOn | ProSv Ente - China Cld",
    "contractCountry": "China",
    "warnings": []
  },
  "ccEmails": "tam@microsoft.com; sdm@microsoft.com; mcpodvm@microsoft.com; mcccwl@microsoft.com",
  "ccAccount": "BMW (宝马)",
  "ccKnowMePage": "https://dev.azure.com/...",
  "isAR": false,
  "mainCaseId": null,
  "ar": null,
  "icm": {
    "fingerprint": "ACTIVE|3|453794|fangkun|Pending PG",
    "state": "ACTIVE",
    "fetchedAt": "2026-04-13T14:21:00+08:00"
  }
}
```

### ICM 缓存字段说明

| 字段 | 说明 |
|------|------|
| `icm.fingerprint` | `{state}\|{severity}\|{assignedTo}\|{modifiedBy}\|{criStatus}` 拼接的指纹字符串 |
| `icm.state` | ICM 当前状态（ACTIVE / MITIGATED / RESOLVED），用于快速判断 |
| `icm.fetchedAt` | 上次完整拉取（含 AI summary）的时间戳，TTL 基准 |

缓存策略：
- RESOLVED 且 icm-summary.md 存在 → 跳过 `get_ai_summary`（1 MCP 探测确认 state）
- ACTIVE + 指纹一致 + cacheAge < 4h → 跳过 `get_ai_summary`（1 MCP 探测）
- 指纹变化 或 TTL 过期 → 全量刷新（2 MCP）

### AR Case Example

```json
{
  "caseNumber": "2603300030003153001",
  "isAR": true,
  "mainCaseId": "2603300030003153",
  "lastInspected": "2026-04-02T18:30:00+08:00",
  "actualStatus": "pending-engineer",
  "daysSinceLastContact": 2,
  "statusJudgedAt": "2026-04-02T18:30:00+08:00",
  "statusReasoning": "Case owner asked about VM perf in notes, no reply yet → pending-engineer",
  "emailCountAtJudge": 14,
  "noteCountAtJudge": 2,
  "icmIdAtJudge": "",
  "compliance": {
    "entitlementOk": true,
    "serviceLevel": "Premier",
    "serviceName": "Unfd AddOn | ProSv Ente - China Cld",
    "contractCountry": "China",
    "is21vConvert": false,
    "warnings": []
  },
  "ar": {
    "scope": "Azure VM performance troubleshooting",
    "scopeConfirmed": true,
    "communicationMode": "internal",
    "caseOwnerEmail": "other.engineer@microsoft.com",
    "caseOwnerName": "Other Engineer"
  }
}
```

> **Note**: AR cases do NOT have `irSla`/`fdr`/`fwr` fields — SLA is not the AR owner's responsibility.

## 字段说明

| 字段 | 类型 | 写入者 | 说明 |
|------|------|--------|------|
| `caseNumber` | string | data-refresh | Case 编号 |
| `lastInspected` | ISO 8601 | inspection-writer | 最后巡检时间 |
| `actualStatus` | string | status-judge | `pending-customer` / `pending-engineer` / `pending-pg` / `ready-to-close` / `new` / `researching` |
| `daysSinceLastContact` | number | status-judge | 距上次工程师邮件的天数 |
| `statusJudgedAt` | ISO 8601 | status-judge | 状态判断时间 |
| `statusReasoning` | string | status-judge | 一句话判断理由（关键依据 → 结论），≤200字。完整推理链在 `logs/status-judge.log` |
| `recommendedActions` | array\|null | status-judge | LLM 推荐的下一步行动。casework B5 优先采纳，为空时 fallback 到固定路由表。仅在 CHANGED 路径（status-judge 实际执行时）写入，快速路径不写入。 |
| `recommendedActions[].action` | string | status-judge | `"no-agent"` / `"troubleshooter"` / `"email-drafter"` / `"troubleshooter+email-drafter"` |
| `recommendedActions[].reason` | string | status-judge | ≤100 字，解释推荐理由 |
| `irSla` | object | data-refresh | IR SLA 状态 |
| `fdr` | object | data-refresh | FDR 状态 |
| `fwr` | object | data-refresh | FWR 状态 |
| `irSla/fdr/fwr.status` | string | data-refresh | `Succeeded` / `In Progress` / `Nearing`(仅UI) / `Expired` / `unknown` |
| `irSla/fdr/fwr.remaining` | string\|null | data-refresh | 剩余时间，已满足时为 null |
| `irSla/fdr/fwr.checkedAt` | ISO 8601 | data-refresh | 检查时间 |
| `irSla/fdr/fwr.source` | string\|null | data-refresh | 数据来源：`"api"` 或 `"ui"` |
| `compliance` | object | compliance-check | 合规检查结果 |
| `compliance.is21vConvert` | boolean | compliance-check | 是否 21v 转单 |
| `compliance.21vCaseId` | string\|null | compliance-check | 21v Case ID |
| `compliance.21vCaseOwner` | string\|null | compliance-check | 21v Owner 邮箱 |
| `compliance.entitlementOk` | boolean | compliance-check | Entitlement 是否合规 |
| `compliance.serviceLevel` | string | compliance-check | Premier / ProDirect / Standard |
| `compliance.serviceName` | string | compliance-check | Entitlement 的 Service Name 原值 |
| `compliance.contractCountry` | string | compliance-check | Entitlement 的 Contract Country 原值 |
| `compliance.warnings` | string[] | compliance-check | 警告列表 |
| `ccEmails` | string\|undefined | compliance-check | RDSE CC 邮件列表（分号分隔），仅匹配时写入 |
| `ccAccount` | string\|undefined | compliance-check | 匹配到的 RDSE 账号名 |
| `ccKnowMePage` | string\|undefined | compliance-check | Know-Me Wiki 链接，仅非 null 时写入 |
| `isAR` | boolean | casework (auto-detect) | Whether this is an AR (Assistance Request) case. Auto-detected from case number suffix (3+ digits). |
| `mainCaseId` | string\|null | casework (auto-detect) | Main case number (without AR suffix). Null for non-AR cases. |
| `ar` | object\|null | casework | AR-specific metadata. Null for non-AR cases. |
| `ar.scope` | string | casework (LLM extract) | One-sentence summary of what the AR asks you to do |
| `ar.scopeConfirmed` | boolean | user confirmation | Whether user has confirmed the extracted scope is accurate |
| `ar.communicationMode` | string | casework (auto-detect) | `"internal"` (communicate with case owner) or `"customer-facing"` (pulled into customer email) |
| `ar.caseOwnerEmail` | string | casework (auto-detect) | Main case owner's email address |
| `ar.caseOwnerName` | string | casework (auto-detect) | Main case owner's display name |

## ⚠️ 禁止的字段名

以下字段名曾被 subagent 错误使用，**禁止出现**：
- ❌ `is21v`（用 `compliance.is21vConvert`）
- ❌ `21vCaseNumber` / `twentyOneVTicket`（用 `compliance.21vCaseId`）
- ❌ `21vOwner` / `twentyOneVOwner`（用 `compliance.21vCaseOwner`）
- ❌ `irMet`（用 `irSla.status`）
- ❌ `entitlement`（用 `compliance.serviceLevel`）
- ❌ 顶层的 `entitlementOk`（放在 `compliance` 内）

## 规则
- 使用 **upsert** 模式：读取已有文件 → 合并更新 → 写回
- `irSla`/`fdr`/`fwr` 由 data-refresh 写入，compliance-check 不覆盖
- `actualStatus` 由 status-judge 写入，其他 agent 不写
- 未知值用 `null`，不省略字段
