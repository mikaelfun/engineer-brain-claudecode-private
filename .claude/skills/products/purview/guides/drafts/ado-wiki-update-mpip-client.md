---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Client/How to: MPIP Client/How to update the Microsoft Purview Information Protection (MPIP) client?"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Update the Microsoft Purview Information Protection (MPIP) Client

## Update Methods

1. **Manual Download and Installation**
   - Download from [Microsoft Download Center](https://www.microsoft.com/en-us/download/details.aspx?id=53018)
   - Useful for testing or applying updates immediately

2. **Windows Update**
   - New versions published to Microsoft Update Catalog (~1 month after initial release)
   - Devices with automatic updates enabled will install automatically

3. **Enterprise Update Tools**
   - Deploy via WSUS, SCCM, Group Policy, or other third-party software update solutions

## FAQ

**Q: Can you prevent automatic MPIP client updates via Microsoft Update?**

A: No. The MPIP client does not provide an option to enable/disable automatic updates. Update behavior is entirely controlled by the Windows Update settings on the device.

Reference: [Extend sensitivity labeling on Windows](https://learn.microsoft.com/en-us/purview/information-protection-client)
