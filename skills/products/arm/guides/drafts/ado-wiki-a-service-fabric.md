---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Layer 2 - Runtime/Service Fabric"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FLayer%202%20-%20Runtime%2FService%20Fabric"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Today we're 1-node only, so there is no need to form a cluster. Looking forward, we will want to be a multi-node clustered appliance. Why is SF a required layer on a 1-node appliance if we're not making use of its federation/clustering functionality?

SF provides two high-level categories of functionality:

1. A distributed application orchestrator (control plane).
2. A distributed application runtime (data plane).

Category (1) is not strictly required but we make use of some of SF's functionality for lifecycle operations, even on 1-node.

Category (2) functionality is required for "enlightened" applications that depend on the SF programming model. The SF programming model is implemented in the SF run-time.

# Layering

SF applications may depend on the SF programming model (enlightened) or they may not (unenlightened / "guest").

Enlightened applications embed the SF application runtime SDK into their process. The SDK connects to the local Fabric.exe via IPC (process) or TCP (container).

Enlightened applications may also communicate to built-in SF services, via the SF SDK API.

The two layers above are clustered applications. Node agents are the part of SF that is local/unique to each node.

In addition to the application model for SF-enlightened Azure services, we make use of various other subsystems.
