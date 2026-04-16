# Entra ID User Provisioning (SCIM) — 排查工作流

**来源草稿**: ado-wiki-b-build-self-hosted-scim-lab.md, ado-wiki-b-configuring-provisioning.md, ado-wiki-b-entra-enterprise-app-provisioning-ui-changes.md, ado-wiki-b-identity-provisioning-with-entra-id.md, ado-wiki-b-user-provisioning-errors-graph.md, ado-wiki-c-entra-inbound-user-provisioning.md, ado-wiki-d-scim-identity-s500-sev-c-volume-transition.md, ado-wiki-f-understanding-aad-provisioning-engine.md, onenote-fiddler-sso-provisioning-troubleshoot.md, onenote-sso-provisioning-fiddler.md
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: Build your own self-hosted SCIM endpoint with a persistent non-SQL database
> 来源: ado-wiki-b-build-self-hosted-scim-lab.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Create your server first**
   - *Note**: This procedure assumes an Azure VM server installation. If you prefer to use your MyWorkspace, see **Appendix A**.
   - 1. **Create a new Azure VM** with Windows Server Datacenter 2016/2019/2022
   - Standard_B2s is sufficient
2. **Step 2: Install Bun**
   - 1. Log-in into the machine and install **bun** (via PowerShell):
   - powershell -c "irm bun.sh/install.ps1 | iex"

---

## Scenario 2: How to Configure Provisioning
> 来源: ado-wiki-b-configuring-provisioning.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **Long-lived bearer token**: Copy OAuth bearer token into the **Secret Token** field. Test tokens from `/scim/token` endpoint should not be used in production.
- 2. **Microsoft Entra bearer token**: If Secret Token field is left blank, Entra ID includes its own OAuth bearer token.

---

## Scenario 3: Microsoft Entra API-Driven Inbound User Provisioning
> 来源: ado-wiki-c-entra-inbound-user-provisioning.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting**

---

## Scenario 4: ado-wiki-d-scim-identity-s500-sev-c-volume-transition
> 来源: ado-wiki-d-scim-identity-s500-sev-c-volume-transition.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 5: Understanding the AAD Provisioning Engine
> 来源: ado-wiki-f-understanding-aad-provisioning-engine.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 6: Using Fiddler to Troubleshoot SSO Application User Provisioning
> 来源: onenote-fiddler-sso-provisioning-troubleshoot.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Open Fiddler trace
   - 2. Sign in to Azure AD → Enterprise Applications
   - 3. Select the target application → click **Provisioning**

---

## Scenario 7: SSO Application User Provisioning - Fiddler Troubleshooting
> 来源: onenote-sso-provisioning-fiddler.md | 适用: Mooncake ✅

### 排查步骤
1. **Steps**
   - 1. Open Fiddler trace
   - 2. Sign in to Azure AD, navigate to **Enterprise Applications**
   - 3. Select the target application and click **Provisioning**

---
