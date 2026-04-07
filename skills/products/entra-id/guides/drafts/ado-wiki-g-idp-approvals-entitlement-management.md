---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/ID Protection based approvals for access package requests in Entitlement Management"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FID%20Protection%20based%20approvals%20for%20access%20package%20requests%20in%20Entitlement%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# ID Protection Based Approvals for Access Package Requests in Entitlement Management

## Summary

Integration of Microsoft Entra ID Protection (IDP) signals into the access package approval workflow in Entitlement Management. When enabled, risky users requesting access packages get an additional approval stage routed to Security Administrators before standard approval routing.

## License Requirements

- Microsoft Entra ID Governance or Microsoft Entra Suite licenses

## Prerequisites

- Must first deploy ID Protection: https://learn.microsoft.com/en-us/entra/id-protection/how-to-deploy-identity-protection

## How Risk-Based Approvals Work

**Note: If the customer has enabled both the IDP and IRM options, the access package request will first route to the IDP approver, then to the IRM approver, and finally to the access package policy approvers.**

1. **Risk evaluation**: Entitlement Management queries Microsoft Entra ID Protection for the user's current `userRiskLevel`
2. **Configuration check**: If the user's risk level matches one of the administrator-selected thresholds (e.g., Medium or High), an additional risk-based approval stage is added
3. **Automatic approver assignment**: Request is routed to users assigned the **Security Administrator** role
4. **Security review**: Approvers review risk details and approve/deny
   - If approved → continues through standard approval steps
   - If denied → request is closed, logged, no further routing
5. **Audit logging**: All actions captured in Entitlement Management logs

## Configuration Steps

1. Sign in to Microsoft Entra admin center as at least Identity Governance Administrator
2. Browse to **ID Governance** > **Entitlement management** > **Control configurations**
3. On the **Risk-based approval (Preview)** card, select **View settings**
4. Next to **Require approval for users with ID protection risk (Preview)**, select **Customize**
5. Set the ID protection user risk level and select **Save**

## Reviewing a Risky User's Request

- Approver must have the **Security Administrator** role
- View pending requests via the access package requests page
- Approve or deny via the My Access portal

**Important: Approvers have a maximum of 14 days to take action. If they don't act within that time frame, requests are automatically denied.**

## ICM Path

- **Owning Service**: Azure AD Entitlement Lifecycle Management
- **Owning Team**: Triage
