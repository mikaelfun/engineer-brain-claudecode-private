# INTUNE 许可证与租户 — 已知问题详情

**条目数**: 47 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Admin with custom Intune RBAC role cannot edit or create compliance discovery scripts; operations fail with permission error
**Solution**: Assign required permissions in custom role: Edit existing script = PATCH, Create new script = POST, Edit script used by deployed compliance policy = requires scope group coverage. Ensure device scope group of role assignment covers compliance policy assignment scope per MS docs.
`[Source: onenote, Score: 9.5]`

### Step 2: iOS 应用 Intune SDK enrollment 成功但未收到 App Protection Policy
**Solution**: 1. 确认用户在 APP 策略的目标安全组中；2. 确认 App Bundle ID 已添加到 APP 策略的应用列表；3. 确认用户已分配 Intune 许可证；4. 确保使用 msalResult.tenantProfile.identifier 作为 accountId；5. 检查 enrollmentRequestWithStatus delegate 的 statusCode
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Admin loses permissions after enabling 'Scoped Permissions' in Intune RBAC Settings — previously available actions now show access denied
**Solution**: 1) Review permissions assessment report (Tenant Admin > Roles > Settings) before enabling 2) This is intended to be permanent 3) If high business impact, escalate to CxE requesting removal of 'EnablePerPermissionScopeTags' flighting tag 4) Use Kusto IntuneEvent with TagOperation + 'EnablePerPermissionScopeTags' to find who/when enabled it
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Error AADSTS5000224 when authenticating to test tenant: 'We are sorry, this resource is not available. If you are seeing this message by mistake, p...
**Solution**: Go to https://aka.ms/tenantreauthentication, enter the Entra tenant ID, add a short description, attach a director-level (M2+ with 'Director' in GAL title) FTE approval screenshot, select prod environment and sev 4, select the correct cloud instance. Submit ICM to request restoration. Act within a couple of days of deprovisioning for best chance of recovery. Fairfax requires CVP-level approval.
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Sign-in errors 'Insufficient or lack of permissions is causing access restriction' when trying to access Intune or Azure portals in an MCAPS test t...
**Solution**: Sign into the Microsoft 365 admin portal (admin.microsoft.com) with the tenant GA account and verify that licenses have not been disabled. To extend expiring licenses, open a ticket at https://aka.ms/mcapssupport with Category=Azure, Sub-Category=Licensing, Topics='License Extension (User Tenant)', and provide your Subscription ID and Tenant ID from the Managed Environments portal. Extension may take up to one week.
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Save application failed. You don't have enough permissions to update this application error when updating an app in Intune with a custom role
**Solution**: Add the application's targeted groups to Scope (Groups) in the custom role assignment.
`[Source: mslearn, Score: 8.0]`

### Step 7: Customer states they have an Intune license with MDOP associated with it but cannot get to the old download site or do not know the site.
**Solution**: [Verification]

1. Open the
Portal.Office.com Admin Portal

2. Select Billing \
Subscriptions

&nbsp;

� Note if you do not
show a subscription labeled &quot;Microsoft Intune With Microsoft Desktop
Operating System&quot; you do not have Software Assurance aka MDOP.

� Should look like
this:



&nbsp;

[Downloading]

Action Steps&nbsp; - Downloading ISOs

Assure the tenant
you are attempting to download ISOs from has the &quot;Microsoft Intune with
Microsoft Desktop Operating System&quot; subscri
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: When attempting to assign the Intune for Education license to an UPN, you receive an error &quot;License not assigned: License assignment failed fo...
**Solution**: Action plan===============================1. Open the Azure Portal (New not classic)2. Navigate to Azure Active Directory-&gt;Users and Groups-&gt;All Users-&gt;USERUPN-&gt;Licenses3. Click Assign-&gt;Products4. Select Intune for Education and click Select5. Select Assignment options, turn off Azure Active Directory for Education by setting the toggle to OFF6. Click OK and then AssignYou can also repro, this by doing the following if you wish to see it, please note your tenant must be flagged fo
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Admin with custom Intune RBAC role cannot edit or create compliance discovery... | Custom RBAC role missing required permissions. Edit script needs PATCH permis... | Assign required permissions in custom role: Edit existing script = PATCH, Cre... | 9.5 | onenote |
| 2 | iOS 应用 Intune SDK enrollment 成功但未收到 App Protection Policy | 用户不在 APP 策略目标组中；App Bundle ID 未添加到策略；用户无 Intune 许可证；使用了错误的 account ID（应使用 ten... | 1. 确认用户在 APP 策略的目标安全组中；2. 确认 App Bundle ID 已添加到 APP 策略的应用列表；3. 确认用户已分配 Intune... | 9.0 | ado-wiki |
| 3 | Admin loses permissions after enabling 'Scoped Permissions' in Intune RBAC Se... | Enabling scoped permissions stops Intune from silently merging permissions ac... | 1) Review permissions assessment report (Tenant Admin > Roles > Settings) bef... | 9.0 | ado-wiki |
| 4 | Error AADSTS5000224 when authenticating to test tenant: 'We are sorry, this r... | Test tenant was deprovisioned by MCAPS, typically due to policy violation, ex... | Go to https://aka.ms/tenantreauthentication, enter the Entra tenant ID, add a... | 9.0 | ado-wiki |
| 5 | Sign-in errors 'Insufficient or lack of permissions is causing access restric... | Licenses in the MCAPS test tenant have expired (1-year lifespan) and been dis... | Sign into the Microsoft 365 admin portal (admin.microsoft.com) with the tenan... | 9.0 | ado-wiki |
| 6 | Save application failed. You don't have enough permissions to update this app... | The application's targeted groups are not included in Scope (Groups) of the c... | Add the application's targeted groups to Scope (Groups) in the custom role as... | 8.0 | mslearn |
| 7 | Customer states they have an Intune license with MDOP associated with it but ... | In 2015 there was a change to the process and the old site was retired, the M... | [Verification]  1. Open the Portal.Office.com Admin Portal  2. Select Billing... | 7.5 | contentidea-kb |
| 8 | When attempting to assign the Intune for Education license to an UPN, you rec... | This is due to a known issue that is being worked on, where the&nbsp;stacking... | Action plan===============================1. Open the Azure Portal (New not c... | 7.5 | contentidea-kb |
| 9 | Tenant Monkey is an internal-only, online tool that CSS Support Engineers can... |  |  | 7.5 | contentidea-kb |
| 10 | If a WIHOT does not already exist, then this error below may qualify for an a... |  |  | 7.5 | contentidea-kb |
| 11 | &nbsp;Is there a way to have applications install automatically on enrolled H... |  |  | 7.5 | contentidea-kb |
| 12 | The information below describes the steps to take when a customer is requesti... | It is not possible to reset the MDM authority when switching between O365 and... | Co-Existence&nbsp;is the supported method for changing between Office 365 and... | 7.5 | contentidea-kb |
| 13 | Remote Tasks performed by Helpdesk Operators in Intune fail with the error:In... | The scope of permissions for the Helpdesk operator role is applied to Dynamic... | The scope of permissions for RBAC permissions and the Helpdesk Operator Role ... | 7.5 | contentidea-kb |
| 14 | Microsoft Intune can be used either as a standalone service or in a hybrid mo... |  |  | 7.5 | contentidea-kb |
| 15 | When trying to setup the Intune on premise Exchange Connector you receive the... | This error can be cause by user account that is being used to sign into Intun... | To resolve the issue make sure the user account has the following: Intune Lic... | 7.5 | contentidea-kb |
| 16 | When a user (UPN) attempts to log into the Azure Intune Portal they get the f... | The tenant is   not completed on the provisioning.   This is due to the   set... | Action plan       Open the Azure        Portal (Azure.portal.com) in Edge    ... | 7.5 | contentidea-kb |
| 17 | Role Based Access Control (RBAC) offers much greater flexibility and control ... |  |  | 7.5 | contentidea-kb |
| 18 | You are unable to enroll or manage manage new devices and you receive the fol... | For MIFO tenants that haven’t been flighted for coexistence yet, there was a ... | Issue resolved with 1904 Intune service release | 7.5 | contentidea-kb |
| 19 | The process documented in this article describes the steps customers should t... |  |  | 7.5 | contentidea-kb |
| 20 | Role-Based Access Control (RBAC) and Scope Tags are two topics that are linke... |  |  | 7.5 | contentidea-kb |
| 21 | When attempting to configure the Intune diagnostics for the first time within... | The Microsoft Insights resource provider was not registered for the Azure sub... | Successfully registered the Microsoft Insights resource provider for the Azur... | 7.5 | contentidea-kb |
| 22 | Users do not appear to be successfully moving from SCCM (hybrid MDM enrolled)... | One of the included collections in the Intune hybrid subscription in SCCM was... | Removed the&nbsp;default (built-in) 'All Users and All Groups' SCCM collectio... | 7.5 | contentidea-kb |
| 23 | Starting with Intune&nbsp;1911, MDM authority for all new Intune tenants will... |  |  | 7.5 | contentidea-kb |
| 24 | If you sign into Intune using an RBAC custom role which has all permissions w... | This can occur if the custom role assignment &quot;Scope (Groups)&quot; setti... | To resolve this issue, change the &quot;Scope (Groups)&quot; setting to &quot... | 7.5 | contentidea-kb |
| 25 | &quot;Access Denied&quot; error is encountered in the Intune portal when atte... | To setup TeamViewer integration, the account must be a Global Admin and have ... | Add an Intune license to the administrator account and provisioned the correc... | 7.5 | contentidea-kb |
| 26 | Within the Endpoint Manager admin center, under tenant administration you may... |  |  | 7.5 | contentidea-kb |
| 27 | Verifying workflow: How would you verify the component works as expected usin... |  |  | 7.5 | contentidea-kb |
| 28 | An AAD guest user account granted an Intune service administrator role is una... | This issue was investigated by the Intune product team and was confirmed to b... | To work around this issue, it is suggested to set up an&nbsp;internal account... | 7.5 | contentidea-kb |
| 29 | The customer is was unable to set up the MDM authority to start using Intune.... | UX logs in Kusto show the &quot;Intune application is disabled for this tenan... | The error means either the tenant has no active Intune licenses or the Micros... | 7.5 | contentidea-kb |
| 30 | In order to configure partner compliance management integration between Micro... |  |  | 7.5 | contentidea-kb |
| 31 | The Intune Troubleshooting + support&nbsp;blade shows a user as Intune licens... | There was a 30-day grace period added to Intune licensing in release 2207.&nb... | This is by design. Rave and the Troubleshooting + support&nbsp;blade are show... | 7.5 | contentidea-kb |
| 32 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER ... |  |  | 7.5 | contentidea-kb |
| 33 | About Assist365 With the migration from RAVE to Dynamics for Microsoft (DfM),... |  |  | 7.5 | contentidea-kb |
| 34 | Global admin (GA) and/or Intune admin are getting permissions errors when try... | Confirm via ASC that signed in user is Intune Admin and/or Global Administrat... | Go to Azure AD in the Azure portal Select &quot;enterprise applications&quot;... | 7.5 | contentidea-kb |
| 35 | Microsoft Intune Suite Add-On to Microsoft Intune officially launched on Marc... |  |  | 7.5 | contentidea-kb |
| 36 | We identified an issue where admins are unable to access the Microsoft Intune... | When the subscription is renewed,&nbsp;it’s&nbsp;possible that the tenant is ... | To resolve this, Intune Support Engineers should escalate the case to the&nbs... | 7.5 | contentidea-kb |
| 37 | The MDM authority shows as “Unknown” in the tenant overview, however the opti... | &nbsp;Please perform the following troubleshooting steps in order to determin... | There are two main scenarios that could cause this issue:&nbsp; The customer ... | 7.5 | contentidea-kb |
| 38 | Several customers in a disconnected or air gapped GCC/GCCH environments want ... | By Design -&nbsp;On the Intune side, the direct WinGet download and Store app... | 1) You use a commercial account to download the MSI/MSIX&nbsp; bundles and th... | 7.5 | contentidea-kb |
| 39 | RBAC Admins with permission for Remote Help are not able to perform Remote He... | Verify pre-reqs :-  Intune portal &gt;Tenant administration &gt;Remote help &... | Scope tag and Scope Member was the issue for this instance hence one of the t... | 7.5 | contentidea-kb |
| 40 | RBAC user is navigating in the Intune portal to a specific device and then cl... | After signing into the Intune portal with GA account I performed an F12 trace... | To fix this issue the customer will need to add the microsoft.directory/devic... | 7.5 | contentidea-kb |
| 41 | This internal knowledge base article outlines the different behaviors observe... |  |  | 7.5 | contentidea-kb |
| 42 | Script Error 'Unable to get property Content of undefined or null reference' ... | Login account has Delegated Administration permissions on multiple subscripti... | Use a Global Administrator account that does not have Delegated Administratio... | 6.5 | mslearn |
| 43 | 403 Forbidden error when querying Intune objects in Graph Explorer under http... | Account used to access Graph Explorer lacks required Intune read/write permis... | In Graph Explorer, click 'modify your permissions' in error message, enable D... | 6.5 | mslearn |
| 44 | Intune Troubleshoot pane displays 'Account status You do not have enough perm... | The Help Desk Operator user is not licensed for Intune | In Intune admin center > Users > All Users, select the affected user > Licens... | 6.5 | mslearn |
| 45 | You are unable to enroll or manage manage new devices and you receive the fol... | For MIFO tenants that haven’t been flighted for coexistence yet, there was a ... | Issue resolved with 1904 Intune service release | 3.0 | contentidea-kb |
| 46 | The process documented in this article describes the steps customers should t... |  |  | 3.0 | contentidea-kb |
| 47 | Role-Based Access Control (RBAC) and Scope Tags are two topics that are linke... |  |  | 3.0 | contentidea-kb |
