---
title: SCEP Certificate Profile Deployment Troubleshooting
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/certificates/troubleshoot-scep-certificate-profile-deployment
product: intune
date: 2026-04-18
---

# SCEP Certificate Profile Deployment Troubleshooting

## Assignment Rules (Critical)

SCEP certificate profile and trusted certificate profile must be assigned to same target:

| Scenario | Trusted=User | Trusted=Device | Trusted=User+Device |
|----------|-------------|----------------|---------------------|
| SCEP=User | Success | **Failure** | Success |
| SCEP=Device | **Failure** | Success | Success |
| SCEP=User+Device | Success | Success | Success |

## Validation Steps (All Platforms)

1. Go to Intune admin center > Troubleshooting + Support > Troubleshoot
2. Set Assignments = Configuration profiles
3. Verify: correct user, group membership, last check-in time

## Android Validation
- Check OMADM log for SyncML entries with CertificateStore/Enroll commands
- Key entries: `ModelName=AC_51...`, `NDESUrls`

## iOS/iPadOS Validation
- Check debug log for `PayloadDependencyDomainCertificate` entries
- Key entries: `ModelName=AC_51.../LogicalName_...;Hash=...`

## Windows Validation
- Event Viewer > DeviceManagement-Enterprise-Diagnostic-Provider > Admin > Event ID 306
- Error code 0x2ab0003 = DM_S_ACCEPTED_FOR_PROCESSING (success)
- Non-successful codes indicate underlying problems
