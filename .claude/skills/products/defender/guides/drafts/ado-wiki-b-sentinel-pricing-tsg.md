---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Billing/[TSG] - Microsoft Sentinel Pricing"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FBilling%2F%5BTSG%5D%20-%20Microsoft%20Sentinel%20Pricing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# [TSG] - Microsoft Sentinel Pricing

## Reset Pricing Tier

When a customer selects the wrong pricing tier, they are locked for 31 days. To reset:

**Prerequisites**: There should be an IcM requesting this action with all workspace details.

1. Access the Geneva [Action Portal](https://jarvis-west.dc.ad.msft.net/1FFBC080) using SAW with gme/ame account
2. Under Filter, search for `opt`. 3 options available:
   - `AMBackend > LACP Operations > Opt out of 31 day capacity reservation`
   - `AMBackend > LACP Operations > Opt out of 31 day capacity reservation for Sentinel`
   - `AMBackend > LACP Operations > Opt out of 31 day capacity reservation for a cluster`
3. Insert workspace details:
   - Work-item source: `other`
   - Work-item ID: IcM number
   - Resource type: `ACIS`
   - Justification: `Resetting capacity reservation per customer's request for workspace {workspace_Id}`
   - Scope: `SentinelBilling`
   - Access Level: `PlatformServiceOperator`
4. Submit and wait for access approval
5. Run both `Opt out of 31 day capacity reservation` and `Opt out of 31 day capacity reservation for Sentinel`
6. Both results must succeed

**Access**: Security group `tm-sentinel-css` via [OneIdentity](https://oneidentity.core.windows.net/Group).

## Simplified Pricing (July 2023+)

| Tier | Cost (example) |
|---|---|
| PayGO | $4/GB |
| 100GB | $296 |
| 200GB | $638 |
| 300GB | $800 |
| 400GB | $1037 |
| 500GB | $1265 |
| 1TB | $2480 |
| 2TB | $4800 |
| 5TB | $11550 |

Key points:
- Unified meter = LA + Sentinel combined
- New customers default to simplified pricing
- Only pre-July 2023 tenants can revert to classic (not via UI)
- Customer discounts on old meters are NOT auto-migrated
- DfS P2 500MB benefit extended to unified meter (roughly doubles economic benefit)
- Change tier via [Azure Resource Manager](https://learn.microsoft.com/en-us/azure/sentinel/enroll-simplified-pricing-tier?tabs=azure-resource-manager#change-pricing-tier-to-simplified)

## Free Connectors (Classic)
- Azure Activity, AAD Identity Protection (P2), Azure Information Protection, Azure ATP (Alerts), Azure Security Center (Alerts), MCAS (Alerts), MDATP (Alerts), Office 365

## Tracking Pricing Changes

Search Activity Log for operation `Microsoft.OperationsManagement/solutions/write` (displayed as "Create new OMS solution"). Navigate to **Change history** for who/when/old+new values. Failed changes also recorded.

Note: Pricing tier changes take effect on the following UTC day.

## Sentinel Benefit for M365 E5/A5/F5/G5

Query to check benefit applied:
```kusto
Operation
| where OperationKey == "Benefit type used: SentinelMicrosoft365" or OperationKey == "Benefit type used: MicrosoftDefender"
| parse OperationKey with "Benefit type used: " benefitType
| where TimeGenerated >= ago(31d)
| parse Detail with "Benefit amount used: " benefitAmount " GB"
| extend benefitAmount = todouble(benefitAmount)
| summarize benefitAmount = max(benefitAmount) by bin(TimeGenerated, 1d), benefitType
```

## Data Lake Pricing (Preview)

| Meter | Rate (East US) | Notes |
|---|---|---|
| Data lake ingestion | $0.05/GB | Entra asset ingestion free during preview |
| Data processing | $0.10/GB | Free during preview until 10/1, billing for DCRs |
| Data lake storage | $0.026/GB/mo | 30 days included; asset retention locked at 30d |
| Data lake query | $0.005/GB | Bills for lake exploration, KQL jobs, search jobs |
| Advanced data insights | $0.15/compute-hr | Notebook sessions (billing starts on session start, 20min timeout) |

For billing issues: ICM to **MSG Consumption Billing / Consumption-Billing-MSG-ICM-Team**.

## Data Lake Offboarding

Customers cannot self-service offboard. Escalate via ICM to **MSG Tenant Provisioning / Triage**.
Include: customer name, reason, Tenant ID, Subscription, optionally workspaces.
SLA: 4 days.

## Cost Management (Defender Portal)

- Requires Azure Subscription Owner or Billing Admin roles
- Not visible? Sign out and sign back in
- Initial data latency: 26 hours; refresh: up to 24 hours (normally <4 hours)
- Preview: 90 days of usage shown
- Issues: ICM to **MSG Consumption Billing**

## IcM Escalation

Refer to [Sentinel PG & Dev lookup escalation path](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3314/Sentinel-PG-Dev-lookup-escalation-path).

## Definitions
- **PAYG**: Pay per GB ingested (fixed per-GB cost)
- **Commitment Tier**: Discounted lump sum for committed volume (per-GB cost decreases with higher tiers)
- **Overage**: Data above committed volume, charged at effective per-GB rate of selected tier (not PAYG rate)
- **Effective Per GB cost**: Total cost / total GB ingested
