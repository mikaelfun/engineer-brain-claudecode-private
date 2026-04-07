---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN Security/Update Network Controller certificates"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FSDN%20Overview%2FManage%20SDN%20Security%2FUpdate%20Network%20Controller%20certificates"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Update Network Controller Certificates

## Overview
The Network Controller (NC) is the central component of SDN infrastructure, responsible for managing and orchestrating network policies and services. Its secure operation depends on valid certificates for authentication and encryption. Updating these certificates is essential to maintain trust and uninterrupted communication between SDN components.

## Relevance to Readiness
Updating Network Controller certificates is critical for:
- **Operational continuity**: Prevents service disruption due to expired or invalid certificates.
- **Disconnected operations**: Ensures local trust boundaries remain intact without relying on external PKI.
- **Infrastructure replication**: Supports consistent certificate lifecycle management across environments.
- **Security posture**: Maintains encrypted and authenticated communication between SDN components.

## Key Concepts
- **Certificate Roles**: Includes server authentication for the NC and client authentication for SDN agents.
- **Trusted Root Chain**: All certificates must chain to a trusted root authority recognised by all SDN nodes.
- **Update Process**: Involves importing new certificates, updating bindings, and restarting services.
- **Validation**: Post-update validation ensures all SDN components can securely communicate with the NC.

## Internal Guidance
- Maintain a certificate inventory with expiration tracking for all NC-related certs.
- Use PowerShell or Windows Admin Center to update certificates and verify bindings.
- Perform updates during maintenance windows to minimise impact.
- Validate connectivity and policy sync post-update using SDN diagnostics.
- Document the update process and rollback plan for audit and recovery.

## External Reference
For detailed technical guidance, refer to the official Microsoft documentation:
https://learn.microsoft.com/en-us/azure/azure-local/manage/update-network-controller-certificates
