---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph User Provisioning Errors"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20User%20Provisioning%20Errors"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Get Microsoft Graph User Provisioning Errors

## serviceProvisioningErrors
Errors published by a federated service describing a nontransient, service-specific error regarding the properties or link from a user object.
```powershell
Get-MgBetaUser -All -CountVariable count -ConsistencyLevel eventual -Property userPrincipalName, serviceProvisioningErrors -Filter "provisionedPlans/any(x:x/provisioningStatus eq 'Error')" | Select displayName, userPrincipalName, serviceProvisioningErrors
```

## onPremisesProvisioningErrors
Errors when using Microsoft synchronization product during provisioning.
```powershell
Get-MgBetaUser -All -CountVariable count -ConsistencyLevel eventual -Property userPrincipalName, onPremisesProvisioningErrors -Filter "onPremisesProvisioningErrors/any(x:x/category eq 'PropertyConflict')" | Select displayName, userPrincipalName, onPremisesProvisioningErrors
```

## Get Both Types
```powershell
Get-MgBetaUser -All -CountVariable count -ConsistencyLevel eventual -Property userPrincipalName, serviceProvisioningErrors, onPremisesProvisioningErrors -Filter "provisionedPlans/any(x:x/provisioningStatus eq 'Error') or onPremisesProvisioningErrors/any(x:x/category eq 'PropertyConflict')" | Select displayName, userPrincipalName, serviceProvisioningErrors, onPremisesProvisioningErrors
```
