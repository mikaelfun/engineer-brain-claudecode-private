# Configure GPO for Automatic MDM Enrollment (Intune)

## Purpose
Auto-enroll hybrid Azure AD joined Windows devices into Intune via Group Policy.

## Prerequisites
- On-premises Active Directory with hybrid Azure AD join configured
- Azure AD Connect syncing device objects
- Intune licenses assigned to users
- Windows 10/11 Pro or Enterprise

## Steps

### 1. Create OU for Target Devices
- Open Active Directory Users and Computers
- Create a new OU (e.g., "Autopilot Devices") under the domain
- Move target hybrid-joined devices into this OU

### 2. (Optional) Create Device Security Group
- Under Users, create a security group for security filtering
- Add target device objects to this group
- **Note**: Device group membership may require a **device restart** to take effect

### 3. Create and Configure GPO
- Open Group Policy Management
- Right-click the OU > Create a GPO and link it
- Edit the GPO:
  - Navigate to: Computer Configuration > Policies > Administrative Templates > Windows Components > MDM
  - Enable: **"Enable automatic MDM enrollment using default Azure AD credentials"**

### 4. (Optional) Configure Security Filtering
- If using a device security group for targeted deployment:
  - On the GPO Delegation tab > Advanced: uncheck "Apply group policy" for **Authenticated Users**
  - Add the device security group to Security Filtering
- **Important**: Without removing Authenticated Users from Apply, the security group filter is ineffective because all devices in the OU are part of Authenticated Users

### 5. Verify on Client Device
```cmd
gpupdate /force
gpresult /r       # Quick view - check if GPO is applied
gpresult /v       # Detailed view - confirm MDM enrollment GPO
```

### 6. Confirm Scheduled Task
- On the client device, open Task Scheduler
- Verify the MDM auto-enrollment scheduled task has been created
- The task triggers enrollment with Intune using AAD credentials

## Troubleshooting
- If GPO shows "Denied (Security Filtering)": verify device is in the security group and has restarted
- If enrollment doesn't trigger: check Task Scheduler for the MDM enrollment task and verify its status

## References
- [Enroll a Windows 10 device automatically using Group Policy](https://docs.microsoft.com/en-us/windows/client-management/mdm/enroll-a-windows-10-device-automatically-using-group-policy)
