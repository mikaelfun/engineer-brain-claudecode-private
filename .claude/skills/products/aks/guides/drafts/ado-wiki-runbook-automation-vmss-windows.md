---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Runbook Automation for VMSS Windows Instances"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FRunbook%20Automation%20for%20VMSS%20Windows%20Instances"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Creating Azure Automation Account

The following how-to provide the solution for running remote scripts on Windows instance of VMSS. This script can be run in following ways:

- By Schedule, configure direct in Automation Account
- One Time Only - Executing from Automation Account
- Event initiated from different Azure resources

The running of this script is stateless and Job based, no information are saved between different running sessions. Also it does support only a temporary storage space that is used for creating this script. It is not saved between sessions.

The procedure for creating and managing Automation Account is as follows:

1. Searching in Azure Portal for Automation Account
2. Creating Automation Account in desired Resource Group
3. For interacting with different subscription resources, we need to create a RunAs Account. We select **Run As** Account in the left menu and follow the steps described. This will create a **Service Principal** that will be used for interactions with resources.
4. As we will use the **PowerShell** Runbook with **Managed Identity**, we need to provide the SPN used by this account the necessary RBAC roles on our resources. For sake of simplicity will provide the _Contributor Role_ at the Subscription level.
5. We select our newly created Automation Account, open the Runbook Tab and select AzureAutomationTutorialwithIdentity. Select **Edit** and replace the code with the provided Code Snippet.

## Code Snippet

```powershell
$vmssName = "akswinx"   #VMSS Name
$vmssRG = "MC_aks_aks_westeurope" #VMSS Resource Group
try
{
    "Logging in to Azure..."
    Connect-AzAccount -Identity
}
catch {
    Write-Error -Message $_.Exception
    throw $_.Exception
}

# Creating a temporary file on Automation Account for PowerShell script
New-Item -Path 'C:\Temp\script.ps1' -ItemType File

# Here starts the content of the script used to configure VMSS
Add-Content C:\Temp\script.ps1 'Add-MpPreference -ExclusionPath  "C:\Program Files\Docker"'

# The following part will loop through Instances of the VMSS machines and will run the configuration on every instance
Get-Content -Path c:\Temp\script.ps1
$vmss = Get-AzVmssVM -ResourceGroupName $vmssRG -VMScaleSetName $vmssName
foreach ($item in $vmss.InstanceID) {
    Write-Host "Applying Configuration Change for " $item
    $converted = Out-String -InputObject $vmss.InstanceID
    $val = $item.InstanceID -as [Int]
    Write-Output $val
    Invoke-AzVmssVMRunCommand -ResourceGroupName $vmssRG -VMScaleSetName $vmssName -InstanceId $val -CommandId 'RunPowerShellScript' -ScriptPath ("C:\Temp\script.ps1")
}
```
