# Disk Azure Stack Edge: Device Management — 排查工作流

**来源草稿**: [ado-wiki-ase-bmc-connection.md], [ado-wiki-ase-device-replacement.md], [ado-wiki-ase-disable-mps.md], [ado-wiki-ase-move-subscription.md], [ado-wiki-ase-performance-logs.md], [ado-wiki-ase-reseat-replace-data-drive.md], [ado-wiki-ase-return-process.md]
**Kusto 引用**: 无
**场景数**: 5
**生成日期**: 2026-04-07

---

## Scenario 1: 通过 BMC 连接 ASE 设备
> 来源: ado-wiki-ase-bmc-connection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 配置主机网卡: 静态 IP `192.168.100.5`, 子网 `255.255.255.0`
2. 连接主机到 ASE 设备 BMC 端口
3. 浏览器访问 `https://192.168.100.100` (开机后可能需要几分钟)
4. 登录 iDRAC: 用户名 `EdgeSupport`, 密码从 Engineering Roster 获取并解密
   `[来源: ado-wiki-ase-bmc-connection.md]`

---

## Scenario 2: 设备更换流程
> 来源: ado-wiki-ase-device-replacement.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 设置替换设备 (安装、连接、配置、激活)
2. 创建与原设备完全匹配的 Shares
3. 刷新 Shares 从 Azure 拉取数据
4. 添加原存储账户到替换设备
   `[来源: ado-wiki-ase-device-replacement.md]`

---

## Scenario 3: 跨订阅移动 ASE 资源
> 来源: ado-wiki-ase-move-subscription.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
> **警告**: 设备上的数据和配置将被擦除

1. 通过 Local WebUI 或 PowerShell 重置设备
2. 在目标订阅中创建新 ASE Resource (选择 "I already have a device")
3. 连接 Local WebUI → 配置 → 激活
4. 删除旧 ASE Resource (后端迁移在 1 个工作日内完成)
   `[来源: ado-wiki-ase-move-subscription.md]`

---

## Scenario 4: 设备退回流程
> 来源: ado-wiki-ase-return-process.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 自助退回: 重置设备并按文档操作
2. 手动退回 (自助失败时):
   - 收集客户信息 (Resource Name, Sub ID, MS Asset Tag 等)
   - 创建 ICM → Team: Azure Stack Edge Service / DataBox Edge Billing Ops
   - 邮件 adbeops@microsoft.com
   `[来源: ado-wiki-ase-return-process.md]`

---

## Scenario 5: 重新安装/更换数据驱动器
> 来源: ado-wiki-ase-reseat-replace-data-drive.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 按下释放按钮打开驱动载体手柄
2. 滑出驱动载体
3. 等待约 30 秒
4. 插入并锁定驱动载体
5. 绿色活动 LED 闪烁 = 驱动就绪
   `[来源: ado-wiki-ase-reseat-replace-data-drive.md]`
