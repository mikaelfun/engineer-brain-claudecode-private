---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: AD Replication appears slow or is delayed/Knowledge Consistency Checker"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/AD%20Replication/Workflow%3A%20AD%20Replication%20appears%20slow%20or%20is%20delayed/Knowledge%20Consistency%20Checker"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423213&Instance=423213&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423213&Instance=423213&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides an overview of the Knowledge Consistency Checker (KCC), its functions, and troubleshooting methods for issues related to Active Directory (AD) replication. It includes links to detailed documentation and examples of common errors.

# Knowledge consistency checker (KCC)

The Knowledge Consistency Checker (KCC) is responsible for building and maintaining the replication connections between domain controllers and the sites.

This site is a good reference for an overview of the KCC functionality:
https://learn.microsoft.com/windows-server/identity/ad-ds/get-started/replication/active-directory-replication-concepts#BKMK_2

The KCC runs on a 15-minute schedule. You can force it by running the command `repadmin /kcc` or by using Active Directory Sites and Services and choosing the option to check replication topology.  
![Knowledge Consistency Checker]( /.attachments/ADReplication/Knowledge_Consistency_Checker.png)

The KCC only manages automatically generated connections. It will not manage or maintain manually created connection links.

The KCC can be disabled for a site if desired. This is rarely done but it is possible:
https://learn.microsoft.com/troubleshoot/windows-server/active-directory/disable-knowledge-consistency-checker-automatic-generation

The KCC logs events in the directory service event log. If it has problems creating connection objects or building a complete spanning tree, it will log events that can help diagnose the failure.

You can also run the command `repadmin /failcache` on a domain controller to see failures from the KCC.

Here is an example of a failure for the KCC.  
![Knowledge Consistency Checker Failure]( /.attachments/ADReplication/Knowledge_Consistency_Checker_1.png)

In this example, the KCC is unable to build a connection object to DC2 because of error 1722. The errors will generally be the same type of error we see with AD replication. In this example, you would troubleshoot the 1722 error exactly like you would troubleshoot AD replication error 1722.

Sometimes, you will see duplicate connection objects created by the KCC. There is a known issue documented here:
https://learn.microsoft.com/troubleshoot/windows-server/active-directory/duplicate-active-directory-replication-connections

By default, site link bridging is enabled, and this can be disabled here:  
![Site Link Bridging]( /.attachments/ADReplication/Knowledge_Consistency_Checker_2.png)

This site is a good reference site for site link bridging:
https://learn.microsoft.com/windows-server/identity/ad-ds/plan/creating-a-site-link-bridge-design