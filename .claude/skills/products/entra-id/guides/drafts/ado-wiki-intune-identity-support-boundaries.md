---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Device Management/Intune Identity Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FDevice%20Management%2FIntune%20Identity%20Support%20Boundaries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune/Azure Identity Support Boundaries

## Support Ownership Map

### 1. Conditional Access Policy Issues

| Cause | Troubleshoot By |
|-------|----------------|
| Compliance policy | Intune (IsCompliant/IsManaged updated by Intune) |
| Device registration (iOS/Android) | Azure AD (IDSP confirms CA policy applies) |
| Broker apps (iOS/Android) | Azure AD owns Authenticator App, Intune owns Company Portal |
| App protection policy | Azure AD confirms CA, Intune troubleshoots |
| Require approved apps | Azure AD confirms CA, Intune troubleshoots |

### 2. Windows Device Registration

| Scenario | Owner |
|----------|-------|
| Co-management | SCCM + AAD (hybrid + PRT) + Intune (enrollment) |
| Autopilot - ODJ connector | Intune |
| Autopilot - Hybrid AAD | Azure AD |
| Autopilot - Device Setup | Intune |
| Autopilot - Device Preparing | Windows |
| Autopilot - Synthetic devices | Intune (AAD does NOT merge) |
| GPO enrollment | Windows DS (GPO) + Intune (enrollment) + AAD (hybrid+PRT) |

### 3. User/Group Issues

- Sync issues from AD Connect → AAD-Sync team
- Dynamic groups not populating → AAD-Groups team

### 4. Identity failures for Office apps

- Enterprise Identity team (NOT Azure AD auth)

### 5. 3rd Party Solutions

- 3rd party federation (Okta, Ping) or 3rd party MDM (MobileIron, Airwatch, Jamf)
- Team that gets the case keeps it, other team assists via AR
- Teamwork mentality — collaboration, not transfer

## Broker Apps Reference

| Platform | Broker |
|----------|--------|
| iOS | Authenticator App |
| Android | Company Portal |
| Windows | No broker |
| macOS | No broker |

## PRT Basic Troubleshooting

When `dsregcmd /status` shows no PRT:

1. **Ensure UPN + password** (or WHfB) authentication — SmartCard won't trigger PRT
2. Reboot machine twice with UPN+password
3. If still failing:
   - Run `dsregcmd /leave` as admin
   - Verify disjoin with `dsregcmd /status`
   - Download PsExec, run `psexec -i -s cmd.exe` (machine context)
   - Run `dsregcmd /debug` then `dsregcmd /status` to verify rejoin

## Compliance Flow

Steps 1-5: Intune owns 3rd party compliance with compliance partners
Steps 6-7: Azure Auth
Jamf compliance: owned by Intune

## Device Registration Ownership

All device registration scenarios supported by Azure AD Auth:
- AAD-Registered (mobile: iOS/Android, Windows, non-Windows)
- AAD-Joined and AAD-Hybrid Joined (Windows 10)
- Sync AD joined methods: Azure Sync team
- Federated: AAD Auth (owns full registration)
