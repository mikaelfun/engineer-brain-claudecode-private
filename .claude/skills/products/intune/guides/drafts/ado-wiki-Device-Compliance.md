---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Compliance"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Compliance"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Compliance Troubleshooting Guide

## How Compliance Works

- MDMStatusCalculator provides per-device compliance info for Conditional Access in AAD
- Compliance calculated based on DMS check-in results and timing thresholds
- Consistency Checker runs daily over all compliance reports (DMS, PartnerDeviceHealth, Enhanced Jailbreak Detection, Partner Device Attribute/JAMF)
- Default compliance threshold: 30 days (admin-tunable); devices outside threshold → non-compliant
- All compliant devices rechecked every 12 hours by RecheckDeviceComplianceBackgroundTask
- Non-compliant devices are NOT rechecked (blocked by AAD or no user impact)

### Why targeted to Users?

During enrollment, device-targeted policies can't evaluate because UDA doesn't exist yet. With Secure by Default enabled, device targeting is now supported for devices with a primary user.

### Secure by Default

Enrolled devices targeted by CA requiring compliant device AND not targeted by any compliance policy → marked non-compliant and blocked. O365 MDM enrolled devices cannot consume Intune compliance policies → fail Secure by Default.

### Multi-User Compliance

- Windows: uses last logged-on user's evaluation to report status
- Other platforms: only the enrolling user's AAD device record is updated
- Other users accessing O365 get null device ID from workplace join

## Scoping Questions

1. UPN of the user?
2. Platform (iOS, Windows, Android)?
3. Enrollment method (Auto-enroll, Autopilot, Bulk, BYOD, Co-management, DEM)?
4. User affinity or without?
5. Android Enterprise: Work Profile or other?
6. MDM authority set to Intune? (O365 MDM won't evaluate Intune compliance)
7. Is user a DEM user?
8. Using MTD (Lookout, etc.)?
9. Device Overview → Compliant?
10. Device Compliance tab → policies showing compliant?
11. Hardware tab → AAD record compliant?

## Kusto Queries

### Full device check-in logs

```kusto
let IntuneDeviceId = "<intune device ID>";
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId == IntuneDeviceId
| where isnotempty(message)
| project env_time, message
```

### Final compliance results per CI

```kusto
let IntuneDeviceId = "<intune device ID>";
DeviceManagementProvider
| where env_time > ago(1d)
| where ActivityId == IntuneDeviceId
| where isnotempty(message)
| project env_time, message
| where message startswith "Saving report for CI"
| extend CI = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 1, message)
| extend CIVersion = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 2, message)
| extend Applicability = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 3, message)
| extend ComplianceState = extract("Saving report for CI (.*)/(\\d+) with state (\\w+) (\\w+)", 4, message)
```

### All compliance logs for device

```kusto
let TheIntuneDeviceID = "<intune device ID>";
IntuneEvent
| where env_time > ago(7d)
| where ComponentName == "StatelessComplianceDetailProvider"
| where Col1 contains TheIntuneDeviceID
| project env_time, ComponentName, EventUniqueName, ColMetadata, Col1, Col2, Col3, Col4, Col5, Col6, Message
```

### Compliance evaluation results

```kusto
let deviceGuid = "<intune device ID>";
let startTime = ago(7d);
let endTime = now();
IntuneEvent
| where env_time between (startTime .. endTime)
| where ServiceName == "StatelessComplianceCalculationService"
| where EventUniqueName == "ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult"
    or EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails"
| where Col1 contains deviceGuid
| extend complianceState = iff(EventUniqueName == "ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails", Col3,
    extract("ComplianceState:(.*?);", 1, iff(ColMetadata == "InstanceId;taskStatus;exceptionThrown;ElapsedTicks;complianceResult;", Col5, Col2)))
| extend complianceDetails = extract("RuleDetails:(.*)", 1, iff(ColMetadata == "InstanceId;taskStatus;exceptionThrown;ElapsedTicks;complianceResult;", Col5, Col2))
| extend accountId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 1, Col1)
| extend deviceId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 2, Col1)
| extend userId = extract("AccountId=(.*?);DeviceId=(.*?);User=(.*?);DeviceIdSource=(.*?);", 3, Col1)
| project ASU=env_cloud_name, env_time, complianceState, complianceDetails, deviceId, userId, accountId
```

## Support Boundaries

- 3P MDM vendor compliance reporting issues → case with 3P vendor team
- See [Partner Compliance Wiki](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1349493/Partner-Compliance) for details

## Partner Compliance

Third-party device compliance partners can add compliance state data to AAD. Setup requires:
1. Configure Intune to work with compliance partner
2. Configure partner to send data to Intune
3. Enroll iOS/Android devices to the partner

Prerequisites: Intune subscription + compliance partner subscription.
