---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Configuring custom health probes on LoadBalancer services"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Configuring%20custom%20health%20probes%20on%20LoadBalancer%20services"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Customizing Load Balancer Health Probe Configuration

## Summary

Azure Cloud Provider for Kubernetes allows customizing health probe configuration for LoadBalancer services via annotations. This enables using a dedicated health endpoint for probing multiple service ports.

## Key Annotations

Use per-port annotations to customize health probe port, protocol, and path:

```yaml
annotations:
  service.beta.kubernetes.io/port_{PORT}_health-probe_protocol: "http"
  service.beta.kubernetes.io/port_{PORT}_health-probe_port: "{PROBE_PORT}"
  service.beta.kubernetes.io/port_{PORT}_health-probe_request-path: "/healthz/ready"
```

## How It Works

- By default, each port in a LoadBalancer service gets its own health probe
- You can redirect health probes for multiple ports to a single dedicated health endpoint
- Each port's probe configuration (protocol, port, path) can be independently customized

## Example

Service exposing ports 3614, 3615, 3616 — redirect health probes for 3614 and 3615 to use port 3616's `/healthz/ready` endpoint:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: websvc-3
  annotations:
    service.beta.kubernetes.io/port_3614_health-probe_protocol: "http"
    service.beta.kubernetes.io/port_3614_health-probe_port: "3616"
    service.beta.kubernetes.io/port_3614_health-probe_request-path: "/healthz/ready"
    service.beta.kubernetes.io/port_3615_health-probe_protocol: "http"
    service.beta.kubernetes.io/port_3615_health-probe_port: "3616"
    service.beta.kubernetes.io/port_3615_health-probe_request-path: "/healthz/ready"
spec:
  ports:
    - name: http1
      port: 3614
      targetPort: 3614
      appProtocol: http
    - name: http2
      port: 3615
      targetPort: 3615
      appProtocol: http
    - name: http-probe
      port: 3616
      targetPort: 3616
      appProtocol: http
  selector:
    app: websvc-3
  type: LoadBalancer
```

## References

- [Azure Cloud Provider - LoadBalancer](https://cloud-provider-azure.sigs.k8s.io/topics/loadbalancer/)
- [Custom health probes feature PR](https://github.com/kubernetes-sigs/cloud-provider-azure/pull/2452)
- [AKS LB annotations docs](https://learn.microsoft.com/en-us/azure/aks/load-balancer-standard#customizations-via-kubernetes-annotations)
