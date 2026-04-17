# User Creation & Deletion Troubleshooting in Entra ID

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/dir-dmns-obj/troubleshoot-user-creation-deletion-issues

## Prerequisites

Required role: Global Administrator or User Administrator

## Common Errors

| Error | Root Cause | Fix |
|-------|-----------|-----|
| Another object with the same value for property userPrincipalName already exists | UPN must be unique; duplicate user exists | Use a different UPN or remove the conflicting user |
| Insufficient privileges to complete the operation | Missing Global Admin or User Admin role | Assign the required role |
| Property userPrincipalName is invalid | UPN contains disallowed characters | Follow UPN naming policy |
| The specified password does not comply with password complexity requirements | Password too simple, contains username, or in banned list | Use a stronger password |
| The domain portion of the userPrincipalName property is invalid | Domain not verified, or domain is Federated type | Verify domain and ensure it's Managed; for Federated domains, create user at IdP and sync |

## Directory Quotas

- **Free tier**: 50,000 Entra resources/tenant (default)
- With verified domain: up to **300,000**
- Self-service sign-up orgs stay at 50,000 even after admin takeover
- Exceeding quota → contact Microsoft Support

## API Methods

- Azure Portal: Users → New user
- Graph API: `POST https://graph.microsoft.com/v1.0/users`
- Graph PowerShell: `New-MgUser`
- Azure CLI: `az ad user create`

## Deletion & Recovery

- Deleted users go to Recycle Bin for 30 days
- Permanent deletion from Recycle Bin requires Global Admin
- Graph API: `DELETE https://graph.microsoft.com/v1.0/users/{id}`
