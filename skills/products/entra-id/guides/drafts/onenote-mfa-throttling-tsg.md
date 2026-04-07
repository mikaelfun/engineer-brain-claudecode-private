# MFA Throttling Troubleshooting Guide (TSG3)

> Source: OneNote - Philip AAD MFA Deep Dive (TSG3 + Throttling Types)
> Status: draft

## Two-Layer Throttling Architecture

```
MFA Request → Layer 1: AAD Gateway → Layer 2: SAS Service → Telephony (RepMap)
```

If throttled at Gateway → request NEVER reaches SAS.

## Throttling Types (Priority Order)

| Level | Scope | Key Indicator | Impact |
|-------|-------|---------------|--------|
| **AAD Gateway** (L1) | All requests | EffectiveStatusCode=429, IsThrottled=true | HIGHEST — blocks all MFA |
| **Per-Client** (L2) | Partner service (EvoSTS) | sas.beginauth.client.cn enforcement | All users affected |
| **Per-App** (L2) | ApplicationId | sas.beginauth.app.* | Same app across tenants |
| **Per-Tenant** (L2) | Tenant-wide | sas.beginauth.tenant.cn | Many users+apps in tenant |
| **Per-User/Session** (L2) | Single user | sas.beginauth.user.cn / throttle.sas.session | Single user only |
| **Per-AuthMethod** (L2) | Auth method | sas.beginauth.tenant.authmethod.cn | One method (e.g. SMS) |
| **Telephony/RepMap** | Country | BlockAllEnterpriseSms/VoiceTrafficInCountry | Country-level block |
| **CAPP-Level** | Multiple | CheckingLevel + IsEnforce:True | Per-device/phone/API |

## 4-Step Diagnostic Decision Tree

### Step 1: Check AAD Gateway
```kql
cluster('idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn').database('AADGatewayProd').AllRequestSummaryEvents
| where env_time between (startTime .. endTime)
| where TargetService contains "mysignins"
| where EffectiveStatusCode startswith "429"
| summarize count() by bin(env_time, 1h)
```
If 429 found → Gateway throttle. Request never reached SAS.

### Step 2: Check SAS Throttling
```kql
cluster('idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn').database('idmfacne').AllSASCommonEvents
| where env_time between (startTime .. endTime)
| where Msg has "throttl" or Msg has "TooManyRequests"
| where userObjectId == '{userObjectId}'
| project env_time, SourceCall, Msg
```

### Step 3: Determine Scope
Count distinct users, apps, tenants affected:
- Many users + many apps → Per-Tenant
- Same AppId across tenants → Per-App
- Single user → Per-User/Session

### Step 4: Check RepMap (Telephony)
Search SAS Msg for "BlockAll", "OptIn", "RepMap":
- If found → Country-level telephony fraud block
- Solution: Switch to Authenticator app (TOTP/Push)

## ADO Wiki References

| Scenario | Reference |
|----------|-----------|
| Per-App | [Debug Per-App Throttling ICMs](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/10099) |
| Per-Client | [Debug Per-Client Throttling ICMs](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/10094) |
| Per-AuthMethod | [Debug SAS Throttling ICMs](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/10092) |
| Per-Tenant | [Debug Per-Tenant Throttling ICMs](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/10106) |
| Per-User/Session | [Debug Per-User/Session Throttling ICMs](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/10114) |
| Tenant+AuthMethod | [Debug ThrottleTenantPerAuthMethod](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/13680) |
| Client+Tenant+AuthMethod | [Debug Per-Client-Tenant-AuthMethod](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/17879) |
