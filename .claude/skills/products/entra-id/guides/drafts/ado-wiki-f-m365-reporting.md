---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Reporting/Microsoft 365 Reporting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FReporting%2FMicrosoft%20365%20Reporting"
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
   
Saturday, March 16, 2024 [Peter Fang]


[[_TOC_]]

---


## Overview
We can easily see how people in your business are using Microsoft 365 services. For example, you can identify who is using a service a lot and reaching quotas, or who may not need a Microsoft 365 license at all. Perpetual license model won't be included in the reports.

Reports are available for the last 7 days, 30 days, 90 days, and 180 days. Data won't exist for all reporting periods right away. The reports typically become available within 48 hours, but might sometimes take several days to become available.

**How to get to the Reports dashboard**

1. In the admin center, go to the **Reports > Usage** page.
2. Select the View more button from the at-a-glance activity card for a service (such as email or OneDrive) to see the report detail page. On that page, different reports for the service are provided in tabs.

![Reports Dashboard](../../../.attachments/M365-Identity/M365-Admin-Portal/M365-Reporting/ReportsDashboard.png)

**Who can see reports**

People who have the following permissions:

- Global admins: We recommend that only a few people in your company have this role. It reduces the risk to your business.

- Exchange admins

- SharePoint admins

- Skype for Business admins

- Global reader (with no user details)

- Usage Summary Reports reader (with no user details)

- Reports reader

- Teams Administrator

- Teams Communications Administrator

- User Experience Success Manager (with no user details)


**Which activity reports are available in the admin center**

Depending on your subscription, here are the available reports in all environments.

| Report | Public | GCC | GCC-High | DoD | Microsoft 365 operated by 21Vianet |
|--------|--------|-----|----------|-----|-----------------------------------|
| [Active Users](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/active-users-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [Microsoft browser usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/browser-usage-report?view=o365-worldwide) | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>1</sup> |
| [Microsoft 365 Copilot readiness](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-readiness?view=o365-worldwide) | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Microsoft 365 Copilot usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-usage?view=o365-worldwide) | Yes | Yes | N/A<sup>1</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Microsoft 365 Copilot Agent usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-agents?view=o365-worldwide) | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Microsoft 365 Copilot Chat usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-copilot-usage?view=o365-worldwide) | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Microsoft 365 Copilot credits](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-credits?view=o365-worldwide) | Yes | N/A | N/A | N/A | N/A |
| [Microsoft Copilot Search usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-search-usage?view=o365-worldwide) | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>2</sup> |
| [Email activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/email-activity-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [Email apps usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/email-apps-usage-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [Mailbox usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/mailbox-usage?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [Microsoft 365 groups](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/office-365-groups-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [Microsoft 365 Apps usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft365-apps-usage-ww?view=o365-worldwide) | Yes | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | Yes |
| [Office activations](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-office-activations-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [OneDrive for Business user activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/onedrive-for-business-activity-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [OneDrive for Business usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/onedrive-for-business-usage-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [SharePoint site usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/sharepoint-site-usage-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [SharePoint activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/sharepoint-activity-ww?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [SharePoint storage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/sharepoint-storage-reports?view=o365-worldwide) | Yes | Yes | Yes | Yes | Yes |
| [Microsoft Teams user activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-user-activity-preview?view=o365-worldwide) | Yes | Yes | Yes | Yes | N/A<sup>1</sup> 
| [Microsoft Teams device usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-device-usage-preview?view=o365-worldwide) | Yes | Yes | Yes | Yes | N/A<sup>1</sup> |
| [Microsoft Teams team activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-usage-activity?view=o365-worldwide) | Yes | Yes | Yes | Yes | N/A<sup>1</sup> |
| [Viva Engage activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-engage-activity-report-ww?view=o365-worldwide) | Yes | Yes | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Viva Engage device usage](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-engage-device-usage-report-ww?view=o365-worldwide) | Yes | Yes | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Viva Engage groups activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-engage-groups-activity-report-ww?view=o365-worldwide) | Yes | Yes | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Forms activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/forms-activity-ww?view=o365-worldwide) | Yes | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>1</sup> |
| [Dynamics 365 Customer Voice activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/forms-pro-activity-ww?view=o365-worldwide) | Yes | Yes | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Skype for Business Online activity](https://learn.microsoft.com/en-us/SkypeForBusiness/skype-for-business-online-reporting/activity-report) | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Skype for Business Online conference organized activity](https://learn.microsoft.com/en-us/SkypeForBusiness/skype-for-business-online-reporting/conference-organizer-activity-report) | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Skype for Business Online conference participant activity](https://learn.microsoft.com/en-us/SkypeForBusiness/skype-for-business-online-reporting/conference-participant-activity-report) | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Skype for Business Online peer-to-peer activity](https://learn.microsoft.com/en-us/SkypeForBusiness/skype-for-business-online-reporting/peer-to-peer-activity-report) | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Viva Learning activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-learning-activity?view=o365-worldwide) | Yes | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |
| [Viva Insights activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-insights-activity?view=o365-worldwide) | Yes | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>2</sup> |
| [Project activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/project-activity?view=o365-worldwide) | Yes | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>2</sup> |
| [Visio activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/visio-activity?view=o365-worldwide) | Yes | Yes | N/A<sup>1</sup> | N/A<sup>1</sup> | N/A<sup>2</sup> |
| [Viva Goals activity](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-goals-activity?view=o365-worldwide) | Yes | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> | N/A<sup>2</sup> |

N/A<sup>1</sup>: The report is planned to be released in the future. The <a href="https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=" target="_blank">Microsoft 365 Roadmap</a> will be updated before the release.

N/A<sup>2</sup>: The service isn't available in the environment; hence, there's no plan to release the report.


**How to view usage information for a specific user**

Use the service reports to research how much a specific user is using the service. For example, to find out how much mailbox storage a specific user has consumed, open the Mailbox usage report, and sort the users by name. If you have thousands of users, export the report to Excel so you filter through the list quickly.

You can't generate a report where you enter a user's account and then get a list of which services they're using and how much.

There are circumstances where new users show up as unknown. This is usually due to occasional delays in creating user profiles.

**Show user details in the reports**

By default, user details will be hidden for all reports.

Your user list will look like this:

![User Details in Reports](../../../.attachments/M365-Identity/M365-Admin-Portal/M365-Reporting/ShowUserDetailsInReports.png)

If you want to unhide user-level information when you're generating your reports, a global administrator can quickly make that change in the admin center.

Reports provide information about your organization's usage data. By default, reports display information with identifiable names for users, groups, and sites. Starting September 1, 2021, we're hiding user information by default for all reports as part of our ongoing commitment to help companies support their local privacy laws.

Global administrators can revert this change for their tenant and show identifiable user information if their organization's privacy practices allow it. It can be achieved in the Microsoft 365 admin center by following these steps:

1. In the admin center, go to the Settings > Org Settings > Services page.

2. Select Reports.

3. Uncheck the statement Display concealed user, group, and site names in all reports, and then save your changes.

Beginning on June 23, 2022, an API will gradually become available to all environments for global admins to change this setting without needing to visit the Microsoft 365 admin center. The API details are below:

The URL is https://graph.microsoft.com/beta/admin/reportSettings

Two methods have been approved for this API:

![Graph API Reporting](../../../.attachments/M365-Identity/M365-Admin-Portal/M365-Reporting/GraphApiReports.png)

**What happens to usage data when a user account is deleted?**
Whenever you delete a user's account, Microsoft will delete that user's usage data within 30 days. Deleted users will still be included in the Activity chart totals for the periods they were active in, but will not appear in the User Details table.

However, when you select a particular day, up to 28 days from the current date, the report show the user's usage for that day in the User Details table.


## Active Users report

The Microsoft 365 Reports dashboard shows you the activity overview across the products in your organization. It enables you to drill in to individual product level reports to give you more granular insight about the activities within each product. Check out the Reports overview topic.

For example, you can use the Active Users report to find out how many product licenses are being used by individuals in your organization, and drill down for information about which users are using what products. This report can help administrators identify underutilized products or users that might need additional training or information.

**How to get to the Active Users report**

1. In the admin center, go to the **Reports > Usage** page.
2. From the dashboard homepage, click on the **View more** button on the Active users - Microsoft 365 Services card.

**Interpret the Active Users report**

You can view active users in the Office 365 report by choosing the Active users tab.

![Interpret the Active Users report](../../../.attachments/M365-Identity/M365-Admin-Portal/M365-Reporting/InterpretActiveUsersReport.png)

The **Active Users** report can be viewed for trends over the last 7 days, 30 days, 90 days, or 180 days. However, if you view a particular day in the report, the table will show data for up to 28 days from the current date (not the date the report was generated). The data in each report usually covers up to the last 24 to 48 hours.

The **Users** chart shows you daily active users in the reporting period separated by product.

The **Activity** chart shows you daily activity count in the reporting period separated by product.

The **Services** chart shows you count of users by activity type and Service.

On the Users chart, the x axis shows the selected reporting time period and the y axis displays the daily active users separated and color coded by license type. On the Activity chart, the x axis shows the selected reporting time period and the y axis displays the daily activity count separated and color coded by license type. On the Services activity chart, the X axis displays the individual services your users are enabled for in the given time period and the Y axis is the Count of users by activity status, color coded by activity status.

You can filter the series you see on the chart by selecting an item in the legend. Changing this selection doesn't change the info in the grid table.

You can also export the report data into an Excel .csv file, by selecting the Export link. This exports data of all users and enables you to do simple sorting and filtering for further analysis.

You can change what information is displayed in the grid table with column controls.

If your subscription is operated by 21Vianet, then you will not see Viva Engage.

If your organization's policies prevents you from viewing reports where user information is identifiable, you can change the privacy setting for all these reports. Check out the How do I hide user level details? section in Activity Reports in the Microsoft 365 admin center.

The table shows you a breakdown of the user activities at the per-user level.

![user activities](../../../.attachments/M365-Identity/M365-Admin-Portal/M365-Reporting/UserActivities.png)

## Microsoft browser usage report


The **Microsoft Browser Usage report** in the Microsoft 365 Admin Center lets you see if users access Microsoft 365 online services via Microsoft Edge. This report insight can help you migrate your organization to Microsoft Edge. Usage reporting is based on an aggregate count of users in your organization that sign in to their Microsoft 365 account and use the Microsoft Edge browser to access Microsoft 365 services.


**Interpret the Microsoft browser usage report**

![Microsoft browser usage report](../../../.attachments/M365-Identity/M365-Admin-Portal/M365-Reporting/MsftBrowserUsageReport.png)

The Microsoft browser usage report can be viewed for trends over the last 7 days, 30 days, 90 days, or 180 days.

The Daily active users chart shows you the daily user count for Microsoft Edge when used to access to Microsoft 365 services.

The Active Users chart shows you the total number of users accessing Microsoft 365 services while using Microsoft Edge over the selected time period.

The report is internal to your organization with permissions limited to IT admins with existing access to the activity reports on the usage dashboard in the Microsoft 365 Admin Center.

![Microsoft browser usage report 2](../../../.attachments/M365-Identity/M365-Admin-Portal/M365-Reporting/MsftBrowserUsageReport2.png)

Select the **Choose columns** icon to add or remove columns from the report.

You can also export the report data into an Excel .csv file by selecting the Export link. This exports data for all users and enables you to do simple aggregation, sorting, and filtering for further analysis.


## Dynamics 365 Customer Voice activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/forms-pro-activity-ww?view=o365-worldwide

## Email activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/email-activity-ww?view=o365-worldwide

## Email apps usage report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/email-apps-usage-ww?view=o365-worldwide

## Forms activity report 
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/forms-activity-ww?view=o365-worldwide

## Mailbox usage report 
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/mailbox-usage?view=o365-worldwide

## Office activations report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-office-activations-ww?view=o365-worldwide

## Teams apps usage reports
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-apps-usage?view=o365-worldwide

## Teams device usage report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-device-usage-preview?view=o365-worldwide

## Teams usage activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-usage-activity?view=o365-worldwide

## Teams user activity report 
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-teams-user-activity-preview?view=o365-worldwide

## Microsoft 365 Apps usage report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft365-apps-usage-ww?view=o365-worldwide

## M365 Copilot usage report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-usage?view=o365-worldwide

## Microsoft 365 groups report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/office-365-groups-ww?view=o365-worldwide


## OneDrive activity report 
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/onedrive-for-business-activity-ww?view=o365-worldwide

## OneDrive usage report 
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/onedrive-for-business-usage-ww?view=o365-worldwide

## Project activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/project-activity?view=o365-worldwide

## SharePoint activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/sharepoint-activity-ww?view=o365-worldwide

## SharePoint site usage report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/sharepoint-site-usage-ww?view=o365-worldwide

## Visio activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/visio-activity?view=o365-worldwide

## Viva Goals activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-goals-activity?view=o365-worldwide

## Viva Insights activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-insights-activity?view=o365-worldwide

## Viva Learning activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-learning-activity?view=o365-worldwide

## Viva Engage activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-engage-activity-report-ww?view=o365-worldwide

## Viva Engage device usage report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-engage-device-usage-report-ww?view=o365-worldwide

## Viva Engage groups activity report
https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/viva-engage-groups-activity-report-ww?view=o365-worldwide

###Scenario 1 - EDPS (European Data Protection)




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




