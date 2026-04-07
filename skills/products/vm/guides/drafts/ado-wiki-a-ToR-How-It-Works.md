---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/ToR_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FToR_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - cw.How-It-Works
  - cw.Reviewed-08-2023
---

[[_TOC_]]

# What does ToR mean?
ToR is an acronym for Top of Rack. This is a network component (switch) which is located at the top of every rack.
A rack, also known as a host, is physical hardware which contains a set of Nodes . Under these nodes, you may find customer's VMs hosted.

The Azure infrastructure seems like the following:
[![Networking-TOR_Planned-Maint_DataCenterArquitecture.png](/.attachments/How-It-Works/Networking-TOR_Planned-Maint_DataCenterArquitecture.png)](/.attachments/How-It-Works/Networking-TOR_Planned-Maint_DataCenterArquitecture.png)  
The above image describes how every ToR allows its rack to communicate with the rest of the Azure infrastructure.

For more details, you may explore this document: [Microsoft Azure - Fault Tolerance Pitfalls and Resolutions in the Cloud | Microsoft Docs](https://docs.microsoft.com/en-us/archive/msdn-magazine/2015/september/microsoft-azure-fault-tolerance-pitfalls-and-resolutions-in-the-cloud#fault-domains-and-upgrade-domains).


Although ToRs are a component worked by our peer team [Azure Networking](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/140152), we end up briefly touching while working under Unexpected Restart Scenarios and Planned Maintenances.

* For more information on Planned Maintenances: [Networking TOR_Planned Maint](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496016)
* For more information on Unexpected Restarts: [Network TOR Hardware Failure_Restarts](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496358)


# Feedback & Questions 

Please contact contributors or TA/SMEs who is closest to you.
