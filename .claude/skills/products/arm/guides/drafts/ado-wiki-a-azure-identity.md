---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Layer 3 - Azure Services/Middleware/Azure Identity"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FComponents%2FLayer%203%20-%20Azure%20Services%2FMiddleware%2FAzure%20Identity"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# General

Arc-A is AD-less, so what do we use for remote identity? (i.e. Identity across the network)

- Azure's identity platform is based on OAuth 2.0
- OIDC is an authentication layer built on top of OAuth 2.0
- Scenarios: User-to-service, Service-to-service

This functionality is traditionally provided by:

- Azure: Azure Active Directory (AAD) / Entra
- Hub: Active Directory Federation Services (ADFS)
- Arc-A: Security Token Service (STS) & Graph

Certificates are used for:

- Microservice-to-microservice auth
- The infrastructure that sits below STS/Graph
- Ge: Exploring OAuth down at this layer

In Arc-A, we use an edge-specific, miniaturized implementation, comprising of two services: STS and Graph. Future investigation: Can we align with Azure's dSTS?

- Security Token Service (STS): Issue, validate, renew, and cancel security tokens.
- Graph Service: Exposes a subset of the Microsoft Graph API for the various identity assets in the system used by other services for their RBAC implementation.
  - users
  - groups
  - applications
  - principals, etc.

# Services

- STS
- MS Graph
- MSI
- Policy
- RBAC
