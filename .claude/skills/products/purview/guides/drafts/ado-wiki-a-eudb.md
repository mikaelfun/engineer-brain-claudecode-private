---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Processes/EUDB"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FProcesses%2FEUDB"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# EU Data Boundary (EUDB) - DFM Access

## Introduction

Two versions of DFM exist: Global DFM and EU DFM. EU DFM is for customers who opt in to keep their data within EU boundary. All users must have DFM EU account provisioned (contact TA/manager if needed).

## What Changed

Starting **Nov 18th**, EU DFM access requires one of:
1. SAW machine
2. EU Data Boundary virtual desktop

## For FTEs

- If already using SAW machine: no further action required
- If NOT using SAW machine:
  1. Request **EUDB_AVD** membership through [CoreIdentity](https://coreidentity.microsoft.com/)
  2. Download & install Remote Desktop
  3. Launch EU DB virtual Desktop

## Helpful Links

- [What is the EU Data Boundary?](https://learn.microsoft.com/en-us/privacy/eudb/eu-data-boundary-learn)
- [Prepare for EUDB Implementation](https://microsoft.sharepoint.com/teams/CSS/SitePages/NewsPacket-2024-07-EUDB.aspx)
- [About AVD: European Union Boundaries](https://microsoft.sharepoint.com/sites/Identity_Authentication/SitePages/AVD-EUB/About-AVD-EUB.aspx)
- [EUDB-AVD Overview](https://dev.azure.com/AzureSupportability/AzureEEEPlaybook/_wiki/wikis/AzureEEEPlaybook/265/EUDB-AVD)
- [EUDB-AVD VDI HOW-TO](https://microsoft.sharepoint-df.com/teams/EuInEuFC/SitePages/EUDB-AVD-VDI-HOW-TO.aspx)

## For Non-FTEs

If you're a partner accessing Microsoft resources using Atlas Virtual Desktop, no action is needed - you can continue accessing EU DFM as before.

## Queues in AVD

Use [Queues - Overview](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/946718/Queues) to add queues to Case Buddy in AVD for efficient EU DFM case access.
