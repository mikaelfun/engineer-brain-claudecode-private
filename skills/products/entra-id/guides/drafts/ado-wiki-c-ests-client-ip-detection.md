---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD ESTS/How ESTS detects Client IP"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20ESTS%2FHow%20ESTS%20detects%20Client%20IP"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How ESTS Detects Client IP

## Overview

ESTS detects client IP during authentication (after credential validation, before policy evaluation). Primary purpose: Conditional Access policy evaluation.

## Client IP Sources

| ClientIPSource | Value | Description |
|----------------|-------|-------------|
| XForwardedFor | 1 | Most common; IP from AAD gateway X-Forwarded-For header |
| ClientAssertion | 3 | Special flow by EXO/1st party in S2S (EAS); reads user IP from ClientAssertion |
| OriginalIPAddressClaim | 4 | Refresh token grant for confidential client; uses IP from incoming RT |
| Jwt | 5 | On-behalf-of flow; parses IP from JWT claims (not web server IP) |
| DeviceFlowUserCode | 6 | Device code flow; uses remote device IP (not interactive login device) |
| VnetClientIp | - | Override with IPv4 from Gateway x-ms-vnet-client-ip header |

## How to Check in ASC Logs

1. Search keyword **"clientip"** in **PerRequestLogs** column
2. Or search **"changing client ip"** in **Diagnostic Logs** (last line = final determination)

## Common Issues

### 1. Refresh Token Grant IP Mismatch (Confidential Client)
- **By design**: Uses OriginalIPAddressClaim (ClientIPSource=4)
- **Actual app server IP**: Search "XFwdIp" in PerRequestLogs

### 2. Device Code Flow IP Mismatch
- **By design**: Uses DeviceFlowUserCode (ClientIPSource=6)
- Shows remote device IP, not interactive login device IP

### 3. VNet Client IP (IPv6 Instead of IPv4)
- SFI effort: AzureActiveDirectory service endpoint tag routes through VNet using IPv6
- If tenant/VNet in VnetIdsThatCanOverrideClientIp list: ESTS overrides with IPv4
- When override happens: ClientIPSource = VnetClientIp

## Microsoft Services IP Identification
- Azure IP Ranges: https://www.microsoft.com/en-us/download/details.aspx?id=56519
- CSS Toolkit: https://csstoolkit.azurewebsites.net/ (all clouds)

## ICM Path
- Use ESTS Escalation Guidelines path
