# UPN Matching for Identity Synchronization

> Source: [Microsoft Learn - How to use UPN matching](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/use-upn-matching-identity-sync)

## Purpose

Transfer source of authority for a user account from cloud (Office 365/Azure portal) to on-premises AD when using identity synchronization with Entra ID.

## UPN Matching Limitations

- UPN matching only runs when **SMTP matching fails** first
- Can only be used **one time** per user account
- Cloud user UPN **cannot be updated** during the matching process (it is the linking key)
- UPNs must be unique - duplicate UPNs cause sync failure with error: "Unable to update this object...user principal name is already associated with another object"

## Steps

### 1. Enable UPN Soft Match (if syncing started before March 30, 2016)

```powershell
Import-Module Microsoft.Graph.Identity.DirectoryManagement

$onPremisesDirectorySynchronizationId = "<your-directory-sync-id>"

$params = @{
    features = @{
        SoftMatchOnUpnEnabled = $true
    }
}

Update-MgDirectoryOnPremiseSynchronization `
    -OnPremisesDirectorySynchronizationId $onPremisesDirectorySynchronizationId `
    -BodyParameter $params
```

> Note: Automatically enabled for orgs that started syncing on or after March 30, 2016.

### 2. Get Cloud User UPN

- Office 365 portal > Users > find user > note User name (UPN)
- Or Azure portal > Entra ID > Users > find user > note User name

### 3. Create/Update On-Prem Account

In Active Directory Users and Computers, create or update user account with UPN matching the cloud UPN.

### 4. Force Directory Sync

```powershell
Start-ADSyncSyncCycle -PolicyType Delta
```

## Related

- SMTP matching: [KB 2641663](https://support.microsoft.com/help/2641663)
- Entra Connect Sync features: [UPN soft match docs](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-syncservice-features#userprincipalname-soft-match)
