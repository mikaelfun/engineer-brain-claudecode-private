---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/Workflows/Custom Script Extension Workflow_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FWorkflows%2FCustom%20Script%20Extension%20Workflow_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Custom Script Extension (CSE) Workflow

Short URL: https://aka.ms/AGEX-CSE

## Summary
CSE downloads and executes scripts on Azure VMs. Useful for post-deployment configuration, software installation, or management tasks. Scripts can be downloaded from Azure storage or internet locations, or provided at runtime. Integrates with ARM templates, Azure CLI, PowerShell, Portal, and REST API.

## Prerequisite
Start with the Basic Agent/Extension workflow first: https://aka.ms/agexbasic

## Workflow Decision Tree

```
Start: Is Guest Agent ready?
  -> No: Refer to Guest Agent workflow
  -> Yes: Does customer need help installing CSE?
    -> Yes: Help install CSE
    -> No: Check ASC/logs for error message. Does error match a TSG?
      -> Yes: Follow TSG
      -> No: Manually check log files. Is Extension installing/enabling?
        -> No: Search for error in wiki
        -> Yes: Is script file downloading?
          -> No: Test download in guestOS, check network access
          -> Yes: Did script execute successfully?
            -> No: Does script work if run manually in guestOS?
              -> No: Customer needs to fix script
              -> Yes: Check for CSE limitations
            -> Yes: Working or customer claims unexpected results -> Check CSE limitations
```

## Log Files

### Windows
- Primary: `C:\WindowsAzure\Logs\Plugins\Microsoft.Compute.CustomScriptExtension\<version>\CommandScriptHandler.log`
- Guest Agent: `C:\WindowsAzure\Logs\WappAgent.log`

### Linux
- Primary: `/var/log/azure/custom-script/handler.log`
- Guest Agent: `/var/log/waagent.log`

## Common Failure Scenarios

### Script Download Failing
1. Test downloading file manually inside VM
2. Check network accessibility to remote location
3. If using Managed Identity: verify MI type, RBAC permissions to storage
4. If using SAS token: verify token not expired, regenerate if needed

### CSE on VMSS fails with 403
Portal-deployed CSE has no control over SAS token expiration. Use PowerShell/CLI/ARM template instead. Error: "Failed to download... (403) Forbidden... Make sure Authorization header is formed correctly"

### Script Timeout (90 min)
Script waiting for user input or running indefinitely. CSE shows as transitioning/failed. Customer must review/test script locally.

### Script Reboot Failure
Error: "Command execution finished, but failed because it returned a non-zero exit code of: '1'. Command execution may have been interrupted by a VM restart"
Check Guest OS system event log for restart events during CSE execution.

### System Account Context
- Windows: CSE runs as LocalSystem account
- Linux: CSE runs as root
- Test with PsExec: `psexec.exe -i -s powershell` then `whoami` to verify context
- If script works as normal user but fails as LocalSystem, customer needs to adapt script

## CSE Limitations
- Windows: https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/custom-script-windows#tips
- Linux: https://learn.microsoft.com/en-us/azure/virtual-machines/extensions/custom-script-linux#tips

## Debugging
- Debug guide: https://aka.ms/csedebug

## References
- Public docs: Windows CSE / Linux CSE
- How to install/uninstall CSE
- Managed Identity with CSE
- CSE Storage Account Failures
