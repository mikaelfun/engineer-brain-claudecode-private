---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Templates, Bicep & Deployments/Deployment Stacks"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Templates%2C%20Bicep%20%26%20Deployments%2FDeployment%20Stacks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> Public Preview

A **deployment stack** is a native Azure resource type that enables you to perform operations on a resource collection as an atomic unit. Deployment stacks are defined in ARM as the type `Microsoft.Resources/deploymentStacks`.

The deployment stack is a wrapper around a regular ARM deployment. It allows the stack to understand what resources were created by the deployment template, and provide additional capabilities to manage all those resources as a single unit (Deny assignments or bulk deletion).
