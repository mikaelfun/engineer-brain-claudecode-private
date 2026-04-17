# AVD AVD GPO 配置 - Comprehensive Troubleshooting Guide

**Entries**: 4 | **Drafts fused**: 1 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-track-power-on-events.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Cloud PC users consistently disconnected after fixed period ... | Session timeout policies configured via MaxIdleTime or MaxCo... | Check MSRD-Diag.html > AVD/RDS/W365 > Session Time Limits. R... |
| Unable to connect to WVD VM. Reverse connect to rdgateway fa... | GPO controlling ECC curve order enabled on WVD VMs restricti... | Disable ECC curve order GPO or remove EccCurves registry und... |
| Remote Desktop licensing mode not configured - RDS will stop... | Missing Windows updates or GPO Set the Remote Desktop licens... | Disable the licensing mode GPO; install KB4516077 for 1809 o... |
| Network > tsclient folder is empty when trying to transfer f... | Drive redirection is blocked by GPO or Intune policy (Do not... | Collect ODC from affected computer. Validate if Do not allow... |

### Phase 2: Detailed Investigation

#### ado-wiki-a-track-power-on-events.md
> Source: [ado-wiki-a-track-power-on-events.md](guides/drafts/ado-wiki-a-track-power-on-events.md)

**This is mostly useful for Frontline Dedicated, where the machines are deallocated after use and started when the user is trying to connect.**

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Cloud PC users consistently disconnected after fixed period of inactivity (e.g.,... | Session timeout policies configured via MaxIdleTime or MaxConnectionTime registr... | Check MSRD-Diag.html > AVD/RDS/W365 > Session Time Limits. Review registry at HK... | 🔵 7.5 | ADO Wiki |
| 2 | Unable to connect to WVD VM. Reverse connect to rdgateway failed with error 0x80... | GPO controlling ECC curve order enabled on WVD VMs restricting SSL cipher config... | Disable ECC curve order GPO or remove EccCurves registry under SSL config. | 🔵 6.5 | KB |
| 3 | Remote Desktop licensing mode not configured - RDS will stop working in X days | Missing Windows updates or GPO Set the Remote Desktop licensing mode is Enabled | Disable the licensing mode GPO; install KB4516077 for 1809 or redeploy with late... | 🔵 6.5 | MS Learn |
| 4 | Network > tsclient folder is empty when trying to transfer files to/from Cloud P... | Drive redirection is blocked by GPO or Intune policy (Do not allow drive redirec... | Collect ODC from affected computer. Validate if Do not allow drive redirection i... | 🔵 6.0 | ADO Wiki |
