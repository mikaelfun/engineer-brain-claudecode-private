---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Datapath CA Signaling"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20%28ZTNA%29%2FDatapath%20CA%20Signaling"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Datapath CA Signaling Troubleshooting

Feature doc: [CA signaling](https://review.learn.microsoft.com/azure/global-secure-access/how-to-compliant-network?branch=release-preview-ztna#enable-global-secure-access-signaling-for-conditional-access)

## Issue: CA Signaling header is missing on login or data packet

**Source IP restoration & Compliant Network** features will work **only** if CA-signaling toggle is enabled.

### Enable CA Signaling
In the Admin Entra portal: Global Secure Access -> Global settings -> Session management -> Adaptive Access
or [direct link](https://entra.microsoft.com/#view/Microsoft_Azure_Network_Access/Security.ReactView)

> After activating CA-signaling it may take ~30 minutes for changes to take effect.

## Checking if CA-signaling is enabled for the tenant

1. Confirm the CA Signaling button is toggled to ON in Admin UX
2. Check via Kusto:

```kql
// Last timestamp when CASignaling was in enabled state
let NaasTenantId = "INSERT_TENANT_ID"; // Insert home Tenant ID
RoxyHttpOperationEvent
| where TenantId == NaasTenantId
| where CaSignalingEnabled == true
| summarize max(TIMESTAMP)
```

The timestamp must be now or close to within 15 mins from now.

## Checking if request was sent with CA-signaling using NaaS Correlation ID

```kql
let naasCorrelationId = "INSERT_CORRELATION_ID"; // client correlation id
RoxyHttpOperationEvent
| where FlowCorrelationId == naasCorrelationId
| project TenantId, CaSignalingEnabled, TRv2Enabled, UserId, FlowCorrelationId
```

- CaSignalingEnabled = true -> working correctly
- Empty results -> issue is on the client side (client disabled, M365 traffic profile not enabled, etc.)

## Checking with AAD Correlation ID

When user receives login block message, take the correlation ID from the blocked window:

```kql
let aadCorrelationId = "INSERT_AAD_CORRELATION_ID"; // from login blocked window
RoxyHttpOperationEvent
| where AadHeaderXmsRequestId == aadCorrelationId
| project TenantId, CaSignalingEnabled, TRv2Enabled, UserId, FlowCorrelationId
```
