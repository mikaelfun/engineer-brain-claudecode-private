---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/Outbound DDoS Troubleshooting to External IPs"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/Outbound%20DDoS%20Troubleshooting%20to%20External%20IPs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Description

This document aims to assist engineers with troubleshooting outbound DDoS scenarios. Specifically, when drops occur with traffic leaving Azure to a public IP address. The principles of this wiki apply to all suspected outbound traffic drop scenarios.

# Overview
Virtual Machines in Azure have a limitation for sending outbound traffic to NON-MICROSOFT public IP's. 
In order to get these numbers, please contact a TA, as they are Compute VM DDoS limits and **INTERNAL ONLY.**

Once you have the limits, please DO NOT share them externally! There is a risk to the Azure platform if you do.

#Issue definition

In this scenario, a customer reports they are trying to access a Contoso public service from an Azure VM. The customer believes they are experiencing packet loss or that they are not seeing their traffic reach the Contoso service. When Contoso is engaged, they claim they are not seeing traffic from our IP addresses reaching their devices. The customer may feel like they are being throttled.

# Troubleshooting

## Data to gather

1. Destination Public IP
1. Source VM or service
1. Region of resource with issue
1. Time of issue

##EagleEye DDoS Analysis

EagleEye is a powerful tool that can be used to validate if a VIP is under outbound (Azure to internet) DDoS Mitigation. If the VIP is confirmed to be under mitigation, the traffic passing through this VIP will be rerouted via DDoS A10 nodes for further analysis. DDoS mitigation is triggered to protect Azure insfrastructure against DDoS attacks. These mitigation policies protect customers from all volumetric (eg. ICMP Flood) and protocol (eg. SYN Flood) attacks.

Customers can expect a slight increase in latency since traffic is rerouted via DDoS A10 nodes for further scrubbing and cleaning.

EagleEye-Test Vm to VIP

Query should be edited with appropriate Source, Destination Public IPv4, and Impact Start/End time.
[EagleEye VM to Dest Dash](https://eagleeye.trafficmanager.net/view/services/EagleEye/pages/Home?__userData=%7B%22nodeData%22%3A%7B%2202d55dc7-644d-4a12-9059-c2f3520f38a6%22%3A%228e644a63-e39d-43f6-98f4-47e5eacdda86%22%7D%7D)

![EagleEye VM to Dest Dash](/.attachments/EagleEye.png)

As seen in the screenshot above, when you click on one of the degraded events in the graph, there is an "External Links" section at the bottom with a link to View in DDoS Sflow Dashboards for "Public IP".

This dashboard will show the outbound mitigation details including (UTP_total_packets_drop and Total_packets_drop). It also provides (total bandwidth, total bandwidth sent, and total bandwidth dropped information.

DDoS Sflow Dashboard
[Outbound Mitigation](https://portal.microsoftgeneva.com/s/7F504E86?overrides=[{"query":"//*[id='DestinationVIP']","key":"value","replacement":"0.0.0.0"}]%20)

![Outbound Mitigation](/.attachments/OutboundMitigation.png)

##Validate DDoS throttling

Utilize the "UDP Per Router pair External IP" dashboard to find if their traffic is being throttled going to the destination IPs.

Outbound UDP DDoS Dash [External DDoS Dash](https://portal.microsoftgeneva.com/s/8BECEEF9?overrides=[{"query":"//*[id='DestinationVIP']","key":"value","replacement":"0.0.0.0"}]%20)

Note - Dashboard should be edited with the Destination Public IP.

Account: CNS
<br>
Namespace: FlowMetricMinuteProd
<br>
Dash: Main_External

![Sample UDP outbound dash.png](/.attachments/Sample%20UDP%20outbound%20dash-4aed5ba0-4830-4f48-a5cb-b4e5387a0010.png)

##Routing Preference Impact

Depending on the routing preference the customer selects for their public IP, the thresholds may be reached at a difference pace.
Choosing "Microsoft Network Routing" may cause DDoS mitigation to activate sooner than it would through "Internet Routing".

This is due to hardware constraints on the edge devices that don't allow for the higher sampling we have configured on the Microsoft Network devices.

Internet Routing Preference
- Packet Sampling: 16K
- Description: Traffic is routed over the public internet (ISP Network) instead of the Microsoft global network. This option is cost-optimized and offers network performance comparable to other cloud providers.

Microsoft Network Preference
- Packet Sampling: 4k
- Description: Traffic is routed through the Microsoft global network, which is a vast, well-provisioned network with multiple redundant fiber paths. It spans over 160,000 miles of fiber and includes over 165 edge points of presence (POP).

Key Differences
- Microsoft network routing samples packets more frequently (every 4k packets) compared to internet routing (every 16k packets). This means that Microsoft network routing can provide more granular monitoring and potentially quicker detection of anomalies.

This may cause the customer to see packet loss only when taking Microsoft Network as the routing preference.

**Please get results from the following queries and dashboard while traversing each preference in routing.**

## Kusto Query

You can also get this information using the following Kusto query.

Execute: [Web](https://dataexplorer.azure.com/clusters/https%3a%2f%2faznwddos.centralus.kusto.windows.net/databases/cnsgeneva?query=H4sIAAAAAAAEAG2RQWuDQBCF7%2f6KV09agnVtUiMlgUAaCDRFMPS%2bukuUrI7sKpLSH9%2fJoYGUzm3e49uZeWv0AGWpP9ZWu5qMwgqLmOvVM2wZonMpq%2fNWXhw7Lyxvt1Tklex3hqZ3OjnvG1OtrcZxf3grjptDjjXkiYI79hFChZCdQm9poIrMx9iW2mK1gkjhgevqKu2GfCxNU%2b37jVK8lAOaDoEv4mUk0jTKsigRmT%2bDn84jkSyiJE7%2fKCKb%2fyoiS5hikqm7fsl9eBvb8hx50p%2fSjBoPteSh%2fo7sJK3SyucT3di20jZfGnlecBIVjd0QhNe74mSOJzzHKC%2f%2frT%2fD1HSKJobKpgtuKc0YceEtveuz6%2fuvYM%2fqTnFIQ9PqqpZ2gOf9AGIn%2bCGyAQAA) 
[Desktop](https://aznwddos.centralus.kusto.windows.net/cnsgeneva?query=H4sIAAAAAAAEAG2RQWuDQBCF7%2f6KV09agnVtUiMlgUAaCDRFMPS%2bukuUrI7sKpLSH9%2fJoYGUzm3e49uZeWv0AGWpP9ZWu5qMwgqLmOvVM2wZonMpq%2fNWXhw7Lyxvt1Tklex3hqZ3OjnvG1OtrcZxf3grjptDjjXkiYI79hFChZCdQm9poIrMx9iW2mK1gkjhgevqKu2GfCxNU%2b37jVK8lAOaDoEv4mUk0jTKsigRmT%2bDn84jkSyiJE7%2fKCKb%2fyoiS5hikqm7fsl9eBvb8hx50p%2fSjBoPteSh%2fo7sJK3SyucT3di20jZfGnlecBIVjd0QhNe74mSOJzzHKC%2f%2frT%2fD1HSKJobKpgtuKc0YceEtveuz6%2fuvYM%2fqTnFIQ9PqqpZ2gOf9AGIn%2bCGyAQAA&web=0) 
[Web (Lens)](https://lens.msftcloudes.com/v2/#/discover/query//results?datasource=(cluster:aznwddos.centralus.kusto.windows.net,database:cnsgeneva,type:Kusto)&query=H4sIAAAAAAAEAG2RQWuDQBCF7%2f6KV09agnVtUiMlgUAaCDRFMPS%2bukuUrI7sKpLSH9%2fJoYGUzm3e49uZeWv0AGWpP9ZWu5qMwgqLmOvVM2wZonMpq%2fNWXhw7Lyxvt1Tklex3hqZ3OjnvG1OtrcZxf3grjptDjjXkiYI79hFChZCdQm9poIrMx9iW2mK1gkjhgevqKu2GfCxNU%2b37jVK8lAOaDoEv4mUk0jTKsigRmT%2bDn84jkSyiJE7%2fKCKb%2fyoiS5hikqm7fsl9eBvb8hx50p%2fSjBoPteSh%2fo7sJK3SyucT3di20jZfGnlecBIVjd0QhNe74mSOJzzHKC%2f%2frT%2fD1HSKJobKpgtuKc0YceEtveuz6%2fuvYM%2fqTnFIQ9PqqpZ2gOf9AGIn%2bCGyAQAA&runquery=1) 
[Desktop (SAW)](https://aznwddos.centralus.kusto.windows.net/cnsgeneva?query=H4sIAAAAAAAEAG2RQWuDQBCF7%2f6KV09agnVtUiMlgUAaCDRFMPS%2bukuUrI7sKpLSH9%2fJoYGUzm3e49uZeWv0AGWpP9ZWu5qMwgqLmOvVM2wZonMpq%2fNWXhw7Lyxvt1Tklex3hqZ3OjnvG1OtrcZxf3grjptDjjXkiYI79hFChZCdQm9poIrMx9iW2mK1gkjhgevqKu2GfCxNU%2b37jVK8lAOaDoEv4mUk0jTKsigRmT%2bDn84jkSyiJE7%2fKCKb%2fyoiS5hikqm7fsl9eBvb8hx50p%2fSjBoPteSh%2fo7sJK3SyucT3di20jZfGnlecBIVjd0QhNe74mSOJzzHKC%2f%2frT%2fD1HSKJobKpgtuKc0YceEtveuz6%2fuvYM%2fqTnFIQ9PqqpZ2gOf9AGIn%2bCGyAQAA&saw=1)
[https://aznwddos.centralus.kusto.windows.net/cnsgeneva](https://aznwddos.centralus.kusto.windows.net/cnsgeneva)
```
let dropThreshold = 50000;
let lookbackDays = 60;
DDoSPcapFlowLogs
| where TIMESTAMP > ago(lookbackDays * 1d) and protocolNumber == 17
    and destPublicIpAddress  in ("0.0.0.0") //replace with the public ip
    and messageValue !has  "Forwarded"
| summarize PPS = count() * 1024 / 30 by destPublicIpAddress, window = bin(TIMESTAMP, 30s)
| where PPS > dropThreshold
| render timechart
```
##Next Steps

Once throttling is validated, open an AVA post with the Kusto data showing the traffic bursts along with the dashboard showing bursting. 

This will require an ICM to have PG adjust the policy to these IP's on the customer's subscription.

##Contributors

@<6F3F8245-FB59-6059-8E37-C8C24FD38A59>
 
@<5A31162C-F6E1-4881-8CBC-5EE044A48763> 

@<DF1C0DF1-4447-661E-B2F3-0E3C551760F6> 