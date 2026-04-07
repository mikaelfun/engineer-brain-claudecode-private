---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/WebAuthN redirection for FIDO and WHfB in RDP Sessions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FWebAuthN%20redirection%20for%20FIDO%20and%20WHfB%20in%20RDP%20Sessions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# WebAuthN Redirection for FIDO and WHfB in RDP Sessions

## Summary

The Remote Desktop Client (mstsc.exe) and Windows Desktop client for Azure Virtual Desktop (AVD) support FIDO2 assertions from FIDO-aware browsers running on Windows computers.

Azure AD users in a remote RDP/AVD session receive WHfB or FIDO2 Security key PIN prompts **at the local computer** when visiting web pages requiring strong authentication on the remote computer.

**Protocol**: A new CTAP (Client to Authenticator Protocol) added into WebAuthN protocol passes FIDO2 assertions over RDP discrete channels back to the remote client where it enumerates local authenticators.

## Authentication Flows

### Two-Factor Authentication Sign-in with CTAP
- Username is NOT known initially
- User selects "Sign-in options" > "Sign-in with Windows Hello or Security key"
- Enters PIN, primary auth completes, `mfa` claim is issued

### Second-Factor Authentication with CTAP
- User already has primary auth in browser but no `mfa` claim in PRT
- Must have FIDO Security Key registered on their account
- Can use either WHfB or FIDO key to get `mfa` claim

## Requirements

- WHfB: Must be registered for the computer the user is physically in front of
- FIDO2: Security key must be registered as an authentication method for the user

## Unsupported

- Windows Desktop Web client and non-Windows clients
- B2B Guest user support

## Support Boundaries

| Issue | Support Queue | Area Path |
|---|---|---|
| RPC Connection failure on target, no events on source. Error 0x8007001F | AVD client / Remote Desktop Client | Azure\AVD\Remote Desktop Clients\Redirecting resources / Windows\RDS |
| Works in Chrome but not Edge | MSaaS Developer Browsers | Browser\Microsoft Edge |
| Basic CTAP/WebAuthN redirect fails in supported browser | MSaaS Windows Directory Services Premier | Windows Security Technologies\Windows Hello |
| Cryptographic Service / CTAP / WebAuthn Protocol issues | MSaaS Windows Directory Services Premier | Windows Security Technologies\Windows Hello |
| Two-factor CTAP redirection fails for Work/School accounts | MSaaS AAD Auth Professional/Premier | Azure\AAD Sign-In and MFA\Signing In without Password\FIDO2 |
| Second-factor CTAP redirection fails | MSaaS AAD Auth Professional/Premier | Azure\AAD Sign-In and MFA\Signing In without Password\FIDO2 |

## Key Terms

- **First factor authentication**: Primary auth, no `mfa` claim
- **Second factor authentication**: Additional verification for `mfa` claim (phone, certificate, etc.)
- **Two-factor authentication**: First + second factor completed in one step (WHfB, FIDO2, passwordless Authenticator)
