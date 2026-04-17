---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/Labs/LAB - User Consent Settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FLabs%2FLAB%20-%20User%20Consent%20Settings"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# User Consent Settings — Admin Consent Workflow Setup & Demo

## Overview

When user consent is disabled, users cannot grant application access. The **Admin Consent Workflow** allows users to request access, which is routed to an admin for review.

## Setup: Configure Admin Consent Workflow

1. Entra Admin Center → **Entra ID** → **Enterprise Applications** → **Consent and Permissions** → **User consent settings**
2. Under **User consent settings** → select **Do not allow user consent**
3. Under **Admin consent settings** → toggle **Yes** for "Users can request admin consent to apps they are unable to consent to"
4. Under **Who can review admin consent requests** → assign reviewers (Global Admins or other roles)

## User Experience Flow

**Required App Registration attributes:**
- Application ID (client ID)
- Tenant ID (directory ID)
- Redirect URI (Authentication blade)
- Scopes (API Permissions blade)

**Sample authorization URL:**
```
https://login.microsoftonline.com/{TENANT-ID}/oauth2/v2.0/authorize?
client_id={CLIENT-ID}
&response_type=token
&redirect_uri=https://jwt.ms
&response_mode=fragment
&scope=openid%20profile%20email
&state=12345
```

**Flow steps:**
1. User navigates to the app URL → authenticates → lands on "Approval Required" screen
2. User provides justification and clicks "Request approval"
3. User is redirected to a "pending" confirmation screen

## Admin Review Actions

Navigate to: Enterprise Applications → **Admin Consent Requests** → My pending

| Action | Effect |
|---|---|
| **Review permissions and consent** → Accept | Grants admin consent; users can now access app without consent prompts |
| **Deny** | Rejects current request only; future requests still allowed |
| **Block** | Rejects request AND prevents future requests; creates a **disabled service principal** |

### Block vs Deny

- **Block:** Creates disabled SP, blocking the app from being used or requested again. To verify: Enterprise Apps → find app → Properties → "Enabled for users to sign-in?" = **NO**
- **Deny:** Only rejects the current request; user can request again

### Audit Log

**"All (preview)"** tab shows all admin consent requests across the tenant regardless of reviewer assignment. This is an audit view only — approve/deny buttons are disabled there.

## Verification After Consent Granted

API Permissions blade in App Registration → Status field shows **"Granted for {tenant}"**

## Reference

- [Consent experience for applications in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/application-consent-experience)
- [Configure the admin consent workflow](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-admin-consent-workflow)
