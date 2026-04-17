# Capture TCP Dump from Windows Node in AKS

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/capture-tcp-dump-windows-node-aks

## Connection Methods

1. **HostProcess container** (recommended)
2. **SSH** via node-debugger
3. **RDP** via jump VM

### HostProcess Container Setup

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hpc
spec:
  securityContext:
    windowsOptions:
      hostProcess: true
      runAsUserName: "NT AUTHORITY\\SYSTEM"
  hostNetwork: true
  containers:
    - name: hpc
      image: mcr.microsoft.com/windows/servercore:ltsc2022
      command: ["powershell.exe", "-Command", "Start-Sleep 2147483"]
  nodeSelector:
    kubernetes.io/os: windows
    kubernetes.io/hostname: AKSWINDOWSNODENAME
```

## Capture

```cmd
netsh trace start capture=yes tracefile=C:\temp\AKS_node_name.etl
# Reproduce issue...
netsh trace stop
```

Output: `.etl` and `.cab` files in `C:\temp\`.

## Transfer

- HostProcess: `kubectl cp hpc:/temp/AKS_node_name.etl ./AKS_node_name.etl`
- SSH: `scp` via ProxyCommand
- RDP: `net use z: \\tsclient\c` then copy
