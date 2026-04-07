---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/How To: AipService/How To: AIP Service PS Commands"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20AIP%20Service%20PS%20Commands"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction
This is a place for sharing various PowerShell commands with the `AipService` module.

For informationa about installing and connecting the the AipService module see [this table](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/11330/How-To-Connect-to-Services).

# AipService

## Templates

|  | Command | Description |
|--|--|--|
| **Templates** |  |  |
|  | `(Get-AipServiceConfiguration).templates` | Lists basic template information |
|  | `(Get-AipServiceConfiguration).templates \| Sort-Object -Property IsPublished` | Template info sorted by Status |
| Publish a template | `Set-AipServiceTemplateProperty -TemplateID *guid* -Status Published` | [Set-AipServiceTemplateProperty](https://learn.microsoft.com/en-us/powershell/module/aipservice/Set-AipServiceTemplateProperty?view=azureipps#example-1-update-a-templates-status) |
| **Get template scopes** | | |
| cmd 1 | `$templates = Get-AipServiceTemplate` | Sets a variable of all the templates |
| cmd 2 | `foreach ($template in $templates) {Get-AipServiceTemplateProperty -TemplateId $template.TemplateId -Name -ScopedIdentities -Status \| fl}`| Provides some details of each template including scope. |
| **List all names or descriptions of a specific template** | | |
| cmd 1 | `(Get-AipServiceConfiguration).Templates` | Gets the list of template names and IDs. |
| cmd 2 | `(Get-AipServiceTemplate -TemplateId 7f99d214-ac02-4ad9-af37-66ef614c5c37) \| Select -ExpandProperty Names` | Displays all the names/locales for the specified template. |
| cmd 3 | `(Get-AipServiceTemplate -TemplateId 7f99d214-ac02-4ad9-af37-66ef614c5c37) \| Select -ExpandProperty Descriptions` | Displays all the descriptions/locales for the specified template. |
