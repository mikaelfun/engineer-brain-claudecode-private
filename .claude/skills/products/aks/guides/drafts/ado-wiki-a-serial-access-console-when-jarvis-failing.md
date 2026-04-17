---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Tools/Jarvis/How to pull logs via Serial Access Console when Jarvis is failing"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FTools%2FJarvis%2FHow%20to%20pull%20logs%20via%20Serial%20Access%20Console%20when%20Jarvis%20is%20failing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Pulling logs from Serial Access Console when Jarvis is not working

## Overview

How to pull logs via Serial Access Console (SAC) when Jarvis is not working.

## Usage

1. Enable boot diagnostics from the portal on the VM/node under `Support + Troubleshooting` section of blade
2. Restart the VM.
3. Create a user using the reset password option from the portal under `Support + Troubleshooting` section of blade.
4. Login to the Serial console using the password created in previous step.
5. Run the commands that you are interested in gathering.
6. Gather the files onto clipboard.

**Examples:**

Gathering kubelet logs using journalctl:

```bash
sudo journalctl -u kubelet --since=YYYY-MM-DD HH:MM:SS --no-pager
sudo journalctl -u kubelet --until=YYYY-MM-DD HH:MM:SS --no-pager
sudo journalctl -u kubelet -S "2019-03-13 16:00:00" -U "2019-03-13 20:30:00" --no-pager
```

Other useful logs:

```bash
cat /var/log/azure-npm.log
cat /var/log/azure-cnimonitor.log
cat /var/log/azure-vnet.log
cat /var/log/cloud-init.log
cat /var/log/azure/cluster-provision.log
```

## Reference

- Kubernetes Debugging reference: <https://kubernetes.io/docs/tasks/debug-application-cluster/debug-cluster/>
- Serial Access Console guide: <https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/serial-console-linux>
