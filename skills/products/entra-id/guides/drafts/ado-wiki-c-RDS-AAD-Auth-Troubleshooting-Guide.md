---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/RDS AAD Auth Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/RDS%20AAD%20Auth%20Troubleshooting%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# RDS AAD Auth Troubleshooting Guide

## Overview

RDS AAD Auth supports interactive AAD authentication and SSO when connecting to AADJ or HAADJ devices via:
- **mstsc.exe** (built-in Windows Remote Desktop Client)
- **AVD Remote Desktop clients** (nearly all platforms)

CSS perspective focus: general troubleshooting logic and common issues.

## Auth Components

**Client side:**
1. Microsoft Remote Desktop Client (mstsc): `5177BC73-FD99-4C77-A90C-76844C9B6999`
2. Azure Virtual Desktop Client (AVD): `a85cf173-4192-42f8-81fa-777a763e6e2c`
3. WAM AAD Broker Plugin

**Server side:**
1. Azure Virtual Desktop: `9cdead84-a844-4324-93f2-b2e6bb768d07`
2. Microsoft Remote Desktop (mstsc and AVD): `a4a365df-50f1-4397-bc59-1a1564b8bb9c`
3. Windows Cloud Login (replacement of Microsoft Remote Desktop since 2024): `270efc09-cd0d-444b-a71f-39af4910ec45`
4. Azure Windows VM Sign-in (AADJ Azure VM only): `372140e0-b3b7-4226-8ef9-d57986796201`

## Pre-Troubleshooting Checklist

### 1. Verify Supported Platform

- **mstsc client**: https://learn.microsoft.com/en-us/windows/client-management/client-tools/connect-to-remote-aadj-pc#connect-with-microsoft-entra-authentication
- **AVD client / Session Host**: https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on#prerequisites
- ⚠️ Server 2019 (AADJ) does NOT work with RDS AAD Auth even with 2022 9C servicing update. PKU2U protocol used instead.

### 2. Verify AAD Auth is Enabled (`enablerdsaadauth:i:1`)

- **mstsc.exe**: Check "Use a Microsoft Entra authentication account" checkbox in connection properties
- **RDP file**: Open in text editor, look for `enablerdsaadauth:i:1`
- **AVD client**: Check Host Pool RDP Properties → "Connections will use Microsoft Entra authentication"
- **Target machine registry** (optional): `HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services` → value `fEnableRdsAadAuth` should NOT be `DWORD 0`

### 3. Kerberos Server Object (HAADJ only)

Required when target is HAADJ or AADJ accessing on-premise resources. Must be configured per on-premises domain. See: https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-on-premises#create-a-kerberos-server-object

## Key Success Criteria

1. **RDP delegation token** issued by AAD to client (check ASC sign-in logs or Fiddler — look for `rdp_bt` claim in decoded Access Token)
2. Target machine exchanges RDP token for **PRT** with AAD (check target machine ASC sign-in logs)
3. For HAADJ: **on-premise TGT** (partial TGT) issued; DC must be reachable (look for `SC: '1,2'` in target machine sign-in)
4. For mstsc: entered device name must exactly match AAD Device `hostnames` attribute

## Data Collection

### Fiddler Trace (Client side)

- **mstsc/AVD Web**: Standard Fiddler with HTTPS decrypt enabled
- **AVD Windows client**: Start Fiddler AFTER clicking "Subscribe" and when login page pops up
- **AVD macOS/iOS/Android**: Use Fiddler Everywhere
- WAM exemption: Exempt "AAD Broker Plugin (Work or school account)" from Fiddler SSL decryption

**Key frames**: Look for correlation ID, client_id, resource. Decoded Access Token should contain `rdp_bt` claim.

### Auth Logs (Both client AND target machines)

Download auth script from https://aka.ms/authscript. Run on BOTH machines.

**AAD Analytic log - Client side**: Search keyword `0x4AA50119` → first entry shows WAM receiving mstsc/AVD request. Note `correlationId`.

**AAD Analytic log - Target side**: Search by correlationId from client. In working case, two correlation IDs appear; second one used by target to exchange PRT.

**Webauth.etl** (optional, superset of AAD Analytic): Use only if no valuable info in AAD Analytic.

### ASC Sign-in Logs

Use correlation ID if available. Otherwise use UPN/App ID.

- **Client side**: Look for delegation token (RDP token) issuance
- **Target AADJ**: Look for PRT issuance against "Azure Windows VM Sign-In"
- **Target HAADJ**: Look for `SC: '1,2'` (cloud TGT + on-premise TGT)

### Network/Kerberos Traces (HAADJ only)

Netmon.etl and Kerberos.etl included in target machine Auth logs.

In working case, Kerberos.etl should show:
> "using the McTicket to get a TGT"
> "Successfully redeemed AS_REP credential"

## Common Issues

### Issue 1: Windows Login Prompt Instead of AAD Prompt

**Cause**: RDS AAD auth negotiation failed, fell back to legacy auth.
- `enablerdsaadauth:i:1` not set on client or server
- Unsupported target OS (Server 2016/2019)
- Outdated AVD client

**Fix**: Verify `enablerdsaadauth` on both sides. Check supported OS. Test AVD Web client (https://client.wvd.microsoft.com/arm/webclient/); if works → upgrade desktop client.

---

### Issue 2: AADSTS293004 - Target Device Not Found (mstsc only)

**Symptom**: `AADSTS293004: The target-device identifier in the request {xxx} was not found in the tenant {xxx}`

**Cause**: Computer name in mstsc doesn't match any `hostnames` attribute on the AAD device object (e.g., short name `device_1` vs FQDN `device_1.contoso.com`).

**Fix** (choose one):
1. Add HOSTS entry on client machine pointing correct AAD device name to target IP
2. Check if hostname set via GPO/MDM DNS_PrimaryDnsSuffix — if incorrect, remove or fix
3. Configure "Primary DNS Suffix" on target machine (**Advanced System Settings > Computer Name > Change > More**) — triggers Device-Sync task to add FQDN to AAD device hostnames

> Note: AVD client uses device ID (not computer name) in auth, so rarely hits this issue.

---

### Issue 3: Repeated Windows Login Prompt on HAADJ Target

**Cause**:
- Azure AD Kerberos Server Object missing for user's domain
- Cannot reach domain controller or Kerberos auth failed

**Fix**: Create Kerberos Server Object per docs. Capture and analyze network/Kerberos traces on target machine.

---

### Issue 4: Repeated AAD Login Prompt on HAADJ Target (KDC_ERR_TGT_REVOKED)

**Cause**: Login account is member of **Domain Admins** or **local admin** group. By-design: domain admin/local admin connections denied via RDS AAD auth. `KDC_ERR_TGT_REVOKED` visible in network traces.

**Fix**: Change Password Replication Policy for AzureADKerberos computer object per: https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on#allow-active-directory-domain-administrator-accounts-to-connect

---

### Issue 5: Run as Different User Fails on AVD AADJ ("username or password incorrect")

**Cause**: Non-interactive auth for "Run as" tries to get token for "Azure Windows VM Sign-in" resource. CA policy (e.g., MFA required) blocks non-interactive flow. Also: missing RBAC role "Virtual Machine User Login"/"Virtual Machine Administrator Login".

**Fix**:
1. Assign Azure RBAC role "Virtual Machine User Login" or "Virtual Machine Administrator Login"
2. Check ASC sign-in logs for CA policy blocking "Azure Windows VM Sign-In"; exclude app from CA policy if needed

---

### Issue 6: SSO Not Working When Connecting to New AVD Session Host

**Cause**: By-design. User must consent "Allow remote desktop connection" to each new session host, or when AAD cache limit (15 hosts/30 days) is reached.

**Fix**: Follow instructions to configure target device groups for automatic SSO: https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on#configure-the-target-device-groups

## ICM Escalation

Route to: **Azure > Azure Active Directory Authentication > Device Registration > RDS AAD Auth**

## Learning Materials

- AVD Supported identities: https://docs.microsoft.com/en-us/azure/virtual-desktop/authentication
- Configure AAD SSO: https://learn.microsoft.com/en-us/azure/virtual-desktop/configure-single-sign-on
- RDP to AADJ pc: https://learn.microsoft.com/en-us/windows/client-management/client-tools/connect-to-remote-aadj-pc
- Configure AAD Kerberos Server: https://learn.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-security-key-on-premises
