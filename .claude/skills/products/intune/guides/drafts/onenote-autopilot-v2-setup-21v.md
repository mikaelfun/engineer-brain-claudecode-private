# How to Setup Autopilot V2 in 21Vianet China

## Lab Environment
Azure VM Standard_F4s_v2 with nested Hyper-V for Win11 testing.
Ref: https://techcommunity.microsoft.com/blog/itopstalkblog/how-to-run-a-windows-11-vm-on-hyper-v/3713948

## Step 1: Create Intune Provisioning Client Service Principal (21v)
```powershell
Install-Module AzureAD
Connect-AzureAD -AzureEnvironmentName AzureChinaCloud
New-AzureADServicePrincipal -AppId f1346770-5b25-470b-88bd-d5744ab7952c
```

## Step 2: Corporate Device Identifier (Optional)
Get device info:
```powershell
Get-WmiObject -Class Win32_ComputerSystem | FL Manufacturer, Model
Get-WmiObject -Class Win32_BIOS | FL SerialNumber
```
Create CSV format: `Manufacturer,Model,Serialnumber`

Upload: Intune portal > Devices > Enrollment > Corporate device identifiers > Upload CSV

**Important**: Wait for identifiers to be processed before enrolling. Error 80180014 occurs if enrollment is attempted too quickly while personal device enrollment is blocked.

## Step 3: Create Security Group for ETG
1. Portal: intune.microsoftonline.cn > Groups > New group
2. Type: Security, Membership: Assigned
3. Add **Intune Provisioning Client** (f1346770-5b25-470b-88bd-d5744ab7952c) as Owner

## Step 4: Create Device Preparation Profile
1. Intune portal > Devices > Enrollment > Device preparation policies > Create
2. Select ETG security group (must have Intune Provisioning Client as owner)
3. Configure deployment settings (standard user option available)
4. Add up to 10 applications (optional)
5. Add up to 10 PowerShell scripts (optional)
6. Assign to user group

## Step 5: Deploy
1. OOBE: select "work or school"
2. Login with corporate credentials
3. No org branding during login (by design - profile loaded post-login, unlike V1)
4. On Pro OS: additional prompts shown (hidden on Enterprise)
5. Configure WHfB if policies in place

## Step 6: Monitor
- Device should auto-join ETG security group
- Devices > Monitor > Windows Autopilot device preparation deployments
- Verify enrollment completed status

## Network Requirements (21v China)
See known-issue intune-onenote-406 for required URL whitelist.
