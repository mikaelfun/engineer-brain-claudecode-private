# Deploy ConfigMgr Client via Intune Win32 App with Local Source

## Scenario
Deploy the SCCM/ConfigMgr client to Intune-enrolled devices using a Win32 app, forcing the setup to use local installer files instead of downloading from CMG.

## Steps

### 1. Prepare Source Files
- Create folder (e.g., `C:\Intune`)
- Copy the CCM client folder from: `C:\Program Files\Microsoft Configuration Manager\Client\`
- Create `install.ps1` in the same folder

### 2. Install Script (install.ps1)
```powershell
Copy-Item -Path ".\Client" -Destination "c:\windows\temp\intunetemp" -Recurse
c:\windows\temp\intunetemp\ccmsetup.exe /nocrlcheck /source:c:\windows\temp\intunetemp CCMHTTPSSTATE=31 CCMHOSTNAME=<CMG_FQDN>/CCM_Proxy_MutualAuth/<ID> SMSSiteCode=<SiteCode> AADTENANTID=<TenantID> AADCLIENTAPPID=<AppID> AADRESOURCEURI=https://<ConfigMgrServiceName>

$retry = 0
while ($retry -lt 6) {
    $service = Get-Service -Name CcmExec
    if ($service) {
        exit 0
    } else {
        Start-Sleep -Seconds 60
        $retry++
        Write-Output "Retrying $retry"
    }
}
exit 1
```

### 3. Package as Win32 App
- Run the Win32 Content Prep Tool to convert the folder to `.intunewin`
- Upload to Intune portal

### 4. Configure App in Intune
- **Install command:** `powershell.exe -ExecutionPolicy Bypass -File .\install.ps1`
- **Detection rule:** Check for CcmExec service or CCM client registry key

## Key Benefit
Using `/source:` parameter forces ccmsetup to use local files instead of connecting to CMG DP to download content files. This avoids CMG bandwidth usage and potential CMG connectivity issues.

## Comparison: Full Package vs Ccmsetup Only
| Package Contents | Behavior |
|---|---|
| All files (Client folder + ccmsetup.exe) | ccmsetup uses local cache, no CMG download |
| ccmsetup.exe only | ccmsetup still connects to CMG to download content |

## Source
- OneNote: Mooncake POD Support Notebook > Co-management > Question 5
