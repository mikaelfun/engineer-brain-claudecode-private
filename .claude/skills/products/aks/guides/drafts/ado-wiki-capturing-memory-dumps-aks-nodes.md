---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Capturing Memory Dumps on AKS Nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Capturing%20Memory%20Dumps%20on%20AKS%20Nodes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Capture Container and Memory Dumps on AKS Linux (Ubuntu) Nodes

## Prerequisites

- AKS cluster running a supported version
- SSH access to the AKS node

## Steps

### 1. SSH into AKS node

Options:
- [Official docs](https://docs.microsoft.com/en-us/azure/aks/node-access)
- [kubectl-exec tool](https://github.com/mohatb/kubectl-exec)
- [kubego tool](https://github.com/mohatb/kubego)

Note: SSH into the node where the target pod resides.

### 2. Identify container process ID

```bash
ps -ef | grep <pod-name>
```

### 3. Generate core file with GDB

```bash
gdb -p <process-id>
(gdb) generate-core-file
(gdb) quit
```

Note: `gcore` command is an alias for `gdb` and can be used interchangeably.

### 4. Copy core file

```bash
scp user@remote_host:/path/to/core /local/path
```

Core file is usually named `core` or `core.<process_id>` in the working directory.
