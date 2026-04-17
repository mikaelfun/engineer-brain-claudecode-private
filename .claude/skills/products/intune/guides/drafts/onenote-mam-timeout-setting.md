---
source: onenote
sourceRef: Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune/## App Protection_Configuration TSG/MAM Timeout Setting.md
sourceUrl: null
importDate: 2026-04-04
type: troubleshooting-guide
---

# MAM Timeout（访问要求重检超时）设置说明

## 定义

**Timeout（超时）**：用户在访问 Intune 托管应用后，不需要重新完成访问要求检查（如输入 PIN、设备合规性检查）的持续时间。

- 默认值：**30 分钟**
- 参数在 MAM 诊断日志中对应：`AccessRecheckOnlineTimeout`
- 离线宽限期对应：`AccessRecheckOfflineTimeout`（默认 720 分钟）

## iOS 特殊行为

- PIN 在所有 Intune 托管应用间**共享**（同一 PIN）
- 当应用进入**后台**时，PIN 定时器**重置**
- 在超时期间，用户在任何 Intune 托管 iOS 应用中均无需重新输入 PIN

## MAM 日志中的 Timeout 分析

MAM 日志中**不会**直接显示 Timeout 倒计时，但可通过 compliance evaluation 状态推断：

```
# Compliant（在超时期内）
IntuneMAM: Completed compliance evaluation with status 0 for identity

# Non-compliant（超时期已过，需重新验证）
IntuneMAM: Evaluation finished synchronously for PINEnabled with non-compliant.
IntuneMAM: Completed compliance evaluation with status 4 for identity
IntuneMAM: MAM_CHECKPOINT: PinView - To access your organization's data with this app, enter your PIN.
```

## 实际行为验证示例

| 操作 | 时间 | 是否要求 PIN |
|------|------|------------|
| 首次登录 Outlook | 18:03:58 | YES |
| 再次打开 Outlook | 18:08:37 | NO |
| 再次打开 Outlook | 18:10:53 | NO |
| 再次打开 Outlook | 18:17:27 | NO |
| 25 分钟后打开 Outlook | 18:29:27 | YES |

## 其他定时器（与 Timeout 不同）

| 定时器名称 | 说明 | 默认值 |
|-----------|------|--------|
| `CheckInInterval` | MAM 策略刷新间隔 | 30 分钟 |
| `OfflineWipeInterval` | 离线擦除宽限期 | 129600 分钟（90 天） |

## 上限说明

根据 PG，Online Timeout 的**硬编码上限**为 **2^63 - 1 分钟**（实际无限制）。
