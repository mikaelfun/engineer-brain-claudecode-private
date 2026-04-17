# Azure VM Offline Password Reset (Without Guest Agent)

> Source: [Reset local Windows password offline](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/reset-local-password-without-agent)

## When to Use
- Azure guest agent is not responding or not installed
- Cannot use VMAccess extension (e.g., domain controller)
- Custom image without guest agent

## Prerequisites
- Does NOT apply to Windows domain controllers
- Always try Azure portal / PowerShell reset first (via VMAccess)
- Backup VM OS disk snapshot before starting

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

## Important Notes
- Create files on the ATTACHED data disk, NOT the repair VM's C: drive
- Password must meet Windows complexity requirements
- Show hidden folders and file extensions when creating script files
