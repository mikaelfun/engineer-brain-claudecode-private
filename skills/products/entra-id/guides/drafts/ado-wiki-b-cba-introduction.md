---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Cert Based Auth/CBA: Introduction"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Cert%20Based%20Auth/CBA%3A%20Introduction"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CBA: Introduction

## Feature Overview

**C**ertificate **B**ased **A**uthentication (CBA) is a phishing resistant authentication mechanism for providing strong authentication to Entra ID. CBA is widely supported on both Windows and non-Windows platforms and the certificates may live on the device itself or externally on a smart card or PIV capable FIDO2 security key.

## Why Use CBA?

**CBA** provides a convenient, secure and password-less way to authenticate to Entra ID. This is especially useful to customers that already have existing PKI deployments and that have issued certificates to their end users. These customers merely need to configure Entra ID to accept the already issued certs for authentication and optionally use them for MFA.

Others that are considering a secure passwordless authentication mechanism to meet strong authentication requirements can choose to deploy certs via a PKI such as Intune Cloud PKI or deploy a PKI on Windows Server or a 3rd party PKI solution.

CBA is a popular MFA mechanism like FIDO2 in environments where phone use is forbidden.

## Requirements

- There are no CBA-specific Entra ID licensing requirements.
- Smart cards and/or PIV capable hardware security keys are not mandatory. But if used and are pin protected, they are an especially recommended method for MFA.
- Yubikeys (from Yubico) are the most flexible PIV capable security keys for use across Android, iOS/macOS, Linux and Windows. Other vendors are not supported on Android but may work on iOS/macOS, Windows and Linux.

## PIV Capable FIDO2 Security Keys

While there are many keys that are FIDO2 certified, not all are PIV capable. Those that are PIV capable can be used like a smartcard.

> **Note:** CBA for Android only works with Yubikeys (from Yubico) via the broker apps such as Microsoft Authenticator, Company Portal.

| **Key Vendor** | **Form Factors** | **Capabilities** | **Models** |
|:---|:---|:---|:---|
| Yubico | USB Key | Security Key + PIN | YubiKey 5 and Security Key by Yubico |
| Feitian | USB Key | Security key + fingerprint (or PIN) | BioPass FIDO2 Pro Security Key (K45/K49) |
| Thales | Smart Card | card + PIN | SafeNet IDPrime FIDO Bio Smart Card |
| HID | Smart Card | card + PIN | Crescendo 2300 series smartcards |

## Federated CBA vs Native CBA

Customers that opt to use (WS*/SAML2) federated authentication via their own IDP can choose to use certificates for logon and send some claims indicating the certificates used.

Claims issued by AD FS if the claims rules are configured correctly:

```
Pass through claim - certificate authentication - serial number
http://schemas.microsoft.com/ws/2008/06/identity/claims/serialnumber

Pass through claim - certificate authentication - issuer
http://schemas.microsoft.com/2012/12/certificatecontext/field/issuer
```

In a federated CBA scenario, the certificate is processed by the IDP. The resulting SAML token is consumed by Entra ID and the certificate details in the claims are used to perform a revocation check against the CRL. The exception is Exchange ActiveSync clients that use certificates for accessing a mailbox in Office 365. Entra ID processes the certificates for ActiveSync clients using CBA.

Native CBA is intended primarily for managed authentication based customers. In a native CBA scenario, Entra ID processes the certificate directly and also performs revocation checks against the CRL.

Federated CBA customers cannot use Native CBA to perform initial/primary authentication to Entra ID. They will be redirected to the IDP and will not see the CBA as a sign-in option on the Entra ID logon page. But they may see and use other methods such as FIDO2/passkeys or Phone sign-in method if configured appropriately.

Federated CBA customers can use Native CBA for the MFA stage only. If an Entra ID integrated resource is protected using authentication strengths and certs from a specific issuer, a federated user will be prompted to provide the relevant cert from the issuer to meet MFA requirements.

If native CBA is preferred as a primary authentication mechanism, customers are required to convert federated users to managed authentication via a staged rollout process. This would prevent the user from accessing the IDP henceforth for authentication.

## References

- [Frequently asked questions about Microsoft Entra certificate-based authentication (CBA)](https://learn.microsoft.com/en-us/entra/identity/authentication/certificate-based-authentication-faq)
- [Microsoft Entra certificate-based authentication technical deep dive](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-certificate-based-authentication-technical-deep-dive)
- [How to configure Microsoft Entra certificate-based authentication](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-certificate-based-authentication)
