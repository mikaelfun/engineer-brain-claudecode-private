---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/PowerShell Scenarios/Scripts/Microsoft Graph Managing Directory Extensions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FPowerShell%20Scenarios%2FScripts%2FMicrosoft%20Graph%20Managing%20Directory%20Extensions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Manage custom directory schema extensions

## Add custom directory extension attribute

```powershell
# Required: You must first add the extension property to an app registration
$ClientId = "APP-ID-GUID"
$UserId = "user@contoso.com"

$params = @{
    Name = "testUserAttribute1"
    DataType = "String"
    TargetObjects = @("User")
}

# Add extension property to the application
$applicationId = (Get-MgApplication -Filter "appId eq '$ClientId'").Id
$customAttribute = New-MgApplicationExtensionProperty -ApplicationId $applicationId -BodyParameter $params

# Set the extension value on a user
$params = @{
    $customAttribute.Name = "some_value"
}
Update-Mguser -UserId $UserId -BodyParameter $params
```

## Get list of all available extensions on an app

```powershell
Get-MgApplicationExtensionProperty -ApplicationId $applicationId
```

## Get list of all available extensions for the tenant

```powershell
Get-MgDirectoryObjectAvailableExtensionProperty
```

## Get extension values on a user

```powershell
# Get all available extensions for the tenant
$extensions = Get-MgDirectoryObjectAvailableExtensionProperty

# Query the user requesting to also select the extension attributes
$user = Get-MgUser -UserId $UserId -Select @($extensions.Name)

# Output the extension properties for the user
$user.AdditionalProperties
```

## More information

See [Directory (Microsoft Entra ID) extensions](https://learn.microsoft.com/en-us/graph/extensibility-overview?view=graph-rest-1.0&tabs=http#directory-microsoft-entra-id-extensions)
