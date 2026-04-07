---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/Extension/VMAccess Extension_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FExtension%2FVMAccess%20Extension_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VMAccess Extension

## Summary

If you can't connect to a Windows or Linux VM, you can reset your local administrator password or reset the RDP/SSH configuration using the VM Access extension.

## Restrictions

- Guest Agent must be in a Ready state
- Not supported on Windows domain controllers (restore from DC backup if connection is lost)

## Install Examples

### Windows VM - Reset Password (PowerShell)

```powershell
Set-AzVMAccessExtension -ResourceGroupName "myRG" -Location "myLocation" -VMName "myVM" -Credential (get-credential) -typeHandlerVersion "2.0" -Name VMAccessAgent
```

### Windows VM - Reset Password (CLI)

```bash
az vm extension set --name VMAccessAgent --publisher Microsoft.Compute --version 2.0 --vm-name "myVM" --resource-group "myRG" --protected-settings '{"username":"testuser1", "password":"Admin12345678"}'
```

### Windows VM - Reset RDP Configuration

```powershell
Set-AzVMAccessExtension -ResourceGroupName "myRG" -VMName "myVM" -Name "myVMAccess" -Location "myLocation" -typeHandlerVersion "2.0" -ForceRerun
```

### Linux VM - Reset Password (PowerShell)

```powershell
$PrivateConf = '{"username": "myuser", "password": "Admin12345678",}'
Set-AzVMExtension -ResourceGroupName "myRG" -VMName "myVM" -Location "myLocation" -Name "VMAccessForLinux" -Publisher "Microsoft.OSTCExtensions" -ExtensionType "VMAccessForLinux" -TypeHandlerVersion "1.5" -Settingstring "{}" -ProtectedSettingString $PrivateConf
```

### Linux VM - Reset Password (CLI)

```bash
az vm extension set --name VMAccessForLinux --publisher Microsoft.OSTCExtensions --version 1.5 --vm-name "myVM" --resource-group "myRG" --protected-settings '{"username":"testuser1", "password":"Admin12345678"}'
```

### Linux VM - Reset SSH Key (CLI)

```bash
az vm extension set --name VMAccessForLinux --publisher Microsoft.OSTCExtensions --version 1.5 --vm-name "myVM" --resource-group "myRG" --protected-settings '{"username":"testuser2", "ssh_key":"ssh-rsa ..."}'
```

### Linux VM - Reset SSH Configuration (CLI)

```bash
az vm user reset-ssh --resource-group "myRG" --name "myVM"
```

## Remove Examples

### Windows VM

```powershell
Remove-AzVMAccessExtension -ResourceGroupName "myRG" -VMName "myVM" -Name "VMAccessAgent"
```

```bash
az vm extension delete --name VMAccessAgent --vm-name "myVM" --resource-group "myRG"
```

### Linux VM

```powershell
Remove-AzVMExtension -ResourceGroupName "myRG" -VMName "myVM" -Name "VMAccessForLinux"
```

```bash
az vm extension delete --name VMAccessForLinux --vm-name "myVM" --resource-group "myRG"
```

## Troubleshooting

Ensure Azure Guest Agent is in Ready state first. If not, follow Guest Agent basic workflow.

### Windows Log Files

- `C:\WindowsAzure\Logs\Plugins\Microsoft.Compute.VMAccessAgent\<version>\JsonVMAccessExtension.log`
- `C:\WindowsAzure\Logs\WaAppAgent.log`

### Linux Log Files

- `/var/log/azure/Microsoft.OSTCExtensions.VMAccessForLinux/extension.log`
- `/var/log/waagent.log`

### Escalation

Support/EEE GA/PA - https://aka.ms/CRI-GAPA
