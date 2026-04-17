---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/TSG - Debug Identity provider federation with Azure AD B2C"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/Azure%20AD%20B2C%20Troubleshooting/TSG%20-%20Debug%20Identity%20provider%20federation%20with%20Azure%20AD%20B2C"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG - Debug Identity Provider Federation with Azure AD B2C

## Troubleshoot OIDC or OAuth2 Protocol

Share the Proxy tool link [https://custom-idp.azurewebsites.net/](https://custom-idp.azurewebsites.net/) with the customer so they can debug their identity provider federation when integrating to Azure B2C.

### Steps to Enable the Debugger (Custom Policies)

1. Setup a tenant ID by adding a name after the domain name. For example `https://custom-idp.azurewebsites.net/bobenvironment`
2. From the menu, select **Tenant Settings**, and provide your **Application Insights instrumentation key**. Then click **Save**.
   - Find the instrumentation key from the Overview page of your Application Insights resource. See [Set up Application Insights](https://learn.microsoft.com/azure/active-directory-b2c/troubleshoot-with-application-insights?pivots=b2c-custom-policy#set-up-application-insights)

3. From the menu, select **Endpoints**. Under the **Proxy endpoints** provide:
   - For OIDC: the **Configuration endpoint** (well-known openid-configuration URL)
   - For OAuth2: the **Token endpoint** and **User-info endpoint**

4. Select **Submit**. The proxy app returns a new URL (base64 encoded) that directs traffic to the proxy endpoints.

5. In your custom policy, replace the METADATA URL with the proxy URL returned in step 4:
   ```xml
   <Item Key="METADATA">https://custom-idp.azurewebsites.net/myb2c/proxy/OpenIdConfiguration/Invoke/{base64url}</Item>
   ```
   If the IDP has token/user-info endpoints, replace those too with the corresponding proxy endpoints.

6. Upload the custom policy and test it.

7. Open Application Insights → **Logs** → **customEvents** → **Run** to inspect captured requests/responses. Select a custom event and expand **customDimensions** to see full request/response content.

### Steps for User Flows (not Custom Policies)

1. Create the proxy and obtain the proxy URL (same steps 1-4 above).
2. Follow [Set up sign-in with OpenID Connect - Azure AD B2C](https://learn.microsoft.com/azure/active-directory-b2c/identity-provider-generic-openid-connect?pivots=b2c-user-flow#add-the-identity-provider).
3. When saving the metadata URL in the portal, you will receive an error `Url should end with /.well-known/openid-configuration`. Save a dummy value like `https://custom-idp.azurewebsites.net/bobenvironment/.well-known/openid-configuration`.
4. Use Graph API to update the metadataUrl to the actual proxy URL:
   1. Login to B2C tenant as Global Admin
   2. Visit https://aka.ms/ge (Graph Explorer)
   3. GET `https://graph.microsoft.com/beta/identity/identityProviders/` to find the Custom IDP's identifier
   4. PATCH the identified provider to update `metadataUrl` to the proxy URL from step 1
5. Add the updated Custom IDP to the user flow and repro the issue. Inspect Application Insights logs as above.

## Troubleshoot SAML Protocol

To debug SAML integration, use a browser extension:
- **Chrome**: [SAML DevTools extension](https://chrome.google.com/webstore/detail/saml-devtools-extension/jndllhgbinhiiddokbeoeepbppdnhhio)
- **Firefox**: [SAML-tracer](https://addons.mozilla.org/es/firefox/addon/saml-tracer/)
- **Edge/IE**: [Edge or IE Developer tools SAML guide](https://techcommunity.microsoft.com/t5/microsoft-sharepoint-blog/gathering-a-saml-token-using-edge-or-ie-developer-tools/ba-p/320957)

See also: [Troubleshoot SAML protocol - Azure AD B2C](https://learn.microsoft.com/azure/active-directory-b2c/troubleshoot?pivots=b2c-custom-policy#troubleshoot-saml-protocol)
