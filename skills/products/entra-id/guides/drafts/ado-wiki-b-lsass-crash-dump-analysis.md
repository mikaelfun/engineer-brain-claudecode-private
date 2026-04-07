---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADPerf/Workflow: ADPERF: Lsass Crash/Data Analysis (Crash Dump)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/ADPerf/Workflow%3A%20ADPERF%3A%20Lsass%20Crash/Data%20Analysis%20%28Crash%20Dump%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533495&Instance=1533495&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1533495&Instance=1533495&Feedback=2)

___
<div id='cssfeedback-end'></div>

#**Lsass Crash Dump Analysis** <br>




##**Basic Crash Dump Analysis:** 

**Running the Known Issue Checker:** 

For running the known issue checker is to run !mex.kic within the debugger. For this you will need to have WindbgNext installed, for instructions and more details on WinDbgNext see:  
https://osgwiki.com/wiki/WinDbgNext 

You will need to install Mex into your debuggers extension directory:  
See more info at: https://aka.ms/mex.

Next, you will need to open the .dmp file in WindbgNext  

Most often times for crash scenarios the debugger will report the following:  
````
This dump file has an exception of interest stored in it. 
The stored exception information can be accessed via .ecxr. 
(3b4.7b4): Access violation - code c0000005 (first/second chance not available) 
For analysis of this file, run !analyze -v 
````

We will come back to this later for now we want to load mex and run the known issue checker by running 
````
.load mex.dll 
!mex.kic 
````

Once it completes you will either see the stats of the check, OR if it found a known issue a report stating what the known issue is, related content and potential solutions. 

In this case, it did not find a match to a known crash signature:   
````
Stats: 
Rules Ran: 7 Success: 7 Failed: 0 Skipped: 0 
Number of Issues Found: 0 
Number of Fishing Rules Found: 0 [Use -v to see output] 
Total Number of Rules: 351 
Scan Ended: 10/29/2018 9:29:46 AM (00:00:01.2010488) 
````

Since Mex did not find any known issues, we will go back to the message the debugger reports when first opening the dump. 
````
Running !analyze -v
````

!analyze -v is another rule type engine that will try to assert blame for the crash. Often times crashes are caused by a third party, and can lead to direct action by the SE/SEE to ask the customer to try updating that software. However, as a point of caution, sometimes third parties are assigned blame incorrectly, please have the dump reviewed by an EE to confirm the analysis. 

```` 
A partial view of sample output. 
CONTEXT: (.ecxr) 
rax=0000000000438000 rbx=0000000000000214 rcx=00000000003f44f8 
rdx=0000000000043b18 rsi=0000000000000214 rdi=000000000135edc0 
rip=00000000775e7085 rsp=000000000135eb78 rbp=00000000ff27b64c 
r8=0000000000000214 r9=0000000000000002 r10=0000000000028000 
r11=00000000003f4318 r12=00000000ff27b628 r13=0000000000000000 
r14=0000000000437e30 r15=0000000000000000 
iopl=0 nv up ei pl nz na pe nc 
cs=0033 ss=002b ds=002b es=002b fs=0053 gs=002b efl=00010202 
ntdll!memcpy+0xc5: 
00000000`775e7085 488b440af0 mov rax,qword ptr [rdx+rcx-10h] ds:00000000`00438000=???????????????? 
Resetting default scope 

FAULTING_IP:  
ntdll!memcpy+c5 
00000000`775e7085 488b440af0 mov rax,qword ptr [rdx+rcx-10h] 

EXCEPTION_RECORD: (.exr -1) 
ExceptionAddress: 00000000775e7085 (ntdll!memcpy+0x00000000000000c5) 
 ExceptionCode: c0000005 (Access violation) 
 ExceptionFlags: 00000000 
NumberParameters: 2 
 Parameter[0]: 0000000000000000 
 Parameter[1]: 0000000000438000 
Attempt to read from address 0000000000438000 

DEFAULT_BUCKET_ID: INVALID_POINTER_READ 
PROCESS_NAME: winlogon.exe 
FOLLOWUP_IP:  
winlogon!WLGeneric_MPRLogonNotify_Execute+6 
00000000`ff23b3a6 488b5908 mov rbx,qword ptr [rcx+8] 

READ_ADDRESS: 0000000000438000  

ERROR_CODE: (NTSTATUS) 0xc0000005 - The instruction at 0x%p referenced memory at 0x%p. The memory could not be %s. 

EXCEPTION_CODE: (NTSTATUS) 0xc0000005 - The instruction at 0x%p referenced memory at 0x%p. The memory could not be %s. 
```` 

In most cases, you will want to escalate crashes caused by Windows components to the Windows EE Premier queue. Identify the cause of what lead to a crash requires reading source code and evaluating possibilities of what code bug would lead to this type of crash, or in many cases what additional data/flags etc.. to gather to understand the root cause of the crash. Mex provides a !crash command that provides a nice clean view of the basic details of the crash, this is a nice to have to provide in your problem that you will send to the EE queue, but not a requirement. 

Example Output:  
````
0:007> !mex.crash 
Last exception (.exr -1) 
============================================ 
ExceptionAddress: 00000000775e7085 (ntdll!memcpy+0x00000000000000c5) 
 ExceptionCode: c0000005 (Access violation) 
 ExceptionFlags: 00000000 
NumberParameters: 2 
 Parameter[0]: 0000000000000000 
 Parameter[1]: 0000000000438000 
Attempt to read from address 0000000000438000 

Setting context to the last exception (.ecxr) 
============================================ 
rax=0000000000438000 rbx=0000000000000214 rcx=00000000003f44f8 
rdx=0000000000043b18 rsi=0000000000000214 rdi=000000000135edc0 
rip=00000000775e7085 rsp=000000000135eb78 rbp=00000000ff27b64c 
r8=0000000000000214 r9=0000000000000002 r10=0000000000028000 
r11=00000000003f4318 r12=00000000ff27b628 r13=0000000000000000 
r14=0000000000437e30 r15=0000000000000000 
iopl=0 nv up ei pl nz na pe nc 
cs=0033 ss=002b ds=002b es=002b fs=0053 gs=002b efl=00010202 
ntdll!memcpy+0xc5: 
00000000`775e7085 488b440af0 mov rax,qword ptr [rdx+rcx-10h] ds:00000000`00438000=???????????????? 

Crashing Stack (kn) 
============================================ 
 *** Stack trace for last set context - .thread/.cxr resets it 
# Child-SP RetAddr Call Site 
00 00000000`0135eb78 000007fe`ff698f76 ntdll!memcpy+0xc5 
01 00000000`0135eb80 000007fe`ff6aa198 rpcrt4!Ndr64ConformantArrayMarshall+0x136 
02 00000000`0135ec20 000007fe`ff73c377 rpcrt4!Ndr64ComplexStructMarshall+0x22b 
03 00000000`0135ecd0 000007fe`ff73cad4 rpcrt4!Ndr64pClientMarshal+0xe8 
04 00000000`0135ed20 000007fe`ff73ce15 rpcrt4!NdrpClientCall3+0x1b4 
05 00000000`0135efe0 00000000`ff26a38d rpcrt4!NdrClientCall3+0xf2 
06 00000000`0135f370 00000000`ff24f505 winlogon!MprLogonNotify+0x61 
07 00000000`0135f3d0 00000000`ff23b3e7 winlogon!MprLogonNotifyHelper+0x27d 
08 00000000`0135f450 00000000`ff231c60 winlogon!WLGeneric_MPRLogonNotify_Execute+0x47 
09 00000000`0135f480 00000000`7759ceb4 winlogon!StateMachineWorkerCallback+0x7f 
0a 00000000`0135f4b0 00000000`77689ad7 ntdll!TppWorkpExecuteCallback+0xa4 
0b 00000000`0135f510 00000000`774859cd ntdll!TppWorkerThread+0x6f7 
0c 00000000`0135f7a0 00000000`775e385d kernel32!BaseThreadInitThunk+0xd 
0d 00000000`0135f7d0 00000000`00000000 ntdll!RtlUserThreadStart+0x1d 
````