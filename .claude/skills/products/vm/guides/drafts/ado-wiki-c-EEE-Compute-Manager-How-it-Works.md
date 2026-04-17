---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/EEE Scope/EEE Compute Manager_How it Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FEEE%20Scope%2FEEE%20Compute%20Manager_How%20it%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags: [eee-compute-manager, azsm, fabric, tenant-management, allocation, service-healing, escalation]
---

# [How It Works] EEE Compute Manager — Scope & Escalation Guide

## What is Compute Manager

Compute Manager (= Azure Fabric) operates between Compute Resource Provider (CRP) and physical host nodes. Key components:
- **AzSM** (Availability Zone Service Manager)
- **Fabric** (Fabric Controller / FC)
- **AzPolicyEngine (AzPE)**
- **Holmes**

## How to Submit an IcM

- Always use **ASC** to submit IcMs. Never bypass EEE for Sev 3–4 cases.
- For **Sev 2 IcMs**: engage VCPE team.
- IcM process: https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/494892

## Support Scope (Sev 3–4 IcMs)

| Component | Examples |
|-----------|---------|
| AzSM (Availability Zone Service Manager) | |
| Fabric (Fabric Controller) | |
| Tenant Management | UpdateTenant, CreateTenant, DeleteTenant operations |
| Tenant/Container Allocation | Excluding capacity-related issues |
| Service Healing & Live Migration Control Plane | Triggers, workflows, failures |
| Planned Maintenance | |
| Scheduled Events | |
| AzPE (AzPolicyEngine) | |
| Holmes | |
| Allocator | Non-capacity allocation issues |
| Anvil | |

## Common Scenarios

- [OutofTimeBudgetException](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495454)
- [NetworkingInternalOperationError](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495442)
- [Fabric Failover](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495629)
- Allocator issues (non-Capacity)
- [Service Healing](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1666466)

## Common Misroutes to Compute Manager

| What you see | Correct team |
|--------------|--------------|
| Networking (NRP, NIC, VNets) | Cloudnet / EEE Cloudnet |
| Storage (SRP, Storage Accounts) | Support/EEE Storage |
| Direct Drive | Azure Direct Drive/Triage |
| Azure Disk Encryption | Azure Security Engineering/ADE |
| Capacity-related issues | WACAP/Incident Manager |
| RDOS/Physical hosts, Hardware failures, Unexpected VM reboots | Support/EEE HostNode |
| VM Guest Agent, Provisioning Agent, Compute Extensions | Support/EEE GA/PA |
| Compute Platform (CRP, Disk RP, PIR, Image Builder, CS ES) | Support/EEE AzureRT |
