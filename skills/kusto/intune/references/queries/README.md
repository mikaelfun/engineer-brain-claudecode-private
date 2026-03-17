# Intune Kusto 查询索引

> 更新时间：2026-01-14

## 查询分类索引

| 类别 | 文件 | 用途 |
|------|------|------|
| 设备信息查询 | [device-info.md](device-info.md) | 设备 ID 映射、AAD Device ID、租户信息、AAD 注册信息 |
| 设备 Check-in 查询 | [device-checkin.md](device-checkin.md) | 设备签到历史、会话信息、HttpSubsystem 路由、MDMCheckIn |
| 策略管理查询 | [policy-status.md](policy-status.md) | 策略应用状态、合规性统计 |
| 策略错误排查 | [policy-error.md](policy-error.md) | 策略错误详情、Check-in 失败分析 |
| 应用安装查询 | [app-install.md](app-install.md) | 应用安装、下载、LOB/Win32 应用、下载关联查询 |
| IME Extension 查询 | [ime-extension.md](ime-extension.md) | IME Agent (IntuneWindowsAgent) 安装事件 🆕 |
| 通用事件查询 | [intune-events-general.md](intune-events-general.md) | IntuneEvent/DMP 全量查询、RelatedActivityId 关联 🆕 |
| MAM 查询 | [mam-policy.md](mam-policy.md) | 移动应用管理、应用保护策略 |
| 许可证查询 | [license-status.md](license-status.md) | 用户许可证状态和历史 |
| 设备注册查询 | [enrollment.md](enrollment.md) | 设备注册和生命周期 |
| 合规状态查询 | [compliance.md](compliance.md) | 设备合规状态、合规计算事件 |
| 有效组评估查询 | [effective-group.md](effective-group.md) | EG 成员关系、按 policyID 查询、EG 变更事件 |
| 证书相关查询 | [certificate.md](certificate.md) | SCEP/PKCS 证书、MDM 证书 |
| VPP 令牌查询 | [vpp-token.md](vpp-token.md) | Apple VPP 令牌同步 |
| Autopilot 查询 | [autopilot.md](autopilot.md) | Autopilot V2 注册和预配 |
| Apple 设备查询 | [apple-device.md](apple-device.md) | iOS/macOS/iPad 设备 |
| Comanagement 查询 | [comanagement.md](comanagement.md) | SCCM 共管场景 |

---

## ⚠️ 重要提示：设备 ID 类型区分

**Intune 中有两种不同的设备 ID**：
- **Intune Device ID**: Intune 内部设备标识符
- **AAD Device ID (Entra ID Device ID)**: Azure AD 设备标识符

**关键注意事项**：
- 用户提供的设备 ID 可能是任一类型
- **必须使用 `* has 'device-id'` 宽泛条件搜索**，不要用精确匹配
- 先查询确认设备存在并获取 Intune Device ID，再进行后续查询

---

## 常用参数说明

| 参数 | 说明 | 获取方式 |
|------|------|----------|
| `{deviceId}` | Intune 设备 ID | Intune 门户或 DeviceLifecycle 表 |
| `{aadDeviceId}` | Azure AD 设备 ID | Azure 门户 |
| `{accountId}` | Intune 账户 ID | DeviceLifecycle 表 |
| `{tenantId}` | Entra ID 租户 ID | Azure 门户或 DeviceLifecycle 表 |
| `{userId}` | Entra ID 用户对象 ID | Azure 门户或 DeviceLifecycle 表 |
| `{policyId}` | 策略 ID | Intune 门户或策略状态查询 |
| `{appId}` | 应用 ID | Intune 门户 |
| `{startTime}` | 开始时间 | ISO 8601 格式或 ago() |
| `{endTime}` | 结束时间 | ISO 8601 格式或 now() |

---

## 诊断流程建议

### 设备 Check-in 停滞排查（重要）
1. 使用 [device-info.md](device-info.md) **宽泛搜索**确认设备并获取 Intune Device ID
2. 使用 [device-checkin.md](device-checkin.md) 检查后台实际 Check-in 活动
3. 使用 [policy-error.md](policy-error.md) 查找策略错误
4. 分析错误类型和影响范围
5. 在 Intune 门户修复或移除问题策略

### 设备策略不生效排查
1. 使用 [device-info.md](device-info.md) 确认设备存在
2. 使用 [device-checkin.md](device-checkin.md) 检查设备最后签到时间
3. 使用 [policy-status.md](policy-status.md) 查看策略应用状态
4. 检查 Applicability 和 Compliance 字段定位问题

### 应用安装失败排查
1. 使用 [app-install.md](app-install.md) 查询应用安装事件
2. 查看 SideCar 事件获取 Win32 应用详情
3. 分析错误信息

### MAM 策略不生效排查
1. 使用 [mam-policy.md](mam-policy.md) 查询 MAM 活动
2. 检查应用注册状态
3. 分析 PolicyState 和 ReasonCode

### IME Extension 安装排查
1. 使用 [ime-extension.md](ime-extension.md) 查询 IME Agent 安装事件
2. 确认 IntuneWindowsAgent.msi 是否成功安装
3. 使用 [app-install.md](app-install.md) 确认 IME 报告状态

### 通用事件排查
1. 使用 [intune-events-general.md](intune-events-general.md) 按设备/用户检索全量事件
2. 通过 RelatedActivityId 展开关联事件，获取完整操作链路
3. 使用 filterstring 灵活过滤

### 用户许可证问题排查
1. 使用 [license-status.md](license-status.md) 查询许可证状态
2. 查看 MSODS 审计日志确认许可证分配/移除操作

---

## 相关资源
- [表定义](../tables/README.md)
- [父 Skill](../../SKILL.md)
