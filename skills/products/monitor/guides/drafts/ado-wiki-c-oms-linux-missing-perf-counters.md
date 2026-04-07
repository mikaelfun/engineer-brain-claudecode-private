---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting OMS Linux Agent -Missing Performance Counters"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/Troubleshooting%20Guides/Troubleshooting%20OMS%20Linux%20Agent%20-Missing%20Performance%20Counters"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---
The Customer has an issue with Performance Counters and other non-heartbeat metrics from not being ingested into the Log Analytics workspace from a Linux Agent.  


# Pre-Requisites
---
* Ensure that the Support Topic is coded to _Azure\Log Analytics\Agent - Linux\Agent not reporting data or Heartbeat data missing_
* Check that the Agent can be supported in this scenario. [Check here for supportability](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605532/Linux-Agent-Basics?anchor=linux-agent-supportability)
  - You can run this command to determine the distro if you are uncertain: _cat /etc/system-release_
  

# Troubleshooting steps
---
1. Scope the case such that you will concentrate on one failed machine. All steps taken can be replicated to additional machines. 
2. Run the Linux Log Collector tool and have the customer upload the resulting data to the case via DTM. Instructions on how to use the Log Collector are found [here](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605530/Data-Collection-for-Linux-Agent) 
3. Go  to the workspace in the Portal or Azure Support Center and run this command: _Heartbeat | where OSType == "Linux" | summarize arg_max(TimeGenerated, *) by Computer_
   - If the agent does not show any recent Heartbeats being logged in the workspace you will not see Performance or other data. Basic Heart beats must work first. Go to the [Troubleshooting OMS Agent Install Issues & Missing Heartbeats](/Agents/OMS-Agent-for-Linux-\(omsagent\)/Troubleshooting-Guides/Troubleshooting-OMS-Agent-Install-Issues-&-Missing-Heartbeats). 

If you do see heart beats precede to the next step.

4. Are other Linux agents successfully sending performance counters? 
   - The assumption in this workflow is that there are no Log Analytics Ingestion issues going on. The following query would surface the most recent Performance data collected in the workspace based on time frame set in the Log Search Dialog: _Perf | summarize arg_max(TimeGenerated, *) by Computer | order by TimeGenerated desc_ 
   - If Linux agents show data returned with the query above and the time stamps are recent then some machines are configured to collect the Performance Counters and are sending it. This means the issue is isolated to some machines, presuming the counters returned in the query are the counters desired.
5. Does the machine being investigated show in the list? If yes, then the issue would seem resolved for this particular machine; if not then proceed to the next step.
6. Is the agent receiving a current configuration from the workspace?
   - If the agent is sending heartbeats it means it is communicating with the Log Analytics workspace, which rules out connection issues, and if other machines are sending Performance Counters to the workspace, then workspace configuration set correctly and some agents are getting correct configuration. 
   - The configuration data tells the agent what to collect and send to the workspace, check the current configuration of the machine in question by looking at the omsagent log found in _/var/opt/microsoft/omsagent/workspaceid/log/_ or by going to the collected log data from Step **3**
   - Once the file is open search from the bottom up for the string [info]: using configuration file: <ROOT>. You search the configuration file from the bottom up as this would be the most recent time the machine has gotten configuration data from the workspace.
   - Do any of the entries between the _<Root>_ tags look like what is below as this shows actual sample entries for the Performance Counters:

>type oms_omi
>object_name Logical Disk
>instance_regex .*
>counter_name_regex (% Used Inodes|Free Megabytes|% Used Space|Disk Transfers/sec|Disk Reads/sec|Disk Writes/sec)
>interval 10s
>omi_mapping_path /etc/opt/microsoft/omsagent/67e8d8fd-48a4-46ec-b41a-a62fcc02ce2e/conf/omsagent.d/omi_mapping.json>
>
>type oms_omi
>object_name Memory
>instance_regex .*
>counter_name_regex (Available MBytes Memory|% Used Memory|% Used Swap Space|% Available Memory)
>interval 10s
>omi_mapping_path /etc/opt/microsoft/omsagent/67e8d8fd-48a4-46ec-b41a-a62fcc02ce2e/conf/omsagent.d/omi_mapping.json
>
>type oms_omi
>object_name Processor
>instance_regex .*
>counter_name_regex (% Processor Time|% Privileged Time)
>interval 10s
>omi_mapping_path /etc/opt/microsoft/omsagent/67e8d8fd-48a4-46ec-b41a-a62fcc02ce2e/conf/omsagent.d/omi_mapping.json
>
>type oms_omi
>object_name Process
>instance_regex .*
>counter_name_regex (Used Memory|Pct User Time|Pct Privileged Time)
>interval 10s
>omi_mapping_path /etc/opt/microsoft/omsagent/67e8d8fd-48a4-46ec-b41a-a62fcc02ce2e/conf/omsagent.d/omi_mapping.json

- The entries seen should match up to what is seen in the Advanced Settings - Data - Linux Performance Counters

<IMG  src="https://supportability.visualstudio.com/0729ed13-7bf2-45bc-b5f8-14d86d38e608/_apis/git/repositories/3b4cb30c-a60c-434d-9695-f0e271962731/Items?path=%2F.attachments%2Fimage-c35ab4d3-20a6-49d9-b055-6144f430e48f.png&amp;download=false&amp;resolveLfs=true&amp;%24format=octetStream&amp;api-version=5.0-preview.1&amp;sanitize=true&amp;versionDescriptor.version=wikiMaster"  alt="image.png"/>


 - If you do not see counter entries like above, check the time stamp for the _[info]: using configuration file:_ entry, if it is old and or predates when counters were configured to be collected, configuration data has not gotten to the machine and you need to force an update configuration of the Agent.

7. Execute the following from command to force an agent to pull fresh configuration data from the workspace: _sudo -u omsagent python /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py_ 
It should return the following if it works properly:

>[2020/02/20 02:13:25] [4427] [INFO] [0] [/opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py:0] dsc_host lock file is acquired by : PerformRequiredConfigurationChecks
>
>Operation PerformRequiredConfigurationChecks completed successfully.
Operation was successful.



**IF THE RESULT DIFFERS FROM EXPECTED, PLEASE MOVE TO THE NEXT STEP.**

8. From a Linux command prompt issue the command: _/opt/microsoft/omsagent/bin/service_control stop_ followed by this one: _/opt/microsoft/omsagent/bin/service_control start_ 
   - The above two operations will stop and start the agent. This will force the agent to pull new configuration data from the workspace. Once the agent starts again go back through Steps **10 - 12** to see if appropriate counter information shows in the log indicating the agent knows to collect the data.

   - If you find the counter data showing in the step above go to the Portal and run the query found in Step **4** again and see you if the agent surfaces after a few minutes. Be patient it could take a few minutes to show. 
   - If it shows, this issue should be resolved, other machines with the same issue should be resolved by using the same steps here and if not then those machines are having a different problem.
9. If the issue still persists, please see your TA / EE for next steps. Inform the customer that you are reviewing with a teammate, but do not mention that they are your TA or EE (this is for a customer satisfaction standpoint so they maintain confidence)
   - Please be ready to detail what you have done up to this point, and that you have gone through this TSG.
   - Ensure that the Log Collector output is still available in DTM.
   - Make sure your case notes are up to date and complete. This will result in a quicker turnaround time to resolution.

