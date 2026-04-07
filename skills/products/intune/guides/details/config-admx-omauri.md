# Intune ADMX / OMA-URI / Settings Catalog — 综合排查指南

**条目数**: 23 | **草稿融合数**: 10 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-b-SyncML-Viewer.md, mslearn-deploy-oma-uris-csp.md, onenote-admx-backed-policy-deployment.md, onenote-admx-backed-policy.md, onenote-chrome-homepage-admx-intune.md, onenote-chrome-homepage-admx-omauri.md, onenote-chrome-homepage-admx-policy.md, onenote-syncml-diagnostic-tools.md, onenote-syncml-status-codes.md, onenote-vpn-custom-oma-uri.md
**Kusto 引用**: policy-error.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (4 条)

- **solution_conflict** (high): intune-ado-wiki-282 vs intune-contentidea-kb-463 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-203 vs intune-mslearn-147 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-246 vs intune-mslearn-147 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-ado-wiki-375 vs intune-contentidea-kb-291 — context_dependent: 不同来源给出不同方案，可能适用不同场景

## 排查流程

### Phase 1: B Syncml Viewer
> 来源: ADO Wiki — [ado-wiki-b-SyncML-Viewer.md](../drafts/ado-wiki-b-SyncML-Viewer.md)

**SyncML Viewer**
**When to use SyncML Viewer**
- Not sure if a configuration/compliance/firewall policy is reaching the device
- Portal settings don't match what was sent to the device
- Errors in MDM event viewer logs — unsure if it's payload formatting or misconfiguration
- **Note**: For EPM policy troubleshooting, refer to the EPM workflow directly

**Instructions for gathering a SyncML trace**
1. Download latest `SyncMLViewer-vXXX.zip` from [GitHub](https://github.com/okieselbach/SyncMLViewer/tree/master/SyncMLViewer/dist)
2. Unzip and run `SyncMLViewer.exe` (requires Admin rights)
3. Approve UAC prompt
4. Click **MDM Sync** button (for most issues); click **MMP-C Sync** for EPM issues
5. Once sync completes, click **Save As** and save as `.xml`

**Analyzing a SyncML trace**
- Import into VS Code, Notepad, Notepad++
- Search for CSP keywords from the policy being applied
- Search for terms from the expected policy settings
- Check XML tags around setting names → indicates if policy was applied or removed

### Phase 2: Deploy Oma Uris Csp
> 来源: MS Learn — [mslearn-deploy-oma-uris-csp.md](../drafts/mslearn-deploy-oma-uris-csp.md)

**Deploying Custom OMA-URIs to Target CSP via Intune**
**Overview**
**Key Concepts**
**CSP Scope**
- **User scope**: `./User/Vendor/MSFT/Policy/Config/AreaName/PolicyName`
- **Device scope**: `./Device/Vendor/MSFT/Policy/Config/AreaName/PolicyName`
- Scope is dictated by the platform, not MDM provider
- Reference: [CSP documentation](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-configuration-service-provider)

**Architecture Flow**
1. OMA-URI = payload (setting path + value)
2. Custom policy = container in Intune
3. Intune = delivery mechanism (OMA-DM protocol, XML-based SyncML)
4. CSP on client = reads and applies settings (typically registry keys)

**Built-in vs Custom**
- Built-in Intune profiles use the same underlying mechanism but with friendly UI
- Use built-in settings whenever possible; custom OMA-URI only for unavailable options

**Policy Behavior Notes**
- Policy changes pushed automatically to device
- **Removing policy assignment may NOT revert settings to default** (no tattoo removal)
- Exceptions: Wi-Fi, VPN, certificate, and email profiles ARE removed when unassigned
- Behavior controlled by each CSP

**Troubleshooting Custom Policies**

**Common Issue Categories**
1. Custom policy did not reach the client
2. Policy reached client but expected behavior not observed

**Diagnostic Steps**
1. **Check MDM diagnostic logs** on the device
2. **Check Windows Event Log**: `DeviceManagement-Enterprise-Diagnostics-Provider > Admin`
3. Both logs should reference the custom policy/OMA-URI
4. No reference = policy not delivered → verify configuration and group targeting
... (详见原始草稿)

### Phase 3: Admx Backed Policy Deployment
> 来源: OneNote — [onenote-admx-backed-policy-deployment.md](../drafts/onenote-admx-backed-policy-deployment.md)

**ADMX-Backed Policy Deployment via Intune OMA-URI**
**Overview**
**Tools**
- **GPSearch**: https://gpsearch.azurewebsites.net/ - Check ADMX & registry key values
- **MMAT (MDM Migration Analysis Tool)**: https://github.com/WindowsDeviceManagement/MMAT - Identify which GPO policies can be migrated to MDM

**Step-by-Step Process**

**1. Find the Policy CSP**
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/System/BootStartDriverInitialization`
- Determine scope: `./User` or `./Device`
- Locate ADMX name and policy name from CSP docs (e.g., `earlylauncham.admx`, policy `POL_DriverLoadPolicy_Name`)

**2. Get the ADMX Source File**
- If ADMX ships with Windows: copy from `%SystemRoot%\policydefinitions`
- If custom: obtain from vendor

**3. Ingest ADMX via Intune**
```
```
- `{appname}` = ADMX filename without extension (e.g., `earlylauncham`)
- Data Type: String
- Value: Full content of the .admx file (copy from Notepad++)

**4. Configure Specific Settings**
- Check element type from ADMX content: Text, MultiText, Boolean, Enum, Decimal, or List
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/{Area}/{PolicyName}`
- Value format: `<enabled/><data id="{elementId}" value="{value}"/>`
```xml
```

**5. Verify Deployment**

**Client Side**
1. **Access Work or School** > Info > check policy listed
2. **Registry locations**:
   - `HKLM\Software\Microsoft\PolicyManager\Providers\{ProviderGUID}\default\Device\{Area}`
   - `HKLM\Software\Microsoft\Provisioning\NodeCache\CSP\Device\MS DM Server\Nodes\{NodeId}`

**MDM Diagnostic Log**
- Export from Settings > Access Work or School > Export management log
- Check `EndtraceRegistry.txt` for policy values

**Kusto Query**
```kql
```

**Known Limitations**
- Some CSPs are **Enterprise/Education edition only** (e.g., AppVirtualization) - Professional edition shows "Not applicable"
... (详见原始草稿)

### Phase 4: Admx Backed Policy
> 来源: OneNote — [onenote-admx-backed-policy.md](../drafts/onenote-admx-backed-policy.md)

**ADMX-Backed Policy Deployment via Intune**
**Overview**
**Tools**
- **GPSearch**: https://gpsearch.azurewebsites.net/ - Check ADMX & registry key values
- **MMAT (MDM Migration Analysis Tool)**: https://github.com/WindowsDeviceManagement/MMAT - Analyze GPO policies for MDM migration feasibility

**Step-by-Step: Deploy an ADMX-Backed Policy**

**1. Find the GPO Configuration**
- Identify the GPO location (e.g., Computer Configuration/Administrative Template/...)
- Note the OMA-URI path (e.g., `./Device/Vendor/MSFT/Policy/Config/System/BootStartDriverInitialization`)

**2. Confirm ADMX Source File Exists**
- Check `%SystemRoot%\policydefinitions` for the .admx file
- Find the ADMX name from Policy CSP documentation
- Determine scope: `./user` vs `./device`

**3. Install ADMX File via Intune (if not inbox)**
- Copy all content from .admx file
- Create custom OMA-URI profile:
  - **OMA-URI**: `./Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/{admxname}/Policy/admxfile01`
  - **Data type**: String
  - **Value**: Full XML content of the .admx file

**4. Configure Specific Settings**
- Check element types in .admx content (Text, MultiText, Boolean, Enum, Decimal, List)
- Create another OMA-URI for the setting:
  - **OMA-URI**: `./Device/Vendor/MSFT/Policy/Config/{Area}/{PolicyName}`
  - **Value**: `<enabled/><data id="{elementId}" value="{value}"/>`

**5. Verify Deployment**
1. **Device side** - Access work or school > Info > check policy list
2. **Registry** - Check:
   - `HKLM\Software\Microsoft\PolicyManager\Providers\{providerId}\default\Device\{area}`
   - `HKLM\Software\Microsoft\Provisioning\NodeCache\CSP\Device\MS DM Server\Nodes\{id}`
... (详见原始草稿)

### Phase 5: Chrome Homepage Admx Intune
> 来源: OneNote — [onenote-chrome-homepage-admx-intune.md](../drafts/onenote-chrome-homepage-admx-intune.md)

**Configure Chrome Homepage via Intune ADMX-backed Policy**
**Overview**
**Steps**
**1. Get Chrome ADMX Template**
**2. Ingest ADMX Template into Intune**
1. Go to **Intune** > **Device Configuration** > **Profiles** > **Create profile**
2. Platform: **Windows 10 and later**, Profile type: **Custom**
3. Add row:
   - **OMA-URI**: `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/Chrome/Policy/ChromeAdmx`
   - **Data type**: String
   - **Value**: Paste the full content of `chrome.admx`

**3. Find Required Registry Keys**

**4. Configure Settings (4 OMA-URI rows)**
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageIsNewTabPage`
- Data type: String
- Value: `<disabled/>`
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageLocation`
- Data type: String
- Value:
  ```xml
  ```
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartup`
- Data type: String
- Value:
  ```xml
  ```
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartupURLs`
- Data type: String
- Value:
  ```xml
  ```

**5. Verify**

**Notes**
- This same ADMX ingestion pattern works for any third-party ADMX template (Firefox, Adobe, etc.)
- Replace `https://your-homepage-url.com` with the actual desired URL
... (详见原始草稿)

### Phase 6: Chrome Homepage Admx Omauri
> 来源: OneNote — [onenote-chrome-homepage-admx-omauri.md](../drafts/onenote-chrome-homepage-admx-omauri.md)

**Configure Chrome Homepage via ADMX-Backed OMA-URI in Intune**
**Overview**
**Steps**
**1. Get Chrome ADMX File**
**2. Ingest ADMX Template into Intune**
- **Platform**: Windows 10 and later
- **Profile type**: Custom
- **OMA-URI**: `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/Chrome/Policy/ChromeAdmx`
- **Data type**: String
- **Value**: Paste full content of chrome.admx file

**3. Determine Registry Keys**

**4. Configure Settings**
```
```
```
```
```
```
```
```

**5. Validate**

**References**
- [Manage Chrome Browser with Microsoft Intune](https://support.google.com/chrome/a/answer/9102677)
- CSP: `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall`

### Phase 7: Chrome Homepage Admx Policy
> 来源: OneNote — [onenote-chrome-homepage-admx-policy.md](../drafts/onenote-chrome-homepage-admx-policy.md)

**Set Chrome Homepage via Intune ADMX-Backed Policy**
**Overview**
**Prerequisites**
- Download the latest Chrome ADMX template from [Chrome Enterprise](https://chromeenterprise.google/browser/download/#manage-policies-tab)
- Intune license with custom profile support

**Step 1: Ingest Chrome ADMX Template**

**Step 2: Identify Registry Keys**
1. Open `regedit.exe`
2. Navigate to `HKLM\SOFTWARE\Microsoft\PolicyManager\ADMXDefault`
3. Browse Chrome setting categories

**Step 3: Configure Settings**

**HomepageIsNewTabPage (Disable)**

**HomepageLocation**

**RestoreOnStartup**

**RestoreOnStartupURLs**

**Step 4: Validate**
- Navigate to `chrome://policy` to see applied policies
- Check homepage behavior

**Notes**
- RestoreOnStartup value `4` = Open a list of URLs
- Multiple startup URLs use `&#xF000;` as separator
- Quotes in XML values may cause errors — ensure proper XML escaping
- Reference: [Manage Chrome Browser with Intune](https://support.google.com/chrome/a/answer/9102677)

### Phase 8: Syncml Diagnostic Tools
> 来源: OneNote — [onenote-syncml-diagnostic-tools.md](../drafts/onenote-syncml-diagnostic-tools.md)

**SyncML & MDM Diagnostic Tools**
**SyncML Viewer**
**Downloads**
- Internal: `\\shmsd\SHMSD\Readiness\Products\Azure\Intune\Tools\SyncmlViewer`
- Public (latest): [SyncMLViewer on GitHub](https://github.com/okieselbach/SyncMLViewer)

**Capabilities**
- Verify if settings/policies from Intune have been received
- See which CSPs are called when a policy is configured
- View CSP command internals (Get/Add/Delete/Replace)
- Send CSP commands manually to reproduce issues

**Usage**
1. Deploy a new policy from Intune
2. Capture SyncML sessions in the **SyncML Messages** tab
3. View Source/Target in each message
4. Example: Msg 3 = Intune sends Get for Firewall status → Msg 4 = Device returns status 200, value 0
5. Save captured sessions for sharing/future research

**References**
- [IntuneWiki SyncML Viewer](https://www.intunewiki.com/wiki/Windows_SyncML_Viewer)
- [Oliver Kieselbach - MDM monitoring](https://oliverkieselbach.com/2019/10/11/windows-10-mdm-client-activity-monitoring-with-syncml-viewer/)

**SyncML Response Status Codes**

**WMI Tester (wbemtest) for MDM CSPs**
1. Run `wbemtest` with admin permissions
2. Connect to namespace: `root\cimv2\mdm\dmmap`
3. Choose **Enum Classes** (Recursive)
4. Find WMI class for the policy (e.g., `MDM_Policy_Config01_DeviceLock02`)

### Phase 9: Syncml Status Codes
> 来源: OneNote — [onenote-syncml-status-codes.md](../drafts/onenote-syncml-status-codes.md)

**SyncML Response Status Codes Reference**
**Success Codes (1xx-2xx)**
**Redirect Codes (3xx)**
**Client Error Codes (4xx) - Most Common in Troubleshooting**
**Server Error Codes (5xx)**
**Common Troubleshooting Patterns**
- **418 + 404 in Sequence**: PauseQualityUpdates Add returns 418 (AlreadyExists), then Rollback returns 404 (NotFound) - indicates rollback prerequisites not met
- **500 for policy delivery**: Check if CSP URI is correct and supported on device OS version
- **405**: Command type (Add vs Replace) mismatch for the target CSP node

### Phase 10: Vpn Custom Oma Uri
> 来源: OneNote — [onenote-vpn-custom-oma-uri.md](../drafts/onenote-vpn-custom-oma-uri.md)

**Windows VPN Custom Policy via Intune OMA-URI**
**Always On VPN via Custom OMA-URI**
- **Setting name**: Always On
- **Data type**: String
- **OMA-URI**: `./Device/Vendor/VPNv2/{ProfileName}/AlwaysOn`
- **Value**: `True`

**VPN Profile Storage Locations**

**References**
- [Create VPN profile via Custom OMA-URI](https://blogs.technet.microsoft.com/tune_in_to_windows_intune/2015/01/30/create-a-vpn-profile-using-microsoft-intune-standalone-via-custom-oma-uris/)
- [VPNv2 CSP](https://learn.microsoft.com/en-us/windows/client-management/mdm/vpnv2-csp)

### Phase 11: Kusto 诊断查询

#### policy-error.md
`[工具: Kusto skill — policy-error.md]`

```kql
let intuneDeviceId = '{deviceId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where EventId == 5786
| where deviceId == intuneDeviceId
| where reportComplianceState == 'Error'
| summarize 
    LastError=max(env_time),
    FirstError=min(env_time),
    ErrorCount=count(),
    Compliant=countif(reportComplianceState=='Compliant')
  by PolicyName=name, PolicyId=id, PolicyType=typeAndCategory
| extend SuccessRate = round(100.0 * Compliant / (Compliant + ErrorCount), 1)
| where ErrorCount > 0
| order by ErrorCount desc, LastError desc
| limit 20
```

```kql
let intuneDeviceId = '{deviceId}';
let problemPolicyId = '{policyId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where deviceId == intuneDeviceId
| where reportComplianceState == 'Error'
| where id contains problemPolicyId
| project env_time, PolicyID=id, PolicyType=typeAndCategory, EventMessage, message
| take 5
```

```kql
let accountId = '{accountId}';
let problemPolicy = '{policyId}';

DeviceManagementProvider  
| where env_time > ago(15d)
| where accountId == accountId
| where id contains problemPolicy
| where reportComplianceState == 'Error'
| summarize 
    ErrorCount=count(),
    FirstError=min(env_time),
    LastError=max(env_time),
    AffectedDevices=dcount(deviceId)
  by accountId, PolicyType=typeAndCategory
| project accountId, AffectedDevices, ErrorCount, FirstError, LastError, PolicyType
```

```kql
let intuneDeviceId = '{deviceId}';

DeviceManagementProvider  
| where env_time > ago(7d)
| where deviceId == intuneDeviceId
| where EventId == 5786
| summarize 
    ErrorCount=countif(reportComplianceState == 'Error'),
    CompliantCount=countif(reportComplianceState == 'Compliant'),
    PendingCount=countif(reportComplianceState == 'Pending')
  by bin(env_time, 1h)
| order by env_time asc
```

```kql
DeviceManagementProvider
| where SourceNamespace == "IntuneCNP" 
| where env_time >= now(-10d)
| where EventMessage contains "Tattoo removed for - AccountID: '{accountId}'; DeviceID: '{deviceId}'" 
| project env_time, EventMessage 
```

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where ActivityId == '{deviceId}'
| where message contains "Tattoo"
| project env_time, ActivityId, cV, message
```

```kql
IntuneEvent
| where env_time > ago(1d)
| where ActivityId contains '{deviceId}'
| where * contains "Tattoo"
| project ActivityId, env_time, ComponentName, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune Device Restriction policy for password complexity (DeviceLock/MinDevicePasswordComplexChar... | Password complexity value 4 ('Digits, lowercase letters, uppercase letters, a... | Change password complexity setting to a supported value (1, 2, or 3) for Windows desktop devices.... | 🟢 9.0 | OneNote |
| 2 | Custom OMA-URI device configuration policies may stop working or show unexpected behavior after I... | Microsoft is migrating Windows device configuration policies to unified setti... | Check if the custom OMA-URI setting is already available in Settings Catalog. If yes, migrate to ... | 🟢 9.0 | OneNote |
| 3 | Need to restrict which users can log on locally to Windows devices managed by Intune; want to blo... | Windows allows any valid credential holder to log on locally by default. Intu... | Create Intune custom profile: OMA-URI: ./Device/Vendor/MSFT/Policy/Config/UserRights/AllowLocalLo... | 🟢 9.0 | OneNote |
| 4 | Need to restrict domain user local logon on Intune-managed Windows 10 AADJ device. Want to allow ... | No built-in Intune UI for AllowLocalLogOn user rights assignment. Must use cu... | Create custom profile: OMA-URI ./Device/Vendor/MSFT/Policy/Config/UserRights/AllowLocalLogOn, Dat... | 🟢 9.0 | OneNote |
| 5 | After applying AllowLocalLogOn CSP via Intune custom profile, unassigning or setting policy to No... | Windows design limitation - AllowLocalLogOn CSP is a tattooed policy that per... | Must manually fix on device with local admin: Open gpedit.msc -> Allow log on locally -> remove I... | 🟢 9.0 | OneNote |
| 6 | Windows Device Configuration policy 显示 error (Remediation Failed) 但设备实际行为符合预期，设置已确认在 MDMDiagRepor... | CSP 不支持 Get 操作。Intune 下发 Add/Replace 操作后，通过 Get 操作验证值，如果 Get 返回值与下发值不匹配或 CSP ... | 确认 CSP 文档中是否支持 Add/Get/Replace/Delete 操作。如果 CSP 不支持 Get 操作（如 Account CSP），设置会报 failed 但实际已生效，属于预期... | 🟢 8.5 | ADO Wiki |
| 7 | macOS custom profile (DLP/TCC payload) fails with error 'The profile must be a system profile. Us... | Profile was deployed to a user group instead of a device group. TCC and certa... | Reassign the custom configuration profile to a device group instead of a user group. TCC/Privacy ... | 🟢 8.5 | ADO Wiki |
| 8 | Security baseline shows 'Error' status; setting fails to apply due to scope or applicability issue | Setting either assigned to wrong scope (user vs device) or device does not su... | 1) Check error code in Intune portal for explanation. 2) Review CSP pre-requirements for each fai... | 🟢 8.5 | ADO Wiki |
| 9 | Unhealthy Endpoint Report shows incorrect device status in MEM Admin Center; mismatch between por... | Multiple possible causes: 1) Defender AV agent reporting incorrect status (MD... | 1) Run Get-MpComputerStatus on device to get actual ComputerState/AMRunningMode/DefenderSignature... | 🟢 8.5 | ADO Wiki |
| 10 | Security baseline profile shows 'Error' status — security setting failed to apply on device | Typically related to scope (wrong assignment to user vs device group) or appl... | 1) Review CSP pre-requirements for each security setting 2) Check if device supports the setting ... | 🟢 8.5 | ADO Wiki |
| 11 | TargetReleaseVersion CSP and Feature Update policy behave differently for controlling Windows fea... | TargetReleaseVersion CSP is client-side control; Feature Update policy is ser... | Use TargetReleaseVersion CSP (OMA-URI ./Vendor/MSFT/Policy/Config/Update/TargetReleaseVersion) as... | 🟢 8.0 | OneNote |
| 12 | Intune Endpoint Security firewall rule deployment fails with error 0x80070057 (E_INVALIDARG); one... | Common causes: 1) Invalid file path with typos in environment variables (e.g.... | 1) Identify the failing rule via Event Log EventID 404 under DeviceManagement-Enterprise-Diagnost... | 🟢 8.0 | OneNote |
| 13 | Intune policy RemovableDiskDenyWriteAccess deployed successfully (registry and policy manager con... | Registry key HKLM\SYSTEM\CurrentControlSet\Control\Storage\HotplugSecureOpen ... | 1. Check if HotplugSecureOpen registry key exists: HKLM\SYSTEM\CurrentControlSet\Control\Storage\... | 🔵 7.5 | OneNote |
| 14 | Issue:  Windows 10 Enterprise Mobile devices are assigned the CSP Policies as such:     Shows the... | The CSP is being ignored and is currently BUG: Bug 11941212 | Currently there is no work around for this issue, and the BUG is being worked on at this time, pl... | 🔵 7.0 | ContentIdea KB |
| 15 | OMA-URI ./Vendor/MSFT/Policy/Config/Start/HideAppList policy is not applying to MDM enrolled Wind... | This is a client side bug fixed in Windows 10 RS3. | Upgrade to Windows 10 RS3. ICM 43249767. | 🔵 7.0 | ContentIdea KB |
| 16 | When configuring the option "Use private store only" in the Intune for EDU portal the policy show... | Targeted computers have Windows PRO Education which does not support the Requ... | The RequirePrivateStoreOnly CSP policy is not supported on Windows 10 PRO Education because it is... | 🔵 7.0 | ContentIdea KB |
| 17 | After creating a Windows 10 configuration profile and supplying the URL to an image to be used as... | This can occur if SetEduPolicies is not set to TRUE. Managing the desktop ima... | To resolve this prob lem complete the following:1. Login to portal.azure.com. 2. On the Intune bl... | 🔵 7.0 | ContentIdea KB |
| 18 | �         The �Windows Defender Security Center� is showing unexpected results on Windows 10 1703... | The �Enable user access to Windows Defender� is not working correctly. Settin... | The workaround, until a fix is implemented to resolve the CSP being set incorrectly, can be found... | 🔵 7.0 | ContentIdea KB |
| 19 | After creating and assigning a Device Configuration profile that defines a custom VPN connection ... | This occurs because in certain scenarios, the response sent by the Windows 10... | You can ignore this error as the connection does work as expected. Alternatively, you can&nbsp;us... | 🔵 7.0 | ContentIdea KB |
| 20 | Cannot apply Windows 10 Custom Setting to set IE DisableHomePageChange via OMA-URI. Result: (0x80... | Quotation marks in the policy value XML string are not in UTF-8 unicode (smar... | Edit the OMA-URI and modify its string value ensuring standard UTF-8 quotation marks are used in ... | 🔵 7.0 | ContentIdea KB |
| 21 | OneDrive KFM (Known Folder Move) allows you to redirect common Windows folders (Desktop, Document... | Protect Critical Data With OneDrive & Known Folder Move (KFM)https://blogs.te... | To setup OneDrive for Business KFM, you will need to perform the following actions:1. Make sure O... | 🔵 7.0 | ContentIdea KB |
| 22 | ADMX-backed custom OMA-URI policy deployed via Intune shows 'Not applicable' or fails on Windows ... | Certain Policy CSPs (e.g., AppVirtualization) used in ADMX-backed policies ar... | Verify CSP edition support at docs.microsoft.com/windows/client-management/mdm/policy-csp-* befor... | 🔵 7.0 | OneNote |
| 23 | RemoteWipe doWipe fails on Windows 10 with Event ID 400 The request is not supported (0x80070032) | Windows Recovery Environment (WinRE) is disabled. RemoteWipe CSP requires WinRE. | Run Reagentc /info as admin to check WinRE status. If Disabled troubleshoot and re-enable WinRE. | 🔵 6.5 | MS Learn |
