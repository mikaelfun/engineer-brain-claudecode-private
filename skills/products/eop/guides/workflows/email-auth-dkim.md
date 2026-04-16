# EOP DKIM 签名验证失败与配置 — 排查工作流

**来源草稿**: ado-wiki-a-email-authentication-spf-dkim-dmarc.md, mslearn-email-authentication-troubleshoot.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: DKIM 验证失败 (no key / signature didn't verify / body hash)
> 来源: mslearn-email-authentication-troubleshoot.md | 适用: Mooncake ✅

### 排查步骤
1. 检查 Authentication-Results header 中的 DKIM 结果
   - `dkim=fail (no key for signature)` -> 公钥未发布到 DNS
   - `dkim=fail (signature didn't verify)` -> 签名后 header 被修改
   - `dkim=fail (body hash did not verify)` -> 邮件正文被修改
2. 针对不同失败原因:
   - **no key**: 发件人需发布 DKIM CNAME/TXT 记录到 DNS
   - **signature/body hash**: 中间服务修改了邮件 -> 配置 trusted ARC sealers 或避免修改
3. 检查 DKIM selector
   - 查看 DKIM-Signature header 中的 `s=` (selector) 和 `d=` (domain) 值
   - 验证 DNS 中对应 selector 的公钥是否存在

---

## Scenario 2: Exchange Online DKIM 签名配置
> 来源: ado-wiki-a-email-authentication-spf-dkim-dmarc.md | 适用: Mooncake ✅

### 排查步骤
1. 创建两个 CNAME 记录
   - `selector1._domainkey.contoso.com` -> `selector1-contoso-com._domainkey.contoso.onmicrosoft.com`
   - `selector2._domainkey.contoso.com` -> `selector2-contoso-com._domainkey.contoso.onmicrosoft.com`
2. 获取精确 CNAME 值
   ```powershell
   New-DkimSigningConfig -DomainName contoso.com -Enabled $True -WhatIf
   ```
3. 等待 DNS 传播 (10-60 分钟)
4. 启用 DKIM
   ```powershell
   New-DkimSigningConfig -DomainName contoso.com -Enabled $True
   ```
5. Hybrid 场景: 所有出站邮件需经 O365 路由，或在 on-prem 安装本地 DKIM agent 使用不同 selector (如 selector3)

---

## Scenario 3: DKIM CnameMissing 错误
> 来源: mslearn-email-authentication-troubleshoot.md | 适用: Mooncake ✅

### 排查步骤
1. 在 Defender portal 中检查 DKIM 配置状态
   - Portal 路径: Email & collaboration > Policies & rules > Threat policies > Email authentication settings > DKIM
2. 如显示 CnameMissing:
   - 验证 CNAME 记录已在 DNS 中正确发布
   - 确认 DNS 传播完成 (nslookup 检查)
3. Key rotation 问题:
   - DKIM 自动进行 key rotation
   - 确保 selector1 和 selector2 CNAME 都正确配置
