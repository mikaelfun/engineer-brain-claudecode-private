---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_Consent_Experiences/How to/Azure AD Admin consent workflow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FHow%20to%2FAzure%20AD%20Admin%20consent%20workflow"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Admin Consent Workflow

Tags: cw.Entra, cw.comm-appex, Admin Consent Flow

[[_TOC_]]

## Feature Overview

The Admin consent workflow gives end-users the ability to request access to applications they cannot consent to due to insufficient permissions. Administrators designate reviewers who approve/deny requests. Released GA July 2020.

**Problem it solves:** When admins disable end-user consent (~30% of top 400 customers), users get generic "unauthorized" errors with no clear escalation path.

## Requirements

- Global Administrator configures the workflow
- Reviewers: Global Admin, Application Admin, or Cloud Application Admin roles
- All end-users including guests can request consent
- Included with Microsoft Entra ID (no extra license)

## Key Error Codes

| Error | Cause | Resolution |
|-------|-------|------------|
| **AADSTS90097** | No reviewer configured — "Review should have at least one decision maker" | Add at least one reviewer in Entra Portal → Enterprise Apps → User Settings → Admin consent requests |
| **AADSTS65004** | User clicked "Back to app" instead of completing consent request — "User declined to consent to access the app" | Expected behavior; instruct user to click "Request approval" not "Back to app" |

## Engineering Teams

- **Request Approval Engine (RAE/R/A Engine)**: Powers the request workflow; shared with Access Reviews, ELM, PIM
- **ESTS (Evolved Secure Token Service)**: Handles `login.microsoftonline.com` experiences for users requesting and admins granting consent
- **IAM Services**: Azure portal admin experiences, tenant-level configurations, pending requests blade

## Configuration

[Admin Consent Workflow Settings Blade](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/UserSettings/menuId/)

Settings:
- Select reviewers (from Global Admin / Cloud App Admin / App Admin roles)
- Toggle email notifications for reviewers and requestors
- Set request expiration duration

> **Important:** Configuration changes are NOT retroactive — pending requests retain the old configuration.

## Troubleshooting Steps

1. Find the Audit event matching the [admin consent workflow audit events](#audit-logs)
2. Locate the CorrelationId under the Activity section
3. Determine which service owns the error:
   - Error on Azure portal (configure/review blade) → **IAM Services**
   - Error on `login.microsoftonline.com` → **ESTS**
   - Internal request processing errors → **R/A Engine**

## Graph API Support

[MS Graph consent requests API](https://docs.microsoft.com/en-us/graph/api/resources/consentrequests-overview?view=graph-rest-1.0)

Key endpoints:
- `policies/adminConsentRequestPolicy` — View/update policy (reviewers, notifications, duration)
- `/identityGovernance/appConsent/appConsentRequests` — List all consent requests
- `/identityGovernance/appConsent/appConsentRequests/{id}/userConsentRequests` — List user requests per app

## Jarvis Tracing

### R/A Engine (Request Approval Engine)

- **Endpoint**: FirstParty PROD
- **Namespace**: AADERM
- **Events**: AccessReviewsQoSEvent
- **Scope**: ROLE == AccessReviewsApi
- **Filters**:
  - `env_cv contains ##<CorrelationID>` 
  - `partnerId contains 284c51c9-9aee-4b8b-a877-febb9c373ae0` (admin consent workflow partner ID)
  - Key operations: `PostToGovernancePolicyTemplate`, `AddBusinessFlow`, `AddAccessReview`, `BusinessFlowBatchRecordDecisions`

### ESTS

- **Endpoint**: Diagnostics PROD
- **Namespace**: AadEvoSTSPROD
- **Events**: PerRequestTableIfx
- **Scope**: ROLE == ESTSFE
- **Filter**: `Call contains Consent:Request`

## Audit Logs

| Scenario | Service | Category | Activity |
|----------|---------|----------|----------|
| Admin enables workflow | Access Reviews | UserManagement | Create governance policy template |
| Admin disables workflow | Access Reviews | UserManagement | Delete governance policy template |
| End-user creates request | Access Reviews | Policy | Create request |
| Reviewer approves | Access Reviews | UserManagement | Approve all requests in business flow |
| Reviewer denies | Access Reviews | UserManagement | Approve all requests in business flow |

> **Limitation:** Audit logs currently show App context, not User context for most actions.

## ICM Escalation

- Portal errors → **Enterprise App Management** team
- Authentication errors → **ESTS / EEE** team
- R/A Engine errors → **AAD Access Reviews** team
- Template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=X3T1x3

## Public Docs

- [Configure admin consent workflow](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/configure-admin-consent-workflow)
