---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Virtual Machines/Collect VM Guest Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FVirtual%20Machines%2FCollect%20VM%20Guest%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Collect VM Guest Logs on Azure Stack Edge

## Steps
1. Enter Support Session on ASE
2. Identify VM and resource group: `get-vm | fl Name, Notes`
3. Import log collection module:
   ```powershell
   ipmo 'C:\Program Files\WindowsPowerShell\Modules\Microsoft.AzureStack.GuestLogCollectionTool\Microsoft.AzureStack.Common.Tools.GuestLogCollectionTool.PowershellModule.dll'
   ```
4. Create log directory: `mkdir C:\VmGuestLogs`
5. Set variables:
   ```powershell
   $subscriptionid = Get-ArmSubscriptionId
   $clustername = hostname
   ```
6. Collect logs:
   - **Windows**: `Get-AzureStackGuestLogs -VmName <name> -ResourceGroupName <rg> -Subscriptionid $subscriptionid -Windows -ClusterName $clustername -OutputDirectory C:\VmGuestLogs -Verbose -SkipUncPathConversion -Force`
   - **Linux**: `Get-AzureStackGuestLogs -VmName <name> -ResourceGroupName <rg> -Subscriptionid $subscriptionid -Linux -ClusterName $clustername -OutputDirectory C:\VmGuestLogs -Verbose -SkipUncPathConversion -Force`
