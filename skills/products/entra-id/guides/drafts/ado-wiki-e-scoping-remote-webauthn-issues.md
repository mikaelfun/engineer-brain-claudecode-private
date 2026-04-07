---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Azure Active Directory Topics/WebAuthn - Local & Remote (Moving forward with Password less Strategy)/Scoping Remote WebAuthn Issues"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAzure%20Active%20Directory%20Topics%2FWebAuthn%20-%20Local%20%26%20Remote%20(Moving%20forward%20with%20Password%20less%20Strategy)%2FScoping%20Remote%20WebAuthn%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Scoping Remote WebAuthn Issues

Product Group anticipates most scenarios would be Remote WebAuthn issues.

## Pre-requisite Tests (Before Troubleshooting)

1. **Verify supported OS**:

   | Supported OS          | Version                                        |
   |-----------------------|------------------------------------------------|
   | Windows 11            | 22H2 (Backport to all previous Win11 Versions) |
   | Windows 10            | RS5 (1809) and Above                           |
   | Windows Server 2022   | 22H2 (Backport to all previous Versions)       |
   | Windows 2019          | 22H2                                           |

2. **Verify WHFB/FIDO2 registration**: User must have signed in using Windows Hello for Business (WHFB)/FIDO2 keys or registered WHFB/FIDO2 on the source machine. Note: You don't need to sign in to RDP/AVD using WHFB/FIDO2 keys.

3. **Verify client tool**: Must use Microsoft Terminal Services Client (MSTSC) or Microsoft Remote Desktop Client (MSRDC). Third-party tools like RDCMan or Citrix ICA are not supported for Remote WebAuthn.

4. **Try different browser**: Use Microsoft Edge. Can also use Procmon to identify if the browser is loading webauthn.dll.

5. **Use test website**: https://webauthn.io to isolate if the issue is with the target website or the platform.

6. **Check WebAuthn event logs**: If no events found, the problem is in the browser (not loading WebAuthn functions).
   - Path: `Eventvwr.msc | Applications and Services Logs | Microsoft | Windows | WebAuthn`

7. **Check for GPO/registry disabling WebAuthn**: Verify no Group Policy Object or manual registry keys disable WebAuthn redirection.

## Collaboration Scenarios

1. **Browser team**: No events in WebAuthn logs → browser has issues loading WebAuthn DLL. Enable Edge debug logs.
2. **Azure Identity**: Test website works but Azure MFA fails → engage Azure Identity team.
3. **Azure Identity**: WHFB/FIDO2 key sign-in problems → first triage by Azure Identity.
4. **Directory Services**: Cryptographic Service, CTAP, or WebAuthn protocol issues.
5. **Remote Desktop/AVD**: Target machine WebAuthn events show RPC connection failure, no events on source. Typical error: "0x8007001F. A device attached to the system is not functioning."

## Scoping Questions

1. **Local vs Remote WebAuthn?**
   - **Local WebAuthn**: Customer accessing a WebAuthn-enabled website on the client machine, not prompting for WHFB/FIDO keys.
   - **Remote WebAuthn**: Customer signed in via WHFB/FIDO2 on source machine, using RDP/AVD to connect to remote machine, trying to access WebAuthn-enabled website.

2. **Identify failure stage in the workflow.**

## Scenario 1: User connects to WebAuthn website, unable to see Sign-In options

**Troubleshooting:**
- Verify source/destination OS is in supported list
- Verify using Edge browser
- Use Procmon to verify WebAuthn.dll is loaded during browser launch
- Open WebAuthn event logs on source and destination machines
- Test with WebAuthn.io
- Engage Edge team if WebAuthn.dll not loaded and no event log errors

## Scenario 2: User unable to find "Sign in with Windows Hello or a security key" option

**Troubleshooting:**
- Verify supported OS
- Verify using Edge browser
- Check WebAuthn event logs on source and destination machines

## Scenario 3: User chooses WHFB/FIDO option and gets an error

**Typical error**: RPC server is unavailable

**Troubleshooting:**
- Check WebAuthn event logs on source and destination machines
- Verify Cryptography Service is running on source machine
- Troubleshoot Cryptographic Service issues on source machine

## Scenario 4: User is not provisioned to WHFB/FIDO on the source machine

**Indicator**: WebAuthn event logs show `UseVerifyingPlatformAuthenticatorAvailable: false`

**Troubleshooting:**
- Check WebAuthn event logs on source machine
- Verify user is provisioned with WHFB/FIDO2 keys (try signing in using WHFB/FIDO2)
- Troubleshoot WHFB/FIDO2 provisioning issues

## Scenario 5: User chooses WHFB option but gets error related to platform provider

**Troubleshooting:**
- Test with WebAuthn.io website
- This relates to the platform provider (WHFB/FIDO2 keys on source machine)
- Troubleshoot/isolate WHFB/FIDO2 key issues on source machine

## Scenario 6: User trying Azure MFA with WHFB/FIDO2 assertion gets an Azure AD error

**Note**: The error message is from Azure Active Directory. Collaborate with AzureAD team.

**Troubleshooting:**
- Use WebAuthn.io to verify WebAuthn platform is working
- Verify user is part of the FIDO2 Security key authentication methods in Entra ID
