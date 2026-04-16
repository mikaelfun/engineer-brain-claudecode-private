# Intune Office / M365 应用部署 — 排查工作流

**来源草稿**: ado-wiki-Office-C2R-Deployment.md, onenote-m365-office-proplus-deployment-tsg.md, onenote-office365-proplus-deployment-tsg.md
**Kusto 引用**: (无)
**场景数**: 16
**生成日期**: 2026-04-07

---

## Scenario 1: Deployment Scenarios (search `Set executing scenario to` in logs)
> 来源: ado-wiki-Office-C2R-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Scenario | Trigger | Description |
|---|---|---|
| INSTALL | OfficeCSP push or manual ODT `/configure` | First-time deployment |
| UPDATE | Automatic detection or forced `/update` | Delta update |
| REPAIR | User/admin-initiated online repair | Re-downloads full installation |

## Scenario 2: Intune Deployment Flow
> 来源: ado-wiki-Office-C2R-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Device syncs with Intune, receives Office CSP policy via SyncML
2. Device downloads ODT from `officecdn.microsoft.com`
3. Two directories appear: `C:\Program Files\Microsoft Office` and `Microsoft Office 15`
4. Required = auto silent install; Available = Company Portal manual trigger
5. Downloaded files cleaned up after success

## Scenario 3: Prerequisites
> 来源: ado-wiki-Office-C2R-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Windows 10 1703+
- No MSI-based Office (or enable Remove MSI)
- No Office apps open during installation
- Only one M365 deployment per device
- For Autopilot ESP: deploy M365 Apps as Win32 app (not Microsoft 365 Apps type)

## Scenario 4: Verbose Logging
> 来源: ado-wiki-Office-C2R-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```
reg add HKLM\SOFTWARE\Microsoft\ClickToRun\OverRide /v LogLevel /t REG_DWORD /d 3
```
Logs: `%WINDIR%\Temp\` and `%TEMP%\`, pattern `{MachineName}-{Timestamp}.log`

## Log File Locations

| Type | Location | Pattern |
|---|---|---|
| C2R Verbose | `%WINDIR%\Temp\` / `%TEMP%\` | `COMPUTERNAME-YYYYMMDD-HHMM[a-z].log` |
| OfficeCSP Registry | `HKLM\SOFTWARE\Microsoft\OfficeCSP` | Status codes, XML config |
| DO Log | PowerShell `Get-DeliveryOptimizationLog` | Job GUIDs, peer counts |

## Scenario 5: ODC ZIP Relevant Paths
> 来源: ado-wiki-Office-C2R-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- `Intune\Files\MSI Logs\` - C2R verbose logs
- `Intune\RegistryKeys\` - OfficeCSP registry
- `Intune\Commands\General\` - DO log

## Scenario 6: 5-Stage Deployment Pipeline
> 来源: ado-wiki-Office-C2R-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Stage | Name | Key Evidence |
|---|---|---|
| 0 | Policy Delivery | OfficeCSP registry: GUID subkey, Status code |
| 1 | Bootstrap | C2R logs: CollectParameters, `/configure` mode |
| 2 | Download Init | C2R logs: `ShowPrereqFailureDialog`, `SetupFailedPreReq` |
| 3 | Payload Transfer | DO logs: job completions, error codes |
| 4 | Cache & Install | C2R logs: streaming/integration, HRESULT codes |

## CSP Status Codes

| Code | Meaning | Action |
|---|---|---|
| 0 | Success | Verify version matches target |
| 997 | Installing (IO_PENDING) | Investigate if stuck >24h |
| 70 | Failed | Terminal. Correlate with C2R logs |
| 1603 | Prereq/Fatal Error | Product conflict or architecture mismatch |
| 13 | Invalid Data | Cannot verify ODT signature |
| 1460 | Timeout | Failed to download ODT |
| 17002 | Failed to complete | User canceled, another install, disk space |
| 17004 | Unknown SKU | Content not on CDN or signature check failed |

## Scenario 7: Error Code Reference
> 来源: ado-wiki-Office-C2R-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| HRESULT | Name | Resolution |
|---|---|---|
| 0x80070005 | Access Denied | AV blocking. Add Office exclusions |
| 0x80070020 | Sharing Violation | Close all Office apps |
| 0x80070643 | Fatal Install Error | Check CBS logs |
| 0x80070bc9 | Servicing Store Corruption | `DISM /Online /Cleanup-Image /RestoreHealth` |
| 0x800706be | RPC Failure | Restart ClickToRunSvc |

## Channel GUID Reference

| GUID | Channel |
|---|---|
| `492350f6-3a01-4f97-b9c0-c7c6ddf67d60` | Current Channel |
| `64256afe-f5d9-4f86-8936-8840a6a4f5be` | Current Channel (Preview) |
| `55336b82-a18d-4dd6-b5f6-9e5095c314a6` | Monthly Enterprise Channel |
| `7ffbc6bf-bc32-4f92-8982-f9dd17fd3114` | Semi-Annual Enterprise Channel |
| `f2e724c1-748f-4b47-8fb8-8e0d210e9208` | LTSC 2021 |
| `2e148de9-61c8-4051-b103-4af54baffbb4` | LTSC 2024 |

## Scenario 8: Step-by-Step Triage Workflow
> 来源: ado-wiki-Office-C2R-Deployment.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Collect logs (ODC ZIP or manual: C2R verbose + OfficeCSP registry + DO log)
2. Check OfficeCSP status code (0=Success, 70=Failed)
3. Verify prerequisites (no MSI Office, Windows 10 1703+, no apps open)
4. Identify scenario (`Set executing scenario to`)
5. Check hard blocks (`ShowPrereqFailureDialog` / `PrereqsFailed`)
6. Check ODT-level errors (missing `Microsoft Office` folders)
7. Analyze DO transport (DownloadMode, error codes; 2090 is informational)
8. Check HRESULT errors in C2R logs
9. Verify channel alignment (Configuration vs policy)
10. Document and escalate with stage, root cause, HRESULT, timestamps

## Scenario 9: Step 1: Confirm Policy Applied via Kusto
> 来源: onenote-m365-office-proplus-deployment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kql
DeviceManagementProvider 
| where env_time > ago(5d) 
| where ActivityId == "<Device ID>"
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory,
         enrollmentTime, Applicability=applicablilityState, Compliance=reportComplianceState,
         isManaged, isCompliant, TaskName, EventId, EventMessage, message 
| order by env_time asc
```
`[来源: onenote-m365-office-proplus-deployment-tsg.md]`

Look for message containing "OfficeClickToRun" or "OfficeInstallerCIMObject" entries.

## Scenario 10: Step 2: Verify ODT File on Client
> 来源: onenote-m365-office-proplus-deployment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Location: `C:\Windows\Temp`
- If app set as "Available": expect 2 ODT files (odtxxx.exe + odtxxx.temp with 0 bytes)

## Scenario 11: Step 3: Manual ODT Install Test
> 来源: onenote-m365-office-proplus-deployment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Enable Office verbose logging:
   ```cmd
   reg add HKLM\SOFTWARE\Microsoft\ClickToRun\OverRide /v LogLevel /t REG_DWORD /d 3
   ```
2. Download latest ODT: https://www.microsoft.com/en-us/download/details.aspx?id=49117
3. Customize configuration.xml with local Source path
4. Download offline package: `setup.exe /download configuration.xml`
5. Install: `setup.exe /configure configuration.xml`
6. If Step 5 fails -> escalate to Office team (Office installation issue)

## Scenario 12: Step 4: Collect Logs
> 来源: onenote-m365-office-proplus-deployment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Enable additional download logging:
```cmd
reg add HKLM\SOFTWARE\Microsoft\ClickToRun\OverRide /v PipelineLogging /t REG_DWORD /d 1
```

| Log Location | Log Name | Generator |
|-------------|----------|-----------|
| %temp% | MACHINENAME-yyyymmdd-tttt.log, Officec2rclient.exe_* | User processes (OfficeC2RClient.exe) |
| %windir%\temp | MACHINENAME-yyyymmdd-tttt.log, Officeclicktorun.exe_* | SYSTEM processes (OfficeClickToRun.exe, Integrator.exe) |

## Tip: Company Portal Status Stuck
If M365 app deployed as Available shows unexpected status in Company Portal:
- Status read from: `HKLM\SOFTWARE\Microsoft\OfficeCSP\{INSTALLATION_ID}`
- Fix: backup registry key -> remove it -> restart device (status changes from "install" to "not install")

## Scenario 13: Step 1: Verify Policy Delivery (Kusto)
> 来源: onenote-office365-proplus-deployment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```kusto
DeviceManagementProvider
| where env_time > ago(5d)
| where ActivityId == "<Device ID>"
| where EventId == 5786
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory,
          enrollmentTime, Applicability=applicablilityState,
          Compliance=reportComplianceState, isManaged, isCompliant,
          TaskName, EventId, EventMessage, message
| order by env_time asc
```

## Scenario 14: Step 2: Check ODT Files on Client
> 来源: onenote-office365-proplus-deployment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

Location: `C:\Windows\Temp`

If application set as "Available", expect 2 ODT files:
- `odtXXXX.exe`
- `odtXXXX.temp` (0 bytes)

## Scenario 15: Step 3: Manual ODT Installation Test
> 来源: onenote-office365-proplus-deployment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Enable verbose logging:
   ```
   reg add HKLM\SOFTWARE\Microsoft\ClickToRun\OverRide /v LogLevel /t REG_DWORD /d 3
   ```
   For download issues:
   ```
   reg add HKLM\SOFTWARE\Microsoft\ClickToRun\OverRide /v PipelineLogging /t REG_DWORD /d 1
   ```

2. Download latest ODT from [Microsoft](https://www.microsoft.com/en-us/download/details.aspx?id=49117)
3. Customize `configuration.xml` with local source path if needed
4. Download offline package, then install

## Scenario 16: Step 4: Log Collection
> 来源: onenote-office365-proplus-deployment-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

| Log Location | Log Name | Generator |
|---|---|---|
| `%temp%` | `MACHINENAME-yyyymmdd-tttt.log`, `Officec2rclient.exe_*` | User-context processes |
| `%windir%\temp` | `MACHINENAME-yyyymmdd-tttt.log`, `Officeclicktorun.exe_streamserver*` | SYSTEM account processes |

## ODT Customization

Use: https://config.office.com/deploymentsettings

## Escalation

If ODT manual install fails or takes excessive time downloading, separate case to Office team (Office installation issue, not Intune).

---

## Kusto 查询参考

### Step 1: Verify Policy Delivery (Kusto)

```kql
DeviceManagementProvider
| where env_time > ago(5d)
| where ActivityId == "<Device ID>"
| where EventId == 5786
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory,
          enrollmentTime, Applicability=applicablilityState,
          Compliance=reportComplianceState, isManaged, isCompliant,
          TaskName, EventId, EventMessage, message
| order by env_time asc
```
`[来源: onenote-office365-proplus-deployment-tsg.md]`

---

## 判断逻辑参考

### CSP Status Codes

| Code | Meaning | Action |
|---|---|---|
| 0 | Success | Verify version matches target |
| 997 | Installing (IO_PENDING) | Investigate if stuck >24h |
| 70 | Failed | Terminal. Correlate with C2R logs |
| 1603 | Prereq/Fatal Error | Product conflict or architecture mismatch |
| 13 | Invalid Data | Cannot verify ODT signature |
| 1460 | Timeout | Failed to download ODT |
| 17002 | Failed to complete | User canceled, another install, disk space |
| 17004 | Unknown SKU | Content not on CDN or signature check failed |

### Error Code Reference

| HRESULT | Name | Resolution |
|---|---|---|
| 0x80070005 | Access Denied | AV blocking. Add Office exclusions |
| 0x80070020 | Sharing Violation | Close all Office apps |
| 0x80070643 | Fatal Install Error | Check CBS logs |
| 0x80070bc9 | Servicing Store Corruption | `DISM /Online /Cleanup-Image /RestoreHealth` |
| 0x800706be | RPC Failure | Restart ClickToRunSvc |
