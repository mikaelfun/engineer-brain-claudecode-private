# Intune Co-Management / SCCM / ConfigMgr — 排查工作流

**来源草稿**: ado-wiki-Tenant-Attach.md, onenote-comanagement-admin-guide.md, onenote-comanagement-workload-flags.md, onenote-deploy-sccm-via-intune-cmg.md, onenote-sccm-verbose-log-collection.md
**Kusto 引用**: comanagement.md
**场景数**: 9
**生成日期**: 2026-04-07

---

## Scenario 1: Prerequisites
> 来源: onenote-comanagement-admin-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Azure AD Premium
- EMS or Intune license for all users
- Configuration Manager version 1710 or later
- Hybrid AAD joined or AAD joined devices
- MDM authority must be Intune
- Windows 10 1709+

## Two Paths to Co-management

1. **Existing ConfigMgr clients**: Windows 10 devices already managed by ConfigMgr → set up hybrid AAD → enroll into Intune
2. **New internet-based devices**: Join Azure AD → auto-enroll to Intune → install ConfigMgr client

## Enable Co-management in SCCM

1. Administration workspace → Cloud Services → Co-management node → Configure co-management
2. Sign in with Intune-licensed account
3. Automatic enrollment options:
   - **All**: All ConfigMgr clients auto-enrolled to Intune
   - **Pilot**: Only pilot collection members auto-enrolled

## Switch Workloads

- **Configuration Manager**: CM continues to manage
- **Pilot Intune**: Switch only for pilot collection devices
- **Intune**: Switch for all co-managed Windows 10 devices

> **Key difference**: Pilot Intune = only pilot collection. Intune = pilot + all other co-managed devices.

## Scenario 2: Requirements
> 来源: onenote-comanagement-admin-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Azure subscription
- On-premises Windows server for CMG connection point
- Service connection point in online mode
- Server authentication certificate
- Clients must use IPv4

## Scenario 3: Data Flow
> 来源: onenote-comanagement-admin-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Service connection point → Azure (HTTPS 443)
2. CMG connection point → CMG (TCP-TLS/HTTPS)
3. Client → CMG (HTTPS 443)
4. CMG → on-premises CMG connection point
5. CMG connection point → management point / software update point

## Scenario 4: Setup Steps
> 来源: onenote-comanagement-admin-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Create CMG: Administration → Cloud Services → Cloud Management Gateway
2. Azure Resource Manager deployment (v1802+)
3. Configure server auth certificate (.PFX)
4. Set region, resource group, VM instances (1-16)
5. Add client trusted root certificates if using PKI
6. Enable content distribution (v1806+)

## Scenario 5: CMG Troubleshooting Logs
> 来源: onenote-comanagement-admin-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `CloudMgr.log` — CMG deployment
- `CMGSetup.log` — CMG setup
- `CMGService.log` — CMG service health
- `SMS_Cloud_ProxyConnector.log` — proxy connector
- `CMGHttpHandler.log` — client traffic

## Scenario 6: Deploy CCM Client from Intune
> 来源: onenote-comanagement-admin-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Create Line of Business app with ccmsetup.msi and parameters:
```
CCMSETUPCMD="/NoCrlCheck CCMHOSTNAME=<CMG_FQDN>/CCM_Proxy_MutualAuth/8 SMSSiteCode=<SITECODE> AADRESOURCEURI=https://ConfigMgrService AADCLIENTAPPID=<APP_ID>"
```
Add `/NoCrlCheck` if CRL is not published.

## Key Log Files for Co-management

| Log | Purpose |
|-----|---------|
| CoManagementHandler.log | Co-management settings, enrollment |
| Scheduler.log | Task scheduling |
| SettingsAgent.log | Settings processing |
| CIAgent.log | Resource Access workload |
| WUAHandler.log | Windows Update workload |
| CompReplayAgent.log | Compliance replay |
| EndpointProtectionAgent.log | EP workload |

## Verify Hybrid AAD with dsregcmd

```cmd
dsregcmd /status
```

Key fields to check:
- `AzureAdJoined: YES` — device is AAD joined
- `AzureAdPrt: YES` — user has Primary Refresh Token (required for auto-enrollment)
- `DomainJoined: YES` — device is on-premises domain joined

## Scenario 7: GPO-based MDM Auto-enrollment
> 来源: onenote-comanagement-admin-guide.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Scheduled task path: Computer Configuration → Policies → Administrative Templates → Windows Components → MDM → Auto MDM Enrollment with AAD Token

## Scenario 8: CMG Client Location
> 来源: onenote-comanagement-admin-guide.md | 适用: Mooncake ✅

### 排查步骤

- Clients get CMG location automatically on next location request (24h cycle)
- Force refresh: restart SMS Agent Host service (ccmexec.exe)
- Force CMG always: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\CCM\Security → ClientAlwaysOnInternet = 1`
- Verify: `Get-WmiObject -Namespace Root\Ccm\LocationServices -Class SMS_ActiveMPCandidate | Where-Object {$_.Type -eq "Internet"}`

## Workload Determination (WMI)

```
WMI: root\ccm\clientSDK
Class: CCM_ClientUtilities
Method: IsSCCMWorkloadEnabledForStr
Parameter: isSCCMEnabled
Log: CCMSDKProvider.log
```

## 21v Applicability

Applicable with caveats — CMG in 21v requires China Azure deployment.

## Scenario 9: Steps
> 来源: onenote-sccm-verbose-log-collection.md | 适用: Mooncake ✅

### 排查步骤

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
   MdmDiagnosticsTool.exe -area DeviceEnrollment -cab c:\temp\mdmdiag.cab
   ```

## 21v Applicability

Fully applicable — same procedure for Mooncake environments.

---

## Kusto 查询参考

### 查询 1: Comanagement 事件查询

```kql
IntuneEvent
| where * contains '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, DeviceId, EventUniqueName, ServiceName, 
    ComponentName, ColMetadata, Col1, Col2, Col3, Message
| order by env_time asc
```
`[来源: comanagement.md]`

### 查询 2: HttpSubsystem 查询

```kql
HttpSubsystem
| where * contains '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, TaskName, httpVerb, url, statusCode, 
    collectionName, accountId
| order by env_time asc
```
`[来源: comanagement.md]`

### 查询 3: CMService 查询

```kql
CMService
| where ActivityId == '{deviceId}'
| where env_time between (datetime({startTime})..datetime({endTime}))
| project env_time, ActivityId, *
| order by env_time asc
```
`[来源: comanagement.md]`

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
