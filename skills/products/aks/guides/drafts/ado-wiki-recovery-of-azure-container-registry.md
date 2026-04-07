---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/Recovery of Azure Container Registry"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FRecovery%20of%20Azure%20Container%20Registry"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Recovery of Deleted Azure Container Registry (ACR)

## Problem

Customer accidentally deleted their Azure Container Registry and they want to recover/undelete the registry.

## Cause (Internal)

Customer initiated deletion of the Azure Container Registry.

### Identify Who Initiated the Registry Deletion

**NOTE: NEVER SHARE INFORMATION WITH CUSTOMERS THAT DISCUSSES WHO DELETED ANYTHING AS THAT IS PII AND WE DO NOT SHARE THAT INFORMATION!**

Run the below command in KUSTO to check for the deletion operation.

```sql
//ACR DELETION 
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests") 
| where PreciseTimeStamp > ago(5d) 
| where targetUri contains "{Sub_Id}"
| where httpMethod contains "DELETE"
| where targetUri contains "Microsoft.ContainerRegistry"
| project TIMESTAMP , TaskName , ActivityId , subscriptionId , correlationId , principalPuid  , operationName , httpMethod , targetUri
```

1. Copy the Principal PUID
2. Launch ASC
3. Navigate to Azure AD Explorer (Tenant Explorer)
4. Search with the Principal PUID captured above. This will give the user details on who initiated the deletion.

**Note:** There is no SLA for ACR Recovery Process. Do not commit any timeline to customer for the recovery.

## How To Recover Deleted Registry

The following conditions **must be satisfied** in order to initiate restore deleted ACRs:

1. Create an empty registry with same registry name in the same resource group/region/subscription (USER Action)
2. The SKU of the deleted ACR and new ACR should match
3. Ensure that the new registry is created without geo-replication or availability zones

### How To Find Deleted Registry SKU and Region

If the customer is not aware of which SKU and Region their registry was using, run the below KUSTO queries:

```kql
cluster("ACR").database("acrprod").RegistryMasterData
| where env_time >= ago(7d) // depending on when the ACR was deleted
| where LoginServerName == "<registry_name>.azurecr.io" // registryName has to be lowercase
| sort by env_time desc
| project env_time, ParentRegistryId, RegistryLocation, SkuId // Sku -> {1: Basic, 2: Std, 3: Premium}
```

| Number | SKU     |
|--------|---------|
| 1      | Basic   |
| 2      | Standard|
| 3      | Premium |

**IMPORTANT!** ACR recovery will not recover private endpoints/links if they were configured. Set expectations with the customer that they will need to recreate private endpoints/links after restoration.

### Contact a Technical Advisor (TA)

Once you have the above information and registry recreated (by customer), contact a TA to perform the recovery operation.

### Registry Recovery Operation for TAs

TAs can follow the "Recover a Deleted Azure Container Registry (Entire Registry)" guide in ACR Technical Advisors Actions (Jarvis/Geneva dashboard).

### Recovery for Gov Registries

For Gov clouds (such as Fairfax):

1. Open an ICM to the ACR Product Group for recovery
2. Contact your TA to inform them that an ICM is being opened for a Gov registry recovery (they do not need to perform the regular recovery workflow)

The escalation to ICM is driven by the escort requirements for using Jarvis in Gov cloud environments.

## Point of Contact

- `alfdia@microsoft.com`
- `acrsup@microsoft.com`
