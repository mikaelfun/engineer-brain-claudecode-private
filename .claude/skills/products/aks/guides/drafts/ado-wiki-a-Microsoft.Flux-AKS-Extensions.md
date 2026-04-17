---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Addons and Extensions/Microsoft.Flux AKS Extensions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FMicrosoft.Flux%20AKS%20Extensions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft.Flux AKS Extension

[[_TOC_]]

Get an introduction to Microsoft.Flux [here](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Addons-and-Extensions/Microsoft.Flux-Introduction)

## Support Boundary

- Extension Deployed correctly
- Control Plane Running  
  - Should be a deployed namespace `flux-system` that contains all of the following pods:
    - fluxconfig-agent
    - fluxconfig-controller
    - source-controller (by default)
    - kustomize-controller (by default)
    - helm-controller (by default)
    - notification-controller (by default)
    - image-automation-controller (not installed by default)
    - image-reflector-controller (not installed by default)

### Basic Flow

::: mermaid

graph TD;
A[Microsoft.Flux Extension Deployed on Cluster?] -- Yes --> B[Which Pod is Hanging in `flux-system`?];
A -- No --> C[Extension Installation Failure TSG - L1]
B --> D[fluxconfig-agent]
B --> E[Other Pods]

D --> F[Run `kubectl logs -n flux-system fluxconfig-agent-pod-name -c fluxconfig-agent`]
F --> G[Authentication Issue?]
F --> H[Networking Issue?]
F --> I[Other?]

E --> M

G -- Yes --> J[AAD Pod Identity Installed?]
J -- Yes --> K[AAD Pod Identity TSG - L2]
J -- No --> M

H --> L[Flux TSG - L3]

I --> M[Escalate to Microsoft.KubernetesConfiguration TSG - L4]

:::

### Links to related TSGs

`- L1` [View Extension Installation Failure TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Microsoft.Flux-Extension-Installation-TSG)

`- L2` [View AAD Pod Identity TSG]("https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/troubleshooting#flux-v2---installing-the-microsoftflux-extension-in-a-cluster-with-azure-ad-pod-identity-enabled")

`- L3` [View Flux TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Microsoft.Flux-FluxConfiguration-TSG)

`- L4` [View Escalate to Microsoft.KubernetesConfiguration TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Cluster-Management/Microsoft.KubernetesConfiguration-Escalation)

## Kusto

Obtain Entitlement PTN-ClusterConfig in CoreIdentity via [PTN-ClusterConfig](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/ptnclusterco-w3wd)

### Kusto cluster and database info

cluster:  <https://clusterconfigprod.kusto.windows.net>
Database: ClusterConfig

### Kusto tables of interest

| # | Table | Description |
|----|------|-------------|
| 1 | ConfigAgentTraces | This table has Arc extension operator and Arc agent log  from  user k8s cluster.|
| 2 | ClusterConfigTraces | This table has Arc Azure Service (Resource provider and Data plane) logs. |

## Verified Learning Resources and TSGs

| Resource | Description |
|--------- | ------------|
| [Microsoft.Flux Troubleshooting Guide](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/troubleshooting#gitops-management) | Microsoft Docs Flux Troubleshooting guide |
| [Flux Official Docs](https://fluxcd.io/docs) | Troubleshooting information is spread throughout the docs depending on the specific issue |

## Owner and Contributors

**Owner:** Francisco Mu�oz <Francisco.Javier@microsoft.com>
**Contributors:**

- Francisco Mu�oz <Francisco.Javier@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Eric Lucier <ericlucier@microsoft.com>
- Jadranko Tomic <jatomic@microsoft.com>
- Jonathan Innis <joinnis@microsoft.com>
