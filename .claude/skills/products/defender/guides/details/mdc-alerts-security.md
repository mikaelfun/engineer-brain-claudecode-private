# DEFENDER MDC 安全警报 — Comprehensive Troubleshooting Guide

**Entries**: 39 | **Draft sources**: 11 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-manually-trigger-alerts.md, ado-wiki-a-r3-security-alerts-escalation-procedure.md, ado-wiki-a-r3-security-alerts-tsgs-directory.md, ado-wiki-b-eicar-alerts-test.md, ado-wiki-b-r1-general-security-alert-investigation.md, ado-wiki-b-r1-sample-alerts-tsg.md, ado-wiki-b-security-alert-testing.md, ado-wiki-b-security-alerts-boundaries.md, ado-wiki-b-xdr-users-unable-to-access-alerts.md, mslearn-defender-alert-validation-simulation.md
  ... and 1 more
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Detection Logic
> Sources: ado-wiki

**1. Customer asks why they received a specific MDC security alert or requests information about MDC detection logic/heuristics**

- **Solution**: MDC does not publish documentation on detection logic as it changes dynamically to balance alerting on suspicious activity while reducing false positives. Point customer to alert validation methods: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation. For incident response, recommend Microsoft Security Experts or third-party IR services.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer asks why they received a specific MDC alert or requests detection logic/heuristic details**

- **Root Cause**: MDC does not publish detection heuristics as they change frequently to balance detection of suspicious activity with false positive reduction
- **Solution**: Explain that MDC does not publish detection logic documentation. Provide alert validation page for customers to verify monitoring: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer asks why they received a specific alert, how MDC detection logic works, or requests simulation/heuristic details**

- **Root Cause**: Defender for Cloud does not publish detection logic documentation because detection heuristics change frequently to balance alerting vs false positives.
- **Solution**: Explain detection logic is intentionally undocumented. Direct to alert validation page: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Customer asks why they received an alert or requests MDC detection logic/heuristics details**

- **Root Cause**: By design: MDC does not publish detection logic as heuristics change dynamically to balance detection vs false positive reduction
- **Solution**: Explain detection logic is not published. Offer alert validation methods: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Customer asks why a specific MDC alert was triggered or requests detection logic/heuristics documentation**

- **Root Cause**: Defender for Cloud does not publish detection logic documentation as it changes frequently to balance detection sensitivity and false positive reduction.
- **Solution**: Explain detection logic is dynamic and not published. Offer alert validation methods: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Customer asks why they received a specific MDC security alert or requests detection logic/heuristics details**

- **Root Cause**: MDC does not publish detection logic as it changes frequently
- **Solution**: Point to alert validation page (learn.microsoft.com/azure/defender-for-cloud/alert-validation) to verify resource monitoring
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Customer asks why a Defender for Cloud alert was triggered or requests detection logic/heuristics documentation**

- **Solution**: MDC does not publish detection logic documentation as it changes dynamically. Use alert validation page to verify resource monitoring: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Customer asks why they received a specific security alert or requests details about MDC detection logic/heuristics**

- **Root Cause**: Defender for Cloud detection logic is dynamic and intentionally not published to balance threat detection vs false positives
- **Solution**: Explain detection logic changes over time and is not publicly documented. Provide alert validation methods: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. Customer asks why they received a specific Defender for Cloud security alert, or requests details on the detection logic/heuristics**

- **Solution**: Defender for Cloud does not publish detection logic documentation as it changes frequently. Refer customer to alert validation page: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Customer asks why a specific MDC alert was triggered or requests details about detection logic/heuristics**

- **Root Cause**: Defender for Cloud does not publish detection logic documentation; detection heuristics change dynamically to balance alerting vs false positives
- **Solution**: Explain that detection logic is not published. Direct customer to alert validation page: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**11. Customer asks why they received a specific Defender for Cloud security alert or requests detection logic details**

- **Root Cause**: Detection logic is dynamic and intentionally not published; evolves to balance threat detection vs false positives
- **Solution**: Detection logic not documented, changes dynamically. Provide alert validation: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**12. Customer asks why they received a specific Defender for Cloud security alert or requests details about detection logic/heuristics**

- **Root Cause**: Detection logic is dynamic and changes periodically to balance suspicious activity alerting vs false positive reduction; Microsoft does not publish detection specifics
- **Solution**: Direct customer to alert validation page: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation for testing that resources are properly monitored.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**13. Customer asks why MDC alert was triggered, how detection logic/heuristic works, or requests to simulate detections**

- **Root Cause**: MDC does not publish detection logic documentation as detection heuristics change frequently to balance suspicious activity detection vs false positives.
- **Solution**: Explain detection logic is not published. Point to alert validation docs: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**14. Customer asks why they received a Defender for Cloud security alert or requests detection logic details**

- **Root Cause**: MDC detection logic is intentionally unpublished and changes frequently.
- **Solution**: Detection logic not published. Refer to alert validation: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**15. Customer asks why they received a security alert or requests details about MDC detection logic/heuristics**

- **Root Cause**: MDC does not publish detection logic documentation; detection heuristics change frequently to balance alerting on suspicious activity while reducing false positives
- **Solution**: Explain that detection logic is not published. Refer customer to alert validation documentation: https://learn.microsoft.com/azure/defender-for-cloud/alert-validation
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 2: Incident Response
> Sources: ado-wiki

**1. Customer requests help investigating security alert or security incident in Defender for Cloud**

- **Root Cause**: MDC support scope covers alerts platform issues (false positives, false negatives, dismiss feature, missing/wrong alert details) but not full incident response
- **Solution**: Clarify that MDC support does not offer incident response services. For alert platform issues (confirmed FP/FN, dismiss feature, wrong details), CSS can assist. For security incident investigation, recommend customer use their own security team, Microsoft Security Experts, or a third-party IR service.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer asks why MDC alerts support cannot investigate their security incident - scope confusion between alerts platform support and incident response**

- **Root Cause**: MDC CSS supports alerts platform (false positives, false negatives, dismiss feature, wrong/missing alert details) but does NOT offer incident response services.
- **Solution**: Clarify scope: CSS assists with alerts platform issues only. For security incident investigation, recommend customer own security team, Microsoft Security Experts, or third-party IR service.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer contacts CSS to investigate a security alert or security incident in Defender for Cloud**

- **Root Cause**: CSS does not offer incident response services. Support scope limited to alert platform issues (false positives, false negatives, Dismiss feature, missing/incorrect alert details).
- **Solution**: Clarify support scope: CSS assists with alert platform issues only. For incident investigation recommend Microsoft Security Experts or third-party IR service.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Customer requests investigation of Defender for Cloud security alert or asks for incident response**

- **Solution**: MDC support covers alert platform issues only (false positives, false negatives, dismiss feature, missing/wrong alert details). For incident response, direct customer to Microsoft Security Experts or third-party IR services.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Customer contacts Defender for Cloud support about a security alert expecting incident response or investigation of a security incident**

- **Solution**: MDC support assists with alerts platform issues (false positives, false negatives, Dismiss feature, missing/wrong alert details). For security incident investigation, refer customer to their own security team, Microsoft Security Experts services, or a third-party IR provider.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Customer requests CSS to investigate a security alert or perform incident response for Defender for Cloud alerts**

- **Root Cause**: CSS support scope is limited to alert platform issues (false positives/negatives, dismiss feature, missing/wrong alert details); incident response is out of scope
- **Solution**: Inform customer that CSS handles alert platform issues only. For security incident investigation, recommend Microsoft Security Experts or a third-party IR service.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Customer requests investigation or incident response for Defender for Cloud security alerts**

- **Root Cause**: MDC support scope is limited to alerts platform issues (false positives/negatives, dismiss feature, alert details); incident response is not offered by CSS
- **Solution**: For security incident investigation, recommend customer use own security teams, Microsoft Security Experts, or third-party IR service. CSS can help with alerts platform issues only.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Customer contacts Defender for Cloud support about a security alert expecting incident response**

- **Root Cause**: MDC CSS scope covers alert platform issues only. Incident response is outside CSS scope.
- **Solution**: Explain CSS scope. For incident investigation refer to Microsoft Security Experts or third-party IR.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Security Alerts
> Sources: ado-wiki

**1. Security alert published with latency - customer reports delayed alert notification in Microsoft Defender for Cloud**

- **Root Cause**: Latency can occur at either the alert provider level (before reaching the platform) or at the platform level (Rome Detection pipeline). Use AllSecurityAlerts query to compare StartTimeUtc, EndTimeUtc, and ProviderSendAlertTimeUtc to pinpoint the source.
- **Solution**: Run KQL on romeeus.eastus.kusto.windows.net / ProdAlerts database: AllSecurityAlerts | where SystemAlertId == '<alertId>' | project StartTimeUtc, EndTimeUtc, ProviderSendAlertTimeUtc=Metadata['DetectionInternalAlertsProcessing.PipelineReceiveTime'], ProviderName. If most latency is at provider level (ProviderSendAlertTimeUtc already has most delay from StartTimeUtc) -> escalate to provider ICM queue per List Of Registered Providers. If latency is at platform level -> escalate to Detection team ICM.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. No security alerts generated for AKS containers in Defender for Cloud despite monitoring being configured - auditing not enabled or audit log misconfigured on the Kubernetes cluster**

- **Root Cause**: Auditing not enabled on the Kubernetes cluster, audit log file (/var/log/kube-apiserver/audit.log) missing or misconfigured in kube-apiserver.yaml, or errors in Defender for Cloud AuditLogsPathDiscovery trace logs
- **Solution**: Verify auditing is enabled on the cluster. Check /var/log/kube-apiserver/audit.log exists and has entries. Ensure kube-apiserver.yaml includes --audit-log-path=/var/log/kubernetes/audit/audit.log. Review /var/log/microsoft-defender-for-cloud/traces/AuditLogsPathDiscovery for errors. For Arc K8s with custom log path, deploy defender extension with auditLogPath parameter via az k8s-extension create --configuration-settings auditLogPath=<path>
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. EICAR test alert or server alert validation fails on Windows VM - no alert appears in Defender for Cloud after running test executable or EICAR file due to disabled command-line auditing**

- **Root Cause**: Command-line arguments auditing not enabled in Windows registry (ProcessCreationIncludeCmdLine_Enabled) or process creation audit policy disabled/overwritten by local or domain Group Policy
- **Solution**: Enable command-line auditing: reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\policies\system\Audit /f /v ProcessCreationIncludeCmdLine_Enabled. Enable process creation auditing: auditpol.exe /set /subcategory:process creation /success:enable. Verify with: auditpol.exe /get /subcategory:process creation. If shows No Auditing, process creation events (ID 4688) are not logged in Security Event Log.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Server alert validation fails - no test alert appears in Defender for Cloud because subscription is on Free tier instead of Standard tier**

- **Root Cause**: Subscription is on Free tier instead of Standard tier; Threat Protection (security alerts beyond malware) requires Standard Tier pricing plan to be enabled
- **Solution**: Upgrade the subscription to Standard Tier (enable Defender plans). Free tier subscriptions can only raise malware-related threats. For free-tier customers wanting to validate, use the Windows Defender malware validation test file instead.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Scope Clarification
> Sources: ado-wiki

**1. Customer requests incident response or investigation for MDC security alerts**

- **Root Cause**: MDC support covers alert platform issues (false positives, false negatives, dismiss feature, missing/wrong details) but not incident response
- **Solution**: Inform customer MDC does not offer incident response. Recommend Microsoft Security Experts or third-party IR service. Support helps with alert platform issues only.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer contacts MDC support requesting security incident investigation/response for security alerts**

- **Solution**: Clarify scope: MDC support helps with alert platform issues only (false positives, false negatives, dismiss feature, missing/wrong alert details). For security incident investigation, recommend Microsoft Security Experts or third-party IR services.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Continuous Export
> Sources: ado-wiki

**1. Customer sees only a subset of MDC alert types in Continuous Export output despite having all alert types enabled in the export rule**

- **Root Cause**: Subscription is on Free tier (not Standard/Defender tier). Free tier subscriptions receive only a small subset of MDC security alert types regardless of export configuration.
- **Solution**: Upgrade the subscription to a Defender plan (Standard tier or higher) to receive the full set of MDC security alerts. Verify subscription pricing tier in MDC Settings > Defender plans.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 6: Support Boundary
> Sources: ado-wiki

**1. Customer requests incident response or security investigation services for MDC security alerts**

- **Root Cause**: CSS supports alert platform issues (confirmed false positives, false negatives, Dismiss feature problems, missing/wrong alert details) but does NOT offer incident response services.
- **Solution**: Clarify support boundary: help with alert platform issues only. For incident investigation, redirect to Microsoft Security Experts (https://www.microsoft.com/security/business/services) or a third-party IR service.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 7: Scope Of Support
> Sources: ado-wiki

**1. Customer expects CSS to investigate security incidents triggered by MDC alerts**

- **Root Cause**: MDC CSS scope covers alerts platform issues only, not incident response
- **Solution**: Explain CSS supports alerts platform issues. For incident investigation, recommend Microsoft Security Experts or third-party IR service
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 8: Scope Boundary
> Sources: ado-wiki

**1. Customer requests MDC security incident response or investigation for security alerts (e.g. asking support to investigate a breach or incident)**

- **Root Cause**: MDC support covers alert platform issues only (false positives, false negatives, dismiss feature, alert details). Incident response is out of scope.
- **Solution**: Redirect customer to Microsoft Security Experts (https://www.microsoft.com/security/business/services) or their own security team / third-party IR service.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 9: Endpoint Protection
> Sources: ado-wiki

**1. No Defender for Cloud security alert raised after running EICAR malware test file on VM**

- **Root Cause**: Antimalware detection service has a de-duplication mechanism that prevents duplicate alerts on the same resource within a short timespan - identical alerts on same VM are suppressed
- **Solution**: Wait up to 48 hours before generating an identical test alert on the same VM. The dedup mechanism is by design to reduce noise from duplicated alerts from AV providers
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 10: Alert Dismissal
> Sources: ado-wiki

**1. Cannot dismiss MDC security alert raised on a deleted Databricks Virtual Machine -- dismissal fails with error DenyAssignmentAuthorizationFailed**

- **Root Cause**: Databricks creates an ARM operation lock (DenyAssignment) on its owned Resource Group. After Databricks deletes its VMs, the lock persists and blocks the standard alert dismissal action (known bug).
- **Solution**: Use PowerShell REST API to dismiss the alert directly (bypasses the lock via a separate bug): Login-AzAccount; $token = Get-AzAccessToken; POST to https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.Security/locations/{centralus|westeurope}/alerts/{alertId}/dismiss?api-version=2021-01-01 using Invoke-RestMethod with -Authentication Bearer -Token (ConvertTo-SecureString $token.Token -AsPlainText -Force). Requires PowerShell 7.1.5+ with network access to Azure.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 11: Powershell
> Sources: ado-wiki

**1. PowerShell call to fetch or dismiss all Defender for Cloud alerts retrieves only partial results -- cannot get all alerts beyond the paging limit in a single call**

- **Root Cause**: Single PowerShell API call to the Defender for Cloud alerts API has a built-in paging limit restricting the number of alerts returned per request
- **Solution**: Use DismissAllAlerts.ps1 script from official MDC GitHub: https://github.com/Azure/Microsoft-Defender-for-Cloud/blob/main/Powershell%20scripts/Alerts/DismissAllAlerts.ps1 -- this script handles pagination automatically to fetch and process all alerts beyond the default paging limit.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 12: Defender For Storage
> Sources: ado-wiki

**1. Unable to investigate Defender for Storage security alerts due to lack of detailed activity information**

- **Root Cause**: Storage diagnostic logs are not enabled by default. Without these logs, insufficient data exists to investigate suspicious activity. Note: Azure Files does not yet support diagnostic logs.
- **Solution**: Enable diagnostic logs on the storage account via Monitoring > Diagnostic settings. Reference: https://learn.microsoft.com/en-us/azure/storage/common/manage-storage-analytics-logs. This provides the most useful data for alert investigation including detailed storage operations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 13: App Service
> Sources: mslearn

**1. Dangling DNS alerts not triggered by Defender for App Service after App Service decommissioned**

- **Root Cause**: Custom domain does not point directly to an App Service resource; or Defender for Cloud has not monitored traffic to website since dangling DNS protection was enabled
- **Solution**: Ensure custom domain points directly to App Service resource; enable Defender for App Service before decommissioning to allow traffic monitoring; manually check DNS registrar for orphaned DNS entries
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 6.5/10 — MS Learn]`

### Phase 14: Defender For Containers
> Sources: mslearn

**1. No security alerts from Defender for Containers on AWS EKS clusters despite sensor pods running**

- **Root Cause**: Audit logging is not enabled on EKS clusters, or runtime protection is not enabled in connector settings. Defender needs EKS audit logs to detect threats.
- **Solution**: Enable audit logging on EKS via aws eks update-cluster-config with audit type enabled. Verify Defender sensor pods running (kubectl get pods -n kube-system -l app=microsoft-defender). Check runtime protection enabled in connector settings. Wait 5-10 minutes after generating test events.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer sees only a subset of MDC alert types in Continuous Export output despite having all ale... | Subscription is on Free tier (not Standard/Defender tier). Free tier subscriptions receive only a... | Upgrade the subscription to a Defender plan (Standard tier or higher) to receive the full set of ... | 🟢 8.5 | ADO Wiki |
| 2 | Customer asks why they received a specific MDC security alert or requests information about MDC d... |  | MDC does not publish documentation on detection logic as it changes dynamically to balance alerti... | 🟢 8.5 | ADO Wiki |
| 3 | Customer requests help investigating security alert or security incident in Defender for Cloud | MDC support scope covers alerts platform issues (false positives, false negatives, dismiss featur... | Clarify that MDC support does not offer incident response services. For alert platform issues (co... | 🟢 8.5 | ADO Wiki |
| 4 | Customer asks why they received a specific MDC alert or requests detection logic/heuristic details | MDC does not publish detection heuristics as they change frequently to balance detection of suspi... | Explain that MDC does not publish detection logic documentation. Provide alert validation page fo... | 🟢 8.5 | ADO Wiki |
| 5 | Customer asks why MDC alerts support cannot investigate their security incident - scope confusion... | MDC CSS supports alerts platform (false positives, false negatives, dismiss feature, wrong/missin... | Clarify scope: CSS assists with alerts platform issues only. For security incident investigation,... | 🟢 8.5 | ADO Wiki |
| 6 | Customer asks why they received a specific alert, how MDC detection logic works, or requests simu... | Defender for Cloud does not publish detection logic documentation because detection heuristics ch... | Explain detection logic is intentionally undocumented. Direct to alert validation page: https://l... | 🟢 8.5 | ADO Wiki |
| 7 | Customer requests incident response or investigation for MDC security alerts | MDC support covers alert platform issues (false positives, false negatives, dismiss feature, miss... | Inform customer MDC does not offer incident response. Recommend Microsoft Security Experts or thi... | 🟢 8.5 | ADO Wiki |
| 8 | Customer asks why they received an alert or requests MDC detection logic/heuristics details | By design: MDC does not publish detection logic as heuristics change dynamically to balance detec... | Explain detection logic is not published. Offer alert validation methods: https://learn.microsoft... | 🟢 8.5 | ADO Wiki |
| 9 | Customer requests incident response or security investigation services for MDC security alerts | CSS supports alert platform issues (confirmed false positives, false negatives, Dismiss feature p... | Clarify support boundary: help with alert platform issues only. For incident investigation, redir... | 🟢 8.5 | ADO Wiki |
| 10 | Customer contacts CSS to investigate a security alert or security incident in Defender for Cloud | CSS does not offer incident response services. Support scope limited to alert platform issues (fa... | Clarify support scope: CSS assists with alert platform issues only. For incident investigation re... | 🟢 8.5 | ADO Wiki |
| 11 | Customer asks why a specific MDC alert was triggered or requests detection logic/heuristics docum... | Defender for Cloud does not publish detection logic documentation as it changes frequently to bal... | Explain detection logic is dynamic and not published. Offer alert validation methods: https://lea... | 🟢 8.5 | ADO Wiki |
| 12 | Customer expects CSS to investigate security incidents triggered by MDC alerts | MDC CSS scope covers alerts platform issues only, not incident response | Explain CSS supports alerts platform issues. For incident investigation, recommend Microsoft Secu... | 🟢 8.5 | ADO Wiki |
| 13 | Customer asks why they received a specific MDC security alert or requests detection logic/heurist... | MDC does not publish detection logic as it changes frequently | Point to alert validation page (learn.microsoft.com/azure/defender-for-cloud/alert-validation) to... | 🟢 8.5 | ADO Wiki |
| 14 | Customer requests investigation of Defender for Cloud security alert or asks for incident response |  | MDC support covers alert platform issues only (false positives, false negatives, dismiss feature,... | 🟢 8.5 | ADO Wiki |
| 15 | Customer asks why a Defender for Cloud alert was triggered or requests detection logic/heuristics... |  | MDC does not publish detection logic documentation as it changes dynamically. Use alert validatio... | 🟢 8.5 | ADO Wiki |
| 16 | Customer asks why they received a specific security alert or requests details about MDC detection... | Defender for Cloud detection logic is dynamic and intentionally not published to balance threat d... | Explain detection logic changes over time and is not publicly documented. Provide alert validatio... | 🟢 8.5 | ADO Wiki |
| 17 | Customer contacts Defender for Cloud support about a security alert expecting incident response o... |  | MDC support assists with alerts platform issues (false positives, false negatives, Dismiss featur... | 🟢 8.5 | ADO Wiki |
| 18 | Customer asks why they received a specific Defender for Cloud security alert, or requests details... |  | Defender for Cloud does not publish detection logic documentation as it changes frequently. Refer... | 🟢 8.5 | ADO Wiki |
| 19 | Customer requests CSS to investigate a security alert or perform incident response for Defender f... | CSS support scope is limited to alert platform issues (false positives/negatives, dismiss feature... | Inform customer that CSS handles alert platform issues only. For security incident investigation,... | 🟢 8.5 | ADO Wiki |
| 20 | Customer asks why a specific MDC alert was triggered or requests details about detection logic/he... | Defender for Cloud does not publish detection logic documentation; detection heuristics change dy... | Explain that detection logic is not published. Direct customer to alert validation page: https://... | 🟢 8.5 | ADO Wiki |
| 21 | Customer asks why they received a specific Defender for Cloud security alert or requests detectio... | Detection logic is dynamic and intentionally not published; evolves to balance threat detection v... | Detection logic not documented, changes dynamically. Provide alert validation: https://learn.micr... | 🟢 8.5 | ADO Wiki |
| 22 | Customer requests investigation or incident response for Defender for Cloud security alerts | MDC support scope is limited to alerts platform issues (false positives/negatives, dismiss featur... | For security incident investigation, recommend customer use own security teams, Microsoft Securit... | 🟢 8.5 | ADO Wiki |
| 23 | Customer asks why they received a specific Defender for Cloud security alert or requests details ... | Detection logic is dynamic and changes periodically to balance suspicious activity alerting vs fa... | Direct customer to alert validation page: https://learn.microsoft.com/azure/defender-for-cloud/al... | 🟢 8.5 | ADO Wiki |
| 24 | Customer requests MDC security incident response or investigation for security alerts (e.g. askin... | MDC support covers alert platform issues only (false positives, false negatives, dismiss feature,... | Redirect customer to Microsoft Security Experts (https://www.microsoft.com/security/business/serv... | 🟢 8.5 | ADO Wiki |
| 25 | Customer asks why MDC alert was triggered, how detection logic/heuristic works, or requests to si... | MDC does not publish detection logic documentation as detection heuristics change frequently to b... | Explain detection logic is not published. Point to alert validation docs: https://learn.microsoft... | 🟢 8.5 | ADO Wiki |
| 26 | Customer contacts Defender for Cloud support about a security alert expecting incident response | MDC CSS scope covers alert platform issues only. Incident response is outside CSS scope. | Explain CSS scope. For incident investigation refer to Microsoft Security Experts or third-party IR. | 🟢 8.5 | ADO Wiki |
| 27 | Customer asks why they received a Defender for Cloud security alert or requests detection logic d... | MDC detection logic is intentionally unpublished and changes frequently. | Detection logic not published. Refer to alert validation: https://learn.microsoft.com/azure/defen... | 🟢 8.5 | ADO Wiki |
| 28 | Customer contacts MDC support requesting security incident investigation/response for security al... |  | Clarify scope: MDC support helps with alert platform issues only (false positives, false negative... | 🟢 8.5 | ADO Wiki |
| 29 | Customer asks why they received a security alert or requests details about MDC detection logic/he... | MDC does not publish detection logic documentation; detection heuristics change frequently to bal... | Explain that detection logic is not published. Refer customer to alert validation documentation: ... | 🟢 8.5 | ADO Wiki |
| 30 | Security alert published with latency - customer reports delayed alert notification in Microsoft ... | Latency can occur at either the alert provider level (before reaching the platform) or at the pla... | Run KQL on romeeus.eastus.kusto.windows.net / ProdAlerts database: AllSecurityAlerts / where Syst... | 🟢 8.5 | ADO Wiki |
| 31 | No Defender for Cloud security alert raised after running EICAR malware test file on VM | Antimalware detection service has a de-duplication mechanism that prevents duplicate alerts on th... | Wait up to 48 hours before generating an identical test alert on the same VM. The dedup mechanism... | 🟢 8.5 | ADO Wiki |
| 32 | Cannot dismiss MDC security alert raised on a deleted Databricks Virtual Machine -- dismissal fai... | Databricks creates an ARM operation lock (DenyAssignment) on its owned Resource Group. After Data... | Use PowerShell REST API to dismiss the alert directly (bypasses the lock via a separate bug): Log... | 🟢 8.5 | ADO Wiki |
| 33 | PowerShell call to fetch or dismiss all Defender for Cloud alerts retrieves only partial results ... | Single PowerShell API call to the Defender for Cloud alerts API has a built-in paging limit restr... | Use DismissAllAlerts.ps1 script from official MDC GitHub: https://github.com/Azure/Microsoft-Defe... | 🟢 8.5 | ADO Wiki |
| 34 | No security alerts generated for AKS containers in Defender for Cloud despite monitoring being co... | Auditing not enabled on the Kubernetes cluster, audit log file (/var/log/kube-apiserver/audit.log... | Verify auditing is enabled on the cluster. Check /var/log/kube-apiserver/audit.log exists and has... | 🟢 8.5 | ADO Wiki |
| 35 | EICAR test alert or server alert validation fails on Windows VM - no alert appears in Defender fo... | Command-line arguments auditing not enabled in Windows registry (ProcessCreationIncludeCmdLine_En... | Enable command-line auditing: reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\policies\sys... | 🟢 8.5 | ADO Wiki |
| 36 | Server alert validation fails - no test alert appears in Defender for Cloud because subscription ... | Subscription is on Free tier instead of Standard tier; Threat Protection (security alerts beyond ... | Upgrade the subscription to Standard Tier (enable Defender plans). Free tier subscriptions can on... | 🟢 8.5 | ADO Wiki |
| 37 | Unable to investigate Defender for Storage security alerts due to lack of detailed activity infor... | Storage diagnostic logs are not enabled by default. Without these logs, insufficient data exists ... | Enable diagnostic logs on the storage account via Monitoring > Diagnostic settings. Reference: ht... | 🟢 8.5 | ADO Wiki |
| 38 | Dangling DNS alerts not triggered by Defender for App Service after App Service decommissioned | Custom domain does not point directly to an App Service resource; or Defender for Cloud has not m... | Ensure custom domain points directly to App Service resource; enable Defender for App Service bef... | 🔵 6.5 | MS Learn |
| 39 ⚠️ | No security alerts from Defender for Containers on AWS EKS clusters despite sensor pods running | Audit logging is not enabled on EKS clusters, or runtime protection is not enabled in connector s... | Enable audit logging on EKS via aws eks update-cluster-config with audit type enabled. Verify Def... | 🔵 6.0 | MS Learn |
