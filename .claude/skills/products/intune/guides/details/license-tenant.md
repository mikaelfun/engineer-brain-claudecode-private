# Intune 许可证与租户 — 综合排查指南

**条目数**: 33 | **草稿融合数**: 0 | **Kusto 查询融合**: 1
**Kusto 引用**: license-status.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Kusto 诊断查询

#### license-status.md
`[工具: Kusto skill — license-status.md]`

```kql
IntuneEvent
| where env_time between(datetime({startTime})..datetime({endTime}))
| where env_cloud_name == 'CNPASU01'
| where ComponentName == 'UserProvider'
| where UserId =~ '{userId}'
| where ActivityId has '{deviceId}'  
| project env_time, EventUniqueName, ColMetadata, Col1, Col2, Col3
```

```kql
// ⚠️ 需要切换到 msods 集群，数据库名称为 MSODS (大写)
IfxAuditLoggingCommon
| where env_time between(datetime({startTime})..datetime({endTime}))
| where targetObjectId == '{userId}'
| where operationName has 'license'
| project env_time, env_seqNum, operationName, operationType, resultType, 
    internalOperationType, internalCorrelationId, contextId, 
    targetObjectId, targetObjectName
```


---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | iOS 应用 Intune SDK enrollment 成功但未收到 App Protection Policy | 用户不在 APP 策略目标组中；App Bundle ID 未添加到策略；用户无 Intune 许可证；使用了错误的 account ID（应使用 ten... | 1. 确认用户在 APP 策略的目标安全组中；2. 确认 App Bundle ID 已添加到 APP 策略的应用列表；3. 确认用户已分配 Intune 许可证；4. 确保使用 msalRes... | 🟢 8.5 | ADO Wiki |
| 2 | 设备合规状态显示 Not Evaluated | 多种原因：(1) 设备无关联用户（无主用户的设备无法评估合规）；(2) 设备为 EAS 记录；(3) 设备处于 Retire Pending 等状态无法 ... | 1. 确认设备有关联用户且用户有 Intune 许可证；2. 检查设备是否在 7 天内联系过服务；3. DEM 用户设备无法评估合规，需用普通用户注册；4. Windows 1803+ 支持多用... | 🟢 8.5 | ADO Wiki |
| 3 | Customer has Defender licensing but MEM (Microsoft Endpoint Manager) portal is inaccessible; no I... | Missing Intune_Defender service plan. This service plan is embedded with all ... | Check if Intune_Defender service plan is provisioned on the tenant. All accounts with Defender Pr... | 🟢 8.5 | ADO Wiki |
| 4 | Admin loses permissions after enabling 'Scoped Permissions' in Intune RBAC Settings — previously ... | Enabling scoped permissions stops Intune from silently merging permissions ac... | 1) Review permissions assessment report (Tenant Admin > Roles > Settings) before enabling 2) This... | 🟢 8.5 | ADO Wiki |
| 5 | Customer requests Root Cause Analysis (RCA) for tenant-specific Intune issue | Intune Engineering Team only provides PIR (Post Incident Report) for Live Sit... | Share best-effort troubleshooting findings with customer to help avoid recurrence (not a formal R... | 🟢 8.5 | ADO Wiki |
| 6 | Error AADSTS5000224 when authenticating to test tenant: 'We are sorry, this resource is not avail... | Test tenant was deprovisioned by MCAPS, typically due to policy violation, ex... | Go to https://aka.ms/tenantreauthentication, enter the Entra tenant ID, add a short description, ... | 🟢 8.5 | ADO Wiki |
| 7 | Sign-in errors 'Insufficient or lack of permissions is causing access restriction' when trying to... | Licenses in the MCAPS test tenant have expired (1-year lifespan) and been dis... | Sign into the Microsoft 365 admin portal (admin.microsoft.com) with the tenant GA account and ver... | 🟢 8.5 | ADO Wiki |
| 8 | Need to verify TattooRemoval is running correctly for a device; or policy settings not being clea... | TattooRemoval process may not have run yet due to hold-off period, or need to... | Kusto: IntuneEvent \| where AccountId == '<tenantId>' \| where * has 'Tattoo' — look for DMSPolic... | 🟢 8.0 | OneNote |
| 9 | Alert: 'The Service to Service Connector Failed to Retrieve ACS Token' when using Intune O365 Exc... | An invalid/different certificate is used, tenant is not registered in ACS, or... | Wait 24 hours (may be maintenance). If not resolved: ensure Global Admin who set up the Service C... | 🔵 7.0 | ContentIdea KB |
| 10 | Licensed Intune user in AD security group does not sync with Intune groups. Users not populating ... | Parent group starts with a sub group instead of All Users. | Modify the group so that the parent group is All Users instead of a sub group. | 🔵 7.0 | ContentIdea KB |
| 11 | When attempting to publish an app in Intune via the Software Publisher console, the upload fails ... | The user account used when uploading the app package does not have a valid In... | Assign a license to the user account (UPN) being used when uploading the application package. Onc... | 🔵 7.0 | ContentIdea KB |
| 12 | The Intune Admin portal may encounter an exception when modifying a customized application to Uni... | See https://icm.ad.msft.net/imp/v3/incidents/details/33122122/home for details. | Have the administrator edit the application in MISPA. You don�t need to change anything just edit... | 🔵 7.0 | ContentIdea KB |
| 13 | When trying to upload/update a new APP (APK) in Intune, the customer is presented with the error ... | Late in 2016 (Oct) there was a change made to require Admins to be licensed I... | To fix this issue:    Go to portal.office.com  Go to the Users tab  Provide EMS or Intune      li... | 🔵 7.0 | ContentIdea KB |
| 14 | Global Administrator is attempting to deploy Software or Application and they receive the followi... | This occurs because the Global Administrator does not have an Intune License | Assign an Intune License to the Global Administrator attempting to deploy Software or Application | 🔵 7.0 | ContentIdea KB |
| 15 | Customer states they have an Intune license with MDOP associated with it but cannot get to the ol... | In 2015 there was a change to the process and the old site was retired, the M... | [Verification]  1. Open the Portal.Office.com Admin Portal  2. Select Billing \ Subscriptions  &n... | 🔵 7.0 | ContentIdea KB |
| 16 | When attempting to assign the Intune for Education license to an UPN, you receive an error &quot;... | This is due to a known issue that is being worked on, where the&nbsp;stacking... | Action plan===============================1. Open the Azure Portal (New not classic)2. Navigate t... | 🔵 7.0 | ContentIdea KB |
| 17 | Customer reported the following error when trying to configure Synchronization with MTP for Looko... | One of the following steps was not done:Ensure that customer has accepted htt... | Ensure that customer has accepted https://aad.lookout.com/les?action=consent) Ensure that the acc... | 🔵 7.0 | ContentIdea KB |
| 18 | When setting up the NDES Connector and signing in to NDESConnectorUI.exe, the login fails and fol... | This can occur if the account being used does not have a valid Intune or EMS ... | To resolve this problem, either assign an Intune license to the account being used, or sign in us... | 🔵 7.0 | ContentIdea KB |
| 19 | When setting up the Intune Exchange service-to-service connector, error message: An error occurre... | Account used to setup the connector does not have either Intune license or gl... | Assign the account used to setup the Intune connector an Intune license or assign it global admin... | 🔵 7.0 | ContentIdea KB |
| 20 | When setting the Intune Exchange service to server connector you receive the following error mess... | This issue can be caused by&nbsp; account used to setup the connector does no... | To resolve the issue assign the account used to setup the Intune connector an Intune license or a... | 🔵 7.0 | ContentIdea KB |
| 21 | Consider the following scenario: You are attempting to create a provisioning package using Window... | This can occur if there are no more licenses available for Azure AD Premium a... | To resolve this problem, either purchase additional licenses for the tenant or remove any unneede... | 🔵 7.0 | ContentIdea KB |
| 22 | Tried to enable the Teamviewer connection for devices but in the last step, after logging in to T... | Intune license missing from the admin account | Use a company administrator      admin that has Intune license  Use an admin with Update      Rem... | 🔵 7.0 | ContentIdea KB |
| 23 | When trying to setup the Intune on premise Exchange Connector you receive the following error mes... | This error can be cause by user account that is being used to sign into Intun... | To resolve the issue make sure the user account has the following: Intune License assigned to it.... | 🔵 7.0 | ContentIdea KB |
| 24 | When a user (UPN) attempts to log into the Azure Intune Portal they get the following error:     ... | The tenant is   not completed on the provisioning.   This is due to the   set... | Action plan       Open the Azure        Portal (Azure.portal.com) in Edge    Sign in with you UPN... | 🔵 7.0 | ContentIdea KB |
| 25 | Customer receives the following notification in the Jamf console: Unable to connect to Microsoft ... | Customer Jamf license had expired | Customer should contact Jamf for assistance. | 🔵 7.0 | ContentIdea KB |
| 26 | Customer receives the following notification in the Jamf console: Unable to connect to Microsoft ... | Customer Jamf license had expired | Customer should contact Jamf for assistance. | 🔵 7.0 | ContentIdea KB |
| 27 | Customer receives the following message when trying to register a Jamf enrolled device with Intun... | After upgrading to 10.7.1 customer found that the Intune integration was disa... | Re-enable the Intune integration in Jamf | 🔵 7.0 | ContentIdea KB |
| 28 | Customer has set up a new Intune tenant for use with either Intune MDM or 3rd party MDM like Mobi... | It seems that someone, perhaps their admin, has disabled the Intune AAD App. ... | To resolve this is easy, the customer just needs to do the following steps with a GA account.Open... | 🔵 7.0 | ContentIdea KB |
| 29 | The main objective of the Help desk Operator role is to allow standard users to troubleshoot usin... | The user is not licensed for Intune. | Login to https://portal.azure.com as administrator. On the Intune blade, go to Users, then All Us... | 🔵 7.0 | ContentIdea KB |
| 30 | In an Intune/Configuration Manager hybrid environment, you may notice the following symptoms:Newl... | There is a known issue that can occur if the customer has certain versions of... | There are two resolutions depending on whether the certificate has already expired or not. This c... | 🔵 7.0 | ContentIdea KB |
| 31 | Jamf console shows Unable to connect to Microsoft Intune and Unable to send inventory information... | Jamf license has expired | Contact Jamf Software to renew the license | 🔵 6.5 | MS Learn |
| 32 | Script Error 'Unable to get property Content of undefined or null reference' when configuring Mic... | Login account has Delegated Administration permissions on multiple subscripti... | Use a Global Administrator account that does not have Delegated Administration permissions | 🔵 6.5 | MS Learn |
| 33 | Intune Troubleshoot pane displays 'Account status You do not have enough permissions' banner for ... | The Help Desk Operator user is not licensed for Intune | In Intune admin center > Users > All Users, select the affected user > Licenses tab > Assign an I... | 🔵 6.5 | MS Learn |
