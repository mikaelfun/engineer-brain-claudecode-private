# Networking VPN Gateway — 综合排查指南

**条目数**: 18 | **草稿融合数**: 7 | **Kusto 查询融合**: 1
**来源草稿**: [mslearn-azure-vpn-client-troubleshoot.md], [mslearn-p2s-vpn-troubleshoot.md], [mslearn-s2s-vpn-intermittent-disconnect.md], [mslearn-s2s-vpn-troubleshoot.md], [mslearn-vpn-bgp-troubleshoot.md], [mslearn-vpn-diagnostic-logs.md], [mslearn-vpn-throughput-validation.md]
**Kusto 引用**: [vpn-tunnel.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 证书与密钥
> 来源: mslearn + onenote

1. **P2S VPN client gets Error 798: A certificate could not be found that can be used with this Extensible Authentication Pro**
   - 根因: Root and client certificates created with Windows SDK 7.0 store root cert in Personal store. Win8/2012 and newer require root cert in Trusted Root Certificate Authority store, but SDK 7.0 certs don't auto-install there.
   - 方案: Use Windows SDK 7.1A or later to generate root and client certificates. Certs created with 7.1A will auto-install root cert to Trusted Root CA store on Win8+ clients when installing the client cert (.pfx).
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/5.2[VPN] VPN FAQ.md]`

2. **P2S VPN Error 798 - A certificate could not be found that can be used with this Extensible Authentication Protocol**
   - 根因: Client certificate (.pfx) not installed in Current User Personal Certificates store, or root certificate (.cer) not in Local Computer Trusted Root Certification Authorities.
   - 方案: Open certmgr.msc. Verify AzureClient.pfx in Current User Personal Certificates, AzureRoot.cer in Local Computer Trusted Root CA. Re-import if missing. Do NOT enable strong private key protection when importing.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

3. **P2S VPN Error 0x80090326 - The message received was unexpected or badly formatted**
   - 根因: Root certificate public key not uploaded to Azure VPN gateway, key is corrupted/expired, or UDR with default route 0.0.0.0/0 on GatewaySubnet disrupts tunnel establishment.
   - 方案: 1) Remove UDR on GatewaySubnet. 2) Check root cert in Azure portal VPN gateway Point-to-site Root certificates. 3) Delete and re-upload root cert if revoked/expired. 4) Re-download VPN client package.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

4. **P2S VPN Error 0x80092013 - revocation function unable to check revocation, revocation server offline**
   - 根因: Client cannot reach CRL endpoints crl3.digicert.com and crl4.digicert.com. Proxy server blocks direct HTTP access or edge firewall denies non-proxied requests.
   - 方案: Configure proxy to allow access to CRL URLs. Whitelist crl3.digicert.com and crl4.digicert.com on edge firewall. Ensure system proxy is set correctly for VPN client process.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

5. **VPN Gateway digital certificate authentication failures - certificate expired, invalid, missing private key, duplicate, **
   - 根因: Root/intermediate certificate issues: expired certificate, certificate contains private key (only public key allowed), duplicate entries, invalid X.509 format, chain creation failure, or outbound certificate missing RSA private key / insufficient key length.
   - 方案: 1) Replace expired certificates with valid ones. 2) Use only public key portion for root certs. 3) Remove duplicate entries. 4) Verify X.509 format. 5) Ensure outbound cert has RSA private key of required length. 6) Ensure outbound cert has both client and server authentication in EKU. 7) Max 5 certs in chain (root + intermediate).
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-digital-certificate-authentication)`

6. **VPN Gateway managed identity or authentication type misconfiguration - wrong identity type, multiple identities, or PSK/**
   - 根因: Using non-UserAssigned identity type (only UserAssigned supported), assigning multiple identities (only one allowed), CertificateAuthentication set when using PSK auth, SharedKey set when using cert auth, or trying to delete identity still in use by connection.
   - 方案: 1) Use only UserAssigned identity type. 2) Assign only one identity per gateway. 3) Remove CertificateAuthentication when using PSK. 4) Remove SharedKey/SharedKeyKeyvaultId when using cert auth. 5) Remove identity from connections before deleting it. 6) VpnGw1+ required for managed identity.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-digital-certificate-authentication)`

7. **macOS P2S IKEv2 VPN connection fails using native macOS VPN client - unable to establish tunnel**
   - 根因: Incorrect VPN settings on macOS: Server Address not full FQDN with cloudapp.net, Remote ID not matching Server Address, Local ID not matching client certificate Subject, or wrong auth method.
   - 方案: Verify: Server Address=full FQDN with cloudapp.net, Remote ID=same as Server Address, Local ID=client cert Subject, Auth=Certificate. Requires macOS 10.11+. Debug with Wireshark filter isakmp to check SA proposal match.
   `[结论: 🔵 5.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-point-to-site-osx-ikev2)`

### Phase 2: 配置问题
> 来源: mslearn + onenote

1. **VPN tunnel IKEv2 rekey issues or confusion about SA lifetime mismatch between Azure VPN Gateway and customer device**
   - 根因: IKEv2 phase1 SA lifetime is local concept - mismatched values do NOT prevent tunnel formation. Peer with lower lifetime initiates rekey via CREATE_CHILD_SA at (lifetime/2 +/- jitter). Azure VPN GW uses fixed 28800s.
   - 方案: SA lifetime mismatch is acceptable by design. If customer sets lower lifetime (e.g. 120s on Cisco CSR), their device always initiates rekey. Verify in WFPdiag logs for CREATE_CHILD_SA messages.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/5.3[NET]Regarding IKEv2 phase1 SA lifetime.md]`

2. **S2S VPN connection suddenly stops working and cannot reconnect - tunnel was previously functional**
   - 根因: Shared key (PSK) mismatch between Azure VPN gateway and on-premises VPN device after configuration changes on either side.
   - 方案: Compare keys: Azure portal > VPN Gateway > Connections > Authentication. PowerShell: Get-AzVirtualNetworkGatewayConnectionSharedKey. Verify on-prem device uses identical key. Also check Local Network Gateway IP matches on-prem device.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect)`

3. **S2S VPN intermittent disconnections - tunnel drops periodically and re-establishes**
   - 根因: Perfect Forward Secrecy (PFS) enabled on on-prem device with mismatched settings on Azure gateway. Also caused by on-prem device external IP included in Local Network definition creating routing loop.
   - 方案: 1) Disable PFS on on-prem device or match PFS settings on Azure IPsec policy. 2) Remove on-prem device external IP from Local Network address space. 3) Check health probe: https://<GatewayIP>:8081/healthprobe. 4) Reset gateway if needed.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect)`

4. **P2S VPN profile repeatedly deleted and recreated on Windows 11 causing disconnections during Intune sync**
   - 根因: Intune compares assigned VPN profile XML with device current profile. Windows regenerates XML with different formatting. Differences cause Intune to delete and re-provision profile.
   - 方案: Export working profile XML from device: Get-CimInstance -Namespace root/cimv2/mdm/dmmap -ClassName MDM_VPNv2_01, WriteAllText to file. Use Windows-generated XML as Intune profile to ensure format consistency.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

### Phase 3: 网络与路由
> 来源: mslearn + onenote

1. **Dynamic VPN tunnel only allows traffic through one local subnet when PFS is misconfigured**
   - 根因: Perfect Forward Secrecy (PFS) mismatch between Azure VPN Gateway and customer VPN device causes only partial subnet connectivity
   - 方案: Ensure PFS is either disabled on the customer VPN device OR enabled on both sides including the Azure Gateway. PFS setting must be consistent on both ends of the tunnel.
   `[结论: 🟢 8.5/10 — onenote] [MCVKB/5.2[VPN] VPN FAQ.md]`

2. **S2S VPN tunnel fails or drops - UDR or NSG on GatewaySubnet blocks IPsec/IKE traffic**
   - 根因: User-defined routes or NSGs on GatewaySubnet redirect or block VPN tunnel traffic. Any routing/filtering on GatewaySubnet disrupts IPsec/IKE negotiations.
   - 方案: Remove UDR and NSG from GatewaySubnet. Test connectivity. If UDR/NSG needed, ensure UDP 500, 4500 and ESP protocol not affected. Never route 0.0.0.0/0 away from GatewaySubnet.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect)`

3. **S2S VPN policy-based gateway traffic not flowing despite tunnel connected - traffic selector mismatch**
   - 根因: Policy-based VPN requires exact subnet match between Azure VNet address spaces and on-prem definitions. Any mismatch causes traffic selectors to fail silently.
   - 方案: Verify VNet address spaces match on-prem remote network definitions exactly. Local Network Gateway subnets must match on-prem local definitions exactly. Consider migrating to route-based gateway for flexible routing.
   `[结论: 🟢 8.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect)`

4. **Point-to-site VPN clients cannot reach spoke VNet resources after establishing or changing VNet peering in hub-spoke top**
   - 根因: Point-to-site VPN clients cache routes at connection time. When VNet peering is established or modified, the P2S client package does not automatically pick up new routes to spoke virtual networks.
   - 方案: After establishing or changing VNet peering, download and reinstall the point-to-site client package so P2S clients get updated routes. Configure Allow gateway transit on hub VNet and Use remote gateways on spoke VNet.
   `[结论: 🟢 7.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues)`

### Phase 4: 版本与兼容
> 来源: mslearn

1. **P2S IKEv2 VPN remote server not responding on Windows 10/Server 2016 - connection cannot be established**
   - 根因: Windows version lacks IKE fragmentation support. Without specific KB updates and registry key, IKEv2 connections fail when large IKE packets cannot be fragmented.
   - 方案: Install KB: Win Server 2016/Win10 1607=KB4057142, Win10 1703=KB4057144, Win10 1709=KB4089848. Set registry HKLM SYSTEM CurrentControlSet Services RasMan IKEv2 DisableCertReqPayload=1 (DWORD). Pre-Win10 must use SSTP.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

### Phase 5: 已知问题与限制
> 来源: mslearn

1. **P2S VPN connected but cannot access SMB network file shares - Kerberos authentication fails over VPN**
   - 根因: VPN client connects from Internet, cannot reach domain controller for Kerberos. Windows caches domain creds and forces Kerberos over NTLM. Without DC access, KDC_ERR_C_PRINCIPAL_UNKNOWN returned.
   - 方案: Disable domain credential caching: Set registry HKLM SYSTEM CurrentControlSet Control Lsa DisableDomainCreds=1 to force NTLM fallback. Or ensure DC is reachable over VPN tunnel.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

### Phase 6: 权限与认证
> 来源: mslearn

1. **P2S VPN Error 812 - connection prevented because of policy configured on RAS/VPN server (RADIUS)**
   - 根因: RADIUS server used for VPN authentication has incorrect settings: NAS port type, network policy, or shared secret mismatch between Azure VPN Gateway and RADIUS server.
   - 方案: Verify RADIUS config: correct shared secret, NAS port type=Virtual (VPN), network policy matches VPN client attributes. Check Azure MFA Server integration if using multi-factor.
   `[结论: 🔵 6.0/10 — mslearn] [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems)`

## Kusto 查询模板

`[工具: Kusto skill — vpn-tunnel.md]`
→ 详见 `.claude/skills/kusto/networking/references/queries/vpn-tunnel.md`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | P2S VPN client gets Error 798: A certificate could not be... | Root and client certificates created with Windo... | Use Windows SDK 7.1A or later to generate root ... | 🟢 9.5 | [MCVKB/5.2[VPN] VPN FAQ.md] |
| 2 | VPN tunnel IKEv2 rekey issues or confusion about SA lifet... | IKEv2 phase1 SA lifetime is local concept - mis... | SA lifetime mismatch is acceptable by design. I... | 🟢 9.5 | [MCVKB/5.3[NET]Regarding IKEv2 phase1 SA lifetime.md] |
| 3 | Dynamic VPN tunnel only allows traffic through one local ... | Perfect Forward Secrecy (PFS) mismatch between ... | Ensure PFS is either disabled on the customer V... | 🟢 8.5 | [MCVKB/5.2[VPN] VPN FAQ.md] |
| 4 | S2S VPN connection suddenly stops working and cannot reco... | Shared key (PSK) mismatch between Azure VPN gat... | Compare keys: Azure portal > VPN Gateway > Conn... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect) |
| 5 | S2S VPN tunnel fails or drops - UDR or NSG on GatewaySubn... | User-defined routes or NSGs on GatewaySubnet re... | Remove UDR and NSG from GatewaySubnet. Test con... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect) |
| 6 | S2S VPN intermittent disconnections - tunnel drops period... | Perfect Forward Secrecy (PFS) enabled on on-pre... | 1) Disable PFS on on-prem device or match PFS s... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect) |
| 7 | S2S VPN policy-based gateway traffic not flowing despite ... | Policy-based VPN requires exact subnet match be... | Verify VNet address spaces match on-prem remote... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect) |
| 8 | Point-to-site VPN clients cannot reach spoke VNet resourc... | Point-to-site VPN clients cache routes at conne... | After establishing or changing VNet peering, do... | 🟢 7.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues) |
| 9 | P2S VPN Error 798 - A certificate could not be found that... | Client certificate (.pfx) not installed in Curr... | Open certmgr.msc. Verify AzureClient.pfx in Cur... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 10 | P2S VPN Error 0x80090326 - The message received was unexp... | Root certificate public key not uploaded to Azu... | 1) Remove UDR on GatewaySubnet. 2) Check root c... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 11 | P2S IKEv2 VPN remote server not responding on Windows 10/... | Windows version lacks IKE fragmentation support... | Install KB: Win Server 2016/Win10 1607=KB405714... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 12 | P2S VPN connected but cannot access SMB network file shar... | VPN client connects from Internet, cannot reach... | Disable domain credential caching: Set registry... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 13 | P2S VPN Error 0x80092013 - revocation function unable to ... | Client cannot reach CRL endpoints crl3.digicert... | Configure proxy to allow access to CRL URLs. Wh... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 14 | P2S VPN Error 812 - connection prevented because of polic... | RADIUS server used for VPN authentication has i... | Verify RADIUS config: correct shared secret, NA... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 15 | P2S VPN profile repeatedly deleted and recreated on Windo... | Intune compares assigned VPN profile XML with d... | Export working profile XML from device: Get-Cim... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 16 | VPN Gateway digital certificate authentication failures -... | Root/intermediate certificate issues: expired c... | 1) Replace expired certificates with valid ones... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-digital-certificate-authentication) |
| 17 | VPN Gateway managed identity or authentication type misco... | Using non-UserAssigned identity type (only User... | 1) Use only UserAssigned identity type. 2) Assi... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-digital-certificate-authentication) |
| 18 | macOS P2S IKEv2 VPN connection fails using native macOS V... | Incorrect VPN settings on macOS: Server Address... | Verify: Server Address=full FQDN with cloudapp.... | 🔵 5.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-point-to-site-osx-ikev2) |
