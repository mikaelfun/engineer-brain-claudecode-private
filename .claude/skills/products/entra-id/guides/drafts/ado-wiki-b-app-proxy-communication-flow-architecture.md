---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - App Proxy Communication Flow_Architecture"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20App%20Proxy%20Communication%20Flow_Architecture"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Communication Flow & Architecture

## Pass-Through Flow

1. User/Client browses to the external URL published in Entra App Proxy
2. Proxy Service connects to Azure Service Bus and requests a Connector (Rendezvous). Connectors maintain outbound connection to Service Bus listening for requests. Connector receives transaction ID.
3. Connector establishes direct connection to Proxy Service over port 443, requests the message using the transaction ID from step 2
4. Proxy Service replies with requested information
5. Connector requests configuration detail (External to Internal URL mapping + Authentication requirement)
6. Proxy Service replies with configuration
7. Connector forwards the request to the backend application
8. Backend application sends response
9. Connector forwards response to Proxy Service
10. Proxy Service forwards response to client

> **Key**: The client NEVER communicates directly with the connector or backend application. All communication goes through the Proxy Service. All connections are outbound from the Connector.

## Pre-Authentication Flow

Pre-Auth is handled by Entra ID, providing an additional security layer before any rendezvous with a Connector.

> Each request to the Proxy Service creates a **unique transaction ID** searchable in Kusto.

1. User browses to published External URL (first transaction, unique ID). Proxy Service checks for MEAP token / Pre-Auth cookie - none exists for new request.

2. Proxy Service redirects client to MEAP for authentication. Appends AppProxy state parameter containing:
   - Published URL (e.g., `https://contoso.com`)
   - Appended path for specific app (e.g., `/app1`)

3. MEAP responds with Access Token + redirect to Reply URL (auto-configured to Published URL). Second transaction. Proxy Service:
   - Extracts User Identity from MEAP Token
   - Sets App Proxy Access Cookie based on application ID
   - Uses App Proxy state to rebuild original request URL

4. Proxy Service redirects with cookies to External URL + app path (third transaction). Checks cookies (now present), forwards through Connector.

## Integrated Windows Authentication (KCD) Flow

1. Connector receives request from Proxy Service
2. Connector sends TGT request to DC on behalf of user
3. DC responds with TGT
4. Connector uses TGT to request Session Ticket from DC
5. DC responds with Session Ticket
6. Connector sends request + Session Ticket to Backend Application
7. Application responds, Connector forwards back through Proxy Service

For IWA, MEAP uses **Constrained Delegation** - the Connector server is delegated to make Kerberos requests on behalf of connecting users.

### References:
- KCD configuration: https://learn.microsoft.com/entra/identity/app-proxy/how-to-configure-sso-with-kcd
- How Kerberos V5 works: Microsoft documentation on Kerberos protocol
