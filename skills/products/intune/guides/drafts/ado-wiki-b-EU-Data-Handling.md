---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Processes/EU Data Handling"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Processes/EU%20Data%20Handling"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# EU Data Handling

Author: @<D9F81E3D-0816-6AD9-837D-3CA4E025A7ED>

## EU Data Boundary (EUDB) Enforcement

The EU Data Boundary (EUDB) is being significantly reinforced. As of **February 26, 2025**, all EU based support data (cases where the tenant is based out of an EU scalar unit) is expected to remain within the EUDB.

### Approved Access Paths for DFM-EU
DFM-EU should only be accessed via the following paths:
- SAW
- Atlas VDI (common DP solution)
- [EUDB-AVD (new type of AVD)](../Tools/EUDB-AVD.md)

> ⚠️ Note: This is a **policy-based enforcement**, not a tool-based enforcement. Non-EUDB approved tools will still allow access for the near future, however these situations are being tracked and audited for compliance.

For a complete guide on what is allowed, see [Informational: European Union Data Boundary (EUDB)](https://internal.evergreen.microsoft.com/en-us/topic/484ff0c9-2d7a-46cd-93cc-0f32540cc09e)

## Exceptions

- At the launch of the EUDB, all ICMs will still be worked within the [global ICM endpoint](https://aka.ms/icm).
  - Until otherwise announced, [ICM Data Handling](./ICM-Data-Handling.md) still applies.
  - Planning is underway to migrate EU based ICMs to the [EU ICM endpoint](https://aka.ms/euicm).

## European Commission Cases - Restricted Access Requirements

Review [Updated restricted access requirements for support cases involving the European Commission](https://microsoft.sharepoint.com/teams/CSS/SitePages/CSSNews-2025-EDPS-restricted-access-requirements.aspx) for the updated European Data Protection Supervisor (EDPS) restricted access requirements for support cases involving specifically the ~134 tenants related to the European Commission.

> **Note:** If the customer is not directly related to the entity "The European Commission", these rules do not apply.

Key points:
- Understand EDPS case handling restrictions
- Incident & Crisis Management (ICM) engagement requirements
- The opt-in process
