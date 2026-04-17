---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/Service Connector with AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FService%20Connector%20with%20AKS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Service-Connector-with-AKS

[[_TOC_]]

# Description

Service Connector: Service Connector helps you connect Azure compute services to other backing services. Service Connector configures the network settings and connection information (for example, generating environment variables) between compute services and target backing services in management plane. Developers use their preferred SDK or library that consumes the connection information to do data plane operations against the target backing service.

<https://learn.microsoft.com/en-us/azure/service-connector/overview#what-is-service-connector-used-for>

# Feature with AKS

Create a new Azure Kubernetes Service (AKS) cluster to connect your AKS resource to other Azure services.

[Create a service connection in Azure Kubernetes Service (AKS) from the Azure portal | Microsoft Learn](https://learn.microsoft.com/en-us/azure/service-connector/quickstart-portal-aks-connection?tabs=UMI)

# Triage

When there is an error, check the error message first to decide whether this is an extension agent error, or a Service Connector specific error.

If the error is related to **extension creation** or **helm installation**, it is an extension agent error. The typical errors are like:

* Unable to get a response from the agent in time
* Extension pods can't be scheduled if all the node pools in the cluster are "CriticalAddonsOnly" tainted
* Timed out waiting for resource readiness
* Unable to download the Helm chart from the repo URL
* Helm chart rendering failed with given values
* Resource already exists in your cluster
* Operation is already in progress for Helm

For any errors else, it is more likely a Service Connector specific error. Typical errors are like:

* Operation returned an invalid status code: Conflict
* You do not have permission to perform ... If access was recently granted, please refresh your credentials.
* The subscription is not registered to use namespace 'Microsoft.KubernetesConfiguration'

# Troubleshoot

If this is an extension agent error:

* Try the extension agent [troubleshooting doc.](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/cluster-extension-deployment-errors)
* Create an incident for the extension agent team: Cluster Configuration / Cluster Configuration Triage.

If this is a Service Connector specific error:

* Try the Service Connector for AKS [troubleshooting doc](https://learn.microsoft.com/en-us/azure/service-connector/how-to-use-service-connector-in-aks#common-errors-and-mitigations).
* Collect information according to [Service Connector for AKS logs](https://learn.microsoft.com/en-us/azure/service-connector/how-to-use-service-connector-in-aks#check-kubernetes-cluster-logs).
* Create an incident for the Service Connector team: Service Connector/Azure Service Connector Team, with the information gathered in the second step.

## Owner and Contributors

**Owner:** Megha Dubey <meghadubey@microsoft.com>
