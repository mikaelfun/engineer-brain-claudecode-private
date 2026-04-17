---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Customizing node hosts file"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Customizing node hosts file"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to inject custom data on /etc/hosts file of the worker node

Use a DaemonSet with nsenter to inject DNS entries into worker node /etc/hosts. Example: resolve a name via external DNS and inject the result.

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    component: custom-dns
  name: custom-dns
  namespace: kube-system
spec:
  selector:
    matchLabels:
      component: custom-dns
      tier: node
  template:
    metadata:
      labels:
        component: custom-dns
        tier: node
    spec:
      containers:
      - name: custom-dns
        image: alpine
        imagePullPolicy: IfNotPresent
        command:
          - nsenter
          - --target
          - "1"
          - --mount
          - --uts
          - --ipc
          - --net
          - --pid
          - --
          - sh
          - -c
          - |
            echo "fs1234.example.pt $(dig A +short fs1234.example.pt @192.168.1.10 |tail -1)" >> /etc/hosts
            while true; do sleep 5; done
        securityContext:
          privileged: true
      dnsPolicy: ClusterFirst
      hostPID: true
```
