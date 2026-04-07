---
source: onenote
sourceRef: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## App Protection_Configuration TSG/MAM Log Analysis- Key word.md
sourceUrl: null
importDate: 2026-04-04
type: troubleshooting-guide
---

# MAM 诊断日志分析关键词指南

## 日志文件识别

MAM 日志关键标识：
- 文件名包含：`com.microsoft.xxxxxxx-IntuneMAMDiagnosticInfo`
- 日志前缀：`IntuneMAM:`

## 关键字段

| 字段 | 说明 |
|------|------|
| `AppVersion` | 应用版本 |
| `SDKVersion` | Intune MAM SDK 版本 |
| `IntuneIdentityUPN` | 用户 UPN（明文形式） |
| `CMARScrubbedIdentity` | 用户身份（哈希脱敏形式） |
| `CMARScrubbedURL` | URL（脱敏形式） |

## 场景一：不同用户身份冲突导致 MAM 注册失败

**日志关键词**：`CMAREnrollmentPreReqOperation`

```
IntuneMAM: CMAREnrollmentPreReqOperation: Failed to enroll user because 
the application is already MDM enrolled and the provided identity does not 
match the MDM enrolled identity.
MDM CMARScrubbedIdentity: <hash1>
Enrolled CMARScrubbedIdentity: <hash2>
```

**含义**：应用已以某用户 MDM 注册，当前尝试注册的用户身份不匹配。

## 场景二：应用间数据传输

**Outlook 打开附件到 Word**（允许）：
- Outlook 日志：`openURL URL: CMARScrubbedURL:ms-word://...`
- Word 日志：`openURL URL: CMARScrubbedURL:ms-outlook://emails/...`

**Word 共享到 Outlook**（被策略阻止）：
- Word 日志：`Returning FALSE from canOpenURL due to policy setting. url: CMARScrubbedURL:ms-outlook-shared:/`

## 场景三：PIN 检查

**设备密码检查**：
```
IntuneMAM: CMARConditionalLaunchDevicePIN: passcode check returned device has passcode enabled
```

**App PIN 不合规**：
```
IntuneMAM: Evaluation finished synchronously for PINEnabled with non-compliant.
IntuneMAM: Completed compliance evaluation with status 4 for identity <hash>
IntuneMAM: MAM_CHECKPOINT: PinView - To access your organization's data with this app, set a PIN.
```

**状态码**：
- `status 0` = Compliant（合规）
- `status 4` = Not Compliant（不合规）

## 场景四：Touch ID / Face ID 替代 PIN

```
IntuneMAM: canUseBiometricAuth status = 1
IntuneMAM: Completed compliance evaluation with status 0 for identity <hash>
```

## 场景五：Web 内容传输限制

```
IntuneMAM: MAM_CHECKPOINT: Alert - Your organization requires you to install the Managed Browser app
IntuneMAM: Returning FALSE from canOpenURL due to policy setting. url: CMARScrubbedURL:googlechrome:///
```

## 场景六：MAM 定时器

```
IntuneMAM: CMAROperationScheduler: Setting up background timers for policy-checkins and offline wipe...
IntuneMAM: CMAROperationScheduler: Next policy check-in will happen in 29.9 minutes.
IntuneMAM: CMAROperationScheduler: Offline wipe timeout will expire in 129599 minutes.
```

| 定时器 | 说明 | 默认值 |
|--------|------|--------|
| Policy check-in | MAM 策略刷新间隔 | 30 分钟 |
| Offline wipe timeout | 离线擦除宽限期 | 90 天（129600 分钟） |
