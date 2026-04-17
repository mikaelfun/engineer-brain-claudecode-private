---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Domain Join/Workflow: Domain Join: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDomain%20Join%2FWorkflow%3A%20Domain%20Join%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Domain Join: Data Collection

**Summary**: Guide for collecting logs to troubleshoot domain join failures. Covers netsetup.log, network trace, and automated collection tools.

## Required Logs

Regardless of the error message received in GUI when trying to join a computer into an AD domain, collect the following:

1. The operating system information of the client computer that is to join the AD domain.
2. The operating system information of the domain controller(s).
3. The full text or screenshot of error message displayed in GUI at the client computer.
4. **Netsetup log** file at `%windir%\Debug\netsetup.log` at the client computer.
5. **Network trace** covering the course of domain join operation collected at the client computer.

## Netsetup Log

Located on the client machine at `%windir%\debug\netsetup.log`. Enabled by default - no need to explicitly enable it.

## Network Trace

Contains the communication between the client computer and relative servers (DNS servers, domain controllers). Should be collected at the client computer using Microsoft Network Monitor, Wireshark, or netsh.exe.

## Collection Methods

### Method 1: Manual Collection

1. Download and install Microsoft Network Monitor or Wireshark on the client computer.
2. Start the app by "run as administrator". Start capturing.
3. Try to join the AD domain to reproduce the error. Record the error message.
4. Stop capturing and save the network trace.
5. Collect `%windir%\debug\netsetup.log`.

### Method 2: Auth Scripts

Auth Scripts - lightweight PowerShell script from https://aka.ms/authscripts.

1. Download and extract on the client computer.
2. Start PowerShell as administrator, navigate to the extracted folder.
3. Run `Start-auth.ps1`. Accept EULA if prompted.
   - If scripts blocked by execution policy: [about_Execution_Policies](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.5)
4. Reproduce the domain join error.
5. Run `Stop-auth.ps1`.
6. Logs in `authlogs` subfolder: `Netsetup.log` + `Nettrace.etl`.

### Method 3: TSS Tool

TSS tool from https://aka.ms/gettss.

1. Download and extract on the client computer.
2. Start PowerShell as administrator, navigate to the extracted folder.
3. Run: `TSS.ps1 -scenario ADS_AUTH -noSDP -norecording -noxray -noupdate -accepteula -startnowait`
4. Wait for completion, then reproduce the domain join error.
5. Run `TSS.ps1 -stop`.
6. Logs in `C:\MS_DATA` subfolder (zipped): `TSS_<hostname>_<date>-<time>-ADS_AUTH.zip`
   - Inside: `Netsetup.log` + `<hostname>_<date>-<time>-Netsh_packetcapture.etl`
