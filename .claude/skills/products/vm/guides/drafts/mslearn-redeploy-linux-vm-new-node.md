# Redeploy Linux VM to New Azure Node

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/redeploy-to-new-node-linux

## When to Use

- SSH connection issues that cannot be resolved by other means
- Application access problems on the VM
- After exhausting other troubleshooting steps

## Key Steps

### Azure CLI
```bash
az vm redeploy --resource-group myResourceGroup --name myVM
```

### Azure Portal
1. Go to VM → Help → Redeploy + reapply → Redeploy

## Important Warnings

- **Data loss**: Temporary disk and Ephemeral disk data will be lost after redeploy
- **IP change**: Dynamic IP addresses associated with virtual network interface are updated
- Persistent data on OS/data disks is retained
- All configuration options and associated resources are retained

## 21V Applicability
- Applicable to Mooncake environment
- Use Mooncake portal or az cloud set for China regions
