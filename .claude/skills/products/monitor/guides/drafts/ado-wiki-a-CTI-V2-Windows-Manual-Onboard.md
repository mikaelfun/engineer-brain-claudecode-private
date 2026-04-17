---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Change Tracking(v2) and Inventory/Change Tracking and Inventory (CT&I) V2 - Windows/How To/How To: Manually Onboard CT&I Windows Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Change%20Tracking%28v2%29%20and%20Inventory/Change%20Tracking%20and%20Inventory%20%28CT%26I%29%20V2%20-%20Windows/How%20To/How%20To%3A%20Manually%20Onboard%20CT%26I%20Windows%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::



# Scenario
---
If you are ever in the position where you need to manually onboard the CT&I Agent for Windows, the following process will give you some guidance.


**Method 1** (Recommended)
This is using the same commands the Guest Agent uses to maintain the agent. Run below commands in a PowerShell session.
```
# Setup change_tracking_service
cd C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\<version>
.\cta_windows_handler.exe install

# Start change_tracking_service
.\cta_windows_handler.exe enable
```
**Method 2** (If method 1 does not work)
1. Manually setup change_tracking_service. This needs PowerShell in elevated session.

```
# Define service parameters
$serviceName = "change_tracking_service"
$displayName = "ChangeTrackingOneAgent"
$description = "This is a Go service that runs the ChangeTracking agent process."
$version = "2.24.0.0"
$exePath = "C:\Program Files\ChangeAndInventory\svc\change_tracking_service.exe"
$exeArgs = "C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\$version\agent\change_tracking_agent_windows_amd64.exe change_tracking_service C:\Packages\Plugins\Microsoft.Azure.ChangeTrackingAndInventory.ChangeTracking-Windows\$version"
$startMode = "Automatic" # For start mode 'Auto'
$delayedAutoStart = $true

# Create the service
New-Service -Name $serviceName -BinaryPathName "$exePath $exeArgs" -DisplayName $displayName -Description $description -StartupType $startMode

# Set the delayed auto start
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\$serviceName"
Set-ItemProperty -Path $regPath -Name "DelayedAutostart" -Value 1

# Start the service
Start-Service -Name $serviceName
```

**Note**: You may backup any files in `C:\Program Files\ChangeAndInventory\` if exists prior to these scripts.



