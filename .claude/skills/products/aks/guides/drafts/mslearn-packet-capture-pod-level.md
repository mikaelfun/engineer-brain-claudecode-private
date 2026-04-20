---
title: "Capture TCP Packets from Pod in AKS"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/packet-capture-pod-level"
product: aks
type: diagnostic-procedure
---

# Capture TCP Packets from Pod in AKS

## Steps
1. **Identify pod**: `kubectl get pods -A` or `kubectl get pods -n <namespace>`
2. **Connect to pod**: `kubectl exec <pod-name> -it -- /bin/bash`
   - Add `--namespace <ns>` if not in default namespace
3. **Install tcpdump** (if needed):
   - Debian/Ubuntu: `apt-get update && apt-get install tcpdump`
   - Alpine: `apk add tcpdump`
4. **Capture**: `tcpdump -s 0 -vvv -w /capture.cap`
5. **Exit** pod shell
6. **Copy locally**: `kubectl cp <pod-name>:/capture.cap capture.cap`

## Notes
- Pod-level capture is useful when node-level capture is too broad
- Filters can be applied same as standard tcpdump
