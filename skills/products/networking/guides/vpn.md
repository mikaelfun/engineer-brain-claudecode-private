# Networking VPN Gateway — 排查速查

**来源数**: 2 | **21V**: 部分
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | P2S VPN client gets Error 798: A certificate could not be... | Root and client certificates created with Windo... | Use Windows SDK 7.1A or later to generate root ... | 🟢 9.5 | [MCVKB/5.2[VPN] VPN FAQ.md] |
| 2 📋 | VPN tunnel IKEv2 rekey issues or confusion about SA lifet... | IKEv2 phase1 SA lifetime is local concept - mis... | SA lifetime mismatch is acceptable by design. I... | 🟢 9.5 | [MCVKB/5.3[NET]Regarding IKEv2 phase1 SA lifetime.md] |
| 3 📋 | Dynamic VPN tunnel only allows traffic through one local ... | Perfect Forward Secrecy (PFS) mismatch between ... | Ensure PFS is either disabled on the customer V... | 🟢 8.5 | [MCVKB/5.2[VPN] VPN FAQ.md] |
| 4 📋 | S2S VPN connection suddenly stops working and cannot reco... | Shared key (PSK) mismatch between Azure VPN gat... | Compare keys: Azure portal > VPN Gateway > Conn... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect) |
| 5 📋 | S2S VPN tunnel fails or drops - UDR or NSG on GatewaySubn... | User-defined routes or NSGs on GatewaySubnet re... | Remove UDR and NSG from GatewaySubnet. Test con... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect) |
| 6 📋 | S2S VPN intermittent disconnections - tunnel drops period... | Perfect Forward Secrecy (PFS) enabled on on-pre... | 1) Disable PFS on on-prem device or match PFS s... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect) |
| 7 📋 | S2S VPN policy-based gateway traffic not flowing despite ... | Policy-based VPN requires exact subnet match be... | Verify VNet address spaces match on-prem remote... | 🟢 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-site-to-site-cannot-connect) |
| 8 📋 | Point-to-site VPN clients cannot reach spoke VNet resourc... | Point-to-site VPN clients cache routes at conne... | After establishing or changing VNet peering, do... | 🟢 7.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-peering-issues) |
| 9 📋 | P2S VPN Error 798 - A certificate could not be found that... | Client certificate (.pfx) not installed in Curr... | Open certmgr.msc. Verify AzureClient.pfx in Cur... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 10 📋 | P2S VPN Error 0x80090326 - The message received was unexp... | Root certificate public key not uploaded to Azu... | 1) Remove UDR on GatewaySubnet. 2) Check root c... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 11 📋 | P2S IKEv2 VPN remote server not responding on Windows 10/... | Windows version lacks IKE fragmentation support... | Install KB: Win Server 2016/Win10 1607=KB405714... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 12 📋 | P2S VPN connected but cannot access SMB network file shar... | VPN client connects from Internet, cannot reach... | Disable domain credential caching: Set registry... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 13 📋 | P2S VPN Error 0x80092013 - revocation function unable to ... | Client cannot reach CRL endpoints crl3.digicert... | Configure proxy to allow access to CRL URLs. Wh... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 14 📋 | P2S VPN Error 812 - connection prevented because of polic... | RADIUS server used for VPN authentication has i... | Verify RADIUS config: correct shared secret, NA... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 15 📋 | P2S VPN profile repeatedly deleted and recreated on Windo... | Intune compares assigned VPN profile XML with d... | Export working profile XML from device: Get-Cim... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-vpn-point-to-site-connection-problems) |
| 16 📋 | VPN Gateway digital certificate authentication failures -... | Root/intermediate certificate issues: expired c... | 1) Replace expired certificates with valid ones... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-digital-certificate-authentication) |
| 17 📋 | VPN Gateway managed identity or authentication type misco... | Using non-UserAssigned identity type (only User... | 1) Use only UserAssigned identity type. 2) Assi... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-digital-certificate-authentication) |
| 18 📋 | macOS P2S IKEv2 VPN connection fails using native macOS V... | Incorrect VPN settings on macOS: Server Address... | Verify: Server Address=full FQDN with cloudapp.... | 🔵 5.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/vpn-gateway-troubleshoot-point-to-site-osx-ikev2) |

## 快速排查路径
1. Use Windows SDK 7.1A or later to generate root and client certificates. Certs created with 7.1A will `[来源: onenote]`
2. SA lifetime mismatch is acceptable by design. If customer sets lower lifetime (e.g. 120s on Cisco CS `[来源: onenote]`
3. Ensure PFS is either disabled on the customer VPN device OR enabled on both sides including the Azur `[来源: onenote]`
4. Compare keys: Azure portal > VPN Gateway > Connections > Authentication. PowerShell: Get-AzVirtualNe `[来源: mslearn]`
5. Remove UDR and NSG from GatewaySubnet. Test connectivity. If UDR/NSG needed, ensure UDP 500, 4500 an `[来源: mslearn]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vpn.md#排查流程)
