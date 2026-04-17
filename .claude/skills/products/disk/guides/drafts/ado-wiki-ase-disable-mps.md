---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/GPU - Compute/Disable Multi-Process Service MPS on Azure Stack Edge"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FGPU%20-%20Compute%2FDisable%20Multi-Process%20Service%20MPS%20on%20Azure%20Stack%20Edge"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Disable Multi-Process Service (MPS) on Azure Stack Edge

MPS is an alternative CUDA API implementation enabling cooperative multi-process CUDA applications to utilize Hyper-Q capabilities on NVIDIA GPUs.

## Steps

1. Enter a support session on the Azure Stack Edge
2. SSH to the running VM: `ssh hcsuser@<VM_IP>`
3. Remove the MPS service:
   ```bash
   sudo systemctl disable nvidia-mps.service
   sudo systemctl stop nvidia-mps.service
   sudo rm /etc/systemd/system/nvidia-mps.service
   ```
4. Remove the cron job: `sudo rm /etc/cron.d/nvidia-mps-cronjob`
5. Reset GPU to default: `sudo nvidia-smi --compute-mode=DEFAULT`
6. Confirm removal: `echo "Removed nvidia-mps.service"`
