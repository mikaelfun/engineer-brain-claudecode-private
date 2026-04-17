---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Common Misroute - Microsoft Purview & M365 Compliance"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FCommon%20Misroute%20-%20Microsoft%20Purview%20%26%20M365%20Compliance"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Common Misroute — Microsoft Purview Governance vs M365 Compliance

## Key Distinction

| Purview Data Governance | Purview M365 Compliance |
|--|--|
| Portal: https://purview.microsoft.com/ (new) or https://web.purview.azure.com/ (old) | Portal: https://purview.microsoft.com/compliance |
| Formerly: Azure Purview | Formerly: Microsoft 365 Compliance |
| SAP: DnAI - DGP - Data Governance | SAP: See Compliance SAP list below |
| No subscription tiers | Has subscription tiers (E3/E5) |
| Does NOT handle compliance or risk issues | Handles DLP, eDiscovery, Retention, Labels, etc. |

## Identifying Misroutes
- **Labels on Data Catalog assets** → Governance team
- **Labels on emails or Office files** → Compliance team
- If unclear, **call the customer** to determine which Purview product they need help with

## Compliance SAP Reference
For correct SAP when routing to Compliance: see [New Support Area Paths for Purview Compliance/Information Protection products](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/613559/Microsoft-Purview-Case-Handling-Guidelines)

## Misroute Process
1. Determine the correct team (call customer if needed)
2. Add case notes indicating why transferred
3. Update Internal Title: "Misroute | {date} | Needs Compliance Team"
4. Meet SLA
5. Update SAP to correct team
6. Transfer the case

## Compliance DM Contact
- New Compliance DM: scimdm@microsoft.com
- AMER Premier TA: Jon Bradley, Eduardo Marques
- AMER Pro TAs: Abhishek Balkrishna Patil, Rahul Karayi
