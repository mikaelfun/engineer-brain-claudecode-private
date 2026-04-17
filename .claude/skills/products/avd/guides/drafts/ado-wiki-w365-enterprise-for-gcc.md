---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Government/Windows 365 Enterprise for GCC Customers"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Government/Windows%20365%20Enterprise%20for%20GCC%20Customers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Enterprise for GCC Customers

## Overview

Windows 365 Enterprise is FedRAMP compliant and can now be purchased by customers with an existing GCC tenant. Previously, GCC tenants could only buy Windows 365 Government SKUs.

Key differences:
- GCC tenant can buy W365 Enterprise and use Azure **Commercial** subscription for custom images and ANC
- W365 Enterprise does NOT offer same compliance as W365 Government GCC (no CJIS, no IRS 1075)
- Only FedRAMP compliance is maintained

## Autopatch/MMD Enrollment

Autopatch/MMD enrollment is **not applicable** for W365 Enterprise for Government customers because Autopatch/MMD only supports commercial licenses and tenants.

When creating a provisioning policy, GCC customers will not see the "Additional Services" UX in Intune Admin Center.

**Known Issue**: At release, GCC customers who purchased W365 Enterprise WILL see the Additional Services UX, but will get an error stating Autopatch can't be configured. **Solution**: Select "None" to continue creating the provisioning policy.

## Additional Services Status by Tenant Category

| Tenant Category | W365 Scale Unit | Additional Services UX |
|---|---|---|
| Regular Commercial | All PROD (PRNA01, PRAU01) | Visible |
| W365 Enterprise for GCC | PRNA01 or PRNA02 | Visible - Temporary |
| GCC (w/o mapped GOV tenant) | GCP01 | Hidden |
| GCC (w/mapped GOV tenant) | GCP01 | Hidden |
| GCC-H | GHP01 | Hidden |

## References

- [W365 Support Readiness Training](https://microsoft.sharepoint.com/:f:/t/CEContentLocker/2BePublished/ElQt383Mk0pFkQ80cZchMD4BukAkyBFPAWdpN6xCk0H_hA?e=qotHPe)
- [Understanding Compliance Between M365 Offerings](https://techcommunity.microsoft.com/t5/public-sector-blog/understanding-compliance-between-microsoft-365-commercial-gcc/ba-p/718445)
