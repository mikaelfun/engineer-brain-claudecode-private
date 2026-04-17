---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/AKS Restrict Ingress loadBalancerSourceRanges"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20Restrict%20Ingress%20loadBalancerSourceRanges"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Restricting Ingress Traffic to Services/Ingress Controller

## Summary

Use `loadBalancerSourceRanges` on Service spec to restrict access to AKS-exposed applications. This triggers automatic NSG rule creation that persists as long as the service is online.

## Key Limitation: Service Tags Incompatibility

When `loadBalancerSourceRanges` is set, `service.beta.kubernetes.io/azure-allowed-service-tags` annotation won't work due to DROP iptables rules from kube-proxy. Workaround: merge CIDRs from service tags into `loadBalancerSourceRanges`.

Service Tags CIDRs download: https://www.microsoft.com/en-us/download/details.aspx?id=56519

## Why NSG Rules Disappear

Customers manually add NSG rules pointing to the LB public IP, but rules disappear. This is expected — AKS/cloud-provider-azure manages NSG rules for LoadBalancer services. Use `loadBalancerSourceRanges` instead.

## Implementation: LoadBalancer Service

```yaml
spec:
  loadBalancerSourceRanges:
  - <allowed-cidr>/32
```

Edit service: `kubectl edit svc <service-name>`

## Implementation: Ingress Controller

Same approach — edit the ingress controller service:

```bash
kubectl edit svc ingress-nginx-controller -n ingress-nginx
```

Add `loadBalancerSourceRanges` to the spec section.
