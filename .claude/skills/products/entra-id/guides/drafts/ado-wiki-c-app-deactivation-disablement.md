---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Application Deactivation (Disablement)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FApplication%20Deactivation%20%28Disablement%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Summary

App disablement (or App Deactivation) is a better option than soft deletion because soft deletion removes app data after 30 days and limits property traversal, making investigations of suspicious apps difficult.

**Why Disablement / Deactivation Is Better**

- Keeps app data available indefinitely for investigation while blocking token issuance to suspicious apps
- Clearly signals that an app is suspended, unlike soft deletion which does not distinguish temporary suspension from permanent removal
- Allows flexibility and reversibility beyond 30 days, giving admins and app owners time for investigation and cleanup

When an app is deactivated:

- It cannot access protected resources
- It cannot obtain new access tokens (existing tokens remain valid)
- It stays visible in the Enterprise Apps list for tenants with an instance, but users cannot sign in
- Changes may take up to 60 minutes to take effect

**Ways to Disable Apps**

Third-party app registrations and service principals can be disabled in three ways:

1. **accountEnabled** — Set on service principals when disabled from the portal by toggling **Enabled for users to sign in?** to **No** on the enterprise app.
2. **disabledByMicrosoftStatus** — Set on app registrations that have been disabled globally by Microsoft.
3. **isDisabled** — Set on app registrations that have been disabled globally by the app owner either by clicking the **Deactivate** button on the app registration or setting `"isDisabled"` to `true` using Microsoft Graph API or Microsoft Graph PowerShell.

## Entra (Portal)

Deactivation must be applied to the **App Registration (App Object)**.

**Note**: The **State** that is managed on the App registration object is reflected on the Properties blade of the Enterprise app (Service Principal).

## Microsoft Graph (API)

### Permissions (API)

Graph Permissions for App registration: `Application.ReadWrite.All`

### Disable App Registration (API)

Replace `<appObjectId>` in the endpoint URL and supply a supported value for `isDisabled`:

- `null` — the app is enabled
- `true` — the app is disabled
- `false` — the app is enabled

**Method**: `PATCH`

**URL**: `https://graph.microsoft.com/beta/myorganization/applications/<appObjectId>`

**Request body**:

```json
{
  "isDisabled": true
}
```

### Validate App Registration Activated State (API)

**Method**: `GET`

**URL**: `https://graph.microsoft.com/beta/myorganization/applications/<appObjectId>`

### Validate Enterprise App Activated State (API)

Replace `<servicePrincipalObjectId>` in the endpoint URL to ensure the Enterprise app reflects the change.

**Method**: `GET`

**URL**: `https://graph.microsoft.com/beta/servicePrincipals/<servicePrincipalObjectId>/?$select=id,appId,displayName,accountEnabled,isDisabled,disabledByMicrosoftStatus`

# Troubleshooting

## App Disablement issues

**If the change is being performed by the App lifecycle manager agent:**

1. Verify the app owner consented to the agent disabling the app.
2. Verify the app was not excluded from the batch.
3. Verify the admin can disable the app from the App registration.
4. Examine medenia trace logging for service-side errors reported by the agent.

**If the change is performed by an admin in the Entra portal or with Microsoft Graph API or PowerShell:**

- Capture a browser trace of the failure to set Deactivate on the app registration and observe the API call failure.

## Azure Support Center (ASC)

The following updates have been requested when viewing applications in ASC:

- If `"isDisabled": true` is set on an App registration and projected onto an Enterprise app, a yellow banner will appear stating: "This application has been disabled, but not deleted."
- The **Configuration** tab will show **isDisabled (Deactivated)** with the value that is set: `null`, `true` or `false`.
- The **Service Principal Object** tab will show **isDisabled** with its value under **Details**.
- The **Application Object** tab will show **isDisabled** with its value under **Details**.

# ICM Path

Issues with management of `isDisabled` on an App registration object.

**Owning Service**: AAD Applications  
**Owning Team**: Triage

# Documentation

- https://aka.ms/app-deactivation-docs
- [App Deactivation Demo](https://aka.ms/AAzwhij)
