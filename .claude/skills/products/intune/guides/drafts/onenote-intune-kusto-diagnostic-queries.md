# Intune Kusto Diagnostic Queries - Quick Reference

> Source: OneNote Mooncake POD Support Notebook - Intune Kusto Query section
> Quality: guide-draft (pending review)

## 1. Check Intune License Status

Query IntuneEvent for license-related events:
- **EventUniqueNames**: LogUnlicensedUserOutOfGracePeriod, LogNotFoundGetUserResult, LogUnlicensedUserWithInGracePeriod, LogUserFoundGetAsyncResultFromDB
- **Table**: IntuneEvent
- **Key fields**: UserId, EventUniqueName, Col1 (license type), Col2 (unlicensed date), Col3 (grace period minutes)
- **Grace period**: Default 43200 minutes (30 days)

## 2. Check Device Compliance State

### Per-device compliance detail
- **Table**: IntuneEvent, ServiceName = StatelessComplianceCalculationService
- **EventUniqueNames**:
  - ComplianceDetail-GetComplianceDetailsForDeviceAction-FinalResult (current state)
  - ComplianceDetail-ComplianceUpdateDevicePatcher-DeviceCompliantChangedDetails (state changes)
- **Extract**: ComplianceState, RuleDetails, AccountId, DeviceId, UserId from Col1/Col2

### Compliance sync to AAD
- **Table**: GraphApiProxyLibrary
- Filter by AAD device ID in url/errorMessage
- Watch for httpStatusCode 404 = AAD device not found

### Function shortcut
- `DeviceComplianceStatusChangesByDeviceId(deviceId, startTime, endTime, maxRows)`

## 3. DEM (Device Enrollment Manager) User Verification

- **Table**: DeviceManagementProvider
- Filter message contains "Service Account" AND contains userId
- If results found -> user is DEM; no results -> likely not DEM

## 4. Device Check-in Troubleshooting

### Session tracking
- **Table**: DmpLogs, message startswith "New Session"

### Routing service verification
- **Table**: HttpSubsystem, sourceServiceName = DeviceCheckinRoutingService, I_Srv = SLDMService

### Apple notification result
- **Table**: IntuneEvent, ServiceName = AppleNotificationRelayService
- **EventUniqueName**: DeviceNotificationResult
- Watch for InvalidDeviceCredentials (code 1211)

### Last check-in time
- **EventUniqueName**: UpdateDeviceLastContact (Col1=previous, Col2=current)

### Policy sync delay detection
- **Table**: DeviceManagementProvider, EventId = 5782 (TraceIOSCommandEvent)
- Use prev() + datetime_diff to calculate gaps

## 5. Device Cleanup Rule

### Check eligible devices
- **Table**: DeviceService_Device, filter LastContact < ago(90d)

### Verify manual delete
- **Table**: HttpSubsystem, I_Srv = StatelessDeviceFEService, httpVerb POST/DELETE

### Cleanup rule audit
- **Table**: IntuneEvent, ComponentName = StatelessDeviceOverflowService
- **EventUniqueName**: DeviceRemovalRuleAudit

## 6. Device Configuration Policy Status

### Per-device policy compliance
- **Table**: DeviceManagementProvider, EventId = 5786
- **Fields**: PolicyName, PolicyType, Applicability, Compliance

### Tattoo removal check
- Filter message startswith "Attempting to remove" and contains "wired"

## 7. Device Enrollment Renewal

### SSL client certificate verification
- **Table**: IntuneEvent, ComponentName = FabricAuthenticationModule
- Check ReceivedCallWithSslClientCertificate + UdaCertificateValidatedSuccessfully

### Enrollment renewal event
- **Table**: DeviceLifecycle, TaskName = EnrollmentRenewDeviceEvent

### Certificate issuance
- **Table**: IntuneEvent, ServiceName = CertificateAuthority
- **EventUniqueName**: IssueCertSuccess

## 8. Device PIN Reset & Lock Workflow

Steps: DeviceProvider -> PushNotificationProvider -> HttpSubsystem -> DeviceManagementProvider
- **Auditing EventIDs**: 1245 (PinReset), 1246 (Lock), 1430 (LostMode)

## 9. Device Retire & Wipe

### Confirm action issued
- **Table**: HttpSubsystem, url contains deviceId AND "retire"/"wipe"

### Confirm action reached device
- **Table**: DeviceManagementProvider, message contains "retire"/"wipe"

### ManagementState enum
- 0=Managed, 1=RetirePending, 3=WipePending, 7=RetireIssued, 8=WipeIssued

### Initiator enum
- 0=Unknown, 1=Admin, 2=User, 3=DataProcessor, 5=O365, 6=Operations

### Graph API
- Retire: POST /deviceManagement/managedDevices/{id}/retire -> 204
- Wipe: POST /deviceManagement/managedDevices/{id}/wipe -> 204

## 10. Device/User Effective Group

### Check current EG
- **Table**: DeviceManagementProvider, message contains "DeviceEG" or "UserEG="

### EG membership changes
- **Table**: IntuneEvent, EventUniqueName = EffectiveGroupMembershipUpdated
- Col1=EGId, Col2=TargetId, Col5=ActiveClauses

### EGPRR
- **Table**: IntuneEvent, EventUniqueName = 47121
- EGId -> PayloadId mappings

### Deployment status
- Tables moved to cluster Intuneglobalprod
