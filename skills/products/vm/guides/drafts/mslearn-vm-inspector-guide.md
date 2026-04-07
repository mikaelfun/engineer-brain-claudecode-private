# VM Inspector for Azure VMs (Preview)

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/vm-inspector-azure-virtual-machines

## Overview
Self-help diagnostic tool that collects logs/config from VM OS disk without needing VM access. Collects event logs, configurations, settings, registry keys via Compute Diagnostic resource provider.

## Supported OS
- Windows: Server 2008-2022, Windows 7-11
- Linux: CentOS, CoreOS, Debian, Flatcar, Azure Linux, OpenSUSE, Oracle, RHEL, SLES, Ubuntu

## Unsupported Scenarios
- Unmanaged OS disks
- Encrypted OS disks
- Ephemeral OS disks

## RBAC Requirements
- **First run**: Owner-level access (to grant Disk Backup Reader role)
- **Subsequent runs**: Virtual Machine Contributor (on VM) + Storage Account Contributor (on storage)

## How to Run
1. Portal > Virtual machines > Select VM > VM Inspector (Preview)
2. Select/create storage account
3. Consent to Disk Backup Reader role assignment
4. Run Inspector > Download report (.zip)

## Key Collected Files (Windows)
- Event logs: System, Application, Security, Setup, Azure-related
- Azure Agent: WaAppAgent.log, TransparentInstaller.log, Telemetry.log
- Extensions: Plugin logs, config, status
- OS Setup: Panther logs, Sysprep logs, unattend.xml
- Network: netlogon.log, NetSetup.LOG

## Key Collected Files (Linux)
- /var/log (syslog, messages, kern, auth, boot, azure/*)
- /var/lib/waagent (agent config, extension status)
- /var/lib/cloud, /run/cloud-init
- Network config: netplan, NetworkManager, sysconfig

## Common Errors
| Code | Issue | Fix |
|------|-------|-----|
| 403 | DiskInspectForbiddenError | Grant Disk Backup Reader role |
| 405 | EncryptedDiskNotSupported | Cannot use on encrypted disks |
| 405 | UnmanagedDiskNotSupported | Convert to managed disk |
| 405 | Ephemeral disk | Use alternative diagnostics |
| 500 | InternalServerError | Retry later |
