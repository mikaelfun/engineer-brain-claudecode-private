---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/Extension/Debugging PS Scripts Run by CSE or RC_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FExtension%2FDebugging%20PS%20Scripts%20Run%20by%20CSE%20or%20RC_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary

There are several ways to see why a PowerShell script is failing that you have run using CustomScriptExtension or RunCommand.

PowerShell has multiple output streams. CustomScriptExtension/RunCommand logs the Success stream to the STDOUT substatus and the Error stream to the STDERR substatus. These are substatuses of whichever extension was used to run - CustomScriptExtension or RunCommand.

The STDOUT and STDERR substatuses are in the CRP instanceview for the VM. You can see them in several places -

1. **Azure portal Extensions blade** - select the extension that was used to run the command - either **CustomScriptExtension** or **RunCommand**.
2. **Azure PowerShell** - `Get-AzVM -ResourceGroupName rg1 -Name vm1 -status`
3. **Azure CLI** - `az vm get-instance-view -g rg1 -n vm1`

Typically the error that caused the script to fail will show up in the **STDERR** substatus. But scripts can also fail in ways where there is no fatal error logged in the **STDERR** substatus.

## Testing the Script Manually and with PsExec

Make sure the script runs successfully manually from an elevated PowerShell prompt on the VM.

If the script works manually, use [PsExec](https://docs.microsoft.com/en-us/sysinternals/downloads/psexec) to run the script using the LocalSystem account. CustomScriptExtension and RunCommand both run scripts using the LocalSystem account. Using **psexec -s** lets us test the script with LocalSystem without using CustomScriptExtension and RunCommand at all. If the failure reproduces with **psexec -s**, then we know CustomScriptExtension or RunCommand are not the cause of the issue.

### Testing with PsExec

Replace C:\SomeFolder\SomeScript.ps1 with the full path to the script.

Run the command from an elevated CMD prompt.

```
psexec.exe -accepteula -nobanner -s powershell -nologo -noprofile -file C:\SomeFolder\SomeScript.ps1
```

PsExec can also be used interactively:

```
C:\>psexec -accepteula -nobanner -s powershell -nologo -noprofile

PS C:\Windows\system32> whoami
nt authority\system
```

## Logging PowerShell Script Execution

When **STDERR** is not enough, there are a few different types of logging you can enable that together will show the script content and output.

### Enable Process Creation Auditing, Transcription, Module Logging, and Script Block Logging

#### Increase maximum size of Security and Microsoft-Windows-PowerShell/Operational event log

```
wevtutil sl "Security" /ms:104857600
wevtutil sl "Microsoft-Windows-PowerShell/Operational" /ms:104857600
```

#### Enable Process Creation Auditing

```
auditpol /set /category:"detailed tracking" /subcategory:"Process Creation" /success:enable
New-Item -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit'
New-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit' -Name 'ProcessCreationIncludeCmdLine_Enabled' -PropertyType 'DWord' -Value 1 -Force
```

#### Enable PowerShell Transcription

```
New-Item -Path 'HKLM:\Software\Policies\Microsoft\Windows\PowerShell\Transcription'
New-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\Transcription' -Name 'EnableTranscripting' -PropertyType 'DWord' -Value 1 -Force
New-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\Transcription' -Name 'EnableInvocationHeader' -PropertyType 'DWord' -Value 1 -Force
New-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\Transcription' -Name 'OutputDirectory' -PropertyType 'String' -Value 'C:\Transcripts' -Force
```

#### Enable PowerShell Module Logging

```
New-Item -Path 'HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ModuleLogging'
New-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ModuleLogging' -Name 'EnableModuleLogging' -PropertyType 'DWord' -Value 1 -Force
New-Item -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ModuleLogging\ModuleNames
New-ItemProperty -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ModuleLogging\ModuleNames -Name '*' -PropertyType String -Value '*'
```

#### Enable PowerShell Script Block Logging

```
New-Item -Path 'HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging'
New-ItemProperty -Path 'HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging' -Name 'EnableScriptBlockLogging' -PropertyType 'DWord' -Value 1 -Force
```

### Understanding the Output

- **Process creation auditing**: Event ID 4688 (creation with command line) and 4689 (termination) in Security log
- **Transcription**: Text file in OutputDirectory (e.g. C:\transcripts\...)
- **Module logging**: Event ID 4103 in Microsoft-Windows-PowerShell/Operational (cmdlet name and output)
- **Script block logging**: Event ID 4104 in Microsoft-Windows-PowerShell/Operational (script contents)

### Export Events to CSV

```powershell
$hours = 1
$now = Get-Date
$startTimeUtc = Get-Date ($now.AddHours(-$hours).ToUniversalTime()) -format 'yyyy-MM-ddTHH:mm:ssZ'
$endTimeUtc = Get-Date ($now.ToUniversalTime()) -format 'yyyy-MM-ddTHH:mm:ssZ'
# Query Security (4688/4689 from SYSTEM) + PowerShell/Operational (4103/4104 from SYSTEM)
# Export to CSV for analysis
```

## Disable Logging

Reset event log sizes, disable auditing, transcription, module logging, and script block logging by setting registry values back to 0.

## Testing

### RunCommand
```
Invoke-AzVMRunCommand -ResourceGroupName 'rg1' -VMName 'vm1' -CommandId 'RunPowerShellScript' -ScriptPath "$PWD\Test-CustomScriptExtension.ps1"
```

### CustomScriptExtension
```
Set-AzVMCustomScriptExtension -Location 'westus2' -ResourceGroupName 'rg1' -VMName 'vm1' -Name 'CustomScriptExtension' -FileUri 'https://raw.githubusercontent.com/craiglandis/scripts/master/Test-CustomScriptExtension.ps1' -Run 'Test-CustomScriptExtension.ps1' -ForceRerun (Get-Date).Ticks
```
