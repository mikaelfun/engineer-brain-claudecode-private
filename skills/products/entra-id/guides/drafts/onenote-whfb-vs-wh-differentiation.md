# Windows Hello vs Windows Hello for Business - Differentiation Guide

## Overview
Windows Hello (WH) and Windows Hello for Business (WHFB) are often confused. This guide helps quickly differentiate them and troubleshoot PIN configuration conflicts.

## Key Differences

| Aspect | Windows Hello | Windows Hello for Business |
|--------|--------------|---------------------------|
| Purpose | Modern unlock using PIN/gestures | WH + user key/certificate provisioning for authentication |
| AAD Join Required | No | Yes (or on-prem AD with WHFB deployment) |
| PIN Provisioning | Added from Settings > Sign-in options | Auto-provisioned at Windows sign-in |

## Registry Key Locations (Checked in Order)

### Windows Hello for Business
1. **User Group Policy**: `HKEY_USERS:{UserSID}\SOFTWARE\Policies\Microsoft\PassportForWork`
   - `Enabled`, `UseCertificateForOnPremAuth`
2. **Computer Group Policy**: `HKLM:\SOFTWARE\Policies\Microsoft\PassportForWork`
   - `Enabled`, `UseCertificateForOnPremAuth`
3. **MDM User Policy**: `HKLM:\SOFTWARE\Microsoft\Policies\PassportForWork\{tenantId}\{UserSid}\Policies`
   - `UsePassportForWork`
4. **MDM Device Policy**: `HKLM:\SOFTWARE\Microsoft\Policies\PassportForWork\{tenantId}\Device\Policies`
   - `UsePassportForWork`, `UseCertificateForOnPremAuth`

> **Quick check**: If you see `PassportForWork` in registry, it is WHFB.

### Convenience PIN (Windows Hello)
- **GPO**: Computer Configuration > Administrative Templates > System > Logon > Turn on convenience PIN sign-in
- **Registry**: `HKLM:\Software\Policies\Microsoft\Windows\System\AllowDomainPINLogon`
  - 1 = enabled, 0 = disabled

### WHFB PIN Registration State
- `HKCU:\Software\Microsoft\Windows NT\CurrentVersion\WorkplaceJoin\AADNGC\{keyID}`

## Group Policy Locations
- `User Configuration > Administrative Templates > Windows Components > Windows Hello for Business`
- `Computer Configuration > Administrative Templates > Windows Components > Windows Hello for Business`

> **MDM vs GPO**: Group Policy always wins over MDM (Intune/SCCM).

## Common Issue: PIN Option Greyed Out
When convenience PIN cannot be created because WHFB is enabled, the PIN option may be greyed out in Settings.
- Root cause: Conflict between convenience PIN and WHFB policies
- Ref: https://support.microsoft.com/en-us/help/3201940

## WHFB Configuration Sources (Check All Three)
1. **GPO**: `HKLM:\SOFTWARE\Policies\Microsoft\PassportForWork\Enabled`
2. **Intune MDM**: Intune portal > Device enrollment > Windows Hello for Business
3. **SCCM**: SCCM Windows Hello for Business settings (can override GPO and Intune!)

## Troubleshooting PIN Prompt Won't Go Away
If WHfB PIN prompt persists despite disabling in GPO and Intune:
1. Check SCCM WHfB settings (often overlooked)
2. Verify all three sources are disabled
3. Check registry for residual PassportForWork keys
4. Deploy SCCM changes to all users and devices
