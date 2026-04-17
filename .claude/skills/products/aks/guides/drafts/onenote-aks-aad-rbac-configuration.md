# AKS AAD RBAC Configuration Guide

## Overview
How to configure proper role assignments for AKS cluster access control across three integration modes.

## Mode 1: No AAD Integration (Kubernetes Native RBAC)
- Authentication via kubeconfig token only
- Anyone with `.kube/config` file has full access regardless of Azure identity
- Cannot restrict permissions at Azure level
- To restrict: create K8s users + RBAC bindings (complex, out of Azure support scope)

## Mode 2: Azure AD Legacy Integration (Service Principal)
- Uses Service Principal for AAD authentication
- Requires both Azure RBAC + Kubernetes native RBAC
- Steps:
  1. Create ClusterRoleBinding binding AAD group to K8s ClusterRole (e.g., `view`)
  2. Built-in `view` role covers namespace-scoped resources but not nodes
  3. For node-level ReadOnly: create custom ClusterRole with node read permissions

### Example ClusterRoleBinding
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

## Mode 3: AKS-managed AAD Integration (Managed Identity) - Recommended
- Most convenient approach
- Use AKS built-in roles directly at Azure RBAC level:
  - Azure Kubernetes Service RBAC Admin
  - Azure Kubernetes Service RBAC Cluster Admin
  - Azure Kubernetes Service RBAC Reader
  - Azure Kubernetes Service RBAC Writer
- Important: `adminGroup` members always have full admin access
- Non-adminGroup users need explicit role assignment

## Key References
- Mooncake: https://docs.azure.cn/zh-cn/aks/managed-aad
- AKS identity concepts: https://docs.azure.cn/zh-cn/aks/concepts-identity
- K8s RBAC: https://kubernetes.io/zh/docs/reference/access-authn-authz/rbac/
