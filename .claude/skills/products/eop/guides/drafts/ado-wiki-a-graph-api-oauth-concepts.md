---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/Graph APIs for MDO/More about Graph API"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FDrafts%2FGraph%20APIs%20for%20MDO%2FMore%20about%20Graph%20API"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# More about Graph API — OAuth, Tokens & Permissions

## What is OAuth and how is this related to Graph API?

OAuth, or Open Authorization, is a framework that handles both authentication (AuthN) and authorization (AuthZ). It allows for secure access to resources without needing to share user credentials. OAuth uses various flows to authenticate a user, and upon successful authentication, the user receives one or more tokens. These tokens can then be used to authorize access to the required resources.

Almost all Microsoft products utilize OAuth 2.0 for authentication and authorization. Microsoft's OAuth implementation is handled by its identity service, known as the **Microsoft Identity Platform**, which integrates with **Entra ID**.

---

## Tokens

When working with Graph API, there are two types of tokens:

**Access Tokens:**
Access tokens are short-lived — between 60 to 90 minutes (75 minutes on average). Reference: [Access tokens in the Microsoft identity platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/access-tokens#payload-claims)

**Refresh Tokens:**
A refresh token is used to obtain new access/refresh token pairs when the current access token expires. It is long-lived (~90 days for most scenarios).

---

## Establishing a Trust Relationship for OAuth Flows

Registering your application establishes a trust relationship between the app and the Microsoft Identity Platform. This allows your application to identify itself as a service principal in Entra ID, enabling it to perform OAuth flows.

---

## What identifies an App Registration?

An App Registration is identified by:

1. **Application (client) ID** — Unique identifier auto-generated at registration.
2. **Tenant ID** — Identifies the Entra ID tenant where the app is registered.
3. **Redirect URIs** — Endpoints where the identity provider sends security tokens after authentication.
4. **Permissions and Scopes** — Defines what the app can access; can be delegated or application permissions.
5. **Secrets and Certificates** — Used to authenticate the application.
6. **Publisher Information** — Details about the app's publisher.

Quickstart: [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

---

## Permissions: Delegated & Application

**Effective Permissions**: The permissions an app has when making requests to a specific service or API — determined by the combination of granted permissions and the privileges of the signed-in user or calling app.

### Delegated Permissions

Used in apps where user interaction is required (e.g., Outlook). The effective permissions are the **least-privileged intersection** of:
- Delegated permissions granted to the app (by consent)
- Privileges of the currently signed-in user

The app can **never have more privileges than the signed-in user**.

### Application Permissions

Used by apps that run without a signed-in user (background services, daemons). Can only be consented by an **administrator**. The effective permissions are the **full level of privileges** implied by the permission.

Example: An app with `SecurityAlert.ReadWrite.All` application permission can update any alert in Microsoft Defender portal.

Reference: [Microsoft Graph permissions](https://learn.microsoft.com/en-us/graph/auth/auth-concepts#microsoft-graph-permissions)
