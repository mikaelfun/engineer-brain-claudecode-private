---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Get OS Dump from Azure VM_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Get%20OS%20Dump%20from%20Azure%20VM_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-02-2026
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::



[[_TOC_]]

## Summary

There are multiple scenarios where you will need to get an OS Memory Dump from an Azure Virtual Machine as part of your troubleshooting.

## Warning

:warning: Before taking any memory dump, ensure the customer has agreed to collect the dump. You can verify this in DFM; see the image below as a reference.

![DFM permission](/.attachments/SME-Topics/Cant-RDP-SSH/MemoryDumpCollection_CustomerPermission.png =600x)

If the value is `false`, ask the customer to send an email providing approval to collect the memory dump. This email must be saved in the DFM as evidence.

## LabBox
https://aka.ms/LabBox

- For training purposes or following along with this TSG, you can use the following links to deploy VMs with the scenarios built-in. These labs are not to be shared with customers.

    - **Hang**

        [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Connectivity/hang.json)

    - **Crash**

        [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Connectivity/crash.json)

## Concepts

We need to establish some general concepts before working on generating a dump for our customers.


### Crash vs. Hangs

A **Crash** is defined as an unexpected termination of the Operating System. This typically occurs when something causes one or more of the OS's main services or files to stop working as intended. Most operating systems are designed to shut down immediately when this occurs. In Windows Operating Systems, this is usually associated with Bugchecks or what is commonly known as the Blue Screen of Death (BSoD).

A **Hang** refers to when the Operating System becomes unresponsive. Hangs are categorized into two types:

1. **Soft Hangs**: The OS becomes unresponsive or so slow that it cannot be managed but recovers by itself after some time, or parts of it remain responsive.
2. **Hard Hangs**: The OS becomes completely unresponsive, and the only way to recover functionality is by rebooting the OS.

### Detecting a Recent Crash

<details close>
<summary>Click here to expand or collapse this section</summary>

#### Guest OS

In the `System.evtx` event logs, you will see a 1001 event similar to the one below if the value for `HKLM:\SYSTEM\CurrentControlSet\Control\CrashControl -> LogEvent` is `1` (default):

```
Log Name:      System
Source:        Microsoft-Windows-WER-SystemErrorReporting
Date:          11/7/2019 10:33:31 AM
Event ID:      1001
Task Category: None
Level:         Error
Keywords:      Classic
User:          N/A
Computer:      COMPUTERNAME
Description:
The computer has rebooted from a bugcheck.
The bugcheck was: 0x00000080 (0x00000000004f4454, 0x0000000000000000, 0x0000000000000000, 0x0000000000000000). A dump was saved in: C:\windows\MEMORY.DMP.
```

Check for the `C:\Windows\MEMORY.DMP` file after the crash when the server has restarted. This is only applicable if the server has been configured to save a memory dump.

#### Platform

When following the **Basic Workflow_Restarts - Overview** and generating ASC Insights, the RCA for a bug check may be generated to share with the customer.

If you check the VM in [ASC](https://aka.ms/ascprod):

- In the **Health** tab under **Resource Events** and possibly the **Availability Graph**, you'll see:
        ```
        The Virtual Machine is undergoing a reboot due to a guest OS crash. The local data remains unaffected during this process. No other action is required at this time.
        ```
![TheVMIsUndergoingARebootDueToAGuestOSCrash.png](/.attachments/SME-Topics/Cant-RDP-SSH/Get-OS-Dump-From-Azure-VM_TheVMIsUndergoingARebootDueToAGuestOSCrash.png)

If you check the VM in [ASI](https://aka.ms/ASI) -> **EEE RDOS view**:

- The **Container OS State** might not be `ContainerOsStateHealthy` and instead could be `ContainerOsStateUnhealthy` during the problem time.
- The **Hyper-V Heartbeat State** might not be `HeartBeatStateOk` and instead could be `HeartBeatStateLostCommunication` during the problem time. If there is a context, it will be `VirtualMachineCrashed`.

![HeartBeatStateLostCommunication.png](/.attachments/SME-Topics/Cant-RDP-SSH/Get-OS-Dump-From-Azure-VM_HeartBeatStateLostCommunication.png)

The container's **RH Annotation Report** can state `VirtualMachineCrashed`.

The container's **Hyper-V Worker Events** can show `(18590) Bugcheck of Guest VM`.

ErrorCode0 in the Description field can indicate the type of crash detected. For example, `0x80` represents an NMI (non-maskable interrupt) crash, typically triggered from the Serial Console (`0x80 = NMI_HARDWARE_FAILURE`). See [NMI crash details](https://wsdue.azurewebsites.net/view/00000080).

To correlate NMI-triggered crashes, you can query Hyper-V Worker and Management events using Kusto. For instance:

```k
let starttime = datetime({StartTime});
let endtime = starttime + 10m;
let nodeid = "{NodeId}";
let containerid = "{ContainerId}";
cluster("azcore.centralus.kusto.windows.net").database("Fa").WindowsEventTable
| where PreciseTimeStamp between(starttime .. endtime)
| where NodeId == nodeid
| where ProviderName contains "Hyper-V"
| where EventId == "18590" and Description contains "0x80"
| project PreciseTimeStamp, todatetime(TimeCreated), Cluster, Level, ProviderName, EventId, Channel, Description, NodeId
| order by TimeCreated asc;
union
cluster("azcore.centralus").database("Fa").HyperVWorkerTable,
cluster("azcore.centralus").database("Fa").HyperVVmmsTable
| where NodeId == nodeid
| where PreciseTimeStamp between(starttime .. endtime)
| where Message contains "InjectNonMaskableInterrupt" or Message contains "Injecting a non-maskable interrupt"
| project TIMESTAMP, EventId, ProviderName,Message
```

**Example output:**

| PreciseTimeStamp           | TimeCreated                  | Cluster        | Level | ProviderName                   | EventId | Channel                               | Description                                                                                                                        | NodeId         |
|---------------------------|------------------------------|---------------|-------|-------------------------------|---------|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|----------------|
| 2025-08-21T20:04:00.000Z  | 2025-08-21T20:04:45.4085915Z | YTO21PrdApp08 | 1     | Microsoft-Windows-Hyper-V-Worker | 18590   | Microsoft-Windows-Hyper-V-Worker-Admin | '63dd2e5b-...' has encountered a fatal error. The guest operating system reported ErrorCode0: 0x80 ... (Virtual machine ID ...)    | 7e47348c-...   |

| TIMESTAMP                 | EventId | ProviderName                       | Message                                                                                      |
|---------------------------|---------|------------------------------------|----------------------------------------------------------------------------------------------|
| 2025-08-21T20:04:45.4079342Z | null    | Microsoft.Windows.HyperV.Management | {"TaskTypeName":"Injecting a non-maskable interrupt","State":"Running"}                      |
| 2025-08-21T20:04:45.4079959Z | null    | Microsoft.Windows.HyperV.Management | {"VmId":"ddf82b24-...","State":"VmmsVmStateRunning","Reason":"Task started"}                 |
| 2025-08-21T20:04:45.4098567Z | null    | Microsoft.Windows.HyperV.Management | {"TaskTypeName":"Injecting a non-maskable interrupt","State":"Completed"}                    |

This correlation helps confirm that an NMI was injected and resulted in a guest VM crash with ErrorCode0: `0x80`.

The description might indicate something similar to:
```
'<<Container ID GUID>>' has encountered a fatal error.  The guest operating system reported that it failed with the following error codes: ErrorCode0: 0xD1, ErrorCode1: 0xFFFFE609207FD050, ErrorCode2: 0x2, ErrorCode3: 0x0, ErrorCode4: 0xFFFFF80156F612D0.  PreOSId: 0.  If the problem persists, contact Product Support for the guest operating system.  (Virtual machine ID <<GUID>>)
```
![18590BugcheckOfGuestVM.png](/.attachments/SME-Topics/Cant-RDP-SSH/Get-OS-Dump-From-Azure-VM_18590BugcheckOfGuestVM.png)

The Node might report the container guest OS crash under **Node Health** in the parameter **Remarkable Event - Hyper-V** with a similar description as the Hyper-V Worker Event. The **SuspiciousCategory** will be `GuestOS`.

![RemarkableEvent-Hyper-V.png](/.attachments/SME-Topics/Cant-RDP-SSH/Get-OS-Dump-From-Azure-VM_RemarkableEvent-Hyper-V.png)

If the customer checks the **Boot Diagnostics** blade -> **Serial Log** from the [Azure Portal](https://aka.ms/azureportal), they will see a BLUESCREEN event:
```
<INSTANCE CLASSNAME="BLUESCREEN">
<PROPERTY NAME="STOPCODE" TYPE="string"><VALUE>"0xD1"</VALUE></PROPERTY><machine-info>
<name>vmCrash</name>
<guid>20bf9ade-650b-4415-9e2f-cc044c21c6c9</guid>
<processor-architecture>AMD64</processor-architecture>
<os-version>10.0</os-version>
<os-build-number>17763</os-build-number>
<os-product>Windows Server 2019 Datacenter</os-product>
<os-service-pack>None</os-service-pack>
</machine-info>
</INSTANCE>

!SAC>
Your PC ran into a problem and needs to restart.
If you call a support person, give them this info:
DRIVER_IRQL_NOT_LESS_OR_EQUAL

myfault.sys

0xFFFF800CD3558010
0x0000000000000002
0x0000000000000000
0xFFFFF80211FF12D0

We're just collecting some error info, and then we'll restart for you. 0% complete
We're just collecting some error info, and then we'll restart for you. 0% complete
We're just collecting some error info, and then we'll restart for you. 15% complete
[...]
```
</details>

### Memory Dump

A memory dump is a copy or snapshot of the memory that was being used by the Operating System at the time it was generated. It can be used to diagnose and identify the root cause of certain behaviors on the OS, such as hangs or crashes.


#### Common Scenarios Requiring Memory Dumps

- Frequent or random OS crashes (Bugcheck/BSOD)

- VM becomes unresponsive (hard hang)

- Application or process consistently causing OS instability

- Performance degradation with high CPU or memory usage

- Debugging kernel driver issues or suspected OS-level deadlocks

#### Recommended Tools for Dump Analysis

- WinDbg / WinDbg Preview – for analyzing .dmp files
- KD (Kernel Debugger) – for advanced kernel-level debugging
- DumpChk – to verify dump file integrity


#### Types of Memory Dump

In Windows, there are [five possible kernel-mode dump types](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/varieties-of-kernel-mode-dump-files):

1. **Automatic** - Default type since Windows 8/2012.
2. **Small** - Also called a minidump; this will only have 64 KB of data.
3. **Kernel** - Collects data in the Kernel memory (System Memory) and skips the User processes.
4. **Complete** - Collects all of the physical memory in the system (usually the most helpful in troubleshooting).
5. **Active** - Only present in Windows 10 and Windows Server 2016.

These differ from [user-mode dumps](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/user-mode-dump-files) as they are focused on system hangs/crashes. For troubleshooting any customer case, we will only work with **Kernel** or **Complete** dumps.

**Note:** We will always work towards collecting a **Kernel memory dump** first, and only if required will we work to get a **Complete dump**.

There are also additional dump collection methods besides a regular crash-generated dump:

- **Dedicated** - Can be configured without modifying the page file or restarting the OS until crashed by using a dedicated dump file (a page file used solely for crash dump collection).
- **Live** - Does not reset the system when the dump is collected (usually not recommended as they are more difficult to debug).

For more information on Memory Dumps, please review this document: [*Overview of memory dump file options for Windows*](https://support.microsoft.com/en-us/help/254649/overview-of-memory-dump-file-options-for-windows).

### Prerequisite

For configuring the Memory Dumps from within the OS, we also need to configure the Page file accordingly as the memory dump is written to the page file.

- For configuring a **Complete Memory Dump**, set the page file on boot volume as `[(RAM size in GB x 1024) + 258] MB`.
    Example: If the RAM is set as 4 GB, set the page file as `(4 x 1024) + 258 = 4354 MB`.
- For any other dump type, the page file can be set as **system managed**.
- [Memory dumps from deprecated operated systems will not be analyzed by Windows EEs](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1566510).

### What is "In-State"?

Throughout this document and any document where we talk about collecting memory dumps in the case of hangs, we will refer to the Virtual Machine being **In State**. This simply means that the Virtual Machine's Operating System **must** be experiencing the behavior we are trying to investigate/troubleshoot.

This is extremely important as a memory dump is completely useless unless it is triggered while the issue is occurring. If not, we will only have information on the OS and not on the issue.

### Pros & Cons

|                          |                          | **Pros**                                                                                                                                                                                                                                                                                                                                                       | **Cons**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------------|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *Pull memory dump from the guest* |                          | 1. Everyone on the team can do it and guide the customer to do it.<br>2. No extra JIT access is required.<br>3. Once the dump file is created, it follows the same rules as on-prem where the dump can be collected and uploaded to a DTM workspace.<br>4. Its analysis is much faster:<br>   - GES can download the dump file and connect directly to the symbol servers to do the debugging.<br>   - GES doesn’t need to file any extra JIT access to get this information. | 1. The VM is crashed on demand.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| *Pull memory dump from the host*  |                          | 1. The VM is paused and resumed, so it is not crashed. However, this doesn’t reinstate the availability of the VM.                                                                                                                                                                                                                                                | 1. Only a small subset of the team can do this.<br>2. Cannot snapshot VMs with RAM larger than 64GB.<br>3. JIT access required.<br>4. Once the dump file is created, as per Microsoft’s policy, the memory dump cannot leave the jumpbox environment.<br>5. Its analysis is slow:<br>   - GES requires filing JIT access to get to the jumpbox where the dump file is.<br>   - The debugging experience is slow as the jumpbox is a secure environment and doesn’t have access to the symbol servers. This goes through a proxy server which most of the time is broken or adds extra latency on the queries. So every command the Windows EE tries takes a while to get each outcome.<br>6. Every time we are pulling a memory dump from the host, there is a chance of:<br>   - Pausing/Resuming the wrong container and affecting another customer.<br>   - For big machines, there’s a chance of the machine hanging on stopping/starting, so a crash of the VM will be needed.<br>   - We could end up impacting the node and affecting every single container running on this host. |

### Brownbag & videos related

1. [Generate a memory dump from an Azure Virtual Machine](https://microsoft.sharepoint.com/:v:/t/VMHub/EUAKyBlVLWxNmpIJfYOX2bMBkEEUiVDYbjTIH1bxrba8vw?e=ACwG68)
2. [Memory Dump Collection - NMI Update](https://microsoft.sharepoint.com/:v:/t/VMHub/EcVgpPJLC_dFlGH3CoPYAVwBs8SByBoksW4KnEponb0yZw?e=YBm4Ny)

## Instructions

### <span style="color:red">Cases where the OS is crashing</span>

The interruption to crash the OS needs to come from the OS itself and cannot be done on-demand.

1. The OS needs to be set up accordingly so upon the crash, the OS knows that the memory stack needs to be dumped to a file.
2. If you have access to the VM normally, you will want to set up the VM so the OS is ready for the next reproduction of the issue.
3. However, if the machine is in a loop, you won't be able to make these changes in ONLINE mode, so you will need to make these changes in OFFLINE mode.

#### <span style="color:orange">ONLINE mode</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

1. If the machine is available over the network, you can connect using any of the following:

    1. [Access the VM using remote CMD](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495101/Access-via-Remote-CMD_RDP-SSH)
    2. [Access the VM using remote PowerShell](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495102/Access-via-Remote-PowerShell_RDP-SSH)

2. If the machine is not available over the network, you could try to use [Serial Console Feature](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495099/Access-via-Serial-Console_RDP-SSH)

3. In any case, you will need to push the following changes:

    ```bat
    REM Setup the OS to collect an OS dump upon crash
    REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
    REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

        REM For kernel dump
        REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f

        REM For full dump
        REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f

    REM Restart the VM so the changes take place
    shutdown /r /t 0 /f

    **Note:** The registry key NMICrashDump isn't required for clients running Windows 8 and later, or servers running Windows Server 2012 and later. Setting this registry key on later versions of Windows has no effect
    ```

    1. For big machines, you must ensure you don't end up in a capacity issue on the C drive because the *memory.dmp* size = Total memory of VM. For example, E64_v3 VM = 432 GB memory dump. To fix this issue, you can change the key name ***DumpFile*** above to create the file in any other drive that has enough space to hold the dump file.

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues)
</details>

<br>

#### <span style="color:orange">OFFLINE mode</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

If the machine is not booting, you can use any of the following methods to set up the dump configurations:

###### **Instructions using "az repair" extension with a script to collect full memory dump on <span style="background-color:yellow;">main OS drive</span>**

<details close>

<summary>Click here to expand or collapse this section</summary>

*If for some reason, the OS drive capacity is limited, proceed with the manual offline approach adding the registry keys manually to <span style="background-color:yellow;">**use another drive with enough capacity**.</span>*

1. Launch CLI in Azure Cloud Shell and run the commands below, being **"sourceRG"** the **resource group name** of the VM in question and **"sourceVM"** the **VM name** in question.
2. Commands to install **OR** update the extension:

    ```bash
    # Install extension:
    az extension add -n vm-repair

    # Update extension:
    az extension update -n vm-repair
    ```

3. Command to create a repair/rescue VM with OS disk attached as a data disk:

    ```bash
    # Non-Encrypted VM
    az vm repair create -g sourceRG -n sourceVM

    # Encrypted VM
    az vm repair create -g sourceRG -n sourceVM --unlock-encrypted-vm
    ```

4. Command to run **win-sacdump-on** script on repair/rescue VM:

    ```bash
    az vm repair run -g sourceRG -n sourceVM --run-on-repair --run-id win-sacdump-on
    ```

5. Command to swap the OS disk of the VM in question with the modified/fixed disk:

    ```bash
    az vm repair restore -g sourceRG -n sourceVM
    ```

6. When the problem is happening, you can use the portal to send the **NMI (Non-Maskable Interrupt).**

![a7c43f4d-6ae5-482a-61c9-c84d0ac3d8ae500px-SAC-NMI-1.png](/.attachments/SME-Topics/Cant-RDP-SSH/a7c43f4d-6ae5-482a-61c9-c84d0ac3d8ae500px-SAC-NMI-1.png)
<br>
![f72276ad-de3e-e434-b14e-0d5b0a84f64d600px-SAC-NMI-2.png](/.attachments/SME-Topics/Cant-RDP-SSH/f72276ad-de3e-e434-b14e-0d5b0a84f64d600px-SAC-NMI-2.png)
<br>
![4ffe461e-a163-338f-524e-4e1eb5402d98600px-SAC-NMI-3.png](/.attachments/SME-Topics/Cant-RDP-SSH/4ffe461e-a163-338f-524e-4e1eb5402d98600px-SAC-NMI-3.png)
<br>
![c16aac0b-9495-6b05-47b4-5e4cc44454f7600px-SAC-NMI-4.png](/.attachments/SME-Topics/Cant-RDP-SSH/c16aac0b-9495-6b05-47b4-5e4cc44454f7600px-SAC-NMI-4.png)

**NOTE**: *If the rescue VM was created manually without the "az repair" extension, you can attempt to run the script manually by copying it from GitHub and pasting it in the "run command" option of the rescue VM **ONLY** if the OS disk of the VM in question is properly attached as a data disk **AND** online.*
**win-sacdump-on**: <https://raw.githubusercontent.com/Azure/repair-script-library/master/src/windows/sac-os-dump-enabler.ps1>

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues)

</details>

##### Using [*Recovery Script*](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496470)

<details close>

<summary>Click here to expand or collapse this section</summary>

###### For ARM VMs

<details close>

<summary>Click here to expand or collapse this section</summary>

- Use Phase 1 to mount the OS disk on your rescue VM

::: template /.templates/SME-Topics/Cant-RDP-SSH/Azure-Virtual-Machine-RDPSSH-DumpSettingsOFFLINE-Template.md
:::

- Use Phase 2 to reassemble the original VM with the now properly set up disk and repro the OS crash so the memory dump is created

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues)
</details>

###### For Classic VMs

<details close>

<summary>Click here to expand or collapse this section</summary>

- Use Phase 1 to mount the OS disk on your rescue VM

::: template /.templates/SME-Topics/Cant-RDP-SSH/Azure-Virtual-Machine-RDPSSH-DumpSettingsOFFLINEClassic-Template.md
:::

- Use Phase 2 to reassemble the original VM with the now properly set up disk and reproduce the OS crash so the memory dump is created.

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).
</details>

</details>

<br>

##### Using [*OSDisk Swap API*](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496468)

<details close>

<summary>Click here to expand or collapse this section</summary>

<div>

*Applies only for ARM VMs*

</div>

1. Stop and deallocate the VM.

2. If the disk is encrypted, refer to [Unlock Encrypted Linux Disk](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/543386) or [Unlock Encrypted Windows Disk](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495071) first.

3. Take a snapshot of the broken OS disk in the same storage account.

4. Attach this snapshot disk to a rescue VM.

5. Now open an elevated CMD and run the following script:

    ```cmd
    reg load HKLM\BROKENSYSTEM f:\windows\system32\config\SYSTEM

    REM Enable the OS to create a memory dump file upon crash
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

        REM For Kernel memory dump
        REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f
        REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f

        REM For Full memory dump
        REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
        REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f

    REM Extra setting - Enable Serial Console
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /set {bootmgr} displaybootmenu yes
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /set {bootmgr} timeout 10
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /set {bootmgr} bootems yes
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /ems {"BOOT LOADER IDENTIFIER"} ON
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /emssettings EMSPORT:1 EMSBAUDRATE:115200

    reg unload HKLM\BROKENSYSTEM
    ```

    **Note 1:** This will assume that the disk is drive F:, if this is not your case, update the letter assignment.
    **Note 2:** The registry key NMICrashDump isn't required for clients running Windows 8 and later, or servers running Windows Server 2012 and later. Setting this registry key on later versions of Windows has no effect.

    1. For big machines, you must ensure you don't end up in a capacity issue on the C drive because the *memory.dmp* size = Total memory of VM. For example, E64\_v3 VM = 432 GB memory dump. To fix this issue, you can change the key name ***DumpFile*** above to create the file in any other drive that has enough space to hold the dump file.

6. Detach the now fixed disk.

7. Use [OSDisk swap API](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496468) to reassemble the VM with the now properly set up disk and reproduce the OS crash so the memory dump is created.

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).
</details>

##### Using *VM Recreation scripts*

<details close>

<summary>Click here to expand or collapse this section</summary>

###### For ARM VMs

<details close>

<summary>Click here to expand or collapse this section</summary>

1. Use the section called *Get the VM configuration data* from [Recreate an ARM Virtual Machine](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495137/Recreate-ARM-VM_RDP-SSH?anchor=get-the-vm-configuration-data) to get the VM configuration JSON.

2. Using [*Microsoft Azure Storage Explorer*](https://go.microsoft.com/fwlink/?LinkId=708343), create a clone of the OS disk as a backup measure.

3. Delete the VM.

4. Attach the OS Disk to a rescue VM.

5. Now open an elevated CMD and run the following script:

    ```cmd
    reg load HKLM\BROKENSYSTEM f:\windows\system32\config\SYSTEM

    REM Enable the OS to create a memory dump file upon crash
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

        REM For Kernel memory dump
        REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f
        REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f

        REM For Full memory dump
        REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
        REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f

    REM Extra setting - Enable Serial Console
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /set {bootmgr} displaybootmenu yes
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /set {bootmgr} timeout 10
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /set {bootmgr} bootems yes
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /ems {"BOOT LOADER IDENTIFIER"} ON
    bcdedit /store "VOLUME LETTER WHERE THE BCD FOLDER IS":\boot\bcd /emssettings EMSPORT:1 EMSBAUDRATE:115200

    reg unload HKLM\BROKENSYSTEM
    ```

    **Note 1:** This will assume that the disk is drive F:, if this is not your case, update the letter assignment.
    **Note 2:** The registry key NMICrashDump isn't required for clients running Windows 8 and later, or servers running Windows Server 2012 and later. Setting this registry key on later versions of Windows has no effect.

    1. For big machines, you must ensure you don't end up in a capacity issue on the C drive because the *memory.dmp* size = Total memory of VM. For example, E64\_v3 VM = 432 GB memory dump. To fix this issue, you can change the key name ***DumpFile*** above to create the file in any other drive that has enough space to hold the dump file.

6. Detach the now fixed disk.

7. Use the section called *Recreate the VM from JSON* from [Recreate an ARM Virtual Machine](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495137) to recreate the VM with the now properly set up disk and reproduce the OS crash so the memory dump is created.

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).
</details>

###### For Classic VMs

<details close>

<summary>Click here to expand or collapse this section</summary>

1. Use the section called *Get the VM configuration data* from [Recreate an RDFE Virtual Machine](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495139) to get the XML configuration file from the VM.

2. Using [*Microsoft Azure Storage Explorer*](https://go.microsoft.com/fwlink/?LinkId=708343), create a clone of the OS disk as a backup measure.

3. Delete the VM.

4. Attach the OS Disk to a rescue VM.

5. Now open an elevated CMD and run the following script:

    ```cmd
    reg load HKLM\BROKENSYSTEM f:\windows\system32\config\SYSTEM

    REM Enable the OS to create a memory dump file upon crash
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

    REM For Kernel memory dump
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f

    REM For Full memory dump
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f

    reg unload HKLM\BROKENSYSTEM
    ```

    **Note 1:** This will assume that the disk is drive F:. If this is not your case, update the letter assignment.
    **Note 2:** The registry key NMICrashDump isn't required for clients running Windows 8 and later, or servers running Windows Server 2012 and later. Setting this registry key on later versions of Windows has no effect.

    1. For big machines, you must ensure you don't end up in a capacity issue on the C drive because the *memory.dmp* size = Total memory of VM. For example, E64\_v3 VM = 432 GB memory dump. To fix this issue, you can change the key name ***DumpFile*** above to create the file in any other drive that has enough space to hold the dump file.

6. Detach the now fixed disk.

7. Use the section called *Recreate the Virtual Machine* from [Recreate an RDFE Virtual Machine](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495139) to recreate the VM with the now properly set up disk and reproduce the OS crash so the memory dump is created.

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).

</details>
</details>
</details>

#### <span style="color:orange">Dedicated Memory Dump without reboot</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

Configure without restart:

- Go to your Portal.

- Click on your Azure Cloud Shell at the top of the portal (or via <http://shell.azure.com/>).

  ![Azure Cloud Shell](/.attachments/SME-Topics/Cant-RDP-SSH/GuestOSDump_cloudshell.jpg)

- Make sure your shell is set to Bash to run CLI commands (`az` commands may also work in PowerShell, but could have unexpected errors as the syntax sometimes differs between the two shells).

  ![Bash image](/.attachments/SME-Topics/Cant-RDP-SSH/GuestOSDump_Bash.jpg)

- Set your subscription by running the following:

    ```bash
    az account set --subscription "{INSERT_SUBID}"
    ```

- Run the Install command to install the repair extension:

    ```bash
    az extension add -n vm-repair
    ```

- Or, if you have previously used the az vm repair commands, apply any updates to the vm-repair extension:

   ```bash
   az extension update -n vm-repair
   ```

- Run the following command to configure a Memory Dump and Dedicated Dump File without restart:

   ```bash
   az vm repair run -g "INSERT_RG" -n "INSERT_VM_NAME" --run-id win-dumpconfigurator --parameters dumptype=full DedicatedDumpFile="D:\dd.sys" DumpFile="%SystemRoot%\Memory.dmp" --verbose
   ```

  - %SystemRoot% is the OS disk letter & Windows folder.

<span style="color:red">You need approximately 2X the RAM size in free disk space because:</span>
<span style="color:red">-DD.sys consumes space when created.</span>
<span style="color:red">-Additional space is required to store the memory.dmp file.</span>

<span style="color:red">Example:</span>
<span style="color:red">If the VM has 8 GB RAM, you will need around 18 GB of free space across the disk drives to accommodate both DD.sys and the memory.dmp file.</span>

  - If you do not have `1 x RAM size` + at least `257 MB` free on the drive where the memory dump will reside, please save the memory dump to another drive. If saving to a data disk, change the DumpFile parameter accordingly to the data disk from within the OS (could be F:, G:, etc, double check prior to setting).
  - If your temp drive is not `D:\`, or it is and you do not want to save the DD.sys to `D:\`, please change the location to another drive.

- You can confirm the settings took on your VM with the following PowerShell:

   ```PowerShell
   Get-ItemProperty -Path ("HKLM:\SYSTEM\CurrentControlSet\Control\CrashControl")
   ```

- We can attempt a manual run of the dump configurator tool without using the Run Command framework. Copy the following PowerShell script into the affected VM to run (as an Administrator) in an elevated PowerShell:

    ```PowerShell
    # Declare variables
    $dumpVolume = "F"
    $temp = 'c:\temp'
    $kdbgctrl = "$($temp)\kdbgctrl.exe"
    $dumpType = "full" # Can be "active", "automatic", "full", "kernel", "mini"
    $CrashCtrlPath = "HKLM:\SYSTEM\CurrentControlSet\Control\CrashControl"
    $DedicatedDumpFile = "$($dumpVolume):\dd.sys"
    $DumpFile = "$($dumpVolume):\Memory.dmp"

    # Create c:\temp directory if it doesn't exist
    if (!(Test-Path -Path $temp)) {
        New-Item -Path $temp -ItemType Directory
    }

    # Download kdbgctrl.exe to configure dump without restart
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::TLS12
    $client = New-Object System.Net.WebClient
    $client.DownloadFile('https://github.com/Azure/repair-script-library/raw/main/src/windows/common/tools/kdbgctrl.exe', $kdbgctrl)

    # Configure DDF
    Set-ItemProperty -Path $CrashCtrlPath -Name 'DedicatedDumpFile' -Value $DedicatedDumpFile
    Set-ItemProperty -Path $CrashCtrlPath -Name 'DumpFile' -Value $DumpFile
    & $kdbgctrl -sd $DumpType
    ```

- Then if the issue reoccurs, we can trigger the NMI crash like so from the Serial Console:

  ![NMI](/.attachments/SME-Topics/Cant-RDP-SSH/GuestOSDump_NMIdedicated.jpg)

  This will force the VM to crash and save a memdump for analysis. It will take some time to generate the dump file in the save location, but once it has finished, we can start the VM and collect the .dmp file for upload and further analysis. You can also test the NMI functionality after configuring the VM for a dump, but please note for production environments that this will cause the VM to crash and collecting the dump can take some time depending on the size.

  If the dump file did not collect or appears to be corrupt, collect the Dedicated Dump File (`dd.sys`) for attempted analysis.

</details>

### <span style="color:red">Cases where VM is unresponsive - Hang</span>

In this case, if there's no crash, the OS will not trigger the IRQL to call the crash routine, and you will need to call it out on demand. You can trigger this IRQL in multiple ways:

1. If your machine is responsive on *Serial Console* and ***you can open CMD channel*** and execute commands, then you can use:
    1. *Bugcheck 0x000000D1 - DRIVER IRQL NOT LESS OR EQUAL*
    2. *Bugcheck 0x000000E2 - MANUALLY\_INITIATED\_CRASH*
    3. *Bugcheck 0x00000080 - NMI\_HARDWARE\_FAILURE*
2. If your machine is responsive on *Serial Console* but ***you cannot open a CMD channel***, then your options are:
    1. *Bugcheck 0x000000E2 - MANUALLY\_INITIATED\_CRASH*
    2. *Bugcheck 0x00000080 - NMI\_HARDWARE\_FAILURE*
3. If your machine is just connecting on *Serial Console* but ***you cannot interact even with EMS at all***, then your option is:
    1. *Bugcheck 0x00000080 - NMI\_HARDWARE\_FAILURE*

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).

#### <span style="color:orange">Trigger a *Bugcheck 0x000000D1 - DRIVER IRQL NOT LESS OR EQUAL*</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

To use this option, you need to be able to connect on Serial Console and be able to open a CMD channel.

1. To use this option, you will need the following requirements:
    1. The machine needs to be at least partially responsive or in a *soft hang*:
        1. Over the network:
            - [Access using remote CMD](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495101)
            - [Access using remote PowerShell](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495102)
        2. Locally:
            - [Access using Serial Console Feature](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495099)
    2. The OS needs to be already set up:
        1. For Windows Server 2012 and up:
            1. The settings which come on the gallery image are already set to collect a *Kernel memory dump* in case of an OS crash, so you can just proceed with the steps below to cause the interruption.
            2. If a *Full memory dump* is required, then the following settings are needed:

                ```cmd
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
                ```

                For big machines, to ensure you don't end up in a capacity issue on the C drive, change the key name *DumpFile* above to create the file in any other drive that has enough space to hold a file as big as the RAM memory of the VM.
        2. For Windows Server 2008 R2:
            1. For a *Kernel memory dump*, the following registry keys need to be set up:

                ```cmd
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f
                ```

            2. For a *Full memory dump*, the following keys are required:

                ```cmd
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f
                ```

                For big machines, to ensure you don't end up in a capacity issue on the C drive, change the key name *DumpFile* above to create the file in any other drive that has enough space to hold a file as big as the RAM memory of the VM.
2. You can then use the [NotMyFault tool](https://docs.microsoft.com/en-us/sysinternals/downloads/notmyfault):
    1. Place the tool [NotMyFault.exe](https://download.sysinternals.com/files/NotMyFault.zip) on the remote server in some path like `c:\temp`.
    2. If the *Serial Console Feature* was set up accordingly, then using an administrative CMD, you can crash the VM as follows:

        ```cmd
        c:\temp\notmyfault.exe /crash
        ```

    3. If *Serial Console* is not enabled, then from another machine on the same VNET, connect to the machine and crash the server:

        ```cmd
        psexec \\{computer} -u user -s cmd
        c:\temp\notmyfault.exe /crash
        ```

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).
</details>

<br>

#### <span style="color:orange">Trigger a *Bugcheck 0x000000E2 - MANUALLY\_INITIATED\_CRASH*</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

To use this option, you need to be able to connect on Serial Console and be able to run commands on EMS.

1. To use this option, you will need the following requirements:
    1. Access using the *[Serial Console Feature](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495099)*. To do so, the following settings need to be already set on the OS:

        ```cmd
        bcdedit /set {bootmgr} displaybootmenu yes
        bcdedit /set {bootmgr} timeout 10
        bcdedit /set {bootmgr} bootems yes
        bcdedit /ems {current} on
        bcdedit /emssettings EMSPORT:1 EMSBAUDRATE:115200
        shutdown /r /t 0 /f
        ```

    2. The OS needs to be already set up:
        1. For Windows Server 2012 and up:
            1. The settings which come on the gallery image are already set to collect a *Kernel memory dump* in case of an OS crash, so you can just proceed with the steps below to cause the interruption.
            2. If a *Full memory dump* is required, then the following settings are needed:

                ```cmd
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
                ```

                For big machines, to ensure you don't end up in a capacity issue on the C drive, change the key name *DumpFile* above to create the file in any other drive that has enough space to hold a file as big as the RAM memory of the VM.
        2. For Windows Server 2008 R2:
            1. For a *Kernel memory dump*, the following registry keys need to be set up:

                ```cmd
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 2 /f
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
                ```

            2. For a *Full memory dump*, the following keys are required:

                ```cmd
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
                REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
                ```

                For big machines, to ensure you don't end up in a capacity issue on the C drive, change the key name *DumpFile* above to create the file in any other drive that has enough space to hold a file as big as the RAM memory of the VM.
2. When the problem is happening, you can use the portal to send this interruption:

    ![fc73f7b1-2fa2-ada6-4d63-117c377f78f4500px-SAC-CrashEMS-1.png](/.attachments/SME-Topics/Cant-RDP-SSH/fc73f7b1-2fa2-ada6-4d63-117c377f78f4500px-SAC-CrashEMS-1.png)
    ![3834e6ca-07c5-19d6-fa26-f262fd8db6b2600px-SAC-CrashEMS-2.png](/.attachments/SME-Topics/Cant-RDP-SSH/3834e6ca-07c5-19d6-fa26-f262fd8db6b2600px-SAC-CrashEMS-2.png)
    ![5e585fe4-47a0-e32f-5998-935855a250c4600px-SAC-CrashEMS-3.png](/.attachments/SME-Topics/Cant-RDP-SSH/5e585fe4-47a0-e32f-5998-935855a250c4600px-SAC-CrashEMS-3.png)

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).

</details>

<br>

#### <span style="color:orange">Trigger a *Bugcheck 0x00000080 - NMI\_HARDWARE\_FAILURE*</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

**Notes:**

1. If the VM is a *Windows 7* or *Windows Server 2008 R2* VM and you attempt these steps and end up with a screenshot saying *[Hardware Malfunction](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495247)*, it means that the NMI registry key is **not** set up on the guest.
2. The NMI option will appear on the SAC session while this session is ***active***. Once the session goes idle, the image will display the message *This session was closed due to inactivity. To reconnect, press "ENTER"* and the NMI option will disappear. To flag the session as active again, you will need to change to another option on the VM menu and then back to the Serial Console option so the SAC frame refreshes and reconnects to the guest.
3. ***It is not required that EMS is enabled on the guest to use this option.***

1. The OS needs to be *already set up*:
    1. For Windows Server 2012/Windows 8 and up:
        1. The settings which come on the gallery image are already set to collect a *Kernel memory dump* in case of an OS crash, so *you can just proceed with the steps below to cause the interruption*.
        2. If a *Full memory dump* is required, then the following settings are needed:

            ```cmd
            REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
            REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
            ```

            1. For big machines, to ensure you don't end up in a capacity issue on the C drive, change the key name *DumpFile* above to create the file in any other drive that has enough space to hold a file as big as the RAM memory of the VM.

    2. For Windows Server 2008 R2 and Windows 7 VMs, you will need the NMI key in addition to the above:

        ```cmd
        REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f
        ```

        1. For big machines, to ensure you don't end up in a capacity issue on the C drive, change the key name *DumpFile* above to create the file in any other drive that has enough space to hold a file as big as the RAM memory of the VM.

2. When the problem is happening, you can use the portal to send this interruption:
    1. In case your VM is a Windows Server type, and if you have enabled EMS on the Guest OS, you may even interact with the VM:
         <br>
![a7c43f4d-6ae5-482a-61c9-c84d0ac3d8ae500px-SAC-NMI-1.png](/.attachments/SME-Topics/Cant-RDP-SSH/a7c43f4d-6ae5-482a-61c9-c84d0ac3d8ae500px-SAC-NMI-1.png)
         <br>
![f72276ad-de3e-e434-b14e-0d5b0a84f64d600px-SAC-NMI-2.png](/.attachments/SME-Topics/Cant-RDP-SSH/f72276ad-de3e-e434-b14e-0d5b0a84f64d600px-SAC-NMI-2.png)
         <br>
![4ffe461e-a163-338f-524e-4e1eb5402d98600px-SAC-NMI-3.png](/.attachments/SME-Topics/Cant-RDP-SSH/4ffe461e-a163-338f-524e-4e1eb5402d98600px-SAC-NMI-3.png)
         <br>
![c16aac0b-9495-6b05-47b4-5e4cc44454f7600px-SAC-NMI-4.png](/.attachments/SME-Topics/Cant-RDP-SSH/c16aac0b-9495-6b05-47b4-5e4cc44454f7600px-SAC-NMI-4.png)

3. For client VM types:
    1. This type of crash will not be as interactive as on the Windows Server VM types as EMS is integrated there which SAC consumes, but even though Serial Console will not connect to the GuestOS (as EMS is not integrated on the OS), the NMI trigger will still work as it is using the HyperVisor of the host to send the interruption to the VM. So once the VM is in state, just go to the *Serial Console* menu and wait until the Host tries to *connect* to the guest and fails, then it will show you the little keyboard on the menu at the top.
         <br>
![f8b06e8c-7fcd-df18-2314-1182fbbd8341700px-ClientOSDump-1.png](/.attachments/SME-Topics/Cant-RDP-SSH/f8b06e8c-7fcd-df18-2314-1182fbbd8341700px-ClientOSDump-1.png)
    2. Now press the *Send Non-Maskable Interrupt (NMI)* option from the menu.
         <br>
![027469d8-15ae-9115-0f68-84e0c2123e1c700px-ClientOSDump-2.png](/.attachments/SME-Topics/Cant-RDP-SSH/027469d8-15ae-9115-0f68-84e0c2123e1c700px-ClientOSDump-2.png)
    3. Now if you check on the Boot Diagnostic option, you will see that the VM was crashed with the stop error *NMI\_HARDWARE\_FAILURE*.
         <br>
![4e93ffb3-18d8-6bdd-458c-db6a2762eb6b700px-ClientOSDump-3.png](/.attachments/SME-Topics/Cant-RDP-SSH/4e93ffb3-18d8-6bdd-458c-db6a2762eb6b700px-ClientOSDump-3.png)

Once you have completed the process and collected the Memory Dump from the machine, you can jump to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).

</details>

<br>

#### <span style="color:orange">Collecting a Live Kernel Dump Using PowerShell</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

You can use PowerShell on Windows Server 2012 (and higher) servers to get a live kernel dump without crashing the machine or modifying the registry. **NOTE**: For most scenarios, a kernel dump will not be enough for analysis. Only use this option if you are required to get a kernel dump and the customer does not want to crash the server to skip possible downtime. This method will also not work if the server is completely unresponsive to PowerShell commands (hard hang).

```PowerShell
$ssub = Get-StorageSubSystem
# If "C:\temp" does not exist, create the folder or change the location to somewhere accessible
Get-StorageDiagnosticInfo -StorageSubSystemFriendlyName $ssub.FriendlyName -IncludeLiveDump -DestinationPath "C:\temp"
```

Do not use this method to collect a kernel dump if you need a complete dump. More info: <https://docs.microsoft.com/en-us/powershell/module/storage/get-storagediagnosticinfo?view=windowsserver2022-ps&viewFallbackFrom=winserver2012-ps>.

</details>

<br>

### <span style="color:red">Cases where VM is Ephemeral (No Persistent Storage)</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

Non-persistent VMs can be more difficult to dump. The dump file may no longer be on the disk as standard ephemeral disk content is usually deleted on [reimage, resize, redeploy, maintenance events, or deallocation](https://learn.microsoft.com/en-us/azure/virtual-machines/managed-disks-overview#temporary-disk). On standard ephemeral VMs, the dump will probably still be located on the disk after a regular restart. But for some custom setups (e.g. non-persistent Citrix VDI servers) where the disk is completely deleted on restart, you will need to use the following steps to collect a memory dump.

#### LabBox

<https://aka.ms/LabBox>

- For the purpose of training or following along with this TSG, you can use the following links to deploy VMs with the scenarios built-in. These labs are not to be shared with customers.

  [![Click to Deploy](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/Test/workingEphemeralVM.json)

#### <span style="color:orange">Using a persistent data disk</span>

1. Create a persistent data disk and attach it to the VM. This disk will be used to store the memory dump file.
   - The attached data disk has to be large enough to hold the memdump (`1 x RAM size` + at least `257 MB` for drivers + header information).
2. Configure the new disk to have a persistent drive letter (e.g. `F:`).
3. Update the registry so the DumpFile is saved to the different location (e.g. `F:\MEMORY.DMP`):

    ```bat
    REM Set the dump file to be saved to the new disk
    REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "F:\MEMORY.DMP" /f

    REM Set other reg values as necessary, e.g. for full dump:
    REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f

    REM Restart the computer to apply the changes
    shutdown /r /t 0
    ```

    - NOTE: You can also use the Dedicated Dump File method to dump without a restart.

Now when the VM is crashed, it will save the dump file to the persistent disk to be retrieved. These steps can also be enacted on the golden image if the VDIs are reimaged on a regular basis.

#### <span style="color:orange">Using the page file</span>

We can also crash the VM during the issue reproduction and collect the page file for analysis. [The page file has to be large enough to hold the dump.](https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/how-to-determine-the-appropriate-page-file-size-for-64-bit-versions-of-windows#support-for-system-crash-dumps). This method is less reliable but can be attempted if the other methods fail.

1. Confirm the OS disk has a Page file:

    ```PowerShell
    # PowerShell
    Get-ChildItem -File -Hidden -System -Path "C:\" -Name "pagefile.sys" | select *
    Get-CimInstance Win32_PageFileSetting | fl *
    gwmi win32_pagefilesetting | select *

    # CMD
    dir c:\pagefile.sys /a:h /b /s
    reg query "HKLM\SYSTEM\ControlSet001\Control\Session Manager\Memory Management" /v "PagingFiles"
    reg query "HKLM\SYSTEM\ControlSet001\Control\Session Manager\Memory Management" /v "ExistingPageFiles"
    ```

    - [You can also disable hidden files in the file explorer and check for a pagefile.sys file in the root of the OS disk.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/607276)
    - If there is no return, then the VM does not have a page file. Otherwise, it will return the location of the page file and you can continue collecting the page file after the VM is restarted.

2. [Disable Autoreboot](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495118/Disable-Autoreboot_RDP-SSH) from the registry to prevent rebooting. If this is done from an online system, you will need to restart the VM to apply the changes and thus has to be done before the problem has reproduced.
3. Snapshot the ephemeral disk:

    ```PowerShell
    # Declare variables
    $rg = "rg-name"
    $vmName = "vm-name"
    $timestamp = Get-Date -Format "ddd_MM-dd-yyyy_hh-mm-tt_zz"
    $snapshotName = "$($vmName)-OSDisk-Snapshot-$timestamp"

    # Create snapshot
    $vm = Get-AzVM -ResourceGroupName $rg -Name $vmName
    $osDisk = $vm.StorageProfile.OsDisk
    $snapshotConfig = New-AzSnapshotConfig -SourceUri $osDisk.ManagedDisk.Id -CreateOption Copy -Location $vm.Location
    $snapshot = New-AzSnapshot -Snapshot $snapshotConfig -SnapshotName $snapshotName -ResourceGroupName $rg

    # Create disk from snapshot
    $diskConfig = New-AzDiskConfig -AccountType $osDisk.ManagedDisk.StorageAccountType -Location $vm.Location -CreateOption Copy -SourceResourceId $snapshot.Id -DiskSizeGB $osDisk.DiskSizeGB -OsType $osDisk.OsType -HyperVGeneration $osDisk.HyperVGeneration
    $disk = New-AzDisk -Disk $diskConfig -ResourceGroupName $rg -DiskName "$($snapshotName)-Disk"
    ```

4. Attach the newly created disk to a troubleshooting/rescue VM and retrieve the `pagefile.sys` file for analysis.

</details>

<br>

### <span style="color:red">Cases Where the Machine is not generating any Memory Dump and/or Issue Reproduces in Nested Virtualization (Hyper-V)</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

Useful in 3 situations:
1. If the issue reproduces in Hyper-V, we can collect the memory dump/snapshot without crashing the production machine: instead, we will collect what we need from the Hyper-V clone. If it's an issue where the production server is otherwise still working, this could be advantageous for the customer as they will not have any downtime from the crash and can still collect a memory dump.
    - NOTE: if the Azure VM is still in production and we are cloning it into Hyper-V, I would recommend the Hyper-V VM is created without networking so it doesn't go online while the production Azure VM is online as they could clash. Additionally, this method is only useful if the issue reproduces while the server is booted in Hyper-V. If the Azure VM is experiencing a bug check or black screen issue or some other similar issue, it has to be produced in Nested Virtualization as well. If it's a performance issue, hang or slow boot, we have to confirm it is happening in Nested V as well. Otherwise, the issue cannot be reproduced and there will not be enough helpful information in the snapshot.
2. Machine not triggering any Memory Dump for whichever reason (machine is stuck in a reboot loop, black screen or experiencing bug checks) even when the dump configuration is in place.
3. The amount of RAM in use on the Azure VM is very large and we want to have a smaller dump file to capture (easier to upload/parse as well).

First, we want to make sure that we have the dump configuration registry settings correct. Keep the broken OS disk online and run the following commands from an adminstrative command prompt on the Rescue VM.

```cmd
    REG LOAD HKLM\BROKENSYSTEM f:\windows\system32\config\SYSTEM

    REM Enable the OS to create a memory dump file upon crash - location can be changed if needed.
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v DumpFile /t REG_EXPAND_SZ /d "%SystemRoot%\MEMORY.DMP" /f

    REM Allows for NMI to crash the VM
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v NMICrashDump /t REG_DWORD /d 1 /f

    REM For Full memory dump
    REG ADD "HKLM\BROKENSYSTEM\ControlSet001\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f
    REG ADD "HKLM\BROKENSYSTEM\ControlSet002\Control\CrashControl" /v CrashDumpEnabled /t REG_DWORD /d 1 /f

    REG UNLOAD HKLM\BROKENSYSTEM
```
  **Note 1:** This will assume that the disk is drive F:. If this is not your case, update the letter assignment.
  **Note 2:** The registry key NMICrashDump isn't required for clients running Windows 8 and later, or servers running Windows Server 2012 and later. Setting this registry key on later versions of Windows has no effect.



Once this is done, we can mark the disk offline, and boot the Hyper-V VM.

If the VM does not crash on its own we can instruct the Rescue VM to inject an NMI into the Hyper-V VM and intentionally crash it using PowerShell:

[Debug-VM](https://learn.microsoft.com/en-us/powershell/module/hyper-v/debug-vm)
```PowerShell
Debug-VM "Hyper-V_VM_name" -InjectNonMaskableInterrupt -Force
```

Once the dump is generated, you want to take the disk online again and navigate to the location where the memory dump is stored. Have the customer upload to DTM from here.

Alternatively, we can collect a memory dump/snapshot while it is in the Hyper-V state: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1113527/

</details>

<br>

### <span style="color:red">Triage the memory dump - Scan for known issues</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

If you have access to the memory dump file and you can download it into your own machine which **has access to the Microsoft network**, then you can leverage the KIC tool to triage the memory dump and scan it for known issues and avoid engaging GES for further analysis.

<mark>UPDATE (April 2025):</mark><br>
Dump Insights is no longer available.

This section will be updated as soon as a replacement is available.

<!--

In order to review a memory dump (memory.dmp) for several known issues we have the dump insights tool which will make our life easier, please go through the documentation located at https://aka.ms/dumpinsights  and proceed to check, analyze and obtain a result from the memory dump.

-->

If the tool is not able to give you actionable next steps we recommend escalating the case to Windows EE's to assist us further. Please use the following template to generate that collaboration request - [Windows EE Engagement Form](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/704652):

    * Example template to use on the problem body:

        ```text
        =================== *start copy* ===================
        Symptoms description: Azure VM unreachable

        SR#:
        Customer Entitlement:

        VM name:
        Bugcheck code:

        Azure Watson link: https://azurewatson.microsoft.com/dumpuid/**<dumpGUI>**
        =================== *end copy* ===================
        ```

        **Note**: Make sure to replace the "**Azure Watson link**" above

3. If the Windows EE has troubles in accessing Azure Watson, refer to this internal article [Windows EEs - How to Access Azure Watson Dumps](https://internal.evergreen.microsoft.com/en-us/topic/1637e7bc-b531-91f7-3f11-724250235f8d?app=kbclient&search=azure%20watson)

</details>
<br>

### <span style="color:red">Collecting a Hang Dump via a Snapshot from the Host</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

##### When/Why?

If we run into an issue with collecting OS dumps through standard means, we can use this process. However, this process can cause issues on the host and should only be used as a last effort to capture the information.

You will need to engage a TA within the Azure VM POD to assist in the process, and they will hold the final judgment on whether this process should be used.

##### Pre-requisites

* Collecting a memory dump from the host node is the last option.
* Linux OS is not supported.
* Before requesting to collect a memory dump from the host node, you must confirm that all the possible options listed above were already attempted.
* Check the RAM per SKU at https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/overview.
* VMs with excessively large amounts of memory can cause issues on the node and possibly disrupt other VMs on that node, so we cannot snapshot them. Per https://supportability.visualstudio.com/AzureRapidResponse/_wiki/wikis/ARRwiki.wiki/781021/Deprecated-Collecting-VM-Dump-From-Fabric:

    "Note: If the VM's RAM size is bigger than 64GB, there is no way to create a saved state and dump on a compute node in Azure. The only option in these cases is to create the dump from within the guest."

##### Process

1. **Email the dedicated V-Team by clicking [here](mailto:avmmdmpteam@microsoft.com?subject=[<Customer%20Entitlement>|SR#:xxxxxxxxxxxxx]%20MemoryDump%20from%20HOST%20-%20New%20request&body=**WITH%20THIS%20EMAIL,%20I%20CONFIRM%20I'VE%20ALREADY%20ATTEMPTED%20EVERY%20'NMI'%20OR%20ALTERNATIVE%20DUMP%20COLLECTION%20METHODS**%0D%0A%0D%0A%20Please,%20help%20collecting%20a%20MemoryDump%20from%20the%20HOST.%20Below%20the%20relevant%20information:%0D%0A%0D%0A======================================%0D%0ASR#:%0D%0ACustomer%20Entitlement:%0D%0AClusterName:%0D%0ANodeID:%0D%0AContainerID:%0D%0AIs%20the%20VM%20currently%20facing%20the%20issue?:%20Yes/No%0D%0AGuest%20OS%20Version%20%28must%20be%20above%20Windows%20Server%202012R2%29%3A%0D%0A======================================%0D%0A%0D%0ATSG%20Link:%20https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495123/Get-OS-Dump-from-Azure-VM_RDP-SSH?anchor=for-tas-only---initiate-vm-memory-dump-process---for-tas-only%0D%0A%0D%0AThanks,%0D%0A).**

- If the [mailto link](mailto:avmmdmpteam@microsoft.com?subject=[<Customer%20Entitlement>|SR#:xxxxxxxxxxxxx]%20MemoryDump%20from%20HOST%20-%20New%20request&body=**WITH%20THIS%20EMAIL,%20I%20CONFIRM%20I'VE%20ALREADY%20ATTEMPTED%20EVERY%20'NMI'%20OR%20ALTERNATIVE%20DUMP%20COLLECTION%20METHODS**%0D%0A%0D%0A%20Please,%20help%20collecting%20a%20MemoryDump%20from%20the%20HOST.%20Below%20the%20relevant%20information:%0D%0A%0D%0A======================================%0D%0ASR#:%0D%0ACustomer%20Entitlement:%0D%0AClusterName:%0D%0ANodeID:%0D%0AContainerID:%0D%0AIs%20the%20VM%20currently%20facing%20the%20issue?:%20Yes/No%0D%0AGuest%20OS%20Version%20%28must%20be%20above%20Windows%20Server%202012R2%29%3A%0D%0A======================================%0D%0A%0D%0ATSG%20Link:%20https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495123/Get-OS-Dump-from-Azure-VM_RDP-SSH?anchor=for-tas-only---initiate-vm-memory-dump-process---for-tas-only%0D%0A%0D%0AThanks,%0D%0A) isn't working, please email <avmmdmpteam@microsoft.com> by providing the below information:

```
**Recipients and email subject:**

**TO:** avmmdmpteam@microsoft.com
**CC:** Your TA
**Email Subject:** [<Customer Entitlement>|SR#:xxxxxxxxxxxxx] MemoryDump from HOST - New request

**Email body:**

**WITH THIS EMAIL, I CONFIRM I'VE ALREADY ATTEMPTED EVERY 'NMI' OR ALTERNATIVE DUMP COLLECTION METHODS**

Please, help collect a MemoryDump from the HOST. Below is the relevant information:

=================== *start copy* ===================
SR#:
Customer Entitlement:
ClusterName:
NodeID:
ContainerID:
Is the VM currently facing the issue?: Yes/No
Guest OS Version (must be above Windows Server 2012R2):
=================== *end copy* ===================

[TSG: Get OS Dump from Azure VM](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495123/Get-OS-Dump-from-Azure-VM_RDP-SSH?anchor=for-tas-only---initiate-vm-memory-dump-process---for-tas-only)
```

2. TA or SME will acknowledge the request and proceed by validating it first and, if the prerequisites are satisfied, will collect the memory dump.
**NOTE: TA ONLY Process** [Jarvis Action - Initiate VM Memory Dump](#for-tas-only---initiate-vm-memory-dump-process---for-tas-only)

3. Once the TA or SME has completed the process and the Memory Dump is generated from the machine, you can move to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).

</details>

<br>

### <span style="color:red">FOR TAs ONLY - Initiate VM Memory Dump PROCESS - FOR TAs ONLY</span>

<details close>

<summary>Click here to expand or collapse this section</summary>

- Must be a TA within the Azure VM Pod.
- Requires SAW device.
- AME Account is mandatory.
    - CORP accounts can't be used to submit the JIT request anymore. Please, make sure to authenticate to Jarvis Actions using the **@ame.gbl** account.

- VM TAs with AME accounts, please join the below Security Groups via [OneIdentity](https://aka.ms/oneidentity) from SAW:
    - Requestor: AzVM-MemoryDumpRequestorAME (VM TA - ensuring 24x7x365 coverage)
    - Approver: AzVM-MemoryDumpApproverAME (VM TA - ensuring 24x7x365 coverage)

**NOTE:** Due to changing security policies as of 4/8/2024 the following countries will no longer be able to access Geneva Actions to capture a memory dump from the host.  For more, please click this [link](https://microsoft.sharepoint.com/teams/CAIEO14117/SitePages/Overview-EO-14117.aspx?CT=1744061956224&OR=OWA-NT-Mail&CID=210cf0f3-8437-c952-57a4-2f75f649ec54&ga=1)

#### Process

1. Login to SAW.

2. Go to Jarvis Action [ComputeSupportability > Fabric Operations > Initiate VM Memory Dump](https://portal.microsoftgeneva.com/274852A4?genevatraceguid=1f867c40-a203-4be7-bb46-96cf8ec2f88b).

3. Click Authenticate.

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_Authentication.png)

4. Choose **@ame.gbl** account.

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_AuthAccountAME.png)

5. Click Get Access.

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_getaccess.png)

6. Fields:
     - Work-item Source: Other
     - Work-item id: Case Number
     - Resource type: ACIS
     - Justification: Need snapshot of VM
     - Scope: Supportability Fabric
     - Access Level: PlatformService Operator

         ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_JITAccess.png)

7. Click Submit.

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_submit.png)

8. You may have to authenticate again - Choose **@ame.gbl** account.

    ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_AuthAccountAME.png)

- NOTE: If your request is rejected, you are not a member of **AzVM-MemoryDumpRequestorAME**.

    ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_reject.png)

9. You may be redirected to the JIT page. If so, fill the form and submit the request as follows:

    ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_JitRequest.png)

     - Click "**Validate Resource**". If validation succeeds, the "**Submit**" button will enable. Click on it to proceed.<br>
<br>

10. The JIT request will be sent to the **AzVM-MemoryDumpApproverAME** group.

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_notifywait.png)

     - You can also check the status by going to [https://jitaccess.security.core.windows.net/WorkFlowTempAccess.aspx](https://jitaccess.security.core.windows.net/WorkFlowTempAccess.aspx) (in SAVM).

11. Once approved, you may have to authenticate again - Choose **@ame.gbl** account.

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_AuthAccountAME.png)

12. You will also notice the "Get Access" button is gone - this confirms JIT was approved. If not, click on **"Refresh Permissions"** (See picture in step 5 above).

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_run.png)

13. To get the required fields, log in to [ASC](https://azuresupportcenter.msftcloudes.com), go to Resource Explorer, and select the VM to snapshot.

    ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_ASC.png)

14. After selecting the VM in ASC Resource Explorer:
    - Validate the NodeId/ContainerId/FabricName provided by the engineer before triggering the dump.
        - Find ASC sample below:

        ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_initiate.png)

15. Click Run.

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_run.png)

16. Once complete, you are provided a link to the dump in Azure Watson. Once done, share the Azure Watson link with the requesting engineer and point them to [Triage the Memory Dump](#triage-the-memory-dump---scan-for-known-issues).

      > If the snapshot process is experiencing issues, add the alias `supwatson@microsoft.com` to the thread to create a support ticket.

      > The dump URL may be generated as `https://azurewatson.microsoft.com/dumpuid/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` but this is deprecated. It should now be changed to `https://portal.watson.azure.com/dump?dumpUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`.

17. Debug access to Watson dump is only allowed for the case owner and collaboration task owner using an *ME account on SAW. If the collaborating Windows EE does not have SAW, use Teams remote session on VM SE's SAW at this time. The Windows team is aware of this limitation and discussion is ongoing.

     ![image.png](/.attachments/SME-Topics/Cant-RDP-SSH/GetOSDump_watson2.png)

</details>
<br>

## Enablement

<details open>

<summary>Click here to expand or collapse this section</summary>

- Public
    - [Setting the system up for a memory dump manually](https://docs.microsoft.com/en-US/windows/client-management/generate-kernel-or-complete-crash-dump)
    - [For a complete memory dump, it is recommended to confirm your page file is 1 x RAM plus at least 257MB (with enough disk space to spare), or we’ll need to utilize a dedicated dump file.](https://docs.microsoft.com/en-US/windows/client-management/determine-appropriate-page-file-size#support-for-system-crash-dumps)
    - [Overview of memory dump file options for Windows](https://docs.microsoft.com/en-us/troubleshoot/windows-server/performance/memory-dump-file-options)
    - [Collecting memory dumps for Azure VM crash scenarios](https://docs.microsoft.com/en-us/troubleshoot/azure/virtual-machines/troubleshoot-common-blue-screen-error)
    - [Advanced troubleshooting for Windows freezes](https://learn.microsoft.com/en-us/troubleshoot/windows-client/performance/windows-based-computer-freeze-troubleshooting)
    - [Confirm your dump is good with dumpchk.exe](https://docs.microsoft.com/en-us/troubleshoot/windows-server/performance/use-dumpchk-to-check-memory-dump-file)
    - [Information on your VM size to help determine if you have a temp drive, size of your memory, etc.](https://docs.microsoft.com/en-us/azure/virtual-machines/sizes)
    - [Difficulties generating a memory dump](https://techcommunity.microsoft.com/t5/ask-the-performance-team/difficulty-generating-a-memory-dump/ba-p/2351370)
    - [Configuring a memory dump for Windows Server Core](https://learn.microsoft.com/en-us/windows-server/administration/server-core/server-core-memory-dump)
- Internal
    - [Windows PERF documentation](https://supportability.visualstudio.com/WindowsPerformance/_wiki/wikis/WindowsPerformance/560681/Memory-Dump-Configuration)
    - [Windows UEX documentation](https://supportability.visualstudio.com/WindowsUserExperience/_wiki/wikis/WindowsUserExperience/724528/Full-Memory-Dump)
    - [Windows AVD documentation](https://supportability.visualstudio.com/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/451501/Memory-Dump)
    - [Windows DS documentation](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/848372/Complete-Memory-Dump)
    - [Windows NET documentation](https://supportability.visualstudio.com/WindowsNetworking/_wiki/wikis/WindowsNetworking/453525/WinDbg-Memory-Dumps-iDNA)
    - [Windows SHA documentation](https://supportability.visualstudio.com/WindowsSHA/_wiki/wikis/WindowsSHA/1177817/Four-Ways-to-Generate-Live-Kernel-Memory-Dumps)
    - [Windows: Changing memory dump configuration without rebooting](https://internal.evergreen.microsoft.com/en-us/topic/91706297-8415-007b-c1ba-26e35245c4b8)

</details>

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::
