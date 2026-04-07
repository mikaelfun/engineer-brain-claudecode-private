# Seamless SSO in Mooncake - Setup Guide

**Source**: OneNote - Mooncake POD Support Notebook > Sync > AAD Connect > Feature/How to
**PG Contact**: bpolatoglu@microsoft.com
**Network Endpoint**: https://autologon.hybridauth.microsoft.cn

## Enable Seamless SSO (Desktop SSO) on Active Directory

### Prerequisites
- AAD Connect server installed and configured
- Domain admin credentials
- Global admin credentials for the tenant

### Steps

1. On AAD Connect server, open PowerShell
2. Navigate to `%programfiles%\Microsoft Azure Active Directory Connect`
3. Import the module:
   ```powershell
   Import-Module .\AzureADSSO.psd1
   ```
4. Create authentication context (popup for global admin creds):
   ```powershell
   New-AzureADSSOAuthenticationContext
   ```
5. Check current status:
   ```powershell
   Get-AzureADSSOStatus
   ```
6. Enable SSO for a new forest (popup for domain admin creds, format: `DOMAINNAME\username`):
   ```powershell
   Enable-AzureADSSOForest
   ```
7. Enable Seamless SSO:
   ```powershell
   Enable-AzureADSSO -Enable $true
   ```
8. Verify:
   ```powershell
   Get-AzureADSSOStatus
   ```

### Notes
- The domain listed in output should be the **local domain name**, not the cloud domain
- If output shows a cloud default domain, it means the local domain was set to the same as the cloud default domain (not typical)
