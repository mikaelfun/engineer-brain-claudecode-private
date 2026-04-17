# AVD AVD 条件访问与 MFA - 杂项 - Quick Reference

**Entries**: 6 | **21V**: partial
**Keywords**: agent, authentication, boot-loader, domain-join, dsc, entra-join, logon-failed, mfa
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Azure portal shows Session Ending and Experiencing Authentication Issues when as... | Conditional Access Policy requiring users to accept TOU for data storage. Azure ... | 1) Remove the Conditional Access Policy. 2) Have user sign in to SharePoint firs... | 🔵 6.5 | KB |
| 2 📋 | AADJ VMs in AVD: Web Client connection fails with We could not connect because o... | Per-user MFA is enabled. Per-user Enabled/Enforced Azure AD Multi-Factor Authent... | Remove per user MFA. Configure MFA using conditional access policy instead. | 🔵 6.5 | KB |
| 3 📋 | Need to block AVD web client access and allow connection only from AVD Desktop a... | - | Create a Conditional Access policy: select users/groups, target AVD app IDs (9cd... | 🔵 6.5 | KB |
| 4 📋 | Domain join fails with Timeout waiting for user input | Domain join account has MFA enabled | Remove MFA or use service account | 🔵 6.5 | MS Learn |
| 5 📋 | AVD Agent and Boot Loader not installed; ScriptLog.log missing | PowerShell DSC failed - wrong credentials or insufficient permissions | Manually install via PowerShell; verify admin access and no MFA | 🔵 6.0 | MS Learn |
| 6 📋 | Entra joined VM: 'The logon attempt failed' on Windows Security credential promp... | Device not Entra joined/hybrid joined to same tenant, or PKU2U protocol not enab... | Ensure device is Entra joined/hybrid joined to same tenant. Enable PKU2U protoco... | 🔵 5.0 | MS Learn |

## Quick Triage Path

1. Check: Conditional Access Policy requiring users to accep `[Source: KB]`
2. Check: Per-user MFA is enabled. Per-user Enabled/Enforced `[Source: KB]`
3. Check: Unknown `[Source: KB]`
4. Check: Domain join account has MFA enabled `[Source: MS Learn]`
5. Check: PowerShell DSC failed - wrong credentials or insuf `[Source: MS Learn]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-conditional-access-misc.md#troubleshooting-flow)
