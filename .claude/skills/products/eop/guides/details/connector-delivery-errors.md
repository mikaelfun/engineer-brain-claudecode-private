# EOP Connector 投递错误 (4xx/TLS/DNS) - Issue Details

**Entries**: 9 | **Type**: Quick Reference Only
**Generated**: 2026-04-07

---

### 1. EAC Insights 显示 Fix possible mail loop 告警，邮件在组织中形成路由循环

- **Root Cause**: 邮件路由配置错误导致循环。常见场景：mailbox forwarding rule 相互转发、connector 配置错误、accepted domain 类型设置不当
- **Solution**: 在 EAC Insights dashboard 中查看详情：1) 点击 View details 查看涉及的域名和循环消息数量；2) 检查最常见的 mail loop 场景；3) 根据推荐操作修复（通常涉及修正 connector、accepted domain 或 forwarding rule 配置）
- **Score**: 🔵 7.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 2. 通过 Connector 向 on-premises/partner 投递邮件失败，收到 450 4.4.312 DNS query failed

- **Root Cause**: DNS 查询 smart host IP 失败。可能原因：DNS 托管服务异常、域名过期导致 MX 记录无法解析、MX 记录刚变更但 DNS 缓存未更新
- **Solution**: 联系 DNS 托管服务商排查域名 DNS 问题。检查域名是否过期、MX 记录是否正确。如为 partner 组织问题则联系对方修复
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 3. 通过 Connector 投递邮件失败，收到 450 4.4.315 Connection timed out

- **Root Cause**: M365 无法连接到目标邮件服务器。可能原因：on-premises 服务器宕机、Connector smart host 设置错误导致连接到错误 IP
- **Solution**: 确认邮件流正常且 Connector 设置未变更。检查 on-premises 服务器运行状态。检查网络基础设施变更（如 ISP 变更导致公网 IP 变化）
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 4. 通过 Connector 投递邮件失败，收到 450 4.4.316 Connection refused

- **Root Cause**: 防火墙阻止了来自 M365 IP 的连接，或 on-premises 邮件环境已迁移至 M365 后 on-premises 服务器已关闭
- **Solution**: 若仍有 on-premises 邮箱：修改防火墙规则允许 M365 IP 通过 TCP 25 连接 on-premises 服务器。若已完全迁移：禁用/删除该 Connector，并将 accepted domain 从 Internal Relay 改为 Authoritative
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 5. 通过 Connector 投递邮件失败，收到 450 4.4.317 Cannot connect to remote server，目标服务器返回 Service not available

- **Root Cause**: 目标服务器返回即时错误或不满足连接要求。可能原因：服务器无法维持通信、Connector 配置要求 TLS 但目标服务器不支持 TLS
- **Solution**: 验证 on-premises 服务器上的 TLS 设置和证书。检查 Connector 中的 TLS 配置是否与目标服务器能力匹配
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 6. 通过 Connector 投递邮件失败，收到 450 4.4.318 Connection was closed abruptly

- **Root Cause**: M365 与 on-premises 通信中连接被突然关闭。可能原因：防火墙 SMTP 包检查规则异常、on-premises 服务器故障（挂起/崩溃/资源不足）、M365 与 on-premises 间网络问题
- **Solution**: 检查防火墙 SMTP packet examination 规则。检查 on-premises 服务器运行状态和系统资源。排查 M365 与 on-premises 间的网络连通性
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 7. 通过 Connector 投递邮件失败，收到 450 4.7.320 Certificate validation failed

- **Root Cause**: M365 验证目标邮件服务器证书失败。可能原因：证书过期、证书主题名称不匹配、证书已吊销或无效
- **Solution**: 修复目标服务器的证书（更新过期证书、修正主题名称匹配）或调整 Connector 中的 TLS/证书设置以使队列中的邮件能投递
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 8. 出站邮件延迟投递，Message trace 显示邮件状态为 Deferred/Queued

- **Root Cause**: 目标邮件服务器返回临时错误（connection timeout、connection refused、400 系列错误）导致 EOP 将邮件放入延迟队列
- **Solution**: 延迟邮件保留在队列中 1 天，前几次重试间隔 15 分钟，后续增加到最多 60 分钟。通信恢复后邮件按接收顺序自动投递。检查目标服务器可用性和网络连通性
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable

### 9. 配置了多个相同方向的 Connector 后邮件投递异常或不可预测

- **Root Cause**: 同一邮件流方向存在多个 Connector 时 EOP 可能匹配到错误的 Connector 导致路由异常。常见于 HCW 与手动创建的 Connector 冲突
- **Solution**: 在 EAC > Mail flow > Connectors 中检查重复 Connector，验证并启用所需 Connector，禁用或删除不需要的重复 Connector
- **Score**: 🔵 6.5/10 | **Source**: [MS Learn]
- **21Vianet**: Applicable
