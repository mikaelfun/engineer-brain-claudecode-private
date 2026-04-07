---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Foundational and Specialist Troubleshooting/Traffic Flow for a Private Only V2 Application Gateway Integrating with Backend and Key Vault"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTraffic%20Flow%20for%20a%20Private%20Only%20V2%20Application%20Gateway%20Integrating%20with%20Backend%20and%20Key%20Vault"
importDate: "2026-04-05"
type: troubleshooting-guide
---

**Traffic flow for a V2 application gateway that is private-only, integrating with backend and Key Vault**.

**Scenario**:

Application gateway V2 (private only)------> AzureFirewall------>Backend pool(webapp)

* Need to enable the **EnableApplicationGatewayNetworkIsolation** feature at the subscription level.

* Once this feature is enabled, we will be able to deploy the application gateway V2 with privateIP only.

  Under ASC:

  **Network Isolation Enabled: True**

* Pin the gateway subscription ID, then check the resources with the deployment ID under the resource group
armrg-455xxx-xxxx-xxxx-xxxx-xxxxxxxxx<Deployment ID>

* Once we identify the resource group with the deployment ID, we will find two load balancers:

  appgwILB

  appgwMgmtLoadBalancer

* The applicationGateway ILB will feature both a Frontend IP and backend pool IPs from the appgw Vnet/subnet used for data plane traffic.

* Similarly, management ILB and backend pool IPs will be obtained from the Management Vnet/subnet, which are used for control plane traffic.

* Typically, we observe health probe traffic, and actual live traffic uses the appgw instances' IP addresses.
We can clearly view the appgw instances information in ASC.

* However, for private-only appgw V2, we will see the management IPs under the instances in ASC.

* AzureFirewall data plane logs show that traffic is being received from the appgw instance IPs, not from the management IPs.

**Note**:
All dataplane traffic, including Key Vault, will utilize the application gateway subnet IPs.

**Contributors**

* Reshma Kasarla
* Lakshmi Srihitha Marisetti
* Yogananda Narasimhamurthy
