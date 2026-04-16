# [AKS] Certificate Rotation Fails: curl --proxy-insecure Unknown on Ubuntu 16.04

**Source:** MCVKB/VM+SCIM/18.32  
**Type:** Known Issue  
**ID:** aks-onenote-017  
**Product:** AKS (Mooncake)  
**Date:** 2021-12-24

## Symptom

```
az aks rotate-certs -g <RG> -n <CLUSTER>
```

Fails with:

```
VMASAgentPoolReconciler retry failed: Category: ClientError; SubCode: OutboundConnFailVMExtensionError
OrginalError: Code="VMExtensionProvisioningError" 
Message="VM has reported a failure when processing extension 'cse-agent-0'.
Error message: Enable failed: command terminated with exit status=50
[stderr]
curl: option --proxy-insecure: is unknown
curl: try 'curl --help' or 'curl --manual' for more information
Command exited with non-zero status 2"
```

**Post-failure state:**
- Cluster in **Failed** state
- `kubectl get node` → "No resource"
- All pods → **Pending**
- Upgrade button grayed out in Portal

## Root Cause

Ubuntu **16.04** nodes ship with an old `curl` version that does **not** support `--proxy-insecure`. The CSE script used by `rotate-certs` (and `resetSP`) calls curl with this flag.

**Affected clusters:**
- VMAS-based AKS clusters (not VMSS)
- Kubernetes ≤ 1.17
- Ubuntu 16.04 worker nodes

> Manually upgrading curl on existing nodes **does not help** — nodes are reimaged from the Ubuntu 16.04 VHD during reconcile and curl reverts.

## Recovery Workaround

```bash
# 1. Remove stock aks-preview extension
az extension remove --name aks-preview

# 2. Install patched extension
az extension add --source https://raw.githubusercontent.com/andyzhangx/demo/master/aks/rotate-tokens/aks_preview-0.5.0-py2.py3-none-any.whl -y

# 3. Reconcile control plane certs
RESOURCE_GROUP_NAME=<rg>
CLUSTER_NAME=<cluster>
az aks reconcile-control-plane-certs -g $RESOURCE_GROUP_NAME -n $CLUSTER_NAME
```

After recovery, cluster returns to **Running** state. All nodes and pods come back.

## Permanent Fix

**Upgrade the cluster to Kubernetes 1.19+** — this migrates nodes to **Ubuntu 18.04** which ships with a compatible curl version.

- If VMSS cluster: try scale-out first; new nodes may come up with Ubuntu 18.04
- If VMAS cluster: must upgrade K8s version

> ⚠️ Note: K8s 1.19+ switches container runtime from Docker to **containerd** — verify workload compatibility before upgrading.

## Diagnosis

### Verify via ARM Kusto

```kusto
-- armmcadx.chinaeast2.kusto.chinacloudapi.cn / armmc
cluster("armmcadx").database("armmc").EventServiceEntries
| where subscriptionId == "<sub-id>"
| where resourceUri contains "<cluster-name>"
| where operationName == "Microsoft.ContainerService/managedClusters/rotateClusterCertificates/action"
| project PreciseTimeStamp, operationName, todynamic(properties)
```

### Check Cert Expiry via BBM

```kusto
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').BlackboxMonitoringActivity
| where subscriptionID == "<sub-id>" and fqdn contains "<cluster-name>"
| summarize by certExpirationTimes, serviceCertExpiration, bin(PreciseTimeStamp, 1h)
```

## References

- https://docs.azure.cn/zh-cn/aks/certificate-rotation
- ICM: https://portal.microsofticm.com/imp/v3/incidents/details/279458510/home
