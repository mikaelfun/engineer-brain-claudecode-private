---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Self-Hosted IR in Windows/How to collect valid troubleshooting package"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20Windows%2FHow%20to%20collect%20valid%20troubleshooting%20package"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Collect Valid Troubleshooting Package

The troubleshooting package is essential for addressing issues related to third-party data sources.

## Steps

### Step 1: Enable Troubleshooting Flag
Enable the troubleshooting package flag during Data Source registration.

### Step 2: Run Scan via SHIR

### Step 3: Collect Package
After scan finishes, troubleshooting package files are generated at:
`C:\windows\ServiceProfiles\DIAHostService\AppData\Local\Microsoft\Purview\Troubleshooting`

## Q&A

**Q: Do I need to collect for every scan run?**
A: Yes, a new scan creates a new package and overwrites previous folders.

**Q: Can I share steps with customer and request logs?**
A: No. Schedule a Teams call with CX, guide them to collect logs. Validate before escalating. A valid folder has folders for options, props, and schema.

**Q: What logs are required for 3rd party scan issues?**
A: Collect promptly after issue scan:
- Scan run ID
- Report ID
- Troubleshooting package
