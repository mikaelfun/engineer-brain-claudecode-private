---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Tenant Restrictions/Universal Tenant Restrictions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Tenant%20Restrictions%2FUniversal%20Tenant%20Restrictions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Universal Tenant Restrictions (NaaS/ZTNA) Troubleshooting

## Key Concept: Two Traffic Paths

1. **TRv2 to Entra**: Adding TRv2 header to authentication requests (token issuance)
2. **TRv2 to M365 (SPO, EXO)**: Stamping M365 traffic with tenant information

**Most issues stem from inconsistent TRv2 tagging:**

| TRv2 to Entra | TRv2 to M365 | PID in Token | PID in Header | Outcome |
|:-:|:-:|:-:|:-:|---------|
| No | No | N/A | N/A | Redirects to Entra for token |
| No | Yes | N/A | P1 | Redirects (500 errors) |
| Yes | Yes | P1 | P1 | Pass (home tenant) / Block (foreign) |
| Yes | Yes | P2 | P1 | Block (token infiltration) |

## Troubleshooting Checklist

1. Verify Entra access token has `xms_trpid` claim (decode at jwt.ms)
2. Verify workload traffic has TRv2 header (sec-Restrict-Tenant-Access-Policy)
3. Check consistency between token claim and header

## Local TRv2 Validation with Fiddler

1. Stop/Pause NaaS Client
2. Start Fiddler with custom rules (Ctrl+R)
3. Set `a_TrStampAuthPath`, `a_TrStampSpoPath`, `a_TrStampExoPath` booleans
4. Header format: `sec-restrict-tenant-access-policy: <tenantId>:<policyId>`
5. Manipulate variables to simulate inconsistent signaling

## Kusto Queries

### Check TRv2 header and insertion result
```kusto
let naasCorrelationId = "<correlation_id>";
RoxyHttpOperationEvent
| where FlowCorrelationId == naasCorrelationId
| join RoxyHttpRequest on $left.RequestTransactionId == $right.transaction_id
| project TenantId, UserId, TRv2Enabled, Result, client_req_host, client_resp_status, app_server_status
```

### Check last TRv2 enabled timestamp
```kusto
let NaasTenantId = "<tenant_id>";
RoxyHttpOperationEvent
| where TenantId == NaasTenantId
| where TRv2Enabled == true
| summarize max(TIMESTAMP)
```

## Sample Issues

### Issue 0: 500 redirects for Outlook
- **Cause**: Entra auth traffic not going through NaaS, xms_trpid missing
- **Fix**: Enable TRv2 signaling on Entra path (login.microsoftonline.com)

### Issue 1: TRv2 enforcement not taking effect
- Wait ~30 min for propagation
- Verify TRv2 flag enabled, check client acquisition, verify Kusto stamping

### Issue 2: Cannot access allowed tenants
- Distinguish outbound access (home identity) vs TRv2 (external identity)
- Check token claim, Kusto TRv2 data, app_server_status

### Issue 3: Missing claim error
- Verify Traffic Profile acquires login.microsoftonline.com
- Test locally with Fiddler
- Escalation path: NaaS Datapath or eSTS

### Issue 4: EXO not blocked
- Block QUIC and IPv6 protocols
- Verify FQDN acquisition

### Issue 5: Search not rendering
- Known issue

### Issue 6: TRv2 error not showing user IP
- Turn ON SourceIP restoration
