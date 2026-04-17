---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Training - AGC Configuration Lab/05 - Initial Troubleshooting and data gathering"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/05%20-%20Initial%20Troubleshooting%20and%20data%20gathering"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Training - AGC configuration lab - Initial Troubleshooting and data gathering

## Initial Troubleshooting Data Gathering

Now that we have a functional deployment we can take a look at what some of the basic troubleshooting commands yield. Lets start by listing out the deployments and services in AKS.

``` kubectl
kubectl get gateway -A -o yaml
kubectl get httproute -A -o yaml
kubectl get applicationloadbalancer -A -o yaml
```

### Example output: Gateway

```yaml
apiVersion: v1
items:
- apiVersion: gateway.networking.k8s.io/v1
  kind: Gateway
  metadata:
    annotations:
      alb.networking.azure.io/alb-name: agfctestinstance
      alb.networking.azure.io/alb-namespace: azure-alb-system
    name: agfctestinstance
    namespace: azure-alb-system
  spec:
    gatewayClassName: azure-alb-external
    listeners:
    - allowedRoutes:
        namespaces:
          from: Same
      name: https-listener
      port: 443
      protocol: HTTPS
      tls:
        certificateRefs:
        - group: ""
          kind: Secret
          name: frontendcert
          namespace: azure-alb-system
        mode: Terminate
  status:
    addresses:
    - type: IPAddress
      value: xxxxxxxxxxxxxxx.xxxx.alb.azure.com
    conditions:
    - message: Valid Gateway
      reason: Accepted
      status: "True"
      type: Accepted
    - message: Application Gateway for Containers resource has been successfully updated.
      reason: Programmed
      status: "True"
      type: Programmed
    listeners:
    - attachedRoutes: 1
      conditions:
      - reason: ResolvedRefs
        status: "True"
        type: ResolvedRefs
      - reason: Accepted
        status: "True"
        type: Accepted
      - reason: Programmed
        status: "True"
        type: Programmed
      name: https-listener
```

### Example output: HTTPRoute

```yaml
apiVersion: v1
items:
- apiVersion: gateway.networking.k8s.io/v1beta1
  kind: HTTPRoute
  metadata:
    name: https-route
    namespace: azure-alb-system
  spec:
    parentRefs:
    - group: gateway.networking.k8s.io
      kind: Gateway
      name: agfctestinstance
    rules:
    - backendRefs:
      - group: ""
        kind: Service
        name: azure-vote-front
        namespace: application-deployment
        port: 80
        weight: 1
      matches:
      - path:
          type: PathPrefix
          value: /
  status:
    parents:
    - conditions:
      - reason: ResolvedRefs
        status: "True"
        type: ResolvedRefs
      - reason: Accepted
        status: "True"
        type: Accepted
      - reason: Programmed
        status: "True"
        type: Programmed
      controllerName: alb.networking.azure.io/alb-controller
```

### Example output: ApplicationLoadBalancer

```yaml
apiVersion: v1
items:
- apiVersion: alb.networking.azure.io/v1
  kind: ApplicationLoadBalancer
  metadata:
    name: agfctestinstance
    namespace: azure-alb-system
  spec:
    associations:
    - /subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/aks-vnet/subnets/agfc-subnet
  status:
    conditions:
    - message: Valid Application Gateway for Containers resource
      reason: Accepted
      status: "True"
      type: Accepted
    - message: alb-id=/subscriptions/{sub-id}/resourceGroups/{mc-rg}/providers/Microsoft.ServiceNetworking/trafficControllers/{alb-name}
      reason: Ready
      status: "True"
      type: Deployment
```

This shows the most recent messages from each of the AGC components running inside of the AKS Cluster. This information can be found very useful and is the first starting steps to troubleshooting most AGC CRUD scenarios.
