---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/AVD or RDP Sign in using WHfB or FIDO2/AVD or RDP Sign in using WHfB or FIDO2 RDP Deep Dive"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Hello%20for%20Business/AVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2/AVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2%20RDP%20Deep%20Dive"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# New authentication protocol for Remote Desktop connections

## Understanding the RDP Protocol

The existing RDP protocol using PKU2U for cloud-based Azure AD joined devices is self-limiting and works only with Windows-devices using password-authentication.

The new TLS-based RDP protocol will replace and obsolete PKU2U based RDP by providing an extensible and secure architecture between the client-machine that initiates the RDP connection (AAD client using WAM or MSAL), and the target-machine being connected to (CloudAP and AAD-STS).

## Token acquisition and redemption

Terms referenced in this flow:

- **RDP Client**: The host machine on which the user is initiating an RDP connection using either mstsc.exe or Azure Virtual Desktop's Remote Desktop clients.
- **WAM/MSAL**: The Entra ID clients facilitating authentication between client and server (aka: target).
- **Terminal Service**: TermSrv.dll is a Remote Desktop Service that allows users to connect interactively to a remote computer.
- **LSA/CloudAP**: Local Security Authority (LSA) and Cloud Authentication Provider is a protected subsystem on the target-machine that authenticates and logs users onto the local system.

### Authentication Flow

- **Step 0**: CloudAP updates the P2P device certificate on the target device every 8 hours and when device reboots.
- **Step 1**: RDP client sends X.224 Connection Request to TermSrv on the target device. If the .RDP file had the `enablerdsaadauth:i:1` property set, the client adds PROTOCOL_RDSAAD (0x10) to the list of requested protocols. Protocol is accepted if:
  1. RDS AAD Auth is not disabled in Group Policy (fEnableRdsAadAuth registry value is absent or set to 1).
  2. The device is AAD-Joined or Hybrid-AAD-Joined.
  3. Attempt of getting TS Nonce value from CloudAP security package succeeds.
- **Step 2**: RDP client requests a Delegation Token (DT) from WAM/MSAL, generates an RSA binding key pair and includes the public key.
- **Step 3**: WAM passes User credential, Client binding public key, Target device host name/ID to Azure AD. ESTS validates no duplicate devices, mints DT bound to target device containing Client Binding Key. Also creates AT (access token) with hash of DT, target device ID, user ID/SID signed with Tenant P2P Root Cert.
- **Step 4**: RDP client establishes TLS connection to TermSrv, validates Target Device P2P Certificate and Device ID.
- **Step 5**: RDP client requests nonce from Entra ID (`Nonce AAD`).
- **Step 6**: RDP client requests nonce from target device RDS Service → LSA/CloudAP generates `Nonce TS`.
- **Step 7**: RDP client signs DT + both nonces with client binding key, sends to TermSrv.
- **Step 8**: LSA/CloudAP/AAD Plugin performs pre-authorization: validates AT, matches DT, compares target device ID, validates TS-Nonce, packages cred buffer.
- **Step 9**: LSA/CloudAP performs network logon with cred buffer.
- **Step 10**: Non-cached: LSA performs interactive logon with DT, Entra ID validates device key + client key + DT + nonce. Cached: LSA performs cached-logon and async PRT refresh.
- **Step 11**: LSA receives encrypted token from Entra ID.
- **Step 12**: TermSrv completes user authorization and launches interactive logon.
- **Step 13**: Winlogon completes the interactive logon connecting user to the session.

## Delegation Token Risk

Delegating tokens for RDP into Entra registered devices raises concerns about potential misuse. Entra ID shows a security prompt during AuthZ flow. The consent prompt can be hidden by configuring a list of trusted devices.

ESTS session store remembers up to 15 devices per user, auto-revokes after 30 days (FIFO). If >15 devices in 30 days, oldest is pushed out.

## AVD Remote Desktop Service Sign-in Option

The `enablerdsaadauth` property must be added as an RDP property on the AVD host pool:
1. Navigate to AVD host pool > RDP Properties > Advanced tab
2. Add `;enablerdsaadauth:i:1` at the end
3. Click Save

## Remote Desktop Client (mstsc.exe) Sign-in Options

### Enable Web authentication

1. Download/create .RDP file
2. Edit > Advanced tab > check "Use a web account to sign in to the remote computer"
3. Or manually set `enablerdsaadauth:i:1` in the .RDP file

**Supported Connections:**

| Hostname in Hosts file | Web account option | Computer Name | Auth Method | Result |
|-----|-----|-----|-----|-----|
| Yes | Checked | NetBIOS name | FIDO | Success |
| Yes | Checked | NetBIOS name | WHfB | Success |
| No | Checked | Azure FQDN | FIDO | Error CAA20002 |
| No | Checked | Azure FQDN | WHfB | Error CAA20002 |
| No | Unchecked | IP address | FIDO | Prompted for password, smart card error |
| No | Unchecked | IP address | WHfB | Prompted for password, can use Hello PIN |

### Name Resolution Connect Error

Using web account sign-in flow requires hostname or DNS Name (FQDN). IP address connections are not supported.

## Web Authentication Flows

### Two-Factor authentication

User clicks "Use another account" > "Sign-in options" > "Sign in with Windows Hello or a security key". User must be in **Passkey (FIDO2)** authentication method policy. If not, error: "Your company policy requires that you use a different method to sign-in."

If user clicks **No** at delegation warning: Error CAA20004 (AADSTS650041: User terminated the request).

### Second Factor Authentication

User selects their account. Must be in FIDO2 policy AND have FIDO2 key registered to see "Other ways to sign in" option. WHfB alone is NOT considered a valid second factor (only works as primary auth with mfa claim). FIDO2 registered key enables both WHfB and FIDO2 as second factor options.
