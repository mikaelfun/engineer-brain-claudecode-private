---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Health/General/Connect Health Agent Troubleshooting script"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Health%2FGeneral%2FConnect%20Health%20Agent%20Troubleshooting%20script"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Connect Health Reporting tool
Microsoft Entra Connect Health Reporting tool checks the requirements for Microsoft Entra Connect Health agent and collects agent logs to help identifying and fixing most of the common Microsoft Entra Connect Health agent issues.

Short URL for this document is https://aka.ms/aadchrep

# Script requirements
* You need to run the script using a user who is member of local administrators group.
* Ensure the folder C:\temp exists

# What does AADCHRep do?
* Check Microsoft Entra Connect Health agent role(s)
* Collect agent details
* Collect computer system information
* Collect operating system information
* Check .Net Version
* Collect network interface information
* Check Proxy settings: Get-AzureADConnectHealthProxySettings
* Check Proxy settings: IE Settings
* Check Proxy settings: netsh Settings
* Check Proxy settings: machine.config file
* Check Proxy settings: bitsadmin Settings
* Check Registry keys for: Encryption Algorithm
* Check Registry keys for: TLS 1.2 settings
* Check required Root Certificate Authorities certificates
* Check performance counters
* Running Connectivity Test
* Collect Microsoft Entra Connect Health agent log files
* More info: Check Page files
* More info: Check Logical Disks
* Check installed softwares
* Check installed Hotfixes
* Check installed services
* Generating HTML Report

Reports generated:
* C:\temp\ServerName_RequirementsCheck_DATETIME_UTC.html
* C:\temp\ServerName_AgentLogs_DATETIME.zip

# Versions Updates
Moved to PowerShell Gallery https://www.powershellgallery.com/packages/EIDHealthAgentTroubleshooter

# Using the script
Script is currently maintained in PowerShell gallery, visit https://www.powershellgallery.com/packages/EIDHealthAgentTroubleshooter

*   Ensure `c:\temp` folder exists on the server
*   Install and Import `EIDHealthAgentTroubleshooter` module by running PS command:
```powershell
if (Get-Module -Name EIDHealthAgentTroubleshooter -ListAvailable) {Update-Module -Name EIDHealthAgentTroubleshooter} else {Install-Module -Name EIDHealthAgentTroubleshooter}

Import-Module EIDHealthAgentTroubleshooter
```

Ref: [PowerShell Gallery | EIDHealthAgentTroubleshooter](https://www.powershellgallery.com/packages/EIDHealthAgentTroubleshooter/)
*   Confirm module commands:
```powershell
Get-Command -Module EIDHealthAgentTroubleshooter
```
```
CommandType  Name                               Version  Source
-----------  ----                               -------  ------
Function     Start-EIDHealthAgentLogCollection  0.0.4    EIDHealthAgentTroubleshooter
```

*   Start logs collection using command:
```powershell
Start-EIDHealthAgentLogCollection
```

- It will take few minutes to run few tests and collect logs. Once completed, please share the generated HTML report and the compressed zip file (in c:\temp folder).
- Compress and share **unfiltered** **Applications** and **Systems** event viewer logs.
