---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Access via Remote CMD_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Cant%20RDP%20SSH/How%20Tos/Access%20via%20Remote%20CMD_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.How-To
- cw.RDP-SSH
- cw.Reviewed-08-2024
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]

## Summary

PsExec is a lightweight telnet replacement that lets you execute processes on other systems, complete with full interactivity for console applications, without having to manually install client software. PsExec's most powerful uses include launching interactive command prompts on remote systems and remote-enabling tools like IpConfig that otherwise do not have the ability to show information about remote systems.

## Prerequisite

- PsExec uses TCP ports 135 and 445.

## Instructions

**Note:** Please be aware that starting with *Windows Server 2012* and later, the ports PsExec uses (135 and 445) are blocked by default on the Guest OS Firewall. You can open these ports using the VM Agent to use CSE to open these ports.

Use these commands in the Run-Command RunPowerShellScript and hit run to add two rules in the guest OS Windows Firewall to allow connection for PsExec on ports 135 and 445 (you can also use Custom Script Extension with the same commands):

```powershell
# Open port 135
New-NetFirewallRule -DisplayName "Open Port 135" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 135

# Open port 445
New-NetFirewallRule -DisplayName "Open Port 445" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 445
```

### Downloading PsExec using PowerShell

Declare variables for the problem VM:

```powershell
$remoteIP = "10.0.0.4"
$username = "your-username"
```

Create a temp folder:

```powershell
$workingDir = "c:\temp"
mkdir $workingDir
cd $workingDir
```

Download PSTools to use PsExec:

```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::TLS12
$client = New-Object System.Net.WebClient
$client.DownloadFile("https://download.sysinternals.com/files/PSTools.zip", "$($workingDir)\PSTools.zip")
Expand-Archive -Path "$($workingDir)\PSTools.zip" -DestinationPath "$($workingDir)\PSTools"
cd "$($workingDir)\PSTools"
```

Use PsExec to connect to the problem VM:

```powershell
$myArgs = "\\$remoteIP -u $username -accepteula -s powershell"
cmd /c "psexec.exe $myArgs"
```

### Using PsExec from Command Line

- Download the [PSTools Suite](https://download.sysinternals.com/files/PSTools.zip) and extract the zip file on the machine from where you are trying PsExec.
- Go to the extracted folder and in the address bar type `cmd` or open a cmd window and navigate to this folder.
- The syntax to use for PsExec to connect to an Azure VM is the following:

```shell
psexec \\<computer> -u user -s cmd
```

### Example

```shell
Psexec \\10.0.0.5 -u "<<userName>>" -s cmd
Psexec \\<<hostname>> cmd cmd.exe
```

Where:

- This access is within the same VNET.
- **DIP** or **HostName** can be used to replace `<<computer>>`.
- The `-s` parameter ensures the command is invoked using the System Account (Admin Privileges).

## Reference

- PsExec is part of the [PSTools Suite](https://download.sysinternals.com/files/PSTools.zip).
- For further details on how to operate PsExec, please refer to [PsExec](https://technet.microsoft.com/en-us/sysinternals/pxexec.aspx).
- For a complete look at the PSTools Suite, refer to [PSTools Suite](https://technet.microsoft.com/en-us/sysinternals/bb896649.aspx).

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md :::