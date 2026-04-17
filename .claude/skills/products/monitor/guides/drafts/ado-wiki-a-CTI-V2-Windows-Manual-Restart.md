---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Windows/How To/How To: Manually Restart CT&I Windows Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Windows/How%20To/How%20To%3A%20Manually%20Restart%20CT%26I%20Windows%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::




# Scenario
---
If you are ever in the position where you need to restart the CT&I Agent for Windows, the following process will give you some guidance.


**Method 1** (Recommended)
This is using the same commands the Guest Agent uses to maintain the agent. Run below commands in a PowerShell session.
```
cd C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>
# Stop Change Tracking Service
.\cta_windows_handler.exe disable

# Start Change Tracking Service
.\cta_windows_handler.exe enable
```

**Method 2** (If method 1 does not work)
```
$serviceName = "change_tracking_service"

# Stop Change Tracking Service
Stop-Service -Name $serviceName -Force

# Start Change Tracking Service
Start-Service -Name $serviceName
```




