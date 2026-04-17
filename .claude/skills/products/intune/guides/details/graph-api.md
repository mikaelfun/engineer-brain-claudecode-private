# INTUNE Graph API 与 PowerShell 自动化 — 已知问题详情

**条目数**: 72 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Intune Admin Center 操作时 Graph API 返回 HTTP 403 Forbidden，页面加载失败或操作被拒绝
**Solution**: 1. 从 HAR 文件中找到失败的 Graph API URL；2. 查看 response body 中的 error.code（如 Authorization_RequestDenied）；3. 在 Intune Admin Center 检查该管理员的 RBAC 角色分配；4. 对照 Microsoft Graph permissions reference 补充缺失权限
`[Source: ado-wiki, Score: 9.0]`

### Step 2: Intune Admin Center 操作响应缓慢或间歇性失败，Graph API 返回 HTTP 429 Too Many Requests
**Solution**: 1. 检查响应头中的 Retry-After 值，等待指定时间后重试；2. 建议客户降低并发 API 请求频率或减少自动化轮询；3. 参考 Microsoft Graph throttling guidance
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Intune Admin Center 中 Graph API 调用返回 HTTP 500 或 503，操作无法完成
**Solution**: 1. 从 HAR 文件提取 client-request-id；2. 检查 Microsoft 365 Service Health Dashboard 是否有活跃事件；3. 若无事件，使用 client-request-id 在 Kusto CMService 表查询后端 trace；4. 待服务恢复后重试操作
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Intune Admin Center 页面请求挂起/超时，浏览器 spinner 长时间不消失
**Solution**: 1. 查看 HAR 文件 Timing 标签，定位耗时阶段；2. Wait 时间极长 → 后端问题，用 client-request-id 查 Kusto；3. Connect 失败 → 确认 graph.microsoft.com:443 未被代理或防火墙拦截；4. 在 InPrivate 窗口复现以排除浏览器扩展影响
`[Source: ado-wiki, Score: 9.0]`

### Step 5: 管理员无法在 Admin Tasks 页面查看审批请求列表（EPM elevation、Multi-admin approval、Security Tasks）
**Solution**: 1. 检查管理员 RBAC 角色是否包含 Microsoft.Intune/AdminTasks/Read；2. 查看列表权限：需要 Organization | Read；3. 对应源权限：MAA = MultiAdminApproval/ApprovalForMultiAdminApproval，EPM = EpmPolicy/ViewElevationRequests，Security Tasks = SecurityTasks/Read；4. 收集 HAR 进行 RBAC troubleshooting
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Intune 管理员在门户上传 PowerShell 脚本后，无法查看脚本文件内容（portal 不显示脚本正文）
**Solution**: 方法1: Graph Explorer 登录后执行 GET https://graph.microsoft.com/beta/deviceManagement/deviceManagementScripts/{ScriptID}，取 scriptContent 字段 Base64 解码；方法2: PowerShell 执行 Get-MgBetaDeviceManagementScript -DeviceManagementScriptId {ID}，用 [System.Text.Encoding]::UTF8.GetString() 解码 ScriptContent
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Graph API 调用 managedDevices/$expand=detectedApps 时 Publisher 等字段返回 null 或 not found
**Solution**: 改用推荐的独立端点：1. GET /deviceManagement/detectedApps（列出所有检测到的应用）；2. GET /deviceManagement/manageddevices('{deviceId}')/detectedApps（获取指定设备的应用）；3. GET /deviceManagement/detectedApps('{appId}')/managedDevices（获取安装了某应用的设备）
`[Source: ado-wiki, Score: 9.0]`

### Step 8: 2025年9月后 Graph API 调用 deviceManagementScripts/deviceHealthScripts 等端点返回权限错误
**Solution**: 更新应用的 API 权限：1. 添加 DeviceManagementScripts.Read.All 或 DeviceManagementScripts.ReadWrite.All；2. 影响端点包括 deviceShellScripts、deviceHealthScripts、deviceComplianceScripts、deviceCustomAttributeShellScripts、deviceManagementScripts
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Intune Admin Center 操作时 Graph API 返回 HTTP 403 Forbidden，页面加载失败或操作被拒绝 | 登录的管理员账号缺少该操作所需的 Graph 权限或 Intune RBAC 角色（如 deviceManagement/managedDevices R... | 1. 从 HAR 文件中找到失败的 Graph API URL；2. 查看 response body 中的 error.code（如 Authoriza... | 9.0 | ado-wiki |
| 2 | Intune Admin Center 操作响应缓慢或间歇性失败，Graph API 返回 HTTP 429 Too Many Requests | 租户或用户超过 Graph API 限速阈值（throttling），常见于大型租户或存在并行自动化工具时 | 1. 检查响应头中的 Retry-After 值，等待指定时间后重试；2. 建议客户降低并发 API 请求频率或减少自动化轮询；3. 参考 Microso... | 9.0 | ado-wiki |
| 3 | Intune Admin Center 中 Graph API 调用返回 HTTP 500 或 503，操作无法完成 | Intune 后端服务瞬时错误，可能关联活跃服务事件 | 1. 从 HAR 文件提取 client-request-id；2. 检查 Microsoft 365 Service Health Dashboard ... | 9.0 | ado-wiki |
| 4 | Intune Admin Center 页面请求挂起/超时，浏览器 spinner 长时间不消失 | 两种可能：(1) 网络代理阻断 graph.microsoft.com 端口 443；(2) Intune 后端处理延迟 | 1. 查看 HAR 文件 Timing 标签，定位耗时阶段；2. Wait 时间极长 → 后端问题，用 client-request-id 查 Kusto... | 9.0 | ado-wiki |
| 5 | 管理员无法在 Admin Tasks 页面查看审批请求列表（EPM elevation、Multi-admin approval、Security Tasks） | 管理员缺少 Microsoft.Intune/AdminTasks/Read 权限，或缺少对应源功能的具体权限（如 EPM 需要 ViewElevatio... | 1. 检查管理员 RBAC 角色是否包含 Microsoft.Intune/AdminTasks/Read；2. 查看列表权限：需要 Organizati... | 9.0 | ado-wiki |
| 6 | Intune 管理员在门户上传 PowerShell 脚本后，无法查看脚本文件内容（portal 不显示脚本正文） | Intune 门户当前不支持在 UI 中查看已上传的 PowerShell 脚本内容；脚本以 Base64 编码存储，仅可通过 Graph API 获取 | 方法1: Graph Explorer 登录后执行 GET https://graph.microsoft.com/beta/deviceManageme... | 9.0 | ado-wiki |
| 7 | Graph API 调用 managedDevices/$expand=detectedApps 时 Publisher 等字段返回 null 或 not... | 使用 $expand=detectedApps 的 API 端点返回数据不完整，是已知 API 限制 | 改用推荐的独立端点：1. GET /deviceManagement/detectedApps（列出所有检测到的应用）；2. GET /deviceMan... | 9.0 | ado-wiki |
| 8 | 2025年9月后 Graph API 调用 deviceManagementScripts/deviceHealthScripts 等端点返回权限错误 | Microsoft Graph 权限变更：DeviceManagementScripts.Read.All 和 ReadWrite.All 替代了之前的 ... | 更新应用的 API 权限：1. 添加 DeviceManagementScripts.Read.All 或 DeviceManagementScripts... | 9.0 | ado-wiki |
| 9 | 客户调用的 Graph API 端点在 Intune 门户中可以工作但手动调用返回 403/401，端点在公开文档中找不到 | 该端点属于 Intune 门户内部使用的受限端点，不在公开文档（v1.0 或 beta）中，不支持手动调用 | 1. 确认端点是否在 learn.microsoft.com/graph/api/resources/intune-graph-overview 中有文档... | 9.0 | ado-wiki |
| 10 | Graph API managedDevices 返回的硬件信息（如 physicalMemoryInBytes）为 0 或缺失 | 默认 GET managedDevices 不返回所有属性，需使用 $select 参数明确指定需要的字段 | 在 API 调用中添加 $select=physicalMemoryInBytes 等需要的字段；可通过 F12 网络跟踪查看 Intune 门户实际使用... | 9.0 | ado-wiki |
| 11 | HTTP 403 Forbidden / Access denied error in Intune portal or Graph API — admi... | Missing RBAC permission in admin's assigned role. May need multiple permissio... | 1) Collect F12 HAR trace from browser 2) Find first 403 response to graph.mic... | 9.0 | ado-wiki |
| 12 | Unlicensed admin gets access denied when using Graph API, PowerShell cmdlets,... | Unlicensed Admins feature only applies to Intune portal (MEM). Graph API, Pow... | 1) Verify user has Intune license assigned (check in Rave user details) 2) Ve... | 9.0 | ado-wiki |
| 13 | 3rd party compliance partner (JAMF Pro, VMware Workspace ONE, MobileIron) dev... | Compliance partner integration uses Graph API PATCH to /devices/{deviceId} wi... | Use Kusto query on GraphApiProxyLibrary table: filter by env_cloud_name (e.g.... | 8.0 | onenote |
| 14 | When creating a dynamic group in the Intune on Azure portal using the dynamic... | The correct value for deviceOwership in Azure is &quot;company&quot; not &quo... | In order to resolve the issue, follow the steps below:1) Ensure that the devi... | 7.5 | contentidea-kb |
| 15 | When using the Intune Preview Graph API to update �emailAddress� and/or �mana... | The /PATCH method only supports changing two attributes.The only attributes o... | https://icm.ad.msft.net/imp/v3/incidents/details/46138189/home | 7.5 | contentidea-kb |
| 16 | Intune Graph APIs allow you to perform the same functionality that is availab... |  |  | 7.5 | contentidea-kb |
| 17 | You are unable to query the Microsoft Graph API within https://graph.microsof... | To access the Intune graph api from a non GA account requires the account to ... | a. Create the custom Intune roll Create a user group and add the service acco... | 7.5 | contentidea-kb |
| 18 | When users are under Intune Read-Only operator role, they're not able to read... | The scope (groups) not targeting the group to which the user belongs to | Include in the scope (groups) the group to which the user belongs. | 7.5 | contentidea-kb |
| 19 | Using runbooks is an easy and efficient way to run the GetMessagesToTeamsAndO... |  |  | 7.5 | contentidea-kb |
| 20 | We hear from a lot of customers that they want to automatically clean up devi... |  |  | 7.5 | contentidea-kb |
| 21 | Could not retrieve the access token for Microsoft Graph API error when confir... | Customer is using a proxy and had required ports blocked | The following ports need to be accessible for Jamf and Intune: Intune - Port ... | 7.5 | contentidea-kb |
| 22 | The first time you run this script if you are using a &quot;service account&q... |  |  | 7.5 | contentidea-kb |
| 23 | End user was trying to integrate the JAMF Pro with Intune to manage the Apple... | Once the connection is terminated, we need to generate a new Azure App ID as ... | 1.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Most of the time, when customer create... | 7.5 | contentidea-kb |
| 24 | When a user goes to the Microsoft Intune Portal, selects device compliance an... | Currently there is a bug in the export function of the Intune Portal for this... | An script has been develop that can export the compliance information using G... | 7.5 | contentidea-kb |
| 25 | Overview  By default, the Intune Exchange connector synchronizes with Intune ... |  |  | 7.5 | contentidea-kb |
| 26 | Graph API queries for Intune managedDevices objects do not return&nbsp;device... | This occurs because the query does not specify the type of object being queri... | To return&nbsp;deviceHealthAttestationState, add a filter for isof('microsoft... | 7.5 | contentidea-kb |
| 27 | Getting error message (400) Bad Request when trying to import S/MIME certificate | Error 400 --Bad Request-- can be triggered in two scenarios:Importing S/MIME ... | Make sure to use a licensed Intune administrator(or a global admin)&nbsp;acco... | 7.5 | contentidea-kb |
| 28 | This article describes how to definitively answer the question &quot;what per... |  |  | 7.5 | contentidea-kb |
| 29 | Most often, customer can observe the behavior mentioned in title by:Checking ... | &quot;Preview: MDM Security Baseline for October 2018&quot; was a preview and... | Even though UI is filtering out the BL for October 2018, the profiles are sti... | 7.5 | contentidea-kb |
| 30 | When attempting to run queries in Graph explorer to inspect or modify Intune ... |  | To resolve this error and allow Graph explorer to connect to Intune resources... | 7.5 | contentidea-kb |
| 31 | Customer removed their existing JAMF Connector and cannot re-establish a conn... | Customer was using the Azure Portal App to create his new App registration an... | Make sure the customer is following the public document to register the App&n... | 7.5 | contentidea-kb |
| 32 | From the Intune Powershell module, the function to get Audit Events is not in... |  |  | 7.5 | contentidea-kb |
| 33 | Support Tip: Getting Started with Microsoft Graph APISetting Up Your App Deve... |  |  | 7.5 | contentidea-kb |
| 34 | Additional resource to expand your knowledge of Microsoft Graph API. |  |  | 7.5 | contentidea-kb |
| 35 | When&nbsp;using the PowerShell command below to get the activation bypass cod... | This is by design.&nbsp;In the code, we limit the backend to query device har... | Activation lock bypass can be returned when&nbsp;using following URL:https://... | 7.5 | contentidea-kb |
| 36 | Graph API endpoints for GCC High (Fairfax) customers recently changed from&nb... | This behavior is by design. | Run this command to automatically update all instances of&nbsp;graph.microsof... | 7.5 | contentidea-kb |
| 37 | These&nbsp;articles will help you to understand what Graph API is and it work... |  |  | 7.5 | contentidea-kb |
| 38 | Starting with the Intune 2110 release in November 2021, the following setting... |  |  | 7.5 | contentidea-kb |
| 39 | Often times there is a need to export the Recovery Key ID for all Intune mana... |  | There is no built-in report in Azure or Intune which can achieve this require... | 7.5 | contentidea-kb |
| 40 | You may find that you are unable to add legacy Azure AAD permission in Azure ... |  |  | 7.5 | contentidea-kb |
| 41 | Customer is trying to configure the Jamf Manual Connector as per documentatio... | Prior to the move to Microsoft Graph the Azure AD Graph API permissions have ... | https://docs.jamf.com/technical-papers/jamf-pro/microsoft-intune/10.17.0/Manu... | 7.5 | contentidea-kb |
| 42 | You are unable to see stale device record in Azure and in the Intune portal b... |  | In my case customer was not able to enroll devices and he was getting “limit ... | 7.5 | contentidea-kb |
| 43 | The permission that controls the creation of new support tickets in the Micro... |  |  | 7.5 | contentidea-kb |
| 44 | How To Use POSTMAN With Graph API | This KB will go give a basic overview on how POSTMAN can be utilized for the ... | Introduction to Graph API &nbsp; Microsoft Graph is a RESTful web API that en... | 7.5 | contentidea-kb |
| 45 | Consider the following scenario: All the required Intune Graph permissions fo... | For delegated permissions, the effective permissions of your app are the inte... | Even though the customer meets the API Graph requirements, if they are using ... | 7.5 | contentidea-kb |
| 46 | A common question for developers and administrators developing scripts to que... |  |  | 7.5 | contentidea-kb |
| 47 | You run a query using Graph Explorer to obtain specific device information us... | This is because need to Scape the $ character in the $Select. | So to use it properly, you would need to run&nbsp;  Invoke-MgGraphRequest -Me... | 7.5 | contentidea-kb |
| 48 | Customers will report that Intune Graph API returns null values for some fiel... |  |  | 7.5 | contentidea-kb |
| 49 | After setting up integration with Cisco ISE 3.1 in a GCC High tenant, you rec... | This can occur if the graph auto discovery URL is misconfigured. | New updates have arrived as per this document for the endpoints for GCC with ... | 7.5 | contentidea-kb |
| 50 | This article is meant to be used for querying Intune device information to pr... |  |  | 7.5 | contentidea-kb |
| 51 | Very often, the customers ask how they can identify which Autopilot record is... |  |  | 7.5 | contentidea-kb |
| 52 | Customers aren't able to add more than 600 ASR Only Exclusions https://learn.... | This is by design.&nbsp;All of our Simple Setting Collections in DCv2 have a ... | The customer may be able to configure this setting with up to 2,000 entries d... | 7.5 | contentidea-kb |
| 53 | While setting up an MTG server, configuration is typically done via the site'... |  |  | 7.5 | contentidea-kb |
| 54 | Overview:           Customers can utilize Graph API to automate Intune tasks ... |  |  | 7.5 | contentidea-kb |
| 55 | Updated on 9th May (Kudos on @Juan Jara Melendez for helping):  1. If we have... |  |  | 7.5 | contentidea-kb |
| 56 | last year Microsoft announced a new Microsoft Intune GitHub repository ( http... | Applies to Break/Fix | Intoduction: &nbsp; As you know there are no PowerShell modules for Endpoint ... | 7.5 | contentidea-kb |
| 57 | In this article you will learn how to check for the device configuration poli... |  |  | 7.5 | contentidea-kb |
| 58 | Intune: Getting error The property 'USERID' does not exist while changing Pri... | UserPrincipleName, UserID are not the valid parameter under Update-MgDeviceMa... | Primary user below running the command  &nbsp; Before running the command the... | 7.5 | contentidea-kb |
| 59 | Device Query for Multiple Devices Device Query for multiple devices enables y... | Client-Request-Id Troubleshooting To diagnose issues, determine which of the ... | Error Cases &amp; Limitations Kusto-Like Syntax:&nbsp;Device Query uses&nbsp;... | 7.5 | contentidea-kb |
| 60 | To fetch the version of a managed app using PowerShell in an Intune-managed e... | Reviewed all available output properties, including AdditionalProperties, but... | I recommend trying the following query: Module --&gt; Microsoft.Graph.Beta.De... | 7.5 | contentidea-kb |
| 61 | We use the Microsoft Graph API (https://graph.microsoft.com) as a &quot;singl... |  |  | 7.5 | contentidea-kb |
| 62 | Throttling is one of the most common errors we&nbsp;encounter&nbsp;when worki... | Throttling limits the number&nbsp;of concurrent calls to a service to prevent... | Step-1:&nbsp;Verify the customer's tenant ranking in the AMSU to assess usage... | 7.5 | contentidea-kb |
| 63 | Customer is receiving a 403 error when calling the following graph call https... | Some Microsoft Graph API endpoints are not allowed to be used/called outside ... | To confirm if the above is the case for a Graph API endpoint you can check vi... | 7.5 | contentidea-kb |
| 64 | This article is a guide on how we can use Graph APIs to export various Intune... |  |  | 7.5 | contentidea-kb |
| 65 | Device UPN shows as None in Intune admin center under All Devices | User deleted from Entra ID before enrolled device was deleted from Intune cre... | Run RemoveIntuneDevice.ps1 script. Prerequisites: Entra ID recycle bin enable... | 6.5 | mslearn |
| 66 | Help desk operators receive Initiating Factory reset failed error performing ... | Help Desk Operator role assigned to dynamic device groups instead of user groups | Reassign Help Desk Operator role to user groups instead of dynamic device gro... | 6.5 | mslearn |
| 67 | When a user goes to the Microsoft Intune Portal, selects device compliance an... | Currently there is a bug in the export function of the Intune Portal for this... | An script has been develop that can export the compliance information using G... | 4.5 | contentidea-kb |
| 68 | Getting error message (400) Bad Request when trying to import S/MIME certificate | Error 400 --Bad Request-- can be triggered in two scenarios: Importing S/MIME... | Make sure to use a licensed Intune administrator(or a global admin) account t... | 4.5 | contentidea-kb |
| 69 | The first time you run this script if you are using a "service account", you ... |  |  | 3.0 | contentidea-kb |
| 70 | End user was trying to integrate the JAMF Pro with Intune to manage the Apple... | Once the connection is terminated, we need to generate a new Azure App ID as ... | 1. Most of the time, when customer create a new Azure App ID, they forget to ... | 3.0 | contentidea-kb |
| 71 | Overview By default, the Intune Exchange connector synchronizes with Intune s... |  |  | 3.0 | contentidea-kb |
| 72 | Graph API queries for Intune managedDevices objects do not return deviceHealt... | This occurs because the query does not specify the type of object being queri... | To return deviceHealthAttestationState, add a filter for isof('microsoft.grap... | 3.0 | contentidea-kb |
