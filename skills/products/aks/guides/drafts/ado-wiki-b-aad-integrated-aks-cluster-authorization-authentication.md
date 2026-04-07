---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Security and Identity/AAD integrated AKS Cluster Authorization & Authentication mechanism and related troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FAAD%20integrated%20AKS%20Cluster%20Authorization%20%26%20Authentication%20mechanism%20and%20related%20troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AAD integrated AKS Cluster Authorization & Authentication mechanism and related troubleshooting

## Objective

This article guides through AAD integrated AKS cluster access scenarios, authorization & authentication mechanism, related troubleshooting.

## Two types of AAD integration configurations

### 1. Kubernetes RBAC with Azure AD integration

- IAM access is required to perform operations on the cluster (getting credentials, scaling, upgrading, etc.) but **not inside the cluster**.
- To perform operations inside the cluster, native Kubernetes roles and role bindings must be set up.
- Example: "Azure Kubernetes Service Cluster User Role" only provides cluster-level permissions, not inside-cluster access.

### 2. Azure RBAC for Kubernetes authorization

- Manages both cluster-level operations AND inside-cluster operations through Azure RBAC built-in roles.
- Example: "Azure Kubernetes Service RBAC Cluster Admin" allows managing everything (cluster level + inside cluster).

## Summary

To fully operate an AKS cluster, two types of access are needed:

1. **Cluster level access** — for operations like scaling, upgrading, pulling kubeconfig file.
2. **Kubernetes API access** — controlled by either:
   - Kubernetes RBAC (traditional method)
   - Azure RBAC integrated with AKS for Kubernetes authorization

## Common Issues

### "kubelogin not found" error

Starting with Kubernetes 1.24, the default format of clusterUser credential for AAD enabled clusters is 'exec', which requires the `kubelogin` binary in the execution PATH.

**Install kubelogin:**
```bash
wget https://github.com/Azure/kubelogin/releases/download/v0.0.9/kubelogin-linux-amd64.zip
unzip kubelogin-linux-amd64.zip
sudo mv bin/linux_amd64/kubelogin /usr/bin
kubelogin convert-kubeconfig -l
```

### Three types of kubeconfig for AAD integrated AKS cluster

1. **Default method** (exec format, requires kubelogin)
2. **Azure format** (old format): `az aks get-credentials --resource-group Cluster_RG --name Cluster_Name --format azure`
3. **Admin credentials** (bypasses AAD): use `--admin` parameter when 'Kubernetes local accounts' option is enabled

### Cached credential preventing device login prompt

After getting credentials, it may not prompt for device login authentication due to cached credential at `~/.kube/cache/kubelogin/AzurePublicCloud-*.json`. Delete this JSON file to force re-authentication.

### "The azure auth plugin has been removed" error

Even after installing kubelogin, this error may occur if the logged-in user lacks required permissions to run the kubelogin utility. Try with root user to narrow down.

## References

- https://github.com/Azure/kubelogin
- https://kubernetes.io/docs/reference/access-authn-authz/authentication/#client-go-credential-plugins
