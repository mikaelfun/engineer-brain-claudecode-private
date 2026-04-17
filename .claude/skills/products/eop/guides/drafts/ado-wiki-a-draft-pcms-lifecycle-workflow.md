---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/[Draft] PCMS Lifecycle Workflow"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Drafts/%5BDraft%5D%20PCMS%20Lifecycle%20Workflow"
importDate: "2026-04-05"
type: troubleshooting-guide
note: "[Draft] status — SCIM EMEA Messaging Protection PCMS Review Model"
---

# SCIM EMEA Messaging Protection PCMS Review Model

[[_TOC_]]

## What is PCMS?

PCMS Strategy - increase the consistency in delivering great customer experiences.

PCMS is a proactive, open case management solution designed to help support teams with identifying, prioritizing, and recovering open cases at-risk for poor customer experience.

PCMS consists of **3 core components**:

- A machine learning model that predicts with a high-level of accuracy whether a case is likely to result in a negative customer experience.
- A user interface that displays a prioritized list of open, at-risk cases.
- A recording and learning platform aligned to customer expected behaviors used to record at-risk case review findings for continuous improvement. This also includes specific actions performed to proactively improve the customers experience.

## Where do I find trainings for PCMS?

You can find the trainings for PCMS on [SharePoint](https://microsoft.sharepoint.com/teams/ProactiveCaseManagement/_layouts/15/Doc.aspx?sourcedoc={73e7f6b9-727e-4d5f-a0b2-61f759fdde4a}&action=view&wd=target%28Overview.one%7Cdc10ddba-61a7-4171-97cd-1ec14d209c8f%2FTraining%20Videos%20-PCMS%20On-Boarding%7Ce4945c69-34c0-47ce-af1a-fd6dbbdcc40b%2F%29&wdorigin=NavigationUrl).

## What is the PCMS workflow?

The PCMS process is an iterative one. It begins with the Machine Learning (ML) model which detects at-risk predictions for each open case. Starting with cases having the highest at-risk probability, a quick review assessment is performed to understand whether an issue(s) is occurring in the case.

If an issue(s) is found, a proactive action is then performed to improve the customer's experience.

The assessment findings, including opportunities to improve customer expected behaviors and the proactive actions taken, are then recorded in the Recording and Learning platform.

And last, for all cases reviewed, data analysis is performed to understand model and action effectiveness and to leverage those learnings to make future improvements.

## If I am a reviewer, which is the assessment criteria?

You can find the assessment criteria in the [PCMS Playbook](https://microsoft.sharepoint.com/teams/ProactiveCaseManagement/_layouts/15/Doc.aspx?sourcedoc={73e7f6b9-727e-4d5f-a0b2-61f759fdde4a}&action=view&wd=target%28Overview.one%7Cdc10ddba-61a7-4171-97cd-1ec14d209c8f%2FAssessment%20Criteria%7Cd906c162-479d-4d3a-b325-7e60ce4d18fe%2F%29&wdorigin=NavigationUrl).

For SCIM EMEA Messaging Protection, please also refer to the agreed Case Documentation best practices [document](https://microsoftapc.sharepoint.com/:w:/r/teams/SCIM-MessagingProtection/_layouts/15/doc.aspx?sourcedoc=%7B7e42f57e-d45c-4e72-bc9f-fbce7288dd3f%7D&action=edit).

## What is the PCMS rhythm in place for SCIM EMEA Messaging Protection?

List of mentors can be found [here](https://microsoftapc.sharepoint.com/teams/SCIM-MessagingProtection/Lists/SCIM%20EMEA%20MDO%20%20Mentorship%20Matrix/AllItems.aspx).

## Where can I check for reports?

[PowerBI Report](https://msit.powerbi.com/groups/me/reports/49fea88d-ecd2-4e94-8217-9183c4925bb2/ReportSection1305501e23f5d4596c55?experience=power-bi) — if you do not have access, request it and the request will be approved within 24 hours. If not, please reach out to your TAs.

## What do I need to watch out for while doing PCMS Reviews?

- CMS behaviours of engineers (as per PCMS form)
- Engineers linking VSOs in Bugs & Issues in DfM
- Case note quality
- Good SAP match as per [new MDO SAPs](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7853/Messaging-Protection-SAPs-Contacts)

### PCMS Reviews checklist

Please follow the below checklist when conducting PCMS reviews:

- [ ] **SAP Accuracy**: Is the SAP correct and does it match the case topic?
- [ ] **Case age [Days]**
- [ ] **SLA Compliance**: SLA Status: [Missed, Met]
- [ ] **Customer Communication**
  - Date of last communication with the customer: [ ]
  - Quality of customer communication:
    - Are communications frequent enough?
    - Are responses clear, professional, and helpful?
    - Was the first contact made by email, or did the engineer scope the case on the phone? (first contact should be on phone/Teams)
- [ ] **Escalation Status**: Does the case have an escalation? Is it clearly documented? Status: [Blocked, On Track]
  - If blocked: what steps are needed to unblock?
  - Is collaboration/swarming with SMEs/SEEs required?
- [ ] **Scoping Note**: Does a scoping note exist?
  - Does the troubleshooting task exist? Is the problem description clear and detailed?
- [ ] **Customer Sentiment**

## EMEA PCMS - A Case Life Cycle Flow

In EMEA our approach to PCMS Reviews is based on the collaborative effort of everyone in our MDO EMEA team.

We've identified 3 main stages based on Case Age:

**Stage 1** — cases with >= 7 days of age  
**Stage 2** — cases with >= 14 & < 21 days of age  
**Stage 3** — cases with >= 21 days of age

In each Stage we have a set of responsibilities for each team member. As we have a Mentor-Mentee pairing, we leverage that relationship to help in overall Case Quality and improve support experience.

### How to use CaseBuddy Filters?

A set of Filters and Views were created in CaseBuddy to help with:
- **Notifications**: On each Stage, everyone is notified according with their responsibility and actions
- **Organization**: quick and easy way to identify cases pending PCMS review

To access these Filters/Views, each Mentor must follow these steps:

1. Select **Manage Filters** on the **Case Review** tab
2. Under **Teams**, select **Aged Backlog Analysis** → **Filters**
3. Each Mentor must search for **Stage 2** and check their respective Filter
4. On the Filter view, click on the **Play button** to run the Filter

This will create a View with all the cases that need PCMS review and Mentor action. Mentors should review their cases and work with their mentees to unblock cases as best and as soon as possible, **whilst ensuring the proper CARE behaviours and Quality Standards**.
