---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/Workflows/Run Command Workflow_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FWorkflows%2FRun%20Command%20Workflow_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AGEX
- cw.Workflow
- cw.Reviewed-04-2025
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::


[[_TOC_]]


<div style="width: 85%; margin: auto">
    <div style="background:#ffac07; color:black; font-weight:bold; text-align:center;">
        Important!
    </div>
    <div style="background:#ffda92; color:black; font-weight:bold; text-align:center;">

There are currently 2 version of the Run Command extension and this workflow will help you differentiate and troubleshoot both of them:  
Action Run Command (v1)  
Managed Run Command (v2)

</div>
</div>

# Summary

The Run Command feature uses the virtual machine Guest Agent to run PowerShell scripts within an Azure Windows or Linux VM. You can use these scripts for general machine or application management. They can help you to quickly diagnose and remediate VM access and network issues and get the VM back to a good state.

:::mermaid
flowchart TD
    Start(Is the Guest Agent ready?) --> |Yes| WhichRC("Make sure you know what version of Run Command the customer is using.<br>Are they using Action Run Command(v1) or Managed RunCommand(v2)<br><br>Remember this as it will be important when troubleshooting")
    Start --> |No| GA(Click here to go to the Guest Agent workflow)
    WhichRC --> installCheck(Does the customer need help installing?)
    installCheck -->|Yes| install(Click here to go to install article)
    installCheck -->|No| CheckError(Check ASC/logs for error message. Does the error match a TSG?)
    CheckError --> |Yes| Resolved1(Follow TSG to resolve the issue)
    CheckError --> |No| LogAnalysis(Manually check log files. Is the Extension installing/enabling?)
    CheckError --> |The extension is stuck in 'transitioning'| timeout(Uninstall the extension)
    LogAnalysis --> |No| installFail(This could fail for a variety of reasons and will really just depend<br>on the error that is seen in the log file and/or operation output.<br>Search for the error message in the wiki to see what TSGs we might have for it)
    LogAnalysis --> |Yes| CheckScriptExecution(Is the script file executing successfully?)
    CheckScriptExecution --> |No| scriptSuccess(Does the script work if the customer<br>manually runs it inside the GuestOS?)
    CheckScriptExecution --> |Yes| scriptFail(Then usually either its working fine or the<br>customer claims it didn't do what its supposed to<br><br>Next we can check for Run Command limitations in the script, but it may just come down<br>to the customer needing to update their script)
    scriptSuccess --> |No| manualFail(If the script also fails when ran manually inside the<br>GuestOS then the customer needs to fix their script)
    scriptSuccess --> |Yes| manualSuccess(If it works when ran manually, then we need to<br>check for Run Command limitations in the script)

click GA "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495022"
click timeout "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494998/RunCommand-Removal_AGEX"
click install "https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1218386"
classDef clickable fill:#ffffff,color:#0f2080;
:::

# Is the Guest Agent ready?
Make sure the Azure Guest Agent is in a Ready state. You can check the Guest Agent status In ASC Resource Explorer under the 'Properties' tab. If it is not in a ready state proceed with [Guest Agent basic workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495022) to fix the Guest Agent before looking into any extension issues.

# What version of the Run Command extension?

As mentioned above, there are currently 2 versions of the Run Command extension, Action Run Command (v1) and Managed Run Command (v2). Each one functions a little bit differently and has differnet installation methods.

It is important to know what version of the Run Command the customer is using so that we give appropriate guidance. If you aren't sure which one they're using then review the following 2 sections to find out and keep it in mind for subsequent troubleshooting steps.

## Action Run Command (v1)

Action Run Command has been around for a long time. It is what is commonly used in the Portal under the 'Run Command' blade (along with methods via PowerShell and CLI). Public documentation for [Linux](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/run-command) and [Windows](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/run-command).


Looking in the CRP Operations tab in ASC you will see the following Operation Name:  
```VirtualMachines.RunCommand.POST``` or ```VMScaleSetVMs.RunCommand.POST```  

Looking in the Extensions tab in ASC you will see the following extension Type:  
```Microsoft.CPlat.Core.RunCommandLinux``` or ```Microsoft.CPlat.Core.RunCommandWindows```  

## Managed Run Command (v2)

Managed Run Command became generally available in the beginning of 2023. Public documentation for [Linux](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/run-command-managed) and [Windows](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/run-command-managed).

Looking in the CRP Operations tab in ASC you will see the following Operation Name:  
```VMRunCommands.VMRunCommandOperation.PUT``` or ```VMScaleSetVMRunCommands.VMScaleSetVMRunCommandOperation.PUT```  

Looking in the Extensions tab in ASC you will see the following extension Type:  
```Microsoft.CPlat.Core.RunCommandHandlerLinux``` or ```Microsoft.CPlat.Core.RunCommandHandlerWindows```

Managed Run Command has the following benefits over Action Run Command:
 - Support for updated Run Command through ARM deployment template
 - Parallel execution of multiple scripts
 - Sequential execution of scripts
 - User specified script timeout
 - Support for long running (hours/days) scripts
 - Passing secrets (parameters, passwords) in a secure manner
 - Run script as another user account

# Feature Comparison between Action Run Command (v1) and Managed Run Command (v2)

| **Feature support**       | **Action RunCommand (V1)**          | **Managed RunCommand  (V2)**                  |
|---------------------------|-------------------------------------|-----------------------------------------------|
| ARM template              | No, it�s a POST action              | Yes, it�s a resource type                     |
| Long running              | 90 min limit                        | Customer specified timeout                    |
| Execution account         | System account / root               | Customer specified user                       |
| Multiple run commands     | Only one active                     | Multiple in parallel or sequenced             |
| Large output              | Limited to 4k (in status blob)      | Uploaded to customer append blob              |
| Progress tracking         | Reports only final status           | Reports progress and last 4k output during execution  |
| Async execution           | Goal state/provisioning waits for script to complete | Customer specified async flag if provisioning waits for the script |
| Virtual machine scale set support | Only on VM instance          | Support virtual machine scale set model and scale out |
| SAS generation            | No blob support                     | Automated, CRP generates SAS for customer blobs and manages them |
| Gallery (custom commands) | Only built-in commandIds           | Customer can publish scripts and share them   |


# Does the customer need help installing the Run Command?

If the customer needs help installing the Run Command via the Portal, PowerShell, CLI, ARM template, etc then please see the following article for steps on how to configure the installation - [How to install/uninstall the Run Command.](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1218386)

# Check the extension in ASC

In ASC Resource Explorer, select the VM and look under the 'Extensions' tab. If the Run Command is still currently installed then you can check its status by expanding its entry in the list. If its not currently installed or if the error isn't detailed enough to be helpful then you can check the 'Operations' tab as well.

Under the 'Operations' tab (you may need to filter the time range to when the issue happened) you can also see Run Command operations. Depending on the scenario, the error message you see in one of these operations may tell you what happened and/or you can use the error to search in the wiki for a matching TSG.

**Please note:** It is by design for the customer to not be able to see both Action Run Command (v1) and Managed Run Command (v2) extensions in the Portal under the "Extensions + applications" blade or via the general purpose extension PowerShell/CLI commands.

## Run Command is timing out

If the Run Command is timing out or if it is stuck in 'transitioning' for a long time then in all likelihood you just need to [remove it](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494998/RunCommand-Removal_AGEX). More general purpose extension information can be found here regarding the [90 minute timeout value for extensions](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/884230/90-minute-extension-timeout_AGEX).

If the information in either the 'Extensions' or 'Operations' tab isn't enough or if the customer continues to have issues with it timing out each time they run it then continue reading in this workflow to investigate.

# Manually check log files

By this point you should have already gone through the Extension workflow to gather log files. If needed the log collection steps are detailed [here](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495023/Extensions-Workflow_AGEX?anchor=collect-guest-logs)

When manually looking through logs files you want to make sure you have the correct timestamp of when an issue happened so that you know you're looking at the correct log entries. Once you have the time and you're looking at relevant entries, look for any errors that stand out. If you find any errors, search for them in the wiki to see if we have any TSGs for the scenario.

## Action Run Command (v1) Logs

<details>
<summary><span style="color:#74ac04"><strong>Click here to see an example log file where the Action Run Command (v1) worked successfully in the VM's handler.log file</strong></span></summary>

### Windows

```C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandWindows\<version>\RunCommandExtension.log```

**Working example**
```powershell
#Action RunCommand v1 is starting installation.
[4892+00000001] [03/04/2021 20:49:58.30] [INFO] Starting RunCommand Extension v1
#Handler environment has been created and extension is installed.
[4892+00000001] [03/04/2021 20:49:58.31] [INFO] HandlerEnvironment = Version: 1, HandlerEnvironment: [LogFolder: "C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandWindows\1.1.8", ConfigFolder: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandWindows\1.1.8\RuntimeSettings", StatusFolder: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandWindows\1.1.8\Status", HeartbeatFile: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandWindows\1.1.8\Status\HeartBeat.Json"]
[4892+00000001] [03/04/2021 20:49:58.31] [INFO] Installing Handler
[4892+00000001] [03/04/2021 20:49:58.31] [INFO] Handler successfully installed
#Action RunCommand v1 is enabling.
[1116+00000001] [03/04/2021 20:50:04.76] [INFO] Starting RunCommand Extension v1
[1116+00000001] [03/04/2021 20:50:04.79] [INFO] HandlerEnvironment = Version: 1, HandlerEnvironment: [LogFolder: "C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandWindows\1.1.8", ConfigFolder: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandWindows\1.1.8\RuntimeSettings", StatusFolder: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandWindows\1.1.8\Status", HeartbeatFile: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandWindows\1.1.8\Status\HeartBeat.Json"]
[1116+00000001] [03/04/2021 20:50:04.79] [INFO] Enabling Handler
[1116+00000001] [03/04/2021 20:50:04.79] [INFO] Handler successfully enabled
#This is where we see what sequence is running.
[1116+00000001] [03/04/2021 20:50:04.79] [INFO] Loading configuration for sequence number 0
#This shows the handler settings.
[1116+00000001] [03/04/2021 20:50:04.82] [INFO] HandlerSettings = ProtectedSettingsCertThumbprint: REDACTED, ProtectedSettings: {REDACTED}, PublicSettings: {Script: [Get-Process | Out-File -FilePath .\Process.txt]}
#Action RunCommand v1 is executing the script.
[1116+00000001] [03/04/2021 20:50:04.85] [INFO] Asynchronously executing the specified run command script.
#Action RunCommand v1 is waiting for the script to complete with either code 0 or another status code.  An error here means that there is an issue with the script/command that the customer is running.
[1116+00000001] [03/04/2021 20:50:04.93] [INFO] Command execution task started. Awaiting completion...
#Script has completed successfully.
[1116+00000001] [03/04/2021 20:50:05.38] [INFO] Command execution finished. Command exited with code: 0
```

### Linux
The Linux logs have a few notable differences.
- The sequence number is reported with each line of the log as 'seq=#'
- You will not see a line that has 'Awaiting completion...' this is in Windows only.
- You will not see a line that has 'Command existed with code: #' this is in Windows only.

**Log Files**

```/var/log/azure/run-command/handler.log```

**Working example**

```powershell
#Action RunCommand v1 is starting installation.
+ /var/lib/waagent/Microsoft.CPlat.Core.RunCommandLinux-1.0.1/bin/run-command-extension install
#Handler environment has been created and extension is installed.
time=2021-03-04T22:07:39Z version=v1.0.1/git@e924a1a-clean operation=install seq=0 event=start
time=2021-03-04T22:07:39Z version=v1.0.1/git@e924a1a-clean operation=install seq=0 status="not reported for operation (by design)"
time=2021-03-04T22:07:39Z version=v1.0.1/git@e924a1a-clean operation=install seq=0 event="migrate to mrseq" error="Can't find out seqnum from /var/lib/waagent/Microsoft.CPlat.Core.RunCommandLinux-1.0.1/status, not enough files."
time=2021-03-04T22:07:39Z version=v1.0.1/git@e924a1a-clean operation=install seq=0 event="created data dir" path=/var/lib/waagent/run-command
time=2021-03-04T22:07:39Z version=v1.0.1/git@e924a1a-clean operation=install seq=0 event=installed
time=2021-03-04T22:07:39Z version=v1.0.1/git@e924a1a-clean operation=install seq=0 status="not reported for operation (by design)"
time=2021-03-04T22:07:39Z version=v1.0.1/git@e924a1a-clean operation=install seq=0 event=end
Writing a placeholder status file indicating progress before forking: /var/lib/waagent/Microsoft.CPlat.Core.RunCommandLinux-1.0.1/status/0.status
#Action RunCommand v1 is enabling.
+ nohup /var/lib/waagent/Microsoft.CPlat.Core.RunCommandLinux-1.0.1/bin/run-command-extension enable
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event=start
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event=pre-check
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="comparing seqnum" path=mrseq
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="seqnum saved" path=mrseq
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="reading configuration"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="read configuration"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="validating json schema"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="json schema valid"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="parsing configuration json"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="parsed configuration json"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="validating configuration logically"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="validated configuration"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="creating output directory" path=/var/lib/waagent/run-command/download/0
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="created output directory"
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 files=0
#Action RunCommand v1 is executing the script. An error here means that there is an issue with the script/command that the customer is running.
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="executing command" output=/var/lib/waagent/run-command/download/0
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="executing protected script" output=/var/lib/waagent/run-command/download/0
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event="executed command" output=/var/lib/waagent/run-command/download/0
#Script has completed successfully.
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event=enabled
time=2021-03-04T22:07:41Z version=v1.0.1/git@e924a1a-clean operation=enable seq=0 event=end
```
</details>

## Managed Run Command (v2) Logs

<details>
<summary><span style="color:#74ac04"><strong>Click here to see an example log file where the Managed Run Command (v2) worked successfully a VM's handler.log file</strong></span></summary>

### Windows

```C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\<version>\RunCommandHandler.log```

**Working example**

```powershell
#Managed Run Command is starting installation
[4400+00000001] [10/18/2023 19:07:57.03] [INFO] Starting RunCommand Extension version 1
[4400+00000001] [10/18/2023 19:07:57.03] [INFO] HandlerEnvironment = Version: 1, HandlerEnvironment: [LogFolder: "C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8", ConfigFolder: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8\RuntimeSettings", StatusFolder: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8\Status", EventsFolder: "C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\Events", HeartbeatFile: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8\Status\HeartBeat.Json"]
[4400+00000001] [10/18/2023 19:07:57.03] [INFO] Process handler command: install
[4400+00000001] [10/18/2023 19:07:57.03] [INFO] Removing user-level access rules for 2 directories
[4400+00000001] [10/18/2023 19:07:57.03] [INFO] Removing Users access rules from directory 'C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8'
[4400+00000001] [10/18/2023 19:07:57.05] [INFO] Removing Users access rules from directory 'C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8'
[4400+00000001] [10/18/2023 19:07:57.05] [INFO] Finished removing user-level access rules
[5864+00000001] [10/18/2023 19:08:03.40] [INFO] Temporary directory for event files was successfully created: C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\Events\Temp
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] Space available in event directory: 39981250B
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] Setting event reporting interval to 10000ms
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] Event polling is starting...
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] An ExtensionEventLogger was created
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] Starting RunCommand Extension version 1
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] HandlerEnvironment = Version: 1, HandlerEnvironment: [LogFolder: "C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8", ConfigFolder: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8\RuntimeSettings", StatusFolder: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8\Status", EventsFolder: "C:\WindowsAzure\Logs\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\Events", HeartbeatFile: "C:\Packages\Plugins\Microsoft.CPlat.Core.RunCommandHandlerWindows\2.0.8\Status\HeartBeat.Json"]
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] Using environment variable [ConfigExtensionName]=Demo
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] Using environment variable [ConfigSequenceNumber]=0
#Managed Run Command is enabling
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] Process handler command: enable
#This is where we see what sequence is running.
[5864+00000001] [10/18/2023 19:08:03.42] [INFO] Loading configuration for sequence number 0
#This shows the handler settings.
[5864+00000001] [10/18/2023 19:08:03.45] [INFO] HandlerSettings = ProtectedSettingsCertThumbprint: <REDACTED> Thumbprint length = 40, ProtectedSettings: <REDACTED> ProtectedSettings length = 584, PublicSettings: Source: Script: ipconfig /all
SIG  Begin signature block
<cut>
SIG  End signature block
ScriptUri:  Parameters: []
[5864+00000001] [10/18/2023 19:08:03.56] [INFO] Checking if process id -1 is still running.
#Managed Run Command is executing the script
[5864+00000001] [10/18/2023 19:08:03.62] [INFO] RunCommand script execution task started.
[5864+00000001] [10/18/2023 19:08:03.62] [INFO] PowerShellPath is set to C:\Windows\system32\windowspowershell\v1.0\powershell.exe
#Script has completed successfully.
[5864+00000001] [10/18/2023 19:08:03.81] [INFO] RunCommand script execution finished with exit code: 0
```

### Linux

```/var/log/azure/run-command-handler```

**Working example**

```powershell
#Managed RunCommand is starting installation.
+ /var/lib/waagent/Microsoft.CPlat.Core.RunCommandHandlerLinux-1.3.5/bin/run-command-handler install
time=2023-10-23T16:30:26Z version=v1.3.3/git@792da3d-clean operation=install extensionName=Demo seq=0 event=start
time=2023-10-23T16:30:26Z version=v1.3.3/git@792da3d-clean operation=install extensionName=Demo seq=0 status="not reported for operation (by design)"
time=2023-10-23T16:30:26Z version=v1.3.3/git@792da3d-clean operation=install extensionName=Demo seq=0 event="created data dir" path=/var/lib/waagent/run-command-handler
time=2023-10-23T16:30:26Z version=v1.3.3/git@792da3d-clean operation=install extensionName=Demo seq=0 event=installed
time=2023-10-23T16:30:26Z version=v1.3.3/git@792da3d-clean operation=install extensionName=Demo seq=0 status="not reported for operation (by design)"
time=2023-10-23T16:30:26Z version=v1.3.3/git@792da3d-clean operation=install extensionName=Demo seq=0 event=end
#For this test, I named the run command 'Demo'. You may see a different name depending on what the customer is using
Writing a placeholder status file indicating progress before forking: /Demo.0.status
#Managed RunCommand v2 is enabling
+ nohup /var/lib/waagent/Microsoft.CPlat.Core.RunCommandHandlerLinux-1.3.5/bin/run-command-handler enable
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event=start
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event=pre-check
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="comparing seqnum" path=Demo.mrseq
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="seqnum saved" path=Demo.mrseq
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="reading configuration from /var/lib/waagent/Microsoft.CPlat.Core.RunCommandHandlerLinux-1.3.5/config/Demo.0.settings"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="read configuration"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="validating json schema"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="json schema valid"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="parsing configuration json"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="parsed configuration json"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="validating configuration logically"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="validated configuration"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="creating output directory" path=/var/lib/waagent/run-command-handler/download/Demo/0
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="created output directory"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 scriptUri=
#Managed RunCommand v2 is executing the script. An error here means that there is an issue with the script/command that the customer is running.
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="executing command" output=/var/lib/waagent/run-command-handler/download/Demo/0
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="prepare command" scriptFile=/var/lib/waagent/run-command-handler/download/Demo/0/script.sh
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="executed command" output=/var/lib/waagent/run-command-handler/download/Demo/0
#Script has completed successfully.
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event=enabled
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event="clearing settings and script files except most recent seq num"
time=2023-10-23T16:30:28Z version=v1.3.3/git@792da3d-clean operation=enable extensionName=Demo seq=0 event=end
```


</details>

## The install/enablement is failing

If the install/enablement is failing it could be for a variety of reasons and will really just depend on the error that is seen in the log file and/or operation output. 

Search for the error message in the wiki to see what TSGs we might have for it. If the error is talking about specific installation parameters being incorrect then please refer to the installation article to help ensure that the customer is installing the Run Command correctly - [How to install/uninstall the Run Command](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1218386).

## The script file download is failing

<summary><span style="color:orange">This step is only applicable to Managed Run Command v2 and only if the customer is specifically using the method of storing their script in a storage account. If both of these aren't true then skip this step and continue to the next section.</span></summary>
  

There are multiple ways to designate a script with **Managed Run Command v2**. One of them is by specifying a storage account to download the script from. **If** they are using this method and you see in the logs that the download is failing then then the customer should try accessing the file inside the GuestOS by trying to download the file manually. In most cases, the customer just can't reach the remote location or it may be reachable, but they're having authentication issues due to a misconfigured key, SAS token, etc. The customer needs to ensure that the location is reachable and if its not publicly available then make sure they are authenticating properly.

1. Put the script URL in a browser in the effected VM (Windows) or use curl (Linux) to see if they're able to reach it and download it.
1. If the file requires authentication of some type then the above may provide an authentication error and they will have to validate that authentication in addition to testing to see if the script is reachable. This normally only applies if the script is in an Azure Storage Account. Here are 2 common ways that this is accomplished.  
**NOTE:** Be careful when working working with secrets with a customer. Do **NOT** ever have them send you the secrets in plain text.
    1. Storage Account key: In the Azure Portal, select the Storage Account, Container, and the script they're trying to download. Click the 'Generate SAS' tab, make sure they're using the same key in their deployment that they select here, and click the 'Generate SAS Token and URL' button. Use that URL inside the VM either by putting it in a browser (Windows) or usring curl (Linux).

## The script execution is failing or has unexpected results

If the install/enablement is successful, then the next step is for the script to execute. Generally this can be a problem in 1 of the following ways:
1. The script execution finishes with an error
1. The script execution finishes without error, but the customer claims its not doing what its supposed to
1. The script times out

If it gets to the point where the script is executing then we're getting to a point where we may be limited to the extant that we can help. If it�s the script itself that isn�t working correctly then that is for the customer to debug. We can help by pointing out things that aren�t allowed in the script (such as waiting on user input, reboots, obvious typos, Run Command limitations, etc), but the customer is responsible for debugging and/or writing the script because we don't do custom scripting. However, we can try some of the following troubleshooting steps.

1. Does the script run successfully if the customer manually runs it inside the GuestOS (without using the extension)? 
    1. If it still has the same issue when ran manually, then that can completely rule out the extension and the customer needs to work on fixing their script because it just doesn't work. 
    1. If the script does work when they run it manually then we can try the following:
        1. Ensure that the customer is aware of limitations with Run Command
            1. Action Run Commdand on [Windows](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/run-command#restrictions) and [Linux](https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/custom-script-linux#tips)
            1. Managed Run Command doesn't have a specific list documented, but many of the same ones from above still apply such as reboots in the script, the script waiting on user input, or the script stopping the Guest Agent services.
        1. We can also help to some degree with some debugging as well - https://aka.ms/csedebug. 

### System Account

Another thing to be aware of is that the script is ran under the LocalSystem account (Windows) or root (Linux). It isn't common that this is causing the problem, but you can rule it out by manually running the script inside Windows with PSExec under the LocalSystem account
1. You can download PsExec [here](https://docs.microsoft.com/en-us/sysinternals/downloads/psexec)
    1. Open an Administrative Command Prompt and ensure you're in the same directory that the PsExec.exe is in and then run the following to open a CMD window under a specific user context:  
```psexec.exe -i -s powershell```
    1. To test what user context is signed in you can use the ```whoami``` command and it should return the system account
    1. Then run the script from that window and see if it works as expected. 
1. If manually running the script under a 'normal' user works, but it fails under the LocalSystem account then they have the following options depending on what version of the extension they're using:
    1. **Action Run Command** - The customer needs to update their script and/or OS configuration to accomodate the LocalSystem account
    1. **Managed Run Command** - The customer can either update their script and/or OS configuration to accomodate the LocalSystem account **OR** use the 'RunAsUser' parameter when installing the Run Command to specify an existing local user


#References
**Public**
- [Action Run Command v1 - Windows](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/run-command)
- [Action Run Command v1 - Linux](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/run-command)
- [Managed Run Command v2 - Windows](https://learn.microsoft.com/en-us/azure/virtual-machines/windows/run-command-managed)
- [Managed Run Command v2 - Linux](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/run-command-managed)
- [Run Command Overview](https://learn.microsoft.com/en-us/azure/virtual-machines/run-command-overview)

**Internal**
- [How to install the Run Command extension](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1218386)
- [How to remove RunCommand](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494998/)
- [Debugging PowerShell Scripts - https://aka.ms/csedebug](https://aka.ms/csedebug)


::: template /.templates/Processes/Knowledge-Management/AGEX-Feedback-Template.md
:::
