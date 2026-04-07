# Disk TLS, Certificates & Security — 排查速查

**来源数**: 5 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 3des, asc, audit, cipher-suite, client-ip, false-positive, ipv4, ipv6, nrp, private-endpoint

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Vulnerability scan detects legacy cipher suite (3DES EDE CBC / TLS_RSA_WITH_3DES_EDE_CBC_SHA) on storage account private | Azure Storage enforces TLS version at HTTP application layer, not TCP/TLS network layer. Port scanni | Expected behavior - safe to ignore scan result. With TLS 1.2 enforced, any request using insecure TLS version gets HTTP  | 🟢 9 | [MCVKB] |
| 2 | Cannot identify client IP for storage audit: client behind private link shows IPv6 address in Jarvis logs | Private Link or Service Endpoint translates client IP to IPv6. Mapping back requires cross-referenci | Step 1: Get client IPv6 from Jarvis. Step 2: ASC Storage Account Tools convert IPv6 to IPv4. Step 3: Query NRP Geneva 29 | 🟢 9 | [MCVKB] |
| 3 | When attempting to add a Cloud Witness to a Windows Server 2016 Failover Cluster with TLS 1.2 enabled on the Storage Acc | In several scenarios, SSL 3.0, TLS 1.0, or TLS 1.1 are being used in Azure Storage Account or SQL Se | Enable TLS 1.2: Open an elevated PowerShell session. Run the following command to enable TLS 1.2: [Net.ServicePointManag | 🔵 7.5 | [KB] |
| 4 | Imagine a scenario where an administrator operates a legacy website that requires an ActiveX control for functionality.  | The issue arises because Windows 8.1, Windows Server 2012 R2, Windows 10, Windows Server 2016, and l | To enforce TLS 1.0, TLS 1.1, and TLS 1.2, verify the value of the DefaultSecureProtocols registry setting. For example:  | 🔵 7.5 | [KB] |
| 5 | RD Connection broker is taking time to show the RDSMI page means the deployment properties | Customer has HA environment where 2 CB are configured and both the CBs are facing the same issue and | All communication on ipv6 failing and retry on ipv4 is getting connected. &nbsp; Action plan: &nbsp; Review WINRM listen | 🔵 7.5 | [KB] |

## 快速排查路径

1. Vulnerability scan detects legacy cipher suite (3DES EDE CBC / TLS_RSA_WITH_3DES → Expected behavior - safe to ignore scan result `[来源: onenote]`
2. Cannot identify client IP for storage audit: client behind private link shows IP → Step 1: Get client IPv6 from Jarvis `[来源: onenote]`
3. When attempting to add a Cloud Witness to a Windows Server 2016 Failover Cluster → Enable TLS 1 `[来源: contentidea-kb]`
4. Imagine a scenario where an administrator operates a legacy website that require → To enforce TLS 1 `[来源: contentidea-kb]`
5. RD Connection broker is taking time to show the RDSMI page means the deployment  → All communication on ipv6 failing and retry on ipv4 is getting connected `[来源: contentidea-kb]`
