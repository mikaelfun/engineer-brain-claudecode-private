---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Applications Experience PowerShell scripts and MG Graph queries examples"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FApplications%20Experience%20PowerShell%20scripts%20and%20MG%20Graph%20queries%20examples"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> ⚠️ Per Microsoft policy: review Custom Code and Scripts Policy before assisting customers. Provide license/disclaimer with any scripts. Customers should test before using with production data.

[[_TOC_]]

## Retrieve application last sign-in attempt

```powershell
Import-Module Microsoft.Graph
Connect-MgGraph -Scopes "AuditLog.Read.All and Directory.Read.All"
$apps = Get-MgApplication -all
foreach ($app in $apps) {
    $signInActivity = Get-MgAuditLogSignIn -Filter "appId eq '$($app.AppId)'" -Top 1 | Select-Object -ExpandProperty CreatedDateTime
    Write-Host "Application Name: $($app.DisplayName)"
    Write-Host "Application ID: $($app.AppId)"
    Write-Host "Last Sign-In Date: $($signInActivity)"
    Write-Host "---------------------------"
}
Disconnect-MgGraph
```
**Note:** May take a long time; if no sign-ins within last 30 days, no date is returned.

## List ServicePrincipals and Scopes applied

```powershell
Connect-MgGraph -Scopes "Directory.Read.All"
$consents = Get-MgOauth2PermissionGrant -All | Where-Object { $_.PrincipalId -ne $null }
$consents | ForEach-Object {
    $principalId = $_.PrincipalId
    $user = Get-MgUser -UserId $principalId
    $app = Get-MgServicePrincipal -ServicePrincipalId $_.ClientId
    [PSCustomObject]@{
        PrincipalId = $principalId
        UPN = $user.UserPrincipalName
        ApplicationName = $app.DisplayName
        Scope = $_.Scope
    }
} | Format-Table PrincipalId, UPN, ApplicationName, Scope
Disconnect-MgGraph
```

## Get Applications that your tenant owns

Download script from ADO repo (contact mifarca for access issues). Gets apps created in your tenant (not MS 1st party, not multi-tenant apps from other tenants).

## Query third-party apps

```
GET https://graph.microsoft.com/v1.0/servicePrincipals?$count=true&$filter=not(appOwnerOrganizationId in( f8cdef31-a31e-4b4a-93e4-5f571e91255a,<your tenant id>))&$select=displayName,appOwnerOrganizationId,verifiedPublisher
```
Header: `ConsistencyLevel = eventual`

## Query applications for uniqueness violation of SP names

```
/servicePrincipals?$count=true&$select=displayName,appId,servicePrincipalNames&$filter=servicePrincipalNames/Any(x: startsWith(x, '<conflicting name>'))&$top=100
```

## Use MGGraph to add API permissions

```powershell
Connect-MgGraph
$scope1 = @{ "Id" = "14dad69e-099b-42c9-810b-d002981feec1"; "Type" = "Scope" }  # Profile
$scope2 = @{ "Id" = "e1fe6dd8-ba31-4d61-89e7-88639da4683d"; "Type" = "Scope" }  # User.Read
$scope3 = @{ "Id" = "37f7f235-527c-4136-accd-4a02d197296e"; "Type" = "Scope" }  # OpenID
$mgResourceAccess = $scope1, $scope2, $scope3
[object[]]$requiredResourceAccess = @{
    "ResourceAppId" = "00000003-0000-0000-c000-000000000000"
    "ResourceAccess" = $mgResourceAccess
}
Update-MgApplication -ApplicationId "660e0de7-f5c2-45f4-b895-0a3322d59508" -RequiredResourceAccess $requiredResourceAccess
```

## Change token lifetime

Graph Explorer example — Create policy:
```
POST https://graph.microsoft.com/v1.0/policies/tokenLifetimePolicies
Content-type: application/json
{
    "definition": ["{\"TokenLifetimePolicy\":{\"Version\":1,\"AccessTokenLifetime\":\"8:00:00\"}}"],
    "displayName": "Contoso token lifetime policy",
    "isOrganizationDefault": false
}
```
Assign to application:
```
POST https://graph.microsoft.com/v1.0/applications/{appId}/tokenLifetimePolicies/$ref
Content-Type: application/json
{"@odata.id":"https://graph.microsoft.com/v1.0/policies/tokenLifetimePolicies/{policyId}"}
```

## List Applications with owner

```
https://graph.microsoft.com/v1.0/applications?$select=appId,objectId,displayName&$expand=owners($select=id,userPrincipalName)
```
Enterprise Apps: `https://graph.microsoft.com/v1.0/serviceprincipals?$select=appId,objectId,displayName&$expand=owners($select=id,userPrincipalName)&$top=99`

## Retrieve sign-in details via Graph

`/auditlogs/signins?$filter=correlationId eq 'yourCorrelationId'`

## Find SAML apps and update notificationEmailAddresses

```powershell
Connect-MgGraph -Scopes Application.ReadWrite.All
$emailAddress = alias@contoso.com
Get-MgServicePrincipal -all -Filter "preferredSingleSignOnMode eq 'saml'" |% {
  if(!$_.NotificationEmailAddresses.contains($emailAddress)) {
   Update-MgServicePrincipal -ServicePrincipalId $_.id -NotificationEmailAddresses ($_.NotificationEmailAddresses += $emailAddress)
  }
}
```

## Get inactive users and their last sign-in timestamps

### Known Issue: 400 Error with lastSignInDateTime filter

**Error:** `Get-MgUser: Number of included identifiers cannot exceed '1000'. Status: 400 (BadRequest) ErrorCode: Request_BadRequest`

When filtering: `Get-MgUser -Filter "signInActivity/lastSignInDateTime le 2023-10-20T00:00:30Z"`

**Root Cause:** Reporting API incorrectly pages response generating >1000 results to MSODS, which returns 400.

**Workaround:**

```powershell
Connect-MgGraph -Scopes AuditLog.Read.All,Directory.Read.All,User.Read.All
$results = Invoke-MGGraphRequest -Method get -Uri 'https://graph.microsoft.com/v1.0/users?$select=userPrincipalName,displayName,signInActivity&$top=500' -OutputType PSObject -Headers @{'ConsistencyLevel' = 'eventual' }
$CloudUser = $results.value
if (!([string]::IsNullOrEmpty($results.'@odata.nextLink'))) {
  do {
    $results = Invoke-MGGraphRequest -Method get -Uri $results.'@odata.nextLink' -OutputType PSObject -Headers @{'ConsistencyLevel' = 'eventual'}
    $CloudUser += $results.value
    Start-Sleep -Seconds 3
  } while (!([string]::IsNullOrEmpty($results.'@odata.nextLink')))
}
$Date = Get-Date "2023-11-01T00:00:00"
$Filtered = $CloudUser | Where-Object { ($_.signInActivity.lastSignInDateTime -ne $null) -and ([DateTime]::Parse($_.signInActivity.lastSignInDateTime)) -lt $Date }
$Filtered | ForEach-Object {
    [PSCustomObject]@{
        DisplayName = $($_.displayName)
        ID = $($_.ID)
        userPrincipalName = $($_.userPrincipalName)
        LastNonInteractiveSignInDateTime = $($_.signInActivity.lastNonInteractiveSignInDateTime)
        LastSignInDateTime = $($_.signInActivity.lastSignInDateTime)
    }
} | Export-Csv -Path C:\Processes.csv -NoTypeInformation
```

## List all Service Principals with KeyCredentials and PasswordCredentials

```powershell
$Sps = Get-MgServicePrincipal -All -Select "displayName,appId,id,accountEnabled,tags,keyCredentials,PasswordCredentials,servicePrincipalNames,appOwnerOrganizationId"
$Sps | %{
    $_.KeyCredentials | %{
        $credentials += [PSCustomObject] @{
            DisplayName = $Sps.DisplayName; SPId = $Sps.SPId
            CredentialType = "KeyCredentials"; Type = $_.Type; Usage = $_.Usage
        }
    }
    $_.PasswordCredentials | %{
        $credentials += [PSCustomObject] @{
            DisplayName = $Sps.DisplayName; AppId = $Sps.AppId
            CredentialType = "PasswordCredentials"; Type = 'NA'; Usage = 'NA'
        }
    }
}
$credentials | FT -AutoSize
```

## Find Federated Identity Credentials with wrong case sensitivity (AADSTS700213)

Copy the `{subject}` from AADSTS700213 error and search the output file — even though ESTS can't find subject due to case-sensitive matching, file search will work.

```powershell
Disconnect-MgGraph
Connect-MgGraph -Scope 'Application.Read.All'
$file = ".\FIC-Finder.txt"
Set-Content -Path $file -Value '---'
$AppArray = Get-MgApplication -All
for ($i = 0; $i -lt $AppArray.Length; $i++) {
    Add-Content -Path $file -Value "oid: $($AppArray.id[$i])"
    Add-Content -Path $file -Value "aid: $($AppArray.appid[$i])"
    Add-Content -Path $file -Value "displayName: $($AppArray.displayName[$i])"
    $fics = Get-MgApplicationFederatedIdentityCredential -ApplicationId $AppArray.id[$i]
    if ($fics -eq $null) { Add-Content -Path $file -Value "There is no FIC on this app" }
    else {
        for ($j = 0; $j -lt $fics.Length; $j++) {
            Add-Content -Path $file -Value "- fic name: $($fics.name[$j])"
            Add-Content -Path $file -Value "- fic subject: $($fics.subject[$j])"
        }
    }
    Add-Content -Path $file -Value "==="
}
```

## Get Claims information via Claims API

```powershell
Connect-MgGraph -TenantId <your_tenant_id> -scopes Policy.ReadWrite.ApplicationConfiguration
Get-MgBetaServiceprincipalClaimPolicy -serviceprincipalid <SP_object_id> | select -ExpandProperty claims | select AdditionalProperties
```

## Configure custom keys for application registration

```powershell
$fqdn="YOUR_TENANT.onmicrosoft.com"
$pwd="12345"
$tenantId = "YOUR_TENANT_ID"
$appObjId = "APP_OBJECT_ID"
$cert = New-SelfSignedCertificate -certstorelocation cert:\currentuser\my -DnsName $fqdn
$pwdSecure = ConvertTo-SecureString -String $pwd -Force -AsPlainText
# ... (export cert, build keyCredentials JSON payload, PATCH via Invoke-MgGraphRequest)
Connect-MgGraph -tenantId $tenantId -Scopes Application.ReadWrite.All
$graphuri = "https://graph.microsoft.com/v1.0/applications/$appObjId"
Invoke-MgGraphRequest -Method PATCH -Uri $graphuri -Body $object
```

## Update ReplyUrl / LogoutUrl

```powershell
Connect-MgGraph -Scopes 'Application.Read.All' -TenantID <tenantId>
$application = Get-MgApplication -Filter "AppId eq '<appId>'"
$newReplyUrl = "https://yourapp.com/auth/callback"
$updatedUris = $application.Web.RedirectUris
if ($updatedUris -notcontains $newReplyUrl) { $updatedUris += $newReplyUrl }
Update-MgApplication -ApplicationId $application.Id -Web @{ RedirectUris = $updatedUris }
# For LogoutUrl: use $application.Web.LogoutUrl and -Web @{ LogOutUrl = $updatedUris }
```

## Create directory extension attribute

```powershell
Connect-MgGraph -Scope "Directory.ReadWrite.All, Application.ReadWrite.All"
$App = New-MgApplication -DisplayName "Extension_Attribute_App"
New-MGServicePrincipal -AppId $App.AppId
New-MgApplicationExtensionProperty -ApplicationId $App.Id -Name "Extension_name" -DataType "String" -TargetObjects "User"
Update-MgUser -UserId 'user@tenant.onmicrosoft.com' -AdditionalProperties @{'extension_xxxxxx_Extension_name' = "Value" }
```
