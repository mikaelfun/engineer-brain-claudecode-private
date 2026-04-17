# AVD 其他杂项 - Comprehensive Troubleshooting Guide

**Entries**: 13 | **Drafts fused**: 6 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-azure-academy.md, ado-wiki-a-demystifying-avd-introduction.md, ado-wiki-a-eee-mapping.md, ado-wiki-a-welcome.md, ado-wiki-admin-highlights-setup.md, ado-wiki-admin-highlights-troubleshooting.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote, MS Learn, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Windows 10 EVD multi-session images (19h2-evd, 20h2-evd) fai... | Platform bug on specific AVD multi-session images in Mooncak... | Fixed per ICM 255528022. Workaround: run slmgr.vbs /ipk NPPR... |
| AVD preview API versions being deprecated (tracking ID: PKYM... | Microsoft retiring preview API versions for Azure Virtual De... | 1. Check the deprecation tracking page: portal.azure.cn → Az... |
| Windows 365 Boot sign-in fails after 2-minute transition/int... | Cloud PCs in inactive state (unused for a while) require 2-3... | Known platform limitation — VMs put in inactive state for re... |
| Clipboard redirection fails or window cannot be resized afte... | rdpclipcdv.exe and rdpinputcdv.exe blocked by AppLocker/SRP/... | Allow-list rdpclipcdv.exe and rdpinputcdv.exe from C:\Progra... |
| User connects but no feed/icons displayed in AVD | Not assigned to app groups, cached creds, or distribution gr... | Check Get-AzRoleAssignment; clear cache; use security groups |
| AVD auto scaling script (CreateOrUpdateAzAutoAccount.ps1) fa... | The AVD auto scaling setup script references the Global Azur... | 1. Verify the Log Analytics workspace endpoint uses .azure.c... |
| Error message when navigating to AVD Per-User Access Pricing... | Insufficient RBAC permissions to manage Azure resources with... | Ensure the user has RBAC permissions to manage Azure resourc... |
| Customer enrolled an Azure subscription in AVD per-user acce... | Enrollment can take up to 1 hour after user clicks Enroll be... | Advise customer to wait up to 1 hour after initiating enroll... |

### Phase 2: Detailed Investigation

#### ado-wiki-a-azure-academy.md
> Source: [ado-wiki-a-azure-academy.md](guides/drafts/ado-wiki-a-azure-academy.md)

**Dean Cefola** from **Azure Academy** has created several videos on various Azure, AVD and FSLogix related topics which can be very useful for anyone starting or wanting to improve in these areas.

#### Watch first!
> Source: [ado-wiki-a-demystifying-avd-introduction.md](guides/drafts/ado-wiki-a-demystifying-avd-introduction.md)

<div id='cssfeedback-start'></div>

#### ado-wiki-a-eee-mapping.md
> Source: [ado-wiki-a-eee-mapping.md](guides/drafts/ado-wiki-a-eee-mapping.md)

| API Management | tehnoonr@microsoft.com |

#### Welcome to the Azure Virtual Desktop Support Wiki
> Source: [ado-wiki-a-welcome.md](guides/drafts/ado-wiki-a-welcome.md)

>  Access the wiki quickly using this link: [https://aka.ms/avdcsswiki](https://aka.ms/avdcsswiki)

#### Admin Highlights / Admin Insights - Setup Guide
> Source: [ado-wiki-admin-highlights-setup.md](guides/drafts/ado-wiki-admin-highlights-setup.md)

## Where to find Admin Insights cards

#### Admin Highlights / Insights — Troubleshooting
> Source: [ado-wiki-admin-highlights-troubleshooting.md](guides/drafts/ado-wiki-admin-highlights-troubleshooting.md)

## Common Error Codes and Failure Tags

*Contains 6 KQL query template(s)*

### Key KQL Queries

**Query 1:**
```kql
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName in ("HighlightController", "HighlightService", "HighlightSourceDataService")
| where TraceLevel <= 3
```

**Query 2:**
```kql
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName == "ServiceHealthClient"
| where TraceLevel <= 2
```

**Query 3:**
```kql
CloudPCEvent
| where env_time > ago(7d)
| where ApplicationName contains "aldp"
| where TenantId == "<TenantId>"
| where UserId == "<UserId>"
| where ComponentName contains "Highlight"
| where TraceLevel <= 3
```

**Query 4:**
```kql
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName == "ServiceHealthClient" or ComponentName contains "Highlight"
| where Message contains "code: 4" or Message contains "code: 5"
| summarize Count = count() by bin(env_time, 1h)
```

**Query 5:**
```kql
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName contains "Highlight" or ComponentName == "ServiceHealthClient"
| where TraceLevel <= 2
| summarize ErrorCount = count() by ComponentName
| order by ErrorCount desc
```

**Query 6:**
```kql
CloudPCEvent
| where env_time > ago(7d)
| where ApplicationName contains "aldp"
| where ComponentName contains "Highlight"
| summarize Total = count(), Errors = countif(TraceLevel <= 2), Warnings = countif(TraceLevel == 3) by bin(env_time, 1d)
```

### Conflict Notes

- **avd-ado-wiki-0861** vs **avd-mslearn-040** (21v_conflict): Both valid. Annotate with 21V applicability conditions
- **avd-ado-wiki-0862** vs **avd-mslearn-040** (21v_conflict): Both valid. Annotate with 21V applicability conditions
- **avd-ado-wiki-0862** vs **avd-mslearn-052** (21v_conflict): Both valid. Annotate with 21V applicability conditions

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Windows 10 EVD multi-session images (19h2-evd, 20h2-evd) fail to activate in Azu... | Platform bug on specific AVD multi-session images in Mooncake (ICM 255528022). T... | Fixed per ICM 255528022. Workaround: run slmgr.vbs /ipk NPPR9-FWDCX-D2C8J-H872K-... | 🟢 8.5 | OneNote |
| 2 | AVD preview API versions being deprecated (tracking ID: PKYM-DVG). Only preview ... | Microsoft retiring preview API versions for Azure Virtual Desktop. Only specific... | 1. Check the deprecation tracking page: portal.azure.cn → Azure Health → PKYM-DV... | 🟢 8.0 | OneNote |
| 3 | Windows 365 Boot sign-in fails after 2-minute transition/interstitial screen tim... | Cloud PCs in inactive state (unused for a while) require 2-3 minutes to start. T... | Known platform limitation — VMs put in inactive state for resource management ne... | 🔵 7.5 | ADO Wiki |
| 4 | Clipboard redirection fails or window cannot be resized after SxS Network Stack ... | rdpclipcdv.exe and rdpinputcdv.exe blocked by AppLocker/SRP/endpoint protection | Allow-list rdpclipcdv.exe and rdpinputcdv.exe from C:\Program Files\Microsoft RD... | 🔵 6.5 | MS Learn |
| 5 | User connects but no feed/icons displayed in AVD | Not assigned to app groups, cached creds, or distribution group instead of secur... | Check Get-AzRoleAssignment; clear cache; use security groups | 🔵 6.5 | MS Learn |
| 6 | AVD auto scaling script (CreateOrUpdateAzAutoAccount.ps1) fails with 'Invoke-Web... | The AVD auto scaling setup script references the Global Azure ODS endpoint (.ods... | 1. Verify the Log Analytics workspace endpoint uses .azure.cn suffix for Mooncak... | 🔵 6.5 | OneNote |
| 7 | Error message when navigating to AVD Per-User Access Pricing page in Azure porta... | Insufficient RBAC permissions to manage Azure resources within the subscription ... | Ensure the user has RBAC permissions to manage Azure resources within the subscr... | 🔵 6.0 | ADO Wiki |
| 8 | Customer enrolled an Azure subscription in AVD per-user access pricing but the A... | Enrollment can take up to 1 hour after user clicks Enroll before status changes ... | Advise customer to wait up to 1 hour after initiating enrollment, then refresh t... | 🔵 6.0 | ADO Wiki |
| 9 | AD DS group membership for VM not working for Azure Files authentication | VM needs to be restarted to activate new AD DS group membership | Restart the VM after adding it to the AD DS group | 🔵 6.0 | MS Learn |
| 10 | User assignments not visible after moving subscription between Entra tenants | Old assignments tied to previous tenant | Reassign users to application groups in new tenant | 🔵 6.0 | MS Learn |
| 11 | User loses feed after subscription moved between Entra tenants | Assignments tied to old tenant or CSP transfer | Reassign users; re-register DesktopVirtualization RP for CSP | 🔵 6.0 | MS Learn |
| 12 | WebAuthn redirection not working - no Windows Hello or security key option in AV... | FIDO2 method not enabled in Entra ID, or user signed in single-factor, or unsupp... | Enable FIDO2 in Entra ID; use Sign in with Windows Hello option; verify supporte... | 🟡 4.5 | MS Learn |
| 13 | Azure region not visible when selecting AVD service object location | Microsoft.DesktopVirtualization resource provider needs re-registration | Re-register Microsoft.DesktopVirtualization resource provider | 🟡 4.5 | MS Learn |
