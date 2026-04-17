---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Device Management/Azure AD Mobility (MDM and MAM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FDevice%20Management%2FAzure%20AD%20Mobility%20(MDM%20and%20MAM)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Mobility (MDM and MAM) — Reference & API Guide

## Summary

The **Mobility (MDM and MAM)** blade in Azure AD portal and Microsoft Graph APIs manage automatic Mobile Device Management (MDM) enrollment into an organization. Supports Microsoft Intune and third-party vendors (MobileIron, VMWare Workspace ONE/AirWatch).

**Support Boundaries:**
- MDM application setup + configuration → AAD - Authentication support team  
- Enrollment and MDM policies → Intune support team

## Limitations

1. New `mobilityManagementPolicy` API does not support creation and deletion of mobility apps.
2. Does not allow app-only permissions.

## Error Conditions (API)

| Scenario | Method | Status Code | Error Code | Message |
|-----|-----|-----|-----|-----|
| Invalid URLs specified | PATCH | 400 | Bad Request | The property `{propertyName}` is not a valid URL |
| Invalid applies to value set | PATCH | 400 | Bad Request | The property `appliesTo` is not a valid policy scope. Possible values are `all` or `none` |
| Attempted patch of both policy and service principal properties | PATCH | 400 | Bad Request | Simultaneous patch requests on both the appliesTo and URL properties are currently not supported |

## Microsoft Graph API (mobilityManagementPolicy)

### List mobility management policies
```
GET https://graph.microsoft.com/beta/policies/mobileDeviceManagementPolicies
```

### Get a specific policy
```
GET https://graph.microsoft.com/beta/policies/mobileDeviceManagementPolicies/{id}
```

### Update policy enrollment scope
```
PATCH https://graph.microsoft.com/beta/policies/mobileDeviceManagementPolicies/{policyid}
Body: { "appliesTo": "all" }
```

### Add a group to policy scope
```
POST https://graph.microsoft.com/beta/policies/mobileDeviceManagementPolicies/{policyid}/includedGroups/$ref
Body: { "@odata.id": "https://graph.microsoft.com/odata/groups('{groupid}')" }
```

### Delete a group from policy scope
```
DELETE https://graph.microsoft.com/beta/policies/mobileDeviceManagementPolicies/{policyid}/includedGroups/{groupid}/$ref
```

## Policy Scope Values

| Enum Name | Value | Description |
|-----|-----|-----|
| none | 0 | Policy applies to no groups |
| all | 1 | Policy applies to all groups |
| selected | 2 | Policy applies only to selected groups |
| unknownFutureValue | 3 | Unknown Future Value |

## Azure Portal Configuration

1. Login as Global Administrator → Azure Active Directory → Mobility (MDM and MAM)
2. Click **Add application** → select vendor from Mobility Apps gallery
3. Configure vendor-specific enrollment URLs (Discovery, Compliance, Terms of Use)

## Audit Log Filters

| Column | Value |
|-----|-----|
| Service | Core Directory |
| Category | ApplicationManagement |
| Activity | Add app role assignment to service principal / Add delegated permission grant |
| Target | Windows Azure Active Directory, {app URLs} |

## ICM Path

- **Owning Service**: Devices User Experience  
- **Owning Team**: MobilityAPI

## Required Permissions

- `Policy.Read.All` — Read all policies including mobilityManagementPolicy
- `Policy.ReadWrite.MobilityManagement` — Read and write mobilityManagementPolicy
