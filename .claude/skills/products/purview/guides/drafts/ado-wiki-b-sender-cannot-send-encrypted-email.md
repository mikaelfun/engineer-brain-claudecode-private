---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/Troubleshooting Scenarios: Purview Message Encryption/Scenario: Sender cannot send encrypted email"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Sender%20cannot%20send%20encrypted%20email"
importDate: "2026-04-06"
type: troubleshooting-guide
---

<!--- ScenarioHeader --->

[[_TOC_]]


# Scenario

- Unable to Send an encrypted message 
- Encrypted labels / templates not showing

# Prerequisites

To follow these steps, you will need:

- Details about the message
  - Type of encryption: Label or Template (take a quick look at [Encryption Type Possibilities Summary](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-0%3A-encryption-type-possibilities-summary) - **Step 0**)
  - The specific Label Name or RMS template name that is being applied
  - What is the encryption method applied (take a quick look at [Encryption Methods Possibilities Summary](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10249/How-To-Check-Encryption-Method?anchor=step-0%3A-encryption-methods-possibilities-summary) - **Step 0**)
  - The exact sender and recipient the message was sent (email address)
- Is the receiver Internal (cloud), Internal (On Premises) or external and what's the email address
- Who is sending the message (email address)?
- ExchangeOnlineManagement (EXO) Powershell Module installed <u>might</u> be necessary
- PSR and EMT <u>might</u> be necessary

# Step by Step Instructions

## Step 0: Checking Licenses and features:

You can check [Encryption general licensing requirements view](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/12293/How-To-Check-OME-Capabilities#:~:text=For%20general%20features%3A%20Microsoft%20365%20Compliance%20Licensing%20Comparison%20(pdf%20file)) for a general understanding of which licenses are needed for encryption features

## Step 1: Determine Issue Scope:

In this step, we need to understand what is the issue specifically. 

- **1.** Issues with Label / Template Display:

  - Is the sensitivity Button Available? (Compare OWA & Outlook)
  - Is the Encrypt button available? (Compare OWA & Outlook)
  - Is the Label Present in the Sensitivity Dropdown? (Compare OWA & Outlook)
  - If using Template, is Template available? (mostly applicable to Outlook desktop)
  - If using a Transport Rule (ETR) or DLP, are the templates available to be selected?
<br><br>

- **2.** Issues with Sending the mail specifically:
  - What is Encryption method and Type? 
    - For quick view on Method, check [Encryption Methods Possibilities Summary](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10249/How-To-Check-Encryption-Method?anchor=step-0%3A-encryption-methods-possibilities-summary) - **Step 0**
    - For quick view on Type, check [Encryption Type Possibilities Summary](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-0%3A-encryption-type-possibilities-summary) - **Step 0**
  - Is the Sender receiving an NDR (Non-Delivery Report) after sending or message does reach the receiver?
    - If the message does reach receiver:
      - Compare the **Expected** reading experience **vs**. **Actual** reading experience:
        - Inline experience - message decrypts in the users inbox:
    <Br>![image.png](/.attachments/image-9efd3681-641a-4865-82d7-a74738133a63.png)

        - Office Message Encryption (OME) wrapper (common for non-365 recipient - Ex: gmail)
    <br>![image.png](/.attachments/image-cb541d27-225c-4a4a-8c75-9439be443e4f.png)

  - What type of Message? (Normal message, Meetings, Auto reply, etc.)
  - What type is the **Sender** Mailbox?
    - User Mailbox - Supported
    - Shared Mailbox
      - Via Outlook - Not Supported: [About Shared Mailboxes](https://learn.microsoft.com/en-us/microsoft-365/admin/email/about-shared-mailboxes?view=o365-worldwide#:~:text=You%20can%27t%20encrypt,was%20encrypted%20with)
      - Via ETR - Supported: [Can I send as a shared mailbox and encrypt emails?](https://learn.microsoft.com/en-us/purview/ome-faq#can-i-send-as-a-shared-mailbox-and-encrypt-emails-)
    - Delegate - Not supported to send from delegate Mailbox except if using ETR
    - A Distribution List (DL) Or Group - Not advisable since it can have the same issue as the Shared Mailboxes and not advisable since it can be throttled by the RMS service due to high number of members 
  - What type of **Receiver** is the customer sending to? 
    - Is the **receiver Internal or External**? 
      - User to User - Supported
      - Shared Mailbox. Can have issues to open like mentioned above and only supported on OWA via `Open Another Mailbox` and on Outlook with Mbx permissions and automapping set.
      - User to Delegate of a a User (ex: mail sent to CEO but its the secretary that can't open) - **Supported only on OWA** as per [Consistently block delegates or shared mailbox members from accessing protected messages in Outlook](https://techcommunity.microsoft.com/blog/exchange/consistently-block-delegates-or-shared-mailbox-members-from-accessing-protected-/3473764#:~:text=Delegate%20access%3A%20when%20delegates%20are%20granted%20FullAcccess%20to%20the%20owner%27s%20mailbox%2C%20their%20access%20to%20encrypted%20mail%20varies%20depending%20on%20the%20Outlook%20client%20they%20are%20using) 
      - A Distribution List (DL) Or Group - Not advisable since it can be throttled by the RMS service due to high number of members 

  **Important**: Beware of message Forwardings. If a sender is using a label with User Defined Permissions or Encrypt Only, the email permission won't be extended to auto-forwarded messages or via inbox rule.

## Step 2: Determine the Method & Type of encryption

If you haven't done so, we'll need to check Encryption Method and Type

- What is the Encryption Method being applied? 
<br>Refer to [How To: Check Encryption Method](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10249/How-To-Check-Encryption-Method) - You'll find several ways in the article to check each Method.

- What is the Encryption Type being applied? 
<br>Refer to [How To: Check Encryption Type - **Step 0**](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-0%3A-encryption-type-possibilities-summary) and [How To: Check Encryption Type - **Step 1**](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-1%3A-what-are-the-encryption-types-available%3F)

## Step 3: Test other clients/Apps or methods:

Compare the affected app with other apps. Ex: Imagine that the cu is trying to use OWA.

- If issue is when sending from on OWA, does it repro in Outlook desktop?
  - Sending from Outlook classic, is it the same?<br>
<br>
- If issue is when sending from on Outlook desktop (Classic), does it repro in OWA?
  - Sending from OWA, is it the same?<br>
<br>
- Additionally, you can check and compare if:
  - If another method is Used, does it work?
  - If its another sender does it work?
  - Are there any other Encryption Labels/templates that work?

**Note**: In case **issue is only happening in Outlook Classic/New Outlook, Outlook team should be engaged**.

## Step 4: Determine Permissions

Permission check is needed when:
- Cu can't see the labels on their apps to use. Or, the sensitivity / Encrypt button is greyed out
- Cu can see labels but when sending an email they either get an error (NDR) or encrypted message isn't able to be read
  - NDR example (not unique, there are more, its just an example of one):
    <br>`Remote server returned '550 5.7.161 PrelicenseAgent; Reject if recipient has no rights'`
    <br>_**Note**:You might not get an error and recipient still has no rights (i.e., no permission to open)_

As such we need to determine:
  - From Sender Side - Permission to use that Label / Template
    - Does the sender have permissions? Refer to [How To: Check Encryption - Step 3: Use Encrypted content (USAGE perm.)
](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-3%3A-how-to-verify-encryption-permission---use-encrypted-label-/-template-(usage-perm.)%3A) and [How To: Check Encryption - Step 4: Additional possible checks](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-3%3A-how-to-verify-encryption-permission---use-encrypted-label-/-template-(usage-perm.)%3A) 
  - From the receiver's email - Permission to Open Encrypted content
    - Does the recipient have permissions? Refer to [How To: Check Encryption - Step 2: Check Open Encrypted content (CONSUME perm.)
](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-2%3A-how-to-verify-encryption-type-%26-permission---open-encrypted-content-(consume-perm.)%3A)

**Additionally**, for **Shared / Delegate mailbox only**:

- First step is to connect to Exo PS (For steps on how to install / connect to Exo PS be sure to follow [Step 1A - Install Exo PS](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10377/How-to-Install-and-Connect-to-PowerShell-Modules?anchor=step-1a%3A-install-exchange/scc-module) and [Step 2A - Connect to Exo PS](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10377/How-to-Install-and-Connect-to-PowerShell-Modules?anchor=step-2a%3A-connect-to-exchange-online) from **"How to: Install and Connect to PowerShell Modules"**)
- Second step is to check full access permissions: [Checking Mbx Perm. - Step 2: Checking Full access](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-2%3A-checking-full-access-permissions)
- Followed by Automapping permissions: [Checking Mbx Perm. - Step 3: Checking AutoMapping](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-3%3A-checking-automapping)
- Next is checking for IRM blocks in the mailbox: [Checking Mbx Perm. - Step 5: Checking MailboxIrmAccess](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-5%3A-checking-mailboxirmaccess)
- Finally, its common for some permissions not replicating correctly and we can remove and re-add FullAccess permissions: [Checking Mbx Perm. - Step 6A: Remove and Re-Add FullAccess permissions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-6a%3A-remove-and-re-add-fullaccess-permissions)

## Step 5: Are Labels available?

Can the sender see the Labels? 
<br>If using ETR/DLP do the templates show to select? 
<br>Can he see but not select label or send encrypted mail?

If permissions are in place, but labels still do not show or "Sensitivity" button is greyed out or they aren't available on ETR/DLP to be selected
- For Outlook Classic:
  - Perform a Client Reset - Refer to [How to: Reset using ComplianceUtility](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10115/How-to-Use-UnifiedLabellingSupportTool-or-ComplianceUtility-to-perform-Label-Reset-on-Office-Desktop-apps-or-local-machine), **Step 1** & **Step 2**
  - Collect fiddler after the reset
- For OWA or ETRs/DLP:
  - You cannot do a reset, but you can Confirm if the encryption settings are correct for EXO - Refer to [How to: Verify and set IRM](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9036/How-to-Verify-and-set-the-Information-Rights-Management-(IRM)-Configuration-for-Purview-Message-Encryption) 
  - You can confirm if there are any specific restrictions - Refer to [How To: Check Encryption - Step 4: Additional possible checks](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-3%3A-how-to-verify-encryption-permission---use-encrypted-label-/-template-(usage-perm.)%3A)
  - Specific to OWA Only: Labels not showing - **After all the above steps**, collect a .har (as per [How to: Get Har Trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10412/How-to-Get-Har-Trace-(including-Pop-Ups)?anchor=step-1%3A-starting-the-trace) and filter entries by `compliance`. You should get 2 lines. One for the templates and other for the labels. For the Label that you're troubleshooting, search for `Setting_Enabled` which, if sender has permissions, should be true

Lastly, you can **try to ask the customer to create a new Label** and **add it to a new policy** (preferably only scoped to the admin so that other users aren't impacted) and **wait 24h**. This will **trigger a sync in the backend** and it can help in making the rest of the labels available to users.

**NOTE**: Do consider that, some clients do have their own limitations and, they might not support all Encryption Types. Ex: Flows in PowerApps or Office Online apps not displaying UDP Labels yet.

## Step 6: Specific scenarios

Following on the previous step, let's take a look at very common scenarios that can lead to either unexpected results or even labels not showing/able to be used<br>

**1.** Like mentioned, **sending from a Delegate/Shared mailbox** are only supported via ETR (Shared Mailboxes) or via ETR and OWA (Delegate mailboxes). If the sender is one of these, mailbox **permission to access** the Shared or delegate mailbox **are still needed**

- As such, first step is to connect to Exo PS
- Second step is to check full access permissions: [Checking Mbx Perm. - Step 2: Checking Full access](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-2%3A-checking-full-access-permissions)
- Followed by Automapping permissions: [Checking Mbx Perm. - Step 3: Checking AutoMapping](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-3%3A-checking-automapping)
- Next is checking for IRM blocks in the mailbox: [Checking Mbx Perm. - Step 5: Checking MailboxIrmAccess](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-5%3A-checking-mailboxirmaccess)
- Finally, its common for some permissions not replicating correctly and we can remove and re-add FullAccess permissions: [Checking Mbx Perm. - Step 6A: Remove and Re-Add FullAccess permissions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-6a%3A-remove-and-re-add-fullaccess-permissions)

**2.** **Other** very specific **scenarios that can cause labels not to show/show partially** but commonly present is Label / Label Policy misconfigurations:

- Labels that are configured for all users but Template is only published to a few users
  - A common example of this is running a `Get-Label "LabelName"|FL Settings` and finding param `aiptemplatescope` set only to specific users or groups. This is due to the template being configured with `ScopedIdentities` and needs to be cleared

- Customers can have labels under other labels, like a file within a folder. We designate the Main label as the Root Label and labels under it as Sub Labels.
  - If only Root labels are added to a Label Policy, they can't be used as they are linked to the Sub Labels
  - Same if only Sub Labels are published on a label policy. They need the Root to be shown
  - If a Root Label has encryption, Sub Labels can't be applied but you can't select the Root either or leas to unexpected behavior
  - Both Root and Sub-Label are published but again, the aiptemplatescope is set on one of them

- Label Policies referencing default labels that either no longer exist or have a content type that is not configured for that app. Ex: Configuring Label for files only and set it as Outlook Default Label

- There are many, but many more and detecting them often depend on taking special attention to Label/Label Policy details, checking documentation and most importantly, test and try to replicate the issue

For all the above, the label and Label Policy configuration needs to be checked carefully as we constantly get escalations of Labels not showing or the button is greyed out due to these misconfigurations

## Step 7: Check Mail Flow

**Note**: If your issue is related with labels not being displayed or `Sensitivity` button is greyed out, you can skip this step.

Often in Encryption the way the email is routed can also impact the outcome / readability of the message. Always consider trying to ask the customer to test without routing via them or creating exceptions, even if just for the duration of the case. Below are some of the things to consider and that can impact:

- Disclaimers
  - ETR Disclaimers
- 3rd Party Services
  - Signature services, 3rd party spam filters, 3rd party DLP, 3rd party disclaimers
- On Prem
  - On Prem has specific requirements (and steps) to follow but most importantly, even when having an On Premises exchange, if the receiver is external, messages need to be sent by Exo, they can't be sent from Exchange On Premises (being a cloud or on Prem Sender - Refer to [I have a Hybrid env. Can I use this feature?](https://learn.microsoft.com/en-us/purview/ome-faq?view=o365-worldwide#my-organization-has-an-exchange-hybrid-deployment--can-i-use-this-feature-))

Why are 3rd parties so relevant? Because 3rd party servers often cannot process encrypted content (as they have no access to it) and might they end up processing the encrypted message incorrectly and thus, impacting the email authentication.

<u>**Note**</u>: We'll now approach on how to check all the above but do consider that, if **your customer is the sender and sending to external** recipient, **you might not get a full view of the mail flow**, since you're missing the receiver side. 
<br>**When this happens**, ask the customer to send a test encrypted email to your environment (consider you need permission to open as well on the Label / Template if cu not using UDP Label)

### Step 7A: Check 3rd parties using Message Header Analyzer (MHT) 

To check this using a message header you'll need the header of a message (even if the recipient gets the OME Wrap, get the headers of the message containing the Wrap / "Click To Read the message".

- So, for steps on how to collect the message header and use the Message header analyzer tool follow [How to: Message Header Analyzer Tool - Step1: Header Extraction](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9605/How-to-Message-Header-Analyzer-Tool?anchor=step-1%3A-header-extraction) and [How to: Message Header Analyzer Tool - Step 2: Access Message header Analyzer and paste the headers](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9605/How-to-Message-Header-Analyzer-Tool?anchor=step-2%3A-access-message-header-analyzer-and-paste-the-headers)

- If having header parsing errors in the MHT, check [MHT - Parsing issues](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9605/How-to-Message-Header-Analyzer-Tool?anchor=step-2%3A-access-message-header-analyzer-and-paste-the-headers#:~:text=Sometimes%20you%20might%20try%20to%20parse%20the%20headers%20in%20mht%20and%20you%20see%20something%20like%20this)

- Finally, check [How to: Message Header Analyzer Tool - Step 5: Check for possible 3rd parties using the mail header](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9605/How-to-Message-Header-Analyzer-Tool?anchor=step-5%3A-check-for-possible-3rd-parties-using-the-mail-header) to see if you find any possible 3rd parties

### Step 7B: Check 3rd parties / On Prem using EMT

Like mentioned in the previous step, 3rd party headers & Hops can be omitted in the message header. As such, the best way to try and find possible 3rd Parties is to check for the presence of connectors.

- As such, first we need an Extended Message Trace (EMT). Follow [How to: Get and read a message trace detail - Step 1: Get the Message ID of the email](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message?anchor=step-1%3A-get-the-message-id-of-the-email) to get the message ID

- Next, we need to get the actual EMT. Follow [How to: Get and read a message trace detail - Step 2: Getting EMT](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message?anchor=step-2%3A-get-the-extended-message-trace)

- Finally, we'll need to check for eventual connectors and for this follow [How to: Check Inbound or Outbound connectors in Detailed Message Trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9736/How-to-Check-Inbound-or-Outbound-connectors-in-Detailed-Message-Trace)
  - **Specific for On Premises Exchange**:
    - On the trace you'll find an On Premises type Connector usually (but not always) starting with "Outbound to `GUID Nº`"
    - This will be the hybrid connector. To know if messages are being routed via On Premises, connected to Exo PowerShell run:
      <br>`Get-OutboundConnector "Connector Name" |FT RouteAllMessagesViaOnPremises`
    - If the above returns true, and its the connector mentioned on the trace, messages are being sent out by the On Premises server

Remember that, in this context what we want to understand is the routing of the email. Are connectors not supported? They are but the way email is routed can impact the final outcome and its also helpful to try to replicate the issue. Once we have a better understanding we can ask cu to create connector exceptions for test accounts when troubleshooting the issue and see the outcome on of said exception in the final recipient when reading the message.

**Note:** It's also worth mentioning to check conflicting Transport Rules (ETRs). For this or connectors, be sure to access Assist and run the `Display Mail Flow Overview` Diagnostic as it will tell you Transport rules and connector details of a tenant.

### Step 7C: Disclaimers

Here, we'll be making a mention to Disclaimers. Custom Disclaimers in Exchange Online are message footers added to outgoing emails using mail flow rules (transport rules). They can include legal notices, branding, confidentiality statements, or other information. Disclaimers support HTML, plain text, and images, and can be dynamically customized using attributes like sender or recipient details.

Example of html Disclaimer applied via ETR:
<br>![image.png](/.attachments/image-7834f05f-b537-4312-b639-c467fd928394.png)

- Why are disclaimers important in this scenario? Because two things:
  - In Exo, disclaimers can be applied via ETR. And they'll be applied in the majority of scenarios. But an issue might arise if  on the ETR the fallback action defined on "when Disclaimer can't be applied > Wrap" (`ApplyHtmlDisclaimerFallbackAction: Wrap` in PS), which causes message encapsulation* and therefore, can impact the "readability" of the message
    - In Exo, you can verify if a transport rule applies Disclaimers and the fallback action by running 
    <br>`Get-TransportRule | ? {$_.Description -match "Disclaimer"}|FL Name,Description,ApplyHtmlDisclaimerFallbackAction`
    - Reinforcing again the fact that you can retrieve the cu's rules Via Assist - `Display Mail Flow OverView` diagnostic
  - Disclaimers can be placed via ETR or via 3rd party encapsulating* the message, which again, might often result in unexpected behaviors for the final recipient when trying to open the message.

***Note**: Message Encapsulation refers to the process of placing the original message inside another message. When having encrypted content, encapsulating the message (placing the original message inside a new message), among others which often results in unexpected behaviors for the final recipient when trying to open the message.

**Additional Note 1**: In the case of 3rd Parties, they might not even be trying to apply a disclaimer and still cause encapsulation. This is due to the fact that they don't have permissions to process the message and end up encapsulating the original encrypted mail into a new mail.

**Additional Note 2**: It can also happen that the Disclaimer is being placed by a 3rd Party even before the message reaches Exo or after it leaves Exo.

## Step 8: Conditional access

Conditional access is a feature that many customers use to increase and enforce security methods. Conditional access
enforces access policies based on conditions like user identity, device, location, and risk level. It controls access to apps and data using policies that require multi-factor authentication (MFA), device compliance, or specific network locations.

But, can conditional access impact the sender? It can if it ends up blocking specific apps (found on Azure under Enterprise apps) like "Microsoft Information Protection", "Office 365 Apps", "Exchange Online", "Azure Information protection" among others.

It can also impact the receiver no matter if its internal, On Prem (Internal) or External but they mostly are found in External or On Premises receivers.

You can check the majority of a customer's Conditional Access policies via Azure Support Center (ASC) but, at this point, the best option is to use Azure Support Center to find and analyze the customer conditional access policies, restrictions and requirements. Take note of policies that could be impacting the issue and engage IDO team if help is needed on analyzing them. Asking to create exceptions for a test user can and should also be suggested.

## Step 9: Get Assistance

If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10526/Required-Information-Purview-Message-Encryption)

Include:
- EMT, PSR & Involved Recipients
- Labels & label Policy Output (preferably from PS and no filtering)
- Target Label & Label Policy ID
- Encryption Method & Encryption Type
- If delegates, include all mailbox permissions output from PS
- Har / Fiddler trace after a client reset (applicable only when labels aren't displayed)

<!--- ScenarioFooter --->

<br> <div style="text-align: right;"> <small><small><small><em>Created by: <span style="color: blue;">mapere</span></em></small></small></small> </div>





