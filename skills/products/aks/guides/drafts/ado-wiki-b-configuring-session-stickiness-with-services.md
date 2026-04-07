---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Configuring session stickiness with services"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FConfiguring%20session%20stickiness%20with%20services"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Configuring session stickiness with services

## Summary

This article provides steps on how to maintain the stickiness where the client should send request to the same pod when traffic is routed irrespective of the consecutive requests.

## Configuration

You can use the following yaml to achieve this.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: xxx
  namespace: xxx
spec:
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 8080
  selector:
    app: remotesign
  type: ClusterIP
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 900
```

If you want to make sure that connections from a particular client are passed to the same Pod each time, you can select the session affinity based on the client's IP addresses by setting service.spec.sessionAffinity to "ClientIP" (the default is "None").

You can also set the maximum session sticky time by setting service.spec.sessionAffinityConfig.clientIP.timeoutSeconds appropriately.
(the default value is 10800, which works out to be 3 hours)

## References

- https://kubernetes.io/docs/concepts/services-networking/service/
- https://gist.github.com/fjudith/e8acc791f015adf6fd47e5ad7be736cb
