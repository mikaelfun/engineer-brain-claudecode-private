---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Cluster Management/Kubelet Serving Certificate Rotation"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FKubelet%20Serving%20Certificate%20Rotation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Kubelet Serving Certificate Rotation

## Overview

Kubelet Serving Certificate Rotation allows kubelet to bootstrap and rotate its own serving certificate signed by the cluster's certificate authority. Before this feature, kubelet used self-signed certificates. This feature mitigates insecurities and allows control plane components (kube-apiserver, metrics-server) to enable TLS verification for kubelet connections.

When enabled, the `kubelet-serving-csr-approver` CCP plugin is deployed. It watches for and approves valid CSRs with `kubernetes.io/kubelet-serving` signer name. After approval, kube-controller-manager injects a signed serving certificate.

## Learning Resources

- [Detailed design doc](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/681584/Kubelet-Serving-Certificate-Rotation)
- [kubelet-serving-csr-approver CCP plugin](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/706381/Component-Kubelet-Serving-CSR-Approver)
- [Kubernetes TLS bootstrapping docs](https://kubernetes.io/docs/reference/access-authn-authz/kubelet-tls-bootstrapping/#certificate-rotation)
- [Kubernetes CSR API reference](https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/)

## High-Level Architecture

Critical control plane components:

- **kubelet**: Requests signed serving certificate from apiserver via CSR API
- **kube-apiserver**: Receives and persists CSRs from bootstrapping nodes in etcd
- **kubelet-serving-csr-approver**: Validates and approves CSRs with `kubernetes.io/kubelet-serving` signer name
- **kube-controller-manager**: Signs approved CSRs and injects valid TLS certificates

## Enablement

### ASI Verification

Check ASI feature indicator on nodepool or managed cluster pages:
- Green = kubelet serving certificate rotation is enabled

### Enablement Logic

- New clusters on k8s 1.27+ → enabled on all nodepools by default
- Existing clusters upgraded to k8s 1.27+ → enabled on all nodepools by default
- If cluster has at least one nodepool enabled → new nodepools enabled by default
- Customers can opt-out via nodepool tags API

**IMPORTANT:** ASI indicator shows RP-level enablement. If customer adds opt-out tag at VMSS/VM instance level via CRP (portal/CLI), ASI indicator will NOT be accurate. Verify by checking node labels: `kubernetes.azure.com/kubelet-serving-ca=cluster`.

## Confirming Node-Level Enablement

### Using validation daemonsets

```bash
curl https://gist.githubusercontent.com/cameronmeissner/83944bb68a8da4480123dc102da4f1ad/raw/c2afd57c2d449ef2de91b2b5d4ebf66d90491c5e/kscr-validate.yaml | kubectl apply -f -
```

If a daemonset pod is Running on a node → that node uses cluster CA-signed kubelet serving certificate.

### Direct node inspection (Linux)

Via `kubectl debug` or `kubectl node-shell`:

```bash
ls -la /var/lib/kubelet/pki
```

If `kubelet-server-current.pem` symlink exists → kubelet has bootstrapped/rotated its serving certificate via TLS bootstrapping, signed by cluster CA.

### Windows nodes

Use a HostProcess pod with access to host network/process namespaces. Check:

```powershell
ls c:/k/pki
```

Look for `kubelet-server-current.pem` files.

## Quick Mitigation via Nodepool Tags

Customers can opt out by adding the special nodepool tag via the nodepool tags API. This disables certificate rotation for specific nodepools.

## Troubleshooting

1. **Check node labels** for `kubernetes.azure.com/kubelet-serving-ca=cluster`
2. **Verify CSR status**: `kubectl get csr` - look for pending/denied CSRs
3. **Check kubelet-serving-csr-approver** pods in CCP
4. **Verify kube-controller-manager** signing controller is functioning
5. **Check kubelet PKI directory** on the node for certificate files
