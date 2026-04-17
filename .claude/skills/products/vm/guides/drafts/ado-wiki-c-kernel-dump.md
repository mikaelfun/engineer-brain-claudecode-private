---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/TSGs/TSG AFS Getting Kernel dump for Investigation_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20Sync/TSGs/TSG%20AFS%20Getting%20Kernel%20dump%20for%20Investigation_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Azure-Files-Sync
- cw.TSG
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::
 

[[_TOC_]]

# Summary

This TSG aims to guide you on capturing kernel dumps in deeper investigations when escalating to engineering. 

**Overview**

Enable full kernel memory dump in case bugchecks occur.

Refer to:  https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/generate-a-kernel-or-complete-crash-dump#enable-memory-dump-setting

Since the filter runs in the kernel, we need a kernel dump to investigate kernel-related issues. 

Unfortunately, blue screen error messages do not provide sufficient information to diagnose the cause of the crash. If you are experiencing repeated system crashes that lead to a blue screen, you may be asked to provide a dump file to help our engineering team investigate your issue. There are five settings for kernel-mode crash dump files. In most cases, you may be asked to provide one of the following: 
 
Minidump: By default, Windows will create a small minidump after a blue screen.  

The file will be saved in the directory below: 

 - C:\Windows\Minidump\######-#####-##.dmp

Look for the minidump file with the most recent modified date.  


![tsg_AFS_kernel_1.png](/.attachments/SME-Topics/Azure-Files-Sync/tsg_AFS_kernel_1.png)

## Creating a kernel mode dump

1. To create a live dump, download the "livekd" tool from Sysinternals:
   > https://docs.microsoft.com/en-us/sysinternals/downloads/livekd
2. Then execute the following from an elevated CMD prompt: 
   ```
    livekd64.exe -o livekd_%random%.dmp -ml
    ```
**Pro Tip:** we can run this on a live machine with minimal impact instead of causing a forced system crash. Typically completes within 1-5 mins.

**VMWare** - VM => Snapshot to be takes

 > https://kb.vmware.com/s/article/2003941

**HyperV-VM**

> https://docs.microsoft.com/en-us/powershell/module/hyper-v/debug-vm?view=win10-ps
```
 debug-VM "VM to Debug" -InjectNonMaskableInterrupt -Force
```
 - Or use vm2dm tool

> https://github.com/CSS-Windows/WindowsDiag/tree/master/SHA/vm2dmp

Using **internal cfstest.exe** => Doesn't need KD installed, no restart, no snapshot.

```
cfstest livedump out.dmp    => For OS versions > 2012R2
cfstest_win8 livedump out.dmp    => For OS version 2012R2
``` 


Using **LiveKd  - Preferred**  => **Requires kd.exe to be installed; no restart required.**
 
 - Install Windows SDK Windows SDK archive - Windows app development (microsoft.com)

Runs on:

Client: Windows Vista and higher.
Server: Windows Server 2008 and higher.
    
You can do the following:

- To create a live dump, download the "livekd" tool from Sysinternals:
>  https://docs.microsoft.com/en-us/sysinternals/downloads/livekd

Then execute the following from an elevated CMD prompt:  
 ```
livekd -o live.dmp -ml
```
- *Note: This will be less disruptive to the customer because you don't have to crash the machine.*
 
**Pro Tip:** If you get an error, KD.EXE is missing. Copy it to the location where kd.exe is present

Copy livekd into 

C:\Program Files (x86)\Windows Kits\8.0\Debuggers\x86\kd.exe
C:\Program Files (x86)\Windows Kits\8.0\Debuggers\x64\kd.exe

**Crash machine**
 
 
> https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/enabling-a-kernel-mode-dump-file
> https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/forcing-a-system-crash-from-the-keyboard
 
**Select Complete Memory Dump**
        
![tsg_AFS_kernel_2.png](/.attachments/SME-Topics/Azure-Files-Sync/tsg_AFS_kernel_2.png)

#### More Information 

- [Azure File Sync Workflow_Storage](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/510939)


::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md
:::
