---
source: ado-wiki
sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Manage Device/Using Az.StackEdge CMDlets"
sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FManage%20Device%2FUsing%20Az.StackEdge%20CMDlets"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary

When customers prefer to automate certain tasks with scripts and Azure Resource Manager (ARM) is not sufficient, use this guide to understand how to set up the Az.StackEdge module and use Az.StackEdge cmdlets.

## Steps

1. If not previously installed, install the Azure Az PowerShell module.

2. Connect to the Azure account the Azure Stack Edge was set up under:

   ```powershell
   Connect-AzAccount
   ```

3. Confirm the correct subscription is set, as the account may have multiple subscriptions:

   ```powershell
   Get-AzContext
   ```

   If the incorrect subscription is set, run the command:
   ```powershell
   Set-AzContext -Subscription "xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx"
   ```

4. Install the Az.StackEdge module:

   ```powershell
   Install-Module -Name Az.StackEdge
   ```

Az.StackEdge cmdlets can now be run.
