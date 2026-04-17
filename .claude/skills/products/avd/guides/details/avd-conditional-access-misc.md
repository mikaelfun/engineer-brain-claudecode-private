# AVD AVD 条件访问与 MFA - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 6 | **Drafts fused**: 1 | **Kusto queries fused**: 0
**Source drafts**: onenote-avd-mfa-conditional-access.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, KB

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Azure portal shows Session Ending and Experiencing Authentic... | Conditional Access Policy requiring users to accept TOU for ... | 1) Remove the Conditional Access Policy. 2) Have user sign i... |
| AADJ VMs in AVD: Web Client connection fails with We could n... | Per-user MFA is enabled. Per-user Enabled/Enforced Azure AD ... | Remove per user MFA. Configure MFA using conditional access ... |
| Need to block AVD web client access and allow connection onl... | - | Create a Conditional Access policy: select users/groups, tar... |
| Domain join fails with Timeout waiting for user input | Domain join account has MFA enabled | Remove MFA or use service account |
| AVD Agent and Boot Loader not installed; ScriptLog.log missi... | PowerShell DSC failed - wrong credentials or insufficient pe... | Manually install via PowerShell; verify admin access and no ... |
| Entra joined VM: 'The logon attempt failed' on Windows Secur... | Device not Entra joined/hybrid joined to same tenant, or PKU... | Ensure device is Entra joined/hybrid joined to same tenant. ... |

### Phase 2: Detailed Investigation

#### AVD MFA Setup via Conditional Access
> Source: [onenote-avd-mfa-conditional-access.md](guides/drafts/onenote-avd-mfa-conditional-access.md)

**Source**: OneNote Lab Verification (Rika, 2021-11)

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Azure portal shows Session Ending and Experiencing Authentication Issues when as... | Conditional Access Policy requiring users to accept TOU for data storage. Azure ... | 1) Remove the Conditional Access Policy. 2) Have user sign in to SharePoint firs... | 🔵 6.5 | KB |
| 2 | AADJ VMs in AVD: Web Client connection fails with We could not connect because o... | Per-user MFA is enabled. Per-user Enabled/Enforced Azure AD Multi-Factor Authent... | Remove per user MFA. Configure MFA using conditional access policy instead. | 🔵 6.5 | KB |
| 3 | Need to block AVD web client access and allow connection only from AVD Desktop a... | - | Create a Conditional Access policy: select users/groups, target AVD app IDs (9cd... | 🔵 6.5 | KB |
| 4 | Domain join fails with Timeout waiting for user input | Domain join account has MFA enabled | Remove MFA or use service account | 🔵 6.5 | MS Learn |
| 5 | AVD Agent and Boot Loader not installed; ScriptLog.log missing | PowerShell DSC failed - wrong credentials or insufficient permissions | Manually install via PowerShell; verify admin access and no MFA | 🔵 6.0 | MS Learn |
| 6 | Entra joined VM: 'The logon attempt failed' on Windows Security credential promp... | Device not Entra joined/hybrid joined to same tenant, or PKU2U protocol not enab... | Ensure device is Entra joined/hybrid joined to same tenant. Enable PKU2U protoco... | 🔵 5.0 | MS Learn |
