---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA HT: Check AMPLS configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%20HT%3A%20Check%20AMPLS%20configuration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
Azure Monitor Private Link Scope (AMPLS) can be used to allow Azure Monitor Agent (AMA) to communicate through private IP addresses, rather than through the default, public IP addresses. This article will describe how we can review the AMPLS configuration.

# Azure Support Center (ASC)
## Step 1: Is this workspace configured to use private links?
***Azure Support Center > Resource Explorer > Resource provider (dropdown) > Microsoft.OperationalInsights > Workspaces > Select Workspace > Properties (tab)***

![image.png](/.attachments/image-ac9cb762-8efd-4d9e-b7ed-d9de0a19e7c7.png)

- Do we have public ingestion disabled?
    - Public ingestion indicates whether or not logs can be sent to this workspace using its public IP address/interface.
- Do we have any associated private link scopes?
    - If we have private link scopes associated, this workspace is AMPLS enabled.
    - If we do not have private link scopes associated, this workspace is configured only for public access.

## Step 2: What are the private IP addresses to communicate with this workspace?
***Azure Support Center > Resource Explorer > Resource provider (dropdown) > Microsoft.OperationalInsights > Workspaces > Select Workspace > Properties (tab) > Associated Private Link Scopes > Select Private Link Scope***

![image.png](/.attachments/image-4699f93a-d0e8-43e7-a8ea-b1528777f154.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: In some cases, you may observe that multiple private link scopes are associated. In this case, you need to find the private link scope with private endpoints in the same subnet as your agent machine or in a subnet that is peered with the subnet that your agent machine is in.
</div>

***Private Link Scope > Properties (tab) > Health Status***

![image.png](/.attachments/image-945c1008-7e89-4d7f-aae6-720ac1dc493a.png)

***Private Link Scope > Properties (tab) > Private Endpoint Connections > Select Private endpoint id***

![image.png](/.attachments/image-ce62b8bc-f84d-4e71-b432-ccd272ad029d.png)

- Is the provisioning state = "Succeeded"?
- Is the Private links connection State = "Approved"?

***Private Endpoint > Properties (tab) > Private DNS Zone Record Sets***

Below is a list of the records that AMA may utilize (depending upon the specific scenario):
- Data Collection Endpoint (handler, ingest, metrics)
- Global Handler
- Workspace ODS endpoint

![image.png](/.attachments/image-403f37d5-3ccd-4f7e-b83e-d2a7aa33dcd1.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: If the DCE addresses are not present, the customer likely forgot to associate the DCE with the private link scope OR they didn't have enough address space in the subnet where the private endpoint exists.
</div>

![image.png](/.attachments/image-d78abd0b-0141-47ba-b75c-1fc931165866.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: If the customer has lockbox and you can't see these resources in ASC, you can see this on the Azure Portal: The private endpoint shows Custom DNS records and no private link DNS zones. In this case, the customer likely deleted the A records from their private DNS zone.
</div>

***Private Endpoint > Properties (tab) > Private DNS Zone Record Sets > Expand Records > IP Addresses***

![image.png](/.attachments/image-a16db7b1-8f7f-4398-bc0a-69a98112f8b2.png)

When the machine where the agent is running performs a DNS query for these addresses, these are the IP addresses that should be returned. If we are communicating through a proxy server, the proxy server would be performing the DNS request, not the AMA machine.

## Step 3: DNS Provider
By default, Azure manages DNS for virtual networks in Azure. This is configurable - meaning that customers can utilize their own DNS servers instead. If the customer is using Azure Managed DNS, then Microsoft is responsible for ensuring the DNS answers align with the private DNS zone configuration. If the customer is managing their own DNS, they are responsible to ensure that their DNS server forwards the appropriate requests or answers with the correct records.

***Virtual Network > Properties (tab) > Properties > DNS Servers***

![image.png](/.attachments/image-f67dd222-8a9b-48a5-97b4-1abb11528da7.png)

## Step 4: Multiple associated private link scopes
As noted earlier, if we find that there are multiple private link scopes associated with the workspace, we need to determine which private link scope is either:
- In the same Virtual Network (VNET) as our agent machine's VNET or Arc private scope VNET
- In a peered VNET as our agent machine's VNET or Arc private scope VNET

***Private Endpoint > Properties (tab) > Private Endpoint Dependent Objects > Private Endpoint Virtual Network***

![image.png](/.attachments/image-af987a42-c68d-4b7d-a29f-9fe5c0793091.png)

***Virtual Network > Properties (tab) > Peerings***

![image.png](/.attachments/image-7e2a5680-3356-4e5a-83f2-6ed3f568d974.png)

![image.png](/.attachments/image-97160eb3-cf23-4e2d-a0e1-4f972200405b.png)

***Agent Machine > Properties (tab) > Network Profile > Virtual Network***

![image.png](/.attachments/image-2496f7b7-1a5e-4cfb-8c0e-5b6ad4f51836.png)

***Private DNS Zone > Properties (tab) > Virtual Network Links***

![image.png](/.attachments/image-435eec63-f874-4751-9b0e-593debd4526b.png)

![image.png](/.attachments/image-7325d783-7b2a-4825-91ed-ee6de3d2e06a.png)

# Azure Portal
