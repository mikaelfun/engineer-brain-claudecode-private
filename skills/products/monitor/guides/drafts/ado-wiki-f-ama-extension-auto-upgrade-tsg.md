---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/Troubleshooting Guides/Troubleshooting extension auto upgrade issue on linux"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor+Agents%2FAgents%2FAzure+Monitor+Agent+(AMA)+for+Linux%2FTroubleshooting+Guides%2FTroubleshooting+extension+auto+upgrade+issue+on+linux"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting AMA Extension Auto Upgrade Issue (Linux)

## Extension Upgrade Flow
Once release starts in a region, eligible resources begin upgrading after ~1 hour. Delays up to 1 day possible. VMs not in the same availability set may upgrade at different times.

## Troubleshooting Steps

### 1. Configuration
- Verify auto upgrade is enabled: see [How to enable auto upgrade](https://learn.microsoft.com/azure/virtual-machines/automatic-extension-upgrade#enabling-automatic-extension-upgrade)
- Confirm targeted extension version is available in the specific region

### 2. Log Investigation

**Arc server logs**: `/var/lib/GuestConfig/ext_mgr_logs/gc_ext.log`
```
[EXTMGR] [INFO] Executing Upgrade request for extension: Microsoft.Azure.Monitor.AzureMonitorLinuxAgent from version: 1.21.1 to version: 1.22.2
```

**Azure VM logs**: `/var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/extension.log`

### 3. Rollback Handling
If upgrade fails, extension auto-rollbacks to previous good version. Check RSM logs:

**Azure VM** — Kusto query on `azmc2.centralus` cluster, `rsm_prod` database:
```kql
VMAutoExtensionUpgradeEvent
| where TIMESTAMP > ago(1d)
| where MonitoringApplication == "RSM-<Region>_Monitoring"
| where vMId contains "vm_name"
```

**Arc server**:
```kql
ArcVMAutoExtensionUpgradeEvent
| where TIMESTAMP > ago(1d)
| where MonitoringApplication == "RSM-<region>_Monitoring"
| where arcVMId has "machine_name"
```

### 4. Continuous Failure / High Disk Usage
If upgrade keeps failing/rolling back → may cause high disk consumption.
- **Disable** automatic upgrade temporarily via portal
- **Downgrade** to last known good version: `Set-AzVMExtension` with specific TypeHandlerVersion
- **Re-enable** auto upgrade once issue fixed

### 5. Activity Logs
Check extension upgrade operations:
```kql
EventData
| where subscriptionId == "<subId>"
| where operationName in ("Microsoft.Compute/virtualMachines/extensions/write", "Microsoft.HybridCompute/machines/extensions/write")
| sort by eventTimestamp desc
```

## PowerShell Commands

**Legacy parameter (DisableAutoUpgradeMinorVersion)**:
```powershell
Set-AzVMExtension -ResourceGroupName rg -VMName vm -ExtensionName ext -ExtensionType OmsAgentForLinux -TypeHandlerVersion 1.13 -Publisher Microsoft.EnterpriseCloud.Monitoring -DisableAutoUpgradeMinorVersion:$false ...
```

**New parameter (EnableAutomaticUpgrade)**:
```powershell
Set-AzVMExtension ... -EnableAutomaticUpgrade $true
```
