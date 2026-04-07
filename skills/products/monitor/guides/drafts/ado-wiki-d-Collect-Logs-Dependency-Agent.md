---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/VM Insights/How-To/Collect logs for Dependency agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FVM%20Insights%2FHow-To%2FCollect%20logs%20for%20Dependency%20agent"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collect Logs for Dependency Agent

## Collecting Diagnostic Data

### Linux
```bash
sudo -s
/opt/microsoft/dependency-agent/lib/scripts/collect-dependency-agent-data.sh
```
The script will display the name of the output file.

### Windows
Run as Administrator:
```
C:\Program Files\Microsoft Dependency Agent\scripts\CollectDependencyAgentData.vbs
```
The script will display the name of the output file.

## Enabling Debug Level Logging

> **WARNING**: Do not enable Debug logging unless directed by a SME or PG. This generates a lot of logs which could hinder RCA investigation.

1. Add/Update `collector.log.level=DEBUG` in `MicrosoftDependencyAgent.properties` in the config directory:
   - **Linux**: `/etc/opt/Microsoft/dependency-agent/config`
   - **Windows**: `C:\Program Files\Microsoft Dependency Agent\config`
   - Root/Administrator access required

2. Change takes effect within 15 seconds (assuming DA isn't significantly broken)

3. **Linux specifics**: Debug logging also applies to kernel modules, but only when loaded at DA service startup. Must restart DA:
   ```bash
   sudo /etc/init.d/microsoft-dependency-agent restart
   ```

4. DA has self-imposed limits on log file size/number to prevent runaway disk consumption

5. **Remove `collector.log.level=DEBUG` after collecting needed information**

## Known Issue: Stale AMA Config After Migration Rollback

If customer is using OMSAgentForLinux but `MicrosoftDependencyAgent.properties` contains `amaio.subsystem.enabled=true`:
- This occurs when customer previously enabled VM Insights with AMA, then switched back to Log Analytics Agent
- **Fix**: Remove the `amaio.subsystem.enabled=true` line and restart DA
