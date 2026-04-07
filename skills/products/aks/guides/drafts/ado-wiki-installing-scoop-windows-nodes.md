---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Windows/Installing scoop on Windows nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FWindows%2FInstalling%20scoop%20on%20Windows%20nodes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Installing scoop on Windows nodes

## Summary and Goals

**scoop.sh** is a community maintained package manager for Windows. It can be used to install applications directly from the command line. Official GitHub: https://github.com/ScoopInstaller/Scoop#readme

This guide automates deployment of scoop on AKS Windows Nodes and installs frequently used tools:
- netcat
- tcping

## Prerequisites

- Bash environment with kubectl configured
- AKS cluster with Windows 2022 nodes

## Implementation steps

Deploy a privileged Windows HostProcess pod that installs scoop and tools:

```bash
#!/bin/bash
nodeName="$1"
cat << EOF > ./winscoop.yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: windows-scoop-17263
  name: windows-scoop-17263
  namespace: default
spec:
  nodeName: $1
  containers:
  - image: mcr.microsoft.com/windows/nanoserver:ltsc2022
    imagePullPolicy: Always
    name: windows-scoop-17263
    volumeMounts:
    - mountPath: /tmp
      name: logs
    command:
      - powershell
      - Write-Output "---> Installing scoop...";
      - irm get.scoop.sh -outfile 'install.ps1';
      - .\install.ps1 -RunAsAdmin -ScoopDir 'C:\Scoop' -ScoopGlobalDir 'C:\Scoop' -NoProxy;
      - scoop install netcat;
      - scoop install tcping;
      - sleep 600;
  volumes:
  - name: logs
    hostPath:
      path: /tmp
      type: Directory
  hostNetwork: true
  nodeSelector:
    kubernetes.io/os: windows
  restartPolicy: Never
  securityContext:
    windowsOptions:
      hostProcess: true
      runAsUserName: NT AUTHORITY\SYSTEM
EOF
kubectl apply -f ./winscoop.yaml
```

After installation, connect to the node:
```bash
kubectl exec -it windows-scoop-17263 -- powershell
```

Install additional apps with `scoop install <program-name>`. Apps install to `C:\Scoop` by default. Browse available apps at: https://scoop.sh/#/apps

Note: The pod has a 600s sleep timer - adjust as needed.
