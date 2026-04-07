---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/DP Processes Guidelines and others/Identity volume offload guidelines (from FTE to DP and vice-versa)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDP%20Processes%20Guidelines%20and%20others%2FIdentity%20volume%20offload%20guidelines%20(from%20FTE%20to%20DP%20and%20vice-versa)"
importDate: "2026-04-06"
type: process-guide
---

# Identity Volume Offload Guidelines (FTE to DP and vice-versa)

## FAQ

**What should I do with a case after decreasing severity from A to B?**
Continue working the case towards resolution. If the customer wants a different region and the SAP is supported by DPs, you may auto-route. Cases must not be moved simply due to a change in Severity.

**What is the DP approach for severity changed from B to A?**
- Pending in queue: Auto-route to Delivery team
- Already assigned, CO Unavailable: Auto-route to Delivery team
- Already assigned, CO Available: DP Engineers continue working. If troubleshooting needed outside working hours, auto-route. For major customer impact, may auto-route immediately with PTA approval note.

**What should I do if the customer has selected the incorrect SAP?**
- In queue: Perform queue sweeping, correct SAP and auto-route if clearly misrouted and supported by DPs. If unclear, contact customer first.
- Case owned: If still under team scope, continue working. Do NOT immediately send to DPs.

**How are DPs managing cases with incorrect SAP?**
Similar approach. DP Engineers will meet SLA (if expiration < 30 min) before auto-routing. All DP-to-Delivery routes need a case note confirming PTA approval.

**Can we use manual route for faster queue selection?**
No. Always use Auto-Route based on the correct SAP. Manual Routing is actively tracked and not permitted.

**What is the approach for customer escalation with DPs?**
Follow existing escalation process: local SMEs, PTAs, collaborations, Ava posts, and ICMs.

## DP Queue Names for Enterprise Volumes

- MSaaS AAD - Prem Auth MT
- MSaaS AAD - Prem Mgmt MT
- MSaaS AAD - Prem Mgmt WS
- MSaaS AAD - Authentication Enterprise WS

## PTA Contacts

- Account Management EMEA: emeaacctpta@microsoft.com
- AAD Sync EMEA: emeasyncpta@microsoft.com
- NOAM PTAs: noamazidentityptas@microsoft.com
- APAC PTAs: indazureidtatm@microsoft.com
- Authentication Global PTAs: aadauthptas@microsoft.com
