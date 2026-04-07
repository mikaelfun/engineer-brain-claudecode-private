---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Azure AD Applications Certificates management FAQ"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FAzure%20AD%20Applications%20Certificates%20management%20FAQ"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> Public FAQ: https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-management-certs-faq

[[_TOC_]]

## How to generate a list of expiring SAML signing certificates?

Export all app registrations with expiring secrets, certificates and their owners via [PowerShell scripts](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/app-management-powershell-samples).

## Where to find steps for renewing soon-to-expire certificates?

See [Renew a certificate that will soon expire](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-certificates-for-federated-single-sign-on#renew-a-certificate-that-will-soon-expire).

## How to customize expiration date for certificates issued by Azure AD?

By default, Azure AD configures a certificate to expire after **three years** when created automatically during SAML SSO configuration. Since you can't change the date after saving, you must create a new certificate. See [Customize the expiration date for your federation certificate and roll it over to a new certificate](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-certificates-for-federated-single-sign-on#customize-the-expiration-date-for-your-federation-certificate-and-roll-it-over-to-a-new-certificate).

## How to automate certificate expiration notifications?

Azure AD sends email notifications **60, 30, and 7 days** before SAML certificate expiration. You can add up to **5 email addresses** to the Notification list (use distribution lists for more recipients). See [Add email notification addresses for certificate expiration](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-certificates-for-federated-single-sign-on#add-email-notification-addresses-for-certificate-expiration).

Notifications come from `aadnotification@microsoft.com` (no customization option).

## Who can update certificates?

The **application owner**, **Global Administrator**, or **Application Administrator** can update certificates via Azure Portal UI, PowerShell, or Microsoft Graph.

## Certificate signing options

See [Advanced SAML token certificate signing options for Azure AD apps](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/certificate-signing-options).

## How to replace certificates for Application Proxy apps?

See [PowerShell sample - Replace certificate in Application Proxy apps](https://docs.microsoft.com/en-us/azure/active-directory/app-proxy/scripts/powershell-get-custom-domain-replace-cert).

## How to manage certificates for custom domains in Application Proxy?

Requires: verified Azure AD custom domain, PFX certificate for custom domain, on-premises app. See [Custom domains in Azure AD Application Proxy](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-custom-domain).

## Where to get the token signing certificate on Azure AD side?

Renew SAML X.509 Certificate per [SAML Signing certificate documentation](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/configure-saml-single-sign-on#saml-signing-certificate).

## What is Azure AD signing key rollover?

See [Azure AD signing key rollover documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-signing-key-rollover).

## How to renew application token encryption certificate?

See [How to renew a token encryption certificate for an enterprise application](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/howto-saml-token-encryption).

## How to renew application token signing certificate?

See [How to renew a token signing certificate for an enterprise application](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-certificates-for-federated-single-sign-on).

## How to update Azure AD after changing federation certificates?

See [Renew federation certificates for Microsoft 365 and Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-fed-o365-certs).
