---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Outdated? - Needs review if still useful/Host pool access based on AAD auth context/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1787852"
importDate: "2026-04-06"
type: troubleshooting-guide
note: "Private Preview content – marked 'Outdated/needs review'. Internal only."
contributor: "Robert Klemencz"
---

# Host Pool Access Based on AAD Authentication Context – Setup Guide

> ⚠️ **Stop**: Content in development, not ready for consumption. Internal Microsoft only.
> Private Preview features. Public Preview NOT started.

[[_TOC_]]

## Pre-requisites
- Azure subscription + Global Admin role
- M365 E5 license

---

## 1. Install Private PowerShell Module

1. Open PowerShell as administrator.
2. Run:
   ```powershell
   Install-Module -Name Az -Repository PSGallery -Force
   Install-Module -Name Az.DesktopVirtualization -Repository PSGallery -Force
   $env:PSModulepath  # confirm PS module path
   ```
3. Delete contents of `Az.DesktopVirtualization` folder in PS path (keep folder).
4. Copy private module contents into `Az.DesktopVirtualization` folder.
5. Run `Import-module az.desktopvirtualization`
6. Run `Set-ExecutionPolicy Unrestricted`

---

## 2. Create an Authentication Context in Entra Portal

Steps:
1. Go to [Microsoft Entra Conditional Access](https://aad.portal.azure.com/#blade/Microsoft_AAD_IAM/ConditionalAccessBlade) → **Manage** → **Authentication context**
2. Select **New authentication context**
3. Enter name + description, check **Publish to apps**. Example:
   - Name: `Building A IP address`
   - Description: `Auth context for users connecting from IP addresses in Building A`
4. Click **Save**

---

## 3. Create a Conditional Access Policy

1. In Entra Conditional Access → **New policy**
2. Name the policy
3. **Users and groups** tab → Select users/groups the auth context applies to
4. **Cloud apps or actions** tab → Select **Authentication context** → choose the context created above
5. **Grant** tab → Select the Terms of Use
6. Enable and **Create**

> The authentication context will be applied directly to the AVD host pool via a connection policy (see below).

---

## 4. Prepare PowerShell Modules & Create AVD Environment

```powershell
Register-AzResourceProvider -ProviderNamespace Microsoft.DesktopVirtualization

# May or may not be needed
Install-module -name az.avd

# Required
Install-Module -Name Az.DesktopVirtualization

# Install Microsoft Graph for Entra group admin
Install-Module Microsoft.Graph
Connect-MgGraph -Scopes "Group.ReadWrite.All"
Connect-azaccount
```

### Create Security Group, VNet, Host Pool with Connection Policy

```powershell
# Create security group
$param = @{
  description="All users with AVD access"
  displayName="All AVD Users"
  mailEnabled=$false
  securityEnabled=$true
  mailNickname="allavdusers"
}
New-MgGroup @param

# Create resource group
new-azresourcegroup DemoAVDenv -Location "Canada Central"

$vnet = @{
    Name = 'vnet-1'
    ResourceGroupName = 'DemoAVDenv'
    Location = 'canadacentral'
    AddressPrefix = '10.100.0.0/16'
}
$virtualNetwork = New-AzVirtualNetwork @vnet

$subnet = @{
    Name = 'subnet-1'
    VirtualNetwork = $virtualNetwork
    AddressPrefix = '10.100.0.0/24'
}
$subnetConfig = Add-AzVirtualNetworkSubnetConfig @subnet
$virtualNetwork | Set-AzVirtualNetwork

# Create connection policy with auth context
New-AzWvdConnectionPolicy -ResourceGroupName DemoAVDenv -Name SwitzerlandConnectionPolicy -Location 'canadacentral' -AuthenticationContext 'C3'

# Create host pool with connection policy
$parameters = @{
    Name = 'SwitzerlandHostPool'
    ResourceGroupName = 'DemoAVDenv'
    HostPoolType = 'Pooled'
    LoadBalancerType = 'BreadthFirst'
    PreferredAppGroupType = 'Desktop'
    MaxSessionLimit = '4'
    Location = 'canadacentral'
    ConnectionPolicyArmPath = "/subscriptions/<subId>/resourcegroups/DemoAVDenv/providers/Microsoft.DesktopVirtualization/connectionPolicies/SwitzerlandConnectionPolicy"
}
New-AzWvdHostPool @parameters

# Create workspace + app group
New-AzWvdWorkspace -Name Switzerland -ResourceGroupName DemoAVDenv -location canadacentral
$hostPoolArmPath = (Get-AzWvdHostPool -Name $parameters.name -ResourceGroupName $parameters.ResourceGroupName).Id
$parameters = @{
    Name = 'SwitzerlandAppGroup'
    ResourceGroupName = 'DemoAVDenv'
    ApplicationGroupType = 'Desktop'
    HostPoolArmPath = $hostPoolArmPath
    Location = 'canadacentral'
}
New-AzWvdApplicationGroup @parameters
$appGroupPath = (Get-AzWvdApplicationGroup -Name SwitzerlandAppGroup -ResourceGroupName DemoAVDenv).Id
Update-AzWvdWorkspace -Name Switzerland -ResourceGroupName DemoAVDenv -ApplicationGroupReference $appGroupPath

# Assign user to app group
$parameters = @{
    SignInName = 'john@contoso.onmicrosoft.com'
    ResourceName = 'SwitzerlandAppGroup'
    ResourceGroupName = 'DemoAVDenv'
    RoleDefinitionName = 'Desktop Virtualization User'
    ResourceType = 'Microsoft.DesktopVirtualization/applicationGroups'
}
New-AzRoleAssignment @parameters

# Assign user group to VM User login role
$AVDuserGroup = (Get-AzADGroup -DisplayName $param.displayname).id
New-AzRoleAssignment -ObjectId $AVDuserGroup -RoleDefinitionName "Virtual Machine User Login" -ResourceGroupName DemoAVDenv
```

---

## 5. Add Users to Group and Assign Licenses

In Azure portal:
1. Add test accounts to **All AVD Users** group
2. Assign M365 E5 licenses accordingly

---

## 6. Add Session Hosts to Host Pool

Azure Virtual Desktop → Host Pools → Manage → Session Hosts → **Add**

1. Click the banner → **Generate New Key** → set expiry date → OK
2. Click **Add** again
3. Click **Next: Virtual Machines**, configure:
   - **Name Prefix**: Demo
   - **Availability Options**: No infrastructure redundancy required
   - **Image**: Windows 11 Enterprise multi-session, Version 23H2 + Microsoft 365
   - **Virtual Machine size**: (e.g., B2ms)
   - **Number of VMs**: 2
   - **OS disk type**: Standard HDD
   - **Virtual Network**: vnet-1
   - **Directory join**: Microsoft Entra ID
4. Click **Review+Create** → **Create** (process takes ~20-30 min)
