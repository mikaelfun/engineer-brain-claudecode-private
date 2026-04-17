---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/Microsoft.KubernetesConfiguration Escalation"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.KubernetesConfiguration%20Escalation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft.KubernetesConfiguration / AKS Extension Escalation

## Required Data for Escalation

Include the output from as many of the following commands as possible from the customer cluster:

1. `kubectl get ec -A -o yaml`
2. `kubectl describe deployments -n flux-system`
3. `kubectl logs -n <extension-manager-pod-name> -c manager`
4. `kubectl logs -n <extension-agent-pod-name> -c config-agent`
5. `az k8s-extension show -g <resource-group> -c <cluster-name> -n <extension-name>`

Also collect:
- **Kubernetes Version**
- **Extension Manager Version**

## Escalation Paths

**Flux related issues** — file ICM via:
[Microsoft.KubernetesConfiguration Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=vCxHR2)

**Extension related issues** — file to AKS RP:
[AKS RP Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=M3Q2u0)
