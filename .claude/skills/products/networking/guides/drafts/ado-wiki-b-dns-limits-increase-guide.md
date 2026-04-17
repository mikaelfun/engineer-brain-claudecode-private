---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Increasing Azure DNS related limits"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DNS/Increasing%20Azure%20DNS%20related%20limits"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Increasing Azure DNS Related Limits

## Azure DNS limits reference

Public limits: [Azure DNS limits](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-dns-limits)

## Limits that CAN be increased

### Via ASMS team

Quota increase requests for standard limits are managed by ASMS team.

| Limit | Soft Cap (safe increase) |
|---|---|
| Max Number of Zones per subscription | Up to 10,000 |
| Max Number of record sets per zone per subscription | Up to 25,000 |

### Via ICM (TA approval required) — PUBLIC DNS

| Limit | Notes |
|---|---|
| TXT records per recordset | Hard limit: 100 TXT records/record set (as of 05.23.24). ICM required. |
| DNS Aliases to a specific resource | Default: 20. Can increase up to 50. PG involvement required via AVA. As of 10/22/24 private preview allows thousands. |

**ICM preparation**: Include `MaxNumberOfRecordsPerRecordSet` current value. Use this Jarvis query (add customer subscription ID):
`https://portal.microsoftgeneva.com/87617D17?genevatraceguid=35934791-8dd4-4bbd-8d96-9538eea9c18f`

**AVA post requirements**: Current limit, requested limit, strong business justification. Have a TA involve PG to engage PM team.

### PRIVATE DNS limits

Refer to [AzureWiki Private DNS Limits](https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/24606/Azure-DNS-Private-Zones?anchor=limits-%26-restrictions) for current increase limits and upper caps.

> **NOTE**: Private DNS increases require PM approval. Post to Teams with: current limit, requested limit, business justification. TA must involve PG to engage PM team.

## Limits that CANNOT be increased (Hard Caps)

| Limit | Hard Cap | Notes |
|---|---|---|
| DNS Aliases to a specific resource (Private DNS) | Max 20 | Cannot be increased even via ICM. ICM ref: 245564400 |
| DNS queries per VM per second to Azure DNS resolver | Max 1,000 | **Workaround**: Distribute additional DNS queries across other VMs |
| Private DNS records in a record set | Max 20 (publicly documented) | Actual hard limit; cannot be increased |

## Process Summary

```
Is it a standard limit (zones/recordsets)?
  → ASMS team handles quota increase

Is it a PUBLIC DNS limit (TXT records, aliases)?
  → Create ICM (TA approval required)
  → For aliases > 20: TA must involve PG via AVA post

Is it a PRIVATE DNS limit?
  → Post to Teams with justification
  → TA must involve PG to engage PM team

Is it a hard cap (alias records=20, DNS QPS=1000, private records/set=20)?
  → Cannot be increased
  → Provide workaround (e.g., distribute DNS load across VMs)
```
