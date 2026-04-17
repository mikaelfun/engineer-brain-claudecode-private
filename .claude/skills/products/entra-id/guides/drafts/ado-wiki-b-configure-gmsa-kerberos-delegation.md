---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/GMSA/Configure gMSA for Kerberos delegation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGMSA%2FConfigure%20gMSA%20for%20Kerberos%20delegation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Configuring delegation for Group Managed Service Accounts (gMSAs)

Group Managed Service Accounts (gMSAs) support delegation, but the application team is responsible for configuring the service account (gMSA or not) for delegation.

For gMSAs, the Delegation tab doesn't appear, even after adding Service Principal Names (SPNs) to these accounts or enabling View > Advanced features.

To configure delegation for these special accounts, you need to set the correct attributes manually:

- `userAccountControl` defines the type of delegation.
- `msDS-AllowedToDelegateTo` defines where the SPNs for delegation will be added.

## Use PowerShell commands

### Do not trust this computer for delegation

```powershell
Set-ADAccountControl -Identity TestgMSA$ -TrustedForDelegation $false -TrustedToAuthForDelegation $false
Set-ADServiceAccount -Identity TestgMSA$ -Clear 'msDS-AllowedToDelegateTo'
```

### Unconstrained delegation/Trust this computer for delegation to any service

```powershell
Set-ADAccountControl -Identity TestgMSA$ -TrustedForDelegation $true -TrustedToAuthForDelegation $false
Set-ADServiceAccount -Identity TestgMSA$ -Clear 'msDS-AllowedToDelegateTo'
```

### Kerberos constrained delegation (Use Kerberos Only)

```powershell
Set-ADAccountControl -Identity TestgMSA$ -TrustedForDelegation $false -TrustedToAuthForDelegation $false
```

Update the Backend Service SPNs in `msDS-AllowedToDelegateTo` attribute.

### Kerberos constrained delegation with protocol transition (Use Any Authentication Protocol)

```powershell
Set-ADAccountControl -Identity TestgMSA$ -TrustedForDelegation $false -TrustedToAuthForDelegation $true
```

Update the Backend Service SPNs in `msDS-AllowedToDelegateTo` attribute.

## Manually update the userAccountControl value

For manually updating the `userAccountControl` value, see:
[Configure Kerberos Delegation for Group Managed Service Accounts](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-managed-service-accounts/group-managed-service-accounts/configure-kerberos-delegation-group-managed-service-accounts)
