# ACR Private Endpoint 与 DNS 解析 — 综合排查指南

**条目数**: 10 | **草稿融合数**: 3 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-a-acr-private-link-troubleshooting-questions.md, ado-wiki-acr-private-link.md, onenote-acr-proxy-troubleshooting.md
**Kusto 引用**: registry-info.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Private endpoint connection to ACR is in Disconnected state 
> 来源: ADO Wiki

1. 1) Check NIC Effective Routes for private endpoint IP. 2) Verify PE connection status in Portal -> ACR -> Networking -> Private endpoint connections. 3) If Disconnected -> recreate private endpoint. 4

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: ACR default private endpoint limit is 200 per registry (Prem
> 来源: ADO Wiki

1. 1) Communicate limitations: no geo-replication changes after increase; registry count <10 per region per sub; Premier SKU required; new limit 201-1000. 2) Verify registry count via Kusto RegistryMaste

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: In Virtual WAN Hub architecture, Azure Firewall in the Virtu
> 来源: ADO Wiki

1. Create a new private endpoint for ACR in the same VNet as the source VM (bypass the Virtual Hub Azure Firewall). Update the Private DNS Zone to point to this new dedicated private endpoint so traffic 

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: Known limitation: For Premium and Dedicated Linux Function A
> 来源: ADO Wiki

1. Ensure the image being pulled uses Docker v2 manifest format (application/vnd.docker.distribution.manifest.v2+json), not OCI image index. Rebuild/re-push the image with Docker v2 format if needed. Thi

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 5: When AKS cluster uses HTTP proxy for outbound traffic and AC
> 来源: ADO Wiki

1. Ensure ACR private endpoint FQDNs are in the proxy's noProxy/bypass list: 1) <registry>.azurecr.io, 2) <registry>.<region>.data.azurecr.io. These must bypass the proxy since they should route directly

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 6: ACR has private endpoints enabled with public access disable
> 来源: ADO Wiki

1. 1. Use Jarvis 'Get Registry Private Endpoints' action (JIT scope: ACRSupport, Access Level: PlatformServiceOperator) to get the NRP PE ID. 2. Find the private endpoint in ASC to identify which VNET it

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 7: The private endpoint network interface is on a different VNe
> 来源: MS Learn

1. Add a virtual network link at the ACR private DNS zone level (<acr>.privatelink.azurecr.io) for the VNet where the querying device resides. Use Azure portal (Private DNS zones > Virtual network links 

`[结论: 🔵 6.0/10 — MS Learn]`

### Phase 8: Custom DNS server is not configured with a server-level forw
> 来源: MS Learn

1. Configure a server-level forwarder to Azure DNS (168.63.129.16) on the custom DNS server. The exact steps depend on the DNS platform (Windows Server DNS, CoreDNS, etc.)

`[结论: 🔵 6.0/10 — MS Learn]`

### Phase 9: The custom DNS server VNet is not linked to the ACR private 
> 来源: MS Learn

1. Add a virtual network link at the ACR private DNS zone for the VNet where the custom DNS server resides, using Azure portal or az network private-dns link vnet create

`[结论: 🔵 6.0/10 — MS Learn]`

### Phase 10: ACR deletion is blocked when private endpoint connections st
> 来源: MS Learn

1. Remove all private endpoint connections first using Azure portal or az acr private-endpoint-connection delete, then delete the ACR

`[结论: 🔵 6.0/10 — MS Learn]`

### Kusto 查询模板

#### registry-info.md
`[工具: Kusto skill — registry-info.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time >= ago(3d)
| where LoginServerName contains "{registry}.azurecr.cn"
| sort by env_time desc
| project env_time, CreatedTime, SubscriptionId, ResourceGroup, RegistryName, LoginServerName, 
         RegistryId, RegistryLocation, SkuId, AdminUserEnabled, PublicNetworkAccessDisabled, 
         PrivateLinkEndpointEnabled, DataEndpointEnabled, HasAssignedIdentity, ByokEnabled,
         PrivateLinksVersion
| take 1
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "{registry}.azurecr.cn"
| project RegistryName, PublicNetworkAccessDisabled, PrivateLinkEndpointEnabled, 
         DataEndpointEnabled, FirewallRulesEnabled, PublicNetworkAccessSecuredByPerimeter
| take 1
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where LoginServerName == "{registry}.azurecr.cn"
| project RegistryName, ByokEnabled, HasAssignedIdentity, SoftDeleteEnabled, 
         ContentTrustEnabled, QuarantineEnabled, RetentionEnabled
| take 1
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').RegistryMasterData
| where env_time > ago(1d)
| where tolower(RegistryName) == "{registryName}"
| project ByokEnabled
```


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ACR image pull fails with no route to host error when privat | Private endpoint connection to ACR | → Phase 1 |
| Customer needs more than 200 private endpoints for ACR - def | ACR default private endpoint limit | → Phase 2 |
| az acr login fails with 403 CONNECTIVITY_REFRESH_TOKEN_ERROR | In Virtual WAN Hub architecture, | → Phase 3 |
| Azure Function App deployment fails pulling image from priva | Known limitation: For Premium and | → Phase 4 |
| AKS with HTTP proxy configured fails to pull images from pri | When AKS cluster uses HTTP | → Phase 5 |
| Cannot connect to ACR registry or pull images. Errors: 'Coul | ACR has private endpoints enabled | → Phase 6 |
| ACR FQDN resolves to public IP instead of private IP even th | The private endpoint network interface | → Phase 7 |
| ACR FQDN resolves to public IP when using custom DNS server  | Custom DNS server is not | → Phase 8 |
| ACR FQDN resolves to public IP - custom DNS has forwarder to | The custom DNS server VNet | → Phase 9 |
| Cannot delete Azure Container Registry that has private endp | ACR deletion is blocked when | → Phase 10 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR image pull fails with no route to host error when private endpoint is enable | Private endpoint connection to ACR is in Disconnected state - removed by the pri | 1) Check NIC Effective Routes for private endpoint IP. 2) Verify PE connection s | 🟢 8.0 | ADO Wiki |
| 2 | Customer needs more than 200 private endpoints for ACR - default limit reached | ACR default private endpoint limit is 200 per registry (Premier SKU), by design  | 1) Communicate limitations: no geo-replication changes after increase; registry  | 🟢 8.0 | ADO Wiki |
| 3 | az acr login fails with 403 CONNECTIVITY_REFRESH_TOKEN_ERROR when connecting via | In Virtual WAN Hub architecture, Azure Firewall in the Virtual Hub intercepts HT | Create a new private endpoint for ACR in the same VNet as the source VM (bypass  | 🟢 8.0 | ADO Wiki |
| 4 | Azure Function App deployment fails pulling image from private ACR with 'Pull Im | Known limitation: For Premium and Dedicated Linux Function Apps, pulling images  | Ensure the image being pulled uses Docker v2 manifest format (application/vnd.do | 🟢 8.0 | ADO Wiki |
| 5 | AKS with HTTP proxy configured fails to pull images from private ACR with 403 Fo | When AKS cluster uses HTTP proxy for outbound traffic and ACR uses private endpo | Ensure ACR private endpoint FQDNs are in the proxy's noProxy/bypass list: 1) <re | 🟢 8.0 | ADO Wiki |
| 6 | Cannot connect to ACR registry or pull images. Errors: 'Could not connect to the | ACR has private endpoints enabled with public access disabled, and the client is | 1. Use Jarvis 'Get Registry Private Endpoints' action (JIT scope: ACRSupport, Ac | 🟢 8.0 | ADO Wiki |
| 7 | ACR FQDN resolves to public IP instead of private IP even though Private Link an | The private endpoint network interface is on a different VNet than the device pe | Add a virtual network link at the ACR private DNS zone level (<acr>.privatelink. | 🔵 6.0 | MS Learn |
| 8 | ACR FQDN resolves to public IP when using custom DNS server - private endpoint c | Custom DNS server is not configured with a server-level forwarder to Azure DNS ( | Configure a server-level forwarder to Azure DNS (168.63.129.16) on the custom DN | 🔵 6.0 | MS Learn |
| 9 | ACR FQDN resolves to public IP - custom DNS has forwarder to Azure DNS but still | The custom DNS server VNet is not linked to the ACR private DNS zone, so Azure D | Add a virtual network link at the ACR private DNS zone for the VNet where the cu | 🔵 6.0 | MS Learn |
| 10 | Cannot delete Azure Container Registry that has private endpoints associated wit | ACR deletion is blocked when private endpoint connections still exist on the reg | Remove all private endpoint connections first using Azure portal or az acr priva | 🔵 6.0 | MS Learn |
