# DEFENDER Guest Config 基线 — Comprehensive Troubleshooting Guide

**Entries**: 9 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-container-baselines-product-knowledge.md, ado-wiki-a-guest-config-agent-product-knowledge.md, ado-wiki-a-guest-config-baselines-tsg.md, ado-wiki-a-guest-config-security-baselines-support-boundaries.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Mdvm
> Sources: mslearn

**1. Security baselines assessment shows no results or errors on non-English Windows systems - assessment fails silently on machines with non-English Windows system locale**

- **Root Cause**: Security baseline assessment in MDVM is not supported on non-English Windows system locale. The assessment engine depends on English locale for parsing GPO settings.
- **Solution**: Ensure target machines are running English Windows system locale. There is no workaround for non-English locales; this is a known limitation. Change system locale to English if baseline assessment is required.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Security baselines assessment fails or returns no data on Windows Server 2012 R2 machines with DFSS (Dynamic Fair Share Scheduling) enabled**

- **Root Cause**: Security baseline assessment is not supported when DFSS (Dynamic Fair Share Scheduling) is enabled on Windows Server 2012 R2. DFSS interferes with the assessment data collection process.
- **Solution**: Disable DFSS on the Windows Server 2012 R2 machine before running baseline assessment, or exclude these machines from baseline profiles.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Security baselines assessment returns inaccurate or incomplete results - PowerShell Constrained Language Mode is enabled on target devices**

- **Root Cause**: For security baseline assessment to be successful, PowerShell Constrained Language Mode must be set to off on devices. When CLM is enabled, the assessment scripts cannot execute properly.
- **Solution**: Set PowerShell Constrained Language Mode to off on target devices. Verify by running $ExecutionContext.SessionState.LanguageMode in PowerShell - it should return FullLanguage. Reassess after disabling CLM.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. Security baselines assessment shows inaccurate or incomplete compliance results for certain CIS, STIG, and Microsoft benchmark configurations**

- **Root Cause**: Known data collection issues affect specific benchmark versions: CIS 17.x.x series, CIS 2.3.x and 1.1.5, Microsoft 2.x/3.x checks, MCS certificate store checks, and numerous STIG SV-* checks.
- **Solution**: Exclude affected tests from benchmark profile while running assessment. Affected CIS checks: 17.1.1-17.9.5, 2.3.2.2, 2.3.7.3-2.3.7.5, 2.3.10.1, 1.1.5. Affected Microsoft checks: 2.1-2.52, 3.55/3.57/3.60/3.72. See docs for full STIG list. Microsoft is actively working on fixes.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. Security baselines assessment only supports GPO configurations - Intune/Microsoft Configuration Manager settings not evaluated**

- **Root Cause**: The MDVM security baselines benchmarks currently only support Group Policy Object (GPO) configurations. Microsoft Configuration Manager (Intune) configurations are not assessed.
- **Solution**: This is a known limitation. Use GPO to manage baseline configurations on assessed devices. For Intune-managed devices, use Intune built-in compliance policies and security baselines as an alternative assessment method.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 2: Baselines
> Sources: ado-wiki

**1. Security baseline assessment for VM fails to change status even after making the recommended configuration changes**

- **Root Cause**: Actual configuration values still do not match expected values in the security baseline evaluation, or cached results have not refreshed.
- **Solution**: Review security baseline expected vs actual results for the specific assessment rule. Verify the exact configuration values match. See Baselines (Security Configuration) TSG.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Security Configuration/Baselines recommendations (OS misconfigurations based on MCSB) disappeared or became unavailable after September 2024. Customer previously had access under free tier or Foundati**

- **Root Cause**: As part of MMA deprecation (September 2024 GA), Security Configuration powered by Guest Configuration agent was moved exclusively to Defender for Servers Plan 2. Previously available to free-tier customers, no longer accessible without Plan 2.
- **Solution**: Enable Defender for Servers Plan 2 to access Baselines recommendations. Refer to learn.microsoft.com/azure/defender-for-cloud/prepare-deprecation-log-analytics-mma-agent. Rules cannot be changed/added/removed; for custom rules enable Machine Configuration service (paid). Escalation: false-positives to CxE/CEM MDC; Guest Config provisioning to Machine Configuration/CSS Escalation.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Guest Configuration
> Sources: mslearn

**1. Guest Configuration extension assessment failing on Azure VMs - machine configuration data not collected, no compliance results**

- **Root Cause**: Azure VMs (not Arc-enabled) require a system-assigned managed identity for the Guest Configuration extension to work properly. Without it, the extension cannot authenticate and collect data.
- **Solution**: Remediate recommendation: Virtual machines Guest Configuration extension should be deployed with system-assigned managed identity. Also install the Guest Configuration extension via: Guest Configuration extension should be installed on machines. For AWS/GCP, machine configuration is installed by default with Arc provisioning.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — MS Learn]`

### Phase 4: Os Misconfiguration
> Sources: mslearn

**1. OS misconfiguration recommendations (Windows/Linux machines should meet requirements of Azure compute security baseline) not appearing in Defender for Cloud**

- **Root Cause**: OS misconfiguration recommendations based on MCSB compute security baselines are not included in free foundational CSPM. They require Defender for Servers Plan 2 to be enabled.
- **Solution**: Enable Defender for Servers Plan 2 on the subscription. Verify the Azure policies for Windows/Linux compute security baselines are active. Do not remove these policies or the machine configuration extension cannot collect data.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Security baseline assessment for VM fails to change status even after making the recommended conf... | Actual configuration values still do not match expected values in the security baseline evaluatio... | Review security baseline expected vs actual results for the specific assessment rule. Verify the ... | 🟢 8.5 | ADO Wiki |
| 2 | Security Configuration/Baselines recommendations (OS misconfigurations based on MCSB) disappeared... | As part of MMA deprecation (September 2024 GA), Security Configuration powered by Guest Configura... | Enable Defender for Servers Plan 2 to access Baselines recommendations. Refer to learn.microsoft.... | 🟢 8.5 | ADO Wiki |
| 3 | Guest Configuration extension assessment failing on Azure VMs - machine configuration data not co... | Azure VMs (not Arc-enabled) require a system-assigned managed identity for the Guest Configuratio... | Remediate recommendation: Virtual machines Guest Configuration extension should be deployed with ... | 🔵 7.5 | MS Learn |
| 4 ⚠️ | Security baselines assessment shows no results or errors on non-English Windows systems - assessm... | Security baseline assessment in MDVM is not supported on non-English Windows system locale. The a... | Ensure target machines are running English Windows system locale. There is no workaround for non-... | 🔵 6.0 | MS Learn |
| 5 ⚠️ | Security baselines assessment fails or returns no data on Windows Server 2012 R2 machines with DF... | Security baseline assessment is not supported when DFSS (Dynamic Fair Share Scheduling) is enable... | Disable DFSS on the Windows Server 2012 R2 machine before running baseline assessment, or exclude... | 🔵 6.0 | MS Learn |
| 6 ⚠️ | Security baselines assessment returns inaccurate or incomplete results - PowerShell Constrained L... | For security baseline assessment to be successful, PowerShell Constrained Language Mode must be s... | Set PowerShell Constrained Language Mode to off on target devices. Verify by running $ExecutionCo... | 🔵 6.0 | MS Learn |
| 7 ⚠️ | Security baselines assessment shows inaccurate or incomplete compliance results for certain CIS, ... | Known data collection issues affect specific benchmark versions: CIS 17.x.x series, CIS 2.3.x and... | Exclude affected tests from benchmark profile while running assessment. Affected CIS checks: 17.1... | 🔵 6.0 | MS Learn |
| 8 ⚠️ | Security baselines assessment only supports GPO configurations - Intune/Microsoft Configuration M... | The MDVM security baselines benchmarks currently only support Group Policy Object (GPO) configura... | This is a known limitation. Use GPO to manage baseline configurations on assessed devices. For In... | 🔵 6.0 | MS Learn |
| 9 ⚠️ | OS misconfiguration recommendations (Windows/Linux machines should meet requirements of Azure com... | OS misconfiguration recommendations based on MCSB compute security baselines are not included in ... | Enable Defender for Servers Plan 2 on the subscription. Verify the Azure policies for Windows/Lin... | 🔵 6.0 | MS Learn |
