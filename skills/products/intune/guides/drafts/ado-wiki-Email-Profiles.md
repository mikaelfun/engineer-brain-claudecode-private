---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/Email Profiles"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FEmail%20Profiles"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Email Profiles

## Description
Microsoft Intune includes different email settings you can deploy to devices in your organization. Email device configuration profiles include the connection settings used by your email app to access organization email.

Supported platforms:
- Android device administrator on Samsung Knox Standard 5.0+
- Android Enterprise personally owned devices with a work profile
- iOS 11.0+ / iPadOS 13.0+
- Windows 10/11

## Configuration
Portal path: Intune > Devices > iOS/iPadOS > Configuration Profiles > Create > Email

Configs available:
- Email server
- Authentication method
- SSL communication
- Other built-in email settings

## Key Scenarios & Rules
- Email profiles are deployed to the user who enrolled the device
- Configuration relies on Microsoft Entra properties during user enrollment
- Email app must support Microsoft Entra identities
- Assign to **user groups** rather than device groups
- User certificate profiles: assign to user groups to create profile deployment chain
- Avoid device groups if email profile contains user certificates (causes repeated password prompts)
- Device groups: suitable when no primary user or user info unknown
- Profiles to device groups may fail if devices lack assigned users

## Kusto Query for Deployment Verification

```kusto
DeviceManagementProvider
| where env_time >= ago(10d)
| where typeAndCategory == "ConfigurationPolicy;CommunicationsProvisioning" //Email Profile
| where deviceId == "IntuneDeviceID"
| where applicablilityState == "Applicable"
| project env_time, userId, PolicyName=name, PolicyType=typeAndCategory, Applicability=applicablilityState, Compliance=reportComplianceState, deviceId=ActivityId, PolicyID=['id'], message, TaskName, name
| order by env_time desc
```

## Scoping Questions
1. Platform for email profile deployment
2. Device managed or unmanaged
3. Working for some devices but not others?
4. Assigned to User group or Device group
5. Which email client (check if supported)
6. Native client settings being deployed
7. Authentication method in email profile
8. Video showing the behavior
9. Error messages
10. Any App Protection/App Configuration policy for Outlook

## Support Boundaries
- Intune scope: deliver configuration to device
- Successful deployment + auth failure → check authentication type
- Certificate auth → validate SCEP or PKCS deployment
- Use Kusto query above to check deployment success/failure

## Known Issues (External References)
- Users repeatedly prompted for password
- Profiles deployed to device groups show errors and latency
- Device already has email profile installed
- Error 0x87D1FDE8 for KNOX Standard device
- Unable to send images from email account
- CBA email profile prompts for credentials
- iOS Native email does not support MFA
- AD name edit causes password failure
- Second Outlook account fails with "Misconfiguration Alert"
- Android DA email certificate auth failure

## SME Contacts
- **ATZ**: Carlos Jenkins, Jesus Santaella
- **EMEA**: Karin Galli Bauza, Armia Endrawos, Ameer Ahmad
- **APAC**: Xinkun Yang, Joe Yang
