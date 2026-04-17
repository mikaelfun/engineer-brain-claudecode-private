# Intune 设备配置通用问题 — 综合排查指南

**条目数**: 35 | **草稿融合数**: 0 | **Kusto 查询融合**: 2
**Kusto 引用**: policy-error.md, policy-status.md
**生成日期**: 2026-04-07

---

## ⚠️ 已知矛盾 (4 条)

- **solution_conflict** (high): intune-ado-wiki-379 vs intune-contentidea-kb-257 — version_superseded: Entry intune-contentidea-kb-257 contains deprecated/EOL language
- **solution_conflict** (high): intune-contentidea-kb-058 vs intune-mslearn-089 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **solution_conflict** (high): intune-contentidea-kb-179 vs intune-mslearn-089 — context_dependent: 不同来源给出不同方案，可能适用不同场景
- **rootCause_conflict** (medium): intune-contentidea-kb-257 vs intune-mslearn-089 — version_superseded: Entry intune-contentidea-kb-257 contains deprecated/EOL language

## 排查流程

### Phase 1: Kusto 诊断查询

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

#### policy-status.md
`[工具: Kusto skill — policy-status.md]`

```kql
DeviceManagementProvider
| where env_time between(datetime({startTime})..datetime({endTime}))
| where deviceId =~ '{deviceId}'
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message, tenantContextId, tenantId
| order by env_time asc
| limit 1000
```

```kql
DeviceManagementProvider 
| where env_time > ago(7d) 
| where ActivityId == '{deviceId}'
| where EventId == 5786
| project env_time, DeviceID=ActivityId, policyId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message 
| order by env_time asc
```

```kql
DeviceManagementProvider 
| where env_time > ago(3d)
| where EventId == 5786
| where ActivityId == '{deviceId}'
| extend PolicyId = extract("PolicyID: '(.*?)';", 1, EventMessage)
| where PolicyId == '{policyId}'
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyId, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    TaskName, EventId, EventMessage, message
| order by env_time asc
```

```kql
DeviceManagementProvider  
| where env_time > ago(3d)
| where EventId == 5786
| where deviceId == '{deviceId}'
| where id has '{policyId}'
| project ActivityId, PolicyName=name, PolicyType=typeAndCategory, 
    Applicability=applicablilityState, Compliance=reportComplianceState, 
    deviceId=ActivityId, PolicyID=['id'], env_time, policyId
| summarize 
    Success=(count(Compliance=='Compliant')>0), 
    Pending=(count(Compliance=='Compliant')==0), 
    Error=(count(Compliance=='Error')>0),
    LastSeen=max(env_time)
  by ActivityId, PolicyName, PolicyType, PolicyID, Applicability, policyId
| summarize 
    SuccessCount=sum(Success), 
    PendingCount=sum(Pending), 
    ErrorCount=sum(Error) 
  by PolicyName, PolicyType, ActivityId, PolicyID, Applicability, LastSeen, policyId
| project policyId, PolicyType, Applicability, SuccessCount, PendingCount, ErrorCount, LastSeen
| order by Applicability asc, LastSeen asc
```

```kql
let starttime = ago(30d);
let endtime = now();
let deviceid = '{deviceId}';
let accountid = '{accountId}';
let policyid = '{policyId}';
let ciid = '{ciid}';

DeviceManagementProvider 
| where env_time between (starttime .. endtime)
| where accountId == accountid
| where ActivityId contains deviceid
| extend rawciid = iff(ciid <> '', ciid, iff(policyid <> '', replace_regex(policyid,'-','_'), ''))
| where EventId == 5786
| parse EventMessage with * "PolicyID: '" parsedPolicyId "';" * "CIId: '" parsedCIID "';" *
| where parsedCIID contains rawciid or parsedPolicyId == policyid
| project env_time, userId, deviceId, policyId=parsedPolicyId, CIID=parsedCIID, 
    PolicyType=typeAndCategory, Applicability=applicablilityState, 
    Compliance=reportComplianceState, TaskName, EventMessage, PolicyName=name 
| order by env_time asc
```

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where ActivityId == '{deviceId}'
| where message contains "Tattoo"
| project env_time, ActivityId, cV, message
```

```kql
DeviceManagementProvider
| where SourceNamespace == "IntuneCNP" 
| where env_time >= now(-10d)
| where EventMessage contains "Tattoo removed for - AccountID: '{accountId}'; DeviceID: '{deviceId}'" 
| project env_time, EventMessage 
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune portal blade (e.g., Device Configurations) fails to load or shows error. F12 trace shows b... | Backend microservice (e.g., StatelessDeviceConfigurationFEService) exceeds 15... | Collect F12 trace, extract client-request-id. Query IntuneEvent by ActivityId to find exception, ... | 🟢 9.0 | OneNote |
| 2 | Cannot deploy printer drivers to non-administrator users via Intune after KB5005652 security upda... | KB5005652 (CVE-2021-34481) changed default behavior to restrict printer drive... | Option 1: Deploy PowerShell script via Intune (run as SYSTEM) to set registry HKLM\Software\Polic... | 🟢 9.0 | OneNote |
| 3 | Intune Endpoint Protection で Firewall Policy を展開すると、Windows Defender Firewall with Advanced Secur... | Intune (MDM) 経由で配布された Firewall ルールは PolicyManager ではなく HKLM\SYSTEM\ControlSet... | MDMDiagnosticlog や Event Viewer (Event ID 2097: Windows Firewall With Advanced Security/Firewall)... | 🟢 9.0 | OneNote |
| 4 | Intune Kiosk mode auto-logon stops working; device does not auto-login to the kiosk account after... | Device configuration profile or compliance policy with password policy settin... | 1) Remove or exclude password policy from configuration/compliance profiles targeting kiosk devic... | 🟢 9.0 | OneNote |
| 5 | Windows LAPS client fails to update password to Azure AD; Event ID 10025 with error 0x80072EE7 (I... | Client cannot resolve enterpriseregistration.windows.net DNS endpoint due to ... | Verify connectivity: curl https://enterpriseregistration.windows.net/ -D - from admin cmd; check ... | 🟢 9.0 | OneNote |
| 6 | Autopilot HAADJ Domain Join 失败，错误指向 OU 路径无效或无法在 AD 中创建计算机账户 | Domain Join Device Configuration Profile 中的 OU 路径不正确：常见错误包括使用 CN= 代替 OU=/DC= ... | 1. 在客户的 AD Users & Computers MMC 中截图确认实际 OU 路径；2. 确保 Domain Join profile 使用 OU= 和 DC= 语法（不是 CN=）；... | 🟢 8.5 | ADO Wiki |
| 7 | macOS Platform SSO: 'app-sso platform -s' command shows null output after enrollment — registrati... | Either the com.apple.extensiblesso Profile is missing from System Settings (p... | Cause 1: Verify user/device is assigned to the Platform SSO device configuration profile. Cause 2... | 🟢 8.5 | ADO Wiki |
| 8 | MDE Attach policy deployment fails with error 2146233088 'Invalid flags specified' in Sense Event... | Firewall rule contains an incorrect/invalid value that cannot be applied by t... | Check Sense Event Viewer (Application and Services logs → Microsoft → Windows → Sense) for error ... | 🟢 8.5 | ADO Wiki |
| 9 | Security baseline shows 'Conflict' status on device; two settings applied to same device with con... | Multiple security baselines or device configuration profiles configure the sa... | 1) Use Kusto query to identify conflicting settings: query IntuneEvent where Col1 contains 'confl... | 🟢 8.5 | ADO Wiki |
| 10 | Security baseline profile shows 'Conflict' status on device — two settings applied to same device... | Multiple security baselines or device configuration profiles targeting same d... | 1) Use Kusto query with Col1 contains 'conflict' on IntuneEvent table to identify conflicting set... | 🟢 8.5 | ADO Wiki |
| 11 | Android Enterprise Work Profile passcode reset fails; OMADMLog shows 'ResetPasswordToken unknown'... | The ResetPasswordToken has not been activated on the device. Android Work Pro... | Deploy Android Enterprise Device Restrictions profile (Work Profile Only) with 'Require Work Prof... | 🟢 8.5 | OneNote |
| 12 | Wired-network profile stopped applying on macOS devices while other configuration profiles work n... | PG-confirmed bug affecting wired-network profile deployment on macOS. | Bug confirmed and fixed by PG (closed Oct 2023). If issue recurs, file ICM referencing this known... | 🟢 8.0 | OneNote |
| 13 | Change Review Agent 运行结果显示 'No details available for this factor. Agent couldn't retrieve any sup... | Agent 缺少对应验证因素所需的 RBAC 权限，无法检索相关数据 | 确保运行 Agent 的用户具备所有必需权限：Intune Device configurations/read、Audit log/read、Managed devices/read、Defe... | 🔵 7.5 | ADO Wiki |
| 14 | Deploying device configuration profile to iOS: error 2016341112 iOS device is currently busy. Pro... | iOS device busy (locked/installing) sends NotNow status via MDM protocol. | Unlock the iOS device. Profile applied automatically once unlocked. | 🔵 7.5 | MS Learn |
| 15 | When you attempt to save the configuration profile with the .csv files for ios applications you m... | The format has changed in the new portal | The format has changed in the new portal and must be in this format:<app url>, <app name>, <app p... | 🔵 7.0 | ContentIdea KB |
| 16 | (no symptom) | Customers are wanting to deploy their Commercial ID (from Microsoft Operation... | Prereqs:  �         Azure AD Premium  �         Microsoft Operations Management Suite (OMS)  o   ... | 🔵 7.0 | ContentIdea KB |
| 17 | Windows 10 devices are not reporting&nbsp; status for Antivirus client to Intune Admin ConsoleInt... | When upgrading from Windows 8 to Windows 10 the Intune Endpoint Protection Cl... | To remove the Intune Endpoint Protection Client:1. Create a .cmd file on a machine that is having... | 🔵 7.0 | ContentIdea KB |
| 18 | Customers are wanting to deploy their Commercial ID (from Microsoft Operations Management Suite (... | Prereqs:  �&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Azure AD Premium�&nbsp;&nbsp;... | Solution:Section 1: Microsoft Operations Management Suite (OMS) Configuration:Enabling Update Com... | 🔵 7.0 | ContentIdea KB |
| 19 | When an iPhone user with a paired Apple watch enrolls their phone into Intune, reminders for sche... | This can occur if there is an iOS Device Restriction configuration profile as... | To work around this problem, set Viewing corporate documents in unmanaged apps to Not configured.... | 🔵 7.0 | ContentIdea KB |
| 20 | When the Pioneer Trade Show app is deployed to iOS devices, the Share button is unavailable. | This can occur if the policy Viewing corporate documents in unmanaged apps is... | To resolve this issue, configure the policy Viewing corporate documents in unmanaged apps to Not ... | 🔵 7.0 | ContentIdea KB |
| 21 | Customer deploys a Microsoft Intune configuration policy to configure BitLocker End Point Protect... | Unknown | Deploy a device restriction settings password policy to require encryption. | 🔵 7.0 | ContentIdea KB |
| 22 | Customer wants to make Intune web apps available when applying iOS configuration policy for Show ... |  | Deploy apps to device, then in Device restrictions profile add web app using bundle ID com.app.we... | 🔵 7.0 | ContentIdea KB |
| 23 | In a hybrid Intune/Configuration Manager environment, after you create and deploy a Configuration... | This can occur if remediation is not enabled in the Configuration Baseline.&n... | To resolve this issue, enable remediation in the Configuration Baseline that contains the Configu... | 🔵 7.0 | ContentIdea KB |
| 24 | After enrolling an iOS 11 device into Intune, the option to share a photo via iMessage is no long... | This can occur if either policy setting below is set to Block and the policy ... | This issue is resolved in iOS 11.1 and higher versions. This issue was a result of a change made ... | 🔵 7.0 | ContentIdea KB |
| 25 | After enrolling a device in Intune, you may notice that no policies show up on the device, and wh... | This can occur if rules in the Device Configuration policies are conflicting. | To determine which rules are conflicting, you can run the following Kusto query:IntuneEvent \| wh... | 🔵 7.0 | ContentIdea KB |
| 26 | Windows 10 MDM auto-enrollment into Intune via GPO fails and the following symptoms are observed:... | This can occur if the domain for the UPN is either unverified or unroutable. ... | To resolve this problem, complete the following:1.	Open Active Directory Users and Computers2.	Se... | 🔵 7.0 | ContentIdea KB |
| 27 | You may notice the following on MDM-managed iOS devices running version 11.3 and later: End users... | This can occur if there is an iOS device restriction policy where either View... | Configure policies in Intune: Log in to Azure Portal > Intune > Device Configuration > Profiles. ... | 🔵 7.0 | ContentIdea KB |
| 28 | On an iOS device, when the screen is locked device configuration profiles may not be deployed suc... | This occurs because the iOS device is busy and unable to complete evaluation ... | This is a function of the iOS platform. Once the device is unlocked the policy will be applied an... | 🔵 7.0 | ContentIdea KB |
| 29 | You created a device configuration profile for Android that contains a list of prohibited apps. T... | The reporting of prohibited apps is posted to a dedicated node, separate from... | This is how to monitor restrictive apps: Login to https://portal.azure.com. On the Intune blade, ... | 🔵 7.0 | ContentIdea KB |
| 30 | Windows 10 Device Configuration Profile->Settings->Networkboundary allows you for Boundary Type o... | When IPv4 format of "###.###.###.###-###.###.###.###" is used the UI should n... | Issue resolved with Intune 1218 release completed by end of December 2018. | 🔵 7.0 | ContentIdea KB |
| 31 | Apps installed in Android Enterprise either crash or do not let you set certain permissions. For ... | From what we have seen so far, a policy for Android Enterprise work profile t... | Option 1: Set this to Device default and resync the devices and try to run the app again. This wo... | 🔵 7.0 | ContentIdea KB |
| 32 | After switching Device Configuration workload to Intune in co-management, Resource Access and End... | By design, Device Configuration workload has a dependency on Resource Access ... | This is expected behavior. When switching Device Configuration workload to Intune, Resource Acces... | 🔵 7.0 | OneNote |
| 33 | Feature updates never offered on Intune-managed Windows 10 v1709+. Servicing/definition updates w... | Microsoft Account sign-in assistant (MSA/wlidsvc) service disabled via Intune... | In Intune admin center > Device configuration > Profiles > Device restrictions > Cloud and Storag... | 🔵 6.5 | MS Learn |
| 34 | Skype for Business on Android Enterprise does not save SIP address and password after app close o... | Intune device restriction Add and Remove accounts set to Block prevents crede... | In Device configuration > Profiles > Device restrictions > Work profile settings, change Add and ... | 🔵 5.5 | MS Learn |
| 35 | Intune Endpoint Protection engine unavailable, features disabled (real-time protection, download ... | Endpoint protection engine corrupted/deleted, features disabled by admin via ... | Engine unavailable: force update or uninstall/reinstall Endpoint Protection Agent (auto-reinstall... | 🔵 5.5 | MS Learn |
