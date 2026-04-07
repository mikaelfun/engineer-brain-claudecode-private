---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Entra ID Terms of Use"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FEntra%20ID%20Terms%20of%20Use"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-idsp
- cw.CA
- cw.TOU
- SCIM Identity
- Conditional Access
-  Terms of Use 
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD-Account-Management) [AAD-Workflow](/Tags/AAD%2DWorkflow)  
 


[[_TOC_]]

# Feature Overview

Entra ID Terms of Use is a service in Entra ID that allows administrators the ability to display a terms of use and disclaimers that a user must accept prior to continuing. As a user accepts the terms of use an audit event is recorded marking the date and time the terms of use were accepted.

As compliance restrictions continue to grow around the world, the goal is to make the life of admins as easy as possible while satisfying all rules and restrictions. No need to print off long documents and have each employee sign that form, then store, track, and repeat every year. Terms of use will streamline and automate this entire process by allowing an administrator to create and configure a Terms of Use that a user must accept prior to performing a certain task.

Entra ID Terms of Use leverages [Entra ID Conditional Access](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184092).

# Requirements

- User with the Role Global Administrator, Security Administrator, or Conditional Access Administrator may create Entra ID TOU
- Any user or group assigned to the TOU may consume the feature.

# Licensing

The minimum license requirement for Terms of Use is Microsoft Entra ID P1 (formerly Azure Active Directory P1). This is also satisfied if the customer has Entra ID P2, Enterprise Mobility + Security (EMS) E3 or EMS E5.

# What's New?

## July 17, 2023

Starting July 2023, we're modernizing the following Terms of Use end user experiences with an updated PDF viewer, and we are moving the experiences from [https://account.activedirectory.windowsazure.com](https://account.activedirectory.windowsazure.com/) to [https://myaccount.microsoft.com](https://myaccount.microsoft.com/). Our customers will still be able to:

- View previously accepted terms of use.
- Accept or decline terms of use as part of their sign-in flow.

No functionalities are removed. The new PDF viewer adds functionality and the limited visual changes in the end-user experiences will be communicated in a future update. 

The changes for the sign-in flow will start rolling out in the first weeks of August. 

**Important**: If our customer has allow-listed only certain domains, you must ensure their allow list includes the domains ‘myaccount.microsoft.com’ and ‘*.myaccount.microsoft.com’ for Terms of Use to continue working as expected.

## Previous updates

This enhancement is now GA:

One of the top pain points related to Terms of Use (ToU) is the inability to replace a PDF document associated with the Terms of Use after it has been created. Often, you just want to make minor edits such as fixes to typos, updates to contact information, or other such non-legally impacting edits. Previously, the only way to do this is to create a brand new ToU with the updated document.

Now you can simply add a new PDF to an existing ToU. Then, you can specify whether end users are required to accept this ToU if they have already accepted a previous version that is materially similar. We have also added enhanced reporting capabilities that allow you to track exactly who has accepted which version of a ToU.

See this link for details:

Entra ID Terms of Use: https://learn.microsoft.com/en-us/entra/identity/conditional-access/terms-of-use#update-the-version-or-pdf-of-an-existing-terms-of-use
# Case Handling

Support topic: **Azure\Microsoft Entra Governance, Compliance and Reporting\Terms of use**

Case handling is managed by Entra ID [Account Management](mailto:azidcomm-secaccmgmt@microsoft.com).

Enforcement of Terms of Use by Conditional Access is supported by IdSP/Authorization (Entra ID Authentication), but is restricted to the enforcement part - i.e. Did Conditional Access enforce the ToU control or not.

# Architecture Diagrams

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TOU-Swimlanes.png](/.attachments/62361362-60e1-661b-65fd-2be2a245a039600px-TOU-Swimlanes.png)](/.attachments/62361362-60e1-661b-65fd-2be2a245a039600px-TOU-Swimlanes.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

# Workflow

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TOU Workflow.jpg](/.attachments/5bd49e1d-c707-eea3-10e6-2249455b8f7e600px-TOU_Workflow.jpg)](/.attachments/5bd49e1d-c707-eea3-10e6-2249455b8f7e600px-TOU_Workflow.jpg)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

# Limitations


Acceptance of the TOU is not stored on the user object. The consent bit is stored in a separate database and is available via audit logs. Note that audit events are not instantly viewable; they will be available 20 to 30 minutes after the event occurs.

Audit logs are only maintained for 30 days. In order to maintain audit logs longer than 30 days customers are required to download the logs in CSV format before the logs roll.

Presently the TOU is not expanded when the user accepts. The user has the option to accept the TOU without actually reading it. This is being addressed in a later release and the product group is interested in customer feedback on this.

Each TOU can only utilize one custom control; if a second custom control is added it will invalidate the first custom control. 

Terms of use consents - Searching for Users that Accepted/Declined/Expired TOU:  
Search will happen based on "Display Name" or "UPN", however it's **case sensitive**.   


# Known Issues

 <table class="wikitable">
<tbody><tr>
<th>Persona
</th>
<th>Issue Description
</th>
<th>Description
</th>
<th>Resolution
</th></tr>
<tr>
<td rowspan="4">End User
</td>
<td style="vertical-align:top">PDF Fails to render on Android
</td>
<td style="vertical-align:top">There is currently a bug in ADAL that does not support rendering of PDF on Android.
</td>
<td style="vertical-align:top">Pending ADAL Engineering Fix
</td></tr>
<tr>
<td style="vertical-align:top">"Back" navigation in the UI is missing on iOS
</td>
<td style="vertical-align:top">On iOS, PDF document does load, but the user does not have any "back" navigation
<p>in the UI so the user must cancel the entire application.
</p>
</td>
<td style="vertical-align:top">Pending ADAL Engineering Fix
</td></tr>
<tr>
<td style="vertical-align:top">"Pinch to zoom" on ADAL window does not work
</td>
<td style="vertical-align:top">On both iOS and Android users are unable to “pinch to zoom” on the ADAL window
</td>
<td style="vertical-align:top">Pending ADAL Engineering Fix
</td></tr>
<tr>
<td style="vertical-align:top">"Having trouble viewing? Click here" link does not work
</td>
<td style="vertical-align:top">When user tries to select the "Having trouble viewing? Click here" link nothing happens.
</td>
<td style="vertical-align:top">A new private preview feature is available with a allow list to remove the "Having trouble viewing? Click here" link. It adds a new "Zoom in" and "Zoom out"
</td></tr>
<tr>
<td rowspan="2">Admin
</td>
<td style="vertical-align:top">Initial creation of Terms of Use fails with
<p>"There was a problem creating terms of use &lt;DisplayName&gt;"
</p>
</td>
<td style="vertical-align:top">Clicking <b>Create</b> after defining a Terms of Use term fails and creates a Notification stating
<p>"There was a problem creating terms of use &lt;DisplayName&gt;". 
</p><p>This issue occurs if the combined file size for all of the selected languages exceeds 2MB.  
</p><p>This is due to a 2MB limitation at the gateway.
</p>
</td>
<td style="vertical-align:top">The initial Create of a ToU term is written as a single blob.
<p>If the total size of the file(s) exceeds 2MB the Create will fail.
</p>
<ul><li>If only one language is being added to the ToU term, and that one file exceeds 2MB in size, have the customer use a smaller file.</li>
<li>If the administrator is creating a ToU term containing multiple languages, each with their own file that is less than 2MB in size, have the customer create the ToU with only one language and add each language with their file thereafter.</li></ul>
<p><b>Note</b>: Currently, this is "by design". With enough feedback this could be changed.
</p>
</td></tr>
<tr>
<td style="vertical-align:top">"Consent per device" setting on TOU, does not support when the CA policy has Intune enrollment app in scope.
</td>
<td style="vertical-align:top">When end users try to enroll device they will be blocked with this configuration.
</td>
<td style="vertical-align:top">
<ul><li>Option 1: Turn the "Consent per device" setting off, or</li>
<li>Option 2: Update the CA policy app targeting from Intune enrollment to the resource the users will be accessing like SPO and EXO.</li></ul>
</td></tr></tbody></table> 

# Frequently Asked Questions

### Q1. Why am I seeing conditional access failures in sign in logs (AADSTS50158) related to Terms of Use grant control
A conditional access (AADSTS50158) failure in the context of ToU does not have to (but can) result in a sign-in faliure - you would need to look at the log entry chain via correlation ID.  Even if the user has previously accepted the terms CA result may show failure but the sign-in could still be successful.

Query ASC sign in logs v ia correlation ID and verify you see two signin entries for the correlation ID, one 50158 "failure" and then a success.

   ![image.png](/.attachments/image-3c4af530-8e6a-4e27-a863-565c52cc6f96.png =800x)

The 50158 is expected, and only indicates that CA identified that user has a TOU policy applied.  The same correlation ID showing a subsequent Success(0) indicates the user satisfied the TOU policy (either by accepting TOU interactively, or by having already accepted previously). If a single correlation ID shows only a single or multiple Interrupt(50158), but no Success(0) then it most likely indicates the Application being accessed is not supporting the interactive prompt required by TOU or user is not accepting the TOU policy. The client app needs to re-initiate the request in an interactive signin session in order to let ESTS/CA have a chance to prompt the user for the required challenge (e.g. TOU or 3rd party MFA)

This question is also covered in [public docs FAQ](https://learn.microsoft.com/en-us/entra/identity/conditional-access/terms-of-use#frequently-asked-questions) and in Identity Division Wiki [AADSTS50158: External security challenge not satisfied](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/38656/AADSTS50158-External-security-challenge-not-satisfied)

#### Error messages
AADSTS50158: External security challenge not satisfied. User will be redirected to another page or authentication provider to satisfy additional authentication challenges.

_The user is required to satisfy additional requirements before finishing authentication, and was redirected to another page (such as terms of use or a third party MFA provider). This code alone does not indicate a failure on your users part to sign in. The sign in logs may indicate that this challenge was succesfully passed or failed._

#### Sample ICMs
https://portal.microsofticm.com/imp/v3/incidents/details/317869493/home
https://portal.microsofticm.com/imp/v3/incidents/details/314047493/home
https://portal.microsofticm.com/imp/v3/incidents/details/316811314/home
[Incident-567735886 Details - IcM](https://portal.microsofticm.com/imp/v5/incidents/details/567735886/summary)

#### Description
This type of IcM will typically be reported as a CRI. The customer will indicate that they are prompted with a dialog every time they try to access a different resource that is targeted for a TOU agreement or the user is not getting prompted at all and the client (app) just 'errors out' because its not handling the interaction_required correctly.

#### Explanation
**This is the expected behavior.** Terms of use implements Conditional Access extensibility, which requires an interactive sign-in. Because of this, during a non-interactive sign-in, CA will be unable to verify whether the Terms of use agreement is satisfied. The client application will need to prompt the user to trigger an interactive sign-in, even if the user has already previously accepted the agreement. After clicking a prompt, the client application will trigger an interactive sign-in flow as expected.

#### On-call action
As the on-call engineer, confirm the error is related to interactive sign in. After confirming this, include this explanation in the ticket and transfer it to Partner team. The on-call on that team will be able to resolve the ticket with the following guidance: 

Partner team should ensure their client handles interaction_required correctly, please refer to [Handle errors and exceptions in MSAL.js - Microsoft identity platform | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity-platform/msal-error-handling-js#errors-that-require-interaction "https://learn.microsoft.com/en-us/entra/identity-platform/msal-error-handling-js#errors-that-require-interaction")

For example [Incident-567735886 Details - IcM](https://portal.microsofticm.com/imp/v5/incidents/details/567735886/summary) is transferred to **Credential Enforcement and Provisioning/Triage** for them to better handle error.



# How to configure & manage

## Terms of use document

Entra ID Terms of Use uses the PDF format to present content. The PDF file can be any content, such as existing contract documents, allowing you to collect end-user agreements during user sign in. The recommended font size in the PDF is 24.

### Add Terms of use

Once you have finalized your Terms of use document, use the following procedure to add it.

<https://docs.microsoft.com/en-us/azure/active-directory/governance/active-directory-tou#add-terms-of-use>

### The Terms of Use user experience

The Entra ID Terms of Use user experience will be experienced by the admin upon signing out and back in again. The user is presented a page where they must accept the Terms of Use to continue

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![2017-09-22 11-29-14.png](/.attachments/02380365-9522-2fd6-a1ce-b5adf7bb7628600px-2017-09-22_11-29-14.png)](/.attachments/02380365-9522-2fd6-a1ce-b5adf7bb7628600px-2017-09-22_11-29-14.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

Clicking on the Display Name, in this case "Company Terms of Use," will display the entire Terms of Use for the employee to read.

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![2017-09-22 11-29-52.png](/.attachments/ce65ca09-af03-a5f5-0796-740028b224ac600px-2017-09-22_11-29-52.png)](/.attachments/ce65ca09-af03-a5f5-0796-740028b224ac600px-2017-09-22_11-29-52.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

### Editing or deleting an existing Terms of Use

Editing or deleting a Terms of Use is done via the Conditional Access - Terms of Use (preview) page.

Select the TOU to reveal TOU details and the option to Edit, Delete, View audit logs, or Preview the PDF.

<div class="thumb tnone">

<div class="thumbinner" style="width:902px;">

[![Tou.jpg](/.attachments/f60309bd-5d67-7b0f-69b8-30192ea7f108900px-Tou.jpg)](/.attachments/f60309bd-5d67-7b0f-69b8-30192ea7f108900px-Tou.jpg)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

**Note: Deleting the TOU does not delete or disable the Conditional Access policy. This will have to be manually removed.**

### Downloading an accepted TOU PDF

We do not support downloading the ToU during acceptance, but end users can get a copy of all ToUs that have previously been accepted, by following these steps:

1. Navigate to https://myaccount.microsoft.com 
2. Select **Setting and Privacy**
3. Select **Privacy**
4. Select **View** and download the pdf from there.

[![ExportPDF.png](/.attachments/AAD-Authentication/183986/ExportPDF.png)](/.attachments/AAD-Authentication/183986/ExportPDF.png)

### Conditional Access for Terms of Use

Terms of use relies upon CA to deliver the TOU experience to the users. The Conditional Access experience can be learned here:

[Entra ID Conditional Access](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184092)

[Entra ID Conditional Access Custom Controls](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184079)

### Troubleshooting

### Service-Side Tracing in Jarvis

This uses the same controls and services as [Entra ID Controls](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183932) so the steps will be similar.

<table style="margin-left:.34in">
  <tr style="background:lightyellow;color:black">
    <td>
      <small>&#128276; <b>Note</b> &#128276
      <p style="margin-left:.27in">As of 2024-05 the CSS no longer has access to the AADERM jarvis log namespace documented below.  If log access is blocking your ability to resolve a customer issue, follow escalations section below to raise an ICM for engineering team.<br><br><b></b> Please add Scenarios\ICM\Cases to <a href="https://aka.ms/cssaadlogaccess">CSS AAD Log Access Tracking Spreadsheet</a> so we may better understand how often we need access to these logs</small>
    </td>    
  </tr>
</table>

<https://jarvis-west.dc.ad.msft.net/#/>

  - **Endpoint**: "FirstParty PROD" for Public Cloud, "CA Fairfax" for Fairfax tenants, "CA Mooncake" for Mooncake tenants
  - **Namespace**: "AADERM"
  - **Events to search**: OpenIDQoSEvent, TermsOfUseQosEvent
  - **Filtering conditions**: tenantId == **Customer Tenant ID**

<div class="thumb tnone">

<div class="thumbinner" style="width:526px;">

![image.png](/.attachments/image-caa007b9-1024-4538-92b1-1c8b9c21ed65.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

### Service Monitoring in Jarvis

If a customer reports an error and we check the Monitoring in Jarvis and see no RED for that event we need to alert the PG via [IcM Template](/index.php?title=IcM_Template&action=edit&redlink=1 "IcM Template (page does not exist)") section.

In Jarvis, select the **Health** tab. Change the Account drop-down to **AADERM** and expand the **Terms of Use** node. Set the time range to the when your customer's issue occurred by clicking the appropriate hours button as shown below.  

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![TOUServiceMonitoring.png](/.attachments/12e86f6f-d1ad-1511-e1de-9c3ccc97fa7f600px-TOUServiceMonitoring.png)](/.attachments/12e86f6f-d1ad-1511-e1de-9c3ccc97fa7f600px-TOUServiceMonitoring.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

### Auditing

Auditing is visible via the Azure portal Terms of Use page or via the main audit page by selecting **Terms of Use** via the category drop down..

1.  Select Terms of Use -\> Audit Event to be directed to the audit logs with Terms of Use preselected in Category. This will display all Terms of Use events.
    <div class="thumb tnone">
    <div class="thumbinner" style="width:602px;">
    <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/7833856b-542c-6409-ef6b-a93f2edbe2f2600px-2017-09-13_16-08-28.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="2017-09-13 16-08-28.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/7833856b-542c-6409-ef6b-a93f2edbe2f2600px-2017-09-13_16-08-28.png" width="600" height="191" class="thumbimage" srcset="/images/thumb/5/50/2017-09-13_16-08-28.png/900px-2017-09-13_16-08-28.png 1.5x, /images/5/50/2017-09-13_16-08-28.png 2x"></a><br/>
    <div class="thumbcaption">
    <div class="magnify">
    
    </div>
    </div>
    </div>
    </div>
2.  Further filtering can be accomplished by choosing **Activity** to filter by activity.
    <div class="thumb tnone">
    <div class="thumbinner" style="width:602px;">
    <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/49e2f05b-8779-963d-8891-98df0cf48ff0600px-2017-09-13_16-11-05.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="2017-09-13 16-11-05.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/49e2f05b-8779-963d-8891-98df0cf48ff0600px-2017-09-13_16-11-05.png" width="600" height="257" class="thumbimage" srcset="/images/thumb/4/4b/2017-09-13_16-11-05.png/900px-2017-09-13_16-11-05.png 1.5x, /images/4/4b/2017-09-13_16-11-05.png 2x"></a><br/>
    <div class="thumbcaption">
    <div class="magnify">
    
    </div>
    </div>
    </div>
    </div>
3.  Additional filtering can be selected by **Target** or **Initiated By (Actor).**
    <div class="thumb tnone">
    <div class="thumbinner" style="width:602px;">
    <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/c8d26098-d6da-cd46-4a76-eb9ab8b62281600px-2017-09-13_16-13-28.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="2017-09-13 16-13-28.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/c8d26098-d6da-cd46-4a76-eb9ab8b62281600px-2017-09-13_16-13-28.png" width="600" height="243" class="thumbimage" srcset="/images/thumb/d/d5/2017-09-13_16-13-28.png/900px-2017-09-13_16-13-28.png 1.5x, /images/d/d5/2017-09-13_16-13-28.png 2x"></a><br/>
    <div class="thumbcaption">
    <div class="magnify">
    
    </div>
    </div>
    </div>
    </div>

The goal is to publish APIs so customers can write their own tooling to access TOU audit events. At this point, Entra ID Terms of Use auditing is contained in the all up Entra ID audit events.

# ASC Troubleshooting

ASC tenant explorer does not have a built in data explorer for TOU policies, but you can use ASC Tenant Explorer Graph Explorer to find the TOU configurations and acceptances:

**Example Graph queries**


|**Name** |**Query**  |
|--|--|
|List TOU agreements  | /identityGovernance/termsOfUse/agreements |
|View specific TOU agreement  |/identityGovernance/termsOfUse/agreements/<GUID>  |
|View specific TOU agreement acceptances  | /identityGovernance/termsOfUse/agreements/<GUID>/acceptances  |
|View TOU acceptances for user | /users/<userid>/agreementAcceptances

For more examples reference Graph API documentation: https://learn.microsoft.com/en-us/graph/api/resources/agreement?view=graph-rest-beta

**Example ASC Tenant Exporer Audit Log Filters**

* Service = Terms Of Use
* Category = Policy
* Activity = 
   * Accept Terms Of Use
   * Decline Terms Of Use
   * Create Terms Of Use
   * Delete Terms Of Use
   * Edit Terms Of Use


# IcM Template

Use ASC to open IcM with correct template. 

As alternative, Entra ID TOU issues can be escalated to Entra ID Terms Of Use product group using this IcM template:

[https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=h19VV3](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Yb2193)

# Supportability Documentation

### Training

<https://docs.microsoft.com/en-us/azure/active-directory/governance/active-directory-tou>

<https://docs.microsoft.com/en-us/azure/active-directory/active-directory-saas-access-panel-user-help>

<https://docs.microsoft.com/en-us/azure/active-directory/active-directory-saas-access-panel-introduction>
*Italic text*

