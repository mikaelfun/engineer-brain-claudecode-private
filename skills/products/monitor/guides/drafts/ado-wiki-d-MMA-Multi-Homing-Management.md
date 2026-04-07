---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to manage multi-homing on MMA"
sourceUrl: "https://dev.azure.com/Supportability/6f9dfd80-6071-4f7b-8bf9-c97214ca68cf/_wiki/wikis/bebfc12e-d2ce-4ed1-8a64-d64c20264fd2?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows%2FHow-To%2FHow%20to%20manage%20multi-homing%20on%20MMA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]

# Scenario
---
In some cases, customers would like automated or non-automated ways to manage multihoming on Windows machines running MMA. Below are some guidance on how to remove or add a workspace using different approaches. 

# Add a Log Analytics workspace
---

## Manually
Log into the Machine -> Control Panel -> Microsoft Monitoring agent -> Azure Log Analytics �Tab� -> Add -> Paste the Workspace key and Id -> Apply

## Using PowerShell

### Option 1
```
$workspaceId = "<Your workspace Id>"
$workspaceKey = "<Your workspace Key>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.AddCloudWorkspace($workspaceId, $workspaceKey)
$mma.ReloadConfiguration()
```
_This script would add the workspace details of the other workspace into the agent that is already configured._ 

### Option 2
```
$workspaceId = "<Your workspace Id>"
$workspaceKey = "<Your workspace Key>"

$computers = Get-Content 'computers.txt' 
foreach ($computer in $computers) {
	if (Test-Connection -Cn $computer -quiet) { 
		Write-Host "Reseting workspace info on $computer ..."
		Invoke-Command -Computername $computer -ScriptBlock {
			$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
			$mma.AddCloudWorkspace($workspaceId, $workspaceKey)
			$mma.ReloadConfiguration()
		}
	} 
	else { 
		"$computer is not online or not reachable" 
	}
}
```
## Using DSC
---
https://gallery.technet.microsoft.com/PowerShell-DSC-to-multi-ed38164b#content
Will need to get the Agent ID from: Install the agent using DSC in Azure Automation

# Remove a Log Analytics workspace
---
## Manually
Log Into the Machine -> Control Panel -> Microsoft Monitoring agent -> Azure Log Analytics �Tab� -> Click on the workspace id you would like to remove -> Remove -> ApplyLog Into the Machine -> Control Panel -> Microsoft Monitoring agent -> Azure Log Analytics �Tab� -> Add -> Paste the Workspace key and Id -> Apply

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=/.attachments/image-6b6fc017-a2b0-4281-b1e3-2ba83dceedfb.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>

## Using PowerShell
---
```
$workspaceId�=�"<workspace id>"
$mma�=�New-Object�-ComObject�'AgentConfigManager.MgmtSvcCfg'
$mma.RemoveCloudWorkspace($workspaceId)
$mma.ReloadConfiguration()
```

# Refrences
[OMS Log Analytics Agent multi-homing support](https://docs.microsoft.com/archive/blogs/msoms/oms-log-analytics-agent-multi-homing-support)
