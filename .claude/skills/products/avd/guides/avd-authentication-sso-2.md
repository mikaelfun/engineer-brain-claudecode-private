# AVD AVD 认证与 SSO (Part 2) - Quick Reference

**Entries**: 10 | **21V**: mixed
**Keywords**: 0x80072f7d, aadds, aadj, adfs-sso, aes128-sha256, authentication, auto-scaling, azure-front-door, certificate, certificate-prompt, cipher-mismatch, connection-failure, contentidea-kb, credentials, credssp
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Workgroup (non-AAD-joined) Windows client fails to RDP connect to Azure AD-joine... | CredSSP fallback is not supported from workgroup/non-joined clients to AADJ VMs.... | Add targetisaadjoined:i:1 as custom RDP property to the host pool to enable RDST... | 🟢 8.5 | OneNote |
| 2 📋 | Windows Hello For Business (WHfB) authentication fails when RDP to Azure-hosted ... | Two missing prerequisites: (1) Issuing CA certificate for KDC certificate not in... | 1. Add CA cert to NTAuth store: Certutil -enterprise -addstore NTAuth issuingCA.... | 🟢 8.5 | OneNote |
| 3 📋 | All users in all host pools fail to connect to AVD session hosts. RD Client show... | Required TLS 1.2 cipher AES128-SHA256 (required by Azure Front Door for AVD conn... | 1. Check SSL Cipher Suite Order GPO via gpresult. 2. Verify registry HKLM\SYSTEM... | 🔵 6.5 | OneNote |
| 4 📋 | AVD users fail to connect frequently with error 'Reverse Connect to rdgateway-*.... | Network connectivity issue between client and AVD rdgateway endpoints. VPN route... | 1. Use Kusto DiagActivity+DiagError join to identify failed connections and erro... | 🔵 6.5 | OneNote |
| 5 📋 | ADFS SSO for AVD does not work in Azure AD DS (AADDS) environment. SSO only avai... | AVD ADFS SSO has three limitations: (1) Not supported with Azure AD DS, (2) Requ... | Use on-premises AD FS with federated authentication. Deploy AD FS server (not AA... | 🔵 6.5 | OneNote |
| 6 📋 | Users get self-signed certificate not trusted prompt via WVD desktop client and ... | CredSSP for RDP was disabled in the Azure portal (enablecredsspsupport:i:0). | Change RDP setting to RDP will use CredSSP from WVD portal and refresh subscript... | 🔵 6.5 | ContentIdea |
| 7 📋 | Entra joined VM: 'A specified logon session does not exist. It may already have ... | Kerberos server object not properly created/configured for SSO | Verify Kerberos server object is properly created and configured per SSO configu... | 🟡 5.5 | MS Learn |
| 8 📋 | AVD session establishes then immediately logs off. RDInfra trace shows RdpStackD... | VM-level issue (suspected NLA configuration or performance problem) causing sess... | 1) Disable NLA via Azure Portal script, restart VM. 2) Re-enable NLA. Issue reso... | 🟡 5.5 | OneNote |
| 9 📋 | AVD session establishes then immediately logs off. RDInfra trace shows RdpStackD... | VM-level issue (suspected NLA configuration or performance problem) causing sess... | 1) Disable NLA via Azure Portal script, restart VM. 2) Re-enable NLA. Issue reso... | 🟡 5.5 | OneNote |
| 10 📋 | AVD auto scaling script fails with 'The remote name could not be resolved' for *... | Log Analytics workspace ODS ingestion endpoint DNS not resolvable. Workspace may... | Re-run the script after Log Analytics workspace is fully provisioned. Verify DNS... | 🟡 5.5 | OneNote |

## Quick Triage Path

1. Check: CredSSP fallback is not supported from workgroup/non-joined ... `[Source: OneNote]`
2. Check: Two missing prerequisites: (1) Issuing CA certificate for KD... `[Source: OneNote]`
3. Check: Required TLS 1.2 cipher AES128-SHA256 (required by Azure Fro... `[Source: OneNote]`
4. Check: Network connectivity issue between client and AVD rdgateway ... `[Source: OneNote]`
5. Check: AVD ADFS SSO has three limitations: (1) Not supported with A... `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-authentication-sso-2.md#troubleshooting-flow)