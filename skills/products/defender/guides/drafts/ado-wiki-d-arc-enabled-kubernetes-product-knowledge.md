---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Product Knowledge] - ARC enabled Kubernetes"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Containers/%5BProduct%20Knowledge%5D%20-%20ARC%20enabled%20Kubernetes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Defender for Arc Enabled Kubernetes

The difference between Kubernetes for ARC and Azure Kubernetes Service (AKS) is in the way it connects to Microsoft Defender for Cloud and injects the data into it. The detection and alerts are the same as Azure Kubernetes Service.

There is only one recommendation for it:
- **Recommendation Name**: "Microsoft Arc enabled Kubernetes clusters should have Microsoft Defender's extension installed"
  - **Assessment Key**: 3ef9848c-c2c8-4ff3-8b9c-4c8eb8ddfce6
  - **Policy Definition Id**: /providers/Microsoft.Authorization/policyDefinitions/8dfab9c4-fe7b-49ad-85e4-1e9be085358f
  - **Service Tree Id** (for escalation path): 746de784-6763-44d9-bc6c-e54b6bd62944

## Supported Kubernetes Flavors

- Vanilla
- OpenShift (v4.6 and above)
- Azure Kubernetes Service on Hyper-Converged Infrastructure (AKS-HCI)
- AKS-Engine
- Rancher
- Tanzu Kubernetes Grid

**Note:** The cluster version must be n (latest), n-1, or n-2. Older versions than n-2 were not tested.

## Check if any Kubernetes data injected for a subscription

On Rome or RomeEU Kusto cluster (depending on the location):

```kusto
database("ProdRawEvents").K8S_KubeAudit 
| where ingestion_time() > ago(1h)
| where AzureResourceId contains "{subscriptionId}"
| summarize count() by AzureResourceId 
```

## Simulate Alerts for Defender for Kubernetes

See: [Simulate security alerts from Microsoft Defender for Containers](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-enable?pivots=defender-for-container-arc&tabs=aks-deploy-portal%2Ck8s-deploy-asc%2Ck8s-verify-asc%2Ck8s-remove-arc%2Caks-removeprofile-api#simulate-security-alerts-from-microsoft-defender-for-containers)
