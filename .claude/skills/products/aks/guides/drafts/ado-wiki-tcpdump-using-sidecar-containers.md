---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/TCPDump using sidecar containers"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/TCPDump%20using%20sidecar%20containers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Tcpdump using sidecar containers

## Summary

The purpose of this method is to get network captures from pods experiencing intermittent connectivity problems. The patch method will add a sidecar to the deployment on which the problem is present. This sidecar will be running and collecting logs from the pod as the problem gets reproduced.

## Problem

Customers sometimes cannot install TCP dump on pods, and in this situation one of the things we can do is to run tcpdump as a sidecar container and get the logs. This will need customer to redeploy the pod or node. However this is useful to intermittent issues and the logs here get rotated so we can capture for a longer period of time.

## Tcpdump as sidecar

1. Create a yaml file called patch.yaml:

   ```yaml
   spec:
     template:
       spec:
         containers:
         - name: tcpdump
           image: docker.io/corfr/tcpdump
           args: ["-C", "100", "-W", "20", "-v", "-w", "/data/dump" ]
   ```

2. Execute the patch command: `kubectl patch deployment <deploymentName> --patch-file patch.yaml`

3. Verify the tcpdump container is added with `kubectl describe pod <podName>`

4. Reproduce the issue to capture.

5. Exec into the container and check dump files:
   ```sh
   kubectl exec -it <podName> -c tcpdump -- sh
   cd /data
   ls
   # rename dump file: mv dump00 dump00.pcap
   ```

6. Copy the file to local machine:
   ```sh
   kubectl cp <podNameSpace/podName>:/data/dump00.pcap -c tcpdump ./dump.pcap
   ```

## Standalone test pod (nginx + tcpdump sidecar)

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: nginx
  name: nginx
  namespace: default
spec:
  containers:
  - image: nginx
    imagePullPolicy: Always
    name: nginx
  - name: tcpdump
    image: docker.io/corfr/tcpdump
    args: ["-C", "100", "-W", "20", "-v", "-w", "/data/dump" ]
```

Multiple files created of size 100MB depending on the length of time it runs. After 20 files the dump will rotate. Use filtering commands from tcpdump reference and add those filters to args.

## References

- https://medium.com/@xxradar/how-to-tcpdump-effectively-in-kubernetes-part-1-a1546b683d2f
