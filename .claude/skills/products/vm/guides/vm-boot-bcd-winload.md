# VM BCD/WinLoad 启动配置 — 排查速查

**来源数**: 3 (AW, ML, ON) | **条目**: 10 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows Server VM fails to boot: winload.exe not found or BCD boot failure; VM stuck at boot error s | BCD (Boot Configuration Database) entries have incorrect partition references. W | 1) Attach failed OS disk to troubleshooting VM; identify drive letters (System R | 🟢 8 | ON |
| 2 | VM screenshot shows: Boot failure. Reboot and Select proper Boot device or Insert Boot Media in sele | BCD store partition is not active, or BCD corruption causing OS unable to locate | Stop/deallocate/start VM first. If persists, offline troubleshooting: attach OS  | 🔵 7.5 | AW |
| 3 | Azure VM screenshot shows Windows Boot Manager menu waiting for user input to select boot partition  | VM BCD configuration has displaybootmenu enabled with a boot delay, causing VM t | Disable BCD displaybootmenu flag. For CRP machines: set displaybootmenu to 'no'  | 🔵 7.5 | AW |
| 4 | Windows VM fails to boot with 'The boot loader did not load an operating system' after converting fr | Converting from Gen 1 to Gen 2 and rebuilding BCD can result in improper boot co | Deallocate VM, download VHD, create new managed disk with Trusted Launch securit | 🔵 6.5 | AW |
| 5 | Azure VM fails to boot with Windows Boot Manager error: Status 0xC0000428 - Windows cannot verify th | The VM was built from a preview/trial image with an expiration date. Once the pr | 1) Preview image expiration is non-recoverable - cannot extend expiration. 2) De | 🔵 6.5 | ML |
| 6 | Azure VM fails to boot with error 0xC0000017 Status No Memory, displayed in Windows Boot Manager or  | OS disk is full, too fragmented, or OS cannot access the memory/page file. Page  | 1) Create repair VM, attach OS disk. 2) For Gen2 VMs, assign letter to EFI parti | 🔵 6.5 | ML |
| 7 | Azure Windows VM fails to boot with error 0xC0000034 on \Boot\BCD: recovery tools needed. | BCD corruption preventing the boot partition from locating the \Windows folder. | Use nested virtualization or attach disk. Rebuild BCD: bcdedit /create {bootmgr} | 🔵 6.5 | ML |
| 8 | Azure Windows VM fails to boot with winload.exe error 0xc0000605: A component of the operating syste | VM was built from a non-RTM preview/trial image that has passed its expiration d | No fix available for expired image. Must redeploy VM using correct RTM image fro | 🔵 6.5 | ML |
| 9 | Azure Windows VM fails to boot with INACCESSIBLE_BOOT_DEVICE error or Boot failure: Reboot and Selec | Boot Configuration Data (BCD) is corrupted, or the partition containing the Wind | Stop/deallocate and restart VM first. If persists: attach OS disk to rescue VM.  | 🔵 6.5 | ML |
| 10 | Azure Windows VM fails to boot with error: 'An operating system wasn't found. Try disconnecting any  | Startup process cannot locate active system partition — causes include: (1) syst | 1. Stop/deallocate and restart VM. 2. If persists: attach OS disk to repair VM → | 🔵 6.5 | ML |

## 快速排查路径

1. **Windows Server VM fails to boot: winload.exe not found or BCD boot failure; VM s**
   - 根因: BCD (Boot Configuration Database) entries have incorrect partition references. When OS disk attached to repair VM, Syste
   - 方案: 1) Attach failed OS disk to troubleshooting VM; identify drive letters (System Reserved active partition = BCD location, e.g. H:; OS partition = I:); 
   - `[🟢 8 | ON]`

2. **VM screenshot shows: Boot failure. Reboot and Select proper Boot device or Inser**
   - 根因: BCD store partition is not active, or BCD corruption causing OS unable to locate boot sector.
   - 方案: Stop/deallocate/start VM first. If persists, offline troubleshooting: attach OS disk to rescue VM, use diskpart to set partition active, rebuild BCD w
   - `[🔵 7.5 | AW]`

3. **Azure VM screenshot shows Windows Boot Manager menu waiting for user input to se**
   - 根因: VM BCD configuration has displaybootmenu enabled with a boot delay, causing VM to wait for user input to select boot par
   - 方案: Disable BCD displaybootmenu flag. For CRP machines: set displaybootmenu to 'no' via run command or serial console. For Classic machines: remove the bo
   - `[🔵 7.5 | AW]`

4. **Windows VM fails to boot with 'The boot loader did not load an operating system'**
   - 根因: Converting from Gen 1 to Gen 2 and rebuilding BCD can result in improper boot configuration, causing the VM to fail to b
   - 方案: Deallocate VM, download VHD, create new managed disk with Trusted Launch security type and blank VM Guest State Blob, swap OS disk on the problematic 
   - `[🔵 6.5 | AW]`

5. **Azure VM fails to boot with Windows Boot Manager error: Status 0xC0000428 - Wind**
   - 根因: The VM was built from a preview/trial image with an expiration date. Once the preview period expires (e.g., 180 days for
   - 方案: 1) Preview image expiration is non-recoverable - cannot extend expiration. 2) Deploy a new VM using a non-preview RTM image. 3) Use PowerShell (Get-Az
   - `[🔵 6.5 | ML]`

