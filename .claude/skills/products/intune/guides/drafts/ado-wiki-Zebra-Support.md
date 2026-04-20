---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Features Restrictions and Custom/Android/Zebra Support"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Device%20Config%20Features%20Restrictions%20and%20Custom/Android/Zebra%20Support"
importDate: "2026-04-20"
type: guide-draft
---

[[_TOC_]]

#Summary
Intune: Support details for customers using Zebra devices v2 --- 
This article documents the support collaboration process established and agreed upon by Microsoft and [Zebra Technologies](https://www.zebra.com/us/en.html) for Zebra mobile devices running Android and managed by Microsoft Intune. Please note that all information regarding the support collaboration process contained herein is subject to change pending future design and the evolution of the offerings by both parties.

##More information
Microsoft/Zebra Support Collaboration and Escalation Process
Created by Jenna Kerai and Karan Rustagi (Microsoft) in collaboration with and authorization from Zebra Corp.

#Overview Scope
This document covers Zebra mobile devices on Android managed by Microsoft Intune. This document will be reviewed approximately every six (6) months and updated as appropriate.

#Readiness Training
To learn more about the Zebra FOTA - Please see CxE Readiness, Social, and Comms Team - [2305 Zebra Lifeguard Over-the-Air (LG OTA) integration – Public Preview](https://microsoft.sharepoint.com/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/Forms/AllItems.aspx?id=%2Fteams%2FLearnCSSIntune%2FIntuneFeaturesDeepDiveArchives%2F2305%20%2D%20Zebra%20Lifeguard%20Over%2Dthe%2DAir%20%28LG%20OTA%29%20integration%20%E2%80%93%20Public%20Preview&viewid=adb206e7%2D0904%2D453e%2D91f6%2Db8a4733aa288)

#Escalation Summary
When a customer raises a Zebra issue with Microsoft CSS, the support teams will record all data and logs mentioned in later in this document then raise an internal escalation with the Intune Customer Experience team. The escalation will then be reviewed by the team in terms of data collection, assessment and quality before engaging the Intune engineering team.

The Intune engineering team could then suggest a Zebra ticket to be opened by the Customer for issues such as misconfiguration etc or open a ticket with Zebra for bugs or code analysis if necessary. After adding details in the escalation request, transfer it over to Customer Experience Engineering team to assess. If in turn Zebra needs to open a ticket, they will ask the customer to log a Microsoft support ticket via the Intune portal. Upon investigation and if needed, this information will be passed on to the engineering team via Customer Experience Engineering team.

#Support Boundaries
Areas of support owned by Zebra:

- Zebra software e.g. StageNow, OS, Zebra OEMConfig app schema content.
- Zebra system apps.
- Zebra hardware.
- Zebra firmware updates over-the-air: FOTA enrollment, usage of deployment settings, firmware delivery to the device, and any numeric error codes.

Areas of support owned by Microsoft:

- Microsoft will assist in importing the OEMConfig XML file from Zebra MX and creating a policy to deliver the file to the targeted device. Once the policy is confirmed to be on the device, all functionality of the settings contained in that policy are wholly supported by Zebra.
- Microsoft will assist in all other native functionality of the Intune product not specific to Zebra devices or software, including but not limited to device enrollment, software deployment and device configuration profiles.
- For firmware updates over-the-air: Connecting Intune and Zebra tenants, delivery of OEMConfig and app configuration policies to the device.

#Collecting sufficient data
When handling a Zebra related issue, the information below will need to be collected by the Microsoft Support Engineer.

- Deployment ID, if the issue is related to a deployment
- Device Zebra Info: Serial Number, Model, FOTA Enrollment status, and Update Status if the issue is specific to a device
- Email/account on the Zebra Portal when connecting Intune to Zebra. This is only required when we contact Zebra on the customer's behalf.

#How to obtain the Zebra FOTA Intune Deployment ID:

- In Intune Admin Center, Navigate to: Home -> Devices -> Android.
- Under Android policies, select Android FOTA deployments.
- Click on the desired Deployment and select View Report. The Deployment ID is in the report link

# How to obtain Zebra Device Info: Enrollment and Update Status

- On the Zebra Device, go to Settings - System – Advanced – System Updates.

![image.png](/.attachments/Temp/image-e7289c72-ec06-41ca-b65a-bda656a03805.png)

# Microsoft’s process to raise and incident with Zebra
In the event an issue within Microsoft Support requires the attention of Zebra Support, IET shall execute the following:

1. Raise an escalation request internally for Microsoft Customer Experience Engineering team via ICM to review the issue and engage engineering if there is a need. This will help to ensure thorough checks have been performed to rule out any misconfigurations within MDM prior to engaging Zebra team.

2. After Step 1 above, based on the nature and type of the issue, Microsoft team may ask customer to raise a request with Zebra as below.
- Navigate to [Contact Support | Zebra](https://supportcommunity.zebra.com/s/contactsupport?language=en_US) and complete the form.
- Obtain the Zebra Case ID (note: an automated response containing the Zebra case number is received immediately upon the Zebra Support Center’s receipt of the initial email. Timing for response from Zebra support engineer will depend on customer’s support contract). Microsoft Support replies to the Zebra Support case email by clicking the link within the automated email response received in step a (sample below).

![image.png](/.attachments/Temp/image-0c45a935-87a4-4517-b901-2106ed53ccfe.png)
These Incidents logged with Zebra would contain the completed template below:


```
Microsoft Case/SR number: <Microsoft case number including the link>

Zebra Case number: <Zebra case number>

Company Name: <Company Name>

Customer Name: <Customer Name>

Phone Number: <Phone Number>

Number of devices affected: <Device count>

Title: <Short description of MSFT customer issue requiring Zebra support>

Device SN:<serial number of the device>

The specific ask: <Description of the help needed from Zebra support?>

Date (Microsoft) Case Opened: mm/dd/yyyy

Date Issue Started:   mm/dd/yyyy

User (if applicable): <provide UPN>

Expected Behavior: <What does Customer expected to occur>

Observed Behavior: <What is your assessment of the behavior>  

Error Message: <Any Error Message is the Customer Seeing>

Reproduction Available? (Y/N): <is this an in-house repro or customer only>

What are the repro steps? <list out exact steps to reproduce behavior if possible>
```
**For internal purposes the Microsoft Support Engineer must include the above information and Zebra correspondence (including the Zebra case number) in the Microsoft Support ticket.**

Zebra’s SLA is dependent on the user’s entitlement. Typical response time is 4 business hours for contracted customers and best effort for Warranty. Agent will respond to the end-customer and the Microsoft Support Engineer.

The Microsoft support engineer must be included in any and all correspondence until the case is closed from the Microsoft side.

# Zebra’s process to raise an incident with Microsoft
In the event an issue within the Zebra Support organization requires the attention of Microsoft Support, the Zebra Support Engineer shall complete the following:

1. Request that customer open a Microsoft Service Request (SR) reporting the same issue. Support cases for Intune are free of charge and instructions can be found at https://docs.microsoft.com/en-us/intune/get-support. alternatively, they can follow the process in this blogpost.

Snippet:

*Login to Intune Admin Center, head to the Troubleshooting + Support blade, then select Help and support. When you land on the Help and support blade, you will be prompted to select a management type with three choices. Pick the correct one as that helps us route any case you create to the appropriate support team. For this article we have focused on Intune management.*

*Once you’ve made your choice you’ll be presented with the Need help? dialog, and an empty text box. We are looking for a brief description of your issue – just a few words – based on which we try to provide you some instant guidance. Within this field, be as specific as possible and mention only the key words for your issue like the platform and the unexpected behavior. Also include any explicit error code or error messages as relevant.*


![image.png](/.attachments/Temp/image-b3ceabb4-5fcf-4b37-8cf3-f8f17d4c511a.png)

Once you have filled out the required information, a SR# will be provided

2. Obtain the Microsoft case ID or SR# from the customer. Microsoft cannot provide assistance without a case number. The expected Microsoft response time is 1-business day. Microsoft Support Engineer will respond to the end-customer and Zebra Support Engineer. No further action is needed from Zebra and will soft close the case within 7 days.

3. Zebra FOTA tickets will follow the same escalation procedures as other tickets.

# Appendix
Microsoft Service Level Severity Definitions

**Severity 1** – Catastrophic or critical situation: Situations that critically affect the customer's business, such as complete loss of a core business process. Work cannot reasonably continue, and the situation requires immediate attention.

*Microsoft actions:* Microsoft resources are required at the customer's site as soon as possible (except for Essential Support Standard). The issue is escalated to the product teams. Senior executives at Microsoft are notified, and the first call response is within one hour or less.

*Customer actions:* Notification of the customer's senior executives is required. The customer must allocate appropriate resources to sustain continuous effort 24 hours a day, every day, until the issue is resolved. Only Technical Account Managers, Technical Account Specialists, and Critical Situation Managers can code cases as Severity 1. Agents code as Severity A. Time to Respond: 1 hour Premier contract only; 2 hours Broad Commercial

**Severity A – Critical:** Situations that involve a system, network, server, or critical program down situation that severely affects customer production or profitability. High-impact issues where production, operations, or development are proceeding but could be severely affected within several days. Microsoft first call response is in one hour or less for Premier and Essential Support Standard SRs and one hour for Professional SRs. Microsoft will provide continuous effort to resolve the problem 24 hours a day. Senior managers at Microsoft are notified.

*Customer actions:* The customer must allocate appropriate resources to sustain a continuous effort 24 hours a day. The customer's management must be notified. Time to Respond: 1 hour Premier contract only; 2 hours Broad Commercial

**Severity B – Urgent:** Signifies a moderate business impact. The customer's business has a moderate loss or degradation of services, but work can reasonably continue. The customer is not experiencing an immediate work stoppage. Microsoft first call response will be two hours (business hours or actual hours, customer's choice) or less for Premier and Essential Support Standard. For Professional SRs, the callback time is four business hours.

*Customer actions:* The customer must allocate appropriate resources during business hours (or 24x7 for Premier customers only if the customer opts for 24x7 troubleshooting) to sustain a continuous effort to resolve the issue. Time to Respond: 2 Hours Premier contracts only; 4 hours Broad Commercial.

**Severity C – Important:** Indicates an issue with minimum business impact. The customer's business is substantially functioning and has minor or no impediment of services. Microsoft first call response will be four business hours or less for Premier and Essential Support Standard. For Professional and Personal SRs, the callback response time is 24 business hours.

##Zebra Service Level Severity Definitions

*Support Contact Info:* https://www.zebra.com/us/en/about-zebra/contact-zebra/contact-tech-support.html

- Mobile Computers Inside US: 1 800 653 5350
- Printers Inside US: 877 275 9327
- Printers Outside US: 011 469 565 1939

Note that Each country has its own support number, that can be found using the link above*

**Description of Help Desk Services:** Help Desk Support: Contact details for Customers to call, email or go online for technical support (“Help Desk”) can be found inside the [Customer Support Instructions](https://www.zebra.com/us/en/about-zebra/contact-zebra/contact-tech-support.html). Zebra will provide Help Desk support during the following business hours (excluding Zebra-observed holidays):

- North America (NA) and Latin America (LA): Monday–Friday 8 am to 8 pm (EST)
- Europe, the Middle East and Africa (EMEA): Monday–Friday 8 am to 7 pm (CET)
- Asia Pacific (APAC): Monday–Friday 9 am to 6 pm (in-country Local Time)

Zebra’s target Level 1 Response Time is four (4) hours from call receipt. Telephone calls will be recorded for quality and training purposes, where permitted under local law. Note: Where Zebra provides existing or alternative Help Desk support to Customer for specific Products (for example, WLAN), the terms of that existing or alternative support will continue to apply to those Products.

*Escalation:* When a technical inquiry cannot be resolved in Level 1, Zebra will follow its established escalation procedures to enlist higher levels of expertise — including Zebra and third-party engineering development teams.

## ***NOTE: Please reach out to a member of Intune CxE team before contacting Zebra contacts listed [HERE](https://supportability.visualstudio.com/Intune/_git/IET?path=/IET/Zebra-Contacts/Zebra-Contacts.md&_a=preview). Also, please do not share these details with customers. In an event customer needs to escalate an issue, they must reach out to their contact within Zebra to do so.***



**24/7 Telephone Help Desk Support:** During non-standard business hours access to Level 1 support is available in English only. Help Desk representatives will help with opening a support case, complete Level 1 triage, and determine best course of action. If Customer’s support case demands escalation, it will be addressed during normal business hours within Customer region.

- Problem Isolation, Analysis and Resolution. A Help Desk representative will:
- Help with filling out a case report.
- Assess the nature of the problem.
- Solicit Customer to activate the Device Diagnostic Tool (as available / applicable).
- Assist with/perform problem determination.
- Work to achieve problem resolution.
- Should no resolution be found, Zebra Help Desk may create an RMA on behalf of the Customer to initiate a repair and replacement (Section 2).

**Software Support Coverage:** Zebra provides Help Desk support for Software, excluding custom software applications, modifications and Customer configurations.

**Access to Latest Software:** Help Desk may require Customer to download latest Software as made available under the terms specified in item 5.17. Software is delivered in machine-readable format with appropriate documentation and should be used under the relevant End User Level Agreement (EULA).

***NOTE All information contained herein has been provided with authorization from Microsoft Corporation and Zebra Technology Corporation.***

