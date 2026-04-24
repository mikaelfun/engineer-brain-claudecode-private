# Lab 复现排查（Step 4A）

> 按需加载：主控 SKILL.md 判定 `lab: applicable` 时读取本文件。

## 前置

读取 `playbooks/guides/lab-environments.md` 获取 Lab 架构、操作指引和安全红线。

## A0. 环境准备

**VM deallocated 不是放弃的理由**——这是你的 Lab，可以自由启动。

1. 检查需要的 VM 状态：`az vm list -g {rg} --subscription {subId} -d -o table`
2. 如果目标 VM deallocated → **启动它**（无需人工授权）：
   ```bash
   AZURE_CONFIG_DIR="/c/Users/fangkun/.azure-profiles/{profile}" \
   az vm start -g {rg} -n {vm} --subscription "{subId}" --no-wait
   ```
3. 最小启动集参考 `lab-environments.md` 的"操作指引"section
4. 等 VM 启动完成（~1-2 分钟）后继续

**ICP/网络限制不是放弃的理由**——从 VNet 内的 Client VM 执行测试即可绕过外部网络限制。Lab 就是这样设计的。

## A1. 执行复现

用 `az vm run-command` 在 **Lab Client VM**（不是 ADFS/DC）上执行客户的操作：

```bash
AZURE_CONFIG_DIR="/c/Users/fangkun/.azure-profiles/{profile}" \
az vm run-command invoke -g {rg} -n {clientVm} \
  --subscription "{subId}" \
  --command-id RunPowerShellScript \
  --scripts '{script}' \
  --output json | python3 -c "import json,sys; print(json.load(sys.stdin)['value'][0]['message'])"
```

**选择执行 VM 的原则**：
- 需要访问 ADFS/内网服务 → 在 Client VM（同 VNet）上执行
- 需要检查 ADFS 配置 → 在 ADFS VM 上执行
- 需要检查 AD 配置 → 在 DC VM 上执行
- 不要从本机直接连——本机不在 VNet 内，可能受网络限制

观察复现结果：
- **复现成功** → 获取第一手错误信息、日志、trace
- **复现失败**（Lab 行为与客户不同）→ 重要信号：问题与客户特有配置相关，收窄排查方向

⚠️ **Lab 环境限制 ≠ 客户环境限制**：Lab 的 ICP 限制、域名配置、网络拓扑是 Lab 自身的特征，**不能用来推断客户环境的状况**。例如 Lab 的 ADFS 域名没有 ICP 备案所以外部不可达，但客户的 ADFS 可能完全可达。Lab 复现的价值在于验证**协议行为和配置逻辑**，不是验证网络可达性。

## A2. 本地 Debug

复现成功后，在 Lab 环境中深入排查：
- 查看 ADFS/AADC/DC 的 Event Log
- 抓 Fiddler/Network trace
- 检查具体配置（如 ADFS Endpoint、Claim Rules、AADC Sync Rules）
- 尝试修改配置验证假设

## A3. 按需查 KB/Kusto

根据 Lab debug 中发现的具体错误码/日志信息：
- **精确搜索知识库**——此时有了具体的错误码，搜索命中率远高于用模糊症状搜
- **按需 Kusto 查询**——验证客户侧是否有相同的错误模式
- 找到解决方案后，先在 Lab 验证方案有效性，再推荐给客户

## A4. 配置变更记录与回滚

> Lab 是共享资源（尤其 mcpod 租户），每次排查后必须恢复初始状态。

**所有配置变更落盘**到 `{caseDir}/analysis/lab-changes.md`：

```markdown
# Lab Configuration Changes — Case {caseNumber}

> Lab: {lab name}
> Session: {timestamp}

## Changes

| # | Time | VM/Target | Action | Before | After | Rollback Command |
|---|------|-----------|--------|--------|-------|-----------------|
| 1 | 10:30 | labadfsADFS | Enable ADFS endpoint usernamemixed | Disabled | Enabled | `Set-AdfsEndpoint -AddressPath /adfs/services/trust/2005/usernamemixed -Proxy $false` |
| 2 | 10:35 | mcpod tenant | Set SmtpClientAuthenticationDisabled=false | true | false | `Set-TransportConfig -SmtpClientAuthenticationDisabled $true` |

## Rollback Status

| # | Rolled Back | Time | Verified |
|---|-------------|------|----------|
| 1 | ✅ | 11:00 | Yes |
| 2 | ✅ | 11:01 | Yes |
```

**规则**：
- **修改前先记录 Before 值**——没有记录 Before 就禁止修改
- **每项变更必须附带 Rollback Command**——写不出回滚命令的变更不执行
- **排查完成后逐条回滚**，验证回滚后配置恢复原值
- 全部回滚完成后在文件末尾标记 `## All Changes Rolled Back ✅ — {timestamp}`
- 如有变更无法回滚（如不可逆操作），必须在修改前返回给用户请求授权

## A5. 操作安全

- **Subscription 白名单**：只能操作 Kun Fang 个人 Lab subscription（Global: `943b20ff-9226-4eae-bbbe-b8bf0f2fba60` / China: `21ed21fb-ecfe-4b79-9b66-76a6a7cf5c37`），禁止操作其他任何 subscription
- **公共租户保护**：mcpod 等 POD 公共租户的全局配置（CA Policy、Security Defaults、Federation）修改前必须返回给用户请求授权，无法授权则记录 block 原因并取消操作
- **资源台账**：创建的任何资源记录到 `{caseDir}/analysis/lab-resources.md`，复现完成后按台账清理，不能删除台账之外的资源
- **命名规范**：Resource Group 以 `config.json` 工程师邮箱前缀（如 `FANGKUN-`）开头

## 日志

```
[timestamp] STEP 4A OK | lab: {name}, reproduced: {yes|no|partial}
  error captured: {具体错误信息}
  fix verified in lab: {yes|no}
  changes: {N} made, {M} rolled back
```
