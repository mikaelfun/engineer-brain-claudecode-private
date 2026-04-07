---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for DNS/[TSG] - DNS alerts associated events"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20DNS%2F%5BTSG%5D%20-%20DNS%20alerts%20associated%20events"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**[TSG] - Network Alerts Investigation**

# Overview
In this article we will go over on how we can identify the events associated with a DNS (Domain Name Service) alert (e.g. Communication with suspicious domain identified by threat intelligence)

## What do check from Kusto
First we need to get the respective Security Alert:
```
cluster('romeeus.eastus.kusto.windows.net').database("ProdAlerts").SecurityAlerts
| where SystemAlertId == "{Alert ID provided}
```
The important information we need to collect is:
- DNS name flagged as malicious
- Affected resource ID
- StartTimeUTC & EndTimeUTC
- Alert Provider
- The VM container ID. You can retrieve this from ASC (Azure Support Center), under Container data section.

To get the related events to the alert you can use
[this DGrep dashboard](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&time=2023-11-28T10:08:00.000Z&offset=~1&offsetUnit=Minutes&UTC=true&ep=Diagnostics%20PROD&ns=PrivateDnsRr&en=DnsResponseSuccess).

**Note**: The containerID will change once the Virtual machine(resource) is restarted.
