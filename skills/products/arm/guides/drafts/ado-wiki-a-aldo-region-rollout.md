---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/ALDO Release Info and Builds/Region Rollout"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FALDO%20Release%20Info%20and%20Builds%2FRegion%20Rollout"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Src: [Winfield Region Rollout.docx](https://microsoft.sharepoint.com/:w:/r/teams/ASZ/Shared%20Documents/Arc-A/Winfield%20Region%20Rollout.docx?d=w03ef171b80954419a626e1b0a9ec15e2&csf=1&web=1&e=IFTs2t)

# Region Rollout

This document describes the rollout plan for ALDO (Azure Local Disconnected Operations / Winfield) across regions and sovereign clouds, including dependencies and timelines.

**PM:** Harald S. Fianbakken
**SWE:** Arun Ramachandran

## Dependencies

- ALDO takes a dependency on the **Edge Resource Provider (RP)** and is deployed as a separate resource type within that RP.
- There is an **indirect dependency on the HCI RP**, which must be present in the same regions to enable required functionality such as log collection.

---

## Commercial Azure

### Public Preview (July 2025) :white_check_mark:

The following regions were enabled for Public Preview to support expected customers distributed across major geographies:

| Region |
|---|
| East US |
| West US3 |
| West Europe |
| UK South |
| Southeast Asia |
| Australia East |

### General Availability (Q1 CY26) :white_check_mark: **Current**

For GA, ALDO is enabled in **all regions where HCI is present**. The Nov/Dec rollout expanded coverage to all HCI-supported regions.

- [HCI Supported Regions](https://learn.microsoft.com/en-us/azure-stack/hci/concepts/system-requirements#azure-requirements)

---

## Sovereign & Government Clouds

### Fairfax

| Milestone | Timeline |
|---|---|
| Public Preview | July 2025 :white_check_mark: |
| General Availability | Q1 CY26 :white_check_mark: |

### US Secret Cloud (USSec)

| Milestone | Timeline |
|---|---|
| Public Preview | Q1 CY26 |
| General Availability | Q3 CY26 |

- Staged rollout after Fairfax GA
- Approximately 6 months after Fairfax GA

### US National (USNat)

| Milestone | Timeline |
|---|---|
| Public Preview | Q1 CY26 |
| General Availability | Q3 CY26 |

- Rolling out in parallel with USSec
- Staged rollout after Fairfax GA
- Approximately 6 months after Fairfax GA
