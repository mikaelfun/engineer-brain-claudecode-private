# Authenticate Azure Automation Runbook in Mooncake

## Overview
Sample code for connecting Azure Automation runbooks to Azure resources in Mooncake using RunAs Account (Service Principal).

## Code Sample (RunAs Account)

```powershell
$connectionName = "AzureRunAsConnection"

try {
    $servicePrincipalConnection = Get-AutomationConnection -Name $connectionName
    "Logging in to Azure..."
    Add-AzureRmAccount `
        -ServicePrincipal `
        -TenantId $servicePrincipalConnection.TenantId `
        -ApplicationId $servicePrincipalConnection.ApplicationId `
        -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint `
        -EnvironmentName AzureChinaCloud

    # Optional: set specific subscription context
    # Set-AzureRmContext -SubscriptionId <subID>
}
catch {
    if (!$servicePrincipalConnection) {
        $ErrorMessage = "Connection $connectionName not found."
        throw $ErrorMessage
    } else {
        Write-Error -Message $_.Exception
        throw $_.Exception
    }
}
```

## Az Module Version (newer)

```powershell
$connectionName = "AzureRunAsConnection"

try {
    $servicePrincipalConnection = Get-AutomationConnection -Name $connectionName
    "Logging in to Azure..."
    Add-AzAccount `
        -ServicePrincipal `
        -TenantId $servicePrincipalConnection.TenantId `
        -ApplicationId $servicePrincipalConnection.ApplicationId `
        -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint `
        -EnvironmentName AzureChinaCloud
}
catch {
    if (!$servicePrincipalConnection) {
        throw "Connection $connectionName not found."
    } else {
        Write-Error -Message $_.Exception
        throw $_.Exception
    }
}
```

## Key Points
- **Always specify `-EnvironmentName AzureChinaCloud`** for Mooncake
- RunAs Account is deprecated → migrate to **Managed Identity** (recommended)
- For Managed Identity: use `Connect-AzAccount -Identity -Environment AzureChinaCloud`
- Debug stream: set `$GLOBAL:DebugPreference="Continue"` and redirect with `5>&1`

## References
- [Authenticating to Azure using AAD](https://azure.microsoft.com/en-us/blog/azure-automation-authenticating-to-azure-using-azure-active-directory/)
- [Configure RunAs Account](https://learn.microsoft.com/en-us/azure/automation/automation-security-overview)

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Common Code Samples
