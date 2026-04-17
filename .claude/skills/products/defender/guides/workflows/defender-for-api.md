# Defender Defender for API — 排查工作流

**来源草稿**: ado-wiki-a-api-security-posture-management.md, ado-wiki-b-r1-defender-for-api-billing-tsg.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: API Security Posture Management
> 来源: ado-wiki-a-api-security-posture-management.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- Environment Settings page > Subscription > turn API Security posture Management ON

---

## Scenario 2: Microsoft Defender for API Billing Logic and Usage Tracking
> 来源: ado-wiki-b-r1-defender-for-api-billing-tsg.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
let P1OverageStandardMeter = "974a6a67-7bb7-50f6-a7c4-cb0258109a23"; 
let P1OverageTrialMeter = "480732f1-38e7-5d55-bbb5-75f9c0f4dec9";
let P2OverageStandardMeter = "58f9465a-a0d5-5d89-a86a-0dab74faf76e";
let P2OverageTrialMeter = "aa365f1c-332b-57a3-a62c-cc0a9777bb52";
let P3OverageStandardMeter ="34f364b8-2ec9-5ad7-b96f-57d392ecab89";
let P3OverageTrialMeter ="f2a2bd0d-ab27-5bc7-8312-cf2ccbef1114";
let P4OverageStandardMeter ="a7824c7b-e58f-52f6-9e09-b65ae238df13";
let P4OverageTrialMeter ="715fcd9b-dc3c-563a-b68d-465b51a92c58";
let P5OverageStandardMeter ="2736c6a4-9c1b-5cc2-bc34-98876fab606b";
let P5OverageTrialMeter ="54d4cbef-50a5-5dc0-a982-810674277204";
let P1FixStandardMeter ="ec3b0853-a3fa-5312-8425-f50fb1a33662";
let P1FixTrialMeter ="3533a218-9677-594e-b242-16040a0bb7e0";
let P2FixStandardMeter ="9d76fabc-1d5c-5208-8fbd-da65050e30a4";
let P2FixTrialMeter ="1aae432c-be6e-5336-a084-e8d408dfb5ee";
let P3FixStandardMeter ="006be79b-30e2-5341-95b6-8c8bde9d7a04";
let P3FixTrialMeter ="c29fb57f-0545-512b-ba27-8a45ecbb59a3";
let P4FixStandardMeter ="de3493d9-ee03-5785-acf3-8d01b93a4a07";
let P4FixTrialMeter ="acbfc302-b1f6-519a-90a2-794784fbf40c";
let P5FixStandardMeter ="3b5e61ab-7f4d-5d88-8ad8-95fb9b2f1dfe";
let P5FixTrialMeter ="a4c2c6c8-148b-5284-8114-e9db65eb1b6c";
let FreeAllBundlesOverage = "a97d4215-f78e-50c3-8dbe-bf230ad8493b";
cluster('pav2data.eastus.kusto.windows.net').database('aipusagedb').getProcessedUsageData()
| where usageTime > ago(1d)
| project
    UsageTime = usageTime,
    MeterId = resourceId,
    Units = units,
    ResourceUri = resourceUri,
    IngestTime = ingestTime,
    SubscriptionId = reportingId,
    Location = sourceRegion,
    Tags = tags,
    AdditionalInfo = additionalInfo,
    Day = startofday(usageTime)
| where MeterId in (P1OverageStandardMeter, P1OverageTrialMeter, P2OverageStandardMeter, P2OverageTrialMeter, P3OverageStandardMeter, P3OverageTrialMeter, P4OverageStandardMeter, P4OverageTrialMeter, P5OverageStandardMeter, P5OverageTrialMeter, P1FixStandardMeter, P1FixTrialMeter, P2FixStandardMeter, P2FixTrialMeter, P3FixStandardMeter, P3FixTrialMeter, P4FixStandardMeter, P4FixTrialMeter, P5FixStandardMeter, P5FixTrialMeter, FreeAllBundlesOverage)
| where SubscriptionId == 'c7cc771e-049b-48c4-a3fa-48ad6414bb8e'
| summarize sum(Units) by bin(UsageTime,1h), MeterId
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---
