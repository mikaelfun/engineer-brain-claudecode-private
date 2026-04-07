---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Generating and Reading Performance Logs on Azure Stack Edge"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FGenerating%20and%20Reading%20Performance%20Logs%20on%20Azure%20Stack%20Edge"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Generating and Reading Performance Logs on Azure Stack Edge

Useful for diagnosing high or unusual volume of traffic between ASE and Azure Storage.

## Location
Performance logs (.blg files) are in the support package, readable by Windows Performance Monitor.

## Steps
1. Launch **Performance Monitor** (Start > search "Performance Monitor")
2. Click **Performance Monitor** in left pane
3. Click **View Log Data** (second icon from left)
4. **Source** tab > **Log files** > **Add** > select .blg file(s)
5. Click **OK/Apply** to return to main screen
6. Click **Add** (green plus) to choose counters
7. Select counters > **Add >>>** > **OK**
8. Chart displays with time frame and counter values; click color to see details
