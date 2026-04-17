---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Container Instance Deployment from Firewall protected ACR"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Cluster%20Management/Container%20Instance%20Deployment%20from%20Firewall%20protected%20ACR"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Container Instance Deployment from Firewall protected ACR

## Objective

Deploy an Azure Container Instance using an image hosted in Azure Container Registry that is protected by Network Firewall (Allow Selected Subnets).

## Deployment Steps

Use a **User Managed Identity** with **acr-pull** RBAC permissions on the Container Registry.

1. Create a User Managed Identity:
```bash
az identity create --resource-group <rg-name> --name <identity-name>
```

2. Get the Identity **Id** and **PrincipalID**:
```bash
userID=$(az identity show --resource-group <rg-name> --name <identity-name> --query id --output tsv)
spID=$(az identity show --resource-group <rg-name> --name <identity-name> --query principalId --output tsv)
```

3. Create Azure RBAC permissions on the ACR:
```bash
az role assignment create --assignee <principalId> --scope <acr-resource-id> --role acrpull
```

4. Deploy Container Instance with managed identity:
```bash
az container create -g <rg-name> --name <aci-name> \
  --assign-identity "<managed-identity-resource-id>" \
  --acr-identity "<managed-identity-resource-id>" \
  --image="<acr-name>.azurecr.io/<image>:<tag>" \
  --subnet <subnet-resource-id> \
  --registry-login-server "<acr-name>.azurecr.io"
```

5. On the ACR Networking Tab, enable:
   - "Allow Microsoft Services to access this container registry"
   - "Selected Networks"

## Key Flags

- `--assign-identity`: The user-assigned managed identity resource ID
- `--acr-identity`: The identity used to pull from ACR (same managed identity)
- `--subnet`: Required for VNET-integrated ACI deployment
