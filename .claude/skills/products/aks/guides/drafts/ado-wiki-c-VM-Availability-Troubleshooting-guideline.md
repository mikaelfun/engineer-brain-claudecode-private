---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Virtual Machine TSGs/VM Availability Troubleshooting guideline"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FVM%20Availability%20Troubleshooting%20guideline"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting VM Availability

[[_TOC_]]

## Summary

Every time that we have cases that customers request us to give them why a VM was restarted in a given time, some preemptive checks can be done before opening collabs to VM team without any verification and proof of our suspects.

## How can I investigate VM Availability issues?

1. Open the Node in ASC and check for the State status in the VM overview.

2. The VM _should_ show a `Converged` state. If the VM is not `Failed` but has a value other than `Converged`, navigate to the Diagnostics tab.

   - At Screenshot area click on **+ Add Screenshot**. If the screenshot is at the login screen:
     - Check guest agent and extensions if they are healthy. If they aren't, check Guest Agent TSG.
     - If it's not at login, collect logs from Inspect IaaS Disk and check syslog for boot issues (e.g., Kernel Panic). Reimage/Restart the node to see if it fixes the problem. If problem persists, open collab for VM team.

3. If screenshot is not at login point, check the Events tab for errors.

4. Check for the following error signatures:

   - `ComputeAllocationFailureInZone`
   - `ComputeAllocationFailure`
   - `OverconstrainedZonalAllocationRequest`
   - `ZonalAllocationFailed`

   If these error signatures are present, follow the [VM VMSS Allocation Errors](/Azure-Kubernetes-Service-Wiki/AKS/TSG/CRUD/VM-VMSS-Allocation-Errors) TSG.
