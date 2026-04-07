---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/GMSA/Workflow: gMSA Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGMSA%2FWorkflow%3A%20gMSA%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# gMSA Data Collection Guide

## Where to Collect Data

Usually, gMSA is used as the logon account of some service, and hence most issues are related to service logon failure. Besides that, it can also be used in a scheduled task. In either case, the data should be collected at the client machine where the account is used and the DC which services the password retrieval and/or handles the logon request.

If the service using gMSA can start up successfully, but the client-side app cannot access the service, this should be more of an authentication/authorization issue and not the fault of gMSA itself.

## Data to Capture at Client Machine

- GMSAClient ETL (`{2D45EC97-EF01-4D4F-B9ED-EE3F4D3C11F3}`, included in LSA ETL)
- Kerberos ETL (`{6B510852-3583-4E2D-AFFE-A67F9F223438}`)
- WPP NETLOGON ETL (`{CA030134-54CD-4130-9177-DAE76A3C5791}`, included in LSA ETL)
- Netlogon debug log (`C:\Windows\Debug\Netlogon.log` & `Netlogon.bak`)
- Network trace
- GPResult report
- System event log
- Application event log
- Security-Netlogon operational event log
- TaskScheduler operational event log
- Security event log (optional, usually large, collect only if needed)

## Data to Capture at DC

- KDC ETL (`{1BBA8B19-7F31-43C0-9643-6E911F79A06B}`)
- SAM debug log (enable via registry: `HKLM\SYSTEM\CurrentControlSet\Control\Lsa\SamLogLevel = 0x00002000`)
- gMSA account detail: `Get-ADServiceAccount <name> -Properties *` or `ldifde -f <output>.txt -d "CN=<name>,CN=Managed Service Accounts,DC=..."`
- Network trace
- Security event log (optional)

## Generic Steps

1. Download the latest Auth script at https://aka.ms/authscript
2. Run `klist query_bind` at the client machine to get the currently preferred DC
3. Run `start-auth.ps1` under a privileged PS window at the client and the DC
4. Additionally, enable SAM debug log on the DC
5. Reproduce the issue
6. Run `stop-auth.ps1` at the client and the DC, collect logs
7. Disable SAM debug log on the DC, collect SAM debug log files
8. If needed, manually collect the logs not included in the Auth script

## Manual Collection Commands

### Client - Start

```powershell
md c:\temp
logman create trace "GMSATracing" -ow -o c:\temp\gmsatracing.etl -p {2D45EC97-EF01-4D4F-B9ED-EE3F4D3C11F3} 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
logman update trace "GMSATracing" -p {CA030134-54CD-4130-9177-DAE76A3C5791} 0xffffffffffffffff 0xff -ets
logman update trace "GMSATracing" -p {6B510852-3583-4E2D-AFFE-A67F9F223438} 0xffffffffffffffff 0xff -ets
nltest /dbflag:0x2effffff
netsh trace start capture=yes filemode=circular overwrite=yes maxsize=512 tracefile=c:\temp\nettrace.etl
```

### Client - Stop

```powershell
logman stop "GMSATracing" -ets
nltest /dbflag:0x0
netsh trace stop
gpresult /h C:\Temp\gpresult.html
copy /y c:\windows\debug\netlogon.* c:\temp
copy /y c:\windows\system32\winevt\logs\System.evtx c:\temp
copy /y c:\windows\system32\winevt\logs\Application.evtx c:\temp
copy /y c:\windows\system32\winevt\logs\Microsoft-Windows-Security-Netlogon%4Operational.evtx c:\temp
copy /y c:\windows\system32\winevt\logs\Microsoft-Windows-TaskScheduler%4Operational.evtx c:\temp
```

### DC - Start

```powershell
md c:\temp
logman create trace "KDC" -ow -o c:\temp\KDC.etl -p {1BBA8B19-7F31-43C0-9643-6E911F79A06B} 0xffffffffffffffff 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 4096 -ets
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v SamLogLevel /t REG_DWORD /d 0x00002000 /f
nltest /dbflag:0x2effffff
netsh trace start capture=yes filemode=circular overwrite=yes maxsize=512 tracefile=c:\temp\nettrace.etl
```

### DC - Stop

```powershell
logman stop "KDC" -ets
reg add HKLM\SYSTEM\CurrentControlSet\Control\Lsa /v SamLogLevel /t REG_DWORD /d 0x0 /f
nltest /dbflag:0x0
netsh trace stop
gpresult /h C:\Temp\gpresult.html
copy /y c:\windows\debug\netlogon.* c:\temp
copy /y c:\windows\debug\sam.* c:\temp
```
