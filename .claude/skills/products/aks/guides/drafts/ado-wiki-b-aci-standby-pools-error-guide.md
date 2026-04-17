---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/Standby Pools"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/Standby%20Pools"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Standby Pools for ACI

## Overview

TBD

## Troubleshooting tools

TBD

## Common Errors/Issues

When customers encounter issues with standby pools, it's important to note that the majority of errors do not originate from the standby pool resource itself. Instead, they typically occur on the underlying container instances being created within the pool. In these cases, engineers should investigate the issue at the container level, just as they would when troubleshooting a single failed container group or VM instance.
Below is a categorized summary of the most common error types, along with representative examples and guidance on how to investigate or resolve them.

---

### Authentication / Authorization Failures

**Example:**
The client <GUID> has permission to perform action Microsoft.ContainerInstance/containerGroups/write on scope <resourceGroup>, but lacks permission for Microsoft.Network/virtualNetworks/subnets/join/action on linked scope(s).

**What it means:**  
The service principal or user has partial permissions—enough to create the container group but not to join the required subnet. This error may present itself differently based on the specific permissions missing. It is important to simply note if you see "lacks permission", the answer is to determine missing permissions and add it to the standby pool resource provider.

**How to investigate/fix:**

* Verify the role assignments for the identity in question.
* Ensure the identity has Microsoft.Network/virtualNetworks/subnets/join/action permissions on the target subnet.
* Use Azure Resource Graph or az role assignment list to confirm scope and role.

### Container Image Pull Failures

**Example:**  
Pulling image mcr.microsoft.com/windows/servercore... failed due to UNAVAILABLE: ipv4:127.0.0.1:2376: WSA Error. Container terminated with ExitCode 0.

**What it means:**  
The container runtime failed to pull the image, often due to network issues or misconfigured containerd/docker settings.

**How to investigate/fix:**

* Check node health and container runtime logs.
* Validate outbound connectivity to the image registry.
* Confirm that the image reference is correct and accessible.

### Quota Limits

**Example:**
ContainerGroupQuotaReached

**What it means:**  
The customer has reached the maximum number of container groups allowed in the region or subscription.

**How to investigate/fix:**

* Use Azure Quota APIs or the Azure Portal to check current usage.
* Request a quota increase if needed.

### Unsupported Configurations

**Example:**
ConfidentialContainerGroupSkuIsNotSupported

**What it means:**  
The customer attempted to deploy a confidential container group using an unsupported SKU or region.

**How to investigate/fix:**

* Review the SKU and region compatibility for confidential containers.
* Refer to https://learn.microsoft.com/en-us/azure/container-instances/ for supported configurations.

### Registry or Identity Issues

**Example:**
InvalidImageRegistryIdentity

**What it means:**  
The identity used to access the container registry is either missing, misconfigured, or lacks the necessary permissions.

**How to investigate/fix:**

* Ensure the container group has a valid managed identity or service principal.
* Confirm that the identity has AcrPull permissions on the registry.

### Network Resource Errors

**Example:**
VirtualNetworkNotFound

**What it means:**  
The specified virtual network or subnet does not exist or is not accessible in the deployment context.

**How to investigate/fix:**

* Double-check the VNet and subnet names and resource IDs.
* Ensure the VNet is in the same region and subscription as the container group.

## Owner and Contributors

**Owner:** Andy Zhao <kuzhao@microsoft.com>

**Contributors:**

* Jordan Harder <Jordan.Harder@microsoft.com>
