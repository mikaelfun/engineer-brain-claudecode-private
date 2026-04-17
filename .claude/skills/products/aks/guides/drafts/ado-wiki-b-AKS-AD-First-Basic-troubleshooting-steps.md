---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Security and Identity/AAD/AKS AD First Basic troubleshooting steps"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FAKS%20AD%20First%20Basic%20troubleshooting%20steps"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Determining cluster authentication configuration

## Summary

The purpose of this document is to help you identify what type of authentication has been used for the customer cluster and what permissions are required to be able to make changes for AD objects related to AKS.

## Troubleshooting Steps

### Determining if RBAC is enabled in the cluster

The customer can confirm the RBAC configuration of the cluster by looking at the cluster attributes on the Overview blade in Azure Portal.

They can also find the setting by running the following Azure CLI command: `az aks show -g <resource-group> -n <cluster-name> -o tsv --query "enableRbac"`.

### Checking for Service Principals or Managed Identities

Within ASC, we can identify if the cluster is using a Service Principal or Managed Identity by looking at the `Identity` and `IdentityProfile` properties of the cluster. If these properties have `UserAssignedIdentity` or `SystemAssignedIdentity`, the cluster is using managed identities; if the fields only have object and client IDs, the cluster is using a Service Principal.

We can verify by using Tenant Explorer in ASC to check the object or client IDs found in the properties mentioned above.

Using Azure CLI, we can get the identity information for the cluster using the following commands:

```bash
az aks show -g <resource-group> -n <cluster-name> --query "identity" # Get the AKS cluster identity
az aks show -g <resource-group> -n <cluster-name> --query "identityProfile" # Get the AKS kubelet identity (if different than the cluster identity)
```

The output from Azure CLI will resemble the following:

```json
// If the cluster has a single identity:
{
  "principalId": null,
  "tenantId": null,
  "type": "UserAssigned",
  "userAssignedIdentities": {
    "/subscriptions/.../Microsoft.ManagedIdentity/userAssignedIdentities/ccp-identity": {
      "clientId": "48c738d2-xxxx-xxxx-xxxx-96337e34d3e0",
      "objectId": "dcee7924-xxxx-xxxx-xxxx-599cdb19addd"
    }
  }
}

// If the cluster has a separate kubelet identity:
{
  "kubeletidentity": {
    "clientId": "48c738d2-xxxx-xxxx-xxxx-96337e34d3e0",
    "objectId": "dcee7924-xxxx-xxxx-xxxx-599cdb19addd",
    "resourceId": "/subscriptions/.../Microsoft.ManagedIdentity/userAssignedIdentities/gp-kubelet-identity"
  }
}
```

We can also find these properties by running a `GetManagedCluster` command in Jarvis.

### Checking for AAD integration

Checking the cluster in ASC, if the cluster has an AAD integration the `Aad Profile` attribute on the cluster will be non-null. If the cluster was integrated with AAD using the legacy integration, `aadProfile.Managed` will be false; if they're using the managed AAD integration, `aadProfile.Managed` will be true.

Using Azure CLI, the `az aks show -g <resource-group> -n <cluster-name> --query aadProfile` command will return the integration details if the cluster is integrated.

Using ASI, the feature checkboxes at the bottom of the main pane (above the timeline) will have either the `AAD (legacy)` or `AAD (managed)` checkbox checked.

#### Legacy Integration - Identity Information

If the cluster is using a legacy AAD integration, the server application ID, client application ID, and server application secret will be displayed in ASC as part of the AAD Profile attribute.

### Checking for authentication issues in Kusto

Using the following Kusto query, you can check for authentication issues in the `guard` pod that runs in the cluster control plane:

```sql
//checks for control plane, guard pod errors. database: AKSccplogs
cluster("AKSccplogs").database("AKSccplogs").ControlPlaneEventsAll
| ccpNamespace == "{ccp-namespace-of-cluster}"
| where TIMESTAMP > ago(1d)
| where category=="guard"
| project TIMESTAMP, properties
| where properties contains "error"
```
