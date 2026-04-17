---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services - Service Log Queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20Domain%20Services%2FMicrosoft%20Entra%20Domain%20Services%20-%20Service%20Log%20Queries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AADDS Service Log Queries (Jarvis Reference)

Reference table of Jarvis/Geneva query links for Microsoft Entra Domain Services troubleshooting.

> **Note (2023-06)**: Queries using the `dcaasfleetprod` namespace require @ame.gbl account with AAD-TA security group membership from a SAW. Contact AAD TA if needed.

## Verify Managed Domain Existence

| Scenario | Query | Notes |
|--|--|--|
| By Entra Tenant ID | Commercial: https://portal.microsoftgeneva.com/s/E12FAE0 / AzGov: https://jarvis-west.dc.ad.msft.net/AD15C148 | Replace contextID filter |
| By managed domain name | Commercial: https://jarvis-west.dc.ad.msft.net/DB2B0759 / AzGov: https://jarvis-west.dc.ad.msft.net/1E84B743 | Replace domainName filter |
| By Azure Subscription ID | Commercial: https://portal.microsoftgeneva.com/s/F5E0D22E | Replace clientSubscriptionID filter |

## Login / Security Events

| Scenario | Query | Notes |
|--|--|--|
| Login Events by Username | Namespace: dcaasfleetprod / Commercial: https://jarvis-west.dc.ad.msft.net/F4AF8ACD / AzGov: https://portal.microsoftgeneva.com/s/4187C308 | Replace timestamp, tenant ID, username |
| Account Lockout by Username | https://jarvis-west.dc.ad.msft.net/3EA6C61F | Replace timestamp, tenant ID, username |
| Account Changes (password changes) | https://jarvis-west.dc.ad.msft.net/A4F823A7 | Replace timestamp, tenant ID, username |
| Account Creation | https://jarvis-west.dc.ad.msft.net/2C241DB9 | Replace timestamp, tenant ID, username |
| Computer Account Events (join/change/delete) | https://jarvis-west.dc.ad.msft.net/A5F35EBC | Replace timestamp, tenant ID |
| MEDS Diagnostic Logs | Commercial: https://portal.microsoftgeneva.com/s/5AF00A4B | Change timeframe + resource ID |

## Deployment Failures

| Scenario | Query | Notes |
|--|--|--|
| Domain creation failures | Namespace: dcaasprod/OperationEvent / Commercial: https://jarvis-west.dc.ad.msft.net/3FE55172 / AzGov: https://jarvis-west.dc.ad.msft.net/ADF92A5 | Replace timestamp + tenant ID; use activityID for verbose trace |
| Domain trust creation failures | Commercial: https://portal.microsoftgeneva.com/s/F99A5886 | Replace contextID (tenant ID); check resultSignature column |
| Verbose Trace Logs for activityID | https://jarvis-west.dc.ad.msft.net/E7B0347C | Use activityID from deployment failure query |
