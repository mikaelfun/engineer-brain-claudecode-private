# ENTRA-ID Service Principal Management — Quick Reference

**Entries**: 79 | **21V**: All applicable
**Last updated**: 2026-04-07
**Keywords**: service-principal, managed-identity, graph-api, multi-tenant, conditional-access, powershell

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/service-principal.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | On-premise data gateway login fails because Power BI service application SP gets automatically di... | Power BI service SP has ServicePrincipalLifecyclePolicy set to SubscriptionMa... | Manually re-enable the SP before each use. PG acknowledges this is a design i... | 🟢 10.0 | OneNote |
| 2 📋 | AADSSHLoginForLinux VM extension install fails with Non-zero exit code: 22 and error Managed Syst... | System Assigned or User Assigned managed identity is not enabled on the Azure... | 1) Uninstall the failed extension. 2) Enable System Assigned Managed Identity... | 🟢 9.5 | ADO Wiki |
| 3 📋 | Token lifetime policy does not take effect, tokens still ~1 hour | Policy applied to wrong app type. ID Token needs policy on Caller App, Access... | Apply TokenLifetimePolicy to correct Service Principal. Multiple policies: fi... | 🟢 9.0 | OneNote |
| 4 📋 | Need to authenticate Microsoft Graph PowerShell with service principal certificate in Azure China | Default app ID not available in Mooncake | Create self-signed cert, export .cer to app registration, Connect-MgGraph -Cl... | 🟢 9.0 | OneNote |
| 5 📋 | App role assignment to AAD group fails when trying to assign via Microsoft.Graph PowerShell. | App role assignment must be performed on Service Principal (Enterprise Applic... | Create Service Principal first: New-MgServicePrincipal -AppId $app.AppId. The... | 🟢 9.0 | OneNote |
| 6 📋 | Refresh token renewed despite MaxInactiveTime exceeded and Outlook was idle/closed longer than co... | Outlook requests tokens for multiple SPs (Exchange + OfficeClientService). To... | Apply Token Lifetime Policy to ALL service principals the client may request ... | 🟢 9.0 | OneNote |
| 7 📋 | AAD issues access token for application whose Service Principal was deleted. Token contains appid... | By design: AAD can issue client_credentials tokens (ClientOnlyJsonWebToken) f... | Recreate the service principal in the tenant: New-AzureADServicePrincipal -Ap... | 🟢 9.0 | OneNote |
| 8 📋 | Numerous AAD audit log failures for 'adding service principal' triggered by 'Windows Azure Servic... | ARM automatically attempts to create service principals for resource provider... | This is expected behavior and can be safely ignored. The audit log failures i... | 🟢 9.0 | OneNote |
| 9 📋 | Azure Linux VM Sign-In cloud app (ce6ff14a-7fdc-4685-bbe0-f6afdfcfa8e0) not registered in tenant,... | The Azure Linux VM Sign-In service principal is not automatically provisioned... | Global admin registers: Connect-MgGraph -Scopes Application.ReadWrite.All; Ne... | 🟢 8.5 | ADO Wiki |
| 10 📋 | PowerShell scripts cannot reliably enumerate all SAML SSO apps from a tenant. Get-MgServicePrinci... | PreferredSingleSignOnMode attribute was introduced in a later API update. Ser... | Use the script filtering on PreferredSingleSignOnMode (catches most SAML apps... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Restoring a soft-deleted service principal fails with error: The service principal {oid} can't be... | Another active service principal in the tenant has one or more URLs in servic... | Remove the conflicting URLs from the active service principal's servicePrinci... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Non-admin user gets Directory_QuotaExceeded error when creating objects in Entra ID: The director... | Non-admin users are limited to 250 objects in Entra ID. Soft-deleted service ... | Hard-delete unneeded soft-deleted objects using Remove-MgDirectoryDeletedItem... | 🟢 8.5 | ADO Wiki |
| 13 📋 | Clicking 'Restore deleted applications' in App Registrations blade creates a new service principa... | The App Registrations portal restore function creates a new SP rather than re... | Use Graph API or PowerShell to restore in correct order: 1) List soft-deleted... | 🟢 8.5 | ADO Wiki |
| 14 📋 | First-party service principals disappear from tenant without audit events. Customer is confused b... | Azure AD Directory Platform team periodically soft-deletes unused auto-provis... | If dependent 3P app breaks: recover the deleted SP within 30 days using Graph... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Clicking Restore deleted applications in App Registrations blade creates a new service principal ... | The App Registrations portal restore function creates a new SP rather than re... | Use Graph API or PowerShell to restore in correct order: 1) List soft-deleted... | 🟢 8.5 | ADO Wiki |
| 16 📋 | First-party service principals disappear from tenant without audit events. Customer confused by u... | Azure AD Directory Platform team periodically soft-deletes unused auto-provis... | If dependent 3P app breaks: recover the deleted SP within 30 days using Graph... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Client application receives error 'The client application {appId} is missing service principal in... | Entra ID enforced blocking of SP-Less authentication — cross-tenant token acq... | Create a Service Principal (Enterprise Application) for the client app in the... | 🟢 8.5 | ADO Wiki |
| 18 📋 | User receives AADSTS50105 error — 'User is not assigned to a role for the application' when signi... | The 'Assignment required' property is enabled on the Enterprise Application's... | (1) Assign the user or group to the Enterprise Application via Entra portal >... | 🟢 8.5 | ADO Wiki |
| 19 📋 | AADSTS700211: No matching federated identity record found for presented assertion issuer when usi... | Azure CLI's '--federated-token' parameter and Azure PowerShell's '-AccessToke... | When using Azure CLI with FIC for cross-tenant managed identity: pass the Man... | 🟢 8.5 | ADO Wiki |
| 20 📋 | AADSTS7002104: 'Symmetric secrets may not be set on Service Principals to authenticate this appli... | Microsoft disabled symmetric key authentication on first-party application Se... | Replace symmetric keys with asymmetric keys using Add-MgServicePrincipalKey. ... | 🟢 8.5 | ADO Wiki |
| 21 📋 | AADSTS7002104: Symmetric secrets may not be set on Service Principals to authenticate this applic... | Microsoft disabled symmetric key auth on 1P SP as part of SFI, enforced June ... | Replace symmetric keys with asymmetric keys via Add-MgServicePrincipalKey. IC... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Verified ID Face Check: User gets "Your organization hasn't authorized you to get a Verified ID" ... | The "My Profile" servicePrincipal (AppId: 8c59ead7-d703-4a27-9e55-c96a0054c8d... | Workaround: Manually add the My Profile servicePrincipal via PowerShell: Conn... | 🟢 8.5 | ADO Wiki |
| 23 📋 | Verified ID Onboarding: Overview blade fails with 403 "The Verifiable Credentials Issuer Service ... | Bug in provisioning for tenants that previously provisioned Verified ID. Miss... | File ICM (ref: 335009327). PG fix tracked in bug 2041925. Requires PG interve... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Workload identity (service principal) fails to acquire access token with AADSTS53003: Access has ... | A Conditional Access policy for workload identities is configured to block si... | 1. Identify the CA policy from the error claims (capolids). 2. Verify the ser... | 🟢 8.5 | ADO Wiki |
| 25 📋 | Error 1072: Policy cannot be assigned to both users and service principals when configuring Condi... | By design, Azure AD does not allow assigning both users and workload identiti... | Create separate Conditional Access policies: one for users and one for worklo... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Error 1078: Service principal(s) with object ids are not supported when assigning Managed Identit... | By design, Managed Identities and multi-tenant applications cannot be assigne... | Use only single-tenant service principals registered in the tenant. Managed i... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Microsoft Intune Windows Agent first-party app automatically disabled by Microsoft Online Service... | FPA is not linked to subscription-based lifecycle flow, causing subscription ... | Delete the service principal: Remove-MgServicePrincipal -ServicePrincipalId <... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Users and Groups menu missing for Enterprise Application in Azure Portal | Service Principal missing tag WindowsAzureActiveDirectoryIntegratedApp, or mu... | Add tag: Update-MgServicePrincipal -ServicePrincipalId <id> -Tags "WindowsAzu... | 🟢 8.5 | ADO Wiki |
| 29 📋 | Error 1072: Cannot assign users and service principals to same CA policy | By design limitation. | Create separate CA policies for users and workload identities. | 🟢 8.5 | ADO Wiki |
| 30 📋 | Error 1078: Managed Identity/multi-tenant app not supported for CA workload identity | Only single-tenant SPs supported by design. | Use single-tenant service principals only. | 🟢 8.5 | ADO Wiki |
| 31 📋 | Microsoft Intune Windows Agent FPA auto-disabled; re-disabled each time enabled | FPA not linked to subscription lifecycle. App confirmed not in use by Intune ... | Delete service principal: Remove-MgServicePrincipal. App ID: fc0f3af4-6835-41... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Graph v1.0 /groups/{id}/transitiveMembers and /groups/{id}/owners endpoints do not return Service... | Service Principal support not yet rolled out to Graph v1.0 endpoint for these... | Use Graph beta endpoint instead of v1.0 to get Service Principals in transiti... | 🟢 8.5 | ADO Wiki |
| 33 📋 | Graph v1.0 transitiveMembers and owners endpoints do not return Service Principal objects | SP support not rolled out to v1.0. Epic 3277234. No ETA as of Dec 2025. | Use beta endpoint. For transitiveMembers: enumerate nested groups manually. I... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Graph transitiveMembers endpoint does not return Service Principals on v1.0 | Known limitation: v1.0 does not include SPs in transitiveMembers results | Use beta endpoint or manually enumerate nested groups calling groups/{id}/mem... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Unable to manage user and group assignments on an Enterprise Application created using Graph SDK;... | Service Principal created via Graph SDK is missing the built-in tag 'WindowsA... | Add the missing tag to the Service Principal: Update-ServicePrincipalId "{SP-... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Multi-tenant app-only authentication (client credentials flow) suddenly fails after July 2024 for... | Entra ID blocked SP-less authentication starting July 8, 2024. SP-less occurs... | Tenant admin must create an enterprise application (service principal) for ea... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Sign-in logs show Service Principal ID as '00000000-0000-0000-0000-000000000000' for an app acces... | The client application is authenticating via SP-less pattern - it is a multi-... | If the app should be trusted: create a service principal (enterprise app) for... | 🟢 8.5 | ADO Wiki |
| 38 📋 | App-only token request fails with error: 'The client application {appId} is missing service princ... | The multi-tenant client application does not have a service principal (enterp... | Tenant admin creates a service principal for the client app: https://learn.mi... | 🟢 8.5 | ADO Wiki |
| 39 📋 | AADSTS650059: The application is not configured for use in tenant (tenantId). The value AzureADMy... | App was previously configured as multi-tenant but later converted to single-t... | If app should be multi-tenant: update signInAudience on the app registration ... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Multi-tenant app authentication fails; sign-in logs show Service Principal ID as '00000000-0000-0... | Entra ID blocked SP-Less authentication (app-only tokens issued without a Ser... | Create an Enterprise Application (Service Principal) in the target tenant usi... | 🟢 8.5 | ADO Wiki |
| ... | *39 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **service-principal** related issues (11 entries) `[onenote]`
2. Check **soft-delete** related issues (6 entries) `[ado-wiki]`
3. Check **powershell** related issues (3 entries) `[onenote]`
4. Check **restore** related issues (3 entries) `[ado-wiki]`
5. Check **access-token** related issues (2 entries) `[onenote]`
6. Check **client-credentials** related issues (2 entries) `[onenote]`
7. Check **first-party-app** related issues (2 entries) `[onenote]`
8. Check **first-party** related issues (2 entries) `[ado-wiki]`
