# Networking AppGW Key Vault 与证书 — 综合排查指南

**条目数**: 20 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: [ado-wiki-a-certs-for-appgw.md], [ado-wiki-a-identify-unused-appgw-certs-tool.md], [ado-wiki-a-ps-fetch-cert-details-appgw.md]
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 证书与密钥
> 来源: ado-wiki

1. **AppGW + Key Vault: 'Data or Password for certificate is invalid' error after NRP successfully downloads cert from Key Va**
   - 根因: Certificate in Key Vault is corrupt or improperly bundled (wrong format, bad password, incorrect cert chain order)
   - 方案: Customer needs to re-bundle the certificate correctly and re-upload it to Key Vault. Azure Networking cannot assist with certificate formatting — only communication and connectivity troubleshooting.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

2. **AppGW + Key Vault: HTTPS listener disabled after customer deletes SSL certificate from Key Vault. Error: 'KeyVault Secre**
   - 根因: Customer deleted the SSL certificate/secret from Key Vault, but AppGW still references it. AppGW disables the affected HTTPS listener as expected behavior.
   - 方案: Re-upload the SSL certificate to Key Vault, then go to the Listener blade and re-select the new certificate: choose Managed Identity → Key Vault → new certificate.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

3. **AppGW + Key Vault: ClientAssertionCredential authentication failed — 'The certificate with identifier used to sign the c**
   - 根因: Known issue: Managed Identity certificate registration becomes stale or corrupted on the application side.
   - 方案: Reapply the Managed Identity on AppGW via PowerShell:
$AppGw = Get-AzApplicationGateway -Name $AppGwName -ResourceGroupName $RGName
$identity = Get-AzUserAssignedIdentity -Name $UserIdentityName -ResourceGroupName $rgname
Set-AzApplicationGatewayIdentity -ApplicationGateway $AppGw -UserAssignedIdentityId $identity.Id
Set-AzApplicationGateway -ApplicationGateway $AppGw
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

4. **AppGW in Failed state after customer deleted certificate from Key Vault but did NOT remove the SSL certificate reference**
   - 根因: Orphaned/unused SSL certificate reference in AppGW configuration still points to deleted Key Vault secret, causing validation failure on every PUT operation.
   - 方案: Remove the unused SSL certificate from AppGW via PowerShell:
$AppGW = Get-AzApplicationGateway -Name 'AppGwName' -ResourceGroupName 'RGName'
Remove-AzApplicationGatewaySslCertificate -ApplicationGateway $AppGW -Name 'CertificateName'
Set-AzApplicationGateway -ApplicationGateway $AppGw
Or via CLI: az network application-gateway ssl-cert delete -g RGName --gateway-name AppGwName -n CertificateName
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

5. **AppGW + Key Vault: 'Key Vault doesn't allow access to the managed identity' error when configuring certificate in Listen**
   - 根因: Customer selected 'Create New' instead of 'Select Existing' when configuring the certificate in the Listener blade after already setting up Managed Identity and Key Vault access.
   - 方案: Ensure the option 'Select Existing' is selected in the Listener blade when configuring the certificate, not 'Create New'. The managed identity and Key Vault access must already be configured.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

6. **Application Gateway goes to Failed state with InternalServerError. GWM logs show MaxUnhealthyUpgradedInstancePercentExce**
   - 根因: KeyVault firewall does not allow AppGW subnet. When Service Endpoint for KeyVault is enabled on AppGW subnet, the KeyVault firewall must explicitly allow that subnet. Misconfigured virtual network rules cause AppGW instances to fail certificate retrieval.
   - 方案: Three options: 1) Allow AppGW subnet in KeyVault firewall virtual network rules 2) Enable 'Allow trusted Microsoft services' on KeyVault firewall 3) Allow AppGW Public IP on KeyVault firewall. Verify: AppGW subnet has KeyVault Service Endpoint enabled AND KeyVault firewall has the correct AppGW subnet allowed.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FOperation%20failures%20on%20Application%20Gateways)`

7. **PUT operations on Application Gateway fail with error: 'Data or KeyVaultSecretId must be specified for certificate'. Sub**
   - 根因: SSL certificate on Application Gateway has no PublicCertData and no KeyVaultSecretId — the certificate reference is stuck/orphaned (both fields show N/A in ASC Properties).
   - 方案: Solution 1: In Azure Portal → AppGW → Listeners → Listener TLS certificates, find the affected cert and re-upload the .pfx file or link to a KeyVault certificate. Solution 2: Use PowerShell to create a new SSL certificate (New-AzApplicationGatewaySslCertificate), update the listener to use the new cert (Set-AzApplicationGatewayHttpListener), remove the old cert (Remove-AzApplicationGatewaySslCertificate), then apply (Set-AzApplicationGateway). Before troubleshooting, verify: 1) AppGW has connectivity to KeyVault 2) Referenced secret/certificate is not disabled.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FData%20or%20KeyVaultSecretId%20must%20be%20specified)`

8. **AppGW+KeyVault: Data or Password for certificate is invalid after NRP downloads cert from KV but fails to install on GWM**
   - 根因: Certificate in Key Vault is corrupt or improperly bundled (wrong format, bad password, incorrect cert chain order)
   - 方案: Customer must re-bundle the certificate correctly and re-upload to Key Vault. Azure Networking only handles communication/connectivity troubleshooting.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

9. **AppGW+KeyVault: HTTPS listener disabled after customer deletes SSL cert from KV. Error: KeyVault Secret not found. AppGW**
   - 根因: Customer deleted SSL certificate/secret from Key Vault but AppGW still references it. AppGW disables the affected HTTPS listener.
   - 方案: Re-upload SSL certificate to Key Vault, then re-select in Listener blade: choose Managed Identity -> Key Vault -> new certificate.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

10. **AppGW+KeyVault: ClientAssertionCredential authentication failed - AADSTS700027 certificate used to sign client assertion**
   - 根因: Known issue: Managed Identity certificate registration becomes stale/corrupted on the application side.
   - 方案: Reapply Managed Identity on AppGW via PowerShell: Get-AzApplicationGateway -> Get-AzUserAssignedIdentity -> Set-AzApplicationGatewayIdentity -> Set-AzApplicationGateway
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

11. **AppGW in Failed state after customer deleted certificate from Key Vault but did NOT remove SSL cert reference from Appli**
   - 根因: Orphaned/unused SSL certificate reference in AppGW config still points to deleted KV secret, causing validation failure on every PUT operation.
   - 方案: Remove unused SSL cert via PS: Remove-AzApplicationGatewaySslCertificate -ApplicationGateway $AppGW -Name CertName; Set-AzApplicationGateway. Or CLI: az network application-gateway ssl-cert delete
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

12. **AppGW+KeyVault: Key Vault does not allow access to the managed identity error when configuring certificate in Listener b**
   - 根因: Customer selected Create New instead of Select Existing when configuring certificate in Listener blade after already setting up Managed Identity and KV access.
   - 方案: Use Select Existing in the Listener blade when configuring certificate, not Create New. Managed identity and Key Vault access must already be configured.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues)`

13. **AppGW v2 is in failed/unhealthy state and cannot be recovered. AppGW logs show 'Failed to retrieve secret from KeyVault'**
   - 根因: Key Vault Firewall is configured for Private Endpoint or selected networks only, and AppGW is not included in the allowed access. Requires both: (1) trusted services allowed for control plane cert validation, and (2) AppGW subnet/public IP allowed for data plane cert download.
   - 方案: Configure Key Vault Firewall to 'All Networks' or add two required access rules: (1) Enable 'Allow trusted Microsoft services to bypass this firewall' for control plane access; (2) Add AppGW's subnet or public IP to allowed list for data plane access. Verify DNS resolution for KV hostname is working from AppGW VNet. Reference: https://docs.microsoft.com/en-us/azure/application-gateway/key-vault-certs
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20Failed%20State%20Due%20to%20KeyVault%20Failure)`

14. **AppGW v2 is in failed state due to Key Vault integration. Logs show 'Failed to retrieve secret from KeyVault'. Managed i**
   - 根因: The managed identity configured on Application Gateway is missing from the Key Vault access policy, or has incorrect/insufficient permissions (needs GET permission for secrets and certificates).
   - 方案: Grant the managed identity configured on AppGW the required GET permissions on the Key Vault (under Access Policies → add the managed identity → Secret permissions: Get; Certificate permissions: Get). Verify the correct managed identity is referenced in AppGW SslSecrets configuration.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20Failed%20State%20Due%20to%20KeyVault%20Failure)`

15. **AppGW v2 is in failed state due to Key Vault integration. Certificate was deleted from Key Vault but still referenced in**
   - 根因: SSL certificate was deleted from Key Vault but the reference remains in AppGW SSL certificates configuration. If the cert is tied to a listener, the gateway cannot function and enters failed state.
   - 方案: Option 1 (cert not tied to listener): Delete the cert reference from AppGW using Remove-AzApplicationGatewaySslCertificate + Set-AzApplicationGateway, or re-add the cert to KV with the same name. Option 2 (cert tied to listener/routing rule): Remove the listener and routing rule first, then remove the cert reference. Option 3 (replace cert on listener without deleting): Use Set-AzApplicationGatewayHttpListener to switch to a valid cert, then remove the bad KV cert reference. Full PowerShell scripts available in wiki.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20Failed%20State%20Due%20to%20KeyVault%20Failure)`

16. **Azure portal does not allow selecting a Key Vault Secret (from the Secrets vault) as an SSL certificate for Application **
   - 根因: Portal integration for AppGw SSL certificate configuration only exposes the Certificates vault pool, not secrets. Customers who imported certificates to Key Vault as secrets (not certificates) cannot configure AppGw SSL termination via the portal.
   - 方案: Use PowerShell to add the SSL certificate using the Key Vault SecretId directly: (1) Get the AppGw object, (2) Use Add-AzApplicationGatewaySslCertificate with -KeyVaultSecretId pointing to the secret URL, (3) Assign a User Managed Identity with Key Vault 'get secrets' permission, (4) Run Set-AzApplicationGateway. After running the script, the secret becomes selectable in the portal listener configuration.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20use%20secrets-certs%20from%20Key%20Vault%20for%20AppGw%20SSL%20termination%20Powershell%20script)`

17. **AppGW绑定了KeyVault证书，但KeyVault中的证书更新后AppGW不自动同步新版本，仍继续使用已过期或旧版本的证书**
   - 根因: Set-AzApplicationGatewaySslCertificate 使用了带有具体版本号的 SecretId（如 .../secrets/certname/abc123）；当 SecretId 包含版本号时，AppGW只固定引用该特定版本，不会自动检测KV中的新版本
   - 方案: 使用无版本号的 SecretId：$secretId = $secret.Id.Replace($secret.Version, "")，使SecretId格式变为 .../secrets/certname/（末尾斜杠，无版本）。AppGW此后会自动检测并下载KV中的最新版本证书。官方文档明确说明：若需AppGW与KeyVault同步证书，须提供无版本号的 secretId
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FKeyvault%20secrets%20do%20not%20update%20on%20appgw)`

18. **Azure Portal或CLI上AppGW的证书信息（到期日期、Common Name等元数据）不显示或显示为空白**
   - 根因: AppGW不在本地存储证书元数据，每次查看时通过GetListenerCertificateMetaData操作从KeyVault实时获取；以下情况会导致获取失败：(1) 证书未绑定到任何监听器；(2) 证书绑定的监听器未关联到路由规则（非活跃监听器）；(3) Managed Identity的KeyVault访问权限失效或变更；(4) Managed Identity权限已变更但尚未传播生效；(5) AppGW处于Stopped状态
   - 方案: 按以下顺序排查：检查证书是否已绑定到监听器 → 确认监听器是否已关联到Request Routing Rule → 检查Managed Identity的KeyVault访问权限是否有效（在Control Plane Dashboard或ASC的Operations标签中查看GetListenerCertificateMetaData操作状态）→ 确认AppGW不处于Stopped状态
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway)`

19. **Application Gateway SSL certificate does not automatically update/rotate after the certificate is renewed in Azure Key V**
   - 根因: Terraform configuration uses the `azurerm_key_vault_secret` data source which includes the specific secret **version** in the Key Vault URL. Application Gateway only supports automatic rotation for **versionless** Key Vault secret references. When the cert is renewed in Key Vault, a new version is created, but the AppGW still points to the old versioned URL.
   - 方案: Use Terraform's `replace()` function to strip the version from the Key Vault secret URL, creating a versionless reference:

`key_vault_secret_id = replace(data.azurerm_key_vault_secret.vault.id, "/secrets/(.*)/[^/]+/", "secrets/$1")`

This converts the versioned URL (e.g., `.../secrets/mycert/5cd21fe4...`) to a versionless URL (e.g., `.../secrets/mycert`), enabling automatic certificate rotation.
   `[结论: 🟢 9.0/10 — ado-wiki] [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTerraform%20Scenarios%2FKeyVault%20Versionless%20Secrets%20Using%20Terraform)`

### Phase 2: 权限与认证
> 来源: onenote

1. **ARM template deployment fails for Application Gateway with Key Vault SSL certificate integration, identity value error**
   - 根因: Downloaded ARM template contains principalId and clientId from the managed identity section, which are auto-generated and cannot be reused in a new deployment
   - 方案: Delete principalId and clientId fields from the identity section in the ARM template before deploying a new Application Gateway
   `[结论: 🟢 9.5/10 — onenote] [MCVKB/1.5[NETVKB]How to deploy APPGW by template if SSL.md]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ARM template deployment fails for Application Gateway wit... | Downloaded ARM template contains principalId an... | Delete principalId and clientId fields from the... | 🟢 9.5 | [MCVKB/1.5[NETVKB]How to deploy APPGW by template if SSL.md] |
| 2 | AppGW + Key Vault: 'Data or Password for certificate is i... | Certificate in Key Vault is corrupt or improper... | Customer needs to re-bundle the certificate cor... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 3 | AppGW + Key Vault: HTTPS listener disabled after customer... | Customer deleted the SSL certificate/secret fro... | Re-upload the SSL certificate to Key Vault, the... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 4 | AppGW + Key Vault: ClientAssertionCredential authenticati... | Known issue: Managed Identity certificate regis... | Reapply the Managed Identity on AppGW via Power... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 5 | AppGW in Failed state after customer deleted certificate ... | Orphaned/unused SSL certificate reference in Ap... | Remove the unused SSL certificate from AppGW vi... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 6 | AppGW + Key Vault: 'Key Vault doesn't allow access to the... | Customer selected 'Create New' instead of 'Sele... | Ensure the option 'Select Existing' is selected... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 7 | Application Gateway goes to Failed state with InternalSer... | KeyVault firewall does not allow AppGW subnet. ... | Three options: 1) Allow AppGW subnet in KeyVaul... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FExpert%20Troubleshooting%2FOperation%20failures%20on%20Application%20Gateways) |
| 8 | PUT operations on Application Gateway fail with error: 'D... | SSL certificate on Application Gateway has no P... | Solution 1: In Azure Portal → AppGW → Listeners... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FData%20or%20KeyVaultSecretId%20must%20be%20specified) |
| 9 | AppGW+KeyVault: Data or Password for certificate is inval... | Certificate in Key Vault is corrupt or improper... | Customer must re-bundle the certificate correct... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 10 | AppGW+KeyVault: HTTPS listener disabled after customer de... | Customer deleted SSL certificate/secret from Ke... | Re-upload SSL certificate to Key Vault, then re... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 11 | AppGW+KeyVault: ClientAssertionCredential authentication ... | Known issue: Managed Identity certificate regis... | Reapply Managed Identity on AppGW via PowerShel... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 12 | AppGW in Failed state after customer deleted certificate ... | Orphaned/unused SSL certificate reference in Ap... | Remove unused SSL cert via PS: Remove-AzApplica... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 13 | AppGW+KeyVault: Key Vault does not allow access to the ma... | Customer selected Create New instead of Select ... | Use Select Existing in the Listener blade when ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Configure%20and%20Troubleshoot%20Application%20Gateway%20%2B%20Key%20Vault%20Issues) |
| 14 | AppGW v2 is in failed/unhealthy state and cannot be recov... | Key Vault Firewall is configured for Private En... | Configure Key Vault Firewall to 'All Networks' ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20Failed%20State%20Due%20to%20KeyVault%20Failure) |
| 15 | AppGW v2 is in failed state due to Key Vault integration.... | The managed identity configured on Application ... | Grant the managed identity configured on AppGW ... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20Failed%20State%20Due%20to%20KeyVault%20Failure) |
| 16 | AppGW v2 is in failed state due to Key Vault integration.... | SSL certificate was deleted from Key Vault but ... | Option 1 (cert not tied to listener): Delete th... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FAppGW%20v2%20Failed%20State%20Due%20to%20KeyVault%20Failure) |
| 17 | Azure portal does not allow selecting a Key Vault Secret ... | Portal integration for AppGw SSL certificate co... | Use PowerShell to add the SSL certificate using... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20use%20secrets-certs%20from%20Key%20Vault%20for%20AppGw%20SSL%20termination%20Powershell%20script) |
| 18 | AppGW绑定了KeyVault证书，但KeyVault中的证书更新后AppGW不自动同步新版本，仍继续使用已过期... | Set-AzApplicationGatewaySslCertificate 使用了带有具体版... | 使用无版本号的 SecretId：$secretId = $secret.Id.Replace... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FKeyvault%20secrets%20do%20not%20update%20on%20appgw) |
| 19 | Azure Portal或CLI上AppGW的证书信息（到期日期、Common Name等元数据）不显示或显示为空白 | AppGW不在本地存储证书元数据，每次查看时通过GetListenerCertificateM... | 按以下顺序排查：检查证书是否已绑定到监听器 → 确认监听器是否已关联到Request Rout... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20work%20with%20Certs%20for%20application%20gateway) |
| 20 | Application Gateway SSL certificate does not automaticall... | Terraform configuration uses the `azurerm_key_v... | Use Terraform's `replace()` function to strip t... | 🟢 9.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTerraform%20Scenarios%2FKeyVault%20Versionless%20Secrets%20Using%20Terraform) |
