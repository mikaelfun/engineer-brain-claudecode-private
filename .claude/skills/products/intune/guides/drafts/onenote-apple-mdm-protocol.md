# Apple MDM Protocol Reference

## Overview
Apple MDM protocol basics, APNs communication requirements, and certificate management for Intune-managed iOS devices.

## Key Resources
- [MDM | Apple Developer Documentation](https://developer.apple.com/documentation/devicemanagement/mdm)
- [MDM Protocol Reference PDF](https://developer.apple.com/business/documentation/MDM-Protocol-Reference.pdf)
- [Device Management Documentation](https://developer.apple.com/documentation/devicemanagement)

## APNs Communication
MDM solutions use Apple Push Notification service (APNs) to maintain persistent communication with Apple devices across public and private networks.

### Required Network Ports
| Port | Protocol | Purpose |
|------|----------|---------|
| TCP 443 | HTTPS | Device activation + fallback if port 5223 unreachable |
| TCP 5223 | APNs | Primary APNs communication |
| TCP 443 or 2197 | HTTPS | MDM server → APNs notification delivery |

### Network Requirements
- Allow traffic from devices to Apple network: **17.0.0.0/8**
- iOS 13.4+, iPadOS 13.4+, macOS 10.15.4+, tvOS 13.4+: APNs can use web proxy via PAC file
- Firewall must allow all network traffic from Apple devices to Apple network

## Certificate Management
- APNs certificates required for MDM ↔ device communication
- SSL certificate for secure communication
- Certificate to sign configuration profiles
- **Certificates must be renewed annually**
- Note the Managed Apple ID / Apple ID used to create certificates (needed for renewal)
- [Apple Push Certificates Portal](https://identity.apple.com/pushcert/)

## Security
- Multiple security layers at endpoints and servers
- Traffic inspection/reroute attempts → connection marked as compromised
- No confidential information transmitted through APNs

## Source
- OneNote: MCVKB/Intune/iOS/Apple MDM Protocol.md
