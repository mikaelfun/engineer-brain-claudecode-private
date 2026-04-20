# AVD AVD on Azure Stack HCI - Quick Reference

**Entries**: 4 | **21V**: mixed
**Keywords**: agent, azure-arc, azure-stack-hci, conflict, deployment, himds, known-issue, session-host, unavailable, upgrade, vm-deployment, windows-activation
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | AVD on Azure Stack HCI: Session Host status shows as Unavailable | Azure Arc-enabled agent (himds service) is not installed or not running on the A... | 1) Run 'Get-Service himds' on VM to check Arc agent status; 2) If not installed:... | 🟢 8.0 | ADO Wiki |
| 2 📋 | AVD on Azure Stack HCI: Windows will not activate on session host VMs | Known issue with AVD on Azure Stack HCI as documented in the official known issu... | Refer customer to the Known Issues and Limitations section of the Azure Virtual ... | 🟢 8.0 | ADO Wiki |
| 3 📋 | AVD on Azure Stack HCI: Agent upgrade fails on session hosts | Not yet root caused; occurs occasionally on Azure Stack HCI session hosts | Troubleshoot failed agent update using standard agent troubleshooting steps. If ... | 🔵 7.0 | ADO Wiki |
| 4 📋 | Unable to deploy VM session hosts into AVD Host Pool through Azure Stack HCI, fa... | Azure Stack HCI deployment service bug causing conflict errors when adding new s... | PG deployed a hotfix to mitigate the issue. If still occurring, check for latest... | 🟡 5.5 | ADO Wiki |

## Quick Triage Path

1. Check: Azure Arc-enabled agent (himds service) is not installed or ... `[Source: ADO Wiki]`
2. Check: Known issue with AVD on Azure Stack HCI as documented in the... `[Source: ADO Wiki]`
3. Check: Not yet root caused; occurs occasionally on Azure Stack HCI ... `[Source: ADO Wiki]`
4. Check: Azure Stack HCI deployment service bug causing conflict erro... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-azure-stack-hci.md#troubleshooting-flow)