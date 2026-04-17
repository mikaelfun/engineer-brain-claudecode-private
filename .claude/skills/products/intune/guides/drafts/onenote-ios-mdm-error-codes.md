# iOS MDM Profile Error Codes Reference

> Source: OneNote — iOS TSG
> Status: DRAFT — pending SYNTHESIZE review
> Related: intune-onenote-209 (iOS/macOS app deployment response codes)

## Overview

Comprehensive reference of Apple MDM error codes returned during iOS profile installation and configuration. These codes help diagnose why MDM profiles, certificates, VPN, Wi-Fi, email, and other configurations fail on iOS devices.

## Error Code Categories

### Profile Errors (1000-1010)
| Code | Error | Description |
|------|-------|-------------|
| 1000 | Malformed profile | Profile XML is invalid |
| 1001 | Unsupported profile version | Profile version not supported by device |
| 1003 | Bad data type in field | Field has wrong data type |
| 1004 | Bad signature | Profile signature verification failed |
| 1005 | Empty profile | Profile contains no payloads |
| 1006 | Cannot decrypt | Profile decryption failed |
| 1007 | Non-unique UUIDs | Duplicate UUIDs in profile |
| 1008 | Non-unique payload identifiers | Duplicate payload IDs |
| 1009 | Profile installation failure | General install failure |

### Payload Errors (2000-2005)
| Code | Error | Description |
|------|-------|-------------|
| 2000 | Malformed Payload | Payload structure invalid |
| 2001 | Unsupported payload version | Version not supported |
| 2002 | Missing required field | Required field absent |
| 2003 | Bad data type in field | Wrong data type |
| 2004 | Unsupported field value | Value not valid |

### Profile Installation Errors (4000-4031)
| Code | Error | Description |
|------|-------|-------------|
| 4000 | Cannot parse profile | Profile parsing failed |
| 4001 | Installation failure | General installation error |
| 4002 | Duplicate UUID | Profile UUID already exists |
| 4003 | Profile not queued | Not in install queue |
| 4004 | User cancelled installation | User declined install |
| 4008 | Mismatched certificates | Cert mismatch |
| 4009 | Device locked | Device is locked |
| 4020 | UI installation prohibited | Cannot install via UI |
| 4025 | Invalid supervision | Supervision requirement not met |

### Passcode Errors (5000-5018)
| Code | Error | Description |
|------|-------|-------------|
| 5000 | Passcode too short | Does not meet length requirement |
| 5005 | Passcode requires number | Numeric char required |
| 5006 | Passcode requires alpha | Alpha char required |
| 5010 | Device locked | Device is locked |
| 5011 | Wrong passcode | Incorrect passcode |

### Certificate Errors (9000-9006)
| Code | Error | Description |
|------|-------|-------------|
| 9000 | Invalid password | Certificate password wrong |
| 9002 | Cannot store certificate | Storage failed |
| 9005 | Certificate is malformed | Invalid cert format |
| 9006 | Certificate is not an identity | Not an identity cert |

### MDM Errors (12000-12081)
| Code | Error | Description |
|------|-------|-------------|
| 12000 | Invalid access rights | Insufficient MDM permissions |
| 12001 | Multiple MDM instances | Device has multiple MDM |
| 12004 | Invalid push certificate | APNs cert invalid |
| 12011 | Invalid MDM configuration | MDM config error |
| 12025 | App already installed | App exists on device |
| 12035 | App cannot be purchased | Purchase not allowed |
| 12047 | Cannot find VPP assignment | VPP license not found |
| 12064 | License not found | App license missing |

### VPN Errors (15000-15005)
| Code | Error | Description |
|------|-------|-------------|
| 15000 | Cannot install VPN | VPN profile install failed |
| 15001 | Cannot remove VPN | VPN removal failed |
| 15003 | Invalid certificate | VPN cert invalid |
| 15005 | Cannot parse VPN payload | VPN payload malformed |

### Wi-Fi Errors (13000-13005)
| Code | Error | Description |
|------|-------|-------------|
| 13000 | Cannot install | Wi-Fi install failed |
| 13002 | Password required | Wi-Fi password missing |
| 13003 | Cannot create WiFi configuration | Config creation failed |

### SCEP/Certificate Provisioning Errors (22000-22013)
| Code | Error | Description |
|------|-------|-------------|
| 22000 | Invalid key usage | Key usage invalid |
| 22001 | Cannot generate key pair | Key generation failed |
| 22005 | Network error | Network connectivity issue |
| 22007 | Invalid signed certificate | Signed cert invalid |
| 22011 | Cannot generate CSR | CSR generation failed |

### Email Errors (7000-7007)
| Code | Error | Description |
|------|-------|-------------|
| 7000 | Host unreachable | Email server unreachable |
| 7001 | Invalid credentials | Auth failed |
| 7003 | SMIME certificate not found | S/MIME cert missing |

### Device Supervision Required (29000)
| Code | Error | Description |
|------|-------|-------------|
| 29000 | Device not supervised | Feature requires supervision |

## Usage Notes

- Error codes are negative integers in Intune logs (e.g., -2016332112 maps to code 4000)
- Formula: `ErrorCode = -(2016336112 + code)` approximately
- Cross-reference with Intune device status reports and Kusto DeviceManagementEvent table
