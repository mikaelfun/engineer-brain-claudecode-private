---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/ACE Identity TSGs/Identity Technical Wiki/How To: Add Custom Claims to ID Tokens"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FACE%20Identity%20TSGs%2FIdentity%20Technical%20Wiki%2FHow%20To%3A%20Add%20Custom%20Claims%20to%20ID%20Tokens"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To: Add Custom Claims to ID Tokens

Depending on a customer's needs, they may have an Application registered with Azure AD that requires certain user information in ID Tokens for different logic/flows within the Application.

You can look to add most of these via the GUI, by configuring Optional Claims under the Token Configuration of the App Registration:
https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-optional-claims

However, there is further user information that you can add to these tokens using Azure AD policies. These can help provide customers better flexibility and interoperability of their apps.

## Prerequisites

1. Install the Microsoft Graph PowerShell module:
```powershell
Install-Module Microsoft.Graph
# Verify:
Get-InstalledModule Microsoft.Graph
```
Note: If you see both AzureAD and AzureADPreview, you may need to uninstall AzureAD and restart PowerShell.

2. In the Manifest of the Application Registration, edit the `acceptMappedClaims` parameter to `true` and Save.

## Method: Claims Mapping Policy

Start by checking if the attributes you want are in the claims schema:
https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-claims-mapping#claim-schema-entry-elements

Note the Source and ID for each desired attribute.

From PowerShell, create a JSON object with the claims to add to the ID token:

```powershell
$customClaims = [ordered]@{
    "ClaimsMappingPolicy" = [ordered]@{
        "Version" = 1
        "IncludeBasicClaimSet" = $true
        "ClaimsSchema" = @(
            [ordered]@{
                "Source" = "user"
                "ID" = "jobtitle"
                "JwtClaimType" = "jobtitle"
            },
            [ordered]@{
                "Source" = "user"
                "ID" = "department"
                "JwtClaimType" = "department"
            }
        )
    }
}

$policyDefinition = $customClaims | ConvertTo-Json -Depth 99 -Compress

# Create the Azure AD Policy
$policy = New-MgPolicyClaimMappingPolicy -Definition $policyDefinition -DisplayName "JobNDept" -Description "ClaimsMappingPolicy"

# Bind the policy to the Service Principal of the Application
$appId = "App ID of the Target Application"
$sp = Get-MgServicePrincipal -Filter "servicePrincipalNames/any(n: n eq '$appID')"
New-MgServicePrincipalClaimMappingPolicyByRef -ServicePrincipalId $sp.ObjectId -RefObjectId $policy.Id
```

The ID Token issued during Authentication to this App will now contain the mapped claims for the authenticated user.

## Extension Attributes

If the required attributes are not in the standard schema, leverage Extension Attributes:

```powershell
# Create extension attribute on the App Registration
$myapp = (Get-MgApplication -SearchString "Target Application").ObjectId
$newextn = New-MgApplicationExtensionProperty -ApplicationId $myapp -Name "newExtn" -DataType "String" -TargetObjects "User"

# Single User: Set extension attribute value
$user = Get-MgUser -Search "TestUser"
$extensionProperty = @{
    "extension_$($myapp)_$($newextn.Name)" = $user.PhysicalDeliveryOfficeName
}
Update-MgUser -UserId $user.Id -AdditionalProperties $extensionProperty

# Verify:
Get-MgUser -Search "MOD Administrator" | Select -ExpandProperty ExtensionProperty

# Multiple Users: use a CSV + script
Import-Csv .\users.csv | ForEach-Object {
    $user = Get-MgUser -Filter "userPrincipalName eq '$($_.UserPrincipalName)'"
    $extensionProperty = @{
        "extension_<AppObjectId>_<ExtensionName>" = $user.PhysicalDeliveryOfficeName
    }
    Update-MgUser -UserId $user.Id -AdditionalProperties $extensionProperty
}
```

Once Extension Attributes are bound to the Application Object and target users, add them as Optional Claims:
- Azure Portal > Azure Active Directory > App Registrations > [Your App] > Token configuration > Add optional claim > ID > select the extension attribute.

## References

- https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgserviceprincipalclaimmappingpolicybyref
- https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.applications/new-mgapplicationextensionproperty
