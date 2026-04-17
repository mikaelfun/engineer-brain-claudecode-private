# Desktop MAM - App Protection Policy for Edge on Windows

## Overview
Intune MAM for Edge on Windows allows securing work content on BYOD Windows 11 devices via App Protection Policies without full MDM enrollment.

## Requirements
- Windows 11 22H2+ (backported to earlier builds)
- Workplace Join only (AADJ/HAADJ NOT supported)
- Max 3 WPJ users per BYOD device across all tenants
- Edge v115.0.1901.155+, Intune license, Entra ID P1
- Edge ClientAppId: `ecd6b820-32c2-49b6-98a6-444530e5a77a`

## Architecture
1. Edge sends enrollment ID in `x-ms-enrollments` header to AAD Authorize endpoint
2. ESTS matches enrollment IDs from request to device object
3. Match found -> token issued; not found -> error 53005 (protection_policy_required)

## Troubleshooting

### Verify MAM Flags
`edge://edge-dlp-internals` - Check: mslrmv2=Enabled, msMamDlp=Enabled, Mam DLP Provider=Available

### MAM Flags Not Persisting
Workaround: `msedge --enable-features="msDesktopMam"`

### Access Token Issues
Check `%LOCALAPPDATA%\Microsoft\mamlog.txt`. Sign user out/in to refresh WAM token.

### CA Failure
Check ASC Authentication Diagnostics: Parsed Microsoft enrollment IDs must match EnrollmentIds in DataForConditionEvaluation.

### Support Team Routing
| Issue | Team | SAP |
|---|---|---|
| CA policy fails | AAD Auth | Azure/AAD Sign-In/CA |
| WPJ fails in Edge | Edge | Browser/Edge/Windows |
| Compliance check fails | Intune | Azure/Intune/App Config-Windows/ManagedApps |

### ICM
- ESTS: [Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=83L3k1)
- WAM: [Template](https://aka.ms/wamhot)
