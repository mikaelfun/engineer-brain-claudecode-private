# AKS ACR 认证与 RBAC — private-endpoint — 排查工作流

**来源草稿**: ado-wiki-a-acr-private-link-troubleshooting-questions.md, ado-wiki-acr-private-link.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: ACR Features Enabled
> 来源: ado-wiki-a-acr-private-link-troubleshooting-questions.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Features Enabled

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

#### DNS Resolution Checks

**_1. Have you run the "az acr check-health" command?_**

_Notes:_ You can verify the DNS settings of the virtual network that route to a private endpoint by running az acr check-health with the --vnet flag.

_How to check:_ Set the Azure CLI account to the subscription of the ACR. Run `az acr check-health -n <Registry Name> --vnet <VNet Name or Resource ID>`. For more information, reference [Check registry access in a virtual network](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-check-health#check-registry-access-in-a-virtual-network).

**_2. Are requests to the ACR going through a public or private IP address?_**

_Notes:_ If a private endpoint connection is enabled, then the resolved IP address of your registry login server should be a private IP address in your VNET. If the private endpoint was disabled and the resolved IP address is still private, then there is a DNS caching issue. See instructions below for flushing your local DNS cache.

_How to check:_ Please reference Validate [private link connection](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link#validate-private-link-connection).

**_3. For DNS resolution issues, have you tried flushing your local DNS cache?_**

_Notes:_ For more info on how the ACR DNS should resolve, see [Validate private link](https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link#validate-private-link-connection) connection. Flushing the local cache can resolve stale DNS issues.

_How to check:_ For Linux users, run **_sudo systemd-resolve --flush-caches_**. For Windows users, run **_ipconfig /flushdns_**.

#### Resource Management Checks

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

#### Client Configuration

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

#### Owner and Contributors

**Owner:** Hanno Terblanche <hanter@microsoft.com>
**Contributors:**

- Jadranko Tomic <jatomic@microsoft.com>
- Naomi Priola <Naomi.Priola@microsoft.com>
- Sathana B <Sathana.B@microsoft.com>

---

## Scenario 2: ACR Private Link
> 来源: ado-wiki-acr-private-link.md | 适用: 适用范围未明确

### 排查步骤

#### ACR Private Link


#### What is Azure Private Link

Azure Private Link enables you to access Azure PaaS Services (for example, Azure Storage and SQL Database) and Azure hosted customer-owned/partner services over a private endpoint in your virtual network.

Traffic between your virtual network and the service travels the Microsoft backbone
network. Exposing your service to the public internet is no longer necessary. You can create your own private link service in your virtual network and deliver it to your customers. Setup and consumption using Azure Private Link is consistent across Azure PaaS, customer-owned, and shared partner services.

**Azure Private Endpoint** is a network interface that connects you privately and securely to a service powered by Azure Private Link. You can use Private Endpoints to connect to an Azure PaaS service that supports Private Link or to your own Private Link Service.

##### Azure Private Endpoint Details

1. Private endpoint enables connectivity between the consumers from the same VNet, regionally peered VNets, globally peered VNets and on premises using VPN or Express Route and services powered by Private Link.

1. Network connections can only be initiated by clients connecting to the Private endpoint, Service providers do not have any routing configuration to initiate connections into service consumers. Connections can only be establish in a single direction.

1. When creating a private endpoint, a read-only network interface is also created for the lifecycle of the resource. The interface is assigned dynamically private IP addresses from the subnet that maps to the private link resource. The value of the private IP address remains unchanged for the entire lifecycle of the private endpoint.

1. The private endpoint must be deployed in the same region as the virtual network.

1. The private link resource can be deployed in a different region than the virtual network and private endpoint.

1. Multiple private endpoints can be created using the same private link resource. For a single network using a common DNS server configuration, the recommended practice is to use a single private endpoint for a given private link resource to avoid duplicate entries or conflicts in DNS resolution.

1. Multiple private endpoints can be created on the same or different subnets within the same virtual network. There are limits to the number of private endpoints you can create in a subscription. For details, seeAzure limits.

Public Documentation: <https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-overview#dns-configuration>

**Azure Private Link Service** is a service created by a service provider. Currently, a Private Link service can be attached to the frontend IP configuration of a Standard Load Balancer.

##### What is the relationship between Private Link service and Private Endpoint?

Private Endpoint provides access to multiple private link resource types, including Azure PaaS services and your own Private Link Service. It is a one-to-many relationship. One Private Link service can receive connections from multiple private endpoints. On the other hand, one private endpoint can only connect to one Private Link service.

##### DNS configuration

When connecting to a private link resource using a fully qualified domain name (FQDN) as part of the connection string, it's important to correctly configure your DNS settings to resolve to the allocated private IP address. Existing Azure services might already have a DNS configuration to use when connecting over a public endpoint. This needs to be overridden to connect using your private endpoint.

The network interface associated with the private endpoint contains the complete set of information required to configure your DNS, including FQDN and private IP addresses allocated for a given private link resource.

For complete detailed information about best practices and recommendations to configure DNS for Private Endpoints, please review [Private Endpoint DNS configuration article](https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-dns).

#### Custom DNS Configurations for ACR Private Link and different Scenarios

1. Introduction - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#1-introduction>
2. How DNS resolution works before and after Private Endpoints - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#2-how-dns-resolution-works-before-and-after-private-endpoints>
3. Azure Virtual Network DNS Integration - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#3-azure-virtual-network-dns-integration>
    1. Private DNS resolution within VNET - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#31-private-dns-resolution-within-the-vnet>
    2. Private DNS resolution between VNETs - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#32-private-dns-resolution-between-vnets>
    3. Private DNS resolution with Custom DNS inside the VNET - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#33-private-dns-resolution-with-custom-dns-inside-the-vnet>
4. On-Premises DNS integration - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#4-on-premises-dns-integration>
   1. Which conditional forwarder zone should be used? - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#41-which-conditional-forwarder-zone-should-be-used>
5. Architecture Design Example - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#5-architecture-design-example>
6. Validating DNS Resolutions - <https://github.com/dmauser/PrivateLink/tree/master/DNS-Integration-Scenarios#7-appendix-a---validating-dns-resolution>

#### Connect privately to an Azure container registry using Azure Private Link

Setting up ACR Private Link is mentioned at <https://docs.microsoft.com/en-us/azure/container-registry/container-registry-private-link>

1. Disable the private-endpoint-network-policy on the subnet where Private Endpoint will be created.
2. Create Private DNS Zone with privatelink.azurecr.io
3. Create an association between Private DNS Zone and VNET where Client machine is hosted.
4. Create Private Registry End Point.
   1. This creates 2 IPs from the subnet and assigns to the NIC created in step 4.
5. Now update the DNS zone with the IPs (Create A Record).

#### Testing

Perform `nslookup <registryname>.azurecr.io` and it should resolve to Private IP.

##### Useful References

* [Azure Private Endpoint DNS configuration](https://docs.microsoft.com/en-us/azure/private-link/private-endpoint-dns)
* [Logging and Monitoring](https://docs.microsoft.com/en-us/azure/private-link/private-link-overview#logging-and-monitoring)
* [FAQs](https://docs.microsoft.com/en-us/azure/private-link/private-link-faq)

---
