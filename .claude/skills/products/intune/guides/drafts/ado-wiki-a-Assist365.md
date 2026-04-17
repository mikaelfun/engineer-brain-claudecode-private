---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tools/Assist365"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FAssist365"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Assist365

Assist365 is a support tool that is used to view select customer data for troubleshooting problems. In the context of Intune support, the data that is viewed is generally: subscription information, policy configurations, device information, user information, assignment targeting, etc.

> Note: As of August 2024, Assist365 is only supported in the commercial cloud. GCC-H support is being evaluated and having test development done, but there is no available ETA for when production support might happen.

## When to use Assist365
- Find the customer configured settings for an Intune deployed policy
- Validate the assignments for a customer configured policy
- Evaluate Autopilot logs
- Confirm the RBAC roles assigned to a user
- Identify customer configured enrollment restrictions and their assignments

## How to get permission to access to Assist365
Accessing Assist365 has several pieces:
1) Getting a Modern Identity (MID) account
2) Get and setup a Yubikey
3) Getting a CloudPC (Titan/Gladiator)
4) Being provisioned in AMT

### Getting a Modern Identity (MID) account
1) Submit a vizops ticket at: https://aka.ms/visops
   - Action: MID - Create Account
   - Tool: Modern Identity Account (MID)
   - Description: Need MID account created for `<putAliasHere>`
2) Vizops team provisions the account → sends details via email. MID format: `alias@microsoftsupport.com`

### Get and setup a Yubikey
1) [Order a YubiKey](https://cloudmfa-support.azurewebsites.net/SecurityKeyServices/SecurityKey) — choose USB device type
2) [Setup YubiKey](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1475938/YubiKey-MID)

### Getting a CloudPC (Titan/Gladiator)
- Titan = Windows365 VM (full machine login)
- Gladiator = Remote Desktop App tunnelling an Edge browser to the Titan machine (recommended for Assist365 use)
- If Cloud PC Enterprise is not visible in Remote Desktop, create VisOps ticket: action "Titan VDI - Provision Titan/CPC"

### Being provisioned in AMT
Handled by your manager. Contact them if you cannot access Assist365 after completing above steps.

## I think I am ready to access Assist365, now what?
1. Plug in YubiKey
2. Launch Remote Desktop app → Launch Gladiator Edge icon for nearest region
3. Sign in with "security key" → enter PIN → touch YubiKey if prompted
4. Navigate to appropriate instance:
   - DFM-WW cases: https://assist.microsoft.com/
   - DFM-EU cases: https://eu.assist.microsoft.com/
   - Bookmarks may take 10-15 seconds to appear after launch

## How to use Assist365

### Basics
- Cases you own (including collabs) are listed on home page
- To view a tenant not connected to your case: search in top bar and request JIT
- **JIT tip**: When requesting JIT, select the other user's MID account (`@microsoftsupport.com`) — not their corp account — or they won't be able to approve

### Tenant
- **Details**: High-level tenant info
- **Subscriptions**: Lists all subscriptions and active status. For license confirmation per user, use ASC.
- **Administrators**: Lists types of administrators
- **Domains**: All domains connected to the tenant
- **Health**: Current service health postings for the tenant
- **Message center**: Current message center postings

### Intune Application — Key Sections

#### Tenant Overview
- ASU (Scale Unit) the tenant is on (needed for ICMs)
- AccountId, ContextId, DeviceCount, MDM Authority, Flighting Tags

#### Application
View all configured applications, assignments, installation history, etc.

#### Assignment Filters
View configured assignment filters.

**Example**: iPhones not showing app in Company Portal
- Review app assignments → check filter rule → filter targets only iPad devices → cause identified

#### Autopilot
Review ESP profiles, deployment profiles, device logs, failed Autopilot device info.

#### Device
View device details: last contact time, OS version, enrollment type, comanagement workloads.

**Example**: Device config policy not applying to comanaged Windows device
- Check `managementAgent = ConfigManagerMDMClient` → device is comanaged
- Get `SCCMCoManagementFeatures` → check via ConfigMgr Toolbox (Flags & Enums > Client Co-Management Workloads)
- If `ConfigSettings` not listed → policy not managed by Intune

#### Device Logs
- **PowerLift Logs**: View logs uploaded via Company Portal. If not found by easyID, try https://aka.ms/powerlift
- **Device Diagnostics**: View logs from "Collect Diagnostics" remote action in Intune Admin Center

#### Graph Explorer
Run queries against select Graph API endpoints in customer tenant.
- [Graph helper dashboard](https://aka.ms/assistgraphhelper) guides to the right query per platform/policy type

**Example**: Find policy settings for Windows Settings Catalog policy by name
1. Use `deviceManagement/configurationPolicies` → find policy by name → get id
2. Use `deviceManagement/configurationPolicies/{id}/settings`
3. Use `deviceManagement/configurationPolicies/{id}/assignments`

#### Enrollment
- **Enrollment Restrictions**: View platform restrictions and device limit restrictions
- **Platform Onboarding**: Confirm OS platform isn't fully disabled (`IsPlatformEnabled=False`)
- **User Enrollment Failures**: Check failure info for a specific user
- **Account Enrollment Failures**: Tenant-wide failure info (limited to 100 most recent)
- **Queries**: Generate Kusto queries for enrollment failure investigation

#### KRave
- **Compliance History**: Compliance status at current/past moment for a device
- **Policy Processing**: Overall status for all applicable policies on a device

#### Kusto Explorer (Snapshot clusters)
> ⚠️ Due to SFI, access to Qrybkradxxxxxx clusters removed from standard Desktop/Web Kusto. Kusto Explorer is now the ONLY way to query these clusters.

To use:
1) Click **Select Database** → select the Qrybkradxxxxxx cluster needed
2) Write query — MUST include `let currentTenantId = "Customer-IntuneAccountId";` variable

```kusto
let currentTenantId = "Customer-IntuneAccountId";
YourTable
| where AccountId == currentTenantId
| where YourClause
| project ...
```

#### MAM (App Protection / Configuration)
Review configured MAM policies and MAM-supported apps installed by a user.

#### Policy
View configured settings, assignments for many policy types.
- Settings names = service names (not portal display names); enum values = numeric codes
- Reference: [Graph API docs](https://learn.microsoft.com/en-us/graph/api/resources/intune-device-mgt-conceptual?view=graph-rest-beta)

#### User
Lists user details. Good for validating user is licensed and not disabled.

## Request JIT for a Tenant
For lab testing (Snapshot Kusto queries) or tenant comparison without an existing case:
1. Search by Tenant ID on Assist365 search box (EU tenants → EU portal)
2. When denied access prompt appears → Create JIT request with reason + justification + 2 approvers
3. Approvers must have Rights to approve. Once approved: 8h access window.

## Assist365 Support
- Bugs/critical alerts (Assist down): See [Assist365 wiki](https://supportability.visualstudio.com/ModernStack/_wiki/wikis/Assist%20KB/756936/Report-Issues-with-Assist-365)
- Feature requests: [Intune Suggestion Box](/Engineer-Reference/Intune-Suggestion-Box)
