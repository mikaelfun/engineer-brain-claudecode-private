---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/Managed Istio/Pod to Pod and Proxy Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FManaged%20Istio%2FPod%20to%20Pod%20and%20Proxy%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Pod-to-Pod Communication and Sidecar Proxy Issues

[[_TOC_]]

## Reported and Observed Symptoms

- Issues with meshed communication between pods.
- Sidecar containers failing to inject.
- Certificate errors for sidecar-managed mTLS.

## Troubleshooting Steps

Pod-to-pod communication and sidecar injection issues can manifest for a range of reasons. The troubleshooting steps below aren't anything unique for pod-to-pod communication issues, but they'll reveal any potential issues in the mesh.
Run all istioctl commands from a machine with kubectl + istioctl installed which has cluster access. Ensure access to both application namespaces and aks-istio-system. Do not runs these commands inside the pods.

> **Note:** If one of the pods experiencing issues is a Gateway pod (`istio-ingressgateway` or `istio-egressgateway`), treat the gateway pod as you would any other pod - there's no special troubleshooting required for the gateway sidecars.

1. Run the following `istioctl` commands to retrieve proxy status and configuration, check injection status for a pod, and generate an Istio bug report:

   ```bash
   # Get the proxy status and configuration for the problem pod(s)
   istioctl proxy-status -i aks-istio-system -r asm-1-17
   istioctl proxy-config all -i aks-istio-system -r asm-1-17 -n <namespace> <pod-name> # Do this for each pod in question, saving the output into a unique file for each pod

    # Check the injection status for the problem pod(s)
    istioctl x check-inject -i aks-istio-system -n <namespace> <pod-name> # Do this for each pod in question, saving the output into a unique file for each pod

    # Generate an Istio bug report
    istioctl bug-report --istio-namespace aks-istio-system
    ```

2. Collect the istio-proxy container logs from the problem pod(s):

   ```bash
   kubectl logs <pod-name> -c istio-proxy -n <namespace> > istio-proxy.log # Do this for each pod in question, saving the output into a unique file for each pod
   ```

3. Based on the information presented in the previous commands as well as the log output gathered from the Istiod logs, unless an obvious issue is identified start an IcM escalation to the PG for assistance.

   ASC should work correctly when the "Escalate Case" button is used, but the link <https://aka.ms/istio-cri> should work as well.

   This IcM will route directly to the AKS RP team for triage and investigation.

   Be sure to include as much of the information gathered in the previous steps as possible in the IcM.

## References

- Sidecar Injection Problems: <https://istio.io/latest/docs/ops/common-problems/injection/>
- Debugging Envoy: <https://istio.io/latest/docs/ops/diagnostic-tools/proxy-cmd/>
- Istio Networking Issues: <https://istio.io/latest/docs/ops/common-problems/network-issues/>
