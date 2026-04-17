---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Workload Protections/Defender for Servers/[Deprecated] - Qualys VA/Qualys deprecation and retirement"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FWorkload%20Protections%2FDefender%20for%20Servers%2F%5BDeprecated%5D%20-%20Qualys%20VA%2FQualys%20deprecation%20and%20retirement"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Qualys VA Deprecation and Retirement

> ⚠️ Qualys built-in VA (Gray Label) is deprecated and retired. Replacement: **Defender Vulnerability Management (MDVM)**.

## Key Resources

- **Blog post:** [Defender for Cloud unified Vulnerability Assessment powered by Defender Vulnerability Management](https://techcommunity.microsoft.com/t5/microsoft-defender-for-cloud/defender-for-cloud-unified-vulnerability-assessment-powered-by/ba-p/3990112)

## What Replaced Qualys VA

Defender for Cloud now uses **Microsoft Defender Vulnerability Management (MDVM)** as the integrated VA solution:
- Agent-based: via MDE extension (`MDE.Windows` / `MDE.Linux`)
- Agentless: via Defender for Servers agentless scanning

## Migration Guidance

For containers: Migrate to container VA powered by MDVM.

For servers: 
- Enable Defender for Servers Plan 2
- Enable MDE integration for agent-based scanning
- OR enable agentless scanning in Defender CSPM/Defender for Servers Plan 2
