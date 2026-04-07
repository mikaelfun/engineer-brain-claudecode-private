# Deploy Unmanaged NGINX Ingress Controller in AKS

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/load-bal-ingress-c/create-unmanaged-ingress-controller

## Overview

Deploy the community NGINX ingress controller (kubernetes/ingress-nginx) via Helm for reverse proxy, traffic routing, and TLS termination. Recommended alternative: use the managed Application routing add-on instead.

## Quick Deploy (Basic)

```bash
NAMESPACE=ingress-basic
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --create-namespace --namespace $NAMESPACE \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz \
  --set controller.service.externalTrafficPolicy=Local
```

## Customized Deploy (ACR + Multi-replica)

- Import images to ACR: `controller`, `kube-webhook-certgen`, `defaultbackend-amd64`
- Set `controller.replicaCount=2`, node selectors for Linux
- For internal LB: add `--set controller.service.loadBalancerIP=<IP>` and `azure-load-balancer-internal=true`

## Key Notes

- Health probe path must be set (`/healthz`); removing it causes ingress controller to stop
- Client source IP preservation: `externalTrafficPolicy=Local` (breaks TLS pass-through)
- Two NGINX projects exist: kubernetes/ingress-nginx (community) vs nginxinc/kubernetes-ingress (NGINX Inc)
