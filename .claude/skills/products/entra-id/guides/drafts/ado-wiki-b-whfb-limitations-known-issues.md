---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/WHfB: Limitations and known issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FWHfB%3A%20Limitations%20and%20known%20issues"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# WHfB Limitations and Known Issues

## Public References

- [WHfB known deployment issues](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-deployment-issues)
- [Windows Hello errors during PIN creation](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-errors-during-pin-creation)

## WHfB Cloud Kerberos Trust

### Limitations
- **Incompatible with Certificate Trust** — If certificate trust policies are set, they will be enforced instead of Cloud Kerberos Trust.

### Supported Scenarios
- Azure AD Joined and Workplace Registered logon and SSO to on-prem resources
- Hybrid Azure AD Joined logon and SSO to Azure resources
- Azure MFA/CA
- Secondary certs (S/MIME, WIFI, VPN, etc)
- WebAuthn Keys
- Destructive PIN and non-destructive PIN reset

### Unsupported Scenarios
- Domain Joined only deployment (no plan to support)
- RDP/VDI scenarios using supplied credentials (use Remote Credential Guard or enroll certificate into WHfB container)
- Authentication Mechanism Assurance
- TLS Client Auth (no plan to support)
- Password change using WHFB
- Using cloud Kerberos trust for Run as
- **Signing in with cloud Kerberos trust on hybrid joined device without previously signing in with DC connectivity**

## WHfB Provisioning Common Issues

| # | Scenario | Link |
|---|---------|------|
| 1 | Hybrid WHfB Key Trust enrollment does not happen | P1 |
| 2 | Hybrid WHfB Certificate Trust enrollment does not happen | P2 |
| 3 | Device registration failing | P3 |
| 4 | CloudExperienceHost fails to launch on Workstations | P4 |
| 5 | Hybrid AADJ Cert Trust fails with "Cancel" option | P5 |
| 6 | On-Premises Cert Trust provisioning error 0X801C044F | P6 |
| 7 | WHfB Cert Trust provision fails with ADFS and DCs on Server 2019 | P8 |
| 8 | MFA skipped during WHfB provisioning | P9 |
| 9 | WHfB Onprem provisioning fails error 0x801C03ED | P10 |
| 10 | WHfB prompt does not appear due to UAC | P11 |
| 11 | Not able to get PRT on Hybrid Joined due to TPM issue | P12 |

## WHfB Sign-In Common Issues

| # | Scenario | Link |
|---|---------|------|
| 1 | Unable to logon using WHfB after creating PIN | S1 |
| 2 | Unable to access local resources with AADJ PC and Federated account | S2 |
| 3 | "The request is not supported" error | S3 |
| 4 | Error 0x00000bb during sign-in with PIN | S4 |
| 5 | Unable to logon with PIN - KDC certificate could not be validated | S5 |
| 6 | Not able to login using WHfB in Cross forest trust | S6 |
| 7 | WHfB key-based auth fails with only WS2019 DCs | S7 |

## Other Scenarios

| # | Scenario |
|---|---------|
| 1 | Disabling Windows Hello for Business |
| 2 | PIN reset from Logon Screen |
| 3 | Move from Hybrid Key Trust to Certificate Trust |
| 4 | User/Device migrated from one domain to another |
| 5 | Stored biometric data lost during in-place upgrade |
| 6 | WHfB Cloud Kerberos Trust lockout with Credential Guard |

Also check the Directory Services [Emerging issues wiki](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430170/Emerging-issues) for more leads.
