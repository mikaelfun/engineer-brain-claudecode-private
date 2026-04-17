---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/Labs/LAB - User Consent Settings \u2013 Low Risk permissions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FLabs%2FLAB%20-%20User%20Consent%20Settings%20%E2%80%93%20Low%20Risk%20permissions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# User Consent Settings — Low Risk Permissions

## Objective

Configure low-risk permission classification so regular users can consent to specific permissions without requiring admin consent.

## Background

Default "Do not allow user consent" blocks users from consenting even to harmless permissions like `Tasks.Read` and `Files.Read`. By classifying permissions as **Low Risk**, users can consent directly without the admin consent workflow.

## Setup: Configure Low Risk Permissions

### Step 1: Set User Consent to "Low impact" mode

Entra Admin Center → **Entra ID** → **Enterprise Applications** → **Consent and Permissions** → **User consent settings**

Select: **"Allow user consent for apps from verified publishers, for selected permissions"**

(A hyperlink "Select permissions to classify as low impact" appears → navigate to **Permissions classifications** tab)

### Step 2: Add Low-Risk Permission Classifications

Permissions classifications → **+ Add permissions** → Microsoft Graph → **Delegated permissions**

Search for and add:
- `Tasks.Read`
- `Files.Read`
- `User.Read` (already present by default)
- `openid`
- `profile`
- `offline_access`

> ⚠️ Use **Delegated permissions** — Application permissions are for daemon/background services.

## User Experience

**Before low-risk classification:** User accessing the app lands on the Admin Consent Request page — blocked.

**After low-risk classification:** User lands on the **user consent screen** and can grant consent themselves — no admin approval needed.

## Sample Test URL

```
https://login.microsoftonline.com/{TENANT-ID}/oauth2/v2.0/authorize?
client_id={CLIENT-ID-OF-APP}
&response_type=token
&redirect_uri=https://jwt.ms
&response_mode=fragment
&scope=openid%20profile%20offline_access%20User.Read%20Tasks.Read%20Files.Read
&state=12345
```

## Reference

- [Consent experience for applications in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/application-consent-experience)
- [Configure the admin consent workflow](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-admin-consent-workflow)
