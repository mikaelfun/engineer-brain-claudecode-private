---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Sensitivity Labels/How to: Sensitivity Labels/How To: See if an item has a Sensitivity Label"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/How%20to%3A%20Sensitivity%20Labels/How%20To%3A%20See%20if%20an%20item%20has%20a%20Sensitivity%20Label"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To: See if an Item has a Sensitivity Label

## Easy Way - MPIP Client PowerShell

When the Microsoft Purview Information Protection (MPIP) client is installed, use PowerShell:

```powershell
Get-FileStatus <filepath>
```

See [Get-FileStatus docs](https://learn.microsoft.com/en-us/powershell/module/purviewinformationprotection/get-filestatus?view=azureipps).

## Manual Way - Documents

### Non-CoAuth Enabled Tenant
1. Open document in Word/Excel/PowerPoint
2. Navigate to `File` > `Info` > `Properties` > `Advanced Properties`
3. Go to `Custom` tab - the label will be in custom properties

### CoAuth Enabled Tenant
Note: Does not work with encrypted files.
1. Copy the document, rename extension to `.zip`
2. Open the .zip file
3. Navigate to `docMetadata` folder
4. Open `LabelInfo.xml` to see label data

### Office Metadata Encryption (DRMEncryptProperty)
If `DRMEncryptProperty` is enabled, metadata is encrypted and labels are not visible outside Office:

```
HKCU\Software\Microsoft\Office\16.0\Common\Security
Name:  DRMEncryptProperty
Type:  DWORD
Value: 0 (plaintext, default) or 1 (encrypted)
```

**Impact**: If DRMEncryptProperty=1:
- DLP Endpoint cannot see the label
- DLP EXO/SPO/ODB and Auto Labeling may have difficulties detecting it
- This setting is NOT compatible with MIP Labels

## Email Label Identification

1. Download and open the .msg or .eml file in Outlook Desktop
2. Click `File` > `Properties`
3. Look for `msip_labels:` property
4. Alternative: Open in text editor and search for `msip_labels:`
