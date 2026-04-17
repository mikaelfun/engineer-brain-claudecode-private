---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Addons and Extensions/AzureML AKS extension"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FAzureML%20AKS%20extension"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AzureML AKS Extension

[[_TOC_]]

## Summary

AzureML extension extends Azure ML service capabilities seamlessly to Kubernetes clusters and enables customer to train and deploy models on Kubernetes anywhere at scale. With a simple AzureML extension deployment, customers can instantly onboard their data science team with productivity tools for full ML lifecycle, and have access to both Azure managed compute and customer managed Kubernetes anywhere. Customer is flexible to train and deploy models wherever and whenever business requires so. With built-in AzureML pipeline and MLOps support for Kubernetes, customers can scale machine learning adoption in their organization easily.

## Support Boundary

### AKS side

- Extension Deployed correctly
- Pods running
  - If the pods are not running under azureml namespace, follow the TSG . If you can fix the issue, great, if not escalate!
- Follow [TSG](https://github.com/Azure/AML-Kubernetes/blob/master/docs/troubleshooting.md).
- Anything else related to the ML workload or pods are owned by the ML support team
- If you are not able to solve the issue yourself or feel you need more assistance, escalate to the appropriate team listed below

## Basic Flow

::: mermaid
 graph TD;
 A[AzureML Extension Installed?] --> |Yes| B[Installed Failed?];
A --> |No| Z[<a href="https://learn.microsoft.com/en-us/azure/machine-learning/how-to-deploy-kubernetes-extension?view=azureml-api-2&tabs=deploy-extension-with-cli">Follow Docs</a>];
B --> |Yes| Y[Escalate AKS RP];
B --> |No| X[Pods Running?];
X --> |Yes| W[Escalate to AzureML];
X --> |No| V[Follow TSG];
V --> |After TSG| U[Pods Running];
U --> |Yes| T[Still an Issue?];
T --> |Yes| S[Escalate to AzureML];
:::

## Escalation Paths

Filing ICMs for Extension related issues go to AKS RP:
[AKS RP Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=K2i1zh)

Filing ICMs for AzureML related issues:
[AzureML Escalation Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=x26Ojq)

## Verified Learning Resources

Resource | Description
------ | ------
[AzureML Troubleshooting Guide](https://github.com/Azure/AML-Kubernetes/blob/master/docs/troubleshooting.md) | AzureML documentation and troubleshooting guide
[AzureML Docs](https://github.com/Azure/AML-Kubernetes/) | AKS AzureML Extension doc

## Basic TSG

Here is the troubleshooting guidance for AzureML reference.

1. AzureML Troubleshooting Guide: <https://github.com/Azure/AML-Kubernetes/blob/master/docs/troubleshooting.md>
2. [AKS-ML Troubleshooting Guide](/Azure-Kubernetes-Service-Wiki/AKS/TSG/AKS-ML(Azure-Machine-Learning)-TSG.md)

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Adam Margherio <amargherio@microsoft.com>
- Chris Luo <soluo@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Youhua Tu <youhuatu@microsoft.com>
