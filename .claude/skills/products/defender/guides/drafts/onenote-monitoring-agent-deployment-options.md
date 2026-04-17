# Monitoring Agent (MMA/OMS) Deployment Options

> Source: OneNote — OMS Agent / Monitoring Agent Deployment Options
> Quality: draft | Needs: review, note MMA retirement impact

## Deployment Methods Comparison

| # | Method | Advantages | Disadvantages |
|---|--------|-----------|---------------|
| 1 | **ASC auto-provisioning** | Auto-install runs every ~15min; discovers new & existing VMs; can create default workspace or use existing | Does not work with VMSS; no VM exclusion support (keeps retrying install) |
| 2 | **Manual installation** (connect VM to workspace) | Instant deployment; full control over which VMs to onboard/exclude | No scalability; no auto-discovery; does not work with VMSS |
| 3 | **Azure Policy** | Auto-discovery; quick provisioning (policy eval ~30min); supports VMSS | Policy evaluation delay for compliance visibility |
| 4 | **ARM template** | Automated; VMs protected from creation time; CI/CD integration | Requires ARM template expertise |

## Direct Agent Install

Download and install MSI/EXE file. Can leverage deployment tools such as System Center Configuration Manager or other scripted methods.

## Log Analytics Agent Extension

- Extension installs the Log Analytics agent on Azure VMs and enrolls them into an existing workspace
- Extension auto-updates to latest agent version
- PowerShell scripts available: [GitHub - Azure Security Center](https://github.com/Azure/Azure-Security-Center/blob/master/Secure%20Score/Install%20monitoring%20agent%20on%20your%20machines/PowerShell/Install-MMA-VMExtension.ps1)

## Note

> MMA/OMS Agent is being retired. For new deployments, consider Azure Monitor Agent (AMA). See MMA retirement migration guide for details.
