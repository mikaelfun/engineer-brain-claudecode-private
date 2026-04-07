---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure (Public) DNS zones/Powershell Tips - Azure DNS"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FPowershell%20Tips%20-%20Azure%20DNS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# PowerShell Tips - Azure DNS

## Scenario 1: Export All Azure DNS Information to Excel

Install/update the Az PowerShell module:

```powershell
Install-Module -Name Az
# Or update existing:
Update-Module -Name Az
```

Export all zones and record sets to CSV:

```powershell
# Login
Connect-AzAccount

# Obtain information for all zones
[array]$arrAllZones = Get-AzDnsZone

if ($arrAllZones -and $arrAllZones.count -gt 0) {
    # Export zone info to CSV
    $arrAllZones |
    Select-Object Name, ResourceGroupName,
        @{Name='NameServers'; Expression={[string]::join(';', ($_.NameServers))}},
        NumberOfRecordSets, MaxNumberOfRecordSets |
    Export-Csv -NoTypeInformation -Path "$env:userprofile\Desktop\AzureDns_ZoneInformation.csv"

    ForEach ($zone in $arrAllZones) {
        if ($zone.NumberOfRecordSets -gt 0) {
            [array]$arrAllRecordSetsForZone = Get-AzDnsRecordSet -ZoneName $zone.Name -ResourceGroupName $zone.ResourceGroupName
            if ($arrAllRecordSetsForZone -and $arrAllRecordSetsForZone.count -gt 0) {
                $arrAllRecordSetsForZone |
                Select-Object Name, ZoneName, ResourceGroupName, Ttl, RecordType,
                    @{Name='Records'; Expression={[string]::join(';', ($_.Records))}}, Metadata |
                Export-Csv -NoTypeInformation -Path "$env:userprofile\Desktop\AzureDns_RecordSets_$($zone.Name).csv"
            }
        }
    }
}
```

To merge all zone CSV files into one:

```cmd
cd <folder-with-csvs>
copy *.csv DNSZonesInformation.csv
```

## Scenario 2: Bulk-Modify TTL for All Record Sets in a Zone

```powershell
Connect-AzAccount

# Modify TTL of each record set to desired value (e.g., 120 seconds)
# Add -RecordType parameter to target specific record types
Get-AzDnsRecordSet -ZoneName contoso.com -ResourceGroupName ContosoAzure |
    % { $_.Ttl = 120; Set-AzDnsRecordSet -RecordSet $_ -Overwrite }

# Verify
Get-AzDnsRecordSet -ZoneName contoso.com -ResourceGroupName ContosoAzure
```

## Contributors

Adam Conkle, Diego Garro (Modified 08/2020)
