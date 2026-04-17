---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Troubleshooting/SAML Request troubleshooting flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FAuthentication_flows%20SAML_and_OAuth%2FTroubleshooting%2FSAML%20Request%20troubleshooting%20flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to validate a SAML request

## Capture the flow

To be able to troubleshoot the SAML request you can do it in two different ways.
- Either traces have to be collected to analyze the flow;

or if you can have a remote session with Customer:

- you can take it directly from the URL (address bar from the browser) when logging in to the application and being prompt for username - please always reproduce it in a inPrivate session of the browser.

If you prefer to collect the trace and analyze it offline, Fiddler is the tool we usually use for captures, but some customers have security restrictions and are not allowed to install Fiddler.

You can refer to browser traces capture options for alternatives.

The URL (address bar from the browser) needs to be collected when the user is prompted for the username during sign in flow.
The URL should looks something like this:
```
https://login.microsoftonline.com/aa805767-661f-4890-9e64-ababb4cb1dd4/saml2?
SAMLRequest=jZHdasJAEEZfJey9yeYP0yEJRKMgWChqS%2Bn(...)ZdRr%2F%2FVH8B
```

**Note:** In case you got the AuthnRequest/SAML Request from the URL while having remote session with Customer or in any other way besides checking the Fiddler trace/HAR file please go directly to point number 3 in the explanation below.

## Validate the SAML request

Once you have the traces or the URL, you can then check if the SAML request is correctly encoded. If you have the URL captured in the remote sessions with Customer you need to gather the string after 'SAMLRequest=' and pass directly to step number 4 in this page. Please make sure you are not taking any other parameter that might be also part of the URL. If you have the Fiddler trace please follow all steps referred below.

Follow the steps below:
1. In the trace, look for host as `login.microsoftonline.com` and URL as `/TenantId/SAML2`.
2. Once you identified the correct frame, get the "SAMLRequest" value from webforms tab.
3. Use the built in the Fiddler TextWizard to decode the request. Right-click the SAML Request value and select "Send to TextWizard".
4. In the TextWizard use the middle drop down list to **Transform From DeflatedSaml**.

**Note:** The document SAML-Bindings-2.0 describes the encoding to be used for a specific binding in SAML2 requests.

Deflate encoding is supposed to work for the REDIRECT Binding (not post). Check the section 3.4.4 in the SAML Protocol specification for more information.

For POST Binding, the supported encoding in SAML is BASE64. Check section 3.5.4 in the SAML Protocol specification for more information.

## Validate Issue instant date format

If the request is properly decoded, then check the issue instant date format. The format should be `yyyy-MM-ddTHH:MM:ss.fffZ`.

## Validate SAML request attributes

Please refer to the [public document](https://docs.microsoft.com/en-us/azure/active-directory/develop/single-sign-on-saml-protocol) for all the required attributes for a valid SAML Request.
