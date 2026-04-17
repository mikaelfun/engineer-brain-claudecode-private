---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Layer 2 - Runtime/Infrastructure Services/Container Entry Point (CEP)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FLayer%202%20-%20Runtime%2FInfrastructure%20Services%2FContainer%20Entry%20Point%20%28CEP%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

The Container Entry Point (CEP) runs inside of every container image (including infra services). It augments Windows containers with additional functionality. For example, on container startup, CEP will securely read secrets from the secret store and write them to a container environment variable.

![image.png](/.attachments/image-d968b2f6-3d29-4c81-bbb7-808720c6bb55.png)
