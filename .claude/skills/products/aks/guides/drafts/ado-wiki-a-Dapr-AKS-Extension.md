---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Addons and Extensions/Dapr AKS Extension"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FDapr%20AKS%20Extension"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Summary

Dapr is a portable, event-driven runtime that makes it easy for any developer to build resilient, stateless and stateful applications that run on the cloud and edge and embraces the diversity of languages and developer frameworks. The Dapr AKS Extension provisions Dapr (creates the Dapr control plane) on an AKS cluster. This extension is useful because it eliminates the overhead and requirements of having to download any Dapr tooling and manually installing the runtime on AKS. Additionally, the extension offers support for all native Dapr configuration capabilities through simple command-line arguments.

## Support Boundary

- Extension Deployed correctly
- Control Plane Running  
  - Should be a deployed namespace that contains all the pods, will update when we have more info.
- Pods running  
  - If the pods are not running, follow the [TSG](https://eng.ms/docs/cloud-ai-platform/azure/azure-core-compute/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/tsg/dapr-aks-extension). If you can fix the issue, great, if not escalate!  
- Follow TSG
- If you are not able to solve the issue yourself or feel you need more assistance, escalate to the appropriate team listed below

### Basic Flow

::: mermaid
 graph TD;
 A[DAPR Extension Deployed?] --> |Yes| B[Deployment Failed?];
A --> |No| Z[https://docs.microsoft.com/en-us/azure/aks/dapr];
B --> |Yes| Y[Escalate AKS RP];
B --> |No| X[Pods Running?];
X --> |Yes| W[Escalate to Dapr];
X --> |No| V[Follow TSG];
V --> |After TSG| U[Pods Running];
U --> |Yes| T[Still an Issue?];
T --> |Yes| S[Escalate to Dapr];
:::

## Escalation Paths

Filing ICMs for Dapr related issues:  
[Dapr Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=W2Y2G3)

Filing ICMs for Extension related issues go to AKS RP:  
[AKS RP Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=M3Q2u0)

# Verified Learning Resources

Resource | Description
------ | ------
[AKS Extension TSG](https://eng.ms/docs/cloud-ai-platform/azure/azure-core-compute/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/tsg/dapr-aks-extension) | AKS PG TSG
[Dapr Troubleshooting Guide](https://docs.dapr.io/operations/troubleshooting/) | Dapr source documentation and troubleshooting guide
[Use Dapr MS Docs](https://docs.microsoft.com/en-us/azure/aks/dapr?branch=pr-en-us-177959) | AKS Dapr Extension doc

# Basic TSG

1. **Extension deployed and pods are running**
2. **Check Kusto Query for extension errors:**

```
let start=datetime(2021-10-01T00:00:00Z);
let end=datetime(2021-10-02T00:00:00Z);
cluster('Aks').database('AKSprod').AsyncQoSEvents
| where TIMESTAMP between (start..end)
| where resourceGroupName == "{RG_Name}"
| where resourceName == "{Resource_Name}"
| sort by PreciseTimeStamp desc
| project TIMESTAMP, propertiesBag
```

3. **Get Pod logs from customer**

Here is the upstream troubleshooting guidance for reference.

<https://docs.dapr.io/operations/troubleshooting/>

4. **Escalate**

## ICMs

_None yet!_

## Known issues

_None yet!_

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Chase Overmire <chover@microsoft.com>
- Ben Parker <bparke@microsoft.com>
