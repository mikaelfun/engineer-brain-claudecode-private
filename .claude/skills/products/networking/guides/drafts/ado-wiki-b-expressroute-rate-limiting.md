---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/ExpressRoute Rate Limiting"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/ExpressRoute%20Rate%20Limiting"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# ExpressRoute Rate Limiting

[[_TOC_]]

## Description

Starting 7/19/2023 we will be gradually rolling out ExpressRoute circuit rate limiting. 

**ExpressRoute** using service provider ports (non ExpressRoute Direct) is currently being rolled out in phases.

**ExpressRoute Direct** rate limiting by circuit is currently in private preview.

## ExpressRoute FAQ

[Public Documentation](https://learn.microsoft.com/en-us/azure/expressroute/provider-rate-limit)

Rate-limiting does not slow down the traffic. We don't shape traffic, just hard policing when the throughput bursts over configured bandwidth limit over a circuit link over certain sub second interval.

### When is the feature rolled-out?

It is rolled-out in a phased approach starting July 12th, 2023.

**The first customer facing phase starts on July 19th, 2023. Please see the following work item to confirm the go live date per MSEE:**

#52572

The first 4 Phases have been completed and we are currently holding off until February 2024 to continue to phase 5.

### How does rate-limiting impact my circuit/MSEE?

An ExpressRoute circuit consists of two connection between Microsoft enterprise edge routers and Customer/Provider edge (CE/PE) routers.
- If your circuit bandwidth is configured to be 1 Gbps and if you equally load balance your traffic across both the connection, you can go up to 2 Gbps. *Note that our SLA is only for 1 Gbps.*
- If you were to exceed the configured bandwidth over either of the connections, then the rate-limiting would restrict the throughput to the configured bandwidth.

![Diagram of an ExpressRoute circuit with two connections, each limited to 1 Gbps bandwidth.](/.attachments/image-3f1e0e08-9eec-4586-82da-b5d927d858fa.png)

### How can a customer check if they are bursting above their configured bandwidth?

#### BitsPerSecond

To be prepared and ensure that your production traffic bursts does not get dropped due to rate-limiting, ensure that your maximum ingress (‘BitsInPerSecond’) and egress (‘BitsOutPerSecond’) historical utilization rate of your ExpressRoute circuit via the primary and secondary connections is less than the configured bandwidth of your ExpressRoute circuit.

#### QOS

Two new metrics have been introduced to show dropped in ingress and egress packets when customer oversubscribe the allocated bandwidth.

New Metrics:

- QOS: Dropped BitsInPerSecond
- QOS: Dropped BitsOutPerSecond

DroppedInBitsPerSecond and DroppedOutBitsPerSecond data will only be displayed when ExpressRoute circuit bandwidth is oversubscribed at any given time. Because metrics data is averaged over 1min , 5min so on, customer may see BitsInPerSecond and BitsOutPerSecond data show that circuit is not oversubscribed, but at the same time see DroppedInBitsPerSecond and DroppedOutBitsPerSecond for a given time. This because the way data is averaged over interval time. This will be specially occur when traffic bursts exceeds the subscribed bandwidth. This is something to keep in mind when explaining graphs to the customer.

#### Confirm QOS Drops

Kusto:

```
cluster('hybridnetworking.kusto.windows.net').database('aznwmds').ERMetricsLogsTable
| where TIMESTAMP >= ago(7d)
| where MetricName == "QosDropBitsInPerSecond" or MetricName == "QosDropBitsOutPerSecond"
| parse Message with "ResourceId="ResourceID",ServiceKey="ServiceKey",MetricValue="QosDropBits
| parse FunctionName with "ExpressRouteDevicePollerChildWorkItemForMetrics@("MSEEdevices ")"
| where QosDropBits != "0"
| where ServiceKey == "AzureServiceKey" //Replace AzureServiceKey from customer's circuit
| project TIMESTAMP, MSEEdevices, MetricName, ServiceKey, QosDropBits, ResourceID
```

### How can I increase my circuit bandwidth?

On the Azure portal, select the ExpressRoute circuit for which you want to increase the bandwidth. Under the configuration (See LHS menu), you have the option to increase your circuit bandwidth. 

### Would increasing my circuit bandwidth, impact the traffic flowing through the circuit?

No

### How long would it take to for the bandwidth increase to take effect?

Typically, a few seconds but depends on how long the operation takes to complete. Within 5 minutes a safe assumption.

### After increasing the circuit bandwidth, can I revert it back? Or would I be able to decrease the circuit bandwidth?

No, you cannot decrease the bandwidth of an existing ExpressRoute circuit. For that you need to create a new ExpressRoute circuit with the lower bandwidth, migrate the traffic to the new circuit, and delete the old circuit.

### Does the rate-limiting impact VNet-2-VNet traffic flowing through MSEEs?
No

### Is the feature rolled-out in sovereign clouds?

No. It is rolled-out only in the public cloud.

## ExpressRoute Direct FAQ

This feature allows the ability to control bandwidth from an individual circuit that is created from your ExpressRoute Direct resource. 

### How to Enable
- Go to the ExpressRoute circuit that is associated to the direct port. 
- Select Configuration
- Validate the desired bandwidth is accurate. 
- Change Enable Rate Limiting is set to Yes
- Select Save  

![ExpressRoute Direct rate limiting config example](/.attachments/image-1e6640f0-9203-4881-aeef-4807488c89c5.png)

## Troubleshoot ExpressRoute Direct Rate-limiting

The following will assist in troubleshooting ExpressRoute Direct Rate Limiting:

### Circuit Dashboard
 Check whether there are non-zero drops on [circuit dashboard](https://portal.microsoftgeneva.com/dashboard/AzureERShoeboxProd/ERResources/CircuitDashboard?overrides=[{%22query%22:%22//*[id%3D%27ServiceKey%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id%3D%27ServiceKey/NRPResouceUri%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id%3D%27ResourceId%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22}]%20) in **Ratelimiting Graphs** section. If you see non-zero drops then it's confirmed that packet drops are happening due to rate-limiting. Next steps will tell you if these drops are valid or not. Please note that drops are valid if customer is exceeding the allocated bandwidth.

![ExpressRoute circuit “ckt2” with 1 Gbps bandwidth, rate limiting, and metered billing at Toronto.](/.attachments/image-c3bebf1a-cde0-472f-8a0f-feffcaabb3a2.png)

### Verify the Configuration on MSEE Device

Confirm the circuit bandwidth in ASC. Note this down to compare to the below configuration.

#### Cisco

The rate-limiting configuration will have two numbers we need to be concerned about:

- **CIR (Committed Information Rate)**: CIR is same as circuit bandwidth in bps with 20% buffer

- **Burst-Size (bc)**: This feature allows you the option of specifying the committed burst (bc) size as milliseconds (ms) of the class bandwidth when you configure traffic policing. The number of milliseconds is used to calculate the number of bytes.

Cisco we have a policy which we apply to sub-interface:

- Commands:
  - Show policy:
    - Command: show run policy-map RL-<servicekey> | sec class
    - [Jarvis Action](https://jarvis-west.dc.ad.msft.net/85B7B70C?genevatraceguid=e437ccc5-4adf-4b49-b383-3b869e7c92f4)

    ![show rate limiting policy applied to service key](/.attachments/image-60363355-dcb3-4538-9f1c-3b5533a67728.png)
  - Show Interface
    - Command: show run interface <sub-interface>
    - [Jarvis Action](https://jarvis-west.dc.ad.msft.net/801DF639?genevatraceguid=c19140a1-8593-4978-833a-0754e59429be)

     ![show run interface command to see service policy](/.attachments/image-3c32c832-2f5c-48f9-8b36-925a4bd82b04.png)

*Notes:*
-  This is only showing primary. Please run the command again to get the secondary MSEE configuration.
- If rate limiting is not configured on the device, you won't see any output.

#### Juniper

The rate-limiting configuration will have two numbers we need to be concerned about:

**Bandwidth-limit**: in bps with 20% buffer

**Burst-Size-Limit**: The burst size allows for short periods of traffic bursting (back-to-back traffic at average rates that exceed the configured bandwidth limit).

In the Juniper configuration, we define both filters and policers first. Then we attach the policer to the sub-interface.

- Commands: 
     - show configuration firewall rate limit (filter):
         - Command: show configuration firewall family inet filter rate-limit-private-**<servicekey>**-v4 | display set
         - [Jarvis Action](https://jarvis-west.dc.ad.msft.net/726C466?genevatraceguid=c48c957a-0ca8-4f6f-a852-f46435509d9a)

         ![show configuration firewall family inet filter rate-limit-private](/.attachments/image-9528de83-b5ce-458e-86bc-787c4d8f01ff.png)
     - Show configuration firewall policer rate-limit (policer):
         - Command: show configuration firewall policer rate-limit-**<servicekey>** | display set
         - [Jarvis Action](https://jarvis-west.dc.ad.msft.net/D63C2D77?genevatraceguid=35ba16dd-be6e-4d82-a8cc-2ddcb10f0601)

         ![Firewall policer for “exr01.chg” with 1.2 Gbps limit and discard on burst over 150 MB.](/.attachments/image-1086b9dd-a327-480d-8ba8-660b78418d84.png)
     - Show interface configuration to validate rate limiting has been applied (policer to sub-interface):
         - Command: show configuration interface **<subinterface>**
         - [Jarvis Action](https://jarvis-west.dc.ad.msft.net/14E83C14?genevatraceguid=a2af923e-a2d6-4deb-ab0b-aaa3bbebd399)

         ![Interface config for “exr01.chg” with VLAN tags, rate-limit filters, and ARP policer.](/.attachments/image-846bf633-06c5-49b3-bf72-349f1324474b.png)

*Notes:*
-  This is only showing primary. Please run the command again to get the secondary MSEE configuration.
- If rate limiting is not configured on the device, you won't see any output.

#### Arista

- Commands:
  - Show policy:
    - Command: "show policing" (displays all policies configured on the MSEE device and applied to sub interfaces)
    - [Jarvis Action](https://portal.microsoftgeneva.com/9C997254?genevatraceguid=3376da27-0439-42bf-bcd0-fc995403018e)

    ![show all rate limiting policies applied to all sub interfaces](/.attachments/image-Arista-show-policing.png)
  - Show Interface:
    - Command: "show run interface <sub-interface>" (displays the policy currently applied to a specific sub interface)
    - [Jarvis Action](https://portal.microsoftgeneva.com/25AF3CDE?genevatraceguid=3376da27-0439-42bf-bcd0-fc995403018e)

     ![show run interface command to see service policy](/.attachments/image-Arista-sh-run-interface.png)



### Validate Traffic Drops

- [ ] See "Peering Traffic" and "Qos graphs" section in [circuit dashboard](https://portal.microsoftgeneva.com/dashboard/AzureERShoeboxProd/ERResources/CircuitDashboard?overrides=[{%22query%22:%22//*[id%3D%27ServiceKey%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id%3D%27ServiceKey/NRPResouceUri%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22},{%22query%22:%22//*[id%3D%27ResourceId%27]%22,%22key%22:%22value%22,%22replacement%22:%22%22}]%20)
- [ ] If the traffic is exceeding the bandwidth, verify whether the dropped traffic is appropriate
   
         Dropped BitsInPerSecond = (Traffic In: BitsInPerSecond) minus circuit bandwidth
         Dropped BitsOutPerSecond = (Traffic Out: BitsOutPerSecond) minus circuit bandwidth
 
If the above condition is true, then inform Cx that they are exceeding the allotted bandwidth

- [ ] If the drops at MSEE are happening even when the Cx sends traffic within the bandwidth limit, then this can be a data-path issue, further debugging is required.

# Contributors
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 
- @<598DD33E-F08C-6FCA-BCC0-B28404CEC3B4>
- @<C0DF87D0-940D-6199-BF69-12ECBB01F53A> 


