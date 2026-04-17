---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/MPIP Scanner/Support Boundaries: MPIP Scanner"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FMPIP%20Scanner%2FSupport%20Boundaries%3A%20MPIP%20Scanner"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Support Boundaries: MPIP Scanner

Routing reference for MPIP Scanner vs MPIP Client issues.

## Support Ownership Table

| Support Topic | Workload | Support Owner | DfM SAP | Scope | TSG Link |
|---------------|----------|---------------|---------|-------|----------|
| **MPIP Scanner** | Microsoft Purview Information Protection **Scanner** | MPIP (MIP Platform services) | `Security/Microsoft Purview Compliance/Microsoft Purview Information Protection/Scanner` | Scanner issues **only** | [MPIP Scanner TSG](https://aka.ms/MPIPScannerTSG) |
| **MPIP Client** | Microsoft Purview Information Protection **Client** | MPIP (MIP Platform services) | `Security/Microsoft Purview Compliance/Microsoft Purview Information Protection` | MPIP Viewer, right-click "Apply Sensitivity Label with Microsoft Purview", MPIP PowerShell | [MPIP Client TSG](https://aka.ms/MPIPClientTSG) |

## Key Routing Notes

- **Scanner issues** → use the `/Scanner` SAP suffix
- **Client issues** (Viewer, right-click label, PowerShell) → use the base MPIP SAP path (no `/Scanner`)
- Both are owned by the **MPIP (MIP Platform services)** team
