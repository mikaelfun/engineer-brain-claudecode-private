---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/Useful PowerShell Scripts for AAD/Revoke Refresh tokens all users or Group of Users"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE+Identity+TSGs%2FIdentity+Technical+Wiki%2FUseful+PowerShell+Scripts+for+AAD%2FRevoke+Refresh+tokens+all+users+or+Group+of+Users"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Invalidate the refresh tokens issued to a user

Scenarios that could require an administrator to revoke all access for a user include compromised accounts, employee termination, and other insider threats. Depending on the complexity of the environment, administrators can take several steps to ensure access is revoked.

## Basics about Access tokens and refresh tokens

Access tokens and refresh tokens are frequently used with thick client applications, and also used in browser-based applications such as single page apps.

- Access tokens issued by Azure AD by default last for 1 hour. If the authentication protocol allows, the app can silently reauthenticate the user by passing the refresh token to the Azure AD when the access token expires.

## Revoke single user's Azure AD refresh tokens

To sign-out a single user you can either use Azure/Office 365 Portal or execute below command.

### Revoke Session for a single user using Azure Portal

(Navigate to user blade > Revoke sessions)

### Revoke Session for a single user using Office Portal

(Navigate to user > Revoke sessions)

### Revoke session for a single user using Azure AD PowerShell Module

```powershell
Connect-MgGraph -Scopes User.RevokeSessions.All
Revoke-MgUserSignInSession -UserId $userId
```

## Revoke Azure AD refresh tokens for multiple users

Collect either the **UserPrincipalName** or **ObjectID** of all the users you want to invalidate refresh tokens and store it in a `.txt` or `.csv` file, then import the file in PowerShell:

```powershell
Connect-MgGraph -Scopes User.RevokeSessions.All
$RevokeUsers = Get-Content -Path C:\Users\Location\RevokeSession.txt
foreach ($Revokeuser in $RevokeUsers)
{
    Revoke-MgUserSignInSession -UserId $Revokeuser
    Write-Host "Currently logging out $Revokeuser" -ForegroundColor Green
}
```

## Revoke Azure AD refresh tokens for all active users

Use below script to invalidate all active user sessions in your tenant. This would log out all the users from an active session and would ask them to sign-in again.

```powershell
Connect-MgGraph -Scopes User.Read.All,User.RevokeSessions.All
$Users = Get-MgUser -All
Foreach ($user in $users)
{
    Revoke-MgUserSignInSession -UserId $user.ObjectID
    Write-Host "Currently logging out $($user.DisplayName)" -ForegroundColor Green
}
```

## Audit Log Entry for Revoke Refresh Token Event

Above actions of revoking user refresh token create an Audit Log entry in Azure AD Portal.

## Documentation Links

- https://learn.microsoft.com/en-us/graph/api/user-revokesigninsessions?view=graph-rest-1.0&tabs=powershell
- https://docs.microsoft.com/en-us/azure/active-directory/enterprise-users/users-revoke-access
