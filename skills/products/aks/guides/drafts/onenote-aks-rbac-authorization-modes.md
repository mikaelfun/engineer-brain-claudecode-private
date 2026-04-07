# AKS RBAC Authorization Modes

> Source: OneNote — Mooncake POD Support Notebook / AKS Feature Landing Status / RBAC
> Status: draft (pending SYNTHESIZE review)

## Overview

AKS supports two authorization modes for Kubernetes API access control:
1. **Azure RBAC for Kubernetes Authorization** — webhook-based, managed via Azure portal/CLI
2. **Kubernetes RBAC with AAD** — native K8s role/role-binding, AAD provides identity

## Azure RBAC for Kubernetes Authorization

- Uses Kubernetes **Authorization Webhook** mechanism
- AAD returns token → Azure RBAC checks access permissions
- Managed via Azure role assignments (portal/CLI/ARM)
- Doc: https://learn.microsoft.com/en-us/azure/aks/manage-azure-rbac
- TSG: https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/240690/Azure-RBAC-TSG

## Kubernetes RBAC with AAD

- Uses native Kubernetes RBAC (Role, ClusterRole, RoleBinding, ClusterRoleBinding)
- AAD provides user identity via token; K8s checks role bindings
- Managed via `kubectl` / K8s manifests
- Doc: https://learn.microsoft.com/en-us/azure/aks/azure-ad-rbac?tabs=portal
- K8s RBAC concepts: https://kubernetes.io/docs/reference/access-authn-authz/rbac/

## Switching Between Modes — Impact

| Direction | Impact |
|-----------|--------|
| K8s RBAC → Azure RBAC | **Safe**: Existing K8s role bindings are preserved and still work |
| Azure RBAC → K8s RBAC | **Risk**: Azure role assignments do NOT convert to K8s bindings; must pre-create K8s Roles/RoleBindings for all users |

## Azure RBAC Built-in Roles for AKS Resource

| Role | Permissions |
|------|------------|
| Azure Kubernetes Service Contributor | Scale, upgrade cluster |
| Azure Kubernetes Service Cluster Admin | Pull admin kubeconfig |
| Azure Kubernetes Service Cluster User | Pull user kubeconfig |

Doc: https://docs.azure.cn/zh-cn/aks/concepts-identity

## Best Practices

- Use Azure RBAC for centralized management across multiple clusters
- Use K8s RBAC for fine-grained namespace-level control
- Reference: https://techcommunity.microsoft.com/t5/fasttrack-for-azure/azure-kubernetes-service-rbac-options-in-practice/ba-p/3684275

## 21V (Mooncake) Notes

- Both modes are available in Mooncake
- Use `docs.azure.cn` endpoints for China-specific documentation
