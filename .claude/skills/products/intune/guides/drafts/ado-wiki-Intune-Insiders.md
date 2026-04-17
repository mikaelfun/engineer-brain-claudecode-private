---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/SAW Actions/Intune Insiders"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FSAW%20Actions%2FIntune%20Insiders"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Setting up a customer on Intune Canary Program

**Requires Global Administrator approval.**

## When to use
Customer requests access to Intune Canary program (pre-release Intune sprint releases, 2-3 weeks ahead of production on MSUA0602).

## Process
1. All Canary customers handled by Intune Premier Support Team (route via VKB 4488877 if in Broad Commercial)
2. Check Intune Canary Offer Code spreadsheet for customer eligibility
3. Send offer URL link to customer (in-private browser required)
4. Customer creates Canary tenant, provides domain and admin email
5. Create internal note with: Customer Name, Tenant Domain, Context ID, AccountID, AMSUID, ServiceInstanceName, Admin Email List
6. Submit ICM/IET escalation via aka.ms/sawgeneral template
7. Notify customer when tenant is ready with setup instructions

## Eligibility
- Must have valid EA agreement
- Non-production use only
- Max 100 seats
- No SLA, no premier support for the service
- US only (currently)
- Can be discontinued at any time

## Existing tenant conversion
If customer wants to use existing tenant, Intune subscriptions must be de-provisioned first. Contact intunecanaryadmin@microsoft.com.
