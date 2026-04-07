---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/ICM/How to engage the product group"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/ICM/How%20to%20engage%20the%20product%20group"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

**If you are not a member of the Azure Monitor (AME Monitoring), DO NOT create ICMs using this process**.  This guide is provided for members of Azure Monitor to engage the Azure Monitor product groups for customer issues.  Anybody from another CSS team should create a CSS collaboration to the relevant Azure Monitor product and we will engage the appropriate product group should it be needed.

See article [Procedure: Collaboration](https://internal.evergreen.microsoft.com/help/4346610) to learn more about how to collaborate in CSS.
</div>

[[_TOC_]]

# Introduction
---

This article provides Azure Monitor support engineers with clear guidance on when and how to submit a Customer Reported Incident (CRI) using the IcM process. It is intended specifically for members of the Azure Monitor (AME Monitoring) team and outlines the criteria for engaging the Azure Monitor product groups, the expected workflows after submission, and the roles and responsibilities involved throughout the lifecycle of a CRI. By following this guidance, engineers can ensure appropriate use of IcM, avoid unnecessary delays, and set accurate expectations for both internal stakeholders and customers.

## Glossary

| Term | Description |
|------|-------------|
| IcM (Incident Management) | Microsoft internal system used to create, track, and manage operational and customer-related incidents across s
| [Azure CEN](https://aka.ms/azurecen) (Classification, Escalation, and Notification) | The Azure framework that defines how incidents are classified by severity and how notifications and coordination occur based on customer impact and service conditions. |
| Customer Reported Incident (CRI) | An incident created in IcM to track and manage a customer-reported issue and coordinate investigation. |
| Restricted Customer Reported Incident (rCRI) | A CRI type used when customer support data is involved, enforcing restricted access so only authorized users can view and manage the incident. |

# When to submit a CRI
---

Unless you have been directly advised by the product group, a technical advisor, applicable subject matter expert, or troubleshooting content, you should pursue all available CSS resources before engaging the product group.

CSS resources include: DfM Copilot, Azure Support Center (ASC) which includes ASC Assistant, [Azure Monitor wiki](https://aka.ms/azmonwiki), daily case triages, and technical advisors.

> **Note**
>
> If you are unsure if you should be submitting a CRI, check with your Technical Advisor before proceeding.

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

Feature requests are not to be submitted via ICM. For details on advising a customer to submit feature or design change requests, see article: [How to advise a customer to submit a feature or design change request for Azure Monitor](/Azure-Monitor/How%2DTo/General/How-to-advise-a-customer-to-submit-a-feature-or-design-change-request-for-Azure-Monitor)
</div>

# How to submit a CRI
---

Follow the instructions in article [How to open a CRI (ICM) in Azure Support Center](/Azure-Monitor/How%2DTo/ICM/How-to-open-a-CRI-\(ICM\)-in-Azure-Support-Center).

If for some reason Azure Support Center is unavailable and you cannot wait to submit your CRI, follow the instructions in article [How to open a CRI (ICM) when Azure Support Center is down](/Azure-Monitor/How%2DTo/ICM/How-to-open-a-CRI-\(ICM\)-when-Azure-Support-Center-is-down).

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:100%;border-radius:10px;color:black;background-color:#d7eaf8">

**Important**

Each CRI template includes instructions that guide what information must be included and in some cases how to provide that information.  Ensure that you carefully read all instructions and fill out all properties.  Failure to do so will result in delays and potentially your CRI being rejected.
</div>

# What to expect after CRI submission
---

The vast majority of CRI submissions will start with a severity of 3, and will follow the workflow shown below. If the severity of the CRI gets elevated to 2, efforts become real-time with all parties engaged on a Teams bridge and updates, including customer-ready updates come out of that bridge.

## Key Expectations
- Product group is expected to acknowledge within 1 business day.
- Product group is expected to provide detailed updates at least every 2 business days.
- Product group updates should clearly identify information that can be shared with the customer.

For any delays in acknowledgement or updates, follow article [How to handle a Severity 3 ICM that has not been acknowledged or has not had recent updates](/Azure-Monitor/How%2DTo/ICM/How-to-handle-a-Severity-3-ICM-that-has-not-been-acknowledged-or-has-not-had-recent-updates).

> **Note**
>
> Product groups are located in different countries around the world so keep in mind that a business day refers to the business day for the product group and not for you. For example, if you are in the United States and create an ICM Thursday afternoon and the product group is based in Israel, the product group will have already started their weekend and will not see your ICM until Sunday. Keep this in mind when setting the expectations of your customer.  If you are unsure, check with your technical advisor.

## Reactivation

- A CRI should only be reactivated if it is for the same problem without any deviation from the original scenario.  Any deviation from the original scenario should result in a new CRI.
- A CRI should never be reactivated after more than 30 days since mitigation.  After 30 days, a new CRI should be submitted with any data requirements reflecting newly captured data as most telemetry is only kept for 30 days.

## Workflow

![Flowchart of the CRI workflow](/.attachments/image-ae96009d-ab36-4362-a885-ac66e649ae20.png)

# Product Fixes
---

If the root cause of a CRI is determined to be an unexpected issue (such as a bug or regression), the product group is expected to provide the following information in the CRI for customer communication.

| Information | Description | Timeline |
|-------------|-------------|----------|
| Root Cause | A customer-ready statement explaining the underlying cause of the issue. | As soon as the information is available. |
| Fix Decision | Determination of whether there is intent to address the issue. | Within 5 business days of root cause identification. | 
| Resolution Target | Target date for when a fix is expected to be released. This is not a commitment and may change. | Within 5 business days of a yes fix decision. |
| Resolution Update | Ongoing status updates on progress toward resolution. | Weekly, or as otherwise agreed upon, until the fix is rolled out. |

