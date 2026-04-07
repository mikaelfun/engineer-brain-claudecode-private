# Networking AppGW 后端健康与 502 — 综合排查指南

**条目数**: 24 | **草稿融合数**: 3 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-a-appgw-502-bad-gateway.md], [ado-wiki-a-appgw-probe-issues.md], [ado-wiki-c-tls-probes-behavior-appgw-webapp.md]
**Kusto 引用**: [appgw.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 证书与密钥
> 来源: ado-wiki

1. **502 Bad Gateway or backend unhealthy when integrating APIM with Application Gateway**
   - 根因: Certificate thumbprint mismatch between AppGW and APIM, or default listeners/HTTP settings/rules not removed
   - 方案: 1) Verify cert thumbprints match. 2) Remove default listeners, HTTP settings, and rule. 3) Test from VM in same VNET with hosts file. 4) If still failing, engage APIM team
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20API%20Management%20APIM)`

2. **Application Gateway Layer 4 TLS proxy backend health probe failures. BackendServerDiagnostic logs show certificate-relat**
   - 根因: Two common causes: 1) TLS probe ServerNameIndication (SNI) value does not match backend server certificate CN/SAN. 2) Backend server certificate root CA is not in Application Gateway's trusted root certificate store.
   - 方案: 1) For SNI mismatch: Check the ServerNameIndication property in BackendSettings and ensure it matches the backend certificate CN/SAN. 2) For Root CA issues: Upload the correct trusted root certificate to Application Gateway. 3) Use BackendServerDiagnosticHistory logs (AppGWT table) filtered by SettingName/listenerName/ruleName for detailed probe failure analysis. 4) Verify L4 feature is enabled: check AFEC flags (AllowApplicationGatewayTlsProxy, EnableApplicationGatewayTlsProxyBackendHealth) and L4 properties (ApplicationGatewayListener, RoutingRule, BackendSettings) are non-empty.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FLayer%204%20Application%20Gateway%20Troubleshooting%20Guide)`

3. **L4 TLS proxy backend health probe failures with cert errors.**
   - 根因: SNI mismatch with backend cert CN/SAN or root CA not trusted.
   - 方案: Check ServerNameIndication in BackendSettings. Upload trusted root cert. Use BackendServerDiagnosticHistory.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FLayer%204%20Application%20Gateway%20Troubleshooting%20Guide)`

4. **OnDemand Health Probe (ODHP) marks backend as unhealthy when backend server certificate chain includes intermediate cert**
   - 根因: ODHP uses a different certificate validation path from standard probes; it only loads Trusted Root Certs into the trust store and does not pass intermediate certs to the chain builder, causing chain validation timeout and failure (bug msazure#7258041). Fix planned for Q4 CY2025.
   - 方案: Use standard 'Get Backend Health' API/diagnostics instead of ODHP for accurate backend health results. Steps: (1) Confirm cert chain structure (leaf + intermediates + root); (2) Verify only root cert is in Trusted Root Cert of Backend HTTP Setting; (3) Advise customer to use Get Backend Health until ODHP fix ships in Q4 2025.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Known%20Issue%3A%20OnDemand%20Health%20Probe%20Failure)`

5. **Backend health shows unhealthy with error: 'The Common Name of the leaf certificate presented by the backend server does**
   - 根因: The SNI hostname used during TLS handshake (derived from Custom Probe's host field or Backend Setting hostname) does not match the Common Name (CN) in the backend server's leaf certificate.
   - 方案: V2: (a) Default Probe — set hostname in Backend Setting via 'Override with specific hostname' or 'Pick hostname from backend target'; (b) Custom Probe — set correct CN in probe 'host' field or choose 'Pick hostname from backend setting'. V1: Verify backend pool target FQDN matches the cert CN. To find CN: check browser certificate padlock, use certlm.msc on Windows, or run 'openssl x509 -in certificate.crt -text -noout' on Linux.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues)`

6. **Backend health error: 'The Leaf certificate is not the topmost certificate in the chain presented by the backend server.**
   - 根因: The leaf (domain/server) certificate is not installed as the first/topmost certificate in the chain on the backend server; chain is incorrectly ordered.
   - 方案: Install the certificate chain on the backend server in correct order: Leaf certificate first (depth 0), then Intermediate certificate(s) (depth 1+), then Root CA certificate last. Verify chain order using: 's_client -connect <FQDN>:443 -showcerts' or 's_client -connect <IP>:443 -servername <SNI_hostname> -showcerts'.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues)`

7. **Backend health error: 'The Leaf certificate is missing from the certificate chain presented by the backend server. Ensur**
   - 根因: The leaf (domain/server) certificate is missing from the certificate chain installed on the backend server.
   - 方案: Obtain the leaf certificate from your Certificate Authority (CA). Install the complete chain on the backend server in correct order: Leaf → Intermediate(s) → Root CA. Verify with 's_client -connect <FQDN>:443 -showcerts'.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues)`

8. **Backend health error: 'The Intermediate certificate is missing from the certificate chain presented by the backend serve**
   - 根因: Intermediate certificate(s) not installed in the certificate chain on the backend server. For self-signed certs: AppGW treats a non-CA self-signed cert as a 'Leaf' and expects a signing Intermediate cert, which is absent.
   - 方案: (1) Get intermediate certificate(s) from your CA and install complete chain on backend server: Leaf → Intermediate(s) → Root CA. (2) For self-signed certs: follow correct creation steps at https://learn.microsoft.com/en-us/azure/application-gateway/self-signed-certificates to create a self-signed cert that includes CA extensions.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues)`

9. **Backend health error: 'The backend server certificate is not signed by a well-known Certificate Authority (CA). To use u**
   - 根因: 'Well-known CA certificate' is selected in the Backend Setting but the backend server's Root CA is a private/unknown CA not in the public trust store.
   - 方案: In the Backend Setting, change to 'not a well-known CA' and upload the Root CA certificate (.CER file). To export the root cert: follow steps at https://learn.microsoft.com/en-us/azure/application-gateway/certificates-for-backend-authentication#export-trusted-root-certificate-for-v2-sku
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues)`

10. **Backend health error: 'The Intermediate certificate is not signed by a well-known Certificate Authority (CA). Ensure the**
   - 根因: 'Well-known CA certificate' is selected in the Backend Setting but the Intermediate certificate presented by the backend server is signed by a private/non-public CA.
   - 方案: Contact your private CA to get the appropriate Root CA certificate (.CER). In the Backend Setting, choose 'not a well-known CA' and upload the Root CA cert. Also install the complete chain on the backend server (Leaf → Intermediate(s) → Root CA) for easy verification.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues)`

11. **Backend health error: 'The Intermediate certificate not signed by any Root certificates uploaded to the application gate**
   - 根因: None of the Root CA certificates uploaded to the Backend Setting have signed the Intermediate certificate on the backend server. Backend server only has leaf and intermediate certs installed (Root CA is missing from the chain).
   - 方案: Contact your private CA to obtain the Root CA certificate (.CER file). Upload it to the Backend Setting of the application gateway. This Root CA must be the one that signed the Intermediate certificate in the backend server's chain.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues)`

### Phase 2: DNS 解析
> 来源: ado-wiki

1. **Application Gateway v2 backend health shows 'Unknown' status intermittently. Multiple DNS resolver servers configured on**
   - 根因: AppGW does not follow standard Azure DNS resolver ordering (primary/secondary). On startup or PUT, it tries each DNS resolver and latches onto the first one that responds. If that resolver cannot resolve backend hostnames or AppGW dependency hostnames, backend health reports as Unknown. With 2 out of 4 DNS resolvers unable to resolve, the issue is ephemeral.
   - 方案: Ensure ALL DNS resolver servers configured on the AppGW VNET can resolve both public hostnames (required for AppGW dependencies) and backend hostnames. Use the DNS verification tool to confirm resolution from AppGW instances.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FApplication%20Gateway%20instances%20configured%20with%20multiple%20DNS%20resolver%20servers%20causing%20issues)`

2. **In Private-Only Application Gateway v2 deployments, backend health shows 'unknown' status with an error message incorrec**
   - 根因: Bug in Private-Only Gateway error message template: when backend health is unknown due to DNS resolution or other reasons, the error message still references legacy public IP requirements (NSG rules, UDR elimination) which don't apply to private-only deployments.
   - 方案: The erroneous NSG/UDR error message can be safely ignored for Private-Only Gateway deployments. Investigate the actual underlying cause (typically DNS resolution). This error message typo will be fixed in a future release.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Private-Only%20Gateway%20for%20Application%20Gateway%20v2)`

3. **In Private-Only Application Gateway v2 deployments, backend health shows unknown status with error message incorrectly s**
   - 根因: Bug in Private-Only Gateway error message template: when backend health is unknown due to DNS resolution or other reasons, the message still references legacy public IP requirements which do not apply.
   - 方案: The erroneous NSG/UDR error message can be safely ignored for Private-Only Gateway. Investigate the actual underlying cause (typically DNS resolution). Fix planned for future release.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Private-Only%20Gateway%20for%20Application%20Gateway%20v2)`

4. **AppGW returns 502 Bad Gateway when routing through APIM; APIM logs show BackendConnectionFailure with error 'The remote **
   - 根因: Backend FQDN configured in APIM is not resolvable from the APIM subnet — DNS resolution failure in APIM's network context
   - 方案: Verify DNS resolution of backend FQDN from the APIM subnet (check custom DNS servers or Private DNS zones). Use Kusto query on APIM cluster to confirm backendResponseCode=0 and errorReason=BackendConnectionFailure. Ensure routing and NSG allow DNS queries from APIM subnet.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FMinimizing%20Collaboration%20with%20APIM%20from%20APP%20GW%20Side)`

### Phase 3: 网络与路由
> 来源: ado-wiki + onenote

1. **Application Gateway health probe failure or backend unhealthy due to NSG blocking required management ports on AppGW sub**
   - 根因: NSG on Application Gateway subnet missing required inbound port rules (65503-65534 for v1, 65200-65535 for v2) and AzureLoadBalancer tag
   - 方案: Allow inbound traffic from GatewayManager service tag (recommended over opening all ports), allow outbound to Azure Cloud service tag, and allow AzureLoadBalancer traffic
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/1.3 How to configure the NSG with the Application.md]`

2. **Application Gateway health probes fail only from specific AppGW instances while other instances report the same backend **
   - 根因: Backend server has IP-based blocking (e.g., Fail2Ban, iptables, custom firewall rules) that blocks traffic from specific AppGW instance IPs. Backend OS responds with ICMP Port Unreachable to SYN packets from blocked IPs. Other causes include NSG/UDR misconfiguration or rate-limiting on the backend.
   - 方案: Check backend server firewall rules with 'iptables -L -n -v'. Look for blocked AppGW instance IPs (e.g., Fail2Ban rules). Customer must allow connections from all AppGW instance IPs. Also check NSG rules and UDR configurations for inconsistencies. Take packet captures on backend filtering by AppGW instance IP to confirm SYN/ICMP behavior.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FBackend%20Blocking%20Traffic%20from%20Specific%20AppGW%20Instances)`

3. **Application Gateway cannot reach backend; TCP SYN sent but SYN-ACK never received; backend health probe fails**
   - 根因: NSG on the backend subnet is blocking inbound traffic from AppGW subnet or blocking return path
   - 方案: Review NSG rules on the backend subnet; allow traffic from AppGW subnet IP ranges; correct NSG misconfiguration. Root Cause: Windows Azure\Virtual Network\NSG\Configuration\Customer misconfiguration
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG)`

### Phase 4: 权限与认证
> 来源: ado-wiki

1. **Application Gateway backend health shows Unhealthy with 401 responses; probes use anonymous access causing failure again**
   - 根因: Application Gateway health probes do not support credential configuration and use anonymous access by default; backends configured with NTLM authentication (e.g., SharePoint) return 401, causing probe health to report Unhealthy
   - 方案: 1) Allow anonymous access on the backend site for the probe path; 2) Configure probe to target a separate path that does not require authentication (not recommended as it bypasses real health checking); 3) Configure probe match to accept 401 as a valid response code via the probe-matching feature (https://docs.microsoft.com/azure/application-gateway/application-gateway-probe-overview#probe-matching)
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FAppGateway%20getting%20401%20responses%20for%20the%20probes)`

2. **AppGW backend pool pointing to AKS shows unhealthy with probe timeout error: 'Time taken by the backend to respond to ap**
   - 根因: The AAD Service Principal client secret used by the AKS cluster has expired (error AADSTS7000222: InvalidClientSecretExpiredKeysProvided). AKS cannot authenticate and therefore cannot respond to AppGW health probe requests.
   - 方案: 1. Get AKS credentials: `az aks get-credentials --resource-group <rg> --name <cluster>`. 2. Find the expired secret: `kubectl get secret -A | grep <secret-name>`. 3. Decode the base64 secret: `kubectl get secret <secret-name> -o yaml` then `echo '<base64-value>' | base64 --decode` to extract clientId and clientSecret. 4. Reset the credential: `az ad sp credential reset --name <clientId> --password <clientSecret> --years 100`. 5. Wait 15-30 minutes for AKS to pick up the updated credential.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FBackend%20Unhealthy%3A%20AKS%20Backend%20Pool%20with%20client%20secret%20keys%20expired)`

3. **AppGW后端健康探测返回401 Unauthorized，后端被标记为不健康（Unhealthy），但后端App Service本身运行正常；或健康探测反复失败，实际业务流量正常**
   - 根因: AppGW健康探测是简单HTTP请求，不携带Authentication headers/token/cookie；后端App Service配置了Entra ID (AAD)认证，导致所有未认证请求（包括健康探测）收到401响应
   - 方案: 方案1（快速）：将AppGW健康探测配置为接受HTTP 401作为健康响应码，适用于所有端点均需认证的情况，401确认服务在运行。方案2（推荐）：在App Service创建专用健康检查路径（如/health.html），通过az rest --method put更新authsettingsV2的excludedPaths将该路径排除在Entra ID认证之外，将AppGW探测指向该路径并期望200 OK响应
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FMitigating%20App%20GW%20Health%20Probe%20401%20error%20Issues%20with%20Authentication%20enabled%20App%20Service)`

### Phase 5: 版本与兼容
> 来源: ado-wiki

1. **Application Gateway returns 502 to clients after an underlying datapath component upgrade. Access logs show httpStatus=5**
   - 根因: After the upgrade, AppGW enforces stricter RFC compliance. Backend server returns HTTP response headers with names containing spaces or control characters (0x00-0x1f, 0x7f), which are now rejected.
   - 方案: Fix the backend server to return valid HTTP response headers without spaces or control characters in header names. This is a backend application fix required for RFC compliance.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHTTP%20Behavior%20Changes%20With%20Application%20Gateway%20Upgrade)`

### Phase 6: 其他
> 来源: ado-wiki

1. **Application Gateway returns 504 Gateway Timeout at exactly 60 seconds regardless of HTTP settings timeout configuration.**
   - 根因: SNAT (Source Network Address Translation) port exhaustion on the Application Gateway. Occurs when the gateway runs out of available SNAT ports for outbound connections to public-facing backend pools. AppGw does not auto-scale based on SNAT ports.
   - 方案: Option 1: Increase minimum instance count — each instance provides 1024 SNAT ports. Option 2: Deploy a NAT Gateway associated with the AppGw subnet so outbound traffic uses NAT Gateway's public IP instead. Option 3: Use private IP addresses / Private Link / Private Endpoints for backends to avoid SNAT port usage altogether. Diagnosis: Check snatAvailability in VMSS_Platform Dashboard; look for Snat connection-Pending and Snat connection-Failed entries matching the 504/502 timestamps.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20Identify%20and%20Mitigate%20SNAT%20Exhaustion%20in%20Azure%20Application%20Gateway)`

### Phase 7: 配置问题
> 来源: ado-wiki

1. **AGIC appears to ignore Ingress health probe annotations; Application Gateway health probe configuration does not match a**
   - 根因: AGIC probe priority: Pod probe > Ingress annotations > AGIC default. If a readiness or liveness probe is defined in the Pod/Deployment spec, AGIC uses that Pod probe configuration to generate the App Gateway probe and completely ignores all Ingress health probe annotations. This is the most common cause of 'annotations not working' — a Pod probe was defined (possibly months earlier) and is silently taking precedence.
   - 方案: Run `kubectl get deploy -n <namespace> -o yaml` and check for `readinessProbe` or `livenessProbe`. If found, AGIC is using the Pod probe. To change probe behavior: (1) Update the Pod probe definition in the Deployment spec, or (2) Remove the Pod probe and use Ingress annotations instead. Ingress annotations are only active when no Pod probes exist.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FTroubleshooting%20Health%20Probes)`

## Kusto 查询模板

`[工具: Kusto skill — appgw.md]`
→ 详见 `skills/kusto/networking/references/queries/appgw.md`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Application Gateway health probe failure or backend unhea... | NSG on Application Gateway subnet missing requi... | Allow inbound traffic from GatewayManager servi... | 🟢 9.5 | [MCVKB/1.3 How to configure the NSG with the Application.md] |
| 2 | Application Gateway v2 backend health shows 'Unknown' sta... | AppGW does not follow standard Azure DNS resolv... | Ensure ALL DNS resolver servers configured on t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FApplication%20Gateway%20instances%20configured%20with%20multiple%20DNS%20resolver%20servers%20causing%20issues) |
| 3 | Application Gateway health probes fail only from specific... | Backend server has IP-based blocking (e.g., Fai... | Check backend server firewall rules with 'iptab... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FBackend%20Blocking%20Traffic%20from%20Specific%20AppGW%20Instances) |
| 4 | In Private-Only Application Gateway v2 deployments, backe... | Bug in Private-Only Gateway error message templ... | The erroneous NSG/UDR error message can be safe... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Private-Only%20Gateway%20for%20Application%20Gateway%20v2) |
| 5 | In Private-Only Application Gateway v2 deployments, backe... | Bug in Private-Only Gateway error message templ... | The erroneous NSG/UDR error message can be safe... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Private-Only%20Gateway%20for%20Application%20Gateway%20v2) |
| 6 | 502 Bad Gateway or backend unhealthy when integrating API... | Certificate thumbprint mismatch between AppGW a... | 1) Verify cert thumbprints match. 2) Remove def... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FTroubleshooting%20API%20Management%20APIM) |
| 7 | Application Gateway Layer 4 TLS proxy backend health prob... | Two common causes: 1) TLS probe ServerNameIndic... | 1) For SNI mismatch: Check the ServerNameIndica... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FLayer%204%20Application%20Gateway%20Troubleshooting%20Guide) |
| 8 | L4 TLS proxy backend health probe failures with cert errors. | SNI mismatch with backend cert CN/SAN or root C... | Check ServerNameIndication in BackendSettings. ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FLayer%204%20Application%20Gateway%20Troubleshooting%20Guide) |
| 9 | Application Gateway returns 502 to clients after an under... | After the upgrade, AppGW enforces stricter RFC ... | Fix the backend server to return valid HTTP res... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHTTP%20Behavior%20Changes%20With%20Application%20Gateway%20Upgrade) |
| 10 | Application Gateway backend health shows Unhealthy with 4... | Application Gateway health probes do not suppor... | 1) Allow anonymous access on the backend site f... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFoundational%20and%20Specialist%20Troubleshooting%2FAppGateway%20getting%20401%20responses%20for%20the%20probes) |
| 11 | AppGW returns 502 Bad Gateway when routing through APIM; ... | Backend FQDN configured in APIM is not resolvab... | Verify DNS resolution of backend FQDN from the ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FMinimizing%20Collaboration%20with%20APIM%20from%20APP%20GW%20Side) |
| 12 | AppGW backend pool pointing to AKS shows unhealthy with p... | The AAD Service Principal client secret used by... | 1. Get AKS credentials: `az aks get-credentials... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FBackend%20Unhealthy%3A%20AKS%20Backend%20Pool%20with%20client%20secret%20keys%20expired) |
| 13 | Application Gateway returns 504 Gateway Timeout at exactl... | SNAT (Source Network Address Translation) port ... | Option 1: Increase minimum instance count — eac... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20Identify%20and%20Mitigate%20SNAT%20Exhaustion%20in%20Azure%20Application%20Gateway) |
| 14 | AppGW后端健康探测返回401 Unauthorized，后端被标记为不健康（Unhealthy），但后端App... | AppGW健康探测是简单HTTP请求，不携带Authentication headers/to... | 方案1（快速）：将AppGW健康探测配置为接受HTTP 401作为健康响应码，适用于所有端点均... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FMitigating%20App%20GW%20Health%20Probe%20401%20error%20Issues%20with%20Authentication%20enabled%20App%20Service) |
| 15 | OnDemand Health Probe (ODHP) marks backend as unhealthy w... | ODHP uses a different certificate validation pa... | Use standard 'Get Backend Health' API/diagnosti... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Known%20Issue%3A%20OnDemand%20Health%20Probe%20Failure) |
| 16 | Backend health shows unhealthy with error: 'The Common Na... | The SNI hostname used during TLS handshake (der... | V2: (a) Default Probe — set hostname in Backend... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues) |
| 17 | Backend health error: 'The Leaf certificate is not the to... | The leaf (domain/server) certificate is not ins... | Install the certificate chain on the backend se... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues) |
| 18 | Backend health error: 'The Leaf certificate is missing fr... | The leaf (domain/server) certificate is missing... | Obtain the leaf certificate from your Certifica... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues) |
| 19 | Backend health error: 'The Intermediate certificate is mi... | Intermediate certificate(s) not installed in th... | (1) Get intermediate certificate(s) from your C... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues) |
| 20 | Backend health error: 'The backend server certificate is ... | 'Well-known CA certificate' is selected in the ... | In the Backend Setting, change to 'not a well-k... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues) |
| 21 | Backend health error: 'The Intermediate certificate is no... | 'Well-known CA certificate' is selected in the ... | Contact your private CA to get the appropriate ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues) |
| 22 | Backend health error: 'The Intermediate certificate not s... | None of the Root CA certificates uploaded to th... | Contact your private CA to obtain the Root CA c... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Revised%20Backend%20Health%20Errors%20for%20Certificate%20issues) |
| 23 | AGIC appears to ignore Ingress health probe annotations; ... | AGIC probe priority: Pod probe > Ingress annota... | Run `kubectl get deploy -n <namespace> -o yaml`... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FTroubleshooting%20Health%20Probes) |
| 24 | Application Gateway cannot reach backend; TCP SYN sent bu... | NSG on the backend subnet is blocking inbound t... | Review NSG rules on the backend subnet; allow t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTools%20and%20TSGs%2FBackendConnectivityTSG) |
