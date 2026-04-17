---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/Troubleshooting Scenarios: Purview Message Encryption/Scenario: Recipient is not able to read an encrypted email"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Recipient%20is%20not%20able%20to%20read%20an%20encrypted%20email"
importDate: "2026-04-06"
type: troubleshooting-guide
---

<!--- ScenarioHeader --->

[[_TOC_]]


# Scenario

Describe the scenario. List different wordings under this scenario:
- Unable to read an encrypted message 
- Encrypted message won't open

# Prerequisites

To follow these steps, you will need:

- Details about the message
  - Type of encryption: Label or Template (take a quick look at [Encryption Type Possibilities Summary](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-0%3A-encryption-type-possibilities-summary) - **Step 0**)
  - The specific Label Name or RMS template name that was applied
  - What is the encryption method applied (take a quick look at [Encryption Methods Possibilities Summary](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10249/How-To-Check-Encryption-Method?anchor=step-0%3A-encryption-methods-possibilities-summary) - **Step 0**)
  - The exact sender and recipient the message was sent (email address)
- What's the Cu expectation (Expected method of decryption):


# Step by Step Instructions

## Step 1: Determine Cu expectation:

Compare the **Expected** reading experience **vs**. **Actual** reading experience:
  - Inline experience - message decrypts in the users inbox:
    <Br>![image.png](/.attachments/image-9efd3681-641a-4865-82d7-a74738133a63.png)
    
  - Office Message Encryption (OME) wrapper (common for non-365 recipient - Ex: gmail)
    <br>![image.png](/.attachments/image-cb541d27-225c-4a4a-8c75-9439be443e4f.png)

  - Example of not expected in gmail (just an example, there are many more):
    <br>![image.png](/.attachments/image-7148d67a-cb23-44bb-8b19-f8f82d97fdf6.png)

## Step 2: Determine the method of encryption

How is Encryption being applied? 
<br>Refer to [How To: Check Encryption Method](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10249/How-To-Check-Encryption-Method)

## Step 3: Test other clients:

Compare the affected app with other apps

Ex: Imagine that the cu is trying to use OWA

- If issue is happening on OWA, does it repro in Outlook desktop?
  - Here consider both ends of the email chain:
    - Sending from Outlook classic, is it the same?
    - Opening from Outlook classic is the same?

If issue on Outlook do the same for OWA and see if it you have repro too.

**Note**: In case issue is only happening in Outlook Classic, Outlook team should be engaged.

## Step 4: Determine sender & recipient details

What are the email addresses involved? What are the details of the recipients involved? 
- **Sender**
  - User Mailbox
  - Shared Mailbox
    - Via Outlook - Not Supported: [About Shared Mailboxes](https://learn.microsoft.com/en-us/microsoft-365/admin/email/about-shared-mailboxes?view=o365-worldwide#:~:text=You%20can%27t%20encrypt,was%20encrypted%20with)
    - Via ETR - Supported: [Can I send as a shared mailbox and encrypt emails?](https://learn.microsoft.com/en-us/purview/ome-faq#can-i-send-as-a-shared-mailbox-and-encrypt-emails-)
  - Delegate - Not supported to send from delegate Mailbox except if using ETR
- **Receiver**
  - Internal Receiver
    - User Mailbox
      - User to User - Supported
      - User to Delegate of a a User (ex: mail sent to CEO but its the secretary that can't open) - **Supported only on OWA** as per [Consistently block delegates or shared mailbox members from accessing protected messages in Outlook](https://techcommunity.microsoft.com/blog/exchange/consistently-block-delegates-or-shared-mailbox-members-from-accessing-protected-/3473764#:~:text=Delegate%20access%3A%20when%20delegates%20are%20granted%20FullAcccess%20to%20the%20owner%27s%20mailbox%2C%20their%20access%20to%20encrypted%20mail%20varies%20depending%20on%20the%20Outlook%20client%20they%20are%20using) 
        - Please refer to [Scenario: Cannot open Encrypted message sent to Shared or Delegate Mailbox](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10309/Scenario-Cannot-open-Encrypted-message-sent-to-Shared-or-Delegate-Mailbox)
    - Shared - Please refer to [Scenario: Cannot open Encrypted message sent to Shared or Delegate Mailbox](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10309/Scenario-Cannot-open-Encrypted-message-sent-to-Shared-or-Delegate-Mailbox)
  - External Receiver - Both supported if no 3rd Parties involved in the mail flow
    - 365 recipient
    - Non-365 Recipient (e.g., gmail, yahoo, etc)

**Important**: Beware of message Forwardings. If a sender is using a label with User Defined Permissions or Encrypt Only, the email permission won't be extended to forwarded messages via inbox rule.

## Step 5: Check label / Template Permissions

In this Case we need to ensure our receiving user has rights to open / consume encrypted content. This step will depend on the type of message (Internal Vs External).

**A.** If its internal message or your customer is the sender:

- Does the recipient have permissions? Refer to [How To: Check Encryption - Step 2: Check Open Encrypted content (CONSUME perm.)
](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-2%3A-how-to-verify-encryption-type-%26-permission---open-encrypted-content-(consume-perm.)%3A)

**B.** If your cu is the receiver (and message is external):

- **Follow** the **next step (Step 6)**. If you reach **Step 7**, collect an EMT from receiver and search for `IRMPD`. If the recipient does have permissions you'll see `S:IRMPD=I|Dec=DecReq;S:IRMPD=I|Dec=Succ` (means decryption was successful). If he doesn't, you'll see just `S:IRMPD=I|Dec=DecReq;`, no success in decrypting by transport.

## Step 6: Reset Local client (applicable only to Outlook Desktop (classic) / Office Desktop Apps)

For local client apps, you can force the reset of the RMS templates or Labels in the PC. This will force the app to re-download all templates, Labels and policies again to the machine. 
<br><br> This can often be a troubleshooting step in the receiver side to force the Client to try and get the permission to open the encrypted message. Once you double-click and message doesn't open, Outlook Classic will not try to get the permission again. If changes were done or, you want to test on an old email that didn't open you can try the below.

- To install the Compliance Utility follow [How to: Use ComplianceUtility to perform Reset on Office - Step 1: Install The tool](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10115/How-to-Use-UnifiedLabellingSupportTool-or-ComplianceUtility-to-perform-Label-Reset-on-Office-Desktop-apps-or-local-machine?anchor=step-1%3A-install-the-tool)

- To perform the reset, once installed, follow [How to: Use ComplianceUtility to perform Reset on Office - Step 2: Perform a client Reset](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10115/How-to-Use-UnifiedLabellingSupportTool-or-ComplianceUtility-to-perform-Label-Reset-on-Office-Desktop-apps-or-local-machine?anchor=step-2%3A-perform-a-client-reset)

## Step 7: Check Mail Flow

Often in Encryption the way the email is routed can also impact the outcome / readability of the message. It can impact both scenarios considered below:

- If Inline Experience is expected (mail to decrypt upon clicking it) but getting OME Wrap
- If Ome Message Wrap is expected but can't open after clicking "Read the message"

If either the above are true, next step is to check the mail flow of the email. In this case we'd be looking for 3rd Party services (of any kind) and if any eventual disclaimers were added to the message

Why? Because 3rd party servers often cannot process encrypted content (as they have no access to it) and might they end up processing the encrypted message incorrectly or placing/removing specific headers and thus, impacting the email authentication.

### Step 7A: Check 3rd parties using Message Header Analyzer (MHT) 

To check this using a message header you'll need the header of a message (even if the recipient gets the OME Wrap, get the headers of the message containing the Wrap / "Click To Read the message".

- So, for steps on how to collect the message header and use the Message header analyzer tool follow [How to: Message Header Analyzer Tool - Step1: Header Extraction](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9605/How-to-Message-Header-Analyzer-Tool?anchor=step-1%3A-header-extraction) and [How to: Message Header Analyzer Tool - Step 2: Access Message header Analyzer and paste the headers](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9605/How-to-Message-Header-Analyzer-Tool?anchor=step-2%3A-access-message-header-analyzer-and-paste-the-headers)

- If having header parsing errors in the MHT, check [MHT - Parsing issues](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9605/How-to-Message-Header-Analyzer-Tool?anchor=step-2%3A-access-message-header-analyzer-and-paste-the-headers#:~:text=Sometimes%20you%20might%20try%20to%20parse%20the%20headers%20in%20mht%20and%20you%20see%20something%20like%20this)

- Finally, check [How to: Message Header Analyzer Tool - Step 5: Check for possible 3rd parties using the mail header](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9605/How-to-Message-Header-Analyzer-Tool?anchor=step-5%3A-check-for-possible-3rd-parties-using-the-mail-header) to see if you find any possible 3rd parties

### Step 7B: Check 3rd parties using EMT

Like mentioned in the previous step, 3rd party headers & Hops can be omitted in the message header. As such, the best way to try and find possible 3rd Parties is to check for the presence of connectors.

- As such, first we need an Extended Message Trace (EMT). Follow [How to: Get and read a message trace detail - Step 1: Get the Message ID of the email](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message?anchor=step-1%3A-get-the-message-id-of-the-email) to get the message ID

- Next, we need to get the actual EMT. Follow [How to: Get and read a message trace detail - Step 2: Getting EMT](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message?anchor=step-2%3A-get-the-extended-message-trace)

- Finally, we'll need to check for eventual connectors and for this follow [How to: Check Inbound or Outbound connectors in Detailed Message Trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9736/How-to-Check-Inbound-or-Outbound-connectors-in-Detailed-Message-Trace)

Remember that, in this context what we want to understand is the routing of the email. Are connectors not supported? They are but the way email is routed can impact the final outcome* and its also helpful to try to replicate the issue. Once we have a better understanding we can ask cu to create connector exceptions for test accounts when troubleshooting the issue and see the outcome on of said exception in the final recipient when reading the message.

**Note1:** It's also worth mentioning to check conflicting Transport Rules (ETRs). For this or connectors, be sure to access Assist and run the `Display Mail Flow Overview` Diagnostic as it will tell you Transport rules and connector details of a tenant.

**Note2:** As for the final outcome, it refers for example the message not being able to be opened or having a OME Wrap experience as described here [Additional Note 1](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9042/Scenario-Recipient-is-not-able-to-read-an-encrypted-email#:~:text=open%20the%20message.-,Additional%20Note%201,-%3A%20In%20the%20case) and below on disclaimers section.


### Step 7C: Disclaimers

Here, we'll be making a mention to Disclaimers. Custom Disclaimers in Exchange Online are message footers added to outgoing emails using mail flow rules (transport rules). They can include legal notices, branding, confidentiality statements, or other information. Disclaimers support HTML, plain text, and images, and can be dynamically customized using attributes like sender or recipient details.

Example of html Disclaimer applied via ETR:
<br>![image.png](/.attachments/image-7834f05f-b537-4312-b639-c467fd928394.png)

- Why are disclaimers important in this scenario? Because two things:
  - In Exo, disclaimers can be applied via ETR. And they'll be applied in the majority of scenarios. But an issue might arise if  on the ETR the fallback action defined on "when Disclaimer can't be applied > Wrap", which causes message encapsulation* and therefore, can impact the "readability" of the message
    - In Exo, you can verify if a transport rule applies Disclaimers and the fallback action by running 
    <br>`Get-TransportRule | ? {$_.Description -match "Disclaimer"}|FL Name,Description,ApplyHtmlDisclaimerFallbackAction`
    - Reinforcing again the fact that you can retrieve the cu's rules Via Assist - `Display Mail Flow OverView` diagnostic
  - Disclaimers can be placed via ETR or via 3rd party encapsulating* the message, which again, might often result in unexpected behaviors for the final recipient when trying to open the message.

***Note**: Message Encapsulation refers to the process of placing the original message inside another message. When having encrypted content, encapsulating the message (placing the original message inside a new message), among others which often results in unexpected behaviors for the final recipient when trying to open the message.

**Additional Note 1**: In the case of 3rd Parties, they might not even be trying to apply a disclaimer (could be a signature or scanning service) and still cause encapsulation. This is due to the fact that they don't have permissions to process the message and end up encapsulating the original encrypted mail into a new mail.

**Additional Note 2**: It can also happen that the Disclaimer is being placed by a 3rd Party even before the message reaches Exo or after it leaves Exo.

## Step 8: OME Messages Only or unexpected wrapper

If the Wrap experience is expected or, wrapper isn't expected but we're confirming if the recipient can open from OME, and there were no 3rd parties, Disclaimers are not present and all the steps before were checked, try to see where the experience stops.

- In other words, is the "Sign In with ..." or "Sign-in with a one Time passcode" screen reached? 
- After this is the code received?
- What happens when they try to open after the code?
- If they are using "Sign in with..", does it work if they select the OTP code option?

To better understand and analyze the issue for all the above possibilities, we'll need a .har trace while replicating the recipient trying to open. 

- As such check [How to: Get Har Trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10412/How-to-Get-Har-Trace-(including-Pop-Ups)?anchor=step-1%3A-starting-the-trace)

- Alternately **if you need to capture .har trace data for the Ome Pop-up or new window**, follow [How to: Get Har Trace - Step 2: Starting the trace for Pop-Ups](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10412/How-to-Get-Har-Trace-(including-Pop-Ups)?anchor=step-2%3A-starting-the-trace-for-pop-ups)

- On the trace, specially for OME, filter the trace for terms like `Encryption`, `E4E`, `GetItem` or `compliance` and check the `response` field. Compare the info on what you see on labels & their permissions.

## Step 9: Conditional access

Conditional access is a feature that many customers use to increase and enforce security methods. Conditional access
enforces access policies based on conditions like user identity, device, location, and risk level. It controls access to apps and data using policies that require multi-factor authentication (MFA), device compliance, or specific network locations.

As you can imagine, this can impact the opening of and encrypted message as well, since you need to authenticate to see the content. In the majority of scenarios the sender of the encrypted message is external to the receiver user that can't open the message but we have seen some cases in which it ends up impacting internal recipients as well. Also, its mostly reflected on Outlook Classic but, it can affect OWA as well if the sender is external (or if the receiver is On Prem).

You can check the majority of a customer's Conditional Access policies via Azure Support Center (ASC) but, if your customer is the receiver, you won't be able to access the sender's Conditional access.

In most cases, customer will need to create a guest account for the external user to provide access to the encrypted items.

At this point, the best option is to run a fiddler/har trace on the affected machine and search for failed events to login and engage the IDO team if you do see these failed.

Please refer this article and confirm whether the customer is meeting the requirement for Conditional Access for encrypted items.
[Microsoft Entra configuration for content encrypted by Microsoft Purview Information Protection | Microsoft Learn](https://learn.microsoft.com/en-us/purview/encryption-azure-ad-configuration)

**Note:** For attachments specifically, please refer to [Scenario: Recipient is not able to open Encrypted Attachment - Overview](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/13472/Scenario-Recipient-is-not-able-to-open-Encrypted-Attachment)

## Step 10: Get Assistance

If the steps above do not resolve your issue, [please get assistance](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9077/How-to-Get-assistance-for-a-case) and get the [required information](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10526/Required-Information-Purview-Message-Encryption)

Include:
- EMT & PSR
- Label Output & ID (if applicable)
- Results of testing with other clients

<!--- ScenarioFooter --->

<br> <div style="text-align: right;"> <small><small><small><em>Created by: <span style="color: blue;">mapere</span></em></small></small></small> </div>



