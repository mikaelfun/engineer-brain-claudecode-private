---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/Single Logout Scenario (OIDC)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2C/Azure%20AD%20B2C%20Troubleshooting/Single%20Logout%20Scenario%20%28OIDC%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## How it works

1. **Logout Request**: When a user initiates a logout from one application (the Relying Party or RP), the RP sends a logout request to the OpenID Provider (OP).
2. **Front-Channel Logout**: The OP then uses an HTML iframe to send logout requests to all other RPs where the user has active sessions. This is done by embedding iframes in the logout response page, each pointing to the logout endpoint of the other RPs.
3. **Session Termination**: Each RP receives the logout request via the iframe and terminates the user's session. The iframe ensures that the logout requests are sent in the user's browser context, allowing the RPs to clear any session cookies or other session-related data.
4. **Logout Confirmation**: Once all RPs have processed the logout requests, the OP can optionally send a logout confirmation to the initiating RP, indicating that the user has been logged out from all applications.

## Working Scenario

While checking a logout request in a Network tab of Edge Dev Tools, you will see individual requests to each application's logout endpoint, rather than a single request containing all endpoints. Each iframe request will target a specific RP's logout endpoint, ensuring that the user is logged out from all applications seamlessly.

**GET request under Response Tab** contains the logout sent to each application — expect to see multiple iframe requests to individual RP logout endpoints.

## Non-Working Scenario

In a non-working scenario, the logout response will be empty — no iframe requests are dispatched to RP logout endpoints.

## How to Check Using a Network Trace

1. **Open Edge Dev Tools**: Launch Microsoft Edge and press `F12` or right-click on the page and select "Inspect" to open the Dev Tools and upload a network trace.
2. **Navigate to the Network Tab**: Click on the "Network" tab to monitor network requests.
3. **Filter Requests**: In the Network tab, use the filter box to search for requests related to the logout process. You can filter by keywords like "logout" or "end_session".
4. **Inspect Requests**: Look for the iframe requests that are sent to the logout endpoints of the Relying Parties (RPs). Click on these requests to inspect their details, including headers, payload, and response.
   - **Working**: Multiple iframe requests visible, each targeting a different RP logout endpoint.
   - **Non-Working**: Logout response body is empty; no iframe requests to RP endpoints.
