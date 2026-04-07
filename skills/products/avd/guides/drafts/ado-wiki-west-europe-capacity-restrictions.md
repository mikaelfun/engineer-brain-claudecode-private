---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/Restricted Regions/West Europe Capacity Restrictions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSupport%20Processes%20and%20Guidance%2FRestricted%20Regions%2FWest%20Europe%20Capacity%20Restrictions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# West Europe Capacity Restrictions

## Background
Physical space limitations + Dutch Government power supply restrictions prevent new data centers.

## Restrictions
- New W365 customers CANNOT deploy in West Europe
- New MHN provisioning policy: WEU region hidden
- Existing MHN policy edit: WEU hidden
- Existing policy referencing WEU with no deployed CPC: deployments fail with "Please use only supported Windows365 regions"
- New ANC referencing WEU: listed as "Unsupported"
- Existing ANC referencing WEU: health checks fail

## Exception Handling
- **NOT accepted through CSS support cases**
- Customer/CSAM must request via "Get Help"
- Required info: data residency reason, customer size, license count, S500 status, deployment size, risk to Microsoft
