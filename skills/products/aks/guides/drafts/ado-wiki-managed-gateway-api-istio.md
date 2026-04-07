---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/managed gateway api istio"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS Managed Gateway API with Istio

Installation, configuration, traffic flow, and troubleshooting guide for AKS Managed Gateway API with Istio service mesh.

## 1. Installation

### New AKS cluster

```bash
az aks create -g $RESOURCE_GROUP -n $CLUSTER_NAME --enable-azure-service-mesh --enable-gateway-api 
```

### Existing AKS cluster

Enable istio ASM before gateway api:

```bash
az aks mesh enable -g $RESOURCE_GROUP -n $CLUSTER_NAME
az aks update -g $RESOURCE_GROUP -n $CLUSTER_NAME --enable-gateway-api
```

### Validation

ASM minor revision should be asm-1-26 or higher.

```bash
az aks show -g $RESOURCE_GROUP -n $CLUSTER_NAME --query 'serviceMeshProfile.mode'
# Expected: "Istio"

kubectl get pods -n aks-istio-system
# istiod pods should be Running

kubectl get crds | grep "gateway.networking.k8s.io"
# Should see: gatewayclasses, gateways, grpcroutes, httproutes, referencegrants
```

## 2. Configure TLS ingress

Key points:
- TLS Secret **must** be in the same namespace as the Gateway
- Gateway resource auto-creates Envoy Deployment and Service (managed by Istio)
- Use `kubectl wait --for=condition=programmed gateways.gateway.networking.k8s.io <name>` to verify

## 3. Traffic flow

```
Client → HTTPS → Gateway LB Service → Istio Ingress Envoy → HTTPRoute → Service → Pod
```

## 4. Troubleshooting Checklist

### Check GatewayClass

```bash
kubectl get gatewayclass -o wide
# controllerName should be: istio.io/gateway-controller
```

### Verify Envoy Deployment/Service

```bash
kubectl get deploy -A -l gateway.istio.io/managed=istio.io-gateway-controller
kubectl get service -A -l gateway.istio.io/managed=istio.io-gateway-controller
```

### Check Gateway errors

```bash
kubectl describe gateway <name>
# Look at: ResolvedRefs, Programmed, Accepted conditions
# Common: "invalid certificate reference", "Bad TLS configuration"
```

### Check proxy logs

```bash
kubectl logs <gateway-pod> -f
# Common error: "failed to warm certificate... dial tcp :15012: connection refused"
# → istiod not reachable
```

### TCP trace with gadget

```bash
kubectl gadget run trace_tcp:latest --podname <pod> --fields src,src.addr,dst,dst.addr,type
```

### ConfigMap rules

- Only **one** ConfigMap per GatewayClass (in aks-istio-system, label: `gateway.istio.io/defaults-for-class=istio`)
- ConfigMap may take ~5 min to appear after CRD install
- Gateway-level ConfigMap (via `spec.infrastructure.parametersRef`) takes precedence over GatewayClass-level

## References

- https://learn.microsoft.com/en-us/azure/aks/managed-gateway-api
- https://learn.microsoft.com/en-us/azure/aks/istio-deploy-addon
- https://learn.microsoft.com/en-us/azure/aks/istio-gateway-api#resource-customizations
- https://istio.io/latest/docs/tasks/observability/logs/access-log/
