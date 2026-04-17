---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Insider risk management based approvals for access package requests in Entitlement Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FInsider%20risk%20management%20based%20approvals%20for%20access%20package%20requests%20in%20Entitlement%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Insider Risk Management Based Approvals for Access Package Requests in Entitlement Management

## Summary

Integration of Microsoft Purview Insider Risk Management (IRM) signals into the access package approval workflow in Entitlement Management. When enabled, users flagged as risky by IRM get an additional approval stage routed to Compliance Administrators before standard approval routing.

## License Requirements

- Microsoft Entra ID Governance or Microsoft Entra Suite licenses
- Appropriate licensing for Microsoft Purview

## Prerequisites

- Must first create an Insider Risk Management policy: https://learn.microsoft.com/en-us/purview/insider-risk-management-plan

## How Risk-Based Approvals Work

1. **Risk evaluation**: Entitlement Management queries Microsoft Purview Insider Risk Management for the user's current `userRiskLevel`
2. **Configuration check**: If risk level matches threshold (e.g., Moderate or Elevated), an additional approval stage is added
3. **Automatic approver assignment**: Request is routed to users assigned the **Compliance Administrator** role
4. **Compliance review**: Approvers review risk details and approve/deny
   - If approved → continues through standard approval steps
   - If denied → request is closed, logged, no further routing
5. **Audit logging**: All actions captured in Entitlement Management logs

## Configuration Steps

1. Sign in to Microsoft Entra admin center as at least Identity Governance Administrator
2. Browse to **ID Governance** > **Entitlement management** > **Control configurations**
3. On the **Risk-based approval (Preview)** card, select **View settings**
4. Next to **Require approval for users with insider risk level (Preview)**, select **Customize**
5. Set the insider risk level and select **Save**

## Reviewing a Risky User's Request

- Approver must have the **Compliance Administrator** role
- View pending requests via the access package requests page
- Approve or deny via the My Access portal

**Important: Approvers have a maximum of 14 days to take action. If they don't act within that time frame, requests are automatically denied.**

## Difference from ID Protection Approvals

| Aspect | ID Protection | Insider Risk Management |
|--------|---------------|------------------------|
| Signal Source | Microsoft Entra ID Protection | Microsoft Purview IRM |
| Risk Levels | Medium, High | Moderate, Elevated |
| Approver Role | Security Administrator | Compliance Administrator |
| Prerequisite | Deploy ID Protection | Create IRM policy in Purview |

**Note: If both IDP and IRM are enabled, request routes: IDP approver → IRM approver → standard approvers.**

## ICM Path

- **Owning Service**: Azure AD Entitlement Lifecycle Management
- **Owning Team**: Triage
