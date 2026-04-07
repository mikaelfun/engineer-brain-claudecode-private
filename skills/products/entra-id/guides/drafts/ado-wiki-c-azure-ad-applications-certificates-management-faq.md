---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Azure AD Applications Certificates management FAQ"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FAzure%20AD%20Applications%20Certificates%20management%20FAQ"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Applications Certificates Management FAQ

> The most updated FAQ content can be found in the public document - [Application Management certificates frequently asked questions](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-management-certs-faq)

---

**Is there a way to generate a list of expiring SAML signing certificates?**

You can export all app registrations with expiring secrets, certificates and their owners for the specified apps from your directory in a CSV file through [PowerShell scripts](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/app-management-powershell-samples).

---

**Where can I find the information about soon to expire certificates renewal steps?**

You can find the steps [here](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-certificates-for-federated-single-sign-on#renew-a-certificate-that-will-soon-expire).

---

**How can I customize the expiration date for the certificates issued by Azure AD?**

By default, Azure AD configures a certificate to expire after three years when it is created automatically during SAML single sign-on configuration. Because you can't change the date of a certificate after you save it, you need to create a new certificate. For steps on how to do so, please refer [Customize the expiration date for your federation certificate and roll it over to a new certificate](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-certificates-for-federated-single-sign-on#customize-the-expiration-date-for-your-federation-certificate-and-roll-it-over-to-a-new-certificate).

---

**How can I automate the certificates expiration notifications?**

Azure AD will send an email notification 60, 30, and 7 days before the SAML certificate expires. You may add more than one email address to receive notifications.

**Note:** You can add up to 5 email addresses to the Notification list (including the email address of the admin who added the application). If you need more people to be notified, use the distribution list emails. To specify the email address(es), refer to [Add email notification addresses for certificate expiration](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-certificates-for-federated-single-sign-on#add-email-notification-addresses-for-certificate-expiration). There is no option to edit or customize these email notifications received from aadnotification@microsoft.com.

---

**Who can update the certificates?**

The owner of the application or Global Administrator or Application Administrator can update the certificates through Azure Portal UI, PowerShell or Microsoft Graph.

---

**I need more details about certificate signing options.**

In Azure AD, you can set up certificate signing options and the certificate signing algorithm. Refer to [Advanced SAML token certificate signing options for Azure AD apps](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/certificate-signing-options).

---

**I need to replace the certificate for Azure AD Application Proxy applications.**

To replace certificates for Application proxy apps, please refer to [PowerShell sample - Replace certificate in Application Proxy apps](https://docs.microsoft.com/en-us/azure/active-directory/app-proxy/scripts/powershell-get-custom-domain-replace-cert).

---

**How do I manage certificates for custom domains in Azure AD Application Proxy?**

To configure an on-premises app to use a custom domain, you need a verified Azure Active Directory custom domain, a PFX certificate for the custom domain, and an on-premises app to configure. Refer to [Custom domains in Azure AD Application Proxy](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-custom-domain).

---

**I need to update the token signing certificate on application side. Where can I get it on Azure AD side?**

You can renew SAML X.509 Certificate by following [SAML Signing certificate](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/configure-saml-single-sign-on#saml-signing-certificate) document.

---

**What is Azure AD signing key rollover?**

You can find more details [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-signing-key-rollover).

---

**How do I renew application token encryption certificate?**

See [How to renew a token encryption certificate for an enterprise application](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/howto-saml-token-encryption).

---

**How do I renew application token signing certificate?**

See [How to renew a token signing certificate for an enterprise application](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-certificates-for-federated-single-sign-on).

---

**How do I update Azure AD after changing my federation certificates?**

See [Renew federation certificates for Microsoft 365 and Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-fed-o365-certs).
