---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Others/Pod General Investigation/Map processes with high resource usage on AKS nodes to pods"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FPod%20General%20Investigation%2FMap%20processes%20with%20high%20resource%20usage%20on%20AKS%20nodes%20to%20pods"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Map processes with high resource usage on AKS nodes to pods

## Summary

To troubleshoot cases, it is helpful to track down high resource usage to specific pods on nodes. This is particularly useful for Java Spring Boot applications, where customers may experience high memory usage and need assistance in identifying the specific processes that are using the resources. This can be challenging when the pods have limited or no shell access, and when metrics are not being sent to logs or monitored at the process level.

Memory usage analysis can be performed using Linux-level troubleshooting on the AKS node.

## Troubleshooting Steps

1. **Identify the target node**:
   ```bash
   kubectl get pods -o wide
   ```

2. **Access the node via debug pod**:
   ```bash
   kubectl debug node/<node-name> -it --image=mcr.microsoft.com/dotnet/runtime-deps:6.0
   ```

3. **Enter host namespace**:
   ```bash
   chroot /host
   ```

4. **Find high-resource processes**:
   Run `top` and press `Ctrl+M` to sort by memory usage. Note the PIDs consuming the most resources.

5. **Map PID to container**:
   Run `ps axjf` and trace the PID hierarchy to find the parent `containerd-shim-runc-v2` process. The `-id` parameter contains the container ID.

   Example process tree:
   ```
   1 1146246 ... /usr/bin/containerd-shim-runc-v2 -namespace k8s.io -id a06266483112c0b3...
   1146246 1146266 ... /pause
   1146246 1146435 ... java -jar /app.jar   # <-- high resource PID
   ```

6. **Get pod name from container ID**:
   Copy first 5-8 characters from the `-id` string and run:
   ```bash
   crictl pods | grep "a0626648"
   ```
   Output shows the pod name:
   ```
   a06266483112c  7 hours ago  Ready  hello-world-rest-api-55d9d4c59d-wkmwr  default  0  (default)
   ```

## Key Technique Summary

| Step | Command | Purpose |
|------|---------|---------|
| 1 | `kubectl get pods -o wide` | Find which node to investigate |
| 2 | `kubectl debug node/<name> -it` | SSH-like access to node |
| 3 | `chroot /host` | Access host filesystem |
| 4 | `top` + Ctrl+M | Find high-resource PIDs |
| 5 | `ps axjf` | Trace PID to containerd-shim container ID |
| 6 | `crictl pods \| grep <id-prefix>` | Map container ID to pod name |

## Conclusion

Tracking down the processes that are consuming high memory on the nodes can be helpful in identifying and addressing potential issues. By identifying the pod that is consuming a large amount of memory, you can take steps to optimize its resource usage and improve the overall performance of the system.
