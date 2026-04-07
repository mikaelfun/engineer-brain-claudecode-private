---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Quick check for maintenance on AppGW"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FQuick%20check%20for%20maintenance%20on%20AppGW"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Quick check for maintenance on AppGW

[[_TOC_]]

## Description

当 AppGW 突然出现异常行为时，快速检查是否由平台侧维护（Tenant Maintenance）引起的诊断指南。

AppGW V2 默认配置2个实例，维护不会同时对所有实例进行（V1单实例除外，维护期间会停机）。因此即使有维护，服务理论上不中断。但平台维护可能导致短暂异常。

---

## 可能由平台维护引起的场景

以下症状出现时，应首先排查平台维护：

- 配置变更耗时异常（如超过10分钟）
- Resource Health 状态变为 Unknown
- 客户未做任何更改，响应状态码突然变为 5XX 或 4XX
- 与之前相比行为发生变化
- 现有连接断开（Websocket 或 V2 场景为预期行为）

---

## 如何检查平台维护

1. 准备 AppGW 的 Resource ID 和需要调查的时间段

2. 打开以下 Data Explorer Dashboard：
   ```
   https://dataexplorer.azure.com/dashboards/48e34aee-5047-4c17-b216-3cb5e157ade7?p-_startTime=60days&p-_endTime=now&p-_resourceid=all&p-_gatewayid=all&p-_vip=all#28879072-3e89-4784-8fed-d090beea21b9
   ```

3. 操作步骤：
   - 在 **Finder** 标签页中输入 Resource ID，获取 GatewayID
   - 设置目标时间范围
   - 将 GatewayID 设为过滤条件
   - 切换到 **Maintenance** 标签页

4. 结果解读：
   - 搜索结果中的**高亮记录**表示可能发生了 AppGW 平台维护导致的 Tenant Maintenance 事件
