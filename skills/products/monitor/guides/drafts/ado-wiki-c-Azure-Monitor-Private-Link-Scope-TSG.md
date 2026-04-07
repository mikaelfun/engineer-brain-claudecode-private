---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Private link/Azure Monitor Private Link Scope"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FPrivate%20link%2FAzure%20Monitor%20Private%20Link%20Scope"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
::: 
 
 **Troubleshooting document for Azure Monitor Private Links** 

[[_TOC_]]

# Link to AMPLS Docs
https://learn.microsoft.com//azure/azure-monitor/platform/private-link-security

#AMA Private link brownbag
Here is the link to the recording of [AMA Private link brownbag](https://microsoft-my.sharepoint.com/:v:/p/rashmia/EfWp8owh0EVHoJ_2vJz9xX4B4allfKShs8FBJfQ8_wyPwA?e=JFqRQ0) 
#AMPLS Lab Tutorial: 
Here is the end to end tutorial for setting up AMPLS resource and sending app insights data over private link : [AMPLS App Insights Tutorial](https://microsoft-my.sharepoint.com/:w:/p/rashmia/EX4AIcSK8lpPsL2_1vjh9hQB7thhKTWwy5rP8YmE6N_kMA?e=uyymlA)


# Azure Private Link Networking TSG 
If you have a collab task with networking team, request them to follow this TSG to test private link connection 
(https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/336990/Private-Link-TSG)

# Support boundary for Montior and Networking support team
Please refer to [Support boundary document](/Log-Analytics/Support-Boundaries/Support-Boundary:-Azure-Monitor-Private-link) to determine if you need to engage networking team to help with the issue.  

#Troubleshooting AMPLS issues in ASC 

### Is there a troubleshooting training ?
Yes . It is available in the link here [AMPLS Demo and Troubleshooting](https://web.microsoftstream.com/video/f1b90840-98dc-a7ab-5214-f1eba6ac9d98)
### How to find AMPLS information in ASC

In ASC , navigate to resource explorer and the AMPLS resource can be found under microsoft.insights 

![image.png](/.attachments/image-2e8a2527-7a3b-4126-9b6a-3988d3e21dee.png)

###How to find the resources connected to AMPLS resource in ASC

The above AMPLS resource in ASC shows all the connected resources in the following tab. 
![connected resources.JPG](/.attachments/connected%20resources-76c58fbb-b2b5-4cf0-ac23-87b98cc2d66a.JPG)

### How do I find Network Isolation settings in ASC 

Navigate to LA workspace or AI component from the Resource Explorer. Under the Private Links Tab you can find the Network Isolation Settings set for the component or Workspace. 

![Network Settings.JPG](/.attachments/Network%20Settings-748bdeaf-eebc-4639-8b86-61d535b19c53.JPG)

**Network Isolation Settings in ASC:**

![Network Isolation settings.JPG](/.attachments/Network%20Isolation%20settings-3c8498ad-af72-440a-9923-36929e468503.JPG)



# Troubleshoot Azure monitor data not flowing through Private Link

**Issue:Data is not flowing / query-able from the VNET**

**Verify if customer is using custom DNS or Azure DNS.** 

When you're connecting to a private link resource using a fully qualified domain name (FQDN) as part of the connection string, it's important to correctly configure your DNS settings to resolve to the allocated private IP address

https://learn.microsoft.com//azure/private-link/private-endpoint-dns

If customer creates private dns zone, without records, then that will override global endpoints.
To avoid this, customer should first create a scope, create a PE to the scope. Then customer can create the Private DNS zone with the FQDNS in the PE. Traffic will flow through the Private Endpoint. 
https://portal.microsofticm.com/imp/v3/incidents/details/205484014/home

1] Confirm that the VNET has below Private DNS Zone attached. Also, make sure there are no NSGs / Firewalls blocking access. 

![privatelink2.png](/.attachments/privatelink2-4eef50bf-7288-4412-9e0d-211e3b7856f3.png)

2] Go to the private endpoint and make sure that below DNS Settings exist. Note that if customer does not associate a LogAnalytics workspace, the last three items won�t exist. 

 ![privatelink3.jpg.png](/.attachments/privatelink3.jpg-cd5ae137-49a9-4539-9b51-25b733b3bdab.png)

3] Login to the VM under question inside the VNET and run below commands for the part of product customer is complaining about. 

nslookup https://dc.applicationinsights.azure => This should point to the private ip for the service as shown above. 

Download https://www.elifulkerson.com/projects/tcping.php 

tcping <URL> 443 => This should show �Open�. 



| Product  | URL  |
|--|--|
| Application Insights Ingestion  |https://dc.applicationinsights.azure.com <br> FF: https://dc.applicationinsights.us  |
|Query   | https://api.monitor.azure|  
| Live Metrics  | https://live.monitor.azure.com(us,cn,eaglex.ic.go) |
|Profiler    | https://profiler.monitor.azure.com( us,cn,eaglex.ic.go) |
|Debugger   |  https://snapshot.monitor.azure.com(us,cn,eaglex.ic.go)|
| Log Analytics Workspaces  | https://{workspaceID}.agentsvc.azure-automation (net,us, cn, eaglex.ic.go)<br> https://{workspaceID}.oms.opinsights.azure.com(us,cn,eaglex.ic.go) <br>   https://{workspaceID}.ods.opinsights.azure.com(us,cn,eaglex.ic.go)|                    
                              
 


**_Issue: Not able to send telemetry data from apps hosted on-prem while using private endpoint_**

Cause : DNS forwarder was not set up per this documentation: https://learn.microsoft.com//azure/private-link/private-endpoint-dns#azure-services-dns-zone-configuration

Resolution : Configure DNS forwarder such that DNS resolution requests on-prem will be forwarded to the Azure Private DNS zone server



[**_Issue: If you do not see the option to enable private links for azure monitor.]


Unable to associate workspaces or AI components to AzureMonitorPrivateLinkScope. 

Confirm that the user has appropriate RBAC permissions on the workspaces / components. 


_**Issue:Data is flowing from internet into the component / workspace even though it should not.**_ 

Confirm that �Virtual Network Access Configuration� is correctly setup under Configure -> Network Isolation. 

![privatelink1.png](/.attachments/privatelink1-7cea5ba3-c549-4e65-999d-83477841a23f.png)


# Troubleshoot Log queries failing with authorization or access failures. 

**Symptom:** Users will see following errors: 

![LA query error.png](/.attachments/LA%20query%20error-e110f4a1-64fa-496c-b89b-a93d17cedf2a.png)

![LA error query.png](/.attachments/LA%20error%20query-ac3fb909-c5bb-4d07-9636-7d445c3bed5e.png)

**Other potential error messages:**
1.	�Access to resource '${resourceId}' is only permitted through an attached Private Link� - resource access isn�t permitted from public network and is allowed from a different private network.
2.	�Private link connection does not allow querying resource '${resourceId}' not attached to the current scope� � resource allows queries from public network, but the current PL (scope) has blocked this with QueryAccessMode = Private Only (which is only allowed for resources within this scope)


**Steps:**
 Verify in ASC if Network Isolation Settings �Allow public network access for queries� is set to No(disabled) and if they do not have any AMPLS scope added to connect through private Link. 

Cause: Starting September, 2021, Network Isolation will be strictly enforced. Resources set to block queries from public networks, and that aren't connected to any private network (through an AMPLS) will stop accepting queries from any network.


**Resolution:**  

Customer will have to use private link for Log queries to work as explained in the below documentation. If they do not want to use private link, they have to change the network isolation settings to allow queries on public network. 

https://learn.microsoft.com//azure/azure-monitor/logs/private-link-configure#configure-access-to-your-resources

This TSG has more details on troubleshooting Log Analytics > Logs blade issues:

https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/750395/Problems-loading-Logs-blade-in-Portal

This recording has details about the fix and changes   [Brownbag_ Updates to Azure Monitor Private Link-20210811_113550-Meeting Recording.mp4](https://microsoft-my.sharepoint.com/:v:/p/rashmia/EQ8h0iUzxI1NhqH3trEgx_8BG4M7UeoyhpgnWOA4w9ogAQ?e=ja0PLb)



# Delete resources connected to PLS 

Deleting Azure Monitor resources requires that you first disconnect them from any AMPLS objects they are connected to. It's not possible to delete resources connected to an AMPLS 

If customer tries to delete a resource still connected to PLS scope, they will see the error message 

Error:
The resource 'LAWORKSPACE' cannot be deleted because it's linked to one or more private link scope resources. Please delete the following resources and try again.

If customer cannot unlink and resource is not showing in the UI for some reason submit an IcM to AMS team to help delete it for customer. 

#ICM Escalation path for AMPLS issues 

Please follow the instructions provided in the [Azure Monitor Private Link: IcM Escalation Path](/Log-Analytics/Collaboration-Guides/Azure-Monitor-Private-Link:-IcM-Escalation-Path) to determine the correct escalation path for issues related to Azure Monitor private link issues


