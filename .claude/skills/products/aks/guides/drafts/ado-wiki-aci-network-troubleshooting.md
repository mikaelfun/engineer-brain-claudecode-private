---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/TSG/ACI Network Troubleshooting Methodology"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/ACI%20Network%20Troubleshooting%20Methodology"
importDate: "2026-04-21"
type: guide-draft
---

# ACI Network Troubleshooting Methodology

## Scientific Method for ACI Network Issues

1. **Understand the issue**: Clarify customer verbatim, understand ACI Atlas networking stack (NRP, SNAT, Swift Networking, DNC)
2. **Collect facts**: Identify source/target IPs/FQDNs, exact timestamp in UTC, narrow to single caas deployment
3. **Identify affected areas**: Map findings to internal/external ACI components
4. **Develop hypothesis**: Before deep networking, consider if issue is ACI platform-side or customer app/config side
5. **Determine escalation**: If networking-specific, collaborate with Azure Networking POD
6. **Action plan**: Plan solution with potential side-effects identified
7. **Implement and test**: Apply fix and verify
8. **Document results**: Record findings for future reference

## Key Tools

| Tool | Purpose |
|------|---------|
| ASC | Network config (VNet, Subnet, Routes, SNAT, DNS) |
| ASI | Networking Tab, CNI Config |
| AppLens | Run network detectors |
| Kusto | Deep trace investigation |

## Important Notes

- ACI IPs may change; narrow timestamp and specific caas deployment to identify correct IP
- Atlas networking differs from regular Azure networking; understand the stack before troubleshooting
