---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Scenario Troubleshooting via TSS (TroubleShootingScript)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Account%20Lockouts/Workflow%3A%20Account%20Lockout%3A%20Scenario%20Troubleshooting%20via%20TSS%20%28TroubleShootingScript%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414161&Instance=414161&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414161&Instance=414161&Feedback=2)

___
<div id='cssfeedback-end'></div>

This troubleshooting guide explains how to handle account lockout scenarios using the TSSv2 script, including prerequisites, steps, and specific scenarios. 

[[_TOC_]]

## Introduction
This troubleshooting approach mechanism facilitates data collection and analysis, but it is not compulsory, as customers may not want to enable PowerShell (PS) Remoting on Domain Controllers (DCs). In that case, follow [Workflow: Account Lockout: Data Collection - Reactive](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/795411/Workflow-Account-Lockout-Data-Collection-Reactive-!!!!).

## TSS switch/scenario name
ADS_ACCOUNTLOCKOUT and remoting collect account lockout logs from multiple places.  
[Windows ADS TSSv2: "TroubleShootingScript Version 2" suite of tools](https://internal.support.services.microsoft.com/en-US/help/4619196).

## Prerequisites
To take most of it, remoting and monitoring features should be used.
- Download [TSSV2](https://aka.ms/gettssv2).
**Please ensure to always and only use the latest version of the script!**
- Run `Enable-PSRemoting -Force` in PowerShell on DCs you are interested in, or all of them.
- Start the "remoteregistry" service on the client if you already know that piece of the puzzle. This is done by the TSSv2 script if the service is not disabled.
 ![Remote registry service](/.attachments/image-0bfbac99-6d8a-44b1-bb2c-0eb97686700c.png)
- Enable the firewall rule on all participants. This is done by the TSSv2 script.
 ![Firewall rule](/.attachments/image-a0200446-1feb-4832-bf59-503b11552f78.png)

## Steps
1. Create `tss_config.cfg` and adjust the content based on your scenario OR edit the file named `tss_config.cfg` under the `config` folder:
    > **WARNING**: Be sure the extension of the file is .cfg, not .txt, otherwise it won't be used and TSSv2 won't monitor the event to stop data on all devices (thanks to @Alexandre TREPAGNY for the tip).

    >```
    >_EnableRemoting=yes  
    >_WriteEventToHosts=DomainController1,DomainController2  
    >_RemoteLogFolder=\\FileServer\Share  
    >_Remote_Stop_EventId=999  
    >_Stop_WaitTimeInSec=0  
    >_Stop_EventData=0  
    >_CheckIntInSec=0  
    >_EnableMonitoring=y
    >_EventlogName=Security 
    >_Stop_EventID=4625
    >```
   - Example:
    >```
     >_EnableRemoting=yes   
     >_WriteEventToHosts=VMDC1,VMC2  
     >_RemoteLogFolder=\\fabrikam.com\\TSSRemote  
     >_Remote_Stop_EventId=999  
     >_Stop_WaitTimeInSec=0    
     >_CheckIntInSec=0    
     >_EnableMonitoring=y    
     >_EventlogName=Security    
     >_Stop_EventID=4625  
     >_Stop_EventData=user1
     >```
2. Place it under the existing `config` folder.
3. Copy the TSSv2 folder to all relevant machines and adapt `_WriteEventToHosts` accordingly.
4. Make sure auditing is set in a way so it will produce event 4625 in case of a failed logon.
5. Run `.\TSSv2.ps1 -Start -Scenario ADS_ACCOUNTLOCKOUT -AcceptEula` on all machines relevant for this type of traces.
 ![Running TSSv2](/.attachments/image-42479a4c-1267-41bd-b22c-01b82bc06969.png)
6. As soon as event 4625 appears in the security log, monitoring will stop tracing and trigger data collection on this machine.
 ![Event 4625](/.attachments/image-67096007-3988-4d8f-b13d-69c4e06d7f36.png)
7. Remoting will write event 999 in the system event log on all machines listed in `_WriteEventToHosts`.
 ![Event 999](/.attachments/image-d76abed5-cb6b-4d3b-b2fe-d2cdbcdd401f.png)
8. Consequently, all machines in `_WriteEventToHosts` will react (monitoring) on event 999 and stop tracing and trigger data collection.
 ![Monitoring reaction](/.attachments/image-3aa18b3c-53ad-4dc5-9d3f-19f22804ce53.png)

##  Note
You can also use the same approach for other events like 4771 (failed Kerberos pre-authentication - Ticket Granting Ticket (TGT)), 4768 (failed Kerberos authentication ticket - TGT), or 4769 (failed Kerberos service ticket - Ticket Granting Service (TGS)).

## Scenarios

### Scenario 1
An account is locked and Security Event 4625 is logged with no Source Workstation information. This is logged on a file server with a logon type 3, for user1:
```
>_EnableRemoting=yes   
>_WriteEventToHosts=VMDC1,VMC2  
>_RemoteLogFolder=\\fabrikam.com\\TSSRemote  
>_Remote_Stop_EventId=999  
>_Stop_WaitTimeInSec=0    
>_CheckIntInSec=0    
>_EnableMonitoring=y    
>_EventlogName=Security    
>_Stop_EventID=4625  
>_Stop_EventData=user1
```

### Scenario 2
Two accounts are locked and Security Event 4625 is logged with no Source Workstation information. This is logged on a file server with a logon type 3. Besides the event ID, if you want to monitor a specific event message, you can use this parameter for it. You can also set multiple event messages using a slash (/) to separate the message. The config file allows us to use OR stop condition and use two different account names to stop trace when event 4625 is logged with any of these accounts.
```
>_EnableRemoting=yes   
>_WriteEventToHosts=VMDC1,VMC2  
>_RemoteLogFolder=\\fabrikam.com\\TSSRemote  
>_Remote_Stop_EventId=999  
>_Stop_WaitTimeInSec=0    
>_CheckIntInSec=0    
>_EnableMonitoring=y    
>_EventlogName=Security    
>_Stop_EventID=4625  
>_Stop_EventData=user1/user2
```

### Scenario 3
An account is locked and event 4776 is logged on a member workstation with no Source Workstation information (NULL). Additionally, you see a similar entry in the Netlogon log with no source information:
`09/19 08:00:20 [LOGON] CONTOSO: SamLogon: Network logon of CONTOSO\user from Returns 0xC000006A`
The problem here is that 4776 is logged for both success and failure scenarios with additional error codes 0x0 (success) and 0xC000006A (failure  bad password). Thus, the tracing would be stopped even if the user account uses the correct password to access the server and a success 4776 event is generated. **Note**: The error code hex 0xC000006A should be used as in decimal 3221225578.
```
 >_EnableRemoting=yes   
 >_WriteEventToHosts=VMDC1,VMC2  
 >_RemoteLogFolder=\\fabrikam.com\\TSSRemote  
 >_Remote_Stop_EventId=999  
 >_Stop_WaitTimeInSec=0    
 >_CheckIntInSec=0    
 >_EnableMonitoring=y    
 >_EventlogName=Security    
 >_Stop_EventID=4776
 >_Stop_EventData=user1/3221225578 
```