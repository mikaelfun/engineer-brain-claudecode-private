# Company Portal iOS Enrollment Log Analysis (Good Sample)

> Source: OneNote MCVKB/Intune/iOS — annotated real enrollment flow

## Overview

Reference log showing a **successful** iOS device enrollment via Company Portal. Use as baseline to compare against failed enrollments.

## Key Phases in Enrollment Flow

### Phase 1: User Login (Company Portal Sign-In)

**Log keywords**: `Login button was clicked`, `ADALLoginStarted`

```
WelcomeController: Login button was clicked, starting login
featureArea: Login | eventTitle: ADALLoginStarted | brokerAuth:false
```

- MSAL acquires token for scope `0000000a-0000-0000-c000-000000000000/.default` (Microsoft Intune resource)
- Successful token fetch: `result: Succeeded | target: AADIntuneToken`

**Verification**: Check Azure AD Sign-in Activity log to confirm Company Portal sign-in succeeded.

### Phase 2: Enrollment Profile Download

**Log keywords**: `enrollment`, `ProfileDownload`, `EnrollmentProfiles`

```
CompanyAccessSetupViewController: steps: PrivacyInformation, ProfileDownload, ProfileInstall, Compliance
```

- Requests enrollment progress via `StatelessEnrollmentService/EnrollmentSessions`
- Fetches **AADIntuneEnrollmentToken** (resource ID: `d4ebce55-015a-49b5-a083-c84d1797ae8c`)

### Phase 3: Enrollment Eligibility Check

**Log keywords**: `EnrollmentEligibility`, `Approved`

```
URL: StatelessIWService/EnrollmentProfiles('default')
Result: EnrollmentEligibility: Approved
```

- Service URL pattern: `fef.msuc01.manage.microsoft.com` (varies by tenant region)
- Parameters include: `os=iOS`, `os-version`, `ssp-version`, `arch`

### Phase 4: Device Enrollment Execution

**Log keywords**: `Starting device enrollment flow`, `UserClickEnroll`

```
EnrollmentManager: Starting device enrollment flow
featureArea: Enrollment | eventTitle: UserClickEnroll
```

## Key Resource IDs

| Resource ID | Service |
|---|---|
| `0000000a-0000-0000-c000-000000000000` | Microsoft Intune |
| `d4ebce55-015a-49b5-a083-c84d1797ae8c` | Microsoft Intune Enrollment |

## Key Token Types

| Token Type | Purpose |
|---|---|
| `AADIntuneToken` | Company Portal authentication |
| `AADIntuneEnrollmentToken` | MDM enrollment authentication |

## Troubleshooting Tips

- If login fails → check `ADALLoginStarted` event and MSAL error
- If enrollment token fails → check authority URL resolution (common → tenant-specific)
- If eligibility check fails → check `EnrollmentEligibility` result in response
- For Mooncake/21Vianet → service URL will differ from global (`fef.msuc01.manage.microsoft.com`)
- Cross-reference with Azure AD Sign-in Activity logs for token acquisition issues
