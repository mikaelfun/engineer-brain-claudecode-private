# AVD Authentication Deep Dive

> Source: OneNote - AVD Authentication (Feature Verification)

## Authentication Layers
1. **To AVD service** (subscribe/gateway)
2. **To session host** (SSO)
3. **Inside session** (on-prem resource access)

## Conditional Access Audiences
- **Subscribe/Gateway**: Azure Virtual Desktop (app ID `9cdead84-a844-4324-93f2-b2e6bb768d07`)
- **Session Host**: Microsoft Remote Desktop (`a4a365df-50f1-4397-bc59-1a1564b8bb9c`) + Windows Cloud Login (`270efc09-cd0d-444b-a71f-39af4910ec45`)
- **Do NOT target**: Azure Virtual Desktop ARM Provider (`50e95039-b200-4007-bc97-8d5790743a63`) - only for user feed retrieval

## Three Authentication Protocols

| | PKU2U | RDSTLS | RDS AAD Auth |
|---|---|---|---|
| **RDP Property** | Not configured | `targetisaadjoined:i:1` | `enablerdsaadauth:i:1` |
| **Client requirement** | Must be AAD-joined to same tenant | No AAD join required | AAD SSO experience |
| **SSO to on-prem** | Password used, seamless SMB/IIS access | Password used, seamless SMB/IIS access | No password needed; requires Cloud Kerberos server object for on-prem |

## Fallback Behavior
- Source is AADJ/HAADJ + RdsAADAuth enabled in host pool + RdsAADAuth disabled on VM → falls back to CredSSP
- Source is workgroup + same config → **fails** with "your credentials did not work" (CredSSP not supported)
  - Fix: Add `targetisaadjoined:i:1` to fall back to RDSTLS instead

## Kusto Query: Determine Protocol Used
```kql
cluster('rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagCheckpoint
| where TIMESTAMP > datetime(2026-01-21T08:00)
| where ActivityId == "<ActivityId>"
| where Name == "OnSecurityProviderNegotiated"
| project TIMESTAMP, Name, ReportedBy, RequestId, Parameters, ParametersNonPii
| order by TIMESTAMP asc
```

## On-Prem Kerberos with AADJ Session Host
- Requires UPN/domainName/samAccountName synced to Entra ID (Entra Connect)
- Network connectivity to on-prem DC
- For passwordless (FIDO/WHFB): use Cloud Kerberos feature
- Config: `TargetEndpoint = 1` for Azure China Cloud

## References
- [SSO using Azure AD Authentication](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/557270/)
- [AAD Authentication Support for AVD & RDP](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/643032/)
- [Troubleshooting RDP to AADJ machines](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/550107/)
