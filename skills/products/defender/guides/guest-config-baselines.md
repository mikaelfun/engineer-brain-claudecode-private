# DEFENDER Guest Config 基线 — Troubleshooting Quick Reference

**Entries**: 9 | **21V**: 3/9 applicable
**Sources**: ado-wiki, mslearn | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/guest-config-baselines.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Security baseline assessment for VM fails to change status even after making the recommended conf... | Actual configuration values still do not match expected values in the security baseline evaluatio... | Review security baseline expected vs actual results for the specific assessment rule. Verify the ... | 🟢 8.5 | ADO Wiki |
| 2 | Security Configuration/Baselines recommendations (OS misconfigurations based on MCSB) disappeared... | As part of MMA deprecation (September 2024 GA), Security Configuration powered by Guest Configura... | Enable Defender for Servers Plan 2 to access Baselines recommendations. Refer to learn.microsoft.... | 🟢 8.5 | ADO Wiki |
| 3 | Guest Configuration extension assessment failing on Azure VMs - machine configuration data not co... | Azure VMs (not Arc-enabled) require a system-assigned managed identity for the Guest Configuratio... | Remediate recommendation: Virtual machines Guest Configuration extension should be deployed with ... | 🔵 7.5 | MS Learn |
| 4 | Security baselines assessment shows no results or errors on non-English Windows systems - assessm... | Security baseline assessment in MDVM is not supported on non-English Windows system locale. The a... | Ensure target machines are running English Windows system locale. There is no workaround for non-... | 🔵 6.0 | MS Learn |
| 5 | Security baselines assessment fails or returns no data on Windows Server 2012 R2 machines with DF... | Security baseline assessment is not supported when DFSS (Dynamic Fair Share Scheduling) is enable... | Disable DFSS on the Windows Server 2012 R2 machine before running baseline assessment, or exclude... | 🔵 6.0 | MS Learn |
| 6 | Security baselines assessment returns inaccurate or incomplete results - PowerShell Constrained L... | For security baseline assessment to be successful, PowerShell Constrained Language Mode must be s... | Set PowerShell Constrained Language Mode to off on target devices. Verify by running $ExecutionCo... | 🔵 6.0 | MS Learn |
| 7 | Security baselines assessment shows inaccurate or incomplete compliance results for certain CIS, ... | Known data collection issues affect specific benchmark versions: CIS 17.x.x series, CIS 2.3.x and... | Exclude affected tests from benchmark profile while running assessment. Affected CIS checks: 17.1... | 🔵 6.0 | MS Learn |
| 8 | Security baselines assessment only supports GPO configurations - Intune/Microsoft Configuration M... | The MDVM security baselines benchmarks currently only support Group Policy Object (GPO) configura... | This is a known limitation. Use GPO to manage baseline configurations on assessed devices. For In... | 🔵 6.0 | MS Learn |
| 9 | OS misconfiguration recommendations (Windows/Linux machines should meet requirements of Azure com... | OS misconfiguration recommendations based on MCSB compute security baselines are not included in ... | Enable Defender for Servers Plan 2 on the subscription. Verify the Azure policies for Windows/Lin... | 🔵 6.0 | MS Learn |

## Quick Troubleshooting Path

1. Review security baseline expected vs actual results for the specific assessment rule. Verify the exact configuration values match. See Baselines (Security Configuration) TSG. `[Source: ADO Wiki]`
2. Enable Defender for Servers Plan 2 to access Baselines recommendations. Refer to learn.microsoft.com/azure/defender-for-cloud/prepare-deprecation-log-analytics-mma-agent. Rules cannot be changed/ad... `[Source: ADO Wiki]`
3. Remediate recommendation: Virtual machines Guest Configuration extension should be deployed with system-assigned managed identity. Also install the Guest Configuration extension via: Guest Configur... `[Source: MS Learn]`
4. Ensure target machines are running English Windows system locale. There is no workaround for non-English locales; this is a known limitation. Change system locale to English if baseline assessment ... `[Source: MS Learn]`
5. Disable DFSS on the Windows Server 2012 R2 machine before running baseline assessment, or exclude these machines from baseline profiles. `[Source: MS Learn]`
