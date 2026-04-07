---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Tools and TSGs/ResourceURI"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FResourceURI"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ResourceURI Tool

PowerShell tool to quickly gather AppGW and AGC (AppGW for Containers) resource details and build Kusto queries or Jarvis URLs from a resource URI + time window.

## Adding to PowerShell Profile

1. Create a folder in `C:\` named `Tools` and copy the 'ResourceURI' folder to it
1. Open PowerShell and enter `notepad $profile`
1. Add `. "C:\Tools\ResourceUri\ResourceUri.ps1"` to your profile and save
1. Open a new PowerShell window and type in 'ResourceURI'
   - Will prompt you for a ResourceUri (required input)

Your PowerShell `$Profile` should look similar to this:

```ps1
. "C:\Tools\ResourceUri\ResourceUri.ps1"
Write-Host "$((Get-TimeZone).Id):`t" -NoNewLine -ForegroundColor White
Write-Host "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Green
Write-Host "Universal Time Code:`t" -NoNewLine -ForegroundColor White
Write-Host "$((Get-Date -AsUtc).ToString('yyyy-MM-dd HH:mm:ss'))`n" -ForegroundColor Green
```

## To Use ResourceURI

This will use your specified window of time in UTC:  
`ResourceURI /subscription/mysubid/resourceGroups/myresourcegroup/providers/Microsoft.Network/applicationGateways/myfirstappgw -StartDateTime "2024-10-10 10:00" -EndDateTime "2024-10-10 15:00"`

## Updates

- 2024-10-01 - ResourceURI v2.0 created
- 2024-10-14 - Added details and Jarvis for ApplicationGateway (CloudService, CSES, and VMSS)
- 2024-10-21 - Added details and Jarvis for TrafficControllers (AppGW for Containers)

## Dependencies

ResourceURI depends on the NuGet package `Microsoft.Azure.Kusto.Tools`.

Recommended version: `12.2.7`

```ps1
Register-PackageSource -Name NuGet -Location "https://www.nuget.org/api/v2" -ProviderName NuGet
Install-Package -Name Microsoft.Azure.Kusto.Tools -RequiredVersion 12.2.7 -Force
```

- `net6.0\Kusto.data.dll` is used for PowerShell 7
- `net472\Kusto.data.dll` is used for PowerShell 5
