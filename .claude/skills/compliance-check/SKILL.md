---
description: "Entitlement 合规检查 + 21v Convert 检测，upsert casehealth-meta.json。可独立调用 /compliance-check {caseNumber}，也被 casework 内联执行。"
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
读 `{caseDir}/casehealth-meta.json`：`compliance.entitlementOk === true` → **跳过**，沿用缓存。否则执行完整检查。

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

### 4. Upsert casehealth-meta.json
保留已有字段，合并 compliance：
```json
{ "compliance": { "entitlementOk": true, "serviceLevel": "Premier", "serviceName": "...", "contractCountry": "China", "is21vConvert": false, "21vCaseId": null, "21vCaseOwner": null, "warnings": [] } }
```

### 5. 写日志（合并到 Step 4 的 Bash 中）
```bash
mkdir -p "{caseDir}/logs" && echo "[$(date '+%Y-%m-%d %H:%M:%S')] compliance-check OK | Entitlement={ok/fail} 21v={yes/no}" >> "{caseDir}/logs/compliance-check.log"
```
缓存跳过时：`compliance-check SKIP | cached compliant`。
**禁止**为 mkdir 和 echo 分别发起两次 Bash。
