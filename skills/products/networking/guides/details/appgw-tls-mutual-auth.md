# Networking AppGW TLS 与双向认证 — 综合排查指南

**条目数**: 13 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-b-labbox-appgw-tls-proxy.md], [ado-wiki-c-tsg-appgw-tls-deprecation.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 证书与密钥
> 来源: ado-wiki + onenote

1. **Cannot read HTTPS/TLS encrypted traffic in Wireshark when troubleshooting Application Gateway or other Azure services**
   - 根因: TLS traffic is encrypted; Wireshark cannot decode without session keys. If cipher suite uses ECDHE/DHE (Diffie-Hellman), even private key will not decrypt.
   - 方案: 1) Set environment variable SSLKEYLOGFILE=C:\temp\sslkey.log to capture session keys. 2) In Wireshark Preferences > TLS > (Pre)-Master-Secret log filename, point to that file. 3) If cipher uses ECDHE/DHE, disable DH via Group Policy replacing with non-DH suites (TLS_RSA_WITH_AES_*). 4) gpupdate /force and restart.
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/10.23 [NET]How to decrypt the TLS_SSL traffic in W.md]`

2. **Cannot use both TLS 1.3 (Customv2) and legacy TLS policies (Custom) simultaneously on Application Gateway**
   - 根因: TLS 1.3 uses OpenSSL v1.1.1 (Customv2 policies) while older policies use OpenSSL v1.0.2 (Custom policies). Side-by-side installs of OpenSSL are not supported.
   - 方案: Migrate fully to Customv2 policies for TLS 1.3 support. Cannot mix Custom and Customv2 policy types on the same Application Gateway.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20TLS%201.3%20Support)`

3. **Backend connections not using TLS 1.3 on Application Gateway even though TLS 1.3 is configured on frontend**
   - 根因: By design, backend connections only support TLS 1.0-1.2. TLS 1.3 is supported only for frontend/listener connections (client to AppGW).
   - 方案: This is expected behavior. TLS 1.3 applies to frontend connections only. Backend server connections use TLS 1.0 minimum and up to TLS 1.2.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20TLS%201.3%20Support)`

4. **Mutual Authentication configuration fails with ApplicationGatewayTrustedClientCertificateDoesNotContainAnyCACertificate **
   - 根因: Customer uploaded only a leaf certificate without a CA certificate. CA cert must have BasicConstraints (OID 2.5.29.19) set to CA:TRUE.
   - 方案: Upload certificate chain including at least one CA cert (root cert). Leaf cert alone is not sufficient.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication)`

5. **Access logs show sslClientVerify FAILED:unable to verify the first certificate with HTTP 403 on mutual auth endpoint**
   - 根因: Client presents only the leaf certificate whose issuer is not trusted. Trusted certificate chain is incomplete.
   - 方案: Ensure complete trusted certificate chain (root + all intermediates) is uploaded to SSL Profile. Request client-side packet capture to verify TLS handshake.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication)`

6. **Mutual auth fails with Unable to verify the client certificate issuer when VerifyClientCertIssuerDN is enabled**
   - 根因: Issuer DN of client cert does not match any ClientCertificateIssuerDN extracted from uploaded trusted chains. Matching depends on chain depth.
   - 方案: Check ASC ValidatedCertData and ClientCertificateIssuerDN. For root->int->leaf: intermediate subject verified. For root->leaf: root subject. Multiple chains of different length: longer chain used.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication)`

7. **Mutual authentication fails because client certificate has expired**
   - 根因: Client certificate in SSL Profile has expired and needs renewal.
   - 方案: Portal: Open SSL Profile -> Upload renewed cert -> Remove old cert -> Save. PowerShell: Get-AzApplicationGateway -> Remove-AzApplicationGatewayTrustedClientCertificate -> Add new -> Set-AzApplicationGateway
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication)`

8. **sslClientVerify shows NONE in access logs when accessing mutual auth endpoint. Client connection not authenticated.**
   - 根因: Client does not send client certificate. Client-side not configured correctly to use client certs.
   - 方案: Check client-side cert setup: (1) verify certs installed on client, (2) test with OpenSSL, (3) verify browser cert selection. If strictEnforce=false, connection passes with empty auth status.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication)`

9. **Self-signed certificate uploaded to Application Gateway v2 listener fails validation or is rejected. Customer uses a sta**
   - 根因: Application Gateway v2 requires certificates to be part of a proper chain (Root CA + Leaf). A standalone self-signed certificate without a chain is not accepted by AppGW v2, unlike v1 which was more lenient.
   - 方案: Create a self-signed Root CA certificate, then generate a leaf certificate signed by that root. Bundle both into a PFX file with the private key. Method 1 (openssl): use separate root.cnf and leaf.cnf config files to generate root + leaf, bundle them, then create PFX. Method 2 (PowerShell): New-SelfSignedCertificate with -CertStoreLocation, create root with CA:TRUE extension, then create leaf with -Signer $rootCert.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCreate%20Self%20Signed%20Certs%20for%20use%20with%20Appgw)`

10. **上传SSL证书（PFX）到AppGW时失败，错误：Data too big for certificate <AppGW resource ID>/sslCertificates/<cert name>. Max data length s**
   - 根因: AppGW SSL证书有16384字节（16KB）的大小硬限制；文件系统显示的文件大小可能小于16KB，但Base64编码后的证书数据（$cert.Data.length）超过了16384字节
   - 方案: 在PowerShell/CloudShell中验证实际大小：(1) $cert=New-AzApplicationGatewaySslCertificate -Name <name>.pfx -CertificateFile <path>/<file>.pfx；(2) $cert.Data.length。若输出值>16384，证书过大无法上传。需减小证书大小（如移除多余的证书链条目）或重新生成更小的证书
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway)`

11. **AppGW证书操作（如openssl pkcs12）在使用OpenSSL 3.0.0+版本时失败，错误与RC2-40-CBC或3DES-SHA1加密算法有关**
   - 根因: OpenSSL 3.0.0起弃用了RC2-40-CBC等旧加密算法支持；Windows默认使用3DES-SHA1导出PFX，这些算法在OpenSSL 3.x+中需要额外的legacy provider flags才能处理
   - 方案: 在openssl命令中添加 -legacy 和 -provider-path 参数：openssl pkcs12 -info -nokeys -in cert.pfx -legacy -provider-path "C:\path\to\legacy.dll"。或者在Windows中导出PFX时改用AES256-SHA256加密（参考：https://learn.microsoft.com/en-us/windows-server/identity/ad-cs/export-certificate-private-key）
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway)`

12. **SSL grading sites (e.g. SSL Labs) flag Application Gateway for not supporting Forward Secrecy or Perfect Forward Secrecy**
   - 根因: Application Gateway default SSL/TLS policy prioritizes backward compatibility and includes cipher suites that do not use forward secrecy key exchange algorithms
   - 方案: Configure a newer predefined SSL policy or a custom policy with forward-secrecy-capable cipher suites: https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-ssl-policy-overview
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Expert%20Troubleshooting/Handling%20%22Penalty%20for%20not%20using%20forward%20secrecy%20(B)%22%20cases)`

13. **Application Gateway unable to write diagnostic logs to storage account**
   - 根因: Cipher suites misconfiguration affecting AppGW ability to connect to storage account over TLS
   - 方案: Configure proper TLS cipher suites per Microsoft docs. At minimum one required cipher suite must be present
   `[结论: 🟢 8.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshoot%20Application%20Gateway%20Missing%20Logs)`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot read HTTPS/TLS encrypted traffic in Wireshark when... | TLS traffic is encrypted; Wireshark cannot deco... | 1) Set environment variable SSLKEYLOGFILE=C:\te... | 🟢 9.5 | [MCVKB/10.23 [NET]How to decrypt the TLS_SSL traffic in W.md] |
| 2 | Cannot use both TLS 1.3 (Customv2) and legacy TLS policie... | TLS 1.3 uses OpenSSL v1.1.1 (Customv2 policies)... | Migrate fully to Customv2 policies for TLS 1.3 ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20TLS%201.3%20Support) |
| 3 | Backend connections not using TLS 1.3 on Application Gate... | By design, backend connections only support TLS... | This is expected behavior. TLS 1.3 applies to f... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20TLS%201.3%20Support) |
| 4 | Mutual Authentication configuration fails with Applicatio... | Customer uploaded only a leaf certificate witho... | Upload certificate chain including at least one... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 5 | Access logs show sslClientVerify FAILED:unable to verify ... | Client presents only the leaf certificate whose... | Ensure complete trusted certificate chain (root... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 6 | Mutual auth fails with Unable to verify the client certif... | Issuer DN of client cert does not match any Cli... | Check ASC ValidatedCertData and ClientCertifica... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 7 | Mutual authentication fails because client certificate ha... | Client certificate in SSL Profile has expired a... | Portal: Open SSL Profile -> Upload renewed cert... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 8 | sslClientVerify shows NONE in access logs when accessing ... | Client does not send client certificate. Client... | Check client-side cert setup: (1) verify certs ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 9 | Self-signed certificate uploaded to Application Gateway v... | Application Gateway v2 requires certificates to... | Create a self-signed Root CA certificate, then ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCreate%20Self%20Signed%20Certs%20for%20use%20with%20Appgw) |
| 10 | 上传SSL证书（PFX）到AppGW时失败，错误：Data too big for certificate <Ap... | AppGW SSL证书有16384字节（16KB）的大小硬限制；文件系统显示的文件大小可能小于... | 在PowerShell/CloudShell中验证实际大小：(1) $cert=New-AzA... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway) |
| 11 | AppGW证书操作（如openssl pkcs12）在使用OpenSSL 3.0.0+版本时失败，错误与RC2-4... | OpenSSL 3.0.0起弃用了RC2-40-CBC等旧加密算法支持；Windows默认使用... | 在openssl命令中添加 -legacy 和 -provider-path 参数：opens... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway) |
| 12 | SSL grading sites (e.g. SSL Labs) flag Application Gatewa... | Application Gateway default SSL/TLS policy prio... | Configure a newer predefined SSL policy or a cu... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Expert%20Troubleshooting/Handling%20%22Penalty%20for%20not%20using%20forward%20secrecy%20(B)%22%20cases) |
| 13 | Application Gateway unable to write diagnostic logs to st... | Cipher suites misconfiguration affecting AppGW ... | Configure proper TLS cipher suites per Microsof... | 🟢 8.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshoot%20Application%20Gateway%20Missing%20Logs) |
