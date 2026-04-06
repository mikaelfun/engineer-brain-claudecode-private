# ACR 拉取失败 — 排查速查

**来源数**: 8 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | AKS image pull 报 401 Unauthorized 'failed to fetch anonymous token'，实际镜像不存在 (404) | AKS kubelet 并发发送匿名和凭证请求，镜像不存在时凭证返回 404、匿名返回 401，产生误导性错误 | 401 是 kubelet 重试逻辑的副产物，关注 404 部分。验证镜像存在：`az acr repository show-tags --name <reg> --repository <repo>` | 🟢 8 — ADO Wiki 深度分析 | [ADO Wiki/401 Anonymous Token](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Pull%20Image%20401%20Anonymous%20Token) |
| 2 | 间歇性 Docker pull 失败 EOF on Cloudflare CDN，AKS 升级后 CrashLoopBackOff（升级无关） | Cloudflare CDN 将 Docker Hub 重定向流量归类为 WebRepositoryAndStorage 类别，客户内部防火墙阻断该类别 | 修改防火墙规则允许 WebRepositoryAndStorage 流量类别。重启 deployment 可临时缓解 | 🟢 8 — ADO Wiki 实证 | [ADO Wiki/Docker pull intermittently](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FDocker+pull+issues+intermittently) |
| 3 | 间歇性 502 Bad Gateway，pull/push 时 'connection reset by peer' | ACR 307 重定向到 Azure Blob Storage，Storage 前端节点偶尔处于半健康状态，LB 仍路由流量到降级节点 | 重试操作（LB 会分配到健康节点）。在 CI/CD 中实现 retry 逻辑。持续问题参考 ICM 234383246, 238929152, 230185890 | 🟢 8 — ADO Wiki+ICM 实证 | [ADO Wiki/Intermittent 502](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FIntermittent+502+responses+from+ACR) |
| 4 | Docker pull 报 `context deadline exceeded` | DNS 无法解析 ACR login server FQDN (<acr>.azurecr.io)，DNS 配置问题或自定义 DNS 无法到达 Azure DNS | ① `nslookup <acr>.azurecr.io` 测试解析 ② 直连 Azure DNS 测试：`nslookup <acr>.azurecr.io 168.63.129.16` ③ 检查自定义 DNS forwarder 配置 | 🔵 6 — MS Learn 单源 | [MS Learn/context-deadline-exceeded](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/context-deadline-exceeded) |
| 5 | Docker pull 报 `I/O timeout: dial tcp <storage-ip>:443` | 到 ACR storage/data endpoint 的 443 端口被阻断（防火墙/NSG/路由） | ① 测试连通性：telnet/nc data endpoint 443 ② 放行 *.blob.core.windows.net 或 dedicated data endpoint FQDN ③ NSG 使用 Storage.<region> service tag | 🔵 6 — MS Learn 单源 | [MS Learn/443-io-timeout](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/download-failed-443-io-time-out) |
| 6 | Azure VM 上 Docker pull I/O timeout — NSG 阻断到 storage endpoint 的流量 | NSG 阻断了出站 TCP 443 到 ACR storage/data endpoint IP 段 | ① Network Watcher NSG Diagnostics 检查 Storage.<region> IP 是否被拒 ② 添加出站允许规则 port 443 到 Storage service tag ③ 检查路由表 next hop 非 None | 🔵 6 — MS Learn 单源 | [MS Learn/443-io-timeout](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/download-failed-443-io-time-out) |
| 7 | Docker pull 报 `manifest unknown: manifest tagged by <tag> is not found` | 指定的 image tag 在 ACR repository 中不存在（已删除/未推送/拼写错误） | 验证 tag 存在：① Portal: Container registries > Repositories > 查看 tags ② CLI: `az acr repository show-tags --name <reg> --repository <repo>` | 🔵 6 — MS Learn 单源 | [MS Learn/manifest-tag-not-found](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/manifest-tag-not-found) |
| 8 | Pull/push 报 `request canceled while waiting for connection (Client.Timeout exceeded)` | 到 ACR login server (<acr>.azurecr.io) 的 443 端口被阻断（防火墙/代理/NSG/ISP/路由） | ① telnet/nc <acr>.azurecr.io 443 ② 检查防火墙/代理/ACL ③ Azure VM 用 Network Watcher 诊断 ④ 检查路由表 next hop | 🔵 6 — MS Learn 单源 | [MS Learn/request-canceled-timeout](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/request-canceled-waiting-connection-timeout-exceeded) |

## 快速排查路径
1. **确认错误类型**：401/403 认证类 → 还是 timeout/EOF 连通性类 → 还是 manifest/tag 不存在类 `[来源: 综合]`
2. **如果 401 + AKS** → 先确认镜像是否真的存在（401 可能是 404 的误导），`az acr repository show-tags` 验证 `[来源: ADO Wiki]`
3. **如果 manifest unknown** → 确认 tag 拼写 + 是否已推送/已被 purge `[来源: MS Learn]`
4. **如果 context deadline exceeded** → DNS 解析问题，测试 nslookup + Azure DNS 168.63.129.16 `[来源: MS Learn]`
5. **如果 I/O timeout 443** → 端口连通性问题，telnet 测试 + 检查 NSG/防火墙/路由 `[来源: MS Learn]`
6. **如果间歇性 502 / connection reset** → Azure Storage 前端节点问题，实现 retry 逻辑 `[来源: ADO Wiki]`
7. **如果间歇性 EOF on Cloudflare** → 检查内部防火墙 WebRepositoryAndStorage 类别 `[来源: ADO Wiki]`
8. **如果 Client.Timeout exceeded** → 全链路 443 连通性排查（login server + data endpoint）`[来源: MS Learn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-pull-failures.md#排查流程)
