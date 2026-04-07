# Intune Enrollment Methods After Azure AD Join (AADJ)

> Source: Case 2403290030002442

## Scenario

Device completed AADJ during OOBE but was not auto-enrolled to Intune because the user was not yet in the MDM auto-enrollment group. After the user is added to the group and assigned an Intune license, how to enroll the device?

## Enrollment Methods Comparison

| Pre-condition | Action | Result | Intune Ownership |
|---|---|---|---|
| N/A | Enroll only in Device Management | Registration will not happen; Intune device is Personal Own | Personal |
| AADJ | Connect | Registration will not happen; device binds to AADJ one | Personal |
| AADJ | Enroll only in Device Management | Registration will not happen; device binds to AADJ one | Personal |
| N/A | Auto-Enroll + Connect | Registration will happen | Corporate |
| AADJ | GP enroll | Registration will not happen; device binds to AADJ one | Corporate |

## Key Findings

### OOBE Auto-Enroll (Baseline)
- Enrollment type: `6 (MDMDeviceWithAAD)` 
- Device ownership: Corporate
- UI shows Microsoft logo

### Manual "Enroll only in Device Management"
- Enrollment type: `0 (MDMFull)` - BYOD enrollment
- Device ownership: Personal
- UI shows briefcase icon
- May have limitations with IME, AAD CA, etc.

### Group Policy Auto-Enroll (Recommended for post-AADJ)
- Enrollment type: `6 (MDMDeviceWithAAD)` - same as OOBE
- Device ownership: Corporate
- UI effect identical to OOBE auto-enroll
- Reference: [Enroll a Windows device automatically using Group Policy](https://learn.microsoft.com/en-us/windows/client-management/enroll-a-windows-10-device-automatically-using-group-policy#configure-the-autoenrollment-group-policy-for-a-single-pc)

## UI Icon Explanation

- **Microsoft logo**: Cloud user logged in after AADJ
- **Briefcase icon**: "Enroll only in Device Management" (always), or local user that performed AADJ (before switching to cloud user)

## Recommendation

For devices already AADJ without auto-enrollment, use **Group Policy auto-enroll** to achieve the same effect as OOBE auto-enrollment (Corporate ownership, MDMDeviceWithAAD type).
