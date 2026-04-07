# DEFENDER DevOps 安全 — Troubleshooting Quick Reference

**Entries**: 18 | **21V**: 16/18 applicable
**Sources**: ado-wiki | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/defender-devops-security.md)

## Symptom Quick Reference

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
| 17 | Agentless code scanning findings are not appearing or are delayed after enabling the feature on A... | Findings may take up to 1 hour to appear after enabling agentless code scanning. Data refresh occ... | (1) Verify agentless code scanning is enabled on the connector; (2) Wait at least 1 hour for init... | 🔵 7.0 | ADO Wiki |
| 18 | Connector created with agentless code scanning enabled but none or some repositories under the co... | Multiple possible causes: (1) Repository size exceeds 1GB limit; (2) Missing permissions — connec... | Debug using multi-service flow: (1) Scheduler service — check Geneva logs (https://portal.microso... | 🔵 7.0 | ADO Wiki |

## Quick Troubleshooting Path

1. 在 Azure DevOps 中使用 GHAzDO 进行 Secret Scanning；GHAzDO 扫描结果现已在 MDC (Defender for DevOps) 的 Secret Scanning 推荐中展示 `[Source: ADO Wiki]`
2. Navigate to Recommendations blade, select All recommendations, then filter for DevOps recommendations. Findings still surface on the DevOps Security blade separately `[Source: ADO Wiki]`
3. Create a new ADO connector (auto-includes new scopes). Verify same subscription ID used in both GHAzDO and MDC. Check Defender for DevOps user permissions: Advanced Security view alerts and Read mu... `[Source: ADO Wiki]`
4. Verify Tenant ID, Client ID, and Client Secret are correctly set as pipeline environment variables with names GDN_MDC_CLI_TENANT_ID, GDN_MDC_CLI_CLIENT_ID, GDN_MDC_CLI_CLIENT_SECRET. Verify app reg... `[Source: ADO Wiki]`
5. Wait up to 24 hours. If still not showing, collect Client ID, Subscription ID, and UTC pipeline run time. Check App Insights BlobReplicator performance tab to validate E2E flow and verify the corre... `[Source: ADO Wiki]`
