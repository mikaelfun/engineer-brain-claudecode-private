# Intune DeviceLifecycle & Enrollment Type Reference

> Source: OneNote - Mooncake POD Support Notebook / Intune / Kusto Query / DeviceLifecycle - Enrollment type

## Overview

The `DeviceLifecycle` table in Intune Kusto records device state changes including enrollment, removal, registration, and compliance updates. This guide provides comprehensive enum references and diagnostic queries.

## Platform Enum

| Value | Platform |
|-------|----------|
| 0 | Unknown |
| 1 | Windows RT |
| 2 | Windows 8.1 |
| 3 | Windows 10 |
| 4 | Windows Phone 8 |
| 5 | Windows Phone 8.1 |
| 6 | Windows Phone 10 |
| 7 | iPhone |
| 8 | iPad |
| 9 | iPod |
| 10 | macOS |
| 11 | Android |
| 12 | HoloLens |
| 13 | Surface Hub |
| 14 | Android for Work |

## Enrollment Type Enum

| Value | Type | Description |
|-------|------|-------------|
| 0 | Unknown | |
| 1 | UserPersonal | BYOD personal |
| 2 | UserPersonalWithAAD | BYOD with AAD registration |
| 3 | UserCorporate | Corporate-owned |
| 4 | UserCorporateWithAAD | Corporate-owned with AAD |
| 5 | UserLessCorporate | Userless corporate |
| 6 | EnrollmentManager | DEM enrollment |
| 7 | UserLessCorporateWithCertificate | Userless with cert |
| 8 | DepUserLessCorporate | DEP userless |
| 9 | DepUserCorporate | DEP user corporate |
| 10 | AutoEnrollment | Auto-enrollment (GPO) |
| 11 | BulkAzureDomainJoined | Bulk Azure AD join |
| 13 | AutoPilotAzureDomainJoinedWithProfile | Autopilot AADJ with profile |
| 14 | AutoPilotAzureDomainJoinedWithoutProfile | Autopilot AADJ without profile |
| 15 | AutoPilotOfflineDomainJoined | Autopilot offline domain join |
| 16 | CompanyPortalBulkEnrollment | CP bulk enrollment |
| 17 | CompanyPortalAppleConfiguratorEnrollment | CP Apple Configurator |
| 18 | UserlessDEPEnrollment | Userless DEP |
| 19 | UserChallengeDEPEnrollment | User challenge DEP |
| 20 | UserlessAppleConfiguratorEnrollment | Userless Apple Configurator |
| 21 | UserChallengeAppleConfiguratorEnrollment | User challenge Apple Configurator |
| 22 | MobileConfigBulkEnrollment | Mobile config bulk |
| 23 | OnPremiseCoManaged_GP | Co-managed (GP) |
| 24 | OnPremiseCoManaged_ConfigMgr | Co-managed (ConfigMgr) |
| 25 | AutoPilotPlugAndForgetIntune | Autopilot Plug&Forget Intune |
| 26 | AutoPilotPlugAndForgetExternal | Autopilot Plug&Forget external |
| 27 | AutoPilotADJWithOfflineProfile | Autopilot ADJ offline profile |
| 29 | AutoPilotADJDeviceAuthWhiteGlove | Autopilot ADJ White Glove |
| 30 | AutoPilotOnPremDeviceAuthWhiteGlove | Autopilot on-prem White Glove |
| 31 | DeviceTokenOnPremCoManaged | Device token co-managed |
| 33 | AppleUserEnrollment | Apple User Enrollment |
| 34 | AppleUserEnrollmentWithServiceAccount | Apple UE with service account |
| 35 | AzureVMExtensionEnrollment | Azure VM extension |
| 36 | AppleBulkEnrollmentModernAuth | Apple bulk modern auth |
| 37 | AndroidNonGoogleMobileServicesAgent | Android non-GMS |
| 38 | CloudPCAADJoinEnrollment | Cloud PC AADJ |
| 39 | WVDDeviceAADJoinEnrollment | WVD device AADJ |
| 40 | CloudPCHybridAADJoinEnrollment | Cloud PC HAADJ |
| 41 | WVDDeviceHybridAADJoinEnrollment | WVD device HAADJ |

## EventId Reference

| EventId | Event |
|---------|-------|
| 46801 | EnrollmentAddDeviceEvent |
| 46802 | Renewal succeeded |
| 46803 | AD registration status update |
| 46804 | EnrollmentAddDeviceFailedEvent |
| 46805 | Renewal failed |
| 46806 | EnrollmentStartEvent |
| 46809 | Workplace join started |
| 46810 | Workplace join succeeded |
| 46811 | Workplace join failed |
| 46821 | Registration succeeded |
| 46822 | Device removed |
| 46823 | Device removal failed |
| 46825 | Device checked in |
| 46827 | Registration failed |
| 46828 | Compliance status update |

## Failure Reason Enum

| Value | Reason |
|-------|--------|
| 0 | Unknown |
| 1 | AuthenticationFailed |
| 2 | AccountValidation |
| 3 | UserValidation |
| 4 | DeviceCap |
| 5 | Onboarding |
| 6 | AuthorizationFailed |
| 7 | DeviceNotSupported |
| 8 | InvalidDeviceState |
| 9 | NotInRenewalWindow |
| 10 | InvalidTermsOfUse |
| 11 | InMaintenance |
| 12 | InternalError |
| 13 | BadRequest |
| 14 | FeatureNotSupported |
| 15 | ClientRenewalIssue |
| 16 | EnrollmentCriteriaNotMet |
| 17 | SCCM |
| 18 | ClientTimeoutReached |
| 19 | ClientAbort |
| 20 | InternalClientIssue |
| 21 | ZtdProfileIssue |
| 22 | RequestThrottled |
| 23 | UserAbandonment |
| 24 | VDIMetadataError |

## Management State Enum

| Value | State |
|-------|-------|
| 0 | Managed |
| 1 | RetirePending |
| 2 | RetireFailed |
| 3 | WipePending |
| 4 | WipeFailed |
| 5 | Unhealthy |
| 6 | DeletePending |
| 7 | RetireIssued |
| 8 | WipeIssued |
| 9 | WipeCanceled |
| 10 | RetireCanceled |
| 11 | Discovered |

## Diagnostic Queries

### Enrollment Failures Across Tenant

```kql
let accountGUID = "<INTUNE_ACCOUNT_ID>";
DeviceLifecycle
| where EventId in (46804, 46805, 46811, 46822, 46823, 46826, 46827, 46841, 46842, 46824, 46861, 46862, 46863, 46865, 46864, 46806, 46807, 46801, 46843)
| where env_time > ago(5d)
| where accountId == accountGUID
| project env_time, deviceId, userId, EventId, TaskName, PlatformType, EnrollmentType, EnrollmentFailure, details
| take 200
```

### Device Removal Events

```kql
let startTime = datetime(YYYY-MM-DD HH:MM);
let endTime = datetime(YYYY-MM-DD HH:MM);
DeviceLifecycle
| where env_time between (startTime .. endTime)
| where * contains "<INTUNE_DEVICE_ID>"
| project env_time, ActivityId, TaskName, deviceId, userId, aadDeviceId, removalReason
```

### VDI Enrollment Failures (failureReason=24)

```kql
DeviceLifecycle
| where env_time > ago(1h)
| where EventId in (46804)
| where details contains "ExternalManagementHint" or failureReason == long(24)
| project env_time, env_cloud_name, ActivityId, RelatedActivityId, accountId, aadDeviceId, failureReason, type, details
```
