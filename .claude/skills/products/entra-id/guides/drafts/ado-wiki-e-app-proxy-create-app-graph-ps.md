---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Sample Script for AADAP App Creation with Microsoft Graph PS cmdlets"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Sample%20Script%20for%20AADAP%20App%20Creation%20with%20Microsoft%20Graph%20PS%20cmdlets"
importDate: "2026-04-07"
type: troubleshooting-guide
---

The script in this article is an example, how you can use the information in [Configure Application Proxy using the Microsoft Graph API](https://learn.microsoft.com/graph/application-proxy-configure-api?tabs=powershell) to create and configure an Microsoft Entra Application Proxy app with Microsoft Graph PS cmdlets.

**Important parts that might be not clear in the mentioned article:**

1. Microsoft Entra Application Proxy can be configured through the BETA endpoint
2. _ApplicationId_ is the object Id of the App Registration (Application Object). In _Get-MgBetaApplication_ the attribute _id_ must be used and not the _appId_.

**Before you start with the script:**

1. Install the [Microsoft Graph PowerShell SDK](https://learn.microsoft.com/powershell/microsoftgraph/installation?view=graph-powershell-1.0) for the Beta endpoint!
2. Guidance on Custom Permission assignment for the actor (if needed)
3. The created application is assigned to the default connector group.
4. Please find script extensions later in the article that helps you to extend the functionality of the base script
5. The script can be shared with customer as sample / it does not contain error handling
6. Admin Consent is required on Graph explorer

## Base script

```powershell
Connect-MgGraph -Scope Directory.ReadWrite.All
Import-Module Microsoft.Graph.Beta.Applications

Write-Host "Instantiating the app.."

$applicationTemplateId = "8adf8e6e-67b2-4cf2-a259-e3dc5476c621"

## Parameters to replace
$DisplayName = "REPLACE"
$InternalUrl = "REPLACE"  ## i.e. https://app.contoso.com, use / at the end
$ExternalUrl = "REPLACE"  ## i.e. https://app-contoso-msappproxy.net, don't use / at the end

$params = @{
    DisplayName = $DisplayName
}

Invoke-MgBetaInstantiateApplicationTemplate -ApplicationTemplateId $applicationTemplateId -BodyParameter $params

Write-Host "Setting the app registration configuration.."

$params = @{
    IdentifierUris = @($ExternalUrl)
    Web = @{
        RedirectUris = @($ExternalUrl)
        HomePageUrl = $ExternalUrl
    }
}

Start-Sleep -Seconds 30

$applicationId = (Get-MgBetaApplication -Filter "DisplayName eq '$DisplayName'").Id
Write-Host "The Application ID (object id under App registration): $applicationId"

Update-MgBetaApplication -ApplicationId $applicationId -BodyParameter $params

Write-Host "Setting the app proxy configuration.."

$params = @{
    OnPremisesPublishing = @{
        ExternalAuthenticationType = "aadPreAuthentication"
        InternalUrl = $InternalUrl
        ExternalUrl = $ExternalUrl + "/"
    }
}

Update-MgBetaApplication -ApplicationId $applicationId -BodyParameter $params

Write-Host "The process has been finished."
Get-MgBetaApplication -ApplicationId $applicationId

Disconnect-MgGraph
```

## SSO script extension for OAuthToken & Header-based auths

```powershell
$applicationId = "REPLACE" # ObjectId in App Registration
$SSOMode = "REPLACE" # aadHeaderBased, pingHeaderBased, oAuthToken

$params = @{
    onPremisesPublishing = @{
        singleSignOnSettings = @{
            singleSignOnMode = $SSOMode
            kerberosSignOnSettings = $null
        }
    }
}

Update-MgBetaApplication -ApplicationId $applicationId -BodyParameter $params
```

## SSO script extension for Kerberos

```powershell
$applicationId = "REPLACE" # ObjectId in App Registration
$SSOMode = "onPremisesKerberos"
$SPN = "REPLACE" # i.e HTTP/test.contoso.com
$UserNameFormat = "REPLACE"

$params = @{
    onPremisesPublishing = @{
        singleSignOnSettings = @{
            singleSignOnMode = $SSOMode
            kerberosSignOnSettings = @{
                kerberosServicePrincipalName = $SPN
                kerberosSignOnMappingAttributeType = $UserNameFormat
            }
        }
    }
}

Update-MgBetaApplication -ApplicationId $applicationId -BodyParameter $params
```

## Get all the connectors

```powershell
$onPremisesPublishingProfileId = "applicationProxy"
Get-MgBetaOnPremisePublishingProfileConnector -OnPremisesPublishingProfileId $onPremisesPublishingProfileId
```

## Upload an SSL certificate

```powershell
$applicationId = "REPLACE" # ObjectId in App Registration
$certPfxFilePath = "REPLACE" # File path to the pfx file
$certPassword = "REPLACE"

$params = @{
    onPremisesPublishing = @{
        verifiedCustomDomainKeyCredential = @{
            type = "X509CertAndPassword"
            value = [convert]::ToBase64String((Get-Content $certPfxFilePath -Encoding byte))
        }
        verifiedCustomDomainPasswordCredential = @{ value = $certPassword }
    }
}

Update-MgBetaApplication -ApplicationId $applicationId -BodyParameter $params
```
