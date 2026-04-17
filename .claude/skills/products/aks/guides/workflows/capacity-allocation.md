# AKS 容量与可用性区域 — 排查工作流

**来源草稿**: ado-wiki-a-VM-VMSS-Allocation-or-Capacity-Errors.md, ado-wiki-b-Node-scaling-allocation-capacity-issues.md, ado-wiki-b-atlas-creation-flow.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: VM VMSS Allocation Errors
> 来源: ado-wiki-a-VM-VMSS-Allocation-or-Capacity-Errors.md | 适用: 适用范围未明确

### 排查步骤

#### VM VMSS Allocation Errors


#### OverconstrainedAllocationRequest or OverconstrainedZonalAllocationRequest or AllocationFailed

##### Summary

Customers may encounter errors such as `OverconstrainedAllocationRequest`, `OverconstrainedZonalAllocationRequest`, or `AllocationFailed` when attempting operations that require provisioning new nodes. These operations include cluster creation, node pool creation, scaling, starting, upgrading, or updating AKS clusters.
These errors typically indicate capacity constraints, conflicting VM constraints, or other limitations within the underlying compute platform.

##### Troubelshooting

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

#### AvailabilityZoneNotSupported

Customers may encounter errors **AvailabilityZoneNotSupported** when attempting these operations which include cluster creation, node pool creation, scaling, starting, upgrading, or updating AKS clusters.

Error message:

```The zone(s) '2' for resource 'test' is not supported. The supported zones for location 'centralus' are '1,3'```

**Action from AKS engineer:** move the case to the SAP (**Azure/Service and subscription limits (quotas)/Compute-VM (cores-vCPUs) subscription limit increases**)

##### Resources

Internal VM/VMSS team wiki:

- Overconstrained Allocation Request: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1702172/Overconstrained-Allocation-Request>
- Compute Manager Troubleshooting WaitForOngoingAllocation UpdateTenant_How It Works: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/731343/Compute-Manager-Troubleshooting-WaitForOngoingAllocation-UpdateTenant_How-It-Works>
- Zonal Allocation Failed: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1702174/Zonal-Allocation-Failed>
- AKS VMSS Allocation Errors and Support Scope: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496411/AKS-Support-Boundaries_VMSS?anchor=aks-vmss-allocation-errors-and-support-scope>
- Additional tools and troubleshooting wiki: Node scaling fails due to allocation or capacity issues

Public docs:

- <https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/zonalallocation-allocationfailed-error>

#### TA Action

Engage with the VM team through the dedicated Teams channel **AKS & VM Support Alignment.**

#### TA List Contacts

##### APAC/India

- Sanath Shetty - <sanash@microsoft.com>
- Abhishek Kumar - <kuab@microsoft.com>

##### EMEA

- Eddie Neto - <edneto@microsoft.com>
- Daniel Cardoso - <dcardoso@microsoft.com>
- Mohammed Abu Taleb - <mohammed.abutaleb@microsoft.com>

##### AMER

- Chandramouli Thiruvedi - <chandramouli.thiruvedi@microsoft.com>
- Evan Langbehn - <evalan@microsoft.com>
- Chazz Washington - <chazz.washington@microsoft.com>

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-b-Node-scaling-allocation-capacity-issues.md | 适用: 适用范围未明确

### 排查步骤

**Step 1:** Check if the requested VM size is available in the customers subscription:

- The customer can run:
  - `az vm list-skus --location centralus --all --output table`
  - Example for specific vm size: `az vm list-skus --location "germanywestcentral" --size "Standard_E128s_v6" --all --output table`
  - From ASC, navigate to: `Resource Explorer  Subscription  RP Details  SKU Restrictions`

**Step 2:**

- Route the main case to the following SAP -> `Azure -> Subscription management -> Compute-VM (cores-vCPUs) subscription limit increases`.
- In case the required SKU is not offered in a specific region or zone due to platform limitations, advise the customer to either select an alternative VM size or choose a zone with available capacity, using the Compute Capacity Advisor for guidance: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/2173472/Compute-Capacity-Advisory_Start-Stop>.

##### Resources

- Public doc: <https://learn.microsoft.com/en-us/azure/azure-resource-manager/troubleshooting/error-sku-not-available?tabs=azure-cli#solution>
- Internal VM TSG: <https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495692/SkuNotAvailable_Deploy>

---

## Scenario 3: Troubleshooting Flow
> 来源: ado-wiki-b-Node-scaling-allocation-capacity-issues.md | 适用: 适用范围未明确

### 排查步骤

**Step 1:** The customer may submit a direct quota request, and many standard VM family quota increases are automatically approved.

- <https://learn.microsoft.com/en-us/azure/extended-zones/request-quota-increase>
- <https://learn.microsoft.com/en-us/azure/quotas/quickstart-increase-quota-portal>
- <https://learn.microsoft.com/el-gr/azure/azure-resource-manager/troubleshooting/error-resource-quota?tabs=azure-cli>

**Step 2:**

- Large or highdemand VM sizes may require manual review. If the customer agrees to submit a new quota request as recommended, the Subscription and Quotas team will handle the increase accordingly.
- If the customer is not willing to submit another quota request, and no additional troubleshooting is required from the AKS side, you may transfer the case to the following SAP path: `Azure -> Subscription management -> Compute-VM (cores-vCPUs) subscription limit increases`
- Please include the following case notes details: `Subscription ID, Region, SKU Size, Restriction Type (Regional or Zonal), and the number of cores requested.`

**Alert:** Please do not transfer the case or create collaboration requests with the VM/VMSS team for quota-related issues.

---

## Scenario 4: Troubleshooting Flow
> 来源: ado-wiki-b-atlas-creation-flow.md | 适用: 适用范围未明确

### 排查步骤

- If the customer gets an error at step 2, it is an ACI RP validation issue.
- If the error occurs at step 4, it is an Atlas RP issue.
- If stuck at step 5-7, investigate Service Fabric cluster placement or capacity issues.
- Kusto queries for Atlas investigation are available in the Kusto Repo ACI guide.

---
