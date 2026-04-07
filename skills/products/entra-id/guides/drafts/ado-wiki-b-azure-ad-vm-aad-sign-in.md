---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Azure AD VM AAD Sign in/Azure AD Sign-in for Azure Windows VMs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FAzure%20AD%20VM%20AAD%20Sign%20in%2FAzure%20AD%20Sign-in%20for%20Azure%20Windows%20VMs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Sign-in for Azure Windows VMs — Overview & Troubleshooting Guide

> Note: This is a large comprehensive guide (113K chars). Full content available in ADO Wiki. Key sections captured below.

## Summary

**AADLoginForWindows** VM extension enables:
- Azure AD Join of Azure VMs
- RBAC-based RDP login (removes dependency on local accounts)
- Conditional Access policy enforcement for VM access

**Requirements:**
- RDP from AAD-joined or Hybrid AAD-joined PC to AAD-joined Azure VM
- User must be assigned "Virtual Machine Administrator Login" or "Virtual Machine User Login" Azure RBAC role

## OS Support

| Operating System |
|-----------------|
| Windows Server 2019 Datacenter and later |
| Windows 10 1809 and later |
| Windows 11 21H2 and later |

⚠️ Windows Server 2019 Datacenter **Core** is NOT supported (no `dsregcmd` stack support).

## Cloud Support

- Azure Global ✅
- Azure Government ✅
- Azure China 21Vianet ✅

## Network Requirements

| Cloud | Endpoint | Purpose |
|-------|----------|---------|
| Global | https://enterpriseregistration.windows.net | Device registration |
| Global | http://169.254.169.254 | Azure IMDS |
| Global | https://login.microsoftonline.com | Authentication |
| Global | https://pas.windows.net | Azure RBAC flows |
| Gov | https://enterpriseregistration.microsoftonline.us | Device registration |
| Gov | https://login.microsoftonline.us | Authentication |
| Gov | https://pasff.usgovcloudapi.net | Azure RBAC |
| China | https://enterpriseregistration.partner.microsoftonline.cn | Device registration |
| China | https://login.chinacloudapi.cn | Authentication |
| China | https://pas.chinacloudapi.cn | Azure RBAC |

## Support Boundaries

| Scenario | Owner | PG Escalation |
|----------|-------|---------------|
| VM Domain Join to AD (JoinDomain Extension) | MSaaS IaaS VM Management | IcM to CRP PG |
| RDP fails for local admin after removing extension | MSaaS IaaS VM Connectivity | IcM to CRP PG |
| Outbound network traffic failing | Azure Networking POD | — |
| RBAC role assignment issues | AAD - Account Management | IcM to Policy Administration Service PG |
| Deployment of new VM with AADLoginForWindows fails | AAD - Authentication | IcM to Cloud Identity AuthN Client PG |
| Extension install/update/removal fails | AAD - Authentication | IcM to Cloud Identity AuthN Client PG |
| RDP works for local admin but AAD login fails | AAD - Authentication | ICM to ESTS PG |
| Extension fails to add/remove users from local groups | AAD - Authentication | IcM to Cloud Identity AuthN Client PG |
| AAD users in RBAC roles fail to login | AAD - Authentication | ICM to ESTS PG |

## Role Assignments

Users must be assigned one of these Azure RBAC roles on the VM's resource group or VM resource:
- **Virtual Machine Administrator Login** (local admin)
- **Virtual Machine User Login** (standard user)

⚠️ Owner or Contributor role does NOT automatically grant VM login.
⚠️ Manual `net localgroup administrators /add "AzureAD\UserUpn"` is NOT supported.

## Local Group Management

The AADLoginForWindows extension syncs RBAC role membership to local Administrators/Users groups. Removing from RBAC role prevents RDP but does NOT immediately remove from local groups. View via `lusrmgr.msc`.

## Log Collection

- Extension logs: `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ActiveDirectory.AADLoginForWindows\1.0.0.1\AADLoginForWindowsExtension_*.txt`
- Windows logon/RDP issues: Event Viewer → AAD\Operational
- Device registration/SSO: `dsregcmd /status`; User Device Registration\Admin event log

## Architecture Support

- amd64 ✅
- x86 ✅
- arm64 ❌ (NOT supported as of 5/8/2025 — tracking: Task Group 46359437)

## Known Issues in Azure CLI/Cloud Shell Deployment

**Unexpected/Inconsistent UI Status on Extension Deployment:**
- Symptom: PowerShell/Portal shows success even when extension failed (e.g., duplicate hostname error)
- Root cause: Missing MDM configuration in command prevents status file parsing
- Fix: Always pass explicit `-Settings $SettingsString` with `mdmId` parameter:
  ```powershell
  $SettingsString = @{"mdmId" = "0000000a-0000-0000-c000-000000000000"}
  Set-AzVMExtension -ResourceGroupName "..." -Location "..." -VMName "..." `
    -Name "AADLoginForWindows" -Publisher "Microsoft.Azure.ActiveDirectory" `
    -Type "AADLoginForWindows" -TypeHandlerVersion "1.0" -Settings $SettingsString -Verbose
  ```
