---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Network trace analysis for Integrated Windows Auth_KCD"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Network%20trace%20analysis%20for%20Integrated%20Windows%20Auth_KCD"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Network Trace Analysis for IWA/KCD with App Proxy

How to collect and analyze network traces to troubleshoot Kerberos authentication for IWA/KCD SSO through Microsoft Entra Application Proxy.

## Prerequisites

- If multiple connector servers, stop service on all but one for testing
- This example covers: connector, users, and service account all in the same domain

## Steps to Capture Network Trace

### 1. Clear Cached Kerberos Tickets

Must clear cached tickets first — otherwise Kerberos traffic won't appear in the trace:

```powershell
Get-WmiObject Win32_LogonSession |
    Where-Object {$_.AuthenticationPackage -ne 'NTLM'} |
    ForEach-Object {klist.exe purge -li ([Convert]::ToString($_.LogonId, 16))}
```

### 2. Start Network Trace

Options:
- **Netsh**: `Netsh Trace Start Capture=yes` / `Netsh Trace Stop`
- **Netmon** or **Wireshark** (packet capture utility)
- Run `ipconfig /flushdns` before reproduction

### 3. Reproduce and Stop

Reproduce the error, then stop the trace.

### 4. Analyze in Netmon/Wireshark

Filter: `KerberosV5` (Netmon) or `kerberos` (Wireshark)

## Working IWA/KCD Trace Example

```
95  AS Request    Cname: steve  Realm: TEST.COM  Sname: krbtgt/TEST.COM
96  KRB_ERROR     KDC_ERR_PREAUTH_REQUIRED (25)     <-- Expected, normal
103 TGS Request   Realm: TEST.COM  Sname: sync3$    <-- TGT request
105 TGS Response  Cname: steve                       <-- TGT granted
114 TGS Request   Realm: TEST.COM  Sname: http/sharepoint.test.com  <-- Service ticket
116 TGS Response  Cname: steve                       <-- Service ticket granted
```

- `KDC_ERR_PREAUTH_REQUIRED` is expected as part of normal Kerberos auth
- Frames 103/105: TGT request/response
- Frames 114/116: Service ticket request/response

## Error Trace Example: KDC_ERR_S_PRINCIPAL_UNKNOWN

```
548 TGS Request   Realm: TEST.COM  Sname: HTTP/websrv.test.com
550 KRB_ERROR     KDC_ERR_S_PRINCIPAL_UNKNOWN (7)
```

**Meaning**: DC could not find a Service Account in AD with a matching SPN.
**Fix**: Register the correct SPN on the service account using `setspn -s http/webapp.domain.com serviceAccount`.

## Known Failure: KDC_ERR_C_PRINCIPAL_UNKNOWN

If trace shows `KDC_ERR_C_PRINCIPAL_UNKNOWN`:
- Review workflow: "Entra App Proxy - KCD failure/KDC ERR C PRINCIPAL UNKNOWN"
- Common cause: Connector computer account lacks permissions (not in Windows Authorization Access Group)

## Reference

- [Kerberos Errors in Network Captures](https://blogs.technet.microsoft.com/askds/2012/07/27/kerberos-errors-in-network-captures/)
- If no quick fix based on Kerberos error → engage Active Directory team via collaboration
