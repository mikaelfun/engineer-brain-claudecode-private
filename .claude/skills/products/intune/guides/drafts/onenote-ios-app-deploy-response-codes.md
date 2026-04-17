# iOS App Deploy Response Codes Reference

## Overview
Internal HRESULT error codes returned during iOS app deployment via Intune MDM. Facility 2001.

## Common Response Codes (5000-5199)

| Code | HRESULT | Name | Description |
|------|---------|------|-------------|
| 5000 | -2016341112 | DeviceIsBusy | iOS device returned NotNow (busy) |
| 5001 | -2016341111 | UnexpectedIdleStatus | Unexpected Idle status |
| 5002 | -2016341110 | CommandFormatError | Device rejected command (incorrect format) |
| 5003 | -2016341109 | UnknownIOSError | Generic iOS error |
| 5004 | -2016341108 | PrerequisitesNotSatisfied | Waiting on prerequisite profile |
| 5005 | -2016341107 | FileVaultNotEnabled | FileVault profile installed but not enabled |
| 5006 | -2016341106 | FileVaultEnabledByUser | FileVault enabled by user, Intune can't manage recovery |
| 5007 | -2016341105 | ServerSessionInvalidatedError | 502 Server Session Invalidated |
| 5008 | -2016341104 | UserApprovedEnrollmentRequired | macOS requires UserApprovedEnrollment |

## App Install Response Codes (5200-5299)

| Code | HRESULT | Name | Description |
|------|---------|------|-------------|
| 5200 | -2016330912 | AppInstallNeedsRedemption | Needs redemption code (paid app as managed deeplink) |
| 5201 | -2016330911 | AppInstallUserInstalledApp | User installed app before managed install |
| 5202 | -2016330910 | AppInstallUserRejected | User rejected app install offer |
| 5203 | -2016330909 | AppInstallUpdateRejected | User rejected app update offer |
| 5204 | -2016330908 | AppInstallFailed | App install failed |
| 5205 | -2016330907 | AppInstallRedeeming | Device redeeming redemption code |
| 5206 | -2016330906 | AppInstallManagedButUninstalled | Managed app removed by user |
| 5207 | -2016330905 | AppInstallUnknown | App state unknown |
| 5208 | -2016330904 | AppInstallUserRejectedManagement | User rejected management takeover |
| 5209 | -2016330903 | DeviceVppOsNotApplicable | Device VPP licensing requires iOS 9+ |
| 5210 | -2016330902 | WebAppUninstallFailed | Webclip uninstall failed |
| 5211 | -2016330901 | UserVppLicenseToUserlessEnrollment | User VPP license assigned to userless/shared iPad |
| 5212 | -2016330900 | DeviceVppLicenseNotSupported | Device VPP licenses not supported by item |
| 5213 | -2016330899 | VppUserRetiredOrDeleted | VPP user retired/deleted, can't assign license |
| 5214 | -2016330898 | CouldNotValidateAppManifestUnknown | App Install Failure 12024: Unknown cause |
| 5215 | -2016330897 | CouldNotValidateAppManifestTimedOut | App Install Failure 12024: Timed Out (NSURLErrorTimedOut -1001) |
| 5216 | -2016330896 | CouldNotValidateAppManifestCannotFindHost | App Install Failure 12024: Cannot Find Host (-1003) |
| 5217 | -2016330895 | CouldNotValidateAppManifestCannotConnectToHost | App Install Failure 12024: Cannot Connect To Host (-1004) |

## Usage
- Match HRESULT value from Intune logs/Graph API to identify specific failure reason
- Common in VPP app deployment and managed app lifecycle scenarios

## Source
- OneNote: MCVKB/Intune/iOS/App Deploy - iOS Response Code.md
