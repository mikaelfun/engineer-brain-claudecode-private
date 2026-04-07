---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Migration from LA Agents to AMA/How-To/HT: How to use DCR Config Generator"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMigration%20from%20LA%20Agents%20to%20AMA%2FHow-To%2FHT%3A%20How%20to%20use%20DCR%20Config%20Generator"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Use DCR Config Generator for MMA-to-AMA Migration

## Overview
The DCR Config Generator creates JSON files for deploying Data Collection Rules (DCRs) based on existing Log Analytics agent definitions in a workspace.

### Supported Log Types
- Windows Event Log and Performance Counters
- Linux Syslog and Performance Counters
- VM Insights
- Custom Text Logs (generates separate DCR per custom table)
- IIS Logs

Output includes ARM template files (`*_arm_template.json`) and command-based payload files (`*_payload.json`).

## Prerequisites
- PowerShell 5.1+ (7.1.3+ recommended)
- Read/write access to workspace resources
- Az PowerShell module (Az.Accounts, Az.OperationalInsights)
- Azure credentials for Connect-AzAccount

### Pre-Migration Check for VM Insights
If currently using VM Insights with Log Analytics Agent:
1. Check if Dependency Agent is installed (look for DependencyAgentLinux/DependencyAgentWindows in Extensions)
2. Machines with Dependency Agent need to bind to VM Insights DCR after removing Log Analytics agent

## Step-by-Step Guide

### Step 1: Download Script
Download `WorkspaceConfigToDCRMigrationTool.ps1` from:
https://github.com/microsoft/AzureMonitorCommunity/tree/master/Azure%20Services/Azure%20Monitor/Agents/Migration%20Tools/DCR%20Config%20Generator

### Step 2: Run the Script
```powershell
$subId = "<subscription_id>"
$rgName = "<resourcegroup_Name>"
$workspaceName = "<ws_name>"
$dcrName = "<newdcr_name>"
$folderPath = "<path to output folder>"
.\WorkspaceConfigToDCRMigrationTool.ps1 -SubscriptionId $subId -ResourceGroupName $rgName -WorkspaceName $workspaceName -DCRName $dcrName -OutputFolder $folderPath
```

**Troubleshooting:** If "Not digitally signed" error occurs:
```powershell
Get-ExecutionPolicy -list
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Custom Text Logs: DCE Prompt
For custom text log definitions, tool prompts for a Data Collection Endpoint (DCE):
- Choose `y` to provision a new DCE (enter Sub ID, Resource Group, Name, Location)
- Choose `n` to specify an existing DCE resource ID
- DCE must be in the same region as the Log Analytics workspace and DCRs

### Step 3: Verify Output
Check output folder for JSON files ending in `_arm_template.json` for each log type detected in the workspace.

### Step 4: Deploy DCRs

**Option A - Tool Deployment:**
When prompted `Do you want to run a test deployment?`, enter `y` and provide:
- Deployment Subscription
- Deployment Resource Group
- ARM template file name (e.g., `windows_dcr_arm_template.json`)

**Option B - Portal Deployment:**
1. Go to Azure Portal > Deploy Custom Template
2. Click "Build your own template in the editor" > Load file > select ARM template
3. Fill required fields > Review + Create > Create
4. Navigate to created DCR resource > Add resource associations
