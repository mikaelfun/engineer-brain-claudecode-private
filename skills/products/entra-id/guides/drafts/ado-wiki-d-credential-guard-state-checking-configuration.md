---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Credential Guard Troubleshooting/State Checking and Configuration of Credential Guard"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FCredential%20Guard%20Troubleshooting%2FState%20Checking%20and%20Configuration%20of%20Credential%20Guard"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Credential Guard: State Checking and Configuration

## 1. Check the State of Credential Guard

### 1.1 MSINFO32

Open System Summary page in MSINFO32. Depending on the actual state:

1. **VBS not enabled** - Credential Guard is not enabled either
2. **CG enabled but not running** - Needs a reboot to take effect
3. **CG enabled and running** - Active protection

### 1.2 Event Log

After each reboot, check Wininit events in the System event log:

- **First Flag** (current state):
  - `0x0`: Not enabled
  - `0x1`: Enabled with UEFI lock
  - `0x2`: Enabled without lock

- **Second Flag** (debug mode):
  - `0`: LsaIso.exe cannot be debugged
  - `1`: LsaIso.exe can be debugged

### 1.3 LsaIso.exe

The existence of LsaIso.exe does **NOT** necessarily indicate Credential Guard is running. LsaIso.exe runs whenever VBS is enabled for any feature. Unless in debug mode, you cannot dump or trace LsaIso.exe (runs in Isolated User Mode). Attempting to create a dump from Task Manager produces a 0-byte file.

## 2. Enable Credential Guard

### 2.1 Via Group Policy

Policy: **Computer Configuration > Administrative Templates > System > Device Guard > Turn On Virtualization Based Security**

Registry entries:
```
HKLM\Software\Policies\Microsoft\Windows\DeviceGuard\EnableVirtualizationBasedSecurity
HKLM\Software\Policies\Microsoft\Windows\DeviceGuard\LsaCfgFlags
```
Type: REG_DWORD. Run `gpupdate /force` then reboot.

### 2.2 Via Registry

```
HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard\EnableVirtualizationBasedSecurity
HKLM\SYSTEM\CurrentControlSet\Control\Lsa\LsaCfgFlags
```

### 2.3 UEFI Lock

- **Enabled with UEFI lock**: Setting written to UEFI firmware, protected by Secure Boot. Cannot be overridden by OS-level changes.
- **Enabled without lock**: Can be disabled remotely via Group Policy.

## 3. Disable Credential Guard

### 3.1 Without UEFI Lock

**Win11 21H2 and earlier**: Remove the CG Configuration policy and LsaCfgFlags registry value. Reboot.

**Win11 22H2 and later**: Set `LsaCfgFlags=0` explicitly (must be present). If LsaCfgFlags is missing, system defaults to `LsaCfgFlagsDefault=0x2` (CG enabled without UEFI lock).

**LsaCfgFlagsDefault behavior**:
- `LsaCfgFlagsDefault=0` -> CG disabled by default
- `LsaCfgFlagsDefault=2` -> CG enabled without UEFI Lock by default
- If admin deletes/modifies LsaCfgFlagsDefault, LSASS restores it on next boot
- **LsaCfgFlags always wins over LsaCfgFlagsDefault if present**

### 3.2 With UEFI Lock

Requires physical access to each computer. Steps:

1. Set CG policy to Disabled
2. Run the batch script that:
   - Mounts EFI partition
   - Copies SecConfig.efi
   - Creates BCD entry for DebugTool
   - Suspends BitLocker
   - Removes registry entries
   - Sets LsaCfgFlags=0
   - Adds DISABLE-LSA-ISO loadoption
3. Reboot and press F3 to confirm disabling CG
4. Optionally disable VBS as well (add DISABLE-VBS loadoption)

**Disable CG only (keep VBS)**: Comment out VBS-related lines in the script. Only use `DISABLE-LSA-ISO` loadoption.

## 4. Debug Mode

After CG is disabled, enable debug mode:

Registry: `HKLM\SYSTEM\CurrentControlSet\Control\Lsa\LsaCfgFlagsTest` = 1 (REG_DWORD)

Reboot required. In debug mode:
- LsaIso.exe can be dumped/debugged/Xperf'd
- MSINFO32 will **NOT** show CG as running
- Wininit event shows debug flag = 1
