---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2B/B2B TSG : Invitations are blocked for this directory due to suspicious activity"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2B/B2B%20TSG%20%3A%20Invitations%20are%20blocked%20for%20this%20directory%20due%20to%20suspicious%20activity"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# B2B TSG: Invitations are blocked for this directory due to suspicious activity

## Error Message

"Invitations are blocked for this directory due to suspicious activity. Please contact Microsoft support to help"

> **Warning**: The Azure and Entra admin portal may throw an inaccurate error message: **"User invitation failed - Insufficient privileges to complete the operation"** even when a Global Administrator tries to invite someone. The underlying Graph API call is actually failing due to the tenant being blocked.

## Root Cause

Microsoft performs anomaly detection to prevent fraudulent bulk invites and will block invitations to protect customers. Customers should keep an active paid subscription to prevent false positive blocking.

## Invitation Limits (as of December 9, 2025)

| Tenant Type | Age | Limit |
|---|---|---|
| **Paid** Enterprise | Newly created (<=30 days) | 200 invitations/day |
| **Paid** Enterprise | Existing (>30 days) | Capped by directory object quota limits |
| **Unpaid** Enterprise | Newly created (<=30 days) | 10 invitations/day |
| **Unpaid** Enterprise | Existing (>30 days) | 100 invitations/day |

Published limits: [Service limits and restrictions - B2B Invitations](https://learn.microsoft.com/en-us/entra/identity/users/directory-service-limits-restrictions#b2b-invitations)

## Support Engineer Steps

1. **Obtain failure details**: Tenant ID, Correlation ID, Timestamp from customer or ASC Tenant Explorer -> Audit Logs -> filter by Activity = `Invite external user`. Confirm resultReason = `Invitations from this directory are blocked`.

2. **Validate blocking via Jarvis**: Use [Example Jarvis Query](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-15&offsetUnit=Hours&UTC=true&ep=Diagnostics%20PROD&ns=B2BMds&en=B2BAdminPortalErrorEvent,B2BAdminPortalEvent,B2bCommonEvent,B2bQoSCommonEvent,B2BRedeemPortalErrorEvent,B2BRedeemPortalEvent,B2BWorkerErrorEvent,B2BWorkerEvent) with:
   - Update time range to match error timestamp
   - Set `contextId` = customer's Tenant ID
   - Filter `operationName == "MsGraphCreateInvite"`
   - Confirm: `resultType=Error`, `resultSignature=Forbidden`, `resultDescription` contains "Invitations are blocked"
   - If `resultType=Success` with GUID in resultDescription = tenant is **not** blocked

3. **Request business justification** from customer for bulk invitations.

4. **Raise ICM** using template: [[ID][IDM][B2B] Unblock Invitations](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=E2qf3D). Include: tenant ID, correlation ID, timestamp, business justification.

5. **Assign ICM to TA** as owner.

> ICM requests processed Monday-Friday only.

## Technical Advisor Steps

### Prerequisites

- B2B Invitation Manager PG has enabled access via `AME\TM-SCIMID-TA-B2BOps` security group. Request access on SAW via https://oneidentity.core.windows.net.
- [DS Explorer Access](https://dev.azure.com/IdentityCommunities/SCIM%20ID%20Technical%20Advisors/_wiki/wikis/Azure-ID-Technical-Advisors.wiki/202/SAW-Tools)

### Unblock Steps

1. Confirm SE has identified tenant ID and error details
2. From SAW/AME, confirm error via Jarvis query (same as above)
3. Follow self-service unblock process via TM-SCIMID-TA-B2BOps tooling

## Access Requirements

Jarvis logs require [Azure Standard Access entitlement](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azurestandar-bnfs) which all FTEs should have.
