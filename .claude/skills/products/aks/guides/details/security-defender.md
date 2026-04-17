# AKS Microsoft Defender -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-tcpdump-using-sidecar-containers.md, mslearn-avoid-running-as-root-containers.md
**Generated**: 2026-04-07

---

## Phase 1: Deleting the Defender-correlated Log Analytics wor

### aks-068: After deleting Log Analytics workspace associated with AKS Defender sensor then ...

**Root Cause**: Deleting the Defender-correlated Log Analytics workspace causes AKS cluster to lose ARM resource references upon restart. Without restart only Metrics and Defender pod errors occur.

**Solution**:
Before restarting AKS: disable monitoring addon or recreate exact same workspace. For Defender: az aks update --disable-defender then --enable-defender with --defender-config JSON. If already restarted, engage PG for recovery.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Log Analytics Workspace (LAW) referenced by AKS ad

### aks-958: AKS operations (scale/update/upgrade) fail with 'Unable to get log analytics wor...

**Root Cause**: Log Analytics Workspace (LAW) referenced by AKS addon (Container Insights, OMSAgent, or Azure Defender) has been deleted or is inaccessible. Error message misleadingly blames the monitoring addon even when Defender is the actual consumer.

**Solution**:
1) In ASC main cluster view, search LAW resource ID to identify which component uses it; 2) Option A: Disable/re-enable Defender: az aks update --disable-defender then --enable-defender; 3) Option B: Update in-place with existing LAW via config.json; 4) If LAW is for OMSAgent, see separate TSG.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperation%20fails%20due%20to%20missing%20Log%20Analytics%20workspace)]`

## Phase 3: AKS Defender Profile is a feature gap in Mooncake 

### aks-153: Attempting to enable AKS Defender Profile in Mooncake (Azure China) fails; featu...

**Root Cause**: AKS Defender Profile is a feature gap in Mooncake (China) cloud; the security profile is not supported

**Solution**:
Inform customer this is a known feature gap in Mooncake. Check latest feature availability for updates

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Feature flag Microsoft.ContainerService/AKS-AzureD

### aks-154: AKS operation fails with error AzureDefenderFeatureFlagNotEnabled: AzureDefender...

**Root Cause**: Feature flag Microsoft.ContainerService/AKS-AzureDefender is not registered/enabled in the subscription or region

**Solution**:
Disable the defender addon: 1) Disable in MDC settings; 2) Delete addon pods; or use CLI: az aks disable-addons --addons azure-policy as workaround

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: PG bug - CLI does not clean up Defender CRDs durin

### aks-155: After removing Defender sensor from AKS cluster, CRDs (policies.defender.microso...

**Root Cause**: PG bug - CLI does not clean up Defender CRDs during sensor removal

**Solution**:
Manually delete CRDs: kubectl delete crd policies.defender.microsoft.com runtimepolicies.defender.microsoft.com (safe). PG fixing CLI. Ref: ICM 555510090

`[Score: [B] 7.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 6: Microsoft Defender for cloud-native security agent

### aks-002: AzureDefender installation fails with error 'AzureDefenderFeatureFlagNotEnabled'...

**Root Cause**: Microsoft Defender for cloud-native security agent (Defender for Containers/AKS security profile) is not enabled in Azure China. Feature flag Microsoft.ContainerService/AKS-AzureDefender is not available.

**Solution**:
Defender for Containers addon is not supported in 21V. Use Azure Policy addon (az aks disable-addons --addons azure-policy) as a partial workaround for policy enforcement. Manually delete leftover CRDs (policies.defender.microsoft.com, runtimepolicies.defender.microsoft.com) if needed after disabling.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 6.0 | Source: [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: Defender for AKS had partial rollout in Mooncake; 

### aks-117: Cannot disable Microsoft Defender for Containers auto-provisioning in Mooncake; ...

**Root Cause**: Defender for AKS had partial rollout in Mooncake; disable auto-provision feature not fully implemented

**Solution**:
Try Azure CLI: az security auto-provisioning-setting update. If blocked, engage PG via ICM for Mooncake-specific Defender configuration.

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 8: Security alert raised by Microsoft Defender for Cl

### aks-514: Customer receives Microsoft Defender for Cloud security alert for AKS cluster an...

**Root Cause**: Security alert raised by Microsoft Defender for Cloud (or other security tools) - not an AKS issue but a security product alert

**Solution**:
Identify which product raised the alert and transfer the case to the corresponding team (usually "MSaaS Security - Infrastructure Solutions" for Microsoft Defender for Cloud alerts). For forensic support: Windows - EngageIR CSS-Security, Linux - Cybersecurity Solutions Group. Note: Microsoft Incident Response involves extra costs - check with TA before engaging CSAM.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FMicrosoft%20Defender%20for%20Cloud%20Alerts)]`

## Phase 9: Log Analytics Workspace referenced by AKS addon ha

### aks-760: AKS operations fail with Unable to get log analytics workspace info ResourceNotF...

**Root Cause**: Log Analytics Workspace referenced by AKS addon has been deleted or is inaccessible. AKS pre-flight validates LAW existence, blocking all operations when LAW missing.

**Solution**:
Identify which component references missing LAW in ASC. For Defender: az aks update --disable-defender then --enable-defender. For monitoring addon: disable via https://aka.ms/aks-disable-monitoring-addon or re-create LAW and update addon config.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperation%20fails%20due%20to%20missing%20Log%20Analytics%20workspace)]`

## Phase 10: LAW referenced by monitoring addon, OMSAgent, or A

### aks-761: AKS operations fail with ResourceNotFound: Unable to get log analytics workspace...

**Root Cause**: LAW referenced by monitoring addon, OMSAgent, or Azure Defender has been deleted or is inaccessible.

**Solution**:
1) In ASC, identify which component uses the LAW. 2) Defender-linked: az aks update --disable-defender then --enable-defender. 3) OMSAgent-linked: disable monitoring addon, re-enable with valid LAW. 4) Custom LAW: use --defender-config with logAnalyticsWorkspaceResourceID.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperation%20fails%20due%20to%20missing%20Log%20Analytics%20workspace)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After deleting Log Analytics workspace associated with AKS Defender sensor then ... | Deleting the Defender-correlated Log Analytics workspace cau... | Before restarting AKS: disable monitoring addon or recreate ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS operations (scale/update/upgrade) fail with 'Unable to get log analytics wor... | Log Analytics Workspace (LAW) referenced by AKS addon (Conta... | 1) In ASC main cluster view, search LAW resource ID to ident... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperation%20fails%20due%20to%20missing%20Log%20Analytics%20workspace) |
| 3 | Attempting to enable AKS Defender Profile in Mooncake (Azure China) fails; featu... | AKS Defender Profile is a feature gap in Mooncake (China) cl... | Inform customer this is a known feature gap in Mooncake. Che... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | AKS operation fails with error AzureDefenderFeatureFlagNotEnabled: AzureDefender... | Feature flag Microsoft.ContainerService/AKS-AzureDefender is... | Disable the defender addon: 1) Disable in MDC settings; 2) D... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | After removing Defender sensor from AKS cluster, CRDs (policies.defender.microso... | PG bug - CLI does not clean up Defender CRDs during sensor r... | Manually delete CRDs: kubectl delete crd policies.defender.m... | [B] 7.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 6 | AzureDefender installation fails with error 'AzureDefenderFeatureFlagNotEnabled'... | Microsoft Defender for cloud-native security agent (Defender... | Defender for Containers addon is not supported in 21V. Use A... | [B] 6.0 | [21v-gap: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | Cannot disable Microsoft Defender for Containers auto-provisioning in Mooncake; ... | Defender for AKS had partial rollout in Mooncake; disable au... | Try Azure CLI: az security auto-provisioning-setting update.... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 8 | Customer receives Microsoft Defender for Cloud security alert for AKS cluster an... | Security alert raised by Microsoft Defender for Cloud (or ot... | Identify which product raised the alert and transfer the cas... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FMicrosoft%20Defender%20for%20Cloud%20Alerts) |
| 9 | AKS operations fail with Unable to get log analytics workspace info ResourceNotF... | Log Analytics Workspace referenced by AKS addon has been del... | Identify which component references missing LAW in ASC. For ... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperation%20fails%20due%20to%20missing%20Log%20Analytics%20workspace) |
| 10 | AKS operations fail with ResourceNotFound: Unable to get log analytics workspace... | LAW referenced by monitoring addon, OMSAgent, or Azure Defen... | 1) In ASC, identify which component uses the LAW. 2) Defende... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FOperation%20fails%20due%20to%20missing%20Log%20Analytics%20workspace) |
