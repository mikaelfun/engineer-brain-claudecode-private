---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Organization Profile/Data Residency"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FOrganization%20Profile%2FData%20Residency"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Data Residency and Data Location

## Types of Data Location Moves

### 1. Legacy Move (Deprecated)
Migrated workloads: Exchange Online mailbox content, SharePoint site content, OneDrive files, Teams chat data.
- [Public docs](https://learn.microsoft.com/en-us/microsoft-365/enterprise/m365-dr-legacy-move-program)

### 2. Advanced Data Residency (ADR)
Commits data to local country/region for supported workloads:
- Exchange Online, SharePoint/OneDrive, Microsoft Teams, Microsoft 365 Copilot
- Microsoft Defender for Office P1, EOP, Office for the Web
- Viva Connections, Viva Topics (retiring Feb 2025)
- Microsoft Purview (DLP, Information Barriers, MIP, Audit Standard/Premium, DLM)

**SLA: 12 months for completing migration for all workloads.**

- [Eligibility & migration expectations](https://learn.microsoft.com/en-us/microsoft-365/enterprise/advanced-data-residency)

### 3. Microsoft 365 Multi-Geo
Enterprise Agreement add-on for expanding M365 presence to multiple geographic regions within a single tenant. Manages data-at-rest locations at user, SharePoint site, M365 Group, and Teams level.
- [Public docs](https://learn.microsoft.com/en-us/microsoft-365/enterprise/microsoft-365-multi-geo)

## Common Scenarios & Handling

### Customer asking about ADR migration progress
- Work with Exchange team for EOP and Exchange Online workload progress
- For other workloads: raise separate cases with SharePoint and MS Teams
- Get Exchange resource to own collab and get EXO/EOP migration updates from PG
- Set expectation: SLA is 12 months, PG can only share if migration is in progress or not

### Workload exceeds 12-month SLA
- Raise case with team handling that specific workload migration
- Note: Copilot for M365 depends on Teams workload migration; Viva depends on SharePoint/OneDrive migration

### ADR licenses expired
- License expiry does NOT affect migration process
- Customer must renew to keep local country/region as committed location
- If not renewed: Exchange Online, Teams, SharePoint remain in local region; other workloads show Asia Pacific

### Want data in different region (e.g., Japan tenant wants EU data location)
- ADR cannot do this - ADR commits data to LOCAL region/country only
- Multi-Geo capabilities needed for cross-region data placement

## Supportability Routing

Cases should be supported by the CSS team for the specific service in question. If multiple services involved, promote to multiple incidents.

| Service | SAP |
|---------|-----|
| Exchange Online | Exchange/Exchange Online |
| SharePoint/OneDrive | SharePoint/SharePoint Online/Multi-Geo/PDL |
| Microsoft Teams | Teams/Teams/Teams Security and Compliance |
| Copilot for M365 | Microsoft 365/Copilot for Microsoft 365/Copilot |
| Viva Connections | Microsoft Viva/Microsoft Viva Connections/Administration |
| Viva Topics | Microsoft Viva/Microsoft Viva Topics/Topics Center Setup |
