# iOS Company Portal Enrollment Log Analysis

## Overview
Reference guide for reading iOS Company Portal logs during a successful enrollment flow. Use this as baseline to compare against failed enrollments.

## Normal Enrollment Flow (Good Sample)

### Phase 1: Sign In
1. User clicks Login button in Company Portal
2. `ADALLoginStarted` / MSAL acquires token
3. Scope: `0000000a-0000-0000-c000-000000000000/.default` (Microsoft Intune resource)
4. Token type: **AADIntuneToken** → result: Succeeded

### Phase 2: Profile Download & Enrollment
1. Enrollment steps initialized:
   - PrivacyInformation → ProfileDownload → ProfileInstall → Compliance
2. Reports enrollment progress to: `fef.msuc01.manage.microsoft.com/StatelessEnrollmentService/EnrollmentSessions`
3. Fetches **AADIntuneEnrollmentToken**:
   - Scope: `d4ebce55-015a-49b5-a083-c84d1797ae8c/.default` (Microsoft Intune Enrollment resource)
   - Uses silent token acquisition with cached account
   - Authority resolved from `/common` to tenant-specific endpoint

### Phase 3: Enrollment Eligibility Check
1. User clicks Continue button
2. `EnrollmentManager.enrollDevice` starts
3. Calls: `StatelessIWService/EnrollmentProfiles('default')`
4. Response: `EnrollmentEligibility: Approved` → Succeeded

## Key App IDs
| App ID | Service |
|--------|---------|
| `0000000a-0000-0000-c000-000000000000` | Microsoft Intune |
| `d4ebce55-015a-49b5-a083-c84d1797ae8c` | Microsoft Intune Enrollment |

## Key Log Locations
- Company Portal logs from device diagnostic
- Azure AD Sign-in Activity logs (portal)

## Troubleshooting Tips
- If AADIntuneToken fails → check Intune license assignment and CA policies
- If AADIntuneEnrollmentToken fails → check enrollment restrictions and device limit
- If EnrollmentEligibility != Approved → check enrollment type restrictions, platform restrictions, device limit

## Enrollment Service Endpoints
- `fef.msuc01.manage.microsoft.com` — Intune service endpoint (varies by region)
- API version: `15.0` for enrollment profiles, `2.19` for enrollment sessions

## Source
- OneNote: MCVKB/Intune/iOS/Company Portal log - GoodSample.md
