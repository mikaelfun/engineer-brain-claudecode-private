---
title: Intune Company Resource Access - Common Error Codes Reference
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/general/troubleshoot-company-resource-access-problems
product: intune
dateCreated: 2026-04-18
---

# Intune Company Resource Access - Common Error Codes Reference

Comprehensive error code reference for MDM managed Windows devices, company resource access, iOS/iPadOS devices, and OMA responses.

## MDM Managed Windows Device Status Codes

| Code | Status | Action |
|------|--------|--------|
| 10 | Installation in progress | Wait |
| 30 | Retrieving content failed | Check internet, device certificate, re-enroll if expired |
| 60 | Installation error | Check code signing cert, framework dependencies, package validity |
| 70 | Installation success | OK |
| 110 | Content hash mismatch | Re-upload app package |
| 120 | SLK/side loading not enabled | Enable sideloading |

## Key Company Resource Access Error Codes

| Code | Hex | Meaning |
|------|-----|---------|
| -2016281101 | 0x87D1FDF3 | MDM CRP request not found |
| -2016281102 | 0x87D1FDF2 | NDES URL not found |
| -2016281103 | 0x87D1FDF1 | MDM CRP certificate info not found |
| -2016281112 | 0x87D1FDE8 | Remediation failed |
| -2016330908 | 0x87D13B64 | App install has failed |
| -2016341112 | 0x87D11388 | iOS device is currently busy |

## iOS/iPadOS Company Portal Errors

| Error | HTTP | Cause |
|-------|------|-------|
| Internal server issue | 500 | Intune service side problem |
| Temporarily unavailable | 503 | Service maintenance |
| Can't connect to server | N/A | SSL/ATS cert issue |
| Something went wrong | 400 | Client side error |

## Common OMA Response Codes

| Code | Hex | Meaning |
|------|-----|---------|
| -2016345612 | 0x87D101F4 | Syncml(500) - Unexpected server condition |
| -2016345708 | 0x87D10194 | Syncml(404) - Target not found |
| -2016345711 | 0x87D10191 | Syncml(401) - Authentication required |
| -2016345712 | 0x87D10190 | Syncml(400) - Malformed syntax |

## Troubleshooting Tips
- For status code 30: re-enroll if device certificate expired, confirm internet connectivity
- For status code 60: verify code signing certificate and framework dependencies
- For iOS 500/503 errors: typically Intune service-side, retry later
- For SSL/ATS errors: check certificate compliance with Apple ATS requirements
- Full error code list: see source URL
