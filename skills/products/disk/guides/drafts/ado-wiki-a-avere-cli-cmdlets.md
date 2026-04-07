---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Avere - FXT and vFXT/Troubleshooting/Avere CLI cmdlets"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=/Avere%20-%20FXT%20and%20vFXT/Troubleshooting/Avere%20CLI%20cmdlets"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Avere vFXT/FXT — CLI Command Reference

Quick reference for CLI commands used when diagnosing and managing Avere clusters via debug host or edge jump.

## Command Reference Table

| Command | Function / Comments |
|---------|---------------------|
| `ping -S <client_facing_IP> <Host_IP>` | Test connectivity from cluster-facing IP |
| `averecmd cluster.createProxyConfig myProxyName '{"url":"http://127.0.0.1"}'` | Enter proxy configuration |
| `nodestatus.py` | Check nodes — connects to other nodes via SSH |
| `ifconfig` | Check network interfaces |
| `name_mapping.py` | Check config / name mapping |
| `top` | Check swap usage and process state |
| `averecmd support.executeNormalMode node gsisupportbundle` | Trigger GSI bundle (node scope) |
| `averecmd support.executeNormalMode cluster gsisupportbundle` | Trigger GSI bundle (cluster scope) |
| `gsi.py --mode gsimax --scope node` | Trigger full GSI (node) |
| `gsi.py --mode gsimax --scope cluster` | Trigger full GSI (cluster) |
| `nodessh.py <node_name>` | SSH to a specific node |
| `clusterexec.py 'uptime'` | Check uptime across all nodes |
| `findClusterPrimary` | Find the leader/primary node |
| `averecmd support.uploadCores local` | Upload core dumps from CLI |
| `averecmd support.uploadCores local armada_main.93632.1600544971.xz AC-73796` | Upload specific core file with ticket ref |
| `checkClusterJobs.py` | Show current cluster jobs |
| `wipe.py --scope node --factory` | Wipe a node (factory reset) |
| `wipe.py --scope node --zerodisks` | Zero the drives on a node |
| `averecmd system.enableAPI maintenance` | Enable maintenance mode |
| `averecmd system.disableAPI maintenance` | Disable maintenance mode |
| `averecmd node.remove <nodename>` | Remove a node from cluster |
| `averecmd node.remove <nodename> true` | Force remove a node (true = force mode) |
| `averecmd alert.clearAllConditions` | Clear all conditions from CLI |
| `datadump.py -p mgmtd -c ClusterJobTrace \| tail -30` | Check progress of cluster jobs (real-time) |

## Access Methods

- **Edge Jump (recommended)**: SSH to edge jump → `connect` to target cluster debug host
- **Debug Host (single cluster)**: Analysis sandbox tied to one specific cluster

## Time Sanity Check (Do First)

```bash
date   # run on BOTH the host and the cluster context; ensure UTC alignment
```
