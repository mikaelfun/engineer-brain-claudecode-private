---
title: "Conditional Access Kusto Troubleshooting"
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Authentication/Conditional Access/Kusto.md"
product: entra-id
21vApplicable: true
---

# Conditional Access Kusto Troubleshooting (Mooncake)

## Kusto Cluster
- Cluster: `estscnn2.chinanorth2.kusto.chinacloudapi.cn`
- Database: `ESTS` (general), `ESTSPII` (verbose/PII)

## Step 1: Query PerRequestTableIfx for CA evaluation

```kql
let start = datetime(YYYY-MM-DD HH:MM:SS);
let period = 12h;
PerRequestTableIfx
| where env_time > start - period and env_time < start + period
| where CorrelationId contains "<correlation-id>"
| project env_time, CorrelationId, RequestId, ClientTypeForConditionalAccess, Result, ApplicationId, ResourceId, ErrorCode, ConditionalAccessVerboseData
```

## Step 2: Parse ConditionalAccessVerboseData

Format: `outcome|policySourceType;policyObjectId;control;;`

PolicySourceType enum:
- 0 = NotSet
- 1 = TenantWide (IPC policy based on signin risk)
- 2 = Audience (old CA policy from AUX or new policy type 10)
- 3 = ClaimsParameter (claims request parameter, used in OBO flow CA challenges)
- 4 = AppManifest (CA dependency using old AUX policies on service principals)
- 5 = MultiConditionalAccessPolicy (new CA policies from Azure portal)
- 6 = TenantDefaultPolicy (deprecated)

## Step 3: Query DiagnosticTracesSecureIfx for verbose CA logs

```kql
DiagnosticTracesSecureIfx
| where env_time between (datetime(YYYY/MM/DD HH:MM)..datetime(YYYY/MM/DD HH:MM))
| where RequestId == "<request-id>"
```

Look at Message field for `DataForAuthenticationStrengthEvaluation`:
- `AuthMethodsAlreadyCompleted`: methods user has completed
- `AuthMethodsRegisteredByUser`: methods available to user
- `AuthMethodsAllowedByPolicy`: methods policy allows
