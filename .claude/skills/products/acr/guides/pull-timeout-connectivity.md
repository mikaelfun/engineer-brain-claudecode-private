# ACR Pull 超时与连接问题 — 排查速查

**来源数**: 3 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot pull images from Microsoft Container Registry (MCR) - connection timeouts | Client firewall or network security rules are blocking the required MCR endpoint | Add the following firewall rules: 1) HTTPS to mcr.microsoft.com (REST endpoint). | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-022] |
| 2 | AKS integrated with ACR via 'az aks update --attach-acr' fails to pull images wi | AKS cluster is behind a proxy server or firewall that blocks outbound connection | Allow ACR endpoints on proxy/firewall: 1) https://<acr>.azurecr.io (REST endpoin | 🟢 9.0 — ADO Wiki交叉验证 | [acr-ado-wiki-059] |
| 3 | Intermittent Docker pull failures from Docker Hub with EOF error on Cloudflare C | Cloudflare CDN sometimes categorizes Docker image pull redirect requests as WebR | Modify internal firewall rules to allow WebRepositoryAndStorage traffic category | 🟢 8.0 — ADO Wiki单源+实证 | [acr-ado-wiki-067] |
| 4 | AKS nodes lose access to MCR proxy after adding security appliance (e.g., Zscale | Security appliances block outbound traffic to MCR proxy servers; the proxy IPs a | 1) Ask customer to provide their outbound IP ranges. 2) Contact AKS PG (Andy Zha | 🟢 9.5 — OneNote交叉验证 | [acr-onenote-013] |
| 5 | Docker pull from ACR fails with context deadline exceeded error | The device cannot resolve the ACR login server FQDN (<acr>.azurecr.io) via DNS - | 1) Run nslookup <acr>.azurecr.io to test DNS resolution. 2) Test with Azure DNS  | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-014] |
| 6 | Docker pull fails with I/O timeout: dial tcp <storage-ip>:443: i/o timeout - err | Port 443 connectivity to the ACR storage/data endpoint is blocked. ACR allocates | 1) Test connectivity: telnet/nc to the data endpoint on port 443. 2) Allow the s | 🟢 8.0 — MS Learn交叉验证 | [acr-mslearn-015] |
| 7 | Docker pull from ACR on Azure VM fails with I/O timeout - NSG blocking outbound  | Network Security Group (NSG) associated with the VM NIC or subnet is blocking ou | 1) Use Network Watcher NSG Diagnostics to check if traffic to Storage.<region> I | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-016] |
| 8 | ACR pull/push fails with request canceled while waiting for connection (Client.T | Port 443 connectivity to the ACR login server (<acr>.azurecr.io) is blocked - po | 1) Test connectivity: telnet/nc <acr>.azurecr.io 443. 2) Check firewall/proxy/AC | 🔵 6.0 — MS Learn单源文档 | [acr-mslearn-020] |

## 快速排查路径
1. 检查 → Client firewall or network security rules are blocking the r `[来源: ADO Wiki]`
   - 方案: Add the following firewall rules: 1) HTTPS to mcr.microsoft.com (REST endpoint). 2) HTTPS to *.data.
2. 检查 → AKS cluster is behind a proxy server or firewall that blocks `[来源: ADO Wiki]`
   - 方案: Allow ACR endpoints on proxy/firewall: 1) https://<acr>.azurecr.io (REST endpoint), 2) https://<acr>
3. 检查 → Cloudflare CDN sometimes categorizes Docker image pull redir `[来源: ADO Wiki]`
   - 方案: Modify internal firewall rules to allow WebRepositoryAndStorage traffic category, which includes Doc
4. 检查 → Security appliances block outbound traffic to MCR proxy serv `[来源: OneNote]`
   - 方案: 1) Ask customer to provide their outbound IP ranges. 2) Contact AKS PG (Andy Zhang) to whitelist the
5. 检查 → The device cannot resolve the ACR login server FQDN (<acr>.a `[来源: MS Learn]`
   - 方案: 1) Run nslookup <acr>.azurecr.io to test DNS resolution. 2) Test with Azure DNS directly: nslookup <

> 本 topic 有融合排查指南 → [完整排查流程](details/pull-timeout-connectivity.md#排查流程)
