# MFA Registration Troubleshooting Guide (TSG2)

> Source: OneNote - Philip AAD MFA Deep Dive (TSG2 + Additional 3)
> Status: draft

## Registration Stage Mapping

| Stage | Log Source | Key Signal |
|-------|-----------|------------|
| **MFA Enablement** | MSODS IfxAuditLoggingCommon | operationName: "Enable Strong Authentication" |
| **Registration Redirect** | ESTS PerRequestTableIfx | ErrorCode: UserStrongAuthEnrollmentRequiredInterrupt |
| **ProofUp Phase** | ESTS | MfaStatus: SkipMfaDuringProofUp |
| **Verification Delivery** | SAS AllSASCommonEvents | Scenario:RegisterProof, PartnerOnBehalfOf:IAMUX |
| **Registration Completion** | MSODS IfxAuditLoggingCommon | operationName: "Update user" (x4-6 entries) |
| **Post-Registration Login** | ESTS | MfaStatus: MfaDoneInCloud → MfaFromCredential |

## Complete Registration Timeline

```
T+0s   [MSODS]  Admin/SP enables Per-user MFA → StrongAuthenticationRequirement = "Enabled"
T+1min [ESTS]   User logs in (password auth) → MfaStatus: (empty)
T+2min [ESTS]   ESTS detects MFA needed → UserStrongAuthEnrollmentRequiredInterrupt
                → Redirects to MFA registration page (ProofUp)
T+2min [ESTS]   ProofUp phase → MfaStatus: SkipMfaDuringProofUp
T+3min [SAS]    User selects method → Throttling+Reputation checks → Scenario:RegisterProof
T+3min [CAPP]   Verification code sent (SMS/Voice/Push)
       [User]   Receives code → enters it
T+4min [SAS]    EndAuthentication: Success → Writes MfaMetadata
T+4min [MSODS]  "Update user" x4-6 → StrongAuthenticationMethod written
                → MFA state: "Enabled" → "Enforced"
T+4min [ESTS]   MfaDoneInCloud → MfaFromCredential → Sign-in complete
```

## Key Kusto Queries (21V)

### 1. Who enabled MFA? (MSODS Audit)
```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxAuditLoggingCommon
| where env_time between(datetime(START)..datetime(END))
| where * has '{userObjectId}'
| project env_time, operationName, resultType, targetObjectId, actorObjectId, contextId, actorIdentityType
| order by env_time asc
```

### 2. Registration flow in ESTS
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time between(datetime(START)..datetime(END))
| where HomeTenantUserObjectId == '{userObjectId}'
| where TenantId == '{tenantId}'
| project env_time, CorrelationId, Result, ErrorCode, MfaStatus, ApplicationParentAppId, ResourceId
| order by env_time asc
```

### 3. SAS registration events
```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
| where env_time between(datetime(START)..datetime(END))
| where * contains '{tenantId}'
| where userObjectId == '{userObjectId}'
| project env_time, SourceCall, Msg, AuthenticationMethod
```

### 4. MFA request summary
```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').SASRequestEvent
| where env_time between(datetime(START)..datetime(END))
| where TenantId == '{tenantId}'
| where UserObjectId == '{userObjectId}'
| project env_time, ResultCode, IsSuccessfulAuthentication, AuthenticationMethod, OperationName, ResultSummary
| order by env_time
```

## Important Notes

- UserStrongAuthEnrollmentRequiredInterrupt is the key signal that user was redirected to ProofUp
- SkipMfaDuringProofUp is NORMAL during registration — MFA is temporarily exempted
- After registration, MFA state changes from "Enabled" to "Enforced"
- actorIdentityType: ServicePrincipalIdentity for admin-initiated MFA enablement
