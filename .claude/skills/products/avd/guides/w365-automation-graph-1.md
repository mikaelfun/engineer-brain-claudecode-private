# AVD W365 Graph API 自动化 (Part 1) - Quick Reference

**Entries**: 15 | **21V**: partial
**Keywords**: 401, 403, 403-forbidden, 5xx, ad-ds, admin-highlights, arm, authentication
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | New-AzWvdHostPool fails with 'location is not available for resource type' | AVD service metadata location not available in selected region (e.g. southeastas... | Use one of the supported regions listed in the error message for host pool creat... | 🟢 8.0 | MS Learn |
| 2 📋 | Windows 365 Admin Insights returns 401 Unauthorized or 403 Forbidden errors - us... | OBO (On-Behalf-Of) token acquisition failed; user lacks CloudPC.Read or CloudPC.... | Verify user has CloudPC.Read or CloudPC.ReadWrite permissions. Check Graph API c... | 🔵 7.5 | ADO Wiki |
| 3 📋 | High error rate on Windows 365 Service Health API - 5xx errors from downstream G... | Microsoft Graph Service Health API outage, network connectivity issues, or tenan... | Check Microsoft Graph service status. Verify tenant has Graph permissions. Query... | 🔵 7.5 | ADO Wiki |
| 4 📋 | Cloud PC persistent RDP connection or app access issues unresolvable by standard... | Underlying Azure VM host/node issue | Redeploy via OCE API: 1) Get TenantId/DeviceId from Kusto (RDAgentMetadata join ... | 🔵 7.5 | ADO Wiki |
| 5 📋 | WVD Classic migration: Add-RdsAccount fails with 'An invalid request URI was pro... | Customer is running the Add-RdsAccount command in PowerShell Core; Microsoft.RdI... | Run the command in Windows PowerShell or PowerShell ISE (not PowerShell Core) | 🔵 7.5 | ADO Wiki |
| 6 📋 | WVD Classic migration: Az.Resources module fails to import with error 'This modu... | Multiple incompatible versions of the Az.Accounts module are installed on the sy... | Close all PowerShell windows, open PowerShell as administrator, then run: Uninst... | 🔵 7.5 | ADO Wiki |
| 7 📋 | WVD Classic migration fails with 'A parameter cannot be found that matches param... | Customer is not running the latest version of Microsoft.RdInfra.RDPowershell Pow... | Update the module: close all PowerShell windows, open PowerShell as administrato... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Cloud PC restore fails with RegisterRDAgent_powershellIsNotRecognized or Registe... | System environment variables (PATH) on the Cloud PC have been modified by user/a... | Add missing system environment variables to PATH: %SystemRoot%\system32, %System... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Assigning VMs to users using PowerShell CLI fails with No resource group error f... | Multiple subscriptions present, CLI using default subscription but VMs reside on... | Use Set-AzContext to switch to the correct subscription where the resource group... | 🔵 7.5 | KB |
| 10 📋 | New-AzRoleAssignment fails with 'does not map to an AD object ID' | User specified in -SignInName not found in Microsoft Entra ID; user not synced, ... | Ensure user is synced to Entra ID, not B2C/B2B, and AVD environment is tied to c... | 🔵 7.0 | MS Learn |
| 11 📋 | Admins are intermittently unable to assign users in the Microsoft Entra ID user ... | Conditional Access Issue: The problem is related to the Graph API call made by t... | Clear User Profile: Consider clearing the user profile and then recreating it by... | 🔵 6.5 | KB |
| 12 📋 | Azure Virtual Desktop (AVD) virtual machines (VMs) are experiencing power state ... | The problem can arise due to several reasons: Power State Issues: The VM might b... | Verify VM Power State:   &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Ensure ... | 🔵 6.5 | KB |
| 13 📋 | Need to verify whether an Azure subscription is enrolled in AVD per-user access ... | - | Run PowerShell: (1) Connect-AzAccount (2) Get-AzProviderFeature -FeatureName 'Pe... | 🔵 6.0 | ADO Wiki |
| 14 📋 | Windows 365 Graph API returns HTTP 403 Forbidden when using Python requests modu... | Python requests module does not pass a readable User-Agent header (or omits it e... | Add a User-Agent string to the HTTP request headers. Any value works; it does no... | 🔵 6.0 | ADO Wiki |
| 15 📋 | Cannot add storage account to AD DS domain | Incorrect OU syntax or ignored warning messages during PowerShell account creati... | Delete domain account representing storage account, recreate with correct OU syn... | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: AVD service metadata location not available in sel `[Source: MS Learn]`
2. Check: OBO (On-Behalf-Of) token acquisition failed; user `[Source: ADO Wiki]`
3. Check: Microsoft Graph Service Health API outage, network `[Source: ADO Wiki]`
4. Check: Underlying Azure VM host/node issue `[Source: ADO Wiki]`
5. Check: Customer is running the Add-RdsAccount command in `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-automation-graph-1.md#troubleshooting-flow)
