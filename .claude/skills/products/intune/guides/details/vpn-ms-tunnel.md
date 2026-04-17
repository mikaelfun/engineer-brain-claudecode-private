# INTUNE Microsoft Tunnel VPN — 已知问题详情

**条目数**: 56 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Microsoft Tunnel Gateway 安装后设备无法连接，TLS 握手失败
**Solution**: 1. 使用 openssl s_client -showcerts -connect vpn_server:443 检查证书链是否完整；2. 通过 ssllabs.com/ssltest 验证；3. 如 TLS 证书由私有 CA 签发，需通过 Trusted Certificate profile 将根证书链部署到 iOS/Android 设备
`[Source: ado-wiki, Score: 9.0]`

### Step 2: Microsoft Tunnel VPN 连接间歇性断开或某些设备连接失败（多服务器环境）
**Solution**: 1. 确认 Load Balancer 配置了 Source IP Affinity（TCP/UDP 会话亲和）；2. 通过网络抓包验证 TLS 和 DTLS 握手是否到达同一服务器；3. 如 LB 是 Azure LB 可联系 Azure Networking 团队协助
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Microsoft Tunnel VPN 连接失败，服务器日志显示无法从 login.windows.net 下载 JSON 或无法连接 Intune 服务端点
**Solution**: 1. 在代理/SSL Inspector 中排除 MTG 使用的 Microsoft 端点；2. 认证代理不受支持，需排除 MTG 端点的认证要求；3. 配置代理环境变量在 /etc/environment 或 Docker 的 http-proxy.conf 中；4. 用 tcpdump/tshark 抓包分析确认是否存在 SSL 拦截
`[Source: ado-wiki, Score: 9.0]`

### Step 4: iOS 设备配置了 Per-App VPN 的 Microsoft Tunnel 但 split tunnel 规则不生效
**Solution**: 这是 iOS 的预期行为：Per-App VPN 等同于 Forced Tunnel。如需 split tunnel 功能，改用 Device-Wide VPN 或 On-Demand VPN 模式
`[Source: ado-wiki, Score: 9.0]`

### Step 5: 2025年8月15日后旧版 Microsoft Tunnel 容器无法连接 Intune 服务
**Solution**: 将 MS Tunnel 升级到至少 2025年3月19日发布的版本
`[Source: ado-wiki, Score: 9.0]`

### Step 6: MTG Management Agent 通过 SSL Inspection 代理连接 Intune 后端时连接失败
**Solution**: 在代理/SSL Inspector 中将 Microsoft 端点排除在 SSL 检查之外；注意 login.microsoftonline.com 等端点也不能被 inspect
`[Source: ado-wiki, Score: 9.0]`

### Step 7: VPN 客户端应用（如 LOB 应用）流量绕过 MTG 代理直连目标服务器
**Solution**: 1. 确认应用使用系统级 API（iOS: URLSession/CFNetwork/WebKit; Android: HttpURLConnection/OkHttp/Cronet）以自动遵循代理设置；2. 低级库应用需开发者修改代码支持系统代理；3. 用 adb logcat 过滤 ConnectivityService 或 macOS Console 过滤 neagent 确认 OS 层代理配置正确
`[Source: ado-wiki, Score: 9.0]`

### Step 8: 同时配置了 static proxy 和 PAC URL 的 VPN profile 行为不一致（连接错误或意外直连）
**Solution**: 只配置一种代理方式（推荐 PAC 或 static 二选一）；如使用 PAC，确保 PAC host IP 包含在 VPN split-tunneling 规则中
`[Source: ado-wiki, Score: 9.0]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Microsoft Tunnel Gateway 安装后设备无法连接，TLS 握手失败 | 安装时仅提供了叶子证书（leaf cert），缺少 CA 证书链；某些浏览器会缓存中间证书导致测试通过但 Tunnel 需要完整证书链 | 1. 使用 openssl s_client -showcerts -connect vpn_server:443 检查证书链是否完整；2. 通过 ssl... | 9.0 | ado-wiki |
| 2 | Microsoft Tunnel VPN 连接间歇性断开或某些设备连接失败（多服务器环境） | Load Balancer 未配置 Source IP Affinity，导致 TLS 握手和 DTLS 握手被分发到不同的后端服务器 | 1. 确认 Load Balancer 配置了 Source IP Affinity（TCP/UDP 会话亲和）；2. 通过网络抓包验证 TLS 和 DT... | 9.0 | ado-wiki |
| 3 | Microsoft Tunnel VPN 连接失败，服务器日志显示无法从 login.windows.net 下载 JSON 或无法连接 Intune 服务端点 | 网络中的 SSL Inspector/Proxy 拦截并重新加密了 MTG 到 Microsoft 端点的流量，破坏了 TLS 连接；或使用了不支持的认证... | 1. 在代理/SSL Inspector 中排除 MTG 使用的 Microsoft 端点；2. 认证代理不受支持，需排除 MTG 端点的认证要求；3. ... | 9.0 | ado-wiki |
| 4 | iOS 设备配置了 Per-App VPN 的 Microsoft Tunnel 但 split tunnel 规则不生效 | iOS 上 Per-App VPN 模式下 split tunnel 规则被忽略，所有流量强制通过 VPN（Forced Tunnel） | 这是 iOS 的预期行为：Per-App VPN 等同于 Forced Tunnel。如需 split tunnel 功能，改用 Device-Wide ... | 9.0 | ado-wiki |
| 5 | 2025年8月15日后旧版 Microsoft Tunnel 容器无法连接 Intune 服务 | 2025年3月19日之前部署的 Tunnel 容器使用的旧端点将于2025年8月15日废弃 | 将 MS Tunnel 升级到至少 2025年3月19日发布的版本 | 9.0 | ado-wiki |
| 6 | MTG Management Agent 通过 SSL Inspection 代理连接 Intune 后端时连接失败 | Management Agent 使用 mutual TLS 认证与 Intune 通信，SSL Break & Inspect 会破坏该认证流程 | 在代理/SSL Inspector 中将 Microsoft 端点排除在 SSL 检查之外；注意 login.microsoftonline.com 等端... | 9.0 | ado-wiki |
| 7 | VPN 客户端应用（如 LOB 应用）流量绕过 MTG 代理直连目标服务器 | 使用 BSD Sockets/POSIX/libcurl/OpenSSL 等低级网络库的应用不会查询系统代理设置，直接通过 VPN tun 接口连接目标 ... | 1. 确认应用使用系统级 API（iOS: URLSession/CFNetwork/WebKit; Android: HttpURLConnection... | 9.0 | ado-wiki |
| 8 | 同时配置了 static proxy 和 PAC URL 的 VPN profile 行为不一致（连接错误或意外直连） | 同时配置 static proxy 和 PAC URL 时，设备通常只选择一种（PAC 优先），不存在可靠的故障转移机制 | 只配置一种代理方式（推荐 PAC 或 static 二选一）；如使用 PAC，确保 PAC host IP 包含在 VPN split-tunneling... | 9.0 | ado-wiki |
| 9 | Rootless Tunnel 安装失败，端口绑定错误 | Rootless 容器以非 root 用户运行，默认无法绑定 1024 以下端口；或 /home 空间不足；或代理未为非 root 用户配置 | 1. 在 /etc/sysctl.conf 添加 net.ipv4.ip_unprivileged_port_start=443 并重启；2. 确保 /h... | 9.0 | ado-wiki |
| 10 | Rootless Tunnel 吞吐量低于预期（最高仅 230Mbps） | Rootless 模式使用 slirp4netns 网络模式（非 bridge），吞吐量上限为 230Mbps，低于 rootful 模式的 1Gbps+ | 这是 rootless 模式的已知限制。如需更高吞吐量，使用 rootful 模式；可在同一 site 中混合部署 rootful 和 rootless ... | 9.0 | ado-wiki |
| 11 | Intune 中 Microsoft Tunnel VPN 在 21V 环境无法使用 | Microsoft Tunnel 依赖 Microsoft Defender for Endpoint；国内 Tunnel VPN 只允许三大运营商做 V... | 不支持；改用第三方 VPN 方案，或改用 Always On VPN（RRAS/PPTP/IKEv2） | 8.0 | 21v-gap |
| 12 | Intune for Education: Groups1. Log into the Intune for Education Console (htt... |  |  | 7.5 | contentidea-kb |
| 13 | How to deploy a VPN connection so when users open the Settings menu on an iOS... | &nbsp;A custom VPN profile was needed to point to the correct version of Cisc... | To create a custom VPN profile:  Choose your SSO &gt; Put in the server addre... | 7.5 | contentidea-kb |
| 14 | Customers will be impacted if they are using F5 Access VPN profiles targeted ... | F5 has announced that F5 Access 2.1 and earlier, also known as F5 Access Lega... | Migrate their iOS devices to Intune on Azure as soon as possible so they can ... | 7.5 | contentidea-kb |
| 15 | We thought it would be helpful to share with you some details about the flow ... |  |  | 7.5 | contentidea-kb |
| 16 | The on-demand rules that are configured as part of the Intune iOS F5 Access V... |  |  | 7.5 | contentidea-kb |
| 17 | After creating and assigning an Always-On VPN&nbsp; profiles to iOS devices, ... | This behavior is by design and a limitation of the iOS platform, not Intune. | Currently there is no work around. There is no known way to disable or grey o... | 7.5 | contentidea-kb |
| 18 | In this example scenario I will demonstrate how to use App Config to pre-popu... |  |  | 7.5 | contentidea-kb |
| 19 | Welcome to Intune's workflow for&nbsp;Microsoft Tunnel VPN. Here you will fin... |  |  | 7.5 | contentidea-kb |
| 20 | iOS devices may be disconnected from the Microsoft Tunnel Gateway.&nbsp; The ... | The likely cause is that the session has been dropped by an intermediary netw... | Lowering the DPD value may help keep the connection open by sending DPD frame... | 7.5 | contentidea-kb |
| 21 | After successfully deploying a VPN profile to devices, some report failures w... | Microsoft Tunnel Gateway installs to a Docker container that runs on a Linux ... | Make sure that the hardware requirements meet those listed above. If insuffic... | 7.5 | contentidea-kb |
| 22 | After setting up the Microsoft Tunnel Gateway to provide VPN access to on-pre... | The Microsoft Tunnel Gateway agent service is responsible for sending the che... | One way to remedy this is to get the status of the agent service on the Linux... | 7.5 | contentidea-kb |
| 23 | If you use a .local address (like https://www.someinternalsite.local) with on... | Apple Network Extension framework will not route DNS requests containing addr... | There are three potential work arounds for this:1. Change the endpoint addres... | 7.5 | contentidea-kb |
| 24 |      Test 1: Deploy IKEv2 VPN profile           Target:      Please dep... |  |  | 7.5 | contentidea-kb |
| 25 | When connecting to Microsoft Tunnel Gateway (MTG) from an Android Enterprise ... | This error occurs when a route that has a mismatched subnet mask is attempted... | To resolve this issue:Calculate the correct subnet  and subnet mask.&nbsp;Cor... | 7.5 | contentidea-kb |
| 26 | Consider the following scenario:You are using the Microsoft Tunnel client app... | This can occur if there is no&nbsp;publicly accessible DNS (e.g. 1.1.1.1) in ... | There are two potential work&nbsp;arounds for this problem:If you want to kee... | 7.5 | contentidea-kb |
| 27 | Additional information can be located in the following places:  Windows 365 O... |  |  | 7.5 | contentidea-kb |
| 28 | Note:   The creation of the Site to Site VPN tunnel is not within the support... |  |  | 7.5 | contentidea-kb |
| 29 | In this scenario, the customer was using MS Tunnel VPN on iOS.&nbsp;The iOS u... | This can occur if the server clock is not accurate. In this case it was set 3... | To resolve this problem, compete the following:  1. On the MTG server(s), get... | 7.5 | contentidea-kb |
| 30 | After creating and&nbsp;deploying an always-on Microsoft Tunnel VPN profile t... | On some Samsung devices, an app might be put into deep sleep if not used for ... | To prevent this issue from occuring, deploy the MSDefender client app and the... | 7.5 | contentidea-kb |
| 31 | Client VPN app attempts to authenticate with Azure AD (AAD) and obtain a toke... |  |  | 7.5 | contentidea-kb |
| 32 | Configurations involved with MS Tunnel. Server Configuration&nbsp; The Server... |  |  | 7.5 | contentidea-kb |
| 33 | When installing MS tunnel gateway, at the time of Authentication the sign in ... | This issue occurs only when the Authentication URL ends with &quot;/devicelog... | When confirmed that the issue is noticed in a public cloud customer, reinstal... | 7.5 | contentidea-kb |
| 34 | The public documentation for configuring VPN Client DNS servers is available ... |  |  | 7.5 | contentidea-kb |
| 35 | When installing MS tunnel gateway, configuring the services fails with the fo... | This can occur if there is a problem with the MS Tunnel application. | When confirmed that the issue is noticed in a public cloud customer, reinstal... | 7.5 | contentidea-kb |
| 36 | Many of the products within Modern Workplace (MW)&nbsp;depend on underlying f... |  |  | 7.5 | contentidea-kb |
| 37 | End users not able to open any external websites while VPN connection is star... | Customer Performed DNS Changes on Endpoint manager server configuration Porta... | After Deep investigations from client side and also Viewing several server lo... | 7.5 | contentidea-kb |
| 38 | With the deprecation of Microsoft iOS standalone tunnel client app getting cl... |  |  | 7.5 | contentidea-kb |
| 39 | Android and iOS devices disconnect after a specific uptime even      when the... | This can occur if the&nbsp;session-timeout parameter has been exceeded.&nbsp;... | To resolve this issue,&nbsp; edit the /etc/mstunnel/ocserv.conf&nbsp;file on ... | 7.5 | contentidea-kb |
| 40 | Microsoft Intune Suite (launched March 1st, 2023) provides additional mission... |  |  | 7.5 | contentidea-kb |
| 41 | When configuring the Microsoft Tunnel Gateway &quot;Server Configuration&quot... | The Exclude ranges take precedence over Include filters.&nbsp; This effective... | The customer needs to consider if their implementation should send only certa... | 7.5 | contentidea-kb |
| 42 | The customer had a Device scoped IKEv2 VPN profile.&nbsp; The VPN profile is ... | This issue was determined to be caused by new&nbsp; validation enforcement fo... | The solution was to set the appropriate value for PFS Group and sync the Wind... | 7.5 | contentidea-kb |
| 43 | If you use RHEL-8 Linux server to set up MS tunnel, you need to enable signat... | When pulling signed images, the image manifest digest is generated by decrypt... | Here are the commands to enable signature verification in podman. You will co... | 7.5 | contentidea-kb |
| 44 | Network-sensitive applications such as Microsoft Teams are impacted by this b... | 3-party Firewall solution sitting between the VPN client and the VPN server w... | Engage the Customer's networking team to fix their configuration. | 7.5 | contentidea-kb |
| 45 | After a device restart in Samsung devices, an exceptional amount of time is t... | Upon reviewing the Defender logs, we observed that the TunnelVPNClient was no... | The system blocks the app for network access when running power optimization.... | 7.5 | contentidea-kb |
| 46 | The behavior was specific to iOS clients. Android were working for the custom... | We think this is caused by Rogers Cellular using an IPv6 to IPv4 transistion ... | We configured the server to use a lower MTU, to allow more room for the heade... | 7.5 | contentidea-kb |
| 47 | If the outgoing traffic from MS Tunnel server needs to go through an SSL prox... | MS Tunnel fails to connect to sts.windows.net for the OIDC metadata due to mi... | Here are 2 options to solve this issue:&nbsp;    Option 1:&nbsp;Exclude the e... | 7.5 | contentidea-kb |
| 48 | In specific scenario, when using iOS defender app to connect to MS Tunnel ser... | This is currently a known issue when using combined mode (MS Tunnel + Web Def... | The engineering team will release a fix for this issue in March 2025 defender... | 7.5 | contentidea-kb |
| 49 | Microsoft Tunnel networking issues, debugging connectivity problems, and moni... |  |  | 7.5 | contentidea-kb |
| 50 | Device fail to connect to Microsoft Intune Tunnel. Client logs report &quot;C... | Proxy certificates under etc/mstunnel/ca-trust are not proper or incomplete. | Import the Root and all applicable Intermediate Certificates for the proxy at... | 7.5 | contentidea-kb |
| 51 | After upgrading the Microsoft Tunnel Gateway server, the backend reports the ... | On the Microsoft Tunnel server, the CurrentServerHealthStatus parameter remai... | Follow these steps to resolve the issue where the Intune Admin Center display... | 7.5 | contentidea-kb |
| 52 | [KBWM]Intune Doc Req: Side nav request for our MS Tunnel VPN workflow |  |  | 7.5 | contentidea-kb |
| 53 | Intune: How To Create Microsoft Tunnel VPN Lab Using Azure Subscription |  |  | 7.5 | contentidea-kb |
| 54 | Intune: How To Create Microsoft Tunnel VPN Lab Using My Workspace |  |  | 7.5 | contentidea-kb |
| 55 | The on-demand rules that are configured as part of the Intune iOS F5 Access V... |  |  | 4.5 | contentidea-kb |
| 56 | After creating and assigning an Always-On VPN profiles to iOS devices, the co... | This behavior is by design and a limitation of the iOS platform, not Intune. | Currently there is no work around. There is no known way to disable or grey o... | 4.5 | contentidea-kb |
