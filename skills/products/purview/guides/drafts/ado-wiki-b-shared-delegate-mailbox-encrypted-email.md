---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/Troubleshooting Scenarios: Purview Message Encryption/Scenario: Cannot open Encrypted message sent to Shared or Delegate Mailbox"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Cannot%20open%20Encrypted%20message%20sent%20to%20Shared%20or%20Delegate%20Mailbox"
importDate: "2026-04-06"
type: troubleshooting-guide
---

<!--- ScenarioHeader --->

[[_TOC_]]

# Introduction:
This scenario was based on a real live scenario and issue from a customer and is a constant scenario present on escalations. 

**Note**: Scenario is applicable to shared or delegate mailboxes. Remember that opening an encrypted email from a **delegate user is not supported for some apps** (refer to [Block delegates or shared mailbox members from accessing protected messages](https://techcommunity.microsoft.com/blog/exchange/consistently-block-delegates-or-shared-mailbox-members-from-accessing-protected-/3473764#:~:text=Delegate%20access%3A%20when%20delegates%20are%20granted%20FullAcccess%20to%20the%20owner%27s%20mailbox%2C%20their%20access%20to%20encrypted%20mail%20varies%20depending%20on%20the%20Outlook%20client%20they%20are%20using))

# Scenario

Scenario:
- Cannot open Encrypted email on shared/delegate mailbox
- Cannot open encrypted email sent to shared/delegate mailbox

# Prerequisites

To follow these steps, you will need:

- ExchangeOnlineManagement (EXO) Powershell Module installed
- Extended Message Trace (EMT) - preferably recent
- PSR (Problem Step recorder)
- Email account of sender & email account of person opening the message
- Shared mailbox email
- Label / Template being used & Label Policy (if applicable)

# Step by Step Instructions

## Step 0: Scoping the scenario

In this step we will try to understand the scenario a bit better by:

- Asking if only affects a specific shared mailbox
- Asking when email being sent to a user directly if he/she can open
- Asking what is the encryption method being used (for more details in encryption methods, please refer to [How To: Check Encryption Method](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10249/How-To-Check-Encryption-Method)
- If on OWA, ensure the customer is using "Opening another mailbox" from the top right (User's photo)
- Compare the outcome on different clients (ex: if customer using Outlook Classic, ask to test on OWA or vice-versa) and note if the behavior is the same or not

## Step 1: Checking Labels / Templates used (encryption permissions)

In this step we will need to check Encryption permissions. Do note that **we're only checking who can open / consume** encrypted content, **not who can use / select it on their apps**

- Ensure you follow all checks as defined in Step 2 of [How To: Check Encryption Type & Label or Template Permissions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10316/How-To-Check-Encryption-Type-Label-or-Template-Permissions?anchor=step-2%3A-how-to-verify-encryption-type-%26-permission---open-content%3A)

## Step 2: Checking IRM Configurations for EXO

In this step we will check if encryption is correctly set for Exo. If customer is using Outlook, ask to test on OWA or vice versa.

This step is mostly applicable if no users can actually open encrypted messages in OWA. **But**, we can always do a "quick" check even if other users do not see any issues.

- To check if encryption settings are correctly set for Exo, please refer to [How to: Verify and set the Information Rights Management (IRM) Configuration](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/9036/How-to-Verify-and-set-the-Information-Rights-Management-(IRM)-Configuration-for-Purview-Message-Encryption)

## Step 3: Checking permissions for Shared/Delegate Mailbox

In this step we will be checking who has access to the shared/delegate mailbox and if its Auto-Mapped. Automapping is a feature in Microsoft Outlook that automatically maps shared mailboxes to a user's Outlook profile if they have full access permissions. This means that when a user is granted full access to a shared mailbox, it will automatically appear in their Outlook without needing to be manually added

Remember that, **no matter if its OWA or Outlook** mailbox **permission to access** the Shared mailbox **is still needed**

- As such, first step is to connect to Exo PS
- Second step is to check full access permissions: [Checking Mbx Perm. - Step 2: Checking Full access](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-2%3A-checking-full-access-permissions)
- Followed by Automapping permissions: [Checking Mbx Perm. - Step 3: Checking AutoMapping](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-3%3A-checking-automapping)
- Next is checking for IRM blocks in the mailbox: [Checking Mbx Perm. - Step 5: Checking MailboxIrmAccess](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-5%3A-checking-mailboxirmaccess)
- Finally, its common for some permissions not replicating correctly and we can remove and re-add FullAccess permissions: [Checking Mbx Perm. - Step 6A: Remove and Re-Add FullAccess permissions](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10376/How-To-Checking-Mailbox-permissions-for-Shared-or-Delegate-Mailbox?anchor=step-6a%3A-remove-and-re-add-fullaccess-permissions)

## Step 4: Analyzing EMT

In this step we will be taking a quick look in how to analyze an EMT for the scenario in question

- First we'll need to collect the EMT (refer to [How to: Get a Message Trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message?anchor=step-2%3A-get-the-extended-message-trace))
- Once we have the trace, we need to sort it by `date_time` column
- Once sorted, do a search (usually `CTRL+F`) for `S:IRMPL`
- If you find several entries, select the entry that has the shared mailbox address on the collumn `recipient_address`
- Copy that entry into notepad++ & do a `CTRL + F`, select `replace`. Ensure `Search Mode` is set to `extended` On `Find What` place `;` and on `Replace` place `\n`. Hit `Replace All`
- Analyzing the EMT (examples from cases):
  - Working Scenario example: check that IRM processing succeeded for shared mailbox address
  - Non working Scenario: check for IRM failures in the trace row for the shared mailbox recipient

**Important Notes:**
- Once you have the EMT be sure to cross check the info of label / template you see on the trace with label / template settings
- In other words, **if there is a fail, ensure shared mailbox has permissions** set on the label
- **Connectors** can have an impact in the outcome of the message processing
- Messages **routed by 3rd parties** can be affected
- Messages having **disclaimers** can be affected

## Step 5: Get Assistance

If the steps above do not resolve your issue, collect:
- EMT (no older than 4 days)
- PSR showing how the label / template is being applied & how its being opened
- Email/UPN of: SharedMbx, User Sending Msg, User Opening from shared mailbox
- Transcript confirming Label and mailbox permissions
- Label / template being used
- In case of using a Label: `$FormatEnumerationLimit=-1; Get-Label|FL; Get-LabelPolicy|FL`
