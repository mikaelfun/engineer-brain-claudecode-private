# ENTRA-ID RBAC/Roles/Groups Management — Detailed Troubleshooting Guide

**Entries**: 140 | **Drafts fused**: 40 | **Kusto queries**: 1
**Draft sources**: ado-wiki-a-aad-roles-groups-css-test-environment.md, ado-wiki-a-azure-rbac-roles-entitlement-management.md, ado-wiki-a-bulk-actions-users-groups.md, ado-wiki-b-export-rbac-roles-csv-script.md, ado-wiki-b-group-name-claims-synced-groups.md, ado-wiki-b-pim-azure-lighthouse.md, ado-wiki-b-pim-azure-resources-rbac.md, ado-wiki-b-troubleshooting-msi-rbac-roles.md, ado-wiki-b-tsg-troubleshooting-rbac-permissions.md, ado-wiki-b-unified-rbac-api-tsg.md
**Kusto references**: authorization-manager.md
**Generated**: 2026-04-07

---

## Phase 1: Groups
> 18 related entries

### Privileged admin roles (Helpdesk Admin, Authentication Admin) cannot perform sensitive actions (reset password, revoke tokens) on users who are mem...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design security hardening: members of role-assignable groups are treated as protected principals. Even non-admin users become protected when added to a role-assignable group. Only Global Administrators can perform sensitive actions on these users.

**Solution**: Use Global Administrator role to perform the action. This is by design per MS Learn: 'Who can perform sensitive actions' documentation. Consider removing user from role-assignable group if admin operations are needed by lower-privilege admins.

---

### Privileged admin roles (Helpdesk/Auth Admin) cannot reset password or revoke tokens for members of role-assignable groups
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: members of role-assignable groups are protected principals. Only Global Admin can act.

**Solution**: Use Global Administrator. By design per MS Learn sensitive actions docs.

---

### Sensitivity labels cannot be changed after applied to Entra Security Group - must recreate group
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known limitation: label change on Security Groups not yet supported

**Solution**: Recreate group with desired label. Also: labels cannot be applied to Mail Enabled or Dynamic Security Groups.

---

### Groups removed from expiration policy still have expirationDate populated
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug: removing policy does not clear residual expirationDate (Bug 2315818)

**Solution**: Group will NOT be deleted. To clear: re-add to policy, wait 1 day, remove.

---

### Groups not deleted after expiry - expiration notification emails missed
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Intermittent: some 30d/15d/1d notifications not sent; without all 3 group not deleted, extended 35 days

**Solution**: Groups safe from accidental deletion. Extended groups can be manually deleted. PG adding logging PBI 2701451.

---

### Removing sensitivity label from group does not revert AllowToAddGuests - guests still blocked
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design: Groups team does not maintain pre-label state for AllowToAddGuests

**Solution**: Manually set AllowToAddGuests=True via PowerShell per MS docs per-group-guest-access.

---

### Script to enable/disable M365 group creation sometimes fails - GroupCreationAllowedGroupId not updated
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Script cannot resolve group ObjectId from group name in some environments

**Solution**: Paste commands directly in PowerShell using group ObjectID instead of name.

---

### Security Groups can incorrectly get expirationDate set enabling deletion by expiration policy
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Bug: expirationDate can be set on security groups (deleted security groups currently not restorable)

**Solution**: Critical risk. Bug 3331094.

---

### Azure AD group with a leading space in the displayName (e.g. ' GroupName') cannot be found via RBAC role selector, portal group search, or ObjectId...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Known bug: Azure AD portal and PowerShell both allow a space prefix in group displayName without error or trimming; the stored displayName includes the leading space which causes the group to be unfindable by any search method

**Solution**: This is a known PG issue to be documented publicly. Advise customer not to add unintentional white space prefix to group displayName. Affected groups may need to be deleted and recreated without the space prefix

---

### Regular users unable to read group expiration policies via Entra portal UI
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Bug: code requires admin role to read expiration policies even for member users

**Solution**: PG fix in progress. WorkItem 3408706.

---

## Phase 2: Dynamic Groups
> 13 related entries

### MemberOf dynamic groups show incorrect membership or miss adding/removing members in Entra ID
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MemberOf dynamic groups are still in Preview state and have known processing reliability issues. Groups do not always correctly add or remove members during background processing.

**Solution**: Pause processing on the impacted MemberOf group in the Portal, wait 15 minutes, then resume processing to trigger a full reprocess. Remind customer that MemberOf groups are Preview and not recommended for production.

---

### Multiple MemberOf dynamic groups with the same membership rule show different membership counts
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MemberOf dynamic groups are processed at different times, and the processing may miss adding or removing members. This mismatch is expected for frequently updated groups but can also occur due to a known bug.

**Solution**: Pause processing on impacted groups in the Portal, wait 15 minutes, then resume processing. This forces a full reprocess. Backlog item: https://identitydivision.visualstudio.com/Engineering/_workitems/edit/2935209

---

### MemberOf dynamic group targeting an Administrative Unit does not update membership after initial creation
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When a MemberOf dynamic group points to an Administrative Unit, using group.objectId syntax in the membership rule causes it to update only on initial creation but not subsequently.

**Solution**: Use correct syntax: user.memberof -any (administrativeUnit.objectId -in ['<AU-ObjectId>']) instead of group.objectId. Bug: https://identitydivision.visualstudio.com/Engineering/_workitems/edit/3172007

---

### Dynamic group membership rule using multi-valued extension attribute (Collection type) does not work as expected
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Dynamic group rules only support extension attributes as string properties. Multi-valued extension attributes (odata.type #Collection) are not supported in dynamic membership rules.

**Solution**: Verify the extension attribute type via ASC Graph Explorer GET /user/<objectid>. If the attribute is Collection type, it cannot be used in dynamic group rules. Reference: https://learn.microsoft.com/en-us/azure/active-directory/enterprise-users/groups-dynamic-membership#extension-properties-and-custom-extension-properties

---

### MemberOf dynamic group shows Failed processing status in Entra ID
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MemberOf dynamic groups fail when they exceed the allowed nesting level of 1. A MemberOf dynamic group cannot define the membership of another MemberOf dynamic group.

**Solution**: Check all Group ObjectIDs in the MemberOf membership rule to verify none are also MemberOf dynamic groups. Also check if any other MemberOf group in the tenant contains the failing groups ObjectID. Remove circular references. If unable to determine cause, escalate to PG via IcM to Groups team.

---

### MemberOf dynamic groups show incorrect membership or different membership counts across groups with identical membership rules
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: MemberOf dynamic groups are preview with known processing limitations. Groups not processed simultaneously may miss member changes. Nesting depth >1 causes failure.

**Solution**: Pause and unpause group processing in Azure Portal (wait 15 min). MemberOf is preview, not for production. For failed state: check if rule references another MemberOf group (nesting >1). Doc: https://learn.microsoft.com/en-us/entra/identity/users/groups-dynamic-rule-member-of

---

### MemberOf dynamic group targeting Administrative Unit updates only at creation then stops
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Wrong syntax: group.objectId used instead of administrativeUnit.objectId for AU targets.

**Solution**: Use: user.memberof -any (administrativeUnit.objectId -in ['<AU-GUID>']). group.objectId is incorrect for AU targets.

---

### Dynamic group rule using extension attribute does not match expected users; multi-valued extension properties ignored
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Dynamic group rules only support extension attributes as string. Collections (#Collection) are not supported.

**Solution**: Check via Graph GET /users/<id>. If odata.type is #Collection(Edm.String) it is multi-valued and unsupported. Use single-valued string extensions. Ref: https://learn.microsoft.com/en-us/azure/active-directory/enterprise-users/groups-dynamic-membership#extension-properties-and-custom-extension-properties

---

### Adding whitespace to end of dynamic group rule does not trigger reprocess; DirectReports rule with {} brackets fails
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Portal UX trims trailing spaces. DirectReports with {} brackets around manager_id is invalid syntax.

**Solution**: Add space to MIDDLE of rule or toggle double/single quotes. For DirectReports: remove {} (use 'Direct Reports for manager_id'). Ref: https://learn.microsoft.com/en-us/troubleshoot/azure/active-directory/troubleshoot-dynamic-groups

---

### Custom role with microsoft.directory/groups/members/update allows manual edit of dynamic group membership
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: RBAC bug: custom roles with groups/members/update permit direct membership changes on dynamic groups (Feb 2025).

**Solution**: Known bug (Bug 3166715, fix in progress). Review custom roles. Monitor audit logs for unauthorized dynamic group membership changes.

---

## Phase 3: Rbac
> 6 related entries

### Customer needs to grant full database access across multiple database types (SQL Database + DBForMySQL) within a specific resource group. No single...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Built-in RBAC roles are database-type-specific (e.g. SQL DB Contributor only covers Microsoft.Sql/*). There is no built-in role that covers both Microsoft.Sql/* and Microsoft.DBforMySQL/* simultaneously.

**Solution**: Create a custom RBAC role combining operations: Microsoft.Sql/*, Microsoft.DBforMySQL/*, plus common ops (Authorization/*/read, Insights/alertRules/*, Insights/metrics/read, ResourceHealth/*, Resources/deployments/*, Support/*). Set assignableScopes at subscription level for reuse. Assign at resource group scope.

---

### az role assignment create fails with 403 Forbidden when logged in as Service Principal; debug shows 403 on graph.chinacloudapi.cn getObjectsByObjec...
**Score**: 🟢 9.0 | **Source**: OneNote

**Root Cause**: Azure CLI role assignment command first queries AAD Graph to resolve the assignee identity. The SP lacks permission to read AAD user/SP information

**Solution**: Assign Directory readers role (or other role with AAD read permission) to the Service Principal, then retry

---

### Deployment of Gateway Manager Service resources (VPN, Application Gateway, ExpressRoute, Firewall, Route Server, vWAN, Managed NVA) fails after Jan...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: P0 SFI issue: Link Access Check enforcement now verifies ALL permissions for Gateway Manager Service resources. Previously, it did not verify join/action permissions on referenced resources (e.g., public IP address). Custom roles missing join permissions or built-in roles not scoped to referenced resources now fail. Phased enforcement: Phase 1 Jan 21-Feb 4, Phase 2 Feb 5-19, Phase 3 Feb 19-Mar 5 2025.

**Solution**: For custom RBAC roles: add missing join/action permissions per product tables (aka.ms/AzNetCustomRoles, aka.ms/VNGWRoles, aka.ms/AppGwRoles, aka.ms/AzFWRoles, aka.ms/ARSRoles, aka.ms/VWANRoles, aka.ms/ERRoles, aka.ms/NVARoles). For built-in roles: ensure scope covers both the deploying resource AND referenced resources (e.g., Contributor role must be scoped to resource groups of both the Route Server and the Public IP address).

---

### Subscription role assignment limit exceeded: user gets error RoleAssignmentLimitExceeded when trying to assign RBAC role at subscription level.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure subscriptions have an architectural limit of 4000 role assignments. When this limit is reached, no more role assignments can be created.

**Solution**: Check current role assignment count via Portal (Access Control IAM > Role assignments > load count). If count is 4000, customer must remove unused role assignments. If count is less than 4000, check Kusto logs in AADPAS cluster and open ICM to Policy Administration Service PG if needed. Consider adopting ABAC conditions to reduce direct role assignments.

---

### Customer sees 'Access to Azure Active Directory' subscription in Azure Portal subscription blade with errors: 'Unknown' role, 'Unauthorized', 'Unab...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Legacy 'Access to Azure Active Directory' subscriptions are deprecated dummy subscriptions created for the classic Azure portal (manage.windowsazure.com) when AAD admins did not have an Azure resource subscription. No longer needed since portal.azure.com separates AAD RBAC and Azure Resource RBAC.

**Solution**: These subscriptions do NOT host Azure AD and are safe to delete. However, they can only be deleted via support ticket with Azure Subscriptions support teams and PayOps engineering. Note: deprecation announced April 2024, existing subscriptions will be disabled and deleted. SAP: Azure > Subscription management > Transfer ownership of my subscription.

---

### All Azure RBAC role assignments are lost after an Azure subscription is transferred between Microsoft Entra ID tenants (via Transfer billing owners...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Any operation that causes an Azure subscription to be transferred between Entra ID tenants deletes ALL RBAC role assignments. Only the user who performed the transfer retains RBAC access. This is by design and documented in Microsoft docs.

**Solution**: After transfer, the user who performed the transfer must re-assign RBAC permissions using principals in the destination tenant. Use ARM Kusto queries (armprodgbl.eastus.kusto.windows.net/ARMProd) to investigate: 1) Query Microsoft.Authorization/roleAssignments to find when assignments were deleted, 2) Query before/after the transfer timeframe to identify the user who initiated it. For RBAC restoration questions, redirect to ASMS: Azure > Subscription management > Transfer ownership.

---

## Phase 4: App Owner
> 5 related entries

### Non-admin users who are Application Owners cannot access or manage their owned apps in the Azure AD portal. They receive access denied errors despi...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 'Restrict access to Azure AD administration portal' setting under Users > User settings > Administration portal is set to Yes, which blocks all non-admin users from the portal, including legitimate App Owners.

**Solution**: Set 'Restrict access to Azure AD administration portal' to No, or assign the affected user to the Directory Readers role. Directory Readers grants portal access without additional permissions beyond the default user role. PG is aware but no ETA for a permanent fix (pending customizable default user permissions).

---

### Non-admin App Owners cannot access or manage their owned apps in Entra portal despite being assigned as owners.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Restrict access to Azure AD administration portal is set to Yes, blocking all non-admin users including App Owners.

**Solution**: Set Restrict access to Azure AD administration portal to No, or assign user to Directory Readers role. PG aware but no ETA for permanent fix.

---

### Non-admin App Owners cannot manage or modify the apps they own in the Entra ID / Azure AD administration portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 'Restrict access to Azure AD administration portal' user setting is set to Yes, which blocks all non-admin users from portal access regardless of their app ownership

**Solution**: Set 'Restrict access to Azure AD administration portal' (Azure AD > Users > User settings > Administration portal) to No, OR assign the app owner to the Directory Readers role to grant portal access without additional permissions. Note: PG is aware; fix planned when AAD supports customizing default user permissions.

---

### Non-admin application owners cannot manage their registered applications in the Azure AD portal even though they are listed as app owners
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 'Restrict access to Azure AD administration portal' setting is configured to 'Yes' under Azure AD → Users → User settings → Administration portal. This setting blocks all non-admin users from accessing the portal, including app owners.

**Solution**: Set 'Restrict access to Azure AD administration portal' to 'No', or assign the user to the Directory Readers role. This gives portal access without granting additional permissions beyond the default user role. Note: Known issue — PG is aware; permanent fix planned when AAD supports customizing default user permissions (no ETA).

---

### Non-admin App Owners cannot access or manage their own app registrations or enterprise applications through the Azure AD portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The 'Restrict access to Azure AD administration portal' setting is set to 'Yes' in Azure AD > Users > User Settings > Administration portal. This blocks all non-admin users from the portal, including users who are owners of specific applications. The product group is aware but POR is to address it after default user permissions customization support is added (no ETA).

**Solution**: Option 1: Set 'Restrict access to Azure AD administration portal' to 'No' to allow all users portal access. Option 2: Assign the affected user to the Directory Readers role, which grants portal access without additional permissions beyond the default user role. Note: app owners must still use PowerShell (New-MgServicePrincipalOwnerByRef / New-MgApplicationOwnerByRef) for owner assignments.

---

## Phase 5: Pim
> 5 related entries

### PIM Activate button is greyed out when trying to activate eligible Azure RBAC role assignment in Azure portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User already has an active/direct role assignment for the same role, or has a pending scheduled activation request that blocks new activation

**Solution**: Check for existing active assignments (banner shows 'role assignment exists'). For pending scheduled activations: My Roles > click pending requests notification > Cancel the pending request > then activate immediately. If no existing assignments found, check ApiRole WebRole logs for service-side API returns.

---

### Azure Lighthouse deployment with eligible authorizations fails with Governance API error: The tenant has not onboarded to PIM.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The managing tenant has not performed initial PIM resource discovery for the target subscription prior to deploying Lighthouse with eligible authorizations.

**Solution**: Go to Privileged Identity Management > Azure resources > Discover resources, then select Manage resources for the unmanaged subscription. If deployment already failed, delete the failed assignments and deployment, then redeploy.

---

### Azure Lighthouse deployment fails with InvalidRegistrationDefinitionCreateRequest: eligible authorizations with same roleDefinitionId must use same...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Multiple eligibleAuthorizations entries with the same roleDefinitionId have different multiFactorAuthProvider, maximumActivationDuration, or managedByTenantApprovers settings.

**Solution**: Ensure all eligibleAuthorizations entries sharing the same roleDefinitionId use identical justInTimeAccessPolicy settings (multiFactorAuthProvider, maximumActivationDuration, managedByTenantApprovers). Different settings are only allowed across different roleDefinitionIds.

---

### Unable to programmatically change directly assigned role members from Permanently assigned to time-bound or convert to Just In Time members using A...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: AzureRM PowerShell cmdlets are not PIM for Azure Resources aware.

**Solution**: Use the PIM for Azure Resources blade in portal to manually convert role memberships. No PowerShell cmdlet support for this operation.

---

### MSP tenant users activate Azure Lighthouse eligible role but do not see activated role in PIM My Roles blade.
**Score**: 🔵 7.5 | **Source**: ADO Wiki

**Root Cause**: Known bug (Bug 7570951) affecting eligible role assignments from resource group-level Lighthouse deployments.

**Solution**: For resource group deployments, navigate to Azure resources > select resource > Active assignments tab. Subscription-level deployments work correctly in My Roles blade.

---

## Phase 6: Dynamic Group
> 5 related entries

### Cannot create a dynamic group - option not visible in Azure portal or PowerShell returns error
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tenant does not have Azure AD P1/P2 Premium license, or the user creating the group lacks the required admin permissions (Global Administrator or User Administrator role)

**Solution**: 1. Verify tenant has Azure AD P1/P2 Premium license. 2. Ensure the user has Global Administrator or User Administrator role. 3. Check group creation permissions under All groups > General (Settings).

---

### Cannot find the attribute to create a dynamic group membership rule - attribute not available in rule builder dropdown
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The attribute is not in the list of supported user/device properties for dynamic group rules, or the customer is using device attribute in user context

**Solution**: 1. Check supported user properties list. 2. Check device attributes list separately. 3. If not in Simple Rule dropdown, use Advanced Rule with correct object prefix (user.country, device.deviceOSType). 4. For custom attributes, use Extension Attributes queryable via PowerShell.

---

### Dynamic group membership processing is very slow, impacting other dynamic groups in the tenant
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Dynamic group rule uses the contains or match operator, which is not indexed by Mezzo (internal service for dynamic group processing)

**Solution**: Replace contains/match operator with startsWith in the dynamic group rule. The contains operator has been removed from the Entra Admin Center rule builder UX. Advise customer to migrate existing rules to startsWith for better performance.

---

### Error 'Get max groups allowed' when creating a Dynamic group in PowerShell
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tenant has reached the maximum limit of 15,000 dynamic groups

**Solution**: Delete existing unused dynamic groups. The 15,000 dynamic group limit per tenant cannot be increased. Check current count and remove unnecessary groups.

---

### Restored a deleted dynamic group but the group shows no members / no membership update
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: When a dynamic group is deleted and restored, it is treated as a new group and must be re-populated. Re-population can take up to 24 hours.

**Solution**: Wait up to 24 hours for the dynamic group membership to be re-populated after restoration. The group will be re-evaluated against its membership rule as if newly created.

---

## Phase 7: Custom Role
> 3 related entries

### Custom RBAC roles not listed under Enterprise Apps > <application> > Roles and administrators blade in Entra portal
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: By design, only custom roles containing permission prefixes 'microsoft.aad.directory/applications', 'microsoft.aad.directory/applicationPolicies', or 'microsoft.aad.directory/servicePrincipals' appear under Enterprise Applications.

**Solution**: Ensure the custom role definition includes at least one permission with the required prefixes: microsoft.aad.directory/applications, microsoft.aad.directory/applicationPolicies, or microsoft.aad.directory/servicePrincipals. Roles without these prefixes will not appear under the Enterprise Apps blade.

---

### Custom role members cannot access Microsoft Entra ID administration portal despite having valid role assignment
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tenant setting 'Restrict access to Microsoft Entra ID administration portal' is set to 'Yes', which blocks custom role members from portal access.

**Solution**: Change 'Restrict access to Microsoft Entra ID administration portal' to 'No'. Note: this is a by-design limitation — custom role members are subject to this tenant-wide restriction regardless of their assigned permissions.

---

### Custom RBAC role permission denied errors not appearing in Microsoft Entra ID Audit logs
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Microsoft Entra ID only records failure audit events when an actual directory backend update is attempted and fails. If the principal lacks permissions, denial occurs at a higher authorization layer (before backend) and is not logged in Audit logs.

**Solution**: Use Kusto tracing in MSODS (msodsuswest.kusto.windows.net). Query Global('IfxBECAuthorizationManager') with internalCorrelationId, filter tagId='9xy6' for DENIED events, tagId='0azf' for GRANTED. Distinguish RBACv1 (message contains [Task:]) vs RBACv2 (message contains [Action:]). First use GlobalIfxUlsEvents with the resource objectId to find the internalCorrelationId.

---

## Phase 8: Customer Lockbox
> 3 related entries

### User with Azure Customer Lockbox Approver role cannot see or approve subscription-level lockbox requests
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Azure Customer Lockbox Approver role was not active on the account before the lockbox request was created. The role must be established before the Lockbox request is created.

**Solution**: Ensure the Azure Customer Lockbox Approver role is assigned and active (including via PIM) BEFORE lockbox requests are sent. Verify: 1) Customer Lockbox is enabled from Azure Admin Center. 2) The role shows as active on the user account. 3) Check Customer Lockbox activity logs for any activity.

---

### Microsoft engineer Lockbox access request is stuck in pending state with no customer notification, and engineer is blocked from re-requesting access.
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Microsoft engineer submitted the Lockbox access request BEFORE the customer enabled PIM or activated their Owner/GA role. The request is stuck pending with no notification sent to any customer admin. The engineer cannot submit a new request until the original one times out after 4 days.

**Solution**: Wait for the stuck request to time out (4-day automatic timeout). Then: 1) Customer enables PIM and activates proper roles first (GA for tenant, Owner/Lockbox Approver for subscription). 2) Notify Microsoft engineer to submit a new access request only after roles are active.

---

### Customer with inherited Owner role does not receive Customer Lockbox approval email and cannot approve or reject lockbox access requests
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: An inherited owner role is NOT recognized by Customer Lockbox. Only directly assigned Owner, Global Admin, or Azure Customer Lockbox Approver roles are eligible to receive lockbox notifications.

**Solution**: Assign a direct (not inherited) Owner role, Global Admin role, or Azure Customer Lockbox Approver role to the user who needs to approve lockbox requests.

---

## Phase 9: 403
> 3 related entries

### 403 Access Denied when updating sensitive user properties (accountEnabled, mobilePhone, otherMails) via MS Graph, even with User.ReadWrite.All or D...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Updating sensitive user properties for users with privileged administrator roles requires a higher privileged admin role. In delegated scenarios, the app also needs Directory.AccessAsUser.All delegated permission. MSODS IfxBECAuthorizationManager logs show the specific task (e.g. SetUserMobileProperty) as DENIED.

**Solution**: Delegated: assign Directory.AccessAsUser.All delegated permission and ensure calling user has a higher privileged admin role per Who can perform sensitive actions doc. App-only: assign a higher privileged administrator role to the service principal. Diagnose with MSODS Global(IfxBECAuthorizationManager) query filtering by internalCorrelationId to identify which task was DENIED.

---

### 403 error when updating onPremisesImmutableId (SourceAnchor) for a user via MS Graph or Update-MgUser
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Updating onPremisesImmutableId is classified as a sensitive action. For cloud-only users, an appropriate admin role is required per the sensitive actions matrix. For synced users, only Global Administrator can perform the UpdateSourceAnchorOnDirSyncUser task.

**Solution**: Cloud-only users: ensure calling principal has appropriate admin role (Auth Admin/User Admin/Privileged Auth Admin/Global Admin depending on target user role). Use User.ReadWrite.All for app-only flow. Synced users: must use Global Administrator. When using Update-MgUser, pass scope Directory.AccessAsUser.All to use UserIdentity flow.

---

### Failed to update user attributes (accountEnabled, mobilePhone, otherMails) with 403 Forbidden, even though the calling principal has User.ReadWrite...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Updating sensitive user properties for users with privileged administrator roles requires elevated permissions: delegated scenarios need Directory.AccessAsUser.All + higher privileged admin role; app-only scenarios need the app assigned a higher privileged admin role per Who can perform sensitive actions doc

**Solution**: For delegated flow: assign Directory.AccessAsUser.All delegated permission and ensure the calling user has a higher privileged administrator role. For app-only flow: assign the app a higher privileged administrator role. Check MSODS IfxBECAuthorizationManager logs using internalCorrelationId to see which task was DENIED.

---

## Phase 10: Management Groups
> 3 related entries

### User with inherited RBAC role via Management Groups gets 'Not Authorized' error when creating resources on subscriptions, despite having inherited ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Resource providers calling older versions of the Permissions and RoleAssignments APIs do not support inherited Management Group RBAC membership. The inherited permissions are present (user sees subscription) but the RP fails when using older APIs to authorize the action.

**Solution**: Create direct RBAC role assignments at the subscription level as workaround. PG has released new Permissions API and RoleAssignments API to address inherited permissions. However, resource providers are on various API versions and not forced to update immediately.

---

### Tenant Admin fails to add a subscription to a Management Group with error: 'Owner level access is required on the subscription or its ancestors'. P...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Tenant Admin (Global Admin) is not the same as being assigned to the Owner RBAC role in Access Control (IAM). The MY ROLE display shows Owner but this is the tenant-level admin role, not the Azure RBAC Owner role required for Management Group operations.

**Solution**: Set 'Global admin can manage Azure Subscription' (Elevate Access) to YES in Entra ID Properties. Once elevated, the Tenant Admin gains User Access Administrator at root scope and can then assign themselves the Owner RBAC role at the subscription level via PowerShell or Portal.

---

### Management Group role assignment for a custom role with dataActions fails. Roles containing DataActions or NonDataActions cannot be assigned at the...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure Management Groups do not support role assignments that include dataActions in their role definition. This is an architectural limitation of the Management Group scope.

**Solution**: Create the role assignment at the subscription scope instead of the Management Group scope. DataActions-based roles (e.g., Storage Blob Data Contributor, VM User Login) can only be assigned at subscription, resource group, or resource scope.

---

## Phase 11: Conditional Access
> 3 related entries

### Admin gets Insufficient privileges to permanently delete/create/update error when performing an action protected by Authentication Context in CA
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The action is protected by an Authentication Context but no CA policy includes that Authentication Context, or the CA policy was added after user signed in so token lacks the required ACRS claim

**Solution**: Ensure a CA policy exists that includes the Authentication Context protecting the action. If the CA policy was recently added, have the user sign out and sign back in to get a new token with the ACRS claim

---

### Conditional Access policy with Dynamic Targeting (app filter) is read-only in the Azure portal for Global Administrators and Conditional Access Adm...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Dynamic targeting (attribute-based cloud app targeting) requires membership in Attribute Definition Administrator or Attribute Definition Reader role in addition to GA/CA Admin role. Graph API PATCH calls from GA without these roles may still succeed, creating inconsistency with portal behavior.

**Solution**: Assign the Attribute Definition Administrator or Attribute Definition Reader role to the administrator in addition to their existing Global Administrator or Conditional Access Administrator role.

---

### Users with only Attribute Definition Administrator or Reader roles cannot access the Security blade in Azure AD portal and cannot configure Dynamic...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Attribute definition roles alone do not grant access to the Security blade. Access requires Conditional Access Administrator or equivalent role.

**Solution**: Assign both roles: Conditional Access Administrator (for Security blade access) AND Attribute Definition Administrator/Reader (for dynamic targeting rule management).

---

## Phase 12: Rmau
> 3 related entries

### Tenant-level administrator (e.g., User Administrator) finds Edit/management actions disabled on specific users, groups, or devices but not others; ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The target resource is a member of a Restricted Management Administrative Unit (RMAU). Tenant-level admin roles do not inherit permissions to manage resources in an RMAU

**Solution**: Check the resource's Administrative Units blade for 'Restricted Management' = Yes. Assign the admin to the relevant role scoped to the RMAU, or assign a role scoped directly to the specific resource object

---

### Group owner is unable to manage a security group; group has isManagementRestricted = true
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Once a group becomes a member of an RMAU, group owners lose management rights. Only Group Administrators with a role scoped to the RMAU can manage the group

**Solution**: Assign Group Administrator role scoped to the RMAU that the group belongs to, or assign the group owner to Group Administrator with a scope directly on the group object

---

### Tenant admin receives error: 'Insufficient privileges to complete the operation. Target object is a member of a restricted management administrativ...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Resources in a Restricted Management AU can only be managed by admins whose role is scoped to that specific RMAU. Tenant-level admin roles are explicitly blocked

**Solution**: Add the admin to the relevant role scoped to the RMAU. Global Admins can add themselves to the scoped role to perform the task. For non-GA admins, a scoped role administrator must perform the action

---

## Phase 13: Classic Admin
> 3 related entries

### Removing Service Administrator fails with error: Cannot delete user <principalId> since they are not the service administrator - when the Service A...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: The Service Administrator user account no longer exists in the directory, so the system cannot match the PUID to remove the role assignment

**Solution**: Try changing the Service Administrator to an existing user first, then remove. If the option to update is greyed out: (1) Collect Subscription Id, PUID from error, and user performing action, (2) Contact TA/PTA to confirm via Jarvis, (3) File IcM to Owning Service: Azure Commercial Experiences, Signup and Provisioning / Owning Team: Tier2 - Subscription Lifecycle

---

### Customer lost access to Azure subscription after Azure classic administrator roles (Co-Administrator/Service Administrator) were retired or removed
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Classic administrator roles (Co-Admin, Service Admin) were retired as of August 31, 2024. Users relying solely on these roles lost subscription access without equivalent Azure RBAC assignments

**Solution**: Global Administrator can use the elevation process (https://learn.microsoft.com/en-us/azure/role-based-access-control/elevate-access-global-admin) to regain access to subscriptions and management groups. Then assign appropriate Azure RBAC roles (Owner at subscription scope is equivalent)

---

### Starting December 2025 Azure automatically assigned Owner role to users still assigned Co-Administrator or Service Administrator but the classic ad...
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: Azure backfill process converts classic admin to Owner RBAC role but does not auto-remove the classic administrator assignment. Conversion creates role assignments with createdBy: 0469d4cd-df37-4d93-8a61-f8c75b809164

**Solution**: Manually remove the classic administrator role assignment after confirming the Owner RBAC role is in place. Follow steps at https://learn.microsoft.com/en-us/azure/role-based-access-control/classic-administrators to remove Co-Administrator

---

## Phase 14: M365 Admin Center
> 3 related entries

### Admin cannot see or access group themes in M365 Admin Center. Theme customization options are not visible.
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Only Global Administrators can customize company themes. Global Readers have read-only access. Group themes require Microsoft 365 Groups (not security or distribution groups).

**Solution**: Verify the user has the Global Administrator role. Global Readers can view but not modify themes. Group themes must be mapped to Microsoft 365 Groups. Maximum 5 themes (1 default + 4 group). Users assigned to multiple group themes see the default theme. To delete the default theme, delete all group themes first.

---

### Customer unable to view or configure Release Preferences options in M365 Admin Center (Settings > Org Settings > Organization profile > Release pre...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: User does not have Global Administrator role assigned, or browser session issue preventing the page from loading correctly.

**Solution**: 1. Reproduce in InPrivate/Incognito window. 2. Verify the user has Global Administrator role. 3. If issue persists, collect HAR trace and Steps Recorder (PSR). 4. Escalate via ICM using template [ID] [M365] [MAC] - Organization Settings. Note: changes take up to 24 hours to take effect. Opting out of Targeted Release may cause users to lose access to features not yet in Standard release.

---

### Users not receiving organizational messages in Office apps (Teams, Outlook, Word, Excel, PowerPoint) despite admin having created and sent the mess...
**Score**: 🔵 5.5 | **Source**: ADO Wiki

**Root Cause**: Privacy settings are not enabled with Microsoft account on the user Office apps, preventing organizational messages from being pulled by the Office client in the background.

**Solution**: On user Office app: File > Account > Account Privacy > Manage Settings and ensure privacy settings enabled. For new Outlook: View > View Settings > General > Privacy and data > Privacy Settings. Verify admin has Global Administrator or Organizational message writer role. Feature is in preview. For escalation use ICM template [ID] [M365] [MAC] - Customer Insights and Analysis, then move to Iris/IDEAs Commercial Personalization.

---

## Phase 15: Vm Extension
> 2 related entries

### RDP to Azure VM fails with 'Your account is configured to prevent you from using this device' after AADLoginForWindows deployment
**Score**: 🟢 8.5 | **Source**: ADO Wiki

**Root Cause**: User not assigned VM Administrator Login or VM User Login RBAC role. Owner/Contributor do NOT grant VM login

**Solution**: Assign Virtual Machine Administrator Login or Virtual Machine User Login at resource group level. Manual local admin addition NOT supported

---

### Azure AD Sign-in for Linux VMs using old AADLoginForLinux VM Extension (device code flow for SSH) is deprecated and may fail
**Score**: 🔵 6.5 | **Source**: ADO Wiki

**Root Cause**: Old AADLoginForLinux VM Extension uses deprecated device code flow design. Has been replaced by AADSSHLoginForLinux extension.

**Solution**: Uninstall old AADLoginForLinux VM Extension → Enable System Assigned managed identity on VM/VMSS → Install new AADSSHLoginForLinux VM Extension. Assign RBAC roles: Virtual Machine Administrator Login or Virtual Machine User Login.

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | After AKS upgrade VMAS to VMSS, LB probes fail, traffic down. LB rules rewrit... | UMI for AKS had no RBAC on VNet/PublicIP/LB. Cloud-contro... | Assign Network Contributor to UMI on both Node RG and mas... | 🟢 9.0 | OneNote |
| 2 | MSIX app attach fails on AVD session hosts joined to AADDS. Adding MSIX image... | MSIX app attach does not support AADDS. AADDS computer ob... | Use on-prem AD DS instead of AADDS for MSIX app attach. | 🟢 9.0 | OneNote |
| 3 | Customer needs to grant full database access across multiple database types (... | Built-in RBAC roles are database-type-specific (e.g. SQL ... | Create a custom RBAC role combining operations: Microsoft... | 🟢 9.0 | OneNote |
| 4 | az role assignment create fails with 403 Forbidden when logged in as Service ... | Azure CLI role assignment command first queries AAD Graph... | Assign Directory readers role (or other role with AAD rea... | 🟢 9.0 | OneNote |
| 5 | User cannot add an enterprise application in AAD portal. Error from AAD Graph... | The user account does not have the required directory rol... | Assign the appropriate directory role (Global Admin, Appl... | 🟢 9.0 | OneNote |
| 6 | Need to allow a specific user to grant admin consent only for a specific app ... | By default, granting admin consent requires at least Clou... | Create custom app consent policy: 1) New-MgPolicyPermissi... | 🟢 9.0 | OneNote |
| 7 | Cannot access Azure AD Support Wiki, permission denied | User not member of Azure AD Wiki Entitlement group | Request Reader role at coreidentity entitlement URL (auto... | 🟢 9.0 | OneNote |
| 8 | SSH connection to Azure Linux VM closed immediately: Connection closed by x.x... | RC1: User not assigned Virtual Machine Administrator/User... | RC1: Assign user to VM Administrator/User Login RBAC role... | 🟢 8.5 | ADO Wiki |
| 9 | RDP to Azure VM fails with 'Your account is configured to prevent you from us... | User not assigned VM Administrator Login or VM User Login... | Assign Virtual Machine Administrator Login or Virtual Mac... | 🟢 8.5 | ADO Wiki |
| 10 | Run as Different User fails with username or password is incorrect on AVD AAD... | Run-as-different-user triggers non-interactive auth for r... | 1. Assign RBAC roles VM User Login or VM Administrator Lo... | 🟢 8.5 | ADO Wiki |
| 11 | Non-admin users who are Application Owners cannot access or manage their owne... | The 'Restrict access to Azure AD administration portal' s... | Set 'Restrict access to Azure AD administration portal' t... | 🟢 8.5 | ADO Wiki |
| 12 | Non-admin App Owners cannot access or manage their owned apps in Entra portal... | Restrict access to Azure AD administration portal is set ... | Set Restrict access to Azure AD administration portal to ... | 🟢 8.5 | ADO Wiki |
| 13 | Custom RBAC roles not listed under Enterprise Apps > <application> > Roles an... | By design, only custom roles containing permission prefix... | Ensure the custom role definition includes at least one p... | 🟢 8.5 | ADO Wiki |
| 14 | Custom role members cannot access Microsoft Entra ID administration portal de... | Tenant setting 'Restrict access to Microsoft Entra ID adm... | Change 'Restrict access to Microsoft Entra ID administrat... | 🟢 8.5 | ADO Wiki |
| 15 | Custom RBAC role permission denied errors not appearing in Microsoft Entra ID... | Microsoft Entra ID only records failure audit events when... | Use Kusto tracing in MSODS (msodsuswest.kusto.windows.net... | 🟢 8.5 | ADO Wiki |
| 16 | Privileged admin roles (Helpdesk Admin, Authentication Admin) cannot perform ... | By design security hardening: members of role-assignable ... | Use Global Administrator role to perform the action. This... | 🟢 8.5 | ADO Wiki |
| 17 | Privileged admin roles (Helpdesk/Auth Admin) cannot reset password or revoke ... | By design: members of role-assignable groups are protecte... | Use Global Administrator. By design per MS Learn sensitiv... | 🟢 8.5 | ADO Wiki |
| 18 | Privileged admin (Helpdesk Admin) cannot reset password or revoke tokens for ... | By design: members of role-assignable groups are protecte... | Use Global Admin. See docs: Who can perform sensitive act... | 🟢 8.5 | ADO Wiki |
| 19 | Sensitivity labels cannot be changed after applied to Entra Security Group - ... | Known limitation: label change on Security Groups not yet... | Recreate group with desired label. Also: labels cannot be... | 🟢 8.5 | ADO Wiki |
| 20 | Groups removed from expiration policy still have expirationDate populated | Bug: removing policy does not clear residual expirationDa... | Group will NOT be deleted. To clear: re-add to policy, wa... | 🟢 8.5 | ADO Wiki |
| 21 | Groups not deleted after expiry - expiration notification emails missed | Intermittent: some 30d/15d/1d notifications not sent; wit... | Groups safe from accidental deletion. Extended groups can... | 🟢 8.5 | ADO Wiki |
| 22 | Removing sensitivity label from group does not revert AllowToAddGuests - gues... | By design: Groups team does not maintain pre-label state ... | Manually set AllowToAddGuests=True via PowerShell per MS ... | 🟢 8.5 | ADO Wiki |
| 23 | Script to enable/disable M365 group creation sometimes fails - GroupCreationA... | Script cannot resolve group ObjectId from group name in s... | Paste commands directly in PowerShell using group ObjectI... | 🟢 8.5 | ADO Wiki |
| 24 | Security Groups can incorrectly get expirationDate set enabling deletion by e... | Bug: expirationDate can be set on security groups (delete... | Critical risk. Bug 3331094. | 🟢 8.5 | ADO Wiki |
| 25 | Azure AD group with a leading space in the displayName (e.g. ' GroupName') ca... | Known bug: Azure AD portal and PowerShell both allow a sp... | This is a known PG issue to be documented publicly. Advis... | 🟢 8.5 | ADO Wiki |
| 26 | Customers see two unrecognized SIDs (S-1-12-1-2519061733-1113399595-355673386... | These SIDs are automatically added during Azure AD device... | Expected behavior by design. To confirm: run the script a... | 🟢 8.5 | ADO Wiki |
| 27 | Non-admin App Owners cannot manage or modify the apps they own in the Entra I... | The 'Restrict access to Azure AD administration portal' u... | Set 'Restrict access to Azure AD administration portal' (... | 🟢 8.5 | ADO Wiki |
| 28 | Non-admin application owners cannot manage their registered applications in t... | The 'Restrict access to Azure AD administration portal' s... | Set 'Restrict access to Azure AD administration portal' t... | 🟢 8.5 | ADO Wiki |
| 29 | Non-admin App Owner cannot manage their owned apps in Azure AD portal even af... | The 'Restrict access to Azure AD administration portal' s... | Set 'Restrict access to Azure AD administration portal' t... | 🟢 8.5 | ADO Wiki |
| 30 | Group transform claim (TraceCode 25729) omitted from token: 'Overage limit ha... | User has 1000+ group memberships. When group transform is... | Group filtering may not help when user has 1000+ groups. ... | 🟢 8.5 | ADO Wiki |
