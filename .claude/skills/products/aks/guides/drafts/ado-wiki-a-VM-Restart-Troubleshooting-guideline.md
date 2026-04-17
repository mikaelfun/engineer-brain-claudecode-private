---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Virtual Machine TSGs/VM Restart Troubleshooting guideline"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Virtual%20Machine%20TSGs/VM%20Restart%20Troubleshooting%20guideline"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Virtual Machine Restart Troubleshooting

## Summary

Every time customers request why a VM was restarted, preemptive checks can be done before opening collabs to VM team.

## What should we do?

**1.** Open the Node in ASC or ASI
   - In ASI: Select the affected node, check the field "VMA Impacting Events", click on the box to see Failure Signature message.
   - In ASC: Select the affected node and see the Health tab.
   - In ASC (VMSS): Select the VMSS → Health tab to check all VMs.

**2.** Check Failure Signature message, then cross-reference with the VM POD wiki: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/513106/VMs-and-VMSS

   a. If event is one-of-a-kind → send RCA to customer
      - "Customer initiated" Failure Signature: usually caused by OS/app processes (e.g., kured)
      - In ASC → Diagnostics tab → run InspectIaaSDisk to collect OS logs
      - ⚠️ Ephemeral OS disk: cannot collect OS logs — ask for session or request customer to send node logs

   b. If customer has multiple events for same node related to Hardware → open collab with VM team

## Owner
Adam Margherio (amargherio@microsoft.com)
