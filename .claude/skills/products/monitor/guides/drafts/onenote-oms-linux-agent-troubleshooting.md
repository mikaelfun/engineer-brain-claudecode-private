# OMS Linux Agent Troubleshooting

## Overview
OMS agent on Linux is open source (GitHub). This guide covers common troubleshooting steps and log collection.

## Common Restart/Repair Steps
```bash
# Restart OMS agent service
sudo sh /opt/microsoft/omsagent/bin/service_control restart

# Restart OMI service
sudo sh /opt/omi/bin/service_control restart

# Force configuration update
sudo su omsagent -c 'python /opt/microsoft/omsconfig/Scripts/PerformRequiredConfigurationChecks.py'
```

## Log Collection
Use the OMS Linux Agent Log Collector:
- GitHub: https://github.com/Microsoft/OMS-Agent-for-Linux/blob/master/tools/LogCollector/OMS_Linux_Agent_Log_Collector.md

## References
- Agent source & detailed troubleshooting: https://github.com/Microsoft/OMS-Agent-for-Linux/blob/master/docs/OMS-Agent-for-Linux.md
- Official docs: https://docs.microsoft.com/en-us/azure/azure-monitor/platform/agent-linux-troubleshoot
- Container troubleshooting: https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-troubleshoot

## Source
- OneNote: Mooncake POD Support Notebook / MONITOR / Log Analytics / Troubleshooting / Linux Agent
