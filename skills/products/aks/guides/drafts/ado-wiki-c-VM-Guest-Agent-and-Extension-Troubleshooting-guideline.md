---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Virtual Machine TSGs/VM Guest Agent and Extension Troubleshooting guideline"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FVM%20Guest%20Agent%20and%20Extension%20Troubleshooting%20guideline"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Guest Agent and Extension Troubleshooting

[[_TOC_]]

## Summary

Every time that we see Nodes not ready but the node is started, we should do some preemptive checks before opening collabs to VM team without any verification and proof of our suspects.

## Troubleshooting Steps

**1.** Check which node(s) the customer is complaining about.

**2.** Search for the node on ASC.

**3.** Check Guest Agent Status on Properties Blade.

   - If everything shows as N/A and the State of server is Seeking, wait 90 minutes for the problematic extension/guest agent to give timeout since last start/restart.

**4.** Select Extensions blade to see vmssCSE extension health status.

   - If Guest Agent is reporting (not N/A), you should see errors directly on the blade.
   - If Guest Agent has N/A values, try other steps:
     - a) Click on Subscription ID and select Operations blade. Within State column type "Client Error".
     - b) Check if you have output for the impacted resource.
     - Check the TSG for [Operations Fail with code VMAgentStatusCommunicationError or VMExtensionProvisioningTimeout](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Operations-Fail-with-code-VMAgentStatusCommunicationError-or-VMExtensionProvisioningTimeout) to understand error codes.

**5.** Usually these errors are related with DNS/Connectivity issues. Do basic network troubleshooting:

   - a) Go to Diagnostic blade and Test Traffic section.
   - b) Put a public IP as destination and click RUN.
   - c) Check NIC Effective Routes for 0.0.0.0/0.
   - d) If `NextHopType: IPV4_CA`, it's related to customer Virtual Appliance Firewall — ask customer to review their rules.
   - e) If customer states everything is OK, ask them to create a normal VM inside same subnet and verify SSH access. Use Azure Portal Serial Console for basic troubleshooting: `telnet microsoft.com 443`, `nslookup mcr.microsoft.com`.

**6.** If you see other errors not related with connectivity, engage your TA and check if a collab should be opened with Azure VM team.

**7.** If problem is not related with previous steps but node is still NotReady and State is different from Converged, check [VM Availability TSG](/Azure-Kubernetes-Service-Wiki/AKS/TSG/Compute/Virtual-Machine-TSGs/VM-Availability-Guide.md).
