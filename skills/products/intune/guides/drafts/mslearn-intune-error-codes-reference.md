# Intune MDM Error Codes and Status Codes Reference

> Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/general/troubleshoot-company-resource-access-problems

## MDM Managed Windows Devices — App Install Status Codes

| Code | Status | Action |
|------|--------|--------|
| 10 | Installation in progress | — |
| 20 | Waiting for content | — |
| 30 | Retrieving content (download failed) | Check Internet, verify device cert not expired, re-enroll if needed |
| 60 | Installation error | Check code signing cert on device, verify framework dependencies, check package validity |
| 70 | Installation success | — |
| 110 | Content hash mismatch | Re-publish app |
| 120 | SLK/side loading not enabled | Enable side loading |

## Common Company Resource Access Errors

| Error Code | Hex | Meaning |
|-----------|-----|---------|
| -2016281101 | 0x87D1FDF3 | MDM CRP request not found |
| -2016281102 | 0x87D1FDF2 | NDES URL not found |
| -2016281103 | 0x87D1FDF1 | MDM CRP certificate info not found |
| -2016281112 | 0x87D1FDE8 | Remediation failed (password policy) |
| -2016330908 | 0x87D13B64 | App install failed |
| -2016341112 | 0x87D11388 | iOS device is currently busy |

## iOS/iPadOS Company Portal HTTP Errors

| HTTP | Meaning | Likely Cause |
|------|---------|-------------|
| 400 | Bad request | Client-side error in Company Portal app |
| 500 | Internal server error | Intune service-side issue |
| 503 | Temporarily unavailable | Service maintenance |
| No code | Can't connect to server | SSL/ATS certificate issue |

## Key OMA/SyncML Response Codes

| Code | Meaning |
|------|---------|
| Syncml(400) | Malformed syntax |
| Syncml(401) | Authentication required |
| Syncml(403) | Understood but refused |
| Syncml(404) | Target not found |
| Syncml(500) | Server unexpected condition |
| Syncml(503) | Temporary overloading/maintenance |

## Common iOS Profile/Certificate Errors

| Code Range | Category |
|-----------|----------|
| 9xxx | Certificate errors (malformed, can't store, invalid password) |
| 12xxx | MDM enrollment errors (invalid config, malformed request) |
| 13xxx | WiFi configuration errors |
| 15xxx | VPN errors |
| 21xxx | Email account errors (can't comply with server policy) |
| 22xxx | SCEP certificate errors |
| 25xxx | Profile install/remove errors |
