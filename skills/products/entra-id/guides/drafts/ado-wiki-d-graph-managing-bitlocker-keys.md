---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Managing BitLockerKeys"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Managing%20BitLockerKeys"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Managing BitLockerKeys using Microsoft Graph PowerShell

[[_TOC_]]

## Scenario: Get BitLocker recovery keys for all devices

```powershell
Get-MgInformationProtectionBitlockerRecoveryKey -All |
Select-Object Id, CreatedDateTime, DeviceId, @{n="DeviceName";e={(Get-MgDevice -DeviceId $_.DeviceId).DisplayName}},
@{n="Key";e={(Get-MgInformationProtectionBitlockerRecoveryKey -BitlockerRecoveryKeyId $_.Id -Property key).Key}},
VolumeType
```

> **Important:** You must explicitly request the `key` property using `-Property key`, otherwise the recovery key value is not returned in the response.

## Scenario: Get a list of Devices that do not have BitLocker Recovery Keys

Uses two commands:

* [Get-MgInformationProtectionBitlockerRecoveryKey](https://docs.microsoft.com/en-us/powershell/module/microsoft.graph.identity.signins/get-mginformationprotectionbitlockerrecoverykey?view=graph-powershell-1.0) - list of BitLocker Recovery Keys
* [Get-MgDeviceManagementManagedDevice](https://docs.microsoft.com/en-us/powershell/module/microsoft.graph.devicemanagement/get-mgdevicemanagementmanageddevice?view=graph-powershell-1.0) - list of Managed Devices

This script requires delegated sign-in (not application-only). You must be in one of the admin roles listed [here](https://docs.microsoft.com/en-us/graph/api/bitlocker-list-recoverykeys?view=graph-rest-1.0&tabs=http).

```powershell
$outFilePath = 'c:\temp\DevicesWithNoRecoveryKeys.csv'
$hasError = $false

Connect-MgGraph -scopes "BitLockerKey.ReadBasic.All", "DeviceManagementManagedDevices.Read.All"
Select-MgProfile -Name v1.0

try {
    $BitLockerRecoveryKeys = Get-MgInformationProtectionBitlockerRecoveryKey -All -Property "id, createdDateTime, deviceId" -ErrorAction Stop -ErrorVariable GraphError | Select-Object -Property id, createdDateTime, deviceId
    $ManagedDevices = Get-MgDeviceManagementManagedDevice -All -Property "deviceName,id,azureADDeviceId" -Filter "operatingSystem eq 'Windows'" -ErrorAction Stop -ErrorVariable GraphError | Select-Object -Property deviceName, id, azureADDeviceId

    $ManagedDevices | Where-Object { $PSItem.azureADDeviceId -notin $BitLockerRecoveryKeys.deviceId }
} catch {
    Write-Host "Error downloading report: $GraphError.Message"
    $hasError = $true
}

if(!$hasError) {
    try {
        $ManagedDevices | Export-Csv -Path $outFilePath
        Write-Host "Report saved at $outFilePath"
    } catch {
        Write-Host "Error saving .csv: $_.ErrorDetails.Message"
    }
}

Disconnect-MgGraph
```

> Edit the first variable to reflect a valid folder path for the output file. The output is a list of devices that did not have a BitLocker recovery key.
