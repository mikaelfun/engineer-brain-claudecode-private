# INTUNE Defender for Endpoint 集成 — 已知问题详情

**条目数**: 29 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: 21v (Mooncake) 環境で Intune Endpoint Security > Antivirus > Windows Security Experience から Tamper Protection をオン/オフしようとすると、ポータルで 'pending update' と表示...
**Solution**: 1) MDE onboard で Tamper Protection を制御する 2) UI で手動管理する場合は ManagedDefenderProductType=0, SenseEnabled=0, ProductType=0 にレジストリを変更 3) 一時的に無効化するには Defender troubleshooting mode を使用 (4時間限定) 4) Defender ログ収集: MpCmdRun.exe -getfiles
`[Source: onenote, Score: 9.5]`

### Step 2: Enterprise App Management (EAM) 许可证过期后，Intune Admin Center 中 Enterprise App Catalog 选项消失，管理员无法从目录部署新应用
**Solution**: 1. 确认客户是否有有效的 EAM 或 Intune Suite 许可证；2. 检查许可证是否已正确分配给用户；3. 已部署的应用不会被删除，但 EAM 目录和未来体验将不可用直到重新获取许可证
`[Source: ado-wiki, Score: 9.0]`

### Step 3: MDE Attach device does not show up in Intune UX All Devices list view; Rave shows Last Contact Time before July 15 2022 and IsDeleted=true
**Solution**: Verify via Rave: Last Contact Time < July 15 2022 AND IsDeleted=true. If confirmed, transfer ticket to OCE team (Hani Chabban) to fix backend data. For OCE: check StatelessDeviceService via GenevaAction (Search Entity, query Devices?$filter=ReferenceId eq guid'<AADDeviceId>'), then SQLAgg, then MMPC CosmosDB.
`[Source: ado-wiki, Score: 9.0]`

### Step 4: MDE Attach policy deployment fails with error 2146233088 'Invalid flags specified' in Sense Event Viewer (SenseCM records)
**Solution**: Check Sense Event Viewer (Application and Services logs → Microsoft → Windows → Sense) for error details. Review the Firewall rule configuration in Intune/Defender portal and correct the invalid value. Verify supported profiles for MDE Attach at https://learn.microsoft.com/en-us/mem/intune/protect/mde-security-integration
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Customer has Defender licensing but MEM (Microsoft Endpoint Manager) portal is inaccessible; no Intune license
**Solution**: Check if Intune_Defender service plan is provisioned on the tenant. All accounts with Defender Products should have this included entitlement. If missing, investigate the products and entitlements. Once Intune_Defender is provisioned: 1) Intune polls tenant, 2) queues tenant provisioning workflow, 3) returns success. Customer can then use MDE Attach, access Endpoint Security blade, but cannot enroll non-MDE Attach devices without licensed users.
`[Source: ado-wiki, Score: 9.0]`

### Step 6: MDE Attach tenant not found error; device enrollment fails because tenant onboarding to MMPC did not complete
**Solution**: 1) Query PartnerTenantService logs in Intune Kusto for onboarding events. 2) Get GenevaAction JIT access and check onboarding state: if MDEAttachEnabled=false → no action (admin didn't flip toggle). If MDEAttachEnabled=true and MDEAttachOnboardingState not 0 or 1 → patch MDEAttachEnabled=true via GenevaAction to re-trigger onboarding. Verify MDEAttachOnboardingState becomes 1.
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Unhealthy Endpoint Report shows incorrect device status in MEM Admin Center; mismatch between portal data and actual device state
**Solution**: 1) Run Get-MpComputerStatus on device to get actual ComputerState/AMRunningMode/DefenderSignaturesOutOfDate. 2) Query Intune Kusto (IntuneDefenderServices/DefenderBTService/ProcessDefenderReportBTProvider) for collected data. 3) Compare: if PowerShell != actual state → engage MDE; if Kusto != UI → escalate to Intune PG; if all match → no issue.
`[Source: ado-wiki, Score: 9.0]`

### Step 8: Endpoint security feature (Application Guard, Firewall, SmartScreen, Encryption, Exploit Guard, Application Control, Credential Guard, Security Cen...
**Solution**: Verify Intune policy applied correctly via registry. If settings are correct but feature not working, transfer case to: Application Guard→Windows UEX, Firewall→Windows networking, SmartScreen→Azure Security, Encryption→MSaaS Windows Devices, Exploit Guard→Azure Security, Application Control→MSaaS Windows Devices, Credential Guard→MSaaS Windows Devices, Security Center→Azure Security, Local device security options→Intune, User Rights→MSaaS Windows Devices.
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 21v (Mooncake) 環境で Intune Endpoint Security > Antivirus > Windows Security Ex... | 21v では Tamper Protection が PG によりデプロイされていない。デバイスが Intune に登録されると ManagedDefen... | 1) MDE onboard で Tamper Protection を制御する 2) UI で手動管理する場合は ManagedDefenderProd... | 9.5 | onenote |
| 2 | Enterprise App Management (EAM) 许可证过期后，Intune Admin Center 中 Enterprise App C... | 客户的 Intune Suite 或 Enterprise App Management 试用/正式许可证已过期 | 1. 确认客户是否有有效的 EAM 或 Intune Suite 许可证；2. 检查许可证是否已正确分配给用户；3. 已部署的应用不会被删除，但 EAM ... | 9.0 | ado-wiki |
| 3 | MDE Attach device does not show up in Intune UX All Devices list view; Rave s... | Bug in MDE enrollment flow caused device records to be soft-deleted in Statel... | Verify via Rave: Last Contact Time < July 15 2022 AND IsDeleted=true. If conf... | 9.0 | ado-wiki |
| 4 | MDE Attach policy deployment fails with error 2146233088 'Invalid flags speci... | Firewall rule contains an incorrect/invalid value that cannot be applied by t... | Check Sense Event Viewer (Application and Services logs → Microsoft → Windows... | 9.0 | ado-wiki |
| 5 | Customer has Defender licensing but MEM (Microsoft Endpoint Manager) portal i... | Missing Intune_Defender service plan. This service plan is embedded with all ... | Check if Intune_Defender service plan is provisioned on the tenant. All accou... | 9.0 | ado-wiki |
| 6 | MDE Attach tenant not found error; device enrollment fails because tenant onb... | MDEAttachOnboardingState is neither 0 (default) nor 1 (succeeded), indicating... | 1) Query PartnerTenantService logs in Intune Kusto for onboarding events. 2) ... | 9.0 | ado-wiki |
| 7 | Unhealthy Endpoint Report shows incorrect device status in MEM Admin Center; ... | Multiple possible causes: 1) Defender AV agent reporting incorrect status (MD... | 1) Run Get-MpComputerStatus on device to get actual ComputerState/AMRunningMo... | 9.0 | ado-wiki |
| 8 | Endpoint security feature (Application Guard, Firewall, SmartScreen, Encrypti... | The security feature functionality is outside Intune scope. Intune only handl... | Verify Intune policy applied correctly via registry. If settings are correct ... | 9.0 | ado-wiki |
| 9 | Intune 中 Microsoft Defender for Endpoint（含 Tamper Protection）在 21V 无法集成 | 依赖 Microsoft Defender for Endpoint（MDE），MDE 不支持 21V | 不支持；不要在 21V 配置 MDE Connector；Tamper Protection 策略在 21V 无效 | 8.0 | 21v-gap |
| 10 | MDE Attached device enrolled before July 15th 2022 doesn't show up in Intune ... | Bug in MDE enrollment flow caused devices enrolled before July 15th 2022 to b... | Verify symptoms: 1) Last Contact Time before July 15th 2022 in Rave 2) IsDele... | 7.5 | ado-wiki |
| 11 | Customer has Defender licensing but MEM Portal / Endpoint Security blade is i... | Tenant is missing the Intune_Defender service plan which is required for Defe... | Investigate the tenant's products and entitlements — verify Intune_Defender s... | 7.5 | ado-wiki |
| 12 | MDE Attach tenant onboarding fails — tenant not found in MMPC, MDEAttachOnboa... | Failure in the onboarding flow from PartnerTenantService → MMPCSync → MMPC wh... | 1) Check MDEAttachEnabled and MDEAttachOnboardingState via GenevaAction JIT a... | 7.5 | ado-wiki |
| 13 | Windows 10 devices are not reporting&nbsp; status for Antivirus client to Int... | When upgrading from Windows 8 to Windows 10 the Intune Endpoint Protection Cl... | To remove the Intune Endpoint Protection Client:1. Create a .cmd file on a ma... | 7.5 | contentidea-kb |
| 14 | Realtime Protection is disabled (set to Off and grayed out)Error: Windows cou... | Defender not re-enabled properly | Run Regedit.exe and navigate to HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows... | 7.5 | contentidea-kb |
| 15 | Configuration item for &quot;DefenderScheduleScanDay&quot; is showing as fail... | Code issue with Intune Infrastructure | This is a known issue that was investigated by Intune Product Group. The sett... | 7.5 | contentidea-kb |
| 16 | Another possible message is &quot;This setting is managed by your administrat... | There are several possible causes for this issue. This restriction can be app... | To determine if this policy is being pushed by MDM, navigate to Settings / Ac... | 7.5 | contentidea-kb |
| 17 | Application Guard for Windows 10 and Microsoft Edge, uses a hardware isolatio... |  | Below contains all the needed info and steps need to be followed for Applicat... | 7.5 | contentidea-kb |
| 18 | Defender-specific functionality, including web protection, gets enabled for t... | This occurs because of an issue in license checking in the MDE app which equa... | If using the MDE app to connect to Microsoft Tunnel Gateway, use custom setti... | 7.5 | contentidea-kb |
| 19 | Application Guard for Windows 10 and Microsoft Edge, uses a hardware isolatio... |  | Below contains all the needed info and steps need to be followed for Applicat... | 7.5 | contentidea-kb |
| 20 | We would like to configure setting “Block downloads” under location Windows S... |  | To configure “Block Downloads” settings from Intune there are two approaches:... | 7.5 | contentidea-kb |
| 21 | Please be aware that customers using MDE attach do not need to have a separat... |  |  | 7.5 | contentidea-kb |
| 22 | Windows devices and Windows&nbsp;Servers managed&nbsp;by MDE and targeted&nbs... |  |  | 7.5 | contentidea-kb |
| 23 | This article is intended to provide guidance on onboarding a non-Intune enrol... |  |  | 7.5 | contentidea-kb |
| 24 | With Reporting v2, the following two&nbsp;API’s are being deprecated: #1 Devi... |  |  | 7.5 | contentidea-kb |
| 25 | ASR policy deployed from Intune is not taking effect on the MDE Attach device... | When checked on both Intune and Defender Portal, the ASR policy is showing as... | Made a change in the policy by making the ASR Rule &quot;Block Webshell creat... | 7.5 | contentidea-kb |
| 26 | For Windows devices onboarded to MDE and then displayed in Intune there is a ... | Intune has a limit of 15 characters for Windows devices. That said, if the na... | For devices that are already onboarded to MDE with a 15+ character name, they... | 7.5 | contentidea-kb |
| 27 | This article explains a scenario where an MDE onboarded devices fail to proce... | There is something wrong and it is clear that the enrollment failed because i... | We identify the SenseCM service wasn't able to read the Leviathan token from ... | 7.5 | contentidea-kb |
| 28 | Intune Endpoint Protection engine unavailable, features disabled (real-time p... | Endpoint protection engine corrupted/deleted, features disabled by admin via ... | Engine unavailable: force update or uninstall/reinstall Endpoint Protection A... | 5.5 | mslearn |
| 29 | Configuration item for " DefenderScheduleScanDay " is showing as failed Custo... | Code issue with Intune Infrastructure | This is a known issue that was investigated by Intune Product Group. The sett... | 3.0 | contentidea-kb |
