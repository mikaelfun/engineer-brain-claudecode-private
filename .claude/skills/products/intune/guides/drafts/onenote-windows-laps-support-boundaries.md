# Windows LAPS with Azure AD — Support Boundaries & SAP Routing

> Source: OneNote — Mooncake POD Support Notebook/Intune/Windows TSG/Windows LAPS with Azure AD

## Team Ownership

### Intune Support Team
- Configuring and assigning LAPS MDM policies from the Management Portal
- Ensuring correct MDM policy is delivered and applied to targeted AADJ/HAADJ devices
- Proper usage of LAPS password management interface in Intune Portal

### Windows Directory Services Team
- All Win LAPS client functionality: password creation/update, login actions, invalid passwords
- Performance issues: crashes, memory leaks, slowness, LAPS-specific errors

### Azure Identity Team
- Tenant Discovery problems
- Azure AD registration issues
- Password retrieval from Device Settings, Graph API, or PowerShell
- Managing Azure AD LAPS via Device Settings (Portal, Graph API, PowerShell)
- Auditing and Azure AD Audit logs
- Microsoft Graph beta/deviceLocalCredentials API issues
- Microsoft.Graph and AzureAD PowerShell module cmdlets

## SAP Routing Quick Reference

| Scenario | Team | SAP |
|----------|------|-----|
| LAPS cannot create/update password (MDM managed) | Directory Services | Security \ Windows LAPS \ Manage clients |
| LAPS cannot create/update password (GPO managed) | Directory Services | Security \ Windows LAPS \ Manage clients |
| Post-Auth password update actions failing | Directory Services | Security \ Windows LAPS \ Manage clients |
| GPO settings not taking effect | Directory Services | Security \ Windows LAPS \ Manage clients |
| Win LAPS DLL crash/leak | Directory Services | Active Directory \ LSASS Process Crashes |
| Password not working via Win LAPS | Directory Services | Routing Win LAPS \ Client-side errors |
| Tenant Discovery from PRT fails | Identity | Azure AD \ Devices \ Windows Local Administrator Policy |
| Azure AD DRS errors during LAPS update | Identity | Azure AD \ Devices \ Windows Local Administrator Policy |
| Admin cannot manage LAPS passwords (Portal/Graph/PS) | Identity | Azure AD Roles and Administrators |
| Managing Azure AD LAPS on Device Settings | Identity | Azure AD \ Devices \ Windows Local Administrator Policy |
