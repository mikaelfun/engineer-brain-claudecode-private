---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Knowledge Management (KM)/Editing Public Docs_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FKnowledge%20Management%20%28KM%29%2FEditing%20Public%20Docs_Process"
importDate: "2026-04-06"
type: process-guide
---

# Editing Public Microsoft Documentation

## Summary

This wiki page covers the steps an engineer should follow when they discover a Microsoft blog, KB, MSDN, or TechNet article that contains incorrect, incomplete, or outdated information. These steps are for **PUBLIC** facing documents only.

**Note:** These steps do not apply to [community](https://community.office365.com) pages. For community pages, use the **Give feedback** option at the bottom of the reply the MSFT agent posted.

---

## 1. How to Update an Article in learn.microsoft.com

- Full guide: https://internal.evergreen.microsoft.com/help/4343051
- For articles in `learn.microsoft.com/troubleshoot` contents → follow Section 2 below.
- For articles **other than** 'troubleshoot' → directly submit fork and pull request on GitHub:
  https://learn.microsoft.com/en-us/contribute/content/how-to-write-quick-edits

---

## 2. Request a New or Update Existing Troubleshooting Article on LMC or SMC

1. Request membership of **CESKM-SupportContentContributors** group: https://coreidentity.microsoft.com/manage/Entitlement/entitlement/supportconte-5r35
   - FTE: auto-approved in ~15 minutes.
   - v- account: approval request goes to your manager.
   
2. Go to [Content Idea Portal](https://contentidea.microsoft.com/).

3. If first time, **read through the FAQs** (bottom of main page).

4. Select **Request a new or update existing troubleshooting article on LMC or SMC**.

5. Provide an appropriate title. Example: *The TechNet page XYZ needs to be edited/updated*.
   - **Priority**: Triage team meets Tuesdays and Thursdays at 4 PM ET. Critical priority = triaged the day of submission.

6. **Area**: Set to `ContentExperience\Commercial\Continuous Publishing`

7. **Iteration**: Set to `ContentExperience\FY2X` (replace FY2X appropriately).

8. Fill in:
   - Purpose of Request
   - Requested Content Type
   - Business Area (e.g., Azure Virtual Machines)
   - Content Topic
   - Primary Product
   - Support Topic
   - Requested Due Date
   - **Description**: Be as detailed as possible:
     - Provide concrete evidence your request is valid (PG signed off, tested, etc.)
     - Provide exact steps to reproduce the situation.
     - Provide screenshots where necessary.
     - Describe the impact this update will have for customers.

9. Save — floppy icon at top.

---

## Points of Contact

| Issue Type | Contact |
|-----------|---------|
| Critical KB requests | critkb@microsoft.com |
| Hotfix/CU KB articles | KB workflow management: kbwm@microsoft.com |
| External Commercial Content | CE&S KM: dcscontentpm@microsoft.com |
| External Consumer Content | ConsumerKMCPM@microsoft.com |
| Localization | cssloc@microsoft.com |
| Internal Content | internalckm@microsoft.com |
