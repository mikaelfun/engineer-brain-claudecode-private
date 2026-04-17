---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/How to/Azure AD Admin consent workflow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Application_Consent_Experiences/How%20to/Azure%20AD%20Admin%20consent%20workflow"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Admin Consent Workflow

## Feature Overview

Admin consent workflow gives end-users the ability to request access to applications they were previously unable to access because of a lack of permissions. When a user tries to access an application but is unable to provide consent, they can send a request for admin approval. The request is sent via email to admins designated as reviewers.

**Key Benefits:**
- Helps organizations manage access to organizational data and regulate enterprise applications
- Gives administrators increased visibility into what applications users need access to

## Requirements

- Global Administrator role can configure the Admin consent workflow
- Reviewers must have Global, Application, or Cloud Application Administrator roles
- All end-users including guests can request admin consent
- Included with Microsoft Entra ID

## Engineering Teams

| Team | Responsibility |
|------|---------------|
| Request Approval Engine (RAE) | Internal request approval service powering the workflow |
| Evolved Secure Token Service (ESTS) | Authentication experience on login.microsoftonline.com |
| Identity Access Management (IAM) Services | Azure portal experiences (configuration, pending requests) |

## Known Errors

### AADSTS90097 - No Reviewer Configured
- **Error**: "An error has occurred during admin consent processing. Review should have at least one decision maker."
- **Cause**: No reviewer is set up in admin consent workflow settings
- **Fix**: Configure at least one reviewer in Enterprise Applications > User Settings > Admin consent requests

### AADSTS65004 - User Declined Consent
- **Error**: "User declined to consent to access the app"
- **Cause**: User clicked "Back to app" button instead of "Request approval"
- **Note**: This is expected behavior. Entra ID generates AADSTS65004 and sends it to the redirect URI.

## Configuration

- **Configure**: [Azure Portal - User Settings](https://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/UserSettings/menuId/)
- Settings: Select reviewers, email notification toggles, request validity period
- **Important**: Modifying settings does NOT retroactively affect pending requests
- **Known limitation**: A removed reviewer retains ability to review requests created while they were a reviewer, and will receive expiration reminders for those requests

## How End-Users Request Admin Consent

1. User attempts to sign in to the application
2. "Approval required" message appears → user types justification → clicks "Request approval"
3. "Request sent" message confirms submission (only first request is submitted)
4. User receives email notification when request is approved, denied, or expires

## How Reviewers Evaluate Requests

- **Review blade**: [Admin Consent Requests](http://portal.azure.com/#blade/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/AccessRequests/menuId/)
- **Approve**: Grants admin consent; all requestors are notified
- **Deny**: Provides justification to all requestors; users can request again later
- **Block**: Creates disabled service principal; prevents future consent requests for the app

## Troubleshooting

### Where to Start
1. Find the Audit event for admin consent workflow events
2. Locate the CorrelationId under the Activity section

### Which Service to Investigate
| Symptom | Start With |
|---------|-----------|
| Error on Azure portal (configuring workflow or reviewing requests) | IAM Services |
| Error on login.microsoftonline.com (authentication or consent experience) | ESTS |
| Internal request engine issues | R/A Engine |

### Graph API Investigation (ASC Graph Explorer)

**View adminConsentRequestPolicy:**
```
GET policies/adminConsentRequestPolicy (v1.0)
```
Shows: reviewers, isEnabled, notifyReviewers, remindersEnabled, requestDurationInDays

**View userConsentRequests:**
1. `GET /identityGovernance/appConsent/appConsentRequests` — list all app consent requests
2. `GET /identityGovernance/appConsent/appConsentRequests/{id}` — get specific request with pendingScopes
3. `GET /identityGovernance/appConsent/appConsentRequests/{id}/userConsentRequests` — list user requests
4. `GET /identityGovernance/appConsent/appConsentRequests/{id}/userConsentRequests/{id}` — view status and approval stages

### Server-Side Tracing - R/A Engine (Jarvis)

- **Endpoint**: FirstParty PROD
- **Namespace**: AADERM
- **Events**: AccessReviewsQoSEvent
- **Scoping**: ROLE == AccessReviewsApi
- **Filtering**:
  - `env_cv` contains `##<CorrelationID>`
  - `partnerId` contains `284c51c9-9aee-4b8b-a877-febb9c373ae0` (admin consent workflow partner)
  - `operationName` contains:
    - `PostToGovernancePolicyTemplate` — admin enables workflow
    - `DeleteSingleGovernancePolicyTemplate` — admin disables workflow
    - `AddBusinessFlow` — first-time app request from ESTS
    - `AddAccessReview` — first-time user request from ESTS
    - `BusinessFlowBatchRecordDecisions` — reviewer approves/denies/blocks

### Server-Side Tracing - ESTS (Jarvis)

- **Endpoint**: Diagnostics PROD
- **Namespace**: AadEvoSTSPROD
- **Events**: PerRequestTableIfx
- **Scoping**: ROLE == ESTSFE
- **Filtering**: `Call` contains `Consent:Request`

### Jarvis Dashboard
- https://jarvis-west.dc.ad.msft.net/dashboard/share/2681F589

## Audit Logs

| Scenario | Service | Category | Activity |
|----------|---------|----------|----------|
| Admin enables workflow | Access Reviews | UserManagement | Create governance policy template |
| Admin disables workflow | Access Reviews | UserManagement | Delete governance policy template |
| Admin updates config | Access Reviews | UserManagement | Update governance policy template |
| User creates request | Access Reviews | Policy | Create request |
| Reviewer approves | Access Reviews | UserManagement | Approve all requests in business flow |
| Reviewer denies | Access Reviews | UserManagement | Approve all requests in business flow |

## ICM Creation

- Review CSSSupportWiki workflows first; consult Cloud Identity TA before submitting ICM
- Default severity: 3 or higher (not mainline scenario)

| Error Location | ICM Target |
|---------------|-----------|
| Azure portal (configuration/review) | Enterprise App Management / Enterprise App Management |
| login.microsoftonline.com (auth experience) | ESTS / EEE |
| Internal R/A Engine issues | AAD Access Reviews / AAD Access Reviews |

## Public Documentation
- [Configure admin consent workflow](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/configure-admin-consent-workflow)
- [Graph API - Consent requests management](https://docs.microsoft.com/en-us/graph/api/resources/consentrequests-overview?view=graph-rest-1.0)
