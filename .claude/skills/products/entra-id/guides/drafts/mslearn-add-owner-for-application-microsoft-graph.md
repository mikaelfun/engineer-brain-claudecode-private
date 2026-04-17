# Add an Owner to an Application Using Microsoft Graph

## Overview
How to add a service principal as owner of an application registration via Microsoft Graph API, enabling the app to manage its own properties (e.g., rotate secrets/certificates).

## Required Permission
- `Application.ReadWrite.OwnedBy` (least privilege) — allows app to manage apps it owns
- `Application.ReadWrite.All` — broader alternative

## Steps

### Step 1: Get the Application Object ID
- Azure Portal → Entra ID → App registrations → copy Object ID

### Step 2: Get the Service Principal Object ID
- Azure Portal → Entra ID → Enterprise applications → copy Object ID

### Step 3: Add Owner via Graph API

**Graph Explorer:**
```http
POST https://graph.microsoft.com/v1.0/applications/{app-object-id}/owners/$ref
Content-Type: application/json

{
    "@odata.id": "https://graph.microsoft.com/v1.0/directoryObjects/{service-principal-id}"
}
```

**PowerShell:**
```powershell
Connect-MgGraph -Scopes Application.ReadWrite.All

$Owner = @{
    "@odata.id" = "https://graph.microsoft.com/v1.0/directoryObjects/$OwnerServicePrincipalObjectId"
}
New-MgApplicationOwnerByRef -ApplicationId $ApplicationObjectId -BodyParameter $Owner
```

## Troubleshooting

### 403 Authorization_RequestDenied
- **Cause**: Insufficient permissions
- **Fix**: Consent to `Application.ReadWrite.All` in Graph Explorer → Modify permissions tab

## Source
- [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/users-groups-entra-apis/add-owner-for-application-microsoft-graph)
