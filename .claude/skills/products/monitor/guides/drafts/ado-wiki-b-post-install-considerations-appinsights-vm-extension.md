---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Autoinstrumentation/Application Insights for Azure VMs and virtual machine scale sets/Post Install considerations"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAutoinstrumentation%2FApplication%20Insights%20for%20Azure%20VMs%20and%20virtual%20machine%20scale%20sets%2FPost%20Install%20considerations"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Post Install Considerations — Application Insights VM Extension

## 1. Checking Extension Status

Use `Get-AzVMExtension` to check the status:

```powershell
Get-AzVMExtension -ResourceGroupName "<myVmResourceGroup>" -VMName "<myVmName>" -Name ApplicationMonitoringWindows -Status
```

- The **-Name** parameter must exactly match the name used during `Set-AzVMExtension` installation
- Check the VM's **Extensions + applications** blade in the Portal to find the correct extension name
- If the name doesn't match, you'll get a `ResourceNotFound` error (StatusCode: 404)

**Key fields in output:**
- `ProvisioningState: Succeeded` → IIS is configured with Redfield and will attempt to inject Application Insight binaries into .NET web apps hosted in IIS
- `PublicSettings` → shows the `redfieldConfiguration` including connection string and app filters

## 2. Extension vs Underlying Functionality

> **Important**: An extension is not an agent. The extension can be non-functional / show unhealthy status but the underlying Application Insights functionality often still works.

## 3. Key Log Locations

### Windows Application Event Log
- Source: `Microsoft.ApplicationMonitoring.VmExtensionHandler`
- Events generated every time IIS restarts (Redfield module injection)
- No events for detecting app pool starts or actual binary injection

### Extension Handler Log
```
C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Diagnostics.ApplicationMonitoringWindows\<ver>
```

**Key log entries to look for:**

| Log Entry | Meaning |
|-----------|---------|
| `handlerEnvironmentFile: reading from '...\HandlerEnvironment.json'` | Initial event on each run |
| `Transformation to '...\applicationHost.config' was successfully applied` | IIS successfully configured for Redfield |
| `Changes detected, restarting IIS` | IIS restart after configuration change |
| `Successfully enabled Application Insights Status Monitor` | Configuration complete, monitoring active |
| `No changes needed in '...\applicationHost.config'` | Subsequent run, IIS already configured |

### Windows Azure Guest Agent Logs
- Available in Event Viewer
- Not crucial for AppInsights troubleshooting but important to be aware of

## 4. Troubleshooting Flow

1. **Check extension status** → `Get-AzVMExtension` with correct name
2. **Verify IIS configuration** → Check `applicationHost.config` for Redfield module
3. **Review extension handler log** → Look for success/failure entries above
4. **Check Application Event Log** → Source: `Microsoft.ApplicationMonitoring.VmExtensionHandler`
5. **Verify telemetry flow** → Check Application Insights for incoming data regardless of extension status
