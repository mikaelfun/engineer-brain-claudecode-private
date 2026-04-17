# INTUNE PKCS / PFX 证书部署 — 已知问题详情

**条目数**: 52 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: PKCS certificate deployed via Intune does not renew; modifying validity period in certificate profile and re-pushing does not update the certificat...
**Solution**: For PKCS renewal: must revoke/remove existing cert first then redeploy. To remove: unassign profile or use Remove-certificates action. For auto-renewal needs, consider SCEP instead (each request generates unique cert with fresh validity). Ref: learn.microsoft.com/en-us/mem/intune/protect/certificates-configure and learn.microsoft.com/en-us/mem/intune/protect/remove-certificates
`[Source: onenote, Score: 9.5]`

### Step 2: PFX Certificate connector keeps contacting decommissioned old CA server instead of newly configured CA; certificates fail to issue even though Intu...
**Solution**: Delete contents of the PFX connector 'processing' folder to clear backlog of old CA requests. Connector will then download fresh requests pointing to new CA. Ref ICM-418855554.
`[Source: onenote, Score: 9.5]`

### Step 3: Import-IntuneUserPfxCertificate 上传 PFX 证书时返回 (400) Bad Request 错误
**Solution**: 1. 确认用户已分配 Intune 许可证；2. 如用户已有证书，先用 Remove-IntuneUserPfxCertificate 删除旧证书后重新上传
`[Source: ado-wiki, Score: 9.0]`

### Step 4: SCEP 证书部署失败，验证阶段 Subject Name (SN) 或 Subject Alternative Name (SAN) 动态变量（如 {{UserPrincipalName}}）未能解析为实际值
**Solution**: 1. 使用 Kusto 查询 IntuneEvent 检查 ResolveScepRequestVariables 事件确认 SN/SAN 解析结果；2. 通过 cV 值追踪 Step 2 查询确认解析错误详情；3. 确认用户在 Entra ID 中的 UPN/Email 等属性已正确填充
`[Source: ado-wiki, Score: 9.0]`

### Step 5: SCEP/PKCS profile 部署报错，但未检查 Trusted Root profile 是否同时下发
**Solution**: 1. 确认 Trusted Root certificate profile 已部署到目标设备；2. 用 Kusto 查询 DeviceManagementProvider 同时过滤 ClientAuthCertificate 和 TrustedRootCertificate 确认两者都 Applicable + Compliant
`[Source: ado-wiki, Score: 9.0]`

### Step 6: PKCS (PFX) certificate shows only last SAN value for all fields (UPN, Email, DNS, URI) on all platforms when multiple SANs are configured
**Solution**: By design for PKCS certificates on all platforms. Only the last SAN value of each type is used. If multiple SANs are required, consider using SCEP instead (Android/Windows/macOS show all SCEP SAN entries). For PKCS, ensure the desired SAN value is the last entry.
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Microsoft Intune Certificate Connector certificate fails to auto-renew; SCEP/PFX certificates stop deploying. Event Viewer shows 'Failed to renew a...
**Solution**: 1) Check connector service account permissions per https://learn.microsoft.com/en-us/mem/intune/protect/certificate-connector-prerequisites#certificate-connector-service-account. 2) To force manual renewal: edit registry HKLM\SOFTWARE\Microsoft\MicrosoftIntune\PFXCertificateConnector, set RenewalPeriod to 365 (decimal) - this triggers immediate renewal attempt. 3) If renewal still fails, reconfigure connector to use SYSTEM account instead of service account.
`[Source: ado-wiki, Score: 9.0]`

### Step 8: Intune 通过 SCEP/PKCS 颁发的证书缺少 Strong Mapping OID (1.3.6.1.4.1.311.25.2)，导致 certificate-based authentication 失败
**Solution**: 1) 先验证 Connector 是否发送 OID：在 CA 的 Issued Certs 中导出 Binary Request → 搜索 OID 1.3.6.1.4.1.311.25.2。2) 若 OID 存在于 request（Intune scope 正常），问题在 CA 模板。3) 在 CA 运行: certutil -dstemplate [TemplateName] msPKI-Enrollment-Flag -0x00080000 启用 OID。4) 验证: certutil -v -dstemplate [TemplateName]。参考 KB5014754
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | PKCS certificate deployed via Intune does not renew; modifying validity perio... | PKCS certificates are the same certificate for the same device - Intune re-pu... | For PKCS renewal: must revoke/remove existing cert first then redeploy. To re... | 9.5 | onenote |
| 2 | PFX Certificate connector keeps contacting decommissioned old CA server inste... | PFX connector caches unprocessed certificate requests in a 'processing' folde... | Delete contents of the PFX connector 'processing' folder to clear backlog of ... | 9.5 | onenote |
| 3 | Import-IntuneUserPfxCertificate 上传 PFX 证书时返回 (400) Bad Request 错误 | 目标用户无 Intune 许可证，或该用户已上传过相同证书 | 1. 确认用户已分配 Intune 许可证；2. 如用户已有证书，先用 Remove-IntuneUserPfxCertificate 删除旧证书后重新上传 | 9.0 | ado-wiki |
| 4 | SCEP 证书部署失败，验证阶段 Subject Name (SN) 或 Subject Alternative Name (SAN) 动态变量（如 {{... | SCEP 配置文件中的 SN/SAN 动态变量（如 {{UserName}}、{{EmailAddress}}）在后端解析时失败，可能因用户属性缺失或 A... | 1. 使用 Kusto 查询 IntuneEvent 检查 ResolveScepRequestVariables 事件确认 SN/SAN 解析结果；2.... | 9.0 | ado-wiki |
| 5 | SCEP/PKCS profile 部署报错，但未检查 Trusted Root profile 是否同时下发 | SCEP/PKCS profile 依赖 Trusted Root certificate profile 作为前置条件，如果 Trusted Root ... | 1. 确认 Trusted Root certificate profile 已部署到目标设备；2. 用 Kusto 查询 DeviceManagemen... | 9.0 | ado-wiki |
| 6 | PKCS (PFX) certificate shows only last SAN value for all fields (UPN, Email, ... | PKCS certificate behavior across all platforms (iOS, Android, Windows, macOS)... | By design for PKCS certificates on all platforms. Only the last SAN value of ... | 9.0 | ado-wiki |
| 7 | Microsoft Intune Certificate Connector certificate fails to auto-renew; SCEP/... | The service account used during Certificate Connector configuration does not ... | 1) Check connector service account permissions per https://learn.microsoft.co... | 9.0 | ado-wiki |
| 8 | Intune 通过 SCEP/PKCS 颁发的证书缺少 Strong Mapping OID (1.3.6.1.4.1.311.25.2)，导致 cert... | CA 模板使用 Compatibility 2012+ 或 Key Storage Provider (KSP) 时，msPKI-Enrollment-F... | 1) 先验证 Connector 是否发送 OID：在 CA 的 Issued Certs 中导出 Binary Request → 搜索 OID 1.3... | 9.0 | ado-wiki |
| 9 | 修改 PKCS profile 的 assignment 或配置后，设备收到的是旧证书而非新证书 | PKCS 设计行为：与 SCEP 不同，PKCS 在修改 assignments 或 profile 配置时只会重新推送之前已颁发的证书，不会触发新证书颁发 | By design。要触发新 PKCS 证书颁发，需重新注册设备或部署全新的 PKCS profile。SCEP 则会在修改 assignment 或 p... | 9.0 | ado-wiki |
| 10 | PKCS 证书长时间停留在 Pending 状态，Connector Event Log 显示 NullReferenceException at Pki... | Certificate Connector 的 PkiCreateProcessor.UploadResults 方法存在 bug，导致 NullRefe... | 1) 等待自动恢复（通常 2-4 小时），Connector 每 ~10 分钟重试。2) 重启 Connector 服务（立即修复）。3) 更新到最新版 ... | 9.0 | ado-wiki |
| 11 | iOS 设备 PKCS 证书显示 Pending 或 Not Applicable，VPN profile 安装失败，日志报 Dependent payl... | iOS 上 PKCS 证书关联 VPN profile 时存在严格部署依赖：VPN App 必须先安装 → VPN Profile → PKCS Cert... | 1) 确保 VPN App 先安装在设备上。2) 检查设备日志中的 NotNow 响应。3) VPN App 安装后触发手动同步。4) 考虑将证书和 VP... | 9.0 | ado-wiki |
| 12 | PKCS 证书长时间处于 Pending 状态，Connector Event Log 显示 PkiCreateProcessor.UploadResul... | Certificate Connector 的 PkiCreateProcessor.UploadResults 方法存在 bug，CA 成功签发证书后 ... | 1. 等待自动恢复（通常 2-4 小时）；2. 重启 Connector 服务可立即修复；3. 更新 Connector 到最新版本永久修复。Kusto ... | 9.0 | ado-wiki |
| 13 | PKCS 证书 policy 已成功分配，设备已注册，但证书 Pending 数小时后才最终交付，Intune portal 无明显错误 | 多因素导致延迟：外部 CA 性能（负载/网络延迟）、Connector 服务器资源不足、设备 MDM 同步间隔（iOS/Android/Windows 默... | 1. 检查 Connector Event Log 中的处理延迟；2. 监控 Connector 服务器资源；3. 为 Connector 文件夹添加杀毒... | 9.0 | ado-wiki |
| 14 | iOS 设备 PKCS 证书显示 Pending 或 Not Applicable，VPN profile 安装失败，设备日志报 Dependent pa... | iOS 上 PKCS 证书关联 VPN profile 时，Intune 强制执行部署依赖链：VPN App → VPN Profile → PKCS C... | 1. 确保 VPN App 先安装到设备；2. 检查设备日志中的 NotNow 响应；3. VPN App 安装后触发手动同步；4. 考虑将证书和 VPN... | 9.0 | ado-wiki |
| 15 | Intune 中 Derived Credentials 在 21V 无法配置 | Derived Credentials 功能在 21V 未上线 | 不支持；改用其他证书认证方案（如 SCEP/PKCS） | 8.0 | 21v-gap |
| 16 | GCC High/DoD 环境 Imported PFX 配置需要修改 service endpoint（AuthURI 和 GraphURI） | GCC High/DoD 租户使用 .us 后缀的 endpoint，默认 .com 配置不适用 | 编辑 IntunePfxImport.psd1，将 AuthURI 改为 login.microsoftonline.us，GraphURI 改为 htt... | 7.5 | ado-wiki |
| 17 | Customer is trying to deploy a PFX certificate to an iPhone enrolled into Int... | Customer's PKCS profile in Intune had the following fields populated incorrec... |  | 7.5 | contentidea-kb |
| 18 | The deployment status of PFX Profile shows the errors:&nbsp; &quot;0x87D1FDE9... | There is&nbsp;a bug where the Subject Name Generation requires each user to h... | Go into the User_DISC table and make sure each user that needs a certificate ... | 7.5 | contentidea-kb |
| 19 | When deploying PFX Profile in CONFIGMGR you see the following error in the cr... | Key Archival is not configured on the Certificate Authority. | - Configuration the option &quot;Archive the key&quot; on the &quot;Recovery ... | 7.5 | contentidea-kb |
| 20 | After deploying a PKCS profile to issue certificates to mobile devices, the c... | This can occur if the option �Set the request status to pending. The administ... | To resolve this issue, in the CA Properties under policy module -> Properties... | 7.5 | contentidea-kb |
| 21 | Intune Sr. Support Escalation Engineer and certificate expert Anzio Breeze cr... |  |  | 7.5 | contentidea-kb |
| 22 | After deploying an Android PFX/PKCS certificate profile, the deployment fails... | -&nbsp; &nbsp; &nbsp; &nbsp;This could happen due to an incorrect certificate... | To resolve this issue, select the correct trusted root certificate which will... | 7.5 | contentidea-kb |
| 23 | After deploying an Android PFX/PKCS certificate profile, the deployment fails... | This problem can occur if the Supply in the request&nbsp;option is not enable... | To resolve this issue, edit the certificate template to enable Supply in the ... | 7.5 | contentidea-kb |
| 24 | &nbsp;&quot;S/MIME (Secure/Multipurpose Internet Mail Extensions) is a widely... |  |  | 7.5 | contentidea-kb |
| 25 | This article describes the steps |  | Use these steps to convert a PFX or P12 file to a Base64 string for ingestion... | 7.5 | contentidea-kb |
| 26 | This article looks to give some insights on how Imported PKCS certificates wo... | Details about each component:The Intune Imported PFX Certificate Connector:&n... | Troubleshooting tips:&nbsp;Doing &quot;Get-IntuneUserPfxCertificate&quot; wil... | 7.5 | contentidea-kb |
| 27 | Deploying PFX certificates, via Intune, to Windows 10 machines to use for dev... | Machine certificates (device certificate based authentication) for Windows 10... | Used SCEP profiles for the delivery of the machine certificates and the certi... | 7.5 | contentidea-kb |
| 28 | Whenever you need to update, upgrade or reinstall the Microsoft Intune Certif... |  |  | 7.5 | contentidea-kb |
| 29 | PKCS certificate profile fails to be deployed.            The error happen... | PKCS profile was configured without a Subject Alternative Name (SAN)      ... | When configure PKCS profile, make sure a Subject Alternative name is provided... | 7.5 | contentidea-kb |
| 30 | When enrolling Android devices the wifi profile is not coming down to the dev... | When looking at company portal logs you see the following.&nbsp; &nbsp;Exclud... | Found that the Trusted certificate profile for the root CA wasn't assigned to... | 7.5 | contentidea-kb |
| 31 | Using the new PFX Connector&nbsp;https://docs.microsoft.com/en-us/mem/intune/... | The Certificate template used in the PKCS profile was set for&nbsp;“CNG Crypt... | Version 6.2008.60.612&nbsp;of PFX Connector was released which will allow&nbs... | 7.5 | contentidea-kb |
| 32 | PKCS certificates fail to deploy on co-managed devices.The following event is... | Antivirus application scanning&nbsp;C:\Program Files\Microsoft Intune folder. | Exclude&nbsp;C:\Program Files\Microsoft Intune folder from Antivirus scanning... | 7.5 | contentidea-kb |
| 33 | When you have a PKCS certificate profile that issues device certificates and ... | This is the design of the feature since its inception. We are in the process ... | By-design. | 7.5 | contentidea-kb |
| 34 | After configuring Microsoft Tunnel, the MS tunnel Gateway Health Status shows... | This can occur if there is an issue with the certificate being used. | To resolve this problem, delete and re-import the certificates, then reinstal... | 7.5 | contentidea-kb |
| 35 | Cisco ISE 3.1+ &nbsp;and other partners will be using a new NAC service calle... |  |  | 7.5 | contentidea-kb |
| 36 | When a PKCS certificate profile is deployed to devices, it may get failed due... | This is caused because &quot;Allow private key to be exported&quot; box is no... | Checking the&nbsp;&quot;Allow private key to be exported&quot; box re-applyin... | 7.5 | contentidea-kb |
| 37 | Setting up PKCS imported certificates lab (S/MIME) for Outlook Tuesday, Octob... |  |  | 7.5 | contentidea-kb |
| 38 | This guide is intended to show you how to check whether a &quot;PKCS Import&q... |  |  | 7.5 | contentidea-kb |
| 39 | This article describes the changes made as part of the May 10, 2022, Windows ... |  |  | 7.5 | contentidea-kb |
| 40 | Intune: How to setup PKCS Certificate Lab in My Workspace Test environment |  |  | 7.5 | contentidea-kb |
| 41 | PKCS certificate deployment fails with error 0x800706BA RPC server unavailabl... | Cause 1: PKCS profile has wrong CA FQDN/name. Cause 2: CA cert renewed but Us... | Cause 1: Fix Certification authority and name in PKCS profile. Cause 2: Run c... | 6.5 | mslearn |
| 42 | PKCS certificate fails with 0x80094015 enrollment policy server cannot be loc... | Connector host cannot locate certificate enrollment policy server | Run Add-CertificateEnrollmentPolicyServer PowerShell cmdlet on connector host. | 6.5 | mslearn |
| 43 | PKCS submission pending: Taken Under Submission; PFX request in CA Pending Re... | CA Policy Module set to require admin to explicitly issue certificate | Change CA Policy Module to Follow the settings in the certificate template or... | 6.5 | mslearn |
| 44 | PKCS certificate fails with 0x80070057 parameter is incorrect; connector conf... | PKCS profile misconfigured: wrong CA name or SAN for email but user has no em... | Verify PKCS profile CA name, user group assignment, and that users have valid... | 6.5 | mslearn |
| 45 | PKCS certificate denied by Policy Module; device gets trusted root but not PFX | Computer Account of connector server lacks Read and Enroll permissions on cer... | Add connector server Computer Account to cert template Security tab with Read... | 6.5 | mslearn |
| 46 | PKCS fails with -2146875374 CERTSRV_E_SUBJECT_EMAIL_REQUIRED: Email name unav... | Supply in the request option not enabled on certificate template Subject Name... | Open cert template Properties > Subject Name tab > select Supply in the reque... | 6.5 | mslearn |
| 47 | PKCS certificate profile stuck as Pending in Intune admin center; no obvious ... | Cause 1: PfxRequest files stuck in Failed/Processing folders. Cause 2: Wrong ... | Check %programfiles%\Microsoft Intune\PfxRequest folders for errors. Verify t... | 5.5 | mslearn |
| 48 | After deploying an Android PFX/PKCS certificate profile, the deployment fails... | - This could happen due to an incorrect certificate associated with the profi... | To resolve this issue, select the correct trusted root certificate which will... | 4.5 | contentidea-kb |
| 49 | After deploying an Android PFX/PKCS certificate profile, the deployment fails... | This problem can occur if the Supply in the request option is not enabled on ... | To resolve this issue, edit the certificate template to enable Supply in the ... | 4.5 | contentidea-kb |
| 50 | Intune Sr. Support Escalation Engineer and certificate expert Anzio Breeze cr... |  |  | 3.0 | contentidea-kb |
| 51 | "S/MIME (Secure/Multipurpose Internet Mail Extensions) is a widely accepted m... |  |  | 3.0 | contentidea-kb |
| 52 | This article describes the steps |  | Use these steps to convert a PFX or P12 file to a Base64 string for ingestion... | 3.0 | contentidea-kb |
