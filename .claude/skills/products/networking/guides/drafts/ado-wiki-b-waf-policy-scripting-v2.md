---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/WAF for Application Gateway/Customer Scripting to list out  if V2 application gateways have a WAF policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FWAF%20for%20Application%20Gateway%2FCustomer%20Scripting%20to%20list%20out%20%20if%20V2%20application%20gateways%20have%20a%20WAF%20policy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Customer Scripting to Identify if V2 Application Gateways Have a WAF Policy

## Description

As WAF configuration is deprecated in favor of WAF policy, use this script to identify which V2 application gateways are still running WAF configuration instead of WAF policy.

## PowerShell Function

```powershell
Function Get-AzAppGWWAFConfigs {
    Param(
        [String]$RG,
        [String]$AppGWName
    )

    if($AppGWName -and $RG){
        $AppGWs = Get-AzApplicationGateway -ResourceGroupName $RG -Name $AppGWName
    }
    elseif($RG){
        $AppGWs = Get-AzApplicationGateway -ResourceGroupName $RG
    }
    elseif($AppGWName){
        throw "-AppGWName requires parameter -RG (ResourceGroup)"
    }
    else{
        $AppGWs = Get-AzApplicationGateway
    }

    $AllGateways = [PSCustomObject]@()

    Foreach($AppGW in $AppGWs){
        if ($AppGw.Sku.Name -eq "WAF_v2") {
            $SKU = $AppGW.Sku.Name

            # Check for WAF Policy
            if ($null -ne $AppGW.FirewallPolicy.Id) {
                $WAFPolicyId = $AppGW.FirewallPolicy.Id
                $WAFPolicy = "Exists"
            } else {
                $WAFPolicy = "Doesn't Exist"
                $WAFPolicyId = "N/A"
            }

            # Check for WAF Configuration
            if ($null -ne $AppGW.WebApplicationFirewallConfiguration) {
                $WAFConfiguration = "Exists"
            } else {
                $WAFConfiguration = "Doesn't Exist"
            }

            # Check for both WAF Policy and WAF Configuration Remnants
            if ($WAFConfiguration -eq "Exists" -and $WAFPolicy -eq "Exists") {
                $WAFConfigRemnant = "Exists"
            } else {
                $WAFConfigRemnant = "Doesn't Exist"
            }

            $AllGateways += [PSCustomObject]@{
                'AppGWName'       = $AppGw.Name
                'ResourceGroup'   = $AppGW.ResourceGroupName
                'WAFConfirguration' = $WAFConfiguration
                'WAFPolicy'       = $WAFPolicy
                'WAFConfigRemnant' = $WAFConfigRemnant
                'SKU'             = $SKU
                'WAFPolicyId'     = $WAFPolicyId
            }
        }
    }

    $AllGateways | Format-Table -AutoSize -Property *
}
```

## Syntax

```powershell
# All gateways in subscription
Get-AzAppGWWAFConfigs

# All gateways in a resource group
Get-AzAppGWWAFConfigs -RG 'ResourceGroupName'

# Specific application gateway
Get-AzAppGWWAFConfigs -RG 'ResourceGroupName' -AppGWName 'AppGWName'
```

## Output Columns

| Column | Description |
|--------|-------------|
| AppGWName | Application Gateway name |
| ResourceGroup | Resource group |
| WAFConfirguration | Whether old WAF config exists |
| WAFPolicy | Whether WAF policy is attached |
| WAFConfigRemnant | Both WAF config and WAF policy exist (remnant) |
| SKU | Gateway SKU (WAF_v2) |
| WAFPolicyId | Full resource ID of WAF policy |
