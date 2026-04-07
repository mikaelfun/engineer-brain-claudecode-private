---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high memory/Scoping for High Memory"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20LSASS%20high%20memory/Scoping%20for%20High%20Memory"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533504&Instance=1533504&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533504&Instance=1533504&Feedback=2)

___
<div id='cssfeedback-end'></div>

##ADPERF: LSASS high memory scoping guide

# <span style="color:darkblue">**Is this a Domain Controller or a Member Server?**</span>

| **Domain controller (DC)** | **Member server** |
|--|--|
| <span style="color:blue">**WHAT / WHAT Not**</span> <br> What OS are impacted? <br> What other Applications are on DC? <br> What Symptoms does the customer observe on the problem DC? <br> What Error messages / events logged? <br> What are the Client Symptoms? | <span style="color:blue">**WHAT / WHAT Not**</span> <br> What OS are impacted? <br> What is the role of this server? (e.g. IIS/Web, SQL, other) <br> What applications are running there? <br> What Symptoms does the customer observe? <br> What Error messages / events logged? <br> What are the Client Symptoms? <br> What machines do NOT have the problem? |
| <span style="color:darkorange">**WHEN / WHEN Not**</span> <br> When problem started? <br> Is there a pattern? <br> Is it reproducible by specific query or steps? | <span style="color:darkorange">**WHEN / WHEN Not**</span> <br> When problem started? <br> Is there a pattern? <br> Is it reproducible? |
| <span style="color:darkred">**WHERE / Where Not**</span> <br> Is the problem specific to DC's in a certain site? <br> Specific to some FSMO role? e.g. only happens on PDC? | <span style="color:darkred">**WHERE / Where Not**</span> <br> Are the machines with the problem in a specific site? |
| <span style="color:purple">**EXTENT**</span> <br> How long does it take to get into problem state? <br> How many DCs have this problem? <br> How do they currently resolve it? | <span style="color:purple">**EXTENT**</span> <br> How long does it take to get into problem state? <br> How many DCs have this problem? <br> How do they currently resolve it? |