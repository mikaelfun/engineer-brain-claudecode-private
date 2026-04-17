# Certificate-Based Authentication (CBA) Setup for 21Vianet (Mooncake)

> Source: OneNote - Mooncake POD Support Notebook / Azure AD / MFA / Certificate based auth + Config certificate from my local ADDS

## Overview

This guide covers end-to-end CBA configuration in Azure China (21Vianet) environment, where the management UI is not yet available and all configuration must be done via Microsoft Graph beta API.

## Part I: Export Root/Intermediate CA Certificate from AD CS

### Step 1 — Open Certification Authority Console
On the CA server, run: `certsrv.msc`

### Step 2 — Export CA Certificate
1. Right-click CA server name → **Properties** → **General** tab → **View Certificate**
2. Go to **Details** tab → **Copy to File**
3. Select format: **Base-64 encoded X.509 (.CER)**
4. Save as e.g. `C:\temp\rootca.cer`

> Only the **public certificate (.cer)** is required. Private key is NOT needed.

### Step 3 — Upload to Entra ID PKI Trust Store
Create PKI container object and upload the Root Certificate via Microsoft Graph API.

## Part II: Request User Certificate from AD CS

1. On client machine, open: `certmgr.msc`
2. Navigate to: **Personal → Certificates**
3. Right-click → **All Tasks → Request New Certificate**
4. Complete the Certificate Enrollment Wizard

## Part III: Enable CBA via Graph API (21Vianet Only)

### Prerequisites
```powershell
# Install matching versions
Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force
Install-Module Microsoft.Graph.Beta.Identity.SignIns -Scope CurrentUser -Force

# Verify version consistency
Get-Module -ListAvailable Microsoft.Graph.Authentication | Select Name, Version
Get-Module -ListAvailable Microsoft.Graph.Beta.Identity.SignIns | Select Name, Version
```

### Option A: Using App Registration (Client Secret)
```powershell
$ApplicationClientId = '<your-app-id>'
$ApplicationClientSecret = '<your-secret>'
$TenantId = '<your-tenant-id>'

$SecureClientSecret = ConvertTo-SecureString -String $ApplicationClientSecret -AsPlainText -Force
$ClientSecretCredential = New-Object System.Management.Automation.PSCredential -ArgumentList $ApplicationClientId, $SecureClientSecret

Connect-MgGraph -TenantId $TenantId -ClientSecretCredential $ClientSecretCredential -Environment China

$params = @{
    "@odata.type" = "#microsoft.graph.x509CertificateAuthenticationMethodConfiguration"
    Id = "X509Certificate"
    State = "enabled"
    IncludeTargets = @(@{
        TargetType = "group"
        Id = "<target-group-id>"
    })
}

Update-MgBetaPolicyAuthenticationMethodPolicyAuthenticationMethodConfiguration `
    -AuthenticationMethodConfigurationId "X509Certificate" `
    -BodyParameter $params
```

### Option B: Using Certificate Authentication
```powershell
Connect-MgGraph -Environment China -AppId "<app-id>" -TenantId "<tenant-id>" -CertificateThumbprint "<thumbprint>"

# Full configuration with multi-factor mode
$body = @{
    "@odata.type" = "#microsoft.graph.x509CertificateAuthenticationMethodConfiguration"
    "id" = "X509Certificate"
    "state" = "enabled"
    "certificateUserBindings" = @(
        @{ "x509CertificateField" = "PrincipalName"; "userProperty" = "userPrincipalName"; "priority" = 1 },
        @{ "x509CertificateField" = "RFC822Name"; "userProperty" = "userPrincipalName"; "priority" = 2 },
        @{ "x509CertificateField" = "SubjectKeyIdentifier"; "userProperty" = "certificateUserIds"; "priority" = 3 }
    )
    "authenticationModeConfiguration" = @{
        "x509CertificateAuthenticationDefaultMode" = "x509CertificateMultiFactor"
        "rules" = @()
    }
    "includeTargets" = @(@{
        "targetType" = "group"
        "id" = "all_users"
        "isRegistrationRequired" = $false
    })
}

Invoke-MgGraphRequest -Method PATCH `
    -Uri "beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations/x509Certificate" `
    -Body $body
```

### Required Permissions
- `Policy.ReadWrite.AuthenticationMethod`
- `Policy.Read.AuthenticationMethod`
- `Directory.ReadWrite.All`

### Verify Configuration
```powershell
$authMethods = Get-MgBetaPolicyAuthenticationMethodPolicy
$authMethods.AuthenticationMethodConfigurations
# X509Certificate should show State = enabled
```

## Part IV: Validate Sign-in

1. User navigates to sign-in page
2. Selects "Sign in with a certificate"
3. Browser prompts for certificate selection
4. After certificate selection, user is authenticated

## Key Notes

- **Multi-factor mode**: Setting `x509CertificateAuthenticationDefaultMode` to `x509CertificateMultiFactor` means CBA alone satisfies MFA — no additional factor needed
- **21Vianet Graph endpoint**: `microsoftgraph.chinacloudapi.cn` (not `graph.microsoft.com`)
- **Must use beta API**: v1.0 endpoint does NOT support CBA configuration in 21Vianet
- **UI timeline**: PG targeting UX enablement in CY26Q1 public preview
