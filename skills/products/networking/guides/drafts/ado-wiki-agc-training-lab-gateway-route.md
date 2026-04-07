---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Training - AGC Configuration Lab/04 - Gateway and Route deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/04%20-%20Gateway%20and%20Route%20deployment"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Training - AGC configuration lab - Gateway and Route deployment

### Gateway and HTTPRoute Deployment

Deploy using the Gateway and HTTPRoute service resources. Add the below to the YAML:

``` yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: Gateway
metadata:
  name: agfctestinstance
  namespace: azure-alb-system
  annotations:
    alb.networking.azure.io/alb-namespace: azure-alb-system
    alb.networking.azure.io/alb-name: agfctestinstance
spec:
  gatewayClassName: azure-alb-external
  listeners:
  - name: https-listener
    port: 443
    protocol: HTTPS
    allowedRoutes:
      namespaces:
        from: Same
    tls:
      mode: Terminate
      certificateRefs:
      - kind: Secret
        group: ""
        name: frontendcert
        namespace: azure-alb-system
---
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: https-route
  namespace: azure-alb-system
spec:
  parentRefs:
  - name: agfctestinstance
  rules:
  - backendRefs:
    - name: azure-vote-front
      namespace: application-deployment
      port: 80
```

### YAML Reference Grant

After deploying Gateway + HTTPRoute, AGC returns a 500 response. This is because of a permissions issue inside AKS — the application and ALB are in different namespaces. A ReferenceGrant is needed to tie them together.

``` yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: ReferenceGrant
metadata:
  name: azure-alb-system-to-application-deployment
  namespace: application-deployment
spec:
  from:
  - group: gateway.networking.k8s.io
    kind: HTTPRoute
    namespace: azure-alb-system
  to:
  - group: ""
    kind: Service
```

After deploying the ReferenceGrant, the application becomes accessible via HTTPS through AGC.

**Key takeaway**: When AGC Gateway and backend application are in different AKS namespaces, a ReferenceGrant must be created in the target namespace to allow cross-namespace HTTPRoute references.
