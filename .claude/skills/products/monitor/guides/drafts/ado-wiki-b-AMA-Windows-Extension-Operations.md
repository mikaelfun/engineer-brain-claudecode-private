---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Extension Operations (Disable, Enable, Uninstall, Install)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Extension%20Operations%20%28Disable%2C%20Enable%2C%20Uninstall%2C%20Install%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
---
Applies To:
- Azure Monitor Agent - Windows:- All versions
---

[[_TOC_]]

# Overview
---
This article will provide steps to disable (stop), enable (start), install, and uninstall the Azure Monitor Agent for Windows extension.

# Scheduled Tasks & PowerShell
The following is a scripted method of using scheduled tasks to stop/uninstall/install/start AMA as the SYSTEM account:

```
# Last modified: 2025-03-07

$currentVersion = ((Get-ChildItem -Path "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Azure\HandlerState\" `
   | where Name -like "*AzureMonitorWindowsAgent*" `
   | ForEach-Object {$_ | Get-ItemProperty} `
   | where InstallState -eq "Enabled").PSChildName -split('_'))[1]  
  
$xml=@"  
<?xml version="1.0" encoding="UTF-16"?>  
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">  
 <RegistrationInfo>  
   <Date>2024-02-28T12:21:10.4793319</Date>  
   <Author>administrator</Author>  
   <URI>\Stop AMA</URI>  
 </RegistrationInfo>  
 <Triggers>  
   <TimeTrigger>  
     <StartBoundary>2024-02-28T12:27:57</StartBoundary>  
     <Enabled>true</Enabled>  
   </TimeTrigger>  
 </Triggers>  
 <Principals>  
   <Principal id="Author">  
     <UserId>S-1-5-18</UserId>  
     <RunLevel>LeastPrivilege</RunLevel>  
   </Principal>  
 </Principals>  
 <Settings>  
   <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>  
   <DisallowStartIfOnBatteries>true</DisallowStartIfOnBatteries>  
   <StopIfGoingOnBatteries>true</StopIfGoingOnBatteries>  
   <AllowHardTerminate>true</AllowHardTerminate>  
   <StartWhenAvailable>false</StartWhenAvailable>  
   <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>  
   <IdleSettings>  
     <StopOnIdleEnd>true</StopOnIdleEnd>  
     <RestartOnIdle>false</RestartOnIdle>  
   </IdleSettings>  
   <AllowStartOnDemand>true</AllowStartOnDemand>  
   <Enabled>true</Enabled>  
   <Hidden>false</Hidden>  
   <RunOnlyIfIdle>false</RunOnlyIfIdle>  
   <WakeToRun>false</WakeToRun>  
   <ExecutionTimeLimit>PT72H</ExecutionTimeLimit>  
   <Priority>7</Priority>  
 </Settings>  
 <Actions Context="Author">  
   <Exec>  
     <Command>C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\$currentVersion\AzureMonitorAgentExtension.exe</Command>  
     <Arguments>arg1</Arguments>  
     <WorkingDirectory>C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\$currentVersion\</WorkingDirectory>  
   </Exec>  
 </Actions>  
</Task>  
"@  

$xmlDisable = $xml -replace "arg1","disable"
$xmlEnable = $xml -replace "arg1","enable"
$xmlUninstall = $xml -replace "arg1","uninstall"
$xmlInstall = $xml -replace "arg1","install"

# Create an array of objects containing the command parameters
$tasks = @(
    @{Xml = $xmlDisable;  Name = "AMA $currentVersion - Disable (Stop)"}
    @{Xml = $xmlEnable;   Name = "AMA $currentVersion - Enable (Start)"}
    @{Xml = $xmlUninstall; Name = "AMA $currentVersion - Uninstall"}
    @{Xml = $xmlInstall;  Name = "AMA $currentVersion - Install"}
)

# Loop through each task and register it with error handling
foreach ($task in $tasks) {
    try {
        Register-ScheduledTask -Xml $task.Xml -TaskName $task.Name -ErrorAction Stop
        Write-Verbose "Successfully registered task: $($task.Name)"
    }
    catch [Microsoft.Management.Infrastructure.CimException] {
        if ($_.FullyQualifiedErrorId -eq "HRESULT 0x800700b7,Register-ScheduledTask") {
            Write-Verbose "Task '$($task.Name)' already exists, skipping registration"
        }
        else {
            # Re-throw any other CimException
            Write-Error "Error registering task '$($task.Name)': $($_.Exception.Message)"
            throw $_
        }
    }
}

# Start-ScheduledTask -TaskName "AMA $currentVersion - Disable (Stop)"
# Start-ScheduledTask -TaskName "AMA $currentVersion - Enable (Start)"
# Start-ScheduledTask -TaskName "AMA $currentVersion - Uninstall"
# Start-ScheduledTask -TaskName "AMA $currentVersion - Install"

# Unregister-ScheduledTask -TaskName "AMA $currentVersion - Disable (Stop)" -Confirm:$false
# Unregister-ScheduledTask -TaskName "AMA $currentVersion - Enable (Start)" -Confirm:$false
# Unregister-ScheduledTask -TaskName "AMA $currentVersion - Uninstall" -Confirm:$false
# Unregister-ScheduledTask -TaskName "AMA $currentVersion - Install" -Confirm:$false
```

![image.png](/.attachments/image-308bc264-7e2b-4cf2-9a76-25000f4b3ce7.png)