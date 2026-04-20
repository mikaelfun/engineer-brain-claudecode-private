---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/SNAT and NO SNAT Behavior"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Firewall%2FFeatures%20%26%20Functions%2FSNAT%20and%20NO%20SNAT%20Behavior"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]


#Overview
What is SNAT and DNAT: https://ipwithease.com/snat-vs-dnat/

Azure Firewall can retain the sources IP of traffic flowing through it, or it can change the IP address to one of the Azure Firewall Private INSTANCE IP addresses.

View from the AZURE PORTAL

![Edit Private Traffic Prefixes in Private IP Ranges from Azure Portal](/.attachments/image-689d9af0-6e48-4eb3-ae76-6b2544faf9fb.png)

_By default, Azure Firewall does not SNAT when the destination IP address is a private range per IANA RFC 1918. You can change this behavior to avoid SNAT for additional public IP address ranges or to force SNAT for specified private IP ranges._

_Please enter the IP address prefix(es) in a comma separated format. To include the default IANA ranges, add "IANAPrivateRanges" as one of your IP Prefixes below. To never SNAT use 0.0.0.0/0 as your private IP address range. To always SNAT, use 255.255.255.255/32 as your private IP address range._

#Intranet Behaviors - VNET/ONPREMISES/PEEREDVNET Communications
Communication behavior internal private ip address to other internal private Ip addresses can be configured to operated in different ways. 

By default the AZURE FW will not SNAT communication between RFC 1918 ip addresss.  This publicly documented: 

https://docs.microsoft.com/en-us/azure/firewall/snat-private-range


**DEFAULT Out-of-the-Box Behavoir**

--NO SNAT--
- **Example:** Source 192.168.0.4  --> Destination 172.16.0.5 
- going through a AZFW LB IP (192.168.55.4) 
  - _(Azure Firewall Subnet 192.168.55.0/24)_
- capture on the Destination will show the true source IP address as 192.168.0.4

--SNAT--
- **Example:**  Source Onprem 52.52.52.X (VNET or Onprem-VPNspace using PUBLIC IP space) --> Destination 172.16.0.5
- going through a AZFW LB IP (192.168.55.4)
  - _(Azure Firewall Subnet 192.168.55.0/24)_
- capture on the Destination will show connection from AZFW INSTANCE IP 192.168.55.6
- This behavior can be changed by adding the PUBLIC RANGES to the Private IP Traffic ranges Text Box. 

**NOTE**: If the customer has removed  "IANARanges from the SNAT private IP address ranges, it will SNAT all the internal communication to an Azure Firewall instance IP.

![Not IANAPrivateRanges](/.attachments/image-b27c40b9-cb79-45b1-9776-5ae2e596d985.png)

#Inbound from PUBLIC INTERNET - Using DNAT rules
Since the Azure Firewall uses a standard Azure load balancer, it will still SNAT all incoming connections coming in from a DNAT RULES to a AZFW INSTANCE IP Address.
This is because the AZURE PLATFORM is doing the NATTING from PUBLIC 

ENVIRONMENT DETAILS
- Source Connecting Public IP - 99.107.125.X
- Azure Firewall Public IP - 52.253.77.X
- Azure Firewall LB Private IP - 10.6.6.4 (Azfw subnet 10.6.6.0/24)
- Destination VM Private IP - 10.6.11.4

NAT Rules configured

![Destination Addresses value in NAT Rules configured](/.attachments/image-b4111af0-f22c-485a-b4f8-9404befaeaad.png)

Client Opens RDP to AZFW on DNAT PORT
- 52.253.77.X:5555

Azure Firewall Logs show
- ![Azure Firewall Logs with implicit Network Rules and DNAT](/.attachments/image-59794ca8-c934-4cf1-8060-36fd6317ab00.png)
- See the DNAT RULE, and the change of 5555-->3389 

Packet capture on destination VM:
- ![Packet capture on destination VM results](/.attachments/image-2382f818-737b-4468-8d2c-38a7db7de5cb.png)
-  We see that the RDP Packets matching the ORGINAL CLIENT EPHEMERAL PORT, but the IP address is the AZURE Instance IP at 10.6.6.8. 


#ASC View of the setting

##NEVER SNAT
- Portal
- ![Never snat portal](/.attachments/image-306157bb-4ce6-4ca7-98b6-e3f04985a14e.png)
- ASC
- ![never snat asc](/.attachments/image-ad48b7d6-1625-4fdf-8a07-8217994c5b76.png)

##ALWAYS SNAT
- Portal
-![always snat portal view](/.attachments/image-92e90db9-b34f-4bbe-9028-cbd838502cd2.png)
- ASC
-![always snat ascview](/.attachments/image-4db0db16-5cf7-4134-b33b-1b5472325a4a.png)

<hr>
<hr>
<br>
<hr>

# Never SNAT Behavoirs 
Per our public doc we state that,  if you enabled NEVER SNAT, it will break outbound connecitivity with Network Rules.

![public doc text stating](/.attachments/image-5eeac22c-914d-48af-a2d3-46f8e16d8fa7.png)

As of 1/17/2025, the following additional tests and clarifications showed this the expected behavior with connectivity. 
- DNAT RULES will still route traffic to the backend VMs. (Backend vm's will still see the SNAT'd connections from the AZFW instances)
- Any Network Rule matches **will not** route to the internet; the network rules will still process accordingly.  If there is an ALLOW Rule, it will show allowed in the logs.
- Any Application Rule matches **_will still_** route outbound to the Internet through the AZFW.  As with ANY application rule match, it will SNAT it regardless.