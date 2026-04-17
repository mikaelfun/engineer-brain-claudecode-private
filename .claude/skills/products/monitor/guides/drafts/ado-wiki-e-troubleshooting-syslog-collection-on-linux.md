---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Agent Configurations/Troubleshooting Guides/Troubleshooting Syslog Collection on Linux"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Agent%20Configurations/Troubleshooting%20Guides/Troubleshooting%20Syslog%20Collection%20on%20Linux"
importDate: "2026-04-05"
type: troubleshooting-guide
note: "This page is being replaced by an updated version at page ID 605695. Content is about legacy OMS Agent, not AMA."
---

## this article is being replaced by an updated version 
https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605695/Troubleshooting-Syslog-collection-on-Linux

this page will be removed in future.

This is a troubleshooting workflow that you can start with whenever you investigate issues related to the topic "Syslog is not collected by OMS Agent or Syslog does not arrive in the workspace".

# Prerequisites

[Syslog in Azure Monitor documentation](https://docs.microsoft.com/azure/azure-monitor/agents/data-sources-syslog)

# Data Flow

![image.png](/.attachments/image-c9b57c64-2573-4833-b7c1-ecee8ca9bad7.png)

# Log collection for ICM

Run the [OMS Agent Troubleshooter](https://docs.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot?WT.mc_id=Portal-Microsoft_Azure_Support#log-analytics-troubleshooting-tool) with the option L (for log collection)

![image.png](/.attachments/image-5535ef64-88b9-4f05-bbe3-56de59da55f5.png)

# Scenario 1: Syslog does not appear in Log Analytics 

1. We should always make sure that the VM is sending Heartbeat to the workspace.

```bash
Heartbeat
| where Computer contains "server_name" or ResourceId contains "server_name"
| limit 10
```

2. Check the workspace configuration and make sure the desired categories are checked

[Azure Portal steps here](https://docs.microsoft.com/azure/azure-monitor/agents/data-sources-syslog#configure-syslog-in-the-azure-portal) and [PowerShell steps here at point 9](https://docs.microsoft.com/azure/azure-monitor/logs/powershell-workspace-configuration#create-workspace-and-configure-data-sources)

``` powershell
New-AzOperationalInsightsLinuxSyslogDataSource -ResourceGroupName $ResourceGroup -WorkspaceName $WorkspaceName -Facility "kern" -CollectEmergency -CollectAlert -CollectCritical -CollectError -CollectWarning -Name "Example kernel syslog collection"

Enable-AzOperationalInsightsLinuxSyslogCollection -ResourceGroupName $ResourceGroup -WorkspaceName $WorkspaceName
```

3. Force the agent to download the latest DSC configuration from the workspace and apply it on the VM.

```bash
su - omsagent -c /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py
```

4. Make sure you see a message like the one below in /etc/rsyslog.d/95-omsagent.conf or /etc/syslog-ng/syslog-ng.conf, depending on the syslog type that the customer is using.

_OMS Syslog collection for workspace <workspaceID>_

Example from a CentOS system:

```bash
cat /etc/rsyslog.d/95-omsagent.conf
```

5. Go through the publicly documented troubleshooting scenarios -> [My forwarded Syslog messages are not showing up!](https://github.com/microsoft/OMS-Agent-for-Linux/blob/c70c78664062626c5cecef0e3f84a24aa95ff5ca/docs/Troubleshooting.md#my-forwarded-syslog-messages-are-not-showing-up)

6. Check this Wiki TSG -> [Syslogs are dropped during ingestion](/Agents/OMS-Agent-for-Linux-\(omsagent\)/Known-Issues/Syslogs-are-dropped-during-ingestion)

7. Run the [OMS Agent Troubleshooter](https://docs.microsoft.com/azure/azure-monitor/agents/agent-linux-troubleshoot?WT.mc_id=Portal-Microsoft_Azure_Support#log-analytics-troubleshooting-tool) and go through scenario number 3 to see if it provides any insights into the problem.

8. Check if there is any evidence of log being processed in our OMS Agent log

```bash
cat /var/opt/microsoft/omsagent/log/omsagent.log | grep -i "syslog"
```

9. Check the content of /etc/opt/microsoft/omsagent/conf/omsagent.d/syslog.conf and make sure you see the correct port for Syslog and the correct IP address for the Syslog source (ex: localhost)

```bash
cat /etc/opt/microsoft/omsagent/conf/omsagent.d/syslog.conf
```

# Additional resources
- [Basic Syslog troubleshooting VIDEO recording](https://msit.microsoftstream.com/video/b07b0840-98dc-981d-40f9-f1ec01b10044)
