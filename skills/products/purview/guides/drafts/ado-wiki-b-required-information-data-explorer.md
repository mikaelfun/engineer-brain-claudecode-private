---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Data Explorer/Required Information: Data Explorer"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FData%20Explorer%2FRequired%20Information%3A%20Data%20Explorer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Required Information: Data Explorer

When creating an escalation, please get this information:

- Describe what is the expected vs actual Behavior
- A screenshot or [recording](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9072/How-to-Capture-a-recording-of-an-issue) of the issue 
- A [network trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace) of the issue 
   - If the issue is in  the portal, collect har log or Fiddler trace
   - If the issue is with Export-ContentExplorerData PowerShell command, collect Fiddler trace (not har log) while running the command with -**Verbose** parameter to get more detailed error information.
- A copy of the affected file
- Information regarding the item for which the activity was performed
  - If SPO/ODB Document: [Document Path](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8938/How-to-Get-the-document-path-of-a-document-in-SharePoint-or-OneDrive)
  - If an Exchange email: [email message id](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message?anchor=step-1%3A-get-the-message-id-of-the-email)
  - If a Teams message: [Teams message id](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8950/How-to-Get-the-message-id-of-a-Teams-message)
  - If Endpoint: [Client Analyzer](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8950/How-to-Get-the-message-id-of-a-Teams-message) of the issue reproduction 
