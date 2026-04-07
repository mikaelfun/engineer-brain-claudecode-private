---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: DC Unresponsive | Hang/Scoping for DC Unresponsive | Hang"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20DC%20Unresponsive%20%7C%20Hang/Scoping%20for%20DC%20Unresponsive%20%7C%20Hang"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533501&Instance=1533501&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533501&Instance=1533501&Feedback=2)

___
<div id='cssfeedback-end'></div>

#**DC Unresponsive/Hang Scoping Questions** <br>

<br>
In the event the Domain Controller (DC) is unresponsive, we split the scoping questions into two categories. <br>
The first is if the customer is unable to log on to the DC, while the second set is if they are able to log on to the DC. <br>
<br>


| **Scoping Questions if the customer is NOT able to log on to the DC.<br>(Steps performed on a different DC or member server with RSAT tools)**  | **Scoping Questions if the customer is able to log on to the DC.**  |
|--|--|
| Can you ping the problem DC using name or IP address?   | Run _dcdiag /v_ and check for any errors.  |
| Can you access '\\\ProblemDCNAME\Sysvol' or '\\\ProblemDCNAME\Netlogon' ?  (If not, what is the error)?  | Open the Event Viewer and check for errors in the Application / System / Directory Services event logs.  |
| Can you use LDP.exe and connect/bind to the problem DC? (If not, what is the error?)  | Open the Security Event Logs and check for Network Logons.  Event ID: 4624 with source machines on the network (This proves that the DC is able to authenticate)  |
| Can you run _Repadmin /bind ProblemDC_? (Can you bind? If not, what is the error?)  | Run _nltest /dsgetdc:_ Do you see the problem DC being returned (This proves that the DC is responding to CLDAP pings)?  |
| Can you run _repadmin /showreps ProblemDC_? (Does it show the report? If not, what is the error)?  | Run _repadmin /showreps_.  Do you see if we are able to inbound replicate from other DCs?  |
| Can you open DSA.msc or GPMC and then connect to the problem DC (If not, what is the error)?  | Can you open Active Directory Snapins (Dsa.msc and Dssite.msc)  |
|  | In the Task Manager, do you see low/no available memory or high/100% CPU? <br> Is any operation also slow (e.g. opening folders/files/ADUC/event log etc.) or do local operations appear to be OK?  |


As Active Directory Domain Services (ADDS) is a service running within the Operating System, validate whether the hang is at the application (ADDS) level, or at the OS-level. <br>
<br>
Look for the below signatures (conditions) of an OS-level hang, and move the case to the Performance Team by changing the SAP to 'System Hang'. Symptoms should be checked for during the time of the issue.  
- Customer cannot ping the DC from another machine.
- They can connect to the console, but the cursor / text caret is unresponsive.  
- You see events 2020 / 2019 in the System event logs related to Paged Pool / Non-Paged Pool exhaustion.