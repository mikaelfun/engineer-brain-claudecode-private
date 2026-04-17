---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/App GW with Spring Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApp%20GW%20with%20Spring%20Apps"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Description
This section will show you how to setup Application Gateway with Spring Apps

# Scenario

Recently worked on a case that involved App GW integrated with Azure Spring Apps inside a Virtual Network. Exposing Azure Spring Apps over a reverse proxy creats different scenarios in Azure: 

1. App GW with Spring Apps **inside** a VNET
2. Azure Front Door and App GW with Spring Apps **inside** a VNET
3. App GW with Spring Apps **outside** the VNET
4. Azure Front Door with Spring Apps **outside** the VNET

Reference: https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/microservices/spring-cloud-reverse-proxy#configuration-summary 

On this wiki, we'll be convering the 1st scenario where the configuration can be found in the following link, however, it's kind of confusing how they explain the configuration on the App GW.

Reference: https://docs.microsoft.com/en-us/azure/spring-apps/expose-apps-gateway-end-to-end-tls?tabs=public-cert%2Cpublic-cert-2#configure-application-gateway-for-azure-spring-apps

**Scenario 1: App GW with Spring Apps inside VNET**:

#Configuration

We will need to configure the App GW as usual. Indeed, the docs recommends integrating the App GW with Key Vault and for that you will need to follow the next doc: 

- Import certifiate in Key Vault: https://docs.microsoft.com/en-us/azure/key-vault/certificates/tutorial-import-certificate?tabs=azure-portal
- TLS termination with Key Vautl: https://docs.microsoft.com/en-us/azure/application-gateway/key-vault-certs

The routing rules are configured as usual and based on Cx needs the path will be needed or not: 
https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-components#request-routing-rules

Regarding now the configuration on the App GW, this will go as following: 

- The App GW backend pool can be the **IP** associated to the internal load balancer that it's created by default (**this is best practice to avoid point of failure with DNS resolution**) or the FQDN of the app.
- When you have an Azure Spring Apps as a backend the configuration will look similar to have a Web App on the backend due to the Spring Apps must have a custom domain configured to be able to received the traffic.

## DNS Configuration

As part of the prerequisites configuration there is a previous private DNS zone setup. You will need to make sure that the private DNS zones that host the A record of the default FQDN of the Spring Apps are correctly configured. This is because the App GW needs to have the correctly DNS resolution to the FQDN of the Spring Apps.
 
Reference: https://docs.microsoft.com/en-us/azure/spring-cloud/access-app-virtual-network?tabs=azure-portal

- The Private DNS zone should contain an A record pointing to the IP of the internal load balancer created by the Spring Apps. When looking into the VNET/subnet where the Spring Apps is in, on _Connected devices_ tab, you will notice 2 different _Kubernetes Internal_ Load Balancers. You will need to take the one that is under **service runtime Subnet**.

- After that you will need to make sure that the Private DNS zone is linked to the App GW & Spring Apps VNET to fully finish the DNS propagation. 

- Another way to do this will be to create the DNS private zone for the custom domain, then add the A record pointing to the same private IP address and link it to the App GW & Spring Apps VNET. 
  - **Note: this will be only in case Cx wants to put the custom domain in the App GW backend pool**

**Note: if the Cx uses the internal IP, they still have to override the hostname on the backend settings with the custom domain of the app.**
