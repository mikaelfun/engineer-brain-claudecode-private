# Redeploy Azure Windows VM to New Node

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/redeploy-to-new-node-windows

## When to Use
- RDP connection issues persist after standard troubleshooting
- Application access issues that cannot be resolved
- VM stuck in failed state (try reapply first)

## Important Warnings
- **Temporary disk data is LOST** after redeployment
- **Ephemeral disk data is LOST**
- Dynamic IP addresses associated with virtual network interface are updated

## Methods

### Azure CLI
```bash
az vm redeploy --resource-group myResourceGroup --name myVM
```

### Azure PowerShell
```powershell
Set-AzVM -Redeploy -ResourceGroupName "myResourceGroup" -Name "myVM"
```

### Azure Portal
1. Navigate to the VM
2. Help > Redeploy + reapply
3. Select Redeploy

## Decision Tree
1. VM stuck in Failed state? → Try **Reapply** first
2. RDP/app issues after troubleshooting? → **Redeploy**
3. Still failing? → Recreate the VM
