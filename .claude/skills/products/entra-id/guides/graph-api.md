# ENTRA-ID Microsoft Graph API — Quick Reference

**Entries**: 204 | **21V**: Partial (202/204)
**Last updated**: 2026-04-07
**Keywords**: graph-api, ms-graph, groups, 403, permissions, entra-id

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/graph-api.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | Need to remove specific proxyAddress from Azure AD user who has no Exchange Online license | Without Exchange license, Exchange Admin Center cannot manage proxyAddresses | Use MS Graph API beta: PATCH users/{userId} with {proxyAddresses:[]} to clear... | 🟢 9.0 | OneNote |
| 2 📋 | Soft-deleted device returns HTTP 404 Not Found when queried via Graph API or portal — admin think... | Soft-deleted objects are moved to a separate deleted container and hidden fro... | Check deleted items via Graph API: GET https://graph.microsoft.com/beta/direc... | 🟢 8.5 | ADO Wiki |
| 3 📋 | Device Registration Policy API calls fail after Sept 25 2023 rollout - PUT requests return errors... | Microsoft introduced a breaking change to the Device Registration Policy API ... | 1) Detect format via GET request before issuing PUT - check multiFactorAuthCo... | 🟢 8.5 | ADO Wiki |
| 4 📋 | Device Registration Policy API calls fail after September 2023 rollout - multiFactorAuthConfigura... | Breaking change to deviceRegistrationPolicy beta API: multiFactorAuthConfigur... | Option 1: Issue GET request first to detect format (check multiFactorAuthConf... | 🟢 8.5 | ADO Wiki |
| 5 📋 | Admin wants to block BitLocker self-service recovery for end users but setting is all-or-none, ca... | Feature design: 'Restrict non-admin users from recovering the BitLocker key(s... | Configure via: 1) Azure AD Portal > Device Settings > toggle 'Restrict non-ad... | 🟢 8.5 | ADO Wiki |
| 6 📋 | Application calls to Azure AD Graph API (graph.windows.net) fail with errors after retirement sta... | Azure AD Graph API service (graph.windows.net) deprecated since June 2020, St... | Migrate application to Microsoft Graph API. For temporary unblocking, use App... | 🟢 8.5 | ADO Wiki |
| 7 📋 | Get-MgUser with filter on signInActivity/lastSignInDateTime returns 400 Bad Request error: 'Numbe... | Per PG confirmation: when querying users and filtering last sign-in activity,... | Use Invoke-MgGraphRequest with manual pagination instead of Get-MgUser -Filte... | 🟢 8.5 | ADO Wiki |
| 8 📋 | Restoring a soft-deleted application fails with error: A conflicting AppIdentifierUri '<value>' f... | Another active application in the tenant has a matching value on the AppIdent... | Remove or change the conflicting AppIdentifierUri from the active application... | 🟢 8.5 | ADO Wiki |
| 9 📋 | Get-MgUser with signInActivity/lastSignInDateTime filter returns 400: Number of included identifi... | PG confirmed: reporting API may incorrectly paginate and return >1000 results... | Use Invoke-MgGraphRequest with manual pagination: /v1.0/users?$select=userPri... | 🟢 8.5 | ADO Wiki |
| 10 📋 | Restoring a soft-deleted application fails with error: A conflicting AppIdentifierUri found | Another active application in the tenant has a matching value on the AppIdent... | Remove or change the conflicting AppIdentifierUri from the active application... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Application cannot access protected resources or obtain new access tokens. Enterprise app shows s... | Application has been deactivated by setting 'isDisabled' property to true on ... | To re-enable: use Microsoft Graph API PATCH to set isDisabled to false or nul... | 🟢 8.5 | ADO Wiki |
| 12 📋 | 403 error 'The size of the object has exceeded its limit. Please reduce the number of values and ... | Maximum of 20 federated identity credentials allowed per application object. ... | Either delete an existing federated identity credential from the application ... | 🟢 8.5 | ADO Wiki |
| 13 📋 | Error adding/verifying subdomain in Entra portal when parent domain is federated: 'One or more pr... | Portal bug - subdomains inherit parent domain's authentication type (LiveType... | Use PowerShell + Graph API instead of portal: 1) Connect-Entra -Scopes 'Domai... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Creating a governance policy template fails with HTTP 409: Governance Policy Template already exists | A governance policy template with the same display name already exists in the... | Use a unique display name. Check existing templates via Graph API: GET /direc... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Creating a governance policy template fails with HTTP 400: Group is not role assignable | The security group specified in the policy template is not configured as role... | Use a role-assignable security group: Entra admin center > Groups > New group... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Enterprise Apps filter "Assignment Required = Not required" in Azure Portal shows fewer apps than... | Portal requires ExplicitAccessGrantRequired to be explicitly set to false. If... | Use MS Graph API: GET /servicePrincipals?$filter=appRoleAssignmentRequired -n... | 🟢 8.5 | ADO Wiki |
| 17 📋 | App management policy for password restriction not working; passwordAdditionExempted Custom Secur... | Bug in Portal UI creating CSA with wrong data type (fixed in Oct 2025 Bug 341... | Create a new CSA set and attribute with String type and include it in Default... | 🟢 8.5 | ADO Wiki |
| 18 📋 | Unable to assign groups to Enterprise Application - error "Groups are not available for assignmen... | Bug in license check for group assignment in Enterprise Apps (Bug 3333754). N... | Use Microsoft Graph API as workaround for group assignment. | 🟢 8.5 | ADO Wiki |
| 19 📋 | Error verifying subdomain with federated parent: One or more properties contains invalid values /... | Portal bug - subdomains inherit parent authenticationType. Portal cannot set ... | PowerShell+Graph: 1) New-EntraDomain -Name child.mydomain.com 2) GET /v1.0/do... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Enterprise Apps Assignment Required filter shows fewer apps in Portal than Excel export | Portal requires ExplicitAccessGrantRequired explicitly false. Missing propert... | Use Graph API: GET /servicePrincipals?$filter=appRoleAssignmentRequired -ne t... | 🟢 8.5 | ADO Wiki |
| 21 📋 | App management policy for password restriction not working; CSA created with Boolean instead of S... | Portal UI bug creating CSA with wrong data type (fixed Oct 2025). Pre-fix ten... | Create new CSA set with String type via Graph API. | 🟢 8.5 | ADO Wiki |
| 22 📋 | Unable to assign groups to Enterprise App despite P1/P2 license | Bug in license check (Bug 3333754). No ETA. | Use Microsoft Graph API for group assignment. | 🟢 8.5 | ADO Wiki |
| 23 📋 | App Management Policy portal error: The restriction have been modified outside of this interface.... | Policy was configured via Graph API or PowerShell, causing settings across pa... | Use Graph Explorer to manually align settings across all four collections (ap... | 🟢 8.5 | ADO Wiki |
| 24 📋 | Graph API $select parameter returns no data on /groups navigation property endpoints (e.g. /group... | For navigation properties typed as directoryObject, properties are dynamic pe... | Use exact CSDL-defined casing for $select on navigation properties (e.g. 'dis... | 🟢 8.5 | ADO Wiki |
| 25 📋 | HTTP 403 Access Denied when adding guest user to M365 group via Graph API. MSODS log shows 'Group... | AllowToAddGuests group setting is set to false either at tenant level (direct... | 1) Check tenant-level directory settings: GET group settings and inspect Allo... | 🟢 8.5 | ADO Wiki |
| 26 📋 | 422 MissingPrefixSuffix error when creating M365 group from My Groups Portal (myaccount.microsoft... | directoryObject/validateProperties API strips / character from mailNickname d... | Workaround: Create M365 groups via Outlook Desktop Application or Outlook Web... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Group overview page in Azure portal shows incorrect member count for extremely large groups. Grap... | Backend service limitation: Mezzo service times out when processing membershi... | Use PowerShell to enumerate and count members: Connect-MgGraph -Scopes 'Direc... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Directory_ExpiredPageToken error when using skipToken from Graph /groups?$filter=assignedLicenses... | Known bug in Graph/directory backend. Tracked at Bug 1728776. | No workaround currently available. Bug 1728776 is tracking the fix. Consider ... | 🟢 8.5 | ADO Wiki |
| 29 📋 | Non-admin group owner gets HTTP 403 when calling Graph /groups/{id}/members if the group has anot... | Group owner has permission to read direct members but lacks permission to rea... | Grant owner additional directory read permissions (e.g. Directory.Read.All), ... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Internal server error (500) when PATCH-ing group settings DefaultClassification value via Graph A... | ValidateAndTrimDefaultClassification function validates the PATCH-ed DefaultC... | When setting DefaultClassification, ensure the value exists in Classification... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Graph API select parameter returns no data on /groups navigation property endpoints when property... | For navigation properties typed as directoryObject, properties are dynamic pe... | Use exact CSDL-defined casing for select on navigation properties. Affects /g... | 🟢 8.5 | ADO Wiki |
| 32 📋 | HTTP 403 Access Denied adding guest user to M365 group via Graph API. MSODS shows Group does not ... | AllowToAddGuests policy set to false at tenant or group level blocks guest ad... | Check and update AllowToAddGuests setting at directory or group level via Gra... | 🟢 8.5 | ADO Wiki |
| 33 📋 | 422 MissingPrefixSuffix error creating M365 group from My Groups Portal when naming policy prefix... | validateProperties API strips slash from mailNickname during validation, caus... | Create M365 groups via Outlook Desktop or OWA instead of My Groups Portal. CR... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Group overview page shows wrong member count for extremely large groups. Graph members count retu... | Backend Mezzo service times out for large group membership count queries. | Use PowerShell: Get-MgGroupMember -GroupId {id} -All then check Count. ICM: 4... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Directory_ExpiredPageToken error when using skipToken from groups filter assignedLicenses query. ... | Known bug in directory backend pagination. Bug 1728776. | No workaround. Bug 1728776 tracking fix. Alternative: enumerate all groups th... | 🟢 8.5 | ADO Wiki |
| 36 📋 | Non-admin group owner gets 403 listing members if group contains nested group as member | Owner lacks permission to read nested child group objects. | Grant Directory.Read.All or use admin credentials. ICM: 424578693. | 🟢 8.5 | ADO Wiki |
| 37 📋 | 500 error PATCH-ing group settings DefaultClassification value. MSODS: KeyNotFoundException in Va... | ValidateAndTrimDefaultClassification checks value against ClassificationList.... | Set DefaultClassification and ClassificationList together in same PATCH reque... | 🟢 8.5 | ADO Wiki |
| 38 📋 | $select parameter in Graph /groups endpoints is case sensitive for dynamic properties on director... | Properties NOT defined in schema are dynamic per OData spec and forwarded as-... | Use exact CSDL-defined casing for property names. Schema-defined properties a... | 🟢 8.5 | ADO Wiki |
| 39 📋 | HTTP 403 AccessDenied when adding guest user to M365 group via Graph API | Group-level or tenant-level AllowToAddGuests setting is False | Check tenant-level Group.Unified directory settings for AllowToAddGuests. If ... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Cannot change proxyAddresses on a cloud-only group - EXO changes not synced to AAD | Group mastered in AAD (ExchangeMastered=false); no public API to modify proxy... | For on-prem synced groups: modify in on-premises AD. For cloud-only: no worka... | 🟢 8.5 | ADO Wiki |
| ... | *164 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **graph-api** related issues (5 entries) `[onenote]`
2. Check **soft-delete** related issues (3 entries) `[ado-wiki]`
3. Check **enterprise-app** related issues (3 entries) `[ado-wiki]`
4. Check **breaking-change** related issues (2 entries) `[ado-wiki]`
5. Check **signinactivity** related issues (2 entries) `[ado-wiki]`
6. Check **get-mguser** related issues (2 entries) `[ado-wiki]`
7. Check **application** related issues (2 entries) `[ado-wiki]`
8. Check **restore** related issues (2 entries) `[ado-wiki]`
