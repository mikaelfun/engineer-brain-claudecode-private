---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Azure Local MocARB/Diagnostic Commands in Azure Local for MocARB"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/Azure%20Local%20MocARB/Diagnostic%20Commands%20in%20Azure%20Local%20for%20MocARB"
importDate: "2026-04-06"
type: troubleshooting-guide
---


## Overview

This article provides a comparison of four key diagnostic commands used in Azure Local environments . These commands are essential for collecting logs and performing diagnostics for MOC and Arc Resource Bridge within the Azure Local infrastructure.

## Command Comparison Table

| Command | Scope | Purpose | Output Format | Notes |
| --- | --- | --- | --- | --- |
| `az arcappliance logs hci` | Arc Resource Bridge (Appliance VM) | Collects logs from the Arc Resource Bridge appliance deployed on Azure Stack HCI | Folder with structured logs (JSON, YAML, TXT) Basically Arc Resource Bridge OS guest and K8S logs| Requires `--ip`, `--kubeconfig`, and `--out-dir`. CLI-based. |
| `Get-ArcHciLogs` | ArcHci module | Collects logs from the ArcHci environment, including bridge and cluster extension logs and MOC | Text output or saved files | PowerShell-native. Often used in support scenarios. |
| `Get-MocLogs -Verbose -Debug` | MOC | Collects detailed logs from MOC agents and services | Folder with logs | Includes verbose and debug-level output. Useful for deep diagnostics. |
| `Get-MocEventLog` | MOC (Microsoft On-premises Cloud) | Retrieves event logs from the MOC stack (e.g., service start/stop, errors) | Text output | Focused on Windows Event Logs related to MOC services. |
***
## Detailed Comparison

### `az arcappliance logs hci`

- **Scope**: Arc Resource Bridge (Appliance VM)
- **Purpose**: Collects logs from the Arc Resource Bridge appliance deployed on Azure Stack HCI. it includes OS and K8S logs.
- **Output Format**: Folder with structured logs (JSON, YAML, TXT. LOG). KVA.log and KVA folder which contains OS and K8S logs for the Pods running in the ARB appliance
- **Notes**: Requires `--ip`, `--kubeconfig`, and `--out-dir`. CLI-based.
- **Log Collection Command**:
```powershell
$ErrorActionPreference = "SilentlyContinue"

$mocConfig = Get-MocConfig -ErrorAction SilentlyContinue
$arcHciConfig = Get-ArcHciConfig
$kvaTokenPath = $arcHciConfig["kvaTokenLocation"]
$controlPlaneIp = $arcHciConfig["controlPlaneIP"]
$cloudFqdn = $mocConfig.cloudFqdn

az arcappliance logs hci --ip $controlPlaneIp --loginconfigfile $kvaTokenPath --cloudagent $cloudFqdn --out-dir c:\MocARBLogs 
```
![image.png](/.attachments/image-174db74a-9b5f-41d7-abf0-c0821847fad5.png)

***

### `Get-ArcHciLogs -Verbose`

- **Scope**: ArcHci module
- **Purpose**: Collects logs from the ArcHci environment, including bridge and cluster extension logs.
- **Output Format**: Folder with structured logs (JSON, YAML, TXT. LOG). it includes all MOC logs and more logs like Azure Local clustered logs, UberCRUD logs
- **Notes**: PowerShell-native.
- **Log Collection Command**:

```powershell
Get-ArcHciLogs -logdir c:\MocARBLogs -verbose
```
![image.png](/.attachments/image-f828006b-6a9f-4858-ac1b-339cf21e7cd5.png)
***
### `Get-MocLogs`

- **Scope**: MOC
- **Purpose**: Collects detailed logs from MOC agents and services.
- **Output Format**: Folder with logs.
- **Notes**: When the�`Get-MocLogs`�command is called without any of the "VirtualMachineLogs", "AgentLogs", "NodeVirtualizationLogs", or "All" switches, it collects the "default logs". The "default logs" include:
1.  VirtualMachineLogs
2.  AgentLogs (but only the two latest agent-log-* files)
3.  NodeVirtualizationLogs
4.  Failover cluster logs
- **Log Collection Command**:

```powershell
Get-MocLogs -path c:\MocARBLogs -verbose
```
![image.png](/.attachments/image-16fab0ad-cf94-47b7-aa33-f24787147442.png)



***
### `Get-MocEventLog`

- **Scope**: MOC (Microsoft On-premises Cloud)
- **Purpose**: Retrieves event logs from the MOC stack (e.g., service start/stop, errors).
- **Output Format**: Text output.
- **Notes**: Focused on Windows Event Logs related to MOC services.

```powershell
# Define your date range
$startDate = Get-Date "2025-06-20"
$endDate = Get-Date "2025-06-29"
# Retrieve MOC event logs
$mocEvents = Get-MocEventLog
# Filter by date range, exclude Id = 1, and match message content
$filteredEvents = $mocEvents | Where-Object {
    $_.TimeCreated -ge $startDate -and
    $_.TimeCreated -le $endDate -and
    #$_.Id -ne 1 -and
    $_.Message -like "*aksarc01*"
}

# Display all properties of the filtered events
$filteredEvents | Format-List *
$filteredEvents | Select-Object TimeCreated, Id, Message, MachineName
```

## Conclusion

The commands listed above are crucial for effective diagnostics and log collection in Azure Stack HCI environments. Each command serves a specific purpose and is tailored to different components within the infrastructure, providing various output formats and levels of detail to aid in troubleshooting and support scenarios.



