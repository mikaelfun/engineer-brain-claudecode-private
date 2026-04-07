# How to Setup Autopilot V2 (Windows Device Preparation)

## Prerequisites
- Windows 11 (2024 March D release or later)
- Entra ID P1 license
- Intune license
- Nested Hyper-V tip: Use Azure VM Standard_F4s_v2 with Win11 in Hyper-V for testing

## Step 1: Register Intune Provisioning Client (21v Required)

In 21Vianet (China) environments, the SP must be manually registered:

```powershell
Install-Module AzureAD
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud
New-AzureADServicePrincipal -AppId f1346770-5b25-470b-88bd-d5744ab7952c
```

This SP (Intune Provisioning Client) is required for Enrollment Time Grouping (ETG) to work.

## Step 2: Create Corporate Device Identifier (Optional)

### Get Device Info via PowerShell
```powershell
Get-WmiObject -Class Win32_ComputerSystem | FL Manufacturer, Model
Get-WmiObject -Class Win32_BIOS | FL SerialNumber
```

### CSV Format
```
Manufacturer,Model,SerialNumber
```

### Upload
1. Open Intune portal > Devices > Enrollment
2. Click Corporate device identifiers > Add > Upload CSV file
3. Select "Manufacturer, model and serial number (Windows only)"

**Warning**: Identifiers take time to propagate. Enrolling too fast with personal enrollment blocked leads to error **80180014**.

## Step 3: Create Security Group for ETG

1. Open portal > Groups > All groups > New group
2. Group type: Security
3. Membership type: Assigned
4. **Owners**: Add **Intune Provisioning Client** (f1346770-5b25-470b-88bd-d5744ab7952c)

The device is automatically added to this group during enrollment.

## Step 4: Create Device Preparation Profile

1. Intune portal > Devices > Enrollment > Device preparation policies
2. Click Create
3. Select device security group (from Step 3)
4. Configure deployment settings
5. Add applications (up to 10, optional)
6. Add PowerShell scripts (up to 10, optional)
7. Assign to user group

## Step 5: Deploy and Monitor

### Enrollment Flow
1. Device boots to OOBE > select "Work or school"
2. Enter corporate credentials
3. No organization branding shown (by design - V2 gets profile after login)
4. Device preparation page shows installation progress
5. Configure Windows Hello for Business (if policies exist)

### Monitor Results
- Check device is member of the ETG security group
- Devices > Monitor > Windows Autopilot device preparation deployments

## 21v Portal URLs
- Intune admin center: https://intune.microsoftonline.cn
- Groups: via Intune portal or Entra portal

## Known Issues
- Enterprise OS hides some OOBE options; Pro OS shows them
- Error 80180014: Corporate identifier not yet propagated
- ETG fails without Intune Provisioning Client SP as group owner
