---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/VMS Scale-out, Scale-in, Updates Events"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Firewall%2FFeatures%20%26%20Functions%2FVMS%20Scale-out%2C%20Scale-in%2C%20Updates%20Events"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

#Overview

Understand the causes and behaviors of these type of events and customer impacts.

#Scale-Out/Scale-Up
This is a increase in instance count to the VMS Scaleset that makes up the AZFW FIREWALL
- This occurs when a threshold of CPU  or Throughput is exceeding 60%.
- This is publicly documented here: https://docs.microsoft.com/en-us/azure/firewall/firewall-faq#how-long-does-it-take-for-azure-firewall-to-scale-out
- _Azure Firewall gradually scales when average throughput or CPU consumption is at 60%. A default deployment maximum throughput is approximately 2.5 - 3 Gbps and starts to scale out when it reaches 60% of that number. Scale out takes five to seven minutes._
- Max Number of VMS instances = 20 (can be higher, but needs a ICM with PG)
- Default rules are that the Instances will increase in scale-out/up by 2 when triggered.  VMSS logic does attempted to scale multiple at a time incase more than 1 was needed, or if a VMSS instance was deployed in a bad/failed state.  Bad State and unneeded VMSS are then removed after the fact. 

#Scale-In/Scale-Down
This is when the number of VMS instances decreases because of reduced average loaded on AZFW.  
- Minimum Number of VMS instances is 2. (Unless they had PG 'pinned" a different minimum Value.)
  - Why are some customers PINNED to a minimum number? Very High Profile customers that rapidly spin up thousands of connection and high throughput.   They are unable to wait the 7 mins for the Azure Platform to automatically scale out.  These are one off scenarios. 
- Instances will being to scale-down when CPU is less than 20% 
- Default rules are that Instances will decrease by 1 at a time until equilibrium. 
- If the customer is asking specifically for instance pinning, please note that we can no longer reach out directly to PG with this request. We now need to provide PG with proof that the scale up process is not handling the customers traffic correctly and that it needs to be binded to a higher instance count. Please provide detailed analysis with perf metrics / Data plane metrics . What type of traffic was/Is affected, packet capture during the time of the issue etc.


[Click here to read more about how to increase AZFW throughput](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/286265/How-to-increase-Azure-Firewall-throughput)


## Scale-in behavior - Public info
An Azure Firewall VM instance shutdown may occur during Virtual Machine Scale Set scale in (scale down) or during fleet software upgrade. In these cases, new incoming connections are load balanced to the remaining firewall instances and are not forwarded to the down firewall instance. After 45 seconds the firewall starts rejecting existing connections by sending TCP RST packets. After an additional 45 seconds the firewall VM shuts down. 

https://learn.microsoft.com/en-us/azure/firewall/firewall-faq#how-does-azure-firewall-handle-vm-instance-shutdowns-during-virtual-machine-scale-set-scale-in--scale-down--or-fleet-software-upgrades

#Viewing Scale Data
These values are **not** customer configurable.
## ASC
- Load the Managed Subscription Data into ASC
- Navigate to the resource group: ARMRG-XXXXXXXXXXX (what matches)
- Expand out Compute --> VMSS

 ![VMSS object](/.attachments/image-7b0c49b3-7349-4fa9-8a4e-97f11afb1131.png)

- Look at "Scaling Tab"

 ![Auto Scale Profiles](/.attachments/image-c6accf50-f47b-4a2b-b759-5129515e26ff.png)

 ![Auto Scales Rules List](/.attachments/image-54af63af-50fa-4126-a273-0129d870d1a8.png)

#Seeing Scale Events
Easiest way to see if the AZFW scaled out or in, is to look at the PERFORMANCE, or DATAPLANE Dashboards.  Here you should see instances appear in the graphs

- Example: Azure Firewall Health . We see 2 instances scale up and then down. 

 ![Azure Firewall Health chart](/.attachments/image-80a979f7-1ba8-417f-8302-5d4838c86325.png)

## Jarvis Actions 

Get-Azure Firewall Autoscale Params For Gateway: https://portal.microsoftgeneva.com/BBA9C866?genevatraceguid=98eca0dd-7ab3-4eb3-9aed-bbab42698bd6

![Get-Azure Firewall Autoscale Params For Gateway Example](/.attachments/image-621420a5-f423-468e-8923-5a91da29228b.png)

#Load Balancer and Connection Draining Behavior

Upon upgrade, the Firewall perform connection draining for 90 seconds. Total draining time is 90s. It's split in 2 phases. In the first one we stop receiving new connections, and in the second we reply with RST to incoming packets. [Teams link](https://teams.microsoft.com/l/message/19:14c9b83eb8d54c7bb027d2329ed2b1ab@thread.skype/1612938266214?tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47&groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&parentMessageId=1612813861160&teamName=Azure%20Networking%20POD&channelName=Firewall%20and%20Firewall%20Manager&createdTime=1612938266214)

When the VM instance gets notified about upcoming shutdown event, it starts this 90s process. It shuts down the LB health probe immediately. After 2 health probes that are not responded, LB will stop sending new traffic to the given VM. This means that out of the first 45s, the first 10 the VM will keep getting traffic as usual, and then for the remaining 35 it will normally process existing connections, but it won't get any new one.

After 45s, the behavior differs depending of the rule type:

  ###Network rules: 
  <span style="font-size:14px;"> Will reply with RST to any incoming packet, from any side of the connection (client or server). FW VM won't generate any RST packets itself, but it will reply with RST to any incoming packet. Note: this behavior is different than LB 4 min timeout where LB actually creates new RST packets and sends them out.
  ###Application rules: 
  <span style="font-size:14px;">Existing connections will be normally served for this period (90 seconds). At the very end (at 90s) all existing connections will be closed with an RST that FW VM generates.

If cx wants to ensure that they get RSTs on long running connections, they should set up the keepalives at the time which will hit during the 45 second window for eg. ask them to set the keepalive at 15 second interval. Keepalives are typically OS level settings however can also be enabled on application side.

Also, if the TCP connection is idle for 4 min, the SLB will close the TCP connection and send RESETS.  This SLB behavior was enabled. 
  - [Load-balancer-tcp-reset](https://docs.microsoft.com/en-us/azure/load-balancer/load-balancer-tcp-reset)
  - _Load Balancer will send bidirectional TCP Reset (TCP RST packets) to both client and server endpoints at the time of idle timeout for all matching flows._

#Pinning of Instance Values
- see this doc:
- [How to Increase AZFW Instance Count - Overview](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/720854/How-to-Increase-AZFW-Instance-Count)


Contributors:
@Aalok Vyas
@Paul Nassif