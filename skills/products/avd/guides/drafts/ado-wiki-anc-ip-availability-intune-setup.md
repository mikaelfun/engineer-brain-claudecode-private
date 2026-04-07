---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/ANC new IP Availability column in Intune/Setup"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/ANC%20new%20IP%20Availability%20column%20in%20Intune/Setup"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# ANC IP Availability Column Setup - Windows 365

## What CSS should verify

- Customer has an existing ANC.
- ANC is in a healthy state.
- IPs Available column is visible by default in Intune.
- Value updates automatically (hourly).

## What "good" looks like

- IPs Available column is visible without configuration.
- IP count is a non-zero value.
- Provisioning succeeds when sufficient IPs exist.

## Manual refresh behavior

- To refresh immediately, admins must run ANC health checks (PM confirmation).
