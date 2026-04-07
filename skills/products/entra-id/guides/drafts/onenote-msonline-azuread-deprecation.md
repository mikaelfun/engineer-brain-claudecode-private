# MsOnline/AzureAD PowerShell Module Deprecation

## Timeline

| Module | End of Support | Retirement |
|--------|---------------|------------|
| MSOnline | March 30, 2025 | Early April – Late May 2025 |
| AzureAD | March 30, 2025 | After July 1, 2025 |

**National Clouds (Mooncake/Gallatin)**: Trail PROD by 3 weeks. MSOnline retirement starting April 29, 2025. Legacy Connect Sync wizard impact from May 21, 2025.

## Impact

- MSOnline cmdlets fail with 403 error during outage windows
- After retirement: permanent failure for all MSOnline calls
- AzureAD module shutdown begins after MSOnline is fully retired

## Identify Usage

- Entra Sign-in logs → Application Name "Azure Active Directory PowerShell" shows client IP and user info
- Entra Recommendations: "Migrate Service Principals from retiring Azure AD Graph APIs to Microsoft Graph"
- New recommendation: "Migrate from retiring MSOnline and AzureAD PowerShell usage to Microsoft Graph PowerShell"

## Migration Path

1. **MSOnline → Microsoft Graph PowerShell SDK** or **Microsoft Entra PowerShell**
2. Cmdlet mapping: https://learn.microsoft.com/en-us/powershell/microsoftgraph/azuread-msoline-cmdlet-map
3. Compatibility adapter: `Microsoft.Graph.Compatibility.AzureAD` (PowerShell Gallery) - aliasing for AzureAD scripts

## Customer Actions

1. Point to public notification: https://aka.ms/msonlineretirement
2. Wait for temporary outage to end (max 24 hours) if during scream test
3. Migrate scripts using cmdlet mapping guide
4. For Entra Connect: upgrade to 2.4.18.0+ (commercial) or 2.4.21.0+ (Mooncake)

## Extension Requests

- General: No extensions available (top security risk)
- Complex cases: Can request through April 30 via IcM to "AAD Distributed Directory Services / Programmability Infra"
- Email: aadgraphandlegacypsr@microsoft.com

## Resources

- https://aka.ms/msonlineretirement
- https://learn.microsoft.com/en-us/powershell/microsoftgraph/overview
- https://learn.microsoft.com/en-us/powershell/microsoftgraph/migration-steps

---
*Source: OneNote - Mooncake POD Support Notebook*
