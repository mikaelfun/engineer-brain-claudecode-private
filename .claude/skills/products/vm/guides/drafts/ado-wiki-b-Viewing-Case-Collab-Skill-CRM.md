---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Skill Based Assignment (SBA)/Viewing Case or Collab skill in CRM (VDM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Skill%20Based%20Assignment%20%28SBA%29/Viewing%20Case%20or%20Collab%20skill%20in%20CRM%20%28VDM%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Viewing Case or Collaboration Skill in CRM (VDM)

## Option 1 — VDM Power App (SBAManager) Website

1. Open [SBAManager](https://aka.ms/vdmcloud)
2. Use search box in center menu bar → enter case or collaboration number
3. Click on the case link under **Service Requests**
4. In the **General** section → bottom of right-side pane → find **Top Skill**

> Note: Multiple skills may be assigned; the one with highest confidence score is the Top Skill.

## Option 2 — SBAManager Bot

Type: `retrieve details about [case number]`

Bot returns current top skill information.
