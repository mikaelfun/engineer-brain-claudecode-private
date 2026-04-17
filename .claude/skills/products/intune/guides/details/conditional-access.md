# INTUNE 条件访问 — 已知问题详情

**条目数**: 170 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: SharePoint site can be accessed via web browser but user cannot download/print/sync with error: 'Your organization doesn't allow you to download, p...
**Solution**: 1. Verify SharePoint admin center > Access control > Unmanaged devices setting. 2. If 'Allow limited, web-only access' is set, two auto-created CA policies exist. 3. To allow download: either enroll device in Intune or Hybrid AAD Join the device to satisfy the CA policy. 4. Alternatively, SharePoint admin can change to 'Allow full access from desktop apps, mobile apps, and the web' if security posture permits.
`[Source: onenote, Score: 9.5]`

### Step 2: Conditional Access policy requiring device compliance shows 'failure' in sign-in logs during initial Intune enrollment via OOBE; admin concerned en...
**Solution**: No action needed. Do NOT exclude Microsoft Intune Enrollment from compliance CA policy. The CA failure log during initial enrollment is informational and harmless. After enrollment completes, compliance policies deploy and device becomes compliant.
`[Source: onenote, Score: 9.5]`

### Step 3: Need to collect comprehensive MDM diagnostic logs from Windows device for co-management or Autopilot troubleshooting including enrollment, policies...
**Solution**: MdmDiagnosticsTool.exe -out c:\autopilot.cab (Autopilot + event logs). MdmDiagnosticsTool.exe -area Autopilot;TMP -cab c:\temp\autopilot.cab (+ TPM). For MDM only: Settings > Accounts > Access work or school > Export management log files. Review MDMDiagReport.xml (Autopilot settings) and MDMDiagHtmlReport.html (Policy CSP, certs, apps). Use Windows Performance Analyzer for ETL traces.
`[Source: onenote, Score: 9.5]`

### Step 4: Device appears compliant in Intune but user is blocked by Conditional Access policy; AAD shows IsManaged or IsCompliant as false
**Solution**: Assign a valid license containing Intune to the affected user. Verify IntuneLicensed=true in Rave. If IsManaged=false troubleshoot enrollment; if IsCompliant=false troubleshoot compliance policy.
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Device Enrollment Manager (DEM) admin user blocked by Conditional Access even though the enrolled device itself is compliant
**Solution**: Use a non-DEM user account to sign in. For Windows MDM-enrolled and Azure AD-joined devices, a non-DEM user can sign into the device and will be granted CA access.
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Windows PC is noncompliant but user is not blocked from accessing email/O365; CA policy appears ineffective on Windows
**Solution**: Configure AAD Device Registration and AD FS to block earlier Outlook versions or all mail apps on Windows PCs. See Microsoft docs on setting up SharePoint Online and Exchange Online for Azure AD Conditional Access.
`[Source: ado-wiki, Score: 9.0]`

### Step 7: 批量删除的 Intune 设备同时 Entra ID 设备记录也已被删除，客户请求恢复
**Solution**: 告知客户恢复不可能，必须重新注册（re-enroll）受影响的设备
`[Source: ado-wiki, Score: 9.0]`

### Step 8: 设备 Retire 后用户仍能登录 Office 应用
**Solution**: 使用 Conditional Access 策略限制设备访问，确保非合规/非注册设备被阻止；也可通过 Azure AD 中吊销用户 refresh tokens
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | SharePoint site can be accessed via web browser but user cannot download/prin... | SharePoint admin enabled 'Allow limited, web-only access' for unmanaged devic... | 1. Verify SharePoint admin center > Access control > Unmanaged devices settin... | 9.5 | onenote |
| 2 | Conditional Access policy requiring device compliance shows 'failure' in sign... | Expected behavior. During OOBE, device registration (DRS) and Intune MDM enro... | No action needed. Do NOT exclude Microsoft Intune Enrollment from compliance ... | 9.5 | onenote |
| 3 | Need to collect comprehensive MDM diagnostic logs from Windows device for co-... | Multiple log sources needed: Event Viewer logs (AAD-Operational, DeviceManage... | MdmDiagnosticsTool.exe -out c:\autopilot.cab (Autopilot + event logs). MdmDia... | 9.5 | onenote |
| 4 | Device appears compliant in Intune but user is blocked by Conditional Access ... | User does not have a valid Intune license assigned (IntuneLicensed=false in R... | Assign a valid license containing Intune to the affected user. Verify IntuneL... | 9.0 | ado-wiki |
| 5 | Device Enrollment Manager (DEM) admin user blocked by Conditional Access even... | DEM users are not supported for device-based Conditional Access by design. Th... | Use a non-DEM user account to sign in. For Windows MDM-enrolled and Azure AD-... | 9.0 | ado-wiki |
| 6 | Windows PC is noncompliant but user is not blocked from accessing email/O365;... | On Windows PCs, Conditional Access only blocks native email app, Office 2013 ... | Configure AAD Device Registration and AD FS to block earlier Outlook versions... | 9.0 | ado-wiki |
| 7 | 批量删除的 Intune 设备同时 Entra ID 设备记录也已被删除，客户请求恢复 | Entra ID Engineering 确认：一旦 Entra 设备对象被删除就无法恢复 | 告知客户恢复不可能，必须重新注册（re-enroll）受影响的设备 | 9.0 | ado-wiki |
| 8 | 设备 Retire 后用户仍能登录 Office 应用 | Retire 操作不会吊销 access tokens，用户可继续使用现有令牌访问 Office 应用 | 使用 Conditional Access 策略限制设备访问，确保非合规/非注册设备被阻止；也可通过 Azure AD 中吊销用户 refresh tokens | 9.0 | ado-wiki |
| 9 | 无法向 Windows 10 桌面设备发送 Device Lock 操作 | Windows 10 桌面设备不支持远程锁定功能，这是平台限制 | 这是预期行为，Windows 10 桌面设备不支持 Remote Lock；可考虑使用 Conditional Access 或 Azure AD 中禁用... | 9.0 | ado-wiki |
| 10 | Windows Backup 备份或还原时用户收到 You don't have access to this 或 You can't get there... | 租户的 Conditional Access 策略干扰了 Windows Backup 的身份验证流程 | 参考 Microsoft 文档排查 Conditional Access 策略干扰: https://learn.microsoft.com/en-us/... | 9.0 | ado-wiki |
| 11 | macOS Platform SSO password sync fails with 'window shake' error during regis... | Per-User MFA blocks the Platform SSO registration flow. This does not occur w... | Disable Per-User MFA and use Conditional Access MFA instead, which suppresses... | 9.0 | ado-wiki |
| 12 | EPM: missing right-click Run with elevated access menu option on Windows device | On Windows 11 the option is hidden under Show more options context menu; or E... | 1) On Windows 11 select Show more options in right-click menu. 2) Verify OS i... | 9.0 | ado-wiki |
| 13 | Microsoft Intune Enrollment cloud app (AppId d4ebce55-015a-49b5-a083-c84d1797... | The Microsoft Intune Enrollment service principal is not created automaticall... | Run PowerShell: Connect-AzureAD; New-AzureADServicePrincipal -AppId d4ebce55-... | 9.0 | ado-wiki |
| 14 | Windows enrollment fails with error 8018000a The device is already enrolled. ... | A different user account has already enrolled the device in Intune or joined ... | Sign in with the other account that enrolled/joined the device. Go to Setting... | 8.0 | mslearn |
| 15 | Linux 设备访问 M365/Azure 资源时显示 Access Denied / Error 530003 | 用户未使用 Microsoft Edge 访问受 CA 策略保护的资源；或 Edge Dev 版本低于 100.x；或设备未注册/不合规 | 1. 确认用户使用 Microsoft Edge（非 Firefox/Chrome/Safari）。2. 更新 Edge 到最新版本（>=102.x）。3... | 7.5 | ado-wiki |
| 16 | There are advantages and disadvantages based on how a device is enrolled and ... | There are a couple methods of enrolling a device in Intune. Computers running... | See the capability comparison chart: Windows PC management (Desktop) capabili... | 7.5 | contentidea-kb |
| 17 | Intune Support Troubleshooting Workflows Our goals are simple - to assist in ... |  |  | 7.5 | contentidea-kb |
| 18 | Paid customers are not able to access Download Center or view product key | The Download Center is maintained by a separate team than the Windows Intune PG. | Determine if affecting one or multiple users. Reference article 2725048. If m... | 7.5 | contentidea-kb |
| 19 | How to implement Azure AD Conditional Access for Exchange Online access for e... |  |  | 7.5 | contentidea-kb |
| 20 | Computers running the full Microsoft Intune client may experience one or more... | This problem may occur if superseded updates have not been declined for an ex... | To resolve this issue, follow these steps:Log on to the admin console at http... | 7.5 | contentidea-kb |
| 21 | Whether a device is a desktop, laptop or tablet is not the primary deciding f... |  | To manage Windows PCs, you have two choices:+ Enroll the device orInstall the... | 7.5 | contentidea-kb |
| 22 | When attempting to launch the Skype for Business client app, after you enter ... | This is by design. Conditional Access policies are not supported for Skype fo... | Here are three potential workarounds to this problem:1. Disable the Azure AD ... | 7.5 | contentidea-kb |
| 23 | Customer has created a shared mailbox (configured as a user account) and targ... | By design - Intune can only push an email profile for the directly enrolled u... | You can only have one mailbox managed through Intune on a device. The shared ... | 7.5 | contentidea-kb |
| 24 | Customer enabled SharePoint conditional access policy in the Intune App Prote... | By design | The following ICM bug has been filed: https://icm.ad.msft.net/imp/v3/incident... | 7.5 | contentidea-kb |
| 25 | Questions from a customer and the answers provided to these questions by a PM... |  |  | 7.5 | contentidea-kb |
| 26 | The Basics For policy failures the first step should be to check if the devic... |  |  | 7.5 | contentidea-kb |
| 27 | Intune users targeted by Exchange Online MAMCA with the requirement to only a... | You can combine device-based and app-based conditional policies (logical AND)... | Intune admins should migrate their Intune Exchange Online Conditional Access ... | 7.5 | contentidea-kb |
| 28 | When a user enrolls an iPad device into the Intune Service and is targeted by... |  | iPhone devices work, but with the iPad, the customer will need to download th... | 7.5 | contentidea-kb |
| 29 | When accessing Graph Explorer, attempting to sign in fails with the following... | This can occur if a conditional access policy is enabled in the tenant and th... | To resolve this problem, do one of the following:- Disable the conditional ac... | 7.5 | contentidea-kb |
| 30 | Why do I need the Intune Company Portal if the Device is enrolled as a DEP de... |  |  | 7.5 | contentidea-kb |
| 31 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER ... | *********************************** **** ************************************... | Steps below to be completed by Flighting team members Note: The steps below a... | 7.5 | contentidea-kb |
| 32 | Customer attempts to configure Azure Intune portal settings, example Enrollme... | This can be caused when a Proxy is in the environment and is not configured f... | Provide the customer the following URLs for the Proxy Whitelist: *.windowsazu... | 7.5 | contentidea-kb |
| 33 | Customer is using Sandblast Mobile Threat Protection with Intune.  Customer h... | By design.  When a user initially enters their PIN an access token is granted... | By design. This will only work in instances where the token has not been issu... | 7.5 | contentidea-kb |
| 34 | App-based conditional access policies configured to use MFA (or a password in... | Currently this is by design as the native Mac email client is not supported w... | There are other ways to protect access to company email, such as requiring on... | 7.5 | contentidea-kb |
| 35 | Further information and video walkthrough in the Infopedia training&nbsp;Clic... |  |  | 7.5 | contentidea-kb |
| 36 | Intune public docs at this link contains the note below:&nbsp;https://docs.mi... |  |  | 7.5 | contentidea-kb |
| 37 | Attempting to enroll a Windows 10 PC fails with the following error:Something... | This can occur if a different user on the Windows device has already enrolled... | To resolve this problem, complete the following:1. Log out of Windows, then l... | 7.5 | contentidea-kb |
| 38 | Azure AD Joined Windows 10 fails to enroll into Intune MDM with error code 0x... | Auto enrollment is required. | Disconnect the device from Azure AD.     Turn on autoenrollment:      Login t... | 7.5 | contentidea-kb |
| 39 | Some admins may want to restrict Exchange Active Sync access to the Outlook a... |  |  | 7.5 | contentidea-kb |
| 40 | When logging on as another user to a Surface Hub you receive an error message... | You receiving this error because there is conditional access policy that is t... | To resolve this issue create a new security group.&nbsp; Move all the Surface... | 7.5 | contentidea-kb |
| 41 | When assigning a Device Compliance policy to a group of Windows computers, th... | This can occur if the group assigned the device compliance policy is a dynami... | To work around this issue, create a manually assigned device group or a user ... | 7.5 | contentidea-kb |
| 42 | Intune is making a key change to how conditional access compliance state is e... |  |  | 7.5 | contentidea-kb |
| 43 | This article describes the current processes to create Intune content:  Getti... |  |  | 7.5 | contentidea-kb |
| 44 | The product team recently released an additional summary section to the Azure... |  |  | 7.5 | contentidea-kb |
| 45 | This article explains which permissions are needed to allow a non Global Admi... |  |  | 7.5 | contentidea-kb |
| 46 | How to test if Intune and Jamf integration is working correctly. In Jamf Pro ... | N/A | If connection test fails, the customer should contact Jamf support to trouble... | 7.5 | contentidea-kb |
| 47 | This article describes the current processes to create Intune content: Creati... |  |  | 7.5 | contentidea-kb |
| 48 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 49 | As there seems to be a lot of confusion around what the difference is between... |  |  | 7.5 | contentidea-kb |
| 50 | You cannot enroll Windows 10 devices. After entering the user credentials und... | This issue can occur if Windows MDM enrollment is disabled in your Intune ten... | Sign in to the Azure portal as administrator. Select Intune, and then go to D... | 7.5 | contentidea-kb |
| 51 | When we access O365 resources from Android Chrome, there is an error “No cert... | There is a conditional access policy which requires access Office 365 resourc... | Enable browser access from Intune Company portal will resolve the issue.&nbsp; | 7.5 | contentidea-kb |
| 52 | You setup Hybrid Azure AD and wants to enroll devices with ConfigMgr agent in... | Enforced MFA is applied and&nbsp;ConfigMgr agent is unable to enroll the devi... | Disable the Enforced MFA and use only Enabled MFA. This can be done from port... | 7.5 | contentidea-kb |
| 53 | After deploying an Application as available to users and installed from the C... | It appears that applications that were added in the Silverlight Portal are no... | Workaround:Remove the current application from the device. Create a new appli... | 7.5 | contentidea-kb |
| 54 | My encrypted and compliant Android device is reported Encrypted: No in the Ha... | This is By-DesignTo report the device as Encrypted in this space, the user wi... | After setting a Secure Startup PIN, wait for over 24 hours and then sync the ... | 7.5 | contentidea-kb |
| 55 | Intune – Identity Foundations           Let’s start with the focus of this do... |  |  | 7.5 | contentidea-kb |
| 56 | When a user tries to logon into Azure AD Joined windows 10 machine which have... | This behavior happens because the users are targeted by Conditional Access po... | This is expected behavior. An alternate solution is to turn off MFA for the k... | 7.5 | contentidea-kb |
| 57 | Announcements General: Azure Support Center MSSolve Case Requirement:&nbsp;  ... |  |  | 7.5 | contentidea-kb |
| 58 | Error &quot;ZtdDeviceAssignedToOtherTenant&quot;Device was previously used fo... | ZTD Autopilot record of device serial # is still present on another tenant | If customer knows what tenant the ZTD record is associated with, then have th... | 7.5 | contentidea-kb |
| 59 | When trying to join/enroll a Windows 10 (1803) device into Azure AD/Intune us... | At the time of this article, the update to GCC high has not been made and the... | Resolve this issue by updating the MDM URLs with the format *.microsoft.us/* ... | 7.5 | contentidea-kb |
| 60 | Learn how to create a report of Mobile Device Manager (MDM) logs to diagnose ... |  |  | 7.5 | contentidea-kb |
| 61 | Once configured, the user Enrollment Status Page (ESP) will activate for any ... | Once ANY user that is scoped for the Enrollment Status Page logs into a machi... | There are two primary methods of disabling the User ESP after it has been con... | 7.5 | contentidea-kb |
| 62 | When you import a CsV into the Intune portal under&nbsp;Intune-&gt;Device Enr... | The error &quot;wadp005&quot; is translated per article&nbsp;https://go.micro... | Since 12.5.18 there have been multiple cases where this error has occurred on... | 7.5 | contentidea-kb |
| 63 | Global Administrator or an Intune Service Administrator assigned Intune RBAC ... | User Education | When creating this custom setting, you want to ensure that the user has full ... | 7.5 | contentidea-kb |
| 64 | You have performed bulk enrollment of iOS devices in your environment, after ... | This device was a part of bulk enrollment and initially did not have a user a... | As this is expected behavior as current design, the customer can choose to ei... | 7.5 | contentidea-kb |
| 65 | When creating \ deploying an Configuration Policy for Windows 10 multi-app ki... | This is caused by identified Bug 21309661: AutoPilot Kiosk Scenario Remove As... | Until the Bug 21309661 is released to 19H1 and RS5 (Windows platform), the cu... | 7.5 | contentidea-kb |
| 66 | Scenario 1On Windows MDM enrolled devices, under Settings / Account / Access ... | Cause is due to Enrollment Status Page waiting on Azure AD registration to co... | This is a known issue and fixed with Windows version 1903 or newer | 7.5 | contentidea-kb |
| 67 | A      GPO has been configured to deploy Intune autoenrollment settings for ... | The problem was due an issue with Active Directory replication, which causes ... | Fixing the DS replication issue allowed the MDM admx being available on logon... | 7.5 | contentidea-kb |
| 68 | Support Tip: Calculation of the Capabilities for Workloads in Co-managementOn... |  |  | 7.5 | contentidea-kb |
| 69 | Actual ErrorWorkplace join not attempted or failedImpact to userNon-workplace... |  |  | 7.5 | contentidea-kb |
| 70 | Viewing logs on the deviceStarting with the November 2016 update for Windows ... |  |  | 7.5 | contentidea-kb |
| 71 | What is Autodiscover? &nbsp; &nbsp;Autodiscover service is the process that c... |  |  | 7.5 | contentidea-kb |
| 72 | During the Conditional Access workflow devices enroll successfully&nbsp;to In... | The user account&nbsp;used during Device Enrollment is&nbsp;a Device Enrollme... | Option 1:Remove that user account from the Device Enrollment Manager Role und... | 7.5 | contentidea-kb |
| 73 | You were previously using Office 365 Mobile Device Management or you are usin... | Office 365 MDM Security Policies are deployed to a group that the user is a m... | This is expected behavior as user authority is not checked by Conditional Acc... | 7.5 | contentidea-kb |
| 74 | Service unable to report past proxy serverProxy server in environmentHow to c... | The presence of one or more of these error codes typically means that proxy s... | For the latest specific IP Addresses and URL's see:Intune:&nbsp;https://docs.... | 7.5 | contentidea-kb |
| 75 | Intune external users are not able to become a members of Organizational Grou... | Intune app protection policies (MAM) along with conditional access, will caus... | Removed the MAM policy requirement from the conditional access policy from th... | 7.5 | contentidea-kb |
| 76 | For any updates to this article,&nbsp;&nbsp;SME Leads and managers&nbsp;&nbsp... |  |  | 7.5 | contentidea-kb |
| 77 | About this documentThis document is a &quot;cookbook&quot; designed to help w... |  |  | 7.5 | contentidea-kb |
| 78 | A number of the CSS Support teams the Intune team interacts with maintain con... |  |  | 7.5 | contentidea-kb |
| 79 | How to Shift to Modern Management with Microsoft Endpoint ManagerCustomers no... |  |  | 7.5 | contentidea-kb |
| 80 | Introducing Endpoint Security node within the improved Microsoft Device Manag... |  |  | 7.5 | contentidea-kb |
| 81 | Word and Excel corporate documents cannot be opened. Outlook app fails to con... | The Office version used by Customer was not included as a protected app on th... | Edit the WIP policy, and add a new store app as follow:           Store Ap... | 7.5 | contentidea-kb |
| 82 | When trying to access Office 365 resources protected by Azure AD Conditional ... | This can occur when the user is launching the app from the Personal Profileor... | There are several required steps for the IT Admin to complete before users ca... | 7.5 | contentidea-kb |
| 83 | Group targeting for Jamf Pro macOS enrollment   In Microsoft Intune’s Novembe... |  |  | 7.5 | contentidea-kb |
| 84 | We’ve heard a few questions recently from customers looking for guidance how ... |  |  | 7.5 | contentidea-kb |
| 85 | Please be aware of the following notes regarding conditional access:Windows 7... |  |  | 7.5 | contentidea-kb |
| 86 | OverviewStarting with Jamf Pro 10.18, Jamf introduces the Cloud Connector, si... |  |  | 7.5 | contentidea-kb |
| 87 | Customer has JAMF managed macOS devices integrated with Intune for compliance... | All compliant JAMF managed devices were forced to MFA every time they tried t... | Further testing revealed that the customer was using a new outbound proxy and... | 7.5 | contentidea-kb |
| 88 | Outlook unable to detect the newly enrolled device id causing the new user un... | We can always reproduce the issue with our test      Tenant.          &nbsp; ... | Option 1: Factory resetOption 2:   For Unenroll the device:      Company Port... | 7.5 | contentidea-kb |
| 89 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER ... | Each hardware hash can only exist once in the Intune service throughout all t... | 1. Send the customer the following template email. If the customer is reporti... | 7.5 | contentidea-kb |
| 90 | Bulk update Retention Policies for Teams Channel messages or Teams Chat with ... |  |  | 7.5 | contentidea-kb |
| 91 | This document will reveal the actions which occur when attempting Co-Manageme... |  |  | 7.5 | contentidea-kb |
| 92 | When attempting to enrolling Poly CCX 600 devices the device does not enroll ... | Cause: The device includes built in versions of Teams and Company Portal. The... | Solution: Poly has released a new update package that includes updates to the... | 7.5 | contentidea-kb |
| 93 | Why is setup important?For a Surface Hub to adhere to Conditional Access poli... |  |  | 7.5 | contentidea-kb |
| 94 | If the customer wants to use&nbsp;Conditional Access&nbsp;with their Surface ... |  |  | 7.5 | contentidea-kb |
| 95 | Want to repro, but don’t have access to a Surface Hub? You aren’t alone!These... |  |  | 7.5 | contentidea-kb |
| 96 | This is not a guideline on how to troubleshoot Conditional Access; this artic... |  |  | 7.5 | contentidea-kb |
| 97 | What is a compliance policy?&nbsp;A compliance policy is a set of requirement... |  |  | 7.5 | contentidea-kb |
| 98 | Customer/engineer created a Conditional Access policy where he wants to block... | Conditional Access policy blocks all users from all cloud apps except when lo... | As it is not possible for any Global Admin to disable this policy by themselv... | 7.5 | contentidea-kb |
| 99 | VMWare AirWatch Integration failed with error &quot;Save Failed ErrorOccurred... | There can be at least three causes among others for the error&nbsp; &quot;Sav... | Resolution are listed as belowResolution for Cause 1 :&nbsp;&nbsp;Verify if t... | 7.5 | contentidea-kb |
| 100 | Customers using GoodSync app can save corporate files on personal locations.G... |  |  | 7.5 | contentidea-kb |
| 101 | Office 365 GCC High and DoD Tenant identification and requirements for Intune... |  |  | 7.5 | contentidea-kb |
| 102 | When users access portal.office.com on a Windows device using either with Chr... | This can occur if the device record is deleted from Azure AD, or if there is ... | If the device is missing in AAD, re-enroll the device.&nbsp;If the device is ... | 7.5 | contentidea-kb |
| 103 | When enrolling Windows 10 devices leveraging AutoMDMEnrollment (Autopilot, Az... | This is by design. | The resolution requires deleting the application that is currently set as def... | 7.5 | contentidea-kb |
| 104 | This issue was worked on by SEE Radu Pascal.Customer reports that Autopilot W... | The &quot;Microsoft Intune Enrollment&quot; app is set to MDM User Scope - Al... | The only way to fix this is to delete the&nbsp;&quot;Microsoft Intune Enrollm... | 7.5 | contentidea-kb |
| 105 | After configuring JAMF integration with Intune you experience one or more of ... | This issue can occur if Jamf Pro sends a deactivation signal (State=1) to Mic... | To resolve this issue, the customer will need to work with Jamf to identify w... | 7.5 | contentidea-kb |
| 106 | In the Company Portal app on a Windows 10 device targeted by WIP with enrollm... | This can occur if you haven't added the Company Portal app to the Allowed app... | To resolve this problem, add the Company Portal to the Allowed apps or Exempt... | 7.5 | contentidea-kb |
| 107 | This article describes what is supported in Intune as well as some common mis... |  |  | 7.5 | contentidea-kb |
| 108 | What's cover under Intune Support.Device enrollment to Intune:  Windows      ... |  |  | 7.5 | contentidea-kb |
| 109 | ObjectivesAfter completing this training, you will be able to:Understand the ... |  |  | 7.5 | contentidea-kb |
| 110 | Customers can&nbsp;use Intune and Windows Autopilot to set up hybrid Azure Ac... |  |  | 7.5 | contentidea-kb |
| 111 | Intune MEMCM Integration SummaryCo-management is one of the primary ways to a... |  |  | 7.5 | contentidea-kb |
| 112 | User has an Exchange Online      mailbox  Email profile is being      deliver... | The device is being quarantined by conditional access policy that enforces gr... | From an Intune perspective, our job is to ensure that the email profile is su... | 7.5 | contentidea-kb |
| 113 | Our networking partners use the Intune network access control (NAC) service t... |  |  | 7.5 | contentidea-kb |
| 114 | Microsoft Enterprise SSO plug-in for macOS Apple devices (preview) does not w... | The feature has been described in the below article and policies can be confi... | To leverage this feature, the admin should exclude the end user from the sign... | 7.5 | contentidea-kb |
| 115 | Zimperium Mobile Threat Defense works in real-time to proactively protect the... |  |  | 7.5 | contentidea-kb |
| 116 | Zimperium deploys an application (which needs to be activated) that allows th... |  |  | 7.5 | contentidea-kb |
| 117 | IntuneEvent  / where env_time &gt; ago(10d) // your timeframe  / where Compon... |  |  | 7.5 | contentidea-kb |
| 118 | User is enabled to use legacy      per-user MFA   Users are unable to connect... | Per-user multi-factor authentication isn't supported for users connecting to ... | Validate issue The easiest way to validate if the end user is enabled for per... | 7.5 | contentidea-kb |
| 119 | What is Office 365 Critical Functionality Loss? This is a process defined by ... |  |  | 7.5 | contentidea-kb |
| 120 | While trying to enroll a device with a DEM account you receive the following:... | This can occur if the user has exceeded the device limit restriction.&nbsp;If... | To resolve this problem, increase the maximum number of devices per user in A... | 7.5 | contentidea-kb |
| 121 | Pick a SME area or subtopic below to continue. AdminUI Apps-Deployment Androi... |  |  | 7.5 | contentidea-kb |
| 122 | Sign-in/Enrollment Licensing:   Users of Teams phones must      have a Teams ... |  |  | 7.5 | contentidea-kb |
| 123 | This document outlines some of the basic workings of Windows Printing and cov... |  |  | 7.5 | contentidea-kb |
| 124 | When I try to sign into the MHS in Azure AD shared devices I receive the mess... | If I go to the the Azure Sign-in logs I see this entries:    if I examine the... | To resolve this issue, go to the conditional access policy that is blocking t... | 7.5 | contentidea-kb |
| 125 | Note: UserId, device details displayed in this internal article belong to a t... |  |  | 7.5 | contentidea-kb |
| 126 | Customers might open tickets for Intune that should be filed for Microsoft Ma... |  |  | 7.5 | contentidea-kb |
| 127 | Customer assigns a Windows 365 Business license to an active user, but Cloud ... |  | It’s possible that customers organization has configured so that Multi-Factor... | 7.5 | contentidea-kb |
| 128 | Support Engineers in Modern Workplace can now&nbsp;install the Windows Hub Cl... |  |  | 7.5 | contentidea-kb |
| 129 | Sometimes we get cases were Customer name and tenant’s info are not populated... |  |  | 7.5 | contentidea-kb |
| 130 | You can verify if a workload at the client level is respecting the workloads ... |  | If you look into the CoManagementHandler logs for the MOST recent line &quot;... | 7.5 | contentidea-kb |
| 131 | IMPORTANT! This article applies to&nbsp;Intune Tek Experts Support Engineers ... |  |  | 7.5 | contentidea-kb |
| 132 | This Article will guide you how to use My Workspace to create ready SCCM Temp... |  |  | 7.5 | contentidea-kb |
| 133 | 1. Intune managed Windows client devices may update to a target OS version be... | The cause for Issue 1 was mitigated by November 12, 2022, though a small perc... | IMMEDIATE WORKAROUND to DEESCALATE: If the device&nbsp;was updated less than ... | 7.5 | contentidea-kb |
| 134 | Customer is setting up Zscaler with Strict Enforcement on macOS devices in or... | These are the steps happening:  Device enrolls into Jamf Pro Zscaler &quot;St... | Zscaler Strict Enforcement requires additional endpoints added to the pac fil... | 7.5 | contentidea-kb |
| 135 | 2FA: Two Factor Authentication AAD: Azure Active Directory  AADP: Azure Activ... |  |  | 7.5 | contentidea-kb |
| 136 | Windows 11 devices may fail to enroll if an environment has a proxy other net... | This can occur because Windows 11 (compared to Windows 10) needs more network... | Please feel free to share with customer the below official documentation rega... | 7.5 | contentidea-kb |
| 137 | A number of support cases and questions were generated in May 2023 regarding ... |  |  | 7.5 | contentidea-kb |
| 138 | IMPORTANT! ALL THE TENANT DATA USED BELOW IS PART OF A TEST TENANT, NO CUSTOM... |  |  | 7.5 | contentidea-kb |
| 139 | DHA endpoints will change for&nbsp;Windows 11&nbsp;devices in Tenant Release ... |  |  | 7.5 | contentidea-kb |
| 140 | ***Please note all the screenshots and Identifiers (GUIDs) on this KB are com... | Assist 365 shows the Intune object was soft deleted by device cleanup rules b... | Intune engineers: Refrain from attempting to reenroll these devices by removi... | 7.5 | contentidea-kb |
| 141 | After logging remote help, it report error &quot;It looks like you have signe... | Check Remote help PM and confirm Remote Help login is not tied to the device ... | Using following action plan to exclude remote help app from Conditional acces... | 7.5 | contentidea-kb |
| 142 | Microsoft Office 365 apps are not working on Android corporate-owned dedicate... | This can occur if the device is enrolled as a corporate-owned dedicated devic... | We have created a new enrollment profile with the token type corporate -owned... | 7.5 | contentidea-kb |
| 143 | As part of ongoing efforts to improve Windows Autopilot, certain change to ‘W... |  | Q: What action do I need to take? A: We encourage organizations to upgrade de... | 7.5 | contentidea-kb |
| 144 | On scenarios where an end user is being blocked by a Conditional Access polic... |  |  | 7.5 | contentidea-kb |
| 145 | In a co-management environment, users are prompted by Entra ID to open the &q... |  |  | 7.5 | contentidea-kb |
| 146 | Administrators have permanent elevated permissions in Intune.  Increased risk... | Built-in Azure AD roles such as Intune Administrator provide broad, always-on... | Implement Just-In-Time Intune access by combining Intune RBAC with Azure AD P... | 7.5 | contentidea-kb |
| 147 | When enrolling the Intune Connector for Active Directory, the connector wizar... | The domain account used to sign in to the server and run the Intune Connector... | You can resolve this issue using one of the following approaches:  Option 1: ... | 7.5 | contentidea-kb |
| 148 | Symptom  A Conditional Access (CA) policy that includes the “Require app prot... | Root Cause Recent Samsung Android devices come with the “Link to Windows(com.... | Disable Link to Windows services&nbsp;Navigate to Settings &gt; Apps &gt; Lin... | 7.5 | contentidea-kb |
| 149 | [KBWM]Archive and redirect 4507758 to docs (Troubleshooting Intune Conditiona... |  |  | 7.5 | contentidea-kb |
| 150 | Update KB 3044208 to include note that Intune does not support Conditional Ac... |  |  | 7.5 | contentidea-kb |
| 151 | Archived | MC518728 Plan for Change: One-time Conditional Access policy recheck for Wind... | What you need to do to prepare: Notify your helpdesk or IT staff so they are ... | 7.5 | contentidea-kb |
| 152 | Users cannot log on to Entra-joined Windows 10/11 with multi-app kiosk profil... | Conditional access policies requiring user interaction (MFA or TOU) conflict ... | Exclude kiosk users from conditional access policies that require user intera... | 7.0 | mslearn |
| 153 | Enrollment Status Page (ESP) times out before sign-in screen loads when track... | Conflict between ESP tracking Store for Business apps and CA policy requiring... | Target Intune compliance policies to devices (not users) so compliance can be... | 7.0 | mslearn |
| 154 | iOS/iPadOS device appears compliant but user is blocked by Conditional Access... | An existing manually configured email profile on the iOS device blocks deploy... | User must remove the existing manual email profile from the device, then the ... | 6.5 | mslearn |
| 155 | Intune-licensed users are unexpectedly prompted to enroll in Intune when acce... | Basic Mobility and Security for Microsoft 365 security policies are still dep... | Remove affected users from groups assigned Basic Mobility and Security securi... | 6.5 | mslearn |
| 156 | NAC (Network Access Control) partner integration returns HTTP 503 errors when... | Broad unfiltered queries to Intune are throttled: after the first 60 minutes ... | Limit broad unfiltered NAC queries to once every 4+ hours (within the first 6... | 6.5 | mslearn |
| 157 | When we access O365 resources from Android Chrome, there is an error “ No cer... | There is a conditional access policy which requires access Office 365 resourc... | Enable browser access from Intune Company portal will resolve the issue. | 4.5 | contentidea-kb |
| 158 | My encrypted and compliant Android device is reported Encrypted: No in the Ha... | This is By-Design To report the device as Encrypted in this space, the user w... | After setting a Secure Startup PIN, wait for over 24 hours and then sync the ... | 4.5 | contentidea-kb |
| 159 | Learn how to create a report of Mobile Device Manager (MDM) logs to diagnose ... |  |  | 4.5 | contentidea-kb |
| 160 | You have performed bulk enrollment of iOS devices in your environment, after ... | This device was a part of bulk enrollment and initially did not have a user a... | As this is expected behavior as current design, the customer can choose to ei... | 4.5 | contentidea-kb |
| 161 | You setup Hybrid Azure AD and wants to enroll devices with ConfigMgr agent in... | Enforced MFA is applied and ConfigMgr agent is unable to enroll the device us... | Disable the Enforced MFA and use only Enabled MFA. This can be done from port... | 3.0 | contentidea-kb |
| 162 | After deploying an Application as available to users and installed from the C... | It appears that applications that were added in the Silverlight Portal are no... | Workaround: Remove the current application from the device. Create a new appl... | 3.0 | contentidea-kb |
| 163 | Intune – Identity Foundations Let’s start with the focus of this document – w... |  |  | 3.0 | contentidea-kb |
| 164 | When a user tries to logon into Azure AD Joined windows 10 machine which have... | This behavior happens because the users are targeted by Conditional Access po... | This is expected behavior. An alternate solution is to turn off MFA for the k... | 3.0 | contentidea-kb |
| 165 | Announcements General: Azure Support Center MSSolve Case Requirement: When us... |  |  | 3.0 | contentidea-kb |
| 166 | Error "ZtdDeviceAssignedToOtherTenant" Device was previously used for Autopil... | ZTD Autopilot record of device serial # is still present on another tenant | If customer knows what tenant the ZTD record is associated with, then have th... | 3.0 | contentidea-kb |
| 167 | When trying to join/enroll a Windows 10 (1803) device into Azure AD/Intune us... | At the time of this article, the update to GCC high has not been made and the... | Resolve this issue by updating the MDM URLs with the format *.microsoft .us /... | 3.0 | contentidea-kb |
| 168 | Once configured, the user Enrollment Status Page (ESP) will activate for any ... | Once ANY user that is scoped for the Enrollment Status Page logs into a machi... | There are two primary methods of disabling the User ESP after it has been con... | 3.0 | contentidea-kb |
| 169 | When you import a CsV into the Intune portal under Intune->Device Enrollment-... | The error "wadp005" is translated per article https://go.microsoft.com/fwlink... | Since 12.5.18 there have been multiple cases where this error has occurred on... | 3.0 | contentidea-kb |
| 170 | Global Administrator or an Intune Service Administrator assigned Intune RBAC ... | User Education | When creating this custom setting, you want to ensure that the user has full ... | 3.0 | contentidea-kb |
