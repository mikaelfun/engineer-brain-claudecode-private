---
description: "Entitlement 合规检查 + 21v Convert 检测，upsert casehealth-meta.json。由 Main Agent 内联执行，不启动 subagent。"
---

# compliance-check — 合规检查

由 casework 流程的 Step 3a 调用，Main Agent **直接执行**（不 spawn subagent）。

## 输入
从 casework 上下文获取：
- `caseNumber`
- `caseDir`（绝对路径）

## 缓存跳过规则

**读 `{caseDir}/casehealth-meta.json` 中的 `compliance` 字段：**
- `compliance.entitlementOk === true` → **跳过整个 compliance check**，直接沿用缓存值
- 缺失 / `entitlementOk === false` / `compliance` 不存在 → 执行下面的完整检查

## 执行步骤

### 1. 读取数据
- 读 `{caseDir}/case-info.md`
- 读 `{caseDir}/casehealth-meta.json`（保留已有 irSla/fdr/fwr 等字段）

### 2. Entitlement 合规检查
从 case-info.md 的 Entitlement 表格读取：
- **Service Name**
- **Schedule**
- **Contract Country**

**判断 `entitlementOk`：**
- ✅ Compliant：Service Name 或 Schedule 包含 `China Cld` 或 `China Cloud`（不区分大小写），**且** Contract Country 为 `China`
- ❌ Not Compliant：Service Name 和 Schedule **都不包含** `China Cld` / `China Cloud`，**或** Contract Country 不是 `China`

如果不合规，在 `warnings` 中记录具体原因（如 "Service Name 不含 China Cloud"、"Contract Country 非 China"）。

### 3. 21v Convert 检测
从 case-info.md 的 Customer Statement 检查：
- 搜索关键词 `21v ticket` / `21Vianet`（不区分大小写）
- 如果匹配，提取：
  - `21vCaseId`：21v ticket 后面的数字（如 `20260309398206`）
  - `21vCaseOwner`：从 "21v case owner:" 后面提取邮箱

⚠️ 21v Convert **不影响** `entitlementOk` 判断。它是独立的标注，用于提醒操作前需与 21v owner 同步。

### 4. Upsert casehealth-meta.json

读已有 meta → 合并 compliance 字段 → 写回。**保留所有已有字段不变**（irSla/fdr/fwr/actualStatus 等）。

精确格式：
```json
{
  "compliance": {
    "entitlementOk": true,
    "serviceLevel": "Premier",
    "serviceName": "Unfd AddOn | ProSv Ente - China Cld",
    "contractCountry": "China",
    "is21vConvert": true,
    "21vCaseId": "20260309398206",
    "21vCaseOwner": "zhang.lihong@oe.21vianet.com",
    "warnings": []
  }
}
```

### 5. 写日志
```bash
mkdir -p "{caseDir}/logs"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] compliance-check OK | Entitlement={ok/fail} 21v={yes/no}" >> "{caseDir}/logs/compliance-check.log"
```

如果跳过（缓存命中）：
```bash
echo "[$(date '+%Y-%m-%d %H:%M:%S')] compliance-check SKIP | cached compliant" >> "{caseDir}/logs/compliance-check.log"
```
