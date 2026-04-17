---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Tools/Azure Support Center (ASC)"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTools%2FAzure%20Support%20Center%20(ASC)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Support Center (ASC) for Purview

In the initial phase of public preview, we have basic integration with ASC. We display the provisioning information, Scan run details and permissions and access control on the Purview account.

**We have submitted our first batch of ASC Insights request to the Purview Service Engineering team which is expected to speed up a lot of our troubleshooting process.**
Details here:

- [Scan Insights](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/444472/Scan-Insights)
- [Assets and Classification Insights](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/444473/Classification-Insights)
- Lineage Insights  //TODO
- [Exception Insights](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Azure%20Purview/444474/Exception-Insights)

## Provisioning

ASC displays the top failed provisioning errors and the status of successful provisions. Useful while debugging Account creation errors.

## Scan

Input the Scan Run Id and ASC displays useful information about the Scan run like status, assets discovered, assets classified, any errors during scan run and so on.

## Access Control

Displays the MSIs and users added to the Purview account and what roles they have. Useful while debugging Access control and permission issues.

Please make sure you use ASC as your first point of investigation and always use ASC to escalate tickets to the Product team (IcMs) using the appropriate template.

Demo on ASC Capabilities:

Babylon Troubleshooting Session 2: Babylon ASC Integration for Public Preview - https://msit.microsoftstream.com/video/425da1ff-0400-b9eb-22e1-f1eb3424f8c0
