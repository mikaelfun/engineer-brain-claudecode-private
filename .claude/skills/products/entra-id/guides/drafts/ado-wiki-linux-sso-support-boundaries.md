---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Linux%20Devices/Enterprise%20SSO%20for%20Linux%20Desktops/Support%20Boundaries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Linux Enterprise SSO - Support Boundaries

## Component Ownership

| Team | Area | Owning Service | Owning Team |
| -- | -- | -- | -- |
| MSAL.cppCloud | MSAL | Cloud Identity AuthN Client | OneAuth-MSAL C++ team |
| JavaBroker | Java | Cloud Identity AuthN Client | Cloud Identity AuthN MSAL JAVA |
| Intune | Enrollment/Compliance | Microsoft Intune | DEX - Linux |
| Edge | Browser SSO | Edge Enterprise | - |
| Azure CLI + MSAL.py | CLI auth | - | - |

## Supported Configurations

### Supported Linux Distros
- Ubuntu Linux 20.04, 22.04, 24.04
- RHEL 8/9

### Prerequisites for Access
- Intune enrollment completed
- Linux desktop compliant in Intune
- Edge browser profile created and signed in with Azure AD user
- Azure AD tenant properly configured
- User belongs to specific user groups
- User logged into Edge profile

### Unsupported Scenarios (Will Cause "Access Denied")
- Any Linux distro other than Ubuntu 20.04/22.04/24.04 and RHEL 8/9
- Firefox/Chrome/Safari or any non-Edge browser
- No access to the given resource
- Did not use Edge to access protected resource
- Hardware binding (TPM or other HSM) not supported
- Calling Javabroker directly or via DBUS APIs not supported

## Intune CA Policies Supported
- Enforce local user account password complexity
- Enforce Disk Encryption

## Conditional Access for Linux
- Select **Linux** as Device platform in CA Policy conditions (Included or Excluded)
- Intune Agent (Company Portal) handles device registration in Azure AD and enrollment in Intune

## ICM Escalation Path
- Token management issues from client → Intune support retains case, collaborates with AAD Authentication
- Client-side bug in Intune Agent → Intune PG files ICM, engages ID Dev for MSAL/javaBroker issues
- JavaBroker logs → collected/examined by Cloud Device Identity team

## Support Ticket for Intune
Direct customer to: https://learn.microsoft.com/en-us/mem/get-support
