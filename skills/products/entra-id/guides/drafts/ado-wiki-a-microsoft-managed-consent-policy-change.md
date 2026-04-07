---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/How to/User Consent Settings -  Let Microsoft Manage Your Consent Settings"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FHow%20to%2FUser%20Consent%20Settings%20-%20%20Let%20Microsoft%20Manage%20Your%20Consent%20Settings"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# User Consent Settings — Let Microsoft Manage Your Consent Settings

## Summary

Starting July 16, 2025, Microsoft deploys a new secure-by-default user consent policy (SFI initiative). The following 4 delegated permissions now require **admin consent** even when `AdminConsentRequired=false`:

- `Files.Read.All`
- `Files.ReadWrite.All`
- `Sites.Read.All`
- `Sites.ReadWrite.All`

Rollout affects tenants over a 2–4 week period from end of July 2025.

## Behavior Change

| Scenario | Before | After |
|---|---|---|
| Completely new app | Users could consent | Admin consent required for the 4 impacted permissions |
| Existing app — user already consented | Unaffected | Unaffected |
| Existing app — user has NOT consented | Users could consent | Admin consent required |

**Errors seen by users:**
- `AADSTS90094` — admin consent workflow is enabled ("Need admin approval")
- `AADSTS90095` — admin consent workflow is disabled ("Approval required")

For troubleshooting AADSTS90094/90095, see the [Dynamic Consent wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1377253).

## Opt-Out Options

1. Set user consent to **Low impact** in Entra admin portal
2. Set user consent to **Off** in Entra admin portal
3. Create a custom consent policy to fully revert changes

## Known Issue (August 18, 2025)

As a side effect of applying the new default consent policy, **some tenants with user consent turned OFF** may have had user consent accidentally enabled.

- **Symptom:** Users in a tenant with consent "Off" can consent to more than expected
- **Mitigation:** Deployed August 16–17, 2025
- **Escalation:** If still occurring, escalate with ICM [#669687504](https://portal.microsofticm.com/imp/v5/incidents/details/669687504/summary) and add the tenant to the ICM

> ⚠️ Do NOT proactively communicate this known issue to customers unless they open a case for this specific behavior.

## Support Boundary

Since impacted permissions relate to SharePoint/OneDrive, cases may initially be routed to those teams. However, since the root cause is consent policy behavior, ownership is **App Experience team** under **MSaaS AAD - Applications Premier** queue.

## Deep Dive Training

- [285120 - Upcoming Changes to Default Admin Consent Policies](https://aka.ms/AAx7s23) (55 min, self-paced)
