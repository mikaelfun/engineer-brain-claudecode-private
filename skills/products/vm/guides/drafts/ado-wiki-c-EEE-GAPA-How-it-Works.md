---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/EEE Scope/EEE GAPA_How it Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FEEE%20Scope%2FEEE%20GAPA_How%20it%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags: [eee-gapa, guest-agent, provisioning-agent, vm-extensions, cse, run-command, vmaccess, proxy-agent, hibernation, escalation]
---

# [How It Works] EEE GA/PA — Scope & Escalation Guide

## What is EEE GA/PA

GA/PA = Guest Agent / Provisioning Agent. The EEE GA/PA team supports VM Guest Agent, VM Provisioning Agent, and various Compute VM extensions.

## How to Submit an IcM

- Always use **ASC** to submit IcMs. Only submit directly if ASC is unavailable.
- **Never bypass EEE for Sev 3–4 cases.**
- IcM process: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494892

## Support Scope (Sev 3–4 IcMs — Windows & Linux)

| Agent / Extension | Publisher + Type | Notes / TSG |
|-------------------|-----------------|-------------|
| **VM Guest Agent** | NA | Enables VM extensions. [Internal workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495022) |
| **VM Provisioning Agent** | NA | Provisions Guest OS on deploy. [Internal workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495735) |
| **Custom Script Extension** | Microsoft.Azure.Extensions.CustomScript / Microsoft.Compute.CustomScriptExtension / Microsoft.OSTCExtensions.CustomScript / ForLinux | [Internal workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494962) |
| **Action Run Command v1** | Microsoft.CPlat.Core.RunCommandLinux / Windows | [Internal workflow](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494969) |
| **Managed Run Command v2** | Microsoft.CPlat.Core.RunCommandHandlerLinux / Windows | Same as v1 workflow |
| **BgInfo** | Microsoft.Compute.BgInfo | [Install BgInfo](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494963) |
| **JsonADDomainExtension** | Microsoft.Compute.JsonADDomainExtension | [Internal TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494993) |
| **VM Application Manager** | Microsoft.CPlat.Core.VMApplicationManagerLinux / Windows | Used by VM Applications feature |
| **VM Access** | Microsoft.Compute.VMAccessAgent / Microsoft.OSTCExtensions.VMAccessForLinux | [Internal TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494971) |
| **Proxy Agent** | Microsoft.CPlat.ProxyAgent.ProxyAgentLinux / LinuxARM64 / Windows | Metadata Security Protocol. [Internal TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1741379) |
| **Hibernation Extension** | Microsoft.CPlat.Core.LinuxHibernateExtension / WindowsHibernateExtension | [TSG](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/781060) |
| **RDP** | Microsoft.Windows.Azure.Extensions.RDP | Only on PaaS Cloud Services (ES) |

For extensions NOT on this list → check [extension escalation table](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495023) or https://aka.ms/vmextensionspublishers

## Common Misroutes to EEE GA/PA

| What you see | Correct team |
|--------------|--------------|
| Networking (NRP, NICs, VNets) | Cloudnet / EEE Cloudnet |
| Storage (SRP, Storage Accounts) | Support/EEE Storage |
| Azure Disk Encryption | Azure Security Engineering/ADE |
| AzSM/Fabric errors (NetworkingInternalOperationError, VMStartTimedOut, OutOfTimeBudgetException) | Support/EEE Compute Manager |
| RDOS/Physical hosts, Disk Performance/Latency | Support/EEE RDOS |
| Compute Platform (CRP, Disk RP, PIR, Image Builder, CS ES) | Support/EEE AzureRT |
