---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high handles/Data Analysis - LSASS High Handles"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20LSASS%20high%20handles/Data%20Analysis%20-%20LSASS%20High%20Handles"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569500&Instance=1569500&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569500&Instance=1569500&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

# ADPerf - data analysis - LSASS high handles

Abstract: This page explains how to analyze data collected for Local Security Authority Subsystem Service (LSASS) high handle issues. It focuses on Windows Performance Recorder (WPR) trace analysis with Windows Performance Analyzer (WPA). It also explains how to open an LSASS memory dump with WinDbg and analyze it using the MEX Debugger Extension for potential handle leaks.

## Generic technique

Start with the report.html from Data Collector Set and check if LSASS is indeed the process having the most handles. Note: It might be another process, and the customer may have made incorrect observations.

![Report HTML example](/.attachments/image-52325c45-a668-4bd6-af5b-fd2f76cb3e75.png)

Check the Performance Monitor log. Look for the Process/Handle Count counter, display all processes, and search for the biggest consumers to confirm if it's really a handle leak in lsass.exe.

![Performance Monitor log example](/.attachments/ADPERF/Data_Analysis_Member_Server_Walkthrough_1.png)

## Determine the type of handle that is leaking

The ADPerf script collects lsass.exe dumps. Open it with WinDbg and list the handles with:

````
!handle 0 0
````

You should get a similar output:

````
       1  Desktop 
       2  TpWorkerFactory 
       2  KeyedEvent 
       2  WindowStation 
       2  Directory 
       3  Mutant 
       4  Timer 
       4  Section 
       7  IoCompletion 
      25  Thread 
      46  File 
      93  Key 
     110  Process 
     277  Event 
    1123  Token 
    4839  Semaphore 

    6540  Handles in process 
      64  Handle Types 
````

A high number next to the Token handle type is usually connected with a large number of logon sessions.

## WPR analysis

1. Load the WPR ETL into WPA.exe.
2. Configure symbols via Trace -> Configure Symbol Paths menu.

![Configure Symbol Paths menu](/.attachments/image-72269043-c78d-4024-a0ba-8357e1d8f820.png)

![Loading symbols example](/.attachments/image-b971b09a-48ce-49fb-b29b-f3af5ee6841e.png)

3. You will see Loading symbols...and eventually, it will complete. This may take a while.

![Loading symbols completion](/.attachments/ADPERF/Data_Analysis_Domain_Controller_4.png)

4. Open the Handles graph by dragging it over to the right-hand side of WPA.

![Handles graph example](/.attachments/image-ba617522-e752-4cc0-afa8-4f92944aad0b.png)

5. Configure your view by adding columns like Owning Process, Closing Process, Create Stack, or use the WPR Profile for High Handles ([HighHandlesWPAProfile.zip](/.attachments/HighHandlesWPAProfile-774c1d45-ef59-4383-b70c-c0cbe1c72139.zip)).

![Configured view example](/.attachments/image-7c47b4ab-3cea-49f2-9404-2c074f0d552d.png)

6. Look for lsass.exe on the list, expand it, and check what Handle Type is overconsumed.

![Handle Type example](/.attachments/image-940a89ba-909e-4f17-ba20-2ccd7f07db1d.png)

7. Drill through the Create Stack column to better understand where handles are opened.

![Create Stack example](/.attachments/image-7ca9deff-e3f8-4fb9-94da-4227ed0171c0.png)

## High Token handle count - Token and session leaks in Windows

Check [Guide to Troubleshooting Token and Session Leaks in Windows](https://aka.ms/debug-tokenleak).

If you can see a high number of Token handles, the system is leaking tokens or user sessions. You can use:

````
!mex.lsass
````

and dump logon sessions:

````
0:000> !mex.lsass
Data                             Information
================================ ===================================================================================================================================================================
Kerberos Credential List         List of all the active Kerberos credential. Items are added to the kerberos!KerbCredentialList list each time a call to AcquireCredentialHandle for kerberos occurs
Negotiate Package List           List of all the active negotiate packages
Domain Information               Provides the domain status of this machine, and if it is a DC, we provide the list of trusts
Session List                     List of sessions... sorry, not a lot of details

**Logon Session List               List of LSA logon sessions**

Kerberos Logon Session List      List of Kerberos logon sessions
LSAExts Commands                 Displays the help for the LSAExts
LSA Server Initialization Errors Displays errors logged by lsasrv
LSA AFD Port Statistics          Displays the AFD endpoint status of ports used by LSASS
LsaSrv Extension List            Lists the LsaSrv extensions with status info
NTDS Events                      The last few events for the NTDS log
LDAP Arena Memory Usage          Displays memory usage by LDAP on 2012 R2 DCs and Newer
LDAP Searches                    Displays Searches the Domain Controller is currently servicing
ATQ Details                      Displays usage regarding the ATQ thread pool used by Domain Controllers
DC Report                        Runs a domain controller report and displays important details of stuff running on a DC
````

List retrieved with !mex.logonsessions:

````
0: kd> !mex.logonsessions 

Address          Account Name     Authority        LogonID  Session ID Logon Type        SID                                         Logon Time 
================ ================ ================ ======== ========== ================= =========================================== ===================== 
00000202ed9e0f10 Ryan             DESKTOP-FAAHMR2  0:39de95          8 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:56:29 PM 
00000202ed9deb50 Ryan             DESKTOP-FAAHMR2  0:39de75          8 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:56:29 PM 
00000202ed9de310 Ryan             DESKTOP-FAAHMR2  0:326c35          7 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:55:45 PM 
00000202ed9e0990 Ryan             DESKTOP-FAAHMR2  0:326c15          7 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:55:45 PM 
00000202ed9df0d0 Ryan             DESKTOP-FAAHMR2  0:28c2fb          6 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:54:58 PM 
00000202ed9e1a10 Ryan             DESKTOP-FAAHMR2  0:28c2db          6 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:54:58 PM 
00000202ed9e1750 Ryan             DESKTOP-FAAHMR2  0:2051fd          5 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:54:02 PM 
00000202ed9e1490 Ryan             DESKTOP-FAAHMR2  0:2051dd          5 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:54:02 PM 
00000202ed831b50 Ryan             DESKTOP-FAAHMR2  0:162564          4 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:50:25 PM 
00000202ed831310 Ryan             DESKTOP-FAAHMR2  0:162538          4 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:50:25 PM 
00000202ed832390 Ryan             DESKTOP-FAAHMR2  0:e1562           3 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:49:41 PM 
00000202ed831e10 Ryan             DESKTOP-FAAHMR2  0:e1542           3 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:49:41 PM 
00000202ed832910 Ryan             DESKTOP-FAAHMR2  0:41acb           2 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:47:48 PM 
00000202ed832bd0 Ryan             DESKTOP-FAAHMR2  0:41a8f           2 RemoteInteractive S-1-5-21-53021447-2318055131-717449158-1001 1/14/2020 11:47:48 PM 
00000202ed2746c0 LOCAL SERVICE    NT AUTHORITY     0:3e5             0 Service           S-1-5-19                                    1/14/2020 11:44:52 PM 
00000202ed274ea0 DWM-1            Window Manager   0:b00d            1 Interactive       S-1-5-90-0-1                                1/14/2020 11:44:51 PM 
00000202ed274090 DWM-1            Window Manager   0:af1d            1 Interactive       S-1-5-90-0-1                                1/14/2020 11:44:51 PM 
00000202ed25b4d0 DESKTOP-FAAHMR2$ WORKGROUP        0:3e4             0 Service           S-1-5-20                                    1/14/2020 11:44:51 PM 
00000202ed209e20 UMFD-1           Font Driver Host 0:5ba1            1 Interactive       S-1-5-96-0-1                                1/14/2020 11:44:51 PM 
00000202ed24fba0 UMFD-0           Font Driver Host 0:5b9a            0 Interactive       S-1-5-96-0-0                                1/14/2020 11:44:51 PM 
00000202ed229af0                                   0:5658            0                                                               1/14/2020 11:44:51 PM 
00000202ed220480 DESKTOP-FAAHMR2$ WORKGROUP        0:3e7             0                   S-1-5-18                                    1/14/2020 11:44:51 PM
````

At this point, you should see an unusually high number of logon sessions opened for a specific user, which you can troubleshoot further.

**All screenshots are from lab machines and internal reproductions**