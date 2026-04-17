---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files Sync/How Tos/Azure File Sync Agent Upgrade_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Files%20Sync%2FHow%20Tos%2FAzure%20File%20Sync%20Agent%20Upgrade_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---

Tags:

- cw.Azure-Files-Sync

- cw.How-To

- cw.Reviewed-01-2025

---

 

:::template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md

:::

 

[[_TOC_]]

 

# Overview of this document

This document explains the AFS agent upgrade policy described in [**Azure File Sync agent update policy**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning#azure-file-sync-agent-update-policy) and describes the outcomes when these policies are implemented.



For Azure File Sync Agent, there are five Agent upgrade paths.



1. Use the Azure File Sync agent auto-upgrade feature to install agent updates. 

2. Configure Microsoft Update to automatically download and install agent updates. 

3. Use AfsUpdater.exe to download and install agent updates.

4. Patch an existing Azure File Sync agent by using a Microsoft Update patch file, or a .msp executable. 

5. Download the newest Azure File Sync agent installer from the Microsoft Download Center.



This document only focuses on **No.1 and 2** and explains more detailed information.





# 1. AFS agent auto-upgrade feature

There are two auto-upgrade features(explained as InstallLatest Policy and UpdateBeforeExpiration) and these are described as [**Automatic agent lifecycle management**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning#automatic-agent-lifecycle-management)



## InstallLatest Mode

This Mode will automatically upgrade the AFS agent as soon as a new version is released.



AFS Agent is normally released via the below plan:



1. Flight release of Major version.

   

   This version is the same quality as the GA version. [**Agent lifecycle and change management guarantees**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning#agent-lifecycle-and-change-management-guarantees)

2. Major version without flighting

3. Minor version is released if a minor version is needed

   

   [**Major vs. minor agent versions**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning#major-vs-minor-agent-versions)





InstallLatest policy only works if **update policy is InstallLatest and Flighting Policy Id is applied on this server**.

Flighting Policy Id is only applied when new flight version is released.



Therefore, for example, if customer installs v16.2 and changes the policy to InstallLatest when v17 has already released, the agent will not be upgraded until v18.0 is released. 



If we need to know whether Flighting Policy Id is applied or not, we can confirm from Telemetry Event Log or AfsAutoUpdaterLog.



- Telemetry Eventlog



  ![Telemetry-EventLog](/.attachments/SME-Topics/Azure-Files-Sync/Azure-File-Sync-Agent-Upgrade_Telemetry-EventLog.png)

- AfsAutoUpdatger Log in C:\Program Files\Azure\StorageSyncAgent\MAAgent\Diagnostic\InstallerLog



  ![AutoUpdaterLog](/.attachments/SME-Topics/Azure-Files-Sync/Azure-File-Sync-Agent-Upgrade_AutoUpgradeLog.png)







If one upgrade policy and Flighting Policy ID is missed, agent auto upgrade will work the same as UpdateBeforeExpiration Mode.



Once agent auto upgrade is working in InstallLatest mode, **every minor update is also applied** as soon as a new minor version is released.









## UpdateBeforeExpiration Mode

If this mode is used, the agent is only upgraded if agent support will be expired within 21 days.



This mode only works in a limited time range, therefore, any update will be not installed if the date is not matched to limited time range.

If the customer wants to upgrade the agent major or minor version before the limited time range, **the customer needs to upgrade manually** to the target version.



<div style="width: 85%; margin: auto">

    <div style="background:#ffac07; color:black; font-weight:bold; text-align:center;">

        Note!

    </div>

    <div style="background:#ffda92; color:black; font-weight:bold; text-align:center;">

 

If flighting has already completed for the latest agent version and the agent auto update policy is changed to InstallLatest, the agent will not auto-upgrade until the next agent version is flighted. To update to an agent version that has completed flighting, use Microsoft Update or AfsUpdater.exe. To check if an agent version is currently flighting, check the supported versions section in the release notes.

 

</div>

</div>



## FAQ

Q1: When is auto-upgrade run?



A1:

On Agent auto-update feature, Task on TaskScheduler runs AfsAutoUpdater.exe every hour. AfsAutoUpdater.exe checks if the update policy and time are matched or not. if policy and time are matched, then AfsAutoUpdater.exe executes the upgrade process. This upgrade  process is similar to using AfsUpdater.exe.





# 2. Upgrade with Microsoft Update

The AFSAgent can upgrade via Microsoft Update if "Settings -> Windows Update -> Advanced Options -> Give me updates for other Microsoft products when I update Windows" is enabled.



![WindowsUpdate](/.attachments/SME-Topics/Azure-Files-Sync/Azure-File-Sync-Agent-Upgrade_Update-AdvancedOption.png)





If the customer does not set this to ON, the Setup menu appears during agent installing process.



![EnableMu](/.attachments/SME-Topics/Azure-Files-Sync/Azure-File-Sync-Agent-Upgrade_EnableMU.png)





The customer can turn on the Microsoft Update Setting as below during Installation.



![Windows Update](/.attachments/SME-Topics/Azure-Files-Sync/Azure-File-Sync-Agent-Upgrade_WindowsUpdate.png)



If the customer wants to switch (enable/disable) this setting after installation, they can change setting at "Settings -> Windows Update -> Advanced Options -> Give me updates for other Microsoft products when I update Windows".



## FAQ

Q1: How do we confirm if Microsoft Update is enabled during install?



A1:

We can confirm this by checking a registry value.

The command is below:

```

Command:

reg query HKLM\SOFTWARE\Microsoft\Azure\StorageSync\Agent\InstallOptions /v MUEnabled

```



If the result is true, then Microsoft Update is Enabled.



```

Example Result:

HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Azure\StorageSync\Agent\InstallOptions

    MUEnabled    REG_SZ    true



```



Because this registry key is added during the agent installation process, when we want to know the current OS settings, we need to confirm at "Settings -> Windows Update -> Advanced Options -> Give me updates for other Microsoft products when I update Windows" to confirm the Microsoft Update setting is enabled or not.





**How to check AFS update agent**



Customer can confirm Agent Update Policy by themselves using below command.





```

Import-Module -Name 'C:\Program Files\Azure\StorageSyncAgent\StorageSync.Management.ServerCmdlets.dll' 



Get-StorageSyncAgentAutoUpdatePolicy 



```

Output

```

Policy Mode             Day     Hour 



----------             ---     ---- 



UpdateBeforeExpiration Tuesday   18 



```





**Useful kusto Table for AFS investigation**



```

cluster("Xfiles").database("xsynctelemetrysf").ServerTelemetryEvents table contains AFS agent telemetly Event Log information.



```



# References

 

* Public document

  * [**Azure File Sync agent update policy**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning#azure-file-sync-agent-update-policy)

  * [**Automatic agent lifecycle management**](https://learn.microsoft.com/en-us/azure/storage/file-sync/file-sync-planning#automatic-agent-lifecycle-management)



* Related TSG

  * [**Filesync Agent Autoupdater Policy_Storage**](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1073149/Filesync-Agent-Autoupdater-Policy_Storage)



::: template /.templates/Processes/Knowledge-Management/Azure-Files-Sync-Feedback-Template.md

:::
