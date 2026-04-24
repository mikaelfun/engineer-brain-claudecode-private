# Lab Environments — Quick Reference

> 完整配置源：`C:\Users\fangkun\OneDrive - Microsoft\Work\Lab\Lab Agent\env config\lab-environments.md`
> 部署脚本源：`C:\Users\fangkun\OneDrive - Microsoft\Work\Learning\AAD\Dual Fed\`

## 环境总览

| Lab | Cloud | Profile | Domain | 架构 | 用途 |
|-----|-------|---------|--------|------|------|
| **Dual Fed Lab** | Global (East Asia) | `kunlabext-fangkun` | `kunlabdualadfs.com` | DC + ADFS + WAP + CA + 2×AADC + 2×Client | 同 UPN 双联邦（Global + 21V） |
| **Old ADFS Lab** | China (North 3) | `mcpod-fangkun` | `kunlabcnadfs.com` | DC + ADFS + WAP + CA + 2×AADC + NPS + 3×Client | 不同 UPN 双联邦 + NPS MFA |
| **VM Ready Lab** | China | `mcpod-fangkun` | - | 通用 VM | VM 排查复现 |

## Lab 1: Dual Fed Lab (Global)

```
AD Forest: ad.kunlabdualadfs.com (NetBIOS: KUNLABDUAL)
    |
    +-- ADFS (adfs.kunlabdualadfs.com)
    |       +-- RPT Worldwide → Global Azure (kunlabext.com)
    |       +-- RPT China → Mooncake (mcpod)
    |
    +-- AADC #1 [labadfsADFS] → Global
    +-- AADC #2 [labadfsAADC2] → Mooncake
```

| VM | Role | IP |
|---|---|---|
| labadfsdc | DC + DNS | 10.2.0.4 |
| labadfsADFS | ADFS + Global AADC | 10.2.0.5 |
| labadfsCA | Enterprise Root CA | 10.2.0.6 |
| labadfsWAP | WAP | 10.2.0.7 |
| labadfsClient1 | Win 11 Client | 10.2.0.8 |
| labadfsClient2 | Win 11 Client | 10.2.0.9 |
| labadfsAADC2 | Mooncake AADC | 10.2.0.11 |

- **Sub**: `943b20ff-...`, **RG**: `FANGKUN-ADFS-RG`
- **VNet**: `labadfsdc-vnet` (10.2.0.0/16), DNS → 10.2.0.4
- **Test users**: `labuser1/2/3@kunlabdualadfs.com`
- **Domain admin**: `KUNLABDUAL\labadmin`

## Lab 2: Old ADFS Lab (China)

```
AD Forest: ad.kunlabcnadfs.com (NetBIOS: KUNLABCN)
    |
    +-- ADFS (adfs.kunlabcnadfs.com)
    |       +-- Mooncake: kunlabcnadfs.com (AD UPN)
    |       +-- Global: kunlabextdual.com (AD mail attr, Alternate Login ID)
    |
    +-- AADC Mooncake [labadfsADFS] → mcpod
    +-- AADC Global [labAADCGlobal] → kunlabext
    +-- NPS + MFA Extension [labadfsNPS]
```

| VM | Role | IP | Status |
|---|---|---|---|
| labadfsdc | DC + DNS | 10.2.0.4 | Running |
| labadfsADFS | ADFS + Mooncake AADC | 10.2.0.5 | Running |
| labadfsCA | CA | 10.2.0.6 | Deallocated |
| labadfsWAP | WAP | 10.2.0.7 | Deallocated |
| labadfsClient1 | Win 11 | 10.2.0.8 | Running |
| labAADCGlobal | Global AADC | 10.2.0.12 | Running |
| labadfsNPS | NPS + MFA | 10.2.0.13 | Running |

- **Sub**: `21ed21fb-ecfe-4b79-9b66-76a6a7cf5c37`, **RG**: `FANGKUN-ADFS-RG`

### 操作指引

- **VM deallocated 时**：用 `az vm start` 启动需要的 VM，不需要人工授权。这是你自己的 Lab，可以自由启动/停止。
  ```bash
  AZURE_CONFIG_DIR="/c/Users/fangkun/.azure-profiles/mcpod-fangkun" \
  az vm start -g FANGKUN-ADFS-RG -n labadfsdc --subscription "21ed21fb-ecfe-4b79-9b66-76a6a7cf5c37" --no-wait
  ```
- **最小启动集**：DC(`labadfsdc`) + ADFS(`labadfsADFS`) + Client(`labadfsClient1`)。CA/WAP/NPS 按需启动。
- **ICP 限制说明**：21V 对未备案域名阻断 TLS，所以**从外部（包括 Exchange Online 数据中心）无法直接连接 ADFS**。但 **VNet 内的 Client VM 不受 ICP 限制**，可以正常访问 ADFS、做联邦登录、跑 SMTP AUTH 脚本。测试时用 `az vm run-command` 在 Client1 上执行脚本即可。
- **测试完成后**：停止启动的 VM 节省成本（`az vm deallocate --no-wait`）。

## 测试租户

| Tenant | ID | Admin | Entra P2 |
|--------|---|-------|----------|
| mcpod | `954ddad8-...` | admin@mcpod.partner.onmschina.cn | Paid |
| cssmcea | `95f625cc-...` | podvm@cssmcea... | Paid |
| mcpodtrial | `17b355a6-...` | test_test@mcpodtrial... | Paid |
| mcpod2 | `b9e55f5c-...` | admin@mcpod2... | 2025/06 |
| mcpod3 | `02c52363-...` | admin1@mcpod3... | Not yet |

密码查询: `https://mcpodaccounts.chinacloudsites.cn/api/getaccountsecret?code=<FUNCTION_KEY>&account=<UPN>`
<!-- Function key stored in: ~/.azure-profiles/mcpod-fangkun/lab-function-key.txt -->

## 远程执行

```bash
# 在 lab VM 上执行 PowerShell（无需 RDP）
AZURE_CONFIG_DIR="/c/Users/fangkun/.azure-profiles/kunlabext-fangkun" \
az vm run-command invoke -g FANGKUN-ADFS-RG -n labadfsdc \
  --subscription "943b20ff-9226-4eae-bbbe-b8bf0f2fba60" \
  --command-id RunPowerShellScript \
  --scripts 'Get-ADDomain' \
  --output json | python3 -c "import json,sys; print(json.load(sys.stdin)['value'][0]['message'])"
```

## 适用场景速查

| 需要验证的场景 | 用哪个 Lab |
|--------------|-----------|
| ADFS 联邦认证流程 | Lab 1 或 Lab 2 |
| Dual federation / SSO | Lab 1（同 UPN）或 Lab 2（不同 UPN） |
| AADC sync / PHS / PTA | Lab 1 或 Lab 2 |
| SMTP AUTH + ADFS | Lab 2（21V ADFS，可测 usernamemixed） |
| NPS MFA Extension | Lab 2（已部署 NPS） |
| Conditional Access / Security Defaults | 任意测试租户 |
| VM 问题复现 | VM Ready Lab |

---

## 操作安全红线

### Subscription 权限

| Subscription | 允许操作 | 说明 |
|-------------|---------|------|
| `943b20ff-9226-4eae-bbbe-b8bf0f2fba60` (ME-MngEnvMCAP657676-fangkun-2) | ✅ 可自由创建/修改/删除资源 | Kun Fang 个人 Global Lab |
| `21ed21fb-ecfe-4b79-9b66-76a6a7cf5c37` ([MC-CN-VmScim] Kun.Fang) | ✅ 可自由创建/修改/删除资源 | Kun Fang 个人 Mooncake Lab |
| **其他任何 Subscription** | 🚫 **禁止操作** | 包括客户 subscription、其他 POD 成员的 subscription |

### Entra ID / Azure AD 租户保护

| 租户 | 可做 | 需授权 | 禁止 |
|------|------|--------|------|
| **kunlabext.com** (个人 Global) | 创建/修改/删除用户、应用注册、CA 策略 | - | - |
| **mcpod** (POD 公共租户) | 读取配置、创建 lab 用户 | ⚠️ 修改全局策略（CA Policy、Security Defaults、Federation config） | 删除其他成员创建的用户/应用 |
| **cssmcea / mcpodtrial / mcpod2/3** | 读取配置、创建 lab 用户 | ⚠️ 同上——修改全局策略需授权 | 同上 |

**授权流程**：遇到需要修改 POD 公共租户全局配置的操作时：
1. **停止执行**，不要先改再问
2. 返回给用户说明：要修改什么、为什么需要修改、影响范围
3. 用户确认后执行；用户拒绝或无法授权 → 记录 block 原因到日志，跳过该操作

### 资源生命周期管理

#### 命名规范

| 资源类型 | 命名格式 | 示例 |
|---------|---------|------|
| Resource Group | `{engineerPrefix}-{purpose}-RG` | `FANGKUN-SMTPTEST-RG` |
| VM | `{engineerPrefix}-{purpose}-{role}` | `fangkun-smtptest-dc` |
| VNet | `{engineerPrefix}-{purpose}-vnet` | `fangkun-smtptest-vnet` |
| NSG | `{engineerPrefix}-{purpose}-nsg` | `fangkun-smtptest-nsg` |
| 其他资源 | `{engineerPrefix}-{purpose}-{type}` | `fangkun-smtptest-pip` |

`engineerPrefix` 从 `config.json` 的 `engineerAlias`（fangkun@microsoft.com → `fangkun`）推导。

#### 资源台账

每次 Lab 复现**创建或删除资源**时，必须更新 `{caseDir}/analysis/lab-resources.md`：

```markdown
# Lab Resources — Case {caseNumber}

> Created by: troubleshooter agent
> Last updated: {timestamp}

## Audit Log

| Time | Action | Resource | Type | Subscription | Resource Group | Reason |
|------|--------|----------|------|-------------|---------------|--------|
| 2026-04-22 10:30 | created | fangkun-smtptest-vm | VM | 21ed21fb-... | FANGKUN-SMTPTEST-RG | SMTP AUTH 复现测试 |
| 2026-04-22 10:35 | created | fangkun-smtptest-pip | Public IP | 21ed21fb-... | FANGKUN-SMTPTEST-RG | VM 公网访问 |
| 2026-04-22 11:00 | deleted | fangkun-smtptest-pip | Public IP | 21ed21fb-... | FANGKUN-SMTPTEST-RG | 复现完成，不再需要 |
| 2026-04-22 11:01 | deleted | fangkun-smtptest-vm | VM | 21ed21fb-... | FANGKUN-SMTPTEST-RG | 复现完成，不再需要 |

## Current Resources

| Resource | Type | Subscription | Resource Group | Created | Status |
|----------|------|-------------|---------------|---------|--------|
| fangkun-smtptest-vm | VM | 21ed21fb-... | FANGKUN-SMTPTEST-RG | 2026-04-22 10:30 | deleted (11:01) |
| fangkun-smtptest-pip | Public IP | 21ed21fb-... | FANGKUN-SMTPTEST-RG | 2026-04-22 10:35 | deleted (11:00) |
```

**Status 值**：`active`（存活）| `deleted`（已删除，注明删除时间）| `retained`（保留，注明原因）

#### 清理规则

- 复现完成后、分析报告写完后，**主动检查 `lab-resources.md`**
- 不再使用的资源 → 按台账逐条删除，标记 Status = `deleted`
- **禁止 `az group delete` 删除非自己创建的 Resource Group**——只删自己创建的
- **禁止 `az resource delete` 删除台账之外的资源**
- 如有资源需保留（后续排查可能复用），标记 Status = `retained`，注明保留原因

### 操作日志

所有 Lab 操作写入 troubleshooter 日志：
```
[timestamp] LAB-OP | action=create-vm | resource=fangkun-smtptest-vm | sub=21ed21fb-... | rg=FANGKUN-SMTPTEST-RG
[timestamp] LAB-OP | action=run-command | vm=labadfsADFS | script="Test-NetConnection smtp.partner.outlook.cn -Port 587"
[timestamp] LAB-OP | action=delete-rg | rg=FANGKUN-SMTPTEST-RG | reason=repro-complete
```
