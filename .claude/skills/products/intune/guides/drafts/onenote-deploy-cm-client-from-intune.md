# Deploy CM Client from Intune (LOB vs Win32 App)

## Overview

For co-management scenarios where devices are Intune-enrolled but need the Configuration Manager client, there are two deployment methods via Intune. Both require CMG (Cloud Management Gateway) configured.

## Method 1: Windows LOB App

1. In CM console, go to co-management properties → copy the MSI file location and command line
2. Upload the MSI to Intune as a Windows LOB app
3. The device will **connect to CMG** to download content files during installation

Reference: https://docs.microsoft.com/en-us/sccm/comanage/tutorial-co-manage-new-devices#use-intune-to-deploy-the-configuration-manager-client

## Method 2: Win32 App (Recommended)

### Option A: Full package (no CMG download needed)

1. Copy entire `C:\Program Files\Microsoft Configuration Manager\Client\` folder (including x64 subfolder) + create `install.ps1`
2. Wrap with Win32 Content Prep Tool → `.intunewin`
3. Upload to Intune as Win32 app
4. **Advantage**: ccmsetup recognizes local cache files, does NOT connect to CMG for download

### Option B: ccmsetup.exe only

1. Wrap only `ccmsetup.exe` → `.intunewin`
2. Upload to Intune
3. **Note**: ccmsetup will still connect to CMG to download content files

## Install Command Line

```
ccmsetup.exe /nocrlcheck /mp:https://<CMG_FQDN>/CCM_Proxy_MutualAuth/<ProxyID> CCMHTTPSSTATE=31 CCMHOSTNAME=<CMG_FQDN>/CCM_Proxy_MutualAuth/<ProxyID> SMSSiteCode=<SiteCode> AADTENANTID=<TenantID> AADCLIENTAPPID=<AppID> AADRESOURCEURI=https://<ResourceURI>
```

> Remove `ccmsetupcmd` prefix and quotation marks from the command line copied from CM console.

## Local Source Install (Force Skip CMG Download)

Use `/source:` parameter to force local installation:

```powershell
# install.ps1
Copy-Item -Path ".\Client" -Destination "c:\windows\temp\intunetemp" -Recurse
c:\windows\temp\intunetemp\ccmsetup.exe /nocrlcheck /source:c:\windows\temp\intunetemp CCMHTTPSSTATE=31 CCMHOSTNAME=<CMG_FQDN>/CCM_Proxy_MutualAuth/<ProxyID> SMSSiteCode=<SiteCode> AADTENANTID=<TenantID> AADCLIENTAPPID=<AppID> AADRESOURCEURI=https://<ResourceURI>
$retry = 0
while($retry -lt 6) {
    $service = Get-Service -Name CcmExec
    if($service) { exit 0 }
    else { Start-Sleep -Seconds 60; $retry++ }
}
exit 1
```

## Detection Rule

- Check for CcmExec service existence, or
- Registry key: `HKLM\SOFTWARE\Microsoft\CCM`

## Installation Workflow

1. ccmsetup.exe bootstrap
2. Download content files (from CMG or local cache depending on method)
3. Install prerequisites
4. MSI file completes installation

## Troubleshooting

- Logs: `C:\Windows\ccmsetup\Logs\ccmsetup.log` and `client.msi.log`
- If CMG connection fails, check CMG health and network connectivity
- Involve SCCM team if ccmsetup errors persist

## Source

- OneNote: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/Co-management/Question 3 & Question 5
