---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Architecture/General/Azure Arc"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FArchitecture%2FGeneral%2FAzure%20Arc"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Azure ARC is a consistent experience for operating infrastructure, 3P services, and 1P Azure services in a diverse array of environments that span across public and private clouds.

# Customer Scenarios

- Central visibility of all assets for security and governance.
- Use existing tools to develop cloud-native apps and operate them anywhere, at scale.
- Run 1P Azure services anywhere.

# Control Plane vs. Data Plane

There's a fundamental split in Azure Arc between the control plane (CP) and the data plane (DP).
- The control plane runs in the Azure public cloud and manages all the different customer environments.
- The data plane runs Arc-enabled infrastructure and services in customer environments, for example, an Azure Stack HCI cluster.
