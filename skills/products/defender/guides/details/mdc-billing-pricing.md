# DEFENDER MDC 计费与定价 — Comprehensive Troubleshooting Guide

**Entries**: 32 | **Draft sources**: 9 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-billing-kusto-queries.md, ado-wiki-a-billing-troubleshooting-queries.md, ado-wiki-a-client-side-queries-for-billing.md, ado-wiki-a-cost-estimation-defender-for-ai.md, ado-wiki-a-granular-pricing-resource-level-billing.md, ado-wiki-a-pricing-resource-count-questions.md, ado-wiki-a-r3-extending-trial-period.md, ado-wiki-a-r5-mdc-refund-request-flow.md, ado-wiki-b-sap-exclude-nonprod-billing.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Pricing
> Sources: ado-wiki

**1. Customer is charged for Azure Databricks VMs under Defender for Servers plan but MDC features (remediation, alerts suppression, policy assignment) are limited because Databricks VMs are managed resour**

- **Root Cause**: Azure Databricks VMs are managed resources with RBAC Deny Assignment blocking write operations. MDC can only provide partial coverage (agentless detections: network layer alerts, DNS alerts, control plane alerts) but bills at full Servers plan rate
- **Solution**: 1) Exclude Databricks from MDC billing: Option A - backend exclusion via IcM template Nf2746 (no end-time, covers tenant-level); Option B - API/Policy exclusion (requires Databricks support to temporarily remove Deny Assignment); Option C - move Databricks to unprotected subscription. 2) Request refund via IcM template C4462u (up to $50k or 6 months, above requires PG approval). IMPORTANT: exclusion must be done BEFORE requesting refund
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer is charged for VMSS Uniform instances under Defender for Servers plan but MDC features are limited because VMSS Uniform are Azure managed resources locked to changes**

- **Root Cause**: VMSS Uniform are Azure managed resources locked to changes. MDC has only partial feature coverage (agentless detections) but charges full Servers plan rate. MDC backend exclusion is NOT available for VMSS (unlike Databricks)
- **Solution**: 1) Exclude VMSS Uniform from pricing using API or Policy assignment (recommended - gives customer visibility in billing). Use granular pricing API (2024-01-01) or Azure Policy 'Configure Microsoft Defender for Servers to be disabled for resources with selected tag' (definition id: 080fedce-9d4a-4d07-abf0-9f036afbc9c8). 2) Request refund via IcM template C4462u after exclusion is in place. Refund up to 6 months or $50k without PG approval
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer claims they never enabled Microsoft Defender for Cloud or questions why they are being charged when it has not been enabled**

- **Root Cause**: Someone (user, service principal, or Azure Policy) enabled the Defender plan on the subscription. The enablement is tracked in Azure Activity Log and ARM backend
- **Solution**: Direct customer to check Activity Log as per MDC FAQ (https://learn.microsoft.com/azure/defender-for-cloud/faq-general). For internal investigation, use ARM Kusto query: cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer('Requests','HttpIncomingRequests') | where subscriptionId == '{subId}' | where operationName has 'Microsoft.Security/PRICINGS/'. Also check PricingSnapshot: cluster('Rometelemetrydata').database('RomeTelemetryProd').PricingSnapshot | where SubscriptionId == '{subId}' | sort by TimeStamp desc. NOTE: Cannot disclose 'who' due to PII compliance - only validate the change was recorded
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Defender for Servers Log Analytics workspace 500MB/day/VM free allowance is not reflected in billing, customer sees unexpected charges for security data types (SecurityEvent, SecurityAlert, SecurityBa**

- **Root Cause**: VMs may not have Security or AntiMalware solutions properly applied in Heartbeat events. AMA vs MMA agent categorization issues can affect allowance calculation. Missing solutions mean allowance is not applied
- **Solution**: 1) Verify solutions column in Heartbeat events: Heartbeat | where Category == 'Azure Monitor Agent' - check Solutions column has security/antimalware. 2) Check allowance in cost report - should show free meter with quantity 0. 3) Query data consumption by type: Usage | where IsBillable == TRUE | where DataType in ('SecurityAlert','SecurityBaseline','SecurityDetection','SecurityEvent','WindowsFirewall','ProtectionStatus','Update','UpdateSummary','MDCFileIntegrityMonitoringEvents') | summarize sum(Quantity)/1024 by DataType. 4) If solutions missing, investigate VM onboarding process
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Error when trying to set resource-level pricing for Defender for Servers: parent subscription enforces pricing plan, preventing resource-level granular pricing changes**

- **Root Cause**: The parent subscription has its Enforce field set to true, which blocks resource-level pricing overrides. Resource-level pricing (granular pricing) requires the subscription to allow per-resource configuration
- **Solution**: Set the subscription Enforce field to false before updating resource-level pricing. Use PUT on subscription pricing endpoint with enforce=false. Note: only P1 subplan is supported for resource-level enablement. Other common errors: ScopeId not valid (use valid Azure subscription/resource ID), Plan name not supported (not all plans support granular pricing)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 2: Mdc Pricing
> Sources: ado-wiki

**1. Customer wants to verify MDC free trial status or remaining trial time for Defender plans**

- **Solution**: Use Get-AzSecurityPricing (check FreeTrialRemainingTime field), Azure Resource Graph query (securityresources where type=='microsoft.security/pricings'), or Portal Environment Settings to check remaining trial days per plan
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Support engineer needs to verify MDC trial eligibility from backend for a subscription**

- **Solution**: Use Kusto: cluster('Romelogs').database('Prod').TraceEvent | where message has 'trial started:' and message has '{subscriptionId}'. Or check cluster('RometelemetryData').database('RomeTelemetryProd').BillingReportsByDayBundlePricingTierMethodAndSubscriptionId | where PricingTier=='Standard Trial'
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Subscription charged for Servers plan even though not enabled at subscription/workspace level - no security solution installed on any workspace**

- **Root Cause**: Legacy Resource Group (RG) level pricing still active. RG-level pricing was deprecated April 2024 but existing configs remain unless manually removed. CWP features (JIT, AAC, FIM, ANH) do not work with RG-level pricing.
- **Solution**: Query enabled RGs: cluster('mdcpricingprod.centralus.kusto.windows.net').database('PricingSnapshots').PricingConfigurations | where SubscriptionId=='{subId}' | where Level=='ResourceGroup'. Remove via REST API: DELETE .../providers/Microsoft.Security/pricings?api-version=2017-08-01-preview. Advise customer to enable Servers plan at subscription level instead.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Customer questions about Defender CSPM (DCSPM) plan billing - which resources are charged and at what cost**

- **Solution**: DCSPM charges $5/billable resource/month. Azure billable: VMs (excl. deallocated/Databricks), Storage with blob/file containers, SQL/PostgreSQL/MySQL/Synapse/MariaDB. AWS: EC2/S3/RDS. GCP: similar compute/storage/DB. Use PAV2 Kusto query on pav2data cluster aipusagedb to verify usage.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 3: Databricks
> Sources: ado-wiki

**1. Customer asks why Databricks resources are billed by Defender for Cloud when many recommendations are excluded (locked resources)**

- **Root Cause**: Known limitation: agent-based scenarios excluded for Databricks (open discussion with Databricks team), but network-based detections still provide coverage
- **Solution**: Explain Databricks has limited agent-based coverage while network-based detections and other scenarios still apply, justifying billing.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer questions why Databricks resources incur Defender for Cloud charges when recommendations cannot be remediated due to locked resources**

- **Root Cause**: Databricks has limitations on agent-based scenarios but network-based detections still cover Databricks resources
- **Solution**: Agent-based scenarios are limited for Databricks (ongoing discussion with Databricks team). Other security coverage like network-based detections still applies and justifies protection charges.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 4: Trial Extension
> Sources: ado-wiki

**1. Customer requests to extend Microsoft Defender for Cloud free trial period beyond 30 days for POC evaluation**

- **Root Cause**: MDC offers 30-day free trial per plan. Trial period is now plan-specific (since Nov 2023) and can be extended upon request via IcM process.
- **Solution**: Create IcM using template z3p3e2 (https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z3p3e2). Keep severity at 3 or 4. Required info: subscription/account/project IDs, MDC plan list, start/end dates, resource count, customer name, contact name. SLA: 3 business days. Prerequisites: AWS/GCP connectors must be configured first. For >90 days, allow extra time for PG approval. EEE approves then transfers CRI to Defenders - CRIs queue for implementation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. MDC trial extension was applied but customer cannot see remaining trial days or trial status on subscription, and trial is not indicated in the invoice**

- **Root Cause**: Trial extension is configured via backend system only. By design, trial extension is not visible on subscriptions, does not display remaining trial days, and is not indicated in the invoice.
- **Solution**: This is expected behavior. Verify extension was applied by checking the IcM ticket - when mitigated, extension has been applied unless DRI states otherwise. If customer still sees charges after mitigation, the charges may be for resources not covered by the trial extension (different plan or subscription).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Containers
> Sources: ado-wiki

**1. Customer excluded a resource group from Defender for Containers auto-provisioning via Azure Policy exclusion, but the excluded containers are still being charged**

- **Root Cause**: Excluding resource groups from the Containers provisioning DINE policy assignment only prevents new provisioning, monitoring, and alerting. The excluded resources are still charged as any included resources - exclusion does not reduce Defender for Containers billing.
- **Solution**: Inform customer that excluding a resource group from auto-provisioning does NOT reduce charges. Excluded containers will not be provisioned, monitored, or alerted, but they will still be charged. To stop charges, the customer must disable the Containers plan entirely for those subscriptions or remove the security profile from affected clusters.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Charges for Defender for Containers continue to appear after disabling the plan at subscription level. Customer shows subscription pricing page as evidence the plan is Off.**

- **Root Cause**: Disabling Defender for Containers at the subscription level does not automatically disable it on individual resources (AKS clusters) that were previously enabled at the resource level. Resource-level enablement overrides subscription-level setting.
- **Solution**: Use ARG query to find resources with resource-level Defender enabled (securityresources where pricingTier==Standard). Disable at resource level via REST API PUT with pricingTier=Free. Alternatively, set enforce=True at subscription level to prevent resource-level overrides.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 6: Defender For Storage
> Sources: ado-wiki, onenote

**1. Cannot exclude Databricks managed storage accounts from MDC billing/plans - API or Policy fails with access denied**

- **Root Cause**: Older Databricks workspaces (created before June 2025) lack the required role in the Deny Assignment to allow DefenderForStorageSettings/write. Only workspaces created after the June 2025 update have the new role allowing exclusion. Extensions (Sensitive Data Discovery, On-Upload Malware Scanning) cannot be enabled or excluded regardless of deny assignment configuration.
- **Solution**: 1) Check the Deny Assignment on the SA: Portal > Storage Account > Access Control (IAM) > Deny assignments > look for Microsoft.Security/DefenderForStorageSettings/write in Denied Permissions. 2) If present (new workspace) - customer can use API/Policy to exclude. 3) If absent (old workspace) - not possible to exclude; inform customer. Support matrix: Activity monitoring alerts = available; Recommendations/Malware/Sensitive data = NOT available on Databricks SAs.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer wants to enable Defender for Storage in Mooncake but cannot find it in Azure Portal**

- **Root Cause**: Defender for Storage (classic mode) in Mooncake available only via REST API/PowerShell/ARM, not through portal UI
- **Solution**: Use Enable-AzSecurityAdvancedThreatProtection for per-account or Set-AzSecurityPricing -Name StorageAccounts -PricingTier Standard -SubPlan PerTransaction for per-subscription. Two pricing modes: per-transaction and per-storage account. Disable via Set-AzSecurityPricing -Name StorageAccounts -PricingTier Free
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

### Phase 7: Pricing Tier
> Sources: ado-wiki

**1. Customer selected the wrong Microsoft Sentinel pricing/commitment tier and is locked for 31 days before being able to change it.**

- **Root Cause**: Sentinel commitment tiers have a 31-day lock-in period. Once selected, changes cannot be made until the period expires.
- **Solution**: Reset the commitment timer via Geneva Action Portal (requires SAW + gme/ame account and IcM). Steps: 1) Access Geneva Action Portal, 2) Under Filter search for 'opt', 3) Run 'Opt out of 31 day capacity reservation' AND 'Opt out of 31 day capacity reservation for Sentinel' actions, 4) Insert workspace details with IcM number, 5) Both results must succeed. Access controlled by 'tm-sentinel-css' security group via OneIdentity.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Need to investigate who changed Sentinel pricing tier or when a commitment tier change failed.**

- **Root Cause**: Pricing tier changes generate Azure Activity Log entries under operation 'Microsoft.OperationsManagement/solutions/write' (displayed as 'Create new OMS solution').
- **Solution**: Search Activity Log for operation 'Microsoft.OperationsManagement/solutions/write'. Click on the entry and navigate to 'Change history' to see who made the change and old/new plan values. Failed tier changes are also recorded. Note: pricing tier changes take effect on the following UTC day.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 8: Defender For Dns
> Sources: onenote

**1. Defender for DNS showing unexpected high billing charges (300-500 units/day, each unit = 1M DNS queries) in Mooncake subscription**

- **Root Cause**: VMs in the subscription sending massive PTR (reverse DNS lookup) queries to Azure platform DNS - each query counted for billing. Also PG confirmed Defender for DNS should NOT cross-charge when Defender for Servers P2 is enabled on the same subscription (billing bug).
- **Solution**: 1) Investigate source VMs via DNS log (Geneva portal). 2) Convert container ID to VM name using AzureCM LogContainerSnapshot. 3) Disable Defender for DNS: Set-AzSecurityPricing -Name Dns -PricingTier Free. 4) For cross-charge bug, file ICM for RCA/refund. 5) Check BillingReportsRawArchive on rometelemetrydata.kusto.windows.net for consumption data (2-day latency).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 9: Ama
> Sources: ado-wiki

**1. AMA machines not receiving security value despite AMA being installed and plan enabled — no dependent recommendations or alerts**

- **Root Cause**: Azure Monitoring Agent requires the Security solution installed on the Log Analytics Workspace. When using a custom (non-default) workspace, the solution is not auto-installed to avoid billing shock. Without the solution, machines do not receive any dependent value.
- **Solution**: Install the Security solution on the custom Log Analytics Workspace manually. If using default workspace, the solution is auto-installed by MDC. Remember: both the Security solution on the workspace AND the Defender plan enabled on the subscription are required for machines to get value and billing.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 10: Defender For Ai
> Sources: ado-wiki

**1. Defender for AI 账单意外升高或成本异常增加，客户报告的 token 用量与预期不符**

- **Root Cause**: Defender for AI 对所有 token 按均一费率计费（无论模型种类、batch/non-batch、prompt/completion）；Embedding 模型、图片生成（DALL-E）、语音/TTS/STT 不产生计费（不被扫描）；支持 ChatCompletion（GA）和 Agent（Preview），billing 口径差异可能来自模型 token 编码差异（基于 GPT-4o 估算）
- **Solution**: 1) 使用订阅级 PowerShell 脚本查询 TokenTransaction 指标汇总；2) 使用资源级脚本精确定位单个 OpenAI 资源的逐小时 token 消耗；3) 通过 KQL 查询内部计费记录：cluster('RomeTelemetryData').database('RomeTelemetryProd').BillingReportsRawArchive，meterId='2dc983be-35b7-50dd-8cec-3d31f198019f'，确认 Units；4) 对比 Azure Monitor TokenTransaction 与内部 aggregation 找出差异
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 11: Plan Enablement
> Sources: ado-wiki

**1. Persistent 'Failed to save plan' / Error 400 / InvalidInputJson when enabling Defender for Cloud plans via Partner Center 'Microsoft Azure Management Portal' link using delegated admin (AOBO/GDAP)**

- **Root Cause**: Partner Center AOBO/GDAP authentication context does not include required user identity headers (x-ms-client-tenant-id and x-ms-client-object-id) that the Defender for Cloud Pricing API requires; ARM does not pass these in delegated admin flow
- **Solution**: 1) Switch directory to customer tenant and perform action as a real user with Owner permissions; 2) Use Azure CLI (az security pricing create) or REST API authenticated directly to customer tenant; 3) Deploy via ARM template or policy assignment from within customer tenant. These approaches ensure required identity headers are present.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 12: Adaptive Network Hardening
> Sources: ado-wiki

**1. Adaptive Network Hardening showing sad cloud icon or unhealthy status unexpectedly after previously working correctly**

- **Root Cause**: Known scenarios leading to ANH sad cloud: (1) Resource pricing tier changed to Free, (2) All NSGs associated with the resource were removed, (3) Resource no longer connected to the Internet.
- **Solution**: Verify the resource pricing tier is Standard (not Free). Check that NSGs are properly associated with VM subnet and NIC. Confirm the VM is connected to the Internet. If ANH recommendations were previously enforced and disappeared, that is expected - enforced rules are added to NSG and recommendation is resolved.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 13: Data Lake
> Sources: ado-wiki

**1. Customer needs to offboard from Microsoft Sentinel data lake after mistaken onboarding, unfavorable billing changes, or accidental deletion of onboarding resources.**

- **Root Cause**: Data lake onboarding switches billing to new meters, causing negotiated pricing to no longer apply. Customers cannot self-service offboard during preview.
- **Solution**: Escalate via ICM to 'MSG Tenant Provisioning / Triage'. Include: customer name, reason for offboarding, Tenant ID, Subscription to offboard, and optionally specific workspaces. SLA for rollback is 4 days. Customer should work with account team to renegotiate pricing.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 14: Cost Management
> Sources: ado-wiki

**1. Customer cannot see Cost Management reports in Microsoft Defender portal under Microsoft Sentinel > Cost Management, despite having Azure Subscription Owner or Billing Admin roles.**

- **Root Cause**: Session cache not refreshed after role assignment or initial data population. Initial data latency is 26 hours; ongoing refresh can take up to 24 hours (normally <4 hours).
- **Solution**: Sign out of the Defender portal and sign back in. If reports still empty, wait up to 26 hours for initial data population. During preview, only 90 days of usage data is shown. For persistent issues, escalate via ICM to 'MSG Consumption Billing / Consumption-Billing-MSG-ICM-Team'.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 15: Arg Query
> Sources: onenote

**1. Need to check when Defender for Cloud plans were enabled, pricing tier, subplan, and free trial remaining time for a subscription**

- **Solution**: Run ARG query in ASC: SecurityResources | where type == 'microsoft.security/pricings' | project Subscription=subscriptionId, Azure_Defender_plan=name, PricingTier=properties.pricingTier, Subplan=properties.subPlan, enablementTime=properties.enablementTime, freeTrialRemainingTime=properties.freeTrialRemainingTime, extension=properties.extensions
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

### Phase 16: Arg
> Sources: onenote

**1. Need to check when Defender plans were enabled, their pricing tier, sub-plan, free trial status per subscription**

- **Root Cause**: No direct portal view shows enablement timestamps for all Defender plans across subscriptions
- **Solution**: Run ARG query: SecurityResources | where type == 'microsoft.security/pricings' | project Subscription=subscriptionId, Azure_Defender_plan=name, PricingTier=properties.pricingTier, Subplan=properties.subPlan, enablementTime=properties.enablementTime, freeTrialRemainingTime=properties.freeTrialRemainingTime, extension=properties.extensions
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

### Phase 17: Asc
> Sources: onenote

**1. Customer wants to completely offboard/unregister from Azure Security Center (ASC/MDC) for a subscription**

- **Solution**: Step 1: Move the pricing tier from Standard to Free — this removes the 'security' solution from the workspace. Step 2: Remove the Microsoft.Security resource provider — go to Subscription → Resource providers → search 'Security' → select Microsoft.Security → click Unregister.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

### Phase 18: Offboard
> Sources: onenote

**1. Customer wants to completely offboard/unregister from Azure Security Center**

- **Root Cause**: No single button to fully offboard from ASC
- **Solution**: Two steps: (1) Move pricing tier from Standard to Free (removes 'security' solution from workspace) (2) Unregister Microsoft.Security resource provider: Subscription → Resource providers → search 'Security' → select Microsoft.Security → click Unregister
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

### Phase 19: Direct Onboarding
> Sources: ado-wiki

**1. Need to verify if MDE Arcless Direct Onboarding is being billed. Billing shows charges but ARG assessment query returns 0 machines.**

- **Root Cause**: Inventory bug: billing records exist for MDE Direct Onboarding but machines not showing in MDC inventory. ARG assessment 44d12760-2cf2-4e6d-8613-8451c11c1abc returns 0.
- **Solution**: Run Kusto query against pav2dataartfollower.eastus.kusto.windows.net/aipusagedb using P1/P2 meter GUIDs (P1Std=83f23551, P1Trial=dc3d59d2, P2Std=0fad698c, P2Trial=4f8f8a7e). Cross-check with ARG assessment 44d12760. If billing exists but ARG returns 0, escalate as inventory bug. IsTrial=true means no invoice charges.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 20: Log Analytics
> Sources: contentidea-kb

**1. Customers receive unexpectedly high Azure bill and need detailed breakdown of Azure Log Analytics data usage beyond what billing provides.**

- **Root Cause**: The Log Analytics Usage table in the Azure Log Analytics blade has a default retention period of only 1 month, making it impossible to review data from 2-3 months ago for billing analysis.
- **Solution**: Execute KQL queries in the customer Log Analytics workspace to get detailed information about ingested data. The KB provides specific queries for granular billing analysis beyond the default Azure billing portal data.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — ContentIdea]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Defender for DNS showing unexpected high billing charges (300-500 units/day, each unit = 1M DNS q... | VMs in the subscription sending massive PTR (reverse DNS lookup) queries to Azure platform DNS - ... | 1) Investigate source VMs via DNS log (Geneva portal). 2) Convert container ID to VM name using A... | 🟢 9.0 | OneNote |
| 2 | AMA machines not receiving security value despite AMA being installed and plan enabled — no depen... | Azure Monitoring Agent requires the Security solution installed on the Log Analytics Workspace. W... | Install the Security solution on the custom Log Analytics Workspace manually. If using default wo... | 🟢 8.5 | ADO Wiki |
| 3 | Defender for AI 账单意外升高或成本异常增加，客户报告的 token 用量与预期不符 | Defender for AI 对所有 token 按均一费率计费（无论模型种类、batch/non-batch、prompt/completion）；Embedding 模型、图片生成（DAL... | 1) 使用订阅级 PowerShell 脚本查询 TokenTransaction 指标汇总；2) 使用资源级脚本精确定位单个 OpenAI 资源的逐小时 token 消耗；3) 通过 KQL ... | 🟢 8.5 | ADO Wiki |
| 4 | Customer asks why Databricks resources are billed by Defender for Cloud when many recommendations... | Known limitation: agent-based scenarios excluded for Databricks (open discussion with Databricks ... | Explain Databricks has limited agent-based coverage while network-based detections and other scen... | 🟢 8.5 | ADO Wiki |
| 5 | Customer requests to extend Microsoft Defender for Cloud free trial period beyond 30 days for POC... | MDC offers 30-day free trial per plan. Trial period is now plan-specific (since Nov 2023) and can... | Create IcM using template z3p3e2 (https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z3... | 🟢 8.5 | ADO Wiki |
| 6 | MDC trial extension was applied but customer cannot see remaining trial days or trial status on s... | Trial extension is configured via backend system only. By design, trial extension is not visible ... | This is expected behavior. Verify extension was applied by checking the IcM ticket - when mitigat... | 🟢 8.5 | ADO Wiki |
| 7 | Customer wants to verify MDC free trial status or remaining trial time for Defender plans |  | Use Get-AzSecurityPricing (check FreeTrialRemainingTime field), Azure Resource Graph query (secur... | 🟢 8.5 | ADO Wiki |
| 8 | Support engineer needs to verify MDC trial eligibility from backend for a subscription |  | Use Kusto: cluster('Romelogs').database('Prod').TraceEvent / where message has 'trial started:' a... | 🟢 8.5 | ADO Wiki |
| 9 | Subscription charged for Servers plan even though not enabled at subscription/workspace level - n... | Legacy Resource Group (RG) level pricing still active. RG-level pricing was deprecated April 2024... | Query enabled RGs: cluster('mdcpricingprod.centralus.kusto.windows.net').database('PricingSnapsho... | 🟢 8.5 | ADO Wiki |
| 10 | Customer is charged for Azure Databricks VMs under Defender for Servers plan but MDC features (re... | Azure Databricks VMs are managed resources with RBAC Deny Assignment blocking write operations. M... | 1) Exclude Databricks from MDC billing: Option A - backend exclusion via IcM template Nf2746 (no ... | 🟢 8.5 | ADO Wiki |
| 11 | Customer is charged for VMSS Uniform instances under Defender for Servers plan but MDC features a... | VMSS Uniform are Azure managed resources locked to changes. MDC has only partial feature coverage... | 1) Exclude VMSS Uniform from pricing using API or Policy assignment (recommended - gives customer... | 🟢 8.5 | ADO Wiki |
| 12 | Customer claims they never enabled Microsoft Defender for Cloud or questions why they are being c... | Someone (user, service principal, or Azure Policy) enabled the Defender plan on the subscription.... | Direct customer to check Activity Log as per MDC FAQ (https://learn.microsoft.com/azure/defender-... | 🟢 8.5 | ADO Wiki |
| 13 | Defender for Servers Log Analytics workspace 500MB/day/VM free allowance is not reflected in bill... | VMs may not have Security or AntiMalware solutions properly applied in Heartbeat events. AMA vs M... | 1) Verify solutions column in Heartbeat events: Heartbeat / where Category == 'Azure Monitor Agen... | 🟢 8.5 | ADO Wiki |
| 14 | Error when trying to set resource-level pricing for Defender for Servers: parent subscription enf... | The parent subscription has its Enforce field set to true, which blocks resource-level pricing ov... | Set the subscription Enforce field to false before updating resource-level pricing. Use PUT on su... | 🟢 8.5 | ADO Wiki |
| 15 | Persistent 'Failed to save plan' / Error 400 / InvalidInputJson when enabling Defender for Cloud ... | Partner Center AOBO/GDAP authentication context does not include required user identity headers (... | 1) Switch directory to customer tenant and perform action as a real user with Owner permissions; ... | 🟢 8.5 | ADO Wiki |
| 16 | Customer excluded a resource group from Defender for Containers auto-provisioning via Azure Polic... | Excluding resource groups from the Containers provisioning DINE policy assignment only prevents n... | Inform customer that excluding a resource group from auto-provisioning does NOT reduce charges. E... | 🟢 8.5 | ADO Wiki |
| 17 | Charges for Defender for Containers continue to appear after disabling the plan at subscription l... | Disabling Defender for Containers at the subscription level does not automatically disable it on ... | Use ARG query to find resources with resource-level Defender enabled (securityresources where pri... | 🟢 8.5 | ADO Wiki |
| 18 | Adaptive Network Hardening showing sad cloud icon or unhealthy status unexpectedly after previous... | Known scenarios leading to ANH sad cloud: (1) Resource pricing tier changed to Free, (2) All NSGs... | Verify the resource pricing tier is Standard (not Free). Check that NSGs are properly associated ... | 🟢 8.5 | ADO Wiki |
| 19 | Cannot exclude Databricks managed storage accounts from MDC billing/plans - API or Policy fails w... | Older Databricks workspaces (created before June 2025) lack the required role in the Deny Assignm... | 1) Check the Deny Assignment on the SA: Portal > Storage Account > Access Control (IAM) > Deny as... | 🟢 8.5 | ADO Wiki |
| 20 | Customer selected the wrong Microsoft Sentinel pricing/commitment tier and is locked for 31 days ... | Sentinel commitment tiers have a 31-day lock-in period. Once selected, changes cannot be made unt... | Reset the commitment timer via Geneva Action Portal (requires SAW + gme/ame account and IcM). Ste... | 🟢 8.5 | ADO Wiki |
| 21 | Customer needs to offboard from Microsoft Sentinel data lake after mistaken onboarding, unfavorab... | Data lake onboarding switches billing to new meters, causing negotiated pricing to no longer appl... | Escalate via ICM to 'MSG Tenant Provisioning / Triage'. Include: customer name, reason for offboa... | 🟢 8.5 | ADO Wiki |
| 22 | Customer cannot see Cost Management reports in Microsoft Defender portal under Microsoft Sentinel... | Session cache not refreshed after role assignment or initial data population. Initial data latenc... | Sign out of the Defender portal and sign back in. If reports still empty, wait up to 26 hours for... | 🟢 8.5 | ADO Wiki |
| 23 | Need to investigate who changed Sentinel pricing tier or when a commitment tier change failed. | Pricing tier changes generate Azure Activity Log entries under operation 'Microsoft.OperationsMan... | Search Activity Log for operation 'Microsoft.OperationsManagement/solutions/write'. Click on the ... | 🟢 8.5 | ADO Wiki |
| 24 | Customer wants to enable Defender for Storage in Mooncake but cannot find it in Azure Portal | Defender for Storage (classic mode) in Mooncake available only via REST API/PowerShell/ARM, not t... | Use Enable-AzSecurityAdvancedThreatProtection for per-account or Set-AzSecurityPricing -Name Stor... | 🟢 8.0 | OneNote |
| 25 | Need to check when Defender for Cloud plans were enabled, pricing tier, subplan, and free trial r... |  | Run ARG query in ASC: SecurityResources / where type == 'microsoft.security/pricings' / project S... | 🟢 8.0 | OneNote |
| 26 | Need to check when Defender plans were enabled, their pricing tier, sub-plan, free trial status p... | No direct portal view shows enablement timestamps for all Defender plans across subscriptions | Run ARG query: SecurityResources / where type == 'microsoft.security/pricings' / project Subscrip... | 🟢 8.0 | OneNote |
| 27 | Customer wants to completely offboard/unregister from Azure Security Center (ASC/MDC) for a subsc... |  | Step 1: Move the pricing tier from Standard to Free — this removes the 'security' solution from t... | 🟢 8.0 | OneNote |
| 28 | Customer questions why Databricks resources incur Defender for Cloud charges when recommendations... | Databricks has limitations on agent-based scenarios but network-based detections still cover Data... | Agent-based scenarios are limited for Databricks (ongoing discussion with Databricks team). Other... | 🔵 7.5 | ADO Wiki |
| 29 | Customer wants to completely offboard/unregister from Azure Security Center | No single button to fully offboard from ASC | Two steps: (1) Move pricing tier from Standard to Free (removes 'security' solution from workspac... | 🔵 7.0 | OneNote |
| 30 ⚠️ | Customer questions about Defender CSPM (DCSPM) plan billing - which resources are charged and at ... |  | DCSPM charges $5/billable resource/month. Azure billable: VMs (excl. deallocated/Databricks), Sto... | 🔵 7.0 | ADO Wiki |
| 31 ⚠️ | Need to verify if MDE Arcless Direct Onboarding is being billed. Billing shows charges but ARG as... | Inventory bug: billing records exist for MDE Direct Onboarding but machines not showing in MDC in... | Run Kusto query against pav2dataartfollower.eastus.kusto.windows.net/aipusagedb using P1/P2 meter... | 🔵 7.0 | ADO Wiki |
| 32 | Customers receive unexpectedly high Azure bill and need detailed breakdown of Azure Log Analytics... | The Log Analytics Usage table in the Azure Log Analytics blade has a default retention period of ... | Execute KQL queries in the customer Log Analytics workspace to get detailed information about ing... | 🔵 7.0 | ContentIdea |
