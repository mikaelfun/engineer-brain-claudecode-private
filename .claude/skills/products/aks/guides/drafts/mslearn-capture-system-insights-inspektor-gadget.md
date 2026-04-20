---
title: "Capture Real-time System Insights from AKS with Inspektor Gadget"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/capture-system-insights-from-aks"
product: aks
type: diagnostic-tool-guide
---

# Capture Real-time System Insights from AKS with Inspektor Gadget

## Overview
Inspektor Gadget is an eBPF-based framework for real-time monitoring and troubleshooting of AKS workloads. It captures low-level kernel data (DNS, file access, process creation, network activity) enriched with Kubernetes metadata.

## Installation
1. Install kubectl gadget plugin (Azure Linux 3.0 / Ubuntu packages from Microsoft Cloud-Native repo)
2. Deploy DaemonSet: `kubectl gadget deploy`
3. Image from MCR: `mcr.microsoft.com/oss/v2/inspektor-gadget/inspektor-gadget`

## Key Gadgets & Use Cases
| Problem | Gadget | Command |
|---------|--------|---------|
| DNS failures | trace_dns | `kubectl gadget run trace_dns --namespace <ns>` |
| File access issues | trace_open | `kubectl gadget run trace_open --filter fname==<path>` |
| Disk I/O intensive apps | trace_open / block I/O | Filter by container |
| Unauthorized code execution (cryptojacking) | trace_exec | Monitor bash/process creation |
| Seccomp blocked syscalls | audit_seccomp | `kubectl gadget run audit_seccomp` |

## DNS Troubleshooting Example
- Run trace_dns to capture DNS traffic
- Check QR column: Q=query, R=response
- Missing R indicates DNS server not responding
- Check NAMESERVER column for unexpected DNS servers
- Use trace_open to monitor /etc/resolv.conf modifications
