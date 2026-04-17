# Defender SAP 连接器 — 排查工作流

**来源草稿**: ado-wiki-a-sap-agent-deprecation-support-guide.md, ado-wiki-a-sap-agentless-migration-guide.md, ado-wiki-a-sap-agentless-product-knowledge.md, ado-wiki-b-sap-agentless-tsg.md
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: SAP Agent-Based Connector Deprecation - Support Guide
> 来源: ado-wiki-a-sap-agent-deprecation-support-guide.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 2: SAP Agent to Agentless Migration - CSS Support Guide
> 来源: ado-wiki-a-sap-agentless-migration-guide.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
SAPAuditLog | where TimeGenerated > ago(1h) | take 10
```

---

## Scenario 3: [Product knowledge] - SAP agentless
> 来源: ado-wiki-a-sap-agentless-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Data collector**: heart of the data collector flow
2. **Prerequisites checker**: designed to enable the SAP team to fix whatever is needed before focusing on the Sentinel side looking for issues.
3. Review the prerequisites for deploying the SAP agentless data connector.
4. Deploy the SAP applications solution from the content hub. This step is handled by the security team on the Azure portal.
5. Configure your SAP system for the Microsoft Sentinel solution, including configuring SAP authorizations, configuring SAP auditing, and more. These steps should be done by the SAP BASIS team.
6. Connect your SAP system using an agentless data connector with the SAP Cloud Connector. This step is handled by the security team on the Azure portal, using information provided by the SAP BASIS team.
7. Enable SAP detections and threat protection. This step is handled by the security team on the Azure portal.

---

## Scenario 4: SAP Agentless Connector Troubleshooting Guide
> 来源: ado-wiki-b-sap-agentless-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Select the `Prerequisite checker` iflow. Click on `configure` and set the target RFC destination to check. Deploy the iflow.
2. Trigger the iflow using your preferred approach (e.g. PowerShell script against CPI endpoint).
3. Successful run results in the message `Pre-requisite check passed successfully`.
4. Ensure the pre-req checker runs successfully before connecting to Sentinel.
5. If the question is related to setup and configuration, ensure the customer watches the Setup tutorial. Ensure the customer has read the SAP pre-requisites sections.
6. Upload the screenshot of the error shown in the SAP message processing logs and attach to the ICM.
7. **Agentless ICM should be routed to _Connectors Acceleration / Triage_**
8. In Integration Suite, navigate to Monitor > Integrations and APIs.
9. Click on Manage Integration Content > All.
10. Find the Data collector inflow and select Monitor Message processing.
11. Filter on failed messages and click on the failed run to view the error details.
12. For advanced troubleshooting, turn on trace logging (temporarily activated).
13. Under monitor message processing, click on the Trace link to view detailed runtime logs.
14. You will see the initialized runtime configuration, parameters and data in the message payload.

### Portal 导航路径
- Monitor > Integrations and APIs

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---
