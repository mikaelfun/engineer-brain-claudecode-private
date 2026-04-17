# Monitoring Agent Deployment Options

> Source: OneNote - OMS Agent / Monitoring Agent Deployment Options
> Status: draft

## Deployment Methods Comparison

| # | Method | Advantage | Disadvantage |
|---|--------|-----------|--------------|
| 1 | **ASC auto-provisioning** | Runs every ~15min, auto-discovers new/existing VMs, can create default workspace or use existing | No VMSS support, no VM exclusion |
| 2 | **Manual installation** (connect VM to workspace) | Immediate deployment, VM exclusion flexibility | No scalability, no auto-discovery, no VMSS |
| 3 | **Azure Policy** | Auto-discovery, quick provisioning (eval every 30min), supports VMSS | Policy evaluation delay |
| 4 | **ARM template** | Automated, VMs protected from creation, CI/CD integration | Requires ARM template expertise |

## Direct Agent Installation
- Download and install MSI/EXE file
- Can leverage SCCM or scripted deployment

## Log Analytics Agent Extension
- Extension installs agent on Azure VMs and enrolls in existing workspace
- Auto-updated to latest version
- PowerShell scripts available at Azure Security Center GitHub repo
