---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Multiple Nginx Ingress Controller Setup"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FMultiple%20Nginx%20Ingress%20Controller%20Setup"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Multiple Nginx Ingress Controller Setup

Two flavors of nginx ingress controller:
- **nginx-stable** (maintained by NGINX, Inc.) — `nginxinc/kubernetes-ingress`
- **nginx-community** (maintained by Kubernetes community) — `kubernetes/ingress-nginx`

## Nginx-Stable Installation (Helm)

```sh
helm repo add nginx-stable https://helm.nginx.com/stable
helm repo update
kubectl create ns ingress1
helm install ingress1 nginx-stable/nginx-ingress -n ingress1 \
  --set controller.replicaCount=2 \
  --set controller.service.type=LoadBalancer \
  --set controller.ingressClass.name=ingress1 \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz
```

> **Note:** Annotation `service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path=/healthz` is **required for AKS 1.24+**.

Each controller needs a unique `controller.ingressClass.name`. Default is "nginx".

## Nginx-Community Installation (Helm)

```sh
helm repo add nginx-community https://kubernetes.github.io/ingress-nginx
helm repo update
kubectl create ns comm-ingress1
helm install comm-ingress1 nginx-community/ingress-nginx -n comm-ingress1 \
  --set controller.replicaCount=2 \
  --set controller.ingressClassResource.controllerValue=k8s.io/comm-ingress1 \
  --set controller.service.type=LoadBalancer \
  --set controller.ingressClassResource.name=comm-ingress1 \
  --set controller.admissionWebhooks.enabled=false \
  --set controller.ingressClass=comm-ingress1 \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz
```

Key parameters for multiple community controllers:
- `controller.ingressClassResource.name` — unique IngressClass name
- `controller.ingressClassResource.controllerValue` — unique controller value for mapping
- `controller.ingressClass` — CLI arg to watch only matching ingress resources
- `controller.admissionWebhooks.enabled=false` — disable cross-controller webhook validation

## Internal Load Balancer

Add: `--set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-internal"="true"`

## Ingress Class Configuration

**Stable version** — use `spec.ingressClassName`:
```yaml
spec:
  ingressClassName: ingress1
```

**Community version** — annotations:
```yaml
kubernetes.io/ingress.class: <ingress class name>
meta.helm.sh/release-name: <release name>
meta.helm.sh/release-namespace: <release namespace>
```

## Rewrite Rules

**Stable version:**
```yaml
annotations:
  nginx.org/rewrites: "serviceName=app1-svc rewrite=/;serviceName=app2-svc rewrite=/"
```

**Community version:**
```yaml
annotations:
  nginx.ingress.kubernetes.io/rewrite-target: /$1
```

## Path Types

- **Stable**: Prefix (default/ImplementationSpecific), Exact
- **Community**: Prefix (default), Exact, ImplementationSpecific

## Known Issues

1. **AKS 1.24+ health probe**: Must add `azure-load-balancer-health-probe-request-path=/healthz` annotation
2. **Admission webhook conflicts**: Multiple community controllers share validation — disable or scope with objectSelector (fixed in v1.1.2, PR #8221)

## References

- Stable helm options: https://docs.nginx.com/nginx-ingress-controller/installation/installation-with-helm/
- Stable annotations: https://docs.nginx.com/nginx-ingress-controller/configuration/ingress-resources/advanced-configuration-with-annotations/
- Community annotations: https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/
- Path types: https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types
