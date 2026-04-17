---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Linux Azure Diagnostics (LAD)/Troubleshooting Guides/TSG: Linux Diagnostic Extension"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FLinux%20Azure%20Diagnostics%20%28LAD%29%2FTroubleshooting%20Guides%2FTSG%3A%20Linux%20Diagnostic%20Extension"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG: Linux Diagnostic Extension (LAD)

## Prerequisites
- [Prerequisites of LAD](https://docs.microsoft.com/azure/virtual-machines/extensions/diagnostics-linux?tabs=azcli#prerequisites)

## Data Flow
PG escalation:
- Agent related: Azure Diagnostics/LAD
- UI related: Azure Portal IaaS Experiences/Triage

## Log collection for ICM

### Configuration Files
- LAD: `/var/lib/waagent/Microsoft.Azure.Diagnostics.LinuxDiagnostic-<ver>/config/0.settings`
- mdsd: `/var/lib/waagent/Microsoft.Azure.Diagnostics.LinuxDiagnostic-<ver>/xmlCfg.xml`
- omsagent: `/etc/opt/microsoft/omsagent/LAD/conf`
- rsyslog: `/etc/rsyslog.d/95-omsagent.conf`
- Syslog-ng: `/etc/syslog-ng/syslog-ng.conf`

### Log files
- LAD: `/var/log/azure/Microsoft.Azure.Diagnostics.LinuxDiagnostic/extension.log`
- mdsd: `/var/log/azure/Microsoft.Azure.Diagnostics.LinuxDiagnostic/mdsd.*`
- omsagent: `/var/opt/microsoft/omsagent/LAD/log/omsagent.log`
- OMI: `/var/opt/omi/log`

## Scenario 1: Installation failure

1. Get diagnostic extension settings by PowerShell command [Get-AzVMDiagnosticsExtension](https://docs.microsoft.com/powershell/module/az.compute/get-azvmdiagnosticsextension)

2. If logs are sent to storage account or event hub, check public and private settings and make sure sinks are well configured.

   2.1. The Sink definition is only added in the protected settings, not like WAD where you can add it in public settings.

   2.2. For the public config you need only to add the sinks definition to the parameters you want to send to that event hub sink.

   2.3. Please ensure storage account key/endpoint, event hub access key/url is correct and have sufficient permission.

   2.4. If sending metrics to the Azure Monitor sink, install **version 4.0** which includes updated configuration for system-assigned identity and sinks. Make sure you enabled system managed identity for sinks.

3. Check below services and ensure them running after installation:
   - omsagent-LAD
   - mdsd-lde

   3.1. If mdsd-lde service is not running, ensure rubygem.org is accessible.

   3.2. If network requirement is met, check collected logs to investigate separately.

   3.3. If conflict between LAD and MMA:
   - Ensure latest versions of both; versions 1+ years old had known incompatibility
   - Remove both LAD and MMA (use `bundle --purge` to remove all related packages completely)
   - Install both again
   - If still not working, try installing in reversed order

## Scenario 2: Data missing in destinations

1. Check diagnostic extension setting and version.
2. Verify the connection from the VM to the event hub on port 443: `curl -v <endpoint of event hub>`
3. Verify configuration details under `/var/lib/waagent/Microsoft.Azure.Diagnostics.LinuxDiagnostic-<ver>/xmlCfg.xml`
4. Verify omiserver and mdsd are running:
   - `scxadmin -status`
   - `ps -aux | grep mdsd`

   4.1. If not running, try to restart or restart waagent:
   ```bash
   /opt/omi/bin/omiserver -s
   systemctl stop waagent
   systemctl start waagent.service
   ```

   4.2. If waagent fails to restart, engage Azure VM team.

   4.3. If omiserver running but cannot collect data, try manual capture:
   ```bash
   /opt/omi/bin/omicli cql root/scx "SELECT AvailableMemory, PercentAvailableMemory, UsedMemory, PercentUsedMemory, PercentUsedByCache, PagesPerSec, PagesReadPerSec, PagesWrittenPerSec, AvailableSwap, PercentAvailableSwap, UsedSwap, PercentUsedSwap FROM SCX_MemoryStatisticalInformation"
   ```

   4.4. Check omicli connection: `/opt/omi/bin/omicli id`

   4.5. If still no luck, re-install omi:
   ```bash
   yum remove omi
   systemctl restart waagent.service
   ```

## Common Issues

### Issue 1: NoneType object has no attribute
- Error comes from main LAD Python scripts (diagnostic.py)
- Like a "null reference exception" in Python
- Usually a syntax error in Public Settings (misnamed or missing property)
- **Solution**: Compare customer's config with well-known good config examples

### Issue 2: EventHub or Blob Sink Not Working
- Custom sinks need to be declared in Protected Settings (sinksConfig) AND referenced in Public Settings

### Issue 3: FileLogs Not Working
- FileLogs are captured by OMS Agent
- Check that omsagent user has access to the file: `sudo su omsagent -c 'cat /path/to/file'`
- Check OMS Agent logs and mdsd logs

### Issue 4: LAD fails to install on RHEL 8.0
- RedHat/CentOS 8.0 do not include default system-wide Python
- Workaround: install Python 2 and set it as the system default

## Additional resources
- [Azure Diagnostics extension overview](https://docs.microsoft.com/azure/azure-monitor/platform/diagnostics-extension-overview)
- [Use Linux Diagnostic Extension to monitor metrics and logs](https://docs.microsoft.com/azure/virtual-machines/extensions/diagnostics-linux)
