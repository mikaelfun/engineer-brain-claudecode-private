---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Windows/How To/How To: Manually Purge CT&I Windows Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Windows/How%20To/How%20To%3A%20Manually%20Purge%20CT%26I%20Windows%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::





# Scenario
---
If you are ever in the position where you need to manually purge the CT&I Agent for Windows, the following process will give you some guidance.

Make sure to uninstall the CT&I extension from Azure Portal first, regardless of a failed uninstallation, as below process is only for the agent on OS, not for extension itself.

**Method 1** (Recommended)
This is using the same commands the Guest Agent uses to maintain the agent. Run below commands in a PowerShell session.
```
cd C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>
.\cta_windows_handler.exe disable
.\cta_windows_handler.exe uninstall
```
**Method 2** (If method 1 does not work)
1. Remove change_tracking_service
```
$serviceName = "change_tracking_service"

# Stop the service if it is running
Stop-Service -Name $serviceName -Force

# Remove the service using sc.exe
sc.exe delete $serviceName
```

2. Remove local files
- C:\Program Files\ChangeAndInventory\ *
- Optional: C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\ *
- Optional: C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>\ *



