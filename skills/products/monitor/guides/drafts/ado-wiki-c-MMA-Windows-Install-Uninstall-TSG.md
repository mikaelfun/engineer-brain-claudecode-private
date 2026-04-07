---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/Troubleshooting Guides/Troubleshooting Windows Agent Installation and Uninstallation issue"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FMicrosoft%20Monitoring%20Agent%20(MMA)%20for%20Windows%2FTroubleshooting%20Guides%2FTroubleshooting%20Windows%20Agent%20Installation%20and%20Uninstallation%20issue"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Windows MMA Agent Installation and Uninstallation Issues

Applies To: Microsoft Monitoring Agent (MMA) - All versions when installed as Extension

## Uninstallation Troubleshooting

### Basic Uninstallation Steps
1. Remove MicorosoftMonitoringAgent from Extensions section of VM blade in portal (if MMA extension)
2. In Programs and Features, select Microsoft Monitoring Agent > Uninstall > Yes
   - Or command line: `%WinDir%\System32\msiexec.exe /x <Path>:\MOMAgent.msi /qb`
3. Stop and verify services: HealthService.exe and MonitoringHost.exe must be NOT RUNNING

### Scenario 1: Clean Partial/Corrupted Agent Installs

**Symptom:** Service status shows error when double-clicking service name in services.msc. MOMagent_install.log shows:
```
Information 1923.Service 'HealthService' could not be installed. Verify that you have sufficient privileges to install system services.
Assembly Install: Failing with hr=80070005 at RemoveDirectoryAndChildren
```

**Cause:** Service is in partial deletion state.

**Resolution:**
- Delete service without OS reboot: Open admin command prompt, run `sc.exe delete HealthService`
- Delete service with OS reboot: Remove registry key `HKLM\SYSTEM\CurrentControlSet\Services\HealthService`
- Remove agent installation folder: `C:\Program Files\Microsoft Monitoring Agent`
- Remove certificate: `Get-ChildItem 'Cert:\LocalMachine\Microsoft Monitoring Agent' | Remove-Item`

### Scenario 2: Clean Partial/Corrupted Previous Agent Installs

**Symptom:** Agent processes not running, agent directory empty, but `Get-WmiObject -Class Win32_Product -Filter "Name='Microsoft Monitoring Agent'"` still shows agent installed.

**Cause:** Partial/corrupted installation of a previous version prevents newer version installation/uninstallation.

**Resolution:**
1. Note the IdentifyingNumber from Get-WmiObject output
2. Match it to a known agent version in the version table
3. Download the matching MSI version and install it first
4. Verify it shows in Add/Remove Programs and the agent folder
5. Double-click the MSI to uninstall (will give "remove" option)
6. Verify agent no longer shows in Get-WmiObject output
7. If none of above works, try Microsoft Fix It tool

## Installation Troubleshooting

### Basic Installation Steps
1. Download agent MSI from portal
2. Install without Azure Log Analytics configuration first to verify basic installation
3. If basic install OK, configure Log Analytics workspace via Control Panel
4. For extension-based install, refer to MMA Extension troubleshooting guide

### Verification Checklist
- Check heartbeat in corresponding Log Analytics workspace
- Verify HealthService.exe and MonitoringHost.exe are running
  - MonitoringHost.exe only starts after HealthService downloads and applies config
- Verify registry key exists: `HKLM\SYSTEM\CurrentControlSet\Services\HealthService`

### Troubleshooting Steps
1. Check machine meets requirements (OS, .NET, TLS 1.2)
2. Check if agent is behind Azure Private Link
3. Check network connectivity
4. Use command line install with logging: `msiexec.exe /i "MOMAgent.msi" /l*v "C:\Temp\MOMAgent_install.log"`
5. Use Process Monitor to capture precise registry key details
6. Check Application and System event viewer logs

### Known Installation Errors
- **Error 25211**: Failed to install performance counters (Error Code: -2147024809)
- **Error 1402**: Could not open registry key
- **Error ConvertStringSecurityDescriptorToSecurityDescriptor failed: 87**
- **Error 0x80070643 / Status 1603 / Error 1714**: Fatal error during installation
- **Upgrade not supported for currently installed version**

### Log Collection
1. Use troubleshooting tool: `cd "C:\Program Files\Microsoft Monitoring Agent\Agent\Troubleshooter"` then `.\GetAgentInfo.ps1`
2. Install via admin command prompt with logs: `msiexec.exe /i "MOMAgent.msi" /l*v "C:\Temp\MOMAgent_install.log"`
3. Use Process Monitor (Procmon.exe) to capture detailed operations during install
4. Collect network trace if connectivity issue suspected (Network Monitor 3.4)
