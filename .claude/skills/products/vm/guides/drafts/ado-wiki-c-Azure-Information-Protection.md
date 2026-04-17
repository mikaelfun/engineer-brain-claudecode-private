---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/Azure Information Protection_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FAzure%20Information%20Protection_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Process
- cw.Reviewed-01-2026
---

[[_TOC_]]

# Summary

This article provides instructions on how to handle a ticket when a customer has questions or issues related to Azure Information Protection (AIP).
AIP enables customers to discover, classify, protect, and govern sensitive information.
It may be installed on Azure Virtual Machines or standard Windows machines, and customers typically access the AIP options through Windows Explorer > Right-click > Classify & Protect.

Examples:
- AIP Dialog in Windows Explorer
- File encrypted through AIP showing unreadable content in Notepad
- AIP client UI elements

# Expectations

Your goal is to help the customer by collecting all necessary information so the AIP team can proceed with timely and accurate resolution.
Before transferring cases or opening a collaboration task with the AIP team, ensure you have collected and documented the basic diagnostic information listed below.

## Information to Collect

Document the following in case notes before transferring:

1. Has the customer been able to perform this action successfully before?
2. Detailed explanation of the issue
3. Number of machines affected
4. Whether machines with the same OS are working correctly
5. Any screenshots, logs, or examples provided
6. AIP / MIP client version installed on the affected machine
7. Identity used to sign in (confirm expected user context)
8. Whether sensitivity labels are published to the user
9. Whether the issue occurs with all files or only specific ones
10. If the file is protected by the same tenant or an external organization

# Next Steps

Once you have collected the required information:

- Add all details to the case notes
- Perform any initial troubleshooting you deem appropriate
- When ready, transfer the ticket or open a collaboration task with the AIP team

Use your discretion as the Support Engineer to follow previous steps, validate environment behavior, and ensure that the case aligns with the AIP team's scope.

When transferring, edit the SAP ticket to match the Azure Information Protection team routing requirements:

- **Product Family:** Security
- **Product Name:** Microsoft Purview Compliance
- **Category:** Microsoft Purview Information Protection
- **Sub Category:** MPIP Client installation and upgrades

**AIP Queue Link:** [Internal EP Queue Information](https://msaas.support.microsoft.com/queue/b5bee157-6ca9-4d81-9e18-4e2856e5a913)

# Special Case: Ransomware-Encrypted Files

If the issue is related to files that appear encrypted, verify whether this is AIP protection or ransomware activity.
If ransomware is suspected, refer to: **[Ransomware Attack in a VM](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/585131/Ransomware-Attack-in-a-VM_Process)**

Note: Ransomware cases do not fall under the AIP team.
