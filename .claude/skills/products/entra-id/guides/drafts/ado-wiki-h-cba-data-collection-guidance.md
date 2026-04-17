---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Cert Based Auth/CBA: Data collection guidance"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Cert%20Based%20Auth/CBA:%20Data%20collection%20guidance"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CBA: Data Collection Guidance

## Scenario Identification

1. **Configuring Entra ID authentication methods** (admin issue)
2. **Browser/app based logon via certificates** (end user issue)
3. **Interactive logon via smart cards** (Entra ID joined and hybrid joined devices)

## Configuring Entra ID Authentication Methods

For portal issues:
- [x] Fiddler or HAR file trace
- [x] CorrelationID and timestamp from portal pages

For Graph API/script issues:
- Gather response containing request ID and timestamp

## Browser/App Based Logon - Windows

**All checked items are mandatory:**
- [x] CorrelationID and timestamp
- [x] If smart cards: `certutil -v -silent -scinfo` (non-elevated prompt)
- [x] If cert in user profile: `certutil -v -user -store My` (non-elevated prompt)
- [x] Auth scripts output while reproducing issue
- [x] HAR file trace (prefer over Fiddler for CBA)
- [ ] Network trace via `edge://net-export` or `chrome://net-export`
- [ ] Optional: psr.exe output for user clicks

**Auth scripts collection:**
```powershell
# 1. Download
Invoke-WebRequest -Uri "https://aka.ms/authscripts" -OutFile "c:\temp\authscripts.zip"
Expand-Archive -Path "c:\temp\authscripts.zip" -DestinationPath "C:\temp" -Force

# 2. Elevated PowerShell
cd C:\temp
.\start-auth.ps1 -accepteula -vauth

# 3. Reproduce issue, then stop
.\stop-auth.ps1

# 4. Zip and upload C:\temp\authlogs
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Compress-Archive -Path "C:\temp\authlogs" -DestinationPath "C:\temp\authlogs_$timestamp.zip" -Force
```

> **Fiddler use is discouraged for CBA logon** - can change symptoms.

## Browser/App Based Logon - iOS/Android

**Mandatory:**
- [x] CorrelationID and timestamp
- [x] If using SSO via Microsoft Authenticator: gather Authenticator logs and provide incident ID

## Windows Interactive Logon (Smart Cards)

- [x] Auth scripts output while reproducing issue
- [x] `certutil -v -silent -scinfo` (non-elevated prompt)
