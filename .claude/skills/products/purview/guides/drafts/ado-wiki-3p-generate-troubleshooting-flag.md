---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Sources/Third party/3P Data Sources - How to generate troubleshooting flag"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Sources%2FThird%20party%2F3P%20Data%20Sources%20-%20How%20to%20generate%20troubleshooting%20flag"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Applicable scenario

- Scan for 3rd party sources
- Scan via SHIR

## Steps to generate troubleshooting flag

1. Add feature flag behind URL: `&feature.ext.datasource={"scanTroubleShootingPackage":true}` Refresh page, choose SHIR as runtime and turn on the troubleshooting flag.

2. Trigger a scan and wait for it to complete.

3. Troubleshooting package files will be generated in your SHIR. Default path:
   `C:\windows\ServiceProfiles\DIAHostService\AppData\Local\Microsoft\Purview\Troubleshooting`

4. Only one troubleshooting package is allowed to be generated per machine. Verify the file modified time in case they are overwritten by another scan.

5. Zip all files under the Troubleshooting folder and send to PG team.

## Clean up

Turning on the troubleshooting flag will downgrade scan performance. Remember to turn it off after getting the required package.
