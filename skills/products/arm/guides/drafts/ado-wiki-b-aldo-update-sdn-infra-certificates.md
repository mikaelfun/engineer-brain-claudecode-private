---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN Security/Update SDN infrastructure certificates"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FSDN%20Overview%2FManage%20SDN%20Security%2FUpdate%20SDN%20infrastructure%20certificates"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Update SDN Infrastructure Certificates

## Overview
SDN infrastructure relies on certificates to secure communication between its core components such as the Network Controller, SLB MUX, gateway VMs, and host agents. Updating these certificates is essential to maintain trust, prevent service disruption, and ensure compliance with security policies.

## Relevance to Readiness
Updating SDN infrastructure certificates is critical for:
- **Operational continuity**: Prevents outages caused by expired or invalid certificates.
- **Disconnected operations**: Maintains secure communication in environments without cloud connectivity.
- **Infrastructure replication**: Ensures consistent certificate lifecycle management across environments.
- **Security posture**: Reinforces encrypted and authenticated communication across SDN components.

## Key Concepts
- **Certificate Scope**: Includes server and client authentication certificates used by SDN components.
- **Trusted Root Chain**: All certificates must chain to a trusted root authority recognised by all nodes.
- **Update Process**: Involves importing new certificates, updating bindings, and restarting services where necessary.
- **Validation**: Post-update checks ensure all components can securely communicate and policies are synchronised.

## Internal Guidance
- Maintain a central inventory of all SDN-related certificates, including expiration dates and roles.
- Use PowerShell or Windows Admin Center to update certificates and verify bindings across components.
- Schedule updates during maintenance windows to minimise impact.
- Validate SDN health and policy sync after updates using diagnostics tools.
- Document the update process, rollback plan, and certificate metadata for audit and compliance.

## External Reference
For detailed technical guidance, refer to the official Microsoft documentation:
https://learn.microsoft.com/en-us/azure/azure-local/manage/update-sdn-infrastructure-certificates
