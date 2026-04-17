# Intune iOS/iPadOS 注册与 ADE/DEP — 排查速查

**来源数**: 3 | **21V**: 部分适用
**条目数**: 4 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | iOS MDM enrollment fails after Quick Start restore with error: Unable to create unlock token - Th... | Quick Start restore runs after Setup Assistant completes and passcode is alre... | Use iCloud or iTunes backup restore during Setup Assistant (before passcode step) instead of Quic... | 🟢 9.0 | OneNote |
| 2 | Activation Lock State is showing as &quot;Not enabled.&quot;Other fields are showing accurately, ... | DEP enrollment is not directly related to configuring devices for Activation ... | Unless both of these are present on the device, the Activation Lock will automatically be ignored... | 🔵 7.0 | ContentIdea KB |
| 3 | iOS enrollment fails with: Profile Installation Failed. Connection to the server could not be est... | Device was previously enrolled by a different user and the previous user devi... | Login to Azure portal, go to Devices > All Devices, find the device using previous or new user UP... | 🔵 7.0 | ContentIdea KB |
| 4 | Apple ADE enrollment fails with XPC_TYPE_ERROR Connection invalid error in mobileassetd logs | Network connection problem between device and Apple ADE service (cannot reach... | Fix network connectivity or use a different network to enroll; if persists contact Apple support | 🔵 5.5 | MS Learn |

## 快速排查路径
1. Use iCloud or iTunes backup restore during Setup Assistant (before passcode step) instead of Quick Start. If Quick Start must be used, instruct user t `[来源: OneNote]`
2. Unless both of these are present on the device, the Activation Lock will automatically be ignored on MDM reset � no bypass needed. If the pre-requisit `[来源: ContentIdea KB]`
3. Login to Azure portal, go to Devices > All Devices, find the device using previous or new user UPN or serial number. Remove the device. Once removed,  `[来源: ContentIdea KB]`
4. Fix network connectivity or use a different network to enroll; if persists contact Apple support `[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/enrollment-ios.md#排查流程)
