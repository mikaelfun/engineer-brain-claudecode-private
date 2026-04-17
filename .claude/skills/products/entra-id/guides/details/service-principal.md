# ENTRA-ID Service Principal Management — Detailed Troubleshooting Guide

**Entries**: 79 | **Drafts fused**: 5 | **Kusto queries**: 0
**Draft sources**: ado-wiki-c-kudu-console-test-managed-identity.md, ado-wiki-c-soft-deleted-service-principals.md, ado-wiki-f-managed-identity-vms.md, ado-wiki-h-kdc-err-s-principal-unknown-0x7-service-principal-unknown.md, onenote-managed-identity-msgraph.md
**Generated**: 2026-04-07

---

## Phase 1: Service Principal
> 9 related entries

### AAD issues access token for application whose Service Principal was deleted. Token contains appid but missing oid/puid/altsecid claims. ARM returns...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: By design: AAD can issue client_credentials tokens (ClientOnlyJsonWebToken) for multi-tenant applications even when the service principal does not exist in the tenant. The token is issued based on the application registration in the home tenant, not the local SP.

**Solution**: Recreate the service principal in the tenant: New-AzureADServicePrincipal -AppId <appId>. This is by design per Microsoft documentation on service principal provisioning. Without SP, the token will lack oid claim and be rejected by resource APIs like ARM.

---

### Restoring a soft-deleted service principal fails with error: The service principal {oid} can't be restored since one or more of its service princip...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Another active service principal in the tenant has one or more URLs in servicePrincipalNames that match the soft-deleted SP's servicePrincipalNames

**Solution**: Remove the conflicting URLs from the active service principal's servicePrincipalNames, or hard-delete the conflicting SP, then retry the restore via Graph API: POST /directory/deletedItems/{objectId}/restore

---

### Clicking 'Restore deleted applications' in App Registrations blade creates a new service principal instead of recovering the original soft-deleted ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The App Registrations portal restore function creates a new SP rather than restoring the original soft-deleted one. This can result in multiple soft-deleted SPs associated with the same app registration, and loss of organization-specific settings

**Solution**: Use Graph API or PowerShell to restore in correct order: 1) List soft-deleted SPs filtered by appId. 2) Identify the one with oldest deletedDateTime. 3) Restore the application first: POST /directory/deletedItems/<appObjectId>/restore. 4) Restore the original SP: POST /directory/deletedItems/<spObjectId>/restore. After SP restore, wait up to 40 min for sync provisioning data recovery and up to 24 hours for app proxy data recovery

---

### First-party service principals disappear from tenant without audit events. Customer is confused by unexplained SP deletions or a third-party app de...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD Directory Platform team periodically soft-deletes unused auto-provisioned first-party service principals to free up storage. Two categories targeted: (1) SPs with no ESTS traffic in 30 days, (2) SPs with only app+user traffic. No audit events are generated for these programmatic deletions. Excluded: tenants with >100 users or >500 apps, S500/S2500/GTP tenants, and SPs modified by customer

**Solution**: If dependent 3P app breaks: recover the deleted SP within 30 days using Graph API restore or recreate it using the app ID. Advise customer that Microsoft may occasionally delete unused 1P service principals. If ICM needed: Owning Service = AAD Distributed Directory Services, Team = Storage

---

### Clicking Restore deleted applications in App Registrations blade creates a new service principal instead of recovering the original soft-deleted SP...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The App Registrations portal restore function creates a new SP rather than restoring the original soft-deleted one. This results in loss of organization-specific settings (consents, assignments)

**Solution**: Use Graph API or PowerShell to restore in correct order: 1) List soft-deleted SPs filtered by appId. 2) Identify the one with oldest deletedDateTime. 3) Restore the application first: POST /directory/deletedItems/<appObjectId>/restore. 4) Restore the original SP: POST /directory/deletedItems/<spObjectId>/restore. After SP restore, wait up to 40 min for sync provisioning data and up to 24 hours for app proxy data

---

### First-party service principals disappear from tenant without audit events. Customer confused by unexplained SP deletions or third-party app depende...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure AD Directory Platform team periodically soft-deletes unused auto-provisioned first-party service principals to free up storage. Two categories: (1) SPs with no ESTS traffic in 30 days, (2) SPs with only app+user traffic. No audit events generated. Excluded: tenants >100 users or >500 apps, S500/S2500/GTP tenants, and SPs modified by customer

**Solution**: If dependent 3P app breaks: recover the deleted SP within 30 days using Graph API restore or recreate it using the app ID. Advise customer that Microsoft may occasionally delete unused 1P service principals. ICM: Owning Service=AAD Distributed Directory Services, Team=Storage

---

### Multi-tenant app-only authentication (client credentials flow) suddenly fails after July 2024 for cross-tenant token acquisition
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra ID blocked SP-less authentication starting July 8, 2024. SP-less occurs when a multi-tenant app requests an app-only token from a tenant where the client has no service principal. These tokens lack {oid}, {role}, {group} claims. Entra no longer issues them. SP-less clients appear in sign-in logs with Service Principal ID = 00000000-0000-0000-0000-000000000000.

**Solution**: Tenant admin must create an enterprise application (service principal) for each affected multi-tenant client app. Use Application ID from sign-in logs. Reference: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/create-service-principal-cross-tenant. Currently active SP-less apps include: MIP Platform, SQL Security, Xstore, Azure Log Analytics, ADRS, Dynamics 365, MDCA, AKS, Dataverse, Auditing, M365 encryption platform.

---

### Sign-in logs show Service Principal ID as '00000000-0000-0000-0000-000000000000' for an app accessing tenant resources
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The client application is authenticating via SP-less pattern - it is a multi-tenant app with no service principal in this tenant. Entra uses all-zeros GUID to indicate missing SP in sign-in logs.

**Solution**: If the app should be trusted: create a service principal (enterprise app) for that client Application ID in the tenant to restore full log visibility and normal authentication. If untrusted: create SP for the resource app, enable 'require assignment', and optionally disable the resource SP to block all unauthorized SP-less clients.

---

### App-only token request fails with error: 'The client application {appId} is missing service principal in the tenant {tenantId}. See instructions he...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The multi-tenant client application does not have a service principal (enterprise app) installed in the target tenant. Entra ID requires explicit SP presence for cross-tenant app-only (client credentials) authentication. This is also triggered when a resource app blocks SP-less tokens in Step 1 (1P resources, Feb 23) or Step 2 (3P resources, Mar 3) of the enforcement rollout.

**Solution**: Tenant admin creates a service principal for the client app: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/create-service-principal-cross-tenant. May need to consent to additional permissions for the resource app. For bundling consent: use requiredResourceAccess property on the application or use admin consent URL.

---

## Phase 2: Graph Api
> 6 related entries

### Graph v1.0 /groups/{id}/transitiveMembers and /groups/{id}/owners endpoints do not return Service Principal objects in results
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Service Principal support not yet rolled out to Graph v1.0 endpoint for these APIs. Epic 3277234 tracking the work. As of Dec 2025 no ETA for List Owners; transitiveMembers also affected.

**Solution**: Use Graph beta endpoint instead of v1.0 to get Service Principals in transitiveMembers/owners results. Alternative for transitiveMembers: manually enumerate nested groups using /groups/{id}/members for each group. Related: Epic 3277234, CRI ICM 649954905.

---

### Graph v1.0 transitiveMembers and owners endpoints do not return Service Principal objects
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SP support not rolled out to v1.0. Epic 3277234. No ETA as of Dec 2025.

**Solution**: Use beta endpoint. For transitiveMembers: enumerate nested groups manually. ICM 649954905.

---

### Graph transitiveMembers endpoint does not return Service Principals on v1.0
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known limitation: v1.0 does not include SPs in transitiveMembers results

**Solution**: Use beta endpoint or manually enumerate nested groups calling groups/{id}/members for each.

---

### Cannot delete last user owner from security group even when SP owner exists
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Owner removal check only validates user owners, not SP owners (by design as of Oct 2024)

**Solution**: Add a second user owner then remove both. Or create temp user as owner, remove original, delete temp.

---

### List Group Owners API (v1.0) does not return service principals
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Staged rollout of SP support to v1.0 not complete. No ETA as of Dec 2025.

**Solution**: Use beta endpoint. Epic 3277234 tracking v1.0 support.

---

### Error 'The identity of the calling application could not be established' when using Microsoft Graph
**Score**: 🔵 6.5 | **Source**: MS Learn

**Root Cause**: The oid and sub claims are missing from the access token because the service principal doesn't exist in the tenant or the tenant isn't aware of the application.

**Solution**: Add the service principal to the tenant by building an admin consent URL (https://login.microsoftonline.com/{tenant}/adminconsent?client_id={client-id}) and signing in with a Global Administrator account.

---

## Phase 3: Conditional Access
> 4 related entries

### Workload identity (service principal) fails to acquire access token with AADSTS53003: Access has been blocked by Conditional Access policies
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: A Conditional Access policy for workload identities is configured to block sign-in from untrusted locations. The service principal's sign-in attempt originates from an IP not in the excluded Named Location.

**Solution**: 1. Identify the CA policy from the error claims (capolids). 2. Verify the service principal's sign-in IP. 3. Either add the IP to a Named Location excluded from the policy, or adjust the policy scope to exclude this service principal. Use Postman to test client_credentials grant with the SP's client_id and client_secret.

---

### Error 1072: Policy cannot be assigned to both users and service principals when configuring Conditional Access for workload identities
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design, Azure AD does not allow assigning both users and workload identities (service principals) to the same Conditional Access policy.

**Solution**: Create separate Conditional Access policies: one for users and one for workload identities (service principals). The 'Users or workload identities' dropdown at the top of the policy must be set to only one type.

---

### Error 1078: Service principal(s) with object ids are not supported when assigning Managed Identity or multi-tenant app to CA policy for workload id...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design, Managed Identities and multi-tenant applications cannot be assigned as workload identities to Conditional Access policies. Only single-tenant service principals (Enterprise apps) registered in the tenant are supported.

**Solution**: Use only single-tenant service principals registered in the tenant. Managed identities and third-party SaaS/multi-tenant apps are not supported for CA workload identity targeting. For multi-tenant scenarios, the app must be registered as single-tenant in the customer's tenant.

---

### Conditional Access Target Resources now shows all applications with service principals, potentially causing unintended access blocks to dependent s...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft introduced a change to expose all applications with service principals in Entra CA Target Resources. Previously only selected apps were shown. This can cause dependent service issues when policies inadvertently target apps they did not before.

**Solution**: Review existing CA policies to ensure dependent services are not unintentionally blocked by the expanded Target Resources list. ICM escalation path: Owning Service: ESTS, Owning Team: Conditional Access.

---

## Phase 4: Aadsts650059
> 4 related entries

### AADSTS650059: The application is not configured for use in tenant (tenantId). The value AzureADMyOrg set for application property SignInAudience is...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App was previously configured as multi-tenant but later converted to single-tenant (AzureADMyOrg). Service Principals provisioned in external tenants can no longer obtain tokens after this change.

**Solution**: If app should be multi-tenant: update signInAudience on the app registration (home tenant) to AzureADMultipleOrgs or AzureADandPersonalMicrosoftAccount. If single-tenant is correct: delete Service Principals in external tenants. Deadline for 211 whitelisted apps is 2025-07-14.

---

### Error AADSTS650059: 'The application (appId:{appId}) is not configured for use in tenant (tenantId:{tenantId}). The value AzureADMyOrg set for appl...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App was previously configured as multi-tenant (AzureADMultipleOrgs), users in external tenants had accessed it creating Service Principals there. Later, the app's signInAudience was changed to AzureADMyOrg (single-tenant). The SP in external tenants still exists but the home tenant app registration now only allows home tenant sign-ins. 211 whitelisted apps had July 14, 2025 deadline.

**Solution**: If app needs to support multiple tenants: change signInAudience of the app registration in home tenant to AzureADMultipleOrgs or AzureADandPersonalMicrosoftAccount. If no access to home tenant: contact app owner to update signInAudience. If app should only work in home tenant: no action needed but external SPs will fail after enforcement date.

---

### External tenant users receive AADSTS650059 'The application is not configured for use in tenant (tenantId)' when signing in to a previously accessi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: App registration was converted from multi-tenant (AzureADMultipleOrgs) to single-tenant (AzureADMyOrg) AFTER Service Principals were already provisioned in external tenants. ESTS now blocks token issuance for those SPs.

**Solution**: Change signInAudience on the app registration (in home tenant) to AzureADMultipleOrgs or AzureADandPersonalMicrosoftAccount. If customer does not own the app, contact the app owner/developer. 211 known affected apps whitelisted until 2025-07-14.

---

### Error AADSTS650059: 'The application (appId) is not configured for use in tenant (tenantId). The value AzureADMyOrg set for application property Si...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The app was previously configured as multi-tenant (AzureADMultipleOrgs), creating Service Principals in external tenants. The app registration was later changed to single-tenant (AzureADMyOrg). Starting July 14, 2025, ESTS enforces blocking of authentication for these SPs in external tenants. The signInAudience property on the Service Principal is read-only and cannot be updated directly.

**Solution**: If app needs multi-tenant support: change signInAudience on the app registration in home tenant to AzureADMultipleOrgs or AzureADandPersonalMicrosoftAccount; if the app is no longer needed: delete it; if intended to be single-tenant: no action needed but SPs in external tenants will fail after 7/14/2025. If customer does not own the backing app, they must contact the app owner to make changes.

---

## Phase 5: Managed Identity
> 4 related entries

### Managed Identity cannot access resources in a different directory/tenant. Customer asks if Managed Identity can work as a multi-tenant application.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Managed Identity is designed as a single-tenant identity tied to the Azure resource home tenant. It cannot be configured as a multi-tenant application.

**Solution**: Managed Identity cannot be used cross-tenant or as multi-tenant. For cross-tenant resource access, use standard app registrations with client credentials. See FAQ: https://learn.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/managed-identities-faq

---

### System assigned managed identity keeps turning back on automatically after being disabled on a VM via Portal, PowerShell, or Azure CLI
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: An Azure Policy (e.g. Add system-assigned managed identity to enable Guest Configuration assignments on VMs) is enforcing system-assigned managed identity on VMs in the subscription scope.

**Solution**: Check Activity Log on the VM resource for policy-related operations after disabling MSI. Identify the Azure Policy assignment ID enforcing system-assigned identity. Remove the policy assignment or exclude the VM from the policy. Use ARM Kusto query on armprodeus cluster to trace policy evaluation with isComplianceCheck.

---

### Unable to delete a SystemAssigned Managed Identity Enterprise Application with Insufficient Permissions error
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: SystemAssigned managed identities cannot be directly deleted from Enterprise Applications. Their lifecycle is tied to the Azure resource that created them.

**Solution**: Navigate to the Azure resource blade (VM, App Service etc) > Identity tab > turn off System Assigned identity. If the source resource no longer exists, use ASC Tenant Explorer to find managedIdentityResourceId in SP metadata, verify resource status in Resource Explorer, and file ICM to Managed Service Identity/Triage team for backend removal (requires TA approval).

---

### Azure Policy remediation deployment fails with InvalidTemplate error: The name property cannot be null or empty when using Bring-your-own-User-assi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Only show parameters that need input or review checkbox was not unchecked on the Parameters tab during policy assignment, hiding the required User-Assigned Managed Identity Name and Resource Group Name fields.

**Solution**: Edit the policy assignment > Parameters tab > uncheck Only show parameters that need input or review > populate User-Assigned Managed Identity Name and Resource Group Name fields > Review + save > create a new Remediation Task.

---

## Phase 6: Workload Identity
> 3 related entries

### Error 1072: Cannot assign users and service principals to same CA policy
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design limitation.

**Solution**: Create separate CA policies for users and workload identities.

---

### Error 1078: Managed Identity/multi-tenant app not supported for CA workload identity
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Only single-tenant SPs supported by design.

**Solution**: Use single-tenant service principals only.

---

### Workload identity federation fails with AADSTS7002121: No matching federated identity record found for presented assertion audience
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: The FIC audience, subject, or issuer does not match the configuration on the user-assigned managed identity or app registration; matching is case-sensitive

**Solution**: Verify FIC config: 1) Audiences must be api://AzureADTokenExchange for public clouds; 2) Compare Issuer/Subject/Audience from ASC sign-in logs against FIC config; 3) Matching is case-sensitive; 4) Ensure ManagedIdentityResourceID exists for user-assigned MI; 5) If FIC token missing from incoming credentials, issue is on app side

---

## Phase 7: Fic
> 3 related entries

### Azure Storage fails to decrypt content with Customer Managed Key (CMK). Error code 403 ('This request is not authorized to perform this operation u...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The multi-tenant application, its Federated Identity Credential (FIC), or the User Assigned Managed Identity assigned to the FIC was soft-deleted or hard-deleted, breaking the cross-tenant CMK trust chain. Access may continue working for ~2.5 days after deletion before failing.

**Solution**: Check if the multi-tenant app, FIC, or UAMI was deleted. For soft-deleted apps, restore within 30 days via Entra ID. For hard-deleted apps or deleted FICs/UAMIs, re-create the multi-tenant app, configure a new FIC, and re-establish the trust relationship. Verify by checking Sign-in logs for Service Principal sign-in failures and checking if the Federated credential ID field is populated.

---

### AADSTS700213: No matching federated identity record found for presented assertion subject '{subject}'. Please note that the matching is done using ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Breaking change deployed Aug 14, 2024: Entra ID now enforces case-sensitive matching for FIC subject claims (previously case-insensitive). Phase 1 blocks new FICs; Phase 2 (Sept 27, 2024) blocks inactive apps. Apps with active case-insensitive matching are allow-listed temporarily.

**Solution**: 1) Filter Service principal/Managed identity sign-ins for Failure events with error code 700213. 2) Navigate to the app's Certificates & secrets > Federated credentials blade. 3) Check the external IdP activity logs for the actual claim value sent. 4) Update the FIC Subject Identifier to match the exact case sent by the external IdP. Use ASC Authentication Diagnostics (Expert view > Diagnostic logs > search 'AADSTS') to view the actual unmasked claim. If FIC cannot be found, use 'List All Applic

---

### Creating multiple federated identity credentials concurrently on the same user-assigned managed identity returns success (200 OK) for each API call...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Concurrent API calls to create FICs under the same UAMI are not properly serialized, leading to race conditions where some operations may overwrite or fail to persist despite returning success responses.

**Solution**: Create federated identity credentials sequentially (one at a time) rather than concurrently. Wait for each creation request to complete before sending the next. Verify all expected FICs exist after batch creation by listing them (GET /identities/{id}/federatedIdentityCredentials). Contact Microsoft support if credentials are missing after sequential creation.

---

## Phase 8: Sign In Logs
> 3 related entries

### Customer needs to retrieve non-interactive user sign-ins, service principal sign-ins, or managed identity sign-ins via MS Graph API but only sees i...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Default signIns endpoint returns interactive sign-ins; non-interactive/SP/managed identity require explicit signInEventTypes filter on beta endpoint

**Solution**: Use beta endpoint with signInEventTypes filter: /beta/auditLogs/signIns?$filter=signInEventTypes/any(t: t eq 'nonInteractiveUser'). Also available via Graph PowerShell: Connect-MgGraph -Scopes "AuditLog.Read.All"; Get-MgAuditLogSignIn -Filter "signInEventTypes/any(t: t eq 'nonInteractiveUser')"

---

### Need to retrieve non-interactive user sign-ins, service principal sign-ins, or managed identity sign-ins via MS Graph API but default endpoint only...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The v1.0 Graph API /auditLogs/signIns returns interactive sign-ins by default. Non-interactive, service principal, and managed identity sign-ins require filtering by signInEventTypes.

**Solution**: Use beta endpoint with signInEventTypes filter: /beta/auditLogs/signIns?$filter=signInEventTypes/any(t: t eq 'nonInteractiveUser'). Values: interactiveUser, nonInteractiveUser, servicePrincipal, managedIdentity. PowerShell: Get-MgAuditLogSignIn -Filter "signInEventTypes/any(t: t eq 'nonInteractiveUser')".

---

### Service principal sign-in shows CA policy as Not Applied even though a blocking CA policy exists. Two request IDs appear, one with CA info (from Es...
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: ESTS-R requests do not evaluate CA directly; they replay from ESTS-G. ALP redaction logic incorrectly drops CA details from ESTS-R requests. Bug 3232779.

**Solution**: Known bug. Work item created to re-evaluate ALP redaction logic with ESTS-X team.

---

## Phase 9: Sp Less Authentication
> 2 related entries

### Client application receives error 'The client application {appId} is missing service principal in the tenant {tenantId}' when acquiring token via O...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra ID enforced blocking of SP-Less authentication — cross-tenant token acquisition without a client Service Principal in the target tenant. Step 1 (Feb 2023): blocked for all 1P resource apps; Step 2 (Mar 2023): blocked for all 3P resource apps except a legacy allowlist. This is a security enforcement because SP-Less tokens lack oid, role, and group claims, posing authorization vulnerabilities.

**Solution**: Create a Service Principal (Enterprise Application) for the client app in the target tenant. Steps: (1) Admin consent URL or PowerShell: New-MgServicePrincipal -AppId '{appId}'; (2) Consent to required permissions using requiredResourceAccess property; (3) Reference: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/create-service-principal-cross-tenant. ICM escalation: Service=ESTS, Team=Incident Triage.

---

### Multi-tenant app authentication fails; sign-in logs show Service Principal ID as '00000000-0000-0000-0000-000000000000'. Error: 'The client applica...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Entra ID blocked SP-Less authentication (app-only tokens issued without a Service Principal for the client app in the target tenant). Effective July 8, 2024, multi-tenant 3P apps acting as clients cannot obtain tokens from tenants where they have no service principal. SP-Less tokens lack {oid}, {role}, and {group} claims.

**Solution**: Create an Enterprise Application (Service Principal) in the target tenant using the Application ID from sign-in logs. Admin can use portal or MS Graph API: https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/create-service-principal-cross-tenant?pivots=msgraph-powershell — List of currently still-allowed SP-Less apps (MIP Platform, SQL Security, Xstore, Azure Log Analytics, ADRS, Dynamics 365 Commerce, Defender for Cloud Apps, etc.) per wiki; these are in an allowlist.

---

## Phase 10: Symmetric Key
> 2 related entries

### AADSTS7002104: 'Symmetric secrets may not be set on Service Principals to authenticate this application.' Error appears in sign-in logs. Client req...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft disabled symmetric key authentication on first-party application Service Principals as part of SFI (Security First Initiative). Symmetric keys rely on shared secrets that are vulnerable to interception. Enforcement started June 15, 2024 (MC792991, MC792982).

**Solution**: Replace symmetric keys with asymmetric keys using Add-MgServicePrincipalKey. To identify affected SPs, run PowerShell: Get-MgServicePrincipal -All and filter KeyCredentials where Type='Symmetric'. See https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/add-mgserviceprincipalkey for migration guidance. ICM escalation: Service=ESTS, Team=Incident Triage.

---

### AADSTS7002104: Symmetric secrets may not be set on Service Principals to authenticate this application.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft disabled symmetric key auth on 1P SP as part of SFI, enforced June 2024.

**Solution**: Replace symmetric keys with asymmetric keys via Add-MgServicePrincipalKey. ICM: ESTS/Incident Triage.

---

## Phase 11: Verified Id
> 2 related entries

### Verified ID Face Check: User gets "Your organization hasn't authorized you to get a Verified ID" error with 401 Unauthorized when clicking Get my V...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The "My Profile" servicePrincipal (AppId: 8c59ead7-d703-4a27-9e55-c96a0054c8d2) is missing from the tenant.

**Solution**: Workaround: Manually add the My Profile servicePrincipal via PowerShell: Connect-MgGraph -scopes Application.ReadWrite.All; New-MgServicePrincipal -AppId "8c59ead7-d703-4a27-9e55-c96a0054c8d2"

---

### Verified ID Onboarding: Overview blade fails with 403 "The Verifiable Credentials Issuer Service application service principal is not found" even w...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug in provisioning for tenants that previously provisioned Verified ID. Missing client API app SP causes re-provisioning to fail due to insufficient Graph permissions.

**Solution**: File ICM (ref: 335009327). PG fix tracked in bug 2041925. Requires PG intervention to manually provision missing service principals.

---

## Phase 12: Intune
> 2 related entries

### Microsoft Intune Windows Agent first-party app automatically disabled by Microsoft Online Services and re-disabled each time customer enables it
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: FPA is not linked to subscription-based lifecycle flow, causing subscription validity checks to fail. Intune team confirmed app is not being used.

**Solution**: Delete the service principal: Remove-MgServicePrincipal -ServicePrincipalId <id>. App ID: fc0f3af4-6835-4174-b806-f7db311fd2f3.

---

### Microsoft Intune Windows Agent FPA auto-disabled; re-disabled each time enabled
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: FPA not linked to subscription lifecycle. App confirmed not in use by Intune team.

**Solution**: Delete service principal: Remove-MgServicePrincipal. App ID: fc0f3af4-6835-4174-b806-f7db311fd2f3.

---

## Phase 13: Enterprise App
> 2 related entries

### Users and Groups menu missing for Enterprise Application in Azure Portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Service Principal missing tag WindowsAzureActiveDirectoryIntegratedApp, or multiple tags configured as single comma-separated entity

**Solution**: Add tag: Update-MgServicePrincipal -ServicePrincipalId <id> -Tags "WindowsAzureActiveDirectoryIntegratedApp". For multiple tags, each must be a separate array element.

---

### Customer cannot edit or rename the display name of an Enterprise Application in Azure Portal; the 'Name' field under Enterprise Applications > Prop...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The application is a multi-tenant app registered in an external (publisher's) tenant. Only the Service Principal (Enterprise Application) exists in the customer's tenant; the Application Object (App Registration), which holds the 'name' property, resides in the publisher's tenant. Since the App Registration is not local, the customer cannot modify the display name.

**Solution**: 1. Confirm via ASC > Application > search by name > Application Object tab — if 'No data available', App Registration does not exist locally. 2. Alternatively: search the App ID under App Registrations — if it only appears under Enterprise Applications (not App Registrations), confirms no local App Object. Workarounds: (a) Register a new application in the customer's tenant to create a local App Registration with full control. (b) Add a non-gallery application manually: Enterprise Applications >

---

## Phase 14: Token Lifetime
> 1 related entries

### Token lifetime policy does not take effect, tokens still ~1 hour
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Policy applied to wrong app type. ID Token needs policy on Caller App, Access Token on Resource App.

**Solution**: Apply TokenLifetimePolicy to correct Service Principal. Multiple policies: first one wins. Avoid setting on MS Graph resource.

---

## Phase 15: Msgraph
> 1 related entries

### Need to authenticate Microsoft Graph PowerShell with service principal certificate in Azure China
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Default app ID not available in Mooncake

**Solution**: Create self-signed cert, export .cer to app registration, Connect-MgGraph -ClientId -Environment China -TenantId -CertificateThumbprint

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | On-premise data gateway login fails because Power BI service application SP g... | Power BI service SP has ServicePrincipalLifecyclePolicy s... | Manually re-enable the SP before each use. PG acknowledge... | 🟢 10.0 | OneNote |
| 2 | AADSSHLoginForLinux VM extension install fails with Non-zero exit code: 22 an... | System Assigned or User Assigned managed identity is not ... | 1) Uninstall the failed extension. 2) Enable System Assig... | 🟢 9.5 | ADO Wiki |
| 3 | Token lifetime policy does not take effect, tokens still ~1 hour | Policy applied to wrong app type. ID Token needs policy o... | Apply TokenLifetimePolicy to correct Service Principal. M... | 🟢 9.0 | OneNote |
| 4 | Need to authenticate Microsoft Graph PowerShell with service principal certif... | Default app ID not available in Mooncake | Create self-signed cert, export .cer to app registration,... | 🟢 9.0 | OneNote |
| 5 | App role assignment to AAD group fails when trying to assign via Microsoft.Gr... | App role assignment must be performed on Service Principa... | Create Service Principal first: New-MgServicePrincipal -A... | 🟢 9.0 | OneNote |
| 6 | Refresh token renewed despite MaxInactiveTime exceeded and Outlook was idle/c... | Outlook requests tokens for multiple SPs (Exchange + Offi... | Apply Token Lifetime Policy to ALL service principals the... | 🟢 9.0 | OneNote |
| 7 | AAD issues access token for application whose Service Principal was deleted. ... | By design: AAD can issue client_credentials tokens (Clien... | Recreate the service principal in the tenant: New-AzureAD... | 🟢 9.0 | OneNote |
| 8 | Numerous AAD audit log failures for 'adding service principal' triggered by '... | ARM automatically attempts to create service principals f... | This is expected behavior and can be safely ignored. The ... | 🟢 9.0 | OneNote |
| 9 | Azure Linux VM Sign-In cloud app (ce6ff14a-7fdc-4685-bbe0-f6afdfcfa8e0) not r... | The Azure Linux VM Sign-In service principal is not autom... | Global admin registers: Connect-MgGraph -Scopes Applicati... | 🟢 8.5 | ADO Wiki |
| 10 | PowerShell scripts cannot reliably enumerate all SAML SSO apps from a tenant.... | PreferredSingleSignOnMode attribute was introduced in a l... | Use the script filtering on PreferredSingleSignOnMode (ca... | 🟢 8.5 | ADO Wiki |
| 11 | Restoring a soft-deleted service principal fails with error: The service prin... | Another active service principal in the tenant has one or... | Remove the conflicting URLs from the active service princ... | 🟢 8.5 | ADO Wiki |
| 12 | Non-admin user gets Directory_QuotaExceeded error when creating objects in En... | Non-admin users are limited to 250 objects in Entra ID. S... | Hard-delete unneeded soft-deleted objects using Remove-Mg... | 🟢 8.5 | ADO Wiki |
| 13 | Clicking 'Restore deleted applications' in App Registrations blade creates a ... | The App Registrations portal restore function creates a n... | Use Graph API or PowerShell to restore in correct order: ... | 🟢 8.5 | ADO Wiki |
| 14 | First-party service principals disappear from tenant without audit events. Cu... | Azure AD Directory Platform team periodically soft-delete... | If dependent 3P app breaks: recover the deleted SP within... | 🟢 8.5 | ADO Wiki |
| 15 | Clicking Restore deleted applications in App Registrations blade creates a ne... | The App Registrations portal restore function creates a n... | Use Graph API or PowerShell to restore in correct order: ... | 🟢 8.5 | ADO Wiki |
| 16 | First-party service principals disappear from tenant without audit events. Cu... | Azure AD Directory Platform team periodically soft-delete... | If dependent 3P app breaks: recover the deleted SP within... | 🟢 8.5 | ADO Wiki |
| 17 | Client application receives error 'The client application {appId} is missing ... | Entra ID enforced blocking of SP-Less authentication — cr... | Create a Service Principal (Enterprise Application) for t... | 🟢 8.5 | ADO Wiki |
| 18 | User receives AADSTS50105 error — 'User is not assigned to a role for the app... | The 'Assignment required' property is enabled on the Ente... | (1) Assign the user or group to the Enterprise Applicatio... | 🟢 8.5 | ADO Wiki |
| 19 | AADSTS700211: No matching federated identity record found for presented asser... | Azure CLI's '--federated-token' parameter and Azure Power... | When using Azure CLI with FIC for cross-tenant managed id... | 🟢 8.5 | ADO Wiki |
| 20 | AADSTS7002104: 'Symmetric secrets may not be set on Service Principals to aut... | Microsoft disabled symmetric key authentication on first-... | Replace symmetric keys with asymmetric keys using Add-MgS... | 🟢 8.5 | ADO Wiki |
| 21 | AADSTS7002104: Symmetric secrets may not be set on Service Principals to auth... | Microsoft disabled symmetric key auth on 1P SP as part of... | Replace symmetric keys with asymmetric keys via Add-MgSer... | 🟢 8.5 | ADO Wiki |
| 22 | Verified ID Face Check: User gets "Your organization hasn't authorized you to... | The "My Profile" servicePrincipal (AppId: 8c59ead7-d703-4... | Workaround: Manually add the My Profile servicePrincipal ... | 🟢 8.5 | ADO Wiki |
| 23 | Verified ID Onboarding: Overview blade fails with 403 "The Verifiable Credent... | Bug in provisioning for tenants that previously provision... | File ICM (ref: 335009327). PG fix tracked in bug 2041925.... | 🟢 8.5 | ADO Wiki |
| 24 | Workload identity (service principal) fails to acquire access token with AADS... | A Conditional Access policy for workload identities is co... | 1. Identify the CA policy from the error claims (capolids... | 🟢 8.5 | ADO Wiki |
| 25 | Error 1072: Policy cannot be assigned to both users and service principals wh... | By design, Azure AD does not allow assigning both users a... | Create separate Conditional Access policies: one for user... | 🟢 8.5 | ADO Wiki |
| 26 | Error 1078: Service principal(s) with object ids are not supported when assig... | By design, Managed Identities and multi-tenant applicatio... | Use only single-tenant service principals registered in t... | 🟢 8.5 | ADO Wiki |
| 27 | Microsoft Intune Windows Agent first-party app automatically disabled by Micr... | FPA is not linked to subscription-based lifecycle flow, c... | Delete the service principal: Remove-MgServicePrincipal -... | 🟢 8.5 | ADO Wiki |
| 28 | Users and Groups menu missing for Enterprise Application in Azure Portal | Service Principal missing tag WindowsAzureActiveDirectory... | Add tag: Update-MgServicePrincipal -ServicePrincipalId <i... | 🟢 8.5 | ADO Wiki |
| 29 | Error 1072: Cannot assign users and service principals to same CA policy | By design limitation. | Create separate CA policies for users and workload identi... | 🟢 8.5 | ADO Wiki |
| 30 | Error 1078: Managed Identity/multi-tenant app not supported for CA workload i... | Only single-tenant SPs supported by design. | Use single-tenant service principals only. | 🟢 8.5 | ADO Wiki |
