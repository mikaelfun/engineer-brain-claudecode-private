# AVD AVD GPO 配置 - Quick Reference

**Entries**: 4 | **21V**: partial
**Keywords**: 0x80072f7d, drive-redirection, ecc-cipher, file-transfer, gpo, group-policy, intune, licensing
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Cloud PC users consistently disconnected after fixed period of inactivity (e.g.,... | Session timeout policies configured via MaxIdleTime or MaxConnectionTime registr... | Check MSRD-Diag.html > AVD/RDS/W365 > Session Time Limits. Review registry at HK... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Unable to connect to WVD VM. Reverse connect to rdgateway failed with error 0x80... | GPO controlling ECC curve order enabled on WVD VMs restricting SSL cipher config... | Disable ECC curve order GPO or remove EccCurves registry under SSL config. | 🔵 6.5 | KB |
| 3 📋 | Remote Desktop licensing mode not configured - RDS will stop working in X days | Missing Windows updates or GPO Set the Remote Desktop licensing mode is Enabled | Disable the licensing mode GPO; install KB4516077 for 1809 or redeploy with late... | 🔵 6.5 | MS Learn |
| 4 📋 | Network > tsclient folder is empty when trying to transfer files to/from Cloud P... | Drive redirection is blocked by GPO or Intune policy (Do not allow drive redirec... | Collect ODC from affected computer. Validate if Do not allow drive redirection i... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: Session timeout policies configured via MaxIdleTim `[Source: ADO Wiki]`
2. Check: GPO controlling ECC curve order enabled on WVD VMs `[Source: KB]`
3. Check: Missing Windows updates or GPO Set the Remote Desk `[Source: MS Learn]`
4. Check: Drive redirection is blocked by GPO or Intune poli `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-gpo-config.md#troubleshooting-flow)
