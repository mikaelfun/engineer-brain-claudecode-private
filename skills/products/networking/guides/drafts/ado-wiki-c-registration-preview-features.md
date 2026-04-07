---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Registration Preview Features"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FRegistration%20Preview%20Features"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Description
Sometimes customer has some issue when trying to register some feature. This wiki has been created to help engineers checking if features are indeed registered or not and also to check the REGISTER / UNREGISTER operations happening.

# How to check if a feature is registered?

In Jarvis Actions, there is an operation called "Gets all features in subscription" that shows a snapshot of the current state of the features given a subscription

The link on below can be used to access the tool

https://portal.microsoftgeneva.com/14BFC7E?genevatraceguid=0f9459dd-6d1a-444c-8e61-488a6749c854

**NOTE:** @gme.gbl or @ame.gbl account must be used access the tool


# Register / Unregister ARM Operations.
Imagine that the customer "thinks" they ae registering a feature but when checking the subscription, they realizes that even having a succeeded registering operation, the feature shows as disabled. How we can check what is happening?

When a feature is registered or unregistered, an ARM operation goes on the backend, and we can easily track it using Kusto queries.

Query (subscription and timestamp should be updated):

```kusto
let ARMPRODEntityGroup = entity_group [cluster('armprodeus.eastus.kusto.windows.net'),
                                       cluster('armprodweu.westeurope.kusto.windows.net'),
                                       cluster('armprodsea.southeastasia.kusto.windows.net')];
macro-expand isfuzzy=true ARMPRODEntityGroup
(
    ARMPRODEntityGroup.database('Requests').EventServiceEntries
    | extend $cluster = ARMPRODEntityGroup.$current_cluster_endpoint
    | where subscriptionId == "8f923454-d1bf-4af0-b9aa-aa1e4dc5c45a" // subscription ID
    | where operationName contains "Microsoft.Features/providers/features"
    | where PreciseTimeStamp >= ago(2h)
    //| where TIMESTAMP > datetime(2025-08-18 13:00:00) and TIMESTAMP < datetime(2025-08-18 15:00:00)
)
| project PreciseTimeStamp, ActivityId, correlationId, operationId, operationName, customerOperationName, status, resourceUri, properties
```

# Customer ready commands to register and unregister a feature

**Register:**

PS Reference: [Register-AzProviderFeature (Az.Resources) | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/az.resources/register-azproviderfeature?view=azps-14.4.0)

Bash (AzCLI) Reference: [az feature registration | Microsoft Learn](https://learn.microsoft.com/en-us/cli/azure/feature/registration?view=azure-cli-latest#az-feature-registration-create)

Example (PS):

```powershell
Register-AzProviderFeature -FeatureName "AllowApplicationGatewayTlsProxy" -ProviderName "Microsoft.Network"
```

- It should say Registered. If it says anything else they are not correctly registered.

**Unregister**

PS Reference: [Unregister-AzProviderFeature (Az.Resources) | Microsoft Learn](https://learn.microsoft.com/en-us/powershell/module/az.resources/unregister-azproviderfeature?view=azps-14.4.0)

Bash (AzCLI) Reference: [az feature registration | Microsoft Learn](https://learn.microsoft.com/en-us/cli/azure/feature/registration?view=azure-cli-latest#az-feature-registration-delete)

Example (PS):

```powershell
Unregister-AzProviderFeature -FeatureName "AllowApplicationGatewayTlsProxy" -ProviderNamespace "Microsoft.Network"
```

Public Documentation: [Set up preview features in Azure subscription - Azure Resource Manager | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/preview-features?tabs=azure-portal)

> **Tip:** If a feature shows as _Registered_ but the customer is still experiencing issues related to that feature, ask the customer to **unregister** it and then **re-register**. Make sure to wait until the first command confirms **Unregistered** before running the command to re-register.

# Contributors
- Gaspar Ferreira
