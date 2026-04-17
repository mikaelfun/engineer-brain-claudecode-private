---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Data collection guidance"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/FIDO2%20passkeys/FIDO2%3A%20Data%20collection%20guidance"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# FIDO2 / Passkey Data Collection Guidance

## Identifying the Scenario

1. **Hybrid authentication deployment** — enabling FIDO2 key-based interactive logon to hybrid Entra ID joined devices
2. **Browser based enrol/logon** via FIDO2 key
3. **Windows interactive logon** via FIDO2 key (Entra ID joined and hybrid Entra ID joined devices)

## Hybrid Authentication Deployment Issues

See: [FIDO2 hybrid Azure AD deployment issues](https://docs.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-troubleshoot#deployment-issues)

Internal guide: Troubleshooting guide - FIDO Hybrid October 2019 CSS team.pdf (available in ADO wiki attachments)

## Browser Related Provision/Logon Issues (Windows)

**Mandatory data collection:**
- [ ] Vendor and model details of the key
- [x] CorrelationID and timestamp from mysignins.microsoft.com (if applicable)
- [x] Auth scripts output
- [x] device-log from chromium based browsers (if applicable)
- [x] Browser trace as a HAR file
- [ ] MS Authenticator logs + incident ID (if using Authenticator passkey)
- [ ] Optional: psr.exe output for user clicks

### Chromium Device-Log Collection

1. Reproduce the issue
2. Navigate to `edge://device-log` (Edge) / `chrome://device-log` (Chrome) / `brave://device-log` (Brave)
3. Set log level: **Debug**
4. Check **File info** and **Detailed Timestamps**
5. Click **Clear Types**, then check **FIDO**
6. Reproduce the FIDO2 issue (browser must be in **normal mode**, not private)
7. Go back to device-log tab, click **Refresh**
8. Ctrl-P and print to PDF
9. Upload to DTM workspace

> Note: device-log is not available in Firefox. See [FIDO2 browser supportability](https://docs.microsoft.com/en-us/azure/active-directory/authentication/fido2-compatibility).

## Windows Interactive Logon Issues

For hybrid Entra ID joined devices, use the FIDO Hybrid troubleshooting guide.

**Required data:**
- [x] Auth scripts output
- [ ] Vendor and model details of the key

### Auth Scripts Instructions

```powershell
# 1. Download and extract
Invoke-WebRequest -Uri "https://aka.ms/authscripts" -OutFile "c:\temp\authscripts.zip"
Expand-Archive -Path "c:\temp\authscripts.zip" -DestinationPath "C:\temp" -Force

# 2. Start logging (elevated PowerShell)
cd C:\temp
.\start-auth.ps1 -accepteula -vauth

# 3. Reproduce the issue

# 4. Stop logging
.\stop-auth.ps1

# 5. Logs saved to C:\temp\authlogs

# 6. Zip and upload
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Compress-Archive -Path "C:\temp\authlogs" -DestinationPath "C:\temp\authlogs_$timestamp.zip" -Force
```

Reference: [KB4487175](https://internal.evergreen.microsoft.com/en-us/help/4487175)

## TTD Instructions (SME-directed only)

Use only when explicitly advised by SME. Traces the cryptsvc (svchost.exe) instance.

```cmd
mkdir c:\temp
cd C:\temp
tasklist /svc | findstr /i cryptsvc
ttd -out c:\temp -attach #pid#from#above#
```

After reproducing, click "stop tracing". Upload svchost01.run to DTM workspace.

Download TTD: https://aka.ms/ttd/download
