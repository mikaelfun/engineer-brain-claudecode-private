# AKS 内部负载均衡器 — general — 排查工作流

**来源草稿**: ado-wiki-aks-restrict-ingress-loadbalancersourceranges.md, ado-wiki-b-Blue-Green-NodePool-Upgrade.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Restricting Ingress Traffic to Services/Ingress Controller
> 来源: ado-wiki-aks-restrict-ingress-loadbalancersourceranges.md | 适用: 适用范围未明确

### 排查步骤

#### Restricting Ingress Traffic to Services/Ingress Controller

#### Summary

Use `loadBalancerSourceRanges` on Service spec to restrict access to AKS-exposed applications. This triggers automatic NSG rule creation that persists as long as the service is online.

#### Key Limitation: Service Tags Incompatibility

When `loadBalancerSourceRanges` is set, `service.beta.kubernetes.io/azure-allowed-service-tags` annotation won't work due to DROP iptables rules from kube-proxy. Workaround: merge CIDRs from service tags into `loadBalancerSourceRanges`.

Service Tags CIDRs download: https://www.microsoft.com/en-us/download/details.aspx?id=56519

#### Why NSG Rules Disappear

Customers manually add NSG rules pointing to the LB public IP, but rules disappear. This is expected — AKS/cloud-provider-azure manages NSG rules for LoadBalancer services. Use `loadBalancerSourceRanges` instead.

#### Implementation: LoadBalancer Service

```yaml
spec:
  loadBalancerSourceRanges:
  - <allowed-cidr>/32
```

Edit service: `kubectl edit svc <service-name>`

#### Implementation: Ingress Controller

Same approach — edit the ingress controller service:

```bash
kubectl edit svc ingress-nginx-controller -n ingress-nginx
```

Add `loadBalancerSourceRanges` to the spec section.

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-b-Blue-Green-NodePool-Upgrade.md | 适用: 适用范围未明确

### 排查步骤

##### Information for blue-green nodepool upgrade settings

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

##### How blue-green nodepool upgrade works

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

##### GreenNodeAndVmCountMismatch Error

If a `GreenNodeAndVmCountMismatch` error occurs, check the logs above for output like:

```text
VM aks-bgnp1-18115899-vmss00000F is a blue node
VM aks-bgnp1-18115899-vmss00000G is a green node
[Unexpected] Kubernetes has 4 green nodes but only 0 green VMs found in VMSS, which is less than required green nodes (4).
Failed to surge green nodes: Category: InternalError; Code: Conflict; SubCode: GreenNodeAndVmCountMismatch; Message: Kubernetes has 4 green nodes but only 0 green VMs found in VMSS, which is less than required green nodes (4)
```

If this error is confirmed, open an IcM incident.

---
