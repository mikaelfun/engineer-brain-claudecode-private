---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Virtual Machines/Manually Installing GPU Drivers on RHEL VM"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FVirtual%20Machines%2FManually%20Installing%20GPU%20Drivers%20on%20RHEL%20VM"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Manually Installing GPU Drivers on RHEL VM (Azure Stack Edge)

**Note**: Customer requires Red Hat subscription for RHEL VM access.

## Steps
1. SSH into the VM
2. Enable RHEL repos:
   ```bash
   sudo subscription-manager repos --enable=rhel-7-server-rpms
   sudo subscription-manager repos --enable=rhel-7-server-optional-rpms
   ```
3. Install prerequisites:
   ```bash
   sudo yum install kernel kernel-tools kernel-headers kernel-devel
   ```
4. Reboot VM from Azure Portal
5. Set driver download variables:
   ```bash
   BASE_URL=https://us.download.nvidia.com/tesla
   DRIVER_VERSION=470.103.01
   ```
6. Download installer: `curl -fSsl -O $BASE_URL/$DRIVER_VERSION/NVIDIA-Linux-x86_64-$DRIVER_VERSION.run`
7. Install: `sudo sh NVIDIA-Linux-x86_64-$DRIVER_VERSION.run`
   - If kernel-headers error: repeat steps 3-4, then retry
8. Verify: `nvidia-smi`
