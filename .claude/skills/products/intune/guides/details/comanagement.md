# INTUNE Co-Management / SCCM / ConfigMgr — 已知问题详情

**条目数**: 76 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune Co-management 在 21V 受限，CMG 无法使用
**Solution**: 部分支持：仅限 Hybrid AADJ + co-management 场景，不使用 CMG；确保 CMClient 通过本地 AD 完成认证
`[Source: 21v-gap, Score: 9.5]`

### Step 2: SCCM co-managed devices in 21v cannot receive SCCM policies or check-in with management point when off-premises; Cloud Management Gateway (CMG) dep...
**Solution**: Only Hybrid AAD Join + co-management is supported in 21v. Ensure devices have VPN or direct line-of-sight to on-premises AD/SCCM infrastructure. Configure Always-On VPN for remote workers so SCCM workloads can process. For workloads needing cloud management move them from SCCM to Intune. Collect CCM logs at C:\Windows\CCM\Logs for co-management troubleshooting.
`[Source: onenote, Score: 9.5]`

### Step 3: Windows 10 MDM enrollment fails with error 0x80180023 (via AAD join) or 0x80070002 (via AAD register). Event log: MDM Enroll OMA-DM client configur...
**Solution**: From a working device with same Windows 10 version: (1) Export HKLM\SYSTEM\CurrentControlSet\Services\dmwappushservice registry key; (2) Copy dmwappushsvc.dll from C:\Windows\System32 if missing; (3) Import .reg file to affected device; (4) Reboot - service auto-loads. Do NOT use New-Service alone
`[Source: onenote, Score: 9.5]`

### Step 4: Windows MDM enrollment が失敗し、SessionState が 5 (completed) に設定されるが実際には SyncML が実行されない。エラーコード 0x80041313 (SCHED_E_UNKNOWN_OBJECT_VERSION)
**Solution**: 破損した Task Scheduler タスクのトリガーデータを修正または削除する。問題のタスク例: HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Schedule\TaskCache\Tree\Microsoft\Windows\Media Center\RecordingRestart。ProcMon で OMADM セッションレジストリの SessionState と SessionHRESULT を確認して特定する
`[Source: onenote, Score: 9.5]`

### Step 5: Co-management enrollment issue on Windows device; default ConfigMgr client logs lack sufficient detail to diagnose enrollment or workload switching...
**Solution**: Enable verbose CCM logging: 1) HKLM\Software\Microsoft\CCM\Logging\@GLOBAL\LogLevel = 0. 2) LogMaxSize = 1000000 (decimal). 3) Create key DebugLogging with REG_SZ Enabled=True. 4) Restart SMS Agent Host service. 5) Wait 15 min, collect C:\Windows\CCM\Logs. Enable Event Viewer debug logs. Flow: co-management setting arrives > enrollment timer queued > enrollment begins > 3 retries at 15-min intervals if failed > re-queues next cycle.
`[Source: onenote, Score: 9.5]`

### Step 6: Intune auto-enrollment via GPO fails: scheduled task not created, dmenrollengine.dll reads EnrollmentState=2 from registry and does not trigger enr...
**Solution**: 1) Remove the registry key under HKLM\SOFTWARE\Microsoft\Enrollments where EnrollmentState=2 (PowerShell or batch script); 2) For batch cleanup across multiple machines, deploy script via GPO Startup Scripts (place .bat in DC sysvol share); 3) Optionally run Wipe-ConfigMgrAgent.ps1 to fully clean SCCM artifacts; 4) After cleanup, gpupdate /force triggers enrollment task creation.
`[Source: onenote, Score: 9.0]`

### Step 7: APv1 times out with entire DeviceSetup category failure; UDiag shows ServerHasNotFinished and CoManagement enrollment policy applied during provisi...
**Solution**: Un-assign/remove Co-Management policy during Autopilot. Verify with Kusto: (1) DeviceLifecycle EventId 46801/46804 for parsed policies, (2) IntuneEvent EnrollmentConfigurationApplied to confirm CoMgmt. After confirming, involve Co-Management SMEs to review CMG settings.
`[Source: ado-wiki, Score: 9.0]`

### Step 8: Windows devices unexpectedly join or auto-enroll to wrong Intune tenant (Global vs 21v) in dual-federation environment with SCCM co-existence; VDI ...
**Solution**: (1) Check SCP registry keys on affected device to verify they point to correct tenant; (2) For VDI, ensure master image SCP registry is cleared or set correctly before snapshot; (3) Verify SCCM collection membership and exclusion rules (e.g., device name = CN excluded from global auto-enrollment); (4) Use customer's PowerBI dashboard to audit device-to-collection mapping; (5) For dual-fed tenants, confirm which domains are whitelisted to route to 21v vs Global.
`[Source: onenote, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune Co-management 在 21V 受限，CMG 无法使用 | 由于 SCCM CMG + Azure Service 在 21V 不可用，仅支持 Hybrid AADJ + co-management；CMClien... | 部分支持：仅限 Hybrid AADJ + co-management 场景，不使用 CMG；确保 CMClient 通过本地 AD 完成认证 | 9.5 | 21v-gap |
| 2 | SCCM co-managed devices in 21v cannot receive SCCM policies or check-in with ... | Azure Cloud Management Gateway (CMG) service is not available in 21v Azure en... | Only Hybrid AAD Join + co-management is supported in 21v. Ensure devices have... | 9.5 | onenote |
| 3 | Windows 10 MDM enrollment fails with error 0x80180023 (via AAD join) or 0x800... | dmwappushservice (Device Management WAP Push message Routing Service) is miss... | From a working device with same Windows 10 version: (1) Export HKLM\SYSTEM\Cu... | 9.5 | onenote |
| 4 | Windows MDM enrollment が失敗し、SessionState が 5 (completed) に設定されるが実際には SyncML が... | Task Scheduler の Trigger レジストリデータが破損（先頭バイトが 0xFF、正常は 0x17/0x16/0x15）。omadmprc... | 破損した Task Scheduler タスクのトリガーデータを修正または削除する。問題のタスク例: HKLM\SOFTWARE\Microsoft\Wi... | 9.5 | onenote |
| 5 | Co-management enrollment issue on Windows device; default ConfigMgr client lo... | Default CCM client logging level (LogLevel=1) does not capture verbose enroll... | Enable verbose CCM logging: 1) HKLM\Software\Microsoft\CCM\Logging\@GLOBAL\Lo... | 9.5 | onenote |
| 6 | Intune auto-enrollment via GPO fails: scheduled task not created, dmenrolleng... | SCCM (co-management) legacy enrollment info remains in registry at HKLM\SOFTW... | 1) Remove the registry key under HKLM\SOFTWARE\Microsoft\Enrollments where En... | 9.0 | onenote |
| 7 | APv1 times out with entire DeviceSetup category failure; UDiag shows ServerHa... | Co-Management policy assigned during Autopilot provisioning conflicts with en... | Un-assign/remove Co-Management policy during Autopilot. Verify with Kusto: (1... | 9.0 | ado-wiki |
| 8 | Windows devices unexpectedly join or auto-enroll to wrong Intune tenant (Glob... | Service Connection Point (SCP) registry keys cloned from master/snapshot VDI ... | (1) Check SCP registry keys on affected device to verify they point to correc... | 8.5 | onenote |
| 9 | Co-managed devices show duplicate entries in Intune portal -- one as normal I... | Devices are enrolled to Intune via co-management AND uploaded by tenant attac... | On affected device: HKLM\SOFTWARE\MICROSOFT\CCM create REG_DWORD CoMgmtReport... | 8.5 | onenote |
| 10 | MDM enrollment error 0xcaa9001f for co-managed Hybrid Entra joined devices vi... | IWA attempted against non-federated Entra domain. Cloud Management Azure serv... | Configure Azure Services for Cloud Management in ConfigMgr. Enable both AD Us... | 8.0 | mslearn |
| 11 | Edge Enterprise Mode deployed via Intune not working as expected on co-manage... | SCCM CCM client creates Edge Enterprise Mode SiteList registry key to ensure ... | 1) Create registry HKLM\SOFTWARE\Policies\Microsoft\CCM with DWORD AllowConfi... | 7.5 | onenote |
| 12 | Windows device fails to enroll in Intune as co-management device. Error 0x801... | Registry key HKLM\SOFTWARE\Microsoft\Enrollments has SetManagedExternally set... | Navigate to HKLM\SOFTWARE\Microsoft\Enrollments, change SetManagedExternally ... | 7.5 | onenote |
| 13 | After updating the DEP Token, Intune Hybrid with SCCM is showing that the Las... | DEP Token was not synced to Intune Side after renewal from Apple site. | Force a FULL sync from the ConfigMgr side by running SQL query on Primary/CAS... | 7.5 | contentidea-kb |
| 14 | Advisory walkthrough for configuring Windows Store for Business with SCCM and... |  |  | 7.5 | contentidea-kb |
| 15 | Customer states they are attempting to configure their Store for Education pe... | The Microsoft article &quot;https://docs.microsoft.com/en-us/sccm/apps/deploy... | Under section &quot;In Azure Active Directory, register Configuration Manager... | 7.5 | contentidea-kb |
| 16 | When you switch your MDM authority from Intune to SCCM, device categories tha... | This is by design. When you change your MDM authority from Intune to SCCM, th... | Below is a workaround that can be used to recreate device group mapping categ... | 7.5 | contentidea-kb |
| 17 | A PC or Windows tablet cannot be MDM joined. Error during MDM enroll: Your de... | The machine cannot be MDM joined (prior to 1709), or the Intune PC agent soft... | Remove the Configuration Manager client: run CCMSETUP.exe /Uninstall from ele... | 7.5 | contentidea-kb |
| 18 | When attempting to enroll a Windows 10 device into hybrid mobile device manag... | This error will occur if Windows enrollment has been disabled for the organiz... | To resolve this problem, enable Windows enrollment as detailed below:    In y... | 7.5 | contentidea-kb |
| 19 | When switching MDM authority in Hybrid to Intune, if an admin excludes more t... | Product issue which will be fixed in a future release | Version 8239 � SCCM 2012 SP2/R2 Sp1 onwards following registry key cold be cr... | 7.5 | contentidea-kb |
| 20 | After removing SCCM agent and enrolling into Intune, managed by is still show... |  |  | 7.5 | contentidea-kb |
| 21 | After removing the Configuration Manager (SCCM) client agent and enrolling a ... | This is caused by a bug in the Configuration Manager 1710 RollUp 2 client. Th... | As a workaround, complete the following:1. Un-enroll the device from Intune.2... | 7.5 | contentidea-kb |
| 22 | Automatic Enrollment fails - Info button does not show up for the work/school... | ExternallyManaged registry key is set to 1 | Set ExternallyManaged to 0. On 1709+: HKLMSOFTWAREMicrosoftWindowsEnrollments... | 7.5 | contentidea-kb |
| 23 | DEP devices no longer tagged as Supervised after doing a wipe and re-enrollin... | This is a known issue that is under long term development for solution, the i... | Use one of the two work arounds based on break scenario.  NOTE:  Assure to re... | 7.5 | contentidea-kb |
| 24 | Hybrid AADJ Windows 10 device will not auto-enroll with the Intune service.Th... | In this specific case, the computer in question had the ConfigMgrEnrollment r... | Backed up the registry and deleted the enrollment key (under "\HKEY_LOCAL_MAC... | 7.5 | contentidea-kb |
| 25 | In hybrid environments, Intune users may lose their device mappings in the Sy... | There are numerous causes of clients losing device mappings. The most common ... | If only a limited number of devices are affected, manually remove Intune mana... | 7.5 | contentidea-kb |
| 26 | When trying to change the Device Enrollment Limit in the Azure portal for a C... | Tenant authority is set to SCCM. CM Hybrid customers are expected to change d... | Navigate to Administration > Cloud Services > Microsoft Intune Subscription i... | 7.5 | contentidea-kb |
| 27 | This article documents the current subject matter experts (SMEs) for the Intu... |  |  | 7.5 | contentidea-kb |
| 28 | When the SCEP profile is applied to a Windows 10 computer it can be seen at t... |  |  | 7.5 | contentidea-kb |
| 29 | In an Intune/Configuration Manager hybrid environment, you may notice the fol... | There is a known issue that can occur if the customer has certain versions of... | There are two resolutions depending on whether the certificate has already ex... | 7.5 | contentidea-kb |
| 30 | The issue occurs in the following scenario:Windows devices were previously du... | The MMPC team confirmed that this is a bug. The residual flag (with a value o... | Clearing or deleting the MmpcEnrollmentFlag (setting its value to 0) resolves... | 7.5 | contentidea-kb |
| 31 | After you enabled Co-Management between Intune and Configuration Manager, you... |  |  | 7.5 | contentidea-kb |
| 32 | After removing the Configuration Manager (SCCM) client agent and enrolling a ... | Deleting the SSCM client doesn't always cleans up some registries that are ev... | If the devices at some point had Config Mgr/ccmsetup.exe there are some regis... | 7.5 | contentidea-kb |
| 33 | Hybrid AAD Joined device fails to enroll into Intune.&nbsp;When investigating... | Follow the blog to export GP service client log(GPSVC.log)https://blogs.techn... | Solution 1:Rename or delete the registry.pol file from C:\Windows\System32\Gr... | 7.5 | contentidea-kb |
| 34 | Devices fail to enroll into Intune in a co-management environment&nbsp;and th... | Enabled the CCM verbose logging and in the comanagementhandler.log, there are... | We manually delete the registry key (begins with E3CBE5E1)with similar values... | 7.5 | contentidea-kb |
| 35 | SCCM Client Installation failing over a Workgroup Internet Machine while Depl... | We checked and found this error is related to Root CA Cert as specified in Lo... | We need to import the same Root CA / Intermediate CA Cert (the Certs that we ... | 7.5 | contentidea-kb |
| 36 | Co-managed devices are not applying the deployed policies from Intune and ret... | After&nbsp;the SCCM Agent got installed, it was not able to communicate with ... | The first step to address the communication issues between the Client and the... | 7.5 | contentidea-kb |
| 37 | A couple of Microsoft Teams Room device cases have come up recently. These ar... | As of this writing, Windows 10 IOT (OEM Microsoft Teams Room devices) will no... | If you are able to convert the device to Windows 10 Enterprise or Pro (eg. no... | 7.5 | contentidea-kb |
| 38 | As described in this official article Client health with co-management, for c... |  |  | 7.5 | contentidea-kb |
| 39 | Hybrid Azure AD Joined (co-management - Path1) devices are failing to enroll ... | This issue occurs if the&nbsp;Device Management Wireless Application Protocol... | If is disabled, change this to Manual start and trigger the enrollment again.... | 7.5 | contentidea-kb |
| 40 | Support Guidance from&nbsp;Incident 212801771&nbsp;: Co-management device tok... | This issue is caused by a bug in ConfigMgr KB4578605 for Configuration Manage... | If you are a front line support engineer / ambassador, engage your escalation... | 7.5 | contentidea-kb |
| 41 | You receive the following error when trying to view most of the Tenant Attach... |  |  | 7.5 | contentidea-kb |
| 42 | Autopilot enrollment fails during ESP in Device preparation:&nbsp;Preparing y... | There are multiple reasons that can cause the time out: This occurs at the de... | To resolve this problem:  wrap CM client (MSI) with Intunewin and deploy as a... | 7.5 | contentidea-kb |
| 43 | When the ConfigMgr slider is not set to Intune/Pilot Intune for Device Config... | When the ConfigMgr slider is&nbsp;not&nbsp;set to Intune/Pilot Intune for Dev... | To resolve this issue, use the following steps:Make a backup of the HKEY_LOCA... | 7.5 | contentidea-kb |
| 44 | High-level stepsBuilding the Configuration Manager (aka SCCM or MEMCM) enviro... |  |  | 7.5 | contentidea-kb |
| 45 | This document will tell you the steps which you need to perform for making a ... |  |  | 7.5 | contentidea-kb |
| 46 | Devices that recently enrolled are showing an unexpected long name (Azure-dev... | Multiple factors can trigger this behavior, overall, the device is unable to ... | 1) OS-related issues:&nbsp; Check the status of the&nbsp;Device Management Wi... | 7.5 | contentidea-kb |
| 47 | In VMAS http://aka.ms/vmas&nbsp; click on Workspaces -&gt; New Workspace from... |  |  | 7.5 | contentidea-kb |
| 48 | Customer used MECM Task Sequence to image devices and run Autopilot provision... | From the Autopilot logs, the failure was caused by Autopilot waiting for Conf... | You need to modify the TS to delete the reg key below to allow ESP to proceed... | 7.5 | contentidea-kb |
| 49 | Customer wants to Deploy MDE policies from&nbsp;Microsoft Endpoint Manager Ad... |  |  | 7.5 | contentidea-kb |
| 50 | MS Documentation&nbsp;  How to enroll with Autopilot: https://docs.microsoft.... | First please make sure that device meets the proper requirements for this fea... | AutoPilot CAB File is required to Troubleshoot this scenario. Press Shift + F... | 7.5 | contentidea-kb |
| 51 | This article describes how to troubleshoot Windows update issues in scenarios... | Help article for troubleshooting co-management related windows update issues. | This article describes how to troubleshoot Windows update issues in scenarios... | 7.5 | contentidea-kb |
| 52 | Intune administrators are unable to assign a&nbsp;Co-management authority&nbs... | This is a known issue that is currently being investigated by the Product tea... | To unblock the customer use one of these workarounds: Workaround 1: Use a nes... | 7.5 | contentidea-kb |
| 53 | Abstract This technical article addresses an issue with automatic Mobile Devi... | At this moment we have understood the&nbsp;root cause of the issue: The GPO “... | As WiFi is only connected after the user logon, it would be required to perfo... | 7.5 | contentidea-kb |
| 54 | Feature updates are major releases of Windows 10/11 that introduce new capabi... |  |  | 7.5 | contentidea-kb |
| 55 | When Configuring Mobile Threat Defense (MTD) connector for Windows Security C... | I have identified two possible reasons for &quot;Not Set Up&quot; Status.  1.... | Collaborating with the Security team or Windows DND would be beneficial in re... | 7.5 | contentidea-kb |
| 56 | Comanaged devices have duplicate entries in Intune, one entry shows as Normal... | This happen when the devices are getting into MEM once from enrolling via co-... | 1.On the affected device we go to regedit &gt;&gt; go to the location HKLM\SO... | 7.5 | contentidea-kb |
| 57 | A Windows 11 device is failing to enroll in Intune using co-management. The s... | A registry key in the Enrollments and Accounts hive caused the MDM client to ... | We backed up and cleaned up the above registry keys and trigger co-management... | 7.5 | contentidea-kb |
| 58 | MDMWinsOverGP CSP setting is being enforced on existing and newly enrolled Wi... |  |  | 7.5 | contentidea-kb |
| 59 | This article will help you identify one of the common issues on co-managed de... |  | Request the client to create and deploy a Custom Client Setting that disables... | 7.5 | contentidea-kb |
| 60 | User Driven Entra join Autopilot fails during device preparation phase with e... | Such issues may arise due to client authentication set at MECM site, whether ... | Raise Collab with MECM for client installation issue over internet and adjust... | 7.5 | contentidea-kb |
| 61 | Windows devices fail to enroll in Intune with the following error. Error Mess... | The registry value at HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Enrollments\Valid... | Correct the registry using one of the following methods, then retry enrollmen... | 7.5 | contentidea-kb |
| 62 | Windows devices fail to enroll in Intune with the following error. Error Mess... | The registry value at&nbsp;HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Enrollments\... | Correct the registry using one of the following methods, then retry enrollmen... | 7.5 | contentidea-kb |
| 63 | Support Tip: Calculation of the Capabilities for Workloads in Co-management |  | please refer to the doc below- https://docs.microsoft.com/en-us/sccm/comanage... | 7.5 | contentidea-kb |
| 64 | Endpoint Protection tattooed settings (ExcludedExtensions, ExcludedPaths, Exc... | Known issue with co-management EP tattoo behavior -- when Device Configuratio... | Run cleanup script to delete tattooed registry keys: delete ExcludedExtension... | 7.0 | onenote |
| 65 | Co-management status cannot be enabled on SCCM + Intune enrolled device. CoMa... | Essential WMI class MDM_ConfigSetting under root\cimv2\MDM namespace is missi... | 1) Manually add MDM_ConfigSetting WMI class back to root\cimv2\MDM namespace.... | 6.5 | onenote |
| 66 | Co-management device deployed via Intune shows question mark in SCCM console ... | Multiple CMG config issues: 1) Boundary configured with AD site instead of IP... | 1) Configure boundary with IP ranges instead of AD site for internet-based cl... | 6.5 | onenote |
| 67 | Configuration Manager agent state shows unhealthy/unknown/installed-but-not-a... | Intune evaluates ConfigMgr agent state via ClientHealthStatus and ClientHealt... | Check CcmNotificationAgent.log for BGB sync issues. If ClientHealthLastSyncTi... | 6.5 | onenote |
| 68 | Enterprise Mode site list not deployed to co-managed Win10 devices via Intune... | ConfigMgr creates MicrosoftEdge EnterpriseMode SiteList registry that takes p... | Set AllowConfigureMicrosoftEdge=0 under HKLM Policies Microsoft CCM; delete c... | 6.5 | mslearn |
| 69 | Co-management bootstrap: Azure AD users not in ConfigMgr DB. Error 0x87d00231. | API permissions or Azure AD user Discovery not configured. | Configure API permissions and Azure AD user Discovery in ConfigMgr. | 5.5 | mslearn |
| 70 | CMG connection point shows disconnected. | Permissions issue: remote site system cannot access primary site inboxes. | Add remote site system machine account to Local Admins on primary site. | 5.5 | mslearn |
| 71 | Clients cannot locate MP via CMG, error 403 CMGConnector_Clientcertificatereq... | CRL validation failure for client certificate. Revocation server offline. | Ensure CRL distribution points accessible or temporarily disable CRL checking... | 5.5 | mslearn |
| 72 | ConfigMgr agent unhealthy in Intune, last check-in 2/1/1900. | Compliance policies workload managed by ConfigMgr not Intune. | Switch compliance workload to Intune or Pilot Intune. | 5.5 | mslearn |
| 73 | Client apps workload not visible in co-management Properties. | Pre-release feature not enabled. | Enable pre-release feature in ConfigMgr: Administration > Updates and Servici... | 5.5 | mslearn |
| 74 | Settings not reverted after unassigning Intune policies (no tattoo removal). | Tattoo removal not supported when Device Configuration workload is ConfigMgr. | Set Device Configuration workload to Intune, refresh policy on device. | 5.5 | mslearn |
| 75 | After removing the Configuration Manager (SCCM) client agent and enrolling a ... | Deleting the SSCM client doesn't always cleans up some registries that are ev... | If the devices at some point had Config Mgr/ccmsetup.exe there are some regis... | 4.5 | contentidea-kb |
| 76 | After you enabled Co-Management between Intune and Configuration Manager, you... |  |  | 3.0 | contentidea-kb |
