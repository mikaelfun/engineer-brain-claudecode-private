---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Platform and Tooling/Tools/Jarvis/ACR Technical Advisors Actions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Technical%20Advisors%20Actions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Geneva Actions for Technical Advisors to help support ACR

[[_TOC_]]

Certain Geneva Actions have been opened to Technical Advisors to provide assistance to the Azure Container
Registry Team. Those actions are listed below.

A few things before following steps below:

- These actions require Technical Advisors to request access to the **TM-Krater-CSS-TA-JITAccess** Security Group in OneIdentity via <https://oneidentity.core.windows.net/>
- These requests from customers no longer require an IcM to Azure Container Registry. Please reach out to your Technical Advisor.
- If you do not have a Technical Advisor, you can reach out to the [global TA email](mailto:actetaglobal@microsoft.com) to see who can help.

## Increase Private Endpoints to 200 for ACR

To help your Technical Advisor before you hand over the incident to them:

1. Request details from customer
    - ACR login server URI.
    - Subscription Id
    - First verify if all registry Private Endpoints are in "Succeeded" provisioning state.
        - Please use the Get Registry Private Endpoints Geneva Action. If they are in "Succeeded", you might not be able to have your TA move to the 200 Max Quota. Please reach out to ACR team.

2. You can send your TA the [documentation](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-container-registry/registry/topics/private-link/private-link-v2-migration) on how to run the action.
     - Use ACIS action Azure Container Registry > User Registry Management > Migrate to V2 private endpoints
     - This ACIS action will simply drop a message to the Notification Service, which will then be handled by appropriate handlers. It will increase ACR PrivateEndpointConnections from 10 to 200 which is the max quota.

## Important note before restoring ACR(s) with TBs of data

If you restore ACR(s) that have TBs of data, you may get the following distinct outputs:

1 - `Failed to execute operation after 10800 seconds. _Inner Exception: None. For more logs please click on the DGrep link next to the ActivityId.`

2 - `activity id <id> and Registry {registryLoginServer} has been restored. Proceeding to do a size recalculation of the registry (non-critical)`

This means the operation was successful. It is important you do not run the restore operation again.

The failed to execute is a timeout from non critical code in the restore. This was seen for some of the TB registries when restored and PG is working on a fix so it won't timeout.

But for the critical path if you see the below in the output, the restore operation has succeeded. And for TB registries it can take up to 24 hours or longer for all the images to show in the registry.

`"Registry {registryLoginServer} has been restored. Proceeding to do a size recalculation of the registry (non-critical)"`

## Recover a Deleted Image from an Azure Container Registry (Repository only)

1. If not yet provided, ask the customer for the information below (if they don't know the tag try the query below).
    - Subscription
    - Registry Login Server URI (xxxx.azurecr.io)
    - Repository Name
    - Image Tag **or** Blob Sha (sha256:shavalue) - **This will be needed for each and every requested restoration**
    - ACR Image Type (this will be "acr.docker" most of the time)

    **NOTE:** You can get the tag IF the repository was not created more than 30 days ago, if it was created more than 30 days ago you will have to get the tag from the customer if they did not provide it already.

    ```sql
    cluster("ACR").database("acrprod").WorkerServiceActivity
    | where env_time > ago(1d)
    | where Repository == "aks-helloworld" 
    | where RegistryLoginUri == "hannocreg.azurecr.io"
    | extend Count = 1
    | distinct Repository , Tag, Digest, Count, OperationName, PreciseTimeStamp
    ```

2. It is important to set customer expectations as is not 100% guaranteed that will have the image restored even if the images were deleted before 14-30 days. We are helping the customer on best effort.
3. Use the [Azure Container Registry > User Registry Management > Get Registry Contents](https://jarvis-west.dc.ad.msft.net/81D8093B?genevatraceguid=c9c4dce4-3f86-40c3-bb3d-bd72fb93bb3c) JARVIS action on a SAW device to make sure the image does **not** already exist in the registry.
4. (Optional) You can use Kusto to query information on the deleted repository.

    ```sql
    cluster("ACR").database("acrprod").RegistryManifestEvent
    | where PreciseTimeStamp > ago(1d)
    | where  Registry == "hannocreg.azurecr.io"
    | where Action == "DeleteRepository"
    | project PreciseTimeStamp, message, Registry, Action, Artifact, ArtifactType, Tag, SubscriptionId, Digest
    ```

5. If image with the same tag still exists in the registry, you can search delete event in kusto logs to retrieve the digest of deleted images (there could be several, confirm the approximate time with the customer that desired image was deleted.)

    - In this case, the TA would recover an untagged image.
    - The customer can pull image by digest, then tag image with original tag and push the image back to repository.

    ```sql
    cluster("ACR").database("acrprod").WorkerServiceActivity
    | where env_time > ago(1d)
    //| where OperationName == "ACR.Layer: AddManifestRefAsync-Succeed"
    | where RegistryLoginUri == "xxxxxx.azurecr.io"
    //| where Repository contains "xxxxxx"
    //| where Tag contains "xxxxxx"
    | summarize count() by Repository, Tag, Digest, OperationName, PreciseTimeStamp, ImageType
    ```

6. Use the [Azure Container Registry > User Registry Management > Restore a Deleted Image](https://jarvis-west.dc.ad.msft.net/F1C24E06?genevatraceguid=e90ea421-95e6-4e58-b1a8-eb24dc98cdea) JARVIS action on a SAW device to restore the registry

### Single Repository Restore

The default option will be to restore one Repository at a time. Fill in the fields using the information gathered in step 1 above then submit the request to Get Access and Run the action.

Be sure to request elevated permissions under the Scope to use "ACRSupportElevated".

### Multiple (Batch) Repository Restore

If multiple Repositories and/or Tags need restored, use the following steps as a guide:

1. Change the Input Mode from Single to Batch by toggling the option at the top right (see screenshot below)
2. The UI will change and allow input in the Parameters field using a comma delimited list
3. Use the following format as an example to recover the images. ("tag123", "tag456" and "tag789" are example tag names)

```code
subscription,registrylogin,reponame,tag123,,docker,false
subscription,registrylogin,reponame,tag456,,docker,false
subscription,registrylogin,reponame,tag789,,docker,false
```

Be sure to request elevated permissions under the Scope to use "ACRSupportElevated".

![Batch Restore JARVIS Action screenshot](wiki-image-restore-deleted-repo.png)

## Recover a Deleted Registry of Azure Container Registry (entire registry)

In the past when a customer ôaccidentallyö deleted their ACR we would have to submit an ICM to recover the repos/images, now we (TAÆs) can do this too.

**NOTE!:** If the customer had Private Endpoints, Webhooks, etc they will need to re-create those. Please tell the customer to wait to create those until AFTER we have done the restore through our Geneva Action.

1. Create a new registry with same registry name in the same resource group/region/subscription **(USER Action)**
In addition, the `SkuId` of the deleted ACR and new ACR should match. { 1: Basic, 2: Standard, 3: Premium }.

   - Ensure that the new registry is created with geo-replication turned **off**.
   - Ensure that the deleted registry had CMK **disabled**.
   - **NOTE:** If the customer had Private Endpoints, Webhooks, etc they will need to re-create those. Please tell the customer to wait to create those until **AFTER** we have done the restore through our Geneva Action.
   - Ensure that the new registry is created without geo-replication or availability zones.
   - Ensure that the new registry is created with the same **domain name label scope** as the old registry
      - Scenarios:
        - If the old registry was created with domain name label scope equal to **`Unsecure`**:
          - Then its domain name would have looked like `ykrsea.azurecr.io`.
          - We want the new domain to be the same, so the new registry should also be created with domain name label scope equal to `Unsecure`.
        - If the old registry was created with `Tenant`, `Subscription`, or `Resource group` reuse, any of these domain name label scopes can be chosen.
          - Any option selected will create a domain with the same hashed string appended to the subdomain (like `ykrsea-1234234.azurecr.io`.
        - If the old registry was created with `No Reuse`, we cannot recover the registry, since the old subdomain cannot be reused.
      - **NOTE:** If the customer created the registry with `Subscription` or `Resource group` reuse, and later moved their registry to another `Subscription` or `Resource group`, and then deleted the registry, then the new registry they create must be in the original `Subscription` or `Resource group`, since the hash does not get updated when they move their registry

2. Check that the new registry does not contain any data
   1. Use the following ACIS actions:
   _Azure Container Registry > User Registry Runtime Operations > Get Repositories Count_
   or
    _Azure Container Registry > User Registry Management > Get Registry Contents_

   2. If the new registry contains any images these will be lost/deleted, and a new tombstone entity will be created for it. Notify the customer if this is acceptable.

3. Query the _RegistryMasterData_ to find the deleted ParentRegistryId, In addition, the SkuId of the deleted ACR and new ACR should match. (1: Basic, 2: Standard, 3: Premium):
   1. Kusto query:

      ```sql
      cluster("ACR").database("acrprod").RegistryMasterData
      | where env_time >= ago(7d)
      | where LoginServerName == "<registryName>.azurecr.io" // Enter registryName in lowercase.
      | project env_time, LoginServerName, ParentRegistryId, SkuId, SubscriptionId, ResourceGroup, RegistryLocation, ReplicationRegions, ByokEnabled
      ```

      ![Alt text](image-1.png)

   2. The capital cased location is the home region, others are geo-replications From this query - ensure that a new registry has been created with the same SKU in same resource group/region/subscription. The SourceMoniker of "acrk8rpproddiagbl" belongs to the parent or primary region.
   If the old registry has CMK/BYOK enabled it is not possible to restore the registry. The images would be visible from the registry, but pull will fail because the managed identity is no longer associated with the restored registry.
   3. Kusto query:

      ```sql
      cluster("ACR").database("acrprod").WorkerServiceActivity
      | where env_time > ago(10d)
      | where RegistryLoginUri == "<registryName>.azurecr.io"
      | summarize count() by RegistryId, SourceMoniker
      ```

      ![Alt text](image-2.png)

      You will get the Old registry Id (the two queries above should have a matching ParentRegistryId and RegistryId)

4. Now that we have the deleted registryÆs ID we can restore:
   1. Enter the registry URI in the "Registry Login Server URI" section. Eg: _registryName_.azurecr.io
   2. Enter the RegistryId from the SourceMoniker of "acrk8rpproddiagbl" obtained from the previous query in the "Tombstone Partition Key" section
   3. First there is a JIT to get by, note the Scope and Access Level:
   ![Alt text](image-3.png)
   4. Once your JIT is approved you can Run the action with the suggestion to do a Dry Run first to see if the restore will succeed:
   ![Alt text](image-4.png)
   5. If the dry run says it would restore the registry, go ahead and run it without the Dry Run option to do the actual restore, once done you should see the below output:
   ![Alt text](image-5.png)
   6. Additional documentation - [Restore a deleted registry | Azure Container Registry (eng.ms)](https://eng.ms/cid/7007e2bd-838a-4ec1-a01b-cf155458c2d3/fid/b125c805458b71d9e26f5bddcd7ff4d889ed678a463a66452fb3b15085a4aeba)

### Notes

- The action will do 3 main things:

   1. Restore the registry (point the new registry to use the old storage, update the registryId).
   2. Delete the Tombstone Entity for the deleted registry (so the containers are not deleted by the expiration policy in Tombstone)
   3. Create a new Tombstone Entity for the registry that was replaced (so the old containers are not orphaned in case the user pushed anything to it)

- The critical part of the action (steps 1. and 2.) are idempotent (if any of these steps fail you should be able to run it again safely). Step 3. is not idempotent, if step 3. fails the registry was still successfully restored and the Tombstone's Entity deleted, but the new registry's containers could still be orphaned.
- The entities that are going to be changed are (Registry Master, SMap and Tombstone). These entities are currently located in a Storage Account Table RestoreBackUp.
- After the restore is finished validate if the registry works. Please note that the user has to use the new registry credentials. We cannot restore the auth information for the registry.
- You can also run other Jarvis actions to confirm restoration. For instance, _User Registry Runtime Operations > Get Repository Count_ will enumerate the repositories in the registry.
- The tombstone entity will exists for 90 days from the original deletion date, recovering anything older than 90 days is not currently supported
- After recovery, if the customer cannot view the ACR in the CLI/Portal then you may need to sync the resource state in ARM.

5.Now the registry is restored and the customer should see the repos and images.

## Update Identity used in CMK property

This TSG helps restore access to the registry when an identity used to access the key vault is deleted. It does not recover the registry if Key vault or key used in the CMK property is deleted. When Key or Key vault is deleted, we need to ask the customer to recover the Key vault and the key.

You can get the Key Id by running the Jarvis action "Get Basic Registry Detail". It's the value of the property UserProvidedKeyId. Verify that the customer is on the same page about the KeyId used in the CMK property.

![Snippet of the Get Basic Registry Details Jarvis Action, highlighting the UserProvidedKeyId attribute in the response.](/.attachments/acrcmk-1.png =1000x)

You can also see the ClientID of the deleted or removed identity with "Get Basic Registry Detail", it is the property called ôIdentityIdö

![Snippet of the Get Basic Registry Details Jarvis Action, highlighting the IdentityId attribute in the response.](/.attachments/acrcmk-2.png =1000x)

### The user deleted the user assigned identity associated with the registry

1. Ask the customer to create a new user assigned identity. Assign get, wrap, unwrap key permission to this user assigned identity on the key vault used in CMK property. Now ask the customer to share the client id of this user assigned identity.

    Get client id using below command

    ```sh
    az identity show -n <newUserIdentity> -g <resourceGroup> --query clientId
    ```

    Get object id using below command

    ```sh
    az identity show -n <newUserIdentity> -g <resourceGroup> --query principalId
    ```

    Assign permission to this new identity

    ```sh
    az keyvault set-policy -n <key vault name> --key-permissions get wrapKey unwrapKey --object-id <object id/principal id from last command>
    ```

2. Once we get the client ID. We use the Jarvis action "Update identity used in CMK property" located under ôUser Registry Managementö, to update the client id used in the CMK property.

    JIT access is needed as follows:

    ![Screenshot of the JIT request window in Jarvis for ACR, highlighting the elevated Scope value of ACRSupportElevated and the Access level of PlatformServiceAdministrator](/.attachments/acrcmk-3.png =500x)

3. Users need to go to the registry and add their identity to the registry.

    If User is keeping the identity resource URI same, use the below AZ CLI command

    ```sh
    az acr identity assign --identities <resource id of the identity e.g/subscriptions/<sub id>/resourceGroups/<resource group name>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<identity name> -n <registry name>
    ```

    If the new identity resource URI is different from the old identity resource URI, use the below CLI command to remove the deleted identity and add a new identity.

    First get the identity type

    ```sh
    az acr identity show -n <registry name> -g <registry resource group> --subscription <subscription Id> --query "type"
    ```

    Existing Identity type will be either userassigned or systemAssigned, userAssigned.

    Then run the below command to update the identity.

    ```sh
    az rest --method PATCH --uri /subscriptions/<sub id>/resourcegroups/<resource group name>/providers/Microsoft.ContainerRegistry/registries/<registry name>?api-version=2022-02-01-preview --body "{\"identity\":{\"type\":\"<Existing Identity type>\",\"userAssignedIdentities\":{\"/subscriptions/<sub id of new identity>/resourceGroups/<resource group name of new identity>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<Identity getting added>\":{}, \"/subscriptions/<sub id od deleted identity>/resourcegroups/<resource group name of deleted identity>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<Identity which has been deleted>\":null}}}"
    ```

    It should be successful, and can be verified by checking the property called ôIdentityIdö with the action  "Get Basic Registry Detail"

    The registry should recover. Normal push and pull operation should recover. Users may see issues in the "Encryption" blade in the portal.

4. To recover the encryption blade ask the customer to remove all the unused or deleted identities from the identity blade.

Once that's done ask the user to refresh the browser. The blade should recover.

### The user removed/deleted the system assigned identity associated with the registry

1. Try enabling the system assigned identity of the registry. The operation will fail, but it will create an identity associated with the registry in the backend.

    ```sh
    az acr identity assign --identities [system] -n <registry name>
    ```

2. Assign permission to this new identity

    ```sh
    az keyvault set-policy -n <key vault name> --key-permissions get wrapKey unwrapKey --object-id <object id/principal of the new system assigned identity>
    ```

3. Repeat step 1. This time operation should succeed.

    ```sh
    az acr identity assign --identities [system] -n <registry name>
    ```

## Recalculate And Update-Registry Size Operation

### Azure Container Registry Storage

ACR offers different service tiers with different storage features and limits. This document will explain the differences between included and additional storage, and what are the storage limits for each service tier. Additionally, the doc explains what CSS or ACR DRIs can do when an ACR customer reaches those storage limits.

### Included vs Additional Storage for ACRs

Each service tier of ACR gives you a certain amount of storage space for your artifacts at no extra cost. This is called included storage. If you use more storage space than your service tier allows, you will have to pay for the extra storage space. This is called additional storage. You donÆt need to contact Azure Support to get more storage space, because it is added automatically when you need it. You can keep using additional storage up to the 20 TB storage limit.

The price of additional storage depends on how much extra storage space you use. The more you use, the more you pay. You can see the prices for additional storage on the Azure Container Registry Pricing page.

The table below outlines the included storage for each registry tier. This information is publicly documented at Service tier features and limits.

```sh
Resource           Basic Standard  Premium
Included Storage (GB)   10   100     500
Storage Limit (TB)     20   20     20
```

### Storage Beyond the 20 TB Limit

Customers that reach the 20 TB storage limit will no longer be able to push new images to the registries. These customer may reach out to Azure Support for additional capacity. If so, contact ACR PG to increase the storage limit. Customer will pay the per-GB rate for any added storage used. After the ACR PG increases the storage limit, customer will be able to push to their registries.

### View the Current Storage Usage for a Registry (Customer Only)

Customers can view their current size usage on the Azure portal or with Az CLI.

NOTE: Customers today cannot view their storage limit. As noted in the table above, all service tiers have a 20 TB limit for storage usage. Customers can reach out to Azure Support to get this limit increased if needed. However, the updated limit is not available to customer through either of the methods below. See View the Current Storage Limit for a Registry for info on how to see the current size limit per registry.

### Azure portal

Customers can check how much storage space their registry is using by going to the Monitoring tab on the registry resource home page. In the example below, the current storage usage of registry jumboregistry is 20.01 TB. Since the registry is Premium tier, the included storage is shown as 500 GB. The additional storage 19.52 TB is the amount of used storage usage that exceeds the included 500 GB. The customer pays the additional storage rate for this 19.52 TB of usage.

![Alt text](/Azure-Kubernetes-Service-Wiki/.attachments/ACR-Technical-Advisors-Actions-image1.png)

### Az CLI

Customers can view their storage usage using the az acr show-usage command. The Size row indicates the included storage for the registry service tier and the current storage usage. The example above is for the same registry as that of the portal example. We see there is a 500 GB limit since the registry is Premium tier. Also, we see that the current usage is 20 TB, meaning that the customer is paying for additional storage.

![Alt text](/Azure-Kubernetes-Service-Wiki/.attachments/ACR-Technical-Advisors-Actions-image2.png)

### View the Current Storage Limit for a Registry

CSS and ACR DRIs can view the storage limit of the registry. By default, all service tiers have a limit of 20 TB. If requested by customer, ACR PG can increase this limit.

### ACIS

Run Get Basic Registry Details ACIS action to view the details of the registry.

The "SizeThresholdInTiB" field in the ACIS action output shows the current storage limit for the registry. The "SizeInGiB" field shows the current storage usage of the registry.

### Kusto

To view the current storage limit for a registry in Kusto, run the query:

```sh
cluster("ACR").database("acrprod").RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "jumboregistry.azurecr.io"
| project env_time, SizeThresholdInTiB = (tolong(SizeThresholdInGiB)/1024)
```

![Alt text](/Azure-Kubernetes-Service-Wiki/.attachments/ACR-Technical-Advisors-Actions-image3.png)

## Owner and Contributors

**Owner:** Tom Klingenberg <tklingenberg@microsoft.com>

**Contributors:**

- Tom Klingenberg <tklingenberg@microsoft.com>
- Luis Alvarez <Alvarez.Luis@microsoft.com>
- Thane Schaff <thschaff@microsoft.com>
- Eddie Neto <Edervaldo.Neto@microsoft.com>
- Breanna Thompson <brethompson@microsoft.com>
