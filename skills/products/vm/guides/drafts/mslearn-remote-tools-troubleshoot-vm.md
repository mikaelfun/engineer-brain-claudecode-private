# Remote Tools for Azure VM Troubleshooting

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/remote-tools-troubleshoot-azure-vm-issues

## Available Remote Tools (when RDP is unavailable)

### 1. Serial Console
- Built-in Azure feature, no network dependency

### 2. Remote CMD via PsExec
- `psexec \\<computer> -u user -s cmd`
- Requires same VNET, TCP ports 135 and 445 open

### 3. Run Command
- Portal/CLI/PowerShell, runs scripts on VM
- No direct connectivity needed

### 4. Custom Script Extension (CSE)
- Upload script to storage, execute via CSE
- Requirements: VM connectivity, VM Agent working, no prior CSE installed
- CSE only injects script first time; subsequent runs need ForceRerun

### 5. Remote PowerShell
- TCP port 5986 (HTTPS) required, open in NSG
- Setup: Add VM to TrustedHosts, enable PSRemoting + WinRM HTTPS listener
- Connect: `Enter-PSSession -ComputerName <dns> -port 5986 -useSSL -Credential (Get-Credential) -SessionOption (New-PSSessionOption -SkipCACheck -SkipCNCheck)`

### 6. Remote Registry
- TCP ports 135/445, same VNET
- regedit.exe > File > Connect Network Registry

### 7. Remote Services Console
- TCP ports 135/445, same VNET
- services.msc > Connect to another computer

## Port Requirements Summary
| Tool | Ports | Network |
|------|-------|---------|
| Serial Console | None | N/A |
| PsExec | 135, 445 | Same VNET |
| Run Command | None | Via Azure fabric |
| CSE | None | Via Azure fabric |
| Remote PS | 5986 | NSG rule |
| Remote Registry | 135, 445 | Same VNET |
| Remote Services | 135, 445 | Same VNET |
