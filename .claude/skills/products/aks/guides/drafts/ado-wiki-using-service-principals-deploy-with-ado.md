---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Security and Identity/Using Service Principals to access clusters and deploy with ADO"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FUsing%20Service%20Principals%20to%20access%20clusters%20and%20deploy%20with%20ADO"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Using Service Principals to Access Clusters and Deploy with Azure DevOps

## Objective

Implement production-grade deployment procedure to deploy applications directly into the Kubernetes cluster using Azure DevOps with manually created SPN (service principal).

## Prerequisites

- AKS cluster
- Application Administrator or relevant rights to create app registration in AAD
- Test project in Azure DevOps

## Implementation

1. Create SPN via app registrations in Azure Active Directory
2. Create the SPN client secret for authentication (set expiration date)
3. Record: SPN Name, Value, Secret, Client ID (application id), Tenant ID
4. Give required access to SPN over the cluster (e.g., Contributor access to cluster RG)
5. In Azure DevOps project settings → Service Connections:
   - New Service Connection → Azure Resource Manager → Service principal (manual)
   - Enter subscription details, SPN client ID, tenant ID
   - Under Service principal key: use SPN client secret **value** (not client secret ID)
   - Verify & Save
6. Use the SPN service connection in build/release pipelines
   - In classic editor: `azureSubscription: '<service-connection-name>'`
   - Select the service connection in Azure Subscription field
   - Configure kubectl tasks with file path or inline commands
