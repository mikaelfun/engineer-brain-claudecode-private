# Troubleshooting Policies and Profiles in Microsoft Intune

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-configuration/troubleshoot-policies-in-microsoft-intune

## Built-in Troubleshoot Pane

1. Intune admin center > Troubleshooting + support > Troubleshoot
2. Select user > verify Intune license (green check)
3. Check device columns:
   - **Managed**: Must show MDM or EAS/MDM
   - **Azure AD join Type**: Workplace or AzureAD
   - **Intune compliant**: Yes
   - **Last check in**: Recent (>24h = issue)

## Policy States

| State | Meaning |
|-------|---------|
| Not Applicable | Platform mismatch (e.g., iOS policy on Android) |
| Conflict | Two policies with same setting, different values |
| Pending | Device not checked in or not reported status |
| Errors | Check Troubleshoot company resource access |

## Key Checks

- Verify tenant status is Active
- Confirm profile status: Conforms / Not applicable / Pending
- Exchange On-Premises Policy rules not enforced in M365 - delete legacy rules, create new M365 policy
- Windows 10 may not remove security policies on unassign - may need to reset security policies manually

## Force Check-in

- Android: Company Portal > Devices > Check Device Settings
- iOS: Company Portal > Devices > Check Settings
- Windows: Settings > Accounts > Access Work or School > Info > Sync
