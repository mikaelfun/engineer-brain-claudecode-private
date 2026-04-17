# VM Vm Start Stop N — 综合排查指南

**条目数**: 30 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md), [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md), [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-f-startbuild-fail-avdimage-languagepack.md](../../guides/drafts/ado-wiki-f-startbuild-fail-avdimage-languagepack.md) 排查流程
2. 参照 [mslearn-start-vm-last-known-good.md](../../guides/drafts/mslearn-start-vm-last-known-good.md) 排查流程
3. 参照 [onenote-script-vm-restart-events.md](../../guides/drafts/onenote-script-vm-restart-events.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| At restart, boot critical drivers load and registr | 1 条相关 | Offline repair: create rescue VM with nested virtualization,... |
| VM is experiencing a performance spike or virtual  | 2 条相关 | Identify resource-heavy processes via Task Manager or Get-Pr... |
| Brute force RDP attack over the internet causing C | 1 条相关 | Enable Azure NSG rules to restrict RDP access to known IP ra... |
| Deadlock in WinHttpAutoProxySvc: when this service | 2 条相关 | Enable the WinHttpAutoProxySvc service (set to Manual or Aut... |
| Multiple possible causes: (1) Windows bug check or | 2 条相关 | Take multiple screenshots via ASC to confirm not reboot loop... |
| GRUB superuser password protection is enabled (set | 1 条相关 | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit ... |
| First boot of a generalized (sysprepped) image fai | 2 条相关 | Change support topic to: Product=Azure Virtual Machine Windo... |
| The OS boot process could not locate an active sys | 1 条相关 | Cannot troubleshoot online (Guest OS not operational). Use O... |
| The server is unable to reach the RD license serve | 1 条相关 | Configure RD Licensing on the server: ONLINE via Serial Cons... |
| Windows shutdown process performing system mainten | 1 条相关 | Check STOP_PENDING services: Get-Service / Where-Object {$_.... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Windows VM stuck in reboot loop after Windows Update showing Preparing to configure windows or... | At restart, boot critical drivers load and registry reads Pending.xml location w... | Offline repair: create rescue VM with nested virtualization, boot from recovery ... | 🔵 7.0 | ADO Wiki |
| 2 | Black screen on RDP that disconnects after about 1 minute; VM shows high resource/performance usage;... | VM is experiencing a performance spike or virtual memory exhaustion due to appli... | Identify resource-heavy processes via Task Manager or Get-Process. Reduce memory... | 🔵 7.0 | ADO Wiki |
| 3 | RDP shows black screen then disconnects; VM is under brute force RDP attack causing performance degr... | Brute force RDP attack over the internet causing CPU/memory performance spike, e... | Enable Azure NSG rules to restrict RDP access to known IP ranges; enable JIT VM ... | 🔵 7.0 | ADO Wiki |
| 4 | Black screen after RDP credentials on Windows Server 2012 R2; VM in partial hang state; apps (e.g., ... | Deadlock in WinHttpAutoProxySvc: when this service is disabled and the system is... | Enable the WinHttpAutoProxySvc service (set to Manual or Automatic). Apply lates... | 🔵 7.0 | ADO Wiki |
| 5 | Azure VM screenshot shows VM stuck on Hyper-V screen and not booting past the Hyper-V logo (Windows ... | Multiple possible causes: (1) Windows bug check or guest OS issue preventing boo... | Take multiple screenshots via ASC to confirm not reboot loop. Check ASC Insights... | 🔵 7.0 | ADO Wiki |
| 6 | Linux VM cannot be reached via SSH; serial console shows only Enter username: prompt due to GRUB sup... | GRUB superuser password protection is enabled (set before VHD upload to Azure or... | Attach OS disk to a rescue Linux VM. Mount at /rescue. Edit /rescue/boot/grub/gr... | 🔵 7.0 | ADO Wiki |
| 7 | Azure VM screenshot shows Windows setup error: The computer restarted unexpectedly or encountered an... | First boot of a generalized (sysprepped) image fails to process the unattended a... | Change support topic to: Product=Azure Virtual Machine Windows, Topic=Cannot cre... | 🔵 7.0 | ADO Wiki |
| 8 | Azure VM screenshot shows: This is not a bootable disk. Please insert a bootable floppy and press an... | The OS boot process could not locate an active system partition - the system par... | Cannot troubleshoot online (Guest OS not operational). Use OFFLINE approach: att... | 🔵 7.0 | ADO Wiki |
| 9 | RDP connection hangs on 'Configuring remote session' when connecting to Azure VM; OS is fully loaded... | The server is unable to reach the RD license server or the license server inform... | Configure RD Licensing on the server: ONLINE via Serial Console using RD License... | 🔵 7.0 | ADO Wiki |
| 10 | Azure VM screenshot shows OS shutdown with Stopping services message; VM stuck and unresponsive to R... | Windows shutdown process performing system maintenance (binary updates, role/fea... | Check STOP_PENDING services: Get-Service / Where-Object {$_.Status -eq 'STOP_PEN... | 🔵 7.0 | ADO Wiki |
| 11 | Azure VM screenshot shows VM stuck on Hyper-V screen and not booting past the Hyper-V logo (Windows ... | Multiple possible causes: (1) Windows bug check or guest OS issue preventing boo... | Take multiple screenshots via ASC to confirm not reboot loop. Check ASC Insights... | 🔵 7.0 | ADO Wiki |
| 12 | Azure VM screenshot shows Windows setup error: The computer restarted unexpectedly or encountered an... | First boot of a generalized (sysprepped) image fails to process the unattended a... | Change support topic to: Product=Azure Virtual Machine Windows, Topic=Cannot cre... | 🔵 7.0 | ADO Wiki |
| 13 | Azure VM in reboot loop; screenshots show boot process interrupted and restarting; Event ID 7007 Lev... | A third-party service flagged as critical is failing to start, causing OS to res... | Disable autoreboot first to see the actual bug check code/error. OFFLINE: attach... | 🔵 7.0 | ADO Wiki |
| 14 | Azure VM in reboot loop after OS change (KB update, application install, or new policy); or due to f... | OS changes (KB/application installation or policy change) or file system corrupt... | Disable autoreboot to see error. OFFLINE: check Event Logs, CBS.log, WindowsUpda... | 🔵 7.0 | ADO Wiki |
| 15 | Azure VM screenshot shows VMWare image customization is in progress message on every boot, delaying ... | VMware Image Customization Initialization module is enabled on the VM (similar t... | OFFLINE approach: attach OS disk to rescue VM. Disable VMware Customization modu... | 🔵 7.0 | ADO Wiki |
| 16 | Azure VM screenshot shows 'Please wait for the Group Policy Client' - OS hangs waiting for Group Pol... | Windows is processing and applying Group Policies. Many or complex policies can ... | Wait up to 1 hour for Group Policy processing to complete. If VM is still stuck ... | 🔵 7.0 | ADO Wiki |
| 17 | Azure VM screenshot shows 'Please wait for the Local Session Manager' - OS hangs waiting for Local S... | Local Session Manager service is stuck during startup. Root cause depends on mem... | Use online hang scenario troubleshooting: backup OS disk, collect memory dump vi... | 🔵 7.0 | ADO Wiki |
| 18 | Azure VM screenshot shows 'Windows could not complete the installation. To install Windows in this c... | Machine is performing first boot of a generalized image and failed to complete t... | Image is unrecoverable. Customer must recreate the generalized image. Change sup... | 🔵 7.0 | ADO Wiki |
| 19 | Azure VM screenshot shows 'Windows could not finish configuring the system. To attempt to resume con... | Machine is performing first boot of a generalized image and failed to complete t... | Image is unrecoverable. Customer must recreate the generalized image. Change sup... | 🔵 7.0 | ADO Wiki |
| 20 | Azure VM enters reboot loop or goes to Stopped state after installing Windows cumulative updates (e.... | When VM is shutdown from Azure portal, Windows Updates get applied during shutdo... | Offline troubleshooting required: attach OS disk to repair VM, uninstall the pro... | 🔵 7.0 | ADO Wiki |
| 21 | Windows 11 Trusted Launch VM fails to boot with error 'The boot loader did not load an operating sys... | When the EFI partition is deleted and recreated at a different location, the VM ... | Deallocate VM, download VHD, upload to new storage account, create new managed d... | 🔵 7.0 | ADO Wiki |
| 22 | Windows VM fails to boot with 'The boot loader did not load an operating system' after converting fr... | Converting from Gen 1 to Gen 2 and rebuilding BCD can result in improper boot co... | Deallocate VM, download VHD, create new managed disk with Trusted Launch securit... | 🔵 7.0 | ADO Wiki |
| 23 | RHEL 7/8 Gen 2 Azure VM fails to boot with 'Failed to open \EFI\redhat\grubx64.efi Not Found' - rebo... | Missing grubx64.efi file from the EFI system partition. Can be caused by misconf... | Create RHEL Gen2 rescue VM with same distro, attach broken OS disk copy, mount a... | 🔵 7.0 | ADO Wiki |
| 24 | RDP to Windows VM returns 'Access is denied' during authentication due to user profile loading error... | Login error while loading user profiles, caused by user policy conflicts on the ... | Set registry: Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Ter... | 🔵 7.0 | ADO Wiki |
| 25 | RDP to Windows VM returns 'Access is denied' when user belongs to many AD groups and nested AD group... | Kerberos token size not big enough to hold all permissions. Happens when user be... | Increase Kerberos MaxTokenSize: Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentCont... | 🔵 7.0 | ADO Wiki |
| 26 | RDP to Windows VM returns 'Access is denied' because Terminal Service (TermService) is starting with... | The Terminal Service is configured to start with an incorrect account instead of... | Fix TermService ObjectName: Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlS... | 🔵 7.0 | ADO Wiki |
| 27 | RDP to Windows Server 2016 Nano VM fails with 'machine is offline' error - screenshot shows Nano Ser... | Windows Server 2016 Nano is a stripped-down version with no GUI, no RDP support,... | Use PowerShell remoting instead of RDP. Ensure NSG/ACL allows ports 5985 and 598... | 🔵 7.0 | ADO Wiki |
| 28 | Black screen on RDP that disconnects after about 1 minute; VM shows high resource/performance usage;... | VM is experiencing a performance spike or virtual memory exhaustion due to appli... | Identify resource-heavy processes via Task Manager or Get-Process. Reduce memory... | 🔵 7.0 | ADO Wiki |
| 29 | Black screen after RDP credentials on Windows Server 2012 R2; VM in partial hang state; apps (e.g., ... | Deadlock in WinHttpAutoProxySvc: when this service is disabled and the system is... | Enable the WinHttpAutoProxySvc service (set to Manual or Automatic). Apply lates... | 🔵 7.0 | ADO Wiki |
| 30 | Black screen after RDP on Windows 10 RS3 VM deployed with single CPU (MicrosoftWindowsDesktop.Window... | Known issue with Windows 10 RS3 image: when deployed with only 1 CPU, the OS han... | Resize the VM to a size with 2 or more CPUs. With 2 CPUs the OS will complete in... | 🔵 7.0 | ADO Wiki |

