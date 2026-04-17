# Use Managed Identity to Call MS Graph in Mooncake

**Source**: MCVKB 11.32 — Use managed identity to call MS Graph

## Scenario

Customer uses Managed Identity (Logic App / Azure Function / Automation Runbook) to securely call Microsoft Graph API without storing credentials.

## Assign Application Permissions to Managed Identity

Since managed identity has no application object in AAD, use Azure AD PowerShell:

```powershell
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud

# Get SPN based on MSI Display Name
$msiSpn = (Get-AzureADServicePrincipal -Filter "displayName eq 'automation managed identity'")

# Set well known Graph Application Id
$msGraphAppId = "00000003-0000-0000-c000-000000000000"

# Get SPN for Microsoft Graph
$msGraphSpn = Get-AzureADServicePrincipal -Filter "appId eq '$msGraphAppId'"

# Define required permissions
$msGraphPermission = "Directory.ReadWrite.All","Group.ReadWrite.All","GroupMember.ReadWrite.All"

# Get matching App Roles
$appRoles = $msGraphSpn.AppRoles | Where-Object {$_.Value -in $msGraphPermission -and $_.AllowedMemberTypes -contains "Application"}

# Assign roles to MSI
$appRoles | % { New-AzureAdServiceAppRoleAssignment -ObjectId $msiSpn.ObjectId -PrincipalId $msiSpn.ObjectId -ResourceId $msGraphSpn.ObjectId -Id $_.Id }
```

## Remove Permissions

```powershell
$spApplicationPermissions = Get-AzureADServiceAppRoleAssignedTo -ObjectId $msiSpn.ObjectId -All $true | Where-Object { $_.PrincipalType -eq "ServicePrincipal" }
$spApplicationPermissions | ForEach-Object {
    Remove-AzureADServiceAppRoleAssignment -ObjectId $_.PrincipalId -AppRoleAssignmentId $_.objectId
}
```

## Sample: Automation Runbook Calling MS Graph

```powershell
Disable-AzContextAutosave -Scope Process | Out-Null

try {
    $AzureContext = (Connect-AzAccount -Identity -Environment AzureChinaCloud).context
} catch {
    Write-Output "No system-assigned identity. Aborting."
    exit
}

$AzureContext = Set-AzContext -SubscriptionName $AzureContext.Subscription -DefaultProfile $AzureContext

# Get MS Graph access token via Managed Identity
$url = $env:IDENTITY_ENDPOINT
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("X-IDENTITY-HEADER", $env:IDENTITY_HEADER)
$headers.Add("Metadata", "True")
$body = @{"resource"="https://microsoftgraph.chinacloudapi.cn/"}
$accessToken = (Invoke-RestMethod $url -Method 'POST' -Headers $headers -ContentType 'application/x-www-form-urlencoded' -Body $body).access_token

$authHeader = @{
    "Authorization" = "Bearer " + $accessToken
    "Content-Type" = "application/json"
}

# Example: Add member to group
$URI = "https://microsoftgraph.chinacloudapi.cn/beta/groups/<group id>/members/`$ref"
$bodyjson = @{"@odata.id" = "https://microsoftgraph.chinacloudapi.cn/beta/directoryObjects/<object id>"} | ConvertTo-Json
$response = Invoke-RestMethod -Method Post -Uri $URI -Headers $authHeader -Body $bodyjson
```

## Key Notes

- Mooncake Graph endpoint: `https://microsoftgraph.chinacloudapi.cn/`
- Environment: `AzureChinaCloud`
- Managed Identity token endpoint uses `$env:IDENTITY_ENDPOINT` and `$env:IDENTITY_HEADER`
