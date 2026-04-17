---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/Troubleshooting/HowTo: Verify AppGateway WAF Name, State and Mode Config using the ACIS Brooklyn Extension"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FHowTo%3A%20Verify%20AppGateway%20WAF%20Name%2C%20State%20and%20Mode%20Config%20using%20the%20ACIS%20Brooklyn%20Extension"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# HowTo: Verify AppGateway WAF Name, State and Mode Config using the ACIS Brooklyn Extension

[[_TOC_]]

## Summary

We can verify AppGateway WAF Name, State and Mode Config by using the **Lists Application Gateways** operation.  
There is also the output to use **Gets Application Gateway Entity** shown as the second example.

## "Lists Application Gateways"

ACIS Link:
https://acis.engineering.core.windows.net/WorkFlowTools.aspx?EndpointCategory=Brooklyn&Endpoint=Brooklyn%20-%20Prod&OperationKey=listsapplicationgateways&subscriptionidparam=00000000-0000-0000-0000-000000000000&smegatewaymanagerregionparam=Global&StartExecution=false

Within the output of this query, look for a line similar to:

```
'WebApplicationFirewallConfig':{'Enabled':true,'Mode':0}
```

- **Mode 0** = Detection mode
- **Mode 1** = Prevention mode

### Sample output excerpt:

```
Config: {'FrontendIPConfigurations':[...],'WebApplicationFirewallConfig':{'Enabled':true,'Mode':0}}
ConfigTimestamp: 11/7/2016 4:54:32 PM
GatewayName: applicationGateway1
GatewaySize: Medium
State: Running
VirtualIPs: ['13.93.218.197']
```

## "Gets Application Gateway Entity"

The other method gives the same results. Use the **Gets Application Gateway Entity** operation in ACIS Brooklyn.

Look for in the XML output:

```xml
<Config>{'...','WebApplicationFirewallConfig':{'Enabled':true,'Mode':0}}</Config>
```

- `Enabled: true` → WAF is active
- `Mode: 0` → Detection; `Mode: 1` → Prevention
