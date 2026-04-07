# Co-management Admin Experience Guide

> Source: OneNote — Mooncake POD Support Notebook / Co-management / Admin Experience
> Quality: guide-draft (pending SYNTHESIZE review)

## Prerequisites

- Azure AD Premium
- EMS or Intune license for all users
- Configuration Manager version 1710 or later
- Hybrid AAD joined or AAD joined devices
- MDM authority must be Intune
- Windows 10 1709+

## Two Paths to Co-management

1. **Existing ConfigMgr clients**: Windows 10 devices already managed by ConfigMgr → set up hybrid AAD → enroll into Intune
2. **New internet-based devices**: Join Azure AD → auto-enroll to Intune → install ConfigMgr client

## Enable Co-management in SCCM

1. Administration workspace → Cloud Services → Co-management node → Configure co-management
2. Sign in with Intune-licensed account
3. Automatic enrollment options:
   - **All**: All ConfigMgr clients auto-enrolled to Intune
   - **Pilot**: Only pilot collection members auto-enrolled

## Switch Workloads

- **Configuration Manager**: CM continues to manage
- **Pilot Intune**: Switch only for pilot collection devices
- **Intune**: Switch for all co-managed Windows 10 devices

> **Key difference**: Pilot Intune = only pilot collection. Intune = pilot + all other co-managed devices.

## Cloud Management Gateway (CMG) Setup

### Requirements
- Azure subscription
- On-premises Windows server for CMG connection point
- Service connection point in online mode
- Server authentication certificate
- Clients must use IPv4

### Data Flow
1. Service connection point → Azure (HTTPS 443)
2. CMG connection point → CMG (TCP-TLS/HTTPS)
3. Client → CMG (HTTPS 443)
4. CMG → on-premises CMG connection point
5. CMG connection point → management point / software update point

### Setup Steps
1. Create CMG: Administration → Cloud Services → Cloud Management Gateway
2. Azure Resource Manager deployment (v1802+)
3. Configure server auth certificate (.PFX)
4. Set region, resource group, VM instances (1-16)
5. Add client trusted root certificates if using PKI
6. Enable content distribution (v1806+)

### CMG Troubleshooting Logs
- `CloudMgr.log` — CMG deployment
- `CMGSetup.log` — CMG setup
- `CMGService.log` — CMG service health
- `SMS_Cloud_ProxyConnector.log` — proxy connector
- `CMGHttpHandler.log` — client traffic

## Deploy CCM Client from Intune

Create Line of Business app with ccmsetup.msi and parameters:
```
CCMSETUPCMD="/NoCrlCheck CCMHOSTNAME=<CMG_FQDN>/CCM_Proxy_MutualAuth/8 SMSSiteCode=<SITECODE> AADRESOURCEURI=https://ConfigMgrService AADCLIENTAPPID=<APP_ID>"
```
Add `/NoCrlCheck` if CRL is not published.

## Key Log Files for Co-management

| Log | Purpose |
|-----|---------|
| CoManagementHandler.log | Co-management settings, enrollment |
| Scheduler.log | Task scheduling |
| SettingsAgent.log | Settings processing |
| CIAgent.log | Resource Access workload |
| WUAHandler.log | Windows Update workload |
| CompReplayAgent.log | Compliance replay |
| EndpointProtectionAgent.log | EP workload |

## Verify Hybrid AAD with dsregcmd

```cmd
dsregcmd /status
```

Key fields to check:
- `AzureAdJoined: YES` — device is AAD joined
- `AzureAdPrt: YES` — user has Primary Refresh Token (required for auto-enrollment)
- `DomainJoined: YES` — device is on-premises domain joined

## GPO-based MDM Auto-enrollment

Scheduled task path: Computer Configuration → Policies → Administrative Templates → Windows Components → MDM → Auto MDM Enrollment with AAD Token

### CMG Client Location
- Clients get CMG location automatically on next location request (24h cycle)
- Force refresh: restart SMS Agent Host service (ccmexec.exe)
- Force CMG always: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\CCM\Security → ClientAlwaysOnInternet = 1`
- Verify: `Get-WmiObject -Namespace Root\Ccm\LocationServices -Class SMS_ActiveMPCandidate | Where-Object {$_.Type -eq "Internet"}`

## Workload Determination (WMI)

```
WMI: root\ccm\clientSDK
Class: CCM_ClientUtilities
Method: IsSCCMWorkloadEnabledForStr
Parameter: isSCCMEnabled
Log: CCMSDKProvider.log
```

## 21v Applicability

Applicable with caveats — CMG in 21v requires China Azure deployment.
