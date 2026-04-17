---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Using multiple different ingress controllers in a cluster"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Using%20multiple%20different%20ingress%20controllers%20in%20a%20cluster"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Using Multiple Ingress Controllers in a Cluster

## Goal

Set up multiple different ingress controllers to manage the respective application traffic without any conflict.

## Use Cases

1. Separate internal and public traffic — one ingress controller for internal, another for public
2. Performance — reduce bottleneck by distributing traffic
3. Reliability — remove single point of failure

## Environment Setup

Uses AGIC-addon and nginx ingress controller with AKS cluster.

### 1. Create AKS cluster with AGIC addon

```bash
az group create --name rg-MultiICTest --location eastus
az aks create -n aks-multiIC -g rg-MultiICTest --network-plugin azure --enable-managed-identity -a ingress-appgw --appgw-name myApplicationGateway --appgw-subnet-cidr "10.2.0.0/16" --generate-ssh-keys
```

### 2. Install nginx ingress controller with helm

```bash
NAMESPACE=ingress-basic
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx --create-namespace --namespace $NAMESPACE
```

## IngressClass

IngressClass resource allows ingresses to be implemented by different ingress controllers. Each IC is defined using IngressClass resource and referenced in ingress resource using `ingressClassName`.

- `ingressClassName` replaces deprecated `kubernetes.io/ingress.class` annotation
- Nginx IC helm deployment auto-creates IngressClass `nginx`
- AGIC addon 1.5.1+ supports IngressClass resource (`azure-application-gateway`)

### Nginx Ingress Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: abc.com
    http:
      paths:
      - path: /nginx-app(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: app-nginx-svc
            port:
              number: 80
```

**Note**: When defining Ingress with nginx IC, the `host` field is required.

### AGIC Ingress Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: appgw-ingress
spec:
  ingressClassName: azure-application-gateway
  rules:
  - http:
      paths:
      - path: /
        backend:
          service:
            name: appgw-app-svc
            port:
              number: 80
        pathType: Prefix
```

## Troubleshooting

1. Cannot reach AppGW IP → ensure port 80/443 allowed on AppGW NSG
2. AppGW and AKS in different VNets → peer both networks
3. nginx ingress returns 404 → check ingress resource events and nginx IC logs
