---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/How to Register Server Endpoint with Restricted Network or Proxy Firewall_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FHow%20to%20Register%20Server%20Endpoint%20with%20Restricted%20Network%20or%20Proxy%20Firewall_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-Sync

- cw.How-To

- cw.Reviewed-10-2023

---

 

:::template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

:::

 

[[_TOC_]]

 

# Overview of this document



This document is HowTo guide for registering server endpoint with restricted network, Proxy or Firewall.

Especially, this document introduces configuration for registering with GUI.





# Required FQDN for Azure File Sync



Public document describes minimum domain list for Azure File Sync.



[**Azure File Sync proxy and firewall settings - Firewall**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-firewall-and-proxy#firewall)



If Cx want to use ServerRegistoration.exe (GUI) for server registration, they need to allow additional domains.

Because logon windows on GUI needs to access additional domains, Cx should allow the domains in below public document (Azure portal authentication domains are needed).



 [**Allow the Azure portal URLs on your firewall or proxy server**](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-safelist-urls?tabs=public-cloud)







## References for Required Domains

* IcM

  * [**CRI 428997379**]( https://portal.microsofticm.com/imp/v3/incidents/incident/428997379/summary)



 

# How to setup with proxy environment



## Setup with public document

Azure File sync supports both Application Specific Proxy settings and Machine-Wide Proxy Settings.

Cx can select that they use which settings.





[**Azure File Sync proxy and firewall settings - Proxy**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-firewall-and-proxy#proxy)

  



## Additional Proxy Setting for Registering Server with GUI

If Cx want to use ServerRegistration.exe (GUI) for server registration, they need to setup additional proxy settings.

On this scenario, Cx need to setup WinINet proxy settings from internet option because logon windows refer WinINet proxy settings.



![Settings of WinINet](/.attachments/SME-Topics/Azure-Files-Sync/How-to-Register-Server-Endpoint-with-Restricted-Network-or-Proxy-Firewall_Settings-of-WinINet.png)





 

## Tips for proxy setting

### Set up with authentication proxy server

If Cx want to use authentication proxy server, the easiest way to set up is using Application Specific Proxy Settings.

Because, WinHTTP cannot set user name and password for authentication proxy server, it is very hard to set up on WinHTTP.



### Set up with proxy bypass list

Application Specific Proxy settings does not have any ways to set bypass list.

If Cx want to use bypass list, they need to use Machine-Wide Proxy settings.



## use private endpoint with proxy

If Cx set up for using proxy, all domain resolutions related to the communications with AFS services are executed on the proxy server.



To access private endpoint for AFS and cloud endpoint, Cx need to set up one of below option. 



-  proxy server resolve host name to private endpoint IP address.

- add bypass list on the server endpoint and the host name for AFS and cloud endpoint are resolved on the server endpoint to private IP address.











## References

 

* Public document

  * [**Azure File Sync proxy and firewall settings**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-firewall-and-proxy)

  * [**Allow the Azure portal URLs on your firewall or proxy server**](https://learn.microsoft.com/en-us/azure/azure-portal/azure-portal-safelist-urls?tabs=public-cloud)

 



::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md

:::


