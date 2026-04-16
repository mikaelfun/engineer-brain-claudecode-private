# ACR 平台集成 — 排查工作流

**来源草稿**: ado-wiki-a-acr-kusto-access.md, ado-wiki-a-troubleshooting-using-asi.md, ado-wiki-acr-escalation-process.md, ado-wiki-a-acr-devops-cases-template.md, ado-wiki-a-acr-feedback-forum-post.md, ado-wiki-a-acr-pg-teams-channel.md
**Kusto 引用**: rp-activity.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: ACR 升级流程 (Escalation)
> 来源: ado-wiki-acr-escalation-process.md | 适用: Mooncake ✅

### 决策树

1. **不确定解决方案** → 联系 SME (AVA SME-ACR Triage / ACR-SUP Teams)
2. **SME 无响应 / 需要 PG 协助** → 提交 ICM
   - 默认 Sev-3（除非区域性 outage）
   - ICM 模板: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=32J233
3. **确认为 Bug / 等待 Hotfix** → 提交 ICM 跟踪
4. **Outage** → Sev-2 Master ICM + 通知 CSS Containers DL

### ICM 必填信息

| 字段 | 说明 |
|------|------|
| Case Reference | D365 Case 编号 |
| ASC Link | 案例 ASC 链接 |
| Issue (客户描述) | 客户原话 |
| Issue (工程师描述) | 分析总结 |
| Error Message | 错误消息 |
| ASK on the IcM | 具体请求 |
| Subscription ID / ACR Name / Region | 资源信息 |

---

## Scenario 2: PG Teams Channel 求助
> 来源: ado-wiki-a-acr-pg-teams-channel.md | 适用: Mooncake ✅

### 步骤

1. 加入 ACR-SUP Teams Channel
2. 发帖格式:
   | 字段 | 值 |
   |------|---|
   | Case Number | |
   | ASC Link | |
   | Issue | |
   | Repro | |
   | Error | |
   | ACR Name | |
   | Location | |
3. 每个 issue 保持一个 thread

---

## Scenario 3: ASI 排查工具
> 来源: ado-wiki-a-troubleshooting-using-asi.md | 适用: Mooncake ✅

### 使用步骤

1. 打开 ASI: https://asi.azure.ms/services/Azure%%20Container%%20Registry/pages/ACR%%20Home
2. 点击 Search for a Registry
3. 输入注册表信息 (URI / Login Server / 名称均可)
4. 设置时间范围并执行查询
5. 查看功能开关状态、Private Endpoints、Kusto 查询等
6. **注意**: ASI 限制 5000 行结果，需设置合理时间范围

---

## Scenario 4: DevOps Pipeline 拉取 ACR 镜像失败
> 来源: ado-wiki-a-acr-devops-cases-template.md | 适用: Mooncake ✅

### 数据收集清单

1. **DevOps 组织和项目名称** — 是否仅该项目失败?
2. **Webhook 配置** — Trigger/Action 截图
3. **Pipeline 运行数据**
   - 一次成功的运行
   - 首次失败的运行
   - 一次启用 system.debug=true 的运行
4. **Pipeline 定义**
   - YAML: Download full YAML
   - Designer: 导出 JSON
5. **RP 层活动日志查询**
   ```kql
   cluster("https://acrmc2.chinaeast2.kusto.chinacloudapi.cn").database("acrprodmc").RPActivity
   | where LoginServerName == "{registry}.azurecr.cn"
   | where env_time > ago(7d)
   | order by env_time desc
   ```
