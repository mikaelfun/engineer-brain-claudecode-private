---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/collect-performance-metrics-from-a-linux-system"
importDate: "2026-04-23"
type: guide-draft
---

# Collect Performance Metrics for a Linux VM

Reference guide for retrieving performance metrics from Azure Linux VMs using Sysstat utilities and built-in commands.

## Tools Overview

| Category | Commands |
|----------|----------|
| CPU | mpstat, vmstat |
| Memory | free, swapon |
| Disk I/O | iostat, lsblk |
| Processes | pidstat, ps |

## Install Sysstat

- Ubuntu: `sudo apt install sysstat -y`
- Red Hat: `sudo dnf install sysstat -y`
- SUSE: `sudo zypper install sysstat --non-interactive`

Can also use Azure CLI Run Command:
```bash
az vm run-command invoke --resource-group  --name  --command-id RunShellScript --scripts "apt install sysstat -y"
```

## CPU Metrics (mpstat)

```bash
mpstat -P ALL 1 2
```

Key columns:
- **%usr**: User-level CPU utilization
- **%sys**: Kernel-level CPU utilization
- **%iowait**: CPU idle time waiting for I/O
- **%idle**: CPU idle time
- **%steal**: Time waiting for hypervisor to service other vCPUs

High %usr → application-level CPU usage
High %sys → kernel-level processing
High %iowait → I/O bottleneck
High %steal → noisy neighbor or overcommitted host

## Memory Metrics (free, vmstat)

```bash
free -h
vmstat 1 5
```

## Disk I/O Metrics (iostat)

```bash
iostat -dxm 1 5
```

## Process-Level Metrics (pidstat)

```bash
pidstat -u 1 5    # CPU per process
pidstat -d 1 5    # Disk I/O per process
pidstat -r 1 5    # Memory per process
```
