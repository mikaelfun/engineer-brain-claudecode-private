# SCEP Certificate Profile Deployment Troubleshooting (Step 1)

> Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-scep-certificate-profile-deployment)

## Assignment Compatibility Matrix

| | Trusted cert → User | Trusted cert → Device | Trusted cert → User+Device |
|---|---|---|---|
| **SCEP → User** | Success | **Failure** | Success |
| **SCEP → Device** | **Failure** | Success | Success |
| **SCEP → User+Device** | Success | Success | Success |

**Key rule**: SCEP profile and Trusted certificate profile must be assigned to the same target type (user or device) or both.

## Validation Steps (All Platforms)

1. Intune admin center → Troubleshooting + Support → Troubleshoot
2. Set Assignments = Configuration profiles
3. Verify: correct user, group membership, last check-in time

## Platform-Specific Log Verification

### Android
- Check OMADM log for SyncML entries containing:
  - `CertificateStore/Root/{GUID}/EncodedCertificate`
  - `CertificateStore/Enroll/ModelName=AC_51...`
  - `NDESUrls` with NDES server URL

### iOS/iPadOS
- Debug log entries with:
  - `Adding dependent ModelName=AC_51bad41f.../LogicalName_...`
  - `PayloadDependencyDomainCertificate`

### Windows
- Event Viewer → DeviceManagement-Enterprise-Diagnostic-Provider → Admin
- **Event ID 306**: SCEP CspExecute entry
- Error code `0x2ab0003` = `DM_S_ACCEPTED_FOR_PROCESSING` (success)
- Non-successful codes indicate underlying problem
