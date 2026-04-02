---
description: "Entitlement 合规检查 + 21v Convert 检测 + RDSE CC Finder，upsert casehealth-meta.json。可独立调用 /compliance-check {caseNumber}，也被 casework 内联执行。"
name: compliance-check
displayName: 合规检查
category: inline
stability: stable
requiredInput: caseNumber
estimatedDuration: 20s
promptTemplate: |
  Execute compliance-check for Case {caseNumber}. Read .claude/skills/compliance-check/SKILL.md for full instructions, then execute.
allowed-tools:
  - Bash
  - Read
  - Write
---

# /compliance-check — 合规检查

Entitlement 合规检查 + 21v Convert 检测。

## 参数
- `$ARGUMENTS` — Case 编号

## 配置读取
读取 `config.json` 获取 `casesRoot`，设置 `caseDir = {casesRoot}/active/{caseNumber}/`（绝对路径）。

## 缓存跳过
读 `{caseDir}/casehealth-meta.json`：
- `compliance.entitlementOk === true` **且** `ccAccount` 字段已存在（非 undefined）→ **跳过**，沿用缓存
- 否则执行完整检查（Entitlement 已缓存时仍需运行 CC Finder）

> ⚠️ `ccAccount` 为 `null` 视为"已评估但未匹配"，允许跳过。`ccAccount` 字段不存在（undefined）才表示 CC Finder 从未执行过。

### AR 缓存策略
AR case 的 compliance 缓存更积极：
- Entitlement 检查基于 **main case** 数据（`case-info.md` 来自 main case），合同信息不会因 AR 而变化
- 首次检查后缓存永久有效（除非手动清除 meta）
- casework AR PATH 在 Step A3 中调用时，读取 `compliance.entitlementOk`：
  - 有值 → 跳过（无论 true/false，都不重新检查）
  - 无值 → 执行完整检查
- `entitlementOk === false` 时 casework 阻断，但不重新检查（避免反复查询已知不合规的 case）

## 执行步骤

### 1. 读取数据
- `{caseDir}/case-info.md`
- `{caseDir}/casehealth-meta.json`（保留已有 irSla/fdr/fwr 等）

### 2. Entitlement 合规检查
从 case-info.md 的 Entitlement 表读 Service Name、Schedule、Contract Country。
- ✅ OK：Service Name 或 Schedule 含 `China Cld`/`China Cloud`（不区分大小写），**且** Contract Country = `China`
- ❌ Fail：不满足上述条件，`warnings` 记录原因

### 3. 21v Convert 检测
从 Customer Statement 搜索 `21v ticket`/`21Vianet`，匹配则提取 `21vCaseId` 和 `21vCaseOwner`。
⚠️ 21v 不影响 `entitlementOk`，是独立标注。

### 4. CC Finder（RDSE 客户 CC 联系人查找）

读取 `config.json` 获取 `dataRoot` 和 `podAlias`（默认 `mcpodvm@microsoft.com`）。
读取 `{dataRoot}/mooncake-cc.json`。如文件不存在则跳过。

从 `case-info.md` 提取客户名（`Customer/Account` 字段）。

**匹配逻辑**：遍历 `accounts[]`，对每个 `account` 字段做 token-level fuzzy match：
- account 字段可能包含多个别名，用 `/` 分隔（如 `"BMW AG/BMW / 宝马"`）
- 将 account 和客户名分别按 `/`、空格、`-`、`–` 拆分为 token（去除括号内噪音，过滤长度 < 2 的 token）
- 任一 token 存在子串包含关系（`大众中国` 包含 `大众`）即命中
- 取匹配 token 数最多的 account

**匹配成功**时：
1. 提取 `cc` 字段（分号分隔的邮件列表）
2. 将 `<Replace with POD alias>` 替换为 `podAlias` 配置值
3. 在 casehealth-meta.json 中写入：
   - `ccEmails`: 处理后的完整 CC 列表
   - `ccAccount`: 匹配到的账号名
   - `ccKnowMePage`: Know-Me Wiki 链接（仅当非 null 时写入）

**未匹配**时：写入 `ccAccount: null`（标记已评估），不写 `ccEmails`/`ccKnowMePage`。

### 5. Upsert casehealth-meta.json
保留已有字段，合并 compliance：
```json
{ "compliance": { "entitlementOk": true, "serviceLevel": "Premier", "serviceName": "...", "schedule": "CustomerName - China Cld Premier (ContractId)", "contractCountry": "China", "is21vConvert": false, "21vCaseId": null, "21vCaseOwner": null, "warnings": [] } }
```
> `schedule` 字段记录 Entitlement 表的原始 Schedule 值，用于 audit 追溯。

### 6. 写日志（合并到 Step 5 的 Bash 中）
```bash
mkdir -p "{caseDir}/logs" && echo "[$(date '+%Y-%m-%d %H:%M:%S')] compliance-check OK | Entitlement={ok/fail} 21v={yes/no} CC={matched-account|none}" >> "{caseDir}/logs/compliance-check.log"
```
缓存跳过时：`compliance-check SKIP | cached compliant`。
**禁止**为 mkdir 和 echo 分别发起两次 Bash。
