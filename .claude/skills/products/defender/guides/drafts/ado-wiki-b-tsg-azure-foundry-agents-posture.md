---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for AI/[TSG] - Azure Foundry Agents - Posture"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20AI%2F%5BTSG%5D%20-%20Azure%20Foundry%20Agents%20-%20Posture"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [TSG] Azure AI Foundry Agents — Posture

**Prerequisite:** CSPM plan must be enabled on the subscription.

---

## New Recommendations

- Azure AI Agent should be configured with operational instructions
- Connected AI agents should be configured with instructions on how to invoke them
- Prompt shields should be enabled on model deployment used by AI Agents

## New Attack Paths

- Internet exposed APIs allows lateral movement to Azure AI Foundry project
- Internet exposed APIs allows lateral movement to Azure logic app used by AI agent
- Internet exposed APIs allows lateral movement to Azure search service used by AI agent
- Internet exposed APIs allows lateral movement to Critical Azure AI Foundry coordinator agent grounded with sensitive data
- Internet exposed APIs allows lateral movement to Azure AI Foundry coordinator agent
- Internet exposed container with high severity vulnerabilities allows lateral movement to Azure AI Foundry coordinator agent grounded with sensitive data

## Risk Factors (New Insights)

- **Coordinator AI Agent** — Main entry point agent coordinating with ≥3 other agents
- **Grounded With Sensitive Data** — Agent connected to a sensitive data source via tools

## Security Explorer New Nodes

1. **Coordinator AI Agent** — Agents acting as main entry point, coordinating ≥3 agents
2. **Grounded With Sensitive Data** — Agents connected to sensitive data sources via tools
3. **Used By AI Agents** — Agents, Search Services, and Logic Apps used as tools by AI agents

---

## TSG: Recommendations

### Recommendation still active after remediation

1. Verify that remediation steps were taken correctly.
2. Wait **24 hours** and check again.
3. If still active, create CRI:
   - [CRI Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j19221)
   - Include: screenshot of recommendation page, tenant ID, subscription ID, foundry account, foundry project, agent ID.

### Recommendation still active but resource was deleted

1. Wait **48 hours** and check again.
2. If still active, create CRI:
   - [CRI Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=j19221)
   - Include: screenshot of recommendation page, tenant ID, subscription ID, foundry account, foundry project, agent ID.

---

## TSG: Attack Paths

See: [MDC Attack Paths TSGs](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1409/-TSG-Attack-Paths)

## TSG: Security Explorer

See: [MDC Security Explorer TSGs](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/1410/-TSG-Cloud-Security-Explorer)
