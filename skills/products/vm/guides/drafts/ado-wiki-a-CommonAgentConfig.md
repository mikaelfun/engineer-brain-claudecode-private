---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/GA/CommonAgentConfig_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20%28AGEX%29%2FTSGs%2FGA%2FCommonAgentConfig_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CommonAgentConfig.config Reference

This TSG is for user/customer update of CommonAgentConfig.config.

## File location

IaaS VM has file in C:\WindowsAzure\GuestAgent_XXXX(customer agent version)\CommonAgentConfig.config.

## File update

Update required setting in file. Restart RDAgent service for change to take effect.

Note:
- Settings would get reset to default during update of GuestAgent (or the next auto-upgrade).
- Manual modifications of CommonAgentConfig.config are NOT recommended due to above.
- Manual modifications of CommonAgentConfig.config are also NOT supported. From DEV: "we do not expect and support customer change our own config file directly. If the customer changed our GA artifacts and caused any abnormal behaviors, we will ignore such CRIs and treated it as Customer VM issue".

## Settings in CommonAgentConfig.config

- **agentRuntimeIniFileName**: Name of the .ini file used by the agent runtime.
- **agentRuntimeRootPath**: Root path to be used by the agent runtime. This will be the root path for Config, Resources & Application root
- **collectGuestLogsFolder**: The folder used by CollectGuestLogs.exe.
- **enableCollectInVmHealth**: Enable collection through CollectVMHealth.
- **enableNetAgent**: This indicates if NetAgent should be installed in the VM or not.
- **enablePushInVMLogs**: Whether to upload the VMAgent log. Users complaining about VM performance impact can turn off this setting, but logs won't be available for backend troubleshooting. Consider increasing pushInVMLogsIntervalInMinutes instead.
- **enableSecAgent**: This indicates if WaSecAgentProv.exe should be started in the VM or not.
- **hostVMAgentPluginPort**: HostVMAgent plugin port.
- **logPath**: Default log path
- **pushInVMLogsIntervalInMinutes**: The interval in minutes to upload the VMAgent logs. Might be increased if impacting VM performance.
- **queryForGAUpdatesInSeconds**: The interval in seconds to check for new GA updates for IaaS VM. To prevent auto-update, set a high value like 2500000 (~30 days).
- **queryForNetAgentUpdatesInSeconds**: The interval in seconds to query for NetAgent updates.

## CommonAgentConfig.config defaults

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <configSections>
    <section name="microsoft.windowsAzure.guestAgent.configuration"
                 type="Microsoft.WindowsAzure.GuestAgent.Core.AgentConfigurationSection, Microsoft.WindowsAzure.GuestAgent.Core" />
    <section name="microsoft.windowsAzure.jobObject.configuration"
               type="Microsoft.WindowsAzure.GuestAgent.Core.JobObjectConfigurationSection, Microsoft.WindowsAzure.GuestAgent.Core" />
  </configSections>
  <microsoft.windowsAzure.guestAgent.configuration>
      <heartbeat interval="0:0:5" />
      <environment useMockAgentRuntime="false"
                           isDesktop="false"
                           allowMultipleRoles="false"
                           agentRuntimeIniFileName="AppAgentRuntime.ini"
                           logPath="C:\Logs"
                           agentRuntimeRootPath="C:\"
                           queryForGAUpdatesInSeconds="15"
                           hostVMAgentPluginPort="32526"
                           enablePushInVMLogs="true"
                           pushInVMLogsIntervalInMinutes="60"
                           collectGuestLogsFolder="c:\CollectGuestLogsTemp"
                           enableCollectInVmHealth="true"
                           allowFastTrack="true"
                           enableNetAgent="true"
                           enableSecAgent="true"
                           queryForNetAgentUpdatesInSeconds="3600"
                           collectInVmHealthInterval="01:00:00"
                           enableRemoteAccessManagement="true"
                           />
      <iaasEnvironment
                           logPath="%systemdrive%\WindowsAzure\Logs"
                           agentRuntimeRootPath="%systemdrive%\WindowsAzure\"
                           queryForGAUpdatesInSeconds="60"
                           collectGuestLogsFolder="%systemdrive%\WindowsAzure\CollectGuestLogsTemp"
                           />
      <nativeEnvironment
                           agentRuntimeIniFileName="NativeLegacyRuntime.ini"
                           logPath="C:\Logs\GuestAgentLogs"
                           agentRuntimeRootPath="C:\GuestAgent\"
                           allowMultipleRoles="true"
                           queryForGAUpdatesInSeconds="-1"/>
    </microsoft.windowsAzure.guestAgent.configuration>

  <microsoft.windowsAzure.jobObject.configuration>
    <processes>
      <process name="WaAppAgent" maxCpuLimit="3" minCpuLimit="1" ramLimit="100" />
      <process name="WindowsAzureGuestAgent" maxCpuLimit="5" minCpuLimit="1" ramLimit="300" />
    </processes>
    <extensions/>
  </microsoft.windowsAzure.jobObject.configuration>
</configuration>
```
