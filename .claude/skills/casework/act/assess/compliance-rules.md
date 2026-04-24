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

## 3. CC List（两层合并）

### 3.1 Base CC（所有非 AR case）

从 `config.json` 读取 `defaultCcEmails` 字段作为 base CC。所有 case 都设 `ccEmails = defaultCcEmails`。

### 3.2 RDSE CC（追加层）

读 `{dataRoot}/mooncake-cc.json`，匹配客户名：
- 匹配成功 → 设 `ccAccount`，将 CC Finder 结果**追加**到 base CC 中
- 合并时**去重**（以邮箱地址为 key，忽略大小写）
- 清理：移除 `<Replace with POD alias>` 占位符（已被 base CC 中的 podAlias 覆盖）、清理多余分号和空格
- 匹配失败 → `ccAccount` 不设（非 RDSE），`ccEmails` 保持 base CC

## 4. SAP 三层检查

读 `{dataRoot}/sap-scope.json`：
- **归一化**：比较前先将 SAP 路径中的 `\` 替换为 `/`（D365 有时用反斜杠）
- 4.5a Mooncake 路径检测 → sapMooncake
- 4.5b Pod 负责范围检测 → sapInPod
- 4.5c SAP 与问题描述一致性（match-sap 脚本化）→ sapMismatch + suggestedSap
→ sapOk = sapMooncake && sapInPod && !sapMismatch

### 4.5c sapMismatch 检测（脚本化）

用 `match-sap.py` 将 case 的问题描述与当前 SAP 对比，判断是否偏移。

**关键原则：问题描述和 SAP 必须来自同一侧**
- 非 AR case → 用 `## Customer Statement` + `| SAP |`
- AR case → 用 `## AR Customer Statement` + `| AR Support Area Path |`
- **绝对禁止**：用 AR 问题描述搜索的结果对比 main case SAP（两者产品本来不同，一定会误报 mismatch）

```bash
# 从 case-info.md 提取问题描述和 SAP（区分 AR / 非 AR）
QUERY_AND_SAP=$(python3 -c "
import re
with open(r'{caseDir}/case-info.md', encoding='utf-8') as f:
    c = f.read()
# 检测 AR：case number 末尾 3 位 > 000，或有 AR Support Area Path 字段
cn = re.search(r'\| Case Number \| (\d+) \|', c)
is_ar = False
if cn and len(cn.group(1)) > 3 and cn.group(1)[-3:] != '000':
    is_ar = True
ar_sap = re.search(r'\| AR Support Area Path \| (.+?) \|', c)
if ar_sap:
    is_ar = True

if is_ar and ar_sap:
    # AR case：用 AR 的问题描述 + AR SAP
    sap = ar_sap.group(1).strip()
    ar_cs = re.search(r'## AR Customer Statement\s*\n(.*?)(?=\n##|\Z)', c, re.DOTALL)
    query = ar_cs.group(1).strip()[:200] if ar_cs else ''
elif is_ar and not ar_sap:
    # AR case 但没有 AR SAP 字段 → 跳过 sapMismatch
    print('SKIP_AR_NO_SAP')
    import sys; sys.exit(0)
else:
    # 非 AR case：用主 Customer Statement + 主 SAP
    sap_m = re.search(r'\| SAP \| (.+?) \|', c)
    sap = sap_m.group(1).strip() if sap_m else ''
    title = re.search(r'\| Title \| (.+?) \|', c)
    cs = re.search(r'## Customer Statement\s*\n(.*?)(?=\n##|\Z)', c, re.DOTALL)
    parts = []
    if title: parts.append(title.group(1).strip())
    if cs: parts.append(cs.group(1).strip()[:200])
    query = ' '.join(parts)

print(f'{sap}|||{query}')
")

# SKIP_AR_NO_SAP → 跳过 4.5c
if [ "$QUERY_AND_SAP" = "SKIP_AR_NO_SAP" ]; then
  # AR case 缺 AR SAP 字段，不判 mismatch
  SAP_MISMATCH=false
else
  CURRENT_SAP=$(echo "$QUERY_AND_SAP" | cut -d'|' -f1)
  QUERY=$(echo "$QUERY_AND_SAP" | cut -d'|' -f4-)
  SAP_MATCH=$(python3 -B .claude/skills/sap-match/match-sap.py $QUERY --scope mooncake-first --pod-check --top 3 --json)
fi
```

**sapMismatch 判定逻辑**：
1. 取 match-sap 返回的 top-1 结果的 `path`
2. 与**同侧 SAP**（非 AR → `| SAP |`，AR → `| AR Support Area Path |`）做**产品级比较**
3. 产品级比较：提取路径中产品关键词（去掉 21Vianet/Mooncake/China 前缀），比较核心产品名
4. 如果核心产品名**不同** → `sapMismatch=true`
5. 如果 top-1 score < 3.0 → `sapMismatch=false`（存疑不判）

**产品级比较**示例：
- 当前 SAP: `Azure/21Vianet Mooncake/21Vianet China Azure Alert` → 核心产品 = `Alert`
- match-sap top-1: `Azure/21Vianet Mooncake/21Vianet China Azure Alert` → 核心产品 = `Alert`
- 同产品 → `sapMismatch=false`

**AR 误报防护**：
- AR case 的 SAP 通常和 main case 不同（比如 main=Alert，AR=PostgreSQL）
- 如果用 AR 描述搜到 PostgreSQL，和 **AR SAP** 对比 → 正确一致 → `sapMismatch=false`
- 如果错误地和 **main SAP** (Alert) 对比 → 误报 mismatch

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
  "ccEmails": "mcpodvm@microsoft.com;fangkun@microsoft.com;vivianx@microsoft.com;xxx@microsoft.com;yyy@microsoft.com"
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
