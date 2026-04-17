---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/Learn: Purview Message Encryption/Learn: How do Shared Mailboxes and encrypted emails work?"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FLearn%3A%20Purview%20Message%20Encryption%2FLearn%3A%20How%20do%20Shared%20Mailboxes%20and%20encrypted%20emails%20work%3F"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Learn: Shared Mailboxes and Encrypted Emails (MIP/AADRM)

> Work in progress — big picture conceptual overview. Not authoritative.

## Problem Scope

Accessing encrypted emails sent to shared mailboxes is **only a problem in Outlook for Windows (desktop)**. OWA, New Outlook, Outlook for Mac, and mobile Outlook work fine.

**Why?** MIP encryption (RMS/AIP/AADRM) grants rights to an email address. AADRM determines decryption rights by comparing user identities with addresses in the publishing license. Shared mailboxes don't exist in Entra — they live in EXO — so AADRM can't query Entra about shared mailbox membership the normal way.

## Two Configuration Methods

### Method 1: User Directly Assigned to Mailbox (original method)
Requirements:
- Assign user to shared mailbox with **full permissions**
- Ensure **automapping is enabled**

How it works: Automapping lets EXO inform Entra of the user↔mailbox relationship. AADRM queries Entra and resolves the mapping.

### Method 2: Mail-Enabled Security Group Assigned to Mailbox (new in 2024)
Requirements:
- Assign a **mail-enabled security group** to the shared mailbox
- Users must be on **Outlook build 2402 or higher** (MIP SDK required — not the older MSIPC)

How it works:
1. Outlook authenticates against Entra, connects to AADRM via MIP SDK
2. Outlook presents the publishing license (PL) to AADRM
3. AADRM builds user identity list
4. AADRM decrypts the PL — if shared mailbox info is present (added by EXO transport), calls into EXO
5. EXO returns email addresses associated with the shared mailbox
6. AADRM adds those addresses to the user's identity list and evaluates rights

> EXO transport modifies the PL in transit to embed message ID + shared mailbox ID, enabling this new flow.

## Key Dependency: Outlook Build 2402+
The new security group method requires Outlook 2402+. This build switched to using the MIP SDK (replacing the older MSIPC library), which enables the EXO→AADRM shared mailbox query flow.

## Reference
- [Can I open encrypted messages sent to a shared mailbox?](https://learn.microsoft.com/en-us/purview/ome-faq?view=o365-worldwide&preserve-view=true#can-i-open-encrypted-messages-sent-to-a-shared-mailbox-)
- [How MIP encryption works](https://learn.microsoft.com/en-us/azure/information-protection/how-does-it-work)
