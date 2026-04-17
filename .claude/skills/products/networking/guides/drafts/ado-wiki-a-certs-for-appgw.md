---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/How to work with Certs for application gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to work with Certs for application gateway

[[_TOC_]]

## Description

How to work with Certs for application gateway

This wiki is a reference to the brownbag video at the bottom. Recommend watching brownbag video for understanding, so the wiki here is the easy location for the commands and steps from the video.


## You can get a trusted third party cert from Digicert for testing 
https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/393783/Obtain-or-use-shared-Trusted-Third-party-SSL-certificate-for-Labs

## Using OpenSSL to verify cert chain completeness and order

To target a remote server to validate cert chain and order: 

	openssl s_client -connect 52.154.167.124:443 -servername trainv2.ericashton.com -showcerts

If you see errors like: 

	depth=0 C = US, ST = North Dakota, L = Fargo, O = Eric Ashton, CN = *.ericashton.com
	verify error:num=20:unable to get local issuer certificate
	verify return:1
	depth=0 C = US, ST = North Dakota, L = Fargo, O = Eric Ashton, CN = *.ericashton.com
	verify error:num=21:unable to verify the first certificate
	verify return:1

verify error:num=20: **unable to get local issuer certificate** — 中间证书缺失

verify error:num=21: **unable to verify the first certificate** — 根证书缺失

IIS后端注意：IIS即使PFX中包含根证书，也不会在TLS握手时呈现根证书。

To target a PFX on the local machine to validate cert chain and order: 

	openssl.exe pkcs12 -info -nokeys -in C:\certs\Certificate.pfx

**OpenSSL 3.0.0+ 注意**：Windows默认以3DES-SHA1导出PFX，OpenSSL 3.x已弃用该算法，需加 -legacy 参数：

```
# Pre-3.0
openssl.exe pkcs12 -info -nokeys -in C:\certs\Certificate.pfx

# Post-3.0 (需要 legacy provider)
openssl.exe pkcs12 -info -nokeys -in C:\certs\Certificate.pfx -legacy -provider-path "C:\path\to\legacy.dll"
```

## How to Manually Bundle cert steps

1. 从PFX提取私钥：
```
openssl pkcs12 -in Certificate.pfx -nocerts -out private.key
```

2. 从浏览器或MMC证书存储分别导出 leaf、intermediate、root 为 base64 .cer 文件

3. 按顺序（leaf→intermediate→root）拼装 bundled.cer：
```
-----BEGIN CERTIFICATE-----
(Your Primary SSL certificate: your_domain_name.cer)
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
(Your Intermediate certificate: DigiCertCA.cer)
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
(Your Root certificate: TrustedRoot.cer)
-----END CERTIFICATE-----
```

4. 重建PFX：
```
openssl pkcs12 -export -out certificate.pfx -inkey private.key -in bundled.cer
```

5. 替换AppGW监听器证书（PowerShell）：
```powershell
$password = ConvertTo-SecureString "password" -AsPlainText -Force
$AppGW = Get-AzApplicationGateway -Name "APPGWNAME" -ResourceGroupName "RG"
$Cert = Set-AzApplicationGatewaySslCertificate -ApplicationGateway $AppGW -Name "SSLCERTNAME" -CertificateFile "C:\Temp\cert.pfx" -Password $password
Set-AzApplicationGateway -ApplicationGateway $AppGW
```

替换 TrustedRoot 证书：
```powershell
$AppGW = Get-AzApplicationGateway -Name "APPGWNAME" -ResourceGroupName "RG"
$Cert = Set-AzApplicationGatewayTrustedRootCertificate -ApplicationGateway $AppGW -Name "prexistingTrustedrootcertname" -CertificateFile "C:\Temp\cert.cer"
Set-AzApplicationGateway -ApplicationGateway $AppGW
```

## PowerShell script to evaluate PFX completeness and ordering

```powershell
$pfxPath = "C:\path\to\certificate\file.pfx"
$pfxPassword = ConvertTo-SecureString "password" -AsPlainText -Force
$pfxData = Get-PfxData -FilePath $pfxPath -Password $pfxPassword
$certs = @($pfxData.EndEntityCertificates + $pfxData.OtherCertificates)
# ... (验证私钥匹配 + 验证证书链连续性 + 验证最后一张为自签名根证书)
```
注：此脚本需要 PKI Client PowerShell 模块（Windows 11/Server 2025 已内置）。

## PowerShell to evaluate certs from raw base64 data

```powershell
$certData = "CERTDATAGOESHERE"
$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2Collection
$cert.Import([System.Convert]::FromBase64String($certData),$null,[System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)
$cert[0] | FL
$cert[0].Issuer
```

## Cert Bundling with Apache/Nginx/Tomcat

AppGW后端使用Apache/Nginx/Tomcat时，需确保后端呈现完整证书链：

**Apache <= 2.4.8 (Old Style)**
```
SSLCertificateFile      /etc/ssl/certs/leaf.crt
SSLCertificateKeyFile   /etc/ssl/private/server.key
SSLCertificateChainFile /etc/ssl/certs/intermediate_root_bundle.crt
```

**Apache >= 2.4.8 (New Style，SSLCertificateChainFile已废弃)**
```
SSLCertificateFile      /etc/ssl/certs/fullchain.crt   # leaf+intermediate+root合并
SSLCertificateKeyFile   /etc/ssl/private/server.key
```

修改后重启：`service httpd restart` 或 `apachectl stop && apachectl start`

**始终用 openssl 验证后端是否呈现完整链：**
```
openssl s_client -connect <backend-ip>:443 -servername <hostname> -showcerts
```

## Testing AppGW Ciphers with OpenSSL

```
# TLS 1.2 cipher test
openssl s_client -connect <appgw-hostname>:443 -cipher AES256-SHA256 -tls1_2

# TLS 1.3 cipher test
openssl s_client -connect <appgw-hostname>:443 -ciphersuites TLS_AES_128_GCM_SHA256 -tls1_3
```

AppGW cipher名称 vs openSSL名称对照：

| AppGW TLS Ciphername | OpenSSL Name |
|---|---|
| TLS_AES_128_GCM_SHA256 | TLS_AES_128_GCM_SHA256 (1.3) |
| TLS_AES_256_GCM_SHA384 | TLS_AES_256_GCM_SHA384 (1.3) |
| TLS_RSA_WITH_AES_128_CBC_SHA256 | AES128-SHA256 |
| TLS_RSA_WITH_AES_256_CBC_SHA256 | AES256-SHA256 |
| TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 | ECDHE-RSA-AES128-GCM-SHA256 |
| TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 | ECDHE-RSA-AES256-GCM-SHA384 |
| TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256 | ECDHE-ECDSA-AES128-GCM-SHA256 |
| TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 | ECDHE-ECDSA-AES256-GCM-SHA384 |

## Error: SSL certificate size > 16KB

错误信息：`Data too big for certificate <id>/sslCertificates/<name>. Max data length supported is 16384`

验证实际大小：
```powershell
$cert = New-AzApplicationGatewaySslCertificate -Name <name>.pfx -CertificateFile <path>/<file>.pfx
$cert.Data.length   # 若 > 16384 则无法上传
```

## App gateway not showing Certificate info

AppGW不在本地存储证书元数据，每次查看时实时从KV获取（GetListenerCertificateMetaData操作）。以下情况导致元数据不显示：
1. 证书未绑定到任何监听器
2. 绑定的监听器未关联到 Request Routing Rule（非活跃监听器）
3. Managed Identity 的 KV 访问权限失效
4. Managed Identity 权限变更后尚未传播
5. AppGW 处于 Stopped 状态

在 Control Plane Dashboard 或 ASC Operations 标签中查看 GetListenerCertificateMetaData 操作状态。
