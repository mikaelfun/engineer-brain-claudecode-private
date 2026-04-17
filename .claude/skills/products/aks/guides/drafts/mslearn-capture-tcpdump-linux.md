# Capture TCP Dump from Linux Node in AKS

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/capture-tcp-dump-linux-node-aks

## Steps

### 1. Find Target Node

```bash
kubectl get nodes --output wide
```

### 2. Connect to Node

Use `kubectl debug node/<node-name>` to create interactive shell (node-debugger pod).

### 3. Install tcpdump (if needed)

```bash
apt-get update && apt-get install tcpdump
```

### 4. Capture

```bash
tcpdump --snapshot-length=0 -vvv -w /capture.cap
# With filters (recommended to reduce file size):
tcpdump dst 192.168.1.100 -w /capture.cap
tcpdump port 80 or port 443 -w /capture.cap
```

Press Ctrl+C to stop.

### 5. Transfer Locally

```bash
# From local machine:
kubectl cp node-debugger-aks-nodepool1-xxx:/capture.cap capture.cap
```

Note: If using `chroot /host`, prefix source path with `/host`.
