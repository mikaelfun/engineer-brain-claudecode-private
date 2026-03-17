# IR / Entitlement / 21v 规则

从 casehealth + dfmworker agent 提取的合规检查知识。caseworker 做巡检或接新单时读取本文件。

## IR（Initial Response）规则

### IR SLA 判断方式
- **唯一标准**：D365 UI 的 Performance Indicators → IR SLA 状态
- **OData API 不可用**：`msdfm_initialresponse` / `firstresponseslastatus` 字段全返回 null / "In Progress"，不能用
- **检查方式**：通过 `check-ir-status.ps1` 从 UI 读取

### IR SLA 状态含义
- **Met**：已满足 IR 要求
- **In Progress**：尚未满足，需要尽快做 IR
- **Breached**：已超时

### Meet IR 方式
- 回复客户邮件（最常见）
- 电话记录（Phone Call Activity）
  - Subject 统一为 "meet ir"
  - 如果 Case 存在实际的客户电话，Phone Call 记录中填实际的客户电话
  - Phone Call 为空时**必须**填 "teams call"

## Entitlement 合规校验

### 检查项
从 `case-info.md` 读取以下字段判断：
1. **Service Name**：是否与 Case 产品匹配
2. **Schedule**：是否在服务时间范围内
3. **Contract Country**：是否与客户区域匹配

### 常见问题
- Service Name 和实际产品不一致 → 需要调整 SAP
- Premier 客户的 Entitlement 通常没问题，但仍需检查

## 21v Convert 识别

### 什么是 21v Convert
- 客户在 21Vianet（世纪互联）运营的中国区 Azure 开了工单
- 因为需要 Global 支持，Case 被转到 Global 团队
- 这类 Case 需要在 IR 中提及 21v 工单号和原工程师

### 识别方式
从以下位置提取：
1. **Customer Statement**：通常包含 21v Case ID
2. **Notes**：可能有转单说明

### 提取信息
- 21v Case ID
- 21v 原工程师（Owner）
- Teams 邮箱（通过将 `@oe.21vianet.com` 替换为 `@21vbluecloud.org.cn` 获得）

### 处理方式
- IR 使用 `21v-convert-ir` 模板（见 email-templates.md）
- 在邮件中提及 21v 工单号和原工程师，让客户知道是同一问题

## AR Case 识别

### 什么是 AR Case
- Case ID 末尾带 3 位以上后缀（如 `2603090030005743001`）
- 通常是 Advisory/Review 类型

### 处理方式
- **跳过** IR / Entitlement / 21v 检查
- 只获取基本信息
- 处理方式和普通 Case 不同，更偏咨询性质

## IR/FDR/FWR 状态（data-refresh 负责，与 compliance-check 无关）

IR/FDR/FWR 由 **data-refresh**（`fetch-all-data.ps1 -IncludeIrCheck`）通过 `check-ir-status.ps1` 获取，写入 `casehealth-meta.json` 的 `irSla`/`fdr`/`fwr` 字段。

**⚠️ compliance-check 不负责 IR/FDR/FWR**，它只检查 Entitlement + 21v Convert。

### 状态值（原样写入，不做转换）

| check-ir-status.ps1 输出 | 写入 meta 的值 | 含义 |
|--------------------------|---------------|------|
| `Succeeded` | `Succeeded` | SLA 已满足（终态） |
| `In Progress` | `In Progress` | SLA 计时中 |
| `Nearing` | `Nearing` | 接近超时 |
| `Expired` | `Expired` | SLA 超时 |
| `unknown` | `unknown` | 数据缺失或检查失败 |

### 缓存跳过
- IR SLA 为 `Succeeded` 是终态，不会再变化
- `fetch-all-data.ps1` 检测到 meta 中 `irSla.status === "Succeeded"` 时跳过 playwright 检查，节省 ~20s

### 规则
- IR/FDR/FWR 状态值原样写入，**不做 kebab-case 转换**（详见 `case-data-schema.md`）
- data-refresh 写入 `irSla`/`fdr`/`fwr`，compliance-check 不覆盖这些字段
- 如果脚本执行失败（如 Playwright 未连接），沿用已有值

## CC 邮件列表（Mooncake CC Finder）

### 背景
部分 Mooncake 客户要求邮件 CC 特定人员（TAM / SDM 等）

### 数据源
- 缓存文件：`workspace/data/mooncake-cc.json`
- 刷新：`pwsh workspace/scripts/fetch-powerbi-cc.ps1 -Force`（约 2 分钟）

### 匹配逻辑
- 读取 mooncake-cc.json 中的 accounts 列表
- 用 AI 判断 Case 的客户名对应哪个 account entry
- 支持别名、缩写、中英文混合匹配
- 匹配到时：在邮件中 CC 对应的联系人（注意替换 `<Replace with POD alias>`）
- 无匹配时：不添加 CC
- 缓存不存在时：标注"CC 缓存未初始化"，不阻塞
