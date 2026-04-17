---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/ACR Image or Repository Recovery"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Image%20or%20Repository%20Recovery"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ACR Image or Repository Recovery

Customers sometimes "accidentally" delete images from ACR that they need. Even though ACR does support soft deletes, not all clusters are using it, _or_ a customer may want to recover an image that is too old for soft-delete to retrieve.

[The default retention period for soft-delete is seven days](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-soft-delete-policy).

## Mitigation Steps

1. To see deleted repositories you can use this Kusto query:

   ```sql
   cluster('acr').database('acrprod').RegistryManifestEvent
   | where PreciseTimeStamp > ago(1d)
   | where  Registry == "registryname.azurecr.io"
   | where Action == "DeleteRepository"
   | project PreciseTimeStamp, message, Registry, Action, Artifact, ArtifactType, Tag, SubscriptionId, Digest
   ```

2. From the output of this query note down the ArtifactType.

   Unfortunately the output of the above query does not provide the tag, but we can get it from another query IF the repository was not created more than 30 days ago, if it was created more than 30 days ago you'll have to get the tag from the customer if they did not provide it already

   ```sql
   cluster('acr').database('acrprod').WorkerServiceActivity
   | where env_time > ago(1d)
   | where Repository == "aks-helloworld" 
   | where RegistryLoginUri == "registryname.azurecr.io"
   | extend Count = 1
   | distinct Repository , Tag, Digest, Count, OperationName, PreciseTimeStamp
   ```

   Also if there are multiple tags, then we'd need to verify with the customer which one to restore.

   Once you have the above details, please reach out to your TA to do the recovery of the image/s.

## Owner and Contributors

**Owner:** Luis Alvarez <lualvare@microsoft.com>
**Contributors:**

- Christopher Hanna <chrhanna@microsoft.com>
- Hanno Terblanche <hanter@microsoft.com>
