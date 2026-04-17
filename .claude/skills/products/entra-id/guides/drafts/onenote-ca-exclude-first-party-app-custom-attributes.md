# Excluding First-Party Apps from Conditional Access via Custom Security Attributes

## Summary
CA GUI does not support selecting most Microsoft first-party apps for exclusion. Use Graph API with Custom Security Attributes to tag 1P service principals, then filter them in CA policy via application filter.

## Prerequisites
- Attribute Definition Administrator role
- Application with `Application.ReadWrite.All` and `CustomSecAttributeAssignment.ReadWrite.All` permissions

## Steps

### 1. Create Custom Security Attribute
Create a **string** type custom attribute via Entra Portal (`https://entra.microsoftonline.cn/` for 21V).
Reference: [Add custom security attribute definitions](https://learn.microsoft.com/en-us/entra/fundamentals/custom-security-attributes-add)

### 2. Find Service Principal ID
```http
GET https://microsoftgraph.chinacloudapi.cn/v1.0/servicePrincipals(appId='{app-id}')
```
If 404 returned, create it:
```http
POST https://microsoftgraph.chinacloudapi.cn/v1.0/servicePrincipals
Body: { "appId": "<app id>" }
```

### 3. Assign Custom Attribute to Service Principal
```http
PATCH https://microsoftgraph.chinacloudapi.cn/v1.0/servicePrincipals/<sp-id>
Body:
{
  "customSecurityAttributes": {
    "<attributeSetName>": {
      "@odata.type": "#Microsoft.DirectoryServices.CustomSecurityAttributeValue",
      "<attributeName>": "<value>"
    }
  }
}
```

### 4. Configure CA Policy
Use application filter in CA policy to exclude apps with the matching custom attribute.

## Apps Required for My Sign-Ins / Security Info Access
| Application Name | App ID |
|---|---|
| Mysignins | `19db86c3-b2b9-44cc-b339-36da233a3be2` |
| Microsoft App Access Panel | `0000000c-0000-0000-c000-000000000000` |
| Windows Azure Active Directory | `00000002-0000-0000-c000-000000000000` |
| Microsoft password reset service | `93625bc8-bfe2-437a-97e0-3d0060024faa` |
| Microsoft Graph | `00000003-0000-0000-c000-000000000000` |
| AADReporting | `1b912ec3-a9dd-4c4d-a53e-76aa7adb28d7` |
| Azure Credential Configuration Endpoint Service | `ea890292-c8c8-4433-b5ea-b09d0668e1a6` |
| Office365 Shell WCSS-Server | `5f09333a-842c-47da-a157-57da27fcbca5` |

After excluding these apps, users can:
1. Register and modify MFA
2. Register SSPR, confirm, and change password

## 21V Applicability
Applicable — use `microsoftgraph.chinacloudapi.cn` endpoint and `entra.microsoftonline.cn` portal.

## Future
Microsoft is working on automatically onboarding all 1P apps to CA (Epic 2618021). My Sign-ins / My Security-Info will be exposed as a cloud app in CA.
