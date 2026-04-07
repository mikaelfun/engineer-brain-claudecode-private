---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/ACR private link troubleshooting questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20private%20link%20troubleshooting%20questions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ACR Features Enabled

The following questions should be asked to customers in order to start diagnosing private link related issues for an Azure Container Registry. Please use these questions with discretion. This is to enable us to get information around the issue during the FQR.

1. **_Does the ACR have service endpoints enabled?_**

_Notes:_ Service endpoint and private endpoint are not compatible. Service endpoints must be disabled.

_How to check:_ Set the Azure CLI account to the subscription of the ACR. Run `az acr network-rule list -n <Registry Name> --query virtualNetworkRules` to check for service endpoints.

**_2. Does the ACR have firewall rules enabled?_**

_Notes:_ Client firewall rules can cause pull failures for an ACR with private endpoints.

_How to check:_ Set the Azure CLI account to the subscription of the ACR. Run `az acr network-rule list -n <Registry Name> --query ipRules` to check for firewall rules.

**_3. Does the ACR have public network access disabled?_**

_Notes:_ When public network access is disabled, clients outside the private link's virtual network are unable to access the registry endpoints.

_How to check:_ Set the Azure CLI account to the subscription of the ACR. Run `az acr show -n <Registry Name> --query publicNetworkAccess` and verify the output is "Disabled".

**_4. Does the ACR have trusted services enabled?_**

_Notes:_ When public network access to a registry is disabled, certain services, such as Azure Security Center, will be unable to access the ACR. Enabling trusted services on the registry will allow only Azure trusted services to bypass the registry's network restrictions. To view the list of trusted services for a network restricted registry, reference [Trusted services](https://docs.microsoft.com/en-us/azure/container-registry/allow-access-trusted-services#trusted-services).

_How to check:_ Set the Azure CLI account to the subscription of the ACR. Run `az acr show -n <Registry Name> --query networkRuleBypassOptions` and verify the output is "AzureServices".

_**5._Geo-replications:_Does the ACR have geo-replication enabled? If yes, have you created additional DNS settings for each replication endpoint?**_

_Notes:_ You must setup each geo-replication's data endpoint CNAME in the private link DNS zone in order for that replication to be reachable.

_How to check:_ See Additional records for [geo-replications](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link#additional-records-for-geo-replicas).

## DNS Resolution Checks

**_1. Have you run the "az acr check-health" command?_**

_Notes:_ You can verify the DNS settings of the virtual network that route to a private endpoint by running az acr check-health with the --vnet flag.

_How to check:_ Set the Azure CLI account to the subscription of the ACR. Run `az acr check-health -n <Registry Name> --vnet <VNet Name or Resource ID>`. For more information, reference [Check registry access in a virtual network](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-check-health#check-registry-access-in-a-virtual-network).

**_2. Are requests to the ACR going through a public or private IP address?_**

_Notes:_ If a private endpoint connection is enabled, then the resolved IP address of your registry login server should be a private IP address in your VNET. If the private endpoint was disabled and the resolved IP address is still private, then there is a DNS caching issue. See instructions below for flushing your local DNS cache.

_How to check:_ Please reference Validate [private link connection](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link#validate-private-link-connection).

**_3. For DNS resolution issues, have you tried flushing your local DNS cache?_**

_Notes:_ For more info on how the ACR DNS should resolve, see [Validate private link](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link#validate-private-link-connection) connection. Flushing the local cache can resolve stale DNS issues.

_How to check:_ For Linux users, run **_sudo systemd-resolve --flush-caches_**. For Windows users, run **_ipconfig /flushdns_**.

## Resource Management Checks

**_1. Do you have a deletion lock on the resource group of the private link?_**

_Notes:_ This will cause registry delete to fail when there is a private endpoint corresponding to this private link.

_How to check:_ Set the Azure CLI account to the subscription of the private link. Run `az group lock list -g <Private Link Resource Group Name>`.

**_2. Is the ACR resource provider registered in the private link subscription?_**

_Notes:_ This is a prerequisite for setting up private endpoints for an ACR. See [Prerequisites](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link#prerequisites).

_How to check:_ Set the Azure CLI account to the subscription of the private link. Run `az provider show -n Microsoft.ContainerRegistry --query registrationState`.

**_3. Have you reached the maximum allowed private endpoint count for your ACR?_**

_How to check:_ Set the Azure CLI account to the subscription of the ACR. Run `az acr show-usage -n <Registry Name>` to view the current usage for PrivateEndpointConnections.

[Update](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link):  
_Starting October 2021, new container registries allow a maximum of 200 private endpoints. Registries created earlier allow a maximum of 10 private endpoints. Use the az acr show-usage command to see the limit for your registry._

If the registry was created before this cut-off date and the customer needs the new version 2 limit of 200, please reach out to your TA and request they migrate the registry endpoints to version 2 for the customer.

## Client Configuration

**_1. What client are you using to access the ACR (ie, Azure Virtual Machine, AKS cluster, Azure App Service, etc)?_**

**_2. Does the client have firewall or proxy rules configured?_**

_Notes:_ Such client configuration can cause pull failures for an ACR with private endpoints if private endpoint routing is not configured. A client proxy may also strip request headers, causing authorization failures when pulling from an ACR with private endpoints.

**_3. Does your network topology include Azure Firewall service?_**

_Notes:_ Requests from the client to the ACR will be blocked if the Azure Firewall service is not configured with rules to allow private endpoint routing. For more information, see [Outbound connectivity](https://docs.microsoft.com/en-us/azure/firewall/rule-processing#outbound-connectivity).

**_4. Are you able to access the ACR through a similar resource (ie. another Azure VM, another cluster, etc)?_**

**_5. Is the client on Microsoft CorpNet (MSFTVPN)?_**

_Notes_: CorpNet can impact the functionality of private endpoints even if public network access is not disabled on the registry.

Reference:
[Document](https://eng.ms/docs/cloud-ai-platform/azure/azure-core-compute/containers-bburns/azure-container-registry/azure-container-registry/topics/private-link-troubleshooting-questions).

## Owner and Contributors

**Owner:** Hanno Terblanche <hanter@microsoft.com>
**Contributors:**

- Jadranko Tomic <jatomic@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Sathana B <Sathana.B@microsoft.com>
