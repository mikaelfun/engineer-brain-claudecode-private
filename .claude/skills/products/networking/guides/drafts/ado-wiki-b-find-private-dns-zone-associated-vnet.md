---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure Private DNS zones/How to find which Azure Private DNS Zone is associated with concerned vnet"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20Private%20DNS%20zones%2FHow%20to%20find%20which%20Azure%20Private%20DNS%20Zone%20is%20associated%20with%20concerned%20vnet"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# How to find which Azure Private DNS Zone is associated with a VNet

## Description

Help customers identify which DNS zone is linked with a specific VNet using PowerShell.

Common scenarios where this is needed:
1. AzFW goes into failed state due to a Private DNS zone linked with the VNet causing resolution failures.
2. Private Endpoint creation fails because a DNS zone with the same name is already linked to the VNet.
3. Creating a VNet link in a DNS zone fails because another zone with the same name is already linked to the VNet.

## Resolution

### Script 1 — Find Private DNS Zones linked to a specific VNet (single subscription)

```powershell
Connect-AzAccount 
Write-host "Here is a list of subscription available to you"
Get-AzSubscription | format-table -property Subscriptionid, Name 
$Subid = Read-Host "Enter the SubscriptionID you need to search the vnet link in"
Connect-AzAccount -Subscription $subid

$ResourceGroups = Get-AzResourceGroup
$ResourceGroupsNames = $ResourceGroups.ResourceGroupName
$VNETID = Read-host "Enter the VNET's ResourceID"

Write-Host "The Vnet is linked to"
foreach($ResourceGroupsName in $ResourceGroupsNames)
{
    $DNSZones = Get-AzPrivateDnsZone -ResourceGroupName $resourceGroupsname
    foreach($DNSzone in $DNSZones)
    {
        $DNSZoneName = $DNSZone.Name
        $links = Get-AzPrivateDnsVirtualNetworkLink -ResourceGroupName $ResourceGroupsName -ZoneName $DNSZoneName
        foreach($link in $links)
        {
            if ($link.VirtualNetworkId -eq $VNETID)
            {
                $DNSzone.ResourceId
            }
        }
    }
}
```

To find information about a zone in a different subscription, select the appropriate subscription from the list shown and enter the subscription ID when prompted. Execution time varies depending on the number of Private DNS zones.

### Script 2 — Check all VNet links across all subscriptions accessible to user

```powershell
Connect-AzAccount

# Get all subscriptions accessible to the current user
$subscriptions = Get-AzSubscription

# Initialize an array to store the result objects
$result = @()

# Iterate over each subscription
foreach ($subscription in $subscriptions) {
    Set-AzContext -Subscription $subscription.Id | Out-Null
    Write-Host "Checking Subscription -" $subscription.Name $subscription.Id
    
    $resourceGroups = Get-AzResourceGroup
    
    foreach ($resourceGroup in $resourceGroups) {
        $dnsZones = Get-AzPrivateDnsZone -ResourceGroupName $resourceGroup.ResourceGroupName
        Write-Host "Checking Resource Group -" $resourceGroup.ResourceGroupName
        
        foreach ($dnsZone in $dnsZones) {
            $links = Get-AzPrivateDnsVirtualNetworkLink -ResourceGroupName $resourceGroup.ResourceGroupName -ZoneName $dnsZone.Name
            Write-Host "Checking DNS Zone -" $dnsZone.Name
            
            foreach ($link in $links) {
                $vnetId = $link.VirtualNetworkId
                $vnet = Get-AzVirtualNetwork | Where-Object { $_.Id -eq $vnetId }
                
                $resultObject = [PSCustomObject]@{
                    "ResourceGroup" = $resourceGroup.ResourceGroupName
                    "VNET Name"     = $vnet.Name
                    "VNET ID"       = $vnet.ResourceGuid
                    "PDNS Zone"     = $dnsZone.Name
                }
                
                $result += $resultObject
            }
        }
    }
}

# Display the result table
$result | Format-Table -AutoSize

# Export to CSV (creates C:/temp if needed)
$targetFolder = "C:/temp"
if (-not (Test-Path $targetFolder)) {
    $createFolder = Read-Host "Do you want to create the folder '$targetFolder'? (Y/N)"
    if ($createFolder -eq "Y") {
        New-Item -ItemType Directory -Path $targetFolder | Out-Null
    }
}
$result | Export-Csv -Path "$targetFolder/DNSZonelog.csv" -NoTypeInformation
Write-Host -ForegroundColor Green "Operation completed. Check '$targetFolder/DNSZonelog.csv'."
```

Results appear in the command line and are exported to `C:/temp/DNSZonelog.csv`.

### Contributors
Aalok Vyas, Aayush Kejriwal, Grayson Moseley
