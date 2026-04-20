# Entra ID Kerberos Auth & Delegation — 排查工作流

**来源草稿**: ado-wiki-a-kerberos-action-plan-templates.md, ado-wiki-a-kerberos-constrained-delegation-kcd-s4u2proxy.md, ado-wiki-a-kerberos-delegation-in-general.md, ado-wiki-a-kerberos-protocol-transition-s4u2self.md, ado-wiki-a-kerberos-resource-based-constrained-delegation.md, ado-wiki-a-kerberos-unconstrained-delegation.md, ado-wiki-a-kerberos-user-to-user-authentication-u2u.md, ado-wiki-b-configure-gmsa-kerberos-delegation.md, ado-wiki-b-kerberos-forest-trust.md, ado-wiki-b-kerberos-klist-features.md... (+39 more)
**场景数**: 25
**生成日期**: 2026-04-07

---

## Scenario 1: Situation requiring user-to-user authentication
> 来源: ado-wiki-a-kerberos-user-to-user-authentication-u2u.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Client/User requests TGS per Service B SPN/UPN. KDC encrypts TGS with the User Key.
- 1. Client sends TGS in _KRB_AP_REQ_ to Service B.
- 1. Service B cant decrypt TGS and responds with an error, requesting **Encrypt Ticket with Session Key from TGT** (per WP).
- 1. Client requests TGS from KDC, now with flag _**ENC_TKT_IN_SKEY**_ and the **User's TGT** in the _**Additional Tickets**_ section. KDC gets the **TGS (Logon) Session Key** from TGT for encrypting th
- 1. Now Service B can decrypt the TGS sent in the second KRB_AP_REQ because it also has the **TGS (Logon) Session Key** in its cache.

---

## Scenario 2: Introduction
> 来源: ado-wiki-b-kerberos-forest-trust.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In the **trusted** forest root domain, add the NetBios domain names to attribute **_msDS-SPNSuffixes_** at DN **CN=Partitions,CN=Configuration,_DC=DomainNamingContext_**, and restart NETLOGON for i
- 1. In the **trusting** forest root domain, select the trusted TDO in Domain.msc, update the information (via tab _**General**_, Validate or restart Netlogon) and in tab _**Name Suffix Routing**_ press
- 1. Click Start, click Run, type regedit, and then click OK.
- 1. Locate and then click the following registry subkey: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\kdc
- 1. On the Edit menu, point to New, and then click DWORD Value.
- 1. Type AllowedReplicationLatency, and then press ENTER.
- 1. Right-click AllowedReplicationLatency, and then click Modify.
- 1. Under Base, click Decimal.
- 1. In the Value data box, type the value that you want, and then click OK.
- 8. Exit Registry Editor.

---

## Scenario 3: Background
> 来源: ado-wiki-b-kerberos-klist-features.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. When running the command without any additional flags, only the current session of the security context that initiated the command line prompt is queried or modified.
- 1. There are different tickets cached for elevated and non-elevated sessions.

---

## Scenario 4: PAC verification
> 来源: ado-wiki-b-kerberos-pac-verification.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 5: ado-wiki-b-kerberos-rc4-customer-scenarios
> 来源: ado-wiki-b-kerberos-rc4-customer-scenarios.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  Regenerate the keytab files on the respective systems to explicitly include AES encryption types.
- 2.  If the device/software is too old to support AES, it must be updated or replaced.

---

## Scenario 6: <span style="color:CornflowerBlue">Relevant Windows Events and How to Interpret Them
> 来源: ado-wiki-b-kerberos-rc4-events-diagnostics.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 7: Author
> 来源: ado-wiki-c-kerberos-how-the-as-request-is-evaluated-at-the-kdc.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 8: Introduction
> 来源: ado-wiki-c-kerberos-kdc-proxy-flows-and-architecture.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Because the Kerberos client does not have a ticket-granting ticket (TGT), it calls ProxyMessage with a KRB_AS_REQ.
- 1. The KKDCP client establishes a TLS secure channel with the KKDCP server.
- 1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_AS_REQ to the KKDCP server.
- 1. The KKDCP server finds the KDC and sends the KRB_AS_REQ to the KDC.
- 1. The KDC returns a KRB_AS_REP to the KKDCP server.
- 1. The KKDCP server sends a KDC_PROXY_MESSAGE containing the KRB_AS_REP to the KKDCP client.
- 1. The KKDCP client returns the KRB_AS_REP and SUCCESS to the Kerberos client.
- 1. The Kerberos client processes the KRB_AS_REP and calls ProxyMessage with a KRB_TGS_REQ.
- 1. The KKDCP client sends a KDC_PROXY_MESSAGE containing the KRB_TGS_REQ to the KKDCP server.
- 1. The KKDCP server finds the KDC and sends the KRB_TGS_REQ to the KDC.

---

## Scenario 9: Author
> 来源: ado-wiki-c-kerberos-krb_as_req-authentication-request.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 10: Introduction
> 来源: ado-wiki-c-kerberos-over-external-trust.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 11: SPN purpose, format, registrations, and troubleshooting
> 来源: ado-wiki-c-kerberos-service-principal-names-and-how-clients-compose-it.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 12: Introduction
> 来源: ado-wiki-c-kerberos-via-untrusted-domain.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 13: Compliance note
> 来源: ado-wiki-d-aad-kerberos-auth-tsg.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. In ASC check sign-in events for that user to the "Windows Sign In" application.  (This application is indicative of PRT acquisition)
- 1. Click on "Troubleshoot this sign-in" to launch the authentication troubleshooter.
- 1. In the authentication troubleshooter, go to "Expert" view and filter the "PerRequestLogs" by the value KerberosOps.  There will be a line without output similar to this
- 1. [Check prerequisites](#check-prerequisites)
- 1. [Check TGT issuance Uplevel](#check-tgt-issuance-uplevel)
- 1. [Check Service Ticket issuance](#check-service-ticket-issuance)
- 1. Are they signed in with a hybrid user?
- 2. Do they have a PRT?
- 3. Is the client machine Hybrid Azure AD joined, or Azure AD joined?
- 4. Are there any AADJ errors?

---

## Scenario 14: Introduction
> 来源: ado-wiki-d-kerberos-error-codes-reference.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 15: Kerberos client
> 来源: ado-wiki-d-kerberos-kdc-registry-keys.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 16: Introduction
> 来源: ado-wiki-d-kerberos-pac-hardening-11b21.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 17: Scoping a Kerberos Support Request
> 来源: ado-wiki-d-kerberos-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. User: Name, FQDN Domain, [logon style](https://learn.microsoft.com/en-us/windows/win32/secauthn/user-name-formats) (legacy Domain\UserName or User Principal Name (UPN) UserName@Domain_FQDN), [role]
- 2. Client: Name, IP, Site, FQDN Domain, OS and build version, Platform, DNS suffixes, [supportedEncryptionTypes-Policy](https://learn.microsoft.com/en-us/archive/blogs/petergu/interpreting-the-support
- 3. Client Application: Name, Executable, used Server Name or URL (FQDN or NetBIOS Name) for [SPN](https://learn.microsoft.com/en-us/windows/win32/ad/service-principal-names), requirements to use Kerbe
- 4. KDC: Name, IP, OS and build, Platform, [Domain Mode DFL](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels)
- 5. Server: same as Client, roles
- 6. Server Application: Name, Executable, requirements to support Kerberos, Vendor setup instructions
- 7. Service Identity: Used Service Account, registered SPNs, [Delegation settings](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc772815(v=ws.10)#delegation-ex

---

## Scenario 18: Data analysis description
> 来源: ado-wiki-e-account-lockout-netlogon-kerberos-etl-analysis.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Sample from PDC - Request coming from another DC
- 2. Sample from Authenticating DC - Request coming from a member server/workstation:
- 3. Network Logon
- 4. Request coming with no source or domain information

---

## Scenario 19: Context
> 来源: ado-wiki-e-kerberos-4b24-pac-validation-changes.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. After a client completes the Kerberos AS and TGS flow, it then has the service ticket and authenticates to it.
- 2. The service calls AcceptSecurityContext (ASC) in Local Security Authority Subsystem Service (LSASS). If the service is not "Trusted," then it will proceed to request the service's DC to validate th
- 3. Kerberos then calls Netlogon:
- 4. Netlogon sends the request to the DC (or Read-Only Domain Controller (RODC)), and the request keeps being passed through until it reaches the service's DC.
- 5. Netlogon calls KDC to validate the PAC signatures and sends user/device information back.

---

## Scenario 20: Contributors
> 来源: ado-wiki-e-kerberos-5b22-adcs-kdc-sam-schannel-protections.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 21: Scenario-based troubleshooting
> 来源: ado-wiki-f-account-lockout-kerberos-auth-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 540.3840> SPM-Trace: Creating session for [af4.0]
- 540.3840> SPM-Trace: Creating session for [a34.0]
- 540.3840> SPM-Trace: Creating session for [c40.0]
- 540.2324> SPM-Trace: Creating session for [5e8.0]
- 540.2324> SPM-Trace: Creating session for [b50.0]
- 540.2324> SPM-Trace: Creating session for [618.0]
- 540.3840> SPM-Trace: NewTokenInfo : 1767f00
- 540.3840> SPM-Trace: TokenSize : 4d0
- 540.3840> SPM-Trace: CurrentSid : 17680c0
- 540.3840> SPM-Helpers: [3c0] LsapDupHandle(a98, c78 (@159eba0)) = 0

---

## Scenario 22: Common troubleshooting flow for account lockout issues
> 来源: ado-wiki-g-account-lockout-kerberos-caller-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Enable audit and netlogon debug log on all domain controllers (DCs), and wait for the next occurrence.
- 2. After re-occurrence, find event 4740 containing the concerned username on all DCs.
- 3. Filter out event 4771/4776 containing the concerned username on all DCs.

---

## Scenario 23: ado-wiki-g-kerberos-rc4-deprecation-scoping
> 来源: ado-wiki-g-kerberos-rc4-deprecation-scoping.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1.  **System event logs** from all DCs (filter for Event IDs 201�209, source KDCSVC)
- 2.  **Security event logs** from all DCs (Event IDs 4768, 4769 around the failure times)
- 3.  **`msDS-SupportedEncryptionTypes` attribute values** for affected accounts
- 4.  **`DefaultDomainSupportedEncTypes` registry value** from DCs (if set)
- 5.  **`RC4DefaultDisablementPhase` registry value** from DCs
- 6.  Output from **`List-AccountKeys.ps1`** and **`Get-KerbEncryptionUsage.ps1 -Encryption RC4`** if the customer can run them
- 7.  Any error codes or messages from client applications experiencing failures
- 8.  Network traces (NetMon or Wireshark) from the DC if the issue is ambiguous and needs protocol-level validation of the Kerberos exchange

---

## Scenario 24: Data Collection for Kerberos Support Requests
> 来源: ado-wiki-h-kerberos-data-collection.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 25: Introduction
> 来源: ado-wiki-h-kerberos-overview-of-features-introduced-with-windows-2012---windows-8.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. KPC uses WinHTTP to build the KPC-KPS channel.
- 1. KPC sends an HTTP POST over the KPC-KPS channel.
- 1. HTTP Service in KDC Proxy receives the HTTP POST request.
- 1. HTTP Service hands the HTTP POST request to Kerberos Proxy Server.
- 1. KPS extracts the Kerberos request from the HTTP POST and retrieves the target domain.
- 1. KPS sends the Kerberos request to the domain controller in the target domain.
- 1. KDC in the target domain processes the Kerberos request.
- 1. KDC produces the Kerberos response.
- 1. KDC sends the Kerberos response to KPS.
- 1. KPS receives the Kerberos response from KDC.

---


---

## Incremental Scenarios (2026-04-18)

## Scenario 26: Seamless SSO doesn't work as expected. Users get prompted for Password during sign in.
> Source: contentidea-kb (entra-id-3664) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Seamless SSO doesn't work as expected. Users get prompted for Password during sign in.
2. **Root cause**: After we hit login.microsoftonline.com, Azure AD detects that the tenant is enabled for seamless SSO and redirects the user as below. User gets Unauthorized challenged from Autologon Endpoint.  User f...
3. **Solution**: Searched for the correlationID in the response in Kusto to get further details.//Get all PerRequestTableIfx events associated with the CorrelationId cited in the client-side error to get a Summary vie...

---
