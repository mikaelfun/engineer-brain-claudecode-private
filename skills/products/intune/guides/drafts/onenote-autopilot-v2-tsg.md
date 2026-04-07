# Autopilot V2 (Windows Device Preparation) TSG

## Overview
Comprehensive troubleshooting guide for Autopilot V2 covering enrollment, provisioning, and client-side investigation.

## Requirements
- User-driven, Entra ID joined only
- Supported OS: Windows 11 22H2+ (March 2024 D release)
- Device must be unregistered (not Autopilot V1 registered)

## Conflict Resolution: V1 vs V2
- Device has ZTDID (Autopilot registered) -> V1 applies, V2 not applicable
- Device preparation profile assigned + device unregistered -> V2 applies, ESP not applicable
- No device preparation profile -> ESP profile applies

## Kusto Queries (Intune cluster)
- `CheckAutopilotV2EligibilityForDevice(lookback, deviceId)` - Check eligibility
- `GetDevicePrepProfileAppliedToDevice(lookback, deviceId)` - Check profile assignment
- `GetAutopilotV2EnrollmentEventsForDevice(lookback, deviceId)` - Enrollment events
- `GetAutopilotV2ScenarioResultEventsForDevice(lookback, deviceId)` - Provider status + page status
- `GetAutopilotV2SidecarInstallEventsForDevice(lookback, deviceId)` - Sidecar install
- `GetAutopilotV2CheckinSessionInfoForDevice(lookback, deviceId)` - Checkin alerts + throttling
- `GetAutopilotV2ProvisioningEventsForDevice(lookback, deviceId)` - Provisioning events
- `GetDeviceMembershipUpdaterResultsForDevice(lookback, deviceId)` - ETG group assignment

## Eligibility Checks
1. OS version supports AutopilotV2
2. Device not pre-registered with Autopilot service (no ZTDID)
3. Entra ID joined enrollment type
4. User-based enrollment
5. Device enrolling during OOBE
6. Device preparation profile configured with device group (ETG)

## Provisioning Flow
Providers execute in order:
1. **Standard user provider** - removes user from Administrators (optional)
2. **SLDM provider** - LOB apps and policies (no fail-fast, retries until timeout)
3. **Scripts provider** - PowerShell platform scripts (not remediation scripts)
4. **Apps provider** - Win32 and WinGet apps

Apps/scripts provisioned = intersection of:
- Required assignments to device security group (ETG) - must be device context
- Apps/scripts selected in device preparation profile (+ dependencies)

## Checkin Alerts
- **Bootstrapping**: Install Sidecar agent only (15-min timeout)
- **ExecutingProvisioning**: Install LOB apps + policies
- **ProvisioningComplete**: LOB done, scripts/Win32 still installing
- **deviceprepresult**: Final results

## Client-Side Investigation

### Device Preparation CSP Registry
- `PageEnabled` - Boolean enabling device prep page
- `PageStatus` - 0=Disabled, 1=Enabled, 2=InProgress, 3=ExitOnSuccess, 4=ExitOnFailure
- `PageErrorCode` - HRESULT on failure
- `PageErrorDetails` - Optional error message
- `ExecutionContext` - JSON manifest for orchestrator

### Client Components
1. Device preparation page in OOBE CloudExperienceHost
2. Orchestrator in Sidecar agent (protocol handler invoked by wmansvc)
3. Glue layer in wmansvc NT service (EMM agnostic)
4. Providers hosted in Sidecar
5. OMADM client for DeviceCheckin service

### ETW Logs
- Device prep page: `Microsoft-Windows-Shell-Core` channel, search "DevicePrepPage"
- Orchestrator + SLDM: `Microsoft-Autopilot-BootstrapperAgent` channel
- Scripts + Apps: Sidecar log file, search "APv2"

### SLDM Provider State
- `Progress` CSP node: workloadState 0=NotStarted, 1=InProgress, 2=Completed, 3=Failed

## Geneva Service Diagnostics

### Device Provisioning Entity
- Endpoint: Scale unit, ODataProvider
- Address: DeviceProvisioningService
- Id: `DeviceProvisionings(AccountId=<id>, DeviceId=<id>)`
- Key fields: EffectiveGroupId, DeviceSecurityGroups, DevicePreparationProfileId, DeploymentStatus, MdmProvisioningStatus, AllowedAppIds, ScriptProvisioningStatus, AppProvisioningStatus

### Device Membership Entity
- Address: DeviceProvisioningService
- Id: `DeviceMemberships(AccountId=<id>, DeviceId=<id>)`

### Profile Entity
- Address: StatelessEnrollmentMTConfigurationService
- Id: `ECDeviceManagementPolicies(GuidKey1=guid'<accountId>', GuidKey2=guid'<policyId>')`
- Settings stored as key/value property bag

### Profile Assignment Entity
- Address: StatelessEnrollmentMTConfigurationService
- Query: `SortedPolicyConfigurationsStores?$filter=GuidKey1 eq guid'<accountId>' and GuidKey2 eq guid'<effectiveGroupId>' and StringKey2 eq '36'`

## Known Issues
See: https://learn.microsoft.com/en-us/autopilot/device-preparation/known-issues
