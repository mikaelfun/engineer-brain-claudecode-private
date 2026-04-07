# SSH Connection Troubleshooting for Azure Linux VM

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-ssh-connection

## Quick Troubleshooting Steps
1. Reset SSH configuration
2. Reset user credentials
3. Verify NSG rules allow SSH (TCP 22) + check RBAC role assignments (Virtual Machine Administrator/User Login)
4. Check VM resource health + boot diagnostics
5. Restart VM
6. Redeploy VM

## Methods to Reset SSH

### Azure Portal
- VM > Help > Reset password
- Modes: Reset configuration only | Reset SSH public key | Reset password

### Azure CLI
```bash
# Reset SSH config
az vm user reset-ssh --resource-group myRG --name myVM

# Reset password
az vm user update --resource-group myRG --name myVM --username user --password pass

# Reset SSH key
az vm user update --resource-group myRG --name myVM --username user --ssh-key-value "$(cat ~/.ssh/id_rsa.pub)"
```

### VMAccess Extension
```bash
az vm extension set --resource-group myRG --vm-name myVM \
  --name VMAccessForLinux --publisher Microsoft.OSTCExtensions --version 1.2 \
  --settings settings.json
```

## Serial Console Diagnostics

### Check SSH Service
```bash
sudo systemctl status sshd.service
sudo ss --listen --tcp --process --numeric | grep sshd
```

### Check SSH Port
```bash
grep -i port /etc/ssh/sshd_config
grep -i listen /etc/ssh/sshd_config
```

## Key Notes
- Microsoft Entra ID SSH login requires "Virtual Machine Administrator Login" or "Virtual Machine User Login" role
- Port redirection requires Azure Load Balancer
- Redeploy causes ephemeral disk data loss + dynamic IP update
- VM Guest Agent 2.0.5+ required for Gallery images
