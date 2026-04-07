---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Service Principal Name_SPN and Azure App Proxy_KCD"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Service%20Principal%20Name_SPN%20and%20Azure%20App%20Proxy_KCD"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## What is an SPN?

When configuring Windows Integrated Authentication SSO for an application published through MEAP, you must specify the Service Principal Name used by the Application. The SPN is an Active Directory attribute set on an account object in AD. The account is used as the Service Account for an Application.

In Active Directory Users and Computers (ADUC), you can see the SPN set on an account by looking at the Attribute Editor tab of the properties of the account object.

> **Note:** To see the Attribute Editor Tab on the properties of the AD object, you must click on View in ADUC and select Advanced Features.

You can also check it using the setspn command line utility from an Admin command prompt:

```cmd
setspn -l domain\accountname
```

Example:
```cmd
setspn -l boat\sqlsvcacct
```

The command returns the SPN that is set on the account. There can be multiple SPNs on a given account.

You can also use SPN to query for the Service Account name on which an SPN is configured:

```cmd
setspn -q <SPN>
```

> **Note:** The SPN starts with an identifier. In the example above it is `http`, and while there are other identifiers such as `host`, `http` is the type used for applications published through Microsoft Entra Application Proxy.

## How is the SPN used?

When a client tries to connect to a service using Kerberos authentication, it sends the request that includes the SPN to a Domain Controller. The DC can query AD for the SPN to find the associated Service Account. A Service Ticket is then returned to the client. This service ticket is then forwarded to the Application server for authorization. In MEAP SSO, the client that does the Kerberos Authentication is the Connector Server that handles the request.

**Flow:**
1. Client sends Kerberos request with SPN to Domain Controller
2. DC queries AD for SPN → finds associated Service Account
3. Service Ticket returned to client
4. Client forwards Service Ticket to Application server for authorization

## How does the client know what SPN to use?

One way is for the client to use Windows SPN APIs to craft the expected SPN based on the URL of the application. Another way is for the client to be provided the SPN to use. This is what happens for apps published through MEAP. We configure the SPN in the Entra Portal under the SSO settings for the app.

## Diagnosing SPN issues via Network Trace

We can see what SPN is sent in the Kerberos request by capturing a network trace on the Connector server:

```cmd
netsh trace start capture=yes tracefile=C:\Temp\NetTrace.etl
netsh trace stop
```

Load the trace in Netmon and filter on: `Kerberosv5`

In the TGS Request frame, the `Sname` field shows the SPN being used. For example:
```
KerberosV5:TGS Request Realm: BOAT.COM Sname: http/sharepoint.boat.com
```

**Best Practice:** Set the SPN in MEAP SSO settings to match what is used internally. If the customer is unsure what SPN is being used internally, collect a network trace on the Connector server and filter for the Kerberos SPN.
