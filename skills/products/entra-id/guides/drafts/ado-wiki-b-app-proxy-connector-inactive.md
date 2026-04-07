---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy Connector appears as inactive on the portal"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20Connector%20appears%20as%20inactive%20on%20the%20portal"
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


This article describes, how to troubleshoot the problem, when a Microsoft Entra private network connector  appears as inactive on the portal. In this article, we focus on mainly, why the connector appears as inactive. 

![image.png](/.attachments/image-57ce3a83-81d7-404b-91e7-8feefffd1b89.png)

#Background:

The Microsoft Entra private network connector service contacts the bootstrap endpoint at 10 minutes intervals. The connector sends a request with some information (agent version, connector id, tenant id etc.) and receives a response with configuration parameters (timeout values, endpoints etc.), which are necessary for the connector to be able to work. The status of the connector will be determined based on this communication. The first successful bootstrap communication is called initial bootstrap.

The bootstrap endpoint is _TENANTID_.bootstrap.msappproxy.net.

Connectors always bootstrap first to the bootstrap endpoint located in the geo location of the Default group. In the bootstrap response (BootstrapEndpointOverride) they will be redirected to the bootstrap endpoint in the geo location of their own connector group, if it's needed. 

If the bootstrap fails, the connector will use the PeriodicBootstrapRetryStrategy 'Periodic(00:10:00, 1) then Randomized(ExponentialBackoff(00:00:03, 01:00:00, 5 attempts, 5.886) then Periodic(01:00:00), ±20%)' for subsequent retries.


**Important:** the connector caches the configuration from bootstrap in the memory. The connector starts with no configuration and if the bootstrap fails, it won't be able to work. However, if the connector had already at least one successful bootstrap (it has got the configuration) and subsequent bootstraps fail, the connector is shown as inactive on the portal, but it will be able to handle client requests, as long as the disturbance only affects the bootstrap communication. 

The bootstrap activity is recorded in the BootstrapRootOperationEvent table. It can be queried in Kusto Web UX in ASC. 

The connector is showed as "inactive" after 60 mins of inactivity on the portal. This change was introduced to avoid "inactive" status caused by not reliable network connections. Stopping the connector service won't show the connector as "inactive" right away, just after 60 mins. An "active" connector means: the connector was in a state to be able to handle requests in the last 60 mins.

The result of the sample query shows the bootstrap operations in the last hour for the specified tenant.


```
BootstrapRootOperationEvent
| where env_time > ago(1h) and subscriptionId  == "REPLACE_WITH_TENANT_ID"
```
Sample Bootstrap traffic: [Bootstrap.zip](/.attachments/Bootstrap-d4b0fd26-2dc9-4b94-b7a7-06024d685715.zip) 

Detailed information about the Connector Groups and Connectors can be found in [ASC](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/184068/Azure-AD-App-Proxy-Using-Azure-Support-Center-(ASC)-to-get-Published-App-and-Connector-configuration).

### Possible error events in the [Admin log](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/343223/Azure-AD-Application-Proxy-Connector-Event-logs)

12015 - The Connector failed to establish connection with the service.

12019 - The Connector stopped working because the client certificate is not valid. Uninstall the Connector and install it again.

12020 - The Connector was unable to connect to the service due to networking issues. The Connector tried to access the following URL:

### Possible root causes for the 'inactive' status

+ Network communication issue
+ The SSL client certificate expired (could not be renewed)
+ Instability of the service
+ The Microsoft Entra private network connector service is stopped (someone stopped it / the service crashed)
+ Entra Portal issue (rare)

#Troubleshooting steps:

1) ### If this is not a new installation and it was running... (skip this, if it's not apply)

Using the articles verify the validity of the SSL client certificate:

a) [Connector authentication](https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-connectors#connector-authentication)

b) Check if the SSL Client Certificate exists & if it's valid. Follow the article: [Verify Machine and backend components support for Application Proxy trust certificate](https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-connector-installation-problem#verify-machine-and-backend-components-support-for-application-proxy-trust-certificate)

Bronwbag session: [click here](https://microsofteur.sharepoint.com/:f:/t/Community-HybridAuthExperiences/EqyVw0lCLQJEvppIlUJivtoBh739pKNjoyXaD85nLQ4T1Q?e=KjaFe8)

If this did not help please go through the next steps.

2) ###Supported Operating System versions for connector installation

Supported operating system versions: Windows Server 2016, Windows Server 2019

3) ###Connector version

Please follow the article [Entra ID Application Proxy How to get the version of the private network connector](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/436400/Azure-AD-Application-Proxy-How-to-get-the-version-of-the-connector)

Ensure that the latest version of the connector is installed. [Link](https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-release-version-history) to version history and download.

4) ###Possible Entra Portal issue

The connector(s) does the bootstrap periodically; However, the connector(s) is displayed occasionally as inactive on the portal.

a) Use Kusto to check if the affected connector's bootstrap happened continuously in 10-11 mins interval in the reported time period.


```
let transdateStart = datetime("yyyy-mm-ddThh:mm:ss");
let transdateStop = datetime("yyyy-mm-ddThh:mm:ss");
BootstrapRootOperationEvent
| where env_time > transdateStart and env_time < transdateStop and subscriptionId == "REPLACE_WITH_TENANT_ID" and connectorId == "REPLACE_WITH_CONNECTOR_ID"
| project env_time, connectorId, connectorVersion, requestString, responseString
```

b) If there was no outage based on the Kusto results, ask the customer to collect a Fiddler trace or equivalent while the customer checks the connector status on the portal and the portal shows it as inactive.

Locate the GET request to
```
https://main.iam.ad.ext.azure.com/api/ApplicationProxy/ConnectorGroups 
```
in the trace.

In the response of the request, you'll see a similar output:


```
...

{}

  applications=(null)

  connectorGroupType=applicationProxy

  id=CONNECTOR_GROUP_ID

  isDefault=True

  members

  {}

    connectorGroupId=CONNECTOR_GROUP_ID

    externalIp=IP_ADDRESS

    id=CONNECTOR_ID

    machineName=NAME_OF_THE_CONNECTOR_SERVER

    status=inactive

  name=Default

  region=eur

...
```

c) Based on the Fiddler run a new Kusto query and confirm that there was no bootstrap outage. If it's confirmed raise an AVA request.


5) ###Verifying the SSL settings

Double check the SSL settings based on the [TLS requirements section](https://docs.microsoft.com/azure/active-directory/app-proxy/application-proxy-add-on-premises-application#tls-requirements).

6) ###Confirmation of the network requirements

** We don't have any troubleshooter tool for testing the connectivity to the required endpoints. The old tool is deprecated, and it should not be used. There is no ETA for the new tool. **

Please confirm the network configuration with the customer. 

+ Does the connector access the Internet over a (forward - outbound) proxy server? YES/NO
+ If the connector has a direct access to the Internet, are the ports TCP 80 / TCP 443 open for the outbound communication at least towards Entra endpoints? if no, the ports must be opened.
+ Is SSL inspection used for the outbound traffic generated by the connector? If yes, this must be disabled.
+ Can the connector access the URLs documented in the [article](https://learn.microsoft.com/entra/global-secure-access/how-to-configure-connectors#allow-access-to-urls)? If no, please allow the access to the documented URLs.

7) ### Connector access the Internet directly (skip this, if it's not apply)

+ In the file "MicrosoftEntraPrivateNetworkConnectorService.exe.config" (X:\Program Files\Microsoft Entra private network connector\) you should verify, if the proxy configuration is set. If it's configured, you'll see a similar output like this:

`<?xml version="1.0" encoding="utf-8" ?>`

`<configuration>`

`  <system.net>  `

`    <defaultProxy>   `

`      <proxy proxyaddress="http://proxyserver:8080" bypassonlocal="True" usesystemdefault="True"/>`   

`    </defaultProxy>  `

`  </system.net>`

`  <runtime>`

`    <gcServer enabled="true"/>`

`  </runtime>`

`  <appSettings>`

`    <add key="TraceFilename" value="MicrosoftEntraPrivateNetworkConnector.log" />`

`  </appSettings>`

`</configuration>`

You can find the proxy configuration after the **<proxy** tag. Since this scenario does not require the proxy configuration part, open the configuration in Notepad as administrator and delete these lines:

`  <system.net>  `

`    <defaultProxy>   `

`      <proxy proxyaddress="http://proxyserver:8080" bypassonlocal="True" usesystemdefault="True"/>`   

`    </defaultProxy>  `

`  </system.net>`

Save that and restart the Microsoft Entra private network connector service.

+ This is an example that shows the default config file without any proxy setting.

`<?xml version="1.0" encoding="utf-8" ?>`

`<configuration>`

`  <runtime>`

`    <gcServer enabled="true"/>`

`  </runtime>`

`  <appSettings>`

`    <add key="TraceFilename" value="MicrosoftEntraPrivateNetworkConnector.log" />`

`  </appSettings>`

`</configuration>`

+ Some system-wide proxy settings might force the connector to use an outbound proxy, however this is not configured explicitly in the config file.

Some examples:

a) WinHttp proxy is configured (check it by `netsh winhttp show proxy`)

b) The registry key `UseDefaultProxyForBackendRequests = 1` located under `HKEY_LOCAL_MACHINE\Software\Microsoft\Microsoft Entra private network connector` is used.

c) The outbound proxy is configured in the file `machine.config` file under `c:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\`. (Check it by searching for "proxy")

d) Proxy setting in Internet Explorer in the context of the Network Service 

In this case you must force the connector to not use any outbound proxy. You must add these lines to the config file (please see the filename and location above):

`<system.net>`

`<defaultProxy enabled="false"></defaultProxy>`

`</system.net>`

After you did the change the configuration file will look like this:

`<?xml version="1.0" encoding="utf-8" ?>`

`<configuration>`

`<system.net>`

`<defaultProxy enabled="false"></defaultProxy>`

`</system.net>`

`<runtime>`

`<gcServer enabled="true"/>`

`</runtime>`

`<appSettings>`

`<add key="TraceFilename" value="MicrosoftEntraPrivateNetworkConnector.log" />`

`</appSettings>`

`</configuration>`

The service must be restarted to apply the change.

+ To verify the DNS name resolution issue a `ping _TENANTID_.bootstrap.msappproxy.net` (replace the `_TENANTID_` with the valid tenant id!) on the connector server.

Outputs:

![image.png](/.attachments/image-53fbc5fa-31d6-4a89-b348-ca718d086968.png)

This error indicates a name resolution problem that must be fixed by the customer (if he cannot do that engage the Networking Support). This result is expected, if the connector server uses an outbound proxy for accessing the Internet!

![image.png](/.attachments/image-cb366881-3909-4c72-800f-432cd11f765f.png)

You should get a similar result. Take a screenshot for later use.

Reference and additional information: [Bypass outbound proxies](https://learn.microsoft.com/entra/identity/app-proxy/application-proxy-configure-connectors-with-proxy-servers#bypass-outbound-proxies)

8) ### Connector access the Internet over outbound proxy (skip this, if it's not apply)

+ In the file "MicrosoftEntraPrivateNetworkConnectorService.exe.config" (X:\Program Files\Microsoft Entra private network connector\) you should verify, if there is proxy configuration. If it's configured, you'll see a similar output like this:

`<?xml version="1.0" encoding="utf-8" ?>`

`<configuration>`

`  <system.net>  `

`    <defaultProxy>   `

`      <proxy proxyaddress="http://proxyserver:8080" bypassonlocal="True" usesystemdefault="True"/>`   

`    </defaultProxy>  `

`  </system.net>`

`  <runtime>`

`    <gcServer enabled="true"/>`

`  </runtime>`

`  <appSettings>`

`    <add key="TraceFilename" value="MicrosoftEntraPrivateNetworkConnector.log" />`

`  </appSettings>`

`</configuration>`

You can find the proxy configuration after the **<proxy** tag. Verify it, if the syntax (see it later) and configuration are correct. If the proxy setting is not configured / incorrect, you can edit the file and add / modify it (not recommended), or use the the **ConfigureOutBoundProxy.ps1** script.

`.\ConfigureOutBoundProxy.ps1 -ProxyAddress protocol://proxy:port`

Further possible parameters:

`-BypassOnLocal`

`-UseSystemDefault`

See more information in the article [ProxyElement Class](https://docs.microsoft.com/dotnet/api/system.net.configuration.proxyelement?view=netframework-4.8).

It's important that the correct syntax must be used for the proxy address:

The format of the proxy URL: **protocol://proxy:port**

protocol - http or https (required!)
proxy - hostname (FQDN or flat), IP address (required!)
port - port number (optional)

_Examples:_

This is correct:   http://proxy.domain.com:8080 https://test, http://1.1.1.1. http://1.1.1.1:8081 etc.

This is incorrect: proxy.domain.com; test:8080, 1.1.1.1. 1.1.1.1:8080 etc.

The **ConfigureOutBoundProxy.ps1** script sets the proxy for the Microsoft Entra Private Network Connector and the Microsoft Entra Private Network Connector Updater services and restarts them. If you edit the configuration file manually, you must restart the service.

Reference and additional information: [Use the outbound proxy server](https://learn.microsoft.com/entra/identity/app-proxy/application-proxy-configure-connectors-with-proxy-servers#use-the-outbound-proxy-server)

#Data collection

If the connector's status is still inactive, we must collect logs to check the connector and the network connectivity.

1. Use the [Data Collector](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/293681/Azure-AD-Application-Proxy-Action-Plan-Templates-for-Data-Collection?anchor=**azure-ad-application-proxy-connector-data-collector-script**) script for data collection on the connector (!!! **Use the -ServiceTraceOn switch**).
2. Wait for 60 sec and then Stop the data collection

In case an outbound proxy is used for the Internet access, we need it's IP address and the port number.

If you have any feedback on this article or you need assistance, please contact us over [Microsoft Entra application proxy
Teams channel](https://teams.microsoft.com/l/channel/19%3aa87266c50f2743b4ae358327faec82f7%40thread.skype/Azure%2520AD%2520Application%2520Proxy?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47) or send  a [request / feedback](https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR36COL1ZDnJAnLWpaiURTuNUOFBNNFcwNUJDU1hQNkVDQzNON0VSMzY1Ti4u) to the Hybrid Authentication Experiences Community.
