# Networking DDoS Protection — 排查速查

**来源数**: 2 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Sharp traffic decrease on Azure public IP — customer sees... | Azure platform DDoS protection mechanism blocks... | 1) Contact 21V-WAPHYNET@oe.21vianet.com with pu... | 🟢 9.5 | [MCVKB/3.6[NET]How to Identify Traffic Decrease Caused by.md] |
| 2 📋 | Customer's public IPs attached to outbound rules on Stand... | All public IPs visible in a VNET that has DDoS ... | If the outbound-only IPs have no port open to a... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FOutbound%20PIP%20Billing%20Clarifications) |
| 3 📋 | TCP connection failures during DDoS mitigation with SYN A... | SYN Auth v1 uses a SYN-cookie mechanism: A10 se... | Ensure clients implement TCP retry logic after ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors) |
| 4 📋 | TCP connections appear to hang (server not responding) du... | SYN Auth v2 sends an invalid ACK (with wrong AC... | If a firewall in the network path is dropping t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors) |
| 5 📋 | TCP connections appear to hang (server not responding) du... | SYN Auth v3 sends an invalid SYN+ACK (with wron... | If a firewall in the network path is dropping t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTCP%20SYN%20auth%20versions%20and%20behaviors) |
| 6 📋 | Customer using Azure DDoS Network Protection receives no ... | Azure DDoS Protection service stopped sending a... | 1. Confirm VIP is under mitigation via Log Sour... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20Lack%20of%20Alerts%20in%20Microsoft%20Defender%20for%20Cloud%20%28MDfC%29%20despite%20under%20mitigation%20state) |
| 7 📋 | Azure Firewall or NVA triggers DDoS mitigation during bus... | Azure Firewall or NVA generates high outbound T... | 1. Customer-side (preferred): Deploy multiple o... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20DDoS%20Attack%20Post-Mortem) |
| 8 📋 | Customer unable to delete DDoS protection plan; delete op... | Azure Policy assigned to the subscription is bl... | 1) Check Azure Policy under Subscription > Poli... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%20unable%20to%20delete%20DDos) |
| 9 📋 | Unable to delete DDoS protection plan; associated VNets a... | VNets attached to the DDoS plan are in failed P... | Perform a GET/SET operation on each failed VNet... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%20unable%20to%20delete%20DDos) |
| 10 📋 | Customer cannot link a VNet in one tenant (VNET subscript... | Cross-tenant VNet-to-DDoS-Plan linking is not s... | 1) Onboard VNET subscription as Service Provide... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/Cross%20Tenant%20DDOS%20Support) |
| 11 📋 | Customer observes massive inbound traffic from Microsoft ... | Not a DDoS attack. The customer VMs initiated d... | 1) Explain this is expected behavior and not an... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDOS%20Attack%20from%20Microsoft%20AFD%20IP) |
| 12 📋 | Customer using DDoS Network Protection plan receives DDoS... | DDoS Network Protection plan protects all publi... | 1) Ask customer for the timestamp and alerted I... | 🟢 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDoS%20Network%20Protection%20Alerts%20for%20pseudo%20random%20VIP) |
| 13 📋 | Customer is concerned that their Azure region (e.g., Aust... | Misunderstanding of Azure DDoS scrubbing archit... | Explain that Azure DDoS Network Plan scrubs glo... | 🔵 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20DDoS%20Protection/DDoS%20Protection%20Global%20Capacity%20Details) |

## 快速排查路径
1. 1) Contact 21V-WAPHYNET@oe.21vianet.com with public IP and time range to verify if protection was tr `[来源: onenote]`
2. If the outbound-only IPs have no port open to accept internet traffic: (1) Request an IcM ticket to  `[来源: ado-wiki]`
3. Ensure clients implement TCP retry logic after receiving RST. For game clients that cannot retry, co `[来源: ado-wiki]`
4. If a firewall in the network path is dropping the invalid ACK challenge, consider switching to SYN A `[来源: ado-wiki]`
5. If a firewall in the network path is dropping the invalid SYN+ACK challenge, consider switching to S `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ddos.md#排查流程)
