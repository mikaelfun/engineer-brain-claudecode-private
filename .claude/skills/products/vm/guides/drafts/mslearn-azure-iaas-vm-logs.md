---
title: Azure IaaS VM Log Collection Reference
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/iaas-logs
product: vm
21vApplicable: true
---

# Azure IaaS VM Log Collection Reference

Microsoft Support collects these files (with consent) from Azure IaaS VMs during troubleshooting.

## Windows VM Key Log Locations

### Azure Guest Agent
- /WindowsAzure/Logs/WaAppAgent.log
- /WindowsAzure/Logs/TransparentInstaller.log
- /WindowsAzure/Logs/Telemetry.log
- /WindowsAzure/Logs/MonitoringAgent.log
- /WindowsAzure/Logs/AppAgentRuntime.log
- /WindowsAzure/config/*.xml

### VM Extensions
- /Packages/Plugins/*/*/config.txt
- /Packages/Plugins/*/*/Status/*.status
- /WindowsAzure/Logs/Plugins/*/*/CommandExecution.log
- /WindowsAzure/Logs/Plugins/*/*/Install.log

### Diagnostics Extension (IaaSDiagnostics)
- /Packages/Plugins/Microsoft.Azure.Diagnostics.IaaSDiagnostics/*/*.config
- /WindowsAzure/Logs/Plugins/Microsoft.Azure.Diagnostics.IaaSDiagnostics/*/DiagnosticsPlugin.log

### Windows OS Logs
- /Windows/System32/winevt/Logs/System.evtx
- /Windows/System32/winevt/Logs/Application.evtx
- /Windows/System32/winevt/Logs/Security.evtx
- /Windows/debug/netlogon.log
- /Windows/Panther/setupact.log

### RDP/Terminal Services
- Microsoft-Windows-TerminalServices-LocalSessionManager%4Operational.evtx
- Microsoft-Windows-RemoteDesktopServices-RdpCoreTS%4Admin.evtx

### Sysprep
- /Windows/System32/Sysprep/Panther/setupact.log

## Linux VM Key Log Locations
- /boot/grub*/grub.c*
- /etc/network/interfaces
- /var/log/cloud-init*
- /var/log/syslog*
- /var/log/kern*
- /var/log/waagent*

## FreeBSD VM Key Log Locations
- /etc/rc.conf
- /etc/waagent.conf
- /var/lib/waagent/*.xml
- /var/log/azure/*/*
