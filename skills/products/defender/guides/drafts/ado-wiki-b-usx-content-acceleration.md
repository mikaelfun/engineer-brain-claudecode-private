---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/[TSG] - USX content acceleration"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/[TSG]%20-%20USX%20content%20acceleration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# USX Content Acceleration - SIEM Migration TSG

Full PG TSG: [Content Acceleration Conversion Issue](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/onesoc-1soc/usx-core/usx-content-acceleration/usx-content-acceleration/tsgs/conversionissue)

## Alert Rule Conversion Issues (SPL Migration)

Currently Search Processing Language (SPL) rule migration are very limited. See "Translate Splunk detection rules" in the [Migration Experience Document](https://aka.ms/siemmigrationexperiencedoc) to understand the current scope, upcoming capabilities and roadmap.

## Analytical Rule Deployment Issues

1. Customers can select rules to deploy on "Configure and deploy" section.
2. Once selection done, customers can see the status of each rule deployment in notifications.
3. For any deployment issue, collect from customers:
   - **HAR files**: Collect HAR file from customer's browser
   - **Exported template**: Customer can select rules they are trying to deploy and select "Export selected rule template" and collect that exported template file.

## Escalation / Monitoring

| Service Name in ICM | Team Name in ICM |
|--|--|
| USX Content Acceleration | Siem Migration |

### Monitoring Dashboards
- [Content translation operation status & latency query](https://dataexplorer.azure.com/clusters/azportalpartner/databases/AzurePortal?query=...)
- [Parse SPL API availability and latency Metrics](https://portal.microsoftgeneva.com/dashboard/SentinelMigration/APIs/ParseSPL%20API)
- [SPL translation success Metrics](https://portal.microsoftgeneva.com/dashboard/SentinelMigration/APIs/Translation%20Success%20%25)
