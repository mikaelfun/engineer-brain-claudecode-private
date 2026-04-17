# Purview Feature Verification Status in Gallatin

> Source: OneNote - Purview feature verified in Gallatin
> Status: draft

## Verified Working

| Feature | Status | Notes |
|---------|--------|-------|
| Allow overrides from M365 services | Working | Verified in Gallatin |
| Microsoft Purview Access Expiration | Working | Verified in Gallatin |
| Purview Information Protection client | Available | ICM 520698580 |
| Sensitivity labels for Groups & Sites | GA | PM confirmed, requires EnableMIPLabels PowerShell setup |
| Co-authoring with sensitivity labels | GA | PM confirmed |
| Retention Policy for Teams messages | Working | Message retention works |
| DLP for OneDrive | Working | Initially tracked, now verified works |

## Not Available / Partial

| Feature | Status | Tracking | Notes |
|---------|--------|----------|-------|
| DLP "evaluate predicate for" | Not available | ADO 4787238 | Available in Global, missing in Gallatin |
| Retention for OneDrive | Not available | Tracking with PG | Cannot add custom ODB account; impacts Teams file retention |
| Auto-labeling | Not supported, no plan | - | Confirmed no plan for Gallatin |
| Custom Audit retention policy | Not supported | - | Confirmed not available |
| Sensitivity label SPO auto email notification | Partial | Confirmed by SPO team | Audit activity works, email notification does not |
| Retention Policy for Teams files | Partial | Tracking with PG | Files in OneDrive not covered |

## Planned / Coming

| Feature | Timeline | License | Notes |
|---------|----------|---------|-------|
| CMK for eDiscovery | July 2025 | E5 | ADO 4677588 |
| Teams DLP | July 2025 | E5 | ADO wiki TSG available |
| DLP Alert | Planned end June, delayed | - | Infra not ready |
| CMK (all workloads) | July 2025 | E5 | Setup guide available |
| Cross-cloud labeling | Public Preview | - | Only offline Word/Excel/PPT, no email |
| New Purview Portal | GA | - | Already landed |
| E5 IP & Governance license | July 2025 | - | New license SKU |
