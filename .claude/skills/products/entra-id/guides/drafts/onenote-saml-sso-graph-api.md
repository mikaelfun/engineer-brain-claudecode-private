# Set Up SAML SSO with Non-Gallery App in Mooncake via Graph API

**Source**: MCVKB 11.33 — Set up SAML SSO between AAD SaaS Application and ADFS ClaimsX-Ray

## Scenario

Configure SAML SSO for non-gallery applications in Azure China (Mooncake). No portal UI available for this — must use Graph API and PowerShell.

## Steps

### 1. Create AAD SaaS Application and Service Principal

```powershell
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud

$appName = "MySAMLApp"
$samlApp = New-AzureADApplication -DisplayName $appName `
    -IdentifierUris "urn:microsoft:adfs:claimsxray" `
    -ReplyUrls "https://adfshelp.microsoft.com/ClaimsXray/TokenResponse" `
    -SamlMetadataURL "http://myapp.example.com/metadata.xml"

New-AzureADServicePrincipal -AccountEnabled $true `
    -AppId $samlApp.AppId `
    -AppRoleAssignmentRequired $true `
    -DisplayName $appName `
    -Tags {WindowsAzureActiveDirectoryIntegratedApp},{WindowsAzureActiveDirectoryCustomSingleSignOnApplication}
```

### 2. Set SAML as SSO Mode

```http
PATCH https://microsoftgraph.chinacloudapi.cn/v1.0/servicePrincipals/{spObjectId}
Content-type: application/json

{
    "preferredSingleSignOnMode": "saml"
}
```

### 3. Configure Self-Signed Certificate for SAML Response Signing

```http
POST https://microsoftgraph.chinacloudapi.cn/v1.0/servicePrincipals/{spObjectId}/addTokenSigningCertificate
Content-type: application/json

{
    "displayName": "CN=mysamlcert",
    "endDateTime": "2027-01-25T00:00:00Z"
}
```

### 4. Assign Users to Service Principal

Assign users via Azure Portal or Graph API.

### 5. Test SAML SSO

Test URL (Mooncake):
```
https://account.activedirectory.windowsazure.cn/applications/testfedaratedapplication.aspx?servicePrincipalId={spObjectId}&tenantId={tenantId}
```

## Key Notes

- Mooncake Graph endpoint: `https://microsoftgraph.chinacloudapi.cn/`
- Replace `IdentifierUris` and `ReplyUrls` with actual application values
- This approach works for any non-gallery SAML app, not just ClaimsX-Ray
