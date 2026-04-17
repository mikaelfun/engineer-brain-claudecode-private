# Apple MDM Protocol & APNs Reference

> Source: OneNote - iOS TSG / Apple MDM Protocol
> Status: draft (pending SYNTHESIZE review)

## APNs Network Requirements

| Protocol | Port | Purpose |
|----------|------|---------|
| TCP | 443 | Device activation + fallback if port 5223 unreachable |
| TCP | 5223 | Primary APNs communication |
| TCP | 443 or 2197 | MDM server → APNs push notifications |

- Apple network range: **17.0.0.0/8** — must be allowed directly or via proxy
- iOS 13.4+, iPadOS 13.4+, macOS 10.15.4+, tvOS 13.4+: APNs supports web proxy via PAC file

## Certificate Management

- APNs certificate created at [Apple Push Certificates Portal](https://identity.apple.com/pushcert/)
- Must renew **annually** — track the Managed Apple ID used for creation
- SSL certificate for secure MDM ↔ device communication
- Signing certificate for configuration profiles

## Key References

- [MDM Protocol Reference (PDF)](https://developer.apple.com/business/documentation/MDM-Protocol-Reference.pdf)
- [Device Management API](https://developer.apple.com/documentation/devicemanagement)
- [APNs Deployment Guide](https://support.apple.com/en-sg/guide/deployment/dep2de55389a/web)
