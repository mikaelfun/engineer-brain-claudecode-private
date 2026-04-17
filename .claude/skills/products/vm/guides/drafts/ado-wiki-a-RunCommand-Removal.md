---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/Extension/RunCommand Removal_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FExtension%2FRunCommand%20Removal_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Description

This TSG explains how to delete RunCommand extension (v1) and Managed RunCommand (v2) resources previously deployed on the VM.

*If the script execution is still in progress, execution will be terminated.*

## Remove RunCommand extension (v1)

### For Linux VM

Azure Powershell:
```powershell
Invoke-AzVMRunCommand -ResourceGroupName 'rgname' -VMName 'vmname' -CommandId 'RemoveRunCommandLinuxExtension'
```

CLI:
```bash
az vm run-command invoke --command-id RemoveRunCommandLinuxExtension --name vmname -g rgname
```

### For Windows VM

Azure Powershell:
```powershell
Invoke-AzVMRunCommand -ResourceGroupName 'rgname' -VMName 'vmname' -CommandId 'RemoveRunCommandWindowsExtension'
```

CLI:
```bash
az vm run-command invoke --command-id RemoveRunCommandWindowsExtension --name vmname -g rgname
```

## Remove Managed RunCommand extension (v2)

### For Linux VM

Azure Powershell:
```powershell
Remove-AzVMRunCommand -ResourceGroupName "myRG" -VMName "myVM" -RunCommandName "RunCommandName"
```

CLI:
```bash
az vm run-command delete --name "myRunCommand" --vm-name "myVM" --resource-group "myRG"
```

### For Windows VM

Azure Powershell:
```powershell
Remove-AzVMRunCommand -ResourceGroupName "myRG" -VMName "myVM" -RunCommandName "RunCommandName"
```

CLI:
```bash
az vm run-command delete --name "myRunCommand" --vm-name "myVM" --resource-group "myRG"
```
