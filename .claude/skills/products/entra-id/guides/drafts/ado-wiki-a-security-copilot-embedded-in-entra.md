---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Security Copilot Embedded in Entra/Security Copilot Embedded in Entra"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FSecurity%20Copilot%20Embedded%20in%20Entra%2FSecurity%20Copilot%20Embedded%20in%20Entra"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Security Copilot Embedded in Entra - TSG

## Summary

Microsoft Copilot for Security (CfS) is a cloud-based tool integrated into the Entra Admin Center. It requires a Security Copilot subscription with Security Consumption Units (SCUs).

### Timeline
- **March 2024**: Risky User summaries (auto-generated, no prompts)
- **November 2024**: Global Copilot button in Entra Admin Center for CfS subscribers (sign-in logs, audit logs, user/group details)
- **December 2024**: Public preview of Application Risk
- **January 2025**: Custom prompts for Lifecycle Workflows and User Risk; answers from MS public docs

## How Prompt Handling Works

- **Entra Admin Center (GA)**: Prompts handled directly by NL2MS Graph skill, skipping Security Copilot orchestrator. Identity team supports all prompts from Entra portal.
- **Security Copilot standalone portal** (securitycopilot.microsoft.com): Prompts go through orchestrator which selects appropriate skill. If orchestrator selects incorrectly, Security Copilot team handles. Once Entra skill selected, Entra support takes over.

## Enhanced Data Exploration (Preview)

When a response to a simple prompt contains 10+ data points, users see an "Open list" button to view full results in a grid. Uses fewer SCUs (LLM only used once). Each result includes the Graph API Method and URL used.

### Known Limitations (Public Preview)
- Multi-step queries not supported (returns text summary instead of explorer view)
- Topic history tabs not maintained across sessions (targeting CY26Q1)
- AI may wrongly return Explorer view for responses with fewer than 10 items (fix targeting CY26Q1)

## Key Differentiation

**Azure Copilot** (portal.azure.com) is a separate, free offering. It does NOT integrate with Entra. Entra-related prompts must use the Entra Admin Center or Security Copilot standalone portal.

## Behavior Notes
- Copilot is non-deterministic: same prompt may return different results each time (expected)
- Users should rate responses via thumbs up/down icons with reference links

## How NL2API Works

NL2API is a backend capability that translates natural language prompts into Microsoft Graph API calls. It:
1. Receives user prompt
2. Translates to Graph API call
3. Executes against tenant data in user's security context
4. Returns formatted results

## Troubleshooting Workflow

1. **Verify subscription**: Tenant needs active Security Copilot subscription with SCUs
2. **Check permissions**: User needs appropriate Entra admin role for the scenario
3. **Identify portal**: Ensure user is in Entra Admin Center (not Azure Copilot)
4. **Check supported scenarios**: See Supported Scenarios page for role/license requirements per feature
5. **Review prompt**: Ensure prompt matches supported patterns for the scenario
6. **Check feedback**: If results are poor, encourage thumbs down + feedback submission
