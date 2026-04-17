---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/AMA Windows: HT : Verify enabled extension autoupgrade for Arc and Azure VM"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Azure%20Monitor%20Agent%20%28AMA%29%20for%20Windows/How-To/AMA%20Windows%3A%20HT%20%3A%20Verify%20enabled%20extension%20autoupgrade%20for%20Arc%20and%20Azure%20VM"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Verify AMA Extension Auto Upgrade for Arc and Azure VM (Windows)

:::template /.templates/Common-Header.md
:::

****Note:** Information in this page are from test lab and don't compromise any Pii data.**

[[_TOC_]]

# autoUpgradeMinorVersion VS enableAutomaticUpgrade
---
Auto updates for minor/patch version no longer happen in guest agent extension installation post extension install (since august 2021) via autoUpgradeMinorVersion parameter, even if there is a VM goal state change triggered by different extension, disk resizing, network interface change, etc. unless extension is onboarded for server side auto updates using new "enableAutomaticUpgrade" parameter which no longer requires VM goal state change and is triggered by RSM pipeline automatically, see [supported extension list for autoupgrade](https://learn.microsoft.com/azure/virtual-machines/automatic-extension-upgrade#supported-extensions).  Note that major version update is always manual (need to be done by customer).

When you enable extension, you can only specify major version and minor version. Take version 1.11.0.0 as example, where first 1 is major version, the second 11 is minor version, third 0 is Revision version, last 0 is hotfix version.

About legacy parameter **autoUpgradeMinorVersion**, extension version (major, minor, patch, build) can only be updated by running Set-AzVMExtension cmdlet or cli equivalent) that triggers goal state change if you are using the legacy parameter autoUpgradeMinorVersion and specifying older version of extension in the cmdline but still want it to be auto upgraded to latest version. Once deployed, however, **the extension will not upgrade minor versions unless redeployed**, even with the property "autoUpgradeMinorVersion" set to true. If extension version parameter TypeHandlerVersion is pointing to older version but autoUpgradeMinorVersion  is set to true, running Set-AzVMExtension cmdlet will always upgrade the extension version to latest minor. 

# Determine installed extension version and if auto upgrade is enabled in Arc and Azure VM
---
Note: oms agent for linux didn't support autoupgrade feature yet, please refer to [this doc](https://learn.microsoft.com/azure/virtual-machines/automatic-extension-upgrade#supported-extensions) for latest update

## Azure VM


Run following command in azure PowerShell & change the extension name as needed:
```
az vm extension show --resource-group your-rg --vm-name vm_name --name AzureMonitorWindowsAgent --instance-view

```

![image.png](/.attachments/image-2e67b863-2477-42f6-b16f-6546b852fa32.png)

<details closed>
<summary><b>Extension details</b></summary>
<div style="margin:25px">

{
  "autoUpgradeMinorVersion": true,
  "enableAutomaticUpgrade": true,
  "forceUpdateTag": null,
  "id": "/subscriptions/<subscription ID>/resourceGroups/<resource group name>/providers/Microsoft.Compute/virtualMachines/<VM name>/extensions/AzureMonitorWindowsAgent",
  "instanceView": {
    "name": "AzureMonitorWindowsAgent",
    "statuses": [
      {
        "code": "ProvisioningState/succeeded",
        "displayStatus": "Provisioning succeeded",
        "level": "Info",
        "message": "ExtensionOperation:enable. Status:Success",
        "time": null
      }
    ],
    "substatuses": null,
    "type": "Microsoft.Azure.Monitor.AzureMonitorWindowsAgent",
    "typeHandlerVersion": "1.11.0.0"
  },
  "location": "southeastasia",
  "name": "AzureMonitorWindowsAgent",
  "protectedSettings": null,
  "protectedSettingsFromKeyVault": null,
  "provisioningState": "Succeeded",
  "publisher": "Microsoft.Azure.Monitor",
  "resourceGroup": "<resource group name>",
  "settings": null,
  "suppressFailures": null,
  "tags": null,
  "type": "Microsoft.Compute/virtualMachines/extensions",
  "typeHandlerVersion": "1.0",
  "typePropertiesType": "AzureMonitorWindowsAgent"
}

</details>

In above output, you will see:
"typeHandlerVersion": "1.11.0.0" => installed extension version
"enableAutomaticUpgrade": true => automatic extension upgrade is enabled
"autoUpgradeMinorVersion": true => legacy minor upgrade is enabled

## Arc server

Change the extension name as needed:
```
az connectedmachine extension show --name "AzureMonitorWindowsAgent" --machine-name "myMachine" --resource-group "myResourceGroup"
```

![image.png](/.attachments/image-d6516a81-e7f8-45fb-ac45-3294768a2e97.png)

<details closed>
<summary><b>Extension details</b></summary>
<div style="margin:25px">
{
  "id": "/subscriptions/<subscription ID>/resourceGroups/<resource group name>/providers/Microsoft.HybridCompute/machines/<VM name>/extensions/AzureMonitorWindowsAgent",
  "location": "australiaeast",
  "name": "AzureMonitorWindowsAgent",
  "properties": {
    "autoUpgradeMinorVersion": false,
    "enableAutomaticUpgrade": true,
    "forceUpdateTag": null,
    "instanceView": {
      "name": "AzureMonitorWindowsAgent",
      "status": {
        "code": "success",
        "displayStatus": null,
        "level": "Information",
        "message": "Extension Message: ExtensionOperation:enable. Status:Success",
        "time": null
      },
      "type": "AzureMonitorWindowsAgent",
      "typeHandlerVersion": "1.11.0.0"
    },
    "protectedSettings": null,
    "provisioningState": "Succeeded",
    "publisher": "Microsoft.Azure.Monitor",
    "settings": {},
    "type": "AzureMonitorWindowsAgent",
    "typeHandlerVersion": "1.11.0.0"
  },
  "resourceGroup": "<resource group name>",
  "systemData": null,
  "tags": null,
  "type": "Microsoft.HybridCompute/machines/extensions"
}
</details>

In above output, you will see:
"typeHandlerVersion": "1.11.0.0" => installed extension version
"enableAutomaticUpgrade": true => automatic extension upgrade is enabled
"autoUpgradeMinorVersion": false => legacy minor upgrade is disabled

# Determine available extension version by region
---
The latest targeted version will be applied. 
You can use the below queries and dashboard to find out the versions released and available per region as latest target and follow up if needed (if you do not see latest version in results you will need to follow up with agent product team to make the change). We use separate queries for getting the extension target version for Azure VM and for Arc.  Please note that each region needs to be checked separately.

- Azure VM auto update current target version/Release tracker
[[Run in Azure Data Explorer](https://dataexplorer.azure.com/clusters/azmc2.centralus/databases/rsm_prod?query=H4sIAAAAAAAAAz2NMQuDMBCF9/6Ko5NCcehuIYNDh0BBsXO013igSUgutUp/fFXE7Xjv+97VsmTFWHzQ8OkHY4ceobrLoqyEfMANlLbJtUuPzsWmp7CckOdwltR6G+ybMzFHj5m0htj684Hjl9EEsqaaHG7KBu7ck8zLjkHo5fvqhDgMytOM0NpoOEmhmYCV18g1+nXmArtKRgvnemoVL/EfXQm79ccAAAA=)]
VMStateEvent
| where TIMESTAMP > ago(2h)
| where publisher == "Microsoft.Azure.Monitor"
| where extensionType == "AzureMonitorWindowsAgent"
| summarize count() by targetVersion, MonitoringApplication

- Arc auto update current target version/Release tracker 
[[Run in Azure Data Explorer](https://dataexplorer.azure.com/clusters/azmc2.centralus/databases/rsm_prod?query=H4sIAAAAAAAAAz2NMQuDMBCF9/6Ko5NCcehuIYNDh0BBsXNMr3qgSUgutUp/fFXE7Xjv+94Jr2tZsmIsPmj49IOxQ49Q3WVRVkI+4Aaqtcm1S4/OxaansJyQ53CWpL0N9s2ZmKPHTFpDbP35wPHLaAJZU00ON2UDd+5J5mXHINrl++qEOAzK04ygbTScpNBMwMq3yDX6deYCu0qmFc71pBUv8R+s29F+ygAAAA==)
ArcVMStateEvent
| where TIMESTAMP > ago(2h)
| where publisher == "Microsoft.Azure.Monitor"
| where extensionType == "AzureMonitorWindowsAgent"
| summarize count() by targetVersion, MonitoringApplication

- [Available extension versions available in Arc - AMA](https://msazure.visualstudio.com/defaultcollection/One/_git/compute-hybridrp?path=/src/ArcVmExtensions/Prod/microsoft.azure.monitor__azuremonitorwindowsagent)

- Available extension versions available in Azure VM: 
  - AMA: az vm extension image list --location <region> --publisher Microsoft.Azure.Monitor --name AzureMonitorWindowsAgent


