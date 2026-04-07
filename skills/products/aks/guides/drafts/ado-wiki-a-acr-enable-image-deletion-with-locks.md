---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/Enable image and repository deletion with ACR locks"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/How%20Tos/Enable%20image%20and%20repository%20deletion%20with%20ACR%20locks"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Enable image and repository deletion with ACR locks

[[_TOC_]]

## Context

When ACR locks (Delete and Write) are added at all possible levels — Repository, Image by Tag, and Image by Digest — deletion operations will fail. The Image by Digest level is often the most problematic because when you change locks by Tag, the output also shows the related digest, leading to confusion about which level is actually blocking the operation.

Reference: [ACR - Lock Images](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-image-lock)

**Key insight**: You must unlock at ALL three levels:
1. Repository level
2. Image by Tag level  
3. Image by Digest level ← most commonly overlooked

## Sample Scripts

### Check current settings for a repository and each Image by Tag and Digest

```bash
#!/bin/bash
# getRepoNImgDetails.sh
# Lists current settings for repository, each image by Tag and each image by Digest

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
      --acr-name) ACR_NAME="$2"; shift ;;
      --repo-name) REPOSITORY_NAME="$2"; shift ;;
  esac
  shift
done

# Print details from repository
echo "Repository: $REPOSITORY_NAME"
az acr repository show --name $ACR_NAME --repository $REPOSITORY_NAME --output jsonc

# Loop through images by tag
IMAGE_LIST=$(az acr repository show-tags -n $ACR_NAME --repository $REPOSITORY_NAME --output json)
for i in $(echo $IMAGE_LIST | jq -r '.[]'); do
    echo "Image: $i"
    az acr repository show -n $ACR_NAME --image $REPOSITORY_NAME:$i --output json | jq '.'
done

# Loop through images by digest
IMAGE_DIGESTS=$(az acr repository show-manifests --name $ACR_NAME --repository $REPOSITORY_NAME --query "[].digest" --output tsv)
for digest in $IMAGE_DIGESTS; do
    echo "Image Digest: $digest"
    az acr repository show -n $ACR_NAME --image $REPOSITORY_NAME@$digest --output json
done
```

Usage:
```bash
chmod 755 getRepoNImgDetails.sh
./getRepoNImgDetails.sh --acr-name <ACR_NAME> --repo-name <REPO_NAME>
```

### Enable Delete and Write options (unlock all levels)

```bash
#!/bin/bash
# enableRepoNImgDW.sh
# Enable Delete and Write options at repository level, by tag, and by digest

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
      --acr-name) ACR_NAME="$2"; shift ;;
      --repo-name) REPOSITORY_NAME="$2"; shift ;;
  esac
  shift
done

# Unlock at repository level
az acr repository update --name $ACR_NAME --repository $REPOSITORY_NAME --delete-enabled true &> /dev/null
az acr repository update --name $ACR_NAME --repository $REPOSITORY_NAME --write-enabled true &> /dev/null
az acr repository show --name $ACR_NAME --repository $REPOSITORY_NAME --output jsonc

# Unlock each image by tag
IMAGE_LIST=$(az acr repository show-tags -n $ACR_NAME --repository $REPOSITORY_NAME --output json)
for i in $(echo $IMAGE_LIST | jq -r '.[]'); do
    echo "Image: $i"
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME:$i --delete-enabled true &> /dev/null
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME:$i --write-enabled true &> /dev/null
    az acr repository show -n $ACR_NAME --image $REPOSITORY_NAME:$i --output json | jq '.'
done

# Unlock each image by digest
IMAGE_DIGESTS=$(az acr repository show-manifests --name $ACR_NAME --repository $REPOSITORY_NAME --query "[].digest" --output tsv)
for digest in $IMAGE_DIGESTS; do
    echo "Image Digest: $digest"
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME@$digest --delete-enabled true &> /dev/null
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME@$digest --write-enabled true &> /dev/null
    az acr repository show -n $ACR_NAME --image $REPOSITORY_NAME@$digest --output json
done
```

Usage:
```bash
chmod 755 enableRepoNImgDW.sh
./enableRepoNImgDW.sh --acr-name <ACR_NAME> --repo-name <REPO_NAME>
```

### Disable Delete and Write options (lock all levels)

```bash
#!/bin/bash
# disableRepoNImgDW.sh
# Disable Delete and Write options at all levels (repository, tag, digest)

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
      --acr-name) ACR_NAME="$2"; shift ;;
      --repo-name) REPOSITORY_NAME="$2"; shift ;;
  esac
  shift
done

# Lock each image by tag first
IMAGE_LIST=$(az acr repository show-tags -n $ACR_NAME --repository $REPOSITORY_NAME --output json)
for i in $(echo $IMAGE_LIST | jq -r '.[]'); do
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME:$i --delete-enabled false &> /dev/null
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME:$i --write-enabled false &> /dev/null
done

# Lock each image by digest
IMAGE_DIGESTS=$(az acr repository show-manifests --name $ACR_NAME --repository $REPOSITORY_NAME --query "[].digest" --output tsv)
for digest in $IMAGE_DIGESTS; do
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME@$digest --delete-enabled false &> /dev/null
    az acr repository update --name $ACR_NAME --image $REPOSITORY_NAME@$digest --write-enabled false &> /dev/null
done

# Lock at repository level
az acr repository update --name $ACR_NAME --repository $REPOSITORY_NAME --delete-enabled false &> /dev/null
az acr repository update --name $ACR_NAME --repository $REPOSITORY_NAME --write-enabled false &> /dev/null
az acr repository show --name $ACR_NAME --repository $REPOSITORY_NAME --output jsonc
```

Usage:
```bash
chmod 755 disableRepoNImgDW.sh
./disableRepoNImgDW.sh --acr-name <ACR_NAME> --repo-name <REPO_NAME>
```

## Owner and Contributors

**Owner:** Kenneth Gonzalez Pineda <kegonzal@microsoft.com>
**Contributors:** Tiago Furtado Goncalves
