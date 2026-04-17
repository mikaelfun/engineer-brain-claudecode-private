---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/Troubleshooting/HowTo: Verify AppGateway WAF Name, State and Mode Config using the ACIS NRP Extension"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FTroubleshooting%2FHowTo%3A%20Verify%20AppGateway%20WAF%20Name%2C%20State%20and%20Mode%20Config%20using%20the%20ACIS%20NRP%20Extension"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# HowTo: Verify AppGateway WAF Name, State and Mode Config using the ACIS NRP Extension

[[_TOC_]]

## Summary

Determine if WAF is in use, and what mode WAF is running in:
- detection
- prevention

## "HowTo: Inspect an AppGateway using the ACIS NRP Extension"

ACIS Link:
https://acis.engineering.core.windows.net/WorkFlowTools.aspx?EndpointCategory=NRP&Endpoint=Production&OperationKey=GetNrpSubscriptionDetails&wellknownsubscriptionidparam=00000000-0000-0000-0000-000000000000&smenrpregionparam=WestUS&StartExecution=false

Within the output, find the AppGateway configuration. Check the SKU and provisioningState:

```json
"moveOperationState": "Succeeded",
"properties": {
  "provisioningState": "Succeeded",
  "sku": {
    "name": "WAF_Medium",
    "tier": "WAF",
    "capacity": 2
  },
  "operationalState": "Running"
}
```

Also look directly after the `"probes"` output for WAF config:

```json
"probes": [],
"webApplicationFirewallConfiguration": {
  "enabled": true,
  "firewallMode": "Detection"
}
```

- `enabled: true` → WAF is active
- `firewallMode: "Detection"` → Detection mode (logs but doesn't block)
- `firewallMode: "Prevention"` → Prevention mode (actively blocks matched traffic)
