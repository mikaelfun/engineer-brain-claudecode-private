# Networking AppGW TLS 与双向认证 — 排查速查

**来源数**: 2 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Cannot read HTTPS/TLS encrypted traffic in Wireshark when... | TLS traffic is encrypted; Wireshark cannot deco... | 1) Set environment variable SSLKEYLOGFILE=C:\te... | 🟢 9.5 | [MCVKB/10.23 [NET]How to decrypt the TLS_SSL traffic in W.md] |
| 2 📋 | Cannot use both TLS 1.3 (Customv2) and legacy TLS policie... | TLS 1.3 uses OpenSSL v1.1.1 (Customv2 policies)... | Migrate fully to Customv2 policies for TLS 1.3 ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20TLS%201.3%20Support) |
| 3 📋 | Backend connections not using TLS 1.3 on Application Gate... | By design, backend connections only support TLS... | This is expected behavior. TLS 1.3 applies to f... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20TLS%201.3%20Support) |
| 4 📋 | Mutual Authentication configuration fails with Applicatio... | Customer uploaded only a leaf certificate witho... | Upload certificate chain including at least one... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 5 📋 | Access logs show sslClientVerify FAILED:unable to verify ... | Client presents only the leaf certificate whose... | Ensure complete trusted certificate chain (root... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 6 📋 | Mutual auth fails with Unable to verify the client certif... | Issuer DN of client cert does not match any Cli... | Check ASC ValidatedCertData and ClientCertifica... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 7 📋 | Mutual authentication fails because client certificate ha... | Client certificate in SSL Profile has expired a... | Portal: Open SSL Profile -> Upload renewed cert... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 8 📋 | sslClientVerify shows NONE in access logs when accessing ... | Client does not send client certificate. Client... | Check client-side cert setup: (1) verify certs ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Mutual%20Authentication) |
| 9 📋 | Self-signed certificate uploaded to Application Gateway v... | Application Gateway v2 requires certificates to... | Create a self-signed Root CA certificate, then ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FCreate%20Self%20Signed%20Certs%20for%20use%20with%20Appgw) |
| 10 📋 | 上传SSL证书（PFX）到AppGW时失败，错误：Data too big for certificate <Ap... | AppGW SSL证书有16384字节（16KB）的大小硬限制；文件系统显示的文件大小可能小于... | 在PowerShell/CloudShell中验证实际大小：(1) $cert=New-AzA... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway) |
| 11 📋 | AppGW证书操作（如openssl pkcs12）在使用OpenSSL 3.0.0+版本时失败，错误与RC2-4... | OpenSSL 3.0.0起弃用了RC2-40-CBC等旧加密算法支持；Windows默认使用... | 在openssl命令中添加 -legacy 和 -provider-path 参数：opens... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway) |
| 12 📋 | SSL grading sites (e.g. SSL Labs) flag Application Gatewa... | Application Gateway default SSL/TLS policy prio... | Configure a newer predefined SSL policy or a cu... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Expert%20Troubleshooting/Handling%20%22Penalty%20for%20not%20using%20forward%20secrecy%20(B)%22%20cases) |
| 13 📋 | Application Gateway unable to write diagnostic logs to st... | Cipher suites misconfiguration affecting AppGW ... | Configure proper TLS cipher suites per Microsof... | 🟢 8.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshoot%20Application%20Gateway%20Missing%20Logs) |

## 快速排查路径
1. 1) Set environment variable SSLKEYLOGFILE=C:\temp\sslkey.log to capture session keys. 2) In Wireshar `[来源: onenote]`
2. Migrate fully to Customv2 policies for TLS 1.3 support. Cannot mix Custom and Customv2 policy types  `[来源: ado-wiki]`
3. This is expected behavior. TLS 1.3 applies to frontend connections only. Backend server connections  `[来源: ado-wiki]`
4. Upload certificate chain including at least one CA cert (root cert). Leaf cert alone is not sufficie `[来源: ado-wiki]`
5. Ensure complete trusted certificate chain (root + all intermediates) is uploaded to SSL Profile. Req `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/appgw-tls-mutual-auth.md#排查流程)
