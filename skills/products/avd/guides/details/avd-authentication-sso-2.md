# AVD AVD 认证与 SSO (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 9 | **Drafts fused**: 5 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-enable-schannel-logging.md, ado-wiki-a-host-pool-aad-auth-context-setup.md, ado-wiki-azure-ad-rdp-authentication-overview.md, onenote-avd-adfs-sso.md, onenote-avd-authentication-protocols.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Workgroup (non-AAD-joined) Windows client fails to RDP conne... | CredSSP fallback is not supported from workgroup/non-joined ... | Add targetisaadjoined:i:1 as custom RDP property to the host... |
| Windows Hello For Business (WHfB) authentication fails when ... | Two missing prerequisites: (1) Issuing CA certificate for KD... | 1. Add CA cert to NTAuth store: Certutil -enterprise -addsto... |
| AVD session connects but immediately logs off. User sees dia... | Network Level Authentication (NLA) state corruption on the s... | 1) Disable NLA via Azure Portal Run Command or registry. 2) ... |
| AVD session connects but immediately logs off. User sees dia... | Network Level Authentication (NLA) state corruption on the s... | 1) Disable NLA via Azure Portal Run Command or registry. 2) ... |
| All users in all host pools fail to connect to AVD session h... | Required TLS 1.2 cipher AES128-SHA256 (required by Azure Fro... | 1. Check SSL Cipher Suite Order GPO via gpresult. 2. Verify ... |
| AVD users fail to connect frequently with error 'Reverse Con... | Network connectivity issue between client and AVD rdgateway ... | 1. Use Kusto DiagActivity+DiagError join to identify failed ... |
| ADFS SSO for AVD does not work in Azure AD DS (AADDS) enviro... | AVD ADFS SSO has three limitations: (1) Not supported with A... | Use on-premises AD FS with federated authentication. Deploy ... |
| AVD users see ADFS login prompt for session host RDP sign-in... | AAD cookie is still valid allowing silent sign-in to AVD gat... | This is expected behavior when ADFS cookie expires before AA... |

### Phase 2: Detailed Investigation

#### ado-wiki-a-enable-schannel-logging.md
> Source: [ado-wiki-a-enable-schannel-logging.md](guides/drafts/ado-wiki-a-enable-schannel-logging.md)

<div id='cssfeedback-start'></div>

#### Host Pool Access Based on AAD Authentication Context – Setup Guide
> Source: [ado-wiki-a-host-pool-aad-auth-context-setup.md](guides/drafts/ado-wiki-a-host-pool-aad-auth-context-setup.md)

> ⚠️ **Stop**: Content in development, not ready for consumption. Internal Microsoft only.

#### Azure AD Authentication for RDP - Overview
> Source: [ado-wiki-azure-ad-rdp-authentication-overview.md](guides/drafts/ado-wiki-azure-ad-rdp-authentication-overview.md)

**Private Preview has started for this feature**

#### AVD ADFS SSO Configuration Guide (Mooncake)
> Source: [onenote-avd-adfs-sso.md](guides/drafts/onenote-avd-adfs-sso.md)

> Source: OneNote - Mooncake POD Support Notebook

#### AVD Authentication Protocols for AADJ Session Hosts
> Source: [onenote-avd-authentication-protocols.md](guides/drafts/onenote-avd-authentication-protocols.md)

> Source: OneNote - Mooncake POD Support Notebook (AVD Authentication + RDP scenarios)

*Contains 1 KQL query template(s)*

### Key KQL Queries

**Query 1:**
```kql
cluster('rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagCheckpoint
| where TIMESTAMP > datetime(2026-01-21T08:00)
| where ActivityId == "<correlation-id>"
| where Name == "OnSecurityProviderNegotiated"
| project TIMESTAMP, Name, ReportedBy, RequestId, Parameters, ParametersNonPii
| order by TIMESTAMP asc
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Workgroup (non-AAD-joined) Windows client fails to RDP connect to Azure AD-joine... | CredSSP fallback is not supported from workgroup/non-joined clients to AADJ VMs.... | Add targetisaadjoined:i:1 as custom RDP property to the host pool to enable RDST... | 🟢 8.0 | OneNote |
| 2 | Windows Hello For Business (WHfB) authentication fails when RDP to Azure-hosted ... | Two missing prerequisites: (1) Issuing CA certificate for KDC certificate not in... | 1. Add CA cert to NTAuth store: Certutil -enterprise -addstore NTAuth issuingCA.... | 🟢 8.0 | OneNote |
| 3 | AVD session connects but immediately logs off. User sees dialog box disappear af... | Network Level Authentication (NLA) state corruption on the session host VM, poss... | 1) Disable NLA via Azure Portal Run Command or registry. 2) Restart the VM to ap... | 🔵 6.0 | OneNote |
| 4 | AVD session connects but immediately logs off. User sees dialog box disappear af... | Network Level Authentication (NLA) state corruption on the session host VM, poss... | 1) Disable NLA via Azure Portal Run Command or registry. 2) Restart the VM to ap... | 🔵 6.0 | OneNote |
| 5 | All users in all host pools fail to connect to AVD session hosts. RD Client show... | Required TLS 1.2 cipher AES128-SHA256 (required by Azure Front Door for AVD conn... | 1. Check SSL Cipher Suite Order GPO via gpresult. 2. Verify registry HKLM\SYSTEM... | 🔵 6.0 | OneNote |
| 6 | AVD users fail to connect frequently with error 'Reverse Connect to rdgateway-*.... | Network connectivity issue between client and AVD rdgateway endpoints. VPN route... | 1. Use Kusto DiagActivity+DiagError join to identify failed connections and erro... | 🔵 6.0 | OneNote |
| 7 | ADFS SSO for AVD does not work in Azure AD DS (AADDS) environment. SSO only avai... | AVD ADFS SSO has three limitations: (1) Not supported with Azure AD DS, (2) Requ... | Use on-premises AD FS with federated authentication. Deploy AD FS server (not AA... | 🔵 6.0 | OneNote |
| 8 | AVD users see ADFS login prompt for session host RDP sign-in even though AAD gat... | AAD cookie is still valid allowing silent sign-in to AVD gateway, but ADFS cooki... | This is expected behavior when ADFS cookie expires before AAD cookie. After user... | 🔵 6.0 | OneNote |
| 9 | Entra joined VM: 'A specified logon session does not exist. It may already have ... | Kerberos server object not properly created/configured for SSO | Verify Kerberos server object is properly created and configured per SSO configu... | 🔵 5.0 | MS Learn |
