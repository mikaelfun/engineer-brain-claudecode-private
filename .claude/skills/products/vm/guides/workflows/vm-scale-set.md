# VM Scale Set (VMSS) — 排查工作流

**来源草稿**: ado-wiki-c-setup-user-mode-dump.md, ado-wiki-f-check-set-service-powershell.md, ado-wiki-f-check-set-service-registry.md, mslearn-availability-set-supportability.md, mslearn-display-encryption-settings.md, mslearn-offline-password-reset.md, mslearn-reset-linux-password.md, onenote-dsc-for-vm-setup.md, onenote-vmss-autoscale-guest-metrics.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 5
**覆盖子主题**: vm-scale-set
**生成日期**: 2026-04-07

---

## Scenario 1: Setup User Mode Dump
> 来源: ado-wiki-c-setup-user-mode-dump.md | 适用: Mooncake \u2705

### 排查步骤
## Instructions
### Setup Windows Error Reporting
1. If you are working in _ONLINE_ mode, then just run the following on an elevated PowerShell:
   ```PowerShell
   # Setup the Guest OS to collect user mode dumps on a service crash event
   $key = 'HKLM:\SOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps'
   if ((Test-Path -Path $key) -eq $false) {(New-Item -Path 'HKLM:\SOFTWARE\Microsoft\Windows\Windows Error Reporting' -Name LocalDumps)}
   New-ItemProperty -Path $key -name DumpFolder -Type ExpandString -force -Value "c:\CrashDumps" # Change "c:\CrashDumps" if we want to save to another location
   New-ItemProperty -Path $key -name CrashCount -Type DWord -force -Value 10
   New-ItemProperty -Path $key -name DumpType -Type DWord -force -Value 2
   ```
2. If you are working in _OFFLINE_ mode, then just run the following on an elevated PowerShell:
   ```PowerShell
   # Load the hives - If your attached disk is not F, replace the letter assignment here
   reg load HKLM\BROKENSOFTWARE F:\windows\system32\config\SOFTWARE.hiv
   # Setup the Guest OS to collect user mode dumps on a service crash event
   $key = 'HKLM:\BROKENSOFTWARE\Microsoft\Windows\Windows Error Reporting\LocalDumps'
   if ((Test-Path -Path $key) -eq $false) {(New-Item -Path 'HKLM:\BROKENSOFTWARE\Microsoft\Windows\Windows Error Reporting' -Name LocalDumps)}
   New-ItemProperty -Path $key -name DumpFolder -Type ExpandString -force -Value "c:\CrashDumps" # Change "c:\CrashDumps" if we want to save to another location
   New-ItemProperty -Path $key -name CrashCount -Type DWord -force -Value 10
   New-ItemProperty -Path $key -name DumpType -Type DWord -force -Value 2
   # Unload the hive
   reg unload HKLM\BROKENSOFTWARE
   ```
**Notes:**
- The folder `c:\CrashDumps` will be created on the first application crash.
- For every service crashing, this will create a full dump for that service. If there are more than 10 crashes, the 11th will overwrite the 1st dump.
- On the OFFLINE steps, this will assume that the disk is drive `F:`, if this is not your case, update the letter assignment.
### Windows Error Reporting Services
Ensure the service Windows Error Reporting is started and if it is started, recycle the service for those changes to kick in.
- By default, 'Windows Error Reporting Service' will be set to manual. Change this to automatic startup:
  - If the OS is loaded, then change the key `HKLM\SYSTEM\CurrentControlSet\Services\WerSvc -> Start` from 3 to 2:
   ```PowerShell
   # PowerShell as admin, Set startup to automatic
   Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\WerSvc" -Name "Start" -Value 2
   ```
  - If we are working on an attached disk then:
    1. Check which ControlSet the machine is booting from. You will see its key number in `HKLM\BROKENSYSTEM\Select\Current`.
    2. Now change the key `HKLM\BROKENSYSTEM\ControlSet00x\Services\WerSvc -> Start` from 3 to 2.
### How to Recycle the Windows Error Reporting Service
1. To recycle the service locally:
   ```PowerShell
   # CMD as admin
   net stop wersvc
   net start wersvc
   sc query wersvc
   # Or PowerShell as admin
   Restart-Service wersvc
   get-service wersvc
   # Or open Services console and restart the 'Windows Error Reporting' service
   services.msc
   # Or open Task Manager and restart the 'wersvc' service
   taskmgr.exe
   ```
2. To recycle the service from another machine on the same VNET, we can use either the Services.msc console or [PStools](http://technet.microsoft.com/en-us/sysinternals/bb896649.aspx).
   ```PowerShell
   # CMD as admin
   Psservice \\"<<DESTINATIONIP>>" -u "<<USERNAME>>" -p "<<PASSWORD>>" restart wersvc
   ```

`[来源: ado-wiki-c-setup-user-mode-dump.md]`

---

## Scenario 2: Check Set Service Powershell
> 来源: ado-wiki-f-check-set-service-powershell.md | 适用: Mooncake \u2705

### 排查步骤
## Instructions
### 1. Set Variables
```powershell
$vmname = "<full VM name>"

`[来源: ado-wiki-f-check-set-service-powershell.md]`

---

## Scenario 3: Offline Password Reset
> 来源: mslearn-offline-password-reset.md | 适用: Mooncake \u2705

### 排查步骤
## Steps
1. **Stop the affected VM**
2. **Create snapshot** of the OS disk
3. **Create a copy** of the OS disk from snapshot
4. **Attach copied OS disk** to another Windows VM (repair VM)
5. **Create Group Policy startup script** on the attached disk:
   a. Create `\Windows\System32\GroupPolicy\gpt.ini`:
   ```ini
   [General]
   gPCFunctionalityVersion=2
   gPCMachineExtensionNames=[{42B5FAAE-6536-11D2-AE5A-0000F87571E3}{40B6664F-4972-11D1-A7CA-0000F87571E3}]
   Version=1
   ```
   b. Create `\Windows\System32\GroupPolicy\Machine\Scripts\scripts.ini`:
   ```ini
   [Startup]
   0CmdLine=FixAzureVM.cmd
   0Parameters=
   ```
   c. Create `\Windows\System32\GroupPolicy\Machine\Scripts\Startup\FixAzureVM.cmd`:
   ```cmd
   net user <username> <newpassword> /add /Y
   net localgroup administrators <username> /add
   net localgroup "remote desktop users" <username> /add
   ```
6. **Detach disk** from repair VM
7. **Swap OS disk** for the affected VM
8. **Connect** with new credentials
9. **Clean up** — remove gpt.ini, scripts.ini, FixAzureVM.cmd after login

`[来源: mslearn-offline-password-reset.md]`

---

## Scenario 4: Dsc For Vm Setup
> 来源: onenote-dsc-for-vm-setup.md | 适用: Mooncake \u2705

### 排查步骤
## Steps
1. **Enable VM** for DSC in Automation Account
2. **Import module `nx`** (for Linux DSC resources)
   - nx module contains DSC resources for Linux nodes
3. **Import configuration file**
   - From Gallery: `xUser_CreateUserConfig` (mostly for Windows)
   - For Linux: check nx PowerShell docs at https://learn.microsoft.com/en-us/powershell/dsc/reference/resources/linux/lnxuserresource?view=dsc-1.1
4. **Compile the configuration** in Automation Account
5. **Assign configuration to DSC node**

---

## Scenario 5: Vmss Autoscale Guest Metrics
> 来源: onenote-vmss-autoscale-guest-metrics.md | 适用: Mooncake \u2705

### 排查步骤
## Steps
1. **Create VMSS** in Azure portal with Manual Scale
2. **Export template** from VMSS → Settings → Export template
3. **Create Template Deployment** via Marketplace
4. **Edit template.json**:
   - 5.1: Add parameters for `storageAccountName` and `storageAccountSasToken`
   - 5.2: Modify extensionProfile to include diagnostics extension
   - 5.3: Add `autoscaleSettings` resource for memory-based autoscale (change `myScaleSet` to actual VMSS name)
5. **Create Storage Account** and record SAS token
6. **Deploy** custom template with the parameters (must select same resource group as VMSS)
7. **Wait** for deployment to complete
8. **Verify** autoscale metric now shows memory consumption
9. **Upgrade instances** to latest model
> Note: If pending changes require reboot, instances will reboot during upgrade. Adding extension alone won't cause reboot.

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
| - **Global vs. Application-Specific Settings**: WER will prioritize application- | 见详情 | → ado-wiki-c-setup-user-mode-dump.md |
| - Create files on the ATTACHED data disk, NOT the repair VM's C: drive - Passwor | 见详情 | → mslearn-offline-password-reset.md |
