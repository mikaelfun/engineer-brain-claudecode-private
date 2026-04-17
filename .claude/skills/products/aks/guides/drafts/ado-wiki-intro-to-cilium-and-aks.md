---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Intro to Cilium and AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FIntro%20to%20Cilium%20and%20AKS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intro to Cilium and AKS

## Summary

The aim of this document is to review what Cilium is, a quick overview of the features it has as well as how it can be used with AKS.

### What is Cilium

Cilium is an open-source networking and security project that leverages eBPF to provide enhanced networking and observability capabilities for containerized environments like Kubernetes. It focuses on enabling efficient and secure communication between services while providing deep visibility and control at the network layer.

### Advantages of Cilium

The main advantage with Cilium is on the eBPF implementation that allows to simplify how the pods network is setup, providing significant performance improvements.

## How to use Cilium on AKS

Currently we have 3 main options to use Cilium on AKS:

1. **Azure CNI Powered by Cilium**: https://learn.microsoft.com/en-us/azure/aks/azure-cni-powered-by-cilium
2. **Isovalent Enterprise for Cilium on Azure Market Place**: https://isovalent.com/blog/post/isovalent-cilium-enterprise-microsoft-azure-marketplace/
3. **AKS BYOCNI + Cilium**: https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/

## Network policies + Hubble observability example

### Deploy AKS cluster with BYOCNI

1. Create JSON file that disables kube-proxy:
   ```shell
   cat <<EOF > kube-proxy.json
   { "enabled": false }
   EOF
   ```

2. Create AKS cluster with `--network-plugin none` and `--kube-proxy-config kube-proxy.json`

3. Retrieve cluster credentials: `az aks get-credentials --resource-group "${AZURE_RESOURCE_GROUP}" --name "${NAME}"`

### Installing Cilium in BYOCNI cluster

1. Install Cilium CLI from https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/#install-the-cilium-cli
2. Install Cilium:
   ```shell
   export CILIUM_CLI_MODE=classic
   cilium install --set azure.resourceGroup="${AZURE_RESOURCE_GROUP}",azure.clusterName="${NAME}",azure.subscriptionID="$(az account show --query id -o tsv)"
   ```
3. Check status: `cilium status`

### Network Observability using Hubble

1. Enable Hubble: `cilium hubble enable --ui`
2. Start Hubble UI: `cilium hubble ui`
3. Generate traffic: `kubectl exec tiefighter -- curl -s -X POST deathstar.default.svc.cluster.local/v1/request-landing`

#### Normal network policies (L3/L4)

Use CiliumNetworkPolicy to restrict access based on pod labels:
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "rule1"
spec:
  description: "L3-L4 policy to restrict deathstar access to empire ships only"
  endpointSelector:
    matchLabels:
      org: empire
      class: deathstar
  ingress:
  - fromEndpoints:
    - matchLabels:
        org: empire
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
```

#### Advanced network policies at Layer 7

L7 policies allow restricting access based on HTTP method and path:
```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: "rule1"
spec:
  description: "L7 policy to restrict access to specific HTTP call"
  endpointSelector:
    matchLabels:
      org: empire
      class: deathstar
  ingress:
  - fromEndpoints:
    - matchLabels:
        org: empire
    toPorts:
    - ports:
      - port: "80"
        protocol: TCP
      rules:
        http:
        - method: "POST"
          path: "/v1/request-landing"
```

> **Note**: Advanced L7 network policies are only available with CiliumNetworkPolicy, which is currently **not supported on Azure CNI Powered by Cilium**.

#### Hubble CLI

1. Find CiliumIdentity: `kubectl describe ciliumidentities.cilium.io | grep "^Name:\|name=deathstar" | grep -B1 "^Labels:"`
2. Observe flows: `kubectl exec <cilium-pod> -- hubble observe --to-identity <identity-id>`
3. Generate connectivity test load: `cilium connectivity test`

## Resources

### Microsoft docs
- Azure CNI Powered by Cilium: https://learn.microsoft.com/en-us/azure/aks/azure-cni-powered-by-cilium
- Cilium TSG: https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/379325/cilium

### External
- CNI Benchmark: https://cilium.io/blog/2021/05/11/cni-benchmark/
- Cilium component overview: https://docs.cilium.io/en/stable/overview/component-overview/
- Isovalent labs: https://isovalent.com/resource-library/labs/
