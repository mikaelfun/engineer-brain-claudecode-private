---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/WCX Specific Content/OCE APIs/Rename CloudPC"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FWCX%20Specific%20Content%2FOCE%20APIs%2FRename%20CloudPC"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Rename CloudPC (OCE API)

> This information should only be followed by WCX PMs and SaaF teams. These steps do not apply to CSS.

## JIT Access Preparation

1. If not Torus enrolled, follow SaaF Tours
2. Join **CMDCPCSupport** eligibility at OSP Identity (8 hours provisioning)
3. JIT elevate:
   ```
   Request-AzureAdGroupRoleElevation -GroupName 'CMDCPCSupport-JIT-PE-PlatformServiceOperator' -Reason "<reason>"
   ```
4. **[SAW Enforced]** Navigate to Geneva Action portal, login with Torus account

## Rename Steps

Navigate to: CloudPC OCE > Provision Actions > Create VmExtension Request

Use **CPCD Tool** to get:
- **Endpoint** = ScaleUnit
- **Tenant ID** = TenantId of the customer
- **DeviceID** = DeviceId of CloudPC
- **Computer Name** = Original CloudPC Name

RunVmExtension parameter:
```json
{
  "scriptName": "SetComputerName",
  "devices": [
    {
      "deviceId": "XXX",
      "parameters": {
        "ComputerName": "XXX",
        "NeedRestart": ""
      }
    }
  ]
}
```

Confirm with customer if the CPC name has been changed after execution.
