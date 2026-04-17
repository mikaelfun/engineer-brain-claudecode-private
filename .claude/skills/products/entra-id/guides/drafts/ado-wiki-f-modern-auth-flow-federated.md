---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Authentication and Access/Modern Auth Flow Federated"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FAuthentication%20and%20Access%2FModern%20Auth%20Flow%20Federated"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Federated Modern Authentication Flow with Office 365

```
1. Client -> Office 365: Request Access to resource
2. Office 365 -> Client: Access Denied, redirected to Azure
3. Client -> Entra ID: User provides UPN to Azure
4. Entra ID -> Client: Home Realm Discovery determines, and redirects to IDP
5. Client -> IDP: User requests token from relying party
6. IDP -> Client: IDP asks user/device for authentication
7. Client -> IDP: User supplies credentials / Device sends creds on behalf of user
8. DC --> IDP: IDP verifies credentials against domain
9. IDP -> Client: IDP returns security (SAML) token
10. Client -> Entra ID: Client sends token to Azure AD
11. Entra ID -> Client: Azure AD verifies token and issues access/refresh token
12. Client -> Office 365: Request access to resource with access token
13. Office 365 -> Client: Resource allows access
```
