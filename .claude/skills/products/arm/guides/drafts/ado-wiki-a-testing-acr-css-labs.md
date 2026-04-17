---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/Azure Container Registry (ACR)/Testing ACR in CSS labs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Workloads/Azure%20Container%20Registry%20(ACR)/Testing%20ACR%20in%20CSS%20labs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Testing ACR in CSS Labs

Two ways to manage images for ACR:
1. **Connected Environment:** images downloaded over internet and pushed to ACR using az ACR CLI commands
2. **Disconnected Environment:** download images offline, copy to management VM and upload to ACR

---

## Creating ACR using az CLI

```powershell
$acrName = "testacr01"
$resourceGroupName = "demo-test-rg"
az acr create --name $acrName --resource-group $resourceGroupName --sku Standard
```

## 1. Connected Environment — Direct Image Import

Use `az acr import` to pull images directly into ACR without Docker installed:

```powershell
$sourceImage = "docker.io/library/nginx:latest"
$acrName = "testacr01"
az acr import --name $acrName --source $sourceImage --image nginx:latest
```

### Useful ACR Management Commands

```powershell
# List all ACR registries
az acr list -g $resourceGroupName -o table

# List all repositories
az acr repository list --name $acrName --output table

# List all tags
az acr repository show-tags --name $acrName --repository hello-world --output table

# Delete ACR
az acr delete --resource-group $resourceGroupName --name $acrName --yes
```

## 2. Disconnected Environment — Offline Docker Image Transfer

### Management VM Prerequisites
- Docker Desktop installed
- Can switch between Windows or Linux container modes

### STEP 1: On the Online Machine

```powershell
docker pull nginx:latest
md C:\DockerImages
docker save -o C:\DockerImages\nginx-latest.tar nginx:latest
```

Transfer `nginx-latest.tar` to offline machine via USB/shared folder.

### STEP 2: On the Offline Machine (Azure Local)

```powershell
docker load -i C:\DockerImages\nginx-latest.tar

$acrName = "testacr01"
$registryFQDN = "testacr01.edgeacr.autonomous.cloud.private"
$sourceImage = "nginx:latest"
$targetImage = "$registryFQDN/nginx:latest"

docker tag $sourceImage $targetImage

# Enable admin user
az acr update --name $acrName --admin-enabled true
az acr credential show --name $acrName

# Login and push
az acr login --name $acrName
docker push $targetImage
```

## Notes

- Specify full source locations e.g., `docker.io/library/hello-world:linux`
- For private images from Docker Hub, use `--username` and `--password` parameters
- If ACR login fails, ensure admin access is enabled or you're logged in via `az login`

## Related Documentation

- [Import container images - Azure CLI](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-import-images)
- [Manage ACR repositories and tags](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-repositories)
- [Azure Container Registry Documentation](https://learn.microsoft.com/en-us/azure/container-registry/)
