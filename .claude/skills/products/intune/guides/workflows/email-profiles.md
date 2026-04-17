# Intune 邮件配置与 Exchange — 排查工作流

**来源草稿**: ado-wiki-Email-Profiles.md
**Kusto 引用**: (无)
**场景数**: 3
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Devices > iOS/iPadOS > Configuration Profiles > Create > Email`

## Scenario 1: Key Scenarios & Rules
> 来源: ado-wiki-Email-Profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Email profiles are deployed to the user who enrolled the device
- Configuration relies on Microsoft Entra properties during user enrollment
- Email app must support Microsoft Entra identities
- Assign to **user groups** rather than device groups
- User certificate profiles: assign to user groups to create profile deployment chain
- Avoid device groups if email profile contains user certificates (causes repeated password prompts)
- Device groups: suitable when no primary user or user info unknown
- Profiles to device groups may fail if devices lack assigned users

## Scenario 2: Kusto Query for Deployment Verification
> 来源: ado-wiki-Email-Profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 3: Known Issues (External References)
> 来源: ado-wiki-Email-Profiles.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

---

## Kusto 查询参考

### Kusto Query for Deployment Verification

```kql
DeviceManagementProvider
| where env_time >= ago(10d)
| where typeAndCategory == "ConfigurationPolicy;CommunicationsProvisioning" //Email Profile
| where deviceId == "IntuneDeviceID"
| where applicablilityState == "Applicable"
| project env_time, userId, PolicyName=name, PolicyType=typeAndCategory, Applicability=applicablilityState, Compliance=reportComplianceState, deviceId=ActivityId, PolicyID=['id'], message, TaskName, name
| order by env_time desc
```
`[来源: ado-wiki-Email-Profiles.md]`
