---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/EEE Scope/EEE Host Node_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FEEE%20Scope%2FEEE%20Host%20Node_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags: [eee-hostnode, eee-rdos, hardware, host-os, onefleet, blobcache, direct-drive, live-migration, unexpected-reboot, escalation]
---

# [How It Works] EEE Host Node — Scope & Escalation Guide

> Short link: https://aka.ms/eeehostnodescope

## What is EEE Host Node (formerly EEE RDOS)

Azure Host Node = underlying server hosting Azure VMs and services. The "EEE Host Node" team (rebranding from "EEE RDOS") handles escalations for host node issues and improving support experience.

## How to Submit an IcM

- Always use **ASC** to submit IcMs. Submit directly only if ASC is unavailable.
- **Never bypass EEE for Sev 3–4 cases** (unless outside EEE scope).
- Sev 1–2: also follow the [escalation process](https://aka.ms/criprocess).
- **Do NOT file escalations for**: misrouted issues (see below), or RCA requests for obvious hardware issues (engineers can create RCAs themselves — see [Advanced workflow: ICM to EEE](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/496375)).

## Support Scope (Sev 3–4 IcMs)

| Component | Description |
|-----------|-------------|
| Hardware issues | CPU, memory, disk, mainboard, SoC device, FPGA |
| Host OS (RDOS) issues | Host OS modules, updates, host OS performance, hypervisor |
| OneFleet Node components | RdAgent (Host Agent), NodeService, VMAL, WVC, Live Migration (LM), VMPhu |
| Datapath components | Blobcache (ABC: PremiumDiskv1), Barbera, DirectDrive (ADD: PremiumDiskv2/UltraDisk), XDisk, DAL |
| VM Metric & ResourceHealth | GenevaAgent, MonitoringAgent, performance counters (host-collected) |
| Other host node components | PFAgent, host node updates, serial console (host node component) |

**Common scenarios:**
- Unexpected VM reboots caused by host node issues
- Performance degradation (CPU, disk IO) due to host node issues
- Live Migration failures related to host node
- False-positive / missing Resource Health events from host node issues
- Kyber notification issues from host node
- Missing shoebox metric data from host node

## Common Misroutes to EEE Host Node

| Issue | Correct team |
|-------|-------------|
| Guest OS issues (Windows/Linux) | Windows support team / Linux SME |
| Guest OS issues (3rd-party images) | Vendor providing the guest OS image |
| Application issues | Application's support team/developers |
| Storage Account service issues | EEE Storage team |
| VM network connectivity | Azure Networking Pod (ANP) first |
| Underlying network (TOR, backbone, host networking) | Cloudnet (engage ANP first) |
| Network component issues on SoC | Cloudnet (engage ANP first) |
| Service Healing (SH) issues | EEE Compute Manager |
| LM issues on triggering/allocation (control plane) | EEE Compute Manager |
