# DEFENDER 21V/Mooncake 特有问题 — Comprehensive Troubleshooting Guide

**Entries**: 12 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: onenote-mooncake-security-component-status.md, onenote-sentinel-feature-gap-mooncake.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Workspace
> Sources: onenote

**1. Need to change MDC workspace security event collection tier (None/Minimal/Recommended/All) programmatically for Mooncake subscription**

- **Root Cause**: Portal does not support pre-configuring event collection tier for default workspace. PG has opened a bug but no ETA for fix.
- **Solution**: Use PowerShell with REST API: Connect-AzAccount -Environment azurechinacloud, get access token, then PUT to https://management.chinacloudapi.cn/subscriptions/{subId}/providers/Microsoft.Security/policies/default/securityEventCollection/defaultSecurityEventCollection?api-version=2015-06-01-preview with body {"properties":{"Tier":"All|Recommended|Minimal|None"}}
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.0/10 — OneNote]`

**2. Cannot change workspace security event collection tier via portal in Mooncake - need programmatic method**

- **Root Cause**: Portal UI does not support pre-configuring event type for default workspace in Mooncake (known bug, no ETA)
- **Solution**: Use PowerShell REST API: Connect-AzAccount -Environment azurechinacloud, then PUT to management.chinacloudapi.cn/.../securityEventCollection/defaultSecurityEventCollection?api-version=2015-06-01-preview with body {properties:{Tier:'All|Recommended|Minimal|None'}}
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.0/10 — OneNote]`

### Phase 2: Multi Cloud
> Sources: ado-wiki

**1. Multicloud assessments still visible in MDC after AWS/GCP resource was deleted**

- **Root Cause**: Smart aligner requires discovery lookback (12h) + aligner frequency (24h, 8h lookback). SAG-based depends on discovery + assessment generation frequency.
- **Solution**: Wait up to 48h. Use Kusto on romemulticloudlogsprd.centralus (RomeMulticloudPrd) for discovery, romecore.kusto.windows.net (Prod) AssessmentLifeCycle for publishing.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

**2. HTTP 409 conflict creating security connector: another connector with same HierarchyId exists**

- **Root Cause**: Pre-existing connector with same HierarchyId on another subscription. Connectors are tenant-wide.
- **Solution**: Check for existing connector on different subscription. Remove it or use same subscription.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

### Phase 3: Defender For Containers
> Sources: onenote

**1. AzureDefenderFeatureFlagNotEnabled error when deploying or managing Defender sensor on AKS cluster in Mooncake (Azure China)**

- **Root Cause**: Feature flag 'Microsoft.ContainerService/AKS-AzureDefender' is not enabled in Mooncake environment, preventing Defender sensor installation via normal flow
- **Solution**: 1) Disable Defender for Containers in MDC portal first. 2) Delete the addon pod deployed in cluster. 3) Use CLI 'az aks disable-addons --addons azure-policy --name <cluster> --resource-group <rg>' as workaround.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 4: Aks
> Sources: onenote

**1. Cannot disable Azure Policy add-on on AKS cluster from Azure Portal in Mooncake (Azure China)**

- **Root Cause**: Portal limitation in Mooncake environment. Known issue tracked by ICM 555841053.
- **Solution**: Use CLI as workaround: 'az aks disable-addons --addons azure-policy --name <cluster> --resource-group <rg>'
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 5: Mooncake
> Sources: onenote

**1. MDC threat detection features missing in Mooncake — customer asks why certain detections (Windows Defender ATP, crash dump, fileless attack, Azure network/management layer, Key Vault, App Service, Con**

- **Root Cause**: These MDC detection features have not been deployed to Mooncake sovereign cloud. Only VMBA Windows Event Logs alerts, Linux auditd+MMA alerts, SQL Database/DW, and Security Incident correlation are available.
- **Solution**: Inform customer of Mooncake detection availability matrix. Available: VMBA alerts (Windows), Linux auditd+MMA, SQL DB/DW, Security Incident correlation. All others unavailable. Check Feature Gap list for roadmap updates.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 6: Mdc
> Sources: onenote

**1. After enabling MDC plans via API/PowerShell in Mooncake (portal onboarding blocked during retirement), Azure portal shows incomplete configuration - SQL VM and Container plan policy assignments not au**

- **Root Cause**: Portal onboarding was blocked in Mooncake retirement. API/PowerShell enablement does not trigger automatic policy assignment creation. SQL server on machines policy initiative does not exist in Mooncake. Container plan Arc-related policies do not exist in Mooncake.
- **Solution**: For SQL VM: manually assign initiative policySetDefinitions/d7c3ea3a-edf3-4bd5-bd64-d5b635b05393. For Containers: manually assign policyDefinitions/64def556-fbad-4622-930e-72d1d5589bf5 and policyDefinitions/a8eff44f-8c92-45c3-a3fb-9880802d67a7. Use API version 2023-01-01 for Mooncake.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 7: Defender For Servers
> Sources: onenote

**1. MDC Defender for Servers P2 features in Mooncake lost after MMA/OMS retirement - MDE (replacement) not available in 21V, agentless scanning requires unavailable MDVM**

- **Root Cause**: MDE has not launched in 21V. Agentless scanning requires Defender Vulnerability Management unavailable in 21V. All Defender for Servers features were designed to migrate to MDE + agentless but neither available in Mooncake.
- **Solution**: 1) Migrate MMA to AMA+DCR for data collection. 2) Deploy Global MDE via manual script/GPO/global Intune. 3) Batch disable: Set-AzSecurityPricing -Name VirtualMachines -PricingTier Free. 4) Sentinel integration with global MDE via Graph Security API + Sentinel API bridge.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 8: Retire
> Sources: onenote

**1. Microsoft Sentinel service in Mooncake (Azure China) is being retired - service and billing stop on 2026-08-18**

- **Root Cause**: Product decision to retire Sentinel from Azure China operated by 21Vianet
- **Solution**: Customers should disconnect Sentinel from Log Analytics workspace before 2026-08-18 following https://learn.microsoft.com/en-us/azure/sentinel/offboard. Log Analytics costs continue if workspace remains active after Sentinel disconnection. Migration guide: https://docs.azure.cn/zh-cn/sentinel/migration
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

### Phase 9: Feature Gap
> Sources: onenote

**1. Sentinel in Azure China 21Vianet has significant feature gaps vs Global - many connectors, detections, threat intelligence features unavailable**

- **Root Cause**: Features not GA in Azure Global are not deployed to Azure China. Sentinel only available in China East 2 region. Many third-party connectors not available.
- **Solution**: Check feature availability matrix at https://learn.microsoft.com/en-us/azure/sentinel/feature-availability. Available in MC: Automation rules, Entity insights, Fusion (basic), Notebooks, Watchlists, Hunting, ASIM, and select Azure connectors (Activity, AAD, MDC, Firewall, Key Vault, AKS, SQL, WAF, Syslog, Cisco ASA, Office 365, Windows Security Events). NOT available: Threat Intelligence (TAXII/TIP), Content Hub, M365 Defender integration, Ransomware/ML detections, most third-party connectors.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — OneNote]`

### Phase 10: Mde Integration
> Sources: ado-wiki

**1. Need to map between MDE Machine ID and Azure Resource ID for troubleshooting MDE integration, agentless scanning, or TVM issues**

- **Solution**: ResourceID to MachineID: query cluster('wcdscrubbedservice.kusto.windows.net').database('scrubbeddata').MachineInfoEvents where DeviceTagsAsJson contains hash_sha1(tolower(resourceId)). MachineID to ResourceID: query MachineInfoEvents via wcdprod cluster, parse AdditionalFields for Name=='AzureResourceId'. Requires TM-MDATP-Support permissions via MyAccess.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 7.0/10 — ADO Wiki]`

---

## Known Issues Reference

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
| 10 ⚠️ | Need to map between MDE Machine ID and Azure Resource ID for troubleshooting MDE integration, age... |  | ResourceID to MachineID: query cluster('wcdscrubbedservice.kusto.windows.net').database('scrubbed... | 🔵 7.0 | ADO Wiki |
| 11 ⚠️ | Multicloud assessments still visible in MDC after AWS/GCP resource was deleted | Smart aligner requires discovery lookback (12h) + aligner frequency (24h, 8h lookback). SAG-based... | Wait up to 48h. Use Kusto on romemulticloudlogsprd.centralus (RomeMulticloudPrd) for discovery, r... | 🔵 7.0 | ADO Wiki |
| 12 ⚠️ | HTTP 409 conflict creating security connector: another connector with same HierarchyId exists | Pre-existing connector with same HierarchyId on another subscription. Connectors are tenant-wide. | Check for existing connector on different subscription. Remove it or use same subscription. | 🔵 7.0 | ADO Wiki |
