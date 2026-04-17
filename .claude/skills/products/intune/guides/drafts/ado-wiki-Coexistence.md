---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/SAW Actions/Coexistence"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FSAW%20Actions%2FCoexistence"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Enabling Coexistence on a tenant

**Requires Global Administrator approval.**

## When to use
When a customer wants to implement coexistence (Basic Mobility and Security + Intune management for different users) but is having trouble.

Reference: [Public Doc](https://docs.microsoft.com/en-us/mem/intune/fundamentals/mdm-authority-set#coexistence)

## Prerequisites
Have the customer try the methods in [KB3091043](https://internal.evergreen.microsoft.com/en-us/help/3091043) first.

## Process
1. Validate tenant does not have the flighting tag (MIFOIntuneAccounts)
2. Get approval from listed Global Administrator
3. Add case note with template:
   - MDM Coexistence request
   - Tenant ID, ContextID, ASU
   - GA confirmation
4. Send ICM/IET escalation using [Request a "SAW Task"](https://aka.ms/sawgeneral) template
