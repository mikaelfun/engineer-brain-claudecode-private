---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Aks and Network team common troubleshooting/14 - Common Troubleshoot tools and command lines"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F14%20-%20Common%20Troubleshoot%20tools%20and%20command%20lines"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Common Troubleshoot tools and command lines

## Azure dropping container packets aggressively

- If the bandwidth is correlated to the drops, then we can saturate it for a short period and try to see if we get packet drops.
- This can be done with a tool such as **NTTTCP** or **Iperf**.
- We can also check if it is related to the establishment of new connections using **nc** or **psping** for TCP pings.
- Tests should be run from an affected node towards a VM on the same VNET (or peered VNET, no FW/NVA in between).
- The test VM should not be having significant BW occupation.
- If disruption is observed, get a packet capture during the test (source and destination).

### NTTTCP

[Test VM network throughput by using NTTTCP](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-bandwidth-testing?tabs=windows)

### Iperf to determine packet loss

Server side:
```console
iperf3 -s -p (port)
```

Client side:
```console
iperf3 -c (server ip) -p (port) -P 32
```

Reverse mode (measure download):
```console
iperf3 -r -s -p (port)
iperf3 -r -c (server ip) -p (port) -P 32
```

### Tcpping (Linux)

For Ubuntu: https://gist.github.com/cnDelbert/5fb06ccf10c19dbce3a7

For ARO/restricted environments, build a custom tcpping container:

```dockerfile
FROM centos:latest
RUN sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-* && \
    sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*
RUN yum -y install tcptraceroute wget bc
RUN wget https://dl.fedoraproject.org/pub/epel/8/Everything/x86_64/Packages/t/tcping-1.3.5-19.el8.x86_64.rpm
RUN rpm -Uvh tcping-1.3.5-19.el8.x86_64.rpm
RUN touch /var/log/tcpping.log
RUN echo '#!/bin/bash' > /usr/bin/run_tcpping.sh && \
    echo 'ln -sf /proc/1/fd/1 /var/log/tcpping.log' >> /usr/bin/run_tcpping.sh && \
    echo 'while `sleep 1` ; do echo "`date` - `tcping "${TCPPING_WEBSITE}" "${TCPPING_PORT}" 2>&1`"; done > /var/log/tcpping.log' >> /usr/bin/run_tcpping.sh && \
    chmod +x /usr/bin/run_tcpping.sh
ENTRYPOINT ["/bin/bash", "/usr/bin/run_tcpping.sh"]
```

Deploy as pod with env vars TCPPING_WEBSITE and TCPPING_PORT.

Simple alternative using netcat (pre-installed on nodes):
```console
while `sleep 1` ; do echo "`date` - `nc -vzw 1 microsoft.com 443 2>&1`"; done
```

### Ping / PSPing continuous test

Windows (PowerShell):
```powershell
# ICMP
ping -t (VM IP) | Foreach{"{0} - {1}" -f (Get-Date),$_} | Out-File .\icmp.txt

# TCP
psping.exe -t (VM IP):(port) | Foreach{"{0} - {1}" -f (Get-Date),$_} | Out-File .\psping.txt
```

Linux:
```bash
# ICMP
while sleep 1 ; do echo `date` `ping -c1 -w1 (VM IP) |grep ttl`; done > continuousping_`date +%Y%m%d_%H%M`.log

# TCP
while `sleep 1` ; do echo "`date` - `nc -vvzw 1 (VM IP) (port) 2>&1`"; done > continuoustcpping_`date +%Y%m%d_%H%M`.log
```

PSPing download: https://docs.microsoft.com/en-us/sysinternals/downloads/psping

## Portal issue to list and manage network components

Private flight Portal link for network issues:
https://portal.azure.com/?Microsoft_Azure_Network=flight5

Debug shortcut: `Ctrl+Alt+D` — trace session ID to troubleshoot portal issues.

## Azure Packets Drop after VM Freeze events

### Symptom
Packet drops correlated with VM Freeze scheduled events. Mellanox NIC IRQs not balanced across CPUs.

### Diagnosis
```bash
# Check IRQ distribution
grep -r "" /proc/irq
cat /proc/interrupts
systemctl status irqbalance
lscpu -a | grep IRQ
irqbalance -l
```

### MLX IRQ Check Script
```bash
#!/bin/bash
NR_CPUS=`nproc`
if [[ $NR_CPUS -gt 32 ]]; then NR_CPUS="32"; fi
NIC_LIST=`grep mlx5_comp /proc/interrupts | cut -d@ -f2 | sort -u`
if [ -z "$NIC_LIST" ]; then echo "No Mellanox NIC detected"; exit 1; fi
for nic in $NIC_LIST; do
  IRQS=`grep $nic /proc/interrupts | grep mlx5_comp | cut -d: -f1 | sort -u`
  NR_TARGET_CPUS=`for irq in $IRQS; do cat /proc/irq/$irq/effective_affinity_list; done | sort -u | wc -l`
  if [[ $NR_TARGET_CPUS -lt `expr $NR_CPUS / 2` ]]; then
    echo IRQ affinity of $nic may be suboptimal: please report with top, /proc/irq, /proc/interrupts, dmesg, syslog.
    exit 2
  fi
done
exit 0
```

### Solution
Manually rebalance smp_affinity or restart irqbalance daemon. Use ftrace to identify programs adjusting IRQ affinity:
```bash
cd /sys/kernel/debug/tracing/
echo irq_affinity_proc_write >> set_ftrace_filter
echo irq_affinity_list_proc_write >> set_ftrace_filter
echo function > current_tracer
# After repro:
cat /sys/kernel/debug/tracing/trace
```

Strace against irqbalance:
```bash
strace /usr/sbin/irqbalance -f -t 10
```

## Nodes losing internet after LB SKU upgrade

Even with the feature to upgrade SKU from Basic to Standard, this will put cluster in a broken state. Customer must recreate the cluster.

Reference: https://learn.microsoft.com/en-us/azure/load-balancer/upgrade-basic-standard

Most common symptom: only one node in Ready state, others have CSE extension failure.
