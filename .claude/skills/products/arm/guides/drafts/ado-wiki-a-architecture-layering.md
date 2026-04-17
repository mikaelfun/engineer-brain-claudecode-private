---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Architecture/General/Architecture Layering"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FArchitecture%2FGeneral%2FArchitecture%20Layering"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# High-level Layering

Arc Autonomous ships as a 1-node virtual appliance (VM) at GA. The components of the product are organized into three layers. From bottom to top:

- Host Environment: Environment external to the VM where the software stack is hosted.
- Autonomous Runtime: Reusable software infrastructure inside the VM for operating Azure services.
- Azure Services: The services inside the VM that implement the Arc control plane.

# End-to-end Layers

Each layer is comprised of components within that layer.

## Host Environment

What capabilities does this layer provide to the layers above it?

- Virtualization
- Storage
- Networking
- Security

## Autonomous Runtime

The runtime layer is subdivided into four layers.

- Operating System: an edition of Windows Server
- Local: components with the scope of a single node (e.g. Daemons).
- Service Fabric: clustering tech + distributed application runtime.
- Infrastructure services: clustered apps that provide infrastructure for the hosted Azure services.

## Azure Services

The Azure Services layer is divided into three sub-layers.

- Azure Data Services: shared Azure services for data storage.
- Azure Middleware: shared services for Azure Arc CP scenarios.
- Azure Arc Control Plane: Azure services that expose Azure Arc CP scenarios.
