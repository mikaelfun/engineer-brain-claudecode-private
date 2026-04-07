---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/[Procedure] MDC Refund request flow"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FMDC%20Pricing%2C%20Billing%20and%20Usage%2F%5BProcedure%5D%20MDC%20Refund%20request%20flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Defender for Cloud Customers Refund Request Process

## The Flow

1. Customer asks for a refund via support request
2. MDC support engineer verifies details according to this wiki
3. CSS creates IcM using refund template ID **P1Fyc1**
4. MDC EEE inspects the claim and acknowledges the IcM
5. EEE engages engineering to verify the issue
6. EEE ensures the refund reason is fixed to avoid recurrence
7. EEE approves/declines the refund
   - Approved Premiere → CSS engages CSAM or Azure Billing
   - Approved Professional → CSS collaborates with Azure Billing
   - Rejected → CSS provides Engineering reason to customer

## Valid Reasons for Refund

1. **Incorrect or Unexpected Billing**
2. **Billing continued** due to system delay after plan was disabled
3. **Duplicate Charges** — same resource type billed under overlapping plans
4. **Known Microsoft Issues** — documented bug causing unexpected activation/alerts/ingestion costs
5. **Feature Behavior Not Matching Documentation** — billed due to behavior contradicting official pricing docs

## Required Information (Mandatory)

| Field | Description |
|-------|-------------|
| **Affected MDC plan** | Which plan is subject to the claim |
| **Affected resource type** | e.g. VM, Storage Account, SQL server, AKS |
| **Reason for Refund** | Business justification in customer's own words |
| **Affected Subscriptions / Tenant ID** | List subscription(s) by ID or tenant ID |
| **Time Period** | Claim start date - end date |
| **Fix Work-Item** | Link of IcM or ADO work-item fixing the root cause |

**Optional:** Claimed refund amount (with currency), Invoice or Cost Analysis graph.

## Filing the Request

1. Ensure SAP is "Defender for *<plan>*/enabling plan, pricing and settings"
2. Fill IcM template: [P1Fyc1](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=P1Fyc1)
3. Summary table and custom fields are mandatory

## Important Notes

- **Databricks and VMSS refund requests**: Will be approved only after excluding them from MDC billing
- If issue discussed in Teams/Email with PG direction, mention or link the discussion
- Once approved, resolved IcM must be resumed with collaboration task to Azure Billing
- MDE integration discount: **no retroactive compensation**
