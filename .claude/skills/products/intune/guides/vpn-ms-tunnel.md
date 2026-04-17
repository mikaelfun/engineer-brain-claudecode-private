# Intune Microsoft Tunnel VPN — 排查速查

**来源数**: 1 | **21V**: 全部适用
**条目数**: 10 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Microsoft Tunnel Gateway 安装后设备无法连接，TLS 握手失败 | 安装时仅提供了叶子证书（leaf cert），缺少 CA 证书链；某些浏览器会缓存中间证书导致测试通过但 Tunnel 需要完整证书链 | 1. 使用 openssl s_client -showcerts -connect vpn_server:443 检查证书链是否完整；2. 通过 ssllabs.com/ssltest 验证；... | 🟢 8.5 | ADO Wiki |
| 2 | Microsoft Tunnel VPN 连接间歇性断开或某些设备连接失败（多服务器环境） | Load Balancer 未配置 Source IP Affinity，导致 TLS 握手和 DTLS 握手被分发到不同的后端服务器 | 1. 确认 Load Balancer 配置了 Source IP Affinity（TCP/UDP 会话亲和）；2. 通过网络抓包验证 TLS 和 DTLS 握手是否到达同一服务器；3. 如 ... | 🟢 8.5 | ADO Wiki |
| 3 | Microsoft Tunnel VPN 连接失败，服务器日志显示无法从 login.windows.net 下载 JSON 或无法连接 Intune 服务端点 | 网络中的 SSL Inspector/Proxy 拦截并重新加密了 MTG 到 Microsoft 端点的流量，破坏了 TLS 连接；或使用了不支持的认证... | 1. 在代理/SSL Inspector 中排除 MTG 使用的 Microsoft 端点；2. 认证代理不受支持，需排除 MTG 端点的认证要求；3. 配置代理环境变量在 /etc/envir... | 🟢 8.5 | ADO Wiki |
| 4 | iOS 设备配置了 Per-App VPN 的 Microsoft Tunnel 但 split tunnel 规则不生效 | iOS 上 Per-App VPN 模式下 split tunnel 规则被忽略，所有流量强制通过 VPN（Forced Tunnel） | 这是 iOS 的预期行为：Per-App VPN 等同于 Forced Tunnel。如需 split tunnel 功能，改用 Device-Wide VPN 或 On-Demand VPN 模式 | 🟢 8.5 | ADO Wiki |
| 5 | 2025年8月15日后旧版 Microsoft Tunnel 容器无法连接 Intune 服务 | 2025年3月19日之前部署的 Tunnel 容器使用的旧端点将于2025年8月15日废弃 | 将 MS Tunnel 升级到至少 2025年3月19日发布的版本 | 🟢 8.5 | ADO Wiki |
| 6 | MTG Management Agent 通过 SSL Inspection 代理连接 Intune 后端时连接失败 | Management Agent 使用 mutual TLS 认证与 Intune 通信，SSL Break & Inspect 会破坏该认证流程 | 在代理/SSL Inspector 中将 Microsoft 端点排除在 SSL 检查之外；注意 login.microsoftonline.com 等端点也不能被 inspect | 🟢 8.5 | ADO Wiki |
| 7 | VPN 客户端应用（如 LOB 应用）流量绕过 MTG 代理直连目标服务器 | 使用 BSD Sockets/POSIX/libcurl/OpenSSL 等低级网络库的应用不会查询系统代理设置，直接通过 VPN tun 接口连接目标 ... | 1. 确认应用使用系统级 API（iOS: URLSession/CFNetwork/WebKit; Android: HttpURLConnection/OkHttp/Cronet）以自动遵循... | 🟢 8.5 | ADO Wiki |
| 8 | 同时配置了 static proxy 和 PAC URL 的 VPN profile 行为不一致（连接错误或意外直连） | 同时配置 static proxy 和 PAC URL 时，设备通常只选择一种（PAC 优先），不存在可靠的故障转移机制 | 只配置一种代理方式（推荐 PAC 或 static 二选一）；如使用 PAC，确保 PAC host IP 包含在 VPN split-tunneling 规则中 | 🟢 8.5 | ADO Wiki |
| 9 | Rootless Tunnel 安装失败，端口绑定错误 | Rootless 容器以非 root 用户运行，默认无法绑定 1024 以下端口；或 /home 空间不足；或代理未为非 root 用户配置 | 1. 在 /etc/sysctl.conf 添加 net.ipv4.ip_unprivileged_port_start=443 并重启；2. 确保 /home 有至少 10GB 空间；3. 代... | 🟢 8.5 | ADO Wiki |
| 10 | Rootless Tunnel 吞吐量低于预期（最高仅 230Mbps） | Rootless 模式使用 slirp4netns 网络模式（非 bridge），吞吐量上限为 230Mbps，低于 rootful 模式的 1Gbps+ | 这是 rootless 模式的已知限制。如需更高吞吐量，使用 rootful 模式；可在同一 site 中混合部署 rootful 和 rootless 服务器进行评估 | 🟢 8.5 | ADO Wiki |

## 快速排查路径
1. 1. 使用 openssl s_client -showcerts -connect vpn_server:443 检查证书链是否完整；2. 通过 ssllabs.com/ssltest 验证；3. 如 TLS 证书由私有 CA 签发，需通过 Trusted Certificate profile  `[来源: ADO Wiki]`
2. 1. 确认 Load Balancer 配置了 Source IP Affinity（TCP/UDP 会话亲和）；2. 通过网络抓包验证 TLS 和 DTLS 握手是否到达同一服务器；3. 如 LB 是 Azure LB 可联系 Azure Networking 团队协助 `[来源: ADO Wiki]`
3. 1. 在代理/SSL Inspector 中排除 MTG 使用的 Microsoft 端点；2. 认证代理不受支持，需排除 MTG 端点的认证要求；3. 配置代理环境变量在 /etc/environment 或 Docker 的 http-proxy.conf 中；4. 用 tcpdump/tsha `[来源: ADO Wiki]`
4. 这是 iOS 的预期行为：Per-App VPN 等同于 Forced Tunnel。如需 split tunnel 功能，改用 Device-Wide VPN 或 On-Demand VPN 模式 `[来源: ADO Wiki]`
5. 将 MS Tunnel 升级到至少 2025年3月19日发布的版本 `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vpn-ms-tunnel.md#排查流程)
