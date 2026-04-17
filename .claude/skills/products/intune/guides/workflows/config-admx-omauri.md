# Intune ADMX / OMA-URI / Settings Catalog — 排查工作流

**来源草稿**: ado-wiki-b-SyncML-Viewer.md, mslearn-deploy-oma-uris-csp.md, onenote-admx-backed-policy-deployment.md, onenote-admx-backed-policy.md, onenote-chrome-homepage-admx-intune.md, onenote-chrome-homepage-admx-omauri.md, onenote-chrome-homepage-admx-policy.md, onenote-syncml-diagnostic-tools.md, onenote-syncml-status-codes.md, onenote-vpn-custom-oma-uri.md
**Kusto 引用**: policy-error.md
**场景数**: 40
**生成日期**: 2026-04-07

---

## Scenario 1: CSP Scope
> 来源: mslearn-deploy-oma-uris-csp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **User scope**: `./User/Vendor/MSFT/Policy/Config/AreaName/PolicyName`
- **Device scope**: `./Device/Vendor/MSFT/Policy/Config/AreaName/PolicyName`
- Scope is dictated by the platform, not MDM provider
- Reference: [CSP documentation](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-configuration-service-provider)

## Scenario 2: Architecture Flow
> 来源: mslearn-deploy-oma-uris-csp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. OMA-URI = payload (setting path + value)
2. Custom policy = container in Intune
3. Intune = delivery mechanism (OMA-DM protocol, XML-based SyncML)
4. CSP on client = reads and applies settings (typically registry keys)

## Scenario 3: Built-in vs Custom
> 来源: mslearn-deploy-oma-uris-csp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Built-in Intune profiles use the same underlying mechanism but with friendly UI
- Use built-in settings whenever possible; custom OMA-URI only for unavailable options

## Policy Behavior Notes

- Policy changes pushed automatically to device
- **Removing policy assignment may NOT revert settings to default** (no tattoo removal)
- Exceptions: Wi-Fi, VPN, certificate, and email profiles ARE removed when unassigned
- Behavior controlled by each CSP

## Scenario 4: Common Issue Categories
> 来源: mslearn-deploy-oma-uris-csp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Custom policy did not reach the client
2. Policy reached client but expected behavior not observed

## Scenario 5: Diagnostic Steps
> 来源: mslearn-deploy-oma-uris-csp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. **Check MDM diagnostic logs** on the device
2. **Check Windows Event Log**: `DeviceManagement-Enterprise-Diagnostics-Provider > Admin`
3. Both logs should reference the custom policy/OMA-URI
4. No reference = policy not delivered → verify configuration and group targeting
5. Error entries may indicate OMA-URI syntax problems

## Scenario 6: Common Causes of Failure
> 来源: mslearn-deploy-oma-uris-csp.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Incorrect OMA-URI string syntax
- Wrong CSP scope (user vs device)
- Policy assigned to wrong group
- CSP not supported on target Windows version

## Migration from Group Policy

- Use MDM Migration Analysis Tool (MMAT) to analyze existing GPO settings
- MMAT generates report showing MDM equivalents for each GPO
- Key mapping: Domain Controllers → MDM server (Intune), Sysvol → Intune DB, CSE → CSPs, SMB → HTTPS, .pol → SyncML

## Scenario 7: 1. Find the Policy CSP
> 来源: onenote-admx-backed-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Search the corresponding CSP in Policy CSP docs. Example for `BootStartDriverInitialization`:
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/System/BootStartDriverInitialization`
- Determine scope: `./User` or `./Device`
- Locate ADMX name and policy name from CSP docs (e.g., `earlylauncham.admx`, policy `POL_DriverLoadPolicy_Name`)

## Scenario 8: 2. Get the ADMX Source File
> 来源: onenote-admx-backed-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- If ADMX ships with Windows: copy from `%SystemRoot%\policydefinitions`
- If custom: obtain from vendor

## Scenario 9: 3. Ingest ADMX via Intune
> 来源: onenote-admx-backed-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

OMA-URI for ingestion:
```
./Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/{appname}/Policy/admxfile01
```
- `{appname}` = ADMX filename without extension (e.g., `earlylauncham`)
- Data Type: String
- Value: Full content of the .admx file (copy from Notepad++)

## Scenario 10: 4. Configure Specific Settings
> 来源: onenote-admx-backed-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Check element type from ADMX content: Text, MultiText, Boolean, Enum, Decimal, or List
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/{Area}/{PolicyName}`
- Value format: `<enabled/><data id="{elementId}" value="{value}"/>`

Example:
```xml
<enabled/><data id="SelectDriverLoadPolicy" value="8"/>
```

## Scenario 11: 5. Verify Deployment
> 来源: onenote-admx-backed-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

#### Client Side
1. **Access Work or School** > Info > check policy listed
2. **Registry locations**:
   - `HKLM\Software\Microsoft\PolicyManager\Providers\{ProviderGUID}\default\Device\{Area}`
   - `HKLM\Software\Microsoft\Provisioning\NodeCache\CSP\Device\MS DM Server\Nodes\{NodeId}`

#### MDM Diagnostic Log
- Export from Settings > Access Work or School > Export management log
- Check `EndtraceRegistry.txt` for policy values

#### Kusto Query
```kql
DeviceManagementProvider
| where env_time > ago(2d)
| where ActivityId == "<deviceId>"
| where message contains "<keyword>"
| project env_time, ActivityId, deviceId, PolicyName=name, PolicyType=typeAndCategory,
          Applicability=applicablilityState, Compliance=reportComplianceState, TaskName, EventId, EventMessage, message
| order by env_time asc
```
`[来源: onenote-admx-backed-policy-deployment.md]`

## Scenario 12: Known Limitations
> 来源: onenote-admx-backed-policy-deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Some CSPs are **Enterprise/Education edition only** (e.g., AppVirtualization) - Professional edition shows "Not applicable"
- Always verify CSP edition support before deploying

## References
- Understanding ADMX-backed policies: https://docs.microsoft.com/en-us/windows/client-management/mdm/understanding-admx-backed-policies
- Enable ADMX-backed policies: https://docs.microsoft.com/en-us/windows/client-management/mdm/enable-admx-backed-policies-in-mdm

## Scenario 13: 1. Find the GPO Configuration
> 来源: onenote-admx-backed-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Identify the GPO location (e.g., Computer Configuration/Administrative Template/...)
- Note the OMA-URI path (e.g., `./Device/Vendor/MSFT/Policy/Config/System/BootStartDriverInitialization`)

## Scenario 14: 2. Confirm ADMX Source File Exists
> 来源: onenote-admx-backed-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Check `%SystemRoot%\policydefinitions` for the .admx file
- Find the ADMX name from Policy CSP documentation
- Determine scope: `./user` vs `./device`

## Scenario 15: 3. Install ADMX File via Intune (if not inbox)
> 来源: onenote-admx-backed-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

If the ADMX is not present on target devices:
- Copy all content from .admx file
- Create custom OMA-URI profile:
  - **OMA-URI**: `./Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/{admxname}/Policy/admxfile01`
  - **Data type**: String
  - **Value**: Full XML content of the .admx file

## Scenario 16: Known Issues
> 来源: onenote-admx-backed-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **Windows Professional edition**: Certain ADMX-backed CSP policies are only supported on Enterprise/Education editions. Deployment will fail on Professional SKU.

## References
- [Understanding ADMX-backed policies](https://docs.microsoft.com/en-us/windows/client-management/mdm/understanding-admx-backed-policies)
- [Enable ADMX-backed policies in MDM](https://docs.microsoft.com/en-us/windows/client-management/mdm/enable-admx-backed-policies-in-mdm)

## Scenario 17: 1. Get Chrome ADMX Template
> 来源: onenote-chrome-homepage-admx-intune.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Download latest Chrome ADMX from: [Chrome Enterprise](https://chromeenterprise.google/browser/download/#manage-policies-tab)

## Scenario 18: 2. Ingest ADMX Template into Intune
> 来源: onenote-chrome-homepage-admx-intune.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Go to **Intune** > **Device Configuration** > **Profiles** > **Create profile**
2. Platform: **Windows 10 and later**, Profile type: **Custom**
3. Add row:
   - **OMA-URI**: `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/Chrome/Policy/ChromeAdmx`
   - **Data type**: String
   - **Value**: Paste the full content of `chrome.admx`

## Scenario 19: 3. Find Required Registry Keys
> 来源: onenote-chrome-homepage-admx-intune.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

On a device with chrome.admx imported, open `regedit.exe` and navigate to:
`HKLM\SOFTWARE\Microsoft\PolicyManager\ADMXDefault`

## Scenario 20: 4. Configure Settings (4 OMA-URI rows)
> 来源: onenote-chrome-homepage-admx-intune.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

**HomepageIsNewTabPage** (Disable new tab as homepage):
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageIsNewTabPage`
- Data type: String
- Value: `<disabled/>`

**HomepageLocation** (Set homepage URL):
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageLocation`
- Data type: String
- Value:
  ```xml
  <enabled/>
  <data id="HomepageLocation" value="https://your-homepage-url.com"/>
  ```

**RestoreOnStartup** (Open specific pages on startup):
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartup`
- Data type: String
- Value:
  ```xml
  <enabled/>
  <data id="RestoreOnStartup" value="4"/>
  ```

**RestoreOnStartupURLs** (Startup page URLs):
- OMA-URI: `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartupURLs`
- Data type: String
- Value:
  ```xml
  <enabled/>
  <data id="RestoreOnStartupURLsDesc" value="1&#xF000;https://your-homepage-url.com"/>
  ```

## Scenario 21: 5. Verify
> 来源: onenote-chrome-homepage-admx-intune.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

After deployment, open `chrome://policy` on the target device to confirm policies are applied.

## Notes

- This same ADMX ingestion pattern works for any third-party ADMX template (Firefox, Adobe, etc.)
- Replace `https://your-homepage-url.com` with the actual desired URL
- RestoreOnStartup value 4 = "Open a list of URLs"
- If copy-pasting causes errors, check for smart quotes vs straight quotes

## Scenario 22: 1. Get Chrome ADMX File
> 来源: onenote-chrome-homepage-admx-omauri.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Download from: [Chrome Enterprise](https://chromeenterprise.google/browser/download/#manage-policies-tab)

## Scenario 23: 3. Determine Registry Keys
> 来源: onenote-chrome-homepage-admx-omauri.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

On a device with chrome.admx imported, check: `HKLM\SOFTWARE\Microsoft\PolicyManager\ADMXDefault` to see Chrome setting categories.

## Scenario 24: 4. Configure Settings
> 来源: onenote-chrome-homepage-admx-omauri.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Create 4 OMA-URI settings in the custom profile:

**HomepageIsNewTabPage** (disable):
```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageIsNewTabPage
Data type: String
Value: <disabled/>
```

**HomepageLocation**:
```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageLocation
Data type: String
Value:
<enabled/>
<data id="HomepageLocation" value="https://your-homepage-url.com"/>
```

**RestoreOnStartup** (value 4 = open specific URLs):
```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartup
Data type: String
Value:
<enabled/>
<data id="RestoreOnStartup" value="4"/>
```

**RestoreOnStartupURLs**:
```
OMA-URI: ./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartupURLs
Data type: String
Value:
<enabled/>
<data id="RestoreOnStartupURLsDesc" value="1&#xF000;https://your-homepage-url.com"/>
```

> **Note**: Use `&#xF000;` as delimiter for multiple URL entries.

## Scenario 25: 5. Validate
> 来源: onenote-chrome-homepage-admx-omauri.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

After deployment, verify in Chrome at `chrome://policy` to confirm policies are applied.

## References

- [Manage Chrome Browser with Microsoft Intune](https://support.google.com/chrome/a/answer/9102677)
- CSP: `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall`

## Scenario 26: Prerequisites
> 来源: onenote-chrome-homepage-admx-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Download the latest Chrome ADMX template from [Chrome Enterprise](https://chromeenterprise.google/browser/download/#manage-policies-tab)
- Intune license with custom profile support

## Scenario 27: Step 1: Ingest Chrome ADMX Template
> 来源: onenote-chrome-homepage-admx-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Create Intune custom profile:

| Field | Value |
|-------|-------|
| Platform | Windows 10 and later |
| Profile type | Custom |
| OMA-URI | `./Device/Vendor/MSFT/Policy/ConfigOperations/ADMXInstall/Chrome/Policy/ChromeAdmx` |
| Data type | String |
| Value | *(paste full content of chrome.admx file)* |

## Scenario 28: Step 2: Identify Registry Keys
> 来源: onenote-chrome-homepage-admx-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

On a machine with Chrome ADMX imported:
1. Open `regedit.exe`
2. Navigate to `HKLM\SOFTWARE\Microsoft\PolicyManager\ADMXDefault`
3. Browse Chrome setting categories

## Scenario 29: HomepageIsNewTabPage (Disable)
> 来源: onenote-chrome-homepage-admx-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Field | Value |
|-------|-------|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageIsNewTabPage` |
| Data type | String |
| Value | `<disabled/>` |

## Scenario 30: HomepageLocation
> 来源: onenote-chrome-homepage-admx-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Field | Value |
|-------|-------|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/HomepageLocation` |
| Data type | String |
| Value | `<enabled/><data id="HomepageLocation" value="https://your-homepage.com"/>` |

## Scenario 31: RestoreOnStartup
> 来源: onenote-chrome-homepage-admx-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Field | Value |
|-------|-------|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartup` |
| Data type | String |
| Value | `<enabled/><data id="RestoreOnStartup" value="4"/>` |

## Scenario 32: RestoreOnStartupURLs
> 来源: onenote-chrome-homepage-admx-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Field | Value |
|-------|-------|
| OMA-URI | `./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Startup/RestoreOnStartupURLs` |
| Data type | String |
| Value | `<enabled/><data id="RestoreOnStartupURLsDesc" value="1&#xF000;https://your-homepage.com"/>` |

## Scenario 33: Step 4: Validate
> 来源: onenote-chrome-homepage-admx-policy.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

After deployment, verify in Chrome:
- Navigate to `chrome://policy` to see applied policies
- Check homepage behavior

## Notes

- RestoreOnStartup value `4` = Open a list of URLs
- Multiple startup URLs use `&#xF000;` as separator
- Quotes in XML values may cause errors — ensure proper XML escaping
- Reference: [Manage Chrome Browser with Intune](https://support.google.com/chrome/a/answer/9102677)

## Scenario 34: Downloads
> 来源: onenote-syncml-diagnostic-tools.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Internal: `\\shmsd\SHMSD\Readiness\Products\Azure\Intune\Tools\SyncmlViewer`
- Public (latest): [SyncMLViewer on GitHub](https://github.com/okieselbach/SyncMLViewer)

## Scenario 35: Capabilities
> 来源: onenote-syncml-diagnostic-tools.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Verify if settings/policies from Intune have been received
- See which CSPs are called when a policy is configured
- View CSP command internals (Get/Add/Delete/Replace)
- Send CSP commands manually to reproduce issues

## Scenario 36: Usage
> 来源: onenote-syncml-diagnostic-tools.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Deploy a new policy from Intune
2. Capture SyncML sessions in the **SyncML Messages** tab
3. View Source/Target in each message
4. Example: Msg 3 = Intune sends Get for Firewall status → Msg 4 = Device returns status 200, value 0
5. Save captured sessions for sharing/future research
6. Manual CSP commands: input/output in `dmtools/input.syncml` and `dmtools/out.xml`

## Scenario 37: References
> 来源: onenote-syncml-diagnostic-tools.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- [IntuneWiki SyncML Viewer](https://www.intunewiki.com/wiki/Windows_SyncML_Viewer)
- [Oliver Kieselbach - MDM monitoring](https://oliverkieselbach.com/2019/10/11/windows-10-mdm-client-activity-monitoring-with-syncml-viewer/)

## SyncML Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | ITEM_ADDED |
| 202 | FOR_PROCESSING |
| 204 | NO_CONTENT |
| 205 | RESET_CONTENT |
| 212 | AUTHENTICATION_ACCEPTED |
| 400 | BAD_REQUEST |
| 401 | INVALID_CREDENTIALS |
| 403 | FORBIDDEN |
| 404 | NOT_FOUND |
| 405 | COMMAND_NOT_ALLOWED |
| 406 | OPTIONAL_FEATURE_NOT_SUPPORTED |
| 409 | CONFLICT |
| 415 | UNSUPPORTED_MEDIA_TYPE_OR_FORMAT |
| 418 | ALREADY_EXISTS |
| 500 | COMMAND_FAILED |
| 503 | SERVICE_UNAVAILABLE |
| 507 | ATOMIC_FAILED |
| 508 | REFRESH_REQUIRED |
| 516 | ATOMIC_ROLLBACK_FAILED |

Full list: 101-517 range covers progress, success, redirects, client errors, and server errors.

## WMI Tester (wbemtest) for MDM CSPs

Query MDM CSPs locally using Windows Management Instrumentation:

1. Run `wbemtest` with admin permissions
2. Connect to namespace: `root\cimv2\mdm\dmmap`
3. Choose **Enum Classes** (Recursive)
4. Find WMI class for the policy (e.g., `MDM_Policy_Config01_DeviceLock02`)

Reference: [How to use PowerShell to run any MDM CSP locally](https://deviceadvice.io/2019/04/26/powershell-run-mdm-csps-locally/)

---
*Source: OneNote — SyncML, SyncML response status code, Troubleshoot SyncML, Windows Management Instrumentation Tester*

## Scenario 38: Client Error Codes (4xx) - Most Common in Troubleshooting
> 来源: onenote-syncml-status-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Name | Notes |
|------|------|-------|
| 400 | BAD_REQUEST | Invalid request format |
| 401 | INVALID_CREDENTIALS | Auth failure |
| 403 | FORBIDDEN | Access denied |
| **404** | **NOT_FOUND** | **CSP node does not exist - very common** |
| 405 | COMMAND_NOT_ALLOWED | Command not supported for this node |
| 406 | OPTIONAL_FEATURE_NOT_SUPPORTED | Feature not available |
| 408 | REQUEST_TIMEOUT | Request timed out |
| 409 | CONFLICT | Conflict detected |
| **418** | **ALREADY_EXISTS** | **Node already exists (Add fails)** |
| 419 | CONFLICT_RESOLVED_WITH_SERVER_DATA | Server data wins |
| 420 | DEVICE_FULL | Device storage full |
| 425 | PERMISSION_DENIED_ACL | ACL permission denied |

## Scenario 39: Server Error Codes (5xx)
> 来源: onenote-syncml-status-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Code | Name | Notes |
|------|------|-------|
| **500** | **COMMAND_FAILED** | **Generic command failure** |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |
| **507** | **ATOMIC_FAILED** | **Atomic transaction failed** |
| 508 | REFRESH_REQUIRED | Refresh needed |
| **516** | **ATOMIC_ROLLBACK_FAILED** | **Atomic rollback also failed** |
| 517 | ATOMIC_RESPONSE_TOO_LARGE | Response too large |

## Scenario 40: Common Troubleshooting Patterns
> 来源: onenote-syncml-status-codes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- **418 + 404 in Sequence**: PauseQualityUpdates Add returns 418 (AlreadyExists), then Rollback returns 404 (NotFound) - indicates rollback prerequisites not met
- **500 for policy delivery**: Check if CSP URI is correct and supported on device OS version
- **405**: Command type (Add vs Replace) mismatch for the target CSP node

---

## Kusto 查询参考

### 查询 1: 发现策略错误概览

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
`[来源: policy-error.md]`

### 查询 2: 查看错误详细消息

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
`[来源: policy-error.md]`

### 查询 3: 评估影响范围

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
`[来源: policy-error.md]`

### 查询 4: 错误时间线分析

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
`[来源: policy-error.md]`

### 查询 5: 查询已撤销的策略

```kql
DeviceManagementProvider
| where SourceNamespace == "IntuneCNP" 
| where env_time >= now(-10d)
| where EventMessage contains "Tattoo removed for - AccountID: '{accountId}'; DeviceID: '{deviceId}'" 
| project env_time, EventMessage
```
`[来源: policy-error.md]`

### 查询 6: Tattoo 状态检查

```kql
DeviceManagementProvider
| where env_time >= ago(1d)
| where ActivityId == '{deviceId}'
| where message contains "Tattoo"
| project env_time, ActivityId, cV, message
```
`[来源: policy-error.md]`

### 查询 7: Tattoo 相关事件 (IntuneEvent)

```kql
IntuneEvent
| where env_time > ago(1d)
| where ActivityId contains '{deviceId}'
| where * contains "Tattoo"
| project ActivityId, env_time, ComponentName, EventUniqueName, 
    ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, AccountId, UserId, DeviceId
```
`[来源: policy-error.md]`

---

## 判断逻辑参考

### SyncML Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | ITEM_ADDED |
| 202 | FOR_PROCESSING |
| 204 | NO_CONTENT |
| 205 | RESET_CONTENT |
| 212 | AUTHENTICATION_ACCEPTED |
| 400 | BAD_REQUEST |
| 401 | INVALID_CREDENTIALS |
| 403 | FORBIDDEN |
| 404 | NOT_FOUND |
| 405 | COMMAND_NOT_ALLOWED |
| 406 | OPTIONAL_FEATURE_NOT_SUPPORTED |
| 409 | CONFLICT |
| 415 | UNSUPPORTED_MEDIA_TYPE_OR_FORMAT |
| 418 | ALREADY_EXISTS |
| 500 | COMMAND_FAILED |
| 503 | SERVICE_UNAVAILABLE |
| 507 | ATOMIC_FAILED |
| 508 | REFRESH_REQUIRED |
| 516 | ATOMIC_ROLLBACK_FAILED |

### Client Error Codes (4xx) - Most Common in Troubleshooting

| Code | Name | Notes |
|------|------|-------|
| 400 | BAD_REQUEST | Invalid request format |
| 401 | INVALID_CREDENTIALS | Auth failure |
| 403 | FORBIDDEN | Access denied |
| **404** | **NOT_FOUND** | **CSP node does not exist - very common** |
| 405 | COMMAND_NOT_ALLOWED | Command not supported for this node |
| 406 | OPTIONAL_FEATURE_NOT_SUPPORTED | Feature not available |
| 408 | REQUEST_TIMEOUT | Request timed out |
| 409 | CONFLICT | Conflict detected |
| **418** | **ALREADY_EXISTS** | **Node already exists (Add fails)** |
| 419 | CONFLICT_RESOLVED_WITH_SERVER_DATA | Server data wins |
| 420 | DEVICE_FULL | Device storage full |
| 425 | PERMISSION_DENIED_ACL | ACL permission denied |

### Server Error Codes (5xx)

| Code | Name | Notes |
|------|------|-------|
| **500** | **COMMAND_FAILED** | **Generic command failure** |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |
| **507** | **ATOMIC_FAILED** | **Atomic transaction failed** |
| 508 | REFRESH_REQUIRED | Refresh needed |
| **516** | **ATOMIC_ROLLBACK_FAILED** | **Atomic rollback also failed** |
| 517 | ATOMIC_RESPONSE_TOO_LARGE | Response too large |

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
