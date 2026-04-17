# MultiCAEvaluationLog Decoder

## Overview
Decoder guide for the `MultiCAEvaluationLog` column in ESTS `AllPerRequestTable`. This field contains Conditional Access policy evaluation results for each sign-in request.

## Log Format
```
<version>|<PolicyId>=<PolicyEvaluationResult>,<PolicyValidationResult>,<ConditionEvaluationResult>,<ExternalControls>,<SessionControls>,<ChallengeFromSessionControls>,<PolicyDisplayName>,<AreControlsAlreadySatisfied>,...
```
Policies are separated by `|`.

## PolicyEvaluationResult Values
- `4` = Applied (filter with `contains "=4,"` for applied policies)
- `8` = Other result (check source for full enum)

## Condition Evaluation Prefixes

| Prefix | Condition |
|---|---|
| 1- | AppCondition |
| 2- | UserCondition |
| 3- | DevicePlatformCondition |
| 4- | LocationCondition |
| 5- | ClientTypeCondition |
| 6- | SignInRiskCondition |
| 7- | UserRiskCondition |
| 8- | TimeCondition |
| 9- | DevicesCondition |
| 10- | ClientCondition |
| 11- | ServicePrincipalsCondition |

## Supported Controls

| ID | Control |
|---|---|
| 0 | NotSet |
| 1 | Block |
| 2 | Mfa |
| 3 | RequireCompliantDevice |
| 4 | RequireDomainJoinedDevice |
| 5 | RequireApprovedApp |
| 6 | RequireCompliantApp |
| 7 | FederatedMfa |
| 8 | FederatedCertAuth |
| 9 | MfaRegistration |
| 10 | MfaAndChangePassword |

## Session Controls

| ID | Control |
|---|---|
| 0 | NotSet |
| 1 | AppEnforcedRestrictions |
| 2 | CloudAppSecurity |
| 3 | SignInFrequency |
| 4 | PersistentBrowserSessionMode |
| 5 | Binding |
| 6 | AccessTokenLifetime |

## KQL Decoder Query (v0)
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').AllPerRequestTable
| where CorrelationId == "<correlation-id>"
| where env_time >= datetime(<start>) and env_time <= datetime(<end>)
| where Fork != "fork"
| where MultiCAEvaluationLog != "" and MultiCAEvaluationLog != "0|"
| project TenantId, UserPrincipalObjectID, RequestId, CorrelationId, CALog=split(MultiCAEvaluationLog, "|")
| mv-expand CALog
| where CALog contains "=4,"  // applied policies only
| project TenantId, UserPrincipalObjectID, RequestId, CorrelationId, CALog,
    PolicyId=tostring(split(CALog, "=", 0)[0]),
    Controls=tostring(split(CALog, ",", 3)[0]),
    SessionControls=tostring(split(CALog, ",", 5)[0]),
    AreControlsAlreadySatisfied=tostring(split(CALog, ",", 7)[0])
```

## Tool Access
- LogsMiner has a built-in MultiCAEvaluationLog decoder (no extra permission needed)

## Source Code Reference
- v0 parser: https://msazure.visualstudio.com/One/_git/ESTS-Main?path=/src/Product/Tools/ConditionalAccessDataHelperLib/MultiCAEvaluationLog/v0_ca_log.kql
- v1 parser: https://msazure.visualstudio.com/One/_git/ESTS-Main?path=/src/Product/Tools/ConditionalAccessDataHelperLib/MultiCAEvaluationLog/v1_ca_log.kql

## Source
OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > General Tools > MultiCAEvaluationLog Decoder
