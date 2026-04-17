---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Reporting/Adoption Score & Usage"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FReporting%2FAdoption%20Score%20%26%20Usage"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.comm-M365ID
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]


# Adoption Score and Usage



<strong>Adoption Score</strong><br>

Adoption score (formerly known as Productivity Score) helps organizations to understand how they are using Microsoft 365 by providing:<br>
- Metrics  see where you are on your digital transformation journey<br>
- Insights  identity opportunities to improve productivity<br>
- Recommended actions  help your organization to use Microsoft 365 products efficiently<br>

Adoption Score includes data from Exchange, SharePoint, OneDrive, Teams, Word, Excel, PowerPoint, OneNote, Outlook, Yammer, and Skype.<br>
Your organization's score is updated daily and reflects user actions completed in the last 28 (including the current day).<br>
You can learn more about this feature by accessing this official article:<br> 
[Microsoft Adoption Score - Microsoft 365 admin](https://learn.microsoft.com/en-gb/microsoft-365/admin/adoption/adoption-score?view=o365-worldwide)<br>

We also have some other resources which can help you to understand this product even better:<br>
- The definitive guide of Adoption Score  this post is from 2020 and was written by former Program Manager. However, since we dont have much information about the feature, some answers to customers questions can be found in it<br>
[The definitive guide to Productivity Score - Microsoft Tech Community](https://techcommunity.microsoft.com/t5/microsoft-365/the-definitive-guide-to-productivity-score/m-p/1699414)<br>

- How Microsoft Adoption Score can help you build a more resilient business  posted in 2020 by the same former PM<br>
[How Microsoft Adoption Score can help you build a more resilient business - Microsoft Tech Community](https://techcommunity.microsoft.com/t5/microsoft-365-blog/how-microsoft-adoption-score-can-help-you-build-a-more-resilient/ba-p/1696726)<br>
<br>

<strong>Usage reports</strong><br>

Microsoft 365 usage reports show how people in your business are using Microsoft 365 services. Reports are available for the last 7 days, 30 days, 90 days, and 180 days. Data won't exist for all reporting periods right away. The reports become available within 48 hours.<br>

Learn more about Usage reports here :<br> 
[Microsoft 365 admin center activity reports](https://learn.microsoft.com/en-GB/microsoft-365/admin/activity-reports/activity-reports?WT.mc_id=365AdminCSH_inproduct&view=o365-worldwide)<br>

Administrators have the possibility to obtain the same information about usage through Microsoft 365 usage analytics. Microsoft 365 usage analytics provides a dashboard in Power BI that offers insights into how users adopt and use Microsoft 365. <br>

They can also use the Power BI desktop to further customize their reports by connecting them to other data sources.<br>
NB: this topic is not handled by M365 Identity team. If needed, an assistance request needs to be opened to PowerBI team.<br>

# AI adoption category in Adoption Score
The AI adoption score represents the extent to which users in your organization have made Microsoft 365 Copilot a daily habit. A score of 100 means that all licensed Microsoft 365 Copilot users in your organization are using Copilot features for an average of at least three days per week (or 12 out of the past 28 days). Users that reach this three-day threshold in a given month are highly likely to become long-term engaged users of Microsoft 365 Copilot.

Public Documentation:  [AI adoption category in Adoption Score](https://learn.microsoft.com/en-us/microsoft-365/admin/adoption/ai-adoption-score?view=o365-worldwide)

## Escalation
<div style="border: 5px solid #ec394e; padding: 12px; background-color: transparent">
<span style="color:#ec394e;font-weight:700;font-size:16px">NOTE</span>

- Prior to escalating to "Customer Insight and Analysis - Customer Escalations" please run the [Telemetry Investigation Logging Tool (TILT)](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1985656) and gather those logs from the customer to be shared in the ICM.
- Please use the [ICM Submission Process](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/589927) and select the following ASC escalation template:<br><br>
**[ID] [M365] [MAC]** - Customer Insights and Analysis
</div>
</br>
<div style="border: 5px solid #b3932a; padding: 12px; background-color: transparent">

<span style="color:#b3932a;font-weight:700;font-size:16px">IMPORTANT</span>

### **Information and Data required for all escalations**

It is a prerequisite to fill out all fields to properly triage the ticket. If all fields are not complete the escalation will be rejected. Please provide this information in the Issue Description when submitting the request through Assist 365

**Case and tenant Details:**
- TA Reviewer: [Alias]  
- SR#: [Number]  
- TenantID: [Tenant ID] 
- Data share (DTM): [Link] 

**Where is the problem?**
-   Portal/Entry point being used?
    -   M365 Admin center
    -   Teams admin center
    -   API endpoints
    -   Other

-   Report that is being consumed
    -   Customer facing usage report
    -   Adoption Score report

**Categorize the problem: <span style="color:#b3932a;font-weight:700;font-size:16px">(Once the ICM is submitted please tag  the ICM with the applicable category)</span>**

-   Categories: 
    - **RFC** (Request for comment - questions about features, how to use certain reports, etc.)
        - Is this not covered properly in wiki or public documentation?
          -   [Usage Report](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/activity-reports?view=o365-worldwide)
          -   [AI adoption score](https://learn.microsoft.com/en-us/microsoft-365/admin/adoption/ai-adoption-score?view=o365-worldwide)
          -   [Teams usage report](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-user-activity-preview?view=o365-worldwide)
    - **Issue** (inaccurate data, missing data, etc.)
      - We need to understand the customer expectations and how it differs from what are they seeing.
    - **DCR** (Design Change Request)
      - If this is a change request the customer must provide a business justification.


**Other Information needed:**
-   Time Period
-   Screenshot of the metrics that have problems
-   Repro steps (video or instructions)
</div>



