---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Windows/How-To/How to deploy or upgrade AMA in a bulk using PowerShell Script for devices located in the same resource group"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Windows%2FHow-To%2FHow%20to%20deploy%20or%20upgrade%20AMA%20in%20a%20bulk%20using%20PowerShell%20Script%20for%20devices%20located%20in%20the%20same%20resource%20group"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

Applies To:
- Azure Monitor Agent:- All versions

Note: All IPs and machine names in this page are from test lab and don't compromise any Pii data.

[[_TOC_]]

##Description:

We found some customers that even enabling AMA auto upgrade flag they would like to upgrade their VMs in a bulk without waiting. Following our public documentation customer should follow the steps described https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-portal#update 

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note!**

The recommendation is to enable Automatic Extension Upgrade which may take up to 5 weeks after a new extension version is released for it to update installed extensions to the released (latest) version across all regions. Upgrades are issued in batches, so you may see some of your virtual machines, scale-sets or Arc-enabled servers get upgraded before others. 
</div>

However, some customers could push us to provide an script as an example that they can customize by themselves. 

In addition, in the same direction, during our troubleshooting we could consider to upgrade our VMs to the lastst version of AMA in a bulk and not manually one one by one. 

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note!**

Please, be aware that as per support boundaries we are a break and fix team, we cannot provide custom scripts or solutions to customers. If cx needs further assistance to code their custom script based on the example provided, customer should consider contacting their associated CSAM to evaluate the option to engage proactive consultant services (Customer Engineer).  


- **Policy: Custom Code and Scripts** https://internal.evergreen.microsoft.com/topic/5f21b5e3-5122-6eab-5abd-789db31ef57a 
- **Procedure: Advisory Services** https://internal.evergreen.microsoft.com/topic/44a8d4ca-bfeb-1b3a-581b-f1d4ea51b342
- **Support scope and responsiveness** https://azure.microsoft.com/support/plans/response/ 

</div>

In this type of scenario, we can use the following, and very basic, script that may help. As mentioned, the main goal of this script is to serve as an example, and it could not cover all the scenarios. Because of it this script could require some additional work, but it is valid for deploying AMA in Windows or Linux servers hosted in Azure.

To execute this script customers can use **Azure Cloud Shell**.

This script prompts the user for the resource group name, location, extension version number, and OS type (Linux or Windows) before installing the Azure Monitor Agent. It uses a switch case to set the extension name, type, and publisher based on the OS type entered by the user. The script then installs the Azure Monitor Agent on all VMs with the specified OS type in the specified resource group.


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#FD7158">

**Important!**

To perform a one-time update of the agent, you must first uninstall the existing agent version, then install the new version. Bear in mind this procedure script will install a new version of AMA and extension settings will not be preserved. Any particular configuration settings in example proxy settings defined must be redone. 

https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-portal

https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-manage?tabs=azure-powershell 

Please, test script before sharing. 
</div>

![scriptama.png](/.attachments/scriptama-24208cc1-a42c-4120-bbc8-6390bbd2bd08.png)

##PowerShell Script for general scenarios:

~~~Powershell

$resourceGroupName = Read-Host "Enter the resource group name"
$location = Read-Host "Enter the location. that is westeurope"
do {
    $osType = Read-Host "Enter the OS type (Linux or Windows)"
} while ($osType -notin @("Linux", "Windows"))
$version = Read-Host "Enter the extension version number. In example 1.17 for Windows or 1.27 for Linux.
You can check the last version and release notes from link: https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-extension-versions
Enter version:"

switch ($osType) {
    "Windows" {
        $extensionName = "AzureMonitorWindowsAgent"
        $extensionType = "AzureMonitorWindowsAgent"
        $extensionPublisher = "Microsoft.Azure.Monitor"
    }
    "Linux" {
        $extensionName = "AzureMonitorLinuxAgent"
        $extensionType = "AzureMonitorLinuxAgent"
        $extensionPublisher = "Microsoft.Azure.Monitor"
    }
}

$vmList = Get-AzVM -ResourceGroupName $resourceGroupName | Where-Object { $_.StorageProfile.OSDisk.OSType -eq $osType }

foreach ($vm in $vmList) {
    $vmName = $vm.Name
    $vmId = $vm.Id
    $vmLocation = $vm.Location
    $vmTags = $vm.Tags
    $vmOsType = $vm.StorageProfile.OsDisk.OsType

    Write-Host "Installing Azure Monitor Agent on VM $vmName - $vmOsType"
    Set-AzVMExtension -ResourceGroupName $resourceGroupName -VMName $vmName -Name $extensionName -Publisher $extensionPublisher -ExtensionType $extensionType -TypeHandlerVersion $version -Location $location -EnableAutomaticUpgrade $true
}
~~~~

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#FD7158">

**Important!**

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</div>

As mentioned the script above it is just an example. It should be valid in most of the scenarios, but some customers could ask to include settings for their particular scenario. As also mentioned, we need to have in mind our support boundaries. We cannot provide custom scripts or work to code a custom solution to adapt this example script. This work must be done by customer. 

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note!**

Please, be aware that as per support boundaries we are a break and fix team, we cannot provide custom scripts or solutions to customers. If cx needs further assistance to code their custom script based on the example provided, customer should consider contacting their associated CSAM to evaluate the option to engage proactive consultant services (Customer Engineer).  
</div>

However, here we can see an example script to help customer to include basic proxy authentication following our public documentation:

https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-data-collection-endpoint?tabs=PowerShellWindowsArc#proxy-configuration

##PowerShell Script for proxy scenarios:
~~~Powershell
$resourceGroupName = Read-Host "Enter the resource group name"
$location = Read-Host "Enter the location. that is westeurope"
do {
    $osType = Read-Host "Enter the OS type (Linux or Windows)"
} while ($osType -notin @("Linux", "Windows"))
$version = Read-Host "Enter the extension version number. In example 1.17 for Windows or 1.27 for Linux.
You can check the last version and release notes from link: https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-extension-versions
Enter version:"

$proxy = Read-Host "Enter the proxy URL (for example http://proxy.contoso.com:8080). Leave blank if not using a proxy."
if ($proxy) {
    $proxyUrl = $proxy
    $proxyUsername = Read-Host "Enter the proxy username"
    $proxyPassword = Read-Host "Enter the proxy password" -AsSecureString
    $settingsString = @{
        "proxy" = @{
            "mode" = "application"
            "address" = $proxy
            "auth" = $true
        } | ConvertTo-Json
    }
    $protectedSettingsString = @{
        "proxy" = @{
            "username" = $proxyUsername
            "password" = $proxyPassword | ConvertFrom-SecureString -AsPlainText
        } | ConvertTo-Json
    }
}


switch ($osType) {
    "Windows" {
        $extensionName = "AzureMonitorWindowsAgent"
        $extensionType = "AzureMonitorWindowsAgent"
        $extensionPublisher = "Microsoft.Azure.Monitor"
    }
    "Linux" {
        $extensionName = "AzureMonitorLinuxAgent"
        $extensionType = "AzureMonitorLinuxAgent"
        $extensionPublisher = "Microsoft.Azure.Monitor"
    }
}

$vmList = Get-AzVM -ResourceGroupName $resourceGroupName | Where-Object { $_.StorageProfile.OSDisk.OSType -eq $osType }

foreach ($vm in $vmList) {
    $vmName = $vm.Name
    $vmId = $vm.Id
    $vmLocation = $vm.Location
    $vmTags = $vm.Tags
    $vmOsType = $vm.StorageProfile.OsDisk.OsType

    Write-Host "Installing Azure Monitor Agent on VM $vmName - $vmOsType"
    Set-AzVMExtension -ResourceGroupName $resourceGroupName -VMName $vmName -Name $extensionName -Publisher $extensionPublisher -ExtensionType $extensionType -TypeHandlerVersion $version -Location $location -EnableAutomaticUpgrade $true
	
	if($proxy){
	
	Set-AzVMExtension -ResourceGroupName $resourceGroupName -VMName $vmName -Name $extensionName -Publisher $extensionPublisher -ExtensionType $extensionType -TypeHandlerVersion $version -Location $location -SettingString $settingsString -ProtectedSettingString $protectedSettingsString -EnableAutomaticUpgrade $true
	
	} else {
	
	Set-AzVMExtension -ResourceGroupName $resourceGroupName -VMName $vmName -Name $extensionName -Publisher $extensionPublisher -ExtensionType $extensionType -TypeHandlerVersion $version -Location $location -EnableAutomaticUpgrade $true
	
	}

}
~~~~

In this example code, the $settingsString and $protectedSettingsString variables are defined as hashtables with the appropriate JSON structure. The $proxy variable is used to set the address property of the $settingsString hashtable. The $proxyUsername and $proxyPassword variables are properly interpolated in the JSON strings using the @{} syntax. The ConvertTo-Json cmdlet is used to convert the hashtables to properly formatted JSON strings.

Note that the those variables are used at the end of the script to populate proxy settings. If customer wants to use these or variables to configure a resource, they will need to modify the script accordingly.


<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#FD7158">

**Important!**

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</div>


