---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Preview Features/API Server VNet Integration"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FAPI%20Server%20VNet%20Integration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# API Server VNet Integration

[[_TOC_]]

## Overview

An Azure Kubernetes Service (AKS) cluster with API Server VNet Integration configured projects the API server endpoint directly into a delegated subnet in the VNet where AKS is deployed. This enables network communication between the API server and the cluster nodes without any required private link or tunnel. This means no more tunnelfront/aks-link.

## How check whether APIServer Vnet Integration is enabled or not?

Get managed cluster with api-version >= 2022-04-02-preview, if you found the following configurations, then the cluster has enabled APIServer Vnet Integration. Or else, it is PrivateLink private cluster.

```json
{
    "apiServerAccessProfile": {
      "enablePrivateCluster": true,
      "enableVnetIntegration": true
   }
}
```

### DNC (Delegated Network Controller) Logs

Delegated Network Controller (DNC) is a controller provides network management capability to AKS infra container orchestrator. DNC runs as a deployment on each underlay cluster.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSprod?query=H4sIAAAAAAAEAGWPQWvCQBCF74H8h8FTAqYq9JpebK8itJ5l2H3E2M3uMjtpFfzxbkLBlh7m8t773sysVvS625ILXSqLbfAqwe0de7x9wWvWbvR9goD2AtMnfPQD3pWHSC%2fEXag2tn5kDCu6IFdqW1pYbxYP6%2bAtxPF1xwNm%2b2RiM%2f6Ijcm7hN2YMHJszKV5nlFcFN5Ox1FLkSXheE7BV1FChGiPVP%2bKxWBbDUml912Vmacs1MuJ%2fivnmbHccobRf58tp6aZm1LKn6DNel0WZXEHAzZVWS0BAAA%3d)] [[Desktop](https://aks.kusto.windows.net/AKSprod?query=H4sIAAAAAAAEAGWPQWvCQBCF74H8h8FTAqYq9JpebK8itJ5l2H3E2M3uMjtpFfzxbkLBlh7m8t773sysVvS625ILXSqLbfAqwe0de7x9wWvWbvR9goD2AtMnfPQD3pWHSC%2fEXag2tn5kDCu6IFdqW1pYbxYP6%2bAtxPF1xwNm%2b2RiM%2f6Ijcm7hN2YMHJszKV5nlFcFN5Ox1FLkSXheE7BV1FChGiPVP%2bKxWBbDUml912Vmacs1MuJ%2fivnmbHccobRf58tp6aZm1LKn6DNel0WZXEHAzZVWS0BAAA%3d&web=0)] <https://aks.kusto.windows.net/AKSprod>

```sql
// DNC logs
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEvents
| where PreciseTimeStamp > ago(1d)
| where category == "dnc"
| where UnderlayName == "{Underlay_Name}"
| extend log = parse_json(properties)
| extend pod=tostring(log.pod), log=tostring(log.log)
| project PreciseTimeStamp, pod, log
| take 100
```

### PCC (PrivateConnect Controller) Logs

PrivateConnect Controller (PCC) is an operator which provides customer subnet projection management via Kubernetes CRDs. It runs as a sidecar of DNC on each underlay cluster.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSprod?query=H4sIAAAAAAAEAGWPQWvDMAyF74H8B9FTAvXawq7ZJew6AtvOQzgidetYRla6FvbjZ4dBN3YQQo%2f3PZ52Oxj6HjxPqa56DirsB4%2bBni8UNGtf8HkkIRiErEv05mZ6VZwjPAFO3BzG9u6xqDSx3KDrYBPFXfJtLIdAVssu4Z5kcyfew0ji8faCM63U0Uaz%2fIjG5gqCfkm0YDT2ah5XlK5KYSydoYOIkujjlDg0UTiSqKPU%2frJFHjvlpOLC1GTmIQvtttB%2f5TwrllNOue%2b%2fh7claeWKS%2fFMcNjv66quvgE57Az6RAEAAA%3d%3d)] [[Desktop](https://aks.kusto.windows.net/AKSprod?query=H4sIAAAAAAAEAGWPQWvDMAyF74H8B9FTAvXawq7ZJew6AtvOQzgidetYRla6FvbjZ4dBN3YQQo%2f3PZ52Oxj6HjxPqa56DirsB4%2bBni8UNGtf8HkkIRiErEv05mZ6VZwjPAFO3BzG9u6xqDSx3KDrYBPFXfJtLIdAVssu4Z5kcyfew0ji8faCM63U0Uaz%2fIjG5gqCfkm0YDT2ah5XlK5KYSydoYOIkujjlDg0UTiSqKPU%2frJFHjvlpOLC1GTmIQvtttB%2f5TwrllNOue%2b%2fh7claeWKS%2fFMcNjv66quvgE57Az6RAEAAA%3d%3d&web=0)] <https://aks.kusto.windows.net/AKSprod>

```sql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEvents
| where PreciseTimeStamp > ago(1d)
| where category == "private-connect-controller"
| where UnderlayName == "{Underlay_Name}"
| extend log = parse_json(properties)
| extend pod=tostring(log.pod), log=tostring(log.log)
| project PreciseTimeStamp, pod, log
| take 100
```

### CNS (Container Network Service) Logs

Container Network Service (CNS) is an agent that DNC communicates with to store the network container goal state which is used when creating containers via CNI. It can also create network adapters and program the assigned customer address on it. CNS runs as a daemonset on each underlay cluster.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSprod?query=H4sIAAAAAAAEAGWPMWvDMBCFd4P%2fw5HJhqhJoKu7hK4hkHYuh%2fxwlMqSOJ3bBPrjK5tCWjrc8vi%2bd3ebDe0PJ%2fJxyHW1j0El%2bqPngOcPBC3ZF32eIaCjwLqMFzfipDwmeiIeYrPr2ztjWTFEuVHX0cqGbGwpZBcgqzv0GnqI59uBRyzg2SYz%2fYTGlq3CfsqYOBl7NY%2bLiqsi9POZ1FFiyXi75BiaJDFB1CG3v7AU%2b05jVnFhaIrzUIJ2Pdt%2f4zKLVlousPrvx%2fXctHgzpfwO2m23dVVX36KfcQM3AQAA)] [[Desktop](https://aks.kusto.windows.net/AKSprod?query=H4sIAAAAAAAEAGWPMWvDMBCFd4P%2fw5HJhqhJoKu7hK4hkHYuh%2fxwlMqSOJ3bBPrjK5tCWjrc8vi%2bd3ebDe0PJ%2fJxyHW1j0El%2bqPngOcPBC3ZF32eIaCjwLqMFzfipDwmeiIeYrPr2ztjWTFEuVHX0cqGbGwpZBcgqzv0GnqI59uBRyzg2SYz%2fYTGlq3CfsqYOBl7NY%2bLiqsi9POZ1FFiyXi75BiaJDFB1CG3v7AU%2b05jVnFhaIrzUIJ2Pdt%2f4zKLVlousPrvx%2fXctHgzpfwO2m23dVVX36KfcQM3AQAA&web=0)] <https://aks.kusto.windows.net/AKSprod>

```sql
// CNS logs
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEvents
| where PreciseTimeStamp > ago(1d)
| where category == "cns-container"
| where UnderlayName == "{Underlay_Name}"
| extend log = parse_json(properties)
| extend pod=tostring(log.pod), log=tostring(log.log)
| project PreciseTimeStamp, pod, log
| take 100
```

### PCB (Private Connect Balancer) Logs

Private Connect Balancer (PCB) is an operator which reconciles kube-apiserver ILB in node resource group based on MultiTenantNetworkContainer CRD in the CCP namespace. It runs as a deployment in each CCP namespace.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSccplogs?query=H4sIAAAAAAAEAGWPQUsDQQyF74X%2bh9DTFtoyY7W0hxVEvEpB%2f0A6E7ajs8kwE6sFf7yze3HFY9773kvywUEYHoU1SzxGZHq6EGt5iHE%2b%2b4bPM2WCYyYXCr2Gnl4U%2bwT3gJ001i9%2fGefSM%2fZUEjqCtoXFzu532zvrDoS3p70xxm7pBr1ZTDKo1Em%2bjnzK4VLntRNmcro%2bYb3GUR55%2blJiDwlaUPFXxj64JmVJlDVQWU6YKN1IFc2BuyZtqjD1k%2fi%2ffhVGv9a91cX%2fvl0NkdXQO1CK7wTWmPnsBwuUllE7AQAA)] [[Desktop](https://aks.kusto.windows.net/AKSccplogs?query=H4sIAAAAAAAEAGWPQUsDQQyF74X%2bh9DTFtoyY7W0hxVEvEpB%2f0A6E7ajs8kwE6sFf7yze3HFY9773kvywUEYHoU1SzxGZHq6EGt5iHE%2b%2b4bPM2WCYyYXCr2Gnl4U%2bwT3gJ001i9%2fGefSM%2fZUEjqCtoXFzu532zvrDoS3p70xxm7pBr1ZTDKo1Em%2bjnzK4VLntRNmcro%2bYb3GUR55%2blJiDwlaUPFXxj64JmVJlDVQWU6YKN1IFc2BuyZtqjD1k%2fi%2ffhVGv9a91cX%2fvl0NkdXQO1CK7wTWmPnsBwuUllE7AQAA&web=0)] <https://aks.kusto.windows.net/AKSccplogs>

```sql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp > ago(1d)
| where ccpNamespace == "{ccp_Namespace}"
| where category == "private-connect-balancer"
| extend p = todynamic(properties)
| extend log = tostring(p.log)
| extend pod = tostring(p.pod)
| project PreciseTimeStamp, pod, log
| take 100
```

## PCR (Private Connect Router) Logs

Private Connect Router (PCR) is an operator which reconciles kube-apiserver's routes to customer nodes. It runs as a sidecar of kube-apiserver in CCP namespace.

Execute: [[Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faks.kusto.windows.net/databases/AKSccplogs?query=H4sIAAAAAAAEAGWPQUvDQBCF74H8h6GnFNqya7W0hwgiXqWgf2DdHdLVzcwyO60W%2fPEmuRjxOO997w3vTJEJHplUOB2TI3y6IGl5SKmuvuHzhIJwFPSx4Gvs8UVdn%2bEeXMeNDctfxvv87Hos2XmEtoXFzu532zvrD%2bhu3%2fbGGLvFGxfMYpZxih3LdeKzxMtwrz0Tode18FlRJhq%2fFClAhhaUw5VcH32ThTOKRizLGZO4m6iiEqlr8mYQ5n7m8NcfhMkf6t6Ht%2f%2b2rsbIauwdKXUfCNaYuqqrHw6zw4A7AQAA)] [[Desktop](https://aks.kusto.windows.net/AKSccplogs?query=H4sIAAAAAAAEAGWPQUvDQBCF74H8h6GnFNqya7W0hwgiXqWgf2DdHdLVzcwyO60W%2fPEmuRjxOO997w3vTJEJHplUOB2TI3y6IGl5SKmuvuHzhIJwFPSx4Gvs8UVdn%2bEeXMeNDctfxvv87Hos2XmEtoXFzu532zvrD%2bhu3%2fbGGLvFGxfMYpZxih3LdeKzxMtwrz0Tode18FlRJhq%2fFClAhhaUw5VcH32ThTOKRizLGZO4m6iiEqlr8mYQ5n7m8NcfhMkf6t6Ht%2f%2b2rsbIauwdKXUfCNaYuqqrHw6zw4A7AQAA&web=0)] <https://aks.kusto.windows.net/AKSccplogs>

```sql
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp > ago(1d)
| where ccpNamespace == "{ccp_Namespace}"
| where category == "private-connect-router"
| extend p = todynamic(properties)
| extend log = tostring(p.log)
| extend pod = tostring(p.pod)
| project PreciseTimeStamp, pod, log
| take 100
```

## Connection troubleshooting

When APIServerVnetIntegration is enabled, apiserver pods will have 2 nics, eth0 is on aks underlay while eth1 is projected to customer's vnet.

1. eth1 has IP address allocated in customer's vnet.
2. agent nodes talk to apiserver via eth1 IPAddr directly (balanced by an iLB),
3. apiserver talks to workloads on agent nodes via eth1, we don't have konnectivity agent, openvpn client, or tunnel-front on agent nodes anymore.

If there are any connection issues, we will need to escalate to PG.

## References

- Private Cluster v2 design proposal: <https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/141703/Private-Cluster-v2>
- Public Docs: <https://learn.microsoft.com/en-us/azure/aks/api-server-vnet-integration>
- PG Wiki: <https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/240785/APIServer-Vnet-Integration-PrivateCluster-TSG>

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>

