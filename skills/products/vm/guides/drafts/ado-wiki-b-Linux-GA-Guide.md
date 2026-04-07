---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/How Tos/GA/Linux GA Guide_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FHow%20Tos%2FGA%2FLinux%20GA%20Guide_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Linux Guest Agent (WALinuxAgent) Guide

## Summary

The Azure Linux Agent (WALinuxAgent/WALA) is managed as an open source project under the Azure GitHub organization, written in Python. It handles provisioning, networking tasks, and interaction with the Azure platform.

- GitHub: https://github.com/Azure/WALinuxAgent/
- Releases: https://github.com/Azure/WALinuxAgent/releases

## Version History

- 2.0.x: Original single Python script
- 2.1.x: Major rewrite in April 2016, multiple classes, closer parity with Windows agent

## Update Distribution Model

Microsoft provides the source to Linux distribution vendors (Canonical, Red Hat, SUSE, etc.). Vendors review, test, and incorporate new versions into their distro update repositories. Linux VMs receive updates through their normal software update process.

Note: The AutoUpdate feature of the Linux agent does not follow this channel.

## Check Agent Version

```bash
waagent --version
```

Output example:
```
WALinuxAgent-2.2.32.2 running on ubuntu 18.04
Python: 3.6.8
Goal state agent: 2.2.45
```

## Release Process

New versions appear on GitHub releases page as "Pre-release" during deployment. Deployment usually takes a couple of weeks to reach all regions; once complete, it shows as the latest release.

## Troubleshooting Outdated Agent

1. Check current version with `waagent --version`
2. Search GitHub issues: https://github.com/Azure/WALinuxAgent/issues
3. If a matching issue is resolved, identify which release contains the fix
4. Update guide: https://docs.microsoft.com/en-us/azure/virtual-machines/linux/update-agent

## Documentation

- Linux Agent Guide: https://docs.microsoft.com/en-us/azure/virtual-machines/extensions/agent-linux
- Supported Linux Distributions: https://docs.microsoft.com/en-us/azure/virtual-machines/linux/endorsed-distros
- Extension interaction with Linux agent: https://github.com/Azure/azure-linux-extensions/blob/master/docs/overview.md
- How to update: https://docs.microsoft.com/en-us/azure/virtual-machines/linux/update-agent

## Root Cause Path (MSSOLVE)

Compute > Virtual Machines > Administration > HowTo:General Linux Administration
