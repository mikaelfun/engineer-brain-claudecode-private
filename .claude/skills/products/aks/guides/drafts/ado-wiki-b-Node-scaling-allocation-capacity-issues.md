---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/CRUD/Scale/Node scaling fails due to allocation or capacity issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20scaling%20fails%20due%20to%20allocation%20or%20capacity%20issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Operations fail due to subscription quota issues

## Engineer Guidance / Action

- Please collect the complete failure error details from the customer. You can also review the same error in VMSS CRP operations through ASC or ASI  CRP.
- Always assess and confirm with the customer whether AKSside troubleshooting is still required after addressing capacity or VM size or quotarelated issues.
- Ensure you verify which specific operations the customer is experiencing failures with.

## SKU Not Found / VM Size Not Available

### Summary

During cluster and node pool creation, customers may encounter SKU Not Found or VM Size Not Available errors.

### Troubleshooting

**Step 1:** Check if the requested VM size is available in the customers subscription:

- The customer can run:
  - `az vm list-skus --location centralus --all --output table`
  - Example for specific vm size: `az vm list-skus --location "germanywestcentral" --size "Standard_E128s_v6" --all --output table`
  - From ASC, navigate to: `Resource Explorer  Subscription  RP Details  SKU Restrictions`

**Step 2:**

- Route the main case to the following SAP -> `Azure -> Subscription management -> Compute-VM (cores-vCPUs) subscription limit increases`.
- In case the required SKU is not offered in a specific region or zone due to platform limitations, advise the customer to either select an alternative VM size or choose a zone with available capacity, using the Compute Capacity Advisor for guidance: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2173472/Compute-Capacity-Advisory_Start-Stop>.

### Resources

- Public doc: <https://learn.microsoft.com/en-us/azure/azure-resource-manager/troubleshooting/error-sku-not-available?tabs=azure-cli#solution>
- Internal VM TSG: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495692/SkuNotAvailable_Deploy>

## Quota errors

The vCPU quotas for virtual machines and scale sets are arranged in two tiers for each subscription, in each region. The first tier is the Total Regional vCPUs, and the second tier is the various VM size family cores such as the D-series vCPUs. Anytime a new VM is deployed the vCPUs for the VM must not exceed the vCPU quota for the VM size family or the total regional vCPU quota. If you exceed either of those quotas, the VM deployment won't be allowed. There is also a quota for the overall number of virtual machines in the region.

- Quota errors occur when operations exceed avaialble quota limits.
- When a customer performs an operation that triggers the creation of new nodes such as cluster creation, adding a new node pool, scaling, starting, upgrading, or updating an AKS cluster and the operation fails due to quota errors, the following guidance applies.

**Example:**

- Operation results in exceeding quota limits of Core.

### Troubleshooting

**Step 1:** The customer may submit a direct quota request, and many standard VM family quota increases are automatically approved.

- <https://learn.microsoft.com/en-us/azure/extended-zones/request-quota-increase>
- <https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal>
- <https://learn.microsoft.com/el-gr/azure/azure-resource-manager/troubleshooting/error-resource-quota?tabs=azure-cli>

**Step 2:**

- Large or highdemand VM sizes may require manual review. If the customer agrees to submit a new quota request as recommended, the Subscription and Quotas team will handle the increase accordingly.
- If the customer is not willing to submit another quota request, and no additional troubleshooting is required from the AKS side, you may transfer the case to the following SAP path: `Azure -> Subscription management -> Compute-VM (cores-vCPUs) subscription limit increases`
- Please include the following case notes details: `Subscription ID, Region, SKU Size, Restriction Type (Regional or Zonal), and the number of cores requested.`

**Alert:** Please do not transfer the case or create collaboration requests with the VM/VMSS team for quota-related issues.

## Capacity Reservations

- If the customer is looking for guaranteed capacity, they may consider exploring Azure Capacity Reservations, which allow them to reserve compute capacity in a specific region or availability zone: <https://learn.microsoft.com/en-us/azure/virtual-machines/capacity-reservation-overview>. If the customer requires further guidance or assistance with capacity reservations, please involve the Compute/VM/VMSS team for additional support.
- From AKS side Assign capacity reservation groups to Azure Kubernetes Service (AKS) node pools: <https://learn.microsoft.com/en-us/azure/aks/use-capacity-reservation-groups>

### Allocation Capacity dashboard - Troubleshooting (optional)

There's a nice tool to show capacity - [LensExplorer Allocation Capacity Dashboard](https://lens.msftcloudes.com/#/dashboard/17d22387-b889-4c0f-8faa-1e1fdead8db8?tempId=20230929-21abcf97-245a-4fa6-bcfe-662f41ba117e&_g=())

Select the VM Size, the Region and the Zone, and that chart will tell you how many VMs can be created at a given point in time.

## Mitigation Steps

Unfortunately, regional VM capacity is a very fluid situation and can change at any time.  The best mitigation is to try again later.  If the customer is using cluster autoscaler, it will automatically retry scaling operations.  If the customer is manually scaling, they will need to retry the scaling operation manually.

## Owner and Contributors

**Owner:** Eddie Neto <Edervaldo.Neto@microsoft.com>

**Contributors:**

- Luis Alvarez <Alvarez.Luis@microsoft.com>
- Rory Lenertz <rorylen@microsoft.com>
- Luis Alvarez <lualvare@microsoft.com>
- axelg <axelg@microsoft.com>
