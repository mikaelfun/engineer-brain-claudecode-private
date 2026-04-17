---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/PKCS"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Certificates%20Email%20VPN%20Wifi%2FPKCS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# PKCS (PFX) Certificate Overview & Troubleshooting

## PKCS Communication Flow
1. Admin creates PKCS certificate profile in Intune
2. Intune requests Certificate Connector to create new cert
3. Connector sends PFX Blob and Request to CA
4. CA issues and returns PFX User Certificate to Connector
5. Connector uploads encrypted PFX to Intune
6. Intune decrypts, re-encrypts with Device Management Certificate, sends to device
7. Device reports certificate status to Intune

## S/MIME Scenarios
- PKCS supports authentication, S/MIME email signing, and S/MIME email encryption
- Signing and encryption typically use separate certificates
- Active Directory CS: Exchange Signature Only (signing) + Exchange User (encryption)
- Connectors required:
  - Microsoft Intune Certificate Connector (authentication + signing)
  - PFX Certificate Connector (encryption)
  - Both can be on same server

## User vs Device Certificate
- User certs: contain both user and device attributes in Subject/SAN
- Device certs: only device attributes. Use for kiosks, shared devices

## Known Behavior
- PKCS: profile/assignment changes → re-push existing cert (NOT new cert)
- SCEP: profile/assignment changes → issue new cert
- To get new PKCS cert: re-enroll device or deploy new PKCS profile

## Scoping Questions
1. Profile types? Sub CA? Pushing Sub CA cert to device?
2. Affected platform? (Android/iOS/Windows/macOS)
3. Enrollment type?
4. New or existing setup? When did it stop working? Recent changes?
5. How many devices affected? (xxx of YYY total)
6. Profiles targeted to same groups?
7. Root/Sub CA showing on devices?
8. Intune device ID + UPN of affected user?
9. Names of Trusted cert and PKCS profiles
10. Collect from Connector server: Event Viewer > Applications and Services > Microsoft > Intune > CertificateConnector > Operational + Admin
11. Any errors in Failed Requests on issuing CA?

## Support Boundaries
- Intune scope: policy configuration and delivery to device
- Collaborate with Windows Directory Services for:
  - NDES role installation failures
  - CRL availability issues
  - NDES application pool crashes
  - NDES URL returning 500 instead of 403
- Third-party SCEP solutions: involve vendor
