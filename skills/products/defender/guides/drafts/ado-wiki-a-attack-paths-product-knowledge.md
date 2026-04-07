---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Attack Paths/[Product Knowledge] - Attack Paths"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Attack%20Paths/%5BProduct%20Knowledge%5D%20-%20Attack%20Paths"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [Product Knowledge] - Attack Paths

> AI-assisted content. This article was partially created with the help of AI.

## Summary
Attack path analysis is a graph-based algorithm that scans the cloud security graph to uncover exploitable paths attackers might use to breach your environment and access high-impact assets. Provides actionable recommendations to break and prevent breaches.

## Availability

| Aspect | Details |
|--------|---------|
| Prerequisites | - Agentless scanning, OR Defender for Server P1 (MDVM), OR Defender for Server P2 (MDVM + Qualys) <br/>- Defender for CSPM enabled <br/>- Defender for Containers + agents (for container-related attack paths) |
| Required Plans | **Defender CSPM** (CloudPosture) |
| Required Roles | Security Reader, Security Admin, Reader, Contributor, Owner |
| Clouds | Azure, AWS |

## Key Concepts
- Attack Paths highlight vulnerabilities that could lead to breaches, prioritizing the highest risk issues.
- Contextual factors considered: internet exposure, permissions, lateral movement.
- Related public docs: [How to Manage Attack Paths](https://learn.microsoft.com/en-us/azure/defender-for-cloud/how-to-manage-attack-path)

## Recent Updates
- **Refined Attack Path Experience** (Sept 15, 2025): Focus sharpened on external entry points and exploitable paths. Paths now only shown when entry point is **internet-exposed** and rated **High/Critical**.
  - [Blog post](https://techcommunity.microsoft.com/blog/securityexposuremanagement/refining-attack-paths-prioritizing-real-world-exploitable-threats/4454051)
