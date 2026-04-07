---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/Platform and Tooling/Tools/Jarvis/ACR Jarvis Actions New"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Jarvis%20Actions%20New"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Jarvis Actions for ACR

[[_TOC_]]

Recently we have been provided with the ability to view ACR Private endpoints and the "Master Entity" for ACR using Jarvis, this allows us to see the details fo the private endpoints that a customer has configured on their ACR and also any Firewall rules they have created on their ACR.

**JIT access to these actions are provided through the security group "TM-Krater-CSS-JITAccess" (<https://oneidentity.core.windows.net/>), if you are not a member of this group you can check with your TA.**

## ACR Private endpoints

To view the Private endpoints created on an ACR first you will need to get a SAVM up and running, once logged in navigate to the main Jarvis/Geneva Actions website (aka.ms/jarvis), then click on actions, and authenticate with your AME credentials/yubikey, now you can use the "Filter" to find the registry actions, or use this short link to go straight to the ACR actions - [https://portal.microsoftgeneva.com/98B4AA38?genevatraceguid=ef0708ff-4d40-4ef3-82f7-fae91ef7f626](https://portal.microsoftgeneva.com/98B4AA38?genevatraceguid=ef0708ff-4d40-4ef3-82f7-fae91ef7f626):

![Expanded Jarvis Actions tree for ACR](/.attachments/acrj-1.png =800x)

Now expand the "Azure Container Registry" folder in the left pane then "User Registry Management" click on "Get Registry Private endpoints", fill in the Login Server of the ACR and click "Get Access" to initiate JIT:

![Get Registry Private Endpoints Jarvis Action selected from the left menu and with the registry login server URL specified](/.attachments/acrj-2.png =800x)

JIT for ACR is slightly different in that there are two options that have to be changed, the "Scope" which should be ACRSupport and the "Access Level" which should be PlatformServiceOperator", the "Work-item id" can be any ICM or Jit ICM as for AKS, hit submit to start the Jit notification and approval process (same as for AKS):

![ACR JIT form showing a work item ID, the correct JIT scope, and Access level](/.attachments/acrj-3.png =500x)

### Private Endpoint Use Example

If a customer submits a support request saying that they are not able to connect to or pull images from ACR, or if they complain they get an error like the below examples:

Error example if trying a Docker login to the ACR:

```sh
Could not connect to the registry login server 'registry.azurecr.io'. Please verify that the registry exists and the URL 'https://$Registry.azurecr.io/v2/' is reachable from your environment. 
```

Error example of failed pull from AKS:

```sh
Events:
  Type     Reason     Age                  From               Message
  ----     ------     ----                 ----               -------
  Normal   Scheduled  3m15s                default-scheduler  Successfully assigned default/azure-vote-front1-544fc9b5b9-wnvct to aks-agentpool-13857690-vmss000000
  Warning  Failed     61s (x2 over 2m14s)  kubelet            Failed to pull image "hannocreg.azurecr.io/azure-vote-front:v1": rpc error: code = Unknown desc = failed to pull and unpack image "hannocreg.azurecr.io/azure-vote-front:v1": failed to resolve reference "hannocreg.azurecr.io/azure-vote-front:v1": failed to do request: Head "https://hannocreg.azurecr.io/v2/azure-vote-front/manifests/v1": dial tcp 12.0.0.5:443: i/o timeout
  Warning  Failed     61s (x2 over 2m14s)  kubelet            Error: ErrImagePull
  Normal   BackOff    46s (x2 over 2m13s)  kubelet            Back-off pulling image "hannocreg.azurecr.io/azure-vote-front:v1"
  Warning  Failed     46s (x2 over 2m13s)  kubelet            Error: ImagePullBackOff
  Normal   Pulling    34s (x3 over 3m14s)  kubelet            Pulling image "hannocreg.azurecr.io/azure-vote-front:v1"
```

This could happen if the ACR has private endpoints enabled, and if the client is not on a VNET where the private endpoint is connected and public access is disabled, to verify this we can get the details of the private endpoints from the output of the Get Registry Private Endpoints Jarvis action.

Specifically the property you are looking for in the output is the "NRP PE ID", as this provides the resourceID of the private endpoint which we can then find in ASC to see which VNET it is connected to and then verify if the client is on the same VNET as the private endpoint to allow it to resolve the private DNS records and connect over the endpoint:

![The results of running the Get Registry Private Endpoints action with the NRP PE ID highlighted](/.attachments/acrj-4.png)

## ACR Firewall rules

To view the Firewall rules a customer might have enabled on their ACR, when the "Selected Networks" option is enabled on ACR, we can now use the "Get Registry Master Entity" action in Jarvis to see the IP Rules that are configured. The JIT process for this is the same as above for private endpoints, although if you already have JIT access for one, you don't need to repeat it for the other.

Again you can use the "Filter" to find the registry actions, or use this short link to go straight to the ACR actions - <https://portal.microsoftgeneva.com/98B4AA38?genevatraceguid=ef0708ff-4d40-4ef3-82f7-fae91ef7f626> -, expand the "Azure Container Registry" folder in the left pane then "User Registry Management" click on "Get Registry Master Entity", fill in the Login Server of the ACR and click "Get Access" to initiate JIT if needed or just Run:

![An expanded list of Jarvis Actions for ACR which highlights the Get Registry Master Entity action.](/.attachments/acrj-5.png =1000x)

## ACR Firewall Use Example

If a customer submits a support request saying that they are not able to connect to or pull images from ACR, or if they complain they get an error like the below examples:

Error example if trying a Docker login to the ACR:

```sh
Error response from daemon: Head https://pvtacr.azurecr.io/v2/hello-world/manifests/latest: denied: client with IP '20.120.109.180' is not allowed access. Refer https://aka.ms/acr/firewall to grant access. 
```

Error example of failed pull from AKS:

```sh
Events: 

  Type     Reason     Age                From               Message 

  ----     ------     ----               ----               ------- 

  Normal   Scheduled  75s                default-scheduler  Successfully assigned default/azure-vote-front1-7f7bf69fff-swjsx to aks-agentpool-42204633-vmss000001 

  Normal   Pulling    36s (x3 over 74s)  kubelet            Pulling image "hannocreg.azurecr.io/azure-vote-front:v1" 

  Warning  Failed     36s (x3 over 74s)  kubelet            Failed to pull image "hannocreg.azurecr.io/azure-vote-front:v1": rpc error: code = Unknown desc = failed to pull and unpack image "hannocreg.azurecr.io/azure-vote-front:v1": failed to resolve reference "hannocreg.azurecr.io/azure-vote-front:v1": failed to authorize: failed to fetch anonymous token: unexpected status: 403 Forbidden 
```

This could happen if the ACR has Selected Networks/Firewall enabled, and if the client public IP is not allowlisted/allowed through the firewall, to verify this we can get the details of the IP Rules from the output of the Get Registry Master Entity Jarvis action.

Specifically the property you are looking for in the output is the "IP rules", as this provides the public IP's that have been allowlisted, and then verify if the client is using a public IP that is listed as allowed:

![Results of running the Get Registry Master Entity operation, highlighting the FirewallRulesEnabled and IpRules attributes.](/.attachments/acrj-6.png)

With these new actions we can reduce some of the back and forth required to get these details which can speed up time to resolution for these specific cases.

## Recalculate registry size and update registry size entry

The 'RegistrySize' table is updated by the indexing service. In case the registry experiences an issue where RegistrySize entry could not be updated successfully, one can use Recalculate and update registry size operation to verify/update the correct storage usage by a registry.

This action is located under "User Registry Management" in the Azure Container Registry category in Jarvis - Azure Container Registry > User Registry Management > Recalculate registry size and update registry size entry.

## Parameters

![Jarvis JIT Access request prompt, focusing on the Scope and Access level attributes](/.attachments/acrsize-2.png)

* Registry Login Server URI: the login server URL of a registry.
* Region: if a registry is geo-replicated, the operation will only run for the specified region.
* Confirm: if set to false, the operation will only show the recalculated registry size without updating the RegistrySize entry.

![Jarvis Actions input for Recalculating ACR registry size](/.attachments/acrsize-1.png =1000x)

### Limitation

Currently we only recalculate the storage taken by acr.docker, e.g., docker container images, Helm V3 charts. We may add support to acr.artifact images, e.g., Helm V2 chart files, in the future.

## Note

Due to the possibility of a data race in modifying the RegistrySize entry, the operation does not guarantee a success.
If you see following the following error message, you are safe to retry the operation until it succeeds.  

`Encountered conflict when updating RegistrySize table. Please retry the operation.`

---

## Owner and Contributors

**Owner:** Hanno Terblanche <hanter@microsoft.com>
**Contributors:**

- Hanno Terblanche <hanter@microsoft.com>
