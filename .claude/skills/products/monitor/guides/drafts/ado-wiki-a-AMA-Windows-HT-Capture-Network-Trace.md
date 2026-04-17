---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Capture a Network Trace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Capture%20a%20Network%20Trace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Getting started
- Run PowerShell as Administrator
- Paste in one of the following scripts

# Scenario: AMA

```
$lastModified = "2025-03-07"
Start-Transcript -Path "$($env:TEMP)\AMA_NetworkTrace_Transcript.log"
Write-Host "Last modified:  $($lastModified)"

# Set vars
$date = Get-Date -Format yyyyMMdd_hhmmss
Write-Host "VAR: date = $date"

$dirName = "AMA_NetworkTrace_$($env:COMPUTERNAME)_$date"
$path = $($env:TEMP + "\" + $dirName)
Write-Host "VAR: path = $path"

$sleepSecondsStartTrace = 15
Write-Host "VAR: sleepSecondsStartTrace = $sleepSecondsStartTrace"

$sleepSecondsTraceDuration = 300
Write-Host "VAR: sleepSecondsTraceDuration = $sleepSecondsTraceDuration"

Write-Host "CREATE: Output directory $path"
New-Item -Path $env:TEMP -Name $dirName -ItemType Directory

# Scheduled Task to Disable/Enable AMA
$currentVersion = ((Get-ChildItem -Path "Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Azure\HandlerState\" `
   | where Name -like "*AzureMonitorWindowsAgent*" `
   | ForEach-Object {$_ | Get-ItemProperty} `
   | where InstallState -eq "Enabled").PSChildName -split('_'))[1] 

$xml=@"  
<?xml version="1.0" encoding="UTF-16"?>  
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">  
 <RegistrationInfo>  
   <Date>$(Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffffff")</Date>  
   <Author>$($env:USERDOMAIN + '\' + $env:USERNAME)</Author>  
   <URI>\arg1 AMA</URI>  
 </RegistrationInfo>  
 <Triggers>  
   <TimeTrigger>  
     <StartBoundary>$(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")</StartBoundary>  
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

Register-ScheduledTask -Xml $xmlDisable -TaskName "AMA $currentVersion - Disable (Stop)"  
Register-ScheduledTask -Xml $xmlEnable -TaskName "AMA $currentVersion - Enable (Start)"  

# Unregister-ScheduledTask -TaskName "AMA $currentVersion - Disable (Stop)" -Confirm:$false
# Unregister-ScheduledTask -TaskName "AMA $currentVersion - Enable (Start)" -Confirm:$false
# Unregister-ScheduledTask -TaskName "AMA $currentVersion - Uninstall" -Confirm:$false
# Unregister-ScheduledTask -TaskName "AMA $currentVersion - Install" -Confirm:$false

# Disable AMA
Start-ScheduledTask -TaskName "AMA $currentVersion - Disable (Stop)"

$targetProcesses = "AMAExtHealthMonitor", "MetricsExtension.Native", "MonAgentCore", "MonAgentHost", "MonAgentLauncher", "MonAgentManager"
$taretPath = "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\*"
$maxWaitTime = 120
$elapsedTime = 0

do {
    Write-Host "WAIT: 15 seconds from now ($(Get-Date)) for processes to stop..."
    Start-Sleep -Seconds 15
    $elapsedTime += 15

    if ($elapsedTime -ge $maxWaitTime) {
        $remainingProcesses = (Get-Process | Where-Object {$_.ProcessName -in $targetProcesses} | Where-Object Path -Like $taretPath)
        if ($remainingProcesses) {
            $remainingProcesses | ForEach-Object {
                Write-Host "Maximum wait time ($maxWaitTime seconds) exceeded. Terminating process: $($_.ProcessName) (PID: $($_.Id))"
                Stop-Process -Id $_.Id -Force
            }
            # Small delay to ensure processes terminate
            Start-Sleep -Seconds 2
            # Exit loop after termination
            break
        }
    }
} until ((Get-Process | Where-Object {$_.ProcessName -in $targetProcesses} | Where-Object Path -Like $taretPath) -eq $null)

# Provide completion status
if ($elapsedTime -ge $maxWaitTime) {
    Write-Host "Processes were forcibly terminated after $maxWaitTime seconds."
} else {
    Write-Host "All processes stopped naturally within $elapsedTime seconds."
}

# Start the trace
## If heavy network traffic, the default size of 250MB may be too small - add maxsize=2048
## If http calls are failing before the wire add scenario=internetclient
Write-Host "START: Trace"
cmd.exe /c "netsh trace start persistent=yes capture=yes tracefile=$path\AMA_NetworkCapture_$date.etl"

# Wait for trace to start
Write-Host "WAIT: $sleepSecondsStartTrace seconds from now ($(Get-Date)) for trace to start"
Start-Sleep -Seconds $sleepSecondsStartTrace

# Flush DNS
Write-Host "START: DNS Flush"
cmd.exe /c "ipconfig /flushdns"

# Enable AMA
Start-ScheduledTask -TaskName "AMA $currentVersion - Enable (Start)"

# Wait for 300 seconds after processes stop (they should automatically restart)
Write-Host "WAIT: $sleepSecondsTraceDuration seconds from now ($(Get-Date)) for agent to startup"
Start-Sleep -Seconds $sleepSecondsTraceDuration

# Remove scheduled tasks
Unregister-ScheduledTask -TaskName "AMA $currentVersion - Disable (Stop)" -Confirm:$false
Unregister-ScheduledTask -TaskName "AMA $currentVersion - Enable (Start)" -Confirm:$false

# Get new processes
Write-Host "GET: AMA Processes"
$processes = Get-Process | Where-Object {$_.ProcessName -in $targetProcesses} | Where-Object Path -Like $taretPath
Write-Host "LIST: AMA Processes"
$processes

# Get proxy settings
Write-Host "LIST: SYSTEM proxy settings"
cmd.exe /c "netsh winhttp show proxy"

# Stop the trace
Write-Host "STOP: Trace"
Start-Process -FilePath "c:\windows\system32\netsh.exe" -ArgumentList "trace stop" -Wait

# Collect AMA Logs (post network trace)
$troubleshooterPath = "C:\Packages\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\$currentVersion\Troubleshooter"
Set-Location -Path $troubleshooterPath
Start-Process -FilePath $troubleshooterPath\AgentTroubleshooter.exe -ArgumentList "--ama" -Wait

# Stop transcript
Write-Host "STOP: Transcript"
Stop-Transcript

# Move transcript to folder
Write-Host "MOVE: Transcript to $path"
Move-Item -Path "$($env:TEMP)\AMA_NetworkTrace_Transcript.log" -Destination $path 

# Compress folder where traces are placed
Write-Host "COMPRESS: traces to .zip"
Compress-Archive -Path $path -DestinationPath $($path + ".zip")

# Create directory to consolidate logs
New-Item -ItemType Directory -Path $env:TEMP -Name $("logs_ama-net_" + $env:COMPUTERNAME + "_" + $date)
$logsDirectory = Get-Item -Path $($env:TEMP + "\logs_ama-net_" + $env:COMPUTERNAME + "_" + $date)
Write-Host "COMPRESS: create output directory - $logsDirectory"

# Move troubleshooter + netTrace files to consolidated directory
$troubleshooterFile = (Get-ChildItem -Path $troubleshooterPath -Filter "AgentTroubleshooterOutput-*" | Sort-Object LastWriteTime -Descending)[0]
$netTraceFile = (Get-ChildItem -Path $env:TEMP -Filter "AMA_NetworkTrace_*.zip" | Sort-Object LastWriteTime -Descending)[0]
$split = $troubleshooterFile.Name -split "AgentTroubleshooterOutput-"
Write-Host "MOVE: Troubleshooter file to output directory."
Move-Item -Path $troubleshooterFile.FullName -Destination $($logsDirectory.FullName + "\AgentTroubleshooterOutput-" + $env:COMPUTERNAME + "-$split")
Write-Host "MOVE: Network Trace file to output directory."
Move-Item -Path $netTraceFile.FullName -Destination $logsDirectory

# Open Explorer to the path where .zip files exists
Write-Host "OPEN: Output directory - $logsDirectory"
Invoke-Item $logsDirectory

```

# Output
Example of what output might look like:

![image.png](/.attachments/image-431a7a00-a803-4fc2-a97c-c10676201755.png)
