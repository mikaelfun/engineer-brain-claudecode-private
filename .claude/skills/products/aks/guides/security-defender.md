# AKS Microsoft Defender -- Quick Reference

**Sources**: 3 | **21V**: Partial | **Entries**: 10
**Last updated**: 2026-04-06

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: Before restarting AKS: disable monitoring addon or recreate exact same workspace `[source: onenote]`
2. Check: 1) In ASC main cluster view, search LAW resource ID to identify which component uses it; 2) Option A `[source: ado-wiki]`
3. Check: Inform customer this is a known feature gap in Mooncake `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/security-defender.md)
