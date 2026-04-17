---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Classification and sensitivity labels/Missing or incorrectly labeled assets/Label is missing on an asset"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Classification%20and%20sensitivity%20labels/Missing%20or%20incorrectly%20labeled%20assets/Label%20is%20missing%20on%20an%20asset"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Label is Missing on an Asset

Author Tiffany Fischer and Travis Grenell
Author Rahul Pyne (MIPS contributor)

## Process Flow

Scan checks first for Classification and gets meta data. Then catalog will check if file has been updated to see if needs a new event for downstream events such as Middle Tier Service handles label service or offline system. After Middle tier receives events it will process the classification and make a call to MIP to return the label. MIPS checks the label policy and returns matching label and sensitivity and update the catalog through the ingestion team. Ingestion will attach the Label at the Catalog level.

## Supported Data Sources & Limitations

[Check Supported Data Sources & Limitations GUIDE](https://docs.microsoft.com/en-us/azure/purview/create-sensitivity-label#supported-data-sources)

## Gather Information

- Scan Run ID (from a run after labels were published)
- Report Id if using SHIR
- Asset FQN & Column Expecting Label
- Label Name Missing
- Sample asset file or top 128 rows of column
- Screenshot of the Overview page of the asset (capture the entire Overview page)
- Confirm the classification is correctly assigned
- Screenshots of all pages of the Label config
- Screenshots of all pages of the Label Policy config
- Screenshots of all pages of the Label Publishing config

## Verify Permissions

Ensure that the customer's Purview Account has the required permissions to call MIPs SDK APIs. This is controlled by the admin of the customer's tenant. Refer to: [Required Permissions](https://learn.microsoft.com/en-us/purview/get-started-with-sensitivity-labels#permissions-required-to-create-and-manage-sensitivity-labels)

## Purview Label Service Logs

Follow the [LabelService Logs and Debugging TSG](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/1083914/Purview-LabelService-Logs-and-Debugging) to identify if the issue is due to MIPs or Purview Label Service.

## MIPs TSGs

- [Understanding Purview and MIP Support boundaries](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/377941/AIP-and-MIP-Support-Boundaries)
- [Auto Labeling Support TSG and Template](https://o365exchange.visualstudio.com/IP%20Engineering/_wiki/wikis/IP%20Engineering.wiki/157733/Auto-Labeling-Support-TSG-and-Template)
- [MIP Labels : Support TSG](https://o365exchange.visualstudio.com/IP%20Engineering/_wiki/wikis/IP%20Engineering.wiki/23865/MIP-Labels-Support-TSG)
- [MIP Debugging/Logs](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/1083914/Purview-LabelService-Logs-and-Debugging)

## Confirm Label Configuration Checklist

1. **License Requirements**: Must have at least one M365 license in same AAD tenant. Required licenses: M365 E5/A5/G5, M365 E5/A5/G5 Compliance, M365 E5/A5/G5 Information Protection and Governance, Office 365 E5 + EMS E5/A5/G5 + AIP Plan 2.

2. **Consent is turned on**: [Consent Guide](https://docs.microsoft.com/en-us/azure/purview/how-to-automatically-label-your-content#step-2-consent-to-use-sensitivity-labels-in-azure-purview)

3. **Auto-Apply enabled**: If not set to automatically apply, labels will not be applied. [Auto-labeling for files](https://docs.microsoft.com/en-us/azure/purview/how-to-automatically-label-your-content#autolabeling-for-files)

4. **Labels Published**: If not published, labels will not apply. It can take up to 24 hours to publish. [Publish Labels](https://docs.microsoft.com/en-us/azure/purview/how-to-automatically-label-your-content#step-4-publish-labels)

5. **NOT a parent label**: If there are child labels, the parent label is NOT applied; configure child labels instead.

6. **NOT using custom SITs**: Only system-created Sensitive Information Types work with auto-labeling for schematized data assets. Custom SITs are NOT supported.

7. **No encryption/DKE**: Labels must NOT apply encryption controls or use Double Key Encryption.

8. **Label Policy scoped to All**: Publishing must be scoped to All users - labels scoped to specific users/groups will not apply.

9. **Labels imported to Governance Portal**: Check if label appears for manual application. Test: create a basic label with few settings, publish, wait, check if it shows in Governance portal.

10. **Valid keywords**: Check compliance docs for valid keywords for the specific label type.

11. **Supported values**: Check compliance docs for supported value patterns.

12. **Test file**: Upload test file in Compliance portal to confirm match.

## Label Distribution Check

```powershell
Connect-IPPSSession -UserPrincipalName cx_email@cx_domain.cx_ext
Get-LabelPolicy -Identity NameOfLabelPolicy | Select Name, Distr*
```

If distribution was successful but label still not applied → Governance PG involvement needed.
If not successful → Compliance team involvement needed.

## Communicating with Compliance Team

Key points:
1. Purview Governance uses Classifications (not SITs used by Information Protection)
2. The classification engine is a text extractor, different from what AIP uses
3. Classification occurs first, then label is applied. If not classified → likely config issue on Information Protection side. If classified but not labeled → check common issues above.

## Get Consent Confirmation

[Online TSG](https://learn.microsoft.com/en-us/azure/purview/sensitivity-labels-frequently-asked-questions#how-can-i-determine-if-consent-has-been-granted-to-extend-labeling-to-the-microsoft-purview-data-map)

## Get Label Policy XML

Steps to get specific policy and label information:
```powershell
Connect-IPPSSession -UserPrincipalName [global admin or compliance admin email]

# Get Specific Label Information
get-Label "LABELNAME" | Select-Object -Property * -ExcludeProperty SerializationData | ConvertTo-Json -Depth 100 > label.txt

# Get Specific Policy Information
get-LabelPolicy "POLICYNAME" | Select-Object -Property * -ExcludeProperty SerializationData | ConvertTo-Json -Depth 100 > labelPolicy.txt
```

## SCC Status & Failures

Use the [SCC Tool](https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912762/Check-for-Network-Issues-for-SCC-Service) to check for SCC status and failures. Issues can be provided to Data Azure Security Compliance Center (SCC) Team: sccsupport@microsoft.com

## SCC SAP

Product Family: Office Products → Product Name: Microsoft Purview Compliance → Category: Labels
