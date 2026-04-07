---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/tsg diagnosing application induced latency with istio on aks"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2Ftsg%20diagnosing%20application%20induced%20latency%20with%20istio%20on%20aks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Diagnosing Application-Induced Latency with Istio access logs on AKS

## Purpose

This Troubleshooting Guide (TSG) explains how to **identify the source of request latency** when a customer is using **Istio Service Mesh on AKS**.
The goal is to determine whether a perceived delay is introduced by:

- The **Istio ingress gateway**
- The **Istio sidecar (Envoy proxy)**
- Or the **application itself**

The guide relies on **Istio Envoy access logs** and demonstrates how to interpret key timing fields to precisely locate where latency is introduced.

## Scenario Overview

- AKS configured with **managed Istio (ASM 1.26)**.
- Custom NGINX-based application deployed with artificial delay capability.
- Requests sent through **external Istio ingress gateway**.

## 1. Enable Istio Service Mesh on AKS

```bash
az aks mesh enable --resource-group rg1 --name aks1
az aks mesh enable-ingress-gateway --resource-group rg1 --name aks1 --ingress-gateway-type external
```

## 2. Deploy Test Application

Deploy with Gateway + VirtualService (see source wiki for full YAML).

## 3. Enable Envoy Access Logs

Create ConfigMap in `aks-istio-system` namespace:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-shared-configmap-asm-1-26
  namespace: aks-istio-system
data:
  mesh: |-
    accessLogFile: /dev/stdout
```

## 4. Inspect Relevant Logs

### Ingress Gateway Logs
```bash
kubectl logs -n aks-istio-ingress -l app.kubernetes.io/instance=asm-igx-aks-istio-ingressgateway-external -f
```

### Application Sidecar Logs
```bash
kubectl logs demo-app-<pod-id> -c istio-proxy -f
```

## 5. Key Access Log Fields

| Field | Meaning |
|-------|---------|
| `%DURATION%` | Total request duration observed by the proxy (ms) |
| `%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%` | Time spent by upstream service processing the request (ms) |

## 6. Interpretation

- If ingress `%DURATION%` matches sidecar `%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%` closely, **latency is application-induced**.
- If there is a large gap, investigate Istio/network path.
- Envoy overhead is typically ~1 ms.

## Key Takeaways

- **Envoy access logs are authoritative** for latency attribution in Istio.
- Always compare ingress `%DURATION%` with sidecar `%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%`.
- If both match closely, **Istio is not the issue**.
- This method provides **data-driven proof** when engaging application owners.
