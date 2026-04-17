# Defender MDC CRI 与升级流程 — 排查工作流

**来源草稿**: ado-wiki-a-container-security-escalation.md, ado-wiki-a-cri-escalation-flow.md, ado-wiki-a-cri-handling-guidelines.md, ado-wiki-a-cri-noise-low-quality.md, ado-wiki-a-cri-sla-kpis.md, ado-wiki-a-epp-appendix-script.md, ado-wiki-a-r3-mdc-sme-pg-escalation-path.md, ado-wiki-b-alerts-escalation-path.md, ado-wiki-b-icm-reactivation-policy.md, ado-wiki-b-mdc-cri-handling.md, ado-wiki-b-mdc-vteam-icm-templates.md, ado-wiki-b-restricted-cris-mtp-escalation.md, ado-wiki-b-tsg-ai-model-security-detection-request-escalation.md, onenote-baseline-escalation-tsg.md
**场景数**: 12
**生成日期**: 2026-04-07

---

## Scenario 1: Microsoft Defender for Cloud (MDC) Containers Escalation Checklist
> 来源: ado-wiki-a-container-security-escalation.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- the AKS cluster - Services and ingresses - gatekeeper-webhook-service <br> **2
- Resource Explorer, expand *[Microsoft

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: ado-wiki-a-cri-escalation-flow.md
> 来源: ado-wiki-a-cri-escalation-flow.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **CRI creation by CSS**
2. **Initial triage**
3. **Assignment to engineers**
4. **Periodic queue checks**
5. **Engineer acknowledgment and investigation**
6. **Requesting additional information**
7. **Handling delays in response**
8. **Addressing known issues or new bugs**
9. **CRI triage discussions**

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 3: CRI handling guidelines
> 来源: ado-wiki-a-cri-handling-guidelines.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **TA Approver:** Mandatory on creation.
2. **Area Category:** Mandatory on Mitigation.
3. **Corrective Action** Optional.
4. Select the Troubleshooting tab.
5. Select the "Investigate using ICM Troubleshooting Studio" button in the top right corner:
6. To see the subscription, its details and resources, choose the Resource Explorer from the left pane.
7. Click on the subscription ID to see its properties and configurations, such as assigned policies, ARG query, Access Control, Advisor Recommendations, Health status and more.
8. The issue is fixed and released to prod or
9. A workaround was provided to the customer or
10. The issue is fixed or get a fixed due date. The due date for GA was updated and shared with the customer or
11. The issue is By Design and will not be fixed in the scope of the CRI.
12. Mitigate the CRI
13. Select the **Custom fields** tab
14. Under **Owning service category - Azure** card below, find the **CRI Escalation Quality** field
15. Select the Reason for Noise:
16. Click Save changes on the top right on the IcM form.
17. CRI is a known issue of any type (bug/task/feature request/limitation etc.).
18. Repair Item of ADO Work Item is linked to the IcM.
19. WI is assigned and ETA (Target Date) is provided.
20. On the IcM form, got to **Mitigation & resolution** tab.

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: How to identify and tag CRI as Noise/LQ?
> 来源: ado-wiki-a-cri-noise-low-quality.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Created by MDC support engineer.
2. Created from ASC (Azure Support Center) template, using the "Escalate case" button.
3. Reviewed and approved by listed TA Approver.
4. Followed by initial investigation using existing TSG.
5. ASC suggests a template for default settings and instructions in the summary body.
6. ASC add environment details to the bottom of the summary, e.g.:

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 5: EPP Appendix - Antimalware Detection Script
> 来源: ado-wiki-a-epp-appendix-script.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Collects computer status via `Get-MpComputerStatus` (Defender) or `Get-MProtComputerStatus` (SCEP)
2. Checks protection aspects: OnAccessProtection, IoavProtection, BehaviorMonitor, Antivirus, Antispyware, RealTimeProtection
3. Checks signature age (>7 days = out of date)
4. Determines overall protection status rank based on disabled features and signature age

---

## Scenario 6: IcM paths
> 来源: ado-wiki-a-r3-mdc-sme-pg-escalation-path.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 7: MDC Security Alerts Escalation Path
> 来源: ado-wiki-b-alerts-escalation-path.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Investigate** using Security Alerts Initial Investigation TSG
2. **Check alert provider** using Kusto queries or AME-MDC Kusto Dashboard
3. **Find provider contact** in Alert Providers Table
4. **If provider is 'Detection'** -> Escalate to RomeDetection IcM team using template P353J2
5. **For any other provider** -> Escalate per provider's 'IcM Group' or 'CSS tickets Distribution List'. CC: RomeDetectionLive@microsoft.com if email escalation only option
6. **When resolved** -> Follow Root Cause Classification procedure when closing case

---

## Scenario 8: ICM Re-activation Policy Restriction
> 来源: ado-wiki-b-icm-reactivation-policy.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 9: MDC CRI Handling Guidelines
> 来源: ado-wiki-b-mdc-cri-handling.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Check the CRI status daily.**
2. **Provide any requested additional information** promptly.
3. **If waiting for customer update**, add that status information to the CRI.
4. **If CRI was closed without satisfaction** - Reactivate by providing:
5. **If CRI was closed with ADO work-item** - Follow up and request updates **on the work-item discussions**. Do not reactivate if an ADO work item is already linked and actively being addressed.
6. **@mention the DRI/EEE/Incident manager** for any concerns or delays.
7. **If CRI is not assigned / no response / no PG engaged** - Follow: [[Procedure]- IcM Escalation - no owner or idle IcM](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Infrastructure%20Solutions/1141/-Procedure-IcM-Escalation-no-owner-or-idle-IcM)
8. **If mitigated with ADO work item** - Engage with the work item, @mention assigned engineer. Work item should always have an assigned engineer and target date (ETA).
9. **For any CRI processing issue** - Contact MDCEscal@microsoft.com or team members.

---

## Scenario 10: MDC V-Team IcM Templates
> 来源: ado-wiki-b-mdc-vteam-icm-templates.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 11: AI Model Security — Detection Request Intake & Escalation Process
> 来源: ado-wiki-b-tsg-ai-model-security-detection-request-escalation.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 12: VM Baseline Escalation & Troubleshooting
> 来源: onenote-baseline-escalation-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Enable Baseline Logging:
2. Restart HealthService:
3. Collect: Operations Manager event log + logs from `<LOGPATH>`
4. Run: `sudo /opt/microsoft/omsagent/plugin/omsbaseline > /tmp/baseline.json`
5. Send baseline.json for analysis
6. Check msid=157.15 (Ensure system accounts are non-login) for Offending account errors

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('romelogs').database('romelogs').OmsHealthMonitoringOE
| where env_time > ago(2d)
| where SubscriptionId == "<SubscriptionId>"
| summarize arg_max(env_time, *) by VmId
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---
