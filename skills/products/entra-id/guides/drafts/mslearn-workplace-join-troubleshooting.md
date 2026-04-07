# Workplace Join Troubleshooting (Device Registration Services)

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/cant-perform-workplace-join
> KB: 3045387

## Error 1: Before username/password prompt

> "Confirm you are using the current sign-in info, and that your workplace uses this feature."

Check Event Viewer: `Applications and Service Logs/Microsoft-Windows-Workplace-Join/Admin`

| Event ID | Description | Resolution |
|----------|-------------|------------|
| 103 | HTTP 404 | KB 3045386 |
| 103 | HTTP 503 | KB 3045388 |
| 102 | `0x80072EE7` — server name could not be resolved | KB 3045385 |
| 102 | `0x80072F19` — could not connect to revocation server | KB 3045384 |
| 102 | `0x80072F8A` — certificate has been revoked | KB 3045383 |
| 102 | `0x80072F0D` — certificate authority is invalid | KB 3045382 |
| 102 | `0x80072EFD` — connection could not be established | KB 3045381 |
| 102 | `0x80004005` — unknown error | KB 3045380 |
| 200 | Maximum number of devices reached | KB 3045379 |

## Error 2: After username/password prompt

> "Can't connect to the service."

See KB 3045378.

## Quick Diagnostic Steps

1. **Verify DNS**: `nslookup enterpriseregistration.domain.com`
   - Entra Join: should CNAME to `EnterpriseRegistration.windows.net`
   - Windows Server WPJ: internal → ADFS node, external → ADFS proxy
2. **Flush DNS**: `ipconfig /flushdns`
3. **Verify Device Registration enabled**:
   - Entra ID: Azure Portal → Directory → Configure → Device Registration → ENABLE WORKPLACE JOIN = Yes
   - On-prem: AD FS Management Console → Relying Party Trusts → DRS trust enabled
4. **Verify AD FS & DRS services running** on all farm nodes
5. **Verify Host Name Bindings**: `EnterpriseRegistration.domain.com` bound to port 443
6. **Update Root Certificates** via Windows Update
7. **Verify firewall/proxy rules**: allow inbound TCP to `EnterpriseRegistration.domain.com` reaching DRS server
