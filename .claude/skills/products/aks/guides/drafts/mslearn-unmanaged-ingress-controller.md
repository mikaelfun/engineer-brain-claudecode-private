---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/load-bal-ingress-c/create-unmanaged-ingress-controller"
importDate: "2026-04-21"
type: guide-draft
---

# Create an Unmanaged NGINX Ingress Controller on AKS

How-to guide for deploying community NGINX ingress controller on AKS.

## Key Concepts
- Uses kubernetes/ingress-nginx (community), not nginxinc/kubernetes-ingress
- Recommended: Use Application routing add-on (managed NGINX) instead for new deployments

## Basic Deployment
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx   --create-namespace --namespace ingress-basic   --set controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path"=/healthz   --set controller.service.externalTrafficPolicy=Local
```

## Customized Deployment (with ACR)
Import images to ACR first (controller, kube-webhook-certgen, defaultbackend-amd64), then deploy with custom image registry settings.

## Internal Load Balancer
Add `--set controller.service.loadBalancerIP=<IP>` and `--set controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-internal"=true`.

## Important Notes
- Health probe path set to /healthz; if overridden by ingress rule returning non-200, entire ingress controller stops
- Client source IP preservation: add `externalTrafficPolicy=Local` (disables TLS pass-through)
- Schedule on Linux nodes only: use nodeSelector
