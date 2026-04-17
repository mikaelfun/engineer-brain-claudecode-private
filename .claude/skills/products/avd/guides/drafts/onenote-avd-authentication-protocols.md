# AVD Authentication Protocols for AADJ Session Hosts

> Source: OneNote - Mooncake POD Support Notebook (AVD Authentication + RDP scenarios)
> Status: draft

## Authentication Flow Overview

AVD authentication involves three stages:
1. **To AVD service** (subscribe/gateway)
2. **To session host** (SSO)
3. **Inside session** (accessing on-prem resources)

## Conditional Access Audiences

| Stage | App Name | App ID |
|-------|----------|--------|
| Subscribe / Gateway | Azure Virtual Desktop | 9cdead84-a844-4324-93f2-b2e6bb768d07 |
| To Session Host | Microsoft Remote Desktop | a4a365df-50f1-4397-bc59-1a1564b8bb9c |
| To Session Host | Windows Cloud Login | 270efc09-cd0d-444b-a71f-39af4910ec45 |
| RDP connection | Azure Windows VM Sign-in | 372140e0-b3b7-4226-8ef9-d57986796201 |

**WARNING**: Do NOT put CA on Azure Virtual Desktop Azure Resource Manager Provider (50e95039-b200-4007-bc97-8d5790743a63) - this is only used for retrieving user feed.

## RDP Protocol Comparison Matrix

| Aspect | No custom RDP property | targetisaadjoined:i:1 | enablerdsaadauth:i:1 |
|--------|----------------------|----------------------|---------------------|
| **Protocol** | PKU2U | RDSTLS | RDS AAD Auth |
| **HAADJ/AADJ client** | Yes (password + PIN) | Yes (password + PIN) | Yes (SSO) |
| **Workgroup/personal client** | **No** (fails) | Yes | Yes |
| **Web client** | **No** (fails) | Yes | Yes |
| **SSO to on-prem resources** | Password-based, seamless SMB/IIS | Password-based, seamless SMB/IIS | SSO, needs Cloud Kerberos for on-prem |

## Protocol Fallback Rules

- **Source is AADJ/HAADJ + RdsAADAuth enabled in host pool + disabled on VM**: Falls back to CredSSP (works)
- **Source is workgroup + RdsAADAuth enabled in host pool + disabled on VM**: **FAILS** with "your credentials did not work" (CredSSP not supported for workgroup)
  - Fix: Add `targetisaadjoined:i:1` to fall back to RDSTLS

## MFA Behavior Matrix

| Client Type | MFA Config | AVD Client MFA Required | AVD Client Login | Desktop MFA Required | Desktop Login |
|------------|-----------|------------------------|-----------------|--------------------|--------------| 
| Standard | Legacy per-user MFA | Yes | Yes | Yes | No |
| Standard | CA-controlled MFA | Yes | Yes | No | Yes |
| AADJ | Legacy per-user MFA | No* | Yes | Yes | No |
| AADJ | CA-controlled MFA | No* | Yes | No | Yes |

## Kusto Query - Determine Auth Protocol

```kql
cluster('rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagCheckpoint
| where TIMESTAMP > datetime(2026-01-21T08:00)
| where ActivityId == "<correlation-id>"
| where Name == "OnSecurityProviderNegotiated"
| project TIMESTAMP, Name, ReportedBy, RequestId, Parameters, ParametersNonPii
| order by TIMESTAMP asc
```

## Cloud Kerberos for Passwordless SSO to On-Prem

For AADJ VMs using RDS AAD Auth (enablerdsaadauth:i:1), accessing on-prem resources requires Cloud Kerberos configuration:
- Doc: https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-on-premises
- Set TargetEndpoint to **1** for Azure China Cloud
- Prerequisites: UPN/domainName/samAccountName synced to Entra ID via Entra Connect, network connectivity to on-prem DC

## Reference Links

- PKU2U: https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/550107/Troubleshooting-RDP-to-Azure-AD-Joined-machines
- RDSTLS: https://msazure.visualstudio.com/One/_git/ESTS-Docs?path=%2FProtocols%2FRDP%2FModernRdpUsingTLS.md
- RDS AAD Auth: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/557270/SSO-using-Azure-AD-Authentication
- AAD Auth for AVD & RDP: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/643032/AAD-Authentication-Support-for-AVD-RDP
