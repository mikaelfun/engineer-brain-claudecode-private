# MFA Recommendation Kusto Troubleshooting

> Source: OneNote — Recommendations / TSG - Kusto query for MFA recommendation
> Quality: draft | Needs: review, update for Mooncake retirement context

## MFA Recommendation Types & Secure Score Impact

| Recommendation | Secure Score Points |
|---------------|-------------------|
| MFA should be enabled on accounts | +50 pts |
| External accounts with permissions should be removed | +30 pts |
| Deprecated accounts with permissions should be removed | +10 pts |
| There should be more than one owner assigned to your subscription | +5 pts |
| A maximum of 3 owners should be designated for your subscription | +5 pts |

## Step 1: Check Subscription MFA Evaluation Status

**Kusto cluster**: `romelogsmc.kusto.chinacloudapi.cn/Prod`

```kql
let subscriptionId = "<SubscriptionId>";
let startTime = datetime(YYYY-MM-DD HH:mm:ss);
ServiceFabricIfxTraceEvent
| where env_time between (startTime .. (startTime + 24h))
| where message contains subscriptionId
| where message contains "IdentityEnableMFAForAccountsWithPermissions"
    or message contains "Finshed assessing recommendation 'Enable MFA"
| project env_time, message
```

Look for assessment results showing users with no MFA by permission level (owner/write/read).

## Step 2: Check Individual User MFA Status

```kql
let userOid = "<UserObjectId>";
let endTime = datetime(YYYY-MM-DD HH:mm:ss);
ServiceFabricIfxTraceEvent
| where env_time between ((endTime - 5m) .. endTime)
| where message contains userOid
| project env_time, message
```

Check for:
- User-specific MFA: `Number of strong-auth requirements: 0` = MFA not configured
- CA Policy enforcement: `Policies enforcement state: NotEnforced` = no enforcing CA policy

## Step 3: Check Conditional Access Policy Evaluation

```kql
let endTime = datetime(YYYY-MM-DD HH:mm:ss);
ServiceFabricIfxTraceEvent
| where env_time between ((endTime - 5s) .. endTime)
| where tagId == "Microsoft.Azure.Security.Service.SecuritySubscriptionSnapshotter.Utils.IdentityUtils+Tracer::TraceInfo"
| where message startswith "Policy"
| parse message with policy:string '//// ' result:string
| parse result with * 'policyIncludesAzurePortal = ' policyIncludeAzurePortal
    'policyExcludesAzurePortal = ' policyExcludesAzurePortal
    ', policyEnforcesMfa = ' policyEnforcesMfa
    ', notEnforceMfaCauses = ' notEnforceMfaCauses
| project env_time, policyIncludeAzurePortal, policyExcludesAzurePortal, policyEnforcesMfa, notEnforceMfaCauses, policy
```

### Key Fields

- **policyIncludeAzurePortal**: Must include Azure Management App ID `797f4846-ba00-4fd7-ba43-dac1f8f63013` or `All`
- **policyEnforcesMfa**: Must be `True` for the policy to count
- **notEnforceMfaCauses**: Reasons why a CA policy doesn't satisfy the MFA recommendation:
  - `CaPolicyNotEnforceMfa` — policy control is not MFA (e.g., Block, RequireCompliantDevice)
  - `CaPolicyNotIncludeAzureManagementAppId` — policy doesn't cover Azure Management app

> Note: MDfC engine has had bugs where it cannot identify the Azure Management App ID correctly. Check if policy targets the correct App ID.
