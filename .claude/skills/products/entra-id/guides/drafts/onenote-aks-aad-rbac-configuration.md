# AKS AAD RBAC Configuration Guide

> Source: OneNote MCVKB - [AKS][AAD][RBAC] Configure proper role assignment for AKS cluster

## Three AKS AAD Integration Modes

### Mode 1: No AAD Integration
- Authentication uses Kubernetes native RBAC via `~/.kube/config` tokens
- No Azure AD user mapping; anyone with kubeconfig can operate the cluster
- `az login` identity is irrelevant to K8s access
- ReadOnly permission requires K8s-level user creation + role binding (complex, hard to maintain)

### Mode 2: Legacy AAD Integration (Service Principal)
- Check: Portal shows "Azure AD legacy" integration
- `.kube/config` contains AAD auth provider
- Permission control requires **both** Azure RBAC + Kubernetes native RBAC
- ReadOnly via ClusterRoleBinding with `view` ClusterRole:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: Contoso-cluster-view
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: view
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: Group
  name: <Group objectId>
```

- `view` role covers namespace resources (pods) but NOT nodes
- For nodes: customize ClusterRole via YAML

### Mode 3: AKS-managed AAD Integration (Managed Identity) - Recommended
- Most convenient for RBAC
- Use 4 built-in roles directly at AAD level:
  - Azure Kubernetes Service Cluster Admin Role
  - Azure Kubernetes Service Cluster User Role
  - Azure Kubernetes Service RBAC Admin
  - Azure Kubernetes Service RBAC Reader
- **Important**: Pay attention to `adminGroup` configuration
- Users NOT in adminGroup need proper role assignment to access cluster

## Key Takeaway
AKS-managed AAD integration is the recommended approach for simplest RBAC management.

## References
- [Azure AD + AKS Legacy Integration](https://docs.azure.cn/zh-cn/aks/azure-ad-integration-cli)
- [AKS-managed AAD Integration](https://docs.azure.cn/zh-cn/aks/managed-aad)
- [AKS Identity Concepts](https://docs.azure.cn/zh-cn/aks/concepts-identity)
