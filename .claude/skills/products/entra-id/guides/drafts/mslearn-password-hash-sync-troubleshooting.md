# Password Hash Synchronization Troubleshooting Guide

> Source: [Microsoft Learn - Troubleshoot password synchronization](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/troubleshoot-pwd-sync)

## Prerequisites

- Latest version of Microsoft Entra Connect installed
- Directory synchronization in healthy state

## Scenario A: Some Users Cannot Sign In

### 1. "User must change password at next logon" is selected
- Clear the checkbox in AD Users and Computers, OR have user change password, OR enable ForcePasswordChangeOnLogOn feature
- Wait a few minutes for sync

### 2. User changed password in cloud portal
- Have user change on-prem password instead
- Or enable Password Writeback for cloud-to-on-prem sync

### 3. User not syncing to Entra ID (duplicate UPN/email)
- Use IdFix DirSync Error Remediation Tool to identify object issues

### 4. User moved between sync scopes
- Domain/OU/attribute filtering changed; perform initial sync (see below)

### 5. Can sign in with old password but not new (after disabling sync)
- Re-enable directory sync and password sync via Entra Connect wizard

### 6. Password hash missing (pre-Windows Server 2003 account)
- Account created on legacy DC may lack password hash

## Scenario B: All Users Passwords Not Synced

Common causes:
- "Start synchronization when configuration completes" was not selected
- Entra Connect server is in **Staging mode**
- Password synchronization is **disabled**
- Full directory sync has not completed (PHS requires full sync first)

## Event ID Reference

| Event ID | Meaning | Action |
|----------|---------|--------|
| 622/623 | Full PHS completed for domain/forest | Info only |
| 650/651 | Batch start/end for updated passwords | Info only |
| 653/654 | Ping start/end (no passwords to sync) | Info only |
| 656 | Password change detected | Info only |
| 657 (Success) | Password synced successfully | Info only |
| 657 (Failed) | Password failed to sync | Investigate user |
| 0 | Password changes failed, scheduled retry | Check object sync |
| 115 | Access denied after FIM credential update | Re-run Config Wizard |
| 611 | PHS failed for domain (various RPC/replication errors) | See specific sub-error |
| 652 | "Password Synchronization has not been activated" | Enable PHS |
| 655 | Ping failed - PHS not activated | Enable PHS |
| 6900 | Unexpected error processing password change | Check credentials/activation |

## PowerShell Commands

### Initial Sync
```powershell
Import-Module ADSync
Start-ADSyncSyncCycle -PolicyType Initial
```

### Full Password Sync
See: [Azure AD Sync: PowerShell to Trigger Full Password Sync](https://learn.microsoft.com/en-us/archive/technet-wiki/28433)
