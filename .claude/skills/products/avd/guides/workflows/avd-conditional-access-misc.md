# AVD 条件访问与 MFA - 杂项 — 排查工作流

**来源草稿**: onenote-avd-mfa-conditional-access.md
**Kusto 引用**: (无)
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: AVD MFA Setup via Conditional Access
> 来源: onenote-avd-mfa-conditional-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**Source**: OneNote Lab Verification (Rika, 2021-11)
**Status**: Draft — pending SYNTHESIZE review

## Scenario 2: Overview
> 来源: onenote-avd-mfa-conditional-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Enable Azure MFA for Azure Virtual Desktop using Conditional Access policies.

## Scenario 3: Prerequisites
> 来源: onenote-avd-mfa-conditional-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Azure AD Premium P1 or P2 license
   - Azure MFA enabled for target users
   - Azure Virtual Desktop app registered in Azure AD

## Scenario 4: 1. Enable MFA for user
> 来源: onenote-avd-mfa-conditional-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Azure AD > Users > Per-user MFA > Enable for target users

## Scenario 5: 2. Create Conditional Access Policy
> 来源: onenote-avd-mfa-conditional-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. **Users**: Select target user(s) or group(s)
2. **Cloud apps**: Select "Azure Virtual Desktop" (App ID: 9cdead84-a844-4324-93f2-b2e6bb768d07)
3. **Conditions**: Configure as needed (e.g., location, device platform)
4. **Grant**: Require multifactor authentication
5. **Session**: Configure sign-in frequency if needed (e.g., every 8 hours)
6. **Enable policy**: On

## Scenario 6: 3. Verify
> 来源: onenote-avd-mfa-conditional-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Login via Windows Desktop Client
   - MFA prompt should appear during sign-in
   - After MFA completion, user should connect to session host

## Scenario 7: Notes
> 来源: onenote-avd-mfa-conditional-access.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Sign-in frequency controls how often users must re-authenticate
   - Conditional Access can be scoped to specific locations, devices, or risk levels
   - Reference: [Azure multifactor authentication for AVD](https://docs.microsoft.com/en-us/azure/virtual-desktop/set-up-mfa)
