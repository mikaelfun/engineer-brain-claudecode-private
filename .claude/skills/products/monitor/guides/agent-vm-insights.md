# Monitor VM Insights 与 Dependency Agent

**Entries**: 9 | **21V**: ALL | **Sources**: 1
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | VM Insights Map page does not display expected data or VMBoundPort/VMComputer... | Customer's OS or Linux kernel version is not supported by Dependency Agent. W... | 1) Check supported OS and kernel versions at https://learn.microsoft.com/azur... | 8.5 | ADO Wiki |
| 2 | VM Insights Map feature not working after migrating from Log Analytics Agent ... | The {"enableAMA":"true"} property is not set in Dependency Agent configuratio... | 1) Check DA settings via ARG query to list VMs with DA installed and inspect ... | 8.5 | ADO Wiki |
| 3 | VM Guest Health Extension (GuestHealthLinuxAgent/GuestHealthWindowsAgent) sti... | VM Guest Health extension was retired on November 30th 2022 but was not autom... | Use PowerShell to force remove: Remove-AzResource -ResourceId "/subscriptions... | 8.5 | ADO Wiki |
| 4 | Dependency Agent on Linux shows error BSERR_BLUECHANNEL_LOAD_FAIL - Dependenc... | Dependency Agent kernel modules are not cryptographically signed and the Linu... | Known limitation - Dependency Agent will not work when this error is present.... | 8.5 | ADO Wiki |
| 5 | Dependency Agent on Linux shows error BSERR_DRIVER_LOAD_FAIL - kernel module ... | The Dependency Agent kernel module cannot allocate sufficient memory on the L... | Machine needs more memory to support the Dependency Agent. Customer should in... | 8.5 | ADO Wiki |
| 6 | Dependency Agent on Linux shows error BSERR_KERNEL_VERSION_UNSUPPORTED - kern... | The Linux kernel version is not in the list of supported kernel versions for ... | Dependency Agent will run in degraded mode on supported OS but unsupported ke... | 8.5 | ADO Wiki |
| 7 | Auto Extension Upgrade for Dependency Agent fails with VMAgentStatusCommunica... | VM Agent cannot communicate to external servers outside the VM to download th... | 1) Verify VM has outbound internet connectivity to Azure extension download e... | 8.5 | ADO Wiki |
| 8 | Auto Extension Upgrade for Dependency Agent fails with VMExtensionProvisionin... | Extension provisioning failed during the auto-upgrade process. The specific f... | 1) Check error message for which extension is causing the issue 2) Investigat... | 8.5 | ADO Wiki |
| 9 | VM Insights Map not working after MMA to AMA migration - no data in Map tab d... | enableAMA:true property not set in Dependency Agent config. DA needs this fla... | 1) Check DA settings via ARG query or Portal JSON View or Azure CLI 2) If ena... | 8.5 | ADO Wiki |
