# INTUNE Intune 其他/未分类问题 — 已知问题详情

**条目数**: 934 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune portal shows HTTP 503/504 errors; device list export fails, AutoPilot CSV import returns generic 'failed to save' error, device enumeration ...
**Solution**: Collect F12/HAR trace, extract client-request-id and timestamp. Run 3 Kusto queries: (1) HttpSubsystem by ActivityId to get cVBase; (2) IntuneEvent by cV to get exception ActivityId; (3) CMService by ActivityId to confirm timeout. If confirmed, create Assistance Request in Rave/IET.
`[Source: onenote, Score: 9.5]`

### Step 2: Device previously had statically assigned AAD group memberships for Intune policy targeting, but those memberships are suddenly missing. Policies t...
**Solution**: Query IntuneEvent ServiceName=StatefulDeviceService, ComponentName=AADDeviceRecordManagement, EventUniqueName=64213 with the Intune device ID. Check if AAD_DeviceID (Col1) changed between entries - a change confirms delete/re-add. Re-assign the device to the required AAD groups using the new device object ID.
`[Source: onenote, Score: 9.5]`

### Step 3: Need to escalate ICM priority for an Intune incident; unclear what factors justify higher priority
**Solution**: Factors that justify higher ICM priority: (1) Customer has Premier/Unified support package to reach high-level Intune management team, (2) Device impact count >10K, (3) Security impact, (4) Sales or contract renewal impact. Include these factors in the ICM impact description to justify escalation.
`[Source: onenote, Score: 9.5]`

### Step 4: Need to check Intune feature release schedule or submit a customer RCA (Root Cause Analysis) request after an incident
**Solution**: Feature releases: check Intune release announcements at https://supportability.visualstudio.com/M365%20Release%20Announcements/_wiki/wikis/M365-Product-Updates.wiki/255592/Intune. RCA requests: use the Post Incident Review form at https://internal.evergreen.microsoft.com/en-us/topic/4e0dc6e7-2f03-d9fd-5954-517cdab148cd.
`[Source: onenote, Score: 9.5]`

### Step 5: 用户获得新 CAC 卡后无法强制重新导入 derived credentials（设备已有旧 derived credentials）
**Solution**: 1. 重新注册设备以触发 derived credential 重新导入；2. 注意 DoD 客户可能因数据保留要求需要使用新设备
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Customer requests Root Cause Analysis (RCA) for tenant-specific Intune issue
**Solution**: Share best-effort troubleshooting findings with customer to help avoid recurrence (not a formal RCA). For LSI PIRs not received by customer, contact IntuneExtPIR_Review@microsoft.com with the specific LSI details. For Azure service incidents: Azure RCA available on Azure portal or via https://aka.ms/iridias (CSS/TAM/Field). For O365 service incidents: PIR available in O365 portal.
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Engineer bookmarks and links to www.intunewiki.com (original Intune PG Wiki) fail to resolve after February 2026 decommission
**Solution**: Use the Supportability wiki instead: https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1321070/Welcome — as of January 8 2026 all links in this wiki were already updated to point to the Engineering Hub. For engineering-level content, access the Engineering Hub via https://eng.ms/docs/microsoft-security/management/intune/... (requires ReadOnly access via CoreIdentity).
`[Source: ado-wiki, Score: 9.0]`

### Step 8: 'Oops! Page Not Found' (404 error) when trying to open a Cloud Academy training link from the SCIM Readiness Tool search results
**Solution**: Look for the 'Go back to login' link shown below the 404 error text. Click it, log in to Cloud Academy, and the page will auto-redirect to the correct training content.
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune portal shows HTTP 503/504 errors; device list export fails, AutoPilot ... | Back-end service timeout: Intune service has 15,000 ms soft timeout and 30,00... | Collect F12/HAR trace, extract client-request-id and timestamp. Run 3 Kusto q... | 9.5 | onenote |
| 2 | Device previously had statically assigned AAD group memberships for Intune po... | The device was deleted from AAD and then re-registered (re-added), causing th... | Query IntuneEvent ServiceName=StatefulDeviceService, ComponentName=AADDeviceR... | 9.5 | onenote |
| 3 | Need to escalate ICM priority for an Intune incident; unclear what factors ju... | ICM escalation criteria are not well-documented; engineers may not know the t... | Factors that justify higher ICM priority: (1) Customer has Premier/Unified su... | 9.5 | onenote |
| 4 | Need to check Intune feature release schedule or submit a customer RCA (Root ... |  | Feature releases: check Intune release announcements at https://supportabilit... | 9.5 | onenote |
| 5 | 用户获得新 CAC 卡后无法强制重新导入 derived credentials（设备已有旧 derived credentials） | 当前 Intune 不支持在已有 derived credentials 的设备上强制触发重新导入，只有重新注册才能重置 | 1. 重新注册设备以触发 derived credential 重新导入；2. 注意 DoD 客户可能因数据保留要求需要使用新设备 | 9.0 | ado-wiki |
| 6 | Customer requests Root Cause Analysis (RCA) for tenant-specific Intune issue | Intune Engineering Team only provides PIR (Post Incident Report) for Live Sit... | Share best-effort troubleshooting findings with customer to help avoid recurr... | 9.0 | ado-wiki |
| 7 | Engineer bookmarks and links to www.intunewiki.com (original Intune PG Wiki) ... | The original Intune PG Wiki (www.intunewiki.com) was fully decommissioned in ... | Use the Supportability wiki instead: https://supportability.visualstudio.com/... | 9.0 | ado-wiki |
| 8 | 'Oops! Page Not Found' (404 error) when trying to open a Cloud Academy traini... | User is not logged into Cloud Academy. The 404 error is misleading — it is ac... | Look for the 'Go back to login' link shown below the 404 error text. Click it... | 9.0 | ado-wiki |
| 9 | Videos do not play in the Readiness Tool Search Content page — video player s... | User is not authenticated to the SharePoint site (microsoft.sharepoint.com/te... | Option 1: Log into the Intune SharePoint site at https://microsoft.sharepoint... | 9.0 | ado-wiki |
| 10 | Error 0x87D1FDE8 displayed in Intune admin console after deploying Managed Br... | Known issue in Microsoft Intune with Managed Browser policy deployment. The e... | The error resolves automatically after the device checks in again. No action ... | 8.0 | mslearn |
| 11 | EUDB AVD loading screen stuck on 'Welcome' with spinner after launch | User profile issue on the EUDB multi-session AVD | Go to https://mswvd.microsoft.com/sessions → wait for load → click 'delete us... | 7.5 | ado-wiki |
| 12 | Licensed Intune user in AD security group does not sync with Intune groups. U... | Parent group starts with a sub group instead of All Users. | Modify the group so that the parent group is All Users instead of a sub group. | 7.5 | contentidea-kb |
| 13 | Customer has an exemption on how many devices per user that can be enrolled i... | The setting for "Maximum number of devices per user" in Azure IS NOT set to "... | Log into Azure console, under Users and groups -> Device Settings; change the... | 7.5 | contentidea-kb |
| 14 | Intune Customer has called because they have questions about the upcoming Gro... |  |  | 7.5 | contentidea-kb |
| 15 | For a public-facing Guided Walkthrough with this information, see p.MsoNormal... |  |  | 7.5 | contentidea-kb |
| 16 | When attempting to assign a license (Enterprise Mobility + Security / Intune ... | This can occur if the Usage location setting within the users profile is not ... | To resolve this problem, set the Usage location property in the users profile... | 7.5 | contentidea-kb |
| 17 | If a Service Request within Microsoft CSS requires the involvement of SkyCure... |  |  | 7.5 | contentidea-kb |
| 18 | This articles describes how to create a dynamic device group for all Windows ... |  |  | 7.5 | contentidea-kb |
| 19 | You should test an application package before trying to deploy it with Micros... |  |  | 7.5 | contentidea-kb |
| 20 | Customer unable to sign into Windows Intune Portals except IAP. Account ID al... | Account not properly provisioned. Provisioning requests can fail causing acco... | Look up via CSS Gateway Set-SCOSubscriptioncontext. If EnableReadyFailed, get... | 7.5 | contentidea-kb |
| 21 | Not receiving email notifications from the Intune service. Unable to receive ... |  | Check admin notification config: recipient is Administrator, email correct, a... | 7.5 | contentidea-kb |
| 22 | Customer requests a CritSit or Severity 1 on a case. | Premier customers have CritSit agreements with GBS that Intune Support honors. | Meet SLA, determine scope and business impact, confirm 24x7 availability. Eng... | 7.5 | contentidea-kb |
| 23 | Customer needs assistance with Windows Intune Beta TAP Account/Service | Non-SEV A issues should be redirected to CONNECT Forums. | Non-SEV A: redirect to CONNECT Forums. SEV A: authenticate in MOCMC, cut tick... | 7.5 | contentidea-kb |
| 24 | When adding or updating APN cert getting error Please specify an Apple ID in ... | Invalid character in the Apple ID used during cert upload | Ensure valid email format. Email is validated against regex. Use any valid fo... | 7.5 | contentidea-kb |
| 25 | Trying to update a .ipa file  in Intune Software Publisher fails.Possible err... | The .ipa packages were not correctly, or fully, updated in development to ref... | The developer of the software will need to be engaged to correct the package.... | 7.5 | contentidea-kb |
| 26 | Update hasn't been pushed. PCs haven't received update.Driver update |  | �         Check if the update exists on the MU catalog site (Search for the u... | 7.5 | contentidea-kb |
| 27 | Collaborating with Saaswedo DatAlertCustomers should always open a case with ... |  |  | 7.5 | contentidea-kb |
| 28 | You may have a customer ask if Bitlocker information can be found for an Intu... |  |  | 7.5 | contentidea-kb |
| 29 | The Intune Admin console migration is starting with the Intune 1612 (December... |  |  | 7.5 | contentidea-kb |
| 30 | Company Portal in infinite loop. Device looping back to login page. Company P... | Check to see if Company Portal log shows this message The signed in user is n... | Navigate to Azure portal and set user assignment required to NO. If the optio... | 7.5 | contentidea-kb |
| 31 | Customer states that Intune Enrollment is not workingCustomer states when the... | Tenant Endpoint defectDiagnostic Description: The test determines if the acco... | Resolved the defect on the back end of the tenant via Ops procedureCustomer v... | 7.5 | contentidea-kb |
| 32 | Customer would like to know if Intune has an RSS FeedCustomer would like to k... |  |  | 7.5 | contentidea-kb |
| 33 | Customer needs to know if there is a RSS Feed for Intune and how to configure... | Advisory | There was only one place for Intune to configure an RSS feed, via the Office ... | 7.5 | contentidea-kb |
| 34 | This articles describes the steps necessary to deploy an application to run i... |  |  | 7.5 | contentidea-kb |
| 35 | When a tenant was set to Intune as the MDM Authority, Device Categories were ... |  | These Device Categories are not manageable from external interfaces and requi... | 7.5 | contentidea-kb |
| 36 | This article describes how to add the&nbsp;Intune-enlightened apps that are i... |  |  | 7.5 | contentidea-kb |
| 37 | What is DataAlert? A Telecom Expense Management (TEM) application integrated ... |  |  | 7.5 | contentidea-kb |
| 38 | Does Intune support dual-SIM or SIM card changes? Intune does not support dua... |  |  | 7.5 | contentidea-kb |
| 39 | Customer wants to get setup on the Intune Canary program or needs SAW Actions... |  |  | 7.5 | contentidea-kb |
| 40 | Microsoft/Checkpoint Support Collaboration and Escalation Process: When an is... |  |  | 7.5 | contentidea-kb |
| 41 | Phone number showing as unknown on the Saaswedo DatAlert app | Saaswedo dependency | Add the lines manually into DatAlert and enroll with the deep link that can b... | 7.5 | contentidea-kb |
| 42 | Compliance state in InTune portal shows incorrect status of &quot;Not Applica... | This is a bug in the backend reporting services | ICM 39675629 | 7.5 | contentidea-kb |
| 43 | When adding a Line of Business App into the Azure Intune Portal, you cannot s... | By design. | This is by design however a DCR has been created: ICM 39311587 | 7.5 | contentidea-kb |
| 44 | How to engage Microsoft Intune Technical Support on behalf of O365/ Concierge... |  |  | 7.5 | contentidea-kb |
| 45 | Customer reported the following error when trying to configure Synchronizatio... | One of the following steps was not done:Ensure that customer has accepted htt... | Ensure that customer has accepted https://aad.lookout.com/les?action=consent)... | 7.5 | contentidea-kb |
| 46 | This article documents recent changes to the Mobility POD EMEA callback reque... |  |  | 7.5 | contentidea-kb |
| 47 | This article documents recent changes to the Mobility POD APAC callback reque... |  |  | 7.5 | contentidea-kb |
| 48 | Outlook has recently updated their mobile app to use a new API for log collec... |  |  | 7.5 | contentidea-kb |
| 49 | Customers may ask why we state in https://docs.microsoft.com/en-us/intune-cla... |  |  | 7.5 | contentidea-kb |
| 50 | Microsoft/ Zimperium Support Collaboration and Escalation Process: In the eve... |  |  | 7.5 | contentidea-kb |
| 51 | It is important that everyone is clear on when it is appropriate to close a c... |  |  | 7.5 | contentidea-kb |
| 52 | When user enters a PIN for an application another line of business or another... |  |  | 7.5 | contentidea-kb |
| 53 | This article describes the steps necessary to capture traffic from an Windows... |  |  | 7.5 | contentidea-kb |
| 54 | When you try to enroll your device and as soon as you fill the user name that... |  |  | 7.5 | contentidea-kb |
| 55 | Currently there is no existing documentation that covers how to filter All De... |  |  | 7.5 | contentidea-kb |
| 56 | The purpose of this document is to outline the steps and requirements for ide... |  |  | 7.5 | contentidea-kb |
| 57 | This article documents the process for handling Intune case recovery for �By ... |  |  | 7.5 | contentidea-kb |
| 58 | For users who had enrolled or re-enrolled their devices into Intune recently,... | �Discovered Apps� reporting will only reflect apps that were captured during ... | The apps that were installed but missing were simply not captured when the in... | 7.5 | contentidea-kb |
| 59 | Customer provides hosting services to customers and wants to include Intune a... |  |  | 7.5 | contentidea-kb |
| 60 | When attempting to configure a Mobile Threat Defense connector for Check Poin... | This can occur if the sync between Check Point and the Microsoft Intune servi... | For this to work, Check Point SandBlast must first be properly configured to ... | 7.5 | contentidea-kb |
| 61 | When adding the 26th Device Enrollment Manager (DEM) account, an error "An er... | There is a limit of 25 Device Enrollment Manager (DEM) accounts in Microsoft ... |  | 7.5 | contentidea-kb |
| 62 | Microsoft/ Appthority Mobile Threat Protection Support Collaboration and Esca... |  |  | 7.5 | contentidea-kb |
| 63 | Microsoft/ Appthority Mobile Threat Protection Support Collaboration and Esca... |  |  | 7.5 | contentidea-kb |
| 64 | Microsoft/ Appthority Mobile Threat Protection Support Collaboration and Esca... |  |  | 7.5 | contentidea-kb |
| 65 | After switching the MDM authority from Intune to SCCM, all devices show up in... | This is caused by a bug in the migration process. As of this writing, this wi... | To resolve this issue, escalate via an IET task. See KB 2716418 for details o... | 7.5 | contentidea-kb |
| 66 | Administrators received an informational alert regarding the Intune client so... | A new version of the Intune PC agent has been available and the previous vers... | Windows machines that already have the Intune PC agent installed will have it... | 7.5 | contentidea-kb |
| 67 | Recent app purchases from Store for Education not showing up in Apps blade. | Sync may take up to 12 hours for new apps, 24 hours for Private Store apps. | Wait for sync to complete. Check last sync time on Apps blade. | 7.5 | contentidea-kb |
| 68 | Intune for Education Express Configuration walkthrough - groups, apps, and se... |  |  | 7.5 | contentidea-kb |
| 69 | The table dbo.CertificateData in the ConfigMgr DB is showing for the Subscrip... | Corruption of the Intune Subscription Certificate table due to upgrade of Con... | You will need to escalate this service request to IET, once there they will c... | 7.5 | contentidea-kb |
| 70 | Intune : Device Inventory in Ibiza portal shows less inventory than in Silver... | This issue is considered to be DCR by development group and may be fixed in f... | https://icm.ad.msft.net/imp/v3/incidents/details/38804597/home | 7.5 | contentidea-kb |
| 71 | Limited administrator with Intune Service Administrator role is unable to vie... | This blade is limited to global administrators and limited administrators tha... | Grant the Security administrator role to the limited administrator: Login to ... | 7.5 | contentidea-kb |
| 72 | Intune: Internal Trial Account Requests and Extensions - how to sign up for E... |  |  | 7.5 | contentidea-kb |
| 73 | Use the following method to determine real time spdrsactivation queue process... |  |  | 7.5 | contentidea-kb |
| 74 | Receiving error: �The file cannot be imported. Confirm this comma-separated f... | One cause for this is Excels default behavior to truncate large numbers. The ... | To resolve the issue, format the IMEI cell, and adjust the decimal places fro... | 7.5 | contentidea-kb |
| 75 | When troubleshooting app deployment issue the below kustos query can be used ... |  |  | 7.5 | contentidea-kb |
| 76 | Microsoft/ Symantec Support Collaboration and Escalation Process:  &nbsp;  &n... |  |  | 7.5 | contentidea-kb |
| 77 | When logging in to the Azure Intune portal you find that you are unable to ac... | This can occur if the user is only assigned the role of Intune Service Admini... | To resolve this problem, make the user a Global Administrator via the Office3... | 7.5 | contentidea-kb |
| 78 | It takes up to 8 hours before Mobile Application Management policy from the A... | New MAM policy does not apply immediately upon creationIf MAM policy was rece... | New MAM policy can take up to 15 minutes to apply to device (this can be acce... | 7.5 | contentidea-kb |
| 79 | Issue: In the Hybrid configuration, the DEP Sync operation is manually trigge... |  |  | 7.5 | contentidea-kb |
| 80 | When attempting to login to the classic (Silverlight) Intune portal, the logi... | This is a known issue. The roles above do not apply to users in the classic p... | This problem can be resolved with either of the following methods:Make the us... | 7.5 | contentidea-kb |
| 81 | This document provides guidance on how to get assistance/escalate a Jamf case... |  |  | 7.5 | contentidea-kb |
| 82 | When you view the &quot;Per-setting status&quot; for a Device configuration p... | It's very likely that this is by-design.When we migrated Configuration Polici... | Per this article, this is by-design:https://docs.microsoft.com/en-us/intune/w... | 7.5 | contentidea-kb |
| 83 | Due to the Intune on Azure migration, the feature of getting error codes from... |  | These codes can be retrieved using Graph Explorer:Log in with the tenant's ad... | 7.5 | contentidea-kb |
| 84 | The Microsoft Intune Exchange Connector service is not able to start. When ch... | This can be caused by the WIEC_User account does not have Log on as service p... | Assign &quot;Log on as a service&quot; to the service account WIEC_User on th... | 7.5 | contentidea-kb |
| 85 | Customer is having difficulty getting users to sync with IntuneTechnician wan... | Useful for troubleshooting cloud user issues in SCCM Unified | Open SQL Management Studio. Connect to the DB (customer should be able to hel... | 7.5 | contentidea-kb |
| 86 | This article describes how to find the UPN and display name for a user when a... |  |  | 7.5 | contentidea-kb |
| 87 | This is the home page for the Intune Weekly Flash newletters, which are now a... |  |  | 7.5 | contentidea-kb |
| 88 | Customer tries to edit the security group associated with Intune in the Sandb... | Group is not listed in Active Directory | Group must be in Active Directory before being added to the Sandblast console. | 7.5 | contentidea-kb |
| 89 | If you have an Intune case with a customer in a hybrid scenario and you need ... |  |  | 7.5 | contentidea-kb |
| 90 | The information below can be used to confirm the BundleID for a configuration... |  |  | 7.5 | contentidea-kb |
| 91 | Microsoft/SkyCure Support Collaboration and Escalation Process:        In the... |  |  | 7.5 | contentidea-kb |
| 92 | You can easily locate an Collection ID and location \ path of a collection in... |  |  | 7.5 | contentidea-kb |
| 93 | Microsoft/Pradeo Support Collaboration and Escalation Process for Intune inte... |  |  | 7.5 | contentidea-kb |
| 94 | When setting up the Intune Exchange service-to-service connector, error messa... | Account used to setup the connector does not have either Intune license or gl... | Assign the account used to setup the Intune connector an Intune license or as... | 7.5 | contentidea-kb |
| 95 | In Azure Intune portal Device Compliance, devices with compliance policies as... | Compliance policies are applied to devices instead of users or groups. | Resolved with Intune 1803 service release. | 7.5 | contentidea-kb |
| 96 | When AD accounts are disabled (Block sign-in=Yes in Azure AD), results are in... |  |  | 7.5 | contentidea-kb |
| 97 | After configuring co-existence with Microsoft Intune and Office 365, when nav... | This can occur if your Mobile Device Management Authority is set to Configura... | The only option to work around this issue is to set your MDM authority back t... | 7.5 | contentidea-kb |
| 98 | Annett Roosa (aroosa) and Patrick Lewis (patlewis) have been working on an In... |  |  | 7.5 | contentidea-kb |
| 99 | You may encounter a customer with a tenant that is already configured to inte... |  |  | 7.5 | contentidea-kb |
| 100 | When troubleshooting various Intune problems, you may find it useful to deter... |  |  | 7.5 | contentidea-kb |
| 101 | When setting the Intune Exchange service to server connector you receive the ... | This issue can be caused by&nbsp; account used to setup the connector does no... | To resolve the issue assign the account used to setup the Intune connector an... | 7.5 | contentidea-kb |
| 102 | Consider the following scenario: You are attempting to create a provisioning ... | This can occur if there are no more licenses available for Azure AD Premium a... | To resolve this problem, either purchase additional licenses for the tenant o... | 7.5 | contentidea-kb |
| 103 | When attempting to enroll a Windows 10 Home computer, the following error is ... | This is expected for Windows 10 Home Edition. Enrolling in Intune or joining ... | To resolve this problem, upgrade the device to Windows 10 Pro or better. | 7.5 | contentidea-kb |
| 104 | When contacting Microsoft Support for help with Microsoft Intune, Enterprise ... |  |  | 7.5 | contentidea-kb |
| 105 | User's iPhone is removed from Intune. In the new Azure portal, there are no i... | User account had MFA configured with the Authenticator app. The credentials w... | Remove O365 account from authenticator app and re-added it. Error in Company ... | 7.5 | contentidea-kb |
| 106 | When attempting to join a Windows 10 computer to Azure AD, the following erro... | This can occur if the user is not allowed to join devices to Azure AD. | To resolve this problem, allow Azure AD Join for All or Selected users:      ... | 7.5 | contentidea-kb |
| 107 | When installing the Microsoft Intune Connector  you saw the following errors:... | The Microsoft Intune Connector Setup can't create  log name 'Microsoft Intune... | Delete, the other Event Log entry that contains "Microsoft", | 7.5 | contentidea-kb |
| 108 | Content Idea Auto Publish can now extract the content from a Word document an... |  |  | 7.5 | contentidea-kb |
| 109 | Content Idea Auto Publish can now extract the content from a Word document an... |  |  | 7.5 | contentidea-kb |
| 110 | When attempting to update the version of a deployed Line-of-Business app usin... | Varies | To troubleshoot this issue, attempt to update the app using the classic porta... | 7.5 | contentidea-kb |
| 111 | When attempting to install the Intune PC client software, the setup process f... | This can occur if the PC client package being used is out of date. | To resolve this problem, download a new copy of the Intune PC client agent in... | 7.5 | contentidea-kb |
| 112 | Customer configured a WIP policy to protect work files copied from Outlook to... | By design in builds prior to 1709. This is fixed in 1709. | To protect work files copied to external devices: 1. From Outlook, right-clic... | 7.5 | contentidea-kb |
| 113 | The Intune service has worked with various Office Application Teams to expand... |  |  | 7.5 | contentidea-kb |
| 114 | When using support article 4088081 or Intune Diagnostics Mode collecting clie... |  |  | 7.5 | contentidea-kb |
| 115 | Can Intune accept Health Level -7 (HL7) interfaces to control device action?N... |  |  | 7.5 | contentidea-kb |
| 116 | Customer attempts to generate a temporary passcode in the Azure Intune blade ... | The device is unable to communicate with the Intune service because it hasn't... | Ensure that the device has internet or cellular connectivity. | 7.5 | contentidea-kb |
| 117 | Intune Licensed GAs are unable to login to Intune Silverlight portal with err... | Azure Active Directory has the Intune service principals disabled. Hence, whe... | To resolve this issue, follow the steps below:1) Ensure that the UPN is indee... | 7.5 | contentidea-kb |
| 118 | The Kusto query below shows when a tenant was provisioned (time returned is i... |  |  | 7.5 | contentidea-kb |
| 119 | The Kusto query below shows when a UPN was provisioned (time returned is in U... |  |  | 7.5 | contentidea-kb |
| 120 | The Kusto query below can be used to search for a specific RequestID from the... |  |  | 7.5 | contentidea-kb |
| 121 | Customer unable to add groups and is configured as a service administrator | Customer does not have the correct role in Azure. Customer is listed as a bil... | 1.     The account must be configured as a user admin.            a.  In ... | 7.5 | contentidea-kb |
| 122 | If you try to download any file from the Intune Azure portal while using the ... | This because you are using the Edge Browser in "InPrivate" mode. | To resolve the issue close out "InPrivate" browser and log in with non "InPri... | 7.5 | contentidea-kb |
| 123 | The various sync intervals in Intune for the different policy and platform ty... |  |  | 7.5 | contentidea-kb |
| 124 | After creating and assigning an Approved Apps list, the Apps list shows a Sta... | The user device is not compliant with policy, not because the policy did not ... | No resolution at this time. The Restricted Apps policy is just a reporting po... | 7.5 | contentidea-kb |
| 125 | Customer deleted the Lookout for Work MTD Connector and re-added it back and ... |  | Recreate the connector on the Lookout side. | 7.5 | contentidea-kb |
| 126 | When setting up the Android for Work binding, per the following article: http... | This is by-design. This error happens when they sign in using a Google &quot;... | The customer should create a &quot;personal&quot; Google account, that isn't ... | 7.5 | contentidea-kb |
| 127 | Microsoft/ BlackBerry Support Collaboration and Escalation Process: In the ev... |  |  | 7.5 | contentidea-kb |
| 128 | Customer would like create a SQL Link Server to Intune to be able to run SQL ... |  |  | 7.5 | contentidea-kb |
| 129 | When using an AD mobile account on a Mac the Company portal app fails to laun... | By design. The Company portal app does not support AD mobile accounts.&nbsp; | Users must enroll into Jamf using a Local account on the Mac.&nbsp; | 7.5 | contentidea-kb |
| 130 | Many customers ask if/how they can block specific custom URLs using Endpoint ... |  |  | 7.5 | contentidea-kb |
| 131 | Once a device is unenrolled from      Jamf what's the expected timeframe for ... |  |  | 7.5 | contentidea-kb |
| 132 | As a Microsoft Intune Support Engineer, you must join the proper project in o... |  |  | 7.5 | contentidea-kb |
| 133 | Due to Microsoft Intune being a Cloud Service we have strict ISO requirements... |  |  | 7.5 | contentidea-kb |
| 134 | An unexpected error has occurred when logging into Intune Classic Silverlight... | Intune license is not assignedorLogin URL is not trusted | Fist confirm if the user logging in is a Global Admin or Intune Service Admin... | 7.5 | contentidea-kb |
| 135 | Sometimes a customer might find themselves wanting to utilize PDFs in a more ... |  |  | 7.5 | contentidea-kb |
| 136 | You may get cases where a customer says that a remote password reset does not... |  |  | 7.5 | contentidea-kb |
| 137 | If a member of the field (TSP, PFE, etc) creates a Service Request and is ask... |  |  | 7.5 | contentidea-kb |
| 138 | Need to capture F12 Network Trace Logs (HAR traces) for investigating Endpoin... |  | Press F12 in Edge, click Network tab, clear session, reproduce issue, save as... | 7.5 | contentidea-kb |
| 139 | Please convert this article to an internal KB Monitoring Compliance workflow.... | Please convert this article to an internal KB Monitoring Compliance workflow.... | Please convert this article to an internal KB Monitoring Compliance workflow.... | 7.5 | contentidea-kb |
| 140 | As all Support Engineers know, finding a well-written solution in a KB articl... |  |  | 7.5 | contentidea-kb |
| 141 | After creating and assigning a device security policy where Required Password... | Intune: This problem was fixed by removing the option to create this password... | Office 365 MDM: Use Office 365 MDM powershell to set the Password Quality value. | 7.5 | contentidea-kb |
| 142 | In the Microsoft Intune on Azure administration console, there is a Discovere... |  |  | 7.5 | contentidea-kb |
| 143 | In this article we share details on service-impacting incident response and s... |  |  | 7.5 | contentidea-kb |
| 144 | There is some confusion regarding the CNAME configuration required for Window... |  |  | 7.5 | contentidea-kb |
| 145 | When sending a remote lock to MAC OS X devices enrolled into Intune, the expe... | This is a known issue with the current release of Intune. | To work around this issue, look up the affected device ID in Rave or Graph, t... | 7.5 | contentidea-kb |
| 146 | Intune posts messages in the Message Center in Office 365, accessed from port... |  |  | 7.5 | contentidea-kb |
| 147 | In another KB article (4460074) we showed how you could pull in all your Intu... |  |  | 7.5 | contentidea-kb |
| 148 | Microsoft Teams is a platform for chat based communication that includes a co... |  |  | 7.5 | contentidea-kb |
| 149 | We briefly outline where we communicate information about service changes in ... |  |  | 7.5 | contentidea-kb |
| 150 | Intune: DEP token sync disabled and button greyed out - status shows �Terms a... | Intune: DEP token sync disabled and button greyed out - status shows �Terms a... | Intune: DEP token sync disabled and button greyed out - status shows �Terms a... | 7.5 | contentidea-kb |
| 151 | Monitoring Agent (x64) fails to install with 0x80070643Agtinstaller.log shows... | Intune is not compatible with other Microsoft Monitoring Solution agents, . t... | To resolve the error above, remove any other versions of Microsoft Monitoring... | 7.5 | contentidea-kb |
| 152 | Question: Is https://support.samsungknox.com/hc/en-us/articles/115015195728-C... | Per-current design - not supported. | None - currently not on roadmap at the time of writing of this KB per CxE. | 7.5 | contentidea-kb |
| 153 | Fairfax is a secure cloud environment for local, state and federal U.S. gover... |  |  | 7.5 | contentidea-kb |
| 154 | Customer is prompted with keychain signing message for TEAMS, Outlook (O365 a... | The workplace join key is put down by AAD teams code which the Intune company... | This is expected since an App is trying to access a keychain item and the use... | 7.5 | contentidea-kb |
| 155 | Unable to delete Autopilot devices - Some devices failed to delete message wh... | Code Flaw on the DDS service side with registrations in ADRS, junk being left... | DDS has disabled signaling to ADRS on deletion. If device is deleted and regi... | 7.5 | contentidea-kb |
| 156 | Customer receives notification in Jamf console: Unable to connect to Microsof... | Customer Jamf license had expired. | Customer should contact Jamf for assistance. | 7.5 | contentidea-kb |
| 157 | To get the Jamf policy from a Mac: 1. From the Mac, click the Launch Pad 2. T... |  |  | 7.5 | contentidea-kb |
| 158 | To troubleshoot if a device is not syncing inventory information with Intune:... |  |  | 7.5 | contentidea-kb |
| 159 | Devices check in with Jamf Pro every 15 minutes. If a device doesn't check in... |  |  | 7.5 | contentidea-kb |
| 160 | To unenroll a Mac from Jamf registered with Intune: On the Mac, launch Termin... |  |  | 7.5 | contentidea-kb |
| 161 | Customer enrolls macOS devices into Jamf and registers with Intune for Partne... | From CP app logs: Line 7783: 2018-07-25 21:41:25.116 INFO com.microsoft.ssp.a... | Company Portal (CP) should not be launched directly in JAMF cases, only JAMF ... | 7.5 | contentidea-kb |
| 162 | Customer receives the following message when trying to register a Jamf enroll... | After upgrading to 10.7.1 customer found that the Intune integration was disa... | Re-enable the Intune integration in Jamf | 7.5 | contentidea-kb |
| 163 | Customer complains that Compliance is not updated on MDM enrolled devices wit... | Issue can be encounter in scenarios where Service Connection Point role is no... | Before taking any actions to SCCM SQL database, please make sure you have a p... | 7.5 | contentidea-kb |
| 164 | Intune Service allows iOS device to be enrolled a second time while already e... | Expected behavior due to past release code change. | Currently IcM has been filed and pending investigation: https://icm.ad.msft.n... | 7.5 | contentidea-kb |
| 165 | If you have a customer who requests Root Cause Analysis (RCA) for a tenant sp... |  |  | 7.5 | contentidea-kb |
| 166 | This article describes how to use a built-in app like the native messaging ap... |  |  | 7.5 | contentidea-kb |
| 167 | Customer reports that approved Managed Play Apps are not syncing to Intune | Two main causes are 1. Incorrect Google Account 2. IT Pro has not clicked syn... | Collect and review screenshots from the customer environment to verify Google... | 7.5 | contentidea-kb |
| 168 | Error 123 occurs when running application ABC. You may also notice that the c... | This can occur if you do not possess the Continuum Transfunctioner. | Acquire the Continuum Transfunctioner, then try running the application again. | 7.5 | contentidea-kb |
| 169 | If an administrator removes or deletes a user from Azure Active Directory (AA... |  | A script has been made available that will remove a device managed by Intune ... | 7.5 | contentidea-kb |
| 170 | To request assistance from SMEs via Microsoft Teams: 1. Fill out the below te... |  |  | 7.5 | contentidea-kb |
| 171 | As we moved away from UserVoice, the recommended way to provide feedback, or ... |  |  | 7.5 | contentidea-kb |
| 172 | Current Intune training resources can be found using the links below. |  |  | 7.5 | contentidea-kb |
| 173 | Training resources for Service Desk Case can be found using the links below. |  |  | 7.5 | contentidea-kb |
| 174 | If you are an existing Intune customer, you may already be enforcing acceptan... |  |  | 7.5 | contentidea-kb |
| 175 | While migrating from Hybrid to Intune Standalone, when user authority is chan... |  |  | 7.5 | contentidea-kb |
| 176 | A Windows 10 WiFi MAC address may be incorrectly inventoried in Intune in the... |  |  | 7.5 | contentidea-kb |
| 177 | One Data Collector is a Support Diagnostics Platform (SDP) package that provi... |  |  | 7.5 | contentidea-kb |
| 178 | When navigating to Users or Groups in the Microsoft 365 Device Management das... | Entry point issue with devicemanagement.microsoft.com. Has been resolved. | Use the URL https://devicemanagement.portal.azure.com as an alternative entry... | 7.5 | contentidea-kb |
| 179 | Guide: How to display Kusto query history - retrieve previously run queries t... |  |  | 7.5 | contentidea-kb |
| 180 | Guidance for throttling app deployment bandwidth when downloading apps in Int... |  |  | 7.5 | contentidea-kb |
| 181 | Windows 10 Device Configuration Profile->Settings->Networkboundary allows you... | When IPv4 format of "###.###.###.###-###.###.###.###" is used the UI should n... | Issue resolved with Intune 1218 release completed by end of December 2018. | 7.5 | contentidea-kb |
| 182 | This support guide provides a CSS support engineer information on compliance ... |  |  | 7.5 | contentidea-kb |
| 183 | See https://internal.support.services.microsoft.com/en-us/help/4526822 |  |  | 7.5 | contentidea-kb |
| 184 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 185 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 186 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 187 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 188 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 189 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 190 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 191 | This article expands on https://docs.microsoft.com/en-us/intune/app-protectio... |  |  | 7.5 | contentidea-kb |
| 192 | Customer has a 10-character device password requirement (alphanumeric with sp... | Under investigation by Jamf. Internal Product issue: PI-006635 | This has been fixed in Jamf Pro 10.13[PI-006635] Fixed an issue that caused c... | 7.5 | contentidea-kb |
| 193 | If you have a customer reporting that they import a device into Autopilot via... |  |  | 7.5 | contentidea-kb |
| 194 | Consider the following scenario: Start with a device enrolled into an Intune ... | Product Issue on the Jamf side (PI-006679) | To resolve this, delete the device record from Jamf Pro and re-enroll the dev... | 7.5 | contentidea-kb |
| 195 | Customer has shared that they have had a hard time finding a field person at ... |  |  | 7.5 | contentidea-kb |
| 196 | If you ever find an internal KB that is out of date, has wrong information or... |  |  | 7.5 | contentidea-kb |
| 197 | If you find this article prior to February 15th, 2019, please send a quick em... |  |  | 7.5 | contentidea-kb |
| 198 | MSFB apps are not being deleted from "Intune > Apps" blade, after successfull... | Currently there is a known issue where some applications won't be able to be ... | Admins can try the steps under symptoms to refund paid or Free Apps https://d... | 7.5 | contentidea-kb |
| 199 | This article describes the official Microsoft CSS policy for asking customers... |  |  | 7.5 | contentidea-kb |
| 200 | Thanks to automation added to ContentIdea and the power of Microsoft Teams, i... |  |  | 7.5 | contentidea-kb |
| 201 | After making edits to the column widths and/or filters for a specific section... | This is a known issue. | Currently there is no known fix or work around for this behavior. | 7.5 | contentidea-kb |
| 202 | This article provides instruction on how to create a request for access to th... |  |  | 7.5 | contentidea-kb |
| 203 | An Overview of Rave for the Support Engineer&nbsp;No support topics&nbsp;Rave... |  |  | 7.5 | contentidea-kb |
| 204 | The&nbsp;Azure Support Center Learning Path can be found here:&nbsp;Azure Sup... |  |  | 7.5 | contentidea-kb |
| 205 | Customers may ask how to set the MDM authority for their a GCC High tenant to... |  |  | 7.5 | contentidea-kb |
| 206 | On Windows 10 1803 and later, the feature &quot;Your phone&quot; in &quot;Set... |  |  | 7.5 | contentidea-kb |
| 207 | Apps cannot be assigned to Device group as “Available for enrolled devices” o... |  |  | 7.5 | contentidea-kb |
| 208 | After enabling Single App Mode with the Company Portal app while having MFA e... | This is expected behavior - by design. | To work around this problem, MFA will need to be disabled for these users. Si... | 7.5 | contentidea-kb |
| 209 | 1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Add below registry key to enable offic... |  |  | 7.5 | contentidea-kb |
| 210 | The Azure Intune Portal -&gt;Client Apps-&gt;Company Portal Branding shows th... | This is due to a oversight on Microsoft side, this was not meant to be releas... | For now the customer will need to ignore;This feature UI component will be re... | 7.5 | contentidea-kb |
| 211 | The Intune-&gt;Tenant Status-&gt;Tenant Details section for subsection &quot;... | Per internal discussion with Tanmay Jha via Matt Shadbolt and James Grantham;... | None, per-design. | 7.5 | contentidea-kb |
| 212 | If you look in the portal, looking in the Managed Apps -Preview you will see ... | App to device serial # record is out of sync with Apple Service | Workaround: revoke the app license from the device and after a sync the app w... | 7.5 | contentidea-kb |
| 213 | The Bypass Activation Lock device action is initiated via the Intune portal, ... | Appears to have been a combination of the Company Portal version that was bei... | (1) Updated to the latest version of the Company Portal. (2) Allowed more tim... | 7.5 | contentidea-kb |
| 214 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 215 | Users keep having to open the iOS Company Portal applicaiton every few days t... | Enhanced Jailbreak detection was enabled which requires the iOS devices to ch... | Opened the Company Portal to sync the devices with the Intune service. | 7.5 | contentidea-kb |
| 216 | Intune administrators select the 'Remove passcode' device action via the Intu... |  |  | 7.5 | contentidea-kb |
| 217 | Mobile devices migrated from hybrid Intune to Intune standalone have the old ... | This was by design.&nbsp; The PG created a flighting tag that makes it possib... | Create an escalation to IET to file an ICM to ask that the tattoo time be red... | 7.5 | contentidea-kb |
| 218 | Any time you find an internal KB that you think would be helpful to customers... |  |  | 7.5 | contentidea-kb |
| 219 | This process has been updated. Please see the following for the latest inform... |  |  | 7.5 | contentidea-kb |
| 220 | During NDES feature configuration, you may encounter the following error:CMSC... | AD CS Configuration wizard is run using non-enterprise admin account&nbsp; | Use Enterprise Admin account to configure NDES feature.&nbsp;Also make sure E... | 7.5 | contentidea-kb |
| 221 | When creating a&nbsp;Device Configuration Profile that uses http://localhost ... | This occurs because of a problem with validation for the URL by the Intune se... | Resolution: Issue resolved with 1904 Intune service releaseWorkaround: Use Gr... | 7.5 | contentidea-kb |
| 222 | If a RAVE case is misrouted to Intune but needs to go to a Team that does not... |  |  | 7.5 | contentidea-kb |
| 223 | The process as documented in this article describes the steps customers shoul... |  |  | 7.5 | contentidea-kb |
| 224 | The process as documented in this article describes the steps customers shoul... |  |  | 7.5 | contentidea-kb |
| 225 | Resolved on 4/22/19 with Intune 1904 Service Release | DELETE | DELETE | 7.5 | contentidea-kb |
| 226 | Outlook mobile for Android Version 3.0.26 - 3.0.34&nbsp; fails to render the ... | Intune Company Portal which is used by Outlook to acquire the APP Policy is c... | Intune Company Portal build 5.0.4367.0 has proven to resolve this issue and i... | 7.5 | contentidea-kb |
| 227 | When V1.0 of the Intune Data Warehouse API was first introduced in Intune bui... |  |  | 7.5 | contentidea-kb |
| 228 | Intune Android Wrapper references an Android Key store file.  Apps used for t... |  |  | 7.5 | contentidea-kb |
| 229 | When creating multi-app kiosk policy the apps never show in the Intune Admin ... | An app uploaded to Intune had null Version, no store url, and no app identifi... | Delete the malformed apps from&nbsp;Client apps -&gt; Apps. | 7.5 | contentidea-kb |
| 230 | When signing in to Microsoft Intune Connector, there is no error and the prom... | This can occur if a firewall is blocking connections to manage.microsoft.com ... | Added *.manage.microsoft.com to firewall allow list | 7.5 | contentidea-kb |
| 231 | Merged into&nbsp;4502996 |  |  | 7.5 | contentidea-kb |
| 232 | One of the new things we added to Intune is an exact search syntax. We determ... | This is expected behavior. | To use this new syntax, provided you know one of the complete device identifi... | 7.5 | contentidea-kb |
| 233 | Beginning in May 2019, managed Google Play will no longer support the ability... |  |  | 7.5 | contentidea-kb |
| 234 | Items to note prior to creating an expense report:  Effective February 1st, 2... |  |  | 7.5 | contentidea-kb |
| 235 | This KB provides you a codex of general questions that follow the mindset for... |  |  | 7.5 | contentidea-kb |
| 236 | When attempting to open a&nbsp; device configuration profile in the Intune Ad... | The configuration profile is most likely synced from the Intune for education... | Customer will need to access this policy from the Intune for Education portal... | 7.5 | contentidea-kb |
| 237 | While Intune has historically used the Intune Support All distribution group ... |  |  | 7.5 | contentidea-kb |
| 238 | This article describes the process to follow for Intune Escalation Team (IET)... |  |  | 7.5 | contentidea-kb |
| 239 | Delete this article | Delete this article | Delete this article | 7.5 | contentidea-kb |
| 240 | EverythingAboutIntune is an internal Streams channel targeted in educating ev... |  |  | 7.5 | contentidea-kb |
| 241 | This article describes the process to request assistance from the Edge mobile... |  |  | 7.5 | contentidea-kb |
| 242 | DELETE dup of&nbsp;4507701 |  |  | 7.5 | contentidea-kb |
| 243 | The following information was taken from the public post on our Intune Custom... |  |  | 7.5 | contentidea-kb |
| 244 | The entire Intune team, from the product group to CXE to CSS Support Engineer... |  |  | 7.5 | contentidea-kb |
| 245 | Customers may ask&nbsp;how to enable the sleep/wake button for iOS Kiosk devi... |  |  | 7.5 | contentidea-kb |
| 246 | This article describes how to request updates to our official product documen... |  |  | 7.5 | contentidea-kb |
| 247 | &quot;Access Denied&quot; error is encountered in the Intune portal when atte... | In this particular case, the administrator account was not Intune licensed, w... | Added an Intune license to the administrator account and provisioned the corr... | 7.5 | contentidea-kb |
| 248 | See https://internal.support.services.microsoft.com/en-us/help/4581821. |  |  | 7.5 | contentidea-kb |
| 249 | Recording of Android Enterprise Brown Bag + Q&amp;A delivered to the FastTrac... |  |  | 7.5 | contentidea-kb |
| 250 | Below are some of the highlights from the Outlook case bash held on 5-23-2019... |  |  | 7.5 | contentidea-kb |
| 251 | If you have a problem with Rave and need to submit a ticket, use this link:&n... |  |  | 7.5 | contentidea-kb |
| 252 | This article is wrong. &nbsp; The only way to manage devices in Office 365 MD... | This article is wrong. &nbsp; The only way to manage devices in Office 365 MD... |  | 7.5 | contentidea-kb |
| 253 | In the Intune portal under Device Compliance -&gt; Mobile Threat Defense, the... |  | Turn off MTP and turn it back on by toggling the Intune Connector in the Look... | 7.5 | contentidea-kb |
| 254 | &nbsp;Customer noticed that the “Last connection” time under Partner device m... | This applies only to 10.12 version of Jamf Pro. There is a known issue with t... | Point customers to the following link:&nbsp;https://www.jamf.com/jamf-nation/... | 7.5 | contentidea-kb |
| 255 | When signing into the LookOut MTP console, the following error is displayed:&... | Username is not a member of the Azure AD group defined for having access to L... | Add the user to the member of the Azure AD group defined for having access in... | 7.5 | contentidea-kb |
| 256 | When attempting to log into the LookOut console, a &quot;Sign In&quot; error ... | Consent has not be given by the Azure AD Global Admin.&nbsp; | A Global Admin must log into the LookOut console, the following will be shown... | 7.5 | contentidea-kb |
| 257 | Why is a device is not showing in the Lookout MTP Console Devices list? | The user that owns this device is not in the Enrollment Group specified in th... | On the Lookout MTP Console go to Intune Connector page (System&gt;Connectors)... | 7.5 | contentidea-kb |
| 258 | A device appears in the LookOut console under &quot;Managed Devices&quot; sec... | The device is not supported by LookOut | Devices found that are unsupported will appear in the “Managed Devices” secti... | 7.5 | contentidea-kb |
| 259 | In the Lookout MTP Console, a device is showing as Active without an MDM ID. ... |  |  | 7.5 | contentidea-kb |
| 260 | How can I force a device state resync from a device to Lookout MTP and Intune... |  |  | 7.5 | contentidea-kb |
| 261 | As an end user, if I uninstalled Company Portal and/or LookOut for Work on my... |  |  | 7.5 | contentidea-kb |
| 262 | RAVE is an excellent tool to help troubleshoot registration issues with Jamf.... |  |  | 7.5 | contentidea-kb |
| 263 | The following ports should be accessible in order for Jamf and Intune to inte... |  |  | 7.5 | contentidea-kb |
| 264 | If you are interested in creating videos for the CSS YouTube channel, the ste... |  |  | 7.5 | contentidea-kb |
| 265 | Intune support engineer&nbsp;Betty Jia&nbsp;(cujia@microsoft.com) published a... |  |  | 7.5 | contentidea-kb |
| 266 | If a user is targeted with more than one Office Pro Plus policy, only one of ... | Currently this is a known issue with Intune.&nbsp;We’re working on a fix but ... | If you are impacted by this issue, short term you can bundle Office Pro Plus ... | 7.5 | contentidea-kb |
| 267 | Intune Support Engineer&nbsp;Saurabh Sarkar&nbsp;published a great blog post&... |  |  | 7.5 | contentidea-kb |
| 268 | Customer is unable to login to Intune admin portal |  | First thing is to narrow down the scope of the problem by checking to see if ... | 7.5 | contentidea-kb |
| 269 | The table below identifies who you can contact if you need to provide feedbac... |  |  | 7.5 | contentidea-kb |
| 270 | When you have exhausted the available resources (including the Intune GCC Hig... |  |  | 7.5 | contentidea-kb |
| 271 | The list below contains resources for learning about the Microsoft Intune pro... |  |  | 7.5 | contentidea-kb |
| 272 | https://internal.support.services.microsoft.com/help/4532850 |  |  | 7.5 | contentidea-kb |
| 273 | Can’t access your Company Portal from your iOS device?&nbsp;In this video cre... |  |  | 7.5 | contentidea-kb |
| 274 | Policy updates and sync suddenly stop working for Windows 10 devices enrolled... | This can occur if a PowerShell script called Windows 8 Optimization Script&nb... | To resolve this problem, change the service startup type to&nbsp;Automatic. O... | 7.5 | contentidea-kb |
| 275 | some customers are asking how can we move the policies from testing Intune Te... | Moving from Testing Tenant to Production Tenant&nbsp; | I found these PowerShell’s that will help you in Exporting everything in your... | 7.5 | contentidea-kb |
| 276 | This article contains frequently asked questions regarding application config... |  |  | 7.5 | contentidea-kb |
| 277 | This article documents the current support boundaries for custom push notific... |  |  | 7.5 | contentidea-kb |
| 278 | Retired - 2019 content |  |  | 7.5 | contentidea-kb |
| 279 | Troubleshooting issues with macOS devices when using Jamf/Intune integration&... |  |  | 7.5 | contentidea-kb |
| 280 | Scenario 1 Actual Error No Enrollment Policy Impact to user End Users will be... |  |  | 7.5 | contentidea-kb |
| 281 | Actual ErrorDevice cap reachedImpact to UserUser unable to enroll additional ... |  |  | 7.5 | contentidea-kb |
| 282 | Actual ErrorCustomer will see the error&nbsp;User License Type Invalid&nbsp;w... |  |  | 7.5 | contentidea-kb |
| 283 | Actual ErrorUsername not recognizedImpact to UserUser cannot log in to enroll... |  |  | 7.5 | contentidea-kb |
| 284 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 285 | Content has been moved into the&nbsp;wiki. |  |  | 7.5 | contentidea-kb |
| 286 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 287 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 288 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 289 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 290 | CSS Support for Microsoft Intune requires a Test Account from Customer Tenant... |  |  | 7.5 | contentidea-kb |
| 291 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 7.5 | contentidea-kb |
| 292 | Unable to find/locate Admin ConsoleUnable to find/locate Company PortalUnable... |  |  | 7.5 | contentidea-kb |
| 293 | Admin is encountering an error regarding, &quot;Failed to Load&quot;, when na... | For this case, the admin had the Read Only Operator Intune role assigned, whi... | Work with a Global Admin or another admin that can grant the Read permissions... | 7.5 | contentidea-kb |
| 294 | The MSaaS Portal/queue management view is the replacement tool for Radius.&nb... |  |  | 7.5 | contentidea-kb |
| 295 | This document will walk through the migration of an SCCM workload for the pur... |  |  | 7.5 | contentidea-kb |
| 296 | This document walks through Co-management policy processing to understand how... |  |  | 7.5 | contentidea-kb |
| 297 | See&nbsp;4564202 |  |  | 7.5 | contentidea-kb |
| 298 | When performing a search using the &quot;All Devices&quot; the admin may expe... | If you are reading this article and the following ICMs are both resolved, con... | The following workarounds are suggested by the Intune product team.Rather tha... | 7.5 | contentidea-kb |
| 299 | Scenario is Azure AD Hybrid Join with Intune enrollment.&nbsp; The devices wh... | The customer had a GPO that was disabling the dmwappushsvc.&nbsp;https://docs... | Allow the dmwappushsvc service to run on the devices prior to enrollment. Aft... | 7.5 | contentidea-kb |
| 300 | This session is part IV of a series focused on Client Apps in Intune. &nbsp;T... |  |  | 7.5 | contentidea-kb |
| 301 | [UPDATED - As of Dec 15th 2019 the ONLY option will be a full MDM Authority R... |  |  | 7.5 | contentidea-kb |
| 302 | INTUNE: Android Enterprise :      FAQ  INTUNE: Android Enterprise:      Scopi... |  |  | 7.5 | contentidea-kb |
| 303 | After doing a silent installation of an app on a Zebra device (available in I... | This is caused by a known issue in Intune 1909. | As a work around to make the notification go away, press Clear All in the not... | 7.5 | contentidea-kb |
| 304 | The Kusto query below will tell you&nbsp;the number of iPad devices a custome... |  |  | 7.5 | contentidea-kb |
| 305 | Important re-branding noticeOffice 365 ProPlus is being renamed to&nbsp;Micro... |  |  | 7.5 | contentidea-kb |
| 306 | Below are the available troubleshooters for the Device Config - Certificates ... |  |  | 7.5 | contentidea-kb |
| 307 | For now, we can deploy Trusted certificates (.cer file) from Intune portal on... |  |  | 7.5 | contentidea-kb |
| 308 | The customer has enabled Android for Enterprise. &nbsp;&nbsp; The customer ha... | This issue with the Intune service. &nbsp; | To work around this issue we can setup a configuration policy&nbsp; with the ... | 7.5 | contentidea-kb |
| 309 | OverviewUse Intune to define update rings that specify how and when Windows a... |  |  | 7.5 | contentidea-kb |
| 310 | There was a change made in 1907 that reduced the minimum threshold from 90 to... | There are some questions around how this feature works | Q: What does the Device Cleanup Rule actually do to devices that have not che... | 7.5 | contentidea-kb |
| 311 | Rave will display the raw XML output of Intune policies.&nbsp; This can be he... |  |  | 7.5 | contentidea-kb |
| 312 | Devices are deleted from Intune by the device cleanup rule (value is set as 9... | If devices are powered back on then this behavior is by design. The clean up ... | This is expected behavior as documented at&nbsp;https://techcommunity.microso... | 7.5 | contentidea-kb |
| 313 | Learn how to&nbsp;collect logs to troubleshoot Intune related issues on Andro... |  |  | 7.5 | contentidea-kb |
| 314 | Update 02/02/2022: Due to regulatory compliance work that is pending, TSANet ... |  |  | 7.5 | contentidea-kb |
| 315 | Important - This might not apply to all ConnectWise control versions&nbsp;Sum... | TroubleshootingIt has been identified that the application ConnectWise Contro... | Next ActionsIf it was confirmed the service is not present nor the registry k... | 7.5 | contentidea-kb |
| 316 | Delete duplicate from&nbsp;https://internal.support.services.microsoft.com/en... | Delete | Delete | 7.5 | contentidea-kb |
| 317 | DELETE added info on internal KB&nbsp;4531095 | DELETE | DELETE | 7.5 | contentidea-kb |
| 318 | Welcome to Intune's workflow for VPN profile deployment. Here you will find e... |  |  | 7.5 | contentidea-kb |
| 319 | OLD=====Welcome to Intune's workflow for Email profile deployment. Here you w... |  |  | 7.5 | contentidea-kb |
| 320 | Welcome to Intune's workflow for&nbsp;VPN Profiles. Here you will find everyt... |  |  | 7.5 | contentidea-kb |
| 321 | See&nbsp;Troubleshooting Enrollment Failures - IntuneWiki |  |  | 7.5 | contentidea-kb |
| 322 | As we have been sharing over the past year, Microsoft Edge mobile supports th... |  |  | 7.5 | contentidea-kb |
| 323 | This article contains links to the Microsoft Ignite 2019 on-demand sessions a... |  |  | 7.5 | contentidea-kb |
| 324 | When following article&nbsp;https://docs.microsoft.com/en-us/intune/apps/apps... | This issue occurs when the &quot;intunewin&quot; file has been renamed after ... | Currently Edge is being updated via BUG&nbsp;https://msazure.visualstudio.com... | 7.5 | contentidea-kb |
| 325 | Error Message:&nbsp;Software not foundThe software that you tried to access w... |  |  | 7.5 | contentidea-kb |
| 326 | Scenario: Admin would like to delete an app, but the app is not visible from ... |  |  | 7.5 | contentidea-kb |
| 327 | Coming soon: Step-by-step configuration of common app deployment scenarios. |  |  | 7.5 | contentidea-kb |
| 328 | Coming soon.... |  |  | 7.5 | contentidea-kb |
| 329 | The Intune ISE integration architecture is shown below:  Cisco Documentation ... |  |  | 7.5 | contentidea-kb |
| 330 | This document provides guidance on how to get assistance/escalate a Citrix Ne... |  |  | 7.5 | contentidea-kb |
| 331 | Welcome to Intune's workflow for App Configuration&nbsp;Policies. Here you wi... |  |  | 7.5 | contentidea-kb |
| 332 | See&nbsp;https://internal.support.services.microsoft.com/en-us/help/4532867 |  |  | 7.5 | contentidea-kb |
| 333 | Coming soon: Step-by-steps for configuring custom policies in common customer... |  |  | 7.5 | contentidea-kb |
| 334 | How to Configure Managed Google Play web linksRequirementsAndroid Enterprise ... |  |  | 7.5 | contentidea-kb |
| 335 | Password complexity value&nbsp;&quot;Numbers, lowercase and uppercase letters... | Password complexity value&nbsp;&quot;Numbers, lowercase and uppercase letters... | This is the supported value that should be used for windows 10 desktop device... | 7.5 | contentidea-kb |
| 336 | Outdated Information, this article will be deleted |  |  | 7.5 | contentidea-kb |
| 337 | Teams is being deployed via Intune with the Office 365 Suite.Once the Teams i... | Teams team mention that there were some similar issues on previous versions.M... | Change the distribution      channel Monthly -Targeted. Limitation: &nbsp; &n... | 7.5 | contentidea-kb |
| 338 | Apple’s Device Management documentation has now moved from the .PDF’s to the ... |  |  | 7.5 | contentidea-kb |
| 339 | Application shortcut stops working after applying an application update in Mu... |  |  | 7.5 | contentidea-kb |
| 340 | If you desire to populate the Notes field on an Intune device via powershell ... |  |  | 7.5 | contentidea-kb |
| 341 | When a user with a custom Intune Role, is updating an Application (editing it... | On the Custom role Assignments, the Scope is configured for a specific group ... | Add the group of users to which the application is assigned, to the Scope of ... | 7.5 | contentidea-kb |
| 342 | A user who does not have any roles assigned in Intune or in Azure Active Dire... | This is due to having the &quot;Service Administrator&quot; role assigned as ... | To resolve this issue, remove that user from &quot;Service Administrators&quo... | 7.5 | contentidea-kb |
| 343 | This should be a rare scenario but if you get a Critsit where the customer ab... |  |  | 7.5 | contentidea-kb |
| 344 | Root Cause OverviewRoot Cause Analysis (RCA) is the process of identifying th... |  |  | 7.5 | contentidea-kb |
| 345 | See Content Request Description field |  |  | 7.5 | contentidea-kb |
| 346 | Steps as following:&nbsp;  In Intune&gt; Device configuration. Create an Admi... |  |  | 7.5 | contentidea-kb |
| 347 | When a user taps on notification in company portal app to setup certificates ... | PFX certificate has been imported using unsupported padding scheme.&nbsp;The ... | Delete and re-upload PFX certificate using supported padding scheme.&nbsp;Sup... | 7.5 | contentidea-kb |
| 348 | This articles intent is directed towards providing those whom are new to the ... |  |  | 7.5 | contentidea-kb |
| 349 | Walk ups, interrupt driven days are common in all positions and all companies... |  |  | 7.5 | contentidea-kb |
| 350 | As part of working a customer support case, you may encounter a situation whe... |  |  | 7.5 | contentidea-kb |
| 351 | Enrolling a Zebra device into Intune involves five steps: 1.&nbsp;&nbsp;&nbsp... |  |  | 7.5 | contentidea-kb |
| 352 | This article outlines the process for handling an ICM on a GCC High case.An I... |  |  | 7.5 | contentidea-kb |
| 353 | There are several situations where you want to create a test environment on V... |  |  | 7.5 | contentidea-kb |
| 354 | JAMF Pro CSS Case Sheet TemplateThis is an internal facing template to assist... |  |  | 7.5 | contentidea-kb |
| 355 | White glove gives a red screen and the&nbsp;Microsoft-Windows-User Device Reg... | This can happen if Azure AD can’t find an AAD device object for the device th... | To resolve this issue, remove the device from AAD, Intune, and Autopilot, the... | 7.5 | contentidea-kb |
| 356 | White glove gives a red screen and no other error. | This can occur if white glove is used on a virtual machine (VM). | White glove is not supported on a VM. Use a supported physical PC only. | 7.5 | contentidea-kb |
| 357 | Steve Rachui has published a video training session on&nbsp;Intune Policy Set... |  |  | 7.5 | contentidea-kb |
| 358 | While creating policy sets if the admin add a policy to the management sectio... | This could be because the targeted policy&nbsp;have been migrated from Silver... | To create a new policy in Ibiza console.&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &n... | 7.5 | contentidea-kb |
| 359 | WIP policies are applied      to share point sites and few other applications... | The issue was where SharePoint/One Drive is dynamically creating a ZIP archiv... | We added the sub domain &quot;.SVC.MS &quot; in the WIP policies rather than ... | 7.5 | contentidea-kb |
| 360 | App Protection Policy / MAM requirements setup for Citrix Secure Mail |  |  | 7.5 | contentidea-kb |
| 361 | When you attempt to sync Windows 10 device, it fails with error&nbsp;0x801901... | This happens when the device is behind a proxy that does SSL inspection.&nbsp; | Disable SSL inspection or SSL offloading on the proxy.&nbsp; | 7.5 | contentidea-kb |
| 362 | The Jamf Connection status shows as &quot;Active”, but the last sync is not c... | This connection will show Active because neither of the App IDs has changed i... | 1.&nbsp;&nbsp;&nbsp;&nbsp; Please contact one of the Jamf SME’s to have visib... | 7.5 | contentidea-kb |
| 363 | Consider the following scenario: You have two Autopilot profiles. One profile... | This behavior is by design and expected. Once a corporate-owned, Intune-enrol... | In this scenario there are three potential work arounds: 1. Create a single A... | 7.5 | contentidea-kb |
| 364 | This article outlines the steps to schedule planned and unplanned out of offi... |  |  | 7.5 | contentidea-kb |
| 365 | Intune portal populates the virtual IMEI instead of the physical IMEI. | The IMEI value will be collected during the enrolment process, so it will get... | The best way to register the physical IMEI would be to use the normal SIM dur... | 7.5 | contentidea-kb |
| 366 | This article describes how to troubleshoot back-end service timeouts in Intun... |  | To troubleshoot these types of issues, start by obtaining an F12 trace from t... | 7.5 | contentidea-kb |
| 367 | Customer complaint examples:Since enrolling with Intune I cannot use a pin to... | The Apple Watch does not have a passcode set, but has Wrist Detection enabled. | If Intune is forcing a numeric device passcode, the user needs to set an Appl... | 7.5 | contentidea-kb |
| 368 | &lt;!DOCTYPE html&gt; &lt;html&gt; &lt;body&gt; &lt;iframe height=&quot;480&q... |  |  | 7.5 | contentidea-kb |
| 369 | During WIP case troubleshooting, you may need to collect a live trace while t... |  |  | 7.5 | contentidea-kb |
| 370 | When exporting the &quot;Incomplete user enrollments&quot; report from the In... |  |  | 7.5 | contentidea-kb |
| 371 | This article describes steps customers can take to determine if an installed ... |  |  | 7.5 | contentidea-kb |
| 372 | This simple workflow will contain a list of troubleshooting resources &amp; k... |  |  | 7.5 | contentidea-kb |
| 373 | Correctly troubleshooting Intune App Protection (MAM) issues requires collect... |  |  | 7.5 | contentidea-kb |
| 374 | Gathering Logs on a Surface Hub is different than normal.&nbsp;The customer c... |  |  | 7.5 | contentidea-kb |
| 375 | Here we will cover some of the key-points to know about Surface Hubs.&nbsp;Th... |  |  | 7.5 | contentidea-kb |
| 376 | We recently posted&nbsp;MC217665 for a 30 days notice that we will remove the... |  | If a customer wants to request moving off the July 31            st      ... | 7.5 | contentidea-kb |
| 377 | Delete Article. |  |  | 7.5 | contentidea-kb |
| 378 | Effective Group Membership (EGM) is the mechanism by which Intune queries Azu... |  |  | 7.5 | contentidea-kb |
| 379 | This article is a compilation of error codes from the sources below for easy ... |  |  | 7.5 | contentidea-kb |
| 380 | When looking at the NDESconnector.log you are seeing communication errors. | This could be caused by TLS 1.2 being turned off on the server. | Check that the below regkey if it exists is set as follows  [HKEY_LOCAL_MACHI... | 7.5 | contentidea-kb |
| 381 | This article contains various URLs useful to Intune Support Engineers. Feel f... |  |  | 7.5 | contentidea-kb |
| 382 | CMETBOT was created by the&nbsp;Critical Situation Management and Escalation ... |  |  | 7.5 | contentidea-kb |
| 383 | Intune PowerShell deployment kept failing in deployment. | Customer put&nbsp;Set-ExecutionPolicy RemoteSigned in script, which is not re... | Remove the specific beginning content of&nbsp;Set-ExecutionPolicy RemoteSigne... | 7.5 | contentidea-kb |
| 384 | This guide will walk you through installing and general usage of the Rave Rea... |  |  | 7.5 | contentidea-kb |
| 385 | 1. An iOS device fails to download the management profile and the following e... | This problem can occur if the device is running a beta version of iOS. Micros... | To resolve the issue, the customer can do either of the following: Downgrade ... | 7.5 | contentidea-kb |
| 386 | You have integrated Intune with Azure Log Analytics, but when navigating to I... | When you integrate Intune with Azure Log Analytics and set up a Diagnostic se... | In order to update the resource URL path in Intune, you go to Reports &gt; Di... | 7.5 | contentidea-kb |
| 387 | This article describes the steps necessary to configuring Bitlocker using Mic... |  |  | 7.5 | contentidea-kb |
| 388 | When troubleshooting UI or admin portal problems, it is often necessary to ge... |  |  | 7.5 | contentidea-kb |
| 389 | Some customers might require their ATP Data Storage location to be changed.Th... |  |  | 7.5 | contentidea-kb |
| 390 | Steps to reproduce:            ‎     1. During enrollment, after logging i... | This is a Google DPC bug as of August 2020 | Google is rolling out a fix for the bug soon.&nbsp; The fix should be availab... | 7.5 | contentidea-kb |
| 391 | Going into Client Apps\Discovered Apps there is inconsistency in accurately r... |  |  | 7.5 | contentidea-kb |
| 392 | Starting from Intune Service release 2007 you can choose Device Experience fo... |  |  | 7.5 | contentidea-kb |
| 393 | Everyone agrees that having screen shots in an article can be extremely helpf... |  |  | 7.5 | contentidea-kb |
| 394 | This article will provide a checklist for all steps required to configure Co-... |  |  | 7.5 | contentidea-kb |
| 395 | In multi app mode the logged on user is allowed to run multiple apps, but sti... |  |  | 7.5 | contentidea-kb |
| 396 | In certain scenarios you may need to change the ownership of a KB article. Th... |  |  | 7.5 | contentidea-kb |
| 397 | PREMIER: Case continuation due to end of shift FOR CRITSITS&nbsp;  Record the... |  |  | 7.5 | contentidea-kb |
| 398 | Any requests to add, remove or modify an Intune support topic can be submitte... |  |  | 7.5 | contentidea-kb |
| 399 | If you experience an issue using Service Desk Case, you can open a support ti... |  |  | 7.5 | contentidea-kb |
| 400 | This article documents the support process for customers that have Intune inc... |  |  | 7.5 | contentidea-kb |
| 401 | If you have configured Endpoint Analytics in your tenant, you will see device... | If you have devices that are not reporting in the Intune portal even if  it s... | In order to fix these devices you need to deploy a powershell script to  fix ... | 7.5 | contentidea-kb |
| 402 | Ellipsis goes here:&nbsp;{}{{}}{}{{}}{{ }}{{ &nbsp; &nbsp; }}This is code but... |  |  | 7.5 | contentidea-kb |
| 403 | *** Please delete / remove *** |  |  | 7.5 | contentidea-kb |
| 404 | Who should follow this procedure?Intune Frontline support engineers (SEs) Wha... |  |  | 7.5 | contentidea-kb |
| 405 | Procedure: Advisory Support for Intune Professional ticket &nbsp;Who should u... |  |  | 7.5 | contentidea-kb |
| 406 | Microsoft releases many features in a preview capacity to customers to captur... |  |  | 7.5 | contentidea-kb |
| 407 | The list below contains the names and descriptions of all known WSUS error co... |  |  | 7.5 | contentidea-kb |
| 408 | The list below contains the names and descriptions of all known WSUS error co... |  |  | 7.5 | contentidea-kb |
| 409 | The Intune Engineering group and various community members contribute to the ... |  |  | 7.5 | contentidea-kb |
| 410 | Auto enrollment of co-managed devices fails with error&nbsp;0x80180018 and th... | &quot;UserEmail&quot; field under&nbsp;HKEY_LOCAL_MACHINE\SYSTEM\CurrentContr... | Correct the &quot;UserEmail&quot; value by matching it with a working machine... | 7.5 | contentidea-kb |
| 411 | The information contained in this article is meant to provide general guideli... |  |  | 7.5 | contentidea-kb |
| 412 | This article contains the troubleshooting steps for when you see the followin... |  | There are two ways to check if Intune Service Principal is disabledRAVE Porta... | 7.5 | contentidea-kb |
| 413 | The purpose of this article is to provide initial data capture and troublesho... |  |  | 7.5 | contentidea-kb |
| 414 | This Article contain a full guide for the Intune Frontline engineers to creat... |  |  | 7.5 | contentidea-kb |
| 415 | Global administrators were unable to set up co-management and getting an Acce... | The customer selected Azure US Government Cloud environment on the Tenant Onb... | We captured a fiddler trace and confirmed the request was being sent to diffe... | 7.5 | contentidea-kb |
| 416 | IT admins were unable to set up co-management due to the &quot;Configure co-m... | This can occur if the account logged in the console does not have the proper ... | This can be changed by another admin with the Security Scope set to All in th... | 7.5 | contentidea-kb |
| 417 | Use the process below to request assistance with other teams within in Rave f... |  |  | 7.5 | contentidea-kb |
| 418 | Restricted GCC High communication channels for Intune Support. Membership to ... |  |  | 7.5 | contentidea-kb |
| 419 | The process below outlines how Intune GCC High support engineers are notified... |  |  | 7.5 | contentidea-kb |
| 420 | The customer deploys the Intune Administrative Template profile with many set... | The Intune product group confirmed that this is currently a known issue. | The Intune product group confirmed that this is currently a known issue. When... | 7.5 | contentidea-kb |
| 421 | You are unable to see available apps on&nbsp;https://portal.manage.microsoft.... | This is because the browser doesn't have the capability to detect the device. | To workaround this issue, select the device -&nbsp;https://portal.manage.micr... | 7.5 | contentidea-kb |
| 422 | What is it? The Intune Helper is a tool that contains the most common templat... |  |  | 7.5 | contentidea-kb |
| 423 | The Basic Mobility and Security (formerly “MIFO” (Microsoft Intune for Office... | The MIFO migration feature assumes any user licensed for Intune should immedi... | 1)     Verify whether the customer has the “     UserLicensingForEDU     ”... | 7.5 | contentidea-kb |
| 424 | Most users that had Google Developer account know how to reach out to Google,... |  |  | 7.5 | contentidea-kb |
| 425 | On November 2020 the new Google Play Console was introduced to replace Develo... |  |  | 7.5 | contentidea-kb |
| 426 | The customer enabled one Administrative template policy as e.g. below:When cu... | Switching the setting back to ‘Not configured’ will not turn off the setting ... | Turn off the policy by switching the setting to ‘Disabled.’ | 7.5 | contentidea-kb |
| 427 | Co-managed device un-enrolls from Intune automatically and the following even... | This can occur if the AutoEnrollMDM GPO is configured on the device. | To resolve this problem, un-assign the AutoEnrollMDM GPO from the device. | 7.5 | contentidea-kb |
| 428 | When troubleshooting Intune problems with Surface devices, collecting logs fi... |  |  | 7.5 | contentidea-kb |
| 429 | Consider the following scenario:The enhanced jailbreak detection feature has ... | This occurs because the enhanced jailbreak detection feature was disabled for... | The reported behavior is currently expected as a result of the&nbsp;Enhanced ... | 7.5 | contentidea-kb |
| 430 | You disable the JAMF integration with Intune in your environment, however the... | This is currently by-design. The DEV team confirmed that the status will stay... | By-design behavior. | 7.5 | contentidea-kb |
| 431 | Whenever you work on a project&nbsp;that falls outside of regular case work, ... |  |  | 7.5 | contentidea-kb |
| 432 | Customers may request a Post Incident Review (PIR), also referred to as Root ... |  |  | 7.5 | contentidea-kb |
| 433 | In addition to&nbsp;https://internal.support.services.microsoft.com/en-us/hel... |  |  | 7.5 | contentidea-kb |
| 434 | See&nbsp;Autopilot - Overview (visualstudio.com) |  |  | 7.5 | contentidea-kb |
| 435 | This article lists the subtasks for&nbsp;Configure Autopilot settings and pro... |  |  | 7.5 | contentidea-kb |
| 436 | This article lists the subtasks for&nbsp;Understanding and troubleshooting on... |  |  | 7.5 | contentidea-kb |
| 437 | This article lists the subtasks for&nbsp;Understanding and troubleshooting Az... |  |  | 7.5 | contentidea-kb |
| 438 | This article lists the subtasks for&nbsp;Demonstrate understanding of hybrid ... |  |  | 7.5 | contentidea-kb |
| 439 | This article lists the subtasks for&nbsp;Understanding and troubleshooting ex... |  |  | 7.5 | contentidea-kb |
| 440 | This article lists the subtasks for&nbsp;Troubleshooting failed devices. |  |  | 7.5 | contentidea-kb |
| 441 | MC238947 Intune Plan for Change: Windows 10 Enterprise multi-session public p... |  |  | 7.5 | contentidea-kb |
| 442 | This article contains commonly used abbreviations, initialisms and acronyms. ... |  |  | 7.5 | contentidea-kb |
| 443 | Customer has set a screensaver device configuration policy from Intune (e.g. ... | This is by design per ICM Incident-222522587 Details - IcM (microsofticm.com)... | By-design behavior. | 7.5 | contentidea-kb |
| 444 | There’s a known issue within  the Troubleshooting + support blade where the D... | This occurs because there is a gap or bug in the App Install history computat... | This is a known issue that the app install lifecycle status  is incorrect and... | 7.5 | contentidea-kb |
| 445 | When attempting to remove a&nbsp;device from AzureAD, you receive the followi... | This occurs because the associated Intune device record still exists even tho... | There are two potential work arounds:1. If you allow the device to check-in t... | 7.5 | contentidea-kb |
| 446 | Device Diagnostics for Windows 10 is a great QoL feature for our customers an... |  |  | 7.5 | contentidea-kb |
| 447 | Intune 2102 Features Recap: Videos and Docs for Intune 2102  Microsoft releas... |  |  | 7.5 | contentidea-kb |
| 448 | Duplicate content to KB&nbsp;4611878&nbsp;which was created on March 5, 2021.... |  |  | 7.5 | contentidea-kb |
| 449 | When working issues related to Android, and specifically those that need coll... |  |  | 7.5 | contentidea-kb |
| 450 | Each day until noted otherwise, two individuals from IET are tasked with the ... |  |  | 7.5 | contentidea-kb |
| 451 | Delete this content since a new KB was created with the updated steps(Old) In... |  |  | 7.5 | contentidea-kb |
| 452 | When working customer issues, you may find that the information you need to h... |  |  | 7.5 | contentidea-kb |
| 453 | Below are some important CompanyPortal log messages for a normal, error-free ... |  |  | 7.5 | contentidea-kb |
| 454 | Below are some important OMADM log messages for a normal, error-free required... |  |  | 7.5 | contentidea-kb |
| 455 | This article describes how to troubleshoot the Microsoft Store For Business a... |  |  | 7.5 | contentidea-kb |
| 456 | We’ve all put in a lot of work to make DDX (Design, Delivery &amp; Execution,... |  |  | 7.5 | contentidea-kb |
| 457 | There is a filter option in the Microsoft Endpoint Manager admin center that ... |  |  | 7.5 | contentidea-kb |
| 458 | The Apps&amp;Infra Windows Commercial Pod Org is detailed below.&nbsp;Support... |  |  | 7.5 | contentidea-kb |
| 459 | Google Admin Toolbox provides a tool called HAR Analyzer which allows you to ... |  |  | 7.5 | contentidea-kb |
| 460 | This article covers deploying the Microsoft Defender for Endpoint for macOS, ... |  |  | 7.5 | contentidea-kb |
| 461 | This article describes the steps to configure automatic email notifications a... |  |  | 7.5 | contentidea-kb |
| 462 | IMPORTANT! Updated January 30, 2023: Please be aware that the process herein ... |  |  | 7.5 | contentidea-kb |
| 463 | The Intune Escalation Team (IET) uses the templates from this site to file In... |  |  | 7.5 | contentidea-kb |
| 464 | This article will illustrate how to setup the hybrid AAD join structure in VM... |  |  | 7.5 | contentidea-kb |
| 465 | This article illustrates how to build a MEMCM environment using VMAS templates |  |  | 7.5 | contentidea-kb |
| 466 | After the last update release on 3/29/21, some customers get stuck in an “upg... |  |  | 7.5 | contentidea-kb |
| 467 | You can use the ETLMan Teams channel to automatically convert your ETL traces... |  |  | 7.5 | contentidea-kb |
| 468 | When creating app configuration policy with the IntuneMAMAllowedAccountsOnly ... | This behavior is by design. | This error appears if you attempt to use these values in a Managed apps&nbsp;... | 7.5 | contentidea-kb |
| 469 | The Objectives of this lab manual guidance are:During this session, new-hire ... |  |  | 7.5 | contentidea-kb |
| 470 | Prerequisites - Item&nbsp;149362Lab Experience - Item 149364Verifying workflo... |  |  | 7.5 | contentidea-kb |
| 471 | We recently found customers reporting that when enabling Audit Logs and selec... | This occurs when not all subscriptions are selected in the Default subscripti... |  | 7.5 | contentidea-kb |
| 472 | This article provides with a PowerShell code that can be used to decode and m... |  |  | 7.5 | contentidea-kb |
| 473 | Logs for advanced troubleshooting:iOSiOS Console logAndroidAndroid Company Po... |  |  | 7.5 | contentidea-kb |
| 474 | This lab serves to:Improve a Support Engineer's knowledge of co-management fr... |  |  | 7.5 | contentidea-kb |
| 475 | The article briefly outlines how to approach political level discussions and ... | Due to the Brexit, a customer might complain that the Intune service is locat... | There is neither a UK sovereign instance of Intune nor is there a plan to cre... | 7.5 | contentidea-kb |
| 476 | This article describes the following aspects of an Intune Workflow:The purpos... |  |  | 7.5 | contentidea-kb |
| 477 | To resolve this issue, follow the directions&nbsp;on the page linked above&nb... |  |  | 7.5 | contentidea-kb |
| 478 | To resolve this issue, follow the directions on the page linked above to dele... |  |  | 7.5 | contentidea-kb |
| 479 | The video steps through how to access the Intune Data Warehouse using Postman... |  |  | 7.5 | contentidea-kb |
| 480 | Follow the steps below to collect Company Portal logs on Android MAM-WE. This... |  |  | 7.5 | contentidea-kb |
| 481 | The information below was taken from the blog post here by&nbsp;Marc Nahum, S... |  |  | 7.5 | contentidea-kb |
| 482 | Ask TA is a tool Support Engineers can use to submit requests to their Techni... |  |  | 7.5 | contentidea-kb |
| 483 | Welcome to Intune's workflow for&nbsp;Intune Windows 10 quality updates (prev... |  |  | 7.5 | contentidea-kb |
| 484 | This article describes how to configure the desktop wallpaper for end users u... |  |  | 7.5 | contentidea-kb |
| 485 | This article describes the steps to configure the new Unified Connector. |  |  | 7.5 | contentidea-kb |
| 486 | After adding Power BI desktop to the protected app list as a desktop app, att... | This can occur if not all processes for the app have been added to the protec... | To resolve this problem, create a AppLocker file which includes all these pro... | 7.5 | contentidea-kb |
| 487 | IOS OS version is leveraging hardware inventory. According to official articl... |  |  | 7.5 | contentidea-kb |
| 488 | This article describes how to collaborate between the Intune and Outlook teams. |  |  | 7.5 | contentidea-kb |
| 489 | Duplicate of&nbsp;https://internal.support.services.microsoft.com/en-us/help/... |  |  | 7.5 | contentidea-kb |
| 490 | Welcome to Intune's workflow for Mobile Threat Defense: Zimperium. Here you w... |  |  | 7.5 | contentidea-kb |
| 491 | Some sample scenarios can be reviewed from our public documentation -&nbsp;Zi... |  |  | 7.5 | contentidea-kb |
| 492 | The following are the available threat levels:    Note: Zimperium recommends ... |  |  | 7.5 | contentidea-kb |
| 493 | The Intune support team supports: Configuring Zimperium integration with Intu... |  |  | 7.5 | contentidea-kb |
| 494 | Coming soon...&nbsp; |  |  | 7.5 | contentidea-kb |
| 495 | Zimperium MTD connector with Intune - Intune on Azure / Microsoft Docs https:... |  |  | 7.5 | contentidea-kb |
| 496 | For any question from the Intune side please post your question in the Third ... |  |  | 7.5 | contentidea-kb |
| 497 | Docker runs as part of the Microsoft Tunnel Gateway – MTG – solution.        ... | Server has multiple instances of Docker running on the same server. They were... | Removed Docker installed through snap.Restarted the serverContainers showed u... | 7.5 | contentidea-kb |
| 498 | Quick Assist (QA) allows Microsoft customers who need assistance with their M... |  |  | 7.5 | contentidea-kb |
| 499 | When an application with Intune SDK is used in Android 11 devices after enter... | This occurs because&nbsp;Android 11 introduces changes related to package vis... | To resolve this issue, customers will need to declare the broker applications... | 7.5 | contentidea-kb |
| 500 | There are a few reasons you may want to create a case on behalf of a customer... |  |  | 7.5 | contentidea-kb |
| 501 | The Intune Data Warehouse provides the customer with the ability to pull deta... | This property may not be populated by the service. The &quot;office365Version... | Our recommendation is that customers do not use this property for reporting p... | 7.5 | contentidea-kb |
| 502 | Format-IntuneDiagData.ps1 (FIDD)&nbsp;is a stand-alone script to organize dat... |  |  | 7.5 | contentidea-kb |
| 503 | Intune support works out of Rave as our primary CRM tool, but we also have ac... |  |  | 7.5 | contentidea-kb |
| 504 | This Document will cover the following: Process Overview. Process Flow Chart.... |  |  | 7.5 | contentidea-kb |
| 505 | Company Portal 2110 went out around Oct. 4th with support for Google API 30. ... |  |  | 7.5 | contentidea-kb |
| 506 | When troubleshooting IBM MaaS360 partner compliance management integration ca... |  |  | 7.5 | contentidea-kb |
| 507 | In COPE devices, the company portal is been installed and then suddenly disap... | This is an expected behaviour. The company portal app would be automatically ... |  | 7.5 | contentidea-kb |
| 508 | When auto-enrolling a hybrid joined device, the enrollment fails to trigger a... | This can occur if the task is running as System and the user has a proxy conf... | To resolve this problem, the proxy needs to enabled for the machine context. ... | 7.5 | contentidea-kb |
| 509 | Members of the security team are sending emails similar to the following to c... |  |  | 7.5 | contentidea-kb |
| 510 | This articles describes basic troubleshooting and data you should gather when... |  |  | 7.5 | contentidea-kb |
| 511 | This article documents the myAccess projects that IET members commonly requir... |  |  | 7.5 | contentidea-kb |
| 512 | This article is an overview of flow of App Protection Policy and how the poli... |  |  | 7.5 | contentidea-kb |
| 513 | In this example, we have considered the user is attempting to access the Outl... |  |  | 7.5 | contentidea-kb |
| 514 | Recently we have had a few cases come into Microsoft, for customers concerned... |  |  | 7.5 | contentidea-kb |
| 515 | The customer receives a 503 error in Cisco ISE portal (or any other NAC Partn... | Hope the above understanding of break-up of the 4 hours is understandable, el... |  | 7.5 | contentidea-kb |
| 516 | This article will help you to enforce automatic connectivity of Intune Wifi p... |  |  | 7.5 | contentidea-kb |
| 517 | Normally when you need to edit a public docs article you can follow the steps... |  |  | 7.5 | contentidea-kb |
| 518 | Client are connecting the MTG VPN successfully.  In this scenario, the client... | The customer didn't have affinity (Sticky Session) enabled on the load balanc... | We asked the customer to enable Client IP affinity (Sticky Session) on the Lo... | 7.5 | contentidea-kb |
| 519 | Clients are successful in connecting to MTG VPN. The clients can successfully... | Docker has a default IP that is used for the Docker Gateway network interface... | This scenario occurs because of a default configuration in Docker that confli... | 7.5 | contentidea-kb |
| 520 | This document describes the process to be followed by CSS engineers when crea... |  |  | 7.5 | contentidea-kb |
| 521 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER ... |  |  | 7.5 | contentidea-kb |
| 522 | Kiosk user is immediately signed out and multi app Kiosk profile fails with e... | This is caused when Application Identity service (AppIDSvc) fails to start.&n... | Please engage Windows Performance team to troubleshoot service startup issue. | 7.5 | contentidea-kb |
| 523 | This article describes how to use application-based authentication (app auth)... |  |  | 7.5 | contentidea-kb |
| 524 | The purpose of this document is to provide a guide on how to set-up a Windows... |  |  | 7.5 | contentidea-kb |
| 525 | Forcing a manual sync or restart of a Windows device from the Intune portal d... | This can occur if the&nbsp;Microsoft Account Sign-in Assistant service is dis... | To resolve this problem, enable the Windows service called&nbsp;Microsoft Acc... | 7.5 | contentidea-kb |
| 526 | This article describes how to to block USB devices while still allowing 3G do... |  |  | 7.5 | contentidea-kb |
| 527 | The Surface Commercial Engineering team owns support for the Surface Manageme... |  |  | 7.5 | contentidea-kb |
| 528 | Windows devices get stuck when trying to retrieve SCEP certificates. | This can occur if the SCEP profile is being deployed to both a&nbsp;Users&nbs... | To resolve this problem, remove the assignment targeting users. With only dev... | 7.5 | contentidea-kb |
| 529 | Kusto, also known as Azure Data Explorer&nbsp;is a fully managed, high-perfor... |  |  | 7.5 | contentidea-kb |
| 530 | When working a customer case, it is often helpful to search case data for kno... |  |  | 7.5 | contentidea-kb |
| 531 | This page is in development and not complete. For any support boundaries not ... |  |  | 7.5 | contentidea-kb |
| 532 | Log limit can be configured on the Linux OS itself by modifying the journald ... |  |  | 7.5 | contentidea-kb |
| 533 | Consider a scenario where you need to collect Process Monitor data while a us... |  |  | 7.5 | contentidea-kb |
| 534 | For customers concerned about the collection of telemetry by the Intune servi... |  |  | 7.5 | contentidea-kb |
| 535 | Overview of Microsoft Graph Microsoft Graph is the gateway to data and intell... |  |  | 7.5 | contentidea-kb |
| 536 | We often talk about the importance of content to our business, but we don't o... |  |  | 7.5 | contentidea-kb |
| 537 | To begin, the Intune PG (Support as a Feature, “SaaF”) does not recognize SfM... |  |  | 7.5 | contentidea-kb |
| 538 | Can't remove MSFB from Microsoft Endpoint Manager because the button is disab... | The delete button is disabled in MEM portal by design. You must refund an app... | How to delete/remove a Microsoft for Business store app: https://docs.microso... | 7.5 | contentidea-kb |
| 539 | When you deploy Kiosk profile to a device, the user fails to get Kiosk config... | This can occur if the logged in user is a member of over 99 groups.&nbsp; | To resolve this problem, reduce the number of groups the user is a member of.... | 7.5 | contentidea-kb |
| 540 | If a user tries to use a Microsoft 365 Business Standard license on their Clo... |  | The user should uninstall the version of Office installed on their Cloud PC a... | 7.5 | contentidea-kb |
| 541 | The customer would like to upgrade&nbsp;Windows 365 Business Cloud PCs runnin... |  | For the record, the Official stance is that &quot;In Place&quot; upgrades are... | 7.5 | contentidea-kb |
| 542 | Customer wants to be able to sign in with more than one user account on the s... |  | This feature is not supported at this time for Cloud PCs. Customer can submit... | 7.5 | contentidea-kb |
| 543 | When users sign into their Cloud PCs from windows365.microsoft.com, the Micro... |  | To turn on Narrator when accessing your Cloud PC from the web interface: Go t... | 7.5 | contentidea-kb |
| 544 | Some websites that are accessed from a Cloud PC use its IP address to  determ... |  | Set search engine location Users can manually set their internet search engin... | 7.5 | contentidea-kb |
| 545 | Information about Integrate Intune with MDATP process |  |  | 7.5 | contentidea-kb |
| 546 | This article describes how you can add some help-desk users to an end user’s ... |  |  | 7.5 | contentidea-kb |
| 547 | Want to know how to create a new KB article or update our product docs? This ... |  |  | 7.5 | contentidea-kb |
| 548 | sadasdfsdds This is right |  |  | 7.5 | contentidea-kb |
| 549 | Fastlane is a Quality-of-Service (QoS) tool set on Cisco wireless controllers... |  |  | 7.5 | contentidea-kb |
| 550 | If you have a device that is not showing in Endpoint Analytics, follow the tr... |  |  | 7.5 | contentidea-kb |
| 551 | After creating and assigning a Settings Catalog policy for Edge that contains... | This can occur if there are more than 250 settings in the policy (or greater ... | This limit is by design for Intune prior to&nbsp;build 2208 (the August 2022 ... | 7.5 | contentidea-kb |
| 552 | Intune supports sending 4 types of service data to the Log Analytics service.... |  |  | 7.5 | contentidea-kb |
| 553 | The article is meant to be used for a quick and easy deployment of the Slack ... |  |  | 7.5 | contentidea-kb |
| 554 | Intune Escalation Team engineers often have IcMs filed with the CxE team and ... |  |  | 7.5 | contentidea-kb |
| 555 | The server container is restarting. Docker shows the status of the server con... | In the Server Configuration policy, the customer had a split tunnel route for... | Remove the invalid route from the Server Configuration. &quot;0.0.0.0/0&quot; | 7.5 | contentidea-kb |
| 556 | Attempting to import an&nbsp;ADMX template for AVD Terminal setup (RDP Shortp... | This can occur if the XML contains&nbsp;references to the Terminal Server ADM... | To resolve this problem,&nbsp;manually edit the ADMX file. Delete the two lin... | 7.5 | contentidea-kb |
| 557 | The Intune connector service intermittently stops and the connector shows a s... | This can occur if an incorrect OU path is specified in the domain join profile. | To resolve this problem, make sure the OU path in the domain join profile is ... | 7.5 | contentidea-kb |
| 558 | We have a 30 minute presentation on Server Name Validation process linked bel... |  |  | 7.5 | contentidea-kb |
| 559 | This is an informational article to document the current cap limit for Autopi... |  |  | 7.5 | contentidea-kb |
| 560 | What's My Workspace:  MyWorkspace is simply an Evolution of the VMAS, While t... |  |  | 7.5 | contentidea-kb |
| 561 | Customer had multiple blank Autopilot hash entries without serial number, man... |  |  | 7.5 | contentidea-kb |
| 562 | When trying to deploy an MSI application you receive the following error: Err... | This can occur if the /qn parameter is not included on the command line for t... | To resolve this issue,&nbsp;add&nbsp;&quot;Command-line arguments&quot;&nbsp;... | 7.5 | contentidea-kb |
| 563 | Users are unable to find the&nbsp;Cloud attach devices (Preview report)&nbsp;... |  |  | 7.5 | contentidea-kb |
| 564 | This article explains the workload capability values of a co-managed Windows ... |  |  | 7.5 | contentidea-kb |
| 565 | This article provides resources concerning the new Microsoft Store app backed... |  |  | 7.5 | contentidea-kb |
| 566 | Intune deployment of a DMG Application with a EULA results in 'Bundle IDs are... |  |  | 7.5 | contentidea-kb |
| 567 | After creating and assigning an&nbsp;Access Control Policy (ACP) to disable o... | This can occur if you copy and paste a key in ACP, as this might result in a ... | To resolve this problem, correct or recreate the policy and reassign it to th... | 7.5 | contentidea-kb |
| 568 | This article provides the steps necessary to manage a custom image for MTR de... |  |  | 7.5 | contentidea-kb |
| 569 | Beginning on February 6, 2023, the process to access Azure Support Center (AS... |  |  | 7.5 | contentidea-kb |
| 570 | In this article we learn how to integrate MDE and Intune in order to push sec... |  |  | 7.5 | contentidea-kb |
| 571 | If a customer has deleted the Intune Connector for AD off their onsite server... |  | To resolve this problem, first run this Graph command to see a list of the av... | 7.5 | contentidea-kb |
| 572 | The purpose of this article is to help you better understand the changes made... |  |  | 7.5 | contentidea-kb |
| 573 | The customer is accessing the Users blade via https://intune.microsoft.com. W... | The portal that is available at&nbsp;https://intune.microsoft.com&nbsp;is not... | ** Intune is in a constant state of change. If this article no longer applies... | 7.5 | contentidea-kb |
| 574 | Microsoft Stream (classic)&nbsp;is now deprecated. As of February 23rd, 2023,... |  |  | 7.5 | contentidea-kb |
| 575 | Relevant information collected with Collect Diagnostics action from Intune co... |  |  | 7.5 | contentidea-kb |
| 576 | The steps to create a template for internal KB creation are shown below. This... |  |  | 7.5 | contentidea-kb |
| 577 | Intune Release Phases Private Preview: During this phase we invite a few cust... |  |  | 7.5 | contentidea-kb |
| 578 | This article describes the steps a Support Engineer in the Commercial space s... |  |  | 7.5 | contentidea-kb |
| 579 | In Germany, customers must obtain a legalization permission from the Work Cou... |  |  | 7.5 | contentidea-kb |
| 580 | Sometimes when you are experimenting with&nbsp;Proactive&nbsp;remediations,&n... |  |  | 7.5 | contentidea-kb |
| 581 | Intune expedite quality update is not happening on all assigned devices. | It can be seen from the update ETLs that the following endpoint is getting bl... | To resolve this problem, the endpoint &quot;devicelistenerprod.eudb.microsoft... | 7.5 | contentidea-kb |
| 582 | This KB illustrates the whitespace problem with ContentIdea/C3. If you look a... |  |  | 7.5 | contentidea-kb |
| 583 | This article is for information purposes only. It discusses a current design ... |  |  | 7.5 | contentidea-kb |
| 584 | When clicking on ADMX templates to configure an app, you see the page loading... | What’s the root-cause ? UX makes a call to fetch categories and definitions, ... | Reference to ICM&nbsp;380908965&nbsp;and&nbsp;376937559&nbsp;the fix rollout ... | 7.5 | contentidea-kb |
| 585 | The customer is unable to create a new web application in the Managed Google ... | Despite the error message that refers to the format of the icon, the issue wa... | Removing the additional characters addresses the issue. | 7.5 | contentidea-kb |
| 586 | The customer had a Cisco ISE and needed to populate the VPN server address wi... | At the time of writing this article the Intune Portal doesn't accept non-FQDN... | To work around the portal validation, use Graph to update the values to URL f... | 7.5 | contentidea-kb |
| 587 | General Data Handling Guidelines Ensure you have read the&nbsp;Guide to Suppo... |  |  | 7.5 | contentidea-kb |
| 588 | The 2305 Service Update for Intune introduced Filters for App Protection poli... |  |  | 7.5 | contentidea-kb |
| 589 | Here are some of the common scenarios.&nbsp; &quot;Target OS&quot; list is em... |  |  | 7.5 | contentidea-kb |
| 590 | Determine if an application is Enrolled (protected) into MAM Service, through... |  |  | 7.5 | contentidea-kb |
| 591 | This article describes how to link a existing IcM to a DfM case. Note that yo... |  |  | 7.5 | contentidea-kb |
| 592 | Verify that the device reported the Device action (simple data) |  |  | 7.5 | contentidea-kb |
| 593 | In a DoD/GCCH tenant, users get the following error message: &quot;The packag... | This can occur if an offline version of an app (e.g. the Company Portal app) ... | To work around this problem, the Intune admin in the DoD/GCCH tenant must dep... | 7.5 | contentidea-kb |
| 594 | This article describes how to use Intunhe to uninstall System Apps from all I... |  |  | 7.5 | contentidea-kb |
| 595 | This article describes how to enroll Android Enterprise Corporate Owned Devic... |  |  | 7.5 | contentidea-kb |
| 596 | Uninstalling apps in the Company Portal for Windows |  |  | 7.5 | contentidea-kb |
| 597 | Configure CMG for Path 2: How to setup cloud management gateway in Configurat... |  |  | 7.5 | contentidea-kb |
| 598 | Duplicate of&nbsp;5031248 - will all content be deleted? |  |  | 7.5 | contentidea-kb |
| 599 | You encounter an issue where you get the error message: Remove Account: The a... |  | As for clearing credentials, there are 4 available&nbsp;options: &nbsp; When ... | 7.5 | contentidea-kb |
| 600 | ORIGINAL TEXT  After the 10-hour Kerberos expiration the LDAP server resets o... | TABLES AND HIGHLIGHTING REMOVED  After the 10-hour Kerberos expiration the LD... | TABLES REMOVED, SELECTIVE HIGHLIGHTING ADDED  After the 10-hour Kerberos expi... | 7.5 | contentidea-kb |
| 601 | After creating and assigning an Endpoint Privilege Management (EPM) elevation... | This occurs if there isn't an elevation policy for Visual Studio's code.exe. ... | To resolve this problem, create&nbsp;an elevation policy for Visual Studio's ... | 7.5 | contentidea-kb |
| 602 | Intune: Co-Management Path 2 - Install the Configuration Manager client via a... |  |  | 7.5 | contentidea-kb |
| 603 | Please refer to&nbsp;Troubleshooting Guide - Overview (visualstudio.com)&nbsp... |  |  | 7.5 | contentidea-kb |
| 604 | 'Local admin password' and 'Rotate local admin password' remote actions are m... | LAPs action currently supports the following enrollmentTypes which don't incl... | The product team rolled out a fix to add EnrollmentType support to AVD:&nbsp;... | 7.5 | contentidea-kb |
| 605 | Windows AVD devices are missing from the Intune portal. In Azure AD, it looks... | We identified that the AVD profile management component – FSLogix has the fea... | How to fix it?   A.	For any new AVD devices, if the customer is using a custo... | 7.5 | contentidea-kb |
| 606 | In September 2023,&nbsp;Assist365 (replaces Rave) has a new feature called&nb... |  |  | 7.5 | contentidea-kb |
| 607 | Consider the following scenario: You have multiple setup.exe files for multip... |  |  | 7.5 | contentidea-kb |
| 608 | After deleting the group assigned to a custom ESP (Enrollment Status Page) pr... | This is a Bug and there is no ETA for a fix in the near future due to low imp... | Refresh the page. Once done the group will no longer exist. | 7.5 | contentidea-kb |
| 609 | When trying to assign a new group to a custom ESP policy from the &quot;Enrol... | This is a Bug and there is no ETA for a fix in the near future due to low imp... | Refresh the page and it will show the name of the assigned groups: | 7.5 | contentidea-kb |
| 610 | Microsoft Defender for Endpoint on macOS offers protection against phishing a... |  |  | 7.5 | contentidea-kb |
| 611 | User Driven Azure AD join Autopilot process During the User Driven Azure AD j... | This can occur if there is a special character (such as the &quot;!&quot; sho... | Taking Event ID 52 as the hint, special character '!' has been removed from t... | 7.5 | contentidea-kb |
| 612 | User rights to create global object has 4 objects by default as per the scree... | The policy basically controls the configuration under which  LSASS is run.&nb... | Configure the policy using the SID as below, then the policy applied correctl... | 7.5 | contentidea-kb |
| 613 | Intune (ODJ) connector returns a &quot;Navigation to the webpage was canceled... | Custom Schannel custom configuration with non-supported values are set in: HK... | Schannel falls under the Directory service team; they assist the customer in ... | 7.5 | contentidea-kb |
| 614 | Approved drivers are not installed on Windows devices. | This is by design as Intune cannot force the installation of drivers on devic... | Here are the steps that can be used to confirm if an approved driver is offer... | 7.5 | contentidea-kb |
| 615 | When you start with GPO Migration, you should be choosing all configurable at... | one or more selected attribute for migration doesn't have any value configured. | You need to ensure that all selected Attributes are having Value configured. ... | 7.5 | contentidea-kb |
| 616 | The purpose of this article is to walk you through the process of finding cas... |  |  | 7.5 | contentidea-kb |
| 617 | This article has been moved to the Intune Wiki here:&nbsp;MDE Attach - Overvi... |  |  | 7.5 | contentidea-kb |
| 618 | The purpose of this document is to present alternative tools that can assist ... |  |  | 7.5 | contentidea-kb |
| 619 | Customer published a private app using the Google Console, customer expects t... | This is by-design (Google).  Here is Google's response to this: Also note tha... | If the customer wants an app to be available on the private app section of th... | 7.5 | contentidea-kb |
| 620 | Sometimes we need to validate the information that is provided by the custome... |  |  | 7.5 | contentidea-kb |
| 621 | S&nbsp; SYMPTOM: LAPS password not appearing in Intune Portal &nbsp; |  |  | 7.5 | contentidea-kb |
| 622 | This article outlines the steps to schedule planned and unplanned out of offi... |  |  | 7.5 | contentidea-kb |
| 623 | Unable to install Microsoft Tunnel Gateway (MTG):  root@hostname:/home/dir/in... | string issue with while printing the license terms (EULA) | Commenting out ShowEula in mstunnel-setup script bypasses it and the installa... | 7.5 | contentidea-kb |
| 624 | Edge cannot be signed into with a work/school account and comes up with error... | When this is set. Only by default these urls are whitelisted  https://learn.m... | Add the following endpoints to the permitted list https://live.com https://of... | 7.5 | contentidea-kb |
| 625 | Consider the following scenario:  1. You deploy Endpoint Privilege Management... | In this scenario, the result is expected behavior. | To resolve this issue, complete option 1 or option 2 below. Option 1: In the ... | 7.5 | contentidea-kb |
| 626 | If you want to test a PS script n system context, like it would be sent from ... | This will help you faster test PS script rather than upload it to Intune sync... | Download PS tools https://learn.microsoft.com/en-us/sysinternals/downloads/ps... | 7.5 | contentidea-kb |
| 627 | When there is a change in the assignment of &quot;Scripts and Remediation&quo... |  |  | 7.5 | contentidea-kb |
| 628 | &nbsp; &nbsp; This can either happen manually or using a script. In most inst... | This can either happen manually or using a script. | Instructions:  ************THIS IS AN EXTREMELY TIME SENSITIVE ISSUE. PLEASE ... | 7.5 | contentidea-kb |
| 629 | This article will provide details on handling requests from Intune customers ... | At time of setup, we advise customers to not use a personal GMail account to ... | For both scenarios, loss of access to the main admin account, and Android Ent... | 7.5 | contentidea-kb |
| 630 | &nbsp;Advanced Endpoint Analytics&nbsp;:&nbsp;Explanation on how below mentio... |  |  | 7.5 | contentidea-kb |
| 631 | This guide provides an overview of the integration of third-party MTD vendors... |  |  | 7.5 | contentidea-kb |
| 632 | A customer tries looking for a private app using this method&nbsp;Intune: Pri... | Depending on the app name the Google iFrame can have indexing issues, for tha... | A couple of workarounds provided by Google are the following:  Search by pack... | 7.5 | contentidea-kb |
| 633 | This article provides a detailed explanation of how the MDE Sensor identifies... |  |  | 7.5 | contentidea-kb |
| 634 | Enhancing Windows Device Inventory in Microsoft Intune: A Comprehensive Guide... | Understanding the Microsoft Device Inventory Agent in Intune After configurin... | Verifying Additional Hardware Inventory in Microsoft Intune Once the inventor... | 7.5 | contentidea-kb |
| 635 | This article explains how to validate whether Work From Anywhere (WFA) insigh... |  |  | 7.5 | contentidea-kb |
| 636 | This article explains how to check and validate tunnel configurations using A... |  |  | 7.5 | contentidea-kb |
| 637 | Steps to Collect Network Logs at Tunnel Server Side |  |  | 7.5 | contentidea-kb |
| 638 | Collecting logs from a Microsoft Intune Tunnel server is essential for troubl... |  |  | 7.5 | contentidea-kb |
| 639 | We often need to engage the Fastrack engineer for fresh deployment. To help w... |  |  | 7.5 | contentidea-kb |
| 640 | Configuring TLS 1.3 for EAP Authentication in Intune: A Guide to Security, Pe... |  |  | 7.5 | contentidea-kb |
| 641 | This article is meant to provide instruction on what to do if a customer has ... |  |  | 7.5 | contentidea-kb |
| 642 | In this article, we will leverage the Hubble application to conduct an in-dep... |  |  | 7.5 | contentidea-kb |
| 643 | After enabling Tenant Attach in Configuration Manager Configuration Manager (... | The SCCM site server cannot reach the required cloud endpoints due to network... | The networking team exempted the required endpoints to allow outbound communi... | 7.5 | contentidea-kb |
| 644 | Users see a banner at the bottom in the Company Portal app on Mac OS devices&... | This banner is displayed as the user logged on to the machine is still part o... | Once the user was removed from the &quot;Jamf device Compliance Group&quot; t... | 7.5 | contentidea-kb |
| 645 | While configuring New ODJ connector, getting below error in UI   and log (ODJ... |  |  | 7.5 | contentidea-kb |
| 646 | An iOS device unexpectedly disappeared from the Intune portal.&nbsp; Upon inv... |  |  | 7.5 | contentidea-kb |
| 647 | Microsoft Edge offers a built-in security feature called Website Typo Protect... |  |  | 7.5 | contentidea-kb |
| 648 | The &quot;New Remote Assistance Session&quot; option in Intune appears greyed... |  | When all the required roles and permissions are provided as documented for en... | 7.5 | contentidea-kb |
| 649 | This article explains a common scenario where personal devices may still get ... |  |  | 7.5 | contentidea-kb |
| 650 | Migration to 1DS SDK from UTC for Endpoint Analytics Overview We have migrate... |  |  | 7.5 | contentidea-kb |
| 651 | You may encounter customers reporting that they installed the new ODJConnecto... |  |  | 7.5 | contentidea-kb |
| 652 | iOS/iPadOS devices enrolled to Intune stop syncing or fail to sync with the I... |  |  | 7.5 | contentidea-kb |
| 653 | How to block Powershell.exe in CMD from Intune:  &nbsp;Create AppLocker rule ... |  |  | 7.5 | contentidea-kb |
| 654 | The Intune Offline Domain Join (ODJ) Connector may fail to create or locate t... | The affected environment enforces strict Active Directory security controls. ... | The issue was resolved by running the ODJ Connector under a different securit... | 7.5 | contentidea-kb |
| 655 | The Intune Connector for Active Directory application unexpectedly closes imm... | The Microsoft Entra ID account used to enroll the Intune Connector for Active... | Verify that the enrolling Microsoft Entra ID account has the Intune Administr... | 7.5 | contentidea-kb |
| 656 | Request to publish 4466369 externally |  |  | 7.5 | contentidea-kb |
| 657 | [Pending shhodge] Request to publish 4466353 externally |  |  | 7.5 | contentidea-kb |
| 658 | Mac devices generate keychain signing message when accessing O365 apps |  |  | 7.5 | contentidea-kb |
| 659 | Request to publish 4342995 externally |  |  | 7.5 | contentidea-kb |
| 660 | Request to publish 4466334 externally |  |  | 7.5 | contentidea-kb |
| 661 | Request to publish 4464186 externally |  |  | 7.5 | contentidea-kb |
| 662 | Request to publish 4465007 externally |  |  | 7.5 | contentidea-kb |
| 663 | Request to publish 4462900 externally |  |  | 7.5 | contentidea-kb |
| 664 | Request to publish 4493802 externally |  |  | 7.5 | contentidea-kb |
| 665 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 666 | Update KB 4502322 to include info about ICM 116747327 |  |  | 7.5 | contentidea-kb |
| 667 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 668 | [DUE 8/2]  Intune: Create step-by-step troubleshooter KB from attached doc - ... |  |  | 7.5 | contentidea-kb |
| 669 | Review 4509711 for PII |  |  | 7.5 | contentidea-kb |
| 670 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 671 | Request to publish 4469679 externally |  |  | 7.5 | contentidea-kb |
| 672 | Request to publish 4469673 externally |  |  | 7.5 | contentidea-kb |
| 673 | Request to publish 4471183 externally |  |  | 7.5 | contentidea-kb |
| 674 | Request to publish 4471480 externally |  |  | 7.5 | contentidea-kb |
| 675 | Request to retire external KB 4056924 |  |  | 7.5 | contentidea-kb |
| 676 | Device licenses in Microsoft Intune |  |  | 7.5 | contentidea-kb |
| 677 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 678 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 679 | [Create .md] Intune: Add troubleshooting info from 4010214 to public docs (Mi... |  |  | 7.5 | contentidea-kb |
| 680 | Add troubleshooting info from 4471887 to Intune docs (Intune on-premises Exch... |  |  | 7.5 | contentidea-kb |
| 681 | [KBWM]Archive and redirect KB 4459540, create internal version of 4459540 |  |  | 7.5 | contentidea-kb |
| 682 | [Create Word Doc]Intune: Add troubleshooting information from 4476974 to docs... |  |  | 7.5 | contentidea-kb |
| 683 | Request to retire public article 3106918 |  |  | 7.5 | contentidea-kb |
| 684 | Request to retire internal articles for Intune Exchange Online Service Connector |  |  | 7.5 | contentidea-kb |
| 685 | Request to retire internal KB articles related to Windows Phone SSP |  |  | 7.5 | contentidea-kb |
| 686 | Request to retire public KB 3199783 |  |  | 7.5 | contentidea-kb |
| 687 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 688 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 689 | Request to publish 4491870 externally |  |  | 7.5 | contentidea-kb |
| 690 | Request to publish 4487946 externally |  |  | 7.5 | contentidea-kb |
| 691 | [DUE 8/2]  Intune: Create step-by-step troubleshooter KB from attached doc - ... |  |  | 7.5 | contentidea-kb |
| 692 | Create GWT on troubleshooting PKCS certs using attached doc |  |  | 7.5 | contentidea-kb |
| 693 | Request to publish 4456680 externally |  |  | 7.5 | contentidea-kb |
| 694 | [Post Edit]Request to publish 4344141 externally |  |  | 7.5 | contentidea-kb |
| 695 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 696 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 697 | [post edit]Request to publish 4458731 externally |  |  | 7.5 | contentidea-kb |
| 698 | [Post Edit] Request to publish 4456826 externally |  |  | 7.5 | contentidea-kb |
| 699 | [Post Edit] Request to publish 4463893 externally |  |  | 7.5 | contentidea-kb |
| 700 | Request to update external KB 3103996 |  |  | 7.5 | contentidea-kb |
| 701 | [KBWM]Request to retire articles relating to deprecated features in the Intun... |  |  | 7.5 | contentidea-kb |
| 702 | [Post Edit] Request to publish 4463724 externally |  |  | 7.5 | contentidea-kb |
| 703 | [Post Edit] Request to publish 4464186 externally |  |  | 7.5 | contentidea-kb |
| 704 | [Post Edit]Request to publish 4466334 externally |  |  | 7.5 | contentidea-kb |
| 705 | [Post Edit]Request to publish 4465007 externally |  |  | 7.5 | contentidea-kb |
| 706 | [Post Edit]Request to publish 4462900 externally |  |  | 7.5 | contentidea-kb |
| 707 | [Post Edit]Intune: Create GWT on troubleshooting problems when applying Intun... |  |  | 7.5 | contentidea-kb |
| 708 | Create flattened GWT on troubleshooting Jamf |  |  | 7.5 | contentidea-kb |
| 709 | [Lu will Pick Up]Request to publish 4516689 externally |  |  | 7.5 | contentidea-kb |
| 710 | Request to publish 4492340 externally |  |  | 7.5 | contentidea-kb |
| 711 | Request to publish 4492342 externally |  |  | 7.5 | contentidea-kb |
| 712 | Request to publish 4493932 externally |  |  | 7.5 | contentidea-kb |
| 713 | [Lu will Pick Up]Request to publish 4488562 externally |  |  | 7.5 | contentidea-kb |
| 714 | Request to publish 4487170 externally |  |  | 7.5 | contentidea-kb |
| 715 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 716 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 717 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 718 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 719 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 720 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 721 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 722 | Request to publish 4488879 externally |  |  | 7.5 | contentidea-kb |
| 723 | Request to publish 4487249 externally |  |  | 7.5 | contentidea-kb |
| 724 | Request to publish 4491077 externally |  |  | 7.5 | contentidea-kb |
| 725 | [Cancel]Request to publish 4487658 externally |  |  | 7.5 | contentidea-kb |
| 726 | Request to publish 4491378 externally |  |  | 7.5 | contentidea-kb |
| 727 | Request to publish  4492694 externally |  |  | 7.5 | contentidea-kb |
| 728 | [Cancel]Request to publish 4490742 externally |  |  | 7.5 | contentidea-kb |
| 729 | Request to publish 4492450 externally |  |  | 7.5 | contentidea-kb |
| 730 | Request to retire external article 3117662 |  |  | 7.5 | contentidea-kb |
| 731 | Request to retire external article 3117664 |  |  | 7.5 | contentidea-kb |
| 732 | Request to retire external article 4043462 |  |  | 7.5 | contentidea-kb |
| 733 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 734 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 735 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 736 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 737 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 738 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 739 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 740 | Need update to SCEP GWT 4457481 |  |  | 7.5 | contentidea-kb |
| 741 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 742 | Request to publish 4492645 externally |  |  | 7.5 | contentidea-kb |
| 743 | Request to publish 4490864 externally |  |  | 7.5 | contentidea-kb |
| 744 | [Hold]Request to publish 4490795 externally |  |  | 7.5 | contentidea-kb |
| 745 | Intune GWT: Troubleshooting Intune Co-Management:  The Path 1 Scenario for Ex... |  |  | 7.5 | contentidea-kb |
| 746 | Create flattened GWT for VPN Profile Troubleshooting using attached doc |  |  | 7.5 | contentidea-kb |
| 747 | Create flattened GWT for WiFI Profile Troubleshooting using attached doc |  |  | 7.5 | contentidea-kb |
| 748 | Migrate existing NDES configuration GWT 4459540 to DMC doc |  |  | 7.5 | contentidea-kb |
| 749 | Update SME list for Device Configuration |  |  | 7.5 | contentidea-kb |
| 750 | [Post Edit]Request to publish 4469679 externally |  |  | 7.5 | contentidea-kb |
| 751 | [Post Edit]Request to publish 4469673 externally |  |  | 7.5 | contentidea-kb |
| 752 | [Post Edit]Request to publish 4471183 externally |  |  | 7.5 | contentidea-kb |
| 753 | [Post Edit]Request to publish 4471480 externally |  |  | 7.5 | contentidea-kb |
| 754 | Intune GWT: Troubleshooting Intune Co-Management:  The Path 2 Scenario for Mo... |  |  | 7.5 | contentidea-kb |
| 755 | Create flattened GWT on troubleshooting co-management workloads using the att... |  |  | 7.5 | contentidea-kb |
| 756 | smc2dmc: Intune: Convert Jamf GWT to DMC content |  |  | 7.5 | contentidea-kb |
| 757 | Request to retire 3118546 |  |  | 7.5 | contentidea-kb |
| 758 | Request to retire 4022061 |  |  | 7.5 | contentidea-kb |
| 759 | Request to retire 4012362 |  |  | 7.5 | contentidea-kb |
| 760 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 761 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 762 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 763 | [Post edit]Intune GWT: Troubleshooting Intune Co-Management:  The Path 1 Scen... |  |  | 7.5 | contentidea-kb |
| 764 | [Post edit]Request to publish 4516689 externally |  |  | 7.5 | contentidea-kb |
| 765 | [Post edit]Request to publish 4488562 externally |  |  | 7.5 | contentidea-kb |
| 766 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 767 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 768 | Flatten the Jamf GWT |  |  | 7.5 | contentidea-kb |
| 769 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 770 | [Post Edit]Request to publish 4492645 externally |  |  | 7.5 | contentidea-kb |
| 771 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 772 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 773 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 774 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 775 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 776 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 777 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 778 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 779 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 780 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 781 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 782 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 783 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 784 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 785 | [KBWM]Request to retire internal articles relating to bugs with CM hybrid |  |  | 7.5 | contentidea-kb |
| 786 | Request to publish 4489564 externally |  |  | 7.5 | contentidea-kb |
| 787 | Request to publish 4490473 externally |  |  | 7.5 | contentidea-kb |
| 788 | Request to publish 4490482 externally |  |  | 7.5 | contentidea-kb |
| 789 | Request to publish 4492339 externally |  |  | 7.5 | contentidea-kb |
| 790 | Request to publish 4499250 externally |  |  | 7.5 | contentidea-kb |
| 791 | Request to publish 4493320 externally |  |  | 7.5 | contentidea-kb |
| 792 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 793 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 794 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 795 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 796 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 797 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 798 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 799 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 800 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 801 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 802 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 803 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 804 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 805 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 806 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 807 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 808 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 809 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 810 | Add two more side nav links to 4514254 |  |  | 7.5 | contentidea-kb |
| 811 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 812 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 813 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 814 | Troubleshoot VPN profiles in Microsoft Intune |  |  | 7.5 | contentidea-kb |
| 815 | [Post Edit]Intune: Create flattened GWT for WiFI Profile Troubleshooting usin... |  |  | 7.5 | contentidea-kb |
| 816 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 817 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 818 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 819 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 820 | How to collect Company Portal log from Android devices |  |  | 7.5 | contentidea-kb |
| 821 | Managed Google Play Store apps update delay on Android Enterprise devices in ... |  |  | 7.5 | contentidea-kb |
| 822 | [Post Edit]Intune GWT: Troubleshooting Intune Co-Management:  The Path 2 Scen... |  |  | 7.5 | contentidea-kb |
| 823 | [Post Edit]Intune: Create flattened GWT on troubleshooting co-management work... |  |  | 7.5 | contentidea-kb |
| 824 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 825 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 826 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 827 | [KBWM]Intune: Side Nav Request for internal Saaswedo DatAlert Integration Wor... |  |  | 7.5 | contentidea-kb |
| 828 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 829 | smc2dmc: troubleshooting PKCS certs |  |  | 7.5 | contentidea-kb |
| 830 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 831 | [KBWM]Add SideNav Assets to 4512802 |  |  | 7.5 | contentidea-kb |
| 832 | Request to publish KB4496680 externally |  |  | 7.5 | contentidea-kb |
| 833 | Request to publish KB4497349 externally |  |  | 7.5 | contentidea-kb |
| 834 | Request to publish KB4493944 externally |  |  | 7.5 | contentidea-kb |
| 835 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 836 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 837 | Add sidenav assets to 4493018 |  |  | 7.5 | contentidea-kb |
| 838 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 839 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 840 | Content experience Update: Oct 16 Commercial |  |  | 7.5 | contentidea-kb |
| 841 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 842 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 843 | [KBWM]Intune: Archive/redirect some KBs, create internal versions |  |  | 7.5 | contentidea-kb |
| 844 | [Archived] Old Intune article marked for archival. Archived |  |  | 7.5 | contentidea-kb |
| 845 | Coming soon.... |  |  | 7.5 | contentidea-kb |
| 846 | Coming soon.... |  |  | 7.5 | contentidea-kb |
| 847 | [19 KBs] 22nd batch of articles for Docs migration |  |  | 7.5 | contentidea-kb |
| 848 | [32 KBs]Articles to be moved from PG's repo |  |  | 7.5 | contentidea-kb |
| 849 | Intune Doc Req: Need side nav link added to KB 4530666 |  |  | 7.5 | contentidea-kb |
| 850 | Internal KB request: Convert attached PDF to internal KB |  |  | 7.5 | contentidea-kb |
| 851 | [OfficeDocs-Support]Issue #900:  MSOL_AD_Sync_RichCoexistence not used any more |  |  | 7.5 | contentidea-kb |
| 852 | [OfficeDocs-Support]Issue #905:  Blank can also occur for other attributes |  |  | 7.5 | contentidea-kb |
| 853 | Retire KB 4477075 - Intune: Rave FAQ |  |  | 7.5 | contentidea-kb |
| 854 | [OfficeDocs-Support]Issue #1075:  Some security issues caused by this behavio... |  |  | 7.5 | contentidea-kb |
| 855 | [Re-routed to Internal KB team]Intune Doc Req: Intune Doc Req: Add KB 4603628... |  |  | 7.5 | contentidea-kb |
| 856 | Intune: How to setup My Workspace Nested Virtualization and complete initial ... |  |  | 7.5 | contentidea-kb |
| 857 | Intune: Workspace Lab Tips and Tricks |  |  | 7.5 | contentidea-kb |
| 858 | Intune: How to Setup Azure Virtual Desktop Single Session |  |  | 7.5 | contentidea-kb |
| 859 | Intune: How to create SCCM Server from scratch step-by-step. |  |  | 7.5 | contentidea-kb |
| 860 | Intune: Backup and Restore Lab Setup |  |  | 7.5 | contentidea-kb |
| 861 | Intune: How to manage macOS updates |  |  | 7.5 | contentidea-kb |
| 862 | DRAFT: Users unable to attach files from Managed OneDrive to Edge with error ... |  |  | 7.5 | contentidea-kb |
| 863 | Cannot load Help and support blade in Intune admin center. Browser shows 'log... | Browser is configured to block third-party cookies, preventing the Help and s... | Configure browser to allow third-party cookies: click the cookie-blocked icon... | 6.5 | mslearn |
| 864 | Customers may ask how to set the MDM authority for their a GCC High tenant to... |  |  | 4.5 | contentidea-kb |
| 865 | On Windows 10 1803 and later, the feature "Your phone" in "Settings" is greye... |  |  | 4.5 | contentidea-kb |
| 866 | Apps cannot be assigned to Device group as “Available for enrolled devices” o... |  |  | 4.5 | contentidea-kb |
| 867 | After enabling Single App Mode with the Company Portal app while having MFA e... | This is expected behavior - by design. | To work around this problem, MFA will need to be disabled for these users. Si... | 4.5 | contentidea-kb |
| 868 | 1. Add below registry key to enable office 2016 ULS log. You can delete it af... |  |  | 4.5 | contentidea-kb |
| 869 | The Azure Intune Portal ->Client Apps->Company Portal Branding shows the opti... | This is due to a oversight on Microsoft side, this was not meant to be releas... | For now the customer will need to ignore; This feature UI component will be r... | 4.5 | contentidea-kb |
| 870 | The Intune->Tenant Status->Tenant Details section for subsection "Total Enrol... | Per internal discussion with Tanmay Jha via Matt Shadbolt and James Grantham;... | None, per-design. | 4.5 | contentidea-kb |
| 871 | The Bypass Activation Lock device action is initiated via the Intune portal, ... | Appears to have been a combination of the Company Portal version that was bei... | (1) Updated to the latest version of the Company Portal. (2) Allowed more tim... | 4.5 | contentidea-kb |
| 872 | Before you begin troubleshooting a problem, be sure to check for known Emergi... |  |  | 4.5 | contentidea-kb |
| 873 | U sers keep having to open the iOS Company Portal applicaiton every few days ... | Enhanced Jailbreak detection was enabled which requires the iOS devices to ch... | Opened the Company Portal to sync the devices with the Intune service. | 4.5 | contentidea-kb |
| 874 | Intune administrators select the 'Remove passcode' device action via the Intu... |  |  | 4.5 | contentidea-kb |
| 875 | Mobile devices migrated from hybrid Intune to Intune standalone have the old ... | This was by design. The PG created a flighting tag that makes it possible to ... | Create an escalation to IET to file an ICM to ask that the tattoo time be red... | 4.5 | contentidea-kb |
| 876 | Any time you find an internal KB that you think would be helpful to customers... |  |  | 4.5 | contentidea-kb |
| 877 | During NDES feature configuration, you may encounter the following error: CMS... | AD CS Configuration wizard is run using non-enterprise admin account | Use Enterprise Admin account to configure NDES feature. Also make sure Enterp... | 4.5 | contentidea-kb |
| 878 | When creating a Device Configuration Profile that uses http://localhost for t... | This occurs because of a problem with validation for the URL by the Intune se... | Resolution: Issue resolved with 1904 Intune service release Workaround: Use G... | 4.5 | contentidea-kb |
| 879 | If a RAVE case is misrouted to Intune but needs to go to a Team that does not... |  |  | 4.5 | contentidea-kb |
| 880 | The process as documented in this article describes the steps customers shoul... |  |  | 4.5 | contentidea-kb |
| 881 | The process as documented in this article describes the steps customers shoul... |  |  | 4.5 | contentidea-kb |
| 882 | Resolved on 4/22/19 with Intune 1904 Service Release | DELETE | DELETE | 4.5 | contentidea-kb |
| 883 | Outlook mobile for Android Version 3.0.26 - 3.0.34 fails to render the users ... | Intune Company Portal which is used by Outlook to acquire the APP Policy is c... | Intune Company Portal build 5.0.4367.0 has proven to resolve this issue and i... | 4.5 | contentidea-kb |
| 884 | When V1.0 of the Intune Data Warehouse API was first introduced in Intune bui... |  |  | 4.5 | contentidea-kb |
| 885 | When creating multi-app kiosk policy the apps never show in the Intune Admin ... | An app uploaded to Intune had null Version, no store url, and no app identifi... | Delete the malformed apps from Client apps -> Apps. | 4.5 | contentidea-kb |
| 886 | Merged into 4502996 |  |  | 4.5 | contentidea-kb |
| 887 | Items to note prior to creating an expense report: Effective February 1st, 20... |  |  | 4.5 | contentidea-kb |
| 888 | This KB provides you a codex of general questions that follow the mindset for... |  |  | 4.5 | contentidea-kb |
| 889 | When attempting to open a device configuration profile in the Intune Admin co... | The configuration profile is most likely synced from the Intune for education... | Customer will need to access this policy from the Intune for Education portal... | 4.5 | contentidea-kb |
| 890 | While Intune has historically used the Intune Support All distribution group ... |  |  | 4.5 | contentidea-kb |
| 891 | This article describes the process to follow for Intune Escalation Team (IET)... |  |  | 4.5 | contentidea-kb |
| 892 | Delete this article | Delete this article | Delete this article | 4.5 | contentidea-kb |
| 893 | DELETE dup of 4507701 |  |  | 4.5 | contentidea-kb |
| 894 | The following information was taken from the public post on our Intune Custom... |  |  | 4.5 | contentidea-kb |
| 895 | The entire Intune team, from the product group to CXE to CSS Support Engineer... |  |  | 4.5 | contentidea-kb |
| 896 | Customers may ask how to enable the sleep/wake button for iOS Kiosk devices. ... |  |  | 4.5 | contentidea-kb |
| 897 | This article describes how to request updates to our official product documen... |  |  | 4.5 | contentidea-kb |
| 898 | "Access Denied" error is encountered in the Intune portal when attempting to ... | In this particular case, the administrator account was not Intune licensed, w... | Added an Intune license to the administrator account and provisioned the corr... | 4.5 | contentidea-kb |
| 899 | See https://internal.support.services.microsoft.com/en-us/help/4581821 . |  |  | 4.5 | contentidea-kb |
| 900 | Below are some of the highlights from the Outlook case bash held on 5-23-2019. |  |  | 4.5 | contentidea-kb |
| 901 | If you have a problem with Rave and need to submit a ticket, use this link: h... |  |  | 4.5 | contentidea-kb |
| 902 | This article is wrong. The only way to manage devices in Office 365 MDM is be... | This article is wrong. The only way to manage devices in Office 365 MDM is be... |  | 4.5 | contentidea-kb |
| 903 | In the Intune portal under Device Compliance -> Mobile Threat Defense, the “ ... |  | Turn off MTP and turn it back on by toggling the Intune Connector in the Look... | 4.5 | contentidea-kb |
| 904 | Customer noticed that the “Last connection” time under Partner device managem... | This applies only to 10.12 version of Jamf Pro. There is a known issue with t... | Point customers to the following link: https://www.jamf.com/jamf-nation/artic... | 4.5 | contentidea-kb |
| 905 | When signing into the LookOut MTP console, the following error is displayed: | Username is not a member of the Azure AD group defined for having access to L... | Add the user to the member of the Azure AD group defined for having access in... | 4.5 | contentidea-kb |
| 906 | When attempting to log into the LookOut console, a "Sign In" error appears | Consent has not be given by the Azure AD Global Admin. | A Global Admin must log into the LookOut console, the following will be shown... | 4.5 | contentidea-kb |
| 907 | Why is a device is not showing in the Lookout MTP Console Devices list? | The user that owns this device is not in the Enrollment Group specified in th... | On the Lookout MTP Console go to Intune Connector page (System>Connectors) an... | 4.5 | contentidea-kb |
| 908 | A device appears in the LookOut console under "Managed Devices" section , but... | The device is not supported by LookOut | Devices found that are unsupported will appear in the “Managed Devices” secti... | 4.5 | contentidea-kb |
| 909 | In the Lookout MTP Console, a device is showing as Active without an MDM ID. ... |  |  | 4.5 | contentidea-kb |
| 910 | How can I force a device state resync from a device to Lookout MTP and Intune... |  |  | 4.5 | contentidea-kb |
| 911 | As an end user, if I uninstalled Company Portal and/or LookOut for Work on my... |  |  | 4.5 | contentidea-kb |
| 912 | The following ports should be accessible in order for Jamf and Intune to inte... |  |  | 4.5 | contentidea-kb |
| 913 | If you are interested in creating videos for the CSS YouTube channel , the st... |  |  | 4.5 | contentidea-kb |
| 914 | If a user is targeted with more than one Office Pro Plus policy, only one of ... | Currently this is a known issue with Intune. We’re working on a fix but it ma... | If you are impacted by this issue, short term you can bundle Office Pro Plus ... | 4.5 | contentidea-kb |
| 915 | Intune Support Engineer Saurabh Sarkar published a great blog post where he t... |  |  | 4.5 | contentidea-kb |
| 916 | Customer is unable to login to Intune admin portal |  | First thing is to narrow down the scope of the problem by checking to see if ... | 4.5 | contentidea-kb |
| 917 | The table below identifies who you can contact if you need to provide feedbac... |  |  | 4.5 | contentidea-kb |
| 918 | When you have exhausted the available resources (including the Intune GCC Hig... |  |  | 4.5 | contentidea-kb |
| 919 | The list below contains resources for learning about the Microsoft Intune pro... |  |  | 4.5 | contentidea-kb |
| 920 | https://internal.support.services.microsoft.com/help/4532850 |  |  | 4.5 | contentidea-kb |
| 921 | Can’t access your Company Portal from your iOS device? In this video created ... |  |  | 4.5 | contentidea-kb |
| 922 | This article contains frequently asked questions regarding application config... |  |  | 4.5 | contentidea-kb |
| 923 | If you look in the portal, looking in the Managed Apps -Preview you will see ... | App to device serial # record is out of sync with Apple Service | Workaround: revoke the app license from the device and after a sync the app w... | 3.0 | contentidea-kb |
| 924 | This process has been updated. Please see the following for the latest inform... |  |  | 3.0 | contentidea-kb |
| 925 | Intune Android Wrapper references an Android Key store file. Apps used for tr... |  |  | 3.0 | contentidea-kb |
| 926 | One of the new things we added to Intune is an exact search syntax. We determ... | This is expected behavior. | To use this new syntax, provided you know one of the complete device identifi... | 3.0 | contentidea-kb |
| 927 | Beginning in May 2019, managed Google Play will no longer support the ability... |  |  | 3.0 | contentidea-kb |
| 928 | EverythingAboutIntune is an internal Streams channel targeted in educating ev... |  |  | 3.0 | contentidea-kb |
| 929 | This article describes the process to request assistance from the Edge mobile... |  |  | 3.0 | contentidea-kb |
| 930 | Recording of Android Enterprise Brown Bag + Q&A delivered to the FastTrack te... |  |  | 3.0 | contentidea-kb |
| 931 | RAVE is an excellent tool to help troubleshoot registration issues with Jamf.... |  |  | 3.0 | contentidea-kb |
| 932 | Intune support engineer Betty Jia (cujia@microsoft.com) published a great blo... |  |  | 3.0 | contentidea-kb |
| 933 | Policy updates and sync suddenly stop working for Windows 10 devices enrolled... | This can occur if a PowerShell script called Windows 8 Optimization Script ha... | To resolve this problem, change the service startup type to Automatic . Once ... | 3.0 | contentidea-kb |
| 934 | some customers are asking how can we move the policies from testing Intune Te... | Moving from Testing Tenant to Production Tenant | I found these PowerShell’s that will help you in Exporting everything in your... | 3.0 | contentidea-kb |
