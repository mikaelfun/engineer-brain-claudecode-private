---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Layer 1 - Host Environment/Security"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FLayer%201%20-%20Host%20Environment%2FSecurity"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Operator supplies a TLS certificate for the HTTPS endpoints exposed on the ingress and management network interfaces.

- The external HTTPS endpoints use self-signed certificates in PP1.
- The SystemConfigurationService exposes a plain HTTP endpoint.

Customer identity provider that Arc-A's internal identity server may connect to.

- Integrate with the existing customer identities.
- More on this at Arc control plane layer.
