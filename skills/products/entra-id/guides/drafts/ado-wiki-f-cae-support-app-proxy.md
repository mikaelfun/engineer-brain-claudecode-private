---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/CaE Support for App Proxy"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FCaE%20Support%20for%20App%20Proxy"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# CAE (Continuous Access Evaluation) Support for App Proxy

## Summary

Since June 2025, CAE support is extended to Microsoft Entra ID Application Proxy, including non-CAE-aware apps. CAE is enabled by default for all users - no additional configuration needed.

**Key benefits**:
- Real-time token revocation for all App Proxy apps
- Instant session revocation via Entra portal
- IP-based enforcement via Conditional Access policies

## Sign-in Logs

Check both **interactive** and **non-interactive** sign-in events for:
```json
"authenticationProcessingDetails": [
    {"key": "Is CAE Token", "value": "True"}
]
```

~50/50 chance of seeing "Continuous access evaluation: Yes" in interactive vs non-interactive events.

## How to Disable CAE

### Tenant-wide
1. CA policy > Target resources: "All resources (formerly All cloud apps)"
2. Session > Customize continuous access evaluation > Disable
3. Enable policy: On

**Note**: Only works when "All cloud apps" is selected with no conditions.

### Per App Proxy Application (Preview)
```http
PATCH https://graph.microsoft.com/beta/applications/{objectId}/onPremisesPublishing
Content-Type: application/json

{"isContinuousAccessEvaluationEnabled": false}
```
Requires Application.ReadWrite.All permission.

## Strict Enforcement

Without strict enforcement, users failing CAE check receive a short-lived downgraded token. To fully block:

1. Configure location-based CA policy with Block access grant
2. Locations: Include "Any network or location", Exclude allowed locations
3. Session > Customize CAE > "Strictly enforce location policies"

## Troubleshooting

### ASC Authentication Diagnostics
1. Locate sign-in event (interactive or non-interactive)
2. Troubleshoot this sign-in > OAuth2:Token > IssuedTokens > ClientAndUserJsonWebToken
3. Check "Is xms_cc claim present in token" = 1 means CAE enforced

### Check for CAE Failures (Kusto)

**Cluster**: idsharedweu | **Database**: AADAP

```kusto
AadTokenValidationOperationEvent
| where env_time between (datetime(start) .. datetime(end))
| where ApplicationId == "<ApplicationID>"
| project env_time, transactionId, resultType, resultSignature, resultDescription, TokenType, CaeValidationEnabled
```

Verify: `TokenType` = "CaeToken" or "AccessCookieTokenClaims" AND `CaeValidationEnabled` = true (1).

### Check Why CAE Failed

```kusto
AadTokenValidationOperationEvent
| where ApplicationId == "<APPLICATIONID>"
| project env_time, transactionId, resultType, resultSignature, resultDescription, TokenType, CaeValidationEnabled, AuditMode, CapolidsLatebind, CaeEvents
```

Common: `cae_checks_reject_ip` = IP blocked by CA policy.

### Detecting Auth Loops

If no downgraded token issued (same CapolidsLatebind GUIDs persist), check:
- TransactionSummaries for `CaeCookieUnauthorized` or `PreAuthCaeAuthorizationFailed`
- Unlimited re-auths in sign-in logs = auth loop
- Escalate to eSTS engineering

### Traces DB (MISE logs)
```kusto
Traces
| where TransactionId == "<TRANSACTIONID>"
| project TIMESTAMP, Message, Level
```

## IcM Path
- Owning Service: AAD Application Proxy
- Owning Team: Data Path
