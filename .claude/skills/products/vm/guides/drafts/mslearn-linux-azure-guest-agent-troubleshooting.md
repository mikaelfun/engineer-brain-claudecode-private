---
title: Azure Linux Guest Agent Troubleshooting Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-azure-guest-agent
product: vm
tags: [Linux-Agent, walinuxagent, WireServer, 168.63.129.16, extensions, Not-Ready]
21vApplicable: true
---

# Azure Linux Guest Agent Troubleshooting

## Overview
The Azure Linux Agent enables VM communication with the Fabric Controller via IP 168.63.129.16 (virtual public IP, should not be blocked).

## Diagnostic Steps

### 1. Check Agent Status and Version
- Verify version is still supported
- Service name: walinuxagent or waagent

### 2. Troubleshoot Not Ready Status
1. Check service: service walinuxagent status
2. If running: restart to resolve
3. If stopped: start, wait a few minutes, recheck
4. Verify auto-update: AutoUpdate.Enabled=y in /etc/waagent.conf
5. Test connectivity: curl http://168.63.129.16/?comp=versions
6. Check firewall allows outbound on ports 80, 443, 32526

### 3. WireServer Connectivity Issues
- Error: An error occurred while retrieving the goal state
- Check IPTables rules
- Check third-party firewall
- Check proxy configuration

## Key Log File
- /var/log/waagent.log

## VM Assist Tools
- Linux: https://aka.ms/vmassistlinux
- Windows: https://aka.ms/vmassistwindows
