---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Blue Green NodePool Upgrade"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FBlue%20Green%20NodePool%20Upgrade"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Blue Green nodepool upgrade

## Summary

Troubleshooting guide for BlueGreen nodepool upgrades in progress.

## Troubleshooting

### Information for blue-green nodepool upgrade settings

Query AgentPoolSnapshot to understand the current upgrade state:

```kusto
let globalFrom = datetime("2026-03-02T13:25:52.845Z");
let globalTo = datetime("2026-03-03T18:34:36.000Z");
let clusternamespace = "xxxxxxxxxxx";
AgentPoolSnapshot
| where PreciseTimeStamp between (globalFrom .. globalTo)
| where namespace == clusternamespace
| extend p = parse_json(log)
| project PreciseTimeStamp,  p.name, p.count, p.upgradeStrategy, p.upgradeSettingsBlueGreen, p.orchestratorVersion, p.recentlyUsedVersions, p.agentPoolVersionProfile.nodeImageReference.id, p.upgradeSettings
```

Key fields:
* `upgradeStrategy`: 2 = Rolling, 3 = BlueGreen
* `orchestratorVersion`: version to be upgraded
* `recentlyUsedVersions`: Previous version (node image, kubernetes) used
* `upgradeSettingsBlueGreen`: e.g. drainBatchSize, drainTimeout, batchSoakDuration, finalSoakDuration

**Why were green nodes deleted?**

> `recentlyUsedVersions.timestampUsed.seconds + ((batchSoakDurationInMinutes X node count) + finalSoakDurationInMinutes) * 60 = <deletion time for green nodes>`

### How blue-green nodepool upgrade works

Use the following Kusto query to trace the upgrade flow:

```kusto
union FrontEndContextActivity, AsyncContextActivity 
| where subscriptionID == "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx"
| where PreciseTimeStamp > ago(1h)
| extend message = msg
| extend lineNumber = coalesce(lineNumber, 0)
| extend logPreciseTime = todatetime(logPreciseTime)
| extend pathParts = split(fileName, "/aks/rp/") 
| extend path = tostring(pathParts[-1])
| extend fileName = tostring(split(fileName, "/")[-1])
| where fileName in ("vmssmodelbluegreenupgradedetector.go", "vmssinstancesbluegreenupgrader.go")
| project-reorder logPreciseTime, message, fileName, path, lineNumber
```

### GreenNodeAndVmCountMismatch Error

If a `GreenNodeAndVmCountMismatch` error occurs, check the logs above for output like:

```text
VM aks-bgnp1-18115899-vmss00000F is a blue node
VM aks-bgnp1-18115899-vmss00000G is a green node
[Unexpected] Kubernetes has 4 green nodes but only 0 green VMs found in VMSS, which is less than required green nodes (4).
Failed to surge green nodes: Category: InternalError; Code: Conflict; SubCode: GreenNodeAndVmCountMismatch; Message: Kubernetes has 4 green nodes but only 0 green VMs found in VMSS, which is less than required green nodes (4)
```

If this error is confirmed, open an IcM incident.

## Owner and Contributors

**Owner:** Jacob Baek <jacobbaek@microsoft.com>
