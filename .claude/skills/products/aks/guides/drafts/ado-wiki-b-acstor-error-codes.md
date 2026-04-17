---
source: ado-wiki
sourceRef: Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACStor/TSG/Error Codes
sourceUrl: https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACStor%2FTSG%2FError%20Codes
importDate: 2026-04-06
type: troubleshooting-guide
---

# ACStor Error Codes

## InvalidArgumentValueError

- Invalid usage of --disable-azure-container-storage. Azure Container Storage is not enabled in the cluster.
- Azure Container Storage has version 1 installed. A pool type value must be specified when using --disable-azure-container-storage. Allowed values are: all, azureDisk, elasticSan, ephemeralDisk
- Failed to enable Azure Container Storage version 1 as Azure Container Storage version {v2_extension_version} is already installed on the cluster. Try enabling this version on another cluster. You can also enable this version by first disabling the existing installation of Azure Container Storage by running --disable-azure-container-storage. Note that disabling can impact existing workloads that depend on Azure Container Storage.
- Storage pool type value must be specified for --enable-azure-container-storage when enabling Azure Container Storage v1. Supported values are azureDisk, elasticSan, ephemeralDisk.
- Invalid --storage-pool-name value. Accepted values are lowercase alphanumeric characters, - or ., and must start and end with an alphanumeric character.
- Azure Container Storage is already configured with --ephemeral-disk-volume-type value set to {EphemeralVolumeOnly }.
- Azure Container Storage is already configured with --ephemeral-disk-nvme-perf-tier value set to (Basic/Standard/Premium)
- Azure Container Storage is already configured with --ephemeral-disk-volume-type value set to { EphemeralVolumeOnly } and --ephemeral-disk-nvme-perf-tier value set to to (Basic/Standard/Premium)
- Cannot set --storage-pool-option value as all when --enable-azure-container-storage is set.
- Failed to enable the latest version of Azure Container Storage as version {v1_extension_version} is already installed on the cluster. Try enabling Azure Container Storage in another cluster. You can also enable the latest version by first disabling the existing installation using --disable-azure-container-storage all. Note that disabling can impact existing workloads that depend on Azure Container Storage.
- Cannot enable Azure Container Storage as it is already enabled on the cluster.
- The latest version of Azure Container Storage only supports ephemeral nvme storage and does not require or support a storage-pool-type value for --enable-azure-container-storage parameter. Please remove {storage_pool_type} from the command and try again.
- The latest version of Azure Container Storage does not require or support a --storage-pool-name value. Please remove --storage-pool-name {storage_pool_name} from the command and try again.
- The latest version of Azure Container Storage does not require or support a --storage-pool-sku value. Please remove --storage-pool-sku {storage_pool_sku} from the command and try again.
- The latest version of Azure Container Storage does not require or support a --storage-pool-option value. Please remove --storage-pool-option {storage_pool_option} from the command and try again.
- The latest version of Azure Container Storage does not require or support a --storage-pool-size value. Please remove --storage-pool-size {storage_pool_size} from the command and try again.
- Cannot disable Azure Container Storage as it is not enabled on the cluster.
- Azure Container Storage can be enabled only on {CONST_DEFAULT_NODE_OS_TYPE} nodepools. Node pool: {pool_name}, os type: {os_type} does not meet the criteria.
- Unable to install Azure Container Storage on system nodepool: {pool_name} since it has a taint CriticalAddonsOnly=true:NoSchedule. Remove the taint from the node pool and retry the Azure Container Storage operation.
- Node pool: {pool_name} not found. Please provide a comma separated string of existing node pool names in --azure-container-storage-nodepools.
  - Node pools available in the cluster: {agentpool_names_str}.
  - Aborting installation of Azure Container Storage.

## MutuallyExclusiveArgumentError

- Conflicting flags. Cannot define --storage-pool-name value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --storage-pool-sku value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --storage-pool-size value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --ephemeral-disk-volume-type value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --ephemeral-disk-nvme-perf-tier value when --disable-azure-container-storage is set.
- Conflicting flags. Cannot define --azure-container-storage-nodepools value when --disable-azure-container-storage is set.

## RequiredArgumentMissingError

- Value of --storage-pool-option must be defined since ephemeralDisk of both the types: NVMe and Temp are enabled in the cluster.
- Value of --storage-pool-option must be defined when --enable-azure-container-storage is set to ephemeralDisk.
- Multiple node pools present. Please define the node pools on which you want to enable Azure Container Storage using --azure-container-storage-nodepools.
Node pools available in the cluster are: {agentpool_names_str}.
Aborting Azure Container Storage operation.

## ArgumentUsageError

- Cannot define --storage-pool-option value when --disable-azure-container-storage is not set to ephemeralDisk.
- Invalid --storage-pool-option value since ephemeralDisk of type {storage_pool_option} is not enabled in the cluster.
- Invalid --disable-azure-container-storage value. Azure Container Storage is not enabled for storage pool type {storage_pool_type} in the cluster.
- Since {storage_pool_type} is the only storage pool type enabled for Azure Container Storage, disabling the storage pool type will lead to disabling Azure Container Storage from the cluster. To disable Azure Container Storage, set --disable-azure-container-storage to all.
- Cannot set --storage-pool-sku when --enable-azure-container-storage is ephemeralDisk.
- Invalid --storage-pool-sku value. Supported value for --storage-pool-sku are Premium_LRS, Premium_ZRS when --enable-azure-container-storage is set to elasticSan.
- Cannot set --ephemeral-disk-nvme-perf-tier along with --enable-azure-container-storage when storage pool type: ephemeralDisk option: NVMe is not enabled for Azure Container Storage. Enable the option using --storage-pool-option.
- Cannot set --storage-pool-option when --enable-azure-container-storage is not ephemeralDisk.
- Cannot set --ephemeral-disk-volume-type when --enable-azure-container-storage is not ephemeralDisk.
- Cannot set --ephemeral-disk-nvme-perf-tier when --enable-azure-container-storage is not ephemeralDisk.
- Invalid --enable-azure-container-storage value. Azure Container Storage is already enabled for storage pool type {storage_pool_type} in the cluster.
- Invalid --enable-azure-container-storage value. Azure Container Storage is already enabled for storage pool type ephemeralDisk and option {ephemeral_disk_type_installed} in the cluster.
- Value for --storage-pool-size should be defined with size followed by Gi or Ti e.g. 512Gi or 2Ti.
- Value for --storage-pool-size must be at least 1Ti when --enable-azure-container-storage is elasticSan.
- Cannot set --azure-container-storage-nodepools while using --enable-azure-container-storage to enable a type of storage pool in a cluster where Azure Container Storage is already installed. Use az aks nodepool to label the node pool instead.
- Cannot enable Azure Container Storage storage pool of type {storage_pool_type} since none of the nodepools in the cluster are labelled for Azure Container Storage.
- Invalid --azure-container-storage-nodepools value. Accepted value is a comma separated string of valid node pool names without any spaces. A valid node pool name may only contain lowercase alphanumeric characters and must begin with a lowercase letter.
- Cannot set --storage-pool-option as NVMe as none of the node pools can support ephemeral NVMe disk.
- Cannot set --storage-pool-sku as PremiumV2_LRS as none of the node pools are zoned. Please add a zoned node pool and try again.

## UnknownError

- Unable to find details for virtual machine size {vm_size}.
- Unable to determine number of cores in node pool: {pool_name}, node size: {vm_size}
- Insufficient nodes present. Azure Container Storage requires atleast 3 nodes to be enabled.
- Validation failed. Unable to perform Azure Container Storage operation. Resetting cluster state.
- Validation failed. Please ensure that storagepools are not being used. Unable to perform disable Azure Container Storage operation. Resetting cluster state.
- Validation failed. Please ensure that storagepools of type {storage_pool_type} are not being used. Unable to perform disable Azure Container Storage operation. Resetting cluster state.
- Failure observed while disabling Azure Container Storage.

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>

**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>

