---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Resize/Resize failing due to VM Agent Unavailable"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FCloud%20PC%20Actions%2FResize%2FResize%20failing%20due%20to%20VM%20Agent%20Unavailable"
importDate: "2026-04-06"
type: troubleshooting-guide
---

We might run into an issues where resize fails due to VM Agent not able to reach WireServer IP or Fabric Controller, or VM Agent is not running or Stuck.

Please follow the below steps to troubleshoot the issue.

1. Run CMD.exe **as Administrator** from CPC

Execute:

psexec -i -s cmd.exe   (Using PsExec tool to run CMD with system account)

from CMD run PowerShell.exe

2. Run the below command from PowerShell command one by one:

Test-NetConnection -ComputerName 168.63.129.16 -Port 80
Test-NetConnection -ComputerName 168.63.129.16 -Port 32526
Invoke-RestMethod -Headers @{"Metadata"="true"} -Method GET -Uri http://168.63.129.16/?comp=versions

3. Remove any 3rd party Anti-Virus like McAfee or VPN or Proxy from networking side from customer envt. We have seen in past customer side proxy may bypass connection but since the connection is coming from proxy, the azure side network component rejects the connection. So please remove any VPN/Proxy or Anti virus from the machine.

4. Collect below logs from IaaS Disk for the CPC which is failing

C:\WindowsAzure\Logs\WaAppAgent.log
C:\WindowsAzure\Logs\TransparentInstaller.log

Use the below link to try to analyze the above collected logs.
https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows-azure-guest-agent

5. Check if the following services are in running status, and if there are any policies or scripts block the following services.

RDAgent
WindowsAzureGuestAgent
WindowsAzureTelemetryService
