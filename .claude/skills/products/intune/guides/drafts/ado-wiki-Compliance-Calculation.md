---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Compliance/Compliance Calculation"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Compliance%2FCompliance%20Calculation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Compliance Calculation — Deep Technical Guide

## Component

**StatelessComplianceDetailProvider** in StatelessComplianceCalculationService

Compliance calculation is triggered by IT Pro, IW user, device interaction, and consistency checkers. Uses asynchronous messaging to avoid deadlocks.

## MDMStatus Enum (ComplianceState)

| Value | State | Description |
|-------|-------|-------------|
| 0 | Unknown | Not yet checked in. Bug if persists after multiple check-ins. Could be conflicting policies from different consoles. |
| 1 | Compliant | Compliant with all assigned rules |
| 2 | Noncompliant | Noncompliant with any assigned rules. Details available via SSP/IWP/ViewPoint |
| 3 | Conflict | Available but unused by calculation library |
| 4 | Error | DMS reports error. 7-day tolerance for non-remediation errors before marking noncompliant. Remediation errors → immediately noncompliant |

## Compliance Check Frequency

- Compliance reports filed on each check-in when new info discovered
- Consistency Checker runs daily over all compliance reports (DMS, PartnerDeviceHealth, Jailbreak, JAMF, AndroidEnterprise, VMWare, CustomCompliance)
- Default threshold: 30 days (admin-tunable) → device marked noncompliant
- Compliant devices rechecked every 12 hours (RecheckDeviceComplianceTask)
- Non-compliant devices NOT rechecked

## Troubleshooting Flow

### 1. Check SSP / Company Portal

Tap "Check Compliance" → initiates check-in → 2-minute timeout → result. If spinning endlessly → device can't contact DMS.

### 2. Check Assist365

EU: https://eu.assist.microsoft.com/ | Global: https://assist.microsoft.com/
Navigate to Action → Applications → Troubleshooting → Device → enter identifiers

### 3. Kusto: Compliance Status Changes

```kusto
_DeviceComplianceStatusChangesByDeviceId("deviceId", datetime(start), datetime(end), 1000)
```

### 4. Verify device is checking in

```kusto
let IntuneDeviceId = "";
DmpLogs
| where env_time > ago(7d)
| where deviceId == IntuneDeviceId
| where isnotempty(message)
| project ActivityId, env_time, message
| summarize DMS_Messages=count() by DeviceId = IntuneDeviceId
| join kind = rightouter (
    union DeviceService_Device, DeviceService_Device_Ctip, DeviceService_Device_OneDF
    | where DeviceId == IntuneDeviceId
    | summarize arg_max(Lens_IngestionTime, CreatedDate, LastContactNotification, LastContact, IsManaged, GraphDeviceIsManaged, MDMStatus, GraphDeviceIsCompliant, ReferenceId, CertExpirationDate, EnrolledByUser) by DeviceId, ScaleUnitName
) on DeviceId
```

### 5. Check CA targeting

```kusto
let LookupUserId = "";
CAPolicyTargeting
| where UserId == LookupUserId
```

### 6. View Policy Compliances

From StatelessDeviceService: `PolicyCompliances?$top=1000&$filter=GuidKey2 eq guid'<DeviceId>'`

- Count should match unique compliance policy assignments
- Less = issue in flow from check-in to writing policy compliances
- More = stale entries (cleaned by consistency checker)
- Check ComplianceState: 2 (noncompliant) or 3 (error) → read ComplianceDetails

## Known Issues

### Email Profile causing Unknown compliance (iOS)

Compliance policy referencing Email Profile CI, but policies targeted to different groups → DMS never gets Email Profile → device stuck Unknown.

Fix: Target both policies to same group.

```kusto
let IntuneAccountId = "accountId";
DmpLogs
| where env_time > ago(5d)
| where deviceId in ("deviceId1", "deviceId2")
| where message startswith "Failed to evaluate rule CIExpression - Referred CI not found:"
| project Error = "Found targeting issue, might be e-mail profile", deviceId, message, env_time
```

### Account-level changes cause 30-min compliance flip-flop

DQCache per service instance → old vs new values. Impacted: Compliance Validity Period, Require Assigned Compliance Policy. Wait ~30 min.

## Compliance SLA Alert Investigation

```kusto
let ScaleUnitFromAlert = "AMSUB0101";
IntuneEvent
| where env_time between (MonitorDateStartTime .. MonitorDateEndTime)
| where env_cloud_name == ScaleUnitFromAlert
| where ComponentName == "StatelessComplianceDetailProvider"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
| where Col2 == "Failed"
| extend exception = Col3
| extend exceptionType = extract("(.*?):", 1, exception)
```

Common exception types: DeviceNotFound, MultiUserThrownOut, SecurityTokenValidationException, FabricTransientException, RequestRateTooLargeException

## Jarvis Actions

1. StatelessDeviceService: `Devices(GuidKey1=guid'<AccountId>', GuidKey2=guid'<DeviceId>')`
2. If no IDs: StatelessUserService `Users?$top=10&$filter=UPN eq '<UPN>'` → get UserId → `Users(guid'<UserId>')/Devices`
3. Check LastContact field

## Windows CSP Dependencies (as of 1903)

DeviceStatus, DevDetail, HealthAttestation, DevInfo, Firewall, Policy, RemoteWipe, WindowsLicensing

## Service Dependencies

QMS, DMS, Device Service, Policy Compliance Provider, Office Azure Library, AAD
