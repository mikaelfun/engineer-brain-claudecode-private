# Intune iOS 应用部署与 VPP — 排查速查

**来源数**: 3 | **21V**: 全部适用
**条目数**: 21 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Apple VPP token sync completes but purchased apps not showing in Intune; VppApplicationSyncEvent ... | Apple's Volume Purchase Program sync response does not return the purchased a... | Check VppApplicationSyncEvent in Kusto: VppFeatureTelemetry \| where TaskName == 'VppApplicationS... | 🟢 9.0 | OneNote |
| 2 | VPP app install fails on iOS device. Logs show is not ready for install since user yet to accept ... | The user has not accepted the Apple Volume Purchase Program (VPP) invitation.... | Ensure user accepts the VPP invitation. If user did not receive the invite, check that App Store ... | 🟢 9.0 | OneNote |
| 3 | VPP app license assignment fails with error code 9632: Too many recent calls to manage licenses w... | Too many devices for a single user or too many Apple IDs making requests from... | Switch from user-based VPP licensing to device-based licensing. Device licensing associates each ... | 🟢 9.0 | OneNote |
| 4 | VPP app install fails with LicenseNotFound. Apple rejects install request even though Intune show... | User updated their Apple ID on one or more devices during the lifecycle of In... | Options: (1) Log back in with the original Apple ID used when first accepting Apple VPP agreement... | 🟢 9.0 | OneNote |
| 5 | VPP app install fails with VppDeviceLicenseAssignmentFailedEvent. User gets message Your organiza... | All available VPP user licenses for the app have been claimed. iOS VPP user l... | Options: (1) Switch to device-based VPP licensing, (2) Temporarily revoke app deployment for some... | 🟢 9.0 | OneNote |
| 6 | VPP apps not auto-updating on iOS devices despite tenant having auto-update enabled in Intune. | VPP auto-update is not supported for devices running iOS versions below 11.3.... | Upgrade devices to iOS 11.3 or later to enable VPP auto-update functionality. | 🟢 9.0 | OneNote |
| 7 | VPP app keeps re-installing or prompting for update on iOS/macOS. App version shows mismatch betw... | Could be: (1) Intune service packages incorrect app version - check CreateInt... | TSG steps: (1) Check app version via Apple lookup API, (2) Query IntuneEvent for CreateIntuneAppM... | 🟢 9.0 | OneNote |
| 8 | VPP license cannot be revoked from retired/removed iOS devices via Intune portal. Licenses remain... | Intune cannot revoke VPP licenses from devices that are no longer managed. Ap... | Use REST client (Postman/Insomnia) to call Apple VPP API: 1. Get VPP token from .vpptoken file. 2... | 🟢 9.0 | OneNote |
| 9 | VPP token 在 Intune Admin Center 显示 Duplicate 状态，多个 token 关联到同一 ABM location | 管理员在 Intune 中创建了新的 VPP token 而非续签已有 token，导致两个 token 指向同一 ABM location（Duplic... | 1. 在 Intune Admin Center 中删除重复的 VPP token（保留较早创建的那个）；2. 将应用分配重新关联到保留的 token；3. 后续始终使用 Renew 而非 Cr... | 🟢 8.5 | ADO Wiki |
| 10 | 无法删除或撤销 VPP 应用许可证，报错 'The app failed to delete. Ensure that the app is not associated with any VP... | VPP 应用仍有 license 关联在 ABM location token 上，必须先 revoke 所有 license 才能删除应用 | 1. 在 Intune 中 Revoke 该应用的所有 license（Apps → iOS → select VPP app → App licenses → Revoke）；2. 在 ABM... | 🟢 8.5 | ADO Wiki |
| 11 | VPP token sync 失败，Kusto 显示 FailedSTokenValidation error 9625: 'The server has revoked the sToken' | VPP sToken 已被 Apple 服务器吊销（过期、ABM 侧手动操作或安全策略触发） | 1. 在 ABM/ASM 中下载新的 sToken 文件；2. 在 Intune Admin Center 中上传新 sToken 续签 token（不要创建新 token）；3. 续签后触发手... | 🟢 8.5 | ADO Wiki |
| 12 | VPP 应用报错 'Could not retrieve license for the app with iTunes Store ID'，应用无法安装 | VPP license 未正确分配到设备或用户，可能由 token sync 问题、license 不足或分配冲突导致 | 1. Sync VPP token → sync 设备；2. 如问题持续，移除 group assignment 并重新分配为 device-licensed；3. 仍不行则在 Apps → i... | 🟢 8.5 | ADO Wiki |
| 13 | iOS VPP app install fails with message Your organization has depleted its licenses for this app. ... | User licensing allows installation on 5-10 devices per user. All available VP... | Either purchase more VPP licenses, switch to device-based licensing, or temporarily revoke app de... | 🔵 7.5 | OneNote |
| 14 | Trying to update a .ipa file  in Intune Software Publisher fails.Possible error messages:&quot;Th... | The .ipa packages were not correctly, or fully, updated in development to ref... | The developer of the software will need to be engaged to correct the package.  There is no fix fr... | 🔵 7.0 | ContentIdea KB |
| 15 | *********************************** Please Read ************************************As of Septemb... | After migration to the Azure Portal customers will now need to be manually fl... | Please follow the process below to request the flighitng for these features: 1) Ensure that the S... | 🔵 7.0 | ContentIdea KB |
| 16 | Apps purchased with the Apple Volume Purchase Program are not appearing in the Intune Console. | There are two potential causes of this issue:  A user can sync apps from the ... | Cause 1 - By DesignCause 2- Not Supported at this time.  On the Intune side is that once you uplo... | 🔵 7.0 | ContentIdea KB |
| 17 | Unable to upload VPP token when the Intune subscription is moved to a new Configuration Manager s... | The MDMCertificates table does not contain any data (Certificate data was not... | Use the following steps to resolve this issue:1) Ran the following SQL query on the Configuration... | 🔵 7.0 | ContentIdea KB |
| 18 | Customer requesting deletion of VPP tokenMultiple VPP tokens in admin portal | Update 12/19/17: The option to delete VPP tokens was added to the Ibiza UI wi... | Template for Customer CommunicationMy name is <SE name> and I will be assisting you with your cas... | 🔵 7.0 | ContentIdea KB |
| 19 | When attempting to update the version of a deployed Line-of-Business app using the Azure Intune p... | Varies | To troubleshoot this issue, attempt to update the app using the classic portal (Silverlight porta... | 🔵 7.0 | ContentIdea KB |
| 20 | When attempting to update an Android or iOS app, the following error message is displayed:The sof... | This can occur if the initial APK or IPA file was uploaded without the app wr... | To resolve this problem:If the initial upload was done with the wrapper, the update must include ... | 🔵 7.0 | ContentIdea KB |
| 21 | Apple VPP token shows Assigned to external MDM or assignedToExternalMDM or ClientContextMismatchD... | The same VPP location token was uploaded in two or more device management sol... | Identify the conflicting MDM. If token needed in both MDMs: keep existing token in one MDM, delet... | 🔵 7.0 | ContentIdea KB |

## 快速排查路径
1. Check VppApplicationSyncEvent in Kusto: VppFeatureTelemetry | where TaskName == 'VppApplicationSyncEvent' | project applications — if count is 0, cust `[来源: OneNote]`
2. Ensure user accepts the VPP invitation. If user did not receive the invite, check that App Store is not blocked via Intune device restriction policy.  `[来源: OneNote]`
3. Switch from user-based VPP licensing to device-based licensing. Device licensing associates each VPP license to a unique device and does not require a `[来源: OneNote]`
4. Options: (1) Log back in with the original Apple ID used when first accepting Apple VPP agreement, (2) Move to device licensing that does not involve  `[来源: OneNote]`
5. Options: (1) Switch to device-based VPP licensing, (2) Temporarily revoke app deployment for some users to reclaim licenses, (3) Purchase additional V `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/app-ios.md#排查流程)
