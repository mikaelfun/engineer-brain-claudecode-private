# Intune Policy Type and Platform Mapping Reference

> Source: OneNote — Kusto policy type/platform/details
> Status: draft (pending SYNTHESIZE)

## Platform Type Mapping

### Legacy Policies (CreationSource != 2)

| PolicyPlatformType | Platform |
|---|---|
| 0 | Android |
| 1 | AndroidForWork |
| 2 | iOS |
| 3 | macOS |
| 4 | WindowsPhone81 |
| 5 | Windows81AndLater |
| 6 | Windows10 |
| 7 | AndroidWorkProfile |
| 9 | AndroidAOSP |

### Settings Catalog / Modern Policies (CreationSource == 2)

| PolicyPlatformType | Platform |
|---|---|
| 1 | Android |
| 2 | AndroidEnterprise |
| 4 | iOS |
| 8 | macOS |
| 16 | Windows10x |
| 32 | Windows10 |

## Policy Type Mapping (Legacy, CreationSource != 2)

| PolicyType | Name |
|---|---|
| 1 | DeviceRestrictions |
| 2 | PkcsCertificate |
| 3 | EmailSamsungKnoxOnly |
| 4, 9, 11, 16, 44, 47, 62, 70 | WiFi |
| 5, 17, 20, 24, 27, 46 | DeviceRestrictions |
| 6, 22, 64 | PkcsCertificate |
| 7, 14, 18, 25, 28, 65 | ScepCertificate |
| 8, 15, 19, 26, 29, 66 | TrustedCertificate |
| 10, 21, 30, 67, 68 | Email |
| 31 | SoftwareUpdates |
| 33, 40, 41, 42, 43, 57 | Custom |
| 34-39, 76 | Vpn |
| 55 | EditionUpgradeAndModeSwitch |
| 56 | WiFiImport |
| 58 | SecureAssessmentEducation |
| 59, 69 | DeviceFeatures |
| 61 | SharedMultiUserDevice |
| 72 | MicrosoftDefenderAtpWindows10Desktop |
| 73 | Education |
| 75 | EndpointProtection |
| 23 | DeviceRestrictionsWindows10Team |

## Usage in Kusto

```kql
// From ReportingSchemaCombinedPolicyMetadataWithScopeTags
// Use CreationSource to determine which mapping table to use:
// CreationSource != 2 → Legacy mapping
// CreationSource == 2 → Settings Catalog mapping
```

## Notes

- PolicyType 99999 should be filtered out (internal use)
- CreationSource == 1 should also be filtered (internal)
- The unified mapping normalizes both legacy and modern policy types into consistent platform and type names
