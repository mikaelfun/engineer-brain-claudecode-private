# DEFENDER DevOps 安全 — Comprehensive Troubleshooting Guide

**Entries**: 18 | **Draft sources**: 5 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-agentless-code-scanning-tsg.md, ado-wiki-a-agentless-secret-scanning-tsg.md, ado-wiki-a-devops-hardening-r2.md, ado-wiki-a-overview-of-defender-for-devops.md, ado-wiki-a-support-boundaries-ghazdo-r2.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Devops Security
> Sources: ado-wiki

**1. DevOps recommendations not visible on the DevOps Security blade after migration to new DevOps sources (AzureDevOps, GitHub, GitLab)**

- **Root Cause**: DevOps recommendations were migrated to new DevOps sources and moved to the All recommendations blade within Recommendations
- **Solution**: Navigate to Recommendations blade, select All recommendations, then filter for DevOps recommendations. Findings still surface on the DevOps Security blade separately
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. GHAzDO (GitHub Advanced Security for Azure DevOps) findings not visible in Microsoft Defender for Cloud despite having both products**

- **Root Cause**: ADO connector created before June 2024 lacks new scopes required for GHAzDO integration, or user permissions for Advanced Security view alerts and Read are set to Deny/Not set instead of Allow
- **Solution**: Create a new ADO connector (auto-includes new scopes). Verify same subscription ID used in both GHAzDO and MDC. Check Defender for DevOps user permissions: Advanced Security view alerts and Read must be set to Allow (check Inheritance toggle)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. MSDO CLI authentication fails - log line MDC Authenticated to Microsoft Defender for Cloud not appearing in pipeline output**

- **Root Cause**: Environment variables for authentication (GDN_MDC_CLI_TENANT_ID, GDN_MDC_CLI_CLIENT_ID, GDN_MDC_CLI_CLIENT_SECRET) are incorrect or missing in the pipeline configuration
- **Solution**: Verify Tenant ID, Client ID, and Client Secret are correctly set as pipeline environment variables with names GDN_MDC_CLI_TENANT_ID, GDN_MDC_CLI_CLIENT_ID, GDN_MDC_CLI_CLIENT_SECRET. Verify app registration has necessary permissions in Entra ID
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. MSDO CLI scan results not showing in MDC after pipeline run - container correlation data missing**

- **Root Cause**: Expected delay of up to 24 hours for results to be correlated with monitored containers. CI/CD pipeline group data is available almost immediately
- **Solution**: Wait up to 24 hours. If still not showing, collect Client ID, Subscription ID, and UTC pipeline run time. Check App Insights BlobReplicator performance tab to validate E2E flow and verify the correct subscription ID in resource ID
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**5. Defender for Cloud CLI authentication fails during pipeline run**

- **Root Cause**: Environment variables DEFENDER_TENANT_ID, DEFENDER_CLIENT_ID, and DEFENDER_CLIENT_SECRET are incorrect or missing
- **Solution**: Update pipeline secrets with correct Tenant ID, Client ID, and Client Secret. Validate values against Azure AD app registration
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**6. Defender for Cloud CLI container scan fails with errors**

- **Root Cause**: Container image is not reachable from the pipeline environment, or image reference name is incorrect
- **Solution**: Verify the image is accessible (test with docker pull). Use variable names for image references as best practice. Validate image availability before scanning
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**7. Endor Labs XSPM connector shows unhealthy status on portal**

- **Root Cause**: 403 = incorrect Endor credentials; 404 = wrong namespace in API endpoint; other errors may indicate server-side issues
- **Solution**: For 403: provide correct Endor key ID and secret. For 404: verify correct namespace in connector creation. For other errors: check Scuba logs in Geneva (DGrep ScubaSFASIProd TraceEvent, filter by rule ID). If Scuba logs fine but status unhealthy, escalate to XSPM team
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**8. Endor Labs connector is healthy but no data appears in the UX portal**

- **Root Cause**: Data pipeline issue: Scuba may have failed to forward results to EventHub, or global router/graph builder processing may have failed
- **Solution**: 1. Get rule ID via GET connectors API. 2. Check Scuba logs in Geneva (filter by rule ID). 3. If Scuba OK, check global router App Insights. 4. If rule creation issue, escalate to XSPM team. 5. If global router/graph builder issue, escalate to DevOps Security PG
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**9. ADO connector created with correct permissions but no repos appear on DevOps Security blade**

- **Root Cause**: Multiple Azure identities logged in; incorrect identity used for connector authentication
- **Solution**: Log out other identities or use private browser window; re-authorize connector; verify via Selected existing organizations dropdown that orgs are visible; re-select All existing and future organizations before saving
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**10. Error creating ADO connector: TF400813 The user is not authorized / ResourceOperationFailure**

- **Root Cause**: Third-party application access via OAuth is disabled in Azure DevOps organization security policies
- **Solution**: In Azure DevOps: Organization Settings > Security > Policies > toggle ON Third-party application access via OAuth; retry connector deployment
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**11. GitHub Advanced Security for Azure DevOps (GHAzDO) findings not showing in Defender for Cloud recommendations**

- **Root Cause**: Subscription mismatch between GHAzDO and MDC; or ADO connector created before June scope update lacks GHAzDO scopes; or user permissions (Advanced Security: view alerts) set to Not set/Deny
- **Solution**: 1) Verify same Subscription ID for GHAzDO and MDC; 2) Create new ADO connector for updated scopes if connector pre-dates June update; 3) Ensure user permissions have Advanced Security: view alerts and Read set to Allow (check Inheritance toggle)
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 2: Msdo Cli
> Sources: ado-wiki

**1. MSDO CLI shows Missing token fetch permission to send results to Microsoft Defender for Cloud in pipeline logs**

- **Root Cause**: On GitHub, the repository is not properly onboarded to the DevOps connector
- **Solution**: Verify connector onboarding completed properly for the repository; check connector status in MDC DevOps Security blade
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. MSDO CLI scan results not appearing in MDC after successful push (MDC: Security findings pushed successfully seen in logs)**

- **Root Cause**: Data ingestion delay: container correlation can take up to 24 hours; or backend processing failure in BlobReplicator pipeline
- **Solution**: Wait up to 24 hours for data correlation; if still missing, collect Client ID, Subscription ID, UTC pipeline run time; investigate via App Insights BlobReplicator E2E trace; validate resource ID contains correct subscription
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Agentless Code Scanning
> Sources: ado-wiki

**1. Agentless code scanning findings are not appearing or are delayed after enabling the feature on Azure DevOps or GitHub connector in Defender for Cloud**

- **Root Cause**: Findings may take up to 1 hour to appear after enabling agentless code scanning. Data refresh occurs daily when enabled. Scanning covers the default (main) branch only, and repositories must be under 1GB.
- **Solution**: (1) Verify agentless code scanning is enabled on the connector; (2) Wait at least 1 hour for initial findings; (3) If findings still missing after several hours, check the DfD Agentless dashboard (https://dataexplorer.azure.com/dashboards/3107308e-4675-4bf3-925a-9ecdad498d56) to verify scheduling and scan status; (4) Escalate with verification of enablement status if delays persist beyond expected timeframe.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. Connector created with agentless code scanning enabled but none or some repositories under the connector are being processed or scanned**

- **Root Cause**: Multiple possible causes: (1) Repository size exceeds 1GB limit; (2) Missing permissions — connector lacks correct access to ADO APIs (forbidden error); (3) Connector not properly onboarded to agentless feature; (4) Preparation service or Phoenix scanning platform failures.
- **Solution**: Debug using multi-service flow: (1) Scheduler service — check Geneva logs (https://portal.microsoftgeneva.com/s/80C76EC3) to verify connector is being processed; (2) Preparation service — check for exceptions by repo/connector ID (https://portal.microsoftgeneva.com/s/53DC5CB2), verify TriggerPhoenixScan terminal state; (3) Phoenix service — query romeeus/romeuksouth Kusto clusters for Phoenix_Assessments_LifeCycleEvents to check scan success; (4) Sarif service — check processing status (https://portal.microsoftgeneva.com/s/FB0A7086). For repos > 1GB: known limitation, no workaround.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 4: Defender For Devops
> Sources: ado-wiki

**1. Azure DevOps 中 MSDO 扩展的 Secret Scanning 结果消失或不再更新，或对两套 secret scanning 方案（MSDO vs GHAzDO）感到困惑**

- **Root Cause**: MSDO secret scanning 已于 2023-09-20 正式弃用；从该日期起 Azure DevOps 统一使用 GHAzDO 作为唯一 Secret Scanning 方案
- **Solution**: 在 Azure DevOps 中使用 GHAzDO 进行 Secret Scanning；GHAzDO 扫描结果现已在 MDC (Defender for DevOps) 的 Secret Scanning 推荐中展示
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Endor Labs
> Sources: ado-wiki

**1. Failed to create Endor Labs XSPM connector via MDC UI**

- **Root Cause**: Payload format incorrect (missing trailing slash in Endpoint URL), wrong Endor credentials, or duplicate connector exists (one per tenant limit)
- **Solution**: Verify POST payload: ensure Endpoint URL has trailing slash; check Endor key ID and secret; check for existing connector via GET /connectors?tenantId=<id>; if 500 error, escalate to XSPM team
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 6: Agentless Scanning
> Sources: ado-wiki

**1. Agentless secret scanning results not appearing for VMs or deployment templates (ARM/multi-cloud). Secrets detected by disk scanning not showing in recommendations or security graph. Control plane sec**

- **Root Cause**: Pipeline failure in one of: (1) Azure/Multi-Cloud Discovery Service not collecting resource payloads to EntityStore; (2) Control Plane Data Analysis (CPDA) backend not running secret scanning engine on collected payloads; (3) DiskScanningResultProcessor (DSRP) not reporting results to Assessments Modeller and CloudMap. For Azure: only template parameters, outputs, and tags are scanned (not ARM template content). For AWS: template content + outputs + tags + parameters are scanned. Prerequisites: CSPM enabled (Azure); Reader role with cloudformation:DescribeStacks and GetTemplate (AWS).
- **Solution**: Diagnose step-by-step with Kusto on romelogs: 1) Verify disk scanning enabled: DiskScanningVmScanners where SubscriptionId=X. 2) Check eligible machines: FabricServiceOE where applicationName endswith DiskScanningApp, operationName endswith RunState, customData has subscriptionId. 3) Verify scan results sent to DSRP: FabricServiceOE where operationName=IfxSchemaOps.ApiRoutingScanResultProcessor_ProcessAsync, Data.ScannerIdentifier=Secrets, Data.ScannedResourceId=resourceID. 4) Confirm DSRP processing: FabricTraceEvent where message contains machineId and ScanType=SecretScanResults. 5) Deep dive (SAW/AME): query CloudMap GetEdgesV2AllTenantsAllScopes on cusornekgresearchprod.centralus or weuornekgresearchprod.westeurope, filter SourceNodeLabel=microsoft.compute/virtualmachines. Secrets dashboard: ADX 186bd8fe.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure DevOps 中 MSDO 扩展的 Secret Scanning 结果消失或不再更新，或对两套 secret scanning 方案（MSDO vs GHAzDO）感到困惑 | MSDO secret scanning 已于 2023-09-20 正式弃用；从该日期起 Azure DevOps 统一使用 GHAzDO 作为唯一 Secret Scanning 方案 | 在 Azure DevOps 中使用 GHAzDO 进行 Secret Scanning；GHAzDO 扫描结果现已在 MDC (Defender for DevOps) 的 Secret Sc... | 🟢 8.5 | ADO Wiki |
| 2 | DevOps recommendations not visible on the DevOps Security blade after migration to new DevOps sou... | DevOps recommendations were migrated to new DevOps sources and moved to the All recommendations b... | Navigate to Recommendations blade, select All recommendations, then filter for DevOps recommendat... | 🟢 8.5 | ADO Wiki |
| 3 | GHAzDO (GitHub Advanced Security for Azure DevOps) findings not visible in Microsoft Defender for... | ADO connector created before June 2024 lacks new scopes required for GHAzDO integration, or user ... | Create a new ADO connector (auto-includes new scopes). Verify same subscription ID used in both G... | 🟢 8.5 | ADO Wiki |
| 4 | MSDO CLI authentication fails - log line MDC Authenticated to Microsoft Defender for Cloud not ap... | Environment variables for authentication (GDN_MDC_CLI_TENANT_ID, GDN_MDC_CLI_CLIENT_ID, GDN_MDC_C... | Verify Tenant ID, Client ID, and Client Secret are correctly set as pipeline environment variable... | 🟢 8.5 | ADO Wiki |
| 5 | MSDO CLI scan results not showing in MDC after pipeline run - container correlation data missing | Expected delay of up to 24 hours for results to be correlated with monitored containers. CI/CD pi... | Wait up to 24 hours. If still not showing, collect Client ID, Subscription ID, and UTC pipeline r... | 🟢 8.5 | ADO Wiki |
| 6 | Defender for Cloud CLI authentication fails during pipeline run | Environment variables DEFENDER_TENANT_ID, DEFENDER_CLIENT_ID, and DEFENDER_CLIENT_SECRET are inco... | Update pipeline secrets with correct Tenant ID, Client ID, and Client Secret. Validate values aga... | 🟢 8.5 | ADO Wiki |
| 7 | Defender for Cloud CLI container scan fails with errors | Container image is not reachable from the pipeline environment, or image reference name is incorrect | Verify the image is accessible (test with docker pull). Use variable names for image references a... | 🟢 8.5 | ADO Wiki |
| 8 | Endor Labs XSPM connector shows unhealthy status on portal | 403 = incorrect Endor credentials; 404 = wrong namespace in API endpoint; other errors may indica... | For 403: provide correct Endor key ID and secret. For 404: verify correct namespace in connector ... | 🟢 8.5 | ADO Wiki |
| 9 | Endor Labs connector is healthy but no data appears in the UX portal | Data pipeline issue: Scuba may have failed to forward results to EventHub, or global router/graph... | 1. Get rule ID via GET connectors API. 2. Check Scuba logs in Geneva (filter by rule ID). 3. If S... | 🟢 8.5 | ADO Wiki |
| 10 | ADO connector created with correct permissions but no repos appear on DevOps Security blade | Multiple Azure identities logged in; incorrect identity used for connector authentication | Log out other identities or use private browser window; re-authorize connector; verify via Select... | 🟢 8.5 | ADO Wiki |
| 11 | Error creating ADO connector: TF400813 The user is not authorized / ResourceOperationFailure | Third-party application access via OAuth is disabled in Azure DevOps organization security policies | In Azure DevOps: Organization Settings > Security > Policies > toggle ON Third-party application ... | 🟢 8.5 | ADO Wiki |
| 12 | GitHub Advanced Security for Azure DevOps (GHAzDO) findings not showing in Defender for Cloud rec... | Subscription mismatch between GHAzDO and MDC; or ADO connector created before June scope update l... | 1) Verify same Subscription ID for GHAzDO and MDC; 2) Create new ADO connector for updated scopes... | 🟢 8.5 | ADO Wiki |
| 13 | MSDO CLI shows Missing token fetch permission to send results to Microsoft Defender for Cloud in ... | On GitHub, the repository is not properly onboarded to the DevOps connector | Verify connector onboarding completed properly for the repository; check connector status in MDC ... | 🟢 8.5 | ADO Wiki |
| 14 | MSDO CLI scan results not appearing in MDC after successful push (MDC: Security findings pushed s... | Data ingestion delay: container correlation can take up to 24 hours; or backend processing failur... | Wait up to 24 hours for data correlation; if still missing, collect Client ID, Subscription ID, U... | 🟢 8.5 | ADO Wiki |
| 15 | Failed to create Endor Labs XSPM connector via MDC UI | Payload format incorrect (missing trailing slash in Endpoint URL), wrong Endor credentials, or du... | Verify POST payload: ensure Endpoint URL has trailing slash; check Endor key ID and secret; check... | 🟢 8.5 | ADO Wiki |
| 16 | Agentless secret scanning results not appearing for VMs or deployment templates (ARM/multi-cloud)... | Pipeline failure in one of: (1) Azure/Multi-Cloud Discovery Service not collecting resource paylo... | Diagnose step-by-step with Kusto on romelogs: 1) Verify disk scanning enabled: DiskScanningVmScan... | 🟢 8.5 | ADO Wiki |
| 17 ⚠️ | Agentless code scanning findings are not appearing or are delayed after enabling the feature on A... | Findings may take up to 1 hour to appear after enabling agentless code scanning. Data refresh occ... | (1) Verify agentless code scanning is enabled on the connector; (2) Wait at least 1 hour for init... | 🔵 7.0 | ADO Wiki |
| 18 ⚠️ | Connector created with agentless code scanning enabled but none or some repositories under the co... | Multiple possible causes: (1) Repository size exceeds 1GB limit; (2) Missing permissions — connec... | Debug using multi-service flow: (1) Scheduler service — check Geneva logs (https://portal.microso... | 🔵 7.0 | ADO Wiki |
