# CA Policy Enforcement Change for Low-Privilege Scopes

## Background

Microsoft is changing how Conditional Access evaluates low-privilege scopes. Previously, if an app requested ONLY low-privilege scopes, CA policies with "All resources" + exclusions would not apply. After the change, CA policies WILL be enforced.

**Affected scopes (Public clients):** email, offline_access, openid, profile, User.Read, People.Read
**Affected scopes (Confidential clients, additional):** User.Read.All, User.ReadBasic.All, GroupMember.Read.All, Member.Read.Hidden

**Applies to:** All cloud instances including 21V (Mooncake).

**Only affects:** Policies using "All resources" with resource exclusions.

## Impact Assessment

### Step 1: Detect Impacted Applications (Low-Privilege Scope Audit)

**Prerequisites:**
1. Register app with `http://localhost` as redirect URI
2. Grant delegated permissions: DelegatedPermissionGrant.Read.All, Directory.Read.All, Application.Read.All, Reports.Read.All

**Script:** `Audit-LowPrivScopeImpact.ps1 -TenantId $tenant -ClientId $clientid`

The script:
- Uses Device Code Flow (no MgGraph SDK dependency)
- Supports Azure China via `-Environment China`
- Classifies apps as First-Party/Third-Party/Self-Registered
- Includes 7-day sign-in count per app
- Identifies apps with ONLY baseline scopes (these are affected)

**China endpoints:**
```
$uri = "https://microsoftgraph.chinacloudapi.cn/beta/oauth2PermissionGrants?$select=clientId,scope"
$spUri = "https://microsoftgraph.chinacloudapi.cn/beta/servicePrincipals/$($c.ServicePrincipalObjectId)?$select=id,appOwnerOrganizationId"
```

### Step 2: Audit Azure AD Graph Permissions

**Script:** `Audit-AADGraphPermissions.ps1 -tenantId $tenantId -clientId $clientId`

Identifies all apps with permissions to Azure AD Graph (00000002-0000-0000-c000-000000000000), including:
- Delegated permission grants
- Application permission assignments
- High-privilege permission flagging (Directory.ReadWrite.All, Application.ReadWrite.All, etc.)

### Step 3: Update CA Policy Exclude List

**Script:** `update-capolicy.ps1 -tenantId $tenant -clientId $clientId -policyId $policyId -appIdtoExclude $appid`

Features:
- Supports cp1 client capability declaration
- Auto-detects and responds to acrs authentication context requirements (claims challenges)
- Device Code Flow for delegated permissions

## Recommendations

1. **Self-Registered apps:** Modify app code to request additional scopes beyond the baseline list
2. **First-Party apps:** Exclude Azure AD Graph (00000002-0000-0000-c000-000000000000) from CA policy, or create separate lighter CA policy
3. **Third-Party apps:** Contact vendor, or exclude specific app from CA policy (confidential clients only)
4. **Security review:** Ensure no increased security risk when adding Windows Azure Active Directory resource in CA exclude list. Use separate CA policy for high-privilege apps requiring MFA.

## References

- [Targeting Resources in CA Policies](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-cloud-apps)
- [Upcoming CA change blog](https://techcommunity.microsoft.com/blog/microsoft-entra-blog/upcoming-conditional-access-change-improved-enforcement-for-policies-with-resour/4488925)
- Message Center: MC1224563

## Source

OneNote: Mooncake POD Support Notebook / Conditional Access / Case study / Incoming change for CA policy enforcement
