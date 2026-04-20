---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute Performance"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/ExpressRoute%20Performance"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

## Scenario

Customer is reporting that their ExpressRoute performance from on-premises to an Azure Vnet or Azure Vnet to on-premises is 'slow' or not satisfactory.

## 1. Identify and Describe the Problem

The first step in identifying the problem is to ensure you and the customer are clear on the problem you are attempting to solve. In the context of ExpressRoute performance, the following are the relevant objects and deviations. Ensure you have defined them before proceeding further.

Please work with the customer and get the following information: 

- All Subscription IDs impacted:
- ExpressRoute Circuit resource Id:
- On-premises IP: 
- Azure VM Name/Resource/IP: 
- Azure ExpressRoute Virtual Network Gateway resource Id:
- Azure Virtual Network resource Id:
- What is the issue: unexpected speed (throughput), unexpected latency, or something else
- How did you measure the issue: (iPerf, ping test, etc)
- What is the measured value of the issue and what is the expected value:
- Is this an ongoing issue or a root cause request? If root cause request, what are the stop and start timestamps in UTC time zone?
- Direction the performance is impacted: (on-premise to Azure or Azure to on-premise)
- TraceRoute: (on-premise to Azure or Azure to on-premise)
- Private Link Issue: Y/N

## 2. ASC Data Collection

Go to [Azure Support Center (ASC)](https://aka.ms/azuresupportcenter) and enter the SR# to retrieve the following information:
- Virtual Networks section:
	- Vnet Name:
	- Vnet ID:
	- ARM resource Id:
- Gateways > All Virtual Network Gateways:
	- GatewayIDs:
	- Gateway Type:
	- DeploymentID:
	- Gateway SKU:
- Connection Information
    - Connection Name:
	- Weight:
	- FastPath: Enabled/Disabled
- Circuit information - Match the Gateway ID to Identify the correct Circuit.
	- Service Key:
	- Circuit Name:
    - Bandwidth:
	- MSEE Device Name
	   - Primary: 
	   - Secondary: 
	- Subinterface Name:
- VM information:
	- Name:
	- Sku/Size:
	- DIP:

Match customer provided data with ASC data:

- From steps 1 (Problem Analysis) & 2 (ASC Data Collection),  are you able to articulate the following?
	- Customer's problem Vnet?
	- Local network name connected to 'problem VNet'
	- The objective/observable description of 'slow'

If you answered **NO** to any of the above criteria, please work with the customer to get access to additional ASC resources, further scope the issue, or get a better understanding again of the issue we need to troubleshoot. 

*Note: If you require assistance and the above information is not provided, I will mark your post as noise. Please provide the above information when posting to ava for help.*

## ExpressRoute Datapath

Another step in troubleshooting performance issues with ExpressRoute is we MUST understand the datapath customer is taking from on-premises to Azure and vice-versa. Customers can have complex environments where they have multiple ExpressRoute circuits and multiple ExpressRoute gateways connecting different Azure virtual networks.

We need to identify explicitly which path is having the performance related issues.

**Quickly narrowing down where in the datapath we need to investigate further will greatly reduce TA time to review and customer frustrations going forward with the case.**

Traditional Datapath: 

![Two network diagrams show data paths between on-premise and Azure, with the second diagram highlighting gateway bypass using ExpressRoute.](/.attachments/image-0eab991c-8d26-4950-b466-15b5087f98d6.png)

### FastPath Datapath

ExpressRoute virtual network gateway is designed to exchange network routes and route network traffic. FastPath is designed to improve the data path performance between your on-premises network and your virtual network. When enabled, FastPath sends network traffic directly to virtual machines in the virtual network, bypassing the gateway.

![Two FastPath network diagrams show bidirectional data flow between on-premise and Azure via ExpressRoute, with both paths bypassing the gateway.](/.attachments/image-a32579bf-36fb-4961-b364-f06a8c4e1958.png)

#### How to Confirm FastPath Enabled/Disabled

From the connection object in ASC, you will be able to see if FastPath is enabled or disabled.

![Network resource properties with Connection Type set to ExpressRoute, Routing Weight 0, and FastPath Enabled set to False, all highlighted in red.](/.attachments/image-9432c232-74b5-4ee8-8ca9-3b5a4f9584a6.png)

### Private Link & FastPath (Public Preview)

Private Link traffic sent over ExpressRoute FastPath will bypass the ExpressRoute virtual network gateway in the data path.

This preview is available for connections associated to ExpressRoute Direct circuits. Connections associated to ExpressRoute partner circuits aren't eligible for this preview. Additionally, this preview is available for both IPv4 and IPv6 connectivity.

![Two diagrams labeled Private Link & FastPath show bidirectional data paths between on-premise and Azure using ExpressRoute, with red lines tracing the connections.](/.attachments/image-c85d5bbd-108d-49c9-b430-d8040cb5974f.png)

### Private Link Datapath

![Two network diagrams illustrating the Private Link datapath between on-premise and Azure, with red arrows indicating the direction of data flow.](/.attachments/image-9459363b-988e-4c55-938a-94fde61b6858.png)

## ExpressRoute Gateway Estimated Performance by Gateway

In our public documentation [About ExpressRoute virtual network gateway](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways), we have documented the [estimated performance by gateway sku](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways#aggthroughput) to provide a better baseline when customers complain about performance issues. 

### Testing Conditions

| Gateway SKU | Traffic sent from on-premises | Number of routes advertised by gateway | Number of routes learned by gateway |
|--|--|--|--|
| **Standard/ERGw1Az** | 1 Gbps | 500 | 4000 |
| **High Performance/ERGw2Az** | 2 Gbps | 500 | 9,500 |
| **Ultra Performance/ErGw3Az** | 10 Gbps | 500 | 9,500 |

### Performance Results

This table applies to both the Resource Manager and classic deployment models.
 
|Gateway SKU|Connections per second|Mega-Bits per second|Packets per second|Packets per second per Role Instance|Supported number of VMs in the Virtual Network|
| --- | --- | --- | --- | --- | --- |
|**Standard/ERGw1Az**|7,000|1,000|100,000|50,000|2,000|
|**High Performance/ERGw2Az**|14,000|2,000|200,000|100,000|4,500|
|**Ultra Performance/ErGw3Az**|16,000|10,000|1,000,000|250,000|11,000|

*Application performance depends on multiple factors, such as end-to-end latency, and the number of traffic flows the application opens. The numbers in the table represent the upper limit that the application can theoretically achieve in an ideal environment. Additionally, Microsoft performs routine host and OS maintenance on the ExpressRoute Virtual Network Gateway, to maintain reliability of the service. During a maintenance period, the control plane and data path capacity of the gateway is reduced.*

 *During a maintenance period, you may experience intermittent connectivity issues to private endpoint resources.*

## ExpressRoute Gateway Investigation

From section 2, you should have the gateway ID and SKU from the affected datapath. We will use this for the next step.

1. In ASC, go to the ExpressRoute Circuit.
2. Confirm from the tunnel section, that the gateway ID is referenced. 
3. Select Visual Debugging tab. 
4. From this tab, you will see "ExpressRoute Gateway Dashboard for <gatewayid>"
5. Select the one that matches the gateway ID you collected above.

Reference Dashboard: [Gateway Dashboard](https://jarvis-west.dc.ad.msft.net/dashboard/AzureERShoeboxProd/ERResources/GatewayDashboard)

Please use the link from ASC as this has everything preloaded so you don't have to gather any additional information. 

### Connections Per Second

Additional Work is going into this #https://msazure.visualstudio.com/One/_git/Networking-nfv/pullrequest/6776401?_a=files

### Bits per second

- Group: Gateway System Metrics
- Section: 
  - Bits In per Sec (<RoleInstance>)
  - Bits Out per Sec (<RoleInstance>)

Bytes In\Out Per Second: The perceived Bytes In and Out per Second that is received by the Role Instance. Since the Gateway is only involved on the inbound path into Azure, this mainly displays the traffic going into the Vnet.

![Two line graphs labeled "Bits In per Sec" and "Bits Out per Sec" show blue lines with spikes and red lines mostly flat from March 13 to 15.](/.attachments/image-e9fa077b-0334-4182-820c-94be192fa8d7.png)

Based on SKU size, validate the gateway is not being overutilized: 

|Gateway SKU|Mega-Bits per second
| --- | --- |
|Standard/ERGw1Az|1,000
|High Performance/ERGw2Az|2,000
|Ultra Performance/ErGw3Az|10,000

### **Per Instance** 

|Gateway SKU|Bits per second|Megabits per second|
| --- | --- | ---|
|Basic|250000000|250|
|Standard/ERGw1Az|500000000|500|
|High Performance/ERGw2Az|1000000000|1000|
|Ultra Performance/ErGw3Az|2500000000|2500|

### Packets Per second

- Group: Gateway System Metrics
- Section: 
  - Packets In per Sec (<RoleInstance>)
  - Packets Out per Sec (<RoleInstance>)

Packets In\Out Per Second: The perceived Packets In and Out per Second that is received by the Role Instance. Since the Gateway is only involved on the inbound path into Azure, this mainly displays the packets going into the Vnet.

![Two line graphs labeled "Packets In per Sec" and "Packets Out per Sec" show blue lines with spikes and red lines mostly flat from March 13 to 15.](/.attachments/image-80cc1b53-9a1a-491f-b1d4-9f1844b72199.png)

Based on SKU size, validate the gateway is not being overutilized: 

|Gateway SKU|Packets per second|Packets per second per Role Instance
| --- | --- | --- |
|Standard/ERGw1Az|100,000|50,000|
|High Performance/ERGw2Az|200,000|100,000|
|Ultra Performance/ErGw3Az|1,000,000|250,000|

### Supported number of VMs in the Virtual Network

- Group: Gateway Scale Metrics
- Section:
  - NMAgent Connections Count per sec (<Role Instance>)
    - NMAgent Connections: An estimated count of the number of VMs the gateway is servicing. Each Host of VM makes at least 1 NMAgent Connection to the gateway. Per connection, Gateway maintains state and validates the signature per connection and so a high number of connections may incur heavy CPU use and Memory use which can result is performance impact to the Network.
  - Null\NonNull Returned To NMAgent
    - Null/Nonnull Returned to NMAgent: Count of times the Role Instance is returning no change (null) to the VM or returning the Adjacency Table (non-null) to the VM. If Role Instance is frequently returning that the full table, there may be an impact to performance seen in the network due to the overhead of sending the full table per request.

![Two line graphs labeled "NMAgent Connections Count per sec" and "# Of Null/NonNull Returned To NMAgent" show blue and red lines from March 13 to 15.](/.attachments/image-59db8fc0-6335-40c4-a944-1c6b917c11fb.png)

Based on SKU size, validate the gateway is not being overutilized: 

|Gateway SKU|Supported number of VMs in the Virtual Network
| --- | --- |
|Standard/ERGw1Az|2,000
|High Performance/ERGw2Az|4,500
|Ultra Performance/ErGw3Az|11,000

### CPU/Memory

- Group: Gateway System Metrics
- Section:
  - CPU/Memory Use: CPU of the Gateway further divided into what is consuming the CPU. We're explicitly tracking the following Processes:
    - ErgwProcess: The process running ExpressRoute Gateway Code
    - MonAgent: The Monitoring Agent process pushing Metrics and Logs
    - Powershell/DSC: the Powershell process. Sometimes the gateway may be running a powershell script that is continuously shutting down the Role Instance. In VMSS ExpressRoute Gateways, DSC is a powershell script and configures the Role Instance.
    - LocalSecurityAuthorityProcess: the process that is verifying the signatures per connection. If there are many connections, we've seen this process take up the most CPU.

![CPU/Memory Use based on the 4 processes mentioned above](/.attachments/image-a67d7d81-c6a7-4118-8d87-c12002a64808.png)

Anything above 75% is considered to be relatively high cpu.

We typically see high CPU when too much bandwidth is being used vs sku size or over the number of supported vms in a virtual network is above supported sku size. 

Other factors can also be combined with high cpu, please post to teams in the ExpressRoute channel for additional clarity if you are unsure about why CPU is high.

###VFP Ratelimiter drops on specific gateway instances
It is possible that customer may see drops/performance issues between on-premises and Azure and EagleEye might call out VFP drops on specific gateway instances.  One fairly common cause for this is something called "fat flows" or "fatty flows".  What this means is that the customer has an application that is sending a ton of traffic in a single TCP connection (meaning it's only one flow in Azure).  The downside to this is that, aside from potential performance implications, they can hit thresholds, specifically VFP ratelimiter thresholds on specific gateway instances.  One way to check for the likelihood of a "fat flow" issue is to compare a few tiles on both support (VFP) and drops dashboards.  

From support dashboard:
![image.png](/.attachments/image-7f200fce-1c15-4853-8554-0dc02d1be06d.png)

There is not an excessive amount of VFP flows here, however we have a lot of ratelimiter drops for VFP:
![image.png](/.attachments/image-a684e0fb-d7cd-4372-8032-a98a7058122f.png)


Checking drops dashboard:
![image.png](/.attachments/image-5855482a-4082-4bab-9b2e-3e5435aab89b.png)

There is about 2.73 million inbound VFP packets hitting this gateway instance on a sustained basis.  We can also see there are a lot of DroppedResourcePacketInRate drops that appear to correlate with the number of VFP ratelimiter drops:
![image.png](/.attachments/image-33bc49b0-5484-49b8-bdc3-c4e7f242b3a9.png)

Finally, it should be noted that when ExpressRoute PG tried to service heal this instance, the issue moved to another instance and when that one was also service healed, the issue moved again.  This, combined with packet captures showing a ton of traffic from a specific on-premises IP in very few TCP tuples is what led us to the conclusion of there being "fat flows" since the flow simply moves to another instance during service heal.

## Next Steps

Please validate we are not seeing an issue on the ExpressRoute gateway with the above steps.

**If the above is not applicable or we are not seeing any issues on the gateway based from findings from above documentation, please proceed to the following next step:**

**[ExpressRoute-Performance-Advanced](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134205/ExpressRoute-Performance-Advanced)**

# Contributors
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>
- @<343B71B2-5B1F-676A-AAB4-7763EF750825> 

