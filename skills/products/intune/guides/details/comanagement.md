# Intune Co-Management / SCCM / ConfigMgr — 综合排查指南

**条目数**: 37 | **草稿融合数**: 5 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-Tenant-Attach.md, onenote-comanagement-admin-guide.md, onenote-comanagement-workload-flags.md, onenote-deploy-sccm-via-intune-cmg.md, onenote-sccm-verbose-log-collection.md
**Kusto 引用**: comanagement.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (2 条)

- **solution_conflict** (high): intune-contentidea-kb-037 vs intune-mslearn-076 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-572 vs intune-mslearn-093 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: Tenant Attach
> 来源: ADO Wiki — [ado-wiki-Tenant-Attach.md](../drafts/ado-wiki-Tenant-Attach.md)

**About Tenant Attach**
**How Tenant Attach works**
**How to configure Tenant Attach**
- **Configure tenant attach** - synchronize devices from Configuration Manager to the Microsoft Endpoint Manager admin center
- **Synchronize Configuration Manager devices and collections** - select devices to sync, enable collections for endpoint security policies
- **Permissions to Azure AD** - Global Administrator permissions required
- **Tenant for Microsoft Defender for Endpoint** - must be integrated with Intune subscription

**Configuration Tasks**
1. **Confirm your Configuration Manager environment** - verify minimum version requirements
2. **Configure tenant attach and synchronize devices** - specify collections to sync
3. **Select devices to synchronize** - edit co-management properties to select devices
4. **Enable collections for endpoint security policies** - enable collections to work with endpoint security policies

**Scoping Questions for Tenant Attach**
1. Please provide the full error description.
2. Please provide the steps taken to observe the behavior.
3. Please provide the policyID, example userID and deviceID for the investigation.
4. Please provide if the deviceID is Intune enrolled, co-managed, tenant attached or MDE attached.
5. Please provide if this ever worked and what was the last change if any before the issue occurred.

**Support Boundaries for Tenant Attach**

**Endpoint Security Policy Routing**

**Endpoint Security Routing**

**Additional Notes**
- **MDE Onboarding**: Intune supports deployment and connector enablement. If issue is with onboarding itself → Azure Security team
- **Security Endpoint Reports**: Reports on endpoint.microsoft.com supported by Intune; security-related issues → Azure Security
- **Endpoint Analytics**: Deployment through Intune supported; workspace/agent/connector issues → Azure Monitor team
- **Windows AR Requirement**: All Assistance Requests going to ANY Windows support team must first be posted in an SME channel tagged with WindowsAR for review

**Training and Videos**
- [Tenant Attach Wiki Page from SCCM Team](https://supportability.visualstudio.com/ConfigurationManager/_wiki/wikis/ConfigurationManager/305059/Tenant-Attach)
- Intune Role-based access for tenant attached devices: [Wiki Link](https://supportability.visualstudio.com/ConfigurationManager/_wiki/wikis/ConfigurationManager/697594/Role-Based-Access)

### Phase 2: Comanagement Admin Guide
> 来源: OneNote — [onenote-comanagement-admin-guide.md](../drafts/onenote-comanagement-admin-guide.md)

**Co-management Admin Experience Guide**
**Prerequisites**
- Azure AD Premium
- EMS or Intune license for all users
- Configuration Manager version 1710 or later
- Hybrid AAD joined or AAD joined devices
- MDM authority must be Intune
- Windows 10 1709+

**Two Paths to Co-management**
1. **Existing ConfigMgr clients**: Windows 10 devices already managed by ConfigMgr → set up hybrid AAD → enroll into Intune
2. **New internet-based devices**: Join Azure AD → auto-enroll to Intune → install ConfigMgr client

**Enable Co-management in SCCM**
1. Administration workspace → Cloud Services → Co-management node → Configure co-management
2. Sign in with Intune-licensed account
3. Automatic enrollment options:
   - **All**: All ConfigMgr clients auto-enrolled to Intune
   - **Pilot**: Only pilot collection members auto-enrolled

**Switch Workloads**
- **Configuration Manager**: CM continues to manage
- **Pilot Intune**: Switch only for pilot collection devices
- **Intune**: Switch for all co-managed Windows 10 devices

**Cloud Management Gateway (CMG) Setup**

**Requirements**
- Azure subscription
- On-premises Windows server for CMG connection point
- Service connection point in online mode
- Server authentication certificate
... (详见原始草稿)

### Phase 3: Comanagement Workload Flags
> 来源: OneNote — [onenote-comanagement-workload-flags.md](../drafts/onenote-comanagement-workload-flags.md)

**Co-management Workload Flag Values Reference**
**Workload Flags**
**Notes**
- Co-management flags were updated to support disk encryption (BitLocker) features
- Default value changed to 8193 to include EpSplit awareness
- Client workload flags can be checked via registry or WMI
- The `Capabilities` value in CoManagementHandler.log shows the combined workload flags

**21v Applicability**

### Phase 4: Deploy Sccm Via Intune Cmg
> 来源: OneNote — [onenote-deploy-sccm-via-intune-cmg.md](../drafts/onenote-deploy-sccm-via-intune-cmg.md)

**Deploy SCCM/ConfigMgr Client via Intune with CMG**
**Overview**
**Method 1: Windows LOB App**
- Device will **connect to CMG** to download content files for installation
- Steps:
  1. Upload `ccmsetup.msi` to Intune portal as LOB app
  2. Copy command line from CM console co-management properties
  3. Paste as command-line arguments (must begin with `CCMSETUPCMD`)
  4. Example:
     ```
     ```

**Method 2: Win32 App**
- If **all files in the folder** are wrapped and uploaded → ccmsetup will NOT connect to CMG (uses local cache)
- If **only ccmsetup.exe** is wrapped → ccmsetup will still connect to CMG to download content
- Steps:
  1. Upload wrapped file to Intune
  2. Modify command line to begin with `ccmsetup.exe` (remove `CCMSETUPCMD` and quotation marks)
  3. Example:
     ```
     ```

**Important Notes**
- For **local AD domain joined** devices: change the MP parameter to local MP instead of CMG to download content from local MP
- Win32 method with all files wrapped is preferred for offline/bandwidth-limited scenarios
- LOB method is simpler but requires CMG connectivity during installation

**References**
- [Tutorial: Co-manage new devices](https://docs.microsoft.com/en-us/sccm/comanage/tutorial-co-manage-new-devices)

### Phase 5: Sccm Verbose Log Collection
> 来源: OneNote — [onenote-sccm-verbose-log-collection.md](../drafts/onenote-sccm-verbose-log-collection.md)

**SCCM Verbose Log Collection for Co-management Issues**
**Steps**
1. **Enable verbose logging on CCM client**:
   - Open `HKLM\Software\Microsoft\CCM\Logging\@GLOBAL\LogLevel` → change from `1` to `0`
   - Change `LogMaxSize` value to `1000000` (Decimal)
   - Under `HKLM\Software\Microsoft\CCM\Logging`, create a new KEY: `DebugLogging`
   - Create a new `REG_SZ` value named `Enabled`, set data to `True`
2. **Restart SMS Agent Host service**
3. **Wait 15 minutes** for logs to accumulate
4. **Collect all logs** from `C:\Windows\CCM\Logs`
5. **Collect MDM diagnostic report**:
   ```cmd
   ```

**21v Applicability**

### Phase 6: Kusto 诊断查询

#### comanagement.md
`[工具: Kusto skill — comanagement.md]`

```kql
IntuneEvent
| where * contains '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, DeviceId, EventUniqueName, ServiceName, 
    ComponentName, ColMetadata, Col1, Col2, Col3, Message
| order by env_time asc
```

```kql
HttpSubsystem
| where * contains '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, TaskName, httpVerb, url, statusCode, 
    collectionName, accountId
| order by env_time asc
```

```kql
CMService
| where ActivityId == '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, *
| order by env_time asc
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune Co-management 在 21V 受限，CMG 无法使用 | 由于 SCCM CMG + Azure Service 在 21V 不可用，仅支持 Hybrid AADJ + co-management；CMClien... | 部分支持：仅限 Hybrid AADJ + co-management 场景，不使用 CMG；确保 CMClient 通过本地 AD 完成认证 | 🟢 9.0 | 21V Gap |
| 2 | SCCM co-managed devices in 21v cannot receive SCCM policies or check-in with management point whe... | Azure Cloud Management Gateway (CMG) service is not available in 21v Azure en... | Only Hybrid AAD Join + co-management is supported in 21v. Ensure devices have VPN or direct line-... | 🟢 9.0 | OneNote |
| 3 | Co-managed Windows device fails to auto-enroll to Intune via scheduled task; need to manually tri... | Auto-enrollment scheduled task under Enterprise Management may fail or not tr... | Manually trigger: elevated CMD > C:\Windows\System32 > DeviceEnroller.exe /c /AutoEnrollMDMUsingA... | 🟢 9.0 | OneNote |
| 4 | Co-management enrollment issue on Windows device; default ConfigMgr client logs lack sufficient d... | Default CCM client logging level (LogLevel=1) does not capture verbose enroll... | Enable verbose CCM logging: 1) HKLM\Software\Microsoft\CCM\Logging\@GLOBAL\LogLevel = 0. 2) LogMa... | 🟢 9.0 | OneNote |
| 5 | APv1 times out with entire DeviceSetup category failure; UDiag shows ServerHasNotFinished and CoM... | Co-Management policy assigned during Autopilot provisioning conflicts with en... | Un-assign/remove Co-Management policy during Autopilot. Verify with Kusto: (1) DeviceLifecycle Ev... | 🟢 8.5 | ADO Wiki |
| 6 | APv1 times out with entire DeviceSetup category failure; UDiag shows ServerHasNotFinished and CoM... | Co-Management policy assigned during Autopilot provisioning conflicts with en... | Un-assign/remove Co-Management policy during Autopilot. Verify with Kusto: (1) DeviceLifecycle Ev... | 🟢 8.5 | ADO Wiki |
| 7 | Intune auto-enrollment via GPO fails: scheduled task not created, dmenrollengine.dll reads Enroll... | SCCM (co-management) legacy enrollment info remains in registry at HKLM\SOFTW... | 1) Remove the registry key under HKLM\SOFTWARE\Microsoft\Enrollments where EnrollmentState=2 (Pow... | 🟢 8.5 | OneNote |
| 8 | Co-managed devices show duplicate entries in Intune portal -- one as normal Intune entry, second ... | Devices are enrolled to Intune via co-management AND uploaded by tenant attac... | On affected device: HKLM\SOFTWARE\MICROSOFT\CCM create REG_DWORD CoMgmtReportForceSend=1. Restart... | 🟢 8.0 | OneNote |
| 9 | MDM enrollment error 0xcaa9001f for co-managed Hybrid Entra joined devices via ConfigMgr: Integra... | IWA attempted against non-federated Entra domain. Cloud Management Azure serv... | Configure Azure Services for Cloud Management in ConfigMgr. Enable both AD User Discovery and Ent... | 🔵 7.5 | MS Learn |
| 10 | When updating DEP Token in Intune standalone or hybrid SCCM getting error The specified operation... | Corrupt DEP Token | Download new Encryption Key .pem from Intune Portal. Upload to deploy.apple.com, download new .p7... | 🔵 7.0 | ContentIdea KB |
| 11 | After updating the DEP Token, Intune Hybrid with SCCM is showing that the Last Sync is current bu... | DEP Token was not synced to Intune Side after renewal from Apple site. | Force a FULL sync from the ConfigMgr side by running SQL query on Primary/CAS DB: Update DRS_Mess... | 🔵 7.0 | ContentIdea KB |
| 12 | Android For Work Profiles are not synchronizing. SCCM Console shows Sync Status Failed | No Applications are approved in Play for Work. Connectivity issues shown in t... | Make sure at least one app is approved in Play for Work. Make sure the sync was initiated from th... | 🔵 7.0 | ContentIdea KB |
| 13 | Customer states they are attempting to configure their Store for Education per the article &quot;... | The Microsoft article &quot;https://docs.microsoft.com/en-us/sccm/apps/deploy... | Under section &quot;In Azure Active Directory, register Configuration Manager as a �Web Applicati... | 🔵 7.0 | ContentIdea KB |
| 14 | Apple DEP devices managed via SCCM in supervised mode with policy to block automatic app download... | By design | This setting does not affect app updates. | 🔵 7.0 | ContentIdea KB |
| 15 | The table dbo.CertificateData in the ConfigMgr DB is showing for the Subscription Certificate the... | Corruption of the Intune Subscription Certificate table due to upgrade of Con... | You will need to escalate this service request to IET, once there they will create an IcM request... | 🔵 7.0 | ContentIdea KB |
| 16 | If you have a pre-declared serial number for a DEP device in SCCM you may be unable to delete the... | A bug was filed but not yet fixed. The reason the problem occurs is a sql tab... | SMS: 494132: [CDCR] Unable to delete the iOS device from the PreDeclared list after removing from... | 🔵 7.0 | ContentIdea KB |
| 17 | Customer is having difficulty getting users to sync with IntuneTechnician wants to see clouduserI... | Useful for troubleshooting cloud user issues in SCCM Unified | Open SQL Management Studio. Connect to the DB (customer should be able to help you choose the cor... | 🔵 7.0 | ContentIdea KB |
| 18 | After removing the Configuration Manager (SCCM) client agent and enrolling a Windows PC into Intu... | This is caused by a bug in the Configuration Manager 1710 RollUp 2 client. Th... | As a workaround, complete the following:1. Un-enroll the device from Intune.2. Delete the followi... | 🔵 7.0 | ContentIdea KB |
| 19 | DEP devices no longer tagged as Supervised after doing a wipe and re-enrolling, this effects only... | This is a known issue that is under long term development for solution, the i... | Use one of the two work arounds based on break scenario.  NOTE:  Assure to remind your customer t... | 🔵 7.0 | ContentIdea KB |
| 20 | Customer complains that Compliance is not updated on MDM enrolled devices with Intune Hybrid and ... | Issue can be encounter in scenarios where Service Connection Point role is no... | Before taking any actions to SCCM SQL database, please make sure you have a proper backup.Proceed... | 🔵 7.0 | ContentIdea KB |
| 21 | In hybrid environments, Intune users may lose their device mappings in the System Center Configur... | There are numerous causes of clients losing device mappings. The most common ... | If only a limited number of devices are affected, manually remove Intune management on the device... | 🔵 7.0 | ContentIdea KB |
| 22 | Edge Enterprise Mode deployed via Intune not working as expected on co-management (SCCM+Intune) d... | SCCM CCM client creates Edge Enterprise Mode SiteList registry key to ensure ... | 1) Create registry HKLM\SOFTWARE\Policies\Microsoft\CCM with DWORD AllowConfigureMicrosoftEdge=0.... | 🔵 7.0 | OneNote |
| 23 | Question whether GPO Enable automatic MDM enrollment using default Azure AD credentials is requir... | Without GPO, co-management queues an enrollment timer with randomization dela... | GPO is NOT required for co-management auto-enrollment. Without GPO: ConfigMgr CoManagementHandler... | 🔵 7.0 | OneNote |
| 24 | User Rights Management policy (Add/Replace/Remove users or groups) fails to apply correctly or ta... | Windows built-in group and account display names are locale-dependent and dif... | Use Security Identifiers (SIDs) instead of display names when configuring user rights management ... | 🔵 6.5 | ADO Wiki |
| 25 | Co-management: Hybrid Azure AD join auto MDM enroll fails with error 0x8018002a. AADSTS50076 requ... | MFA is Enforced (not just Enabled), preventing ConfigMgr client agent from en... | Set MFA to Enabled but not Enforced, or temporarily disable via Trusted IPs. | 🔵 6.5 | MS Learn |
| 26 | Co-management: Enroll fails with 0x800706D9 or 0x80180023. dmwappushservice missing. | dmwappushservice service is missing from the device. | Export dmwappushservice reg key from working device, merge on affected, restart twice with AD cle... | 🔵 6.5 | MS Learn |
| 27 | Enterprise Mode site list not deployed to co-managed Win10 devices via Intune profile. | ConfigMgr creates MicrosoftEdge EnterpriseMode SiteList registry that takes p... | Set AllowConfigureMicrosoftEdge=0 under HKLM Policies Microsoft CCM; delete conflicting SiteList. | 🔵 6.5 | MS Learn |
| 28 | Endpoint Protection tattooed settings (ExcludedExtensions, ExcludedPaths, ExcludedProcesses) not ... | Known issue with co-management EP tattoo behavior -- when Device Configuratio... | Run cleanup script to delete tattooed registry keys: delete ExcludedExtensions/ExcludedPaths/Excl... | 🔵 6.5 | OneNote |
| 29 | Co-management status cannot be enabled on SCCM + Intune enrolled device. CoManagementHandler.log ... | Essential WMI class MDM_ConfigSetting under root\cimv2\MDM namespace is missi... | 1) Manually add MDM_ConfigSetting WMI class back to root\cimv2\MDM namespace. 2) Re-enroll device... | 🔵 6.0 | OneNote |
| 30 | Co-management device deployed via Intune shows question mark in SCCM console instead of green tic... | Multiple CMG config issues: 1) Boundary configured with AD site instead of IP... | 1) Configure boundary with IP ranges instead of AD site for internet-based clients. 2) Distribute... | 🔵 6.0 | OneNote |
| 31 | Configuration Manager agent state shows unhealthy/unknown/installed-but-not-assigned in Intune po... | Intune evaluates ConfigMgr agent state via ClientHealthStatus and ClientHealt... | Check CcmNotificationAgent.log for BGB sync issues. If ClientHealthLastSyncTime is current but po... | 🔵 6.0 | OneNote |
| 32 | Co-management bootstrap: Azure AD users not in ConfigMgr DB. Error 0x87d00231. | API permissions or Azure AD user Discovery not configured. | Configure API permissions and Azure AD user Discovery in ConfigMgr. | 🔵 5.5 | MS Learn |
| 33 | CMG connection point shows disconnected. | Permissions issue: remote site system cannot access primary site inboxes. | Add remote site system machine account to Local Admins on primary site. | 🔵 5.5 | MS Learn |
| 34 | Clients cannot locate MP via CMG, error 403 CMGConnector_Clientcertificaterequired. | CRL validation failure for client certificate. Revocation server offline. | Ensure CRL distribution points accessible or temporarily disable CRL checking for CMG. | 🔵 5.5 | MS Learn |
| 35 | ConfigMgr agent unhealthy in Intune, last check-in 2/1/1900. | Compliance policies workload managed by ConfigMgr not Intune. | Switch compliance workload to Intune or Pilot Intune. | 🔵 5.5 | MS Learn |
| 36 | Client apps workload not visible in co-management Properties. | Pre-release feature not enabled. | Enable pre-release feature in ConfigMgr: Administration > Updates and Servicing > Features. | 🔵 5.5 | MS Learn |
| 37 | Settings not reverted after unassigning Intune policies (no tattoo removal). | Tattoo removal not supported when Device Configuration workload is ConfigMgr. | Set Device Configuration workload to Intune, refresh policy on device. | 🔵 5.5 | MS Learn |
