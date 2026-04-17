---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Powershell Profile_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FPowershell%20Profile_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# PowerShell Profile Setup for Azure VM Troubleshooting

## Check & Create Profile

```powershell
# Check PowerShell version
$PSVersionTable

# Check installed modules
Get-Module -ListAvailable

# Check if profile exists
Test-Path $profile

# Create blank profile if needed
New-Item -path $profile -type file -force

# Set execution policy
Set-ExecutionPolicy Unrestricted
```

## Install Azure Modules

```powershell
Set-PSRepository -InstallationPolicy trusted -Name PSGallery
Install-Module Az
Install-Module Azure
# If Get-AzureStorageContainerACL conflict:
# Install-Module Azure -AllowClobber
```

## Module Management

```powershell
# List available modules
Get-Module -ListAvailable

# Update all modules
Update-Module

# Update specific module
Update-Module Az

# Remove module
Uninstall-Module Az
```

## Recommended Profile Aliases

```powershell
Set-Alias vnetmig \\fsu\shares\anp\tools\retired\VNET_Migration\VNET_Migration.ps1
Set-Alias vpnrca \\fsu\shares\anp\tools\VPNRCA\LaunchVPNRCA.ps1
Set-Alias getazureips \\fsu\shares\ANP\Tools\GetAzureIPs\GetAzureIPs.ps1
Set-Alias WinGuestAnalyzer "\\fsu\shares\wats\scripts\WinGuestAnalyzer\WinGuestAnalyzer.ps1" -force -ErrorAction SilentlyContinue
Set-Alias hostanalyzer \\fsu\shares\wats\scripts\get-sub\hostanalyzer\hostanalyzer.ps1
Import-Module \\fsu\shares\anp\tools\mod-anp\mod-anp.psd1
Import-Module "C:\Program Files (x86)\Microsoft SDKs\Azure\PowerShell\ServiceManagement\Azure\Azure.psd1"
Import-Module "C:\Program Files (x86)\Microsoft SDKs\Azure\PowerShell\ServiceManagement\Azure\ExpressRoute\ExpressRoute.psd1"
```

## References

- [Customizing your PowerShell Profile](http://www.howtogeek.com/50236/customizing-your-powershell-profile/)
- [Azure SDK Downloads](https://azure.microsoft.com/en-us/downloads/)
- [Azure PowerShell Gallery](https://www.powershellgallery.com/profiles/azure-sdk/)
