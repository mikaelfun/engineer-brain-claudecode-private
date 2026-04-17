---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA External User Access (B2B)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20External%20User%20Access%20(B2B)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA External User Access (B2B)

## Summary

Allows external partners to use their own devices and identities to access company resources securely via GSA. Supports BYOD, per-app MFA, and seamless multitenant switching.

## Prerequisites

- External users (guest or member) in resource tenant
- GSA client installed on device connected to home tenant (home tenant does NOT need GSA license)
- Private Access enabled on resource tenant, profile assigned to external users
- At least one private application assigned to external users
- Registry key: HKLM Software Microsoft Global Secure Access Client GuestAccessEnabled = 0x1 (REG_DWORD)

## Connect to Resource Tenant

1. Launch GSA client
2. Select GSA tray icon > User menu > Select resource tenant
3. Verify Organization displays resource tenant name
4. All home tenant tunnels disconnect; new PA tunnel created to resource tenant

## Known Limitations

1. No IA/M365 tunnel to home tenant while connected to resource tenant
2. MFA + PSI failure: Switching fails when resource tenant requires MFA and home tenant uses passwordless sign-in on Authenticator
3. Access Control conflict: When Access Control allowed on cross tenant settings for GSA, access is not allowed
4. Existing connections persist: Active RDP/app connections remain on previous tenant after switching
5. Compliant network enforcement blocks guests: External users must be excluded from compliant network policies
6. No Kerberos for B2B: Use Application Proxy with KCD for web apps

## AVD / Windows 365 Support

External user access supported on AVD/W365 VMs via external ID linking.

## ICM Escalation

| Area | ICM Path |
|------|----------|
| Private Access Data Path | Global Secure Access / GSA Datapath |
| Private Access Control Plane | Global Secure Access / GSA Control Plane |
