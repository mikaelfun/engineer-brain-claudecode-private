---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/AKS/###Troubleshooting--MUST READ!!###/##直接登录VMSS.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SSH into AKS VMSS Nodes Directly

## Steps

1. Create a Linux VM in the same VNET as the VMSS.

2. Generate SSH key pair on the VM:
   ```bash
   ssh-keygen
   ```

3. Push the public key to the VMSS via VMAccessForLinux extension:
   ```bash
   az vmss extension set \
     --resource-group MC_<aks-rg>_<cluster>_<region> \
     --vmss-name aks-nodepool1-<id>-vmss \
     --name VMAccessForLinux \
     --publisher Microsoft.OSTCExtensions \
     --version 1.4 \
     --protected-settings '{"username":"azureuser", "ssh_key":"'"$(cat ~/.ssh/id_rsa.pub)"'"}'
   ```

4. Update all VMSS instances:
   ```bash
   az vmss update-instances --instance-ids '*' \
     --resource-group MC_<aks-rg>_<cluster>_<region> \
     --name aks-nodepool1-<id>-vmss
   ```

5. SSH from the jump VM:
   ```bash
   ssh -i id_rsa azureuser@<aks_node_internal_ip>
   ```

## Cleanup

```bash
az vmss extension delete --name VMAccessForLinux --resource-group <NodeResourceGroup> --vmss-name <VMSS-NAME>
az vmss update --resource-group <NodeResourceGroup> --name <VMSS-NAME>
az vmss update-instances --resource-group <NodeResourceGroup> --name <VMSS-NAME> --instance-ids "*"
```
