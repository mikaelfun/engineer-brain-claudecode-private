# AKS ACR 认证与 RBAC — general — 排查工作流

**来源草稿**: ado-wiki-acr-connectivity-with-token.md, ado-wiki-b-acr-audit-logs.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-acr-connectivity-with-token.md | 适用: 适用范围未明确

### 排查步骤

1. Obtain the user assigned identity:

```bash
az vmss list -o table
az vmss identity show -n <vmss-name> -g <resource-group>
```

2. Login with MSI:

```bash
az login --identity --username /subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/<identity-name>
```

3. Expose the ACR Token:

```bash
TOKEN=$(az acr login --expose-token -n <acr-name> -o tsv --query accessToken)
```

4. From a pod or another VM with docker installed, use the token:

```bash
#### Create a helper pod if needed
kubectl run docker --image docker -- sleep 3600
kubectl exec -it docker -- sh

#### Inside the pod/VM
export TOKEN="<token_value>"
docker login <acr_name>.azurecr.io --username 00000000-0000-0000-0000-000000000000 --password $TOKEN
```

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-b-acr-audit-logs.md | 适用: 适用范围未明确

### 排查步骤

1. Log in to [Azure Portal](https://portal.azure.com)
2. Navigate to your Registry
3. Navigate to **Diagnostics Settings** on the registry
4. Add Diagnostic Setting. Fill in the details:
   - Provide a name
   - Check **Send to Log Analytics**
   - Select or create a Log Analytics Workspace
   - If you do not have one, follow this [article](https://docs.microsoft.com/en-us/azure/azure-monitor/learn/quick-create-workspace) to create one.
5. **SAVE**
6. Wait for a couple of minutes.
7. Perform any operation on the registry (e.g., push an image).
8. Go to **Logs** → Expand **Log Management** → **ContainerRegistryRepositoryEvents** → Run the query to get the details.

---
