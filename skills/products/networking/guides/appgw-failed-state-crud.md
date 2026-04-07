# Networking AppGW 失败状态与 CRUD — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Application Gateway PUT operation fails with Backend Addr... | Known bug (Bug 9989909): validation does not pr... | Remove duplicate IPs from both backend pools in... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Backend%20Address%20Pool%20cannot%20have%20duplicate%20addresses) |
| 2 📋 | AppGW goes down — CPU, memory utilization, and instance c... | A default route (0.0.0.0/0) was propagated to t... | 1) Create a UDR on AppGW subnet to disable BGP ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FOperation%20failures%20on%20Application%20Gateways) |
| 3 📋 | Application Gateway DELETE (or other CRUD operations) fai... | The customer has disabled the GatewayRP enterpr... | Customer must re-enable the GatewayRP applicati... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FGatewayRP%20is%20disabled) |
| 4 📋 | AppGW v2 CRUD operations fail with error 'ApplicationGate... | The private Frontend IP address chosen by the c... | 1. Check instance IPs via ASC Properties tab an... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20CRUD%20Operations%20Failing%20Due%20to%20the%20ApplicationGatewayILBDeploymentFailureDueToPrivateIPInUse%20error) |
| 5 📋 | Application Gateway enters Failed State; NRP logs show er... | Application Gateway fails to validate Custom Er... | 1) Fix custom error page: ensure the HTML file ... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FFailed%20State%20Input%20string%20was%20not%20in%20a%20correct%20format) |
| 6 📋 | AppGW CRUD操作失败进入Failed状态，错误码：ApplicationGatewayProbeProto... | 健康探测（Probe）配置的协议（如HTTP）与关联的后端HTTP设置（Backend HTT... | 简单的Get/Set操作无法修复Failed状态，必须按以下步骤修复协议不匹配：(1) 删除请... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FProbe%20and%20HTTP%20Setting%20Protocol%20Mismatch) |
| 7 📋 | AppGW V1进入Failed状态，无法执行任何配置变更（PUT操作均失败）；通常发生在频繁添加Authenti... | AppGW V1的所有Authentication Certificates总大小有128KB... | 从Jarvis Actions获取AppGW raw config JSON文件（Get Ap... | 🟢 8.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FIdentify%20Unused%20Application%20Gateway%20Certificates%20-%20TOOL%21) |

## 快速排查路径
1. Remove duplicate IPs from both backend pools in a single PUT operation (one by one will fail). Use P `[来源: ado-wiki]`
2. 1) Create a UDR on AppGW subnet to disable BGP route propagation, OR 2) Create a UDR with 0.0.0.0/0  `[来源: ado-wiki]`
3. Customer must re-enable the GatewayRP application in their Azure AD tenant: go to Enterprise Applica `[来源: ado-wiki]`
4. 1. Check instance IPs via ASC Properties tab and the failed operation details to confirm the IP conf `[来源: ado-wiki]`
5. 1) Fix custom error page: ensure the HTML file is hosted at a publicly accessible URL returning HTTP `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/appgw-failed-state-crud.md#排查流程)
