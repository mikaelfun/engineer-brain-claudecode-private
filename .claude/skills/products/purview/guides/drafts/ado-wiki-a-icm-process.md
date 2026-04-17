---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Escalation/IcM/ICM Process"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FEscalation%2FIcM%2FICM%20Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ICM Process

Authors: Tiffany Fischer, Yvonne Zhang

## Prerequisites

- Review [ICM Basics](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/413748/IcM-Basics)
- Review Video Training Library → Escalations → ICM

**NOTE**: Check for Known Issues before opening a new ICM. Confirm in AVA if PG would like us to open a new ICM. When in doubt, open a new ICM.

## Escalating to PG: ICM Creation

### Always use ASC to escalate ICMs to PG

If you cannot find a template for Purview:
1. Use the Empty Template
2. Type "Security Platform" as the Service
3. Select the Purview Team under the Field "Team"
4. Select the appropriate team based on [Product Mapping](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/1214463/-Updated-Mapping-for-Purview-Components-at-ICM)

## Gather Basics

Before escalating, collect:
- Always include the AVA link related to the DFM case
- Follow TSG: [Logs for Escalation](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912731/Logs-Required-for-Escalation-General)
- For billing related: follow [Look Up Billing Charges](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912980/Look-Up-Billing-Charges)

## ICM Title Format

**Consistent title format**: `[CSS SEV A/B/C] [Premier/ARR] [Cx Name] - Short Description - Case Number`

- Do NOT modify or replace the `[CSS SEV x]` tag in the title
- APPEND additional tags like "CSAT Impacting" to the title
- Open the ICM and verify "Incident Type" is marked as "Customer Reported"
- For "IcM Owning Team = Purview Data Governance": add `[Region]` to the title

## ICM Severity Levels

| Severity | Reason | Required Approval |
|----------|--------|-------------------|
| 1 | Complete outage of an entire region | TA/Manager/EEE/PG |
| 2 | Impacting multiple customers, massive costs, block for massive users, no workaround | TA/Manager |
| 3 | Standard customer issue | SME recommended |
| 4 | Low impact / feature request | None |

Use appropriate [ICM Templates](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912729/IcM-Templates)
