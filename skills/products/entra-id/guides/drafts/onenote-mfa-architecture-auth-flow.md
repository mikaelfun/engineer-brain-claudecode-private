# MFA Architecture and Authentication Flow Guide

> Source: OneNote - Philip AAD MFA Deep Dive (pages 1, 3)
> Status: draft

## Core Components

| Component | Role |
|-----------|------|
| **EvoSTS (ESTS)** | Auth service — evaluates CA policies and per-user MFA settings, decides MFA method, issues tokens |
| **MSODS** | Directory backing store — stores user MFA registrations, OATH secrets, policies |
| **ADGW** | Gateway layer — brokers calls between ESTS and SAS, enforces rate limits |
| **SAS** | MFA orchestration — throttling checks, initiates challenges, validates codes |
| **CAPP** | Challenge delivery — routes SMS/Voice/Push via telecom/APNs/FCM with failover |
| **MAC** | Mobile Authenticator Communicator — receives Approve/Deny from Authenticator app |

## General MFA Auth Flow

1. User completes first-factor authentication (password)
2. ESTS evaluates CA policies + per-user MFA settings from MSODS
3. If MFA required → ESTS determines default MFA method
4. ESTS calls SAS via ADGW to initiate challenge
5. SAS performs throttling checks
6. Method-specific flow:
   - **TOTP**: SAS retrieves OATH secret from MSODS, validates locally (no CAPP)
   - **SMS**: SAS → CAPP → Telecom → User receives code → submits to ESTS → SAS validates
   - **Voice**: SAS → CAPP → Telecom → Call user → DTMF # confirm → CAPP reports to SAS
   - **Push**: SAS → CAPP → APNs/FCM → Authenticator → MAC reports result to SAS
7. SAS reports MFA success → ESTS issues token with MFA claim

## MFA Status Flow in ESTS Logs

```
RequireMfaInCloud → (MFA challenge) → MfaDoneInCloud → MfaFromCredential (subsequent requests)
```

## Key Kusto Queries (21V Mooncake)

### ESTS Log
```kql
cluster('estscnn2.chinanorth2.kusto.chinacloudapi.cn').database('ESTS').PerRequestTableIfx
| where env_time >= datetime(START) and env_time < datetime(END)
| where HomeTenantUserObjectId == '{userObjectId}'
| where TenantId == '{tenantId}'
| project env_time, CorrelationId, Result, ErrorCode, MfaStatus, AuthenticationType, SourcesOfMfaRequirement
| order by env_time asc
```

### MSODS Log
```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time >= datetime(START) and env_time < datetime(END)
| where * has '{userObjectId}'
| project env_time, correlationId, message, contextId
```

### SAS Log
```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
| where env_time >= datetime(START) and env_time < datetime(END)
| where userObjectId == '{userObjectId}'
| project env_time, SourceCall, Msg, AuthenticationMethod, contextId, correlationId
```

## TOTP Detailed Flow

1. ESTS determines MFA required, method = OATH TOTP
2. ESTS → SAS: initiate TOTP challenge
3. SAS checks throttling service
4. SAS retrieves OATH secret key from MSODS
5. SAS computes expected TOTP code (secret + current time)
6. SAS stores MFA session state (Redis/CosmosDB)
7. User opens Authenticator → gets code → submits
8. SAS re-retrieves secret, recomputes for current + adjacent windows
9. Code match → MFA success → ESTS issues token

## Important Notes

- TOTP is the only method that does NOT involve CAPP
- For Voice/Push: ESTS polls SAS every ~5s for MFA status
- MAC is the first component to know Push approve/deny result
- CAPP has background provider resiliency (failover, retries)
