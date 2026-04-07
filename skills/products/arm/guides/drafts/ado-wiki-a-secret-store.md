---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Layer 2 - Runtime/Infrastructure Services/Data Stores/Secret Store"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FLayer%202%20-%20Runtime%2FInfrastructure%20Services%2FData%20Stores%2FSecret%20Store"
importDate: "2026-04-06"
type: troubleshooting-guide
---

The bulk of the functionality is provided by SF's built-in Central Secret Service (CSS). However, SF CSS does not provide RBAC functionality.

- The infra service Secret Service sits in front of SF CSS, augmenting it with RBAC.
- Both the Secret Service and SF CSS expose a REST interface for data access.

![image.png](/.attachments/image-cbdbc6fc-8727-47b9-901d-8579cce7c92a.png)

SF APP: SecretService
