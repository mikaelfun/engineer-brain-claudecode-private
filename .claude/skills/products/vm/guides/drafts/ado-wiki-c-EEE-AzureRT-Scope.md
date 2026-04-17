---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/EEE Scope/EEE AzureRT_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FEEE%20Scope%2FEEE%20AzureRT_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags: [eee-azurert, escalation, icm, crp, disk-rp, pir, scope]
---

# [How It Works] EEE AzureRT — Scope & Escalation Guide

> Short link: https://aka.ms/EEEAzureRTScope

## What is AzureRT

AzureRT = Azure Runtime team (legacy name for **Compute Platform / CPlat**). Still appears in IcM team names like "Support/EEE AzureRT".

## How to Submit an IcM

- Always use **ASC** to submit IcMs. Only submit directly if ASC is unavailable.
- **Never bypass EEE for Sev 3–4 cases** (unless product is outside EEE scope).
- For **Sev 2 IcMs**: engage VCPE team.
- IcM process: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494892

## Support Scope (Sev 3–4 IcMs)

EEE AzureRT supports the **control plane operations** of:

| Component | Notes |
|-----------|-------|
| Compute Resource Provider (CRP) | |
| Disk Resource Provider (Disk RP) | |
| Platform Image Repository (PIR) | |
| VirtualMachineImages RP (Image Builder RP) | |
| Cloud Services Extended Support (CS ES) RP | Supported by Dev POD, not VM team |
| Red Dog Front End (RDFE) — Classic | Only for subscriptions on approved list; migration support available |

**Services whose control plane interacts with above components:**
- Virtual Machine, VMSS, Managed Disks, Snapshots, Disk Encryption Sets
- Azure Compute Gallery, Azure Image Builder, Managed Images (resource type only)
- Cloud Services (extended support), Availability Sets, Restore Point Collections
- Proximity Placement Groups, Capacity Reservation Groups, Host Groups

> ⚠️ EEE AzureRT does **NOT** support: underlying hardware, allocation/capacity, SRP, NRP, etc.

## Common Misroutes to AzureRT

| What you see | Correct team |
|--------------|--------------|
| Networking (NRP, NICs, VNets) | Cloudnet / EEE Cloudnet |
| Storage (SRP, Storage Accounts) | Support/EEE Storage |
| Direct Drive | Azure Direct Drive/Triage |
| Azure Disk Encryption | Azure Security Engineering/ADE |
| Capacity issues | WACAP/Incident Manager |
| AzSM/Fabric errors (NetworkingInternalOperationError, VMStartTimedOut, OutOfTimeBudgetException) | Support/EEE Compute Manager |
| RDOS/Physical hosts, Disk Performance/Latency | Support/EEE HostNode |
| VM Guest Agent, Provisioning Agent, Compute Extensions | Support/EEE GA/PA |
