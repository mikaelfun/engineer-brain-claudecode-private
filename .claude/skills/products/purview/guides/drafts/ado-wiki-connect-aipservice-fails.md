---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AIP Service/Troubleshooting Scenarios: AipService/Scenario: Connect-AIPService fails"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/AIP%20Service/Troubleshooting%20Scenarios%3A%20AipService/Scenario%3A%20Connect-AIPService%20fails"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scenario: Connect-AIPService cmdlet fails or returns errors

This TSG describes how to troubleshoot issues with connecting to AIP Service using PowerShell command Connect-AIPService.

## Prerequisites

- Access to the AIP service PowerShell, which will need Global Admin / AIP admin / Compliance administrator / Compliance data administrator / Azure Information Protection administrator role assigned.
- For Global Administrator role you need to add the user as a direct member of this role.

## Request Flow for Connect-AIPService

1. Client connects to `discover.aadrm.com` and sends a **ServiceLocator** request
   - If successful, the service responds with authentication challenge
2. User enters credentials and acquires an authentication token from EntraID
3. Client sends request again to `discover.aadrm.com` with the acquired token
   - AIP service validates credentials and checks Global admin privilege
   - AIP service finds the corresponding AIP admin url for this tenant
   - AIP admin url is returned as ServiceLocationResponse
4. Client connects to the AIP service admin url and the connection is completed

## Step-By-Step Troubleshooting

### Step 1: Check AIPService PowerShell Module is installed

- Run: `Get-Module -ListAvailable -Name aipservice`
- Verify the build number is up-to-date: [PowerShell Gallery | AIPService](https://www.powershellgallery.com/packages/AIPService/)
- If not installed: `Install-Module -Name AIPService`

### Step 2: AIPService module doesn't support PowerShell 7

- Make sure to run Connect-AIPService from PowerShell 5 window

### Step 3: Verify if the Credential box is prompted

- If credential box is not prompted → connection to `discover.aadrm.com` is failing → proceed to Step 5
- If failure occurs after entering credentials → verify username and password are correct

### Step 4: Verify the user is a direct member of Global Administrator or AIP service rolebased Admin

- Even if the user has Global Administrator privilege granted as part of a group, Connect-AIPService will fail
- Must add user as direct member of Global Administrator
- Or use [Add-AipServiceRoleBasedAdministrator](https://learn.microsoft.com/en-us/powershell/module/aipservice/add-aipservicerolebasedadministrator?view=azureipps)

### Step 5: Run with -Verbose parameter

```powershell
Connect-AipService -Verbose
```

- Check if error details are Network or SSL related
- If SSL/Network related:
  - Ensure TLS 1.2 or above are enabled on the machine
  - Verify required cipher suites are enabled (compare TLS handshake with working machine)
  - Verify network requirements for AIP service: [Requirements for Azure Information Protection](https://learn.microsoft.com/en-us/azure/information-protection/requirements#firewalls-and-network-infrastructure)
  - Verify connection to AIP endpoints is successful

### Step 6: Get Assistance

If above steps do not resolve the issue, escalate with:
- Command output with **-Verbose** parameter
- Error details and correlationID
