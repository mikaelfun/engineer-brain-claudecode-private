---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/System Requirement"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FSystem%20Requirement"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# System Requirements for ALDO (Azure Local Disconnected Operations)

## Hardware Requirements (per node)

| Specification | Minimum Configuration |
|---|---|
| Minimum number of nodes | 3 nodes |
| Minimum memory per node | 64 GB |
| Minimum cores per node | 24 physical cores |
| Minimum storage per node | 2 TB SSD/NVME |
| Minimum boot drive storage | 480 GB SSD/NVME |
| Network | Switchless and Switched supported (Switchless only for 3-node clusters) |

## Integration Requirements

| Area | Supported System | Use |
|---|---|---|
| Identity | ADFS on Windows Server 2022 | LDAP group membership + OIDC authentication for Azure Local portal |
| PKI | Private/Public PKI (ADCS validated) | Issue TLS certificates for ALDO endpoints |
| NTP (optional) | Local or Public time server | System clock synchronization |
| DNS | Any DNS server | Resolve ALDO endpoints and configure ingress IPs |

## Access Requirements

| Component | Access Required |
|---|---|
| AD + ADFS | Create service account with read access for OU (LDAP integration), export ADFS/OIDC config |
| DNS | Create DNS records/zones for ALDO endpoints |
| PKI | Create and export TLS certificates |
| Network | Firewall access for necessary port changes |

## Preview Participation Criteria
- Enterprise agreement with Microsoft (typically 3+ years)
- Valid business need for disconnected operation
- Meet all technical prerequisites
- Bring own validated Azure Local hardware (see Azure Local solutions catalog)

## External Reference
https://learn.microsoft.com/en-us/azure/azure-local/manage/disconnected-operations-overview
