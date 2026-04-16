# Purview 敏感度标签加密与权限 — 排查工作流

**来源草稿**: `ado-wiki-b-learn-exo-powershell-pme.md`, `ado-wiki-b-message-header-analyzer-tool.md`, `ado-wiki-b-required-information-pme.md`, `ado-wiki-check-encryption-method.md`, `ado-wiki-check-label-encryption-enabled.md`
**Kusto 引用**: `mip-request-analysis.md`
**场景数**: 35
**生成日期**: 2026-04-07

---

## Scenario 1: EXO PowerShell Quick Reference — Purview Message Encryption
> 来源: ado-wiki-b-learn-exo-powershell-pme.md | 适用: 未标注

### 排查步骤
See [How To: Connect to Services](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/11330/How-To-Connect-to-Services) for installing and connecting the EXO module.

`[来源: ado-wiki-b-learn-exo-powershell-pme.md]`

---

## Scenario 2: Common Commands
> 来源: ado-wiki-b-learn-exo-powershell-pme.md | 适用: 未标注

### 排查步骤
| Command | Description |
|---------|-------------|
| `Get-IRMConfiguration` | Get current IRM settings from EXO |
| `Get-TransportRule \| fl Name,Description,ApplyClassification,ApplyRightsProtectionTemplate,ApplyOME` | List transport rules with common AIP/encryption settings |
| `Get-OMEConfiguration \| fl` | List OME (Office Message Encryption) branding configurations |
| `Get-OWAMailboxPolicy \| fl *IRM*` | Check OWAMailboxPolicy IRM settings |

`[来源: ado-wiki-b-learn-exo-powershell-pme.md]`

---

## Scenario 3: Docs References
> 来源: ado-wiki-b-learn-exo-powershell-pme.md | 适用: 未标注

### 排查步骤
- [Get-IRMConfiguration](https://learn.microsoft.com/en-us/powershell/module/exchange/get-irmconfiguration?view=exchange-ps)
- [Get-TransportRule](https://learn.microsoft.com/en-us/powershell/module/exchange/get-transportrule?view=exchange-ps)
- [Get-OMEConfiguration](https://learn.microsoft.com/en-us/powershell/module/exchange/get-omeconfiguration?view=exchange-ps)
- [Get-OWAMailboxPolicy](https://learn.microsoft.com/en-us/powershell/module/exchange/get-owamailboxpolicy?view=exchange-ps)
- [Set-IRMConfiguration](https://learn.microsoft.com/en-us/powershell/module/exchange/set-irmconfiguration?view=exchange-ps)

`[来源: ado-wiki-b-learn-exo-powershell-pme.md]`

---

## Scenario 4: Introduction
> 来源: ado-wiki-b-message-header-analyzer-tool.md | 适用: 未标注

### 排查步骤
The Message Header Analyzer tool is used to analyze email message headers, providing valuable diagnostic information such as routing paths, spam filter results, and authentication details. 

It will also be useful in determining the complete mail flow, including any third parties involved. This tool shows the path of the **actual mail flow**, highlighting how headers can be placed, removed, or changed by various hosts **which in turn can impact the outcome and readability of an encrypted email**.

Additionally, it is important to note that Exchange Online Protection (EOP) sanitizes some headers in communications to ensure security and compliance, specially when external communications are involved.

`[来源: ado-wiki-b-message-header-analyzer-tool.md]`

---

## Scenario 5: Step 1: Header Extraction
> 来源: ado-wiki-b-message-header-analyzer-tool.md | 适用: 未标注

### 排查步骤
In this step we will be collecting the Message Headers of an email

- Open a received email* (sent emails will either be empty or won't have transport routing information)
  - If on Outlook Classic, go to File > Properties and select all text inside "Internet Headers"
  - If on OWA, go to ... > View > View Message details and select all text of the pop Up
  - If on 3rd party clients they usually also have an option inside the email to "show original" which will display the headers

***Note1:** Header information may vary if you're opening a encrypted email that decrypted inline or if you're having an OME email ("xxx has sent you an encrypted message - click here to read the message")

**Note2:** You cannot retrieve a message header from inside the OME portal message

`[来源: ado-wiki-b-message-header-analyzer-tool.md]`

---

## Scenario 6: Step 2: Access Message header Analyzer and paste the headers
> 来源: ado-wiki-b-message-header-analyzer-tool.md | 适用: 未标注

### 排查步骤
- Access [Message Header Analyzer](https://mha.azurewebsites.net/pages/mha.html)
- Paste Header information and click on "Analyze Headers"

`[来源: ado-wiki-b-message-header-analyzer-tool.md]`

---

## Scenario 7: Step 3: Analyze headers & email Routing
> 来源: ado-wiki-b-message-header-analyzer-tool.md | 适用: 未标注

### 排查步骤
- Once you clicked to analyze headers, you should have something like the below (example from 365 to another 365):
  - **Hop** refers to each step or server that an email passes through from the sender to the recipient by processing order.
  - **Submitting Host** is the server that submits the mail.
  - **Receiving Host** is the server that receives the mail.
  - **Time** indicates the timestamp when the email was received by each server.
  - **Delay** shows the amount of time taken for the email to move from one server to the next.
  - **Type** refers to the type of connection or protocol used for the email transfer. It can also show `Transport Decrypted` which means the email was decrypted during transport for inspection before being re-encrypted.

- If you **don't see Hops at all**, your message might be from "Sent items" — it won't have routing data.

- If you see any domain other than `prod.outlook.com`, `protection.outlook.com`, `outlook.office365.com` or just an IP, the message was routed externally (3rd party relay, anti-spam, on-prem Exchange, etc.). This can impact encrypted email behavior.

- **Headers parsing error in MHA**: If headers appear malformed, save header text to a .txt file and run this PowerShell to fix line wrapping:
```PowerShell
$Path="Path to your File"
$HeaderText=Get-content $Path
$lines = $headerText -split "`r?`n"; $processedLines = @(); $currentLine = ""
foreach ($line in $lines) { if ($line -match "^\s*$") { continue } elseif ($line -match "^\s") { $currentLine += "$line" } else { if ($currentLine) { $processedLines += $currentLine }; $currentLine = $line } }
if ($currentLine) { $processedLines += $currentLine }
$finalText = $processedLines -join "`n"; $NewPath = $Path -replace '(?=\.\w+$)', '1'; $finalText|Out-File $NewPath
```

`[来源: ado-wiki-b-message-header-analyzer-tool.md]`

---

## Scenario 8: Step 4: Interpreting Results and Relevant Headers
> 来源: ado-wiki-b-message-header-analyzer-tool.md | 适用: 未标注

### 排查步骤
Key encryption/label-related headers:

- **msip_labels**: Sensitivity label metadata (GUID, method, SiteID=tenantID, SetDate, Name, ContentBits, Method). **Empty if default EXO EncryptOnly/DNF template used (not a label).**
  - ContentBits bitmask: 0=none, 1=header, 2=footer, 4=watermark, 8=encryption. e.g. 11=header+footer+encryption.
- **Microsoft.Exchange.RMSApaAgent.ProtectionTemplateId**: TemplateID of the label used on the email body.
- **Microsoft.Exchange.RMSApaAgent.ProtectionCustomizationTemplate**: OME Branding template GUID (only in branded messages).
- **Content-Class**: Message type (Rights Protected Message, Encrypted message).

Known template IDs:
- `c026002d-cda6-401e-bfad-28de214d0fba` = **EncryptOnly** (EXO built-in)
- `cf5cf348-a8d7-40d5-91ef-a600b88a395d` = **Do Not Forward** (EXO built-in)
- If `msip_labels` header is populated → a Sensitivity Label was used. If empty → EXO built-in template.

Authentication/routing headers:
- **X-MS-Exchange-Organization-AuthAs**: "Internal" or "Anonymous". Anonymous on internal emails can impact encrypted/OME branded email outcomes.
- **X-Microsoft-Antispam-Mailbox-Delivery**: If contains `ucf:1` → mailbox rules were applied.

`[来源: ado-wiki-b-message-header-analyzer-tool.md]`

---

## Scenario 9: Step 5: Check for possible 3rd parties using the mail header
> 来源: ado-wiki-b-message-header-analyzer-tool.md | 适用: 未标注

### 排查步骤
If you see a non-Microsoft domain in the hops, the message passed through a 3rd party host. This is significant because:
- 3rd parties may strip or modify `msip_labels` headers
- AuthAs may become Anonymous, causing default OME branding
- Encrypted message portals may show endless loops for external recipients

**IP Lookup tools:**
- Public: [Cisco Talos Intelligence](https://www.talosintelligence.com/reputation_center)
- Internal: [MicrosoftIPs](https://csstoolkit.azurewebsites.net/(S(anmnkbr1rnmhhyevvexdqkpl))/Home/MicrosoftIPs)

`[来源: ado-wiki-b-message-header-analyzer-tool.md]`

---

## Scenario 10: Known Issues
> 来源: ado-wiki-b-message-header-analyzer-tool.md | 适用: 未标注

### 排查步骤
- **msip_labels header stripped**: Replies from Outlook.com / hotmail.com / live.com will have the `msip_labels` header stripped (under investigation).
- **Forwarded messages**: `msip_labels` header is removed on forwards (Resolved — no longer occurring).

`[来源: ado-wiki-b-message-header-analyzer-tool.md]`

---

## Scenario 11: Required Information: Purview Message Encryption (PME)
> 来源: ado-wiki-b-required-information-pme.md | 适用: 未标注

### 排查步骤
When creating an escalation, collect the following:

`[来源: ado-wiki-b-required-information-pme.md]`

---

## Scenario 12: Always Required
> 来源: ado-wiki-b-required-information-pme.md | 适用: 未标注

### 排查步骤
- **Message Trace (Detailed)** for an email sent **less than 5 days ago**
  - Critical: backend encryption logs are only retained for ~1 week
  - How to: [Get and read a message trace detail report](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9076/How-to-Get-and-read-a-message-trace-detail-report-for-an-email-message)
- **MessageID** of the email having the issue

`[来源: ado-wiki-b-required-information-pme.md]`

---

## Scenario 13: For Issues with Sending Encrypted Messages
> 来源: ado-wiki-b-required-information-pme.md | 适用: 未标注

### 排查步骤
- Output of `Get-IRMConfiguration` OR Assist365 diagnostic output for "Validate Office Message Encryption (OME) Configuration"
- If a label is used to encrypt: **`Get-Label -Identity <Label name> | FL`**

`[来源: ado-wiki-b-required-information-pme.md]`

---

## Scenario 14: For Issues with Reading Encrypted Messages
> 来源: ado-wiki-b-required-information-pme.md | 适用: 未标注

### 排查步骤
- **Network trace** captured while attempting to read the message
  - How to: [Capture a network trace](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Welcome/9071/How-to-Capture-a-network-trace)
- **Screenshot** of the error/issue

`[来源: ado-wiki-b-required-information-pme.md]`

---

## Scenario 15: How To: Check Encryption Method
> 来源: ado-wiki-check-encryption-method.md | 适用: 未标注

### 排查步骤
**Purpose**: Help engineers understand the various encryption methods used within Microsoft Information Protection (MIP) and know what to collect and troubleshoot when working encryption-related cases.

`[来源: ado-wiki-check-encryption-method.md]`

---

## Scenario 16: Encryption Methods Summary
> 来源: ado-wiki-check-encryption-method.md | 适用: 未标注

### 排查步骤
- **Manual Encryption** (Client Side only)
  - Via "Sensitivity" Button / Bar
  - Via "Encrypt" Button (Outlook/OWA only - uses Templates, not Labels)
  - Via File > Info > Encrypt (Desktop apps only)

- **Non-Manual Encryption**
  - Default Label (Client + Server Side)
  - Exchange Transport Rule / ETR (Server Side only)
  - DLP (Server Side for encryption)
  - Auto Labeling
    - Client-side: condition set on the label itself, applied/recommended in client apps
    - Server-side: condition set via Auto Labeling Policy, applied in transit/on upload

`[来源: ado-wiki-check-encryption-method.md]`

---

## Scenario 17: Manual Encryption
> 来源: ado-wiki-check-encryption-method.md | 适用: 未标注

### 排查步骤
- Check `msip_labels` header in message headers for Labels (look for "Privileged" = manual)
- For Templates (EO/DNF): Check `X-MS-Exchange-Organization-OmeEncryptionMethod` header
- Template ID: `Microsoft.Exchange.RMSApaAgent.ProtectionTemplateId` header

`[来源: ado-wiki-check-encryption-method.md]`

---

## Scenario 18: Default Label
> 来源: ado-wiki-check-encryption-method.md | 适用: 未标注

### 排查步骤
- Run `(Get-LabelPolicy TestPolicy).Settings` to see default labels per workload:
  - `outlookdefaultlabel` — Outlook
  - `defaultlabelid` — Files
  - `siteandgroupdefaultlabelid` — Sites/Groups
  - `powerbidefaultlabelid` — PowerBI
  - `teamworkdefaultlabelid` — Meetings
- If default label not applied: collect Label & Policy config, compare across apps, check with HAR/Fiddler trace

`[来源: ado-wiki-check-encryption-method.md]`

---

## Scenario 19: ETR Encryption
> 来源: ado-wiki-check-encryption-method.md | 适用: 未标注

### 排查步骤
- Collect Extended Message Trace (EMT)
- Search for `S:TRA=` in custom data field
- If ETR not applying encryption:
  - Check rule conditions
  - Check encryption service enabled: `Get-AipServiceConfiguration | FL *functionalState*` (both Enabled)
  - Check EXO: `Get-IRMConfiguration | FL *LicensingEnabled*` (all True)

`[来源: ado-wiki-check-encryption-method.md]`

---

## Scenario 20: DLP Encryption
> 来源: ado-wiki-check-encryption-method.md | 适用: 未标注

### 排查步骤
- Collect EMT, search `S:TRA=`, look for DLP action entries
- If DLP not encrypting:
  - Check policy scope/restrictions (PowerShell)
  - Check SIT confidence level and count vs EMT data
  - Test content against SIT in Purview Portal > DLP > Classifiers

`[来源: ado-wiki-check-encryption-method.md]`

---

## Scenario 21: Auto Labeling
> 来源: ado-wiki-check-encryption-method.md | 适用: 未标注

### 排查步骤
- **Client-side**: Condition set on label's "Auto-labeling for files and emails" section
  - Published via normal Label Policy, applied in client when condition met
- **Server-side**: Condition set in Auto Labeling Policy
  - Applied in transport (EXO) or on file upload/indexing (SPO)

`[来源: ado-wiki-check-encryption-method.md]`

---

## Scenario 22: Key Distinctions
> 来源: ado-wiki-check-encryption-method.md | 适用: 未标注

### 排查步骤
- Labels vs Templates: Labels are sensitivity labels; Templates (EO, DNF) are the encryption component within labels
- Client-side vs Server-side: Client = applied in the app; Server = applied in transit/on server
- Transport rules cannot use Labels directly — they use Templates

`[来源: ado-wiki-check-encryption-method.md]`

---

## Scenario 23: Steps
> 来源: ado-wiki-check-label-encryption-enabled.md | 适用: 未标注

### 排查步骤
1. Edit the Sensitivity label in the Purview portal
2. Navigate to **Protection Settings** page
3. Check whether the **Control Access** option is enabled:
   - **Not enabled** → Non-encryption label
   - **Enabled** → Encryption is enabled; next page shows defined permissions

`[来源: ado-wiki-check-label-encryption-enabled.md]`

---

## Scenario 24: 用途
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
分析 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，排查加密、解密、预授权等操作问题。

---

`[来源: mip-request-analysis.md]`

---

## Scenario 25: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 26: 必要参数
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID（与 correlationId 二选一） |
| {correlationId} | 否 | 关联 ID（与 tenantId 二选一） |
| {userId} | 否 | 用户对象 ID |

`[来源: mip-request-analysis.md]`

---

## Scenario 27: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
IFxRequestLogEvent
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where userObjectId contains userobjectId
| extend workload = case(
    operationName == 'AcquireTemplateInformation', 'Bootstrap',
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'FEGetUserRights', 'Decryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    operationName == 'FECreateClientLicensorCertificateV1', 'Bootstrap',
    operationName == 'ServiceDiscoveryForUser', 'Bootstrap',
    operationName == 'AcquireDelegationLicense', 'Prelicense',
    operationName == 'FEGetAllTemplatesV1', 'Bootstrap',
    operationName == 'FECreatePublishingLicenseAndEndUserLicenseV1', 'Encryption',
    operationName == 'AcquireDelegationLicense4User', 'Decryption',
    'N/A'
)
| extend ApiType = case(
    operationName in ('FECreateEndUserLicenseV1', 'FECreatePublishingLicenseV1', 'FEGetUserRights', 
                      'FECreateClientLicensorCertificateV1', 'FEGetAllTemplatesV1', 
                      'FECreatePublishingLicenseAndEndUserLicenseV1'), 'REST',
    operationName in ('AcquireLicense', 'AcquirePreLicense4User', 'AcquireDelegationLicense', 
                      'AcquireDelegationLicense4User'), 'SOAP',
    'Hrms'
)
| project env_time, operationName, ApiType, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, durationMs, iisWaitRequestTime, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

`[来源: mip-request-analysis.md]`

---

## Scenario 28: 结果字段说明
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| operationName | 操作名称 |
| ApiType | API 类型 (REST/SOAP/Hrms) |
| workload | 工作负载类型 (Bootstrap/Encryption/Decryption/Prelicense) |
| correlationId | 关联 ID |
| resultType | 结果类型 |
| ResourceTenant | 资源租户 ID |
| homeTenantId | 用户主租户 ID |
| userObjectId | 用户对象 ID |
| UserAccessType | 用户访问类型 |
| appName | 应用程序名称 |
| durationMs | 持续时间 (毫秒) |
| resultSignature | 结果签名/错误码 |

---

`[来源: mip-request-analysis.md]`

---

## Scenario 29: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 30: 用途
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
专门查询 Publishing License (PL) 和 End User License (EUL) 相关的解密请求。

`[来源: mip-request-analysis.md]`

---

## Scenario 31: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1",
    "AcquireDelegationLicense4User",
    "AcquireDelegationLicense",
    "AcquireLicense",
    "AcquirePreLicense4User",
    "AcquirePreLicense"
)
| extend ApiType = iff(operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1"
), "REST", "SOAP")
| project env_time, operationName, ApiType, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 32: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 33: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| where contextId =~ tenantid or homeTenantId =~ tenantid
| where resultType != "Success"
| summarize Count = count() by operationName, resultType, resultSignature
| order by Count desc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 34: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 35: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

---

`[来源: mip-request-analysis.md]`

---

# Kusto 查询参考

## 来源: `mip-request-analysis.md`

# MIP 请求日志分析

## 用途

分析 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，排查加密、解密、预授权等操作问题。

---

## 查询 1: 按 correlationId/tenantId 查询所有 MIP 请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID（与 correlationId 二选一） |
| {correlationId} | 否 | 关联 ID（与 tenantId 二选一） |
| {userId} | 否 | 用户对象 ID |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
IFxRequestLogEvent
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where userObjectId contains userobjectId
| extend workload = case(
    operationName == 'AcquireTemplateInformation', 'Bootstrap',
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'FEGetUserRights', 'Decryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    operationName == 'FECreateClientLicensorCertificateV1', 'Bootstrap',
    operationName == 'ServiceDiscoveryForUser', 'Bootstrap',
    operationName == 'AcquireDelegationLicense', 'Prelicense',
    operationName == 'FEGetAllTemplatesV1', 'Bootstrap',
    operationName == 'FECreatePublishingLicenseAndEndUserLicenseV1', 'Encryption',
    operationName == 'AcquireDelegationLicense4User', 'Decryption',
    'N/A'
)
| extend ApiType = case(
    operationName in ('FECreateEndUserLicenseV1', 'FECreatePublishingLicenseV1', 'FEGetUserRights', 
                      'FECreateClientLicensorCertificateV1', 'FEGetAllTemplatesV1', 
                      'FECreatePublishingLicenseAndEndUserLicenseV1'), 'REST',
    operationName in ('AcquireLicense', 'AcquirePreLicense4User', 'AcquireDelegationLicense', 
                      'AcquireDelegationLicense4User'), 'SOAP',
    'Hrms'
)
| project env_time, operationName, ApiType, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, durationMs, iisWaitRequestTime, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| operationName | 操作名称 |
| ApiType | API 类型 (REST/SOAP/Hrms) |
| workload | 工作负载类型 (Bootstrap/Encryption/Decryption/Prelicense) |
| correlationId | 关联 ID |
| resultType | 结果类型 |
| ResourceTenant | 资源租户 ID |
| homeTenantId | 用户主租户 ID |
| userObjectId | 用户对象 ID |
| UserAccessType | 用户访问类型 |
| appName | 应用程序名称 |
| durationMs | 持续时间 (毫秒) |
| resultSignature | 结果签名/错误码 |

---

## 查询 2: 查询 PL/EUL 解密请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

专门查询 Publishing License (PL) 和 End User License (EUL) 相关的解密请求。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1",
    "AcquireDelegationLicense4User",
    "AcquireDelegationLicense",
    "AcquireLicense",
    "AcquirePreLicense4User",
    "AcquirePreLicense"
)
| extend ApiType = iff(operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1"
), "REST", "SOAP")
| project env_time, operationName, ApiType, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

---

## 查询 3: 统计失败请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

按操作类型和错误码统计失败的 MIP 请求。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| where contextId =~ tenantid or homeTenantId =~ tenantid
| where resultType != "Success"
| summarize Count = count() by operationName, resultType, resultSignature
| order by Count desc
```

---

## 查询 4: 查询 RMS 跟踪日志

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

根据 correlationId 查询详细的跟踪日志。

### 查询语句

```kql
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

---

## 关联查询

- [rms-auth-tracking.md](./rms-auth-tracking.md) - RMS 认证追踪（ESTS 日志）

---

