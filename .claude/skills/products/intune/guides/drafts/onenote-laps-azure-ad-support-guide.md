# Windows LAPS with Azure AD - Support Boundaries & Troubleshooting

## Support Boundaries

### Intune Team Owns
- Configuring and assigning LAPS MDM policies from Management Portal
- Ensuring correct MDM policy is delivered and applied to AADJ/HAADJ devices
- LAPS password management interface in Intune Portal

### Windows Directory Services Team Owns
- All Win LAPS functionality (password creation, updating, login actions, invalid passwords)
- LAPS performance issues (crashes, memory leaks, slowness, LAPS-specific errors)

### Azure Identity Team Owns
- Tenant Discovery problems
- Azure AD registration issues
- Password retrieval from Device Settings, Graph API or PowerShell
- Managing Azure AD LAPS via Device Settings (Portal/Graph API/PowerShell)
- Auditing and Azure AD Audit logs
- Microsoft Graph beta/deviceLocalCredentials API
- Microsoft.Graph and AzureAD PowerShell module cmdlets

## SAP Routing

| Scenario | Team | SAP |
|----------|------|-----|
| Win LAPS can't create/update password (MDM managed) | Directory Services | Security > LAPS > Manage clients |
| Win LAPS can't create/update password (GPO managed) | Directory Services | Security > LAPS > Manage clients |
| Post Authentication/Password Update action issues | Directory Services | Security > LAPS > Manage clients |
| GPO Settings not taking effect on client | Directory Services | Security > LAPS > Manage clients |
| LAPS DLL crash/leak | Directory Services | Active Directory > LSASS Process Crashes |
| Password not working when used via Win LAPS | Directory Services | Win LAPS > Client-side errors |
| Tenant Discovery from PRT fails (Event 10030) | Identity | Azure AD > Devices > Windows LAPS in Azure AD |
| Azure AD DRS errors during LAPS password update | Identity | Azure AD > Devices > Windows LAPS in Azure AD |
| Role issues managing LAPS passwords | Identity | Azure AD Roles and Administrators |
| Managing Azure AD LAPS from Portal/Graph/PS | Identity | Azure AD > Devices > Windows LAPS in Azure AD |
| Retrieving passwords from Device Settings/Graph/PS | Identity | Azure AD > Devices > Windows LAPS in Azure AD |
| Audit log issues (Reveal/Update password) | Identity | Azure AD > Audit Logs |
| Graph beta/deviceLocalCredentials API issues | Identity | Azure AD > Devices > Windows LAPS in Azure AD |
| Intune MDM settings config for Azure AD LAPS | Intune | Via Rave CRM collaboration |
| Intune MDM settings not applied on devices | Intune | Via Rave CRM collaboration |
| Password management in Intune Portal | Intune | Via Rave CRM collaboration |

## Kusto Troubleshooting Queries

### Query 1: Trace LAPS password update from Event Log
Obtain `<timestamp>` and `<correlationId>` from Event ID 10030 in Windows Event Log under LAPS/Operational. The correlationId is the client-request-id in the URL.

```kql
let t = datetime("<timestamp>");
let delta = 1min;
let ids = dynamic(["<correlationId>"]);
AdrsTraceEvent
| where env_time between ((t - delta) .. (t + delta))
| where correlationId in (ids)
| project env_time, message
```

### Query 2: Service-side trace via FindTraceLogs
- Cluster: `idsharedwus`
- Database: `ADRS`

```kql
let t = datetime("<timestamp>");
let delta = 10m;
let ids = dynamic(["<correlationId>"]);
cluster("idsharedwus.kusto.windows.net").database('ADRS').FindTraceLogs(t, delta, ids)
```

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Windows LAPS with Azure AD
