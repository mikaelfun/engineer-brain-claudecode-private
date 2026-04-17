---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Automate Sync of ACI IP to backend pool of AppGw"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/How%20To/Automate%20Sync%20of%20ACI%20IP%20to%20backend%20pool%20of%20AppGw"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Automate Sync of ACI IP to Backend Pool of AppGw

## Summary

ACI deployed on a VNet does not support static IP or FQDN. This guide automates updating an Application Gateway backend pool IP whenever ACI restarts and gets a new IP, enabling customers to use a stable endpoint for ACI via Application Gateway.

**Related:** [Automate Sync to Private DNS Zone](ado-wiki-a-aci-automate-sync-ip-private-dns-zone.md)

## Prerequisites

- Existing Application Gateway
- ACI deployment on a VNet
- Azure Automation account ([docs](https://docs.microsoft.com/en-us/azure/automation/automation-create-standalone-account#create-a-new-automation-account-in-the-azure-portal))
- ACI logs enabled ([docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-log-analytics))

## Required Modules

Import before running: `Az.Accounts`, `Az.Automation`, `Az.Compute`, `Az.Network`, `Az.ContainerInstance`  
Reference: [Import Az modules](https://docs.microsoft.com/en-us/azure/automation/shared-resources/modules#import-az-modules)

## Implementation Steps

### 1. Create PowerShell Runbook

```pwsh
#Variables declarations
$RGAPPGW="automate-aci-rg"           # Resource Group of Application Gateway
$APPGWNAME="appgw"                    # Application Gateway name
$APPGWBKNAME="appGatewayBackendPool"  # Application Gateway backend pool name
$RGACI="automate-aci-rg"             # Resource Group of Azure Container Instance 
$ACINAME="aci"                        # Azure Container Instance name 
$subscriptionID = "xxxxxxxxxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxx"
$resourceGroup = "automate-aci-rg"
$automationAccount = "aci-automation"

try {
    "Logging in to Azure..."
    Disable-AzContextAutosave -Scope Process
    Connect-AzAccount -Identity
    $AzureContext = Set-AzContext -SubscriptionId $subscriptionID 
}
catch {
    Write-Error -Message $_.Exception
    throw $_.Exception
}

$Ipaddraci = (Get-AzContainerGroup -ResourceGroupName $RGACI -Name $ACINAME).IPAddressIP

$AppGw1 = Get-AzApplicationGateway -Name $APPGWNAME -ResourceGroupName $RGAPPGW
$Ipaddraappgwbk1 = (Get-AzApplicationGatewayBackendAddressPool -Name $APPGWBKNAME -ApplicationGateway $AppGw1)
$Ipaddraappgwbk = $Ipaddraappgwbk1.BackendAddresses.ToArray().IpAddress

"IP Address of ACI: $Ipaddraci"
"IP Address of AppGw Backend: $Ipaddraappgwbk"

If ($Ipaddraci -eq $Ipaddraappgwbk) {
    'IPs are equal. No update needed.'
} Else {
    'IPs are not equal. Updating backend pool...'
    $AppGw = Get-AzApplicationGateway -Name $APPGWNAME -ResourceGroupName $RGAPPGW
    $AppGw = Set-AzApplicationGatewayBackendAddressPool -ApplicationGateway $AppGw -Name $APPGWBKNAME -BackendIPAddresses $Ipaddraci
    $UpdatedAppGw = Set-AzApplicationGateway -ApplicationGateway $AppGw
}
```

### 2. Create Alert Triggered by ACI Restart

**Condition 1 — Portal restart event:**
Azure Portal → ACI → Alerts → New Alert Rule → Condition: `Restart Container Group (Microsoft.ContainerInstance/containerGroups)`

**Condition 2 — Platform maintenance/outages (via Log Analytics):**
Run query in LA workspace:
```kql
ContainerEvent_CL 
|where ContainerGroup_s contains "<container_name>"
|where ResourceGroup contains "<resource_group_name>"
|where Reason_s contains "started"
```
Then select **New Alert Rule** from query results.

### 3. Configure Action Group to Trigger Runbook

For each alert rule:
1. Open alert rule → Action Group → Create Action Group
2. Actions tab → Add Action → Type: **Automation Runbook**
3. In "Configure Runbook": Runbook source = **User**, select your Automation account + the runbook

## References

- [Create Automation Account](https://docs.microsoft.com/en-us/azure/automation/automation-create-standalone-account)
- [Create Textual Runbook](https://docs.microsoft.com/en-us/azure/automation/learn/automation-tutorial-runbook-textual-powershell)
- [Configure Log Analytics for ACI](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-log-analytics)
