---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/Workflows/Basic Workflow_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FWorkflows%2FBasic%20Workflow_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AGEX Basic Workflow

Short URL: https://aka.ms/agexbasic

## Summary
This workflow helps troubleshoot scenarios where the customer reports VM Guest Agent (GA) failing or issues adding/removing/working with Azure VM Extensions.

## Scoping & Information Collection
Required information:
1. Clear issue description
2. Azure Subscription ID
3. VM or VMSS name
4. Resource Group Name or Deployment ID
5. Impacted time frame
6. Exact error message
7. When did the issue start?
8. Business Impact

Nice to have:
- Marketplace, gallery or custom image?
- Generalized or specialized image?
- OS version
- Any change done prior to issue?
- Workload/Software/Applications/Role

## Workflow Decision Tree

```
Start: Open ASC -> Check Insights -> Check LSIs
  -> VM Power State?
    -> Running: Check Guest Agent Status
      -> Not Ready/NA: Check GA services exist and running -> Guest Agent Workflow
      -> Ready: Check if issue is with GA or Extension
        -> Guest Agent: Guest Agent Workflow
        -> Extension: Check extension tab in ASC -> Extension Workflow
    -> Deallocated: Have customer start VM -> Re-check
```

## Check Insights
Open ASC and check for any Insights. If relevant Insights exist, apply mitigation. If none or mitigation fails, continue.

## Check LSIs
Check ASC Resource Explorer -> Health Tab for:
- VM Availability Impacts
- Disk Availability Impacts
- Outages

## Check Guest Agent Status
1. VM must be started (can't check GA status when stopped/deallocated)
2. Check if VM state is Failed or Converged in ASC
3. If Seeking/Failed: Check CRP VM Status for details
4. If Converged: Check Guest Agent Status and Guest Agent Message

### Windows
- RDP to VM -> Services (services.msc) -> Check RDAGENT and WINDOWS AZURE GUEST AGENT
- If services don't exist or C:\WindowsAzure folder missing -> manually install GA
- If services stopped -> start them, wait 5-10 min, re-check
- Check Task Manager for WaAppAgent.exe and WindowsAzureGuestAgent.exe

### Linux
- SSH to VM
- Ubuntu: `systemctl status walinuxagent.service`
- Red Hat/SUSE: `systemctl status waagent.service`
- If service missing -> install GA
- If stopped -> start it, wait 5-10 min, re-check

## Check Extension Status
- If extension not owned by Microsoft -> set expectations, customer should engage 3rd party
- If install/uninstall issue -> in scope to troubleshoot
- If not "Provisioning Succeeded" and "Ready" -> Extensions Advanced TSG
- If all Ready -> feature issue, check extension owner
