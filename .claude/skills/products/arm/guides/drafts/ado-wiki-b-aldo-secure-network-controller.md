---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/SDN Overview/Manage SDN Security/Secure the Network Controller"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FInfrastructure%2FSDN%20Overview%2FManage%20SDN%20Security%2FSecure%20the%20Network%20Controller"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Secure the Network Controller

## Overview
The Network Controller (NC) is the central orchestrator of SDN infrastructure, responsible for managing network policies, services, and communication between virtualised components. Securing the NC is critical to maintaining the integrity, confidentiality, and availability of the SDN fabric.

## Relevance to Readiness
Securing the Network Controller is essential for:
- **Operational continuity**: Prevents unauthorised access or misconfiguration that could disrupt network services.
- **Disconnected operations**: Ensures local enforcement of security policies even in isolated environments.
- **Infrastructure replication**: Maintains consistent security posture across environments.
- **Compliance and auditability**: Supports enterprise security standards and traceability.

## Key Concepts
- **Role-Based Access Control (RBAC)**: Limits administrative access based on roles and responsibilities.
- **Certificate-Based Authentication**: Ensures secure communication between SDN components.
- **Firewall Rules**: Restrict access to NC endpoints to only trusted sources.
- **Logging and Monitoring**: Enables auditing of configuration changes and access attempts.

## Internal Guidance
- Enforce RBAC policies aligned with least privilege principles.
- Use certificates issued by a trusted internal CA and monitor expiration proactively.
- Apply NSG or firewall rules to limit access to the NC management interface.
- Enable logging and integrate with your central monitoring solution for visibility.
- Document all security configurations and review them regularly as part of readiness checks.

## External Reference
For detailed technical guidance, refer to the official Microsoft documentation:
https://learn.microsoft.com/en-us/azure/azure-local/manage/nc-security
