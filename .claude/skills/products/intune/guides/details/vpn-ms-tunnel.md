# Intune Microsoft Tunnel VPN — 综合排查指南

**条目数**: 10 | **草稿融合数**: 6 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-MS-Tunnel-VPN.md, ado-wiki-VPN-Profiles.md, mslearn-troubleshoot-vpn-profiles.md, onenote-ms-tunnel-log-collection.md, onenote-ms-tunnel-network-trace.md, onenote-windows-vpn-custom-policy.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Ms Tunnel Vpn
> 来源: ADO Wiki — [ado-wiki-MS-Tunnel-VPN.md](../drafts/ado-wiki-MS-Tunnel-VPN.md)

**Microsoft Tunnel Gateway (MTG) VPN**
**Architecture Overview**
**Key Components**
- **Intune Service**: Deploys VPN server + client configurations
- **Entra ID**: Issues authentication tokens, evaluates Conditional Access
- **Linux Server**: Runs Podman/Docker CE container with MTG images
- **Container Images**: Server image (VPN connections) + Agent image (Intune backend communication)
- **TLS Certificate**: Required for secure connection between devices and Tunnel server
- **Defender for Endpoint**: Required app on devices for Tunnel connectivity

**Deployment Scenarios**
- Server location: On-premises or Azure VM (with ExpressRoute)
- Site/Server: Single/Multiple sites, Single/Multiple servers per site
- Client: iOS/iPadOS and Android Enterprise only (MDM or MAM)
- Tunneling: Split Tunnel vs Forced Tunnel; Per-App VPN (iOS: forced tunnel); On-Demand VPN (iOS only)

**Configuration**

**Server Side**
1. Meet prerequisites (Linux, Docker/Podman, networking)
2. Create Server Configuration in Intune (IP ranges, DNS, split tunnel rules)
3. Create Site Configuration in Intune
4. Run readiness scripts on server
5. Install MTG

**Client Side (MDM)**
1. Deploy Trusted Root Certificate profile (if private CA)
2. Deploy VPN profile (platform-specific settings)
3. Deploy Defender for Endpoint app

**Client Side (MAM)**
- App Configuration + App Protection policies
- LOB apps need SDK integration (Intune App SDK + MSAL + Tunnel SDK)
... (详见原始草稿)

### Phase 2: Vpn Profiles
> 来源: ADO Wiki — [ado-wiki-VPN-Profiles.md](../drafts/ado-wiki-VPN-Profiles.md)

**What is a VPN?**
- A RouteBased VPN Gateway (can be a Microsoft server or 3rd party server).
- A RADIUS server to handle user authentication. The RADIUS is usually deployed on-premises. The RADIUS server can be a Microsoft server (NPS) or a 3rd party RADIUS server.

**What are Intune VPN profiles?**

**VPN connection types**
- Automatic (Windows 10)
- Check Point Capsule VPN (Android DA, Android Enterprise WP, iOS/iPadOS, macOS, Windows 10, Windows 8.1)
- Cisco AnyConnect (Android DA, Android Enterprise WP, Android Enterprise FMD, iOS/iPadOS, macOS)
- Cisco IPSec (iOS/iPadOS)
- Citrix SSO (Android DA, Android Enterprise WP/FMD via App Config, iOS/iPadOS, Windows 10)
- Custom VPN (iOS/iPadOS, macOS)
- F5 Access (Android DA, Android Enterprise WP/FMD, iOS/iPadOS, macOS, Windows 10, Windows 8.1)
- IKEv2 (iOS/iPadOS, Windows 10)
- L2TP (Windows 10)
- Palo Alto Networks GlobalProtect (Android Enterprise WP via App Config, iOS/iPadOS, Windows 10)
- PPTP (Windows 10)
- Pulse Secure (Android DA, Android Enterprise WP/FMD, iOS/iPadOS, Windows 10, Windows 8.1)
- SonicWall Mobile Connect (Android DA, Android Enterprise WP/FMD, iOS/iPadOS, Windows 10, Windows 8.1)
- Zscaler (Android Enterprise WP via App Config, iOS/iPadOS)

**Secure your VPN profiles**
- **Certificates:** When you create the VPN profile, you choose a SCEP or PKCS certificate profile. This profile is known as the identity certificate. It's used to authenticate against a trusted certificate profile.
- **Username and password:** The user authenticates to the VPN server by providing a user name and password.

**VPN profile deployment flow**

**Scenarios**

**iOS and Android Per App VPN**
- On Android Enterprise, user starts VPN, then per-app settings determine which apps are allowed (allowlist/blocklist).
- On iOS, launching the app triggers the VPN connection.
... (详见原始草稿)

### Phase 3: Troubleshoot Vpn Profiles
> 来源: MS Learn — [mslearn-troubleshoot-vpn-profiles.md](../drafts/mslearn-troubleshoot-vpn-profiles.md)

**Troubleshooting VPN Profile Issues in Microsoft Intune**
**Prerequisites**
- Trusted Root and SCEP profiles must be installed and working on device
- VPN app must be installed before VPN profile is applied
- Group-type deployment (user/device) must be consistent across Trusted Root, SCEP, and VPN profiles

**Troubleshooting: VPN Profile Not Deployed**

**Android**
1. Check profile assignment to correct group
2. Verify device can sync (check LAST CHECK IN)
3. Verify Trusted Root and SCEP profiles deployed
4. If CertificateSelector cannot find matching cert, VPN profile skipped
   - Log: "Waiting for required certificates for vpn profile"
   - Check Any Purpose EKU mismatch between SCEP profile and CA template
5. Verify AnyConnect External Control option enabled

**iOS**
1. Check profile assignment
2. Verify sync capability
3. Check Management Profile for VPN profile
4. Console/device logs for installation details

**Windows**
1. Check profile assignment
2. Verify sync
3. Download MDM Diagnostic Information log
4. Check Event Viewer: DeviceManagement-Enterprise-Diagnostic-Provider Admin/Debug logs

**Troubleshooting: VPN Deployed But Cannot Connect**
- Usually not an Intune issue
- Try manual connection with same certificate criteria
... (详见原始草稿)

### Phase 4: Ms Tunnel Log Collection
> 来源: OneNote — [onenote-ms-tunnel-log-collection.md](../drafts/onenote-ms-tunnel-log-collection.md)

**MS Tunnel Gateway Log Collection (Linux)**
**1. Verbose Server Logs (journalctl)**
```bash
```
- For Red Hat Linux: use provided shell script

**2. Intune Portal Upload (Online Servers)**
- Reference: [Monitor Microsoft Tunnel VPN](https://learn.microsoft.com/en-us/mem/intune/protect/microsoft-tunnel-monitor#easy-upload-of-diagnostic-logs-for-tunnel-servers)

**3. Access Logs**

**Log Format**
```
```
```
```

**Enable Access Logging**
1. Set `TRACE_SESSIONS=1` in `/etc/mstunnel/env.sh`
2. Set `TRACE_SESSIONS=2` to include DNS connection logging
3. Run `mst-cli server restart`

**Source**
- OneNote: Mooncake POD Support Notebook > Intune > Linux > Gather Access Log + Gather MS Tunnel Gateway verbose log

### Phase 5: Ms Tunnel Network Trace
> 来源: OneNote — [onenote-ms-tunnel-network-trace.md](../drafts/onenote-ms-tunnel-network-trace.md)

**MS Tunnel VPN Network Trace per User Session**
**Prerequisites**
- Access to MS Tunnel Gateway server(s) (Red Hat Linux)
- Affected user's Object ID from Entra ID portal

**Method 1: mst-cli (Preferred)**
1. Get user Object ID from Microsoft Entra ID portal
2. User connects to MTG VPN (confirm Connected state)
3. On **each** MTG server, find the server handling the connection:
   ```bash
   ```
4. Locate IPv4 address from output
5. Start capture:
   ```bash
   ```

**Method 2: Manual (if mst-cli has issues)**
1. Get user Object ID
2. Get client IP:
   ```bash
   ```
3. Enter the container:
   ```bash
   ```
4. Find the VPN sub-interface:
   ```bash
   ```
5. Capture traffic:
   ```bash
   ```
   ```bash
   ```

**Reference**
- [Red Hat Enterprise Linux 8 Documentation](https://access.redhat.com/documentation/zh-cn/red_hat_enterprise_linux/8)

**Source**
- OneNote: Linux/Capture Network Trace based on User Session

### Phase 6: Windows Vpn Custom Policy
> 来源: OneNote — [onenote-windows-vpn-custom-policy.md](../drafts/onenote-windows-vpn-custom-policy.md)

**Windows VPN Custom OMA-URI Policy Guide**
**Custom OMA-URI for VPN**
**Always On VPN Example**
**VPN Profile Storage Paths**
**Device Tunnel**
```
```
**User VPN Profile**
```
```
**References**
- [Create VPN profile via Custom OMA-URIs](https://blogs.technet.microsoft.com/tune_in_to_windows_intune/2015/01/30/create-a-vpn-profile-using-microsoft-intune-standalone-via-custom-oma-uris/)
- [Configuring custom Windows 10 VPN profiles using Intune](https://technofocusin.wordpress.com/2015/08/07/configuring-custom-windows-10-vpn-profiles-using-intune/)

---

## 已知问题速查

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
