---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Tips & Hints/How to quickly check (without etl tracing) which trust model is used"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/538265"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**   
This guide provides steps to verify whether a certificate trust model or a key trust model is used during a user's logon and Ticket Granting Ticket (TGT) request. It includes instructions for checking registry keys, reviewing event logs, and using Kerberos TGT audit.

[[_TOC_]]

## How to check if it is a certificate trust model used during the user's logon and TGT request

Verify if:
- The registry key `UseCertificateForOnPremAuth` has a value of "1".
- On the device:
  [Provisioning](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-how-it-works-provisioning#hybrid-azure-ad-joined-provisioning-in-a-synchronous-certificate-trust-deployment-in-a-federated-environment): _The application receives the newly issued certificate and installs it **into the Personal store of the user**. This signals the end of provisioning_.

   ![Provisioning process](/.attachments/image-22f9cccc-bd23-47f9-9095-331c64af3349.png)

- Review the H4B event log: focus on event IDs 5204, 8205, 8206.

   | 5204  | 8205 | 8206 |
   |:--:|:--:|:--:|
   |![Event ID 5204](/.attachments/image-b43dac6b-e827-450d-a51b-8480fbed6e79.png)|![Event ID 8205](/.attachments/image-110f31a0-a8b8-4e61-bd28-77cc61b60a4f.png) |![Event ID 8206](/.attachments/image-2a81d6a2-78e4-42cd-9514-1d7a78d53558.png)|

- On the Key Distribution Center (KDC), with [Kerberos TGT audit](https://docs.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4768) enabled, filter the security event log using ID 4768.

   ![Kerberos TGT audit](/.attachments/image-51b64e98-2c32-4c95-8832-38bb0d207a54.png)

The certificate thumbprint matches the certificate stored in the user's store on the device. This shows that the user's certificate has been used for the pre-authentication. This is what is behind ["_The Kerberos provider sends the signed pre-authentication data and user's certificate_"](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/how-it-works-authentication#microsoft-entra-hybrid-join-authentication-using-a-certificate).

## How to check if it is a key trust model used during the user's logon and TGT request

Verify if:
- The registry key `UseCertificateForOnPremAuth` either does not exist or has a value of "0".
- On the device:
  [Authentication](https://learn.microsoft.com/windows/security/identity-protection/hello-for-business/how-it-works-authentication#microsoft-entra-hybrid-join-authentication-using-a-key): _The Kerberos provider sends the signed pre-authentication data and the user's public key **(in the form of a self-signed certificate)** to the KDC service running on the 2016 domain controller in the form of a KERB_AS_REQ_.

   ![Authentication process](/.attachments/image-65041b2e-2eba-4074-9f13-8b3cc374a448.png)

- On the KDC, with [Kerberos TGT audit](https://docs.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4768) enabled, filter the security event log using ID 4768.

   ![Kerberos TGT audit](/.attachments/image-a7ee8de1-fb29-4738-91ea-359812fd9bbc.png)

The certificate thumbprint matches the self-signed certificate stored in the user's store on the device. This shows that the user's self-signed certificate has been used for pre-authentication.