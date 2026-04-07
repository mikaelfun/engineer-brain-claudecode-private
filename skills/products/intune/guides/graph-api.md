# Intune Graph API 与 PowerShell 自动化 — 排查速查

**来源数**: 4 | **21V**: 部分适用
**条目数**: 19 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Intune Admin Center 操作时 Graph API 返回 HTTP 403 Forbidden，页面加载失败或操作被拒绝 | 登录的管理员账号缺少该操作所需的 Graph 权限或 Intune RBAC 角色（如 deviceManagement/managedDevices R... | 1. 从 HAR 文件中找到失败的 Graph API URL；2. 查看 response body 中的 error.code（如 Authorization_RequestDenied）；... | 🟢 8.5 | ADO Wiki |
| 2 | Intune Admin Center 操作响应缓慢或间歇性失败，Graph API 返回 HTTP 429 Too Many Requests | 租户或用户超过 Graph API 限速阈值（throttling），常见于大型租户或存在并行自动化工具时 | 1. 检查响应头中的 Retry-After 值，等待指定时间后重试；2. 建议客户降低并发 API 请求频率或减少自动化轮询；3. 参考 Microsoft Graph throttling ... | 🟢 8.5 | ADO Wiki |
| 3 | Intune Admin Center 中 Graph API 调用返回 HTTP 500 或 503，操作无法完成 | Intune 后端服务瞬时错误，可能关联活跃服务事件 | 1. 从 HAR 文件提取 client-request-id；2. 检查 Microsoft 365 Service Health Dashboard 是否有活跃事件；3. 若无事件，使用 c... | 🟢 8.5 | ADO Wiki |
| 4 | Intune 管理员在门户上传 PowerShell 脚本后，无法查看脚本文件内容（portal 不显示脚本正文） | Intune 门户当前不支持在 UI 中查看已上传的 PowerShell 脚本内容；脚本以 Base64 编码存储，仅可通过 Graph API 获取 | 方法1: Graph Explorer 登录后执行 GET https://graph.microsoft.com/beta/deviceManagement/deviceManagementS... | 🟢 8.5 | ADO Wiki |
| 5 | CritSit: 客户意外从 Intune 控制台或通过 Graph API 批量删除了设备，需要恢复 | IT 管理员误操作在 Intune 门户手动删除设备，或自动化脚本通过 Graph API 触发了批量删除 | 1. 确认 Entra ID 设备记录是否仍存在（不存在则无法恢复，需重新注册）；2. 立即关闭所有受影响设备防止重新 check-in；3. 收集已删除设备的 Intune Device ID... | 🟢 8.5 | ADO Wiki |
| 6 | Graph API 调用 managedDevices/$expand=detectedApps 时 Publisher 等字段返回 null 或 not found | 使用 $expand=detectedApps 的 API 端点返回数据不完整，是已知 API 限制 | 改用推荐的独立端点：1. GET /deviceManagement/detectedApps（列出所有检测到的应用）；2. GET /deviceManagement/manageddevic... | 🟢 8.5 | ADO Wiki |
| 7 | 客户调用的 Graph API 端点在 Intune 门户中可以工作但手动调用返回 403/401，端点在公开文档中找不到 | 该端点属于 Intune 门户内部使用的受限端点，不在公开文档（v1.0 或 beta）中，不支持手动调用 | 1. 确认端点是否在 learn.microsoft.com/graph/api/resources/intune-graph-overview 中有文档；2. 如未公开则不支持手动使用；3. ... | 🟢 8.5 | ADO Wiki |
| 8 | Graph API managedDevices 返回的硬件信息（如 physicalMemoryInBytes）为 0 或缺失 | 默认 GET managedDevices 不返回所有属性，需使用 $select 参数明确指定需要的字段 | 在 API 调用中添加 $select=physicalMemoryInBytes 等需要的字段；可通过 F12 网络跟踪查看 Intune 门户实际使用的 API 调用（含 $select 参... | 🟢 8.5 | ADO Wiki |
| 9 | HTTP 403 Forbidden / Access denied error in Intune portal or Graph API — admin cannot perform spe... | Missing RBAC permission in admin's assigned role. May need multiple permissio... | 1) Collect F12 HAR trace from browser 2) Find first 403 response to graph.microsoft.com 3) Extrac... | 🟢 8.5 | ADO Wiki |
| 10 | Unlicensed admin gets access denied when using Graph API, PowerShell cmdlets, or Intune SDK apps ... | Unlicensed Admins feature only applies to Intune portal (MEM). Graph API, Pow... | 1) Verify user has Intune license assigned (check in Rave user details) 2) Verify user has RBAC r... | 🟢 8.5 | ADO Wiki |
| 11 | Exclude groups option missing for PowerShell scripts assignments in Intune UI — cannot exclude gr... | Older tenant was built without exclude groups functionality for PowerShell sc... | 1) Submit SAW request to add flighting tag 'EnableGAndTForPowershell' via ICM/IET 2) WARNING: pro... | 🟢 8.5 | ADO Wiki |
| 12 | Intune Endpoint Security App Control for Business policy returns error 65000 when deploying a tem... | WDAC Wizard-generated XML template contains <PolicyTypeID> but lacks <PolicyI... | Edit the WDAC XML template: (1) Remove <PolicyTypeID> element, (2) Add <PolicyID> with a unique G... | 🟢 8.5 | OneNote |
| 13 | When creating a dynamic group in the Intune on Azure portal using the dynamic membership rule bel... | The correct value for deviceOwership in Azure is &quot;company&quot; not &quo... | In order to resolve the issue, follow the steps below:1) Ensure that the device is indeed properl... | 🔵 7.0 | ContentIdea KB |
| 14 | When using the Intune Preview Graph API to update �emailAddress� and/or �managementAgent�, using ... | The /PATCH method only supports changing two attributes.The only attributes o... | https://icm.ad.msft.net/imp/v3/incidents/details/46138189/home | 🔵 7.0 | ContentIdea KB |
| 15 | You are unable to query the Microsoft Graph API within https://graph.microsoft.com/v1.0/deviceMan... | To access the Intune graph api from a non GA account requires the account to ... | a. Create the custom Intune roll Create a user group and add the service account you would like t... | 🔵 7.0 | ContentIdea KB |
| 16 | Could not retrieve the access token for Microsoft Graph API. Check the configuration for Microsof... | Customer is using a proxy and had required ports blocked | The following ports need to be accessible for Jamf and Intune to work properly: Intune - Port 443... | 🔵 7.0 | ContentIdea KB |
| 17 | Could not retrieve the access token for Microsoft Graph API. Check the configuration for Microsof... | Customer is using a proxy and had required ports blocked | The following ports need to be accessible for Jamf and Intune to work properly: Intune - Port 443... | 🔵 7.0 | ContentIdea KB |
| 18 | Device UPN shows as None in Intune admin center under All Devices | User deleted from Entra ID before enrolled device was deleted from Intune cre... | Run RemoveIntuneDevice.ps1 script. Prerequisites: Entra ID recycle bin enabled, Graph permissions... | 🔵 6.5 | MS Learn |
| 19 | Jamf Pro shows Could not retrieve the access token for Microsoft Graph API when configuring Intun... | Required TCP ports for Jamf-Intune communication are blocked by firewall or p... | Unblock TCP ports: 443 (Intune), 2195/2196/5223 (macOS devices), 80/5223 (Jamf Pro) | 🔵 6.5 | MS Learn |

## 快速排查路径
1. 1. 从 HAR 文件中找到失败的 Graph API URL；2. 查看 response body 中的 error.code（如 Authorization_RequestDenied）；3. 在 Intune Admin Center 检查该管理员的 RBAC 角色分配；4. 对照 Micr `[来源: ADO Wiki]`
2. 1. 检查响应头中的 Retry-After 值，等待指定时间后重试；2. 建议客户降低并发 API 请求频率或减少自动化轮询；3. 参考 Microsoft Graph throttling guidance `[来源: ADO Wiki]`
3. 1. 从 HAR 文件提取 client-request-id；2. 检查 Microsoft 365 Service Health Dashboard 是否有活跃事件；3. 若无事件，使用 client-request-id 在 Kusto CMService 表查询后端 trace；4. 待服务 `[来源: ADO Wiki]`
4. 方法1: Graph Explorer 登录后执行 GET https://graph.microsoft.com/beta/deviceManagement/deviceManagementScripts/{ScriptID}，取 scriptContent 字段 Base64 解码；方法2: P `[来源: ADO Wiki]`
5. 1. 确认 Entra ID 设备记录是否仍存在（不存在则无法恢复，需重新注册）；2. 立即关闭所有受影响设备防止重新 check-in；3. 收集已删除设备的 Intune Device ID CSV；4. 获取 Global Admin 或 Intune Admin 的书面邮件授权；5. 与 T `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/graph-api.md#排查流程)
