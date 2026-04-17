---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high memory/Member Server - LSASS high Memory/Data Analysis: Member Server LSASS High Memory"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20LSASS%20high%20memory/Member%20Server%20-%20LSASS%20high%20Memory/Data%20Analysis%3A%20Member%20Server%20LSASS%20High%20Memory"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1600442&Instance=1600442&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1600442&Instance=1600442&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

##ADPERF: High Memory on Member Server: Data Analysis Walkthrough

Abstract: This page explains how to analyze data collected for high memory issues on member servers. It focuses on WPR analysis with Windows Performance Analyzer.

#**Generic Technique:**

Apply the same approach as for LSASS.exe high memory condition on a domain controller:

- Start with the Data collector Set and check if LSASS is indeed using all memory. NOTE: it might be another process and the customer may have made wrong observations.  
- Move onto Perfmon  
- Next check Xperf/WPR
- Finally analyze the LSASS dump by running !mex.dcreport to find known issues and view memory usage by LDAP , Database cache and other. 

Steps to set up debugging are provided in the homework for Lesson 4 of http://aka.ms/ADPERFNINJA  

Walkthrough for memory related dump analysis is shown in the http://aka.ms/ADPERFNINJA training module 8. Watch!  

![Data_Analysis_Domain_Controller_1.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_1.png)

##**WPR analysis**

Load the WPR ETL into WPA.exe  

Configure symbols via Trace->Configure Symbol Paths menu.  

![image.png](/.attachments/image-72269043-c78d-4024-a0ba-8357e1d8f820.png)

![image.png](/.attachments/image-b971b09a-48ce-49fb-b29b-f3af5ee6841e.png)
 
Load symbols via Trace -> Load symbols menu.  
you will see Loading symbols...and eventually it will complete. This may take a while.
   
![Data_Analysis_Domain_Controller_4.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_4.png)

Open the VirtualAlloc Graph by dragging it over to the right hand side of WPA.  

![Data_Analysis_Domain_Controller_5.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_5.png)

Add Impacting Stack column by right clicking anywhere in the columns and selecting it from the menu. 

![Data_Analysis_Domain_Controller_6.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_6.png)

Now look for the stack which is consuming the memory and expand it down until you get to some function which calls an 'Alloc' function.  

![Data_Analysis_Domain_Controller_7.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_7.png)

At this point, you should go to DfM Knowledge and search for any of the ntdsai functions you see on the stack to find known issues. For example in this case you'd want to search for DbConstructReturnList and ta-da! This is a known issue  - you are now a NINJA.  

![image.png](/.attachments/image-b5c2cede-2054-4b7f-821c-efc770d9e328.png)

<span style="color:red">***_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._**