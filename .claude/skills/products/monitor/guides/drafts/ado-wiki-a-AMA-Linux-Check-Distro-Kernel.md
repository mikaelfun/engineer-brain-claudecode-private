---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Check Linux distribution and kernel version"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FAMA%20Linux%2FHow-To%2FAMA%20Linux%3A%20HT%3A%20Check%20Linux%20distribution%20and%20kernel%20version"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AMA Linux: Check Linux Distribution and Kernel Version

## Azure Support Center
1. Navigate to the desired virtual machine in Azure Support Center
   - Check GuestOSVersion / GuestKernelVersion properties

## In-Guest (hostnamectl)
Most Linux distributions include hostnamectl. Provides clean output with distribution and kernel details.

```bash
hostnamectl
```

Example output:
```
   Static hostname: ubuntu-1804-1
         Icon name: computer-vm
           Chassis: vm
    Virtualization: microsoft
  Operating System: Ubuntu 18.04.5 LTS
            Kernel: Linux 5.4.0-1089-azure
      Architecture: x86-64
```

Note the **Operating System** and **Kernel** properties.

## In-Guest (uname)

```bash
# Kernel release
uname -r
# Output: 5.4.0-1089-azure

# Distribution details
uname -v
# Output: #94~18.04.1-Ubuntu SMP Fri Aug 5 12:34:50 UTC 2022
```
