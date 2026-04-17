# AKS & ACR AAD Multi-Tenant Integration

> Source: Mooncake POD Support Notebook — RE: [--aad-tenant-id] option for az acr create
> Quality: guide-draft (pending review)

## AKS AAD Integration Points

AKS has **two separate** Azure AD integration points:

### 1. Service Principal for Resource Management (Required)
- Used to manage Azure resources on behalf of AKS (create LB, managed disks, scale cluster, etc.)
- **Must be** in the same tenant as the Azure Subscription
- Ultimate goal: use Managed Identity instead of SP

### 2. Azure AD Login to AKS Control Plane (Optional)
- Enables `kubectl` authentication via Azure AD
- **Can be in any Azure AD tenant** — it is not required to be the same as the subscription tenant
- AKS RBAC is essentially a "3rd party app which integrates with Azure AD"

## ACR AAD Integration

- ACR can **only** use the Azure AD where the resource is hosted
- Cannot choose a different directory — this is core Azure Resource Manager behavior
- No plans to change this behavior

## Cross-Tenant Scenario

**Question**: Developers/ops are on a different AAD tenant. AKS sign-in uses their AAD. How to access ACR in the subscription's AAD?

**Answer**: No out-of-the-box solution, but custom workflows exist:
- Requires custom work and ongoing maintenance
- Must be integrated into CI/CD process
- Options include service principal cross-tenant auth, token-based access, or image mirroring

## Key Takeaway

| Component | Same Tenant Required? | Notes |
|-----------|----------------------|-------|
| AKS SP (resource mgmt) | Yes | Must match subscription tenant |
| AKS AAD Login (kubectl) | No | Can be any AAD tenant |
| ACR | Yes | Native Azure resource, bound to host tenant |
