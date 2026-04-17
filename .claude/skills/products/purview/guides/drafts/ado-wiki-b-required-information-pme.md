---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Purview Message Encryption/Required Information: Purview Message Encryption"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FRequired%20Information%3A%20Purview%20Message%20Encryption"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Required Information: Purview Message Encryption (PME)

When creating an escalation, collect the following:

## Always Required
- **Message Trace (Detailed)** for an email sent **less than 5 days ago**
  - Critical: backend encryption logs are only retained for ~1 week
  - How to: [Get and read a message trace detail report](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message)
- **MessageID** of the email having the issue

## For Issues with Sending Encrypted Messages
- Output of `Get-IRMConfiguration` OR Assist365 diagnostic output for "Validate Office Message Encryption (OME) Configuration"
- If a label is used to encrypt: **`Get-Label -Identity <Label name> | FL`**

## For Issues with Reading Encrypted Messages
- **Network trace** captured while attempting to read the message
  - How to: [Capture a network trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace)
- **Screenshot** of the error/issue
