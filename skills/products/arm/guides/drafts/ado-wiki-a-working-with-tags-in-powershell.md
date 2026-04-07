---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Working with tags in PowerShell"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FWorking%20with%20tags%20in%20PowerShell"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

This TSG demonstrates how to use PowerShell to manage tags efficiently, this is a quick guide for most common issues that are encountered, but you can always refer back to these documents for more information:

- [[LEARN] Use tags to organize your Azure resources and management hierarchy](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources)
- [[LEARN] How to tag a virtual machine in Azure using PowerShell](https://learn.microsoft.com/en-us/azure/virtual-machines/tag-powershell)
- [[LEARN] New-AzTag](https://learn.microsoft.com/en-us/powershell/module/az.resources/new-aztag?view=azps-5.7.0)

## Show all tags names that are not assigned to a resource
You can run the following command to get all tags that are not assigned to a specific resource in an Azure subscription:
``` powershell
Get-AzTag | where Count -EQ 0
``` 

## Delete all tags that are not assigned to a resource
This script will delete all unused tags in a subscription:
``` powershell
Get-AzTag | where Count -EQ 0 | forEach { Remove-AzTag -Name $_.name }
```

## Show all resource groups and resources that have a tag associated
Note this is an expensive command that takes a long time to execute - don't repeat it frequently since it may trigger request throttling
``` powershell
Get-AzTag | where Count -GT 0 | forEach {$tagname = $_.name; 
Get-AzResourceGroup | where { $_.tags.keys -eq $tagname} | select ResourceGroupName,ResourceId,Tags| ft -AutoSize;
Get-AzResource | where { $_.tags.keys -eq $tagname} | select Name,ResourceId,Tags|ft -AutoSize}
```
