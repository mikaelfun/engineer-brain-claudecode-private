# MAM for Edge on Windows - Architecture and Troubleshooting

## Overview
Desktop MAM for Microsoft Edge on Windows 11 BYOD devices. Allows app protection policies without full device management.

## Requirements
- Windows 11 22H2+ (build 10.0.22621)
- Microsoft Edge v115.0.1901.155+
- Azure AD registered (Workplace Joined) device ONLY
- Intune license + Entra ID P1 (for CA)
- Max 3 users can WPJ from same BYOD device across all tenants
- AADJ and HAADJ are NOT supported

## Architecture

### High-Level MAM Flow
1. App enrolls via MDM/MAM API
2. App sends enrollment ID to ESTS via WAM parameter
3. Edge sends enrollment ID + Edge App ID in "Enrollment" cookie
4. ESTS validates: if resource requires MAM, looks for enrollment ID
5. Device must be AAD registered (WPJ) for MAM to work
6. If enrollment ID not found: error `unauthorized_client` + suberror `protection_policy_required` (AADSTS53005)

### Edge App ID
| Application | ClientAppId |
|---|---|
| Microsoft Edge | ecd6b820-32c2-49b6-98a6-444530e5a77a |

### Key Header
`x-ms-enrollments` - comma-separated list of Microsoft enrollment IDs (base64 encoded), sent to AAD Authorize endpoint.

## Conditional Access Configuration
- Under Access controls > Grant: check "Require app protection policy"
- Client apps condition: enable "Browser"
- Non-MAM browsers show "Launch in Edge" prompt
- WARNING: Using OR operand with "Require compliance device" prompts users to install Chrome extension for MDM

## Troubleshooting

### 1. Verify Device Registration
- Device Join Type must be "Azure AD registered"
- "Allow my organization to manage my device" must have been unchecked

### 2. Check MAM Flags in Edge
Navigate to `edge://edge-dlp-internals`:
- Feature Flags: `mslrmv2` = Enabled, `msMamDlp` = Enabled
- Provider States: `Mam Intune DLP` = Available

If flags don't persist:
```
msedge --enable-features="msDesktopMam"
```

### 3. Check mamlog.txt
Location: `%LOCALAPPDATA%\Microsoft\`
Look for: "Unable to acquire an access token during check-in"
Fix: Sign out and back into Edge profile to refresh token

### 4. Conditional Access Failure Investigation
1. Get correlation/request ID from failed sign-in
2. In ASC Authentication Diagnostics:
   - CA Diagnostics tab: shows unsatisfied grant controls
   - Device tab: shows ApplicationId, MamEnrollmentId, UserId
3. Expert view > Diagnostic logs:
   - Search "Parsed Microsoft enrollment IDs"
   - Search "EnrollmentIds" in DataForConditionEvaluation
   - Successful: shows "MatchedEnrollmentId"

### 5. Debug Identity Errors
```
msedge --enable-logging --v=0
```
Output: `chrome_debug.log` in Edge user data directory

### 6. View MAM Policy
Navigate to `edge://policy` in Edge to see last applied time and version

## ICM Escalation Paths

| Issue | Team | Template |
|---|---|---|
| CA + Require app protection fails | ESTS Incident Triage | [Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=83L3k1) |
| WAM token issues | Cloud Identity AuthN Client (Windows) | [Template](https://aka.ms/wamhot) |
| WPJ fails in Edge profile | Edge support | Browser > Microsoft Edge > Edge for Windows |
| MAM flags not enabled/persisting | Intune/Edge support | - |
| Compliance check fails with flags enabled | Intune support | Azure > Intune > App Configprofiles - Windows > ManagedApps |

## Case Handling
Four teams may be involved: Edge, Intune, Windows Defender, Azure AD (Identity).
Desktop MAM SDK does NOT participate in authentication - all WAM communication lives within Edge code.
