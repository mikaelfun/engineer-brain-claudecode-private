---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: AD Replication appears slow or is delayed/Replication Diagnostic Logging"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20AD%20Replication%20appears%20slow%20or%20is%20delayed%2FReplication%20Diagnostic%20Logging"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423204&Instance=423204&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423204&Instance=423204&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides guidance on enabling and configuring diagnostic logging for Active Directory replication to help troubleshoot replication-related issues.

# How to configure Active Directory and LDS diagnostic event logging

Active Directory does not tend to log many replication-related events by default. However, diagnostic logging for replication can be enabled. This is not normally the first course of action to troubleshoot replication errors, but the diagnostic logging can be useful in troubleshooting cases where a particular object is not replicating, where replication is slow, or where excessive objects are being replicated.

You can configure Active Directory and Lightweight Directory Services (LDS) diagnostic event logging by following the instructions provided by Microsoft: [How to configure Active Directory and LDS diagnostic event logging](https://learn.microsoft.com/troubleshoot/windows-server/active-directory/configure-ad-and-lds-event-logging).

The logging ranges from 0 to 5:

- **0 (None)**: Only critical events and error events are logged at this level. This is the default setting for all entries and should be modified only if a problem occurs that you want to investigate.
- **1 (Minimal)**: Very high-level events are recorded in the event log at this setting. Events may include one message for each major task performed by the service. Use this setting to start an investigation when you do not know the location of the problem.
- **2 (Basic)**
- **3 (Extensive)**: This level records more detailed information than the lower levels, such as steps performed to complete a task. Use this setting when you have narrowed the problem to a service or a group of categories.
- **4 (Verbose)**
- **5 (Internal)**: This level logs all events, including debug strings and configuration changes. A complete log of the service is recorded. Use this setting when you have traced the problem to a particular category or a small set of categories.

All events are logged to the directory service event log. The logging is dynamic and does not require a server reboot or service restart to enable or disable the feature.

A level 3 will show more detailed information, useful for diagnosing specific replication issues.

For further details, visit the Microsoft support page: [How to configure Active Directory and LDS diagnostic event logging](https://learn.microsoft.com/troubleshoot/windows-server/active-directory/configure-ad-and-lds-event-logging).