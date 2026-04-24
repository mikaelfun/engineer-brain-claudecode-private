# VM SLA 与流程 — 排查速查

**来源数**: 1 (AW) | **条目**: 5 | **21V**: 2/5
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer receives Azure Safety Guard / Microsoft Azure Safeguards email warning that their Azure res | Azure Safeguards team detected active security threat on customer subscription a | Inform customer this request is outside CSS scope. Direct customer to reply to a | 🔵 7.5 | AW |
| 2 | Microsoft engineer cannot re-submit a second Customer Lockbox request for the same support case; sec | Customer Lockbox enforces a per-case cooldown: a second request for the same cas | Wait 4 days before re-triggering. If urgent, escalate via IcM to 'Azure LockBox\ | 🔵 6.5 | AW |
| 3 | 通过 ASC 创建 CRI/ICM 后立即失去访问权限（Restricted CRI），提交者包括 case owner 本人也被锁定 | ASC 近期变更了访问模型，新创建的 ICM 默认为 Restricted CRI，当前行为已知在调查中 | 1. 先在关联的 DFM case 上申请 JIT（DFM JIT 审批通过后即可访问 linked ICMs）；2. 若 JIT 失败，在 aka.ms/ic | 🔵 6.5 | AW |
| 4 | IR SLA email is not recognized by DfM in a timely manner — delays of up to 15 minutes before DfM reg | The IR SLA email was created from Outlook instead of from within DfM. Emails sen | Always create the IR SLA email from within DfM (not from Outlook). Requirements: | 🔵 5.5 | AW |
| 5 | Customer requests Azure datacenter energy/water sustainability data (PUE/WUE) or detailed Cloud ESG  |  | Engage internal CO+I Sustainability & Cloud ESG team: (1) Submit a Disclosure Re | 🟡 4.5 | AW |

## 快速排查路径

1. **Customer receives Azure Safety Guard / Microsoft Azure Safeguards email warning **
   - 根因: Azure Safeguards team detected active security threat on customer subscription and sent notification; handling is outsid
   - 方案: Inform customer this request is outside CSS scope. Direct customer to reply to azsafety@microsoft.com referencing their case/SIR ID from the warning e
   - `[🔵 7.5 | AW]`

2. **Microsoft engineer cannot re-submit a second Customer Lockbox request for the sa**
   - 根因: Customer Lockbox enforces a per-case cooldown: a second request for the same case cannot be initiated until 4 days have 
   - 方案: Wait 4 days before re-triggering. If urgent, escalate via IcM to 'Azure LockBox\Triage' team with: Customer Tenant ID, Lockbox Request Timestamp, scre
   - `[🔵 6.5 | AW]`

3. **通过 ASC 创建 CRI/ICM 后立即失去访问权限（Restricted CRI），提交者包括 case owner 本人也被锁定**
   - 根因: ASC 近期变更了访问模型，新创建的 ICM 默认为 Restricted CRI，当前行为已知在调查中
   - 方案: 1. 先在关联的 DFM case 上申请 JIT（DFM JIT 审批通过后即可访问 linked ICMs）；2. 若 JIT 失败，在 aka.ms/icmbug 提交 bug 并取得 bug WI #，EEE/OnCall 凭 WI# 提供临时访问权限；3. 不要等待模板修复，继续按流程创建
   - `[🔵 6.5 | AW]`

4. **IR SLA email is not recognized by DfM in a timely manner — delays of up to 15 mi**
   - 根因: The IR SLA email was created from Outlook instead of from within DfM. Emails sent from Outlook are not immediately recog
   - 方案: Always create the IR SLA email from within DfM (not from Outlook). Requirements: (1) Email must be sent from DfM, (2) Use your @microsoft.com account,
   - `[🔵 5.5 | AW]`

5. **Customer requests Azure datacenter energy/water sustainability data (PUE/WUE) or**
   - 方案: Engage internal CO+I Sustainability & Cloud ESG team: (1) Submit a Disclosure Request via GetHelp at https://microsoft.sharepoint.com/sites/COISustain
   - `[🟡 4.5 | AW]`

