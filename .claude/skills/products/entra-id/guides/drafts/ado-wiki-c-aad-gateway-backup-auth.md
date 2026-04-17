---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD ESTS/Understanding AAD Gateway and Backup Authentication in Microsoft Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20ESTS%2FUnderstanding%20AAD%20Gateway%20and%20Backup%20Authentication%20in%20Microsoft%20Entra%20ID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Understanding AAD Gateway and Backup Authentication in Microsoft Entra ID

## Overview

Microsoft Entra ID architecture includes the AAD Gateway (GW) and Backup Authentication System - two components critical for request routing, observability, and resilience.

## AAD Gateway (GW)

Acts as a reverse proxy and common entry point for all Entra ID services. All requests pass through Gateway before reaching STS endpoints (e.g., /oauth2/token).

**Key functions:**
- SSL Certificate Management
- Proximity-Based Request Routing
- Traffic Augmentation
- Service Observability
- Client Request Routing

## Backup Authentication System

Microsoft Entra ID includes a backup system for resilience. Product teams regularly route traffic to it for preventive testing.

Reference: [Backup Authentication System for Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/architecture/backup-authentication-system)

## Why This Matters for Troubleshooting

When requests are routed to backup system:
- **Error formats differ**: HTTP 403/500 instead of AADSTS error codes
- **STS-specific headers missing**: x-ms-request-id, x-ms-ests-server absent
- **Routing indicator**: `Set-Cookie: x-ms-gateway-slice=CCS` confirms backup routing

## Troubleshooting Steps

1. Get HAR trace or Fiddler trace if possible
2. Ask for application-side response logs
3. **Query Kusto (addgwwst cluster)**:

```kql
AllRequestSummaryEvents
| where env_time > datetime(2025-08-24 23:00:00) and env_time < datetime(2025-08-25 00:15:00)
| where OriginalHost == "login.microsoftonline.com"
| where IncomingUrl == "/{tenant_id}/oauth2/token"
| where EffectiveStatusCode startswith "403"
| project env_time, GatewayRequestId, TargetService, TargetHost, EffectiveStatusCode, IsTargetProcessed
```

If TargetService = CSS, request was routed to backup authentication system.

## Key Tip

When you see HTTP errors (403/500) without STS-specific headers, suspect routing to the backup system. Combine header analysis with Kusto queries for confirmation.

## Related
- ESTS Cookies wiki page for more on STS cookies
- ICM reference: Incident-690204511
