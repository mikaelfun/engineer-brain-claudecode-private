# Deploy ConfigMgr Client via Intune Win32 App (Local Installer)

> Source: OneNote - Co-management Q5
> Status: draft

## Overview

Deploy the ConfigMgr (SCCM) client to Intune-enrolled devices using a Win32 app package that includes all client installation files locally, avoiding the need to download from CMG (Cloud Management Gateway).

## Steps

### 1. Prepare Source Files

Create a local folder (e.g., `C:\Intune`) and copy:
- The CCM client folder from: `C:\Program Files\Microsoft Configuration Manager\Client\`
- An `install.ps1` script (see below)

### 2. Create install.ps1

```powershell
Copy-Item -Path ".\Client" -Destination "c:\windows\temp\intunetemp" -Recurse
c:\windows\temp\intunetemp\ccmsetup.exe /nocrlcheck /source:c:\windows\temp\intunetemp CCMHTTPSSTATE=31 CCMHOSTNAME=<CMG_FQDN>/CCM_Proxy_MutualAuth/<ID> SMSSiteCode=<SITECODE> AADTENANTID=<TENANT_ID> AADCLIENTAPPID=<APP_ID> AADRESOURCEURI=https://<ConfigMgrService>
$retry = 0
while($retry -lt 6) {
    $service = get-service -name CcmExec
    if($service) {
        exit 0
    } else {
        start-sleep -s 60
        $retry++
        write-output "Retrying $retry"
    }
}
exit 1
```

### 3. Package as Win32 App

Use the Win32 Content Prep Tool to wrap the folder into `.intunewin` format.

### 4. Upload and Configure in Intune

- **Install command**: `powershell.exe -ExecutionPolicy Bypass -File .\install.ps1`
- **Detection rule**: Check for CcmExec service existence
- **Install behavior**: System context

## Key Benefit

Using `/source` parameter forces ccmsetup to use local files instead of downloading from CMG, significantly reducing bandwidth and installation time.

## Related

- intune-onenote-383: Deploy SCCM client via Intune using CMG (LOB vs Win32)
