---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: LSASS high handles/Data Analysis- Walkthrough of troubleshooting a logon session leak in LSASS"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20LSASS%20high%20handles/Data%20Analysis-%20Walkthrough%20of%20troubleshooting%20a%20logon%20session%20leak%20in%20LSASS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533524&Instance=1533524&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533524&Instance=1533524&Feedback=2)

___
<div id='cssfeedback-end'></div>

# Walkthrough of Troubleshooting a Logon Session Leak in LSASS

This article provides a detailed walkthrough of troubleshooting a logon session leak in the Local Security Authority Subsystem Service (LSASS). The principles and general thought process can be applied to other cases of this type.

[[_TOC_]]

## Case study 1: Identifying a logon session leak

A customer opened a case with the following description:

_"The server is a member server in a domain (not a Domain Controller). Lsass.exe has a memory and handle leak that causes issues on one of our application servers. We can measure that lsass.exe is growing every day and has around 60,000 handles that go unreleased (handle leak) daily."_

**Get some data:** Use the data collection section in this [workflow](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1569493/).

## Analysis and troubleshooting

### What leaks? How does it leak? And who is the leaky process?

#### What is leaking?

First, look at the performance monitor (perfmon) to determine what is leaking. In this case, there was a clear handle leak in LSASS and several other processes. This is typical of an LSASS leak because usually, LSASS is the victim, and another process is calling into LSASS to perform some action (usually authentication). Look for another leaking process in a similar line in perfmon, and often there is one.


![Data_Analysis_Member_Server_Walkthrough_1.png](/.attachments/ADPERF/Data_Analysis_Member_Server_Walkthrough_1.png) [INSERT IMAGE DESCRIPTION HERE]

This image shows the leaking line of handles that increase and never go back down. Several processes leak handles.

#### What kind of handles?

Next, determine what kind of handles are leaking. This is where dumps are useful (from DebugDiag).

**Load the first dump, and run `!winde.handles` on it.**

**Running `!handle 0 0`...**
```plaintext
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
```
You can see a high number of token handles, indicating we are leaking tokens or logon sessions.

#### Investigate the logon sessions

Next, lets take a look at the logon sessions to see if there are some clues here. For this, I like to use the Microsoft Extensible Debugger (MEX) and Lsaexts.dll debug extension.
```plaintext
.load mex.dll 
.load lsaexts.dll 
```

**Count the total number of sessions**

First, let's count how many Kerberos logon sessions we have. (I picked Kerberos because this is the most common protocol.)
```plaintext
0.000>  !count !grep LogonId !exec -x "!kerbsess" 
There are a total of 1087 logon sessions 
```
Note: In Windows 2012 and later, `!kerbsess` is broken. You can use `!mex.lsass` and dump logon sessions.
```plaintext
0:000> !mex.lsass 

Data                             Information 
================================ =================================================================================================================================================================== 
Kerberos Credential List         List of all the active Kerberos credentials. Items are added to the kerberos!KerbCredentialList list each time a call to AcquireCredentialHandle for kerberos occurs 
Negotiate Package List           List of all the active negotiate packages 
Domain Information               Provides the domain status of this machine, and if it is a Domain Controller (DC), we provide the list of trusts 
Session List                     List of sessions... sorry, not a lot of details 
Logon Session List               List of logon sessions 
NTDS Events                      The last few events for the NTDS log 
LSAExts Commands                 Displays the help for the LSAExts 
LDAP Arena Memory Usage          Displays memory usage by LDAP on 2012 R2 DCs and newer 
LSA Server Initialization Errors Displays errors logged by lsasrv 
```
Or use the following command to dump all the logon sessions and substitute this for `!kerbsess` in all the commands in this document.
```plaintext
0:000> x kerberos!kerbgloballogonsessiontable 

00007ff9`9aef0a40 kerberos!KerbGlobalLogonSessionTable = struct _RTL_AVL_TABLE 

0:000> !rtlavl 00007ff9`9aef0a40 kerberos!KERB_LOGON_SESSION_TABLE_ENTRY 
```
Substitute it like:
```plaintext
!count !grep LogonId !exec -x "!rtlavl 00007ff9`9aef0a40 kerberos!KERB_LOGON_SESSION_TABLE_ENTRY" 
```

#### Count the sessions by username

This is a lot for a member server, so let's check how many different users are logged on.

Dump unique sessions with the MEX extension:
```plaintext
0:019> !ul !grep Username !exec -x "!kerbsess" 

1:        UserName        (null) 
1:        UserName        systemamigo 
1:        UserName        a835954 
1:        UserName        a798449 
2:        UserName        tns-sko-24-302$ 
2:        UserName        et4478x 
1075:     UserName        rhduser 

1075 of those are for the user rhduser!! 
```
This is a big clue because the same user usually doesn't have many logon sessions like this.

Next, find out what runs under this user. Is it expected that it has so many logon sessions?

Let's see when these sessions got created (looking for a pattern to understand this leak).

Again, MEX is the superpower for this. The following command will list just the logon times of the rhduser:
```plaintext
0:000>!grep 'Logon Time' !fel -n lin -x "!dumplogonsession @#lin" !cut -f 2 !grep 'LogonId' !grep -B 18 rhduser !exec -x "!kerbsess" 
```
So reading from the end backwards, this command works like this:
- List all Kerberos sessions and pick the ones with rhduser. Display 18 lines before match (to get logonID later).
- Only take the lines with logonid.
- Cut the second field to get a list of logon IDs.
- Then dump each logon session using `!fel`.
- And only take the logon time.

Here is what the output looks like:
```plaintext
  Logon Time        09:35:10.102, Oct 22, 2012 (Local) 
  Logon Time        09:35:10.196, Oct 22, 2012 (Local) 
  Logon Time        09:35:10.227, Oct 22, 2012 (Local) 
  Logon Time        09:35:10.258, Oct 22, 2012 (Local) 
  Logon Time        09:35:10.290, Oct 22, 2012 (Local) 
  Logon Time        09:35:27.071, Oct 22, 2012 (Local) 
  Logon Time        09:35:42.211, Oct 22, 2012 (Local) 
  Logon Time        09:35:43.743, Oct 22, 2012 (Local) 
  Logon Time        09:35:54.415, Oct 22, 2012 (Local) 
```
We can see many logon sessions being created every minute.

Next, compare this to a dump taken later on (after some leaking has occurred). In this case, we had a dump taken 2 days later.

Going through the same commands, we saw that the token handles dramatically increased:
```plaintext
!winde.handle 

        1  Desktop 
        2  TpWorkerFactory 
        2  KeyedEvent 
        2  WindowStation 
        2  Directory 
        3  Mutant 
        4  Timer 
        4  Section 
        7  IoCompletion 
       20  Thread 
       53  File 
       86  Key 
      105  Process 
      268  Event 
    14362  Token  note the difference  
    57777  Semaphore 
```
```plaintext
0.000>  count !grep LogonId !exec -x "!kerbsess" 

There are a total of 14319 kerberos logon sessions 
```

Unique session count:
```plaintext
0:019> !ul !grep Username !exec -x "!kerbsess" 

1:        UserName        (null) 
1:        UserName        systemamigo 
1:        UserName        a835954 
2:        UserName        tns-sko-24-302$ 
3:        UserName        et4478x 
14311:     UserName        rhduser 
```
Dumping the logon times again for rhduser, we can see that the same pattern of creating new logon sessions has continued since the last dump (every few seconds) and we can also see that logon sessions have NOT been destroyedthey just continue to grow.

Specifically, those very first sessions are still hanging around:
```plaintext
Logon Time        09:35:10.102, Oct 22, 2012 (Local) 
Logon Time        09:35:10.196, Oct 22, 2012 (Local) 
Logon Time        09:35:10.227, Oct 22, 2012 (Local) 
Logon Time        09:35:10.258, Oct 22, 2012 (Local) 
Logon Time        09:35:10.290, Oct 22, 2012 (Local) 
Logon Time        09:35:27.071, Oct 22, 2012 (Local) 
Logon Time        09:35:42.211, Oct 22, 2012 (Local) 
Logon Time        09:35:43.743, Oct 22, 2012 (Local) 
Logon Time        09:35:54.415, Oct 22, 2012 (Local) 
```

## What next?

In this particular case, the customer had a custom application that ran under the rhduser account and was creating these logon sessions, so we did not need to go further. The customer accepted the information and went to look at their application and fix the issue from there.

However, it may not always be so easy! If we wanted to go further, we should next look at authentication scripts or a Time Travel Debugging (TTD) of LSASS and tasklist output during a 2-3 minute period. Analyze these logs to find out how these logon sessions are created. For example, determine whether some process is calling LsaLogonUser or if it is through AcceptSecurityContext/InitializeSecurityContext calls and identify which process is making these calls.

**All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data.**