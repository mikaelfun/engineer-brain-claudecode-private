---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/Extension/Best Practices for Managing extensions enabled Parameter on Azure Linux VMs_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FExtension%2FBest%20Practices%20for%20Managing%20extensions%20enabled%20Parameter%20on%20Azure%20Linux%20VMs_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Best Practices for Managing `extensions.enabled` Parameter on Azure Linux VMs

## Summary

Best Practices for Managing `extensions.enabled` Parameter on Azure Linux VMs and Implications of Disabling the Parameter `Extensions.Enabled=n` in `/etc/waagent.conf` in Linux VMs.

## Note

Microsoft generally does not recommend disabling the `Extensions.Enabled` parameter on Azure VMs as it prevents the deployment of extensions on the VM, which can impact Azure services. However, if you are certain that you won't need extensions in the future, you can leave the agent installed and disable the extensions.

## What Happens if We Disable `Extensions.Enabled=n` in `/etc/waagent.conf` in Azure Linux VMs

Below are some Azure services that will add their respective extensions on the VM if the guest agent is installed and running:

1. Reset password
2. Run command/PowerShell script execution
3. Executing custom scripts
4. Encryption/decryption
5. Running performance diagnostics when required
6. Backup operations on the VM
7. Creating snapshots
8. Services like monitoring, security, site replication, and others
9. Provisioning new VMs using this VM image may not be possible.

## Observations

1. Password reset and performance diagnostics are operational as long as the related extensions are present on the VM, even after the extension has been disabled. However, if all extensions are deleted from the VM blade before disabling extensions, the VM will not allow password resets or the running of performance diagnostics.

2. Some services like creating snapshots and backup operations continue to work fine regardless of the status of the extensions.

3. Adding and deleting other extensions may fail on the VM.

## FAQs

1. **Will the VMs be covered in SLA irrespective of the extensions?**
   - Yes, they will be covered in SLA irrespective of the extensions.

2. **Will the serial console still work?**
   - Yes, the serial console will work fine as it does not provision any extension on the VM.

3. **Will backup services and key vault services work or not?**
   - Yes, they will work.

## Reference

- https://learn.microsoft.com/en-us/azure/virtual-machines/linux/disable-provisioning
- https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/overview
- https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-azure-guest-agent
- https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/agent-linux
