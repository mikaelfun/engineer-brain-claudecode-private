---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high memory/Domain Controller - LSASS high memory/Data Analysis: Domain Controller LSASS High Memory"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADPerf%2FWorkflow%3A%20ADPERF%3A%20LSASS%20high%20memory%2FDomain%20Controller%20-%20LSASS%20high%20memory%2FData%20Analysis%3A%20Domain%20Controller%20LSASS%20High%20Memory"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533527&Instance=1533527&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533527&Instance=1533527&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

##ADPERF: High Memory on Domain Controllers: Data Analysis Walkthrough

Abstract: This page explains how to analyze data collected for high memory issues on domain controllers. It focuses on WPR analysis with Windows Performance Analyzer. It explains also how to open a LSASS memory dump with WinDBG and how to analyze it using MEX Debugger Extension.

#**Generic Technique:**

- Start with the Data collector Set and check if LSASS is indeed using all memory. NOTE: it might be another process and the customer may have made wrong observations.  
- Move onto Perfmon  
- Next check Xperf/WPR
- Finally analyze the LSASS dump by running !mex.dcreport to find known issues and view memory usage by LDAP , Database cache and other. 

Steps to set up debugging are provided in the homework for Lesson 4 of http://aka.ms/ADPERFNINJA  

Walkthrough for memory related dump analysis is shown in the http://aka.ms/ADPERFNINJA training module 8. Watch!  

![Data_Analysis_Domain_Controller_1.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_1.png)

<br/>

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

Add Impacting Stack column by right clicking anywhere in the columns and selecting it from the menu  

![Data_Analysis_Domain_Controller_6.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_6.png)

Now look for the stack which is consuming the memory and expand it down until you get to some function which calls an 'Alloc' function.  

![Data_Analysis_Domain_Controller_7.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_7.png)

At this point, you should go to DfM Knowledge and search for any of the ntdsai functions you see on the stack to find known issues. For example in this case you'd want to search for DbConstructReturnList and ta-da! This is a known issue  - you are now a NINJA.  

![image.png](/.attachments/image-b5c2cede-2054-4b7f-821c-efc770d9e328.png)

##Setting up the debugger and running MEX commands in your LSASS process dump

**Goal:** Set up WindbgX , configure symbols and run !mex.dcreport and check for known issues. 

1. Install WinDbgNext from (choose FastRing) - paste the path \\dbg\dbgx\windbgFastRing.appinstaller to Run... window (read more on: https://www.osgwiki.com/wiki/Installing_WinDbg)
2.  Open WinDbg and Configure symbols using Settings (+change theme to Dark like below if you wish using 'General').  

![image.png](/.attachments/image-9cf2b96b-c069-4a89-8c72-674a7eb541cc.png)

**Note**:  example above is using private symbols.  

For source path to work you have to have source code access (SEE or EE roles only). But don't be demotivated, you can still do a LOT without source code! As long as you have symbols. All MS FTE have private symbols.  

Mex mostly requires private symbols found on http:\\symweb.azurefd.net while connected to corp as per the above configuration.  

3. Get MEX debugger extension MEX.DLL and installation instruction from https://aka.ms/mex You are nearly there... 

4. Load the dump file by clicking on File -> Open Dump File and browse to the location of the DMP file inside the homework folder.  

5. Load and update mex. once you run !mex.update and then turn on auto-updates you won't have to worry and it will always be up to date.  

![Data_Analysis_Domain_Controller_11.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_11.png)

6. Load symbols by running !reload /f 

You might get a few errors but as long as most of them are loading (most importantly no errors about ntdsai.dll or others then you are good - e.g. ntdsmsg.dll never has symbols.)   

![Data_Analysis_Domain_Controller_12.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_12.png)  
![Data_Analysis_Domain_Controller_13.png](/.attachments/ADPERF/Data_Analysis_Domain_Controller_13.png)  

7/ Now run !dcreport and examine the results.  

Watch a real example at http://aka.ms/adperfninja Lesson 8.  

<span style="color:red">***_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._**