---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Tools and TSGs/Root Cause Selection"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FRoot%20Cause%20Selection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Root Cause Selection In DFM Portal

## Description

Due to the nature of Application Gateway as a product, customers may witness behaviours on application gateway induced due to misconfigurations in the backend application or associated resources such as Virtual Network, Firewall, DNS, Private Link, NVA, NSG/UDR etc.

Relevant Azure offerings have been added in the root-cause-tree for Application Gateway. This makes it possible for case-owners to select the exact root-cause of the Application Gateway support ticket, even if this exact root-cause is within the scope of these other relevant offerings.

**Support Engineers are recommended to start leveraging these newly available root-causes immediately.**

**Some root-cause guidance for issues related to backend-connectivity failing are documented in the [BackendConnectivityTSG](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/907425/BackendConnectivityTSG).**

## How-To-Audit-Root-Cause-Of-Closed-Case

**Step 1**: Open Case Details in the DFM audit view.

**Step 2**: Re-select root cause accurately using the updated root cause tree (which now includes cross-product categories).

**Step 3**: Classify the root cause (e.g. Application Gateway internal vs. Virtual Network vs. DNS etc.).
