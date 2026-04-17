# Capture TCP Packets from a Pod on AKS

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/packet-capture-pod-level

## Prerequisites

- Azure CLI >= 2.0.59

## Steps

### 1. Identify the pod

```bash
kubectl get pods -A
# or for specific namespace:
kubectl get pods -n <namespace>
```

### 2. Connect to the pod

```bash
kubectl exec <pod-name> -it -- /bin/bash
```

### 3. Install tcpdump (if needed)

```bash
# Debian/Ubuntu based
apt-get update && apt-get install tcpdump

# Alpine based
apk add tcpdump
```

### 4. Capture packets

```bash
tcpdump -s 0 -vvv -w /capture.cap
```

### 5. Copy capture file to local

```bash
# Exit the pod shell first, then:
kubectl cp <pod-name>:/capture.cap capture.cap
```

## Notes

- Use `-n <namespace>` with kubectl exec if pod is not in default namespace
- Useful for diagnosing connectivity issues at the pod level
