# INTUNE 证书通用问题与 Cloud PKI — 已知问题详情

**条目数**: 72 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Android users cannot access SharePoint Online or Exchange Online via browser after Intune device-based Conditional Access is enabled; browser repor...
**Solution**: Android Chrome: (1) Open Company Portal > triple-dot menu > Settings > Enable Browser Access; (2) Sign out of Office 365 in Chrome; (3) Restart Chrome; (4) On first access to SharePoint/Exchange, install the certificate when prompted. Android Edge: Sign in with Work or School account (Profile icon > Add Work account). Fiddler trace will show empty device_id claim until browser access certificate is installed.
`[Source: onenote, Score: 9.5]`

### Step 2: Windows device Intune sync fails with 'The sync could not be initiated' error after device has been offline for extended period or certificate was ...
**Solution**: Method 1 (with data loss): Disconnect work/school account via Settings > Accounts > Access work or school. Method 2 (without data loss): 1) Delete stale scheduled tasks under Task Scheduler > Microsoft > Windows > EnterpriseMgmt and note enrollment ID; 2) Delete stale registry keys under enrollment ID in HKLM paths (Enrollments, EnterpriseResourceManager, PolicyManager, Provisioning/OMADM); 3) Delete expired Intune cert from certlm.msc > Personal; 4) Run deviceenroller.exe /c /AutoEnrollMDM in S
`[Source: onenote, Score: 9.5]`

### Step 3: Windows Update scan fails with USO error 0x87c52200 (certificate error) during MoUpdateOrchestrator scan process
**Solution**: Exclude settings-win.data.microsoft.com from SSL inspection on proxy/firewall; verify certificate chain using CAPI2 event log
`[Source: onenote, Score: 9.5]`

### Step 4: Cloud PKI SCEP 证书下发失败，设备无法访问 SCEP URI（*.manage.microsoft.com 被防火墙/代理拦截）
**Solution**: 1. 在防火墙/代理中允许 *.manage.microsoft.com；2. 用浏览器测试 SCEP URI：追加 /?operation=GetCACaps 确认可达；3. 追加 /Certs.p7b?operation=GetCACert&message=MStest 验证证书链
`[Source: ado-wiki, Score: 9.0]`

### Step 5: 创建 Cloud PKI Issuing CA 时无法添加 Root CA 上未定义的 EKU，或选择 Any Purpose EKU 报错
**Solution**: 1. 创建 Root CA 前规划好所有需要的 EKU（Root CA 创建后无法修改）；2. 不要使用 Any Purpose EKU；3. 如需添加新 EKU 只能重新创建 Root CA + Issuing CA
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Cloud PKI CA 创建失败，提示已达 6 个 CA 服务器上限
**Solution**: 1. 规划 CA 层级在 6 台限制内（如 1 Root + 5 Issuing，或 2 Root + 2 Issuing 各）；2. 自 2407 起可删除不用的 CA：先 Pause → Revoke 所有叶证书 → Revoke CA → Delete CA；3. Root CA 需先删除所有锚定的 Issuing CA 才能删除
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Android Fully Managed/Dedicated 设备 SCEP 部署问题，DeviceManagementProvider 表无数据
**Solution**: 使用 IntuneEvent 查询 ApplicationName='AndroidSync' 和 ComponentName in ('StatelessAndroidSyncService','StatelessGooglePolicyService')，过滤 Col1 startswith 'SCEP' 获取部署详情
`[Source: ado-wiki, Score: 9.0]`

### Step 8: SCEP certificate fails to renew on a subset of Windows devices while others renew successfully
**Solution**: Use Procmon to diagnose: 1) Filter for Process Name=dmcertinst.exe and Path contains SCEP policy ID (replace - with _). 2) Look for error codes, use certutil /error or https://windowsinternalservices.azurewebsites.net/Static/Errors/ to decode. 3) Check Process tab for third-party DLLs loaded by dmcertinst.exe. 4) Remove/exclude the interfering software to resolve.
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Android users cannot access SharePoint Online or Exchange Online via browser ... | On Android, browser-based Conditional Access requires the Enable Browser Acce... | Android Chrome: (1) Open Company Portal > triple-dot menu > Settings > Enable... | 9.5 | onenote |
| 2 | Windows device Intune sync fails with 'The sync could not be initiated' error... | The Microsoft Intune MDM certificate (Local Machine > Personal > Certificates... | Method 1 (with data loss): Disconnect work/school account via Settings > Acco... | 9.5 | onenote |
| 3 | Windows Update scan fails with USO error 0x87c52200 (certificate error) durin... | SSL/TLS inspection device replaces certificate for settings-win.data.microsof... | Exclude settings-win.data.microsoft.com from SSL inspection on proxy/firewall... | 9.5 | onenote |
| 4 | Cloud PKI SCEP 证书下发失败，设备无法访问 SCEP URI（*.manage.microsoft.com 被防火墙/代理拦截） | 客户防火墙或代理规则未放行 *.manage.microsoft.com，导致设备无法到达 Cloud PKI SCEP 端点 | 1. 在防火墙/代理中允许 *.manage.microsoft.com；2. 用浏览器测试 SCEP URI：追加 /?operation=GetCAC... | 9.0 | ado-wiki |
| 5 | 创建 Cloud PKI Issuing CA 时无法添加 Root CA 上未定义的 EKU，或选择 Any Purpose EKU 报错 | Root CA 的 EKU 是 Issuing CA 的超集限制，Issuing CA 只能选择 Root CA 已有的 EKU；Any Purpose ... | 1. 创建 Root CA 前规划好所有需要的 EKU（Root CA 创建后无法修改）；2. 不要使用 Any Purpose EKU；3. 如需添加新... | 9.0 | ado-wiki |
| 6 | Cloud PKI CA 创建失败，提示已达 6 个 CA 服务器上限 | 每个 Intune 租户最多 6 个 Cloud PKI CA 服务器（含 Root + Issuing + BYOCA 的任意组合） | 1. 规划 CA 层级在 6 台限制内（如 1 Root + 5 Issuing，或 2 Root + 2 Issuing 各）；2. 自 2407 起可... | 9.0 | ado-wiki |
| 7 | Android Fully Managed/Dedicated 设备 SCEP 部署问题，DeviceManagementProvider 表无数据 | Android Fully Managed/Dedicated 设备不使用 DMP 表记录证书部署状态，需使用 IntuneEvent 表的 Androi... | 使用 IntuneEvent 查询 ApplicationName='AndroidSync' 和 ComponentName in ('Stateles... | 9.0 | ado-wiki |
| 8 | SCEP certificate fails to renew on a subset of Windows devices while others r... | Third-party or middleware software (e.g., security agents) interfering with d... | Use Procmon to diagnose: 1) Filter for Process Name=dmcertinst.exe and Path c... | 9.0 | ado-wiki |
| 9 | Android Enterprise personally-owned work profile 部署 Trusted Certificate profi... | Trusted Certificate profile 中部署了非 Root 或非 Intermediate 证书。Intune 的 Trusted Ce... | 确保 Trusted Certificate profile 仅包含 root 或 intermediate 证书。移除非 root/intermedia... | 9.0 | ado-wiki |
| 10 | Jamf Pro integration with Intune — macOS CA deprecated Sep 2024, migrate to D... | Jamf Pro Conditional Access platform no longer supported since Sep 1 2024. Mu... | Follow Jamf migration guide at Migrating from macOS Conditional Access to mac... | 9.0 | ado-wiki |
| 11 | macOS enrollment fails with HTTP 404 error during management profile installa... | Intune service Node issue (PG confirmed via ICM 388482221/473790930). During ... | 1. PG confirmed Node issue - escalate via ICM. 2. Verify enrollment service w... | 8.5 | onenote |
| 12 | Intune Cloud PKI 在 21V 无法使用 | 无 Intune Suite & Cloud PKI add-on 许可证；DCR 追踪中 | 不支持；改用 SCEP/PKCS（NDES + ADCS）方案部署证书 | 8.0 | 21v-gap |
| 13 | Microsoft 365 apps for macOS close without notification and restart unexpecte... | Multiple deployments of Microsoft 365 apps assigned as Required to the device... | 1) If multiple Required deployments: assign only one deployment. 2) If M365 s... | 8.0 | mslearn |
| 14 | Windows enrollment fails with error 0x8007064c The machine is already enrolle... | Previous enrollment certificate (Sc_Online_Issuing) and registry key HKLM SOF... | Delete the Intune cert issued by Sc_Online_Issuing from Local Computer Person... | 8.0 | mslearn |
| 15 | When attempting to enroll a device in Intune, the device hangs at Checking Co... | This can occur due to various conditions. See the steps below for information... | 1. Have the customer cancel any enrollment in progress, then terminate the Co... | 7.5 | contentidea-kb |
| 16 | Here is a guide on how to install/setup the �Anyconnect� Android application ... |  |  | 7.5 | contentidea-kb |
| 17 | Customer configures a Wi-Fi profile in the Azure Intune portal for Android de... | Wi-Fi profiles using certificates are not coming down to Android devices with... | Issue has been resolved | 7.5 | contentidea-kb |
| 18 | When you try to access secured site (https)&nbsp; in Intune Managed Browser f... | This can be caused by a problem with the web site certificate. &nbsp; &nbsp;&... | The Intune Managed Browser on Android device needs to trust the entire certif... | 7.5 | contentidea-kb |
| 19 | Intune: Devices or service connectors are unable to connect to the Intune ser... |  |  | 7.5 | contentidea-kb |
| 20 | Android Devices get Missing Certificate when they try to enroll | This usually happens when they use ADFS and the intermediate certificate is n... | Follow these steps to have the Certificates install.                         ... | 7.5 | contentidea-kb |
| 21 | Scenario 1 - Base app does not install MacOS line of business (LOB) apps crea... | Scenario 1 - Base app does not installAs per Apple documentation https://deve... | Scenario 1 - Base app does not install First of all, remove any Required depl... | 7.5 | contentidea-kb |
| 22 | WiFi Profile (PSK) is deployed but cannot connect to WiFi on Android device  ... |  |  | 7.5 | contentidea-kb |
| 23 | Errorscannot complete the save due to a file permission error0x8007177c: reco... | Expired default EFS DRA in the organization’s GPO.Understanding the errorThe ... | Save off the old DRA cert and private key before you make any changes. (So, y... | 7.5 | contentidea-kb |
| 24 | Supported Platforms Google Android 5.0 and later Samsung Knox Android 5.0 and... |  |  | 7.5 | contentidea-kb |
| 25 | Scenario 1&nbsp;Cause: An existing Company Portal has an expired Symantec Cer... |  |  | 7.5 | contentidea-kb |
| 26 | Trusted Certificates, SCEP/PKCS and WIFI profiles are applying properly to th... | This occurs because macOS is case-sensitive during TLS negotiation. The RADIU... | From  the Intune portal, edit the WIFI profile and change the FQDN from serve... | 7.5 | contentidea-kb |
| 27 | When troubleshooting registration issues, there may be instances where you ne... |  |  | 7.5 | contentidea-kb |
| 28 | When looking at Android company portal logs you see that the trusted root cer... | This happens on Android if the Trusted root certificate is a 3rd party certif... | Create any profiles that would use the certificate without the root certifica... | 7.5 | contentidea-kb |
| 29 | App configuration policies in Microsoft Intune supply settings to Managed Goo... |  |  | 7.5 | contentidea-kb |
| 30 | Consider the following scenario:You're unable to sign-in to the Intune NDES C... | This can occur if there is a network device that is&nbsp;presenting its own c... | Engage Customer's networking team so they remove &quot;manage.microsoft.com&q... | 7.5 | contentidea-kb |
| 31 | Enrollment failed at the device preparation in autopilot self-deployment scen... | Mismatch between OS and BIOS time. | The time should be matched in Bios and OS as from&nbsp;the Log file Certreq_e... | 7.5 | contentidea-kb |
| 32 | On Android device when you go into the&nbsp; Intune portal application.&nbsp;... | This can be caused by problem that the Android device does not trust the cert... | To determine why the Android device is not trusting the certificate chain you... | 7.5 | contentidea-kb |
| 33 | Push the 'McAfee&nbsp;Mobile Cloud Security' (MMCS) application to the androi... |  |  | 7.5 | contentidea-kb |
| 34 | An Android fully managed device fails to get a certificate authentication WiF... | This can occur if the device already has a Wi-fi profile configured for the s... | To resolve this problem, complete the following:1. Forget the WiFi network th... | 7.5 | contentidea-kb |
| 35 | Scenario: Customer has a working NDES server issuing SCEP certificates to oth... | The cause of the connection failure was due to a failure in the initial TLS/S... | The customer was using a reverse proxy to expose the NDES service on the inte... | 7.5 | contentidea-kb |
| 36 | Android uses a digital certificate (also called a&nbsp;keystore) to cryptogra... |  |  | 7.5 | contentidea-kb |
| 37 | Cheat sheet for setting up Microsoft Tunnel on a CentOS server.Cheat Sheet&nb... |  |  | 7.5 | contentidea-kb |
| 38 | Cheat sheet for setting up Microsoft Tunnel on an Ubuntu server.     &nbsp;  ... |  |  | 7.5 | contentidea-kb |
| 39 | When trying to create the connection between the MTG server and the Intune se... | The MTG server was running CentOS 8. At the time of this article creation (11... | To resolve this issue, build new servers with a supported version of CentOS (... | 7.5 | contentidea-kb |
| 40 | What is business impact and how to identify it  Business Impact describes the... |  |  | 7.5 | contentidea-kb |
| 41 | When attempting to enroll an Android Fully Managed device, the following erro... | This occurs because Android does not support downloading additional certifica... | To resolve this issue, reimport the SSL certificate with ‘extra download’ to ... | 7.5 | contentidea-kb |
| 42 | Intune and 3rd party MDM providers leverage the&nbsp;     EnterpriseDataProte... |  |  | 7.5 | contentidea-kb |
| 43 | WIFI Certificate based authentication (CBA) connection fails on Android Dedic... | This occurs because for userless devices, Android does not send the device id... | To resolve this problem, use the      Identity privacy (outer identity)      ... | 7.5 | contentidea-kb |
| 44 | In this menu, we are going to configure SCEP and PKCS certificate. As a resul... |  |  | 7.5 | contentidea-kb |
| 45 | Windows 10 machines are unable to reach the Autopilot configuration screen wh... | The problem happens when a network device, in the middle of the connection be... | The customer’s networking team removed the following endpoints form their SSL... | 7.5 | contentidea-kb |
| 46 | Android Enterprise BYOD (work profile) devices can no longer connect to netwo... | Starting in Android 12, the IMEI (as well as MEID and serial number) can no l... | Steps and functionality will very based on the customer’s VPN and NAC provide... | 7.5 | contentidea-kb |
| 47 | A Trusted Root certificate profile for Android enterprise personally-owned wi... | This can be caused when the certificate uploaded to MEM console in the Truste... | Make sure the certificate uploaded&nbsp;MEM console in the Trusted root certi... | 7.5 | contentidea-kb |
| 48 | The intention of this article is to highlight a couple of pitfalls that have ... |  |  | 7.5 | contentidea-kb |
| 49 | The setup with Microsoft Tunnel Gateway in RHEL 8.4+ systems are now supporti... | The RHEL OS may be configured or modified to limit the Modules the kernel loa... | Root user can use command &quot;modprobe run&quot; to manually load the tun m... | 7.5 | contentidea-kb |
| 50 | End users are using Jamf managed macOS devices that are integrated with Intun... |  |  | 7.5 | contentidea-kb |
| 51 | The CU is unable to access Intune app on Android Enterprise Fully managed dev... | After long troubleshooting,&nbsp; I have found the problem with the default&n... | Hence, the pushed root Cert somehow forced the DigiCert Root Cert on the devi... | 7.5 | contentidea-kb |
| 52 | Customer had a population of Zebra devices running Android 8. The SCEP profil... | This was occurring because the devices did not have a PIN/Passcode set.This r... | After setting a PIN on the device, the SCEP profile applied successfully. | 7.5 | contentidea-kb |
| 53 | When  looking at SCEP certificate profiles in Assist 365, many values are rep... |  |  | 7.5 | contentidea-kb |
| 54 | Per-app VPN allows applications to use an HTTP or HTTPS connection to access ... |  |  | 7.5 | contentidea-kb |
| 55 | For&nbsp;Samsung      devices with Android OS 11 and below, you notice that t... | This problem can occur if the devices do not have the&nbsp;&quot;Knox Service... | This problem can be resolved by deploying the &quot;Knox Service Plugin&quot;... | 7.5 | contentidea-kb |
| 56 | End users on macOS devices are unable to register their devices with Azure AD... | Below are listed 2 possible issues that can cause this exact error.&nbsp; You... | First Investigation -&nbsp; Please review the following with the customer to ... | 7.5 | contentidea-kb |
| 57 | Clients are unable to establish a connection with MTG server.&nbsp;&nbsp;The ... | The certificate bundle the customer had was invalid. MTG requires that the bu... | The customer obtained a new certificate bundle that was complete/valid.&nbsp;... | 7.5 | contentidea-kb |
| 58 | It's possible to see issues with Android Enterprise (AE) BYOD devices where t... | The problem occurs when CISCO tries to verify the compliance status of the de... | To resolve this problem, there are few actions that are required on CISCO ISE... | 7.5 | contentidea-kb |
| 59 | When running sync under Access Work or School for enrollment record, it repor... | At path &quot;HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Provisioning\OMADM\Accoun... | Identify the enrollment record at registry path “HKEY_LOCAL_MACHINE\SOFTWARE\... | 7.5 | contentidea-kb |
| 60 | Scenario:&nbsp; Android Personally enrolled Work Profile.&nbsp; The Wi-Fi net... | The customer had an incomplete server validation configuration in the Wi-Fi P... | To fix this problem, chose the correct Trusted Certificate profile (the Root ... | 7.5 | contentidea-kb |
| 61 | Preread:&nbsp;Find lost devices with Microsoft Intune / Microsoft Learn Andro... |  |  | 7.5 | contentidea-kb |
| 62 | When trying to re-enrol a previous working device with Autopilot for pre-prov... | Considering that TPM V 2.0 is already present, yet in the: certreq_enrollaik.... | During the Self-Deploying it is mandate to ensure the device is legitimate, a... | 7.5 | contentidea-kb |
| 63 | In this article you will learn how to validate that a SCEP certificate is ins... |  |  | 7.5 | contentidea-kb |
| 64 | We’ve recently received several cases where Android devices fail to connect t... | The problem occurs because Android no longer trusts the root CA “AAA Certific... | Intune admins should deploy the &quot;AAA certificate Services&quot; via a tr... | 7.5 | contentidea-kb |
| 65 | Customer uses OpenSSL as an on‑premises CA and attempts to integrate with Int... | The Azure PKI kernel does not support arbitrary or custom OIDs in Relative Di... | What Works When the intermediate CA is signed using a standard OpenSSL config... | 7.5 | contentidea-kb |
| 66 | iOS devices fail to connect to Intune endpoints or enrollment/check-in fails ... | Intune 21v endpoints (e.g., fef.cnpasu01.manage.microsoftonline.cn, mam.manag... | Ensure client devices support TLS 1.2 or higher with modern cipher suites. Te... | 7.0 | onenote |
| 67 | macOS devices are unexpectedly unenrolled from Microsoft Intune service or en... | MDM agent mishandles failed MDM certificate installations. When the MDM agent... | Re-enroll the affected macOS device. | 7.0 | mslearn |
| 68 | Android device cannot sign in to Company Portal: missing required certificate... | ADFS server does not include intermediate certificates in SSL Server hello re... | Sol 1: User installs missing cert. Sol 2: Import intermediate certs into ADFS... | 6.5 | mslearn |
| 69 | macOS virtual machine enrollment fails with error 'It looks like you're using... | VM not fully configured (missing serial/hardware model), enrollment restricti... | For VMs: fully configure serial number and hardware model; for personal devic... | 5.5 | mslearn |
| 70 | macOS enrollment fails with keychain error -25244 (errSecInvalidOwnerEdit); C... | Stale or corrupted keychain entries related to Intune enrollment (workplace j... | Open Keychain Access as local admin; delete all 'workplace' keys; delete spec... | 5.5 | mslearn |
| 71 | WiFi Profile (PSK) is deployed but cannot connect to WiFi on Android device 1... |  |  | 3.0 | contentidea-kb |
| 72 | Errors cannot complete the save due to a file permission error 0x8007177c: re... | E xpired default EFS DRA in the organization’s GPO. Understanding the error T... | Save off the old DRA cert and private key before you make any changes. (So, y... | 3.0 | contentidea-kb |
