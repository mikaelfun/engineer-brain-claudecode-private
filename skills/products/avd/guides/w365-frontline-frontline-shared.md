# AVD W365 Frontline 一线员工 - frontline-shared - Quick Reference

**Entries**: 8 | **21V**: all applicable
**Keywords**: autopilot, autopilot-v2, cloud-apps, dpp, dppnotenabled, fls, frontline-shared, intune
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Autopilot Device Preparation Policy (DPP) fails or is not available for Frontlin... | Device Preparation for Frontline Shared only works with Windows 11 images. Windo... | Use a Windows 11 image in the provisioning policy when using Autopilot Device Pr... | 🔵 7.5 | ADO Wiki |
| 2 | Windows 365 Frontline Shared provisioning policy with more than 10,000 users in ... | Known platform limitation: maximum 10,000 users per assignment group for Frontli... | Split users into multiple groups (each <= 10,000) and create separate provisioni... | 🔵 7.5 | ADO Wiki |
| 3 | Cloud Apps stuck in Preparing status after Cloud PCs successfully provisioned an... | Policy assignment issue preventing Cloud Apps discovery from completing | Delete and recreate the policy assignment | 🔵 7.5 | ADO Wiki |
| 4 | Windows 365 Frontline Shared Cloud PC provisioned with warnings: DPP not enabled... | Device Preparation Profile (DPP) not created as Automatic (Preview) or not assig... | 1. Verify DPP profile is created as Automatic (Preview) and assigned to a clean ... | 🔵 7.5 | ADO Wiki |
| 5 | Frontline Shared Cloud PC provisioned with warnings, DPP not enabled error (DppN... | Device Preparation Profile not assigned to device group, or Intune Provisioning ... | 1. Verify DPP profile created as Automatic (Preview) assigned to clean device gr... | 🔵 7.5 | ADO Wiki |
| 6 | Windows 365 Frontline Shared Cloud PC provisioned with warnings, DPP profile not... | Device Preparation Profile not created as Automatic (Preview), device group owne... | 1. Create DPP profile as Automatic (Preview) and assign to device group. 2. Set ... | 🔵 7.5 | ADO Wiki |
| 7 | Windows 365 Frontline Shared Cloud PC provisioned with warnings; DPP (Device Pre... | DPP Automatic (Preview) profile not assigned to device group, or Intune Provisio... | Verify: 1) DPP profile created as Automatic (Preview) and assigned to device gro... | 🔵 7.5 | ADO Wiki |
| 8 | FLS Cloud PC provisioned with warnings; DPP profile shows as not assigned; error... | Device Preparation Profile not configured correctly: not created as Automatic (P... | 1. Verify DPP profile is created as Automatic (Preview) and assigned to correct ... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: Device Preparation for Frontline Shared only works `[Source: ADO Wiki]`
2. Check: Known platform limitation: maximum 10,000 users pe `[Source: ADO Wiki]`
3. Check: Policy assignment issue preventing Cloud Apps disc `[Source: ADO Wiki]`
4. Check: Device Preparation Profile (DPP) not created as Au `[Source: ADO Wiki]`
5. Check: Device Preparation Profile not assigned to device `[Source: ADO Wiki]`
