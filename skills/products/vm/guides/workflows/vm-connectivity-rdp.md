# VM RDP Connectivity — 排查工作流

**来源草稿**: ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md, ado-wiki-b-Collect-Logs-Inspect-IaaS-Disk-RDP-SSH.md, ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md, ado-wiki-b-Collecting-VHD-RDP-SSH.md, ado-wiki-c-identify-thumbprint-of-rdp-listener-cert.md, ado-wiki-c-recreate-rdp-listener.md, ado-wiki-d-Connect-Using-Bastion-RDP-SSH.md, ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md, ado-wiki-f-Registry-Key-References-RDP.md, ado-wiki-f-Run-RDP-Portrait-Mode.md, mslearn-rdp-troubleshooting-guide.md, onenote-enable-local-admin-without-rdp.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 7
**覆盖子主题**: vm-connectivity-rdp-a, vm-connectivity-rdp-b, vm-connectivity-rdp-c
**生成日期**: 2026-04-07

---

## Scenario 1: Clone Disk Powershell Rdp Ssh
> 来源: ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md | 适用: Mooncake \u2705

### 排查步骤
## Instructions
```powershell
Select-AzureSubscription "<<SUBSCRIPTION NAME>>"
### Source VHD (South Central US) - authenticated container ###
$srcUri = "<<COMPLETE SOURCE URI FOR THE DISK TO COPY>>"
### Source Storage Account (South Central US) ###
$srcStorageAccount = "<<SOURCE STORAGE ACCOUNT NAME>>"
$srcStorageKey = "<<SOURCE STORAGE ACCOUNT KEY>>"
### Target Storage Account (South Central US) ###
$destStorageAccount = "<<DESTINATION STORAGE ACCOUNT NAME>>"
$destStorageKey = "<<DESTINATION STORAGE ACCOUNT KEY>>"
### Create the source storage account context ###
$srcContext = New-AzureStorageContext -StorageAccountName $srcStorageAccount -StorageAccountKey $srcStorageKey
### Create the destination storage account context ###
$destContext = New-AzureStorageContext -StorageAccountName $destStorageAccount -StorageAccountKey $destStorageKey
### Destination Container Name ###
$containerName = "copiedvhds"
### Create the container on the destination ###
New-AzureStorageContainer -Name $containerName -Context $destContext
### Start the asynchronous copy - specify the source authentication with -SrcContext ###
$blob1 = Start-AzureStorageBlobCopy -srcUri $srcUri -SrcContext $srcContext -DestContainer $containerName -DestBlob "<<DESTINATION VHD NAME>>" -DestContext $destContext
```

`[来源: ado-wiki-b-Clone-Disk-PowerShell-RDP-SSH.md]`

---

## Scenario 2: Collect Procmon Traces Rdp Ssh
> 来源: ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md | 适用: Mooncake \u2705

### 排查步骤
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

`[来源: ado-wiki-b-Collect-Procmon-Traces-RDP-SSH.md]`

---

## Scenario 3: Step 1: Create the Storage Account
> 来源: ado-wiki-b-Collecting-VHD-RDP-SSH.md | 适用: Mooncake \u2705

### 排查步骤
### Step 1: Create the Storage Account
1. Create a storage account with name/resource group: `sr` + case number
2. Create a container named after the SR#.
3. Create a User Delegation SAS token (Permissions: Read, Add, Create, Write).
### Step 2: Copy the Disk (Managed Disk)
**Using AzCopy:**
```powershell
azcopy.exe copy "sourceVHDurl" "destinationSASurl" --recursive=true
```
**Using Start-AzStorageBlobCopy (PowerShell):**
```powershell
$mdName = ""        # Managed Disk name
$mdrgname = ""      # Resource Group name
$accessinterval = "3600"
$subscriptionID = ""
$DestStr = ""       # Destination Storage account
$DestStrSAS = ""    # Destination SAS token
$DestContainer = "" # Container name
Login-AzAccount
Select-AzSubscription -SubscriptionId $subscriptionID
$md = Get-AzDisk -DiskName "$mdName" -ResourceGroupName "$mdrgname"
$sasDisk = Grant-AzDiskAccess -DiskName $md.Name -ResourceGroupName $md.ResourceGroupName -Access Read -DurationInSecond $accessinterval
$destContext = New-AzStorageContext -StorageAccountName $DestStr -SasToken $DestStrSAS
Start-AzStorageBlobCopy -AbsoluteUri $sasDisk.AccessSAS -DestBlob "$mdName.vhd" -DestContainer $DestContainer -DestContext $destContext -Force
```

`[来源: ado-wiki-b-Collecting-VHD-RDP-SSH.md]`

---

## Scenario 4: Recreate Rdp Listener
> 来源: ado-wiki-c-recreate-rdp-listener.md | 适用: Mooncake \u2705

### 排查步骤
## Instructions
For detailed instructions, follow the [Windows UEX Wiki document](https://supportability.visualstudio.com/WindowsUserExperience/_wiki/wikis/WindowsUserExperience/725033/Recreate-RDP-listener).

---

## Scenario 5: Query Or Change Registry Rdp Ssh
> 来源: ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md | 适用: Mooncake \u2705

### 排查步骤
## Instructions
If you have connectivity to the VM, you have multiple ways to do this:
- If the VM is healthy and the guest agent is running, using Run Command and RDPSettings is an easy way to verify the RDP settings of a VM.
- ![Run Command to Query Port number](/.attachments/SME-Topics/Cant-RDP-SSH/Query-or-Change-Registry_RDP-SSH_Run_Command_for_port_number.png)
 ### Different ways of access to the VM
  - [Access thru Remote Services Console](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495098)
  - [Access thru PSSession](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495102)
  - [Access thru PsExec](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495101)
  - [Access thru Remote Registry](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495097)
  - [Access thru CSE Powershell](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495146)
### Different ways to change services setups
  - [Check or set a Windows service through registry](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495111)
### Using CSE and Powershell to query and setup values on the registry
1.  How to query the port number for RDP using CSE:
    ```PowerShell
    (Get-ItemProperty -Path 'REGISTRY::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "PortNumber").PortNumber
    ```
2.  Now to get the result of this custom script, we need to use Powershell to check the output of the script using such a command:
    ```PowerShell
    PS C:\> (Get-AzureRmVMExtension -ResourceGroupName $RG -VMName $VMName -Name CustomScriptExtension -Status).SubStatuses.Message
    51321
    ```
3.  And then used CSE to change the Port number via registry
    ```PowerShell
    Set-ItemProperty -Path 'REGISTRY::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "PortNumber" -Value 3389
    ```
4.  And then i again used custom script extension to change the Port number via registry
    ```PowerShell
    Set-ItemProperty -Path 'REGISTRY::HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name "PortNumber" -Value 3389
    ```
There was no need to delete the VM, mount the VHD to another VM, change the registry, and then create a VM. This will save you a lot of time.
We should use custom script extension when possible to reduce troubleshooting time and solve issues quickly.
::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::

`[来源: ado-wiki-d-Query-or-Change-Registry-RDP-SSH.md]`

---

## Scenario 6: Run Rdp Portrait Mode
> 来源: ado-wiki-f-Run-RDP-Portrait-Mode.md | 适用: Mooncake \u2705

### 排查步骤
## Instructions
1. **Physical Monitor Rotation**: Physically rotate your monitor to portrait orientation before initiating the RDP session. The RDP client will not control the monitor's physical orientation.
2. **RDP Client Configuration**: The RDP client does not have an option to enforce portrait mode. It depends on the physical orientation and OS display settings.
3. **Windows Display Settings (Remote Computer)**: Configure the display settings on the remote computer to align with your monitor's physical setup.
4. **Steps on the remote computer**:
   1. Open Settings > System > Display.
   2. In the "Display orientation" dropdown, select Portrait.

---

## Scenario 7: Rdp Troubleshooting Guide
> 来源: mslearn-rdp-troubleshooting-guide.md | 适用: Mooncake \u2705

### 排查步骤
## Quick Steps (Try in Order)
1. **Reset RDP configuration** — Portal > VM > Help > Reset password > Reset configuration only
2. **Verify NSG rules** — Ensure inbound Allow rule exists for TCP 3389 (use IP flow verify)
3. **Review VM boot diagnostics** — Check console logs for boot issues
4. **Reset NIC** — Portal > VM > Networking > IP configurations > change IP
5. **Check VM Resource Health** — Portal > VM > Help > Resource health (should show Available)
6. **Reset user credentials** — Portal > VM > Help > Reset password
7. **Restart VM** — Portal > VM > Overview > Restart
8. **Redeploy VM** — Portal > VM > Help > Redeploy (moves to new host, ephemeral disk data lost)
9. **Verify routing** — Network Watcher > Next hop
10. **Check local firewall** — Ensure outbound TCP 3389 to Azure is allowed

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
