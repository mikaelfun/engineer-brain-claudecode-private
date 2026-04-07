---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Government/Windows 365 Government Guidelines and Troubleshooting/Windows 365 Offerings"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FWindows%20365%20Government%2FWindows%20365%20Government%20Guidelines%20and%20Troubleshooting%2FWindows%20365%20Offerings"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Windows 365 Government Offerings Overview

### Windows 365 Enterprise (GCC FedRAMP)

- Customers provision and deploy Cloud PCs within their Commercial GCC tenant.
- Environment: **.onmicrosoft.com** — Azure Commercial Backend
- Support: Can be supported by any support engineer.
- GCC FedRAMP is its own offering and is different than Commercial.
- Windows 365 Enterprise for FedRAMP is configured the same as the current Commercial offer but the GCC customers cannot see Commercial offers.

### Windows 365 Government for GCC (aka Windows 365 GCC)

- Customers must have a Government and Commercial tenant.
- Windows 365 Cloud PC resources are deployed into tenant (**.onmicrosoft.us**) environment; customer needs to run tools to map their Commercial GCC tenant to their Microsoft Azure Government (MAG) tenant.
- Environment: **.onmicrosoft.com** — Azure Commercial with Fairfax backend.
- Support: Can be supported by any support engineer. **If there is an issue with provisioning or mapping, the support should be passed to US Nat Support Engineer because of the Fairfax backend.**
- For customers that want regular Intune but need some sovereign cloud security without full FedRAMP compliance.
- Requires mapping of commercial tenant and Government tenant with shared Intune instance.
- Originally done via PowerShell script (long and problematic). Since June 2023, the GCC Setup Tool (single UI tool) replaces the script — only needs to run once.

### Windows 365 GCCH (GCC High)

- Customer must have a government license.
- Higher security.
- Environment: GCCH resources deployed into MAG tenant (**.onmicrosoft.us**) — Sovereign backend (Fairfax/Virginia).
- Support: **US Nat screened Engineers only.**

### GCCH Support Challenges

- Higher security requirements
- US Nat Support only
- Sovereign Backend (Fairfax/Virginia)
- **.onmicrosoft.us** environment
- Data breach is always a concern — audits are done on GCCH customer cases
- Must be diligent and cautious regarding data handling rules
- Improper data handling = violation → legal consequences and potential loss of Microsoft's government program accreditation
