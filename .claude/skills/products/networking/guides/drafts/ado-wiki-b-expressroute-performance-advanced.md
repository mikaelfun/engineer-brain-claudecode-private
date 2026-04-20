---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute Performance Advanced"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/ExpressRoute%20Performance%20Advanced"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

## Scenario

Customer is reporting that their ExpressRoute performance from on-premises to an Azure Vnet is 'slow' or not satisfactory

## Problem Analysis: Describe the Problem

The first step in problem analysis is to ensure you and the customer are clear on the problem you are attempting to solve. In the context of ExpressRoute performance, the following are the relevant objects and deviations. Ensure you have defined them before proceeding further.
* ExpressRoute circuit resource Id
* On-premises IP
* Azure VM IP
* Azure Virtual Network Gateway resource Id
* Azure Virtual Network resource Id
* What is the deviation: unexpected speed (throughput), unexpected latency, or something else 
* How did you measure the deviation (iPerf, ping test, etc)
* What is the measured value of the deviation and what is the expected value?
* Is this and ongoing issue or a root cause request? If root cause request, what are the stop and start timestamps in UTC time zone?

## Scoping & Data Collection

**Note: These steps should take approximately (10-15 minutes).**

1. Review the customer Verbatim for:
	1. Subscription IDs:
	2. VNet Name/s & ID/s:
	3. VM name/size/IP in Vnet that repros: 
2. Go to [Azure Support Center (ASC)](https://aka.ms/azuresupportcenter) and enter the SR# to retrieve the following information:
   1. Virtual Networks section:
		1. Vnet Name:
		2. Vnet ID:
		3. RDFE or ARM resource Id:
	2. Gateways > All Virtual Network Gateways:
		1. GatewayID:
		2. Gateway Type:
		3. DeploymentID:
		4. Gateway SKU:
	3. Circuit information - Match the Vnet ID to Identify the correct Circuit. Gather this information from ASC ExpressRoute Circuit properties tab.
		1. Service Key:
		2. Circuit Name:
          3. Bandwidth:
		4. Device Names: (This is available in ASC & Dump Circuit)
		5. Subinterface name: (This available in ASC & Dump Circuit)
	4. VM information:
		1. Name:
		2. Sku/Size:
		3. DIP:
3. Match customer provided data with ASC data
	1. From steps 1 & 2 above are you able to articulate the following?
		1. Customer's problem Vnet
		2. Local network name connected to 'problem VNet'
		3. The objective/observable description of 'slow'
4. Run ExR Diagnostics via Azure Support Center

## Troubleshooting Guide
When customers open cases for ExpressRoute Performance issues, follow this troubleshooting guide to expedite collecting relevant data to diagnose the problem or to have the relevant data ready in the event the case needs to be escalated.

##Performance Defined
There are two main metrics that generally fall in the category of performance: latency and throughput.  A performance issue in this context is not consistent failure to connect to a specific endpoint from a given location.

Latency means that the round-trip time (RTT) is not what the customer expects – typically because it is higher than the customer thinks it should be.  This is usually measured with the ping command.  Network latency is typically introduced by the speed of light within fiber optic networks – around 5 µs of latency for every kilometer of cable.  It is important to realize that fiber optic network cables don’t always take the most direct path between two locations.

In telecom networks, throughput is the rate of data (bytes) sent from point to point over a period of time.  Typically, this is measured in megabits per second (as opposed to megabytes per second).  Bandwidth refers to the theoretical rate of data that can be transferred.  Often, customers mean to say that the throughput they are getting over their ExpressRoute circuit is less than their circuit bandwidth.

##Troubleshooting Latency
Latency between two endpoints is typically caused either by the physical distance between the endpoints or by the network not taking the shortest physical path.  This may be due to fiber cuts or congestion on the optimal path.  To see the path data packets are taking, use the `traceroute` (Linux) or `tracert` (Windows) command against both the source and destination.

While reviewing traceroute, be sure to observe the ExpressRoute Device IP configuration to ensure traffic is actually traversing the desired ExpressRoute circuit. Please follow this link for more information for in-depth [traceroute](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/143957/Packet-Loss-Between-On-Prem-and-Azure-ExR-S2S-Use-TraceRoute) analysis. 

Latency can also be induced by the Virtual Network SDN stack. For customers that are sensitive to packet latency, the customer should be guided to enable [ExpressRoute FastPath](https://docs.microsoft.com/azure/expressroute/about-fastpath) on their ExpressRoute Gateway connections and enable Accelerated Networking on their Virtual Machines. The ExpressRoute FastPath feature reduces latency. Internally, FastPath is implemented by programming a CA/PA lookup table on the MSEE to allow the MSEE to directly encapsulate the data packet and send it to the node running the customer Virtual Machine, bypassing the Virtual Network Gateway. This lookup and encapsulation is also done in hardware which further reduces latency. As always, the node is able to send on-premises bound traffic directly to the MSEE.

Regardless of whether or not FastPath and Accelerated Networking are enabled, TCP session set up and ICMP pings are always processed in software. This means that enabling them will not reduce ICMP ping times or TCP ping times. To see this reduction in latency, you must analyze the ACK response time in a packet capture of the customer application as opposed to using the ping/tcpping tool.

  
There are no ping latency SLAs around Virtual Network Gateways. For the default ExpressRoute SKU, the underlying VM resources can land on most any compute cluster (they are D2v2 SKUs). If customers observe slight varients in performance between gateways or ping times, the ExpressRoute team will not take escalations around that as there are no latency SLAs and that path is never hardware accelerated. Relatedly, the higher the number of flows associated with a container, the more latency is observed when new flows must be created. Use the VFP Port Metrics Dashboard ([https://portal.microsoftgeneva.com/dashboard/VfpMDM/DatapathDashboards/VfpPortMetricsDashboard](https://portal.microsoftgeneva.com/dashboard/VfpMDM/DatapathDashboards/VfpPortMetricsDashboard)) for the container Id of the gateway instance to see how many flows are created. You can also use [EagleEye](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1434477/EagleEye) for this. Just open the tool and select the ExpressRoute scenario. Then, fill in the required information, such as the Service Key and GatewayId.
Alternatively, from Azure Service Center (ASC), navigate to your ExpressRoute Circuit, then go to Visual Debugging > EagleEye Datapath Diagnostics, and click the provided link.
Once your resources are loaded in EagleEye, navigate to the VNG instances and click on the Host Networking Support Dashboard.

----------------------------

![==image_0==.png](/.attachments/==image_0==-cfd09cab-a922-4afb-b720-ab0e9378cce1.png) 
  
  
Look closely at the metrics CurrentTotalFlowIn and CurrentTotalFlowOut in the Inbound VFP Flows and Outbound VFP flows graphs respectively. If you observe 100k or more current flows, this is contributing to the observed latency. The action plan for the customer is to upgrade their gateway SKU to UltraPerf/ErGw3AZ and enable FastPath. This will increase the number of gateway instances to four and reduce the number of flows that need to hit the gateway instances.

In summary, for customers that are sensitive to latency, encourage them to implement the FastPath feature and (note the UltraPerf/ErGw3AZ Gateway SKU requirements and that those have increased costs).

##Troubleshooting Throughput Issues
Lower than expected throughput can be caused by the following things.  
1. Latency which may be combined with:
    1. Failure to negotiate TCP Window Scaling
    2. A single TCP thread saturating the Window size.  To calculate this theoretical maximum, use: bytes of window size * 8 = total bits / latency in seconds.  For example, if the TCP window size is 212,992 bytes and the latency between the endpoints is 200 ms, it is 212,992 * 8 = 1,703,936 bits / 0.2 seconds = ~8.5 Mbps.
2. Packet loss. Packet loss is the most common cause of unexpected throughput issues. Consistent packet loss will prevent the TCP/IP stack from scaling up the window size and from attempting to send data more aggressively.  In most operating systems, the TCP stack considers loss to be an indicator of link congestion.  To determine if there is loss, use the Wireshark filter: `tcp.analysis.retransmission` based on the packet captures you will collect via the initial action plan outlined below.

Follow this action plan to enough data to determine which cause(s) above are applicable to your customer’s scenario and guide you on next steps.  Without this information, you cannot proceed efficiently. Do not attempt to escalate cases into ICMs without completing the initial action plan and if packet loss is found, the second Debug ACL action plan below. 

**Do not attempt to follow other action plans such as linking additional VNets and VNet Gateways to the ExpressRoute circuit**; this will only add additional potential causes into the mix and will lead to high customer dissatisfaction. Further, it does not move the case forward; the scenario the customer purchased ExpressRoute for is to connect on-premises to the cloud so that is the scenario that should be debugged. Do not do this. 

###Initial Action Plan:
1. Have customer _concurrently_ collect a packet capture on the source VM and destination VM and reproduce the issue.  It is important to start the packet capture _before_ starting the application to reproduce the behavior to ensure the TCP three-way handshake is recorded.  It is also important that packet captures be taken at source and destination if possible (if the customer is connecting to a 3rd party service it is likely not possible).  Having captures from the source and destination will enable further analysis. 

   Ensure customer disables Large Send Offload on the sender and receiver.  This will enable us to accurately compare counts of packets in packet captures and the debug ACL (if needed).  Run the following command from an elevated PowerShell command prompt where the name of their network interface is "Ethernet".  Please note that this action will cause a temporary network outage as the network driver will restart.  Ensure the customer does not run this on a production system without understanding this and being okay with it.<br/>
**Windows:**<br/>
`Disable-NetAdapterLso -Name "Ethernet"`<br/>
`Disable-NetAdapterRsc -Name "Ethernet"`<br/>
**Linux:**<br/>
`sudo ethtool -K eth0 gro off`<br />
`sudo ethtool -K eth0 gso off`<br />
`sudo ethtool -K eth0 tso off`

   _Note:_ for Linux if the customer has Accelerated Networking enabled, ensure they run the ethtool commands above for the Accelerated Networking adapter in addition to eth0. The name of the Accelerated Networking adapter varies by distribution. Some call it eth1 but it may be called something else. Use the `ip addr` command to find out the proper name (the MAC address will be the same for both the synthetic adapter (eth0) and the Accelerated Networking adapter).

   In Wireshark, in the Capture -> Options menu, select default and input 74 under the Snaplen column to the right of the relevant network adapter. Update buffer size to 20:

   ![Snaplen and Buffer columns in Input tab using WireShark Capture Interfaces](/.attachments/WiresharkERPerfCaptionOptions1-fc6b7ef4-ce21-4a37-bd83-cdc5f8c7b3aa.png)

   In the Options tab, insure "Update list of packets in real-time" is NOT checked and "Automatically scroll during live capture is NOT checked":

   ![Not checked options in Options tab](/.attachments/WiresharkERPerfCaptionOptions2-407870f5-abcf-4f87-af6e-590649fc3801.png)

2. Have the customer describe the application in as much detail as they can.  Be sure to get at minimum:
   1. Client IP
   2. Server IP
   3. Server port

3. Determine if the client creates one or many connections to the server. Open the client IP packet capture in Wireshark.
   1. Use the following filter replacing SourceIP, DestinationIP, and DestinationPort with the relevant values (if the application is UDP, use `udp.dstport` instead of `tcp.dstport` in the filter): `ip.src == SourceIP && ip.dst == DestinationIP && tcp.dstport == DestinationPort`
   2. Go to the "Statistics" menu and choose "Conversations"
   3. Click on the "TCP" pane (or UDP if applicable)
   4. Tick "Limit to display filter" box on the bottom left:

       ![Limit to display filter option](/.attachments/Wireshark_Conversations1-cf06fc8d-8958-4d01-bf7d-e09b5f2f5c47.png)

     In this example, you can see that there is only one TCP stream and that the stream was approximately 1.8 GB.  At this point, you have enough information to determine if the customer’s application uses one or many network connections.

4. Determine the rate of packet loss from the client to the server.
   1. Use the following filter replacing `SourceIP`, `DestinationIP`, and `DestinationPort` with the relevant values: `ip.src == SourceIP && ip.dst == DestinationIP && tcp.dstport == DestinationPort && tcp.analysis.retransmission`

         ![Filter results information ](/.attachments/WiresharkFilterExamplePerf1-9cb5eb26-52ea-41e9-bec0-c990ccd1834a.png)
   
   2. The total number of packets will be in the bottom pane of Wireshark.  If the customer’s application has opened multiple TCP streams to the server, `tcp.dstport` will also have to be specified in the filter.
   3. Determine the consistency of packet loss.  In Wireshark, go to the "Statistics" menu and choose "IO Graph".  In the Graph 1 filter, apply the same filter as step 4.2.

         ![IO Graphs applying the filter using WireShark IO Graphs](/.attachments/WiresharkERPerfIOGraph-8f4f5f4e-1f13-4bb6-ab5d-709f6a53b177.png)

   An initial burst at the beginning of the transfer is not a cause for concern as loss is a signal TCP uses to detect saturation and back off.  However, continued bursts of loss as you can see in this example **are** a cause for concern.
   4. Determine the rate of loss from the destination capture using the same method as step 3.

###Conclusions from Initial Action Plan
If no packet loss is detected (particularly after the initial connection), start to focus on application design.
1. If there are many network connections and little traffic is sent over each (total bytes < 1 MB) based on what you see in the Conversation Statistics, suggest to the customer that they use connection pooling.  If the application is HTTP based, encourage the customer to ensure HTTP Keep Alive is enabled (more information: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Keep-Alive)
2. If there are few network connections and little to no packet loss, latency may be gating the network throughput of the customer’s application if the application is built around synchronous transactions.  Encourage the customer to use asynchronous methods when possible.
3. If continued packet loss is observed on the IO graph for retransmitted packets, investigate if packet loss is happening between the customer and the MSEE or between the MSEE and the customer VM as explained in the next section.

##Further Troubleshooting
To determine if packet loss is happening before or after the MSEE, the recommended action plan is to use a network load generator such as NTTTCP and collect a packet capture on the MSEE and on each endpoint of the conversation.  In the following template Action Plan, the IP 10.97.14.16 is on premises and 10.85.1.4 is in Azure.  This Action Plan will need to be coordinated via a phone call with the customer as the customer needs to start packet captures in their guest OSes and start NTTCP at specific times.

###Action Plan:
1. Download NTTTcp and copy it to the test sender (on premises) 10.97.14.16 and receiver (in Azure) 10.85.1.4
    - Windows: https://docs.microsoft.com/en-us/azure/virtual-network/virtual-network-bandwidth-testing#testing-vms-running-windows
    - Linux: https://docs.microsoft.com/en-us/azure/virtual-network/virtual-network-bandwidth-testing#testing-vms-running-linux
2. Make a firewall exception for ntttcp.exe on the receiver 
   * Have customer ensure that TCP ports 5001 and 6001 are open on their firewall.  If multi threads are required, add a range starting with port 5001.
3. Ensure Large Send Offload on the sender and receiver is disabled. See above for how to do this.
4. Have the customer start a packet capture on both the sender and receiver, truncating the data to 74 bytes. In Wireshark, in the Capture -> Options menu, select default and input 74 under the Snaplen column to the right of the relevant network adapter. Update buffer size to 20:

    ![Snaplen and Buffer columns in Input tab](/.attachments/WiresharkERPerfCaptionOptions1-fc6b7ef4-ce21-4a37-bd83-cdc5f8c7b3aa.png)

   In the Options tab, insure "Update list of packets in real-time" is NOT checked and "Automatically scroll during live capture is NOT checked":

     ![Not checked options in Options tab](/.attachments/WiresharkERPerfCaptionOptions2-407870f5-abcf-4f87-af6e-590649fc3801.png)

5. **Support Engineer Only:** Work with your TA to start a packet capture on the primary and secondary MSEEs.

6. After the packet capture is started on both the sender and receiver and the MSEE packet capture is started, start nttcp.exe on the receiver (replacing 10.85.1.4 with the IP address of the receiver).  Syntax: `ntttcp -r -m 1,*,10.85.1.4 -t 60 -a 4`

   If the customer can max out the single thread with the settings above, increase the number of outstanding I/O buffers to be used for sending or receiving data by increasing the -a parameter to 8 or 12.  If the customer can still do so, increase the number of threads to 2 or 4 (the first number after -m parameter).  You can count packets to just one of the ports in the debug ACL (in our case, 5001).

8. Start nttcp.exe on the sender (replacing 10.97.14.16 with the IP address of the receiver).  Syntax:
`ntttcp -s -m 1,*,10.85.1.4 -t 60 -a 4`
Be sure to match the -a and -m parameters in prior step.

9. After ntttcp runs, stop packet captures on the sender and receiver.  Instruct the customer not to run any additional tests.

10. Instruct customer to send packet captures to Microsoft.

11. **Support Engineer Only:** Copy packet captures from customer to DTM if the customer didn't upload it to DTM directly. Add the MSEE packet capture to the internal DTM share and ensure the file names describe which MSEE link it was collected on and the date correlates with the customer's endpoint captures.

12. Engage your TA and the EEE team to help find the missing/retransmitted packets in the captures if you do not know how to do so.


# Contributors
- @<AAD67C1A-C862-4157-995E-B930B4652CED>
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78>
