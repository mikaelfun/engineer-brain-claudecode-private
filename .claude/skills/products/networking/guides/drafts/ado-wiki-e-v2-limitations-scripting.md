---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Customer scripting to list out limitations on V2 application gateways"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCustomer%20scripting%20to%20list%20out%20limitations%20on%20V2%20application%20gateways"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Customer Scripting to List Out Limitations on V2 Application Gateways

PowerShell script to audit Application Gateway V2 resource counts for capacity planning and limits verification.

**Note: This script only works with V2 Application Gateways.**

## Usage

```powershell
Get-AzAppGWCounts                                       # All gateways in subscription
Get-AzAppGWCounts -RG 'ResourceGroupName'                # All in resource group
Get-AzAppGWCounts -RG 'ResourceGroupName' -AppGWName 'N' # Specific gateway
```

## Script

```powershell
Function Get-AzAppGWCounts{
    Param([String]$RG, [String]$AppGWName)
    if($AppGWName -and $RG){
        $AppGWs = Get-AzApplicationGateway -ResourceGroupName $RG -Name $AppGWName
    } elseif($RG){
        $AppGWs = Get-AzApplicationGateway -ResourceGroupName $RG
    } elseif($AppGWName){
        throw "-AppGWName requires parameter -RG (ResourceGroup)"
    } else {
        $AppGWs = Get-AzApplicationGateway
    }
    $AllGateways = [PSCustomObject]@()
    Foreach($AppGW in $AppGWs){
        $TotalRoutingRules = $AppGW.RequestRoutingRules.Count
        $RedirectionRules = $AppGW.RedirectConfigurations.Count
        $AllGateways += [PSCustomObject]@{
            'AppGWName' = $Appgw.Name
            'RequestRoutingRules' = $TotalRoutingRules
            'RedirectConfigurations' = $RedirectionRules
            'Rulestowardslimits' = $TotalRoutingRules - $RedirectionRules
            'SSLCertificates' = $AppGW.SSLCertificates.Count
            'TrustedRootCertificates' = $AppGW.TrustedRootCertificates.Count
            'TotalRoutingRules' = $TotalRoutingRules
            'FrontendPorts' = $AppGW.FrontendPorts.Count
            'BackendPools' = $AppGW.BackendAddressPools.Count
            'HTTPSettings' = $AppGW.BackendHttpSettingsCollection.Count
        }
    }
    $AllGateways | Format-Table -AutoSize -Property *
}
```

## Output Fields

| Field | Description |
|-------|-------------|
| AppGWName | Application Gateway name |
| RequestRoutingRules | Total routing rules count |
| RedirectConfigurations | Redirect configuration count |
| Rulestowardslimits | Rules counting toward limits (total - redirects) |
| SSLCertificates | SSL certificate count |
| TrustedRootCertificates | Trusted root/auth certificate count |
| FrontendPorts | Frontend port count |
| BackendPools | Backend address pool count |
| HTTPSettings | Backend HTTP settings count |

## Contributors
- Dan Wheeler
