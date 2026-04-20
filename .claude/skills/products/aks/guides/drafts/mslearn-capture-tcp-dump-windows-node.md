---
title: "Capture TCP Dump from Windows Node in AKS"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/capture-tcp-dump-windows-node-aks"
product: aks
type: diagnostic-procedure
---

# Capture TCP Dump from Windows Node in AKS

## Connection Methods
1. **HostProcess container** (recommended): Deploy hostprocess.yaml pod with NT AUTHORITY\SYSTEM
2. **SSH**: Use SSH key (reverts after reboot/upgrade)
3. **RDP**: Reset Windows admin password via `az aks update --windows-admin-password`, connect through jump VM

## Capture Steps
1. **Identify node**: `kubectl get nodes --output wide`
2. **Connect** via one of the methods above
3. **Start capture**: `netsh trace start capture=yes tracefile=C:	emp\AKS_node_name.etl`
4. Reproduce issue, note timestamps
5. **Stop**: `netsh trace stop` → generates .etl + .cab files

## Transfer Methods
- **HostProcess**: `kubectl cp hpc:/temp/AKS_node_name.etl ./AKS_node_name.etl`
- **SSH**: Use scp with ProxyCommand
- **RDP**: Map drive via net use, copy files through jump VM
