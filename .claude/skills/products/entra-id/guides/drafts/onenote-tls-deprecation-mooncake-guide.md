---
title: "TLS 1.0/1.1/3DES Deprecation Troubleshooting Guide (Mooncake)"
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Authentication/Authentication (EvoSTS)/TLS 1.0_1.1_3DES deprecation.md"
product: entra-id
21vApplicable: true
---

# TLS 1.0/1.1/3DES Deprecation (Mooncake)

## Timeline
- Mooncake AAD: Started Dec 2023
- 6 phases, 4-5 weeks total
- Initially blocks tenanted requests only (for exception capability)

## Customer-Facing Error
- HTTP clients: AADSTS1002016 error
- Browsers: Azure portal returns error for tenant-specific endpoint (login.partner.microsoftonline.cn/organizations unaffected)

## Verification Tools
1. Test server TLS: https://testtls.com/ (e.g. login.partner.microsoftonline.cn)
2. Test browser TLS: https://browserleaks.com/ssl
3. Tenant-level TLS management: portal.azure.cn -> Manage Legacy TLS blade

## Server-Side Investigation (Kusto)

### Find blocked requests:
```kql
let tenantid = '<tenant-id>';
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time >= ago(1d)
| where Tenant == tenantid
| where Result == 'UserError'
| where MaskedResponse contains '1002016'
| project env_time, CorrelationId, RequestId, Result, MaskedResponse, HttpStatusCode, ApplicationId, ApplicationDisplayName
```

### Get request details:
```kql
let correlationId = '<correlation-id>';
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').DiagnosticTracesIfx
| where env_time > ago(1d)
| where CorrelationId == correlationId
| project env_time, Message, Exception
| order by env_time asc
```

## Test Environment Setup
- Disable TLS 1.2 via PowerShell (see MS docs)
- Browser: Use IE (Edge/Chrome ignore Internet Options TLS settings)
- Configure Internet Options > Advanced > Security > TLS checkboxes
- Use Fiddler with HTTPS decryption disabled to observe SSL handshake

## Exception Process
- Contact eSTS team per Identity Wiki contacts section
- Requires tenant ID for temporary exception grant
