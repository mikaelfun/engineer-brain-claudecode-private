---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Entra ID App Registrations"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Application_and_Service_Principal_Object_Management/How%20to/Entra%20ID%20App%20Registrations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Compliance note
This wiki contains test/lab data only.

# Feature Overview

Any application that wants to use the capabilities of Entra ID must first be registered in an Entra ID tenant. This registration process involves giving Entra ID details about your application, such as the URL where it is located, the URL to send replies after a user is authenticated, the URI that identifies the app, and other defining items for the app. See[Quickstart: Register an application with the Microsoft identity platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)to get the basics of app registrations.

Users can fully manage their App Registrations using the Entra ID Portal, on the App Registrations blade.

# What defines v1 versus v2 apps?

[Comparison of v1 and v2 endpoints](https://docs.microsoft.com/en-us/azure/active-directory/azuread-dev/azure-ad-endpoint-comparison)

## Identify v1 versus v2 apps

Currently, for most URLs (metadata, authorize, token), you can tell based on whether it contains /v2.0/.

For example:

`https://login.microsoftonline.com/common/oauth2/authorize` **is v1**

`https://login.microsoftonline.com/common/oauth2/v2.0/authorize` **is v2**

## Sign-in Audience

-   Starting in **March 2024** when admins create a new app registration via MS Graph (`POST https://graph.microsoft.com/v1.0/applications`) the signInAudience value will default to **AzureADMyOrg** previously it defaulted to **AzureADandPersonalMicrosoftAccount**. This value matches the current default for a new app registration created via the Microsoft Azure/Entra portal. Customers can still set the signInAudience to any of the valid options in MS Graph by simply setting the parameter in the request. This change was announced here: https://techcommunity.microsoft.com/t5/microsoft-entra-blog/what-s-new-in-microsoft-entra/ba-p/3796394.

-   The v1.0 endpoint allows only work and school accounts to sign in to your application (Entra ID)

-   The Microsoft identity platform endpoint (v2) allows work and school accounts from Entra ID and personal Microsoft accounts (MSA), such as `hotmail.com`, `outlook.com`, and `msn.com`, to sign in.

-   Both endpoints also accept sign-ins of guest users of an Entra ID directory for applications configured as single-tenant or for multi-tenant applications configured to point to the tenant-specific endpoint `https://login.microsoftonline.com/{TenantId_or_Name}`.

## Scopes vs Resources

For apps using the v1.0 endpoint, an app can behave as a resource, or a recipient of tokens. A resource can define a number of scopes or oAuth2Permissions that it understands, allowing client apps to request tokens from that resource for a certain set of scopes.

For the v1.0 endpoint, an OAuth 2.0 authorize request to Entra ID might have looked like:
```
https://login.microsoftonline.com/common/oauth2/authorize?
client_id=2d4d11a2-f814-46a7-890a-274a72a7309e
&resource=https://graph.microsoft.com/
```

For applications using the Microsoft identity platform endpoint:
```
https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
client_id=2d4d11a2-f814-46a7-890a-274a72a7309e
&scope=https://graph.microsoft.com/directory.read%20https://graph.microsoft.com/directory.write
```

## OpenID, profile, and email

The `openid` scope will only allow your app to sign in the user and receive an app-specific identifier. Two new scopes, `email` and `profile`, allow you to request additional user information.

- The `email` scope allows your app access to the user's primary email address.
- The `profile` scope affords your app access to basic information about the user (name, preferred username, object ID, etc.) in the id_token.

# App Registration Features

## AppId URI (identifierUri) validation

A change introduced in **October 2021** enforced that all AppId URIs used in an application are part of the verified domain list in the customer tenant. The change doesn't affect existing applications that are using unverified domains. It validates only new applications or when an existing app updates its identifier URIs to add a new one.

**Valid api schemes:**
```
api://{appId}
api://{tenantId}/{appId}
api://{tenantId}/{string}
api://{string}/{appId}
```

**Valid https schemes:**
```
https://<tenantInitialDomain>.onmicrosoft.com/<string>
https://<verifiedCustomDomain>/<string>
https://<string>.<verifiedCustomDomain>
https://<string>.<verifiedCustomDomain>/<string>
```

Deep Dive: [Changes to appid uri (identifierUri) validation](https://aka.ms/AAe22df)

## Deleted apps tab

On 10 March 2021 a **Deleted apps** tab was introduced to the Apps registration page. When an AAD customer deletes an app registration, it goes into a 'soft deleted' state. They can restore it within 30 days or hard delete it.

**FAQ:**
- **Known issues:** Soft deleted apps will sometimes not immediately appear in Deleted applications list due to caching issue. Refresh the page.
- **Who can restore?** Owners and global admins only.
- **Who can permanently delete?** Owners, global admins, app admins, cloud app admins, and hybrid identity admins.
- **Why would a restore fail?** Wrong permissions, or the application was deleted more than 30 days ago.

Reference: [Restore or remove a recently deleted application](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-restore-app)

## Integration assistance blade

This feature gives users recommendations about their app registration.
Demo: https://aka.ms/AA8e4k3

# Case Handling

App Registration is supported by _AAD - Authentication Professional_ and _AAD - Authentication Premier_ support teams.

Navigate to the App Registrations blade: [App registrations - Microsoft Azure](https://ms.portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)

## Key blades

- **Branding:** Display name, logo (215x215px, <100KB, .bmp/.jpg/.png), Home page URL, Terms of Service URL, Privacy Statement URL, Publisher Domain, Publisher Verification
- **Authentication:** Redirect URIs (MSAL/ADAL), Logout URL, Implicit grant, Supported account types
- **Certificates and secrets:** Client certificates (recommended over secrets), Client secrets (expire in 1yr/2yr/never), Federated Credentials (workload identity federation)
- **API Permissions:** Request permissions for Microsoft APIs and custom APIs; permissions grouped by resource
- **Expose an API:** Define and manage scopes for your API
- **Owners:** Additional users who can view and edit the app registration
- **Manifest:** Upload, download, or edit the app manifest directly

# Troubleshooting

Public solutions to common problems are located in the portal under the **Troubleshooting** tab.

Existing internal troubleshooting guides are located on the [Entra ID Application Management](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183936) page.

## ICM escalation

Service: AppRegPortal  
Team: AppRegPortal Dev Team  
Template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=T2x2p3

# Training & Documentation

- [Changes to appid uri (identifierUri) validation](https://aka.ms/AAe22df)
- [Deep Dive: Deleted application functionality](https://aka.ms/AAbrblp)
- [Quickstart: Register an application with the Microsoft identity platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Quickstart: Configure a client application to access web APIs](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-access-web-apis)
- [Quickstart: Configure an application to expose web APIs](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis)
