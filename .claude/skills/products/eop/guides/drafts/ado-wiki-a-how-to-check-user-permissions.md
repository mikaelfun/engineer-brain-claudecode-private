---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/MDO Permissions/How to check user permissions"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FMDO%20Permissions%2FHow%20to%20check%20user%20permissions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Check User Permissions

## Entra ID

### From Configuration in Portal
Navigate to user in Microsoft 365 admin center or Entra admin center, check assigned roles. Ensure UPN matches (different users can share same names).

### From Runtime Info in Console/Network Trace

#### Offline: OAuth Tokens in HAR
1. Find OAuth token (starts with `eyJ0eXAiOi`) in HAR file:
   - From `id_token` in POST to `https://security.microsoft.com/`
   - From `Token` in GET response to `/api/Auth/getToken...`
2. Decode at https://jwt.ms/ - check `wids` claim
3. Map `wids` values to roles:
   - `62e90394-69f5-4237-9190-012177145e10` = Global Administrator
   - `b79fbf4d-3ef9-4689-8143-76b194e85509` = Member inside resource tenant
   - `13bd1c72-6f4a-4dcf-985f-18d3b80f208a` = B2B guest
   - `134c601c-7c57-419c-8477-b940a74c85ff` = NativeFederation (B2B Direct Connect)
   - `08372b87-7d02-482a-9e02-fb03ea5fe193` = GDAP

#### Offline: DirRoles in TenantContext
See Microsoft XDR URBAC wiki for details.

#### Online: Console Commands
With customer on live session in Defender/Purview portal:

```js
// Get cached OAuth token
$host.auth.tokenCache['https://portal.office.com'].token

// Check specific Entra role
await $host.auth.isInRole("aad:62e90394-69f5-4237-9190-012177145e10")

// Using aliases
await $host.auth.isInRole("IsAadCompanyAdmin")

// Multiple roles at once
await $host.auth.isInRoles(["IsAadCompanyAdmin","IsAadAttackSimulatorAdmin","IsAadSecurityAdmin"])

// List all aliases
$host.auth.rbacService.roleAliases
```

### From PowerShell
```powershell
Connect-Entra -Scopes "RoleManagement.Read.Directory","User.Read.All","EntitlementManagement.Read.All" -NoWelcome
Get-EntraDirectoryRoleAssignment -Filter "PrincipalId eq '<ObjectId>'"
```
