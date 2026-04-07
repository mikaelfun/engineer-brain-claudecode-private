---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Troubleshooting/SAML Request troubleshooting flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Authentication_flows%20SAML_and_OAuth/Troubleshooting/SAML%20Request%20troubleshooting%20flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SAML Request Validation Guide

Use this guide to validate a SAML authentication request (AuthnRequest) when troubleshooting SP-initiated SAML sign-in issues.

## Step 1: Capture the SAML Request

Two options:

**Option A — From browser URL (live remote session):**
1. Open a **private/InPrivate** browser session
2. Start sign-in to the application; when prompted for username, copy the full URL from the address bar
3. The URL looks like:
   ```
   https://login.microsoftonline.com/<tenantId>/saml2?SAMLRequest=jZHdasJAEEZfJey9...
   ```
4. Extract the value after `SAMLRequest=` (everything before any `&` separator)

**Option B — From Fiddler/HAR trace (offline):**
1. Collect Fiddler trace or HAR file ([guide](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/293681/Azure-AD-Application-Proxy-Action-Plan-Templates-for-Data-Collection?anchor=**fiddler**))
2. In the trace, look for host `login.microsoftonline.com` and URL path `/<TenantId>/SAML2`
3. In the Fiddler **WebForms** tab, get the `SAMLRequest` value

## Step 2: Decode the SAML Request

**If you have a Fiddler trace:**
1. Right-click the `SAMLRequest` value → **Send to TextWizard**
2. In TextWizard: use the middle drop-down → **Transform From DeflatedSaml**

**Key encoding rules:**
- **Redirect Binding** → Deflate encoding (per SAML-Bindings-2.0 spec section 3.4.4)
- **POST Binding** → BASE64 encoding (per spec section 3.5.4)

Reference: [SAML-Bindings-2.0 specification](http://docs.oasis-open.org/security/saml/v2.0/saml-bindings-2.0-os.pdf)

## Step 3: Validate IssueInstant Date Format

The `IssueInstant` attribute in the decoded SAML request must be in ISO 8601 UTC format:

```
yyyy-MM-ddTHH:MM:ss.fffZ
```

Example: `2024-03-15T08:30:00.000Z`

A malformed IssueInstant can cause authentication failures.

## Step 4: Validate SAML Request Attributes

Required attributes for a valid SAML AuthnRequest:

Refer to [Azure AD SAML Protocol documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/single-sign-on-saml-protocol) for the full list of required and optional attributes.

Key attributes to check:
- `ID` — unique identifier for the request
- `IssueInstant` — timestamp in correct format (see Step 3)
- `Issuer` — must match the Entity ID / Identifier configured in the app registration
- `AssertionConsumerServiceURL` — must match a configured Reply URL in the app registration
- `NameIDPolicy` — if specified, value must be one Entra ID supports
- `RequestedAuthnContext` — if specified, Entra ID only supports `urn:oasis:names:tc:SAML:2.0:ac:classes:Password`
