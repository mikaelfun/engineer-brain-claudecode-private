# INTUNE 注册通用问题 — 已知问题详情

**条目数**: 85 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Need to determine a device's enrollment type (BYOD, corporate, Autopilot, DEP, co-managed, etc.) and check if a user has reached their device enrol...
**Solution**: For enrollment type: Query DeviceManagementProvider with ActivityId=<IntuneDeviceId>, look for 'EnrollType=' in message field (e.g., EnrollType=OnPremiseCoManaged). For enrollment limit: Query IntuneEvent with ActivityId=<IntuneDeviceId>, ServiceName=EnrollmentMTSessionService, EventUniqueName in ('RunEnrollmentEligibilityChecks', 'EnrollmentEligibilityChecks') - Message will show current device count vs limit.
`[Source: onenote, Score: 9.5]`

### Step 2: iOS/iPadOS enrollment fails with error DeviceCapReached - too many mobile devices are enrolled already.
**Solution**: User must remove one of their currently enrolled devices from Company Portal before enrolling another. Admin can also increase the device enrollment limit in Intune > Devices > Enrollment restrictions > Device limit restrictions.
`[Source: onenote, Score: 9.5]`

### Step 3: iOS enrollment fails with UserLicenseTypeInvalid - device cannot be enrolled because user does not have correct license.
**Solution**: 1. Verify user has Intune license assigned in Microsoft 365 admin center. 2. Ensure user is in a group targeted by enrollment policy. 3. Check MDM authority setting matches license type.
`[Source: onenote, Score: 9.5]`

### Step 4: iOS enrollment fails with MdmAuthorityNotDefined - mobile device management authority has not been defined.
**Solution**: Set the MDM authority in Intune admin center > Tenant administration. For new tenants, MDM authority is automatically set to Intune. For migrated tenants, verify the setting is configured correctly.
`[Source: onenote, Score: 9.5]`

### Step 5: Intune enrollment fails for some VMs/users - devices cannot enroll.
**Solution**: Assign Intune license to the affected users. After license assignment, VMs associated with those users enroll successfully.
`[Source: onenote, Score: 9.0]`

### Step 6: 设备合规状态显示 Not Evaluated
**Solution**: 1. 确认设备有关联用户且用户有 Intune 许可证；2. 检查设备是否在 7 天内联系过服务；3. DEM 用户设备无法评估合规，需用普通用户注册；4. Windows 1803+ 支持多用户模式可将策略目标设为设备组；5. 设备 2-3 天内联系过仍为 Not Evaluated 需收集 Company Portal 日志
`[Source: ado-wiki, Score: 9.0]`

### Step 7: macOS Platform SSO device registration fails silently — no error message shown to user
**Solution**: In Entra ID portal > Devices > Device Settings: set 'Users may join devices to Microsoft Entra' to 'All', or if 'Selected', ensure the registering user is included in the list.
`[Source: ado-wiki, Score: 9.0]`

### Step 8: MDM authority is set to Office365 and customer wants to change it to Intune — no SAW action available to switch from Office365MDM or Unknown to Intune
**Solution**: 1) Ensure user is Global Admin with Intune license (wait ~10 min for propagation). 2) Go to Intune Education portal (https://intuneeducation.portal.azure.com). 3) Navigate to Tenant Settings > Device enrollment Setup and click 'Manage devices with Microsoft Intune'. 4) Verify in Intune console under Tenant Administration > Tenant Status
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Need to determine a device's enrollment type (BYOD, corporate, Autopilot, DEP... |  | For enrollment type: Query DeviceManagementProvider with ActivityId=<IntuneDe... | 9.5 | onenote |
| 2 | iOS/iPadOS enrollment fails with error DeviceCapReached - too many mobile dev... | User has reached the maximum number of device enrollments allowed by the Intu... | User must remove one of their currently enrolled devices from Company Portal ... | 9.5 | onenote |
| 3 | iOS enrollment fails with UserLicenseTypeInvalid - device cannot be enrolled ... | User account is not a member of a required user group, or user does not have ... | 1. Verify user has Intune license assigned in Microsoft 365 admin center. 2. ... | 9.5 | onenote |
| 4 | iOS enrollment fails with MdmAuthorityNotDefined - mobile device management a... | MDM authority was not set in Intune tenant configuration. Required before any... | Set the MDM authority in Intune admin center > Tenant administration. For new... | 9.5 | onenote |
| 5 | Intune enrollment fails for some VMs/users - devices cannot enroll. | The users assigned to those VMs do not have Intune licenses assigned. | Assign Intune license to the affected users. After license assignment, VMs as... | 9.0 | onenote |
| 6 | 设备合规状态显示 Not Evaluated | 多种原因：(1) 设备无关联用户（无主用户的设备无法评估合规）；(2) 设备为 EAS 记录；(3) 设备处于 Retire Pending 等状态无法 ... | 1. 确认设备有关联用户且用户有 Intune 许可证；2. 检查设备是否在 7 天内联系过服务；3. DEM 用户设备无法评估合规，需用普通用户注册；4... | 9.0 | ado-wiki |
| 7 | macOS Platform SSO device registration fails silently — no error message show... | User does not have permission to join/register devices in Microsoft Entra ID.... | In Entra ID portal > Devices > Device Settings: set 'Users may join devices t... | 9.0 | ado-wiki |
| 8 | MDM authority is set to Office365 and customer wants to change it to Intune —... | MDM authority was initially set to Office365 and once Intune is enabled as MD... | 1) Ensure user is Global Admin with Intune license (wait ~10 min for propagat... | 9.0 | ado-wiki |
| 9 | MDM authority shows 'Unknown' in Intune console — cannot set MDM authority, K... | Customer purchased Intune P2 add-on before assigning a P1 license, or P1 lice... | If P2 purchased before P1: create ICM for destructive tenant move. Workaround... | 9.0 | ado-wiki |
| 10 | MDM authority shows SCCM/System Center Configuration Manager — customer needs... | SCCM MDM is long deprecated. Intune removed the self-service ability to chang... | 1) Requires GA approval 2) Prerequisites: remove config policies from All Use... | 9.0 | ado-wiki |
| 11 | Enrollment fails: Looks like the MDM Terms of Use endpoint is not correctly c... | User lacks valid Intune or Office 365 license, or MDM terms of use URL in Ent... | Assign valid Intune/M365 license to user. In Azure portal > Entra ID > Mobili... | 8.0 | mslearn |
| 12 | Windows enrollment error 0x801c003 or 80180003: This user is not authorized t... | (1) User reached max device limit, (2) Device type blocked by restrictions, (... | (1) Remove unused devices or increase limit (max 15). (2) Set Windows (MDM) t... | 8.0 | mslearn |
| 13 | Customers may want to create/deploy a custom .bat or .cmd file to machines en... | To date, Microsoft Intune does not support the deployment of .bat or .cmd fil... | To resolve this issue the customer can compile/package their .bat or .cmd fil... | 7.5 | contentidea-kb |
| 14 | When attempting to publish an app in Intune via the Software Publisher consol... | The user account used when uploading the app package does not have a valid In... | Assign a license to the user account (UPN) being used when uploading the appl... | 7.5 | contentidea-kb |
| 15 | Under Administration Overview you see a message: You have exceeded the number... | Customers are allowed 15 devices per user by default. PC agent enrolled devic... | This message is expected. No major impact to the service if physical seats ha... | 7.5 | contentidea-kb |
| 16 | Global Administrator is attempting to deploy Software or Application and they... | This occurs because the Global Administrator does not have an Intune License | Assign an Intune License to the Global Administrator attempting to deploy Sof... | 7.5 | contentidea-kb |
| 17 | One of the top requests from Intune administrators is for richer tools to man... |  |  | 7.5 | contentidea-kb |
| 18 | When adding the 26th Device Enrollment Manager (DEM) account, an error "An er... | This can occur if the account you're trying to add does not have a valid Intu... | To resolve this error, first try adding an Intune license to a user, then rem... | 7.5 | contentidea-kb |
| 19 | Intune for Education Enrollment Accounts 1. Log into the Intune for Education... |  |  | 7.5 | contentidea-kb |
| 20 | When trying to create an Intune subscription with System Center Configuration... | Customer was using an on-premise AD account with ADFS | Create a cloud account with an Intune license and Global Administrator privil... | 7.5 | contentidea-kb |
| 21 | Unable to enroll device due to message, Error:[DeviceTypeNotSupported] during... | Using Kusto, confirm the following query against the UserID to get the enroll... | To correct this you need to validate the Enrollment Restrictions for the tena... | 7.5 | contentidea-kb |
| 22 | When attempting to enroll a Windows Phone in Microsoft Intune, the enrollment... | This can occur if the user enrolling the phone does not have a valid Intune l... | To resolve this problem, assign the user a valid Intune license then attempt ... | 7.5 | contentidea-kb |
| 23 | When attempting to enroll a Windows 10 computer in Intune, or join a Windows ... | This can occur if the Intune tenant is configured for co-existence with MDM f... | To resolve this problem, use the Office365 admin portal to assign the user ei... | 7.5 | contentidea-kb |
| 24 | After configuring hybrid Azure AD per https://docs.microsoft.com/en-us/azure/... | This can occur for two reasons:1. The GPO for auto enrollment per https://doc... | To work around this problem, either upgrade the client PCs to Windows 10 buil... | 7.5 | contentidea-kb |
| 25 | Example scenario, customer has configured a Device Restrictions Policy with t... | *this is only currently confirmed for Android devices, if you are able to con... | The reason the user has not been prompted to change their password, is becaus... | 7.5 | contentidea-kb |
| 26 | Scenario 1 Actual Error This Service is not supported. No Enrollment Policy I... |  |  | 7.5 | contentidea-kb |
| 27 | Attempting to enroll an iOS device fails with the following error: User Licen... | This can occur if the user trying to enroll the device does not have a valid ... | To resolve this issue, assign an Intune license to the user:1. Go to the Offi... | 7.5 | contentidea-kb |
| 28 | Attempting to enroll an iOS device fails with the following error message: Us... | This can occur if the user trying to enroll the device does not have a valid ... | To resolve this issue, assign an Intune license to the user:1. Go to the Offi... | 7.5 | contentidea-kb |
| 29 | Users are unable to sign into Project Online and&nbsp;Visio Online Plan 2 aft... | This can occur if the user does not have the proper licenses assigned. | Project1. The user must have a Project Online Desktop Client license. A licen... | 7.5 | contentidea-kb |
| 30 | When you go t o device enrollment you see the following error messageCompany ... | This because the used license count is greater then 50% of the total license ... | This error is just a waring that you are using up your licenses. &nbsp; &nbsp; | 7.5 | contentidea-kb |
| 31 | *** As of March 2015 the download benefit is no longer for sale and no softwa... | The client must use a full Global Admin from the actual paid account&nbsp;to ... | You&nbsp;can find&nbsp;your Windows 7 and Windows 8&nbsp;Enterprise ISO, SCCM... | 7.5 | contentidea-kb |
| 32 | This document provides some basic scoping questions for troubleshooting Mobil... |  |  | 7.5 | contentidea-kb |
| 33 | When attempting to enroll a Windows 10 PC by going to&nbsp;Access work or sch... | This can occur if the user doing the enrollment does not have a valid Intune ... | Top resolve this issue, assign the user an Intune or EMS license then try enr... | 7.5 | contentidea-kb |
| 34 | Since we have launched the preview version of&nbsp;Corporate-owned, fully man... | By design, all system apps will be disabled during Corporate-owned, fully man... | For devices running Android 7+, users can scan QR code for enrolling as “Corp... | 7.5 | contentidea-kb |
| 35 | Microsoft Intune and Basic Mobility and Security both give you the ability to... |  |  | 7.5 | contentidea-kb |
| 36 | A DNS alias (CNAME record type) is required for all Windows 8.1 and Windows R... |  |  | 7.5 | contentidea-kb |
| 37 | With Microsoft Intune Exchange connector, we can easily control Exchange Acti... |  |  | 7.5 | contentidea-kb |
| 38 | Intune enables a spectrum of app and device management options for iPads and ... |  |  | 7.5 | contentidea-kb |
| 39 | The amount of configuration needed for MDM enrollment varies per platform and... |  |  | 7.5 | contentidea-kb |
| 40 | ****** This is internal information for Support education only************* D... |  |  | 7.5 | contentidea-kb |
| 41 | Device limit restrictions, which can be configured via two ways, has been a t... |  |  | 7.5 | contentidea-kb |
| 42 | Enroll BYOD device:&nbsp;https://learn.microsoft.com/en-us/mem/intune-service... |  |  | 7.5 | contentidea-kb |
| 43 | Q. Is Home SKU supported for MDM enrollment?A. Home SKU is officially support... |  |  | 7.5 | contentidea-kb |
| 44 | These set-up steps help you enable mobile device management (MDM) by using In... |  |  | 7.5 | contentidea-kb |
| 45 | Device limit restrictions, which can be configured via two ways, has been a t... |  |  | 7.5 | contentidea-kb |
| 46 | After creating an App Protection Policy for iOS/iPadOS devices targeting Adob... | In order to be managed by App protection policies, the user must &quot;enroll... | To &quot;enroll&quot; the user in this app for it to be managed by Intune, th... | 7.5 | contentidea-kb |
| 47 | &nbsp; This reference guide is primarily intended for iOS and Android Platfor... |  |  | 7.5 | contentidea-kb |
| 48 | After targeting a per-app VPN profile with certificate-based authentication t... | This occurs because&nbsp;there's a bug in iOS 13.x that prevents per-app VPN ... | Until Apple releases a fix for this problem, the only work around is to use a... | 7.5 | contentidea-kb |
| 49 | DeviceService_Device This table is meant to look for enrollment specific info... |  |  | 7.5 | contentidea-kb |
| 50 | Wifi profiles are failing on some Android 10 corporate-owned work profile (CO... | This issue is the result of an Android OS bug that had been fixed in the Dece... | The long-term resolution is that Intune is taking on work to fix this bug for... | 7.5 | contentidea-kb |
| 51 | This article explains why some customers might find that certain Device Enrol... | This occurs because the Intune license of those DEM users has been removed.Th... | The Intune license removal is visible in the Azure AD audit logs as follows:A... | 7.5 | contentidea-kb |
| 52 | The Basic Mobility and Security (previously known as Office 365 MDM  and inte... | The  flighting tag “UserLicensingForEDU” means all users in the  customer’s t... | There  are 2 paths forward:  1. Replace email and configuration with Intune p... | 7.5 | contentidea-kb |
| 53 | Customer has enabled connector between Intune and MDATP but they cannot enabl... | This issue happens if no Intune license has been assigned to the admin user. | Assign a valid Intune license to the Intune admin user. | 7.5 | contentidea-kb |
| 54 | Samsung devices are not getting enrolled in Intune using a Corporate-Identifi... | Company Portal logs does say that:&lt;s:Reason&gt;&lt;s:Text xml:lang=&quot;e... | First, verify that the Serial Number you fetch from the device is similar in ... | 7.5 | contentidea-kb |
| 55 | User can complete BYOD enrollment on iOS device without any error messages. H... | These entries are known as Orphaned devices, typically are caused by “removin... | Run the following Kusto query to find the orphan Azure DeviceID:WorkplaceJoin... | 7.5 | contentidea-kb |
| 56 | Customer is unable to enroll a device into Android Device Administrator due t... | This can happen if the device is unable to resolve the Azure host&nbsp;enterp... | Below are three potential options to resolve this problem: verify if there is... | 7.5 | contentidea-kb |
| 57 | End users sign in to the Company Portal app on an unenrolled iOS / Android de... | This can occur if&nbsp;the default option Available, with prompts&nbsp;is dis... | To resolve this problem, configure the Device Enrollment setting to&nbsp;Avai... | 7.5 | contentidea-kb |
| 58 | Windows 365 Enterprise is a cloud-based service that automatically creates a ... |  |  | 7.5 | contentidea-kb |
| 59 | Prerequisites and requirements.   - Steps to follow for configuration – Confi... |  |  | 7.5 | contentidea-kb |
| 60 | Android Enterprise BYOD (work profile) devices can no longer connect to any n... | Starting in Android 12, the IMEI (as well as MEID and serial number) can no l... | Access rules around IMEI, MEID, or serial number will no longer work as Intun... | 7.5 | contentidea-kb |
| 61 | Have you wondered, how can I mirror&nbsp;a repro or demo of my Android or iOS... |  |  | 7.5 | contentidea-kb |
| 62 | Certain customers will want to prevent their Polycom Teams phone devices from... | Intune license was assigned to the user who logged into the Teams phone device. | As per the documentation, a valid Intune license is needed in order for these... | 7.5 | contentidea-kb |
| 63 | If you found W365 business failed on provision, the root cause might be the b... |  | Nowadays there is no necessary to escalate ICM for asking BPRT deletion for c... | 7.5 | contentidea-kb |
| 64 | Windows 365 Business users are not required to have an Intune license or be e... |  |  | 7.5 | contentidea-kb |
| 65 | Customer reports that when they are enrolling devices as Fully Managed or Cor... | Ask the customer what steps they're taking to enroll the device. If they ment... | There are two possible solutions for this issue:  Ask the customer to wipe th... | 7.5 | contentidea-kb |
| 66 | Azure AD Device ID records are now being re-used when re-enrolling the same i... | This is by design. | The AAD registration is used for more than just Intune purposes on iOS, AAD u... | 7.5 | contentidea-kb |
| 67 | Users assigned to a custom role with managed apps permissions configured, sti... | This can occur if the permissions configured for the Mobile apps are missing ... | by editing the permissions on the custom Role to enable the &quot;Organizatio... | 7.5 | contentidea-kb |
| 68 | All new or updated internal KB articles, new content requests such as doc upd... |  |  | 7.5 | contentidea-kb |
| 69 | Customer is trying to use auto-launch for Managed Home Screen on kiosk device... | This is by design from the Android side as there is a particular configuratio... | The Correct Required polices: &nbsp;   Create a device      configuration    ... | 7.5 | contentidea-kb |
| 70 | I recently had a case where a customer was getting blocked by enrollment rest... | An easy way to understand which enrollment restriction and why this is gettin... | With all of this information you just need to go to the enrollment restrictio... | 7.5 | contentidea-kb |
| 71 | Customer is not able to create&nbsp;Corporate-owned, user-associated devices ... | Upon further investigation, you collect a .har trace and the following is fou... | To fix the issue customer must delete inactive enrollment profile that has&nb... | 7.5 | contentidea-kb |
| 72 | Intune provides an Android Open-Source Project (AOSP) device management solut... | This issue arises due to an existing AOSP profile with Teams device enabled o... | To resolve this issue, follow these steps:  Delete the AOSP profile with an e... | 7.5 | contentidea-kb |
| 73 | After enrolling Android COPE devices, devices keep “Not evaluated” and do not... | This is because customers are using the method (Enroll by using a token) ente... | When enrolling Android COPE devices, we need to read QR code by repeatedly ta... | 7.5 | contentidea-kb |
| 74 | When enrolling devices in Intune, you may encounter the &quot;Device limit re... | This error message is frequently confused with the Intune enrollment device c... | Resolution :    Step 1 : Check the user's device count in Azure AD using Grap... | 7.5 | contentidea-kb |
| 75 | &nbsp;When RBAC admin goes here&nbsp;Corporate-owned dedicated devices - Micr... | By-design | To be able to edit the enrollment profile, admin will need to have the Terms ... | 7.5 | contentidea-kb |
| 76 | &#128269; Background &nbsp; Currently, there is no official public documentat... | ⚠️&nbsp;Common Integration Error When attempting to integrate Meta Quest with... | ✅&nbsp;Correct Enrollment Type To resolve the issue, ensure that the JSON tok... | 7.5 | contentidea-kb |
| 77 | General Information for MAM  What is MAM? https://learn.microsoft.com/en-us/i... |  |  | 7.5 | contentidea-kb |
| 78 | When configuring the Intune Connector for Active Directory, after signing in ... | The Microsoft Entra account used to sign in is not assigned with an Intune li... | Assign an Intune license to the Microsoft Entra ID account and&nbsp;rerun the... | 7.5 | contentidea-kb |
| 79 | Intune Connector for AD sign-in unexpected error: An error occurred while pro... | Sign-in account not assigned Intune or Microsoft Office license | Assign Intune license to the user account. | 6.5 | mslearn |
| 80 | Jamf console shows Unable to connect to Microsoft Intune and Unable to send i... | Jamf license has expired | Contact Jamf Software to renew the license | 6.5 | mslearn |
| 81 | Users are unable to sign into Project Online and Visio Online Plan 2 after in... | This can occur if the user does not have the proper licenses assigned. | Project 1. The user must have a Project Online Desktop Client license. A lice... | 4.5 | contentidea-kb |
| 82 | When you go t o device enrollment you see the following error message Company... | This because the used license count is greater then 50% of the total license ... | This error is just a waring that you are using up your licenses. | 4.5 | contentidea-kb |
| 83 | *** As of March 2015 the download benefit is no longer for sale and no softwa... | The client must use a full Global Admin from the actual paid account to downl... | You can find your Windows 7 and Windows 8 Enterprise ISO, SCCM, MDOP, and oth... | 3.0 | contentidea-kb |
| 84 | This document provides some basic scoping questions for troubleshooting Mobil... |  |  | 3.0 | contentidea-kb |
| 85 | When attempting to enroll a Windows 10 PC by going to Access work or school -... | This can occur if the user doing the enrollment does not have a valid Intune ... | Top resolve this issue, assign the user an Intune or EMS license then try enr... | 3.0 | contentidea-kb |
