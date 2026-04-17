---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Features Restrictions and Custom/Windows/Remediations"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FWindows%2FRemediations"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## About Proactive Remediations

Proactive Remediations is a sub-feature of Endpoint Analytics that uses script packages to detect and fix common support issues on devices. Two categories:

- **Customer scripts**: Created and deployed by admin
- **Microsoft Scripts (First Party)**: Auto-appear, admin cannot modify content but can upgrade version and assign to groups

### Prerequisites
- See [Proactive remediations prerequisites](https://docs.microsoft.com/mem/analytics/proactive-remediations#bkmk_prereq)
- Co-managed devices: Sidecar agent checks app workload. If workload on SCCM, won't check in for app scenario but will ask Intune for scripts

### Known Limitations
- No scope tags on remediation scripts
- No sorting and export in device status report (planned move from SQL to Kusto)

## PKCS Certificate Deployment Flow (Data Flow)

### Service to Client
Device → Intune Service → Connector → Enterprise CA

### Client to Service
Device reports script execution results back through IME → Intune Service

### Script Execution
1. IME Scheduler syncs scripts and computes schedule times
2. IME Runner executes scripts at scheduled time
3. Detection script runs first (exit code 1 = issue detected)
4. If detected, remediation script runs (exit code 0 = success)
5. Post-remediation detection runs to verify fix
6. Results sent to service

## Troubleshooting

### Sidecar/IME Deployment
- See IME deployment troubleshooting steps in Policy-Targeting/Intune
- On-demand remediation via remote action: https://internal.evergreen.microsoft.com/en-us/topic/f51f6919-7ff4-1e7e-5949-c969a192c2f8

### Troubleshooting On-Demand Remediation (Remote Action)

**Flow:**
1. Admin selects device in Portal → selects script → Run Remediation
2. Translates to POST: `https://graph.microsoft.com/beta/deviceManagement/managedDevices('IntuneDeviceID')/initiateOnDemandProactiveRemediation`
3. Request Body: `{"ScriptPolicyId":"xxx-xxx-xxx-xxx-xxx"}`

**Kusto Step 1 — Confirm request sent from Portal:**
```kusto
HttpSubsystem
| where accountId == "<TenantID>"
| where url contains "<DeviceID>" and url contains "OnDemandProactiveRemediation"
| where env_time >= ago(1h)
| project ActivityId, deviceId, env_time, httpVerb, url, statusCode
```

**Kusto Step 2 — Confirm WNS notification sent:**
```kusto
IntuneEvent
| where ActivityId == "<ActivityID from Step 1>"
| where EventUniqueName == "WnsNotificationSent"
| project env_time, ColMetadata, Col1, Col2, Col3, Col4, DeviceId
```

**Device-side verification:**
1. Registry: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\Notification` — Token and expiration
2. Registry: `HKLM\SOFTWARE\Microsoft\IntuneManagementExtension\SideCarPolicies\DeviceAction\OnDemandProactiveRemediation` — Policy ID and Archive time
3. IME Logs: `IntuneManagementExtension.log`

**Important Notes:**
- WNS must be enabled
- Disabled Toast Notification (GPO or Intune) blocks WNS push notifications locally (Event ID 1010 won't fire)
- On-Demand Remediation does NOT need script to be assigned to user/device group

### Portal Errors
1. Press F12 in browser, record `Client-request-id`
2. Query CMService:
```kusto
CMService
| where env_time > ago(1h)
| where ActivityId =~ "<Client-request-id>"
```
3. For more details:
```kusto
IntuneEvent
| where env_time > ago(1h)
| where ActivityId =~ "<Client-request-id>"
```

### Check Script Report
```kusto
IntuneEvent
| where env_time > ago(3d)
| where ActivityId == "<DeviceID>"
| where ComponentName == "StatelessSideCarGatewayService"
| where Col1 == "ScriptReport"
| project Col2
```

### Sidecar Gateway Activity
```kusto
IntuneEvent
| where env_time > ago(2d)
| where ActivityId == "<DeviceID>"
| where ComponentName == "StatelessSideCarGatewayService"
| where EventUniqueName == "GetTargettedHealthScriptIds" or EventUniqueName == "GetHealthScripts"
| project env_time, EventUniqueName, Col1, Col2, Col3, Col4, Message
```

**Note:** Script execution has a 1-hour timeout (not configurable).

### Client Logs
- Location: `C:\ProgramData\Microsoft\IntuneManagementExtension\Logs`
- Main log: `IntuneManagementExtension.log`
- Two components:
  - **Scheduler**: Sync scripts, compute schedule times
  - **Runner**: Execute scripts, schedule next run

**Scheduler log pattern:**
```
[HS] Got 1 script(s) for user <UserID> in session 2
[HS] Calculated earliest time is <DateTime>
[HS] Scheduler: Job is queued and will be scheduled to run at UTC <DateTime>
```

**Runner log pattern:**
```
[HS] Runner: script <ScriptID> will be executed now.
[HS] Processing policy with id = <ScriptID>
Powershell execution is done, exitCode = 1  (detection found issue)
[HS] remediation script exit code is 0  (remediation succeeded)
[HS] Saving policy results for user: <UserID>
[HS] sending results to service..
```
