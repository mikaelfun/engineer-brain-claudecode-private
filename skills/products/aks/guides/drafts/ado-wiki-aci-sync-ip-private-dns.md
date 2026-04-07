---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Automate Sync of ACI IP to a Private DNS Zone"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FAutomate%20Sync%20of%20ACI%20IP%20to%20a%20Private%20DNS%20Zone"
importDate: "2026-04-05"
type: how-to-guide
---

# Automate Sync of ACI IP to a Private DNS Zone

## Summary and Goals

ACI deployed on a VNet doesn't offer a way to have a Static IP Address or a FQDN. A common workaround is deploying an Application Gateway with automation to sync ACI IP changes, but this adds complexity and cost.

A more cost-effective alternative: use a Private DNS Zone linked to the ACI VNet (and client VNets), with an Azure Automation runbook to update the A record when ACI IP changes.

### Prerequisites

* Existing Application Gateway
* ACI deployment
* Azure Automation account
* A Private DNS zone with an A record for the ACI container group

### Involved Components

* Azure Automation
* PowerShell

## Implementation Steps

### Implementation Overview

1. Create Automation Account (if not exist)
2. Create PowerShell RunBook (updates the Private DNS A record)
3. Create Alert (triggered by ACI restart) with Action Group to start the Runbook
4. Enable ACI logs via Log Analytics

### Creating the PowerShell runbook

Create a runbook using the following script:

```pwsh
#Variables declarations
$RGACI="aks-egress-2-rg"      # Resource Group of Azure Container Instance 
$ACINAME="appcontainer"     # Azure Container Instance name 

$RGZONE = "aks-egress-2-rg" # Resource Group of PrivateDNS Zone
$ZONENAME = "private-apps.aci.com" # PrivateDNS Zone name
$RECORDTYPE = "A" # Record Type (by default should be A)
$RECORDNAME = "appcontainer" # Record name, either a custom one or the name from ACI

#login to Azure
$connectionName = "AzureRunAsConnection"
try
{
    $servicePrincipalConnection = Get-AutomationConnection -Name $connectionName
    "Logging in to Azure..."
    $connectionResult =  Connect-AzAccount -Tenant $servicePrincipalConnection.TenantID `
                             -ApplicationId $servicePrincipalConnection.ApplicationID   `
                             -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint `
                             -ServicePrincipal
    "Logged in."
}
catch {
    if (!$servicePrincipalConnection)
    {
        $ErrorMessage = "Connection $connectionName not found."
        throw $ErrorMessage
    } else{
        Write-Error -Message $_.Exception
        throw $_.Exception
    }
}

# Get Current ACI IP address
$ipaddraci=(Get-AzContainerGroup -ResourceGroupName $RGACI -Name $ACINAME).IpAddress

# Get PrivateDNS Zone Object
$zone = Get-AzPrivateDnsZone -Name $ZONENAME -ResourceGroupName $RGZONE 
# Get Record Object from PrivateDNS Zone
$record = Get-AzPrivateDnsRecordSet -Name $RECORDNAME -RecordType $RECORDTYPE -Zone $zone

# Check if current ACI IP address is different from on at PrivateDNS Zone Record
if ("$record.Records[0].Ipv4Address" -ne "$ipaddraci.ip") {
    Write-Host "Updating record '$RECORDNAME.$ZONENAME'..."
    
    # Remove Old ACI IP address on PrivateDNS Zone Record
    $RecordSet = Get-AzPrivateDnsRecordSet -Name $RECORDNAME -RecordType $RECORDTYPE -ResourceGroupName $RGZONE -ZONENAME $ZONENAME
    Remove-AzPrivateDnsRecordConfig -RecordSet $RecordSet -Ipv4Address $record.Records[0].Ipv4Address
    Set-AzPrivateDnsRecordSet -RecordSet $RecordSet

    # Add New ACI IP address on PrivateDNS Zone Record
    $RecordSet = Get-AzPrivateDnsRecordSet -Name $RECORDNAME -RecordType $RECORDTYPE -ResourceGroupName $RGZONE -ZONENAME $ZONENAME
    Add-AzPrivateDnsRecordConfig -RecordSet $RecordSet -Ipv4Address $ipaddraci.ip
    Set-AzPrivateDnsRecordSet -RecordSet $RecordSet
}
```

**Required modules**: Az.Accounts, Az.Automation, Az.Compute, Az.Network, Az.PrivateDNS, Az.ContainerInstance

### Create Alert (Triggered by ACI)

1. Azure Portal → ACI → Select Instance → Alerts → + New Alert Rule
2. Select Condition → "Restart Container Group" (Microsoft.ContainerInstance/containerGroups) → Done
3. For platform maintenance restarts, create a Log Analytics alert:
   ```sql
   ContainerEvent_CL 
   |where ContainerGroup_s contains "<container_name>"
   |where ResourceGroup contains "<resource_group_name>"
   |where Reason_s contains "started"
   ```
4. Run query → Select "New Alert Rule"

### Configure Alerting Rules to Trigger the Runbook

1. Open alert rule → Action Group → Create Action Group
2. Fill in action group details
3. Actions tab → Add Action → Type: "Automation Runbook"
4. Configure Runbook: Source = "User", select your Automation account and runbook
5. Complete alert rule creation

## References

* Creating an Azure Automation account: https://docs.microsoft.com/en-us/azure/automation/automation-create-standalone-account
* Creating an Automation Runbook: https://docs.microsoft.com/en-us/azure/automation/learn/automation-tutorial-runbook-textual-powershell
* Configuring Log Analytics for ACI: https://docs.microsoft.com/en-us/azure/container-instances/container-instances-log-analytics
