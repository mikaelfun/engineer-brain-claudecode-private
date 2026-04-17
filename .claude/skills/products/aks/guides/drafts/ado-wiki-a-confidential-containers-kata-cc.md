---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Confidential Containers (kata-cc)"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FConfidential%20Containers%20(kata-cc)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Confidential Containers (kata-cc)

## Retirement Notice

**Deprecated, removal scheduled March 2026.** See https://learn.microsoft.com/en-us/azure/aks/confidential-containers-overview for alternatives. Contact Jordan Harder or PM Jack Jiang for questions.

## Overview

Uses kata runtime (`kata-cc-isolation`) for zero-trust container workloads. Feature owner: Fanglu Guo (fangluguo@microsoft.com).

## Check if cluster is Kata enabled

```bash
kubectl get runtimeclasses
# Expect: kata-cc, kata-mshv-vm-isolation, runc
```

RuntimeClass `kata-cc` must exist. If missing: `pods "untrusted" is forbidden: RuntimeClass "kata-cc" not found`

## Check agent pool is Kata-cc enabled

**ASI**: Cluster page > Node Pools > node pool > Features section > "Is Kata" > Nodes > labels

**az CLI**:
```bash
az aks show -n <clusterName> -g <groupName>
# Look for: workloadRuntime: KataCcIsolation, vmSize: Standard_DC4as_cc_v5, osSku: AzureLinux
```

**kubectl**:
```bash
kubectl describe nodes <node-name>
# Look for: kubernetes.azure.com/kata-cc-isolation=true
```

## Check RP service

```sql
cluster("Aks").database("AKSprod").FrontEndContextActivity
| where PreciseTimeStamp > ago(7d)
| where msg contains "Kata: "
| project msg, resourceGroupName, resourceName, serviceBuild, Environment, region, level, TIMESTAMP
```

Expected: `Kata: Using Mariner Kata distro`

## Known Issues (Kata bugs)

### FailedCreatePodSandBox

```
rpc error: code = Unknown desc = failed to create containerd task: failed to create shim task: error: Put "http://localhost/api/v1/vm.boot": EOF
```

Indicates Kata software stack issue. **Escalate to feature owner.**

### Policy Blocked

`CreateContainerRequest is blocked by policy` or `ExecProcessRequest is blocked by policy`

The operation violates rules.rego genpolicy. By design - update policy to allow intended operation.

### Pod stuck in Running (should be Succeeded)

Kata e2e test pod stuck in running phase. Cannot reproduce consistently. **Escalate to feature owner.**

## Known Issues (NOT Kata bugs)

* Too much garbage in e2e underlay (overlay resource reclamation)
* mcr.microsoft.com connectivity issues (not related to Kata)

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
