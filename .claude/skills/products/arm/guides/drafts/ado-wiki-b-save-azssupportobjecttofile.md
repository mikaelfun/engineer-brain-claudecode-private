---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Utilities.ps1/Save-AzsSupportObjectToFile"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Stack%20Hub/Azs.Support%20Module/modules/AzureStack.Hub.Utilities.ps1/Save-AzsSupportObjectToFile"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
note: This is a dynamically created article. Do not edit directly
template: .templates/Templates/Function.md
---
# CSSTools Save-AzsSupportObjectToFile

# Synopsis

Save an object to a file in a consistent format creating a file that contains the current time as a timestamp in the file name.

# Parameters

## FILEPREFIX

The output file prefix
Currently supported types: HashTables and PSCustomObjects
Defaults to the object's BaseName

## FILEFORMAT

The file format. Current supported formats are json, csv, xml and txt (should be used for general objects). Defaults to txt.

Output methods:
- json: $Object | ConvertTo-Json -Depth 5 | Out-File FilePrefix_TimeStamped.json
  NOTE: Be aware that certain object types (e.g. [xml]) may hang the session. Validate object before using.
- csv: $Object | Export-Csv -NoTypeInformation -Path FilePrefix_TimeStamped.csv
- txt: $Object | Format-Table | Out-String | Out-File -Path FilePrefix_TimeStamped.txt
- xml: $Object.Save(FilePrefix_TimeStamped.xml)

## OUTPUTPATH

Defines the output directory. Defaults to AzsSupport working directory (use Get-AzsSupportWorkingDirectory).

## DEPTH

Defines the depth when converting to json. Defaults to 5.

## APPEND

Append to file rather than overwrite. Must be used with -Filename parameter.

## FILENAME

Defines the FileName to use. Will not be appended with date/time.

# Examples

## Example 1

```powershell
Get-VM -cimsession s-cluster | Save-AzsSupportObjectToFile -FilePrefix VMs -FileFormat csv -Outputpath c:\temp
```

## Example 2

```powershell
Get-VM -cimsession s-cluster | Save-AzsSupportObjectToFile -FilePrefix VMs -FileFormat csv
```

## Example 3

```powershell
Get-VM -cimsession s-cluster | Save-AzsSupportObjectToFile -FileName VMs -FileFormat csv -Append
```

# Inputs

The object to be saved (pipeline input supported)
