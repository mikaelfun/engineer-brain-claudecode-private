# AKS 外部负载均衡器与 SNAT — aks -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: ado-wiki-aks-networking-known-scenarios.md, ado-wiki-aks-networking-troubleshooting-tools.md
**Generated**: 2026-04-07

---

## Phase 1: UpgradeStrategy_BlueGreen requires an active blue/

### aks-899: AKS node pool rollback fails with OperationNotAllowed: cannot rollback with blue...

**Root Cause**: UpgradeStrategy_BlueGreen requires an active blue/green cycle. If the upgrade already finished or was never started, rollbacks are blocked.

**Solution**:
Resume the original blue/green upgrade or switch the pool to rolling strategy, then issue the rollback.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback)]`

## Phase 2: recentlyUsedVersions is empty, usually because thi

### aks-903: AKS node pool rollback fails with AgentPoolRollbackNoHistory: rollback to node i...

**Root Cause**: recentlyUsedVersions is empty, usually because this pool has never completed a full upgrade.

**Solution**:
Let at least one upgrade finish so history is populated, then retry the rollback.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback)]`

## Phase 3: The (nodeImageVersion, orchestratorVersion) pair r

### aks-907: AKS node pool rollback fails with AgentPoolRollbackVersionNotAllowed: invalid ve...

**Root Cause**: The (nodeImageVersion, orchestratorVersion) pair requested does not match any entry in recentlyUsedVersions.

**Solution**:
Fetch the pool (expand properties.recentlyUsedVersions) and choose an exact pair from that list. Alternatively perform another upgrade to create the pair you need.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback)]`

## Phase 4: The rollback target version pair exists but its ti

### aks-909: AKS node pool rollback fails with AgentPoolRollbackVersionExpired - rollback tar...

**Root Cause**: The rollback target version pair exists but its timestamp is older than 7 days. AKS refuses rollback for safety after this window.

**Solution**:
Roll back to a more recent pair within 7 days, or re-upgrade to refresh history then roll back promptly.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback)]`

## Phase 5: The requested rollback version is more than 3 mino

### aks-911: AKS node pool rollback fails with AgentPoolRollbackVersionNotAllowed: Agent pool...

**Root Cause**: The requested rollback version is more than 3 minors behind the control plane (futureMCVer - futAPVer > 3).

**Solution**:
Pick a rollback target within 3 minor versions of the control-plane version.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS node pool rollback fails with OperationNotAllowed: cannot rollback with blue... | UpgradeStrategy_BlueGreen requires an active blue/green cycl... | Resume the original blue/green upgrade or switch the pool to... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
| 2 | AKS node pool rollback fails with AgentPoolRollbackNoHistory: rollback to node i... | recentlyUsedVersions is empty, usually because this pool has... | Let at least one upgrade finish so history is populated, the... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
| 3 | AKS node pool rollback fails with AgentPoolRollbackVersionNotAllowed: invalid ve... | The (nodeImageVersion, orchestratorVersion) pair requested d... | Fetch the pool (expand properties.recentlyUsedVersions) and ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
| 4 | AKS node pool rollback fails with AgentPoolRollbackVersionExpired - rollback tar... | The rollback target version pair exists but its timestamp is... | Roll back to a more recent pair within 7 days, or re-upgrade... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
| 5 | AKS node pool rollback fails with AgentPoolRollbackVersionNotAllowed: Agent pool... | The requested rollback version is more than 3 minors behind ... | Pick a rollback target within 3 minor versions of the contro... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Agentpool%20Rollback) |
