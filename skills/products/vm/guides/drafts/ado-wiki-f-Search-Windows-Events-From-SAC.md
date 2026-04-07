---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Search Windows Events From SAC_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FSearch%20Windows%20Events%20From%20SAC_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Search Windows Events From Serial Access Console (SAC)

How to search Windows Event Viewer logs via Serial Console when remote connectivity is unavailable.

## Access the Serial Access Console

1. Go to the Azure portal.
2. Navigate to Virtual Machines > select the VM > Serial console blade.

## Log in to the Serial Access Console

1. Type `CMD` and press Enter.
2. Type `ch -si 1` to create the channel.
3. Press Enter and log in with credentials.
   - Note: Backspaces and deletes are not supported during login.
4. For PowerShell: type `powershell` then `remove-module psreadline`.

## CMD Examples

```CMD
REM Query event log errors
wevtutil qe system /c:1 /f:text /q:"Event[System[Level=2]]" | more

REM Query by Event ID
wevtutil qe system /c:1 /f:text /q:"Event[System[EventID=11]]" | more

REM Query by Event ID and Provider
wevtutil qe system /c:1 /f:text /q:"Event[System[Provider[@Name='Microsoft-Windows-Hyper-V-Netvsc'] and EventID=11]]" | more

REM Query last 24 hours (86400000ms)
wevtutil qe system /c:1 /f:text /q:"Event[System[Provider[@Name='Microsoft-Windows-Hyper-V-Netvsc'] and EventID=11 and TimeCreated[timediff(@SystemTime) <= 86400000]]]"

REM Check for 1057 & 1058 TerminalServices events
wevtutil qe system /c:1 /f:text /q:"Event[System[Provider[@Name='Microsoft-Windows-TerminalServices-RemoteConnectionManager'] and EventID=1058 and TimeCreated[timediff(@SystemTime) <= 86400000]]]" | more

REM Check SCHANNEL errors
wevtutil qe system /c:1 /f:text /q:"Event[System[Provider[@Name='Schannel'] and EventID=36870 and TimeCreated[timediff(@SystemTime) <= 86400000]]]" | more
```

## PowerShell Examples

```PowerShell
remove-module psreadline

# Query errors
get-winevent -logname system -maxevents 1 -filterxpath "*[System[Level=2]]" | more

# Query by Event ID
get-winevent -logname system -maxevents 1 -filterxpath "*[System[EventID=11]]" | more

# Query by Provider and Event ID
get-winevent -logname system -maxevents 1 -filterxpath "*[System[Provider[@Name='Microsoft-Windows-Hyper-V-Netvsc'] and EventID=11]]" | more

# Failed logins (brute force detection) - last 24 hours
$log = 'Security'
$start = (Get-Date).AddDays(-1)
$id = 4625
$failedLogins = Get-WinEvent -FilterHashtable @{LogName=$log; StartTime=$start; Id=$id}
$failedLogins | ft
$failedLogins.count
```

## Related Documentation

- [Windows Commands - CMD and PowerShell](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/serial-console-cmd-ps-commands)
- [Troubleshoot Azure VM RDP by Event ID](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/event-id-troubleshoot-vm-rdp-connecton)
- [wevtutil reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/wevtutil)
- [Get-WinEvent reference](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.diagnostics/get-winevent)
