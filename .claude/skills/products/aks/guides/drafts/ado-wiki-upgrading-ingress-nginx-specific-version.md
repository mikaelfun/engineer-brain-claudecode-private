---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Upgrading ingress-nginx to a specific version"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FUpgrading%20ingress-nginx%20to%20a%20specific%20version"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Upgrading ingress-nginx to a specific version

## Objective

Guide on how to upgrade the nginx ingress controller to specific versions due to customer requirement or application dependency.

## Prerequisites

AKS cluster with installed nginx ingress controller. Reference: https://learn.microsoft.com/en-us/azure/aks/ingress-basic?tabs=azure-cli

## Implementation

Two types of upgrade procedures:

### Without Helm

Simply upgrade the controller to required version by changing the image name in the deployment file which follows the defined rolling update strategy.

### With Helm (Recommended)

Recommended approach to keep track and adhere to defined chart versions for the specific nginx version.

**Key steps:**

1. Check the support matrix for K8s version compatibility: https://github.com/kubernetes/ingress-nginx#supported-versions-table

2. Find all releases: https://github.com/kubernetes/ingress-nginx/releases

3. List currently deployed release:
   ```bash
   helm list -n ingress-basic
   ```

4. **Finding the correct chart version for a target controller version:**
   - Go to the release page for details on the controller version
   - Use the source code or changelog to find the matching chart version
   - Compare versions at: https://github.com/kubernetes/ingress-nginx/compare/
   - Example: Controller v1.2.1 corresponds to Helm chart version 4.1.3

5. Upgrade:
   ```bash
   helm upgrade ingress-nginx ingress-nginx/ingress-nginx --version <chart-version> -n ingress-basic
   ```

## Rollback

In the event of any issue, rollback with:
```bash
helm rollback ingress-nginx <revision_name> -n ingress-basic
```
