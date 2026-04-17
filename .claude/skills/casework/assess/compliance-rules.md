# Compliance Check Rules

assess Step 2 compliance re-infer 时按需读取本文件。cache-hit 时不读。

## 1. Entitlement 合规检查

从 case-info.md 的 `## Entitlement` 表读取字段，按以下规则判定 entitlementOk：

**判定规则（按 Service Level 分类）：**

| Service Level | 合规条件 | 备注 |
|---|---|---|
| **Unified** | Service Name 或 Schedule 中含 **"China Cloud"** 或 **"21V"** 字样 | 必须有 21V Exhibit |
| **Premier** | Service Name 或 Schedule 中含 **"China Cloud"** 或 **"21V"** 字样 | 必须有 21V Exhibit |
| **Professional** | Service Name = **"21Vianet Cloud Escalation Service"** | 仅限 21Vianet 升级来的 case |
| **ASfP** | 客户名匹配白名单（见下方） | Advanced Support for Partners，自带 21V Exhibit |

**ASfP 白名单**（这些合作伙伴客户无需 21V Exhibit 关键词也算合规）：
- 深圳市伊登软件有限公司 (Edensoft)
- 厦门一维天地信息技术有限公司
- 希意禧(上海)信息系统有限公司
- Digital China Cloud Technology Limited (上海云角信息技术有限公司)

**India Contract 排斥**：如果 Contract Country = India 且 case 在 Mooncake 队列 → `entitlementOk=false`，warnings 加 "India contract case misrouted to Mooncake queue"

**判定逻辑**：
- 匹配 Unified/Premier + 有 21V 信号 → `entitlementOk=true`
- 匹配 Professional + Service Name 含 "21Vianet" → `entitlementOk=true`
- 匹配 ASfP 白名单客户 → `entitlementOk=true`
- 以上都不满足 → `entitlementOk=false`

**entitlementOk=false 时的 warnings 应包含具体原因和后续建议**：
- `"Unified/Premier contract lacks 21V Exhibit (no China Cloud/21V signal in Service Name or Schedule). Contact TA to confirm. If no exhibit, suggest customer raise case from portal.azure.cn."`
- 或 `"India contract case misrouted to Mooncake queue. Transfer back to correct queue."`
- 或 `"Professional case not from 21Vianet escalation. Service Name: {actual_value}."`

## 2. 21v Convert 检测

从 Customer Statement 搜索 `21v ticket`/`21Vianet` → is21vConvert、21vCaseId

## 3. CC Finder

读 `{dataRoot}/mooncake-cc.json`，匹配客户名 → ccEmails、ccAccount（用于首次 IR 邮件 CC 行）

## 4. SAP 三层检查

读 `{dataRoot}/sap-scope.json`：
- 4.5a Mooncake 路径检测 → sapMooncake
- 4.5b Pod 负责范围检测 → sapInPod
- 4.5c SAP 与问题描述一致性（match-sap 脚本化）→ sapMismatch + suggestedSap
→ sapOk = sapMooncake && sapInPod && !sapMismatch

### 4.5c sapMismatch 检测（脚本化）

用 `match-sap.py` 将 case 的问题描述与当前 SAP 对比，判断是否偏移：

```bash
# 从 case-info.md 提取问题描述（Title + Customer Statement 前 200 字）
QUERY=$(python3 -c "
import re
with open(r'{caseDir}/case-info.md', encoding='utf-8') as f:
    c = f.read()
title = re.search(r'\| Title \| (.+?) \|', c)
cs = re.search(r'## Customer Statement\s*\n(.*?)(?=\n##|\Z)', c, re.DOTALL)
parts = []
if title: parts.append(title.group(1).strip())
if cs: parts.append(cs.group(1).strip()[:200])
print(' '.join(parts))
")

# 搜索最匹配的 SAP（mooncake-first + pod-check + JSON 输出）
SAP_MATCH=$(python3 -B .claude/skills/sap-match/match-sap.py $QUERY --scope mooncake-first --pod-check --top 3 --json)
```

**sapMismatch 判定逻辑**：
1. 取 match-sap 返回的 top-1 结果的 `path`
2. 与 case-info.md 中的 `| SAP |` 行做**产品级比较**（比较路径的前 2-3 段）
3. 如果 top-1 的产品级路径与当前 SAP 的产品级路径**不同** → `sapMismatch=true`
4. 如果 top-1 score < 3.0（匹配度太低，无法判断） → `sapMismatch=false`（存疑不判偏移）

**产品级比较**示例：
- 当前 SAP: `Azure/21Vianet Mooncake/21Vianet China Azure Alert` → 产品 = `Azure Alert`
- match-sap top-1: `Azure/21Vianet Mooncake/21Vianet China Azure Alert` → 产品 = `Azure Alert`
- 同产品 → `sapMismatch=false`

**suggestedSap**（sapMismatch=true 时填充）：
从 match-sap 的 top-3 结果中选取 in-pod 且 isMooncake 的最佳路径，格式：
```json
{
  "suggestedSap": {
    "path": "Azure/21Vianet Mooncake/...",
    "guid": "xxx",
    "score": 8.5,
    "reason": "问题描述匹配 Cosmos DB 而非当前 SAP 的 VM"
  }
}
```

**AR SAP 特化**（`isAR=true` 时）：
- 4.5a/4.5b/4.5c 均使用 **`| AR Support Area Path |`** 行（而非主 case 的 `| SAP |` 行）
- AR 产品必须是 Mooncake，AR scope 必须在 pod 范围内
- 4.5c SAP 与**问题描述**一致性：使用 `| AR Support Area Path |` + `## AR Customer Statement`
- compliance 额外保存 `arSapPath` 字段

## 5. 结果 Schema

```json
{
  "compliance": {
    "entitlementOk": true,
    "sourceHash": "$CURRENT_HASH",
    "checkedAt": "ISO",
    "is21vConvert": false,
    "21vCaseId": null,
    "sapOk": true,
    "sapMooncake": true,
    "sapInPod": true,
    "sapMismatch": false,
    "sapPath": "Azure/21Vianet Mooncake/...",
    "suggestedSap": null,
    "warnings": []
  },
  "ccAccount": "BMW AG",
  "ccEmails": "xxx@microsoft.com;yyy@microsoft.com"
}
```

**suggestedSap** 仅当 `sapMismatch=true` 或 `sapInPod=false` 时非 null：
```json
{
  "suggestedSap": {
    "path": "Azure/21Vianet Mooncake/21Vianet China Azure Cosmos DB",
    "guid": "aec80c8e-a29a-96...",
    "score": 11.9,
    "inPod": true,
    "isMooncake": true,
    "suggestedPod": "DnAI"
  }
}
```
- `suggestedPod` 仅当 `inPod=false` 时出现，表示应 transfer 到哪个 POD

## 6. 阻断与降级

- **entitlementOk === false** → 硬阻断：写 execution-plan.json 带 `actualStatus=ready-to-close`、`noActionReason="compliance: not supported"`，跳过后续步骤。warnings 必须包含具体原因。
- **sapOk === false** → 不阻断，warnings 传入 LLM prompt，LLM 可在 actions 中建议修改 SAP。
- **is21vConvert === true** → LLM 的 email-drafter action 应使用 emailType=`21v-convert-ir`（如果是首次 IR）。

---

_Source: Team OneNote [Team][PCS]Case Awareness + [Team][PCS]21V exhibit_
