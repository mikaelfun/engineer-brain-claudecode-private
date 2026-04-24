# Networking 排查指南索引

| # | Topic | Title | Entries | Fusion | Score | Keywords | Sources | Files |
|---|-------|-------|---------|--------|-------|----------|---------|-------|
| 1 | dns | Azure DNS 与 Private DNS | 59 | ✅ | 🔵 6.8 | ip-address, rfc1035, public-dns, VPN, cross-subscription | AW ML ON | [speed](dns.md) / [detail](details/dns.md) |
| 2 | appgw-general | AppGW 通用问题 | 39 | ✅ | 🔵 6.6 | udr, workaround, autoscale, ping-pong, dependency | AW ON | [speed](appgw-general.md) / [detail](details/appgw-general.md) |
| 3 | expressroute | ExpressRoute | 39 | ✅ | 🔵 6.4 | udr, bfd, hsrp, auto-validation, gateway-tenant | AW ML ON | [speed](expressroute.md) / [detail](details/expressroute.md) |
| 4 | bastion | Azure Bastion | 32 | ✅ | 🔵 6.7 | premium-sku, serial-console, tls, udr, linux | AW | [speed](bastion.md) / [detail](details/bastion.md) |
| 5 | misc-networking | 其他网络问题 | 29 | ✅ | 🔵 6.4 | listener, negotiation-timeout, 13868, 13824, managed-identity | AW KB ML ON | [speed](misc-networking.md) / [detail](details/misc-networking.md) |
| 6 | agc-general | AGC 部署与配置 | 24 | ✅ | 🔵 6.0 | grpc, backend-health, kubectl, gateway-api, /24 | AW | [speed](agc-general.md) / [detail](details/agc-general.md) |
| 7 | appgw-backend-health | AppGW 后端健康与 502 | 24 | ✅ | 🔵 6.8 | sni-mismatch, backend-health, unknown-status, tls, backend-unhealthy | AW ON | [speed](appgw-backend-health.md) / [detail](details/appgw-backend-health.md) |
| 8 | appgw-keyvault-cert | AppGW Key Vault 与证书 | 20 | ✅ | 🔵 6.6 | unused-certificate, firewall, deleted-certificate, listener, routing-rule | AW ON | [speed](appgw-keyvault-cert.md) / [detail](details/appgw-keyvault-cert.md) |
| 9 | vpn | VPN Gateway | 18 | ✅ | 🔵 5.6 | sdk, VPN, FQDN, hub-spoke, managed-identity | ML ON | [speed](vpn.md) / [detail](details/vpn.md) |
| 10 | appgw-waf | Application Gateway WAF | 14 | ✅ | 🔵 6.9 | owasp, bot-protection, file-upload, json-parsing, 403 | AW ON | [speed](appgw-waf.md) / [detail](details/appgw-waf.md) |
| 11 | appgw-tls-mutual-auth | AppGW TLS 与双向认证 | 13 | ✅ | 🔵 6.8 | tls, client-cert, 3des, 403, legacy | AW ON | [speed](appgw-tls-mutual-auth.md) / [detail](details/appgw-tls-mutual-auth.md) |
| 12 | ddos | DDoS Protection | 13 | ✅ | 🔵 6.2 | wan-edge, overage, firewall, default-outbound-access, billing | AW ON | [speed](ddos.md) / [detail](details/ddos.md) |
| 13 | vnet-connectivity | VNet 连接与基础设施 | 11 | ✅ | 🔵 6.4 | storage-firewall, udr, file-share, address-space, vnet | AW ML ON | [speed](vnet-connectivity.md) / [detail](details/vnet-connectivity.md) |
| 14 | appgw-redirect-rewrite | AppGW 重定向与重写规则 | 8 | — | 🔵 6.6 | location-header, appgateway, empty-path, RFC-3986, path-routing | AW | [speed](appgw-redirect-rewrite.md) / [detail](details/appgw-redirect-rewrite.md) |
| 15 | appgw-diagnostics | AppGW 诊断与日志 | 8 | ✅ | 🔵 6.8 | listener, missing-logs, azurediagnostics, false-positive, resource-specific | AW | [speed](appgw-diagnostics.md) / [detail](details/appgw-diagnostics.md) |
| 16 | appgw-http-errors | AppGW HTTP 4xx 错误 | 7 | — | 🔵 6.5 | tcp-retransmit, listener, client-request, http-408, packet-drop | AW | [speed](appgw-http-errors.md) / [detail](details/appgw-http-errors.md) |
| 17 | appgw-failed-state-crud | AppGW 失败状态与 CRUD | 7 | ✅ | 🔵 6.6 | udr, expressroute, custom-error-page, ValidateCustomErrorBlobAsync, auth-cert | AW | [speed](appgw-failed-state-crud.md) / [detail](details/appgw-failed-state-crud.md) |
| 18 | nsg-network-watcher | NSG 与 Network Watcher | 7 | ✅ | 🔵 5.9 | explorer, flow-log, security-rule, tool, vnet | ML ON | [speed](nsg-network-watcher.md) / [detail](details/nsg-network-watcher.md) |
| 19 | agc-waf | AGC WAF 策略与规则 | 5 | ✅ | 🔵 6.5 | transient, waf, deletion, js-challenge, owasp | AW | [speed](agc-waf.md) / [detail](details/agc-waf.md) |
| 20 | appgw-apim | AppGW + APIM 集成 | 4 | — | 🔵 6.8 | appgateway, port-4290, nsg, hostname, CNAME | AW | [speed](appgw-apim.md) / [detail](details/appgw-apim.md) |
| 21 | appgw-5xx-timeout | AppGW 5xx 与超时 | 3 | — | 🔵 6.8 | collab, websocket, http-5xx, app-service, timeout | AW | [speed](appgw-5xx-timeout.md) / [detail](details/appgw-5xx-timeout.md) |
| 22 | appgw-layer4 | AppGW Layer 4 代理 | 2 | ✅ | 🔵 6.5 | application-gateway, mysql, handshake-failure, tcp, tls-proxy | AW | [speed](appgw-layer4.md) / [detail](details/appgw-layer4.md) |

最后更新: 2026-04-24
