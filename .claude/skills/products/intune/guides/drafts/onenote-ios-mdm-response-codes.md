# iOS/macOS App Deploy - MDM Response Codes

> Source: OneNote - iOS TSG / App Deploy - iOS Response Code
> Status: draft (pending SYNTHESIZE review)

## Common Response Codes (5000-5199)

| HRESULT | Code | Constant | Description |
|---------|------|----------|-------------|
| -2016341112 | 5000 | DeviceIsBusy | iOS device returned NotNow error (busy) |
| -2016341111 | 5001 | UnexpectedIdleStatus | iOS device returned unexpected Idle status |
| -2016341110 | 5002 | CommandFormatError | Device rejected command due to incorrect format |
| -2016341109 | 5003 | UnknownIOSError | iOS device returned generic error |
| -2016341108 | 5004 | PrerequisitesNotSatisfied | Profile can't install - waiting on prerequisite |
| -2016341107 | 5005 | FileVaultNotEnabled | FileVault profile installed but not enabled |
| -2016341106 | 5006 | FileVaultEnabledByUser | FileVault already enabled by user, Intune can't manage recovery |
| -2016341105 | 5007 | ServerSessionInvalidatedError | 502 Server Session Invalidated |
| -2016341104 | 5008 | UserApprovedEnrollmentRequired | macOS features require UserApprovedEnrollment |

## App Install Response Codes (5200-5299)

| HRESULT | Code | Constant | Description |
|---------|------|----------|-------------|
| -2016330912 | 5200 | AppInstallNeedsRedemption | Paid app needs redemption code (managed deeplink) |
| -2016330911 | 5201 | AppInstallUserInstalledApp | User installed app before managed install |
| -2016330910 | 5202 | AppInstallUserRejected | User rejected app install offer |

## Usage Notes

- These are HRESULT values using facility 2001
- Codes appear in Intune diagnostic logs and Graph API responses
- FileVault codes (5005-5006) are macOS-specific
- DeviceIsBusy (5000) is transient - retry after delay
