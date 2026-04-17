# MultiCAEvaluationLog Decoder

## Overview
Decode Conditional Access policy evaluation logs from ESTS `AllPerRequestTable.MultiCAEvaluationLog` column.

## Tool
Available in LogsMiner (no special permission needed).

## Log Format
```
0|PolicyId=PolicyEvaluationResult,PolicyValidationResult,ConditionEvaluationResult,...
```
- `0`: version
- `|`: policy separator
- Fields are comma-separated within each policy

## Key Fields

### PolicyEvaluationResult
| Value | Meaning |
|---|---|
| 4 | Applied |
| 8 | Other (filter with `=4,` for applied policies) |

### ConditionEvaluationResult Prefixes
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

### ChallengeFromSessionControls
| ID | Control |
|---|---|
| 0 | NotSet |
| 1 | AppEnforcedRestrictions |
| 2 | CloudAppSecurity |
| 3 | SignInFrequency |
| 4 | PersistentBrowserSessionMode |
| 5 | Binding |
| 6 | AccessTokenLifetime |

### SupportedControls
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

## KQL Query (v0)
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').AllPerRequestTable
| where CorrelationId == "<correlation-id>"
| where env_time >= datetime(...) and env_time <= datetime(...)
| where Fork != "fork"
| where MultiCAEvaluationLog != "" and MultiCAEvaluationLog != "0|"
| project TenantId, UserPrincipalObjectID, RequestId, CorrelationId,
    CALog=split(MultiCAEvaluationLog, "|")
| mv-expand CALog
| where CALog contains "=4,"  // only applied policies
| project TenantId, UserPrincipalObjectID, RequestId, CorrelationId, CALog,
    PolicyId=tostring(split(CALog, "=", 0)[0]),
    Controls=tostring(split(CALog, ",", 3)[0]),
    SessionControls=tostring(split(CALog, ",", 5)[0]),
    AreControlsAlreadySatisified=tostring(split(CALog, ",", 7)[0])
```

## References
- v0 KQL: [ESTS-Main repo - v0_ca_log.kql](https://msazure.visualstudio.com/One/_git/ESTS-Main?path=/src/Product/Tools/ConditionalAccessDataHelperLib/MultiCAEvaluationLog/v0_ca_log.kql)
- v1 KQL: [ESTS-Main repo - v1_ca_log.kql](https://msazure.visualstudio.com/One/_git/ESTS-Main?path=/src/Product/Tools/ConditionalAccessDataHelperLib/MultiCAEvaluationLog/v1_ca_log.kql)
- Field definitions: [PolicyEvaluationData.cs](https://msazure.visualstudio.com/One/_git/ESTS-Main?path=/src/Product/Tools/ConditionalAccessDataHelperLib/MultiCAEvaluationLog/PolicyEvaluationData.cs)

## Source
- OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > General Tools > MultiCAEvaluationLog Decoder
