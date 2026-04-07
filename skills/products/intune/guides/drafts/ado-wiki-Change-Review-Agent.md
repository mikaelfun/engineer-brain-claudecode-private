---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Copilot In Intune/Change Review Agent"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FCopilot%20In%20Intune%2FChange%20Review%20Agent"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Change Review Agent

## Overview
**Goal:** Analyze existing configurations, assignments, device states, and organizational data to provide approval recommendations.

**Why:** Anticipate the impact of actions through MAA workflows (e.g., script deployments and deletion) before execution to prevent errors and disruptions.

**What it does:** Uses multiple data points to identify the risk associated with a specific change that a customer is attempting to implement.

**Current scope:** Changes related to scripts deployed via Intune. Agent runs are triggered manually, can only do up to 10 requests per run max.

**Out of scope:** Changes related to things other than scripts.

## RBAC Requirements
- Intune/Device configurations / read
- Intune/Audit log / read
- Intune/Managed devices / read
- DefenderXDR/vulnerability management / read
- Entra/Identity risky user / read

## Expected Evaluation Factors
- MAA Request History (Intune)
- Business Justification (Intune)
- Script Purpose (Defender)
- Script Reputation (Defender TI)
- Alert History (Defender)
- User risk profile (Entra)

## Troubleshooting
Track agent activity and troubleshoot issues using the available Agent logs. All agent management actions (create, delete, run) and any permission failures are available in Security Copilot logs.

All agents in Intune follow the Security Copilot troubleshooting guidance.

### Common Failures
1. **RAI check Azure OpenAI content filtering:** Error "Security Copilot doesn't currently support that type of request" — Azure RAI doesn't allow a certain type of upload, causing Security Copilot issues.
2. **No permissions on validation factor:** "No details available for this factor. Agent couldn't retrieve any supporting data" — Missing RBAC permissions on the factor being evaluated.
