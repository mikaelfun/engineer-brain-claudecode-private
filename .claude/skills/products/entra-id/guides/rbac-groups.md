# ENTRA-ID RBAC/Roles/Groups Management — Quick Reference

**Entries**: 142 | **21V**: Partial (135/140)
**Last updated**: 2026-04-18
**Keywords**: rbac, groups, dynamic-groups, pim, permissions, custom-role

> This topic has a fusion guide with detailed troubleshooting flow
> → [Full troubleshooting flow](details/rbac-groups.md)

## Issue Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 📋 | After AKS upgrade VMAS to VMSS, LB probes fail, traffic down. LB rules rewritten back to old IP. ... | UMI for AKS had no RBAC on VNet/PublicIP/LB. Cloud-controller-manager got Aut... | Assign Network Contributor to UMI on both Node RG and master RG. Reconcile AK... | 🟢 9.0 | OneNote |
| 2 📋 | MSIX app attach fails on AVD session hosts joined to AADDS. Adding MSIX image to host pool return... | MSIX app attach does not support AADDS. AADDS computer objects not synced to ... | Use on-prem AD DS instead of AADDS for MSIX app attach. | 🟢 9.0 | OneNote |
| 3 📋 | Customer needs to grant full database access across multiple database types (SQL Database + DBFor... | Built-in RBAC roles are database-type-specific (e.g. SQL DB Contributor only ... | Create a custom RBAC role combining operations: Microsoft.Sql/*, Microsoft.DB... | 🟢 9.0 | OneNote |
| 4 📋 | az role assignment create fails with 403 Forbidden when logged in as Service Principal; debug sho... | Azure CLI role assignment command first queries AAD Graph to resolve the assi... | Assign Directory readers role (or other role with AAD read permission) to the... | 🟢 9.0 | OneNote |
| 5 📋 | User cannot add an enterprise application in AAD portal. Error from AAD Graph: AADGraphException.... | The user account does not have the required directory role (Global Administra... | Assign the appropriate directory role (Global Admin, Application Admin, or Cl... | 🟢 9.0 | OneNote |
| 6 📋 | Need to allow a specific user to grant admin consent only for a specific app (App B) to access a ... | By default, granting admin consent requires at least Cloud App Admin role, wh... | Create custom app consent policy: 1) New-MgPolicyPermissionGrantPolicy with s... | 🟢 9.0 | OneNote |
| 7 📋 | Cannot access Azure AD Support Wiki, permission denied | User not member of Azure AD Wiki Entitlement group | Request Reader role at coreidentity entitlement URL (auto-approved). Log out/... | 🟢 9.0 | OneNote |
| 8 📋 | SSH connection to Azure Linux VM closed immediately: Connection closed by x.x.x.x port 22 after s... | RC1: User not assigned Virtual Machine Administrator/User Login RBAC role for... | RC1: Assign user to VM Administrator/User Login RBAC role at Subscription/RG/... | 🟢 8.5 | ADO Wiki |
| 9 📋 | RDP to Azure VM fails with 'Your account is configured to prevent you from using this device' aft... | User not assigned VM Administrator Login or VM User Login RBAC role. Owner/Co... | Assign Virtual Machine Administrator Login or Virtual Machine User Login at r... | 🟢 8.5 | ADO Wiki |
| 10 📋 | Run as Different User fails with username or password is incorrect on AVD AADJ device (works on p... | Run-as-different-user triggers non-interactive auth for resource app Azure Wi... | 1. Assign RBAC roles VM User Login or VM Administrator Login to the run-as us... | 🟢 8.5 | ADO Wiki |
| 11 📋 | Non-admin users who are Application Owners cannot access or manage their owned apps in the Azure ... | The 'Restrict access to Azure AD administration portal' setting under Users >... | Set 'Restrict access to Azure AD administration portal' to No, or assign the ... | 🟢 8.5 | ADO Wiki |
| 12 📋 | Non-admin App Owners cannot access or manage their owned apps in Entra portal despite being assig... | Restrict access to Azure AD administration portal is set to Yes, blocking all... | Set Restrict access to Azure AD administration portal to No, or assign user t... | 🟢 8.5 | ADO Wiki |
| 13 📋 | Custom RBAC roles not listed under Enterprise Apps > <application> > Roles and administrators bla... | By design, only custom roles containing permission prefixes 'microsoft.aad.di... | Ensure the custom role definition includes at least one permission with the r... | 🟢 8.5 | ADO Wiki |
| 14 📋 | Custom role members cannot access Microsoft Entra ID administration portal despite having valid r... | Tenant setting 'Restrict access to Microsoft Entra ID administration portal' ... | Change 'Restrict access to Microsoft Entra ID administration portal' to 'No'.... | 🟢 8.5 | ADO Wiki |
| 15 📋 | Custom RBAC role permission denied errors not appearing in Microsoft Entra ID Audit logs | Microsoft Entra ID only records failure audit events when an actual directory... | Use Kusto tracing in MSODS (msodsuswest.kusto.windows.net). Query Global('Ifx... | 🟢 8.5 | ADO Wiki |
| 16 📋 | Privileged admin roles (Helpdesk Admin, Authentication Admin) cannot perform sensitive actions (r... | By design security hardening: members of role-assignable groups are treated a... | Use Global Administrator role to perform the action. This is by design per MS... | 🟢 8.5 | ADO Wiki |
| 17 📋 | Privileged admin roles (Helpdesk/Auth Admin) cannot reset password or revoke tokens for members o... | By design: members of role-assignable groups are protected principals. Only G... | Use Global Administrator. By design per MS Learn sensitive actions docs. | 🟢 8.5 | ADO Wiki |
| 18 📋 | Privileged admin (Helpdesk Admin) cannot reset password or revoke tokens for users in role-assign... | By design: members of role-assignable groups are protected from sensitive act... | Use Global Admin. See docs: Who can perform sensitive actions. | 🟢 8.5 | ADO Wiki |
| 19 📋 | Sensitivity labels cannot be changed after applied to Entra Security Group - must recreate group | Known limitation: label change on Security Groups not yet supported | Recreate group with desired label. Also: labels cannot be applied to Mail Ena... | 🟢 8.5 | ADO Wiki |
| 20 📋 | Groups removed from expiration policy still have expirationDate populated | Bug: removing policy does not clear residual expirationDate (Bug 2315818) | Group will NOT be deleted. To clear: re-add to policy, wait 1 day, remove. | 🟢 8.5 | ADO Wiki |
| 21 📋 | Groups not deleted after expiry - expiration notification emails missed | Intermittent: some 30d/15d/1d notifications not sent; without all 3 group not... | Groups safe from accidental deletion. Extended groups can be manually deleted... | 🟢 8.5 | ADO Wiki |
| 22 📋 | Removing sensitivity label from group does not revert AllowToAddGuests - guests still blocked | By design: Groups team does not maintain pre-label state for AllowToAddGuests | Manually set AllowToAddGuests=True via PowerShell per MS docs per-group-guest... | 🟢 8.5 | ADO Wiki |
| 23 📋 | Script to enable/disable M365 group creation sometimes fails - GroupCreationAllowedGroupId not up... | Script cannot resolve group ObjectId from group name in some environments | Paste commands directly in PowerShell using group ObjectID instead of name. | 🟢 8.5 | ADO Wiki |
| 24 📋 | Security Groups can incorrectly get expirationDate set enabling deletion by expiration policy | Bug: expirationDate can be set on security groups (deleted security groups cu... | Critical risk. Bug 3331094. | 🟢 8.5 | ADO Wiki |
| 25 📋 | Azure AD group with a leading space in the displayName (e.g. ' GroupName') cannot be found via RB... | Known bug: Azure AD portal and PowerShell both allow a space prefix in group ... | This is a known PG issue to be documented publicly. Advise customer not to ad... | 🟢 8.5 | ADO Wiki |
| 26 📋 | Customers see two unrecognized SIDs (S-1-12-1-2519061733-1113399595-3556733861-1346131856 and S-1... | These SIDs are automatically added during Azure AD device join. SID 1 corresp... | Expected behavior by design. To confirm: run the script at https://github.com... | 🟢 8.5 | ADO Wiki |
| 27 📋 | Non-admin App Owners cannot manage or modify the apps they own in the Entra ID / Azure AD adminis... | The 'Restrict access to Azure AD administration portal' user setting is set t... | Set 'Restrict access to Azure AD administration portal' (Azure AD > Users > U... | 🟢 8.5 | ADO Wiki |
| 28 📋 | Non-admin application owners cannot manage their registered applications in the Azure AD portal e... | The 'Restrict access to Azure AD administration portal' setting is configured... | Set 'Restrict access to Azure AD administration portal' to 'No', or assign th... | 🟢 8.5 | ADO Wiki |
| 29 📋 | Non-admin App Owner cannot manage their owned apps in Azure AD portal even after being explicitly... | The 'Restrict access to Azure AD administration portal' setting (Azure AD → U... | Set 'Restrict access to Azure AD administration portal' to No, OR assign the ... | 🟢 8.5 | ADO Wiki |
| 30 📋 | Group transform claim (TraceCode 25729) omitted from token: 'Overage limit has been hit for groups' | User has 1000+ group memberships. When group transform is applied, the overag... | Group filtering may not help when user has 1000+ groups. Reduce user's group ... | 🟢 8.5 | ADO Wiki |
| 31 📋 | Non-admin App Owners cannot access or manage their own app registrations or enterprise applicatio... | The 'Restrict access to Azure AD administration portal' setting is set to 'Ye... | Option 1: Set 'Restrict access to Azure AD administration portal' to 'No' to ... | 🟢 8.5 | ADO Wiki |
| 32 📋 | Global Administrator (or other eligible admin) cannot delete an Enterprise Application; Delete bu... | The application is a Microsoft first-party application. These cannot be delet... | 1. Check the 1st Party App wiki: https://supportability.visualstudio.com/Azur... | 🟢 8.5 | ADO Wiki |
| 33 📋 | User with Azure Customer Lockbox Approver role cannot see or approve subscription-level lockbox r... | The Azure Customer Lockbox Approver role was not active on the account before... | Ensure the Azure Customer Lockbox Approver role is assigned and active (inclu... | 🟢 8.5 | ADO Wiki |
| 34 📋 | Microsoft engineer Lockbox access request is stuck in pending state with no customer notification... | The Microsoft engineer submitted the Lockbox access request BEFORE the custom... | Wait for the stuck request to time out (4-day automatic timeout). Then: 1) Cu... | 🟢 8.5 | ADO Wiki |
| 35 📋 | Customer with inherited Owner role does not receive Customer Lockbox approval email and cannot ap... | An inherited owner role is NOT recognized by Customer Lockbox. Only directly ... | Assign a direct (not inherited) Owner role, Global Admin role, or Azure Custo... | 🟢 8.5 | ADO Wiki |
| 36 📋 | IDX10214: Audience validation failed. The aud claim in the access token does not match validation... | The aud claim in the access token does not match the expected audience config... | Ensure the audience config matches the aud claim in the access token. For ASP... | 🟢 8.5 | ADO Wiki |
| 37 📋 | Azure AD Reporting API returns 403 with 'User is not in the allowed roles' when using delegated (... | The user calling the Reporting API is not assigned to any of the required adm... | Assign the user to one of: Security Administrator, Security Reader, Global Re... | 🟢 8.5 | ADO Wiki |
| 38 📋 | MS Graph returns 'Insufficient privileges' when updating group membership | Multiple possible causes: (1) Target is a Dynamic Group - manual member updat... | For dynamic groups: modify the dynamic membership rule instead. For role-assi... | 🟢 8.5 | ADO Wiki |
| 39 📋 | System.UnauthorizedAccessException: IDW10201: Neither scope or roles claim was found in the beare... | Microsoft Identity Web validates that scope or role claims exist in the token... | Set AllowWebApiToBeAuthorizedByACL to true in AzureAD configuration section: ... | 🟢 8.5 | ADO Wiki |
| 40 📋 | Azure Policy remediation task for assigning user-assigned managed identity to VMs fails with Auth... | The user-assigned managed identity has Managed Identity Operator and User Acc... | Add the user-assigned managed identity to the Contributor role at the subscri... | 🟢 8.5 | ADO Wiki |
| NEW 📋 | Global admin/Owner of Subscription Unable to access Azure Resources under PIM Unable to access Azure... | For PIM service to be able to access Azure resources, MS-PIM SPN should always h... | Assign a User Access Administrator RBAC role to PIM SPN (MS � PIM) at a subscrip... | 🟢 8.0 | ContentIdea |
| NEW 📋 | It is possible to create and attach Extension attributes for Azure AD created Groups but it has to b... | N/A | N/A | 🟡 6.5 | ContentIdea |
| ... | *100 more entries* | | | | |

## Quick Troubleshooting Path

1. Check **rbac** related issues (9 entries) `[onenote]`
2. Check **custom-role** related issues (5 entries) `[onenote]`
3. Check **groups** related issues (5 entries) `[ado-wiki]`
4. Check **role-assignable** related issues (3 entries) `[ado-wiki]`
5. Check **avd** related issues (2 entries) `[onenote]`
6. Check **app-owner** related issues (2 entries) `[ado-wiki]`
7. Check **portal-restriction** related issues (2 entries) `[ado-wiki]`
8. Check **directory-readers** related issues (2 entries) `[ado-wiki]`
