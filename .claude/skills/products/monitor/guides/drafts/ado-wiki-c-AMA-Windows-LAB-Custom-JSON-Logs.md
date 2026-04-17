---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/Learning Resources/Lab/AMA Windows: LAB: Custom JSON Logs - Monitoring File Sizes"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FLearning%20Resources%2FLab%2FAMA%20Windows%3A%20LAB%3A%20Custom%20JSON%20Logs%20-%20Monitoring%20File%20Sizes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This lab will setup a PowerShell script, run every 5 minutes by Scheduled Tasks, that will get a list of files from an input file and then log to JSON the size of those files. AMA will then be configured to collect the JSON log file into a custom table, effectively allowing us to monitor the size of files on our disk.

Steps in this lab will demonstrate how to:
- Create a custom table in Log Analytics Workspace (LAW)
- Create a Data Collection Rule (DCR) to ingest JSON
- Create a PowerShell script that will monitor file sizes and output to JSON
- Create a Scheduled Task that will run the script every 5 minutes

# Prerequisites
- Data Collection Endpoint (note the ResourceID for use later)
- Log Analytics Workspace (note the ResourceID for use later)
- Verify both DCE and LAW are in the same region
- If you are not using CloudShell, ensure PowerShell has loaded the Az module
```
# To see if you have it
Get-InstalledModule Az
# To install it if you don't have it
Install-Module Az
# Set your execution policy to allow running unsigned scripts for this process
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

# Scripted
You can [Download the ZIP](.attachments/ama_win_lab_json_fileSize.zip) and review the readMe.txt intead.

# Step 1: Create Custom Table
First, we need to create a custom table with the schema (fields) that our script will output.

Update and run the PowerShell script variables from a machine with Azure access:
- lawResourceId: ResourceID of the Log Analytics Workspace wherein to create the custom table
- subscriptionId: subscriptionId the Log Analytics Workspace exists in

Create-LAWTable.ps1
```
# Define variables
$lawResourceId = "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourcegroups/rg-name/providers/microsoft.operationalinsights/workspaces/law-name" # ResourceId of the Log Analytics Workspace
$tableName = "fileSize_CL" # Name of the table to create in the Log Analytics Workspace. Must end with _CL
$subscriptionId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Connect to Azure
Connect-AzAccount
Set-AzContext -SubscriptionId $subscriptionId

# Build table properties
$tableParams = @"
{
    "properties": {
        "schema": {
            "name": "$tableName",
            "columns": [
                {
                    "name": "TimeGenerated",
                    "type": "DateTime"
                }, 
                {
                    "name": "Computer",
                    "type": "String"
                },
                {
                    "name": "FilePath",
                    "type": "String"
                },
                {
                    "name": "ps_FilePath",
                    "type": "String"
                },
                {
                    "name": "ps_FileSizeInBytes",
                    "type": "Int"
                }
            ]
        }
    }
}
"@

# Validate that table ends ends with _CL
if (!($tableName.EndsWith("_CL"))) {
    Write-Output "Table name must end with _CL"
}
else{
    Invoke-AzRestMethod -Path "$($lawResourceId)/tables/$($tableName)?api-version=2021-12-01-preview" -Method PUT -payload $tableParams
}
```

You should now have a custom table:
![image.png](/.attachments/image-a307d2c1-bedc-4e27-ba4d-ecd9951e13af.png)

# Step 2: Create Data Collection Rule (DCR)
Update the ARM template variables:
- dataCollectionRule_Name: name of the data collection rule
- dataCollectionEndpoint_ResourceId: ResourceID of the Data Collection Endpoint (same region as DCR/LAW)
- logAnalyticsWorkspace_ResourceId: ResourceID of the Log Analytics Workspace where custom table was created
- region: region to create the Data Collection Rule in (same region as DCE/LAW)
- filePattern: pattern where the .json file will be output from script that writes file size info (must escape backslashes with a backslash)

template.json
```
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
  "parameters": {
    "dataCollectionRule_Name": {
      "defaultValue": "dcr-winJSON_fileSize-dev-westus2-001",
      "type": "String"
    },
    "dataCollectionEndpoint_ResourceId": {
      "defaultValue": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/rg-name/providers/Microsoft.Insights/dataCollectionEndpoints/dce-name",
      "type": "String"
    },
    "logAnalyticsWorkspace_ResourceId": {
      "defaultValue": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/rg-name/providers/Microsoft.OperationalInsights/workspaces/law-name",
      "type": "String"
    },
    "region": {
      "defaultValue": "westus2",
      "type": "String"
    },
    "filePattern": {
      "defaultValue": "C:\\temp\\ama_json\\AMAFileSizeLogger_output_*.json",
      "type": "String"
    }
  },
    "variables": {},
    "resources": [
      {
        "type": "Microsoft.Insights/dataCollectionRules",
        "apiVersion": "2023-03-11",
        "name": "[parameters('dataCollectionRule_Name')]",
        "location": "[parameters('region')]",
        "kind": "Windows",
        "properties": {
          "dataCollectionEndpointId": "[parameters('dataCollectionEndpoint_ResourceId')]",
          "streamDeclarations": {
            "Custom-Json-fileSize_CL": {
              "columns": [
                {
                  "name": "TimeGenerated",
                  "type": "datetime"
                },
                {
                  "name": "Computer",
                  "type": "string"
                },
                {
                  "name": "FilePath",
                  "type": "string"
                },
                {
                  "name": "ps_FilePath",
                  "type": "string"
                },
                {
                  "name": "ps_FileSizeInBytes",
                  "type": "int"
                }
              ]
            }
          },
          "dataSources": {
            "logFiles": [
              {
                "streams": [
                  "Custom-Json-fileSize_CL"
                ],
                "filePatterns": [
                  "[parameters('filePattern')]"
                ],
                "format": "json",
                "name": "Custom-Json-fileSize_CL"
              }
            ]
          },
          "destinations": {
            "logAnalytics": [
              {
                "workspaceResourceId": "[parameters('logAnalyticsWorkspace_ResourceId')]",
                "name": "la-893964079"
              }
            ]
          },
          "dataFlows": [
            {
              "streams": [
                "Custom-Json-fileSize_CL"
              ],
              "destinations": [
                "la-893964079"
              ],
              "transformKql": "source",
              "outputStream": "Custom-fileSize_CL"
            }
          ]
        }
      }
    ]
}
```

Save this as template.json and note the path to this file. We'll use it in the next step.

Update and run the PowerShell script variables from a machine with Azure access:
- resourceGroupName: resource group name to create a Data Collection Rule in
- templateFile: the path to your template.json file
- subscriptionId: subscriptionId the Log Analytics Workspace exists in

Create-DCR.ps1
```
# Define variables
$resourceGroupName = "rg-name"
$templateFile = "$PSScriptRoot\arm\dcr\template.json"
$subscriptionId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Connect to Azure
Connect-AzAccount
Set-AzContext -SubscriptionId $subscriptionId

# Deploy the template
New-AzResourceGroupDeployment `
    -ResourceGroupName $resourceGroupName `
    -TemplateFile $templateFile `
    -Verbose
```

Associate your AMA resource to the DCR:
![image.png](/.attachments/image-e7d72fa9-3fb8-40d8-9906-e79efe43a7fe.png)

# Step 3: Setup file monitoring

On the machine where you have AMA installed and you want to monitor file sizes:

Update and run the PowerShell script variables from a machine with Azure access:
- scriptName (optional): if you want to call the script something else
- inputFile (optional): if you want to change the path of the file that defines the list of files to get file size info regarding
- outputFile (optional): if you want to change the path where the script will write .json log files with file size info

AMAFileSizeLogger.ps1
```
# Define variables
$scriptName = "AMAFileSizeLogger"

# Start a transcript for logging/debugging this script
Start-Transcript -Path "$PSScriptRoot\$($scriptName)_transcript_$(Get-Date -Format yyyy-MM-dd).log" -Append

# Get the hostname
$hostname = $env:COMPUTERNAME
Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - Starting..."

# Define a list of paths to monitor (what files will this script log the sizes of)
$inputFile = "$PSScriptRoot\$($scriptName)_input.txt"

# If the files to monitor has not already been defined, create a sample to start with
if (-not (Test-Path -Path $inputFile)) {
    $content = @(
        "$PSScriptRoot\*.json"
        "$PSScriptRoot\$($scriptName)_transcript_*.log"
    )

    Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - Input does not yet exist. Creating a sample at $inputFile"
    Set-Content -Path "$PSScriptRoot\$($scriptName)_input.txt" -Value $content
}
else {
    Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - Input file: $inputFile"
}

# Define the output file (where to put the log that AMA will ingest)
$outputFile = "$PSScriptRoot\$($scriptName)_output_$(Get-Date -Format yyyy-MM-dd).json"
 
# Ensure the output directory exists
$outputDir = Split-Path -Path $outputFile -Parent
if (-not (Test-Path -Path $outputDir)) {
    Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - Output directory does not yet exist. Creating directory $outputDir"
    New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
}
 
# Get list of paths
$fileList = Get-Content -Path $inputFile
Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - Monitoring file size in paths:`n`t$($fileList -join "`n`t")"
 
# Get list of files
$allFiles = $fileList | ForEach-Object {Get-ChildItem -Path $_ -ErrorAction Continue}
Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - Monitoring file size of files:`n`t$($allFiles.FullName -join "`n`t")"
 
# Initialize an array to hold log entries
$logEntries = @()
 
# Process each file in the list
foreach ($file in $allFiles) {
    $date = $(Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")
 
    if (Test-Path -Path $file.FullName) {
        Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - Get file info: $($file.FullName)"
        $fileInfo = Get-Item -Path $file.FullName
 
        # Create the log entry
        $logEntry = @{
            TimeGenerated       = $date
            ps_FilePath         = $file.FullName
            ps_FileSizeInBytes  = $fileInfo.Length
        }
    }
    else {
        Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - File not found: $($file.FullName)"
        $logEntry = @{
            TimeGenerated       = $date
            ps_FilePath         = $file.FullName
            ps_FileSizeInBytes  = "File not found"
        }
    }
    # Add the log entry to the array
    $logEntries += $logEntry
}
 
# Convert log entries to JSON format and append to the output file
Write-Output "$(Get-Date -Format yyyy-MM-dd_HHmmss) $hostname - Write log: $outputFile"
foreach ($logEntry in $logEntries) {
    $jsonLogEntry = $logEntry | ConvertTo-Json -Compress   
    [System.IO.File]::AppendAllText($outputFile, $jsonLogEntry + [Environment]::NewLine)
}

# Logging output
Write-Output "$(Get-Date -Format yyyyMMdd_HHmmss) $hostname - Ending..."

# Stop transcript for logging/debugging this script
Stop-Transcript
```

If you want to change the default files to monitor, you can specify the paths in the input file. Default location is:
```C:\temp\ama_json\AMAFileSizeLogger_input.txt```

![image.png](/.attachments/image-1bebe8c2-a727-4e34-8c5f-a8eca03c73e3.png)

# Step 4: Create the Scheduled Task
On the machine where you have AMA installed and you want to monitor file sizes:

Update and run the PowerShell script variables from a machine with Azure access:
- taskName (optional): if you want to change the name of the scheduled task
- scriptPath: the path where you will copy the AMAFileSizeLogger.ps1

Create-ScheduledTask.ps1
```
# Define variables
$taskName = "AMA File Size Logger" # Name of the scheduled task
$scriptPath = "C:\temp\ama_json\AMAFileSizeLogger.ps1" # Path to the .ps1 script to run on a schedule

$xml=@"  
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>$(Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffffff")</Date>
    <Author>$($env:USERDOMAIN + '\' + $env:USERNAME)</Author>
    <Description>PowerShell script gets the file size of monitored files and outputs them to a .json log for Azure Monitor Agent to ingest.</Description>
    <URI>\monitoredFiles</URI>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <Repetition>
        <Interval>PT5M</Interval>
        <Duration>P1D</Duration>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
      <StartBoundary>2025-01-01T00:00:00</StartBoundary>
      <ExecutionTimeLimit>PT30M</ExecutionTimeLimit>
      <Enabled>true</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>S-1-5-18</UserId>
      <RunLevel>HighestAvailable</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>StopExisting</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>true</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
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
    <ExecutionTimeLimit>P1D</ExecutionTimeLimit>
    <Priority>7</Priority>
    <RestartOnFailure>
      <Interval>PT15M</Interval>
      <Count>3</Count>
    </RestartOnFailure>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>powershell.exe</Command>
      <Arguments>-ExecutionPolicy Bypass -File "$($scriptPath)"</Arguments>
    </Exec>
  </Actions>
</Task> 
"@  

# Create the task
$taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if (-not $taskExists) {
    Register-ScheduledTask -Xml $xml -TaskName $taskName
    Start-ScheduledTask -TaskName $taskName
}

# Start-ScheduledTask -TaskName $taskName
# Unregister-ScheduledTask -TaskName $taskName -Confirm:$false

```

# Step 5: Verify data in workspace
It'll take some time before data arrives in your workspace. Wait about 10 minutes and then check.

![image.png](/.attachments/image-469d2361-be35-4291-98b4-4ba1a18b97c3.png)