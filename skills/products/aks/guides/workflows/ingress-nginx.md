# AKS Nginx Ingress Controller — 排查工作流

**来源草稿**: ado-wiki-multiple-nginx-ingress-controller-setup.md, ado-wiki-upgrading-ingress-nginx-specific-version.md, mslearn-deploy-unmanaged-nginx-ingress.md
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Multiple Nginx Ingress Controller Setup
> 来源: ado-wiki-multiple-nginx-ingress-controller-setup.md | 适用: 适用范围未明确

### 排查步骤

#### Multiple Nginx Ingress Controller Setup

Two flavors of nginx ingress controller:
- **nginx-stable** (maintained by NGINX, Inc.) — `nginxinc/kubernetes-ingress`
- **nginx-community** (maintained by Kubernetes community) — `kubernetes/ingress-nginx`

#### Nginx-Stable Installation (Helm)

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

#### Nginx-Community Installation (Helm)

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

#### Internal Load Balancer

Add: `--set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-internal"="true"`

#### Ingress Class Configuration

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

#### Rewrite Rules

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

#### Path Types

- **Stable**: Prefix (default/ImplementationSpecific), Exact
- **Community**: Prefix (default), Exact, ImplementationSpecific

#### Known Issues

1. **AKS 1.24+ health probe**: Must add `azure-load-balancer-health-probe-request-path=/healthz` annotation
2. **Admission webhook conflicts**: Multiple community controllers share validation — disable or scope with objectSelector (fixed in v1.1.2, PR #8221)

#### References

- Stable helm options: https://docs.nginx.com/nginx-ingress-controller/installation/installation-with-helm/
- Stable annotations: https://docs.nginx.com/nginx-ingress-controller/configuration/ingress-resources/advanced-configuration-with-annotations/
- Community annotations: https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/annotations/
- Path types: https://kubernetes.io/docs/concepts/services-networking/ingress/#path-types

---

## Scenario 2: Upgrading ingress-nginx to a specific version
> 来源: ado-wiki-upgrading-ingress-nginx-specific-version.md | 适用: 适用范围未明确

### 排查步骤

#### Upgrading ingress-nginx to a specific version

#### Objective

Guide on how to upgrade the nginx ingress controller to specific versions due to customer requirement or application dependency.

#### Prerequisites

AKS cluster with installed nginx ingress controller. Reference: https://learn.microsoft.com/en-us/azure/aks/ingress-basic?tabs=azure-cli

#### Implementation

Two types of upgrade procedures:

##### Without Helm

Simply upgrade the controller to required version by changing the image name in the deployment file which follows the defined rolling update strategy.

##### With Helm (Recommended)

Recommended approach to keep track and adhere to defined chart versions for the specific nginx version.

**Key steps:**

1. Check the support matrix for K8s version compatibility: https://github.com/kubernetes/ingress-nginx#supported-versions-table

2. Find all releases: https://github.com/kubernetes/ingress-nginx/releases

3. List currently deployed release:
   ```bash
   helm list -n ingress-basic
   ```

4. **Finding the correct chart version for a target controller version:**
   - Go to the release page for details on the controller version
   - Use the source code or changelog to find the matching chart version
   - Compare versions at: https://github.com/kubernetes/ingress-nginx/compare/
   - Example: Controller v1.2.1 corresponds to Helm chart version 4.1.3

5. Upgrade:
   ```bash
   helm upgrade ingress-nginx ingress-nginx/ingress-nginx --version <chart-version> -n ingress-basic
   ```

#### Rollback

In the event of any issue, rollback with:
```bash
helm rollback ingress-nginx <revision_name> -n ingress-basic
```

---

## Scenario 3: Deploy Unmanaged NGINX Ingress Controller in AKS
> 来源: mslearn-deploy-unmanaged-nginx-ingress.md | 适用: 适用范围未明确

### 排查步骤

#### Deploy Unmanaged NGINX Ingress Controller in AKS

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/load-bal-ingress-c/create-unmanaged-ingress-controller

#### Overview

Deploy the community NGINX ingress controller (kubernetes/ingress-nginx) via Helm for reverse proxy, traffic routing, and TLS termination. Recommended alternative: use the managed Application routing add-on instead.

#### Quick Deploy (Basic)

```bash
NAMESPACE=ingress-basic
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --create-namespace --namespace $NAMESPACE \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/azure-load-balancer-health-probe-request-path"=/healthz \
  --set controller.service.externalTrafficPolicy=Local
```

#### Customized Deploy (ACR + Multi-replica)

- Import images to ACR: `controller`, `kube-webhook-certgen`, `defaultbackend-amd64`
- Set `controller.replicaCount=2`, node selectors for Linux
- For internal LB: add `--set controller.service.loadBalancerIP=<IP>` and `azure-load-balancer-internal=true`

#### Key Notes

- Health probe path must be set (`/healthz`); removing it causes ingress controller to stop
- Client source IP preservation: `externalTrafficPolicy=Local` (breaks TLS pass-through)
- Two NGINX projects exist: kubernetes/ingress-nginx (community) vs nginxinc/kubernetes-ingress (NGINX Inc)

---
