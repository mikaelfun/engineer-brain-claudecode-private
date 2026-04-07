---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/How to: verify enabled extension auto upgrade for Arc and Azure VM on linux"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Azure%20Monitor%20Agent%20%28AMA%29%20for%20Linux/How-To/How%20to%3A%20verify%20enabled%20extension%20auto%20upgrade%20for%20Arc%20and%20Azure%20VM%20on%20linux"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Verify AMA Extension Auto Upgrade for Arc and Azure VM (Linux)

:::template /.templates/Common-Header.md
:::

****Note:** Information in this page are from test lab and don't compromise any Pii data.**

[[_TOC_]]

# autoUpgradeMinorVersion VS enableAutomaticUpgrade
---
Auto updates for minor/patch version no longer happen in guest agent extension installation post extension install (since august 2021) via autoUpgradeMinorVersion parameter, even if there is a VM goal state change triggered by different extension, disk resizing, network interface change, etc. unless extension is onboarded for server side auto updates using new "enableAutomaticUpgrade" parameter which no longer requires VM goal state change and is triggered by RSM pipeline automatically, see [supported extension list for autoupgrade](https://learn.microsoft.com/azure/virtual-machines/automatic-extension-upgrade#supported-extensions).  Note that major version update is always manual (need to be done by customer).

When you enable extension, you can only specify major version and minor version. Take version 1.9.0.0 as example, where first 1 is major version, the second 9 is minor version, third 0 is Revision version, last 0 is hotfix version.

About legacy parameter **autoUpgradeMinorVersion**, extension version (major, minor, patch, build) can only be updated by running Set-AzVMExtension cmdlet or cli equivalent) that triggers goal state change if you are using the legacy parameter autoUpgradeMinorVersion and specifying older version of extension in the cmdline but still want it to be auto upgraded to latest version. Once deployed, however, **the extension will not upgrade minor versions unless redeployed**, even with the property "autoUpgradeMinorVersion" set to true. If extension version parameter TypeHandlerVersion is pointing to older version but autoUpgradeMinorVersion  is set to true, running Set-AzVMExtension cmdlet will always upgrade the extension version to latest minor. 

# Determine installed extension version and if auto upgrade is enabled in Arc and Azure VM
---
## Azure VM


Run following command in azure PowerShell & change the extension name as needed:
```
az vm extension show --resource-group your-rg --vm-name vm_name --name OmsAgentForLinux --instance-view

```


![image.png](/.attachments/image-65eb9568-22fa-4a9a-a68c-bc15ee7dff8f.png)


<details closed>
<summary><b>Extension details</b></summary>
<div style="margin:25px">

{
  "autoUpgradeMinorVersion": true,
  "enableAutomaticUpgrade": true,
  "forceUpdateTag": true,
  "id": "/subscriptions/<subscription ID>/resourceGroups/<resource group name>/providers/Microsoft.Compute/virtualMachines/<VM name>/extensions/OmsAgentForLinux",
  "instanceView": {
    "name": "OmsAgentForLinux",
    "statuses": [
      {
        "code": "ProvisioningState/succeeded",
        "displayStatus": "Provisioning succeeded",
        "level": "Info",
        "message": "Enable succeeded",
        "time": null
      }
    ],
    "substatuses": null,
    "type": "Microsoft.EnterpriseCloud.Monitoring.OmsAgentForLinux",
    "typeHandlerVersion": "1.14.16"
  },
  "location": "southeastasia",
  "name": "OmsAgentForLinux",
  "protectedSettings": null,
  "protectedSettingsFromKeyVault": null,
  "provisioningState": "Succeeded",
  "publisher": "Microsoft.EnterpriseCloud.Monitoring",
  "resourceGroup": "<resource group name>",
  "settings": {
    "workspaceId": "<workspace ID>"
  },
  "suppressFailures": null,
  "tags": null,
  "type": "Microsoft.Compute/virtualMachines/extensions",
  "typeHandlerVersion": "1.0",
  "typePropertiesType": "OmsAgentForLinux"
}

</details>

In above output, you will see:
"typeHandlerVersion": "1.13.40" => installed extension version
"enableAutomaticUpgrade": true => automatic extension upgrade is enabled
"autoUpgradeMinorVersion": true => legacy minor upgrade is enabled

## Arc server

Change the extension name as needed:
```
az connectedmachine extension show --name "AzureMonitorLinuxAgent" --machine-name "myMachine" --resource-group "myResourceGroup"

```

<details closed>
<summary><b>Extension details</b></summary>
<div style="margin:25px">
{
  "id": "/subscriptions/<subscription ID>/resourceGroups/<resource group name>/providers/Microsoft.HybridCompute/machines/<VM name>/extensions/AzureMonitorLinuxAgent",
  "location": "southeastasia",
  "name": "AzureMonitorLinuxAgent",
  "properties": {
    "autoUpgradeMinorVersion": false,
    "enableAutomaticUpgrade": true,
    "forceUpdateTag": null,
    "instanceView": {
      "name": "AzureMonitorLinuxAgent",
      "status": {
        "code": "success",
        "displayStatus": null,
        "level": "Information",
        "message": "Extension Message: Enable succeeded",
        "time": null
      },
      "type": "AzureMonitorLinuxAgent",
      "typeHandlerVersion": "1.22.2"
    },
    "protectedSettings": null,
    "provisioningState": "Succeeded",
    "publisher": "Microsoft.Azure.Monitor",
    "settings": {},
    "type": "AzureMonitorLinuxAgent",
    "typeHandlerVersion": "1.22.2"
  },
  "resourceGroup": "<resource group name>",
  "systemData": null,
  "tags": null,
  "type": "Microsoft.HybridCompute/machines/extensions"
}
</details>

In above output, you will see:
"typeHandlerVersion": "1.22.2" => installed extension version
"enableAutomaticUpgrade": true => automatic extension upgrade is enabled
"autoUpgradeMinorVersion": true => legacy minor upgrade is enabled

# Determine available extension version by region
---
The latest targeted version will be applied. 
You can use the below dashboard to find out the versions released and available per region as latest target and follow up if needed(if you do not see latest version in results you will need to follow up with agent product team to make the change). We use separate dashboards for getting the extension target version for Azure VM and for Arc.  Please note that each region needs to be checked separately.

- [Azure VM auto update current target version/Release tracker dashboard](https://lens.msftcloudes.com/#/dashboard/c6938ff0-a2ab-49eb-98ac-6835e4a80089?temp=0&isSample=false&_g=(ws:%270d5c24d8-3af3-4df7-ae58-cac01ffad96e%27)) which support for AMA, OMS and LAD
![image.png](/.attachments/image-33f63fcd-4101-4160-aba6-f04b6252eaa4.png)

- [Arc auto update current target version/Release tracker dashboard](https://lens.msftcloudes.com/#/dashboard/86a23a1d-e8a6-41db-9dd4-0e229cc56938?temp=0&newDashFromMenu=false&isSample=false&isVersion=0&isHistory=0&_g=(ws:%279c102991-1949-4f15-a802-808fc753323c%27)), only AMA and OMS are supported and there is not LAD in Arc server

- [Available extension versions available in Arc - AMA](https://msazure.visualstudio.com/defaultcollection/One/_git/compute-hybridrp?path=/src/ArcVmExtensions/Prod/microsoft.azure.monitor__azuremonitorlinuxagent)

- [Available extension versions available in Arc - OMS](https://msazure.visualstudio.com/defaultcollection/One/_git/compute-hybridrp?path=/src/ArcVmExtensions/Prod/microsoft.enterprisecloud.monitoring__omsagentforlinux)

- Available extension versions available in Azure VM: 
  - OMS: az vm extension image list --location <region> --publisher Microsoft.EnterpriseCloud.Monitoring --name OmsAgentForLinux
  - AMA: az vm extension image list --location <region> --publisher Microsoft.Azure.Monitor --name AzureMonitorLinuxAgent


