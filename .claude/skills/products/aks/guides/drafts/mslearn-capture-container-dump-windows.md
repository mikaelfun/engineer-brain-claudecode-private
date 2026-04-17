# Capture Windows Container Dump from AKS Windows Node

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/capture-container-dump-windows-node-aks

## Prerequisites

- Windows agent pools created after 3/13/2024 or node image >= AKS Windows 20240316
- WindowsCSEScriptsPackage v0.0.39+ (check `C:\AzureData\CustomDataSetupScript.log`)

## Steps

### 1. Add Annotations to Deployment

```yaml
metadata:
  annotations:
    "io.microsoft.container.processdumplocation": "C:\\CrashDumps\\{container_id}"
    "io.microsoft.wcow.processdumptype": "mini"
    "io.microsoft.wcow.processdumpcount": "10"
spec:
  containers:
  - name: containername
    volumeMounts:
      - mountPath: C:\CrashDumps
        name: local-dumps
  volumes:
  - name: local-dumps
    hostPath:
      path: C:\k\containerdumps
      type: DirectoryOrCreate
```

### 2. Reproduce Issue & Identify Node

```bash
kubectl describe pod -n [NAMESPACE] [POD-NAME]
```

### 3. Connect to Windows Node (SSH or RDP)

### 4. Transfer Dump File

- SSH: `scp` via node-debugger proxy
- RDP: `net use z: \\tsclient\c` then copy from `C:\k\containerdumps\`
