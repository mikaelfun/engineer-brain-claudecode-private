# ACR Private Endpoint 与 DNS 解析 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR image pull fails with no route to host error when private endpoint is enable | Private endpoint connection to ACR is in Disconnected state - removed by the pri | 1) Check NIC Effective Routes for private endpoint IP. 2) Verify PE connection s | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-030] |
| 2 | Customer needs more than 200 private endpoints for ACR - default limit reached | ACR default private endpoint limit is 200 per registry (Premier SKU), by design  | 1) Communicate limitations: no geo-replication changes after increase; registry  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-032] |
| 3 | az acr login fails with 403 CONNECTIVITY_REFRESH_TOKEN_ERROR when connecting via | In Virtual WAN Hub architecture, Azure Firewall in the Virtual Hub intercepts HT | Create a new private endpoint for ACR in the same VNet as the source VM (bypass  | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-044] |
| 4 | Azure Function App deployment fails pulling image from private ACR with 'Pull Im | Known limitation: For Premium and Dedicated Linux Function Apps, pulling images  | Ensure the image being pulled uses Docker v2 manifest format (application/vnd.do | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-051] |
| 5 | AKS with HTTP proxy configured fails to pull images from private ACR with 403 Fo | When AKS cluster uses HTTP proxy for outbound traffic and ACR uses private endpo | Ensure ACR private endpoint FQDNs are in the proxy's noProxy/bypass list: 1) <re | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-085] |
| 6 | Cannot connect to ACR registry or pull images. Errors: 'Could not connect to the | ACR has private endpoints enabled with public access disabled, and the client is | 1. Use Jarvis 'Get Registry Private Endpoints' action (JIT scope: ACRSupport, Ac | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-0145] |
| 7 | ACR FQDN resolves to public IP instead of private IP even though Private Link an | The private endpoint network interface is on a different VNet than the device pe | Add a virtual network link at the ACR private DNS zone level (<acr>.privatelink. | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-006] |
| 8 | ACR FQDN resolves to public IP when using custom DNS server - private endpoint c | Custom DNS server is not configured with a server-level forwarder to Azure DNS ( | Configure a server-level forwarder to Azure DNS (168.63.129.16) on the custom DN | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-007] |
| 9 | ACR FQDN resolves to public IP - custom DNS has forwarder to Azure DNS but still | The custom DNS server VNet is not linked to the ACR private DNS zone, so Azure D | Add a virtual network link at the ACR private DNS zone for the VNet where the cu | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-008] |
| 10 | Cannot delete Azure Container Registry that has private endpoints associated wit | ACR deletion is blocked when private endpoint connections still exist on the reg | Remove all private endpoint connections first using Azure portal or az acr priva | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-010] |

## 快速排查路径
1. 检查 → Private endpoint connection to ACR is in Disconnected state  `[来源: ADO Wiki]`
   - 方案: 1) Check NIC Effective Routes for private endpoint IP. 2) Verify PE connection status in Portal -> A
2. 检查 → ACR default private endpoint limit is 200 per registry (Prem `[来源: ADO Wiki]`
   - 方案: 1) Communicate limitations: no geo-replication changes after increase; registry count <10 per region
3. 检查 → In Virtual WAN Hub architecture, Azure Firewall in the Virtu `[来源: ADO Wiki]`
   - 方案: Create a new private endpoint for ACR in the same VNet as the source VM (bypass the Virtual Hub Azur
4. 检查 → Known limitation: For Premium and Dedicated Linux Function A `[来源: ADO Wiki]`
   - 方案: Ensure the image being pulled uses Docker v2 manifest format (application/vnd.docker.distribution.ma
5. 检查 → When AKS cluster uses HTTP proxy for outbound traffic and AC `[来源: ADO Wiki]`
   - 方案: Ensure ACR private endpoint FQDNs are in the proxy's noProxy/bypass list: 1) <registry>.azurecr.io, 

> 本 topic 有融合排查指南 → [完整排查流程](details/private-endpoint-dns.md#排查流程)
