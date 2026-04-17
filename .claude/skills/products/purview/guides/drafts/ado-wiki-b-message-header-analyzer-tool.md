---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/How to: Purview Message Encryption/How to: Message Header Analyzer Tool"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Message%20Header%20Analyzer%20Tool"
importDate: "2026-04-06"
type: troubleshooting-guide
---

<!--- HowToHeader --->

[[_TOC_]]

# Introduction

The Message Header Analyzer tool is used to analyze email message headers, providing valuable diagnostic information such as routing paths, spam filter results, and authentication details. 

It will also be useful in determining the complete mail flow, including any third parties involved. This tool shows the path of the **actual mail flow**, highlighting how headers can be placed, removed, or changed by various hosts **which in turn can impact the outcome and readability of an encrypted email**.

Additionally, it is important to note that Exchange Online Protection (EOP) sanitizes some headers in communications to ensure security and compliance, specially when external communications are involved.

# Prerequisites

To follow these steps, you will need:

- A complete message header (either from the customer or using Get Message Details Assist Diagnostic)
- Browser access to [Message Header Analyzer](https://mha.azurewebsites.net/pages/mha.html)

# Step by Step Instructions

## Step 1: Header Extraction

In this step we will be collecting the Message Headers of an email

- Open a received email* (sent emails will either be empty or won't have transport routing information)
  - If on Outlook Classic, go to File > Properties and select all text inside "Internet Headers"
  - If on OWA, go to ... > View > View Message details and select all text of the pop Up
  - If on 3rd party clients they usually also have an option inside the email to "show original" which will display the headers

***Note1:** Header information may vary if you're opening a encrypted email that decrypted inline or if you're having an OME email ("xxx has sent you an encrypted message - click here to read the message")

**Note2:** You cannot retrieve a message header from inside the OME portal message

## Step 2: Access Message header Analyzer and paste the headers
- Access [Message Header Analyzer](https://mha.azurewebsites.net/pages/mha.html)
- Paste Header information and click on "Analyze Headers"

## Step 3: Analyze headers & email Routing
- Once you clicked to analyze headers, you should have something like the below (example from 365 to another 365):
  - **Hop** refers to each step or server that an email passes through from the sender to the recipient by processing order.
  - **Submitting Host** is the server that submits the mail.
  - **Receiving Host** is the server that receives the mail.
  - **Time** indicates the timestamp when the email was received by each server.
  - **Delay** shows the amount of time taken for the email to move from one server to the next.
  - **Type** refers to the type of connection or protocol used for the email transfer. It can also show `Transport Decrypted` which means the email was decrypted during transport for inspection before being re-encrypted.

- If you **don't see Hops at all**, your message might be from "Sent items" — it won't have routing data.

- If you see any domain other than `prod.outlook.com`, `protection.outlook.com`, `outlook.office365.com` or just an IP, the message was routed externally (3rd party relay, anti-spam, on-prem Exchange, etc.). This can impact encrypted email behavior.

- **Headers parsing error in MHA**: If headers appear malformed, save header text to a .txt file and run this PowerShell to fix line wrapping:
```PowerShell
$Path="Path to your File"
$HeaderText=Get-content $Path
$lines = $headerText -split "`r?`n"; $processedLines = @(); $currentLine = ""
foreach ($line in $lines) { if ($line -match "^\s*$") { continue } elseif ($line -match "^\s") { $currentLine += "$line" } else { if ($currentLine) { $processedLines += $currentLine }; $currentLine = $line } }
if ($currentLine) { $processedLines += $currentLine }
$finalText = $processedLines -join "`n"; $NewPath = $Path -replace '(?=\.\w+$)', '1'; $finalText|Out-File $NewPath
```

## Step 4: Interpreting Results and Relevant Headers

Key encryption/label-related headers:

- **msip_labels**: Sensitivity label metadata (GUID, method, SiteID=tenantID, SetDate, Name, ContentBits, Method). **Empty if default EXO EncryptOnly/DNF template used (not a label).**
  - ContentBits bitmask: 0=none, 1=header, 2=footer, 4=watermark, 8=encryption. e.g. 11=header+footer+encryption.
- **Microsoft.Exchange.RMSApaAgent.ProtectionTemplateId**: TemplateID of the label used on the email body.
- **Microsoft.Exchange.RMSApaAgent.ProtectionCustomizationTemplate**: OME Branding template GUID (only in branded messages).
- **Content-Class**: Message type (Rights Protected Message, Encrypted message).

Known template IDs:
- `c026002d-cda6-401e-bfad-28de214d0fba` = **EncryptOnly** (EXO built-in)
- `cf5cf348-a8d7-40d5-91ef-a600b88a395d` = **Do Not Forward** (EXO built-in)
- If `msip_labels` header is populated → a Sensitivity Label was used. If empty → EXO built-in template.

Authentication/routing headers:
- **X-MS-Exchange-Organization-AuthAs**: "Internal" or "Anonymous". Anonymous on internal emails can impact encrypted/OME branded email outcomes.
- **X-Microsoft-Antispam-Mailbox-Delivery**: If contains `ucf:1` → mailbox rules were applied.

## Step 5: Check for possible 3rd parties using the mail header

If you see a non-Microsoft domain in the hops, the message passed through a 3rd party host. This is significant because:
- 3rd parties may strip or modify `msip_labels` headers
- AuthAs may become Anonymous, causing default OME branding
- Encrypted message portals may show endless loops for external recipients

**IP Lookup tools:**
- Public: [Cisco Talos Intelligence](https://www.talosintelligence.com/reputation_center)
- Internal: [MicrosoftIPs](https://csstoolkit.azurewebsites.net/(S(anmnkbr1rnmhhyevvexdqkpl))/Home/MicrosoftIPs)

## Known Issues

- **msip_labels header stripped**: Replies from Outlook.com / hotmail.com / live.com will have the `msip_labels` header stripped (under investigation).
- **Forwarded messages**: `msip_labels` header is removed on forwards (Resolved — no longer occurring).
