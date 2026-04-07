---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## Common TSG/Intune M365 Office365 ProPlus deployment Troublesh.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune M365 (Office 365 ProPlus) Deployment Troubleshooting

**ODT XML Customization Tool**: https://config.office.com/deploymentsettings

## Step 1: Confirm Policy Applied via Kusto
```kql
DeviceManagementProvider 
| where env_time > ago(5d) 
| where ActivityId == "<Device ID>"
| project env_time, DeviceID=ActivityId, PolicyName=name, PolicyType=typeAndCategory,
         enrollmentTime, Applicability=applicablilityState, Compliance=reportComplianceState,
         isManaged, isCompliant, TaskName, EventId, EventMessage, message 
| order by env_time asc
```

Look for message containing "OfficeClickToRun" or "OfficeInstallerCIMObject" entries.

## Step 2: Verify ODT File on Client
- Location: `C:\Windows\Temp`
- If app set as "Available": expect 2 ODT files (odtxxx.exe + odtxxx.temp with 0 bytes)

## Step 3: Manual ODT Install Test
1. Enable Office verbose logging:
   ```cmd
   reg add HKLM\SOFTWARE\Microsoft\ClickToRun\OverRide /v LogLevel /t REG_DWORD /d 3
   ```
2. Download latest ODT: https://www.microsoft.com/en-us/download/details.aspx?id=49117
3. Customize configuration.xml with local Source path
4. Download offline package: `setup.exe /download configuration.xml`
5. Install: `setup.exe /configure configuration.xml`
6. If Step 5 fails -> escalate to Office team (Office installation issue)

## Step 4: Collect Logs
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
