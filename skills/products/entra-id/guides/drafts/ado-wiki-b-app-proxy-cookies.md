---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy cookies"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20cookies"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-hybauth
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

This article explains the 1st party cookies used by Microsoft Entra application proxy. 

## **AzureAppProxyAccessCookie**

Format: AzureAppProxyAccessCookie_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX_X.X

The so called "access cookie" gets issued by the application proxy Cloud service, after the code (authentication OAuth Code Grant Flow - ESTS - https://login.microsoftonline.com) sent in the request by the browser have been successfully redeemed. 

![image.png](/.attachments/image-fae0b529-5440-477f-9235-fc9c821974ab.png)

Using the valid "access cookie" ensures that the Microsoft Entra Application Proxy Cloud service permits access to the published application.

The lifetime of the access cookie is 60 mins by default, which equals with the lifetime of the access token.
Changing the lifetime of the access token, changes the lifetime of the access cookie as well.

Once the cookie has expired, the next request (without the cookie) gets redirected to https://login.microsoftonline.com to do re-authentication.

To change the life time of the access token, please follow the article: [Configure token lifetime policies (preview)](https://docs.microsoft.com/azure/active-directory/develop/configure-token-lifetimes#create-a-policy-for-web-sign-in)

Scenarios: pre-auth (Entra ID).

## **AzureAppProxyPreauthSessionCookie**


Format: AzureAppProxyPreauthSessionCookie_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX_X.X

Scenarios: pre-auth (Entra ID).

## **AzureAppProxyAnalyticCookie**

Format: AzureAppProxyAnalyticCookie_XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX_X.X

This cookie will be used for statistic and telemetry purposes. Disabling this cookie is not possible.
The application proxy Cloud service sets this cookie, when the first client request hits the application proxy endpoint. Scenarios: passthrough, pre-auth (Azure Active Directory).

##Important

- XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX => Application ID

- The cookies above will be used in the communication between the browser and the application proxy Cloud service. These cookies won't be forwarded to the backend server (published app).

- Check the article [Cookie settings for accessing on-premises applications in Microsoft Entra ID](https://learn.microsoft.com/entra/identity/app-proxy/application-proxy-configure-cookie-settings)) to see more information about cookie related settings.

##**How to invalidate the AzureAppProxyAccessCookie? (logout)**

Use the logout URL: 

Format: EXTERNALURL?appproxy=logout&sid=APPLICATION_ID (Example: https://test-test.msappproxy.net/?appproxy=logout&sid=d46e19d2-1111-4576-2222-f789eab837d4)


If you have any feedback on this article or you need assistance, please contact us over [Microsoft Entra application proxy
Teams channel](https://teams.microsoft.com/l/channel/19%3aa87266c50f2743b4ae358327faec82f7%40thread.skype/Azure%2520AD%2520Application%2520Proxy?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR36COL1ZDnJAnLWpaiURTuNUOFBNNFcwNUJDU1hQNkVDQzNON0VSMzY1Ti4u) to the Hybrid Authentication Experiences Community.
