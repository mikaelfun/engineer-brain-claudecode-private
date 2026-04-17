# Entra ID Mooncake/21V Specific Issues — 排查工作流

**来源草稿**: onenote-21v-test-environments.md, onenote-connectivity-testing-script-mooncake.md, onenote-ds-explorer-mooncake.md, onenote-entra-id-feature-parity-mooncake.md, onenote-ests-cdn-mooncake.md, onenote-ido-21v-portals-readiness.md, onenote-jarvis-query-examples-mooncake.md, onenote-mooncake-aad-tool-readiness.md, onenote-mooncake-entra-id-tool-readiness.md, onenote-mooncake-kusto-endpoints.md... (+1 more)
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: DS Explorer (Mooncake) Guide
> 来源: onenote-ds-explorer-mooncake.md | 适用: Mooncake ✅

### 排查步骤
- 1. In Search block, input tenant GUID or domain name and search
- 2. Use **Browse Objects** if you know the object type
- 3. Use **Search Objects** if you only have object ID

---

## Scenario 2: ESTS CDN Infrastructure (Mooncake)
> 来源: onenote-ests-cdn-mooncake.md | 适用: Mooncake ✅

---

## Scenario 3: Jarvis Query Examples for Mooncake (EvoSTS / MSODS)
> 来源: onenote-jarvis-query-examples-mooncake.md | 适用: Mooncake ✅

---

## Scenario 4: Mooncake AAD Troubleshooting Tool Readiness
> 来源: onenote-mooncake-aad-tool-readiness.md | 适用: Mooncake ✅

### 排查步骤
- 1. Apply CME account and smartcard: [CME Account and Smart Card Services](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/CME-Account-and-Smart-Card-Services.aspx)
- 2. Offline unblock smartcard: [Unblock Security Key](https://cloudmfa-support.azurewebsites.net/SecurityKeyServices/SecurityKeyUnblock)
- 3. Request to join group `CME\CSS-MooncakeCME` on [oneidentity.core.windows.net](https://oneidentity.core.windows.net)
- 4. Periodically reset CME password on oneidentity portal
- 5. Renew smartcard certificate before expiry

---

## Scenario 5: Mooncake Entra ID Troubleshooting Tool Readiness
> 来源: onenote-mooncake-entra-id-tool-readiness.md | 适用: Mooncake ✅

---

## Scenario 6: Mooncake Entra ID Kusto Cluster Endpoints & Portal URLs
> 来源: onenote-mooncake-kusto-endpoints.md | 适用: Mooncake ✅

---

## Scenario 7: Seamless SSO in Mooncake - Setup Guide
> 来源: onenote-seamless-sso-mooncake-setup.md | 适用: Mooncake ✅

### 排查步骤
1. **Steps**
   - 1. On AAD Connect server, open PowerShell
   - 2. Navigate to `%programfiles%\Microsoft Azure Active Directory Connect`
   - 3. Import the module:

---
