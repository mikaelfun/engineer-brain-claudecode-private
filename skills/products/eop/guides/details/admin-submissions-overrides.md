# EOP 管理员提交与第三方网关覆盖 - Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: mslearn-admin-submissions-workflow.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: 远程服务器证书链中使用了不安全的签名算法（MD5 或 MD2），启用 TLS 1.2
> Source: mslearn

**Symptom**: 无法与远程邮件服务器建立 TLS 连接，Exchange Server 消息队列中邮件处于 Retry 状态
**Root Cause**: 远程服务器证书链中使用了不安全的签名算法（MD5 或 MD2），启用 TLS 1.2 后 Exchange 在 TLS 协商中检测到不安全算法导致协商失败

1. 更新远程邮件服务器证书使用安全签名算法（如 SHA-256）。临时方案：配置远程服务器不通告 TLS（但传输将不加密）

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [MS Learn]]`

### Phase 2: 组织未配置 Partner inbound connector 的
> Source: mslearn

**Symptom**: MX 指向第三方过滤服务但未锁定 M365 入站，外部邮件可直接绕过第三方过滤到达 Exchange Online
**Root Cause**: 组织未配置 Partner inbound connector 的 RestrictDomainsToCertificate 或 RestrictDomainsToIPAddresses 参数锁定入站邮件路径，攻击者可绕过第三方过滤服务直接向 M365 MX 记录投递邮件

1. 1) 创建 Partner 类型 inbound connector，设置 RestrictDomainsToCertificate=$true + TlsSenderCertificateName（推荐）或 RestrictDomainsToIPAddresses=$true + SenderIpAddresses
2. 2) 在该 connector 上启用 Enhanced Filtering for Connectors
3. 3) 如第三方服务支持 ARC sealing，将其配置为 Trusted ARC sealer
4. 4) 如第三方修改邮件且不支持 ARC，在 Spoof Intelligence 中创建 allow entries for spoofed senders
5. 5) 注意 OnPremises 和 Partner connector 可共存

> :warning: 21Vianet: Not applicable

`[Score: 🔵 6.5/10 - [MS Learn]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| 无法与远程邮件服务器建立 TLS 连接，Exchange Server 消息队列中邮件处于 Retry 状态 | 远程服务器证书链中使用了不安全的签名算法（MD5 或 MD2），启用 TLS 1.2 | -> Phase 1 |
| MX 指向第三方过滤服务但未锁定 M365 入站，外部邮件可直接绕过第三方过滤到达 Exchange Online | 组织未配置 Partner inbound connector 的 | -> Phase 2 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | 无法与远程邮件服务器建立 TLS 连接，Exchange Server 消息队列中邮件处于 Retry 状态 | 远程服务器证书链中使用了不安全的签名算法（MD5 或 MD2），启用 TLS 1.2 后 Exchange 在 T... | 更新远程邮件服务器证书使用安全签名算法（如 SHA-256）。临时方案：配置远程服务器不通告 TLS（但传输将不加密） | 🔵 7.5 | [MS Learn] |
| 2 | MX 指向第三方过滤服务但未锁定 M365 入站，外部邮件可直接绕过第三方过滤到达 Exchange Online | 组织未配置 Partner inbound connector 的 RestrictDomainsToCertif... | 1) 创建 Partner 类型 inbound connector，设置 RestrictDomainsToCertificate=$true + Tl... | 🔵 6.5 | [MS Learn] |
