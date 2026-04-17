---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Readiness Tools"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Readiness%20Tools"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# SCIM Management Solutions Readiness Tools

## What Are the Readiness Tools?

Created for the SCIM Management Solutions Readiness Team. Includes two tools:

### Readiness Tool — https://aka.ms/scim-mgmtsupready

| Area | Access | Description |
|---|---|---|
| Cloud Academy Library (CAL) | Restricted to Specific Users | Weekly export of Cloud Academy Library for tracking training content metadata |
| Learning Bytes (LB) | Restricted to Specific Users | Small training modules developed by peers. [Learn more](http://aka.ms/scim-LearningBytes) |
| Search Training Catalog | **Open to All Users** | Search for training content by SAP L3 & L4, SME Areas, and Keywords. Includes select SharePoint Stream content. |

### Feedback Tool
Allows SCIM staff to submit feedback on training content (broken links, outdated material). Links with pre-defined parameters found in some trainings and within the Readiness Tool.

---

## Access to Tools

### General App Access
Power Apps are open to all Microsoft FTE/Non-FTE but data access requires SCIM Management Security group membership.

**Required Security Groups:**
- [SCIMMgmtDPExt](https://idweb.microsoft.com/IdentityManagement/aspx/groups/MyGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2Fcustomized%2FPopupCustomizedObject.aspx%3Ftype%3DGroup%26id%3D5fd212ef-9275-43c6-8d89-b3bc54a70265)
- [SCIMMgmtFTEAll](https://idweb.microsoft.com/IdentityManagement/aspx/groups/MyGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2Fcustomized%2FPopupCustomizedObject.aspx%3Ftype%3DGroup%26id%3De994e622-11af-48dd-8702-b7ec639771dd)
- [TGPMEMMentors](https://idweb.microsoft.com/IdentityManagement/aspx/groups/MyGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2Fcustomized%2FPopupCustomizedObject.aspx%3Ftype%3DGroup%26id%3D853a04b6-1620-46f9-84b6-c0b2a596044b)
- [User - SCIM Readiness Environment](https://idweb.microsoft.com/IdentityManagement/aspx/groups/MyGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2FGroups%2FEditGroup.aspx%3Fid%3D865ab1d6-5e48-4f39-a90a-2b41930f69b3)

For access: reach out to your manager for the first 2 SGs. The 3rd/4th have restricted membership.

### Mentor / SME / Trainer / M1 Access
Must be a **direct member** (not via sub-SG) of:
- [IET](https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=iet&popupFromClipboard=%2Fidentitymanagement%2Faspx%2FGroups%2FEditGroup.aspx%3Fid%3D842f6acc-a219-4459-9b7d-7a13f8b43584)
- [TGPMEMMentors](https://idweb.microsoft.com/IdentityManagement/aspx/groups/MyGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2Fcustomized%2FPopupCustomizedObject.aspx%3Ftype%3DGroup%26id%3D853a04b6-1620-46f9-84b6-c0b2a596044b)
- [Mentor - SCIM Readiness Environment](https://idweb.microsoft.com/IdentityManagement/aspx/groups/MyGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2FGroups%2FEditGroup.aspx%3Fid%3D38c5ba3d-d6d9-4dfc-810f-5dece62c1cba)

All 3 SGs have limited membership approvals.

---

## FAQs / Troubleshooting

### Q: I can access the tool, but I cannot view any data — tool is blank
**A:** Data is restricted to Security Groups. Review "Access to Tools" above to request access. The Readiness Team does not own those SGs and cannot grant you access directly.

### Q: "Oops! Page Not Found" (404) when opening a Cloud Academy training
**A:** This is a misleading error — it actually means you are **not logged in** to Cloud Academy (not a true 404). Below the error text, click **"Go back to login"** and log in. The page will auto-redirect to the correct training.

### Q: Videos don't play in the Search Content page
**A:** You may need to log into the SharePoint site hosting the Stream content.
- Option 1: Log into [Intune SP site](https://microsoft.sharepoint.com/teams/LearnCSSintune), then reload the tool and retry.
- Option 2: Click **"Copy Video URL"** below the title and paste it into a new browser tab.

### Q: I want to make a Learning Byte — how do I get access?
**A:** Access is limited to FTEs who are SMEs, Trainers, or TGP Mentors. [Learn more about Learning Bytes](http://aka.ms/scim-LearningBytes).

---

## Help Documentation

- PowerPoint Help File: https://aka.ms/SCIM-MGMTSupReady-Help (also accessible from "View Tool Documentation" on the tool home screen)
- Demo/questions: email [MGMTREADY](mailto:mgmtready@microsoft.com?subject=Readiness%20Tool%20Wiki%20Help)
- Bugs/data issues: same email alias

---

## Change Log
Version/change log tracked since initial release; latest changes visible in the Readiness Tool home screen (page icon next to "View Tool Documentation" button, bottom left corner). Covers app changes and Cloud Academy data updates since January 1, 2025.
