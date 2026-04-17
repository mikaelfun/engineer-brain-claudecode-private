---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/iaas-logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure IaaS VM Logs — 日志收集参考

Microsoft Support 在排查 Azure IaaS VM 问题时，经客户同意会收集以下日志文件。

## Windows IaaS VM 日志

### Azure Guest Agent 日志
- `/WindowsAzure/Logs/WaAppAgent.log`
- `/WindowsAzure/Logs/TransparentInstaller.log`
- `/WindowsAzure/Logs/Telemetry.log`
- `/WindowsAzure/Logs/MonitoringAgent.log`
- `/WindowsAzure/Logs/AppAgentRuntime.log`
- `/WindowsAzure/Logs/AggregateStatus/aggregatestatus*.json`
- `/WindowsAzure/config/*.xml`

### VM Extension 日志
- `/Packages/Plugins/*/*/config.txt`
- `/Packages/Plugins/*/*/HandlerEnvironment.json`
- `/Packages/Plugins/*/*/Status/*.status`
- `/WindowsAzure/Logs/Plugins/*/*/CommandExecution.log`
- `/WindowsAzure/Logs/Plugins/*/*/Install.log`

### Windows 系统日志
- `/Windows/System32/winevt/Logs/System.evtx`
- `/Windows/System32/winevt/Logs/Application.evtx`
- `/Windows/System32/winevt/Logs/Security.evtx`
- `/Windows/System32/winevt/Logs/Setup.evtx`
- `/Windows/debug/netlogon.log`
- `/Windows/debug/NetSetup.LOG`
- `/Windows/Panther/setupact.log`
- `/Windows/Setup/State/state.ini`

### RDP 相关日志
- `Microsoft-Windows-TerminalServices-LocalSessionManager%4*.evtx`
- `Microsoft-Windows-TerminalServices-RemoteConnectionManager%4*.evtx`
- `Microsoft-Windows-RemoteDesktopServices-RdpCoreTS%4*.evtx`

### 网络相关日志
- `Microsoft-Windows-TCPIP%4Operational.evtx`
- `Microsoft-Windows-NetworkProfile%4Operational.evtx`
- `Microsoft-Windows-NlaSvc%4Operational.evtx`
- `Microsoft-Windows-Windows Firewall With Advanced Security%4Firewall.evtx`

### 注册表
- `/Windows/System32/config/SOFTWARE`
- `/Windows/System32/config/SYSTEM`

## Linux IaaS VM 日志

- `/var/log/cloud-init*`
- `/var/log/syslog*` / `/var/log/messages*`
- `/var/log/kern*`
- `/var/log/waagent*`
- `/var/log/azure/*/*`
- `/etc/network/interfaces`
- `/etc/sysconfig/network-scripts/ifcfg-eth*`
- `/boot/grub*/grub.c*`

## FreeBSD VM 日志

- `/etc/rc.conf`
- `/etc/waagent.conf`
- `/var/lib/waagent/*.xml`
- `/var/log/auth*`
- `/var/log/waagent*`
