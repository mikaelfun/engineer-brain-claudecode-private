---
title: "Capture TCP Dump from Linux Node in AKS"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/logs/capture-tcp-dump-linux-node-aks"
product: aks
type: diagnostic-procedure
---

# Capture TCP Dump from Linux Node in AKS

## Steps
1. **Identify node**: `kubectl get nodes --output wide`
2. **Connect to node**: Create interactive shell via `kubectl debug node/<name> -it`
3. **Install tcpdump** (if needed): `apt-get update && apt-get install tcpdump`
4. **Capture**: `tcpdump --snapshot-length=0 -vvv -w /capture.cap`
   - Add filters to reduce PCAP size: `tcpdump dst <IP>`, `tcpdump port <port>`
   - Press Ctrl+C to stop
5. **Transfer locally**: `kubectl cp node-debugger-<name>:/capture.cap capture.cap`
   - If using `chroot /host`, source path is `/host/capture.cap`

## Tips
- Note timestamps while reproducing the issue
- Use filters (src/dst/port) to keep capture file manageable
- Can automate via Helm chart DaemonSet
