---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Activity Explorer/Required Information: Activity Explorer"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FActivity%20Explorer%2FRequired%20Information%3A%20Activity%20Explorer"
importDate: "2026-04-06"
type: troubleshooting-guide
---

When creating an escalation, please get this information:

- Describe what is the expected vs actual Behavior
- A screenshot or [recording](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9072/How-to-Capture-a-recording-of-an-issue) of the issue 
- Add the RecordIdentity column and get the RecordIdentity of the event having issue.
- A [network trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace) of the issue. (Make sure to refresh the page after starting har trace to get complete log) 
- The time of the activity in UTC
- The [Audit log](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9080/How-to-Search-the-audit-log-for-an-event) of the event 
- If you are unable to find the audit log event, please provide
  - A detailed explanation of the activity performed
  - Information regarding the item for which the activity was performed
    - If SPO/ODB Document: [Document Path](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8938/How-to-Get-the-document-path-of-a-document-in-SharePoint-or-OneDrive)
    - If an Exchange email: [email message id](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message?anchor=step-1%3A-get-the-message-id-of-the-email)
    - If a Teams message: [Teams message id](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8950/How-to-Get-the-message-id-of-a-Teams-message)
    - If Endpoint: [Client Analyzer](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Data%20Loss%20Prevention/8894/How-to-Capture-and-read-a-Windows-client-analyzer) of the issue reproduction
