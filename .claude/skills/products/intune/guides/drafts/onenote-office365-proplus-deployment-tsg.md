# Office 365 ProPlus Deployment Troubleshooting via Intune

> Source: Case 2307190040000755 | Intune Office365 ProPlus deployment
> Status: draft (pending SYNTHESIZE review)

## Step 1: Verify Policy Delivery (Kusto)

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

## Step 2: Check ODT Files on Client

Location: `C:\Windows\Temp`

If application set as "Available", expect 2 ODT files:
- `odtXXXX.exe`
- `odtXXXX.temp` (0 bytes)

## Step 3: Manual ODT Installation Test

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

## Step 4: Log Collection

| Log Location | Log Name | Generator |
|---|---|---|
| `%temp%` | `MACHINENAME-yyyymmdd-tttt.log`, `Officec2rclient.exe_*` | User-context processes |
| `%windir%\temp` | `MACHINENAME-yyyymmdd-tttt.log`, `Officeclicktorun.exe_streamserver*` | SYSTEM account processes |

## ODT Customization

Use: https://config.office.com/deploymentsettings

## Escalation

If ODT manual install fails or takes excessive time downloading, separate case to Office team (Office installation issue, not Intune).
