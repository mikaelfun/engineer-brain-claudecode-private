---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Skill Based Assignment (SBA)/Adding Skills Based Views"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/Processes/Skill%20Based%20Assignment%20%28SBA%29/Adding%20Skills%20Based%20Views"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Adding Skills Based Views in Case Buddy

## Prerequisites

Must use the **Alpha version** of Case Buddy: [Case Buddy Alpha](https://aka.ms/casebuddy)

Check version in top-left corner — must show "**Alpha**".

## Adding Columns to Queue View

In Case Buddy Column Chooser:
1. Type `VDM Skill` in "Find Column" → click `>>` to add
2. Repeat for `VDM Skill Group`
3. Use Up/Down arrows to position columns
4. Click **Save and Close**

If data doesn't appear after refresh → close and reopen Case Buddy.

## Adding Fields to Case Editor

1. Click **Case Work** → **Tools** → **Options**
2. Click **Display** tab → check **Show VDM Skill/Group in Case Editor** → Apply → OK
3. VDM Skill/Group will appear under **SAP Category** in Case Editor

## Notes

- **Stability**: Feature is still new; report issues via `?` in Case Buddy
- **Collaboration Cases**: VDM Skill/Group fields do not populate by default for Collab cases — click **Collect Collab Information** button on main screen to pull the data
