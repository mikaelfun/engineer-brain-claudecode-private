---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Linux Devices/Enterprise SSO for Linux Desktops/Support Boundaries"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FLinux%20Devices%2FEnterprise%20SSO%20for%20Linux%20Desktops%2FSupport%20Boundaries"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Support Boundaries — Linux Enterprise SSO

## Required Conditions to Access Azure & Office 365

The following conditions **must all be met**:

- Linux distribution: **Ubuntu 20.04, 22.04, 24.04** or **RHEL 8/9**
- Intune enrollment is completed and device is compliant
- Edge browser is used with an Azure AD profile logged in
- Azure AD tenant is properly configured
- User belongs to specific user groups
- User is logged into an Edge profile

## Conditions That Will NOT Work

- Any Linux distribution other than the supported ones above
- Using Firefox, Chrome, Safari, or other browsers (Edge only)
- No access to the target resource
- Not using Edge browser
- Hardware binding (TPM/HSM) is not currently supported
- Customers should NOT call the Javabroker directly or via DBUS APIs

## Intune CA Policies Supported

- Enforce local user account password complexity
- Enforce Disk Encryption

## Conditional Access on Linux

Select **Linux** as an *Included* or *Excluded* **Device platform** Condition in CA Policy.

## ICM Routing

| **Team** | **TSG/Wiki** | **Owning Service** | **Owning Team** |
| -- | -- | -- | --|
| MSAL.cppCloud | MSAL TSG | Cloud Identity AuthN Client | OneAuth-MSAL C++ team |
| JavaBroker | Java TSG | Cloud Identity AuthN Client | Cloud Identity AuthN MSAL JAVA |
| Intune | | Microsoft Intune | DEX - Linux |
| Edge | Edge Enterprise Support | | |

## Support Ownership Rules

- **Intune Support** fronts all cases related to device registration and token acquisition
- **Cloud Device Identity** supports collecting and examining JavaBroker logs
- Client-side Intune Agent bugs → ICM to Intune PG; Intune PG engages ID Dev for MSAL/javaBroker issues
- Service-side token issues → Azure Identity team

## How to Route Customer to Intune Support

https://learn.microsoft.com/en-us/mem/get-support
