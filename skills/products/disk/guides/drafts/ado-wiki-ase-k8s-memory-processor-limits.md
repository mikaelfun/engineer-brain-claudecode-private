---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Kubernetes/Changing Memory Processor Limits for Kubernetes on Azure Stack Edge"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FKubernetes%2FChanging%20Memory%20Processor%20Limits%20for%20Kubernetes%20on%20Azure%20Stack%20Edge"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Changing Memory/Processor Limits for Kubernetes on Azure Stack Edge

## Steps

### 1. Connect to PowerShell interface
```powershell
# Launch PowerShell as Administrator
winrm quickconfig
$ip = "<device_ip>"
Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell -UseSSL
```

### 2. Check current resource values
```powershell
Get-AzureDataBoxEdgeRole
# Note the Name, MemoryInBytes, ProcessorCount values
```

### 3. Change memory and processor count
```powershell
Set-AzureDataBoxEdgeRoleCompute -Name <Name> -MemoryInBytes <MemoryAmount> -ProcessorCount <No.OfProcessorCores>
```

## Guidelines
- **Default memory**: 25% of device specification
- **Default processor count**: 30% of device specification
- **Recommended range**: 15% to 60% of device memory and processor count
- **Absolute maximum memory**: 65% (requires manual env variable change)

### To exceed 60% memory limit (up to 65%):
1. Connect to PowerShell interface
2. Set env variable: `setx /M maxComputeRoleMemoryPercentage 65`
3. Reboot device
4. Reconnect and run `Set-AzureDataBoxEdgeRoleCompute` again
5. Confirm with `Get-AzureDataBoxEdgeRole`
