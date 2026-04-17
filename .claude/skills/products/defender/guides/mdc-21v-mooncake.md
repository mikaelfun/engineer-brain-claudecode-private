# DEFENDER 21V/Mooncake 特有问题 — Troubleshooting Quick Reference

**Entries**: 12 | **21V**: 9/12 applicable
**Sources**: ado-wiki, onenote | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/mdc-21v-mooncake.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AzureDefenderFeatureFlagNotEnabled error when deploying or managing Defender sensor on AKS cluste... | Feature flag 'Microsoft.ContainerService/AKS-AzureDefender' is not enabled in Mooncake environmen... | 1) Disable Defender for Containers in MDC portal first. 2) Delete the addon pod deployed in clust... | 🟢 9.0 | OneNote |
| 2 | Cannot disable Azure Policy add-on on AKS cluster from Azure Portal in Mooncake (Azure China) | Portal limitation in Mooncake environment. Known issue tracked by ICM 555841053. | Use CLI as workaround: 'az aks disable-addons --addons azure-policy --name <cluster> --resource-g... | 🟢 9.0 | OneNote |
| 3 | MDC threat detection features missing in Mooncake — customer asks why certain detections (Windows... | These MDC detection features have not been deployed to Mooncake sovereign cloud. Only VMBA Window... | Inform customer of Mooncake detection availability matrix. Available: VMBA alerts (Windows), Linu... | 🟢 9.0 | OneNote |
| 4 | After enabling MDC plans via API/PowerShell in Mooncake (portal onboarding blocked during retirem... | Portal onboarding was blocked in Mooncake retirement. API/PowerShell enablement does not trigger ... | For SQL VM: manually assign initiative policySetDefinitions/d7c3ea3a-edf3-4bd5-bd64-d5b635b05393.... | 🟢 9.0 | OneNote |
| 5 | MDC Defender for Servers P2 features in Mooncake lost after MMA/OMS retirement - MDE (replacement... | MDE has not launched in 21V. Agentless scanning requires Defender Vulnerability Management unavai... | 1) Migrate MMA to AMA+DCR for data collection. 2) Deploy Global MDE via manual script/GPO/global ... | 🟢 9.0 | OneNote |
| 6 | Microsoft Sentinel service in Mooncake (Azure China) is being retired - service and billing stop ... | Product decision to retire Sentinel from Azure China operated by 21Vianet | Customers should disconnect Sentinel from Log Analytics workspace before 2026-08-18 following htt... | 🟢 9.0 | OneNote |
| 7 | Need to change MDC workspace security event collection tier (None/Minimal/Recommended/All) progra... | Portal does not support pre-configuring event collection tier for default workspace. PG has opene... | Use PowerShell with REST API: Connect-AzAccount -Environment azurechinacloud, get access token, t... | 🟢 8.0 | OneNote |
| 8 | Sentinel in Azure China 21Vianet has significant feature gaps vs Global - many connectors, detect... | Features not GA in Azure Global are not deployed to Azure China. Sentinel only available in China... | Check feature availability matrix at https://learn.microsoft.com/en-us/azure/sentinel/feature-ava... | 🔵 7.5 | OneNote |
| 9 | Cannot change workspace security event collection tier via portal in Mooncake - need programmatic... | Portal UI does not support pre-configuring event type for default workspace in Mooncake (known bu... | Use PowerShell REST API: Connect-AzAccount -Environment azurechinacloud, then PUT to management.c... | 🔵 7.0 | OneNote |
| 10 | Need to map between MDE Machine ID and Azure Resource ID for troubleshooting MDE integration, age... |  | ResourceID to MachineID: query cluster('wcdscrubbedservice.kusto.windows.net').database('scrubbed... | 🔵 7.0 | ADO Wiki |
| 11 | Multicloud assessments still visible in MDC after AWS/GCP resource was deleted | Smart aligner requires discovery lookback (12h) + aligner frequency (24h, 8h lookback). SAG-based... | Wait up to 48h. Use Kusto on romemulticloudlogsprd.centralus (RomeMulticloudPrd) for discovery, r... | 🔵 7.0 | ADO Wiki |
| 12 | HTTP 409 conflict creating security connector: another connector with same HierarchyId exists | Pre-existing connector with same HierarchyId on another subscription. Connectors are tenant-wide. | Check for existing connector on different subscription. Remove it or use same subscription. | 🔵 7.0 | ADO Wiki |

## Quick Troubleshooting Path

1. 1) Disable Defender for Containers in MDC portal first. 2) Delete the addon pod deployed in cluster. 3) Use CLI 'az aks disable-addons --addons azure-policy --name <cluster> --resource-group <rg>' ... `[Source: OneNote]`
2. Use CLI as workaround: 'az aks disable-addons --addons azure-policy --name <cluster> --resource-group <rg>' `[Source: OneNote]`
3. Inform customer of Mooncake detection availability matrix. Available: VMBA alerts (Windows), Linux auditd+MMA, SQL DB/DW, Security Incident correlation. All others unavailable. Check Feature Gap li... `[Source: OneNote]`
4. For SQL VM: manually assign initiative policySetDefinitions/d7c3ea3a-edf3-4bd5-bd64-d5b635b05393. For Containers: manually assign policyDefinitions/64def556-fbad-4622-930e-72d1d5589bf5 and policyDe... `[Source: OneNote]`
5. 1) Migrate MMA to AMA+DCR for data collection. 2) Deploy Global MDE via manual script/GPO/global Intune. 3) Batch disable: Set-AzSecurityPricing -Name VirtualMachines -PricingTier Free. 4) Sentinel... `[Source: OneNote]`
