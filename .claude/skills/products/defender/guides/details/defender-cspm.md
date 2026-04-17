# DEFENDER CSPM / DCSPM 云安全态势管理 — Comprehensive Troubleshooting Guide

**Entries**: 19 | **Draft sources**: 6 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-attack-paths-product-knowledge.md, ado-wiki-a-blast-radius-tsg.md, ado-wiki-a-cloud-security-explorer-product-knowledge.md, ado-wiki-a-cloud-vulnerabilities-exposure-management-tsg.md, ado-wiki-a-internet-exposure-trusted-ips-deployment.md, ado-wiki-c-tsg-attack-path-not-visible.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Attack Paths
> Sources: ado-wiki

**1. Customer onboarded to Defender CSPM/DCSPM but still sees onboarding experience for Attack Paths**

- **Root Cause**: Scope issue or subscription not registered to the CloudPosture/DefenderCspm bundle in the selected scope
- **Solution**: Verify onboard status using Kusto query on GetCurrentEnvironmentsPricing table (clusters: mdcentitystoreprodus.centralus.kusto.windows.net / ascentitystoreprdeu.westeurope.kusto.windows.net, database: MDCGlobalData). Filter by EnvironmentName and PlanName to confirm subscription is registered. Check scope alignment.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. No Attack Paths displayed or Attack Path count decreased to zero (especially after September 2025)**

- **Root Cause**: What-Now refinement released September 15, 2025: Attack Paths now only display when entry point is exposed to internet AND rated High/Critical. Backend may have hundreds of ATPs that are filtered out because entry points are not externally exposed.
- **Solution**: Use CloudMapV2.AttackPaths query on cusdefautprepkustoprd.centralus.kusto.windows.net to check if ATPs exist but are filtered. Query checks isExposedToInternet and allowsPublicAccess fields. If ATPs exist with both false → expected behavior (not a defect). If no ATPs found at all → further investigation needed.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Attack Paths show limited permissions content — some nodes do not have context or display incomplete information**

- **Root Cause**: Three possible causes: 1) Insufficient DCSPM plan for target or entry subscription/security connector (cross-environment ATP), 2) Customer lacks necessary permissions on affected resources, 3) Content not published successfully to ARG
- **Solution**: Check subscription plan via EnvironmentsPricing Kusto table, check environment plan via GetCurrentDefenderCspmEnvironments(). Verify customer permissions per MS Learn prerequisites. If plans and permissions are correct but content still missing → open CRI for PG investigation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. Attack Path is visible but no recommendations are shown for the affected resources**

- **Root Cause**: Insufficient Defender CSPM plan on the target or entry subscription — attack path spans subscriptions, but target subscription lacks required CloudPosture/DefenderCSPM plan; or customer has insufficient permissions on the target subscription
- **Solution**: (1) Verify CSPM plan enabled on ALL involved subscriptions using Kusto: cluster('mdcentitystoreprodus.centralus.kusto.windows.net').database('MDCGlobalData').EnvironmentsPricing | where Scope == '/subscriptions/{subscriptionId}' | distinct PlanName, SubPlanName. (2) Ensure customer has required permissions on all subscriptions involved in the attack path. (3) Advise customer to enable Defender CSPM on all relevant subscriptions. Requires JIT access: MDC-EntityStore-Prod-Viewers ESG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Attack Path is visible but no recommendations are shown; resource has an exemption applied**

- **Root Cause**: Recommendation exemption at resource or subscription level. Exempting a recommendation does NOT remove or suppress the associated Attack Path — the Attack Path engine continues to detect lateral movement opportunities even when recommendations are exempted
- **Solution**: Check for exemptions at resource/subscription level. If exemption is present, absence of recommendations is expected (by design). If no exemption found, investigate plan/permissions (see defender-ado-wiki-a-026). Communicate to customer: Attack Paths reflect realistic attack vectors — exemptions don't suppress the detection.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Customer onboarded Defender CSPM but still sees the onboarding experience / zero Attack Paths**

- **Root Cause**: Scope issue — onboarding only applied to some subscriptions; not all relevant subscriptions are registered to the Defender CSPM bundle, or recently onboarded (data freshness up to 24 hours)
- **Solution**: (1) Verify onboard status for each subscription: cluster('mdcentitystoreprodus.centralus.kusto.windows.net').database('MDCGlobalData').GetCurrentEnvironmentsPricing | where (EnvironmentName=='Azure' and PlanName=='CloudPosture') | where Scope has '{subscriptionId}'. (2) If recently onboarded, wait up to 24h (DEASM scans once/week). (3) Ensure ALL subscriptions in scope have Defender CSPM enabled. (4) Check if 'What-Now' refinement (Sept 15, 2025) is filtering paths — only entry points internet-exposed + High/Critical are shown.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Customer reports decrease in Attack Path numbers or zero Attack Paths after September 2025**

- **Root Cause**: 'What-Now' refinement released September 15, 2025 — Attack Paths now only displayed when entry point is internet-exposed AND rated High/Critical. ATPs with non-internet-exposed entry points are filtered from the UI (still exist in backend)
- **Solution**: Confirm by Kusto query: cluster('cusdefautprepkustoprd.centralus.kusto.windows.net').database('CloudMapV2').AttackPaths | where TenantId contains '{tenantId}' | where Status !contains 'Inactive' — check isExposedToInternet and allowsPublicAccess fields. If results show ATPs with isExposedToInternet=false/allowsPublicAccess=false, this is expected behavior (What-Now feature). Communicate to customer: paths still exist in backend; UI now focuses on externally-driven exploitable risks.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 2: Serverless Posture
> Sources: ado-wiki

**1. Customer does not see vulnerability recommendations for WebApp/Azure Function on Windows (App Service Plan, Premium Plan, Consumption Plan). Kusto Span table shows OperationResult=Failure with Resourc**

- **Root Cause**: The app does not have public access enabled, blocking Defender for Cloud from scanning.
- **Solution**: Customer needs to allow the service tag AzureSecurityCenter in the app networking settings (Advanced Tool Site).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**2. Customer does not see vulnerability recommendations for WebApp. Kusto Span table shows Name or service not known error for WebAppDownloader.DownloadAsync.**

- **Root Cause**: The WebApp is running in an App Service Environment (ASE), which is not supported for vulnerability scanning.
- **Solution**: By design limitation. Inform customer that App Service Environment is not supported for serverless vulnerability scanning.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**3. Customer does not see vulnerability recommendations for Function App on Linux Consumption Plan. Span table shows: Failed to download artifact via AzCopy and no run from package setting found.**

- **Root Cause**: Function app runs with deployment package using identity access, which is not supported for vulnerability scanning on Consumption Plan Linux.
- **Solution**: By design limitation. Deployment package with identity access on Linux Consumption Plan is currently not supported for scanning.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

**4. Customer does not see vulnerability recommendations for Function App on Flex Consumption Plan. Span table shows: Invalid storage properties for Function App on Flex Consumption plan (StorageType: blob**

- **Root Cause**: Flex Consumption Plan with blobcontainer storage using managed identity (system or user assigned) is not supported for vulnerability scanning.
- **Solution**: By design limitation. Flex Consumption Plan with blobcontainer + managed identity storage is currently not supported.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 5.5/10 — ADO Wiki]`

### Phase 3: Kusto
> Sources: ado-wiki

**1. Need to access MDC Entity Store Kusto clusters (mdcentitystoreprodus / ascentitystoreprdeu) or Attack Path clusters for investigation — access denied**

- **Root Cause**: MDC Kusto clusters require JIT access to elevated Security Group (MDC-EntityStore-Prod-Viewers) due to security requirements; regular permissions are not sufficient
- **Solution**: Prerequisites: SAW device + AME account + CSS-IS-MDCKustoAccess AME group membership. JIT request via https://jitaccess.security.core.windows.net using ICM WorkItem ID 180451390. Steps: Select 'Submit Request' > WorkItem source=ICM > Resource Type=Elevated Security Group > Service=Azure Security Center > Scenario=MDC-EntityStore-Prod-Viewers > Access Level=Member > 'Validate & Add Resource'. Clusters: mdcentitystoreprodus.centralus.kusto.windows.net and ascentitystoreprdeu.westeurope.kusto.windows.net (database: MDCGlobalData).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Dcspm
> Sources: ado-wiki

**1. DCSPM K8s agentless AgentlessManager service fails to process discoveryData or add MDC IPs to EKS/GKE clusters that impose IP restrictions, resulting in agentless data collection failures**

- **Root Cause**: AgentlessManager service encounters error during ProcessMessagesAsync; non-ClientError = backend engineering issue; ClientError = missingPermissions on MDC role for the cloud provider
- **Solution**: Run Kusto on mdcprd.centralus.kusto.windows.net/Detection Span table filtered by env_cloud_role=agentless-collector-manager-app to find traceId, then check OperationResult. If not ClientError -> CRI to Cloud/Protectors - Shilo's Team. If ClientError (missingPermissions) -> follow Agentless Manager missingPermission Error TSG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Mepm
> Sources: ado-wiki

**1. MEPM Permissions Management enablement fails in Azure portal - error assigning Reader role to MEPM first party app on subscription**

- **Root Cause**: Logged-in user lacks permissions to assign Reader role to MEPM first party app (Cloud Infrastructure Entitlement Management) at subscription level
- **Solution**: Ask user with Owner/User Access Administrator permissions to enable the extension. If still fails, open CRI with Tenant ID, Subscription ID, and Portal Session ID
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 6: Risk Level
> Sources: ado-wiki

**1. Defender for Cloud Recommendation Risk Level not being evaluated or showing as empty for resources**

- **Root Cause**: Risk Level (One Queue) requires Defender Cloud Security Posture Management (CSPM) plan to be enabled. Without CSPM, risk prioritization is not calculated. Risk level is composed of recommendation base score + contextual resource information (permissions, exposure, sensitivity).
- **Solution**: 1) Verify Defender CSPM is enabled using Kusto: cluster('Rometelemetrydata').database('RomeTelemetryProd').PricingTierByBundleAndSubscriptionId filtered by SubscriptionId, check Bundle=CloudPosture has PricingTier=Standard. 2) If CSPM enabled, use Risk evaluation Investigation Dashboard (ADX dashboard 717634a5) to review risk evaluation flow for specific subscription + assessmentKey. 3) Risk level changes dynamically due to: contextual info changes, assessment updates, periodic recalculation (every few hours).
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 7: Agentless Scanning
> Sources: ado-wiki

**1. Agentless secret scanning results not appearing for Azure VMs or disks - no findings in Defender for Cloud after enabling secret scanning**

- **Root Cause**: Multiple possible causes: 1) Defender CSPM not enabled for the subscription (prerequisite). 2) Disk scanning service not enabled - no entries in DiskScanningVmScanners table. 3) No eligible machines found for scanning in subscription. 4) Scan results not processed by DiskScanningResultsProcessor.
- **Solution**: Diagnose step by step using Kusto queries on cluster romelogs.kusto.windows.net database Rome3Prod: 1) Check DiskScanningVmScanners for subscription. 2) Check FabricServiceOE with applicationName DiskScanningApp and operationName RunState to verify eligible VMs. 3) Check FabricServiceOE operationName ApiRoutingScanResultProcessor_ProcessAsync with ScannerIdentifier Secrets for specific resourceId. 4) Check FabricTraceEvent for machineId with ScanType=SecretScanResults. For deep investigation use CloudMapV2 on SAW machine (cusornekgresearchprod.centralus / weuornekgresearchprod.westeurope).
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 8: Attack Path
> Sources: mslearn

**1. Attack path analysis page shows empty in Defender for Cloud - no attack paths displayed despite having resources**

- **Root Cause**: Expected behavior after Microsoft updated attack path analysis to focus on real, externally driven and exploitable threats rather than broad scenarios. This change reduces noise.
- **Solution**: This is expected behavior. Ensure: 1) Defender CSPM is enabled with agentless scanning, 2) Resources are properly onboarded, 3) For container attack paths, enable agentless container posture extension or Defender for Containers. If no paths exist, your environment may have good security posture.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 9: Secrets Scanning
> Sources: mslearn

**1. Defender for Cloud secrets scanning not detecting secrets on VMs or cloud deployments - no secrets recommendations or findings**

- **Root Cause**: Secrets scanning requires specific plan enablement: Defender CSPM plan for cloud deployment and code scanning, or Defender for Servers Plan 2 for VM machine scanning. Agentless machine scanning must also be enabled.
- **Solution**: Verify: 1) Defender CSPM plan is enabled for cloud deployment and code scanning, 2) Defender for Servers Plan 2 or DCSPM for VM scanning, 3) Agentless machine scanning is enabled. Check permissions: Security Reader at minimum. Review in asset inventory, recommendations, cloud security explorer, or attack paths.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 10: Ciem
> Sources: mslearn

**1. Defender for Cloud CIEM recommendations not appearing - no identity risk insights or overprovisioned permissions warnings**

- **Root Cause**: CIEM capabilities require the Defender Cloud Security Posture Management (CSPM) plan to be enabled. Without DCSPM, identity analysis, effective permission evaluation, and lateral movement detections are unavailable.
- **Solution**: Enable the Defender CSPM plan. CIEM supports: Microsoft Entra ID users/groups/service principals, AWS IAM users/roles/groups, and GCP IAM users/groups/service accounts. Use Cloud Security Explorer for identities, Attack Path Analysis for lateral movement, and Recommendations for remediation.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer onboarded to Defender CSPM/DCSPM but still sees onboarding experience for Attack Paths | Scope issue or subscription not registered to the CloudPosture/DefenderCspm bundle in the selecte... | Verify onboard status using Kusto query on GetCurrentEnvironmentsPricing table (clusters: mdcenti... | 🟢 8.5 | ADO Wiki |
| 2 | No Attack Paths displayed or Attack Path count decreased to zero (especially after September 2025) | What-Now refinement released September 15, 2025: Attack Paths now only display when entry point i... | Use CloudMapV2.AttackPaths query on cusdefautprepkustoprd.centralus.kusto.windows.net to check if... | 🟢 8.5 | ADO Wiki |
| 3 | Attack Paths show limited permissions content — some nodes do not have context or display incompl... | Three possible causes: 1) Insufficient DCSPM plan for target or entry subscription/security conne... | Check subscription plan via EnvironmentsPricing Kusto table, check environment plan via GetCurren... | 🟢 8.5 | ADO Wiki |
| 4 | Attack Path is visible but no recommendations are shown for the affected resources | Insufficient Defender CSPM plan on the target or entry subscription — attack path spans subscript... | (1) Verify CSPM plan enabled on ALL involved subscriptions using Kusto: cluster('mdcentitystorepr... | 🟢 8.5 | ADO Wiki |
| 5 | Attack Path is visible but no recommendations are shown; resource has an exemption applied | Recommendation exemption at resource or subscription level. Exempting a recommendation does NOT r... | Check for exemptions at resource/subscription level. If exemption is present, absence of recommen... | 🟢 8.5 | ADO Wiki |
| 6 | Customer onboarded Defender CSPM but still sees the onboarding experience / zero Attack Paths | Scope issue — onboarding only applied to some subscriptions; not all relevant subscriptions are r... | (1) Verify onboard status for each subscription: cluster('mdcentitystoreprodus.centralus.kusto.wi... | 🟢 8.5 | ADO Wiki |
| 7 | Customer reports decrease in Attack Path numbers or zero Attack Paths after September 2025 | 'What-Now' refinement released September 15, 2025 — Attack Paths now only displayed when entry po... | Confirm by Kusto query: cluster('cusdefautprepkustoprd.centralus.kusto.windows.net').database('Cl... | 🟢 8.5 | ADO Wiki |
| 8 | Need to access MDC Entity Store Kusto clusters (mdcentitystoreprodus / ascentitystoreprdeu) or At... | MDC Kusto clusters require JIT access to elevated Security Group (MDC-EntityStore-Prod-Viewers) d... | Prerequisites: SAW device + AME account + CSS-IS-MDCKustoAccess AME group membership. JIT request... | 🟢 8.5 | ADO Wiki |
| 9 | DCSPM K8s agentless AgentlessManager service fails to process discoveryData or add MDC IPs to EKS... | AgentlessManager service encounters error during ProcessMessagesAsync; non-ClientError = backend ... | Run Kusto on mdcprd.centralus.kusto.windows.net/Detection Span table filtered by env_cloud_role=a... | 🟢 8.5 | ADO Wiki |
| 10 ⚠️ | MEPM Permissions Management enablement fails in Azure portal - error assigning Reader role to MEP... | Logged-in user lacks permissions to assign Reader role to MEPM first party app (Cloud Infrastruct... | Ask user with Owner/User Access Administrator permissions to enable the extension. If still fails... | 🔵 7.0 | ADO Wiki |
| 11 ⚠️ | Defender for Cloud Recommendation Risk Level not being evaluated or showing as empty for resources | Risk Level (One Queue) requires Defender Cloud Security Posture Management (CSPM) plan to be enab... | 1) Verify Defender CSPM is enabled using Kusto: cluster('Rometelemetrydata').database('RomeTeleme... | 🔵 7.0 | ADO Wiki |
| 12 ⚠️ | Agentless secret scanning results not appearing for Azure VMs or disks - no findings in Defender ... | Multiple possible causes: 1) Defender CSPM not enabled for the subscription (prerequisite). 2) Di... | Diagnose step by step using Kusto queries on cluster romelogs.kusto.windows.net database Rome3Pro... | 🔵 7.0 | ADO Wiki |
| 13 | Customer does not see vulnerability recommendations for WebApp/Azure Function on Windows (App Ser... | The app does not have public access enabled, blocking Defender for Cloud from scanning. | Customer needs to allow the service tag AzureSecurityCenter in the app networking settings (Advan... | 🔵 5.5 | ADO Wiki |
| 14 | Customer does not see vulnerability recommendations for WebApp. Kusto Span table shows Name or se... | The WebApp is running in an App Service Environment (ASE), which is not supported for vulnerabili... | By design limitation. Inform customer that App Service Environment is not supported for serverles... | 🔵 5.5 | ADO Wiki |
| 15 | Customer does not see vulnerability recommendations for Function App on Linux Consumption Plan. S... | Function app runs with deployment package using identity access, which is not supported for vulne... | By design limitation. Deployment package with identity access on Linux Consumption Plan is curren... | 🔵 5.5 | ADO Wiki |
| 16 | Customer does not see vulnerability recommendations for Function App on Flex Consumption Plan. Sp... | Flex Consumption Plan with blobcontainer storage using managed identity (system or user assigned)... | By design limitation. Flex Consumption Plan with blobcontainer + managed identity storage is curr... | 🔵 5.5 | ADO Wiki |
| 17 ⚠️ | Attack path analysis page shows empty in Defender for Cloud - no attack paths displayed despite h... | Expected behavior after Microsoft updated attack path analysis to focus on real, externally drive... | This is expected behavior. Ensure: 1) Defender CSPM is enabled with agentless scanning, 2) Resour... | 🔵 5.0 | MS Learn |
| 18 ⚠️ | Defender for Cloud secrets scanning not detecting secrets on VMs or cloud deployments - no secret... | Secrets scanning requires specific plan enablement: Defender CSPM plan for cloud deployment and c... | Verify: 1) Defender CSPM plan is enabled for cloud deployment and code scanning, 2) Defender for ... | 🔵 5.0 | MS Learn |
| 19 ⚠️ | Defender for Cloud CIEM recommendations not appearing - no identity risk insights or overprovisio... | CIEM capabilities require the Defender Cloud Security Posture Management (CSPM) plan to be enable... | Enable the Defender CSPM plan. CIEM supports: Microsoft Entra ID users/groups/service principals,... | 🔵 5.0 | MS Learn |
