---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID Troubleshooting/How to Fix \"invalid_request\" Error When Using login_hint With Email Providers in Entra External ID (CIAM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FEntra%20External%20ID%20Troubleshooting%2FHow%20to%20Fix%20%22invalid_request%22%20Error%20When%20Using%20login_hint%20With%20Email%20Providers%20in%20Entra%20External%20ID%20(CIAM)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Issue description

Users may encounter an issue when using the `login_hint` parameter in the request URL with email addresses that include an email provider's name in their domain suffix (e.g., `hotmail.com`, `outlook.com`, `gmail.com`, or `yahoo.com`). Upon making the request, users experience the following error:

**"invalid_request: The provided value for the input parameter 'redirect_uri' is not valid. The expected value is a URI which matches a redirect URI registered for this client application."**

Following this error, users are redirected to `login.live.com`.

## Resolution

To resolve this issue, users need to include the `domain_hint` parameter in their request URL alongside the `login_hint` parameter. The `domain_hint` parameter specifies the domain associated with the email provider for the login request.

### Example solution

If the email address used in the `login_hint` parameter is associated with Google (e.g., `user@gmail.com`), add the `domain_hint` parameter to the request URL as follows:

`&domain_hint=google.com`

### Updated request URL format

Include both the `login_hint` and `domain_hint` parameters in the request URL to avoid the error and ensure successful redirection:

`https://contoso.com/oauth2/v2.0/authorize?client_id=<client_id>&response_type=code&redirect_uri=<redirect_uri>&login_hint=<email_address>&domain_hint=<domain_provider>`

Replace `<client_id>`, `<redirect_uri>`, `<email_address>`, and `<domain_provider>` with the appropriate values for your application and user login scenario.

### Example

For a user attempting to log in with a Gmail address (`user@gmail.com`), the request URL should look like this:

`https://contoso.com/oauth2/v2.0/authorize?client_id=12345&response_type=code&redirect_uri=https://example.com/callback&login_hint=user@gmail.com&domain_hint=google.com`

## Notes

- Ensure that the `redirect_uri` matches the URI registered for your client application to prevent additional errors.
- The `domain_hint` parameter is essential for cases where the email domain is associated with a specific provider (e.g., `google.com` for Gmail addresses).
