---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/DDOS Troubleshooting Guides"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDOS%20Troubleshooting%20Guides"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**DDOS Trobleshooting Guides**

[[_TOC_]]


# Description

This document provides guidance on troubleshooting customer escalations related to the Azure DDoS Protection service and compiles the latest DDoS documentation available for all FTEs.



# I'm under attack

A general overvie of "I am Under Atacck scenario is presented in [TSG: I'm Under a DDoS Attack](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/277561/TSG-I'm-Under-a-DDoS-Attack-)



# Determine Customer's DDoS SKU

A general overview of the SKU features is provided in the following wiki, 
along with information on how to verify if the customer has a **DDoS Protection Network Plan** or a **DDoS Protection Individual IP Plan**.
[TSG: Determine Customer's DDoS SKU](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/300601/TSG-Determine-Customer's-DDoS-SKU)



# Enabling DDoS protection on a VIP

DDoS IP Protection is available only for public IP addresses Standard SKU, not for Basic SKU. 


To enable DDoS protection on a Public IP address there are two option. 

    * Create the public IP with DDoS protection enable. 
   
    * Create the public IP and then enable DDoS protection for it. 

[QuickStart: Create and configure Azure DDoS IP Protection using Azure portal](https://learn.microsoft.com/en-us/azure/ddos-protection/manage-ddos-ip-protection-portal)


If a customer opens an SR with Microsoft because they are not able to toggle DDoS Protection mode on their Public IP resource.

    1. Check the Public IP resource on ASC to validate customer request.
        
        * Validate that DDoS Protection Mode filed is set to "Enabled" and SKU is set to "Standard"

    2. Check NRP logs using the below query:

        cluster('Nrp').database("mdsnrp").QosEtwEvent
        let region = "<Resource Region>"
        let correlationID = "Our Correlation Request ID from ASC or HTTP incoming goes here, leaving the quotations intact";
        QosEtwEvent
        | where Region == region
        | where TIMESTAMP > ago(2d)
        | where correlationRequestId == correlationID
        | project TIMESTAMP, Success, ErrorCode, ErrorDteails, StackTrace, UserError

**Note 1**: Provision multiple VNets for DDoS Protection at once
    This feature is not supported out of the box. You can create a recursive loop to enable multiple VNet via PowerShell.

**Note 2**: Unable to disable DDoS Protection on a given VNet.
    Try disabling the DDoS Protection via CLI or PowerShell. 
    If CLI/PowerShell cmd fails as well, escalate to DDoS Protection engineering team with error details per the escalation process.



# DDOS not unlinking

Even when the DDoS Protection Plan is removed, it still appears active, this might be due to an Azure Policy that enforces "VNets should be tied to a DDoS Plan." 
If the customer disables DDoS Protection on the VNET, the policy will automatically turn it back on.

[Ref 44793. Unable to delete the DDOS plan, EnableStandardDdosProtection is not changing to False for associated virtual network.](https://supportability.visualstudio.com/AzureNetworking/_workitems/edit/44793)


## DDoS Protection Plan Drop-Down Menu Issue

If the customer is experiencing difficulties with the DDoS Protection Plan drop-down menu, they are either unable to see the plan in the menu or encountering an error when attempting to link a VNET to a plan, proceed with the following actions: 

![DDoS protection settings for Vnet-1 with no available protection plan selected.](/.attachments/ddosprotectionplanIP4.png)

**Actions to Resolve:**

1. **Verify User Permissions:** Ensure that the user attempting to link the VNET to the DDoS Protection Plan has at least 'Network Operator' access to the DDoS Plan resource.

2. **Check Subscription & Tenant Alignment:** Confirm that both the DDoS Protection Plan and the VNET where DDoS Standard is to be enabled exist within the same tenant.

3. **Reproduce & Capture Session ID:** Reproduce the issue, then press Ctrl + Alt + D while the Azure portal is in focus to retrieve the Session ID (visible in the lower-right corner) for further debugging.

4. **Escalate for Assistance:** If the issue persists after completing the above steps, share the gathered details in the [Microsoft Teams DDoS Channel](https://teams.microsoft.com/l/channel/19%3a9e0120d9ea8b479e8c603012f1b15e8f%40thread.skype/Azure%2520DDoS?groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) to seek further guidance from Technical Advisors (TAs).



# Unable to disable DDoS Protection

The customer is having trouble disabling a DDoS Protection Plan. Before escalating the issue on AVA, follow these steps to troubleshoot.


## Steps to Check & Information to Gather

    1. Check if the DDoS Plan is Active & Has Linked VNETs.
    
    2. Confirm VNET Status

    3. Gather Timestamps & Check NRP Logs:

    4. Try to disable/delete the Ddos plan using PowerShell Instead of the Azure Portal:

You can use the following TSG to check all and each of the previous steps [TSG unable to delete DDos](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1256029/TSG-unable-to-delete-DDos)
       


# Is My IP Under Mitigation?

This process will help you to start your troublesoothing when a customer is under a DDoS Attack and verify if the VIP is/was under mitigation and more information about the attack.


## 1. Check DDoS mitigation

To verify if the VIP is under DDoS mitigation, use the following wiki: [Is/Was my VIP under DDoS Mitigation?](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/209767/Log-Sources-for-DDoS-Protection?anchor=is/was-my-vip-under-ddos-mitigation%3F)


## 2. Check DDoS Limits 

To verify the thresholds for the VIP, we will need to use the **Thresholds to start DDoS mitigation** dashboard.
    
Use [CRI|Jarvis](https://portal.microsoftgeneva.com/dashboard/CNS/CRI?overrides=[{%22query%22:%22//*[id%3D%27DestinationVIP%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22}]%20) to check public IP.

Look for the Customer's IP in the search box and then, scroll down to **Thresholds to start DDoS mitigation.**

Example: 

![Graph of DDoS mitigation thresholds showing TCP SYN, UDP, and TCP triggers from March 2 to 28.](/.attachments/ddosprotectionplan9.png)


These thresholds determine when DDoS Protection Standard will actively start mitigating an attack. However, keep in mind:

    * The autotune policy may not always match the customer’s expectations.

    * If their backend service can’t handle 10k SYNs/sec, it may still experience downtime—even if DDoS protection doesn't activate.


How Thresholds Are Set? . You can use [What DDoS Autotune Policy is Applied to my VIP?](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/209767/Log-Sources-for-DDoS-Protection?anchor=what-ddos-autotune-policy-is-applied-to-my-vip%3F) to understand more about it. 

Remember that: 

    * They are based on traffic analysis from the public IPs/VNETs covered by the DDoS policy.

    * If a fixed threshold is needed, PG engagement is required.

**Note**: Another dashboard to verify the limites configured for the customer. This will show you a [Clean View](https://portal.microsoftgeneva.com/dashboard/CNS/PolicyGeneration/CleanView?overrides=[{%22query%22:%22//*[id%3D%27DestinationVIP%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22}]%20) of each individual policy. 


## 3. How many packets/sec are traversing my VIP (during an attack)?

TCP SYN packets per second, TCP packets per second, UDP packets per second are dasboards that can be used as a reference of how many packets/sec are traversing my VIP (during an attack).

These dashboard helps you understand why a DDoS Mitigation did or did not trigger. 

You can compare this data with the autotune policies noted above to determine if a DDoS should or should not have been mitigated.

![Three line graphs showing TCP, UDP, and total packet rates per second from 17:30 to 18:30 UTC.](/.attachments/ddosprotectionplan10.png)

Look at the following wiki to ilustrate the above more: [How many packets/sec are traversing my VIP (during an attack)?](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/209767/Log-Sources-for-DDoS-Protection?anchor=how-many-packets/sec-are-traversing-my-vip-(during-an-attack)%3F)


## 4. Outbound or Possible "Fake" DDOS

In some cases, we need data to confirm whether the traffic is an **inbound DDoS** or **outbound DDoS** (which could be a **fake DDoS**).

For example, if the target IP belongs to the customer’s Azure Firewall or NVA, and during business hours, there is a significant spike in TCP outbound traffic from a single IP address, 

this could trigger a DDoS alert. In such cases, we might consider it a fake DDoS if the outbound traffic is reaching the DDoS TCP threshold.

    * Source Ports are mostly 443 or other well-known application ports.

    * Source IPs are limited to specific addresses, such as Microsoft Online IPs or AAD IP addresses.

    * Destination Ports are random.

    * Message Value: The top count in logs often indicates, "Packet was forwarded to the service."

![TCP traffic log showing forwarded packets and retries.](/.attachments/ddosprotectionplan14.png)

This scenario can be observed with Azure Front Door IPs as described in this [wiki](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1155695/DDOS-Attack-from-Microsoft-AFD-IP)

Also, it is explained in detail on [Identify Source IPs, Protocols, Ports of Attack, Direction of Attack, "Fake" DDoS](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/690195/TSG-DDoS-Attack-Post-Mortem?anchor=identify-source-ips%2C-protocols%2C-ports-of-attack%2C-direction-of-attack%2C-%22fake%22-ddos)



# Outbound DDoS Troubleshooting to External IPs

The [Outbound DDoS Troubleshooting to External IPs](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1987288/Outbound-DDoS-Troubleshooting-to-External-IPs) document helps engineers troubleshoot outbound DDoS scenarios, specifically traffic drops when leaving Azure to a public IP. The principles apply to all suspected outbound traffic drop cases.



# L7 Attacks

The fallowing explains what a Layer 7 / Application Layer DDoS Attack is, how to recognize it, and how to protect against it. [What is an L7 Attack?](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/326854/TSG-This-wiki-outlines-what-a-Layer-7-or-Application-layer-DDoS-attack-is-and-how-to-identify-it?anchor=what-is-an-l7-attack%3F)

[How to Identify an L7 Attack](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/326854/TSG-This-wiki-outlines-what-a-Layer-7-or-Application-layer-DDoS-attack-is-and-how-to-identify-it?anchor=how-to-identify-an-l7-attack)

[How to Protect Against L7 Attacks](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/326854/TSG-This-wiki-outlines-what-a-Layer-7-or-Application-layer-DDoS-attack-is-and-how-to-identify-it?anchor=how-to-protect-against-l7-attacks)

[Long-Term Protection Strategies](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/326854/TSG-This-wiki-outlines-what-a-Layer-7-or-Application-layer-DDoS-attack-is-and-how-to-identify-it?anchor=how-to-protect-against-l7-attacks)

[Types of DDoS (Layer 7 vs Layer 4)](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1246846/Capacity-Units-DDoS-Protection?anchor=types-of-ddos)



# DDos Cost Protection

[TSG: DDoS Cost Protection workflow](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/783034/TSG-DDoS-Cost-Protection-workflow) outlines the workflow for this scenario, considering that customers are likely already frustrated after experiencing a DDoS attack that our platform did not effectively mitigate.



# How to configure alert to detect DDOS attack?

Customer may have request to create alert rules to detect if their public IP resources is under DDOS. 

According to public doc, customer can utilize metric 'Under DDOS attack or not'. 

Please note that this metric is per public IP, which means customer need to configure alert rules for each public IP separately. 

If customer wants to create multiple IP alerts in bulk, please configure alerts based on logs: https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-diagnostic-alert-templates



# Special DDoS SR & CRI Handling Processes

This document outlines some special handling scenarios and processes with Severity A Azure\DDOS Protection\I'm under attack - Network Protection Plan SRs.

[Special DDoS SR & CRI Handling Processes](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/929831/Special-DDoS-SR-CRI-Handling-Processes)



# Questions

    1. Customer is under attack and is looking to, or has just enabled DDoS Protection Standard. 
	  
        * Always recommend to enable DDoS Protection Standard on the affected VNET(s) for full capabilities including dynamically tuned policy thresholds, attack analytics, SSoS Rapid Response, SLA guarantee and cost protection. 
	    
        * Determine if it's a Layer 3/4 attack or Layer 7. 
	    
        * Set expectations that there will be some onboarding time to adjust the policy threshold. 
	   
        * If Layer 3/4 attack, the PG team can put the IP into mitigation. 


    2. Customer is undergoing a Layer 7 attack.
        
        * With DDoS Protection Standard, customer gets cost protection. 
        
        * Recommended customer to deploy WAF (Application Gateway WAF SKU or third-party WAF offerings available in Azure Marketplace.)
       
        * Other options: block IPs using NSGs, enable Azure Front Door Geo-filtering, reduce origin server load with Azure CDN.


    3. Customer is worried about impacting legitimate traffic / wants to increase threshold. 
        
        * Assure customer that only time legitimate traffic is impacted, is when the traffic goes above destination rate limit counter to protect the availability of the application. 
       
        * Customizing policy threshold is not supported. 
        
        * To increase limits, recommended to increase the number of VMs behind the IP, or use the Standard Load Balancer/Public IP SKU.


    4. Customer has a single VM behind application. 
        
        * Single VM scenarios are not supported.
        
        * Always recommend to distribute workloads for a given ip across multiple VMs, or set auto-scale. 


    5. Customer wants to check if their resources are protected by DDoS Protection Standard / DDoS protection is working as expected. 
       
        * Customer can view their protected VNET/IPs in the "Protected resources" tab on portal. 
        
        * Customer can view policy threshold on portal with Azure Monitor. 
        
        * Customer can simulate an attack to validate DDoS protection. 


    6. Customer has issues viewing / configuring metrics. 
       
        * Attack metrics (inbound traffic) and logs are only available when the IP is under attack. 
       
        * Customer must first enable diagnostics settings to get logs. 


    7. If under attack, how long does the IP remain in mitigation mode for? 
        
        * The IP will remain in mitigation mode for a period even after the attack is over.
        
        * In most cases, the mitigation mode will end after 30 minutes, but this can be extended if there are frequent mitigations taking place. 


    8. Do I need more than one DDoS protection plan? 
       
        * Under single tenant, a plan can be used across multiple subscriptions, so only one plan is needed. 
        
        * Multiple VNETs can be linked to the same plan. 
        
        * If customer has multiple tenants, then multiple plans are needed. 


    9. What IPs are supported by DDoS Protection plan? 
        
        * Protected Resources: Public IPs attached to application Gateways, Bastions, Load Balancers, Azure Firewalls, VPN Gateways, VMs, Virtual Appliances. 
        
        * Unsupported Resources: Private IPs, PaaS services e.g. API Management, Logic Apps, Evnet Hub, App Services Environments, ER gateways. 
        
        * VPN Gateways IPs policies will remain at baseline policy as this is per design, although customers will still be able to view telemetry and attack analytics. 


    10. Does DDoS Protection add any Additional Latency to my Application?
        
        * Yes. Technically speaking, DDoS Protection would add a bit of latency, but it would be so miniscule that no one should notice its effects. 
        
        * The latency fluctuation by simply accessing an application via the internet would far outweigh any latency added by DDoS Protection Network Plan (formerly Standard SKU).


# Contributors

- @<37a904d5-1977-6b1c-8756-c0d0ba65bac0>