---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/How To/Azure Firewall with Spring Cloud"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Firewall%2FHow%20To%2FAzure%20Firewall%20with%20Spring%20Cloud"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

#Description 
This page will show you how to configure an Azure Firewall with Azure Spring Cloud.

#What is an Azure Spring Cloud? 

Azure Spring Apps makes it easy to deploy Spring Boot applications to Azure without any code changes. The service manages the infrastructure of Spring applications so developers can focus on their code. Azure Spring Apps provides lifecycle management using comprehensive monitoring and diagnostics, configuration management, service discovery, CI/CD integration, blue-green deployments, and more.

Reference: https://docs.microsoft.com/en-us/azure/spring-cloud/overview

##What is Spring boot? 
Spring Boot makes easy to create stand-alone, production-grade Spring based Applications that you can "just run".

Reference: https://spring.io/projects/spring-boot#overview

Azure Spring cloud or also known as Azure Spring Apps can be integrated with Azure Virtual Networks. These deployments are also known as VNET injection. For knowing how to integrate it and the requirements needed please refer to <https://docs.microsoft.com/en-us/azure/spring-cloud/how-to-deploy-in-azure-virtual-network?tabs=azure-portal>

##Spring Cloud Infrastructure in Azure
![spring cloud arch3.jpg](/.attachments/spring.cloud.arch3.jpg)

For this case, I was able to get some explanation about how this works under the cover:

1. ASC(Azure Spring Cloud) relies on AKS API server to do the deployment for customer.
2. One of the ways that Spring cloud PG can confirm that the connectivity between ASC(Azure Spring Cloud) and AKS API server has no problem is when they can successfully get the data which AKS can provide directly without accessing user app from their Vnet.
3. AKS PG team said, they have a component called "Tunnelfront" which helps to setup secured tunnel connection between VMSS nodepool and AKS API server under the Vnet environment. If this component is not working as expected (malfunction, traffic blocked and etc.), the API server cannot access those VMSS nodepools. 

When Azure Spring Apps is deployed in your virtual network, it has outbound dependencies on services outside of the virtual network. For management and operational purposes, Azure Spring Apps must access certain ports and fully qualified domain names (FQDNs). Azure Spring Apps requires these endpoints to communicate with the management plane and to download and install core Kubernetes cluster components and security updates.

By default, Azure Spring Apps has unrestricted outbound (egress) internet access. This level of network access allows applications you run to access external resources as needed. If the Cx wishes to restrict egress traffic, a limited number of ports and addresses must be accessible for maintenance tasks. The simplest solution to secure outbound addresses is use of a firewall device that can control outbound traffic based on domain names. Azure Firewall, for example, can restrict outbound HTTP and HTTPS traffic based on the FQDN of the destination. Cx can also configure his preferred firewall and security rules to allow these required ports and addresses or FQDNs.

**Note: If Cx is using his own firewall make sure to check UDRs, NSGs and make the Cx to involve third party support to check the rules and application inside the firewall.**

#Scenario

**Diagram:**

![diagram.png](/.attachments/test.drawio.png)

Recently I was involved on a case where Cx was trying to deploy an Azure Spring Cloud instance controlled by an NSG, however, this was not going to work since there some specific FQDNs needed to allow the communication from the Spring cloud to the Internet. 

With Azure Firewall as usual you will need to make sure there is UDR pointing all traffic from the Spring cloud subnets towards the Az FW. Besides that, Cx had a VNET peering with antoher VNET in a different subscription where an ExR circuit was up and running doing a propagation of a default route(0.0.0.0/0) to all the VNETs. This will be explain later here(link)

Based on an Azure Spring Cloud public document https://docs.microsoft.com/en-us/azure/spring-cloud/vnet-customer-responsibilities, this needs to be done by using Azure Firewall. Here is where we need to take a look at the Azure Firewall configuration to allow the necessary FQDNs and make sure DNS proxy configuration is correct. The following are the required FQDNs and service tags (or network rule configuration) we need to allow on the Azure Firewall: 

Network requirements:
| Destination Endpoint | Port | Use | Note |
|--|--|--|--|
| *:1194 or ServiceTag AzureCloud:1194 | UDP:1194 | Underlying Kubernetes Cluster management. | |
| *:443 or ServiceTag AzureCloud:443 | TCP:443 | Azure Spring Apps Service Managemen. | |
| *:9000 or ServiceTag AzureCloud:9000 | TCP:9000 | Underlying Kubernetes Cluster management. | |
| *:123 or ntp.ubuntu.com:123 | UDP:123 | NTP time synchronization on Linux nodes. | | 
| *.azure.io:443 or ServiceTag - AzureContainerRegistry:443 | TCP:443 | Azure Container Registry. | Can be replaced by enabling Azure Container Registry service endpoint in virtual network. |
| *.core.windows.net:443 and *.core.windows.net:445 or ServiceTag - Storage:443 and Storage:445 | TCP:443, TCP:445 | Azure Files | Can be replaced by enabling Azure Storage service endpoint in virtual network. |
| *.servicebus.windows.net:443 or ServiceTag - EventHub:443 | TCP:443 | Azure Event Hubs. | Can be replaced by enabling Azure Event Hubs service endpoint in virtual network. |

The service tag **AzureKuberneterService** contains the following FQDNs to symplify the setup on the Azure Firewall: 

| Destination FQDN | Port | Use |
|--|--|--|
| mcr.microsoft.com | HTTPS:443 | Microsoft Container Registry (MCR).|
| management.azure.com | HTTPS:443 | Underlying Kubernetes Cluster management. |
| packages.microsoft.com| HTTPS:443 | Microsoft packages repository. |
| *.azmk8s.io| HTTPS:443 | Underlying Kubernetes Cluster management. |
| *.cdn.mscr.io| HTTPS:443 | MCR storage backed by the Azure CDN. | 
| *.data.mcr.microsoft.com | HTTPS:443 | MCR storage backed by the Azure CDN. | 
| *login.microsoftonline.com | HTTPS:443 | Azure Active Directory authentication. |
| *login.microsoft.com | HTTPS:443 | Azure Active Directory authentication. |

However, there are other 3 FQDNs that are not included in the service tag above: 


| Destination FQDN | Port | Use |
|--|--|--|
| mscrl.microsoft.com | HTTPS:443| Required Microsoft Certificate Chain Paths. |
| crl.microsoft.com | HTTPS:443| Required Microsoft Certificate Chain Paths. |
| crl3.digicert.com | HTTPS:443| Third-Party TLS/SSL Certificate Chain Paths. |
| acs-mirror.azureedge.net | HTTPS:443| NTP time synchronization on Linux nodes. |

#Azure Firewall Configuration

Based on the above tables, the Azure Firewall config should look like this:

**There are some inconsistencies on the Azure Spring cloud public doc when specifying the ports for the FQDNs, so please always rely on what you see on the Az FW logs** 

##Network Rules
![NetworkRules.png](/.attachments/NetworkRules.png)

**Note: When you add a FQDN to Network rules, please make sure to enable DNS proxy on the Azure Firewall or Firewall policy and also make sure the client VMs to use the Azure Firewall as DNS proxy. Based on public documentation https://docs.microsoft.com/en-us/azure/firewall/dns-settings#dns-proxy**

##Application Rules
![AppRules.png](/.attachments/AppRules.png)

##DNS proxy
![DNSproxy.png](/.attachments/DNSproxy.png)

**If Cx is using custom DNS servers, make sure they are the ones that are apply on the VNET. They must be the same. I'll later explain why on failed state section.**

#Troubleshooting

As usual, we use the Dataplane logs for troubleshooting this issue. You will need to look for every domain they see failures on the Spring cloud side. Spring cloud support will show you something like this: 
![Springlogs.png](/.attachments/Springlogs.png)

##Dataplane logs

When the requests are blocked or allow, you will see the specific HTTP or HTTPS request going through the Azure Firewall as below: 

[Azure Monitor Jarvis Logs (FQDN Filtered)](<https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=2022-04-19T16:14:00.000Z&offset=-1&offsetUnit=Days&UTC=false&ep=Diagnostics%20PROD&ns=GSAGW&en=AzureMonitor&scopingConditions=[["__Region__","West%20US"],["Tenant","/subscriptions/9121caa5-61e2-4057-9f84-ccfd49f96622/resourceGroups/ecs_na_dev_test_vnet_uw1/providers/Microsoft.Network/azureFirewalls/ecs-springcloud-fw"]]&conditions=[]&clientQuery=orderby%20operationName%20asc%0Awhere%20it.any("crl.microsoft.com")&aggregatesVisible=true&aggregates=["Count%20by%20ActivityId"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20>)
![Dataplanelogs.png](/.attachments/Dataplanelogs.png)

![Dataplanelogs2.png](/.attachments/Dataplanelogs2.png)

Here is where you see the inconsistencies between the logs and the ports/protocols mentioned on the public doc. 

#Azure Firewall in Failed state

One of the issue we faced during the above troubleshooting was the Az FW being in failed state due to one the custom DNS servers Cx applied to the Firewall policy was in the subnet of the Az FW, in fact, Cx put the private IP of the FW as a custom DNS server which caused the failed state. 

You should probably need to see the TSG for failed state for moere information: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/404296/TSG-Azure-Firewall-Failed-State?anchor=data-collection

You will need to: 

- Look for the latest operation that failed. In this case looked like this: 
    ![NRP.png](/.attachments/NRP.png)


- Second will be to check the NRP frontend events: 
```c
cluster('Nrp').database('mdsnrp').FrontendOperationEtwEvent 
| where SubscriptionId == "xxxxxxxxxxxxxxxxxxx"-->Replace with the Cx subs ID
| where TIMESTAMP >= datetime(2022-05-10 22:30) and TIMESTAMP <=datetime(2022-05-10 22:35)
| project PreciseTimeStamp, ResourceType, ResourceName, OperationName, CorrelationRequestId, Message, OperationId,Tenant, ClientOperationId
| where CorrelationRequestId  == "xxxxxxxxxxxxxx"-->Correlation ID of the latest operation to fail in the first step
//| where Message  contains "Getting operation for operationId:"
| sort by PreciseTimeStamp asc 
```
- Finally check the GWM Logs table --> _GatewayManagerLogsTable_: https://portal.microsoftgeneva.com/s/1E4CDA20 
    ![GWMlogs.png](/.attachments/GWMlogs.png)

As mentioned at the begining, Cx setup the private IP of the FW as a custom DNS server which is completly wrong even though the Az FW acts as DNS proxy. Remember that custom DNS servers must be the same as the one specified in the VNET. 

Teams post reference: https://teams.microsoft.com/l/message/19:14c9b83eb8d54c7bb027d2329ed2b1ab@thread.skype/1649786369636?tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47&groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&parentMessageId=1649786369636&teamName=Azure%20Networking%20POD&channelName=Firewall%20and%20Firewall%20Manager&createdTime=1649786369636

#Default route advertise over the Express route

Another issue we had to troubleshoot was the propagation of a default route (0.0.0.0/0) over the VNETs that were causing the traffic from Spring cloud instances and Az FW to go over the peered VNET Express Route gateway to on-prem. We realized this was happening since the case owner opened an ICM and Spring cloud PG detected a route with the address space of the Az FW subnet with next hop VPNGateway. 

ICM reference: https://portal.microsofticm.com/imp/v3/incidents/details/304713264/home

- They did a curl test from of the VM nodes and noticed the traffic was blocked: 
![curltest.png](/.attachments/curltest.png)

- Even though the Az FW logs showed the traffic allow on the port and same source:

    [Azure Monitor Jarvis Logs (IP and Port filter)](<https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-15&offsetUnit=Minutes&UTC=true&ep=Diagnostics%20PROD&ns=GSAGW&en=AzureMonitor&scopingConditions=[["__Region__","West%20US"],["Tenant","/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/RESOURCEGROUPNAME/providers/Microsoft.Network/azureFirewalls/AZFWNAME"]]&conditions=[]&clientQuery=orderby%20PreciseTimeStamp%20asc%0Awhere%20it.any("9000")%0Awhere%20properties%20!%3D%20null%20%26%26%20properties.containsi("1.1.1.1")&aggregatesVisible=true&aggregates=["Count%20by%20ActivityId"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20>)

    ![port9000.png](/.attachments/port9000.png)

- At first, they noticed the route (10.251.95.0/24 next hop VPNGateway) on one of the NICs of the VM nodes enabled, even though the UDR attached to the Spring cloud subnet was sending all the traffic to the Az FW: 

    ![nicroute.png](/.attachments/nicroute.png)

- After that, I did a test traffic on one of the instances of the Az FW check if it was learning a default route with next hop the VPNGateway/ExpressRoute: 
 
 ![testtraffic.png](/.attachments/testtraffic.png)

If you notice, the Az FW was learning the route and sending the traffic to the same IPs as the route shown by Spring cloud PG, but the Az FW subnet did not have any UDR at the moment I did the test traffic: 

 ![AzFWsubnet.png](/.attachments/AzFWsubnet.png)

 So we ended up asking Cx to add an UDR on this subnet pointing everything to Internet. After that, we were able to make the traffic going as expected and not causing asymetric routing. If you face this, you can run a curl command to test connectivity to the Internet from one VM behind the Az FW and the expected output should look like this: 
 
 ```c
 azureadmin@Test-VM-SpringBootApp:~$ curl -v  https://13.83.25.42
*   Trying 13.83.25.42:443...
* TCP_NODELAY set
* Connected to 13.83.25.42 (13.83.25.42) port 443 (#0) -->Good result
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/certs/ca-certificates.crt
  CApath: /etc/ssl/certs
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Request CERT (13):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (OUT), TLS alert, unknown CA (560):
* SSL certificate problem: unable to get local issuer certificate
* Closing connection 0
curl: (60) SSL certificate problem: unable to get local issuer certificate
More details here: https://curl.haxx.se/docs/sslcerts.html
curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.

azureadmin@Test-VM-SpringBootApp:~$ curl -v  https://13.83.25.42:9000
*   Trying 13.83.25.42:9000...
* TCP_NODELAY set
* Connected to 13.83.25.42 (13.83.25.42) port 9000 (#0) -->Good result
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/certs/ca-certificates.crt
  CApath: /etc/ssl/certs
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* error:1408F10B:SSL routines:ssl3_get_record:wrong version number
* Closing connection 0
curl: (35) error:1408F10B:SSL routines:ssl3_get_record:wrong version number
```

#DNS failures

After we resolved the above issue, Cx complained about DNS failures over the Az FW from the Spring cloud. At this point is important to see that Cx was still using the custom DNS servers on the firewall policy. I troubleshooted as explained here: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/209908/Azure-Firewall?anchor=howto%3A-view-azurefirewalldnsproxylog-with-jarvis-logs

On the logs you should probably see something like this: 

[Azure Monitor Jarvis Logs (Timeout filter)](<https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-1&offsetUnit=Days&UTC=false&ep=Diagnostics%20PROD&ns=GSAGW&en=AzureMonitor&scopingConditions=[["__Region__","West%20US"],["Tenant","/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/RESOURCEGROUPNAME/providers/Microsoft.Network/azureFirewalls/AZFWNAME"]]&conditions=[]&clientQuery=orderby%20PreciseTimeStamp%20asc%0Awhere%20it.any("timeout")&aggregates=["Count%20by%20ActivityId"]&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20>)

![DNSfail.png](/.attachments/DNSfail.png)

{"msg":"Error: 2 mscrl.microsoft.com. AAAA: read udp 10.251.95.5:7944->10.251.33.4:53: i/o timeout"} 

{"msg":"Error: 2 crl3.digicert.com. AAAA: read udp 10.251.95.5:52726->10.251.33.4:53: i/o timeout"} 

{"msg":"Error: 2 mcr.microsoft.com. AAAA: read udp 10.251.95.5:3317->10.251.33.4:53: i/o timeout"} 

{"msg":"Error: 2 crl.microsoft.com. AAAA: read udp 10.251.95.5:35368->10.251.33.4:53: i/o timeout"} 

- The explanation will be the following: 
1. First thing will be FQDN that source wants to reach. 
2. Then the IP next will be the source of the request. 
3. The other IP is DNS server that the Azure FW forwarded the request.
4. At the end you will see the result of the forward action.

A good DNS resolution should look like this: 

![DNSsucess.png](/.attachments/DNSsucess.png)

Cx ended up putting default Azure DNS since with that option everything started working as expected. However, if you have a Cx that is not willing to do that, he will need to see why the DNS servers are not responding properly to the Az FW, you can ask to run a packet capture on the DNS servers and see the comminication. 

In case Cx would like to have access to DNS logs they can run the following query in log analytics: 
```c
AzureDiagnostics
| where Category == "AzureFirewallDnsProxy" 
| parse msg_s with "DNS Request: " SourceIP ":" SourcePortInt:int " - " QueryID:int " " RequestType " " RequestClass " " hostname ". " protocol " " details 
| extend 
    ResponseDuration = extract("[0-9]*.?[0-9]+s$", 0, msg_s), 
    SourcePort = tostring(SourcePortInt), 
    QueryID =  tostring(QueryID) 
| project TimeGenerated,SourceIP,hostname,RequestType,ResponseDuration,details,msg_s 
| order by TimeGenerated 
| limit 100 
```
#Contributors
<Luis Monge>