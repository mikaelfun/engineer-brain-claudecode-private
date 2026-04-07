---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Delivery Partners/Internal Processes/DP SEE Triage Series"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FDelivery%20Partners%2FInternal%20Processes%2FDP%20SEE%20Triage%20Series"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# DP-SEE Triage

This document outlines the draft process for conducting DP-SEE Triage sessions based on the extracted chat discussions. It includes key steps, roles, and best practices to ensure smooth and effective triage operations.

## Purpose

The DP-SEE Triage process aims to review and prioritize cases requiring attention, ensuring timely resolution and proper escalation. It facilitates collaboration between Delivery Partners (DPs), Support Escalation Engineers (SEEs), and PTAs.

## Roles and Responsibilities

**SEE (Support Escalation Engineer):** Reviews technical details, provides guidance, and ensures troubleshooting steps are followed.  
**DP (Delivery Partner):** Presents cases, ensures cases are uploaded to SharePoint, and participates in discussions.  
**PTA:** Oversees triage sessions, enforces process adherence, and assists with case prioritization.

## Key Steps in DP-SEE Triage

1. Access the [SharePoint list](https://microsofteur.sharepoint.com/teams/SCIMManagementToolsGlobalDPBusiness/Lists/DP%20%20SEE%20Triage/AllItems.aspx?viewid=3e768dba%2D6fc3%2D4472%2Dbd29%2D79c5afe9cd72) for DP-SEE Triage and filter cases marked as **Triage Needed**.
2. Sort cases by **Created** date from newest to oldest to maintain fairness.
3. Ensure the **RegionNeeded** column is filtered to display cases from your region.
4. Ensure only SMEs and TLs join the triage call. **FLEs should not participate** unless invited by the PTA for critical situations (e.g., CritSits).
5. Discuss each case thoroughly, confirm troubleshooting steps, and agree on next actions.
6. Update the **Current Status** field in SharePoint immediately after discussion (e.g., *Discussed*, *Escalation Needed*, *CO Missed Triage*).
7. Reinforce that cases must not be posted in chat; they must be uploaded to SharePoint.
8. Handle exceptions only for SevA cases or critical situations during EMEA shifts.

## Best Practices

- Maintain and keep up-to-date [Excel lists of SMEs and TLs](https://microsofteur-my.sharepoint.com/:x:/g/personal/lschinteie_microsoft_com/EXN2PjwbOaVDkUjJ86q_dEwBHGgwLAACj4p0GF6Z6CPZbQ?e=CLUMca) for each DP.
- Ensure proper filtering for EMEA cases during triage to avoid impacting APAC cases.
- Communicate schedule changes promptly and arrange backups as needed.
- Follow FIFO (First In, First Out) order for case discussion.
- Update SharePoint statuses accurately to reflect real-time progress.

## RACI Table for DP-SEE Triage

| Activity | PTA | SEE | DP | TL/SME | FLE |
|---------|-----|-----|-----|--------|-----|
| Maintain SharePoint case list | R | A | C | I | I |
| Filter cases for triage (EMEA/APAC rules) | R | A | C | I | I |
| Host daily triage call | A | R | C | I | I |
| Present cases during triage | I | C | R | I | I |
| Update case status post-triage | C | R | A | I | I |
| Ensure correct SME/TL participation | A | C | R | I | I |
| Escalation handling (SevA/CritSit) | C | R | A | I | I |

**Legend: R = Responsible | A = Accountable | C = Consulted | I = Informed**

## Triage Series Weekly Schedule

| Day | SEE 1 | SEE 2 | DP | PTA |
|-----|--------|--------|------|------|
| Monday | Samer Mustafa (SAM) | Ammar Tawabini | CNX, LTIM & WC | Abudayyeh |
| Tuesday | Brett Lock | Paulo Silva | CNX, LTIM & WC | Aakanksha Sharma |
| Wednesday | Mahmoud Amer | Shimbesh Singh Sengar | CNX, LTIM & WC | Nuno Furtado Oliveira |
| Thursday | Mohamed Elwan | Khalid Hussein | CNX, LTIM & WC | Ahmed Moharram |
| Friday | Dorin Mardari | Cristian Marin | CNX, LTIM & WC | Larisa |
