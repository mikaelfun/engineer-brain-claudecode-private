# Kusto Queries for iOS Enrollment Troubleshooting

> Source: OneNote MCVKB/Intune/Kusto/iOS Enrollment.md
> Quality: guide-draft (pending SYNTHESIZE review)

## Step 1: Get Enrollment ActivityId from DeviceLifecycle

```kql
DeviceLifecycle
| where userId == "<user-id>"
| project env_time, I_Srv, scenarioType, scenarioInstanceId, ActivityId,
  TaskName, sessionId, accountId, userId, aadDeviceId, type, platform,
  version, newThumbprint, accountContextId, oldManagementState,
  newManagementState, oldRegistrationState, newRegistrationState
```

Look for `scenarioType = Enrollment` entries and note the `ActivityId`.

## Step 2: Query IOSEnrollmentService

```kql
IOSEnrollmentService
| where env_time between (ago(1d) .. now())
| where ActivityId == "<activity-id-from-step1>"
| project env_time, userId, callerMethod, deviceTypeAsString,
  serialNumber, message, siteCode
```

## Key Methods in iOS Enrollment Flow

1. **Apple unsigned input payload** - Initial device check-in with UDID, serial number, product info
2. **signedCms challenge not NULL** - SCEP challenge validation
3. **Apple challenge expiry** - Challenge has 10-minute validity window
4. **ValidateAndFetchSignerCertificate** - Certificate chain validation
   - "Chain building done. Valid chain: True" = success
   - "SN+I validation done. Valid SNI: True" = serial + IMEI validation passed
5. **HandleReportDeviceInfoToReturnScepProfile** - Device info reported, SCEP profile being returned
6. **StartFirstReportDeviceInfo** - Initial device registration with serial number

## Troubleshooting Tips
- If chain validation fails → Check Apple MDM Push Certificate validity
- If challenge expired → Device took too long between enrollment steps (>10 min)
- If SN+I validation fails → Device identity mismatch, possible DEP profile issue
- `siteCode = MDM` indicates standard MDM enrollment
