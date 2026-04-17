---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Developer Scenarios/Force Native app to use CA policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FDeveloper%20Scenarios%2FForce%20Native%20app%20to%20use%20CA%20policies"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Workflow
- cw.comm-idsp
- cw.comm-appex
Keywords:
- conditional access policy (CAP)
---
:::template /.templates/Shared/findAuthorContributor.md
:::

:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Dev](/Tags/AAD%2DDev) [AAD-Workflow](/Tags/AAD%2DWorkflow)  

# Developer Scenario: How to force Desktop/Mobile apps to apply Conditional Access Policies

[[_TOC_]]

# Overview

Conditional access policies only get applied when accessing Web resources. Therefore, mobile and desktop apps if not requesting an access token for a Web resource protected by Conditional Access policies will not enforce any conditional access policies.

Entra ID determines whether this is a web app or a native client app based on the redirect_uri passed in the sign-in request. You register this redirect_uri via the App registrations platform reply addresses...<br>
https://learn.microsoft.com/en-us/entra/identity-platform/reply-url

> We can provide guidance only if this is a custom app where we can customize the scopes parameter the application sends to Entra ID to sign-in. Otherwise, for most first-party or third-party apps, there is no solution.

If you want mobile and desktop apps to hit any specific conditional access policies, you will need to do several things...

1. **Create a seperate app registration from the desktop/mobile client**

  1. Create a app registration. <br>
    https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app?tabs=certificate#register-an-application
     > You can call this something like '**Enforce conditional access policy app**'
  1. Expose this app registration as an API and create a scope.<br>
    https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-expose-web-apis
     > You can call this scope something like '**user_access**'

2. **Configure the Conditional access policy**

   Add this new application to your Conditional Access Policy's Target resources<br>
  https://learn.microsoft.com/en-us/entra/identity/authentication/tutorial-enable-azure-mfa?bc=%2Fazure%2Factive-directory%2Fconditional-access%2Fbreadcrumb%2Ftoc.json&toc=%2Fazure%2Factive-directory%2Fconditional-access%2Ftoc.json#configure-which-apps-require-multifactor-authentication


3. **Add this permission scope 'user_access' to the app registration of the desktop/mobile client**
https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-configure-app-access-web-apis#add-permissions-to-access-your-web-api


4. **Customize the desktop/mobile app and add 'user_access' scope to sign-in request**
  When the app sends a sign-in request, when passing scopes, pass the fully-qualified scope name. For example the fully-qualified scope name scope may look something like this: **api://c436fde0-ad01-41a7-9ef1-ed1189e2aa63/user_access**

   Example sign-in request...
   ~~~
   https://login.microsoftonline.com/common/oauth2/v2.0/authorize
   ?response_type=code
   &Client_id=2f61d463-edf1-4d22-adef-f93148483da7
   &redirect_uri=https://jwt.ms
   &scope=openid profile api://c436fde0-ad01-41a7-9ef1-ed1189e2aa63/user_access
   ~~~
