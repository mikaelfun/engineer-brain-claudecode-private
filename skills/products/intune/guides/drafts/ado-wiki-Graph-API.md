---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Develop and Customize/Graph API"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevelop%20and%20Customize%2FGraph%20API"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Intune Graph API Troubleshooting Guide

## Common Endpoints

| Resource | Endpoint |
|----------|----------|
| Managed Devices | `GET /deviceManagement/managedDevices` |
| Compliance Policies | `GET /deviceManagement/deviceCompliancePolicies` |
| Config Profiles | `GET /deviceManagement/deviceConfigurations` |
| Mobile Apps | `GET /deviceAppManagement/mobileApps` |
| App Protection | `GET /deviceAppManagement/managedAppPolicies` |
| Detected Apps | `GET /deviceManagement/detectedApps` |
| Autopilot Devices | `GET /deviceManagement/windowsAutopilotDeviceIdentities` |
| Scripts | `GET /deviceManagement/deviceManagementScripts` |

## Permission Change (Sep 2025)
New permissions required:
- `DeviceManagementScripts.Read.All` replaces `DeviceManagementConfiguration.Read.All`
- `DeviceManagementScripts.ReadWrite.All` replaces `DeviceManagementConfiguration.ReadWrite.All`
- Affects: deviceShellScripts, deviceHealthScripts, deviceComplianceScripts, deviceCustomAttributeShellScripts, deviceManagementScripts

## Support Boundaries
- Only publicly documented endpoints (v1.0/beta) are supported for manual use
- Portal-only endpoints are restricted and unsupported for external use
- Intune will NOT write scripts for customers (MIT-licensed samples available at microsoft.github.io/webportal-intune-samples)
- Always prefer v1.0 over beta for production

## Troubleshooting Steps
1. Gather: endpoint URL, error code, auth method, permissions
2. Test in Graph Explorer (aka.ms/ge) to isolate issue
3. Use F12 network trace on Intune portal to find actual API calls used
4. Check 400 errors: see Resolve Authorization Errors doc
5. Check 500 errors: may need PG escalation, confirm with SMEs first

## Known Issues
- `$expand=detectedApps` returns null Publisher — use separate detectedApps endpoints instead
- Some properties (e.g., physicalMemoryInBytes) not returned without `$select`

## App Registration for Application Permissions (PowerShell)
1. Create App Registration in Entra ID
2. Create Client Secret (copy immediately, shown only once)
3. Add API Permissions > Microsoft Graph > Application > needed permissions
4. Grant admin consent
5. Connect: `Connect-MgGraph -TenantId $tid -ClientSecretCredential $cred`
6. Call: `Invoke-MgGraphRequest -Method GET <url>`

## Scoping Questions
1. Target endpoint/URL? (v1.0/beta/undocumented?)
2. Error message/code?
3. How making call? (PowerShell/Graph Explorer/custom app)
4. Permissions granted?
5. Previously worked?
6. Expected vs actual response?

## Error Codes Reference
- https://learn.microsoft.com/en-us/graph/errors
- https://learn.microsoft.com/en-us/graph/resolve-auth-errors

## SME Contact
Apps-Development Teams Channel
