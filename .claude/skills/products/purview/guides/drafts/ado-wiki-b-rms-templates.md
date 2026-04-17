---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/Learn: AipSerivce/Learn: RMS Templates"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FLearn%3A%20AipSerivce%2FLearn%3A%20RMS%20Templates"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# What is an RMS Template?

RMS templates are XML based files and contain information about who can consume RMS protected files, the rights granted, expiration of end use license, content expiration, as well as the name of the template and a description. In addition, the template contains information about the TPD used (Key ID).

# What is not an RMS template?
There are two protection options that look like RMS templates but are not. 

`Do Not Forward` (DNF) and `Encrypt Only` (EO) are built-in protection options. These are part of Exchange Online and Outlook desktop. These act like templates but do not exist in the AIP service. 

## GUIDs
All RMS templates have a GUID. DNF and EO have their equivalent of a template ID.
 - Do Not Forward: CF5CF348-A8D7-40D5-91EF-A600B88A395D
 - Encrypt Only: C026002D-CDA6-401E-BFAD-28DE214D0FBA

## Permissions 
[Do Not Forward](https://learn.microsoft.com/en-us/purview/rights-management-usage-rights#do-not-forward-option-for-emails) grants the `Edit Content, Edit, Save, View, Open, Read, and Allow Macros` usage rights.

[Encrypt Only](https://learn.microsoft.com/en-us/purview/rights-management-usage-rights#encrypt-only-option-for-emails) grants all rights except for `Save As, Export and Full Control`.

# How to manage Azure RMS templates
Permissions on a template associated with a MIP labels may be managed using the Purview Portal.

Templates without an associated label may be managed via the AipService PowerShell (PS) module.

**Common commands:**
| CMDLET | Purpose |
|--|--|
| [Get-AipServiceTemplate](https://learn.microsoft.com/en-us/powershell/module/aipservice/get-aipservicetemplate?view=azureipps) | Get list of AIPService templates |
| [Set-AipServiceTemplateProperty](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicetemplateproperty?view=azureipps)  | Change template property, such as status, Rights, ScopedIdentities etc. |
| [Export-AipServiceTemplate](https://learn.microsoft.com/en-us/powershell/module/aipservice/export-aipservicetemplate?view=azureipps) | Export a template |
| [Import-AipServiceTemplate](https://learn.microsoft.com/en-us/powershell/module/aipservice/import-aipservicetemplate?view=azureipps) | Import a template |

# FAQ
## May a lone tempate be converted to a label?
In the old AIP portal (Azure) RMS tempates could be converted to labels, in a GUI. Now this may be accomplished via PowerShell, with the [New-Label](https://learn.microsoft.com/en-us/powershell/module/exchange/new-label?view=exchange-ps) cmdlet.

**Example**
`New-Label -Name 'SomeAIPLabelName' -Tooltip 'SomeAIPLabelToolTip' -Comment 'SomeNotes' -DisplayName 'SomeDisplyName' -EncryptionEnabled $true -EncryptionProtectionType 'template' -EncryptionTemplateId 'ed0c8520-1d8d-447a-94c1-ec7332281b77'`

For the `EncryptionTemplateId` value, use the template ID of the template to be converted. In this example the value is `ed0c8520-1d8d-447a-94c1-ec7332281b77`.

Reference:
[Label migration](https://learn.microsoft.com/en-us/enterprise-mobility-security/solutions/ems-aip-premium-govt-service-description#label-migration) 

## What are the template properties all about?

Running `Get-AipServiceTemplate | fl *` diplays the AADRM templates and all the properties of those template. 

But what are the template properties all about?

| **Properties**  | **Explained** |
|--|--|
| TemplateId | Tenant unique ID of the template |
| Names | Names with different translations, notation [language code] -> name |
| Descriptions | Descriptions different translations, notation [language code] -> descr. |
| Status | Either “Published” (available for users to protect) or “Archived” (unavailable for users, can be used for consumption of protected content) |
| RightsDefinitions | Right granted to users or groups for file consumption |
| ContentExpirationDate | Specifies the date on which content protected with the template expires. Need  ContentExpirationOption = OnDate |
| ContentValidityDuration | pecifies the number of days from the first day of protection after which content protected with the template expires. Need ContentExpirationOption =  AfterDays |
| ContentExpirationOption | OnDate for ContentExpirationDate, AfterDays for  ContentValidityDuration or Never (will never expire) |
| LicenseValidityDuration | Defines use license expiration (how many days can the document consumed offline after first consumption) |
| ReadOnly | Template cannot be changed |
| LastModifiedTimeStamp | Last time the template was changed |
| ScopedIdentities | Who will be able to download and use the template. {} means all user, otherwise the group or users mentioned. |
| EnableInLegacyApps | For legacy apps, which cannot deal with policy scopes, such as FCI. False, template will not be available, True, template will be available (scope will get ignored). |
| LabelId | LabelId of the associated label. It might still show label ID of deleted label. 
| DoubleKeyEncryptionUrl | DKE URL |
| ConditionalAccessAuthContext | <To be checked> |

Please see [Set-AipServiceTemplateProperty](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicetemplateproperty?view=azureipps)

## How do I publish or archive an RMS template?
When an RMS template is published, it is advertised to users. Applicaitons/labels may apply protections via the template.

An archived template is not advertised to users. It may not be applied to new content. However, any content encrypted using that template may use the tempalte for consumption.

Please see [Set-AipServiceTemplateProperty](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicetemplateproperty?view=azureipps)

### Publish a temaplate
`PS C:\>Set-AipServiceTemplateProperty -TemplateID <template GUID> -Status Published`

### Archive a template
`PS C:\>Set-AipServiceTemplateProperty -TemplateID <template GUID> -Status Archived`
## Can I consume a document after the template got deleted?

Yes and no. Most applications stamp a publishing license in the protected file. Using this publishing license, the document can be still consumed. 

Also, SuperUsers and protection owners (the person who protected the file) can always consume the document, if the TPD used by the environment is available.

However, we recommend not to delete templates. Instead, archive templates which should not be used to protect content. With this, you can still consume documents, and re-enable a template, and modify a template if needed.

## If I delete a label, what will happen to the template?

The template will remain in AADRM, but the status will change to archived. 
This is mainly to ensure that users can still consume content protected by this template.
Also, if you decide to re-use the label, you can convert the template back to a label using Azure AIP portal (Azure AIP Portal, Labels, “Protection templates”, right click, convert to label) or PowerShell (see next §).

Tip: If you want a template, but no label, create a label with a template, and delete the label afterwards.

## When a user tries to apply protection using the Encrypt button in Outlook or File->Info->Protect Document-> Restrict Access in Word,PowerPoint or Excel the RMS templates are not visible/listed to be used, why ?

  This is by design. Refer [Manage sensitivity labels in Office apps | Microsoft Learn](https://learn.microsoft.com/en-us/purview/sensitivity-labels-office-apps?view=o365-worldwide#protection-templates-and-sensitivity-labels)

## Templates as part of the TPD import

If you export a trusted publishing domain (TPD) (e.g. from AD RMS), and import this TPD into AADRM, the templates which were associated with that TPD will be imported into AADRM (as part of the TPD configuration).

**Please note:** Those templates are bound to the original AD RMS TPD. An AD RMS TPD is exoected to be used for consumption of 
migrated content. Thus it is an archived TPD in the AIP service. Templates from the archived TPD may not be published.

# Rename an RMS template
## Connect to AIP
Connect to the AIP service with the [AIPService PowerShell module](https://aka.ms/azipps).

`Connect-AipService`

## Use the following to get the list of templates and their GUIDs.
`(Get-AipServiceConiguration).Templates`

 - ![image.png](/.attachments/image-f2240d96-fcef-426c-a595-9d3c66da4125.png)

## Export the template to be renamed.
Use the following to export the existing templates to a local XML file. **_This is a backup in case something were to go awry_**. Adjust the path/file name and the TemplateId accordingly.

In the screenshot example, the template with GUID 7f99d214-ac02-4ad9-af37-66ef614c5c37 will be exported and renamed. 

`Export-AipServiceTemplate -Path "C:\Temp\Templates\Rename\OriginalTemplate.xml" -TemplateId 7f99d214-ac02-4ad9-af37-66ef614c5c37`

 - ![image.png](/.attachments/image-4528d664-140e-480b-a92a-66d6fdb45348.png)

[Export-AipServiceTemplate (AIPService)](https://learn.microsoft.com/en-us/powershell/module/aipservice/export-aipservicetemplate?view=azureipps#example-1-export-a-template)


## Rename the template
Rename the template with the [Set-AipServiceTemplateProperty](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicetemplateproperty?view=azureipps) cmdlet.

To use this cmdlet one must run several PowerShell commands.

The commands set up a list item for the template names and a list item the template description. There must at least one pair of name and description lists. Ther may be as many languages as needed per name/description pair.
 - Information on the [Names](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicetemplateproperty?view=azureipps#-names) parameter.
 - Information on the [Descriptions](https://learn.microsoft.com/en-us/powershell/module/aipservice/set-aipservicetemplateproperty?view=azureipps#-descriptions) parameter.

After the Names and Descriptions are configured the template may be renamed. 
```
$names = @{}
$names[1033] = "Renamed Template"

$descriptions = @{}
$descriptions[1033] = "This template was renamed."

Set-AipServiceTemplateProperty -TemplateId 7f99d214-ac02-4ad9-af37-66ef614c5c37 -Names $names -Descriptions $descriptions
```
 - ![image.png](/.attachments/image-bf2febc0-b568-4463-bc13-cc6eb822e27c.png)

## Check the template in AIP
 - ![image.png](/.attachments/image-fd2f7021-4da0-4a32-9179-33d9ad92e45b.png)

You may also reexport the template (to a new name) and compare the contents. 
