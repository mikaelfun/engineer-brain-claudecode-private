---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/Stop & Start Azure Firewall"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Firewall%2FFeatures%20%26%20Functions%2FStop%20%26%20Start%20Azure%20Firewall"
importDate: "2026-04-18"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview

Recently, the Azure Firewall PG added the ability to stop & start Azure Firewalls, which allows customers to save costs when not running their Firewalls (overnight, for example). 

The documentation for this can be found here: [How can I stop & Start an Azure Firewall?](https://docs.microsoft.com/en-us/azure/firewall/firewall-faq#how-can-i-stop-and-start-azure-firewall)

Stop and Start methods for _**normal firewall and firewall with forced tunneling**_ is slightly different. Commands for both can be found inthe above document.

It's important to note that when you Deallocate an Azure Firewall, the `ipConfigurations` settings from ARM are wiped - you will not be able to see what PIP(s) your firewall used or in what Vnet your firewall lived.

As a result - the Azure Docs, in an effort to remain simple and clear, may fall short for some customers who may not recall the PIPs used by their Firewall, the subnet in which the Firewall lived, etc. 

This wiki outlines a stop script block that could be used by customers to gather info about the Azure Firewall prior to deallocation to build a corresponding "startup" script.

> NOTE: There is a known limitation regarding stopping & starting Azure Firewalls with Forced Tunneling enabled (Ref: [Azure Firewall Known Issues](https://docs.microsoft.com/en-us/azure/firewall/overview#known-issues). Until this limitation is resolved, the script below has been updated to account for Azure Firewalls with forced tunneling enabled - it will offer to *not* stop the Firewall (user presses CTRL+C), or it will stop the firewall and provide your Firewall config so it can be recreated from scratch later.


# Script Block

The script below accounts for multiple PIP scenarios (Firewalls can have up to 250 PIPs deployed):

``` powershell
# Enter the Firewall Name and RG Name as variables
$firewallName = "myFirewall"
$firewallResourceGroup = "myFirewallResourceGroup"

# Get the Azure Firewall
$azfw = Get-AzFirewall -Name $firewallName -ResourceGroupName $firewallResourceGroup
Write-Output "Processing Azure Firewall: $($azfw.id)..."

# Check if there is a management_ipconfigurations (indicates forced tunneling)
Write-Output "Checking for managementIpConfiguration (forced tunneling)..."
$fwRestApi = (Invoke-AzRestMethod -method GET -Path "$($azfw.id)`?api-version=2021-02-01").Content

if (($fwRestApi | ConvertFrom-Json).properties.managementIpConfiguration.id.count -gt 0)
{
    Write-Host -ForegroundColor Red "****ATTENTION****"
    Write-Output "Forced tunneling is enabled on this Azure Firewall. Stopping/Starting an Azure Firewall with Forced Tunneling enabled is not supported or possible. Attempting to start Azure Firewall with forced tunneling configured results in an HTTP 400 `"Bad Request`" error. Note that by continuing, the Azure Firewall will be stopped, and you will need to delete & recreate it from scratch. For more information about Forced Tunneling with Azure Firewall, please see https://docs.microsoft.com/en-us/azure/firewall/forced-tunneling"
    Write-Host -ForegroundColor Yellow "Please press ENTER to continue to stop the Azure Firewall, or CTRL+C to quit this script and do nothing."
    pause

    Write-Output "Stopping the Azure Firewall."
    Write-Output "For reference (to ease in firewall recreation), here is your Firewall config:"
    Write-Output $fwRestApi

    # Stop the Azure Firewall
    $azfw.Deallocate()
    Set-AzFirewall -AzureFirewall $azfw

    Write-Output "For reference and aid in resource recreation, here is your Firewall config:"
    Write-Output $fwRestApi
}
else
{
    # Output a Firewall restart script:
    Write-Output "`# Here's what info you will need to restart the Azure Firewall:"
    Write-Output "`$fwName = `"$($azfw.Name)`""
    Write-Output "`$rgName = `"$($azfw.ResourceGroupName)`""
    Write-Output "`$vnetName = `"$(($azfw.IpConfigurations[0].Subnet.id -split "/")[-3])`""
    Write-Output "`$vnetRg = `"$(($azfw.IpConfigurations[0].Subnet.id -split "/")[-7])`""
    $pipObjects = @()
    foreach ($i in 1..$($azfw.IpConfigurations.count))
    {
        Write-Output "`$pip$($i) = Get-AzPublicIpAddress -Name `"$(($azfw.ipConfigurations[$i-1].PublicIpAddress.id -split '/')[8])`" -ResourceGroupName `"$(($azfw.ipConfigurations[$i-1].PublicIpAddress.id -split '/')[4])`""
        $pipObjects += "`$pip$i"
    }
    Write-output ""
    Write-Output "`# Start the Azure firewall"
    Write-Output "`$azfw = Get-AzFirewall -Name `$fwName -ResourceGroupName `$rgName"
    Write-Output "`$vnet = Get-AzVirtualNetwork -Name `$vnetName -ResourceGroupName `$vnetRg"
    Write-Output "`$azfw.Allocate(`$vnet,@($($pipObjects -join ',')))"
    Write-Output "Set-AzFirewall -AzureFirewall `$azfw"

    # Stop the Azure Firewall
    $azfw.Deallocate()
    Set-AzFirewall -AzureFirewall $azfw
}
```

# Example Output

In this example, we're using 20 PIPs onn this Firewall without forced tunneling:

``` powershell
# Here's what info you will need to restart the Azure Firewall:
$fwName = "myFirewall"
$rgName = "myFirewallRg"
$vnetName = "myFirewallVnet"
$vnetRg = "myFirewallRg"
$pip1 = Get-AzPublicIpAddress -Name "myFirewall-IP01" -ResourceGroupName "myFirewallRg"
$pip2 = Get-AzPublicIpAddress -Name "myFirewall-IP02" -ResourceGroupName "myFirewallRg"
$pip3 = Get-AzPublicIpAddress -Name "myFirewall-IP03" -ResourceGroupName "myFirewallRg"
$pip4 = Get-AzPublicIpAddress -Name "myFirewall-IP04" -ResourceGroupName "myFirewallRg"
$pip5 = Get-AzPublicIpAddress -Name "myFirewall-IP05" -ResourceGroupName "myFirewallRg"
$pip6 = Get-AzPublicIpAddress -Name "myFirewall-IP06" -ResourceGroupName "myFirewallRg"
$pip7 = Get-AzPublicIpAddress -Name "myFirewall-IP07" -ResourceGroupName "myFirewallRg"
$pip8 = Get-AzPublicIpAddress -Name "myFirewall-IP08" -ResourceGroupName "myFirewallRg"
$pip9 = Get-AzPublicIpAddress -Name "myFirewall-IP09" -ResourceGroupName "myFirewallRg"
$pip10 = Get-AzPublicIpAddress -Name "myFirewall-IP10" -ResourceGroupName "myFirewallRg"
$pip11 = Get-AzPublicIpAddress -Name "myFirewall-IP11" -ResourceGroupName "myFirewallRg"
$pip12 = Get-AzPublicIpAddress -Name "myFirewall-IP12" -ResourceGroupName "myFirewallRg"
$pip13 = Get-AzPublicIpAddress -Name "myFirewall-IP13" -ResourceGroupName "myFirewallRg"
$pip14 = Get-AzPublicIpAddress -Name "myFirewall-IP14" -ResourceGroupName "myFirewallRg"
$pip15 = Get-AzPublicIpAddress -Name "myFirewall-IP15" -ResourceGroupName "myFirewallRg"
$pip16 = Get-AzPublicIpAddress -Name "myFirewall-IP16" -ResourceGroupName "myFirewallRg"
$pip17 = Get-AzPublicIpAddress -Name "myFirewall-IP17" -ResourceGroupName "myFirewallRg"
$pip18 = Get-AzPublicIpAddress -Name "myFirewall-IP18" -ResourceGroupName "myFirewallRg"
$pip19 = Get-AzPublicIpAddress -Name "myFirewall-IP19" -ResourceGroupName "myFirewallRg"
$pip20 = Get-AzPublicIpAddress -Name "myFirewall-IP20" -ResourceGroupName "myFirewallRg"

# Start the Azure firewall
$azfw = Get-AzFirewall -Name $fwName -ResourceGroupName $rgName
$vnet = Get-AzVirtualNetwork -Name $vnetName -ResourceGroupName $vnetRg
$azfw.Allocate($vnet,@($pip1,$pip2,$pip3,$pip4,$pip5,$pip6,$pip7,$pip8,$pip9,$pip10,$pip11,$pip12,$pip13,$pip14,$pip15,$pip16,$pip17,$pip18,$pip19,$pip20))
Set-AzFirewall -AzureFirewall $azfw
```

This can be used to subsequently start the Azure Firewall in the same configuration as when it was stopped.

**Note(Below information is strictly internal)

A quick information about the stop and start firewall and the private ip assignment to firewall.

The private IPs are assigned dynamically to firewall but in no specific order from the Azurefirewallsubnet.
We cannot guarantee the private ip will remian the same or would be the very next IP after restart,which was there when firewall was initially created. 

# Contributors

* @<B0B19791-83EB-4561-9380-2B186BDF9BC7>
<br>Shijin Balan<br />Harshita Kapoor<br />