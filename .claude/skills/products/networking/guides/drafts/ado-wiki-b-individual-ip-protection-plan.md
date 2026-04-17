---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/Feature: Individual IP Protection Plan"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/Feature%3A%20Individual%20IP%20Protection%20Plan"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Feature Overview 

## Background 

DDoS is a common attack vector that targets the availability of applications. It can be carried out in L3/L4 or L7. Azure DDoS Protection services safeguard applications against L3/L4 volumetric attacks. These are the most common attacks. Volumetric attacks represent a large flood of packets to an application that can render it unavailable by consuming its network and compute resources. Attacks are typically sourced by a bot or DDoS stressors, and can be spoofed, as it is especially easy in UDP. 

![A visual representation of DDoS attack](.attachments/DDoS_AttackVisualization.png)  

There are also low&slow DDoS attacks, but those are not volumetric, and typically are L4-L7 attacks that other services like WAF protect against. Another attack vector that is volumetric but isn’t covered by Azure DDoS Protection services is L7 floods. This is typically HTTP floods but can also be DNS or other L7 protocol floods. Can Azure DDoS Protection services protect against L7 DDoS attacks? Depending on the volume. If the volume is low, it won’t. If the volume is high (>50K pps) it may be detected as a L4 TCP flood, depending on the DDoS policy triggers. 

## Why do customers need DDoS Protection in Azure? 

Any public IP resource that is routable from the Internet is susceptible to DDoS attacks. Our DDoS infrastructure protection, offered free of charge to customers, will typically protect the platform, by setting high-enough detection triggers that will prevent the Azure platform from getting hit. However, resources in Azure are vulnerable to DDoS attacks when the attack bypasses infrastructure protection by going below the radar with traffic volumes below the detection triggers. 

Here are the [DDoS infrastructure protection default policies](https://microsoft.sharepoint.com/teams/WAG/AzureNetworking/Wiki/DDoS.aspx). 

## High-level view of Azure DDoS protection 

Azure’s DDoS service is built of distributed mitigation and control plane pipelines. We have 80+ Tbps mitigation capacity across ~65 regions. We mitigate ~2,000 attacks a day. 

Attack detection is based on Netflow/IPFix rate anomalies for each /32 VIP resource in Azure. Attack mitigation is based on a dedicated hardware-offloading pipeline deployed in each region. 

When the DDoS control plane sees rate anomalies towards a public IP address in Azure, it kicks off the mitigation pipeline by diverting the traffic (BGP diversion) through the mitigation pipeline before traffic reaches the attacked resource. Traffic is scrubbed, attack is mitigated, and only the “clean” traffic is delivered to the destination VIP. 

Traffic flow without mitigation  
![Traffic flow without mitigation](.attachments/DDoS_trafficflowwithnomitigation.png)  
 

Traffic flow with mitigation  
![Traffic flow without mitigation](.attachments/DDoS_trafficflowwithmitigation.png)  

**Virtual network protected resources**

DDoS protection service is designed to protect services that are deployed in a virtual network. PaaS services are partially supported. For example: APIM in virtual network connected mode, where customers can access the API gateway from the Internet is supported. However, Azure App Service, vWAN and APIM in other deployment modes are not currently supported.  

**Azure Front Door**

AFD, like any other Microsoft online service, is protected by Azure’s DDoS Infrastructure Protection. This means that any AFD end point is protected. However, value added services like DRR, Cost protection and protection tailored to application traffic patterns are not currently offered as part of DDoS Protection services. 

# DDoS Protection value proposition 

The value of customer facing DDoS Protection offering is similar across DDoS SKUs, and are not offered at the DDoS infrastructure protection tier. The same core engineering features apply to both SKUs. Let’s review those as shown in the below figure. 

![DDoS Protection overview](.attachments/DDoS_ProtectionPlan.png)  

**Azure global network**

We leverage the scale of ~65 Azure regions and more than 80Tbps of mitigation capacity to mitigate the largest attacks in history. In Q4 2021 we mitigated the largest attack in history of 3.47Tbps. 

**Adaptive Tuning**

DDoS Protection standard ensures that the DDoS protection policy that we set to detect attacks is fine tuned to the scale and traffic patterns of your workloads. These detection triggers are set dynamically per protected resource and adapt to changing traffic baselines. For each protected resource that has a public IP we set three detection triggers in the DDoS policy – one for TCP SYN, second for TCP and third for UDP. A detection trigger determines when we decide there’s a DDoS attack we need to mitigate. We continuously monitor the posture of the workload and traffic baseline and set the triggers accordingly. Each workload is unique and will have its own set of detection triggers. We will see that in more details later. 

**Attack analytics and metrics** 

Now if we see a DDoS attack crossing the detection triggers, we kick in the DDoS mitigation pipeline and by doing that you will get full visibility into the attack lifecycle by [analyzing attack telemetry](https://learn.microsoft.com/en-us/azure/ddos-protection/telemetry) and [logs](https://learn.microsoft.com/en-us/azure/ddos-protection/diagnostic-logging?tabs=DDoSProtectionNotifications). 

**Integration with Microsoft Sentinel and Defender for Cloud**

We integrate the attack analytics and telemetry with Azure security center as well as Azure Sentinel if you use it as your SIEM service in Azure. So, all the data is available for compliance, as well as for cross correlation with events other than DDoS attacks to guarantee your workloads are fully protected. 

## DDoS SKU comparison 

The main difference between SKUs is the exclusion of: DRR, Cost Protection and WAF discounts from DDoS IP Protection SKU. 

Table comparing features between DDoS IP Protection and DDoS Network Protection. Additional features for Azure DDoS Network Protection include DDoS rapid response support, cost protection, and WAF discount. 

What’s in the roadmap for it 

In order to enable breath adoption, we aim to include DDoS IP Protection SKU in many attack points cross service in Azure. We will have the option to enable DDoS IP Protection in Azure Firewall, Azure AppGW/WAF, LB, and more. 

 
# Configuration and Telemetry
## Enabling DDoS protection on a VIP 

![Sku Comparison chart between DDoS Network Protection and DDoS IP Protection](.attachments/DDoS_paidskucomparison.png)  

DDoS IP Protection is available only for public IP address Standard SKU, not for Basic SKU. 

### PowerShell

To enable DDoS protection on a public IP address there are two options: 

 - Create the public IP with DDoS protection enabled 

- Create the public IP and then enable DDoS protection for it 

See [learn](https://learn.microsoft.com/en-us/azure/ddos-protection/manage-ddos-protection-powershell-ip) for more information. 

### Portal 

Portal experience will be available to external customers by end of October 2022. 

You can create the public IP via MPAC portal (also available externally via the preview portal), and then enable DDoS protection for it. Currently, the portal experience doesn’t support enabling DDoS protection during public IP address creation, these are separate steps. 

   - Create a public IP address and a backend resource (e.g., VM, Firewall, Application Gateway etc.) 
   - Note: single VM running behind a public IP address isn’t a supported deployment for DDoS, due to lack of scale-out in this case. 

- **Associate the public IP with the backend resource.** If no backend resource is associated, an error message appears in the overview blade. Currently, this error message will be displayed only for Network inherited protection. Portal team works to have it implemented also for IP Protection.  

![Portal blade showing no support when not associated to backend](.attachments/DDoS_AssociatePIP2backend.png)

- By default, DDoS Protection status for a public IP address is inherited from the virtual network. This is to maintain backward compatibility with customers who have DDoS Protection Plan (DDoS Network Protection SKU) to protect the virtual network in which the backend resource resides. 
     - If DDoS Network Protection SKU is not used to protect the virtual network in which the backend resource associated with the public IP address resides, the Protection status is “Unprotected”, as shown below.  

![Portal blade showing no support](.attachments/DDoS_PortalNoProtection.png)
 
- Enable DDoS Protection on a public IP address, by selecting Protection type == IP. This will enable DDoS Protection based on the new DDoS IP Protection SKU.  
- View DDoS Protection status in portal, by clicking ‘overview’ and then ‘properties’: 

![Portal blade showing DDoS Protection](.attachments/DDoS_PortalConfirmedProtection.png)

- Customers can disable DDoS Protection on a VIP if they wish to, by clicking ‘Disable’ 

![Portal blade showing disable toggle](.attachments/DDoS_PortalDisableProtection.png) 

## Verifying DDoS policy 

DDoS Protection service assigns a DDoS policy to each protection public IP address. This policy is auto tuned, using advanced algorithms to set detection triggers for TCP SYN, TCP and UDP. The auto-tuned policy considers the workload posture and traffic baselines. 

- You can see the policy via the [CRI Jarvis dashboard](https://portal.microsoftgeneva.com/dashboard/CNS/CRI?overrides=%5b%7b%22query%22:%22//*%5bid%3D%27DestinationVIP%27%5d%22,%22key%22:%22value%22,%22replacement%22:%22%22%7d%5d%20), by entering the public IP address  

![Jarvis chart showing threshold levels](.attachments/DDoS_JarvisThresholds2Mitigation.png) 

- Customers can see it under the public IP address / Monitoring / Metrics blade 

![Portal screenshot showing Azure Monitor metrics for Public IP](.attachments/DDoS_PortalMetrics.png)  

## Simulate DDoS attack 

Customers can engage with [approved DDoS testing partners](https://learn.microsoft.com/en-us/azure/ddos-protection/test-through-simulations) to run DDoS attack simulation against resources in Azure. No other DDoS testing partner is approved. Contact PG for special customer enquiries. 

<!--
See demo of a [simulated DDoS attack using BreakingPoint Cloud](link) (time 21:44), where you can see the attack simulation and mitigation life cycle.  
-->

# Common support cases 
## Customer can’t toggle DDoS protection on a VIP 

A customer opens an SR with Microsoft because they are not able to toggle DDoS Protection mode on their Public IP resource. 

**Prerequisites**
1. Check the public IP resource on ASC to validate customer request.  
![ASC screenshot of Public IP resource highlighting protection status](.attachments/DDoS_ASC.png)  

    1. DDoS IP Protection SKU is not available for basic public IP address SKU. Customers will get an error message from network resource provider if they try to enable it on basic SKU. This error is expected. 
    1. Validate that DDoS Protection Mode field is set to ‘Enabled’ and SKU is set to ‘Standard’.  
1. If DDoS Protection Mode is not ‘Enabled’, get the request ‘CorrelationId’ for the attempted operation from customer. This can be found under Activity log tab on the resource. 
![Portal screenshot of activity log PUT of Public IP resource](.attachments/DDoS_portalCRUDjson.png)  

1. Check NRP logs using the below query. 
```kql
let region= "region" //update with correct region
let CorrelationId = "GUID" // update with correlationId
cluster('nrp.kusto.windows.net').database('mdsnrp').QosEtwEvent
| where Region == region
| where TIMESTAMP > ago(2d)
| where CorrelationRequestId == correlationId
| project TIMESTAMP, Success, ErrorCode, ErrorDetails, StackTrace, UserError
```
4. Involve PG team and share all the details found out above. 

## Customer is under attack (see [TSG](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/277561/TSG-I'm-Under-a-DDoS-Attack-) in Wiki) 

Here we focus on the support flow for DDoS. CSS can troubleshoot the SR based on other tools, metrics, etc., such as: VM CPU Util, Network Util, etc. These are not covered here. 

![DDoS "I'm Under Attack workflow")(.attachments/Attacktroubleshootingworkflow.png)  

![Zoomed in DDoS "I'm Under Attack workflow")(.attachments/FocusedAttacktroubleshootingworkflow.png)   

 