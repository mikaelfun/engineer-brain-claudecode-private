# EOP 21Vianet/Gallatin 功能差异与限制 — 排查工作流

**来源草稿**: onenote-21v-eop-feature-gaps.md, onenote-21v-eop-readiness-portals.md
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 21V EOP 功能可用性确认
> 来源: onenote-21v-eop-feature-gaps.md | 适用: Mooncake ✅

### 完全不可用功能
- Built-in Protection (默认 Safe Attachments/Links)
- Safe Attachments / Safe Links
- Tenant Allow/Block Lists (TABL)
- Advanced Delivery
- Threat Explorer / Campaigns / Threat Trackers
- Attack Simulation Training
- Automated Investigation & Response (AIR)
- Client-side Report Phishing/Junk 按钮

### 部分可用/受限功能
- Anti-spam/Anti-phishing: 无 ZAP, 无 Spoof Intelligence, 无 Impersonation detection
- Trusted ARC Sealers: 不可添加
- Quarantine Policies: 自定义通知受限
- User Reported Settings: UI 可见但后端不可用

### 完全可用功能
- Anti-malware policies
- Anti-spam policies (基础)
- Anti-phishing policies (基础，无 impersonation)
- Enhanced Filtering for Connectors
- DKIM 配置
- Connection filter policies
- Mail flow rules (ETR)
- Message trace (EAC portal)
- Quarantine management

---

## Scenario 2: 21V Portal 与工具
> 来源: onenote-21v-eop-readiness-portals.md | 适用: Mooncake ✅

### Portal URLs
| Portal | URL |
|--------|-----|
| Security (SCC/MDO) | https://security.microsoftonline.cn/ |
| Exchange Admin Center | https://admin.exchange.microsoftonline.cn/ |
| Quarantine | https://security.microsoftonline.cn/quarantine?viewid=Email |

### PowerShell 连接
```powershell
Connect-ExchangeOnline -ExchangeEnvironmentName o365china
```

### 注意事项
- Assist 365 Spam Verdict Reason 诊断不支持 21V
- Tenant Explorer 不可用
- Workaround: 使用 PowerShell, EAC message trace, message header analysis
