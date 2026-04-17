# AVD AVD 认证与 SSO (Part 2) - Quick Reference

**Entries**: 9 | **21V**: partial
**Keywords**: 0x80072f7d, aadds, aadj, adfs, adfs-sso, aes128-sha256, authentication, azure-front-door
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Workgroup (non-AAD-joined) Windows client fails to RDP connect to Azure AD-joine... | CredSSP fallback is not supported from workgroup/non-joined clients to AADJ VMs.... | Add targetisaadjoined:i:1 as custom RDP property to the host pool to enable RDST... | 🟢 8.0 | OneNote |
| 2 📋 | Windows Hello For Business (WHfB) authentication fails when RDP to Azure-hosted ... | Two missing prerequisites: (1) Issuing CA certificate for KDC certificate not in... | 1. Add CA cert to NTAuth store: Certutil -enterprise -addstore NTAuth issuingCA.... | 🟢 8.0 | OneNote |
| 3 📋 | AVD session connects but immediately logs off. User sees dialog box disappear af... | Network Level Authentication (NLA) state corruption on the session host VM, poss... | 1) Disable NLA via Azure Portal Run Command or registry. 2) Restart the VM to ap... | 🔵 6.0 | OneNote |
| 4 📋 | AVD session connects but immediately logs off. User sees dialog box disappear af... | Network Level Authentication (NLA) state corruption on the session host VM, poss... | 1) Disable NLA via Azure Portal Run Command or registry. 2) Restart the VM to ap... | 🔵 6.0 | OneNote |
| 5 📋 | All users in all host pools fail to connect to AVD session hosts. RD Client show... | Required TLS 1.2 cipher AES128-SHA256 (required by Azure Front Door for AVD conn... | 1. Check SSL Cipher Suite Order GPO via gpresult. 2. Verify registry HKLM\SYSTEM... | 🔵 6.0 | OneNote |
| 6 📋 | AVD users fail to connect frequently with error 'Reverse Connect to rdgateway-*.... | Network connectivity issue between client and AVD rdgateway endpoints. VPN route... | 1. Use Kusto DiagActivity+DiagError join to identify failed connections and erro... | 🔵 6.0 | OneNote |
| 7 📋 | ADFS SSO for AVD does not work in Azure AD DS (AADDS) environment. SSO only avai... | AVD ADFS SSO has three limitations: (1) Not supported with Azure AD DS, (2) Requ... | Use on-premises AD FS with federated authentication. Deploy AD FS server (not AA... | 🔵 6.0 | OneNote |
| 8 📋 | AVD users see ADFS login prompt for session host RDP sign-in even though AAD gat... | AAD cookie is still valid allowing silent sign-in to AVD gateway, but ADFS cooki... | This is expected behavior when ADFS cookie expires before AAD cookie. After user... | 🔵 6.0 | OneNote |
| 9 📋 | Entra joined VM: 'A specified logon session does not exist. It may already have ... | Kerberos server object not properly created/configured for SSO | Verify Kerberos server object is properly created and configured per SSO configu... | 🔵 5.0 | MS Learn |

## Quick Triage Path

1. Check: CredSSP fallback is not supported from workgroup/n `[Source: OneNote]`
2. Check: Two missing prerequisites: (1) Issuing CA certific `[Source: OneNote]`
3. Check: Network Level Authentication (NLA) state corruptio `[Source: OneNote]`
4. Check: Required TLS 1.2 cipher AES128-SHA256 (required by `[Source: OneNote]`
5. Check: Network connectivity issue between client and AVD `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-authentication-sso-2.md#troubleshooting-flow)
