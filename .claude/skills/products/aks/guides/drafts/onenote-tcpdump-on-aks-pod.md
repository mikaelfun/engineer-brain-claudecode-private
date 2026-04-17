# How to Capture tcpdump on AKS Pod

> Source: OneNote - Mooncake POD Support Notebook
> Related: aks-onenote-003 (crictl as Docker CLI replacement)

## Steps

1. **Identify target node**: `kubectl get pods -o wide` to find which node the pod runs on

2. **Enter node shell**: `kubectl node-shell <node-name>` or `kubectl debug node/<node-id> -it --image=mcr.azk8s.cn/aks/fundamental/base-ubuntu:v0.0.11` then `chroot /host`

3. **Find container ID**: `crictl ps` — find the target pod's container ID (first column)

4. **Get PID**: 
   ```bash
   crictl inspect --output go-template --template '{{.info.pid}}' <container-id>
   ```

5. **Enter pod network namespace**: 
   ```bash
   nsenter -n -t <PID>
   ```

6. **Change to writable directory** (avoid permission denied):
   ```bash
   cd /var/tmp
   ```

7. **Start capture**:
   ```bash
   tcpdump -i eth0 port 3306 -w capture.pcap
   ```

## Notes

- Using `tcpdump -i any` on the node captures all interfaces including pod traffic, but shows duplicate packets
- Adjust port filter as needed for the target traffic
- On containerd-based nodes (K8s 1.19+), use `crictl` instead of `docker`
