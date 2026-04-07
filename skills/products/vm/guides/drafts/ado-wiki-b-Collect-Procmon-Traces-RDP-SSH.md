---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Collect Process Monitor (Procmon) Traces_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FCollect%20Process%20Monitor%20%28Procmon%29%20Traces_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Collect Process Monitor (Procmon) Traces — Azure VM (RDP/SSH Troubleshooting)

## Summary

There are multiple scenarios where you need visibility into what is happening with a process, service, or handler to better understand why an issue is occurring on a VM. For this, you can use [Process Monitor](https://docs.microsoft.com/en-us/sysinternals/downloads/procmon), a tool from the SysInternals suite.

### Reference

- [Process Monitor v3.50](https://docs.microsoft.com/en-us/sysinternals/downloads/procmon)
- [Download](https://download.sysinternals.com/files/ProcessMonitor.zip)

## Instructions

### How to collect a Procmon trace on demand

1. Connect to the machine using one of the following methods:
   - Access using Serial Console feature
   - Access using remote PowerShell
   - Access via remote CMD

2. Download the [Process Monitor tool](http://technet.microsoft.com/en-us/sysinternals/bb896645.aspx) on the VM using one of the following options:
   - Attach a remote shared folder as the volume Z:
     ```powershell
     net use z: "<REMOTE SHARED FOLDER>" /persistent:no
     ```
   - Download directly from a PowerShell instance on the SAC console:
     ```powershell
     Remove-Module psreadline
     $source = "https://download.sysinternals.com/files/ProcessMonitor.zip"
     $destination = "c:\temp\ProcessMonitor.zip"
     $wc = New-Object System.Net.WebClient
     $wc.DownloadFile($source, $destination)
     ```
   - Attach a utility disk.

3. Extract the file:
   ```powershell
   $ProgressPreference = "SilentlyContinue"
   Expand-Archive C:\temp\ProcessMonitor.zip -DestinationPath C:\temp\
   ```

4. Navigate to the temp directory (`cd C:\temp`) and start a Procmon trace:
   ```powershell
   ./procmon.exe /Quiet /Minimized /accepteula /BackingFile c:\temp\ProcMonTrace.PML
   ```

5. Reproduce the issue you are troubleshooting.

6. Terminate the Process Monitor trace:
   ```powershell
   procmon.exe /Terminate
   ```

7. Collect the file `c:\temp\ProcMonTrace.PML` for review using the Process Monitor tool.

### How to collect a remote Procmon trace

1. Download the [Procmon tool](http://download.sysinternals.com/files/ProcessMonitor.zip) on the remote virtual machine in a folder like `c:\procmon\`.
2. Download [PSTools](http://technet.microsoft.com/en-us/sysinternals/bb896649.aspx) on the source machine.
3. From the source machine, run a remote command prompt using PSEXEC from PSTools:
   ```powershell
   psexec \\<<PCNAME/IP>> cmd.exe
   ```
4. Confirm you are on the remote machine by typing `hostname`.
5. Run Procmon via the remote prompt:
   ```powershell
   procmon /backingfile c:\log.pml /quiet /accepteula
   ```
6. A file `c:\log.pml` will be created on the remote PC. Let it run as needed, but monitor disk space as the file grows quickly.
7. Exit the remote session and ensure Procmon finishes writing the log file. Avoid killing the process prematurely to prevent corruption.
8. If necessary, terminate rogue Procmon processes on the remote PC using PSKill:
   ```powershell
   pskill \\<<PCNAME/IP>> procmon.exe
   ```
9. Collect the file `c:\log.pml` and open it in Process Monitor.
10. Reproduce the issue.
11. Properly terminate the Procmon trace:
    ```powershell
    procmon /terminate
    ```

### How to collect a Procmon trace on a new machine in Azure during boot

It is not possible to inject Procmon during VM creation in Azure because the provisioning agent/guest agent does not run early enough. However, you can set up Procmon as a service to start early in the boot process. This is useful when troubleshooting a new VM from a custom image or using the Shared Image Gallery.

1. Download `enable-bootlogging.zip` from the following share path:
   ```
   \\fsu\shares\WATS\scripts\procmon\enable-bootlogging.zip
   ```

2. If troubleshooting an image, attach the exported image disk to a recovery VM without booting the attached OS disk. Follow these steps:
   - [Export the SIG/Image to a managed disk](https://docs.microsoft.com/en-us/azure/virtual-machines/managed-disk-from-image-version).
   - Attach the exported OS disk as a data disk to a recovery VM.
   - Download and extract `enable-bootlogging.zip` on the recovery VM.
   - Open PowerShell as Administrator and navigate to the extracted folder.
   - Run the script:
     ```powershell
     enable-bootlogging.ps1 -driveLetter <AttachedDiskDriveLetter> -path <path to procmon.exe/procmon.chm/procmon24.sys>
     ```
   - Detach the disk and [create a new image](https://docs.microsoft.com/en-us/azure/virtual-machines/image-version?tabs=portal).
   - Deploy a VM with the new image and reproduce the issue.
   - Connect to the failed VM and run `Procmon.exe` as soon as possible to stop logging and save the PML file.

### How to enable boot logging on an existing machine in Azure

1. Download and extract the [Process Monitor tool](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon).
2. Run `Procmon.exe`.
3. Go to **Options** and select **Enable Boot Logging**.
4. Restart the VM.
