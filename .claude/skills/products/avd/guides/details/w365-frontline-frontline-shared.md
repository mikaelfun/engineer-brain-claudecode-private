# AVD W365 Frontline 一线员工 - frontline-shared - Issue Details

**Entries**: 8 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Autopilot Device Preparation Policy (DPP) fails or is not available for Frontline Shared (FLS) Cloud...
- **ID**: `avd-ado-wiki-085`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Device Preparation for Frontline Shared only works with Windows 11 images. Windows 10 images are not supported for this feature.
- **Solution**: Use a Windows 11 image in the provisioning policy when using Autopilot Device Preparation with Frontline Shared Cloud PCs.
- **Tags**: DPP, autopilot, frontline-shared, FLS, windows-10, provisioning, w365

### 2. Windows 365 Frontline Shared provisioning policy with more than 10,000 users in assigned group - use...
- **ID**: `avd-ado-wiki-086`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Known platform limitation: maximum 10,000 users per assignment group for Frontline Shared
- **Solution**: Split users into multiple groups (each <= 10,000) and create separate provisioning policies for each group
- **Tags**: w365, frontline-shared, user-limit, provisioning

### 3. Cloud Apps stuck in Preparing status after Cloud PCs successfully provisioned and DPP completed
- **ID**: `avd-ado-wiki-087`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Policy assignment issue preventing Cloud Apps discovery from completing
- **Solution**: Delete and recreate the policy assignment
- **Tags**: w365, cloud-apps, dpp, frontline-shared, preparing-stuck

### 4. Windows 365 Frontline Shared Cloud PC provisioned with warnings: DPP not enabled error (DppNotEnable...
- **ID**: `avd-ado-wiki-403`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Device Preparation Profile (DPP) not created as Automatic (Preview) or not assigned to the device group, or Intune Provisioning Client service principal (AppId f1346770-5b25-470b-88bd-d5744ab7952c) is missing from the device group owner
- **Solution**: 1. Verify DPP profile is created as Automatic (Preview) and assigned to a clean device group. 2. Ensure device group owner is set to Intune Provisioning Client (AppId f1346770-5b25-470b-88bd-d5744ab7952c). If SP missing, add it per MS docs. 3. Verify DPP profile is selected in the Frontline Shared provisioning policy. 4. If config looks correct, engage Intune Collab for DPP profile assignment issues.
- **Tags**: DPP, DppNotEnabled, autopilot-v2, frontline-shared, provisioning, intune

### 5. Frontline Shared Cloud PC provisioned with warnings, DPP not enabled error (DppNotEnabled)
- **ID**: `avd-ado-wiki-408`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Device Preparation Profile not assigned to device group, or Intune Provisioning Client service principal (AppId f1346770-5b25-470b-88bd-d5744ab7952c) missing from device group owner, or DPP profile not added in provisioning policy
- **Solution**: 1. Verify DPP profile created as Automatic (Preview) assigned to clean device group. 2. Verify device group owner is Intune Provisioning Client SP. 3. Ensure DPP profile added in Frontline Shared provisioning policy. 4. If CPC-side config OK, engage Intune Collab for service-side DPP assignment issues.
- **Tags**: dpp, DppNotEnabled, autopilot-v2, frontline-shared, provisioning, intune

### 6. Windows 365 Frontline Shared Cloud PC provisioned with warnings, DPP profile not assigned, error Dpp...
- **ID**: `avd-ado-wiki-413`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Device Preparation Profile not created as Automatic (Preview), device group owner not set to Intune Provisioning Client (AppId f1346770-5b25-470b-88bd-d5744ab7952c), or DPP profile not added in provisioning policy
- **Solution**: 1. Create DPP profile as Automatic (Preview) and assign to device group. 2. Set device group Owner to Intune Provisioning Client SP. 3. Add DPP profile in Frontline Shared provisioning policy. 4. If CPC-side config OK, engage Intune Collab for service-side issues.
- **Tags**: DPP, DppNotEnabled, autopilot-v2, frontline-shared, provisioning, windows-365

### 7. Windows 365 Frontline Shared Cloud PC provisioned with warnings; DPP (Device Preparation Profile) no...
- **ID**: `avd-ado-wiki-418`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: DPP Automatic (Preview) profile not assigned to device group, or Intune Provisioning Client service principal (AppId f1346770-5b25-470b-88bd-d5744ab7952c) missing from device group owner, or DPP profile not added to FLS provisioning policy
- **Solution**: Verify: 1) DPP profile created as Automatic (Preview) and assigned to device group, 2) Device group owner is Intune Provisioning Client SP (AppId f1346770-5b25-470b-88bd-d5744ab7952c), 3) DPP profile added in FLS provisioning policy. Check Kusto ServiceEvent for DppNotEnabled error and IntuneEvent for profile assignment. If CPC config correct, engage Intune Collab
- **Tags**: frontline-shared, DPP, DppNotEnabled, autopilot-v2, intune, provisioning, windows-365

### 8. FLS Cloud PC provisioned with warnings; DPP profile shows as not assigned; error DppNotEnabled
- **ID**: `avd-ado-wiki-425`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Device Preparation Profile not configured correctly: not created as Automatic (Preview), device group owner not set to Intune Provisioning Client (AppId f1346770-5b25-470b-88bd-d5744ab7952c), or DPP profile not added in Frontline Shared provisioning policy
- **Solution**: 1. Verify DPP profile is created as Automatic (Preview) and assigned to correct device group. 2. Ensure device group owner is Intune Provisioning Client. 3. Verify DPP profile is added in provisioning policy. 4. If CPC-side config is correct, engage Intune Collab for service-side investigation.
- **Tags**: dpp, autopilot, frontline-shared, DppNotEnabled, provisioning, w365
