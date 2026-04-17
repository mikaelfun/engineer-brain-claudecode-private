---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Web Sign-in on Windows"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FWeb%20Sign-in%20on%20Windows"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Web Sign-in (WSI) on Windows

## Feature Overview

Web Sign-In (WSI) is a credential provider on the Windows lock/sign-in screen for Azure AD Joined (AADJ) devices. It appears as a globe icon under **Sign in options** and provides a web experience for authentication.

## Supported Scenarios

### Legacy (Pre-September 2023)
- Simplified EDU Web Sign-In (federated AAD auth, e.g., Google Id)
- Recovery via Temporary Access Password (TAP)
- Federated Enterprise Web Sign-In (case-by-case exception by PG)

### New Infrastructure (Windows 11 22H2 + KB5030310)
Starting September 2023, completely re-written infrastructure:
- **CHX WebApp**: For PIN setup and recovery scenarios
- **LWH WebApp**: For Web sign-in (globe) credential provider
- Supports ALL first-factor auth methods: Password, WHFB, FIDO2, CBA, Authenticator, TAP

## Auth Method Support by OS

| OS | Supported Methods |
|---|---|
| Windows 10 / Win11 pre-Sep2023 | TAP only (for bootstrapping WHfB, FIDO2, Authenticator) |
| Windows 11 22H2 + KB5030310 | All first-factor methods (Password, WHFB, FIDO2, CBA, Authenticator, TAP) |

## Deployment

Enable via:
- **Intune**: Windows 10+ Configuration profile > **Enable Web Sign In** authentication policy
- **Other MDM**: [EnableWebSignIn](https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-authentication#enablewebsignin) policy CSP

## Technical Details

### Authentication Endpoint
WSI calls `https://login.microsoftonline.com/WebApp/WindowsLogon/1` and returns an auth token back to the OS.

### CHX WebApp (PIN Setup/Recovery)
- Discovers endpoint from `"AADPINRESETV2"` section of `navigation.json`
- Location: `C:\Windows\SystemApps\Microsoft.Windows.CloudExperienceHost_cw5n1h2txyewy\data\prod`
- Prompts user for 2FA, loads Entra ID profile, discovers PIN reset options
- PIN reset options visible in `dsregcmd /status` as CanReset: NonDestructive, Destructive, or DestructiveAndNonDestructive

### LWH WebApp (Globe Credential Provider)
- Discovers endpoint from `"AADWEBAUTH"` section of `navigation.json`
- Prompts for UPN, then MRU first-factor auth method
- User can select "Other ways to sign in" for all registered methods

### PIN Reset Flows
- **Above-lock PIN Reset**: Triggered from login UX via "I forgot my PIN"
- **On-demand PIN Management**: Triggered via "Set up my PIN" for WHfB credential recovery (e.g., TPM failure)
