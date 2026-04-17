---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/CRUD/Scale/VM VMSS Allocation or Capacity Errors"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FVM%20VMSS%20Allocation%20or%20Capacity%20Errors"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# VM VMSS Allocation Errors

[[_TOC_]]

## OverconstrainedAllocationRequest or OverconstrainedZonalAllocationRequest or AllocationFailed

### Summary

Customers may encounter errors such as `OverconstrainedAllocationRequest`, `OverconstrainedZonalAllocationRequest`, or `AllocationFailed` when attempting operations that require provisioning new nodes. These operations include cluster creation, node pool creation, scaling, starting, upgrading, or updating AKS clusters.
These errors typically indicate capacity constraints, conflicting VM constraints, or other limitations within the underlying compute platform.

### Troubelshooting

To accurately identify the root cause, capturing the complete failure message is essential. Several types of overconstrained failures exist, and the full error context helps determine the next steps.

- Collect the operation error in our internal tools **ASI, ASC, Kusto**, which confirms that the issue is genuinely allocation or capacity related.
- Set clear expectations with the customer that we will engage the VM/VMSS team for investigation.
- Create a summary **case notes** using the template below:
  - **AKS Context**
    - AKS operation and end goal:
            i- (e.g., create new node pool, scale out existing node pool, upgrade cluster)
    - What this means at the compute layer:
            ii- (e.g., create new VMSS, scale out existing VMSS, add new VMs)
  - **Compute Resource Details**
    - VM or VMSS resource URI (if existing):
    - Subscription ID:
    - Region and Zone (if zonal):
    - VM Size:
  - **Failure Details**
    - Full error message:
    - First failure timestamp:
    - Most recent failure timestamp:
    - Is the failure still reproducible? (Yes/No)
    - Output of the query above (Screenshot, link or kusto query)
- **Open a collaboration with the AKS team and assign it to yourself**, then route the main case to one of the SAP teams listed below based on the specific error encountered:

```text
- Azure/Virtual Machine Scale Sets/Availability Zones Issues
- Azure/Virtual Machine running Linux/Received an Allocation Failure
- Azure/Virtual Machine Scale Sets/Cannot Create a new scale set/I received an allocation failure
```

- **Do not close the collaboration** without prior coordination with the VM engineer main case owner, as AKS questions/actions might be needed.
- After following all those steps above, if there is any disagreement from any side, engage the respective TA in your region. Check the TA list in the end of this wiki.

## AvailabilityZoneNotSupported

Customers may encounter errors **AvailabilityZoneNotSupported** when attempting these operations which include cluster creation, node pool creation, scaling, starting, upgrading, or updating AKS clusters.

Error message:

```The zone(s) '2' for resource 'test' is not supported. The supported zones for location 'centralus' are '1,3'```

**Action from AKS engineer:** move the case to the SAP (**Azure/Service and subscription limits (quotas)/Compute-VM (cores-vCPUs) subscription limit increases**)

### Resources

Internal VM/VMSS team wiki:

- Overconstrained Allocation Request: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1702172/Overconstrained-Allocation-Request>
- Compute Manager Troubleshooting WaitForOngoingAllocation UpdateTenant_How It Works: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/731343/Compute-Manager-Troubleshooting-WaitForOngoingAllocation-UpdateTenant_How-It-Works>
- Zonal Allocation Failed: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1702174/Zonal-Allocation-Failed>
- AKS VMSS Allocation Errors and Support Scope: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496411/AKS-Support-Boundaries_VMSS?anchor=aks-vmss-allocation-errors-and-support-scope>
- Additional tools and troubleshooting wiki: Node scaling fails due to allocation or capacity issues

Public docs:

- <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/zonalallocation-allocationfailed-error>

## TA Action

Engage with the VM team through the dedicated Teams channel **AKS & VM Support Alignment.**

## TA List Contacts

### APAC/India

- Sanath Shetty - <sanash@microsoft.com>
- Abhishek Kumar - <kuab@microsoft.com>

### EMEA

- Eddie Neto - <edneto@microsoft.com>
- Daniel Cardoso - <dcardoso@microsoft.com>
- Mohammed Abu Taleb - <mohammed.abutaleb@microsoft.com>

### AMER

- Chandramouli Thiruvedi - <chandramouli.thiruvedi@microsoft.com>
- Evan Langbehn - <evalan@microsoft.com>
- Chazz Washington - <chazz.washington@microsoft.com>
